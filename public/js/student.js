// Student Registration & Exam Launch
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
});

async function handleStartExam(e) {
  e.preventDefault();

  const studentNameInput = document.getElementById('studentName');
  const studentBatchInput = document.getElementById('studentBatch');
  const startBtn = document.getElementById('startBtn');

  if (!studentNameInput || !studentNameInput.value.trim()) {
    alert("Please enter your Full Name. Name is compulsory for identification.");
    if (studentNameInput) studentNameInput.focus();
    return;
  }

  const studentName = studentNameInput.value.trim();
  const batch = studentBatchInput ? studentBatchInput.value.trim() : '';

  if (!batch) {
    alert("Please select your Branch / Center (Sivakasi or Srivilliputhur). Branch selection is compulsory.");
    if (studentBatchInput) studentBatchInput.focus();
    return;
  }

  startBtn.disabled = true;
  startBtn.innerHTML = `
    <i data-lucide="loader-2" class="w-4 h-4 animate-spin mr-2"></i> Initializing Round 1 & Sampling 20 Aptitude Questions...
  `;
  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await fetch('/api/exam/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName, batch })
    });

    const data = await res.json();

    if (!data.success) {
      if (data.isCompleted) {
        if (confirm(`${data.message}\n\nWould you like to view your submitted score and review now?`)) {
          window.location.href = `result.html?id=${data.resultId}`;
          return;
        }
      } else {
        alert(`❌ Cannot Start Exam:\n\n${data.message}`);
      }
      startBtn.disabled = false;
      startBtn.innerHTML = `<span>Launch Round 1: MNC Aptitude (Full Screen)</span><i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>`;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    // Save session in sessionStorage
    sessionStorage.setItem('currentSessionId', data.sessionId);
    sessionStorage.setItem('studentName', data.studentName);
    sessionStorage.setItem('studentBatch', batch);
    sessionStorage.setItem('currentRound', '1');
    sessionStorage.setItem('roundTitle', data.roundTitle);
    sessionStorage.setItem('totalQuestions', data.totalQuestions);
    sessionStorage.setItem('durationMinutes', data.durationMinutes);
    sessionStorage.setItem('examQuestions', JSON.stringify(data.questions));

    // Request full-screen immediately on this click user gesture
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (fsErr) {
      console.warn("Fullscreen auto-trigger on click:", fsErr);
    }

    // Navigate to exam page
    window.location.href = 'exam.html';
  } catch (err) {
    console.error('Error starting exam:', err);
    alert("Connection error communicating with examination server. Please verify backend is running.");
    startBtn.disabled = false;
    startBtn.innerHTML = `<span>Launch Round 1: MNC Aptitude (Full Screen)</span><i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }
}
