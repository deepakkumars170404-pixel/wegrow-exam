// Admin Dashboard Script
let currentAdminEmail = sessionStorage.getItem('adminEmail') || '';
let currentAdminPin = sessionStorage.getItem('adminPin') || null;
let cachedLeaderboard = [];

document.addEventListener('DOMContentLoaded', () => {
  const savedPin = sessionStorage.getItem('adminPin');
  const savedEmail = sessionStorage.getItem('adminEmail');

  if (savedEmail && savedPin) {
    currentAdminEmail = savedEmail;
    currentAdminPin = savedPin;
    showAdminDashboard();
  } else {
    document.getElementById('adminLoginModal').classList.remove('hidden');
    document.getElementById('adminApp').classList.add('hidden');
  }

  if (window.lucide) window.lucide.createIcons();
});

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-admin-email': currentAdminEmail,
    'x-admin-pin': currentAdminPin
  };
}

// -------------------------------------------------------------
// AUTHENTICATION
// -------------------------------------------------------------

async function handleAdminLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('adminEmailInput').value.trim();
  const pinInput = document.getElementById('adminPinInput').value.trim();
  const errDiv = document.getElementById('loginErrorMsg');

  errDiv.classList.add('hidden');

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, pin: pinInput })
    });

    const data = await res.json();
    if (!data.success) {
      errDiv.innerText = data.message || "Authentication failed.";
      errDiv.classList.remove('hidden');
      return;
    }

    currentAdminEmail = emailInput;
    currentAdminPin = pinInput;
    sessionStorage.setItem('adminEmail', emailInput);
    sessionStorage.setItem('adminPin', pinInput);

    showAdminDashboard();
  } catch (err) {
    console.error('Login error:', err);
    errDiv.innerText = "Error communicating with server.";
    errDiv.classList.remove('hidden');
  }
}

function showAdminDashboard() {
  document.getElementById('adminLoginModal').classList.add('hidden');
  document.getElementById('adminApp').classList.remove('hidden');

  // Update CSV download link with credentials
  document.getElementById('exportCsvBtn').href = `/api/admin/export-csv?adminEmail=${encodeURIComponent(currentAdminEmail)}&adminPin=${encodeURIComponent(currentAdminPin)}`;

  loadLeaderboard();
  loadLiveSessions();
  loadMasterQuestions();

  if (window.lucide) window.lucide.createIcons();
}

function handleAdminLogout() {
  sessionStorage.removeItem('adminEmail');
  sessionStorage.removeItem('adminPin');
  currentAdminEmail = '';
  currentAdminPin = null;
  window.location.reload();
}

// -------------------------------------------------------------
// TAB SWITCHING
// -------------------------------------------------------------

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.add('hidden');
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.className = 'tab-btn px-4 py-2 rounded-lg text-slate-400 hover:text-white flex items-center space-x-1.5 transition cursor-pointer';
  });

  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.remove('hidden');

  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeBtn) {
    activeBtn.className = 'tab-btn px-4 py-2 rounded-lg bg-blue-600 text-white shadow-sm flex items-center space-x-1.5 transition cursor-pointer';
  }

  if (tabId === 'leaderboard') loadLeaderboard();
  if (tabId === 'hr') renderHrCandidates(cachedLeaderboard);
  if (tabId === 'questions') loadMasterQuestions();
  if (tabId === 'live') loadLiveSessions();

  if (window.lucide) window.lucide.createIcons();
}

// -------------------------------------------------------------
// LEADERBOARD (TOP MARK TO LOW MARK)
// -------------------------------------------------------------

async function loadLeaderboard() {
  try {
    const res = await fetch(`/api/admin/leaderboard`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    if (!data.success) {
      if (res.status === 401 || res.status === 403) {
        handleAdminLogout();
        return;
      }
      return;
    }

    cachedLeaderboard = data.leaderboard || [];

    // Update Top Overview Stats
    document.getElementById('statTotalSubmissions').innerText = data.stats.totalSubmissions;
    document.getElementById('statAveragePercentage').innerText = `${data.stats.avgPercentage}%`;
    document.getElementById('statHighestScore').innerText = `${data.stats.highestScore} / 50`;

    // Update HR Stats & Badges (Distinguishes Pending, Partial, and Completed)
    const hrCompleted = cachedLeaderboard.filter(item => item.hrStatus === 'completed').length;
    const hrPartial = cachedLeaderboard.filter(item => item.hrStatus === 'gd_completed' || item.hrStatus === 'interview_completed').length;
    const hrPending = cachedLeaderboard.length - hrCompleted - hrPartial;

    const badge = document.getElementById('hrBadgePending');
    if (badge) {
      const activePending = hrPending + hrPartial;
      if (activePending > 0) {
        badge.innerText = activePending;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    const statTotal = document.getElementById('hrStatTotal');
    if (statTotal) statTotal.innerText = cachedLeaderboard.length;
    const statPending = document.getElementById('hrStatPending');
    if (statPending) statPending.innerText = hrPending;
    const statPartial = document.getElementById('hrStatPartial');
    if (statPartial) statPartial.innerText = hrPartial;
    const statCompleted = document.getElementById('hrStatCompleted');
    if (statCompleted) statCompleted.innerText = hrCompleted;

    // Render Podium
    renderPodium(cachedLeaderboard);

    // Render Table
    renderLeaderboardRows(cachedLeaderboard);

    // Render HR Table
    renderHrCandidates(cachedLeaderboard);

  } catch (err) {
    console.error('Error fetching leaderboard:', err);
  }
}

function renderPodium(list) {
  const podiumSection = document.getElementById('podiumSection');
  const container = document.getElementById('podiumCardsContainer');

  if (!list || list.length === 0) {
    podiumSection.classList.add('hidden');
    return;
  }

  podiumSection.classList.remove('hidden');
  container.innerHTML = '';

  const top3 = list.slice(0, 3);
  const ranks = [
    { title: "Rank 1 (Gold)", bg: "rank-1", badge: "🥇 Rank 1", text: "text-amber-900" },
    { title: "Rank 2 (Silver)", bg: "rank-2", badge: "🥈 Rank 2", text: "text-slate-800" },
    { title: "Rank 3 (Bronze)", bg: "rank-3", badge: "🥉 Rank 3", text: "text-orange-950" }
  ];

  top3.forEach((item, idx) => {
    const r = ranks[idx];
    const card = document.createElement('div');
    card.className = `podium-card p-4 rounded-2xl ${r.bg} shadow-sm`;

    card.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-black uppercase tracking-wider ${r.text}">${r.badge}</span>
        <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 ${r.text}">${item.percentage}%</span>
      </div>
      <h3 class="text-base font-extrabold text-slate-900 truncate">${escapeHtml(item.studentName)}</h3>
      <p class="text-[11px] text-slate-600 truncate mt-0.5">R1: ${item.round1Score}/20 &bull; R2: ${item.round2Score}/30</p>
      
      <div class="flex items-center justify-between mt-3 pt-2 border-t border-black/10 text-xs font-bold ${r.text}">
        <span>Total: ${item.score}/50</span>
        <span>${item.timeTakenFormatted || 'N/A'}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderLeaderboardRows(list) {
  const tbody = document.getElementById('leaderboardTbody');
  tbody.innerHTML = '';

  if (!list || list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" class="p-8 text-center text-slate-400">
          No assessment submissions found. Real-time candidate submissions will appear here.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach((item) => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50/80 transition-colors";

    // Rank Medal/Badge
    let rankBadge = `<span class="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-bold inline-flex items-center justify-center text-xs">#${item.rank}</span>`;
    if (item.rank === 1) rankBadge = `<span class="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black inline-flex items-center justify-center text-xs shadow-sm">1</span>`;
    else if (item.rank === 2) rankBadge = `<span class="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold inline-flex items-center justify-center text-xs shadow-sm">2</span>`;
    else if (item.rank === 3) rankBadge = `<span class="w-6 h-6 rounded-full bg-orange-300 text-orange-950 font-bold inline-flex items-center justify-center text-xs shadow-sm">3</span>`;

    // HR Status badge
    const isHrDone = item.hrStatus === 'completed';
    const hrBadge = isHrDone 
      ? `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✅ Evaluated</span>`
      : `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">⏳ Pending</span>`;

    const gdVal = (item.gdScore !== null && item.gdScore !== undefined) ? item.gdScore : '-';
    const intVal = (item.interviewScore !== null && item.interviewScore !== undefined) ? item.interviewScore : '-';
    const hrVal = (item.hrTotal !== null && item.hrTotal !== undefined) ? `${item.hrTotal}/50` : '-';
    const grandVal = (item.grandTotal !== null && item.grandTotal !== undefined) ? `${item.grandTotal}/100` : `${item.score}/50`;
    const grandPctVal = (item.grandPercentage !== null && item.grandPercentage !== undefined) ? `${item.grandPercentage}%` : `${item.percentage}%`;

    tr.innerHTML = `
      <td class="py-3.5 px-3 font-bold">${rankBadge}</td>
      <td class="py-3.5 px-3">
        <div class="font-bold text-slate-900 text-xs sm:text-sm">${escapeHtml(item.studentName)}</div>
        <div class="text-[10px] text-blue-600 font-semibold">${escapeHtml(item.batch || 'Sivakasi')}</div>
      </td>
      <td class="py-3.5 px-2 text-center font-bold text-blue-700">
        ${item.round1Score}
      </td>
      <td class="py-3.5 px-2 text-center font-bold text-indigo-700">
        ${item.round2Score}
      </td>
      <td class="py-3.5 px-2 text-center font-black text-slate-900 bg-slate-100/60 text-sm">
        ${item.score}
      </td>
      <td class="py-3.5 px-2 text-center font-bold text-emerald-700">
        ${gdVal}
      </td>
      <td class="py-3.5 px-2 text-center font-bold text-emerald-700">
        ${intVal}
      </td>
      <td class="py-3.5 px-2 text-center font-black text-emerald-900 bg-emerald-50/50">
        ${hrVal}
      </td>
      <td class="py-3.5 px-3 text-center bg-purple-50/60">
        <div class="font-black text-purple-900 text-sm">${grandVal}</div>
        <div class="text-[10px] font-bold text-purple-700">${grandPctVal}</div>
      </td>
      <td class="py-3.5 px-2 text-center">
        ${hrBadge}
      </td>
      <td class="py-3.5 px-2 text-center text-slate-500 font-mono text-[11px]">
        ${item.timeTakenFormatted || '-'}
      </td>
      <td class="py-3.5 px-3 text-right">
        <div class="flex items-center justify-end space-x-1.5">
          <button 
            onclick="openHrModal('${item.id}')"
            class="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-200 transition cursor-pointer flex items-center shadow-xs"
            title="Score Round 3 GD & Round 4 Interview"
          >
            <i data-lucide="award" class="w-3.5 h-3.5 mr-1 text-emerald-600"></i> HR Marks
          </button>
          <button 
            onclick="quickAllowReexam('${escapeHtml(item.studentName)}')"
            class="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold border border-blue-200 transition cursor-pointer"
            title="Unlock Re-Exam for student"
          >
            Re-exam
          </button>
          <a 
            href="result.html?id=${item.id}" 
            target="_blank"
            class="p-1 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
            title="Inspect Candidate Scorecard"
          >
            <i data-lucide="eye" class="w-4 h-4"></i>
          </a>
          <button 
            onclick="deleteResultEntry('${item.id}', '${escapeHtml(item.studentName)}')"
            class="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
            title="Delete Entry"
          >
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) window.lucide.createIcons();
}

function filterLeaderboardTable() {
  const query = (document.getElementById('searchStudentInput')?.value || '').trim().toLowerCase();
  const center = (document.getElementById('filterCenterSelect')?.value || '').trim().toLowerCase();

  let filtered = cachedLeaderboard;

  if (center) {
    filtered = filtered.filter(item => (item.batch || '').toLowerCase() === center);
  }

  if (query) {
    filtered = filtered.filter(item => 
      item.studentName.toLowerCase().includes(query) ||
      (item.batch && item.batch.toLowerCase().includes(query))
    );
  }

  renderLeaderboardRows(filtered);
}

async function quickAllowReexam(name) {
  if (!confirm(`Are you sure you want to allow candidate '${name}' to write a Re-Exam?`)) {
    return;
  }

  try {
    const res = await fetch('/api/admin/allow-reexam', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        studentName: name,
        resetReason: "Quick re-exam unlocked via Leaderboard",
        clearPreviousResult: false
      })
    });
    const data = await res.json();
    alert(data.message || "Re-exam unlocked successfully!");
    loadLeaderboard();
  } catch (err) {
    alert("Error unlocking re-exam.");
  }
}

async function deleteResultEntry(id, studentName) {
  if (!confirm(`Delete test result for candidate '${studentName}'? This action cannot be undone.`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/result/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success) {
      loadLeaderboard();
    }
  } catch (err) {
    alert("Error deleting record.");
  }
}

// -------------------------------------------------------------
// RE-EXAM PERMISSION FORM
// -------------------------------------------------------------

async function handleGrantReexam(e) {
  e.preventDefault();
  const nameInput = document.getElementById('reexamStudentNameInput').value.trim();
  const reasonInput = document.getElementById('reexamReasonInput').value.trim();
  const clearCheck = document.getElementById('reexamClearPrevCheck').checked;

  if (!nameInput) {
    alert("Please enter candidate name.");
    return;
  }

  try {
    const res = await fetch('/api/admin/allow-reexam', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        studentName: nameInput,
        resetReason: reasonInput || "Instructor approved re-exam request",
        clearPreviousResult: clearCheck
      })
    });

    const data = await res.json();
    alert(data.message || "Re-exam permission granted!");
    document.getElementById('reexamStudentNameInput').value = '';
    document.getElementById('reexamReasonInput').value = '';
    document.getElementById('reexamClearPrevCheck').checked = false;
    loadLeaderboard();
  } catch (err) {
    alert("Error granting re-exam permission.");
  }
}

// -------------------------------------------------------------
// MASTER QUESTIONS & ANSWERS (DEEPAK'S VIEW)
// -------------------------------------------------------------

async function loadMasterQuestions() {
  const modSelect = document.getElementById('masterModuleSelect');
  const modId = modSelect ? modSelect.value : 'aptitude';
  const container = document.getElementById('masterQuestionsContainer');

  container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs">Fetching master question repository...</div>`;

  try {
    const res = await fetch(`/api/admin/questions?module=${modId}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    if (!data.success) {
      container.innerHTML = `<div class="p-8 text-center text-red-500 text-xs">Failed to load master questions.</div>`;
      return;
    }

    const questions = data.questions || [];
    if (questions.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs">No questions loaded for this module in database.</div>`;
      return;
    }

    const optionLabels = ['A', 'B', 'C', 'D'];
    let html = '';

    questions.forEach((q) => {
      let optionsHtml = '';
      q.options.forEach((opt, optIdx) => {
        const isCorrect = optIdx === q.correctAnswer;
        optionsHtml += `
          <div class="p-2.5 rounded-lg border text-xs flex items-center justify-between ${
            isCorrect ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'
          }">
            <div class="flex items-center space-x-2">
              <span class="w-5 h-5 rounded font-bold text-xs flex items-center justify-center ${
                isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }">
                ${optionLabels[optIdx]}
              </span>
              <span>${escapeHtml(opt)}</span>
            </div>
            ${isCorrect ? '<span class="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-600 text-white">✓ Correct Key</span>' : ''}
          </div>
        `;
      });

      html += `
        <div class="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">#${q.questionIndex}</span>
              <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">${escapeHtml(q.topic || q.category)}</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold ${
                (q.difficulty || '').toLowerCase() === 'basic' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }">
                ${q.difficulty || 'Medium'}
              </span>
            </div>
            <button 
              onclick="deleteQuestion('${q.id}')"
              class="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
              title="Delete Question"
            >
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Delete</span>
            </button>
          </div>

          <div class="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-wrap select-text">
            ${escapeHtml(q.question)}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            ${optionsHtml}
          </div>

          <div class="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-1">
            <div class="font-bold text-blue-900 flex items-center">
              <i data-lucide="info" class="w-3.5 h-3.5 mr-1 text-blue-600"></i> Solution Explanation:
            </div>
            <p class="text-[11px] text-blue-800 leading-relaxed select-text">
              ${escapeHtml(q.explanation)}
            </p>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('Error loading master questions:', err);
    container.innerHTML = `<div class="p-8 text-center text-red-500 text-xs">Error communicating with server.</div>`;
  }
}

// -------------------------------------------------------------
// MANUALLY ADD QUESTION (DEEPAK ONLY)
// -------------------------------------------------------------

function openAddQuestionModal() {
  document.getElementById('addQuestionModal').classList.remove('hidden');
  const modSelect = document.getElementById('masterModuleSelect');
  if (modSelect) {
    document.getElementById('newQModule').value = modSelect.value;
  }
}

function closeAddQuestionModal() {
  document.getElementById('addQuestionModal').classList.add('hidden');
}

async function handleSaveCustomQuestion(e) {
  e.preventDefault();

  const moduleId = document.getElementById('newQModule').value;
  const difficulty = document.getElementById('newQDifficulty').value;
  const topic = document.getElementById('newQTopic').value.trim() || 'General';
  const question = document.getElementById('newQText').value.trim();
  const opt0 = document.getElementById('newQOpt0').value.trim();
  const opt1 = document.getElementById('newQOpt1').value.trim();
  const opt2 = document.getElementById('newQOpt2').value.trim();
  const opt3 = document.getElementById('newQOpt3').value.trim();
  const correctRadio = document.querySelector('input[name="newQCorrect"]:checked');
  const explanation = document.getElementById('newQExplanation').value.trim();

  if (!correctRadio) {
    alert("Please select which option (A, B, C, or D) is the correct answer.");
    return;
  }

  const correctAnswer = parseInt(correctRadio.value);
  const options = [opt0, opt1, opt2, opt3];

  const btn = document.getElementById('saveQuestionBtn');
  btn.disabled = true;
  btn.innerHTML = `Saving to SQLite DB...`;

  try {
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        moduleId,
        category: topic,
        topic,
        difficulty,
        question,
        options,
        correctAnswer,
        explanation
      })
    });

    const data = await res.json();
    if (!data.success) {
      alert("Error: " + (data.message || "Failed to save question"));
      btn.disabled = false;
      btn.innerHTML = `<span>Save Question to Database</span>`;
      return;
    }

    alert(`✓ ${data.message}`);
    closeAddQuestionModal();
    document.getElementById('addQuestionForm').reset();
    btn.disabled = false;
    btn.innerHTML = `<span>Save Question to Database</span>`;

    loadMasterQuestions();
  } catch (err) {
    console.error('Error adding question:', err);
    alert("Connection error saving question.");
    btn.disabled = false;
    btn.innerHTML = `<span>Save Question to Database</span>`;
  }
}

async function deleteQuestion(id) {
  if (!confirm(`Delete question '${id}' permanently from database?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/admin/question/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.success) {
      loadMasterQuestions();
    } else {
      alert(data.message || "Failed to delete question");
    }
  } catch (err) {
    alert("Error deleting question.");
  }
}

// -------------------------------------------------------------
// LIVE MONITOR
// -------------------------------------------------------------

async function loadLiveSessions() {
  const container = document.getElementById('liveSessionsContainer');
  try {
    const res = await fetch('/api/admin/live-sessions', {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    if (!data.success) return;

    const sessions = data.activeSessions || [];
    document.getElementById('statActiveSessions').innerText = sessions.length;

    if (sessions.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400 text-xs">
          No candidates are actively writing an assessment right now.
        </div>
      `;
      return;
    }

    let html = `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th class="py-3 px-4">Candidate</th>
              <th class="py-3 px-4">Stage / Round</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-center">Strikes</th>
              <th class="py-3 px-4">Started At</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
    `;

    sessions.forEach((s) => {
      const isLocked = s.status === 'locked';
      html += `
        <tr class="hover:bg-slate-50">
          <td class="py-3 px-4 font-bold text-slate-900">${escapeHtml(s.studentName)} (${s.batch || 'General'})</td>
          <td class="py-3 px-4 text-blue-700 font-semibold">${s.roundType === 'round2' ? 'Round 2: Technical' : 'Round 1: Aptitude'}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isLocked ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
            }">
              ${isLocked ? 'LOCKED / DISQUALIFIED' : 'ACTIVE IN FULLSCREEN'}
            </span>
          </td>
          <td class="py-3 px-4 text-center font-bold text-red-600">${s.warnings || 0} / 3</td>
          <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">${new Date(s.startTime).toLocaleTimeString()}</td>
        </tr>
      `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  } catch (err) {
    console.error('Error fetching live sessions:', err);
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

// -------------------------------------------------------------
// HR EVALUATION MODULE (SAVE SEPARATELY OR FINALIZE ALL 4 MARKS)
// -------------------------------------------------------------

function filterHrCandidates() {
  const center = (document.getElementById('hrCenterFilter')?.value || '').trim().toLowerCase();
  const status = (document.getElementById('hrStatusFilter')?.value || 'all').trim();
  const search = (document.getElementById('hrSearchInput')?.value || '').trim().toLowerCase();

  let list = cachedLeaderboard;

  if (center) {
    list = list.filter(item => (item.batch || '').toLowerCase() === center);
  }

  if (status === 'pending') {
    list = list.filter(item => item.hrStatus === 'pending' || !item.hrStatus);
  } else if (status === 'partial') {
    list = list.filter(item => item.hrStatus === 'gd_completed' || item.hrStatus === 'interview_completed');
  } else if (status === 'completed') {
    list = list.filter(item => item.hrStatus === 'completed');
  }

  if (search) {
    list = list.filter(item => 
      (item.studentName || '').toLowerCase().includes(search) ||
      (item.batch || '').toLowerCase().includes(search)
    );
  }

  renderHrCandidates(list);
}

function renderHrCandidates(list) {
  const tbody = document.getElementById('hrCandidatesTbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!list || list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="p-8 text-center text-slate-400">
          No candidates match the selected filters.
        </td>
      </tr>
    `;
    return;
  }

  list.forEach((item) => {
    const tr = document.createElement('tr');
    tr.id = `hr_row_${item.id}`;
    tr.className = "hover:bg-slate-50/80 transition-colors";

    const hasGd = item.gdScore !== null && item.gdScore !== undefined;
    const hasInt = item.interviewScore !== null && item.interviewScore !== undefined;
    const isBothDone = hasGd && hasInt;

    const gdVal = hasGd ? item.gdScore : '';
    const intVal = hasInt ? item.interviewScore : '';
    const hrVal = isBothDone ? `${item.hrTotal} / 50` : (hasGd ? `${item.gdScore} (GD)` : (hasInt ? `${item.interviewScore} (F2F)` : '-'));
    const grandVal = isBothDone ? `${item.grandTotal} / 100` : `${item.score} / 50`;
    const grandPct = isBothDone ? `${item.grandPercentage}%` : `${item.percentage}%`;

    // Status Badge
    let statusBadge = '<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">⏳ Pending Both</span>';
    if (isBothDone) {
      statusBadge = '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✅ Grand /100</span>';
    } else if (hasGd) {
      statusBadge = '<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">🟡 GD Saved • F2F Pending</span>';
    } else if (hasInt) {
      statusBadge = '<span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">🟡 F2F Saved • GD Pending</span>';
    }

    tr.innerHTML = `
      <td class="py-3 px-3">
        <div class="font-bold text-slate-900 text-xs sm:text-sm">${escapeHtml(item.studentName)}</div>
        <div class="text-[10px] text-slate-400">R1: ${item.round1Score}/20 &bull; R2: ${item.round2Score}/30</div>
      </td>
      <td class="py-3 px-2 text-center">
        <span class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
          ${escapeHtml(item.batch || 'Sivakasi')}
        </span>
      </td>
      <td class="py-3 px-2 text-center font-black text-slate-800">
        ${item.score} / 50
      </td>
      
      <!-- Round 3: GD Cell with Independent Save -->
      <td class="py-3 px-3 text-center">
        <div class="inline-flex items-center space-x-1.5 bg-emerald-50/60 p-1 rounded-xl border border-emerald-200">
          <input 
            type="number" 
            min="0" 
            max="25" 
            id="hr_gd_${item.id}" 
            value="${gdVal}" 
            placeholder="0-25"
            oninput="calcCandidateLiveTotal('${item.id}', ${item.score})"
            class="w-14 px-1.5 py-1 text-center font-bold text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
          <span class="text-[10px] font-bold text-slate-400">/25</span>
          <button 
            type="button"
            onclick="saveSingleRoundScore('${item.id}', 'gd')"
            id="btn_gd_${item.id}"
            title="Save Round 3 GD mark to Database"
            class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer flex items-center space-x-0.5"
          >
            <i data-lucide="check" class="w-3 h-3"></i>
            <span>Save GD</span>
          </button>
        </div>
      </td>

      <!-- Round 4: F2F Interview Cell with Independent Save -->
      <td class="py-3 px-3 text-center">
        <div class="inline-flex items-center space-x-1.5 bg-purple-50/60 p-1 rounded-xl border border-purple-200">
          <input 
            type="number" 
            min="0" 
            max="25" 
            id="hr_int_${item.id}" 
            value="${intVal}" 
            placeholder="0-25"
            oninput="calcCandidateLiveTotal('${item.id}', ${item.score})"
            class="w-14 px-1.5 py-1 text-center font-bold text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
          <span class="text-[10px] font-bold text-slate-400">/25</span>
          <button 
            type="button"
            onclick="saveSingleRoundScore('${item.id}', 'interview')"
            id="btn_int_${item.id}"
            title="Save Round 4 Interview mark to Database"
            class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer flex items-center space-x-0.5"
          >
            <i data-lucide="check" class="w-3 h-3"></i>
            <span>Save F2F</span>
          </button>
        </div>
      </td>

      <td class="py-3 px-2 text-center font-bold text-indigo-700">
        <span id="hr_hrtot_${item.id}">${hrVal}</span>
      </td>
      <td class="py-3 px-2 text-center bg-emerald-50/40">
        <div class="font-black text-emerald-900 text-sm"><span id="hr_grand_${item.id}">${grandVal}</span></div>
        <div class="text-[10px] font-bold text-emerald-600"><span id="hr_pct_${item.id}">${grandPct}</span></div>
      </td>
      <td class="py-3 px-3">
        <input 
          type="text" 
          id="hr_rem_${item.id}" 
          value="${escapeHtml(item.hrRemarks || '')}" 
          placeholder="Remarks..."
          class="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        >
      </td>
      <td class="py-3 px-3 text-center" id="hr_badge_col_${item.id}">
        ${statusBadge}
      </td>
      <td class="py-3 px-3 text-right">
        <button 
          onclick="saveCandidateHrScore('${item.id}')"
          id="hr_btn_${item.id}"
          title="Save all entered marks and calculate Grand Total (/100) if both present"
          class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1 cursor-pointer ml-auto"
        >
          <i data-lucide="save" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>${isBothDone ? 'Save All' : 'Save Marks'}</span>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  if (window.lucide) window.lucide.createIcons();
}

function calcCandidateLiveTotal(resultId, quizScore) {
  const gdInput = document.getElementById(`hr_gd_${resultId}`);
  const intInput = document.getElementById(`hr_int_${resultId}`);

  const gdRaw = gdInput?.value.trim();
  const intRaw = intInput?.value.trim();

  let gd = gdRaw !== '' ? parseInt(gdRaw, 10) : null;
  let f2f = intRaw !== '' ? parseInt(intRaw, 10) : null;

  if (gd !== null && (isNaN(gd) || gd < 0)) gd = 0;
  if (gd !== null && gd > 25) { gd = 25; gdInput.value = 25; }

  if (f2f !== null && (isNaN(f2f) || f2f < 0)) f2f = 0;
  if (f2f !== null && f2f > 25) { f2f = 25; intInput.value = 25; }

  const hrTotElem = document.getElementById(`hr_hrtot_${resultId}`);
  const grandElem = document.getElementById(`hr_grand_${resultId}`);
  const pctElem = document.getElementById(`hr_pct_${resultId}`);

  if (gd !== null && f2f !== null) {
    const hrTotal = gd + f2f;
    const grandTotal = quizScore + hrTotal;
    const grandPct = ((grandTotal / 100) * 100).toFixed(1);

    if (hrTotElem) hrTotElem.innerText = `${hrTotal} / 50`;
    if (grandElem) grandElem.innerText = `${grandTotal} / 100`;
    if (pctElem) pctElem.innerText = `${grandPct}%`;
  } else if (gd !== null) {
    if (hrTotElem) hrTotElem.innerText = `${gd} (GD)`;
    if (grandElem) grandElem.innerText = `${quizScore + gd} / 75`;
    if (pctElem) pctElem.innerText = 'Partial (F2F Pending)';
  } else if (f2f !== null) {
    if (hrTotElem) hrTotElem.innerText = `${f2f} (F2F)`;
    if (grandElem) grandElem.innerText = `${quizScore + f2f} / 75`;
    if (pctElem) pctElem.innerText = 'Partial (GD Pending)';
  } else {
    if (hrTotElem) hrTotElem.innerText = '-';
    if (grandElem) grandElem.innerText = `${quizScore} / 50`;
    if (pctElem) pctElem.innerText = `${((quizScore / 50) * 100).toFixed(1)}%`;
  }
}

// SAVE ROUND 3 (GD ONLY) OR ROUND 4 (INTERVIEW ONLY) SEPARATELY
async function saveSingleRoundScore(resultId, roundType) {
  const gdInput = document.getElementById(`hr_gd_${resultId}`);
  const intInput = document.getElementById(`hr_int_${resultId}`);
  const remInput = document.getElementById(`hr_rem_${resultId}`);
  const btn = document.getElementById(`btn_${roundType === 'gd' ? 'gd' : 'int'}_${resultId}`);

  const remarks = remInput ? remInput.value.trim() : '';
  const payload = { resultId, remarks };

  if (roundType === 'gd') {
    const gdRaw = gdInput ? gdInput.value.trim() : '';
    if (gdRaw === '' || isNaN(parseInt(gdRaw, 10))) {
      alert("Please enter a valid Group Discussion mark between 0 and 25.");
      if (gdInput) gdInput.focus();
      return;
    }
    const val = Math.max(0, Math.min(25, parseInt(gdRaw, 10)));
    gdInput.value = val;
    payload.gdScore = val;
  } else if (roundType === 'interview') {
    const intRaw = intInput ? intInput.value.trim() : '';
    if (intRaw === '' || isNaN(parseInt(intRaw, 10))) {
      alert("Please enter a valid Face-to-Face Interview mark between 0 and 25.");
      if (intInput) intInput.focus();
      return;
    }
    const val = Math.max(0, Math.min(25, parseInt(intRaw, 10)));
    intInput.value = val;
    payload.interviewScore = val;
  }

  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i>';
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const res = await fetch('/api/admin/hr-score', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) {
      alert("Error: " + (data.message || "Failed saving mark"));
      if (btn) { btn.disabled = false; btn.innerHTML = origHtml; if (window.lucide) window.lucide.createIcons(); }
      return;
    }

    // Update local cache
    updateCachedCandidateHr(resultId, data.hrAssessment);

    if (btn) {
      btn.disabled = false;
      btn.className = "px-2 py-1 bg-slate-900 text-emerald-400 rounded-lg text-[10px] font-bold shadow-xs transition flex items-center space-x-0.5";
      btn.innerHTML = '<i data-lucide="check-check" class="w-3 h-3"></i><span>Saved!</span>';
      if (window.lucide) window.lucide.createIcons();
      setTimeout(() => {
        btn.className = roundType === 'gd' 
          ? "px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer flex items-center space-x-0.5"
          : "px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition cursor-pointer flex items-center space-x-0.5";
        btn.innerHTML = roundType === 'gd' ? '<i data-lucide="check" class="w-3 h-3"></i><span>Save GD</span>' : '<i data-lucide="check" class="w-3 h-3"></i><span>Save F2F</span>';
        if (window.lucide) window.lucide.createIcons();
      }, 2000);
    }

    // Refresh row UI and badges
    updateRowAfterSave(resultId, data.hrAssessment);

  } catch (err) {
    console.error("Save single round error:", err);
    alert("Connection error while saving mark.");
    if (btn) { btn.disabled = false; btn.innerHTML = origHtml; if (window.lucide) window.lucide.createIcons(); }
  }
}

// SAVE BOTH ROUNDS OR WHATEVER IS ENTERED
async function saveCandidateHrScore(resultId) {
  const gdInput = document.getElementById(`hr_gd_${resultId}`);
  const intInput = document.getElementById(`hr_int_${resultId}`);
  const remInput = document.getElementById(`hr_rem_${resultId}`);
  const btn = document.getElementById(`hr_btn_${resultId}`);

  const gdRaw = gdInput ? gdInput.value.trim() : '';
  const intRaw = intInput ? intInput.value.trim() : '';
  const remarks = remInput ? remInput.value.trim() : '';

  if (gdRaw === '' && intRaw === '' && remarks === '') {
    alert("Please enter at least a GD score, Interview score, or Remarks.");
    return;
  }

  const payload = { resultId, remarks };
  if (gdRaw !== '') {
    const gVal = Math.max(0, Math.min(25, parseInt(gdRaw, 10) || 0));
    gdInput.value = gVal;
    payload.gdScore = gVal;
  }
  if (intRaw !== '') {
    const iVal = Math.max(0, Math.min(25, parseInt(intRaw, 10) || 0));
    intInput.value = iVal;
    payload.interviewScore = iVal;
  }

  const originalBtnHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin"></i><span>Saving...</span>`;
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const res = await fetch('/api/admin/hr-score', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) {
      alert("Error saving HR marks: " + (data.message || "Failed"));
      if (btn) { btn.disabled = false; btn.innerHTML = originalBtnHtml; if (window.lucide) window.lucide.createIcons(); }
      return;
    }

    updateCachedCandidateHr(resultId, data.hrAssessment);
    updateRowAfterSave(resultId, data.hrAssessment);

    if (btn) {
      btn.disabled = false;
      btn.className = "px-3 py-1.5 rounded-xl bg-slate-900 text-emerald-400 font-bold text-xs shadow-sm transition flex items-center space-x-1 cursor-pointer ml-auto";
      btn.innerHTML = `<i data-lucide="check-check" class="w-3.5 h-3.5 text-emerald-400"></i><span>Saved!</span>`;
      if (window.lucide) window.lucide.createIcons();

      setTimeout(() => {
        btn.className = "px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1 cursor-pointer ml-auto";
        btn.innerHTML = `<i data-lucide="save" class="w-3.5 h-3.5 text-emerald-400"></i><span>${data.hrAssessment.isCompleted ? 'Save All' : 'Save Marks'}</span>`;
        if (window.lucide) window.lucide.createIcons();
      }, 2000);
    }

  } catch (err) {
    console.error("Save HR score error:", err);
    alert("Connection error while saving HR marks.");
    if (btn) { btn.disabled = false; btn.innerHTML = originalBtnHtml; if (window.lucide) window.lucide.createIcons(); }
  }
}

function updateCachedCandidateHr(resultId, hrAssessment) {
  const targetItem = cachedLeaderboard.find(i => i.id === resultId);
  if (!targetItem) return;

  targetItem.gdScore = hrAssessment.gdScore;
  targetItem.interviewScore = hrAssessment.interviewScore;
  targetItem.hrTotal = hrAssessment.hrTotal;
  targetItem.grandTotal = hrAssessment.grandTotal;
  targetItem.grandPercentage = hrAssessment.grandPercentage;
  targetItem.hrRemarks = hrAssessment.remarks;
  targetItem.hrStatus = hrAssessment.status;
}

function updateRowAfterSave(resultId, hrAssessment) {
  const targetItem = cachedLeaderboard.find(i => i.id === resultId);
  if (!targetItem) return;

  const hasGd = hrAssessment.gdScore !== null && hrAssessment.gdScore !== undefined;
  const hasInt = hrAssessment.interviewScore !== null && hrAssessment.interviewScore !== undefined;
  const isBothDone = hasGd && hasInt;

  // Update HR Total span
  const hrTotElem = document.getElementById(`hr_hrtot_${resultId}`);
  if (hrTotElem) {
    hrTotElem.innerText = isBothDone ? `${hrAssessment.hrTotal} / 50` : (hasGd ? `${hrAssessment.gdScore} (GD)` : (hasInt ? `${hrAssessment.interviewScore} (F2F)` : '-'));
  }

  // Update Grand Total span
  const grandElem = document.getElementById(`hr_grand_${resultId}`);
  if (grandElem) {
    grandElem.innerText = isBothDone ? `${hrAssessment.grandTotal} / 100` : `${targetItem.score} / 50`;
  }

  // Update Grand % span
  const pctElem = document.getElementById(`hr_pct_${resultId}`);
  if (pctElem) {
    pctElem.innerText = isBothDone ? `${hrAssessment.grandPercentage}%` : `${targetItem.percentage}%`;
  }

  // Update badge
  const badgeCol = document.getElementById(`hr_badge_col_${resultId}`);
  if (badgeCol) {
    if (isBothDone) {
      badgeCol.innerHTML = '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✅ Grand /100</span>';
    } else if (hasGd) {
      badgeCol.innerHTML = '<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">🟡 GD Saved • F2F Pending</span>';
    } else if (hasInt) {
      badgeCol.innerHTML = '<span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">🟡 F2F Saved • GD Pending</span>';
    } else {
      badgeCol.innerHTML = '<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">⏳ Pending Both</span>';
    }
  }

  // Refresh counters
  const hrCompleted = cachedLeaderboard.filter(item => item.hrStatus === 'completed').length;
  const hrPartial = cachedLeaderboard.filter(item => item.hrStatus === 'gd_completed' || item.hrStatus === 'interview_completed').length;
  const hrPending = cachedLeaderboard.length - hrCompleted - hrPartial;

  const statCompleted = document.getElementById('hrStatCompleted');
  if (statCompleted) statCompleted.innerText = hrCompleted;
  const statPartial = document.getElementById('hrStatPartial');
  if (statPartial) statPartial.innerText = hrPartial;
  const statPending = document.getElementById('hrStatPending');
  if (statPending) statPending.innerText = hrPending;

  const badge = document.getElementById('hrBadgePending');
  if (badge) {
    const active = hrPending + hrPartial;
    if (active > 0) {
      badge.innerText = active;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // Also update leaderboard rows so they stay in sync
  renderLeaderboardRows(cachedLeaderboard);
}

// -------------------------------------------------------------
// HR EVALUATION MODAL (ACCESSIBLE FROM LEADERBOARD TABLE)
// -------------------------------------------------------------

function openHrModal(resultId) {
  const item = cachedLeaderboard.find(i => i.id === resultId);
  if (!item) {
    alert("Candidate not found.");
    return;
  }

  document.getElementById('modalHrResultId').value = item.id;
  document.getElementById('modalHrCandidateName').innerText = item.studentName;
  document.getElementById('modalHrCenter').innerText = `Center: ${item.batch || 'Sivakasi'}`;
  document.getElementById('modalHrQuizScore').innerText = item.score;
  document.getElementById('modalHrQuizSplit').innerText = `R1: ${item.round1Score}/20 &bull; R2: ${item.round2Score}/30`;

  document.getElementById('modalHrGdInput').value = (item.gdScore !== null && item.gdScore !== undefined) ? item.gdScore : '';
  document.getElementById('modalHrInterviewInput').value = (item.interviewScore !== null && item.interviewScore !== undefined) ? item.interviewScore : '';
  document.getElementById('modalHrRemarksInput').value = item.hrRemarks || '';

  calcModalLiveTotal();

  document.getElementById('hrScoreModal').classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
}

function closeHrModal() {
  document.getElementById('hrScoreModal').classList.add('hidden');
}

function calcModalLiveTotal() {
  const quizScore = parseInt(document.getElementById('modalHrQuizScore').innerText, 10) || 0;
  const gdInput = document.getElementById('modalHrGdInput');
  const intInput = document.getElementById('modalHrInterviewInput');
  const previewBox = document.getElementById('modalScorePreviewBox');
  const hint = document.getElementById('modalEvaluationHint');
  const mainBtnText = document.getElementById('modalMainSaveBtnText');

  const gdRaw = gdInput?.value.trim();
  const intRaw = intInput?.value.trim();

  let gd = gdRaw !== '' ? parseInt(gdRaw, 10) : null;
  let f2f = intRaw !== '' ? parseInt(intRaw, 10) : null;

  if (gd !== null && (isNaN(gd) || gd < 0)) gd = 0;
  if (gd !== null && gd > 25) { gd = 25; gdInput.value = 25; }

  if (f2f !== null && (isNaN(f2f) || f2f < 0)) f2f = 0;
  if (f2f !== null && f2f > 25) { f2f = 25; intInput.value = 25; }

  const liveHrElem = document.getElementById('modalLiveHrTotal');
  const liveGrandElem = document.getElementById('modalLiveGrandTotal');
  const liveGrandPctElem = document.getElementById('modalLiveGrandPct');

  if (gd !== null && f2f !== null) {
    const hrTotal = gd + f2f;
    const grandTotal = quizScore + hrTotal;
    const grandPct = ((grandTotal / 100) * 100).toFixed(1);

    liveHrElem.innerText = `${hrTotal}`;
    liveGrandElem.innerText = `${grandTotal} / 100`;
    liveGrandPctElem.innerText = `(${grandPct}%)`;

    if (previewBox) {
      previewBox.className = "p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between";
    }
    if (hint) {
      hint.innerText = `🎉 All 4 rounds complete! Quiz (${quizScore}) + GD (${gd}) + F2F (${f2f}) = ${grandTotal}/100.`;
      hint.className = "text-[11px] font-bold text-emerald-800 bg-emerald-100 p-2.5 rounded-xl text-center";
    }
    if (mainBtnText) mainBtnText.innerText = "Save & Finalize All 4 Marks (/100)";
  } else if (gd !== null) {
    liveHrElem.innerText = `${gd} (GD Only)`;
    liveGrandElem.innerText = `Quiz + GD: ${quizScore + gd}/75`;
    liveGrandPctElem.innerText = "(Interview Pending)";

    if (previewBox) {
      previewBox.className = "p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between";
    }
    if (hint) {
      hint.innerText = `🟡 Round 3 GD mark (${gd}/25) entered. Round 4 Interview is pending.`;
      hint.className = "text-[11px] font-bold text-amber-800 bg-amber-100 p-2.5 rounded-xl text-center";
    }
    if (mainBtnText) mainBtnText.innerText = "Save GD Mark (Awaiting F2F)";
  } else if (f2f !== null) {
    liveHrElem.innerText = `${f2f} (F2F Only)`;
    liveGrandElem.innerText = `Quiz + F2F: ${quizScore + f2f}/75`;
    liveGrandPctElem.innerText = "(GD Pending)";

    if (previewBox) {
      previewBox.className = "p-3.5 rounded-2xl bg-purple-50 border border-purple-300 flex items-center justify-between";
    }
    if (hint) {
      hint.innerText = `🟡 Round 4 F2F Interview mark (${f2f}/25) entered. Round 3 GD is pending.`;
      hint.className = "text-[11px] font-bold text-purple-800 bg-purple-100 p-2.5 rounded-xl text-center";
    }
    if (mainBtnText) mainBtnText.innerText = "Save F2F Mark (Awaiting GD)";
  } else {
    liveHrElem.innerText = "--";
    liveGrandElem.innerText = `${quizScore} / 50`;
    liveGrandPctElem.innerText = "(Quiz Only)";

    if (previewBox) {
      previewBox.className = "p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between";
    }
    if (hint) {
      hint.innerText = "Enter one or both marks. Saving both calculates all 4 marks into Grand Total (/100).";
      hint.className = "text-[11px] font-medium text-slate-500 bg-slate-100 p-2.5 rounded-xl text-center";
    }
    if (mainBtnText) mainBtnText.innerText = "Save HR Marks";
  }
}

// MODAL: SAVE SINGLE ROUND
async function saveModalSingleRound(roundType) {
  const resultId = document.getElementById('modalHrResultId').value;
  const remarks = document.getElementById('modalHrRemarksInput').value.trim();
  const payload = { resultId, remarks };

  if (roundType === 'gd') {
    const gdRaw = document.getElementById('modalHrGdInput').value.trim();
    if (gdRaw === '' || isNaN(parseInt(gdRaw, 10))) {
      alert("Please enter a valid Group Discussion mark (0 - 25).");
      document.getElementById('modalHrGdInput').focus();
      return;
    }
    payload.gdScore = Math.max(0, Math.min(25, parseInt(gdRaw, 10)));
  } else if (roundType === 'interview') {
    const intRaw = document.getElementById('modalHrInterviewInput').value.trim();
    if (intRaw === '' || isNaN(parseInt(intRaw, 10))) {
      alert("Please enter a valid Face-to-Face Interview mark (0 - 25).");
      document.getElementById('modalHrInterviewInput').focus();
      return;
    }
    payload.interviewScore = Math.max(0, Math.min(25, parseInt(intRaw, 10)));
  }

  const btn = document.getElementById(roundType === 'gd' ? 'btnModalSaveGd' : 'btnModalSaveInterview');
  const origHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="w-3.5 h-3.5 animate-spin mr-1"></i> Saving...';
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const res = await fetch('/api/admin/hr-score', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) {
      alert("Error: " + (data.message || "Failed saving"));
      return;
    }

    updateCachedCandidateHr(resultId, data.hrAssessment);
    updateRowAfterSave(resultId, data.hrAssessment);

    alert(data.message || "Score recorded successfully!");
    closeHrModal();

  } catch (err) {
    console.error("Modal single save error:", err);
    alert("Connection error while saving mark.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

// MODAL: MAIN SAVE BUTTON
async function handleSaveModalHrScore() {
  const resultId = document.getElementById('modalHrResultId').value;
  const gdRaw = document.getElementById('modalHrGdInput').value.trim();
  const intRaw = document.getElementById('modalHrInterviewInput').value.trim();
  const remarks = document.getElementById('modalHrRemarksInput').value.trim();
  const btn = document.getElementById('modalHrSaveBtn');

  if (gdRaw === '' && intRaw === '' && remarks === '') {
    alert("Please enter at least a GD score, Interview score, or Remarks.");
    return;
  }

  const payload = { resultId, remarks };
  if (gdRaw !== '') {
    payload.gdScore = Math.max(0, Math.min(25, parseInt(gdRaw, 10) || 0));
  }
  if (intRaw !== '') {
    payload.interviewScore = Math.max(0, Math.min(25, parseInt(intRaw, 10) || 0));
  }

  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin mr-1"></i> Saving...`;
  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await fetch('/api/admin/hr-score', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!data.success) {
      alert("Error saving HR marks: " + (data.message || "Failed"));
      return;
    }

    updateCachedCandidateHr(resultId, data.hrAssessment);
    updateRowAfterSave(resultId, data.hrAssessment);

    closeHrModal();
    alert(data.message || "HR marks saved successfully!");

  } catch (err) {
    console.error("Modal save HR error:", err);
    alert("Connection error while saving HR marks.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="check-check" class="w-4 h-4"></i><span id="modalMainSaveBtnText">Save &amp; Finalize All 4 Marks (/100)</span>`;
    if (window.lucide) window.lucide.createIcons();
  }
}
