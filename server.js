console.log('=======================================================');
console.log('🚀 WEGROW Examination Platform Booting...');
console.log('Node Version:', process.version, '| Platform:', process.platform, '| Arch:', process.arch);
console.log('=======================================================');

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Fisher-Yates array shuffle utility
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// -------------------------------------------------------------
// PUBLIC APIS FOR STUDENTS
// -------------------------------------------------------------

// 1. Get available exam modules from Database
app.get('/api/modules', (req, res) => {
  try {
    const modules = db.prepare(`
      SELECT m.id, m.name, m.round, m.subtitle, 
             COUNT(q.id) as totalQuestions, 
             m.duration_minutes as durationMinutes, 
             m.badge_color as badgeColor 
      FROM modules m
      LEFT JOIN questions q ON m.id = q.module_id
      GROUP BY m.id
      ORDER BY m.rowid ASC
    `).all();

    res.json({ success: true, modules });
  } catch (err) {
    console.error('Error fetching modules:', err);
    res.status(500).json({ success: false, message: "Database query failed." });
  }
});

// 2. Check Candidate Eligibility / Status
app.get('/api/student/eligibility', (req, res) => {
  const studentName = req.query.name;
  if (!studentName || !studentName.trim()) {
    return res.json({ success: true, hasCompleted: false });
  }

  const cleanName = studentName.trim();
  const priorResult = db.prepare(`
    SELECT id, score, total_questions, percentage, submitted_at, round1_score, round2_score 
    FROM results 
    WHERE LOWER(student_name) = LOWER(?)
    ORDER BY submitted_at DESC LIMIT 1
  `).get(cleanName);

  res.json({
    success: true,
    studentName: cleanName,
    hasCompleted: Boolean(priorResult),
    priorResult: priorResult || null
  });
});

// 3. Start Exam - ROUND 1: COMPULSORY MNC APTITUDE (20 Questions randomly sampled from 150)
app.post('/api/exam/start', (req, res) => {
  const { studentName, batch } = req.body;

  if (!studentName || !studentName.trim()) {
    return res.status(400).json({ success: false, message: "Student Name is compulsory." });
  }

  const cleanName = studentName.trim();

  // Check if student already completed exam
  const priorCompleted = db.prepare(`
    SELECT id, student_name, score, percentage 
    FROM results 
    WHERE LOWER(student_name) = LOWER(?)
  `).get(cleanName);

  // Check for active re-exam permit granted by instructor Deepak
  const permit = db.prepare(`
    SELECT * FROM reexam_permits 
    WHERE LOWER(student_name) = LOWER(?) AND used = 0
    ORDER BY granted_at DESC LIMIT 1
  `).get(cleanName);

  if (priorCompleted && !permit) {
    return res.status(403).json({
      success: false,
      isCompleted: true,
      resultId: priorCompleted.id,
      message: `Candidate '${cleanName}' has already submitted the examination. If you need to re-attempt due to accidental closure or technical issues, request instructor for Re-exam permission.`
    });
  }

  // Check for locked session
  const lockedSession = db.prepare(`
    SELECT * FROM sessions 
    WHERE LOWER(student_name) = LOWER(?) AND status = 'locked'
  `).get(cleanName);

  if (lockedSession && !permit) {
    return res.status(403).json({
      success: false,
      isLocked: true,
      message: `Your exam attempt was locked due to prohibited tab-switches or window exits. Contact the instructor to unlock your session.`
    });
  }

  // Mark permit as used if active
  if (permit) {
    db.prepare('UPDATE reexam_permits SET used = 1, used_at = ? WHERE id = ?').run(new Date().toISOString(), permit.id);
  }

  // Query all 150 Aptitude questions from Database
  const allAptitude = db.prepare(`
    SELECT id, question_order, category, topic, difficulty, question, options 
    FROM questions 
    WHERE module_id = 'aptitude'
  `).all();

  if (!allAptitude || allAptitude.length === 0) {
    return res.status(500).json({ success: false, message: "No aptitude questions found in database." });
  }

  // RANDOM SAMPLE OF EXACTLY 20 QUESTIONS (10 Basic + 10 Medium)
  const basicPool = allAptitude.filter(q => (q.difficulty || '').toLowerCase() === 'basic');
  const mediumPool = allAptitude.filter(q => (q.difficulty || '').toLowerCase() !== 'basic');

  const shuffledBasic = shuffleArray(basicPool).slice(0, 10);
  const shuffledMedium = shuffleArray(mediumPool).slice(0, 10);

  // Progressive order: Basic (1..10) -> Medium (11..20)
  const selected20Questions = [...shuffledBasic, ...shuffledMedium];

  // Sanitize for client (DO NOT expose correctAnswer or explanation!)
  const sanitizedQuestions = selected20Questions.map((q, idx) => ({
    questionIndex: idx + 1,
    id: q.id,
    category: q.category,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: JSON.parse(q.options)
  }));

  const sessionId = 'SES_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const now = new Date();
  const orderedIds = selected20Questions.map(q => q.id);

  // Clear prior sessions for clean start
  db.prepare('DELETE FROM sessions WHERE LOWER(student_name) = LOWER(?)').run(cleanName);

  // Insert fresh session into database
  db.prepare(`
    INSERT INTO sessions (
      session_id, student_name, batch, module_id, module_name, round_type, 
      round1_score, round1_total, round2_score, round2_total, total_score, total_possible,
      start_time, duration_minutes, status, warnings, violation_logs, question_order
    ) VALUES (
      ?, ?, ?, 'aptitude', 'Round 1: MNC Aptitude Assessment', 'round1',
      0, 20, 0, 30, 0, 50,
      ?, 25, 'active', 0, '[]', ?
    )
  `).run(
    sessionId,
    cleanName,
    batch ? batch.trim() : 'General',
    now.toISOString(),
    JSON.stringify(orderedIds)
  );

  res.json({
    success: true,
    sessionId,
    studentName: cleanName,
    round: 1,
    roundTitle: "Round 1: MNC Aptitude Assessment (Compulsory)",
    subtitle: "Quantitative Aptitude, Logical Reasoning & Verbal Ability",
    totalQuestions: 20,
    durationMinutes: 25,
    questions: sanitizedQuestions
  });
});

// 4. Submit Round 1 (Aptitude) & Prepare for Round 2 Topic Multi-Select
app.post('/api/exam/submit-round1', (req, res) => {
  const { sessionId, answers, autoSubmitted, reason } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID required" });
  }

  const session = db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found." });
  }

  let questionOrderIds = [];
  try {
    questionOrderIds = JSON.parse(session.question_order || '[]');
  } catch (e) {}

  let masterQuestions = [];
  if (questionOrderIds.length > 0) {
    const placeholders = questionOrderIds.map(() => '?').join(',');
    const unordered = db.prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`).all(...questionOrderIds);
    const map = new Map(unordered.map(q => [q.id, q]));
    masterQuestions = questionOrderIds.map(id => map.get(id)).filter(Boolean);
  } else {
    masterQuestions = db.prepare(`SELECT * FROM questions WHERE module_id = 'aptitude' LIMIT 20`).all();
  }

  const studentAnswers = answers || {};
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const round1Review = masterQuestions.map((q, idx) => {
    const selected = studentAnswers[q.id];
    const isAttempted = selected !== undefined && selected !== null && selected !== "";
    const isCorrect = isAttempted && parseInt(selected) === q.correct_answer;

    if (!isAttempted) unattemptedCount++;
    else if (isCorrect) correctCount++;
    else incorrectCount++;

    return {
      round: 1,
      roundName: "Round 1: MNC Aptitude",
      questionIndex: idx + 1,
      id: q.id,
      category: q.category,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      options: JSON.parse(q.options),
      studentSelected: isAttempted ? parseInt(selected) : null,
      correctAnswer: q.correct_answer,
      isCorrect,
      isAttempted,
      explanation: q.explanation
    };
  });

  const round1Score = correctCount;

  // Update session in DB
  db.prepare(`
    UPDATE sessions 
    SET round1_score = ?, status = 'round1_complete', completed_at = ?
    WHERE session_id = ?
  `).run(round1Score, new Date().toISOString(), sessionId);

  // Store intermediate review in a temporary table or attach to session
  db.prepare(`
    UPDATE sessions
    SET violation_logs = ?
    WHERE session_id = ?
  `).run(JSON.stringify({ round1Review, strikes: session.warnings || 0 }), sessionId);

  res.json({
    success: true,
    sessionId,
    studentName: session.student_name,
    round1Score,
    round1Total: 20,
    round1Correct: correctCount,
    round1Incorrect: incorrectCount,
    round1Unattempted: unattemptedCount,
    message: "Round 1 completed successfully! Proceed to Round 2 Topic Selection."
  });
});

// 5. Start Round 2: DYNAMIC TOPIC MULTI-SELECT (30 Questions evenly distributed)
app.post('/api/exam/start-round2', (req, res) => {
  const { sessionId, selectedModules } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID required" });
  }

  const session = db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found." });
  }

  if (!selectedModules || !Array.isArray(selectedModules) || selectedModules.length === 0) {
    return res.status(400).json({ success: false, message: "Please select at least one topic for Round 2." });
  }

  // Allowed Round 2 modules
  const allowed = ['html', 'css', 'bootstrap', 'javascript', 'python', 'react', 'data_analytics'];
  const validModules = selectedModules.filter(m => allowed.includes(m));

  if (validModules.length === 0) {
    return res.status(400).json({ success: false, message: "No valid topics selected." });
  }

  // DYNAMIC 30-QUESTION ALLOCATION FORMULA:
  // K = number of selected topics
  // Base count = floor(30 / K)
  // Remainder = 30 % K
  // First 'remainder' topics get (base + 1) questions, others get base questions.
  // Sum is ALWAYS exactly 30!
  const K = validModules.length;
  const baseCount = Math.floor(30 / K);
  const remainder = 30 % K;

  const topicAllocations = {};
  validModules.forEach((modId, index) => {
    topicAllocations[modId] = baseCount + (index < remainder ? 1 : 0);
  });

  let round2Questions = [];

  validModules.forEach(modId => {
    const needed = topicAllocations[modId];
    const modQuestions = db.prepare(`
      SELECT id, question_order, category, topic, difficulty, question, options 
      FROM questions 
      WHERE module_id = ?
    `).all(modId);

    const basicQ = modQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'basic');
    const mediumQ = modQuestions.filter(q => (q.difficulty || '').toLowerCase() !== 'basic');

    const halfBasic = Math.floor(needed / 2);
    const halfMed = needed - halfBasic;

    const sampleBasic = shuffleArray(basicQ).slice(0, halfBasic);
    const sampleMed = shuffleArray(mediumQ).slice(0, halfMed);

    // If one pool didn't have enough, fill from the other
    let combined = [...sampleBasic, ...sampleMed];
    if (combined.length < needed) {
      const remainingNeeded = needed - combined.length;
      const alreadyIds = new Set(combined.map(q => q.id));
      const rest = modQuestions.filter(q => !alreadyIds.has(q.id));
      combined = [...combined, ...shuffleArray(rest).slice(0, remainingNeeded)];
    }

    round2Questions = [...round2Questions, ...combined];
  });

  // Sort overall Round 2: Basic first, then Medium, with intra-level random shuffle
  const round2Basic = round2Questions.filter(q => (q.difficulty || '').toLowerCase() === 'basic');
  const round2Med = round2Questions.filter(q => (q.difficulty || '').toLowerCase() !== 'basic');
  const finalizedRound2 = [...shuffleArray(round2Basic), ...shuffleArray(round2Med)];

  const sanitizedQuestions = finalizedRound2.map((q, idx) => ({
    questionIndex: idx + 1,
    id: q.id,
    category: q.category,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: JSON.parse(q.options)
  }));

  const orderedIds = finalizedRound2.map(q => q.id);

  // Update session for Round 2
  db.prepare(`
    UPDATE sessions 
    SET round_type = 'round2',
        selected_modules = ?,
        status = 'active',
        duration_minutes = 35,
        start_time = ?,
        question_order = ?
    WHERE session_id = ?
  `).run(
    JSON.stringify(validModules),
    new Date().toISOString(),
    JSON.stringify(orderedIds),
    sessionId
  );

  res.json({
    success: true,
    sessionId,
    studentName: session.student_name,
    round: 2,
    roundTitle: "Round 2: Technical Electives Assessment",
    selectedModules: validModules,
    allocations: topicAllocations,
    totalQuestions: finalizedRound2.length, // Exactly 30!
    durationMinutes: 35,
    questions: sanitizedQuestions
  });
});

// 6. Submit Final Exam (Round 2 Submit -> Combined 50 Questions Evaluation)
app.post('/api/exam/submit', (req, res) => {
  const { sessionId, answers, autoSubmitted, reason } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID required" });
  }

  const session = db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found." });
  }

  // Retrieve Round 2 questions assigned to this student
  let round2Ids = [];
  try {
    round2Ids = JSON.parse(session.question_order || '[]');
  } catch (e) {}

  let masterRound2 = [];
  if (round2Ids.length > 0) {
    const placeholders = round2Ids.map(() => '?').join(',');
    const unordered = db.prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`).all(...round2Ids);
    const map = new Map(unordered.map(q => [q.id, q]));
    masterRound2 = round2Ids.map(id => map.get(id)).filter(Boolean);
  }

  const studentAnswers = answers || {};
  let r2Correct = 0;
  let r2Incorrect = 0;
  let r2Unattempted = 0;

  const round2Review = masterRound2.map((q, idx) => {
    const selected = studentAnswers[q.id];
    const isAttempted = selected !== undefined && selected !== null && selected !== "";
    const isCorrect = isAttempted && parseInt(selected) === q.correct_answer;

    if (!isAttempted) r2Unattempted++;
    else if (isCorrect) r2Correct++;
    else r2Incorrect++;

    return {
      round: 2,
      roundName: "Round 2: Technical",
      questionIndex: idx + 1,
      id: q.id,
      category: q.category,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      options: JSON.parse(q.options),
      studentSelected: isAttempted ? parseInt(selected) : null,
      correctAnswer: q.correct_answer,
      isCorrect,
      isAttempted,
      explanation: q.explanation
    };
  });

  // Retrieve Round 1 review from session
  let round1Review = [];
  try {
    const logData = JSON.parse(session.violation_logs || '{}');
    if (logData.round1Review) round1Review = logData.round1Review;
  } catch (e) {}

  const r1Score = session.round1_score || 0;
  const r2Score = r2Correct;
  const totalScore = r1Score + r2Score; // Out of 50!
  const totalQuestions = 50;
  const percentage = Number(((totalScore / totalQuestions) * 100).toFixed(1));

  // Combined 50 Questions Review
  const fullReviewList = [...round1Review, ...round2Review];

  // Selected topics list
  let selectedTopics = [];
  try {
    selectedTopics = JSON.parse(session.selected_modules || '[]');
  } catch (e) {}

  let performanceGrade = "Needs Improvement";
  if (percentage >= 85) performanceGrade = "Outstanding - MNC Ready";
  else if (percentage >= 70) performanceGrade = "Very Good";
  else if (percentage >= 50) performanceGrade = "Qualified / Passing";

  const startTime = new Date(session.start_time).getTime();
  const endTime = Date.now();
  const durationSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const timeTakenStr = `${minutes}m ${seconds}s`;

  const resultId = 'RES_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const submittedAt = new Date().toISOString();

  // Delete prior result if re-taking
  db.prepare('DELETE FROM results WHERE LOWER(student_name) = LOWER(?)').run(session.student_name);

  // Insert final evaluated record into Database
  db.prepare(`
    INSERT INTO results (
      id, session_id, student_name, module_id, module_name, round, batch,
      round1_score, round1_total, round2_score, round2_total,
      score, total_questions, percentage, selected_topics,
      correct_count, incorrect_count, unattempted_count,
      time_taken_seconds, time_taken_formatted, warnings_count, violation_logs,
      auto_submitted, submit_reason, performance_grade, submitted_at, review_list
    ) VALUES (
      ?, ?, ?, 'combined', 'MNC Recruitment Full Assessment', 'Round 1 & Round 2 Combined', ?,
      ?, 20, ?, 30,
      ?, 50, ?, ?,
      ?, ?, ?,
      ?, ?, ?, '[]',
      ?, ?, ?, ?, ?
    )
  `).run(
    resultId,
    session.session_id,
    session.student_name,
    session.batch || 'General',
    r1Score,
    r2Score,
    totalScore,
    percentage,
    JSON.stringify(selectedTopics),
    r1Score + r2Correct,
    (20 - r1Score) + r2Incorrect,
    r2Unattempted,
    durationSeconds,
    timeTakenStr,
    session.warnings || 0,
    autoSubmitted ? 1 : 0,
    reason || (autoSubmitted ? 'Auto-submitted by proctoring engine' : 'Normal final submission'),
    performanceGrade,
    submittedAt,
    JSON.stringify(fullReviewList)
  );

  // Mark session completed
  db.prepare(`
    UPDATE sessions 
    SET status = 'completed', completed_at = ?, round2_score = ?, total_score = ?
    WHERE session_id = ?
  `).run(submittedAt, r2Score, totalScore, session.session_id);

  res.json({
    success: true,
    result: {
      resultId,
      studentName: session.student_name,
      round1Score: r1Score,
      round1Total: 20,
      round2Score: r2Score,
      round2Total: 30,
      score: totalScore,
      totalQuestions: 50,
      percentage,
      selectedTopics,
      timeTakenFormatted: timeTakenStr,
      warningsCount: session.warnings || 0,
      autoSubmitted: Boolean(autoSubmitted),
      performanceGrade,
      submittedAt,
      reviewList: fullReviewList
    }
  });
});

// 7. Log Violation / Tab Switch
app.post('/api/exam/violation', (req, res) => {
  const { sessionId, type, details } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID required" });
  }

  const session = db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, message: "Active session not found in database." });
  }

  const currentWarnings = (session.warnings || 0) + 1;
  const MAX_WARNINGS = 3;
  const isDisqualified = currentWarnings >= MAX_WARNINGS;
  const nextStatus = isDisqualified ? 'locked' : session.status;

  db.prepare(`
    UPDATE sessions 
    SET warnings = ?, status = ? 
    WHERE session_id = ?
  `).run(currentWarnings, nextStatus, sessionId);

  res.json({
    success: true,
    warnings: currentWarnings,
    maxWarnings: MAX_WARNINGS,
    isDisqualified,
    message: isDisqualified 
      ? "Maximum allowed strikes exceeded. Exam has been locked." 
      : `Warning ${currentWarnings} of ${MAX_WARNINGS}: Tab switching and minimizing are strictly prohibited.`
  });
});

// 8. Get Result by ID
app.get('/api/result/:resultId', (req, res) => {
  const row = db.prepare('SELECT * FROM results WHERE id = ?').get(req.params.resultId);
  if (!row) {
    return res.status(404).json({ success: false, message: "Result record not found." });
  }

  res.json({
    success: true,
    result: {
      resultId: row.id,
      studentName: row.student_name,
      moduleName: row.module_name,
      round: row.round,
      batch: row.batch,
      round1Score: row.round1_score || 0,
      round1Total: row.round1_total || 20,
      round2Score: row.round2_score || 0,
      round2Total: row.round2_total || 30,
      score: row.score,
      totalQuestions: row.total_questions,
      percentage: row.percentage,
      selectedTopics: row.selected_topics ? JSON.parse(row.selected_topics) : [],
      correctCount: row.correct_count,
      incorrectCount: row.incorrect_count,
      unattemptedCount: row.unattempted_count,
      timeTakenFormatted: row.time_taken_formatted,
      warningsCount: row.warnings_count,
      autoSubmitted: Boolean(row.auto_submitted),
      submitReason: row.submit_reason,
      performanceGrade: row.performance_grade,
      submittedAt: row.submitted_at,
      reviewList: JSON.parse(row.review_list || '[]')
    }
  });
});

// -------------------------------------------------------------
// ADMIN APIS FOR deepakkumars170404@gmail.com
// -------------------------------------------------------------

function checkAdminAuth(req, res, next) {
  const authHeader = req.headers['x-admin-email'] || req.query.adminEmail || req.body.adminEmail;
  const authPin = req.headers['x-admin-pin'] || req.query.adminPin || req.body.adminPin;

  if (authHeader) {
    const admin = db.prepare('SELECT * FROM admin_config WHERE LOWER(email) = LOWER(?)').get(authHeader.trim());
    if (admin && authPin && authPin === admin.pin) {
      return next();
    }
  }

  return res.status(401).json({ 
    success: false, 
    message: "Access denied. Valid instructor credentials required." 
  });
}

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, pin } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email required." });
  }

  const admin = db.prepare('SELECT * FROM admin_config WHERE LOWER(email) = LOWER(?)').get(email.trim());
  if (!admin) {
    return res.status(403).json({ 
      success: false, 
      message: "Access denied. Invalid instructor credentials." 
    });
  }

  if (!pin || pin.trim() !== admin.pin) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid instructor security PIN." 
    });
  }

  res.json({
    success: true,
    email: admin.email,
    name: admin.name,
    role: admin.role
  });
});

// Leaderboard: Top Mark to Low Mark from DB (NO Dummy Data!)
app.get('/api/admin/leaderboard', checkAdminAuth, (req, res) => {
  // Sorted from Top Mark to Low Mark!
  const rows = db.prepare(`
    SELECT id, session_id, student_name as studentName, module_id as moduleId, module_name as moduleName,
           round, batch, 
           round1_score as round1Score, round1_total as round1Total,
           round2_score as round2Score, round2_total as round2Total,
           score, total_questions as totalQuestions, percentage, selected_topics as selectedTopics,
           correct_count as correctCount, incorrect_count as incorrectCount, unattempted_count as unattemptedCount,
           time_taken_seconds as timeTakenSeconds, time_taken_formatted as timeTakenFormatted,
           warnings_count as warningsCount, auto_submitted as autoSubmitted, submit_reason as submitReason,
           performance_grade as performanceGrade, submitted_at as submittedAt
    FROM results
    ORDER BY percentage DESC, score DESC, time_taken_seconds ASC
  `).all();

  const ranked = rows.map((r, index) => ({
    ...r,
    rank: index + 1,
    selectedTopics: r.selectedTopics ? JSON.parse(r.selectedTopics) : [],
    autoSubmitted: Boolean(r.autoSubmitted)
  }));

  const stats = db.prepare(`
    SELECT COUNT(*) as total, AVG(percentage) as avg_pct, MAX(score) as max_score 
    FROM results
  `).get();

  res.json({
    success: true,
    stats: {
      totalSubmissions: stats.total || 0,
      avgPercentage: stats.avg_pct ? Number(stats.avg_pct.toFixed(1)) : 0,
      highestScore: stats.max_score || 0
    },
    leaderboard: ranked
  });
});

// Grant Re-Exam / Unlock Candidate in Database
app.post('/api/admin/allow-reexam', checkAdminAuth, (req, res) => {
  const { studentName, resetReason, clearPreviousResult } = req.body;

  if (!studentName || !studentName.trim()) {
    return res.status(400).json({ success: false, message: "Student Name required." });
  }

  const cleanName = studentName.trim();
  const permitId = 'PERMIT_' + Date.now();

  db.prepare(`
    INSERT INTO reexam_permits (id, student_name, module_id, reason, granted_at, used)
    VALUES (?, ?, 'all', ?, ?, 0)
  `).run(permitId, cleanName, resetReason || "Instructor unlocked re-exam", new Date().toISOString());

  // Delete locked or active sessions
  db.prepare('DELETE FROM sessions WHERE LOWER(student_name) = LOWER(?)').run(cleanName);

  // Clear previous result if chosen
  if (clearPreviousResult === true) {
    db.prepare('DELETE FROM results WHERE LOWER(student_name) = LOWER(?)').run(cleanName);
  }

  res.json({
    success: true,
    message: `Re-exam permission successfully granted in database for student '${cleanName}'. They can now begin the exam.`
  });
});

// Master Questions & Answers Bank (Deepak's View) from DB
app.get('/api/admin/questions', checkAdminAuth, (req, res) => {
  const moduleId = req.query.module || 'aptitude';
  const mod = db.prepare('SELECT * FROM modules WHERE id = ?').get(moduleId);

  if (!mod) {
    return res.status(400).json({ success: false, message: "Module not found." });
  }

  const questions = db.prepare(`
    SELECT id, question_order as questionIndex, category, topic, difficulty, question, options, correct_answer as correctAnswer, explanation
    FROM questions 
    WHERE module_id = ? 
    ORDER BY CASE WHEN LOWER(difficulty) = 'basic' THEN 1 ELSE 2 END, question_order ASC
  `).all(moduleId);

  const formatted = questions.map((q, idx) => ({
    ...q,
    questionIndex: idx + 1,
    options: JSON.parse(q.options)
  }));

  res.json({
    success: true,
    module: mod,
    totalQuestions: formatted.length,
    questions: formatted
  });
});

// MANUALLY ADD QUESTION (Admin: Deepak Only)
app.post('/api/admin/questions', checkAdminAuth, (req, res) => {
  const { moduleId, category, topic, difficulty, question, options, correctAnswer, explanation } = req.body;

  if (!moduleId || !question || !options || options.length !== 4 || correctAnswer === undefined || correctAnswer === null) {
    return res.status(400).json({ 
      success: false, 
      message: "Please fill all required fields: Module, Question, exactly 4 Options, and Correct Answer index." 
    });
  }

  const mod = db.prepare('SELECT * FROM modules WHERE id = ?').get(moduleId);
  if (!mod) {
    return res.status(400).json({ success: false, message: "Invalid module specified." });
  }

  const cleanDifficulty = (difficulty && difficulty.toLowerCase() === 'basic') ? 'Basic' : 'Medium';
  const newId = `${moduleId}_custom_${Date.now()}`;
  
  const maxRow = db.prepare('SELECT MAX(question_order) as maxOrder FROM questions WHERE module_id = ?').get(moduleId);
  const nextOrder = (maxRow.maxOrder || 0) + 1;

  try {
    db.prepare(`
      INSERT INTO questions (
        id, module_id, question_order, category, topic, difficulty, question, options, correct_answer, explanation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      moduleId,
      nextOrder,
      category ? category.trim() : mod.name,
      topic ? topic.trim() : 'General',
      cleanDifficulty,
      question.trim(),
      JSON.stringify(options.map(o => o.trim())),
      parseInt(correctAnswer),
      explanation ? explanation.trim() : 'Verified by instructor Deepak Kumar.'
    );

    const count = db.prepare('SELECT COUNT(*) as count FROM questions WHERE module_id = ?').get(moduleId).count;
    db.prepare('UPDATE modules SET total_questions = ? WHERE id = ?').run(count, moduleId);

    res.json({
      success: true,
      message: `Question successfully added to '${mod.name}' in SQLite database!`,
      questionId: newId,
      newTotalQuestions: count
    });
  } catch (err) {
    console.error("Error inserting custom question:", err);
    res.status(500).json({ success: false, message: "Database insert error: " + err.message });
  }
});

// DELETE QUESTION (Admin: Deepak Only)
app.delete('/api/admin/question/:id', checkAdminAuth, (req, res) => {
  const questionId = req.params.id;
  const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId);

  if (!q) {
    return res.status(404).json({ success: false, message: "Question not found in database." });
  }

  try {
    db.prepare('DELETE FROM questions WHERE id = ?').run(questionId);
    const count = db.prepare('SELECT COUNT(*) as count FROM questions WHERE module_id = ?').get(q.module_id).count;
    db.prepare('UPDATE modules SET total_questions = ? WHERE id = ?').run(count, q.module_id);

    res.json({
      success: true,
      message: `Question '${questionId}' deleted successfully from database.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error during deletion." });
  }
});

// Live Sessions Monitor from DB
app.get('/api/admin/live-sessions', checkAdminAuth, (req, res) => {
  const activeSessions = db.prepare(`
    SELECT session_id as sessionId, student_name as studentName, module_name as moduleName, round_type as roundType, batch, status, warnings, start_time as startTime 
    FROM sessions 
    WHERE status IN ('active', 'round1_complete', 'locked') 
    ORDER BY start_time DESC
  `).all();

  res.json({ success: true, activeSessions });
});

// Delete Result Entry from DB
app.delete('/api/admin/result/:id', checkAdminAuth, (req, res) => {
  db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: "Result deleted from database." });
});

// Export Leaderboard to CSV directly from DB
app.get('/api/admin/export-csv', checkAdminAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM results 
    ORDER BY percentage DESC, score DESC, time_taken_seconds ASC
  `).all();

  let csv = "Rank,Student Name,Round 1 (Aptitude /20),Round 2 (Technical /30),Total Score (/50),Percentage,Selected Topics,Time Taken,Warnings,Auto Submitted,Submitted At\n";

  rows.forEach((r, idx) => {
    let topics = '';
    try {
      topics = (JSON.parse(r.selected_topics || '[]')).join('; ');
    } catch(e) {}

    const row = [
      idx + 1,
      `"${r.student_name.replace(/"/g, '""')}"`,
      r.round1_score || 0,
      r.round2_score || 0,
      r.score,
      `${r.percentage}%`,
      `"${topics}"`,
      `"${r.time_taken_formatted || ''}"`,
      r.warnings_count || 0,
      r.auto_submitted ? "YES" : "NO",
      `"${r.submitted_at}"`
    ].join(",");
    csv += row + "\n";
  });

  res.header('Content-Type', 'text/csv');
  res.attachment('WEGROW_MNC_Exam_Leaderboard.csv');
  res.send(csv);
});

// Global Express Error Handler (Prevents crashes)
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR HANDLER]:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ 
    success: false, 
    message: "A temporary server issue occurred. Your progress is safe. Please retry." 
  });
});

// Fallback to index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Process-level Crash Protection
process.on('uncaughtException', (err) => {
  console.error('[CRASH PREVENTED] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRASH PREVENTED] Unhandled Rejection:', reason);
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 WEGROW MNC Examination Platform (SQLite Database Mode)`);
  console.log(`📍 Local URL:     http://localhost:${PORT}`);
  console.log(`👨‍🏫 Admin Portal: http://localhost:${PORT}/admin.html`);
  console.log(`🔒 Admin Auth:   Protected in Database`);
  console.log(`💾 SQLite DB:    ${db.name || 'Active Database'}`);
  console.log(`=======================================================`);
});
