// Admin Dashboard Script for Deepak Kumar (deepakkumars170404@gmail.com)
const ADMIN_EMAIL = "deepakkumars170404@gmail.com";
let currentAdminPin = null;
let cachedLeaderboard = [];

document.addEventListener('DOMContentLoaded', () => {
  const savedPin = sessionStorage.getItem('adminPin');
  const savedEmail = sessionStorage.getItem('adminEmail');

  if (savedEmail === ADMIN_EMAIL && savedPin) {
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
    'x-admin-email': ADMIN_EMAIL,
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
  document.getElementById('exportCsvBtn').href = `/api/admin/export-csv?adminEmail=${encodeURIComponent(ADMIN_EMAIL)}&adminPin=${encodeURIComponent(currentAdminPin)}`;

  loadLeaderboard();
  loadLiveSessions();
  loadMasterQuestions();

  if (window.lucide) window.lucide.createIcons();
}

function handleAdminLogout() {
  sessionStorage.removeItem('adminEmail');
  sessionStorage.removeItem('adminPin');
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

    // Render Podium
    renderPodium(cachedLeaderboard);

    // Render Table
    renderLeaderboardRows(cachedLeaderboard);

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
        <td colspan="11" class="p-8 text-center text-slate-400">
          No assessment submissions found. Real-time candidate submissions will appear here.
        </td>
      </tr>
    `;
    return;
  }

  const topicDisplayMap = {
    html: "HTML",
    css: "CSS",
    bootstrap: "Bootstrap",
    javascript: "JS",
    python: "Python",
    react: "React",
    data_analytics: "DA"
  };

  list.forEach((item) => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50/80 transition-colors";

    // Rank Medal/Badge
    let rankBadge = `<span class="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-600 font-bold inline-flex items-center justify-center text-xs">#${item.rank}</span>`;
    if (item.rank === 1) rankBadge = `<span class="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black inline-flex items-center justify-center text-xs shadow-sm">1</span>`;
    else if (item.rank === 2) rankBadge = `<span class="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-bold inline-flex items-center justify-center text-xs shadow-sm">2</span>`;
    else if (item.rank === 3) rankBadge = `<span class="w-6 h-6 rounded-full bg-orange-300 text-orange-950 font-bold inline-flex items-center justify-center text-xs shadow-sm">3</span>`;

    // Percentage color
    let percentColor = "text-slate-800";
    if (item.percentage >= 80) percentColor = "text-emerald-600 font-bold";
    else if (item.percentage >= 60) percentColor = "text-blue-600 font-bold";
    else percentColor = "text-amber-600 font-medium";

    // Strikes badge
    let strikesHtml = `<span class="text-slate-400 font-normal">0</span>`;
    if (item.warningsCount > 0) {
      strikesHtml = `<span class="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">${item.warningsCount} Strikes</span>`;
    }

    // Topics pills
    const topics = (item.selectedTopics || []).map(t => topicDisplayMap[t] || t);
    const topicsHtml = topics.length > 0 
      ? topics.map(t => `<span class="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">${t}</span>`).join(' ')
      : '<span class="text-slate-400 text-[11px]">-</span>';

    const dateStr = item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'Recent';

    tr.innerHTML = `
      <td class="py-3.5 px-4 font-bold">${rankBadge}</td>
      <td class="py-3.5 px-4">
        <div class="font-bold text-slate-900 text-xs sm:text-sm">${escapeHtml(item.studentName)}</div>
        <div class="text-[10px] text-slate-400">${item.batch || 'General'}</div>
      </td>
      <td class="py-3.5 px-4 text-center font-bold text-blue-800">
        ${item.round1Score} / ${item.round1Total || 20}
      </td>
      <td class="py-3.5 px-4 text-center font-bold text-indigo-800">
        ${item.round2Score} / ${item.round2Total || 30}
      </td>
      <td class="py-3.5 px-4 text-center font-black text-slate-900 text-sm">
        ${item.score} / ${item.totalQuestions || 50}
      </td>
      <td class="py-3.5 px-4 text-center ${percentColor}">
        ${item.percentage}%
      </td>
      <td class="py-3.5 px-4">
        <div class="flex flex-wrap gap-1 max-w-[180px]">${topicsHtml}</div>
      </td>
      <td class="py-3.5 px-4 text-center">
        ${strikesHtml}
      </td>
      <td class="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px]">
        ${item.timeTakenFormatted || '-'}
      </td>
      <td class="py-3.5 px-4 text-slate-500 text-[11px]">
        ${dateStr}
      </td>
      <td class="py-3.5 px-4 text-right">
        <div class="flex items-center justify-end space-x-1.5">
          <button 
            onclick="quickAllowReexam('${escapeHtml(item.studentName)}')"
            class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[11px] font-bold border border-blue-200 transition cursor-pointer"
            title="Unlock Re-Exam for student"
          >
            Allow Re-exam
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
  const query = document.getElementById('searchStudentInput').value.trim().toLowerCase();
  if (!query) {
    renderLeaderboardRows(cachedLeaderboard);
    return;
  }

  const filtered = cachedLeaderboard.filter(item => 
    item.studentName.toLowerCase().includes(query) ||
    (item.batch && item.batch.toLowerCase().includes(query))
  );

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
