// Proctored Exam Engine (Dual-Round Architecture)
let currentSessionId = null;
let studentName = null;
let currentRound = 1; // 1 = Aptitude, 2 = Technical Multi-Select
let questions = [];
let currentIndex = 0; // 0-based
let durationMinutes = 25;
let timeRemainingSeconds = 25 * 60;
let timerInterval = null;

// State management
let studentAnswers = {}; // { [qId]: selectedOptionIndex }
let questionStatuses = {}; // { [index]: 'not-visited' | 'answered' | 'unanswered' | 'review' | 'review-answered' }
let strikes = 0;
const MAX_STRIKES = 3;
let violationCountdown = null;
let autoSubmittedResultId = null;
let isSubmitting = false;

// Audio warning on violation
function playWarningBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  currentSessionId = sessionStorage.getItem('currentSessionId');
  studentName = sessionStorage.getItem('studentName');
  currentRound = parseInt(sessionStorage.getItem('currentRound') || '1');
  durationMinutes = parseInt(sessionStorage.getItem('durationMinutes') || (currentRound === 1 ? "25" : "35"));
  const rawQ = sessionStorage.getItem('examQuestions');

  if (!currentSessionId || !rawQ) {
    alert("No active exam session found. Redirecting to Candidate Registration.");
    window.location.href = 'index.html';
    return;
  }

  questions = JSON.parse(rawQ);
  timeRemainingSeconds = durationMinutes * 60;

  // Restore any previous in-progress answers if page was refreshed
  const savedAnswers = sessionStorage.getItem(`answers_${currentSessionId}_r${currentRound}`) || localStorage.getItem(`answers_${currentSessionId}_r${currentRound}`);
  if (savedAnswers) {
    try {
      studentAnswers = JSON.parse(savedAnswers);
    } catch(e) {}
  }

  // Prevent accidental page close or refresh during exam
  window.addEventListener('beforeunload', (e) => {
    if (!isSubmitting) {
      e.preventDefault();
      e.returnValue = 'Exam is in progress. Leaving or refreshing may trigger a proctoring violation strike.';
      return e.returnValue;
    }
  });

  // Initialize statuses
  resetQuestionStatuses();

  // Re-sync answered statuses from restored answers
  if (Object.keys(studentAnswers).length > 0) {
    questions.forEach((q, idx) => {
      if (studentAnswers[q.id] !== undefined) {
        questionStatuses[idx] = 'answered';
      }
    });
  }

  // Set UI Headers
  updateRoundHeaderUI();

  // Build Question Palette
  buildPalette();

  // Render first question
  loadQuestion(0);

  // Start Timer
  startTimer();

  // Arm Anti-Cheating & Proctoring
  initProctoring();

  // Set takeover modal info
  const nameElem = document.getElementById('takeoverCandidateName');
  if (nameElem) nameElem.innerText = studentName || "Candidate";
  const modElem = document.getElementById('takeoverModuleName');
  if (modElem) modElem.innerText = currentRound === 1 ? "Round 1: MNC Aptitude" : "Round 2: Technical Electives";

  // Check full-screen state
  checkFullscreenTakeover();

  if (window.lucide) window.lucide.createIcons();
});

// Prevent accidental tab close or page reload during exam
window.addEventListener('beforeunload', (e) => {
  if (!isSubmitting) {
    e.preventDefault();
    e.returnValue = 'Your exam is currently in progress. Are you sure you want to leave?';
    return e.returnValue;
  }
});

function resetQuestionStatuses() {
  questionStatuses = {};
  questions.forEach((_, idx) => {
    questionStatuses[idx] = 'not-visited';
  });
}

function updateRoundHeaderUI() {
  const candidateSpan = document.getElementById('candidateNameSpan');
  if (candidateSpan) candidateSpan.innerText = studentName || "Candidate";

  const topTitle = document.getElementById('topTestTitle');
  const roundPill = document.getElementById('roundPill');
  const paletteRound = document.getElementById('paletteRoundText');
  const topSubmitText = document.getElementById('topSubmitBtnText');
  const sideSubmitText = document.getElementById('sideSubmitBtnText');

  if (currentRound === 1) {
    if (topTitle) topTitle.innerText = "Round 1 of 2: MNC Aptitude Assessment";
    if (roundPill) {
      roundPill.innerText = "ROUND 1 - COMPULSORY";
      roundPill.className = "text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white";
    }
    if (paletteRound) paletteRound.innerText = "Round 1 (20 Qs)";
    if (topSubmitText) topSubmitText.innerText = "Submit Round 1 & Select Topics";
    if (sideSubmitText) sideSubmitText.innerText = "Submit Round 1 & Select Topics";
  } else {
    if (topTitle) topTitle.innerText = "Round 2 of 2: Technical Electives Assessment";
    if (roundPill) {
      roundPill.innerText = "ROUND 2 - TECHNICAL";
      roundPill.className = "text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white";
    }
    if (paletteRound) paletteRound.innerText = "Round 2 (30 Qs)";
    if (topSubmitText) topSubmitText.innerText = "Final Submit Assessment";
    if (sideSubmitText) sideSubmitText.innerText = "Final Submit Assessment";
  }
}

// -------------------------------------------------------------
// QUESTION DISPLAY & NAVIGATION
// -------------------------------------------------------------

function loadQuestion(index) {
  if (index < 0 || index >= questions.length) return;
  currentIndex = index;

  const q = questions[index];

  // Update current status if not visited
  if (questionStatuses[index] === 'not-visited') {
    questionStatuses[index] = 'unanswered';
  }

  // Update badges
  document.getElementById('questionNumberBadge').innerText = `Question ${index + 1} of ${questions.length}`;
  document.getElementById('questionCategoryBadge').innerText = q.category || q.topic || "General";
  
  const diffBadge = document.getElementById('questionDifficultyBadge');
  diffBadge.innerText = q.difficulty || "Basic";
  if ((q.difficulty || '').toLowerCase() === 'basic') {
    diffBadge.className = "px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold";
  } else {
    diffBadge.className = "px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-semibold";
  }

  // Split question text from code if formatted with newlines
  const qTextElem = document.getElementById('questionText');
  const codeWrapper = document.getElementById('codeSnippetWrapper');
  const codeElem = document.getElementById('codeSnippet');

  if (q.question.includes('\n\n') && (q.question.includes(' = ') || q.question.includes('<') || q.question.includes('{'))) {
    const parts = q.question.split('\n\n');
    qTextElem.innerText = parts[0];
    codeElem.innerText = parts.slice(1).join('\n\n');
    codeWrapper.classList.remove('hidden');
  } else {
    qTextElem.innerText = q.question;
    codeWrapper.classList.add('hidden');
  }

  // Render 4 Options
  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';
  const optionLabels = ['A', 'B', 'C', 'D'];

  const selectedOpt = studentAnswers[q.id];

  q.options.forEach((optText, optIdx) => {
    const isSelected = selectedOpt !== undefined && selectedOpt === optIdx;
    const card = document.createElement('div');
    card.className = `option-card p-4 rounded-xl border-2 cursor-pointer flex items-start space-x-3 transition-all ${
      isSelected 
        ? 'selected border-blue-600 bg-blue-50/60 shadow-sm' 
        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
    }`;
    card.onclick = () => selectOption(optIdx);

    card.innerHTML = `
      <div class="w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 transition-colors ${
        isSelected ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
      }">
        ${optionLabels[optIdx]}
      </div>
      <div class="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed flex-1 select-text">
        ${escapeHtml(optText)}
      </div>
      <div class="w-4 h-4 rounded-full border-2 ${
        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
      } flex items-center justify-center mt-0.5 flex-shrink-0">
        ${isSelected ? '<div class="w-1.5 h-1.5 rounded-full bg-white"></div>' : ''}
      </div>
    `;

    container.appendChild(card);
  });

  // Update Review Button Text
  const isReviewed = questionStatuses[index] === 'review' || questionStatuses[index] === 'review-answered';
  document.getElementById('markReviewText').innerText = isReviewed ? 'Unmark Review' : 'Mark for Review & Next';

  // Navigation button states
  document.getElementById('prevBtn').disabled = currentIndex === 0;
  const nextBtn = document.getElementById('nextBtn');
  if (currentIndex === questions.length - 1) {
    nextBtn.innerHTML = `<span>Save & Finish Round</span><i data-lucide="check" class="w-4 h-4 ml-1"></i>`;
  } else {
    nextBtn.innerHTML = `<span>Save & Next</span><i data-lucide="chevron-right" class="w-4 h-4 ml-1"></i>`;
  }

  updatePaletteHighlight();
  updatePaletteCounts();
  if (window.lucide) window.lucide.createIcons();
}

function selectOption(optionIndex) {
  const q = questions[currentIndex];
  studentAnswers[q.id] = optionIndex;
  try {
    sessionStorage.setItem(`answers_${currentSessionId}_r${currentRound}`, JSON.stringify(studentAnswers));
    localStorage.setItem(`answers_${currentSessionId}_r${currentRound}`, JSON.stringify(studentAnswers));
  } catch(e) {}

  if (questionStatuses[currentIndex] === 'review' || questionStatuses[currentIndex] === 'review-answered') {
    questionStatuses[currentIndex] = 'review-answered';
  } else {
    questionStatuses[currentIndex] = 'answered';
  }

  loadQuestion(currentIndex);
}

function clearCurrentSelection() {
  const q = questions[currentIndex];
  delete studentAnswers[q.id];
  try {
    sessionStorage.setItem(`answers_${currentSessionId}_r${currentRound}`, JSON.stringify(studentAnswers));
    localStorage.setItem(`answers_${currentSessionId}_r${currentRound}`, JSON.stringify(studentAnswers));
  } catch(e) {}

  if (questionStatuses[currentIndex] === 'review-answered') {
    questionStatuses[currentIndex] = 'review';
  } else {
    questionStatuses[currentIndex] = 'unanswered';
  }

  loadQuestion(currentIndex);
}

function toggleMarkForReview() {
  const current = questionStatuses[currentIndex];
  const hasAnswer = studentAnswers[questions[currentIndex].id] !== undefined;

  if (current === 'review' || current === 'review-answered') {
    questionStatuses[currentIndex] = hasAnswer ? 'answered' : 'unanswered';
  } else {
    questionStatuses[currentIndex] = hasAnswer ? 'review-answered' : 'review';
  }

  if (currentIndex < questions.length - 1) {
    loadQuestion(currentIndex + 1);
  } else {
    loadQuestion(currentIndex);
  }
}

function saveAndNextQuestion() {
  if (currentIndex < questions.length - 1) {
    loadQuestion(currentIndex + 1);
  } else {
    confirmExamSubmission();
  }
}

function navigateQuestion(delta) {
  const target = currentIndex + delta;
  if (target >= 0 && target < questions.length) {
    loadQuestion(target);
  }
}

// -------------------------------------------------------------
// QUESTION PALETTE
// -------------------------------------------------------------

function buildPalette() {
  const grid = document.getElementById('paletteGrid');
  grid.innerHTML = '';

  questions.forEach((_, idx) => {
    const btn = document.createElement('button');
    btn.id = `palette-btn-${idx}`;
    btn.className = "palette-btn w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer";
    btn.innerText = idx + 1;
    btn.onclick = () => loadQuestion(idx);
    grid.appendChild(btn);
  });

  updatePaletteHighlight();
  updatePaletteCounts();
}

function updatePaletteHighlight() {
  questions.forEach((_, idx) => {
    const btn = document.getElementById(`palette-btn-${idx}`);
    if (!btn) return;

    const status = questionStatuses[idx] || 'not-visited';
    let baseClass = "palette-btn w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center transition border cursor-pointer ";

    if (idx === currentIndex) {
      baseClass += "ring-2 ring-blue-600 ring-offset-2 ";
    }

    if (status === 'answered') {
      btn.className = baseClass + "bg-emerald-500 text-white border-emerald-600 shadow-xs";
    } else if (status === 'unanswered') {
      btn.className = baseClass + "bg-orange-500 text-white border-orange-600 shadow-xs";
    } else if (status === 'review' || status === 'review-answered') {
      btn.className = baseClass + "bg-purple-600 text-white border-purple-700 shadow-xs";
    } else {
      btn.className = baseClass + "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
    }
  });
}

function updatePaletteCounts() {
  let answered = 0;
  let unanswered = 0;
  let review = 0;
  let notVisited = 0;

  questions.forEach((_, idx) => {
    const s = questionStatuses[idx] || 'not-visited';
    if (s === 'answered') answered++;
    else if (s === 'unanswered') unanswered++;
    else if (s === 'review' || s === 'review-answered') review++;
    else notVisited++;
  });

  const countAns = document.getElementById('countAnswered');
  const countUnans = document.getElementById('countUnanswered');
  const countRev = document.getElementById('countReview');
  const countNotVis = document.getElementById('countNotVisited');

  if (countAns) countAns.innerText = answered;
  if (countUnans) countUnans.innerText = unanswered;
  if (countRev) countRev.innerText = review;
  if (countNotVis) countNotVis.innerText = notVisited;
}

// -------------------------------------------------------------
// TIMER
// -------------------------------------------------------------

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemainingSeconds--;
    updateTimerDisplay();

    if (timeRemainingSeconds <= 0) {
      clearInterval(timerInterval);
      if (currentRound === 1) {
        alert("⏱️ Round 1 Time has expired! Submitting Round 1 answers and proceeding to Topic Selection.");
        submitRound1Answers(true, "Time Expired");
      } else {
        alert("⏱️ Assessment Time has expired! Automatically submitting final answers.");
        performFinalSubmission(true, "Time Expired");
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeRemainingSeconds / 60);
  const s = timeRemainingSeconds % 60;
  const str = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  const elem = document.getElementById('examTimer');
  if (elem) {
    elem.innerText = str;
    if (timeRemainingSeconds < 300) {
      elem.className = "font-mono font-black text-base sm:text-lg text-red-400 animate-pulse";
    }
  }
}

// -------------------------------------------------------------
// PROCTORING & ANTI-CHEAT ENGINE
// -------------------------------------------------------------

function initProctoring() {
  // 1. Right-click context menu disable
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // 2. Keyboard shortcut locks (F12, DevTools, Copy, Paste, Print, Inspect)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))) {
      e.preventDefault();
      logProctoringViolation('devtools_attempt', 'Attempted to open Developer Tools / Inspect Element');
      return false;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'u' || e.key === 'U' || e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      return false;
    }
  });

  // 3. Tab-switch & Visibility Change Monitor
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !isSubmitting) {
      logProctoringViolation('tab_switch', 'Candidate switched tabs or minimized window');
    }
  });

  // 4. Window Blur Detection
  window.addEventListener('blur', () => {
    if (!isSubmitting) {
      logProctoringViolation('window_blur', 'Window lost focus (Alt+Tab or external click)');
    }
  });

  // 5. Fullscreen Change Monitor
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !isSubmitting) {
      logProctoringViolation('fullscreen_exit', 'Candidate exited full-screen mode');
      checkFullscreenTakeover();
    } else if (document.fullscreenElement) {
      const takeoverModal = document.getElementById('fullscreenTakeoverModal');
      if (takeoverModal) takeoverModal.classList.add('hidden');
    }
  });
}

function checkFullscreenTakeover() {
  const takeoverModal = document.getElementById('fullscreenTakeoverModal');
  if (!takeoverModal) return;

  if (document.fullscreenElement) {
    takeoverModal.classList.add('hidden');
  } else {
    takeoverModal.classList.remove('hidden');
  }
}

function enterFullscreenAndStart() {
  requestBrowserFullscreen();
  const takeoverModal = document.getElementById('fullscreenTakeoverModal');
  if (takeoverModal) takeoverModal.classList.add('hidden');
}

function requestBrowserFullscreen() {
  try {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen().catch(() => {});
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen().catch(() => {});
    }
  } catch (err) {}
}

async function logProctoringViolation(type, details) {
  if (isSubmitting) return;

  strikes++;
  const badge = document.getElementById('strikeBadge');
  if (badge) badge.innerText = `${strikes} / ${MAX_STRIKES}`;
  playWarningBeep();

  try {
    const res = await fetch('/api/exam/violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: currentSessionId, type, details })
    });
    const data = await res.json();
    if (data.isDisqualified) {
      showDisqualificationModal();
      return;
    }
  } catch (err) {
    console.error("Violation logging error:", err);
  }

  if (strikes >= MAX_STRIKES) {
    showDisqualificationModal();
  } else {
    showViolationModal(type, details);
  }
}

function showViolationModal(type, details) {
  const modal = document.getElementById('violationModal');
  if (!modal) return;
  document.getElementById('modalStrikeCount').innerText = strikes;
  document.getElementById('violationDesc').innerText = `${details}. In accordance with CTS and MNC recruitment rules, switching tabs or leaving full-screen is prohibited.`;
  modal.classList.remove('hidden');

  let remaining = 10;
  const timerSpan = document.getElementById('violationTimer');
  timerSpan.innerText = remaining;

  if (violationCountdown) clearInterval(violationCountdown);

  violationCountdown = setInterval(() => {
    remaining--;
    timerSpan.innerText = remaining;
    if (remaining <= 0) {
      clearInterval(violationCountdown);
      dismissViolationModal();
    }
  }, 1000);
}

function dismissViolationModal() {
  if (violationCountdown) clearInterval(violationCountdown);
  const modal = document.getElementById('violationModal');
  if (modal) modal.classList.add('hidden');
  requestBrowserFullscreen();
}

function showDisqualificationModal() {
  if (violationCountdown) clearInterval(violationCountdown);
  const vModal = document.getElementById('violationModal');
  if (vModal) vModal.classList.add('hidden');
  const dModal = document.getElementById('disqualifiedModal');
  if (dModal) dModal.classList.remove('hidden');

  if (currentRound === 1) {
    submitRound1Answers(true, 'Disqualified: Exceeded 3 proctoring strikes');
  } else {
    performFinalSubmission(true, 'Disqualified: Exceeded 3 proctoring strikes');
  }
}

function proceedToAutoResult() {
  if (autoSubmittedResultId) {
    window.location.href = `result.html?id=${autoSubmittedResultId}`;
  } else {
    window.location.href = 'index.html';
  }
}

// -------------------------------------------------------------
// SUBMISSION CONTROLLERS
// -------------------------------------------------------------

function confirmExamSubmission() {
  let answered = 0;
  let unanswered = 0;
  let review = 0;

  questions.forEach((q) => {
    if (studentAnswers[q.id] !== undefined) answered++;
    else unanswered++;
  });

  questions.forEach((_, idx) => {
    const s = questionStatuses[idx];
    if (s === 'review' || s === 'review-answered') review++;
  });

  document.getElementById('confirmAnsweredCount').innerText = answered;
  document.getElementById('confirmUnansweredCount').innerText = unanswered;
  document.getElementById('confirmTotalCount').innerText = questions.length;
  document.getElementById('confirmTotalCount2').innerText = questions.length;
  document.getElementById('confirmReviewCount').innerText = review;
  document.getElementById('confirmStrikesCount').innerText = strikes;

  const title = document.getElementById('confirmModalTitle');
  const desc = document.getElementById('confirmModalDesc');
  const btnText = document.getElementById('confirmSubmitBtnText');

  if (currentRound === 1) {
    title.innerText = "Submit Round 1 & Proceed to Topics?";
    desc.innerText = "You have completed Round 1: MNC Aptitude. Submitting will score your aptitude and unlock the Round 2 Topic Multi-Select screen:";
    btnText.innerText = "Submit Round 1 & Select Topics";
  } else {
    title.innerText = "Submit Final Examination?";
    desc.innerText = "You have completed Round 2: Technical Electives. Final submission will calculate your combined 50-mark score:";
    btnText.innerText = "Submit Final Exam";
  }

  document.getElementById('submitConfirmModal').classList.remove('hidden');
}

function closeSubmitConfirmModal() {
  document.getElementById('submitConfirmModal').classList.add('hidden');
}

function handleConfirmedSubmit() {
  closeSubmitConfirmModal();
  if (currentRound === 1) {
    submitRound1Answers(false, '');
  } else {
    performFinalSubmission(false, '');
  }
}

// SUBMIT ROUND 1
async function submitRound1Answers(autoSubmitted = false, reason = '') {
  if (timerInterval) clearInterval(timerInterval);

  try {
    const res = await fetch('/api/exam/submit-round1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        answers: studentAnswers,
        autoSubmitted,
        reason
      })
    });

    const data = await res.json();
    if (!data.success) {
      alert("Error submitting Round 1: " + (data.message || "Failed"));
      return;
    }

    // Display Round 1 Score in Multi-Select Modal
    const scoreElem = document.getElementById('r1ScoreDisplay');
    if (scoreElem) scoreElem.innerText = data.round1Score;

    // Open Topic Select Modal
    const modal = document.getElementById('round2TopicSelectModal');
    if (modal) {
      modal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    }
  } catch (err) {
    console.error('Error submitting Round 1:', err);
    alert("Connection error submitting Round 1. Please try again.");
  }
}

// DYNAMIC TOPIC SELECTION CALCULATOR (ROUND 2)
function updateTopicSelection() {
  const checkboxes = document.querySelectorAll('input[name="round2Topic"]:checked');
  const selectedValues = Array.from(checkboxes).map(cb => cb.value);
  const count = selectedValues.length;

  const countBadge = document.getElementById('selectedCountBadge');
  const startBtn = document.getElementById('startRound2Btn');
  const breakdownText = document.getElementById('allocationBreakdownText');

  countBadge.innerText = `${count} Selected`;

  const topicDisplayNames = {
    html: "HTML5",
    css: "CSS3",
    bootstrap: "Bootstrap 5",
    javascript: "JavaScript",
    python: "Python",
    react: "React.js",
    data_science: "Data Science (Python, NumPy, Pandas)",
    data_analytics: "Data Analytics"
  };

  if (count === 0) {
    startBtn.disabled = true;
    breakdownText.innerText = "⚠️ Please select at least one technical topic to proceed.";
    return;
  }

  startBtn.disabled = false;

  // Exact 30 allocation math
  const baseCount = Math.floor(30 / count);
  const remainder = 30 % count;

  const parts = [];
  selectedValues.forEach((val, idx) => {
    const qCount = baseCount + (idx < remainder ? 1 : 0);
    parts.push(`<strong>${topicDisplayNames[val] || val}</strong>: ${qCount} Qs`);
  });

  breakdownText.innerHTML = `
    ${parts.join(' &bull; ')} <br>
    <span class="text-emerald-700 font-bold mt-1 inline-block">✓ Exactly 30 questions randomly drawn across your chosen subjects!</span>
  `;
}

// LAUNCH ROUND 2
async function launchRound2() {
  const checkboxes = document.querySelectorAll('input[name="round2Topic"]:checked');
  const selectedModules = Array.from(checkboxes).map(cb => cb.value);

  if (selectedModules.length === 0) {
    alert("Please select at least 1 topic for Round 2.");
    return;
  }

  const startBtn = document.getElementById('startRound2Btn');
  startBtn.disabled = true;
  startBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin mr-2"></i> Generating Dynamic 30-Question Assessment...`;
  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await fetch('/api/exam/start-round2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        selectedModules
      })
    });

    const data = await res.json();
    if (!data.success) {
      alert("Failed to initialize Round 2: " + (data.message || "Unknown error"));
      startBtn.disabled = false;
      startBtn.innerHTML = `<span>Launch Round 2 (30 Questions)</span><i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>`;
      return;
    }

    // Switch state to Round 2
    currentRound = 2;
    questions = data.questions; // Exactly 30 questions
    durationMinutes = data.durationMinutes || 35;
    timeRemainingSeconds = durationMinutes * 60;
    studentAnswers = {};
    resetQuestionStatuses();

    // Hide Modal
    document.getElementById('round2TopicSelectModal').classList.add('hidden');

    // Update Header & Palette
    updateRoundHeaderUI();
    buildPalette();

    // Render Question 1
    loadQuestion(0);

    // Restart timer
    startTimer();

    // Ensure Fullscreen
    requestBrowserFullscreen();

    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error("Error launching Round 2:", err);
    alert("Server communication error. Please try again.");
    startBtn.disabled = false;
    startBtn.innerHTML = `<span>Launch Round 2 (30 Questions)</span><i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>`;
  }
}

// FINAL SUBMISSION (ROUND 2)
async function performFinalSubmission(autoSubmitted = false, reason = '') {
  isSubmitting = true;
  if (timerInterval) clearInterval(timerInterval);

  const btn = document.getElementById('finalSubmitBtn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin mr-1"></i> Calculating Final Score (/50)...`;
  }

  try {
    const res = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        answers: studentAnswers,
        autoSubmitted,
        reason
      })
    });

    const data = await res.json();

    if (!data.success) {
      alert("Submission error: " + (data.message || "Failed to submit answers"));
      isSubmitting = false;
      return;
    }

    const resultId = data.result.resultId;
    autoSubmittedResultId = resultId;

    sessionStorage.setItem('lastResult', JSON.stringify(data.result));
    sessionStorage.removeItem('examQuestions');
    try {
      localStorage.setItem('wegrow_result_' + resultId, JSON.stringify(data.result));
      localStorage.setItem('wegrow_latest_result_id', resultId);
    } catch (e) {}

    try {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (e) {}

    window.location.href = `result.html?id=${resultId}`;
  } catch (err) {
    console.error('Final submission failed:', err);
    alert("Connection error during final submission. Please contact instructor Deepak.");
    isSubmitting = false;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
