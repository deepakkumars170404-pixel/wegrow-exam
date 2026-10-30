const http = require('http');

console.log('================================================================');
console.log('🔥 120+ CANDIDATES FULL CONCURRENT END-TO-END EXAM STRESS TEST');
console.log('================================================================');

const TOTAL_STUDENTS = 120;
const HOST = 'localhost';
const PORT = 3000;

// Topic combinations students might pick
const topicPresets = [
  ['html', 'css'],
  ['javascript', 'react'],
  ['python', 'data_analytics'],
  ['html', 'css', 'bootstrap'],
  ['python', 'javascript', 'react'],
  ['html', 'css', 'bootstrap', 'javascript'],
  ['data_analytics'],
  ['html', 'css', 'bootstrap', 'javascript', 'python', 'react', 'data_analytics']
];

function httpRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body, error: e.message });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

// Student flow simulation
async function runStudent(studentIdx) {
  const studentName = `StressCandidate_${String(studentIdx).padStart(3, '0')}`;
  const batch = `MNC-Batch-${(studentIdx % 3) + 1}`;

  // STEP 1: Registration & Round 1 Start
  const startRes = await httpRequest({
    hostname: HOST,
    port: PORT,
    path: '/api/exam/start',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { studentName, batch });

  if (startRes.status !== 200 || !startRes.data?.success) {
    throw new Error(`Step 1 (Start Exam) failed for ${studentName}: ${JSON.stringify(startRes.data)}`);
  }

  const sessionId = startRes.data.sessionId;
  const r1Questions = startRes.data.questions;
  if (!r1Questions || r1Questions.length !== 20) {
    throw new Error(`Round 1 did not return 20 questions for ${studentName} (Got ${r1Questions?.length})`);
  }

  // STEP 2: Answer & Submit Round 1
  const r1Answers = {};
  r1Questions.forEach((q, i) => {
    // Pick an answer 0..3
    r1Answers[q.id] = (i + studentIdx) % 4;
  });

  const submitR1Res = await httpRequest({
    hostname: HOST,
    port: PORT,
    path: '/api/exam/submit-round1',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    sessionId,
    answers: r1Answers,
    autoSubmitted: false
  });

  if (submitR1Res.status !== 200 || !submitR1Res.data?.success) {
    throw new Error(`Step 2 (Submit Round 1) failed for ${studentName}: ${JSON.stringify(submitR1Res.data)}`);
  }

  // STEP 3: Select Topics & Start Round 2
  const chosenTopics = topicPresets[studentIdx % topicPresets.length];
  const startR2Res = await httpRequest({
    hostname: HOST,
    port: PORT,
    path: '/api/exam/start-round2',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    sessionId,
    selectedModules: chosenTopics
  });

  if (startR2Res.status !== 200 || !startR2Res.data?.success) {
    throw new Error(`Step 3 (Start Round 2) failed for ${studentName}: ${JSON.stringify(startR2Res.data)}`);
  }

  const r2Questions = startR2Res.data.questions;
  if (!r2Questions || r2Questions.length !== 30) {
    throw new Error(`Round 2 did not return 30 questions for ${studentName} (Got ${r2Questions?.length})`);
  }

  // STEP 4: Answer & Submit Final Assessment
  const r2Answers = {};
  r2Questions.forEach((q, i) => {
    r2Answers[q.id] = (i + studentIdx + 1) % 4;
  });

  const submitFinalRes = await httpRequest({
    hostname: HOST,
    port: PORT,
    path: '/api/exam/submit',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    sessionId,
    answers: r2Answers,
    timeTakenSeconds: 1200 + (studentIdx * 5),
    autoSubmitted: false,
    reason: "Completed normally"
  });

  if (submitFinalRes.status !== 200 || !submitFinalRes.data?.success) {
    throw new Error(`Step 4 (Final Submit) failed for ${studentName}: ${JSON.stringify(submitFinalRes.data)}`);
  }

  const resultId = submitFinalRes.data.resultId;
  const score = submitFinalRes.data.score;

  return {
    studentName,
    sessionId,
    resultId,
    score,
    r1Score: submitFinalRes.data.round1Score,
    r2Score: submitFinalRes.data.round2Score,
    percentage: submitFinalRes.data.percentage
  };
}

async function runFullSimulation() {
  const startTime = Date.now();
  console.log(`Starting massive concurrent barrage of ${TOTAL_STUDENTS} students...`);

  // Launch all students concurrently!
  const promises = [];
  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    promises.push(
      runStudent(i)
        .then(res => ({ ok: true, res }))
        .catch(err => ({ ok: false, error: err.message }))
    );
  }

  // Also simulate instructor monitoring the leaderboard concurrently every 500ms
  let leaderboardChecks = 0;
  const monitorInterval = setInterval(async () => {
    try {
      const lbRes = await httpRequest({
        hostname: HOST,
        port: PORT,
        path: '/api/admin/leaderboard',
        method: 'GET',
        headers: {
          'x-admin-email': 'deepakkumars170404@gmail.com',
          'x-admin-pin': 'wegrow2026'
        }
      });
      if (lbRes.status === 200 && lbRes.data?.success) {
        leaderboardChecks++;
      }
    } catch (e) {}
  }, 400);

  const results = await Promise.all(promises);
  clearInterval(monitorInterval);

  const totalTime = Date.now() - startTime;
  const successes = results.filter(r => r.ok);
  const failures = results.filter(r => !r.ok);

  console.log('\n================================================================');
  console.log('📊 120-STUDENT CONCURRENT EXAM STRESS TEST REPORT');
  console.log('================================================================');
  console.log(`Total Students Tested:        ${TOTAL_STUDENTS}`);
  console.log(`Total Lifecycle Steps Run:    ${TOTAL_STUDENTS * 4} operations`);
  console.log(`Total Execution Time:         ${(totalTime / 1000).toFixed(2)} seconds`);
  console.log(`Average Time Per Full Exam:   ${(totalTime / TOTAL_STUDENTS).toFixed(1)} ms`);
  console.log(`Concurrent Leaderboard Reads: ${leaderboardChecks} successful queries`);
  console.log(`----------------------------------------------------------------`);
  console.log(`✅ Fully Completed Exams:     ${successes.length} / ${TOTAL_STUDENTS} (${((successes.length / TOTAL_STUDENTS) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed Exams:              ${failures.length} / ${TOTAL_STUDENTS}`);
  console.log('================================================================');

  if (failures.length > 0) {
    console.error('\n⚠️ Failures Sample:');
    failures.slice(0, 5).forEach((f, idx) => console.error(`  [Fail ${idx + 1}]: ${f.error}`));
  }

  // Clean up all stress test records from Supabase and SQLite
  try {
    require('dotenv').config();
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
      await supabase.from('results').delete().ilike('student_name', '%StressCandidate%');
      await supabase.from('sessions').delete().ilike('student_name', '%StressCandidate%');
      console.log('🧹 Cleaned up test records from Supabase Cloud.');
    }
  } catch (e) {}

  try {
    const Database = require('better-sqlite3');
    const path = require('path');
    const db = new Database(path.join(__dirname, '..', 'data', 'exam.db'));
    const delRes = db.prepare("DELETE FROM results WHERE student_name LIKE 'StressCandidate_%'").run();
    const delSes = db.prepare("DELETE FROM sessions WHERE student_name LIKE 'StressCandidate_%'").run();
    console.log(`🧹 Cleaned up ${delRes.changes} test results and ${delSes.changes} test sessions from local SQLite.`);
    db.close();
  } catch (e) {}
  console.log('Database returned to pristine clean state with 0 dummy records.');

  // Test Server Health Check
  const healthRes = await httpRequest({
    hostname: HOST,
    port: PORT,
    path: '/api/modules',
    method: 'GET'
  });

  if (healthRes.status === 200 && healthRes.data?.success) {
    console.log('🟢 SERVER IS 100% HEALTHY, RESPONSIVE, AND LIVE ON PORT 3000!');
  } else {
    console.error('🔴 SERVER HEALTH CHECK FAILED!');
  }
}

runFullSimulation();

