// Result & Solutions Script (Combined 50 Questions)
let currentResult = null;
let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const resultId = urlParams.get('id');

  if (resultId) {
    try {
      const res = await fetch(`/api/result/${resultId}`);
      const data = await res.json();
      if (data.success && data.result) {
        currentResult = data.result;
        // Safely cache in localStorage so refresh / closed tab never loses it
        try {
          localStorage.setItem('wegrow_result_' + resultId, JSON.stringify(data.result));
          localStorage.setItem('wegrow_latest_result_id', resultId);
        } catch (e) {}
      }
    } catch (e) {
      console.warn("Failed fetching result by ID, checking local cache", e);
    }
  }

  // Fallback 1: LocalStorage for this specific resultId
  if (!currentResult && resultId) {
    const localSaved = localStorage.getItem('wegrow_result_' + resultId);
    if (localSaved) {
      try {
        currentResult = JSON.parse(localSaved);
      } catch (e) {}
    }
  }

  // Fallback 2: sessionStorage lastResult
  if (!currentResult) {
    const cached = sessionStorage.getItem('lastResult');
    if (cached) {
      try {
        currentResult = JSON.parse(cached);
      } catch (e) {}
    }
  }

  // Fallback 3: Most recent cached result in localStorage
  if (!currentResult) {
    const latestId = localStorage.getItem('wegrow_latest_result_id');
    if (latestId) {
      const latestCached = localStorage.getItem('wegrow_result_' + latestId);
      if (latestCached) {
        try {
          currentResult = JSON.parse(latestCached);
        } catch (e) {}
      }
    }
  }

  if (!currentResult) {
    alert("Result not found. Returning to Home.");
    window.location.href = 'index.html';
    return;
  }

  renderResultSummary(currentResult);
  renderSolutions(currentResult.reviewList || []);

  if (window.lucide) window.lucide.createIcons();
});

function renderResultSummary(res) {
  document.getElementById('resStudentName').innerText = res.studentName || "Candidate";
  document.getElementById('resScore').innerText = res.score;
  document.getElementById('resPercentage').innerText = `${res.percentage}%`;
  document.getElementById('resTimeTaken').innerText = res.timeTakenFormatted || "N/A";
  document.getElementById('resViolations').innerText = res.warningsCount || 0;
  
  const submitDate = res.submittedAt ? new Date(res.submittedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : "Recent";
  document.getElementById('resDate').innerText = submitDate;

  // Round 1 and Round 2 Splits
  const r1Score = res.round1Score !== undefined ? res.round1Score : 0;
  const r2Score = res.round2Score !== undefined ? res.round2Score : 0;
  const r1Pct = ((r1Score / 20) * 100).toFixed(1);
  const r2Pct = ((r2Score / 30) * 100).toFixed(1);

  document.getElementById('resR1Score').innerText = r1Score;
  document.getElementById('resR1Pct').innerText = `${r1Pct}%`;
  document.getElementById('resR2Score').innerText = r2Score;
  document.getElementById('resR2Pct').innerText = `${r2Pct}%`;

  // Selected topics summary
  const topicMap = {
    html: "HTML5",
    css: "CSS3",
    bootstrap: "Bootstrap 5",
    javascript: "JavaScript",
    python: "Python",
    react: "React",
    data_science: "Data Science (Python, NumPy, Pandas)",
    data_analytics: "Data Analytics"
  };
  const topics = (res.selectedTopics || []).map(t => topicMap[t] || t);
  const summaryElem = document.getElementById('resSelectedTopicsSummary');
  if (summaryElem) {
    summaryElem.innerText = topics.length > 0 ? topics.join(', ') : "Technical Stream";
  }

  // Quick stats
  const totalCorrect = res.correctCount !== undefined ? res.correctCount : (r1Score + r2Score);
  const totalIncorrect = res.incorrectCount !== undefined ? res.incorrectCount : (50 - totalCorrect);
  const totalUnattempted = res.unattemptedCount !== undefined ? res.unattemptedCount : 0;

  document.getElementById('resCorrectCount').innerText = totalCorrect;
  document.getElementById('resIncorrectCount').innerText = totalIncorrect;
  document.getElementById('resUnattemptedCount').innerText = totalUnattempted;

  // Grade badge
  const badge = document.getElementById('resPerformanceBadge');
  badge.innerText = res.performanceGrade || (res.percentage >= 70 ? "MNC Ready" : "Attempted");

  // Filter Tab Counts
  const total = (res.reviewList || []).length || 50;
  document.getElementById('filter-all').innerText = `All (${total})`;
}

function filterQuestions(type) {
  activeFilter = type;

  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.className = 'filter-tab px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer';
  });
  const activeTab = document.getElementById(`filter-${type}`);
  if (activeTab) {
    activeTab.className = 'filter-tab px-3 py-1.5 rounded-lg bg-white shadow-sm text-blue-700 font-bold cursor-pointer';
  }

  if (currentResult && currentResult.reviewList) {
    renderSolutions(currentResult.reviewList);
  }
}

function renderSolutions(reviewList) {
  const container = document.getElementById('solutionsContainer');
  container.innerHTML = '';

  const optionLabels = ['A', 'B', 'C', 'D'];

  const filtered = reviewList.filter((item, idx) => {
    if (activeFilter === 'r1') return item.round === 1 || idx < 20;
    if (activeFilter === 'r2') return item.round === 2 || idx >= 20;
    if (activeFilter === 'correct') return item.isCorrect;
    if (activeFilter === 'incorrect') return item.isAttempted && !item.isCorrect;
    if (activeFilter === 'unattempted') return !item.isAttempted;
    return true; // 'all'
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
        No questions match the '${activeFilter}' filter.
      </div>
    `;
    return;
  }

  filtered.forEach((q, displayIdx) => {
    const card = document.createElement('div');
    card.className = "bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4";

    const isRound1 = q.round === 1;

    let statusBadge = '';
    if (q.isCorrect) {
      statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><i data-lucide="check" class="w-3.5 h-3.5 mr-1"></i> Correct (+1.0)</span>';
    } else if (q.isAttempted) {
      statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800"><i data-lucide="x" class="w-3.5 h-3.5 mr-1"></i> Incorrect (0.0)</span>';
    } else {
      statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600"><i data-lucide="minus" class="w-3.5 h-3.5 mr-1"></i> Skipped (0.0)</span>';
    }

    let qTextHtml = escapeHtml(q.question);
    let codeHtml = '';
    if (q.question.includes('\n\n') && (q.question.includes(' = ') || q.question.includes('<') || q.question.includes('{'))) {
      const parts = q.question.split('\n\n');
      qTextHtml = escapeHtml(parts[0]);
      codeHtml = `<pre><code class="code-container block">${escapeHtml(parts.slice(1).join('\n\n'))}</code></pre>`;
    }

    let optionsHtml = '';
    q.options.forEach((optText, optIdx) => {
      const isCorrectAnswer = optIdx === q.correctAnswer;
      const isStudentChoice = optIdx === q.studentSelected;

      let borderBg = "border-slate-200 bg-slate-50 text-slate-700";
      let icon = "";

      if (isCorrectAnswer) {
        borderBg = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
        icon = '<span class="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-600 text-white ml-2">Verified Correct Answer</span>';
      } else if (isStudentChoice && !q.isCorrect) {
        borderBg = "border-rose-400 bg-rose-50 text-rose-900 font-medium";
        icon = '<span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-600 text-white ml-2">Your Answer (Wrong)</span>';
      }

      optionsHtml += `
        <div class="p-3 rounded-xl border ${borderBg} text-xs flex items-center justify-between">
          <div class="flex items-center space-x-2.5 flex-1">
            <span class="w-5 h-5 rounded font-bold text-xs flex items-center justify-center flex-shrink-0 ${
              isCorrectAnswer ? 'bg-emerald-600 text-white' : (isStudentChoice ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600')
            }">
              ${optionLabels[optIdx]}
            </span>
            <span class="select-text leading-relaxed">${escapeHtml(optText)}</span>
          </div>
          <div>${icon}</div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div class="flex items-center space-x-2">
          <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold">
            Q${q.questionIndex || (displayIdx + 1)}
          </span>
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isRound1 ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'}">
            ${isRound1 ? 'Round 1: Aptitude' : 'Round 2: Technical'}
          </span>
          <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
            ${escapeHtml(q.topic || q.category || 'General')}
          </span>
        </div>
        <div>
          ${statusBadge}
        </div>
      </div>

      <div class="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed whitespace-pre-wrap select-text">
        ${qTextHtml}
      </div>
      ${codeHtml}

      <div class="space-y-2 pt-2">
        ${optionsHtml}
      </div>

      <div class="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs space-y-1">
        <div class="font-bold text-blue-900 flex items-center">
          <i data-lucide="info" class="w-3.5 h-3.5 mr-1 text-blue-600"></i> Explanation:
        </div>
        <p class="text-[11px] text-blue-800 leading-relaxed select-text">
          ${escapeHtml(q.explanation || 'Verified correct answer by examination instructor.')}
        </p>
      </div>
    `;

    container.appendChild(card);
  });

  if (window.lucide) window.lucide.createIcons();
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
