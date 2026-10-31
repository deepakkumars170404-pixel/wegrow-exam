console.log('=======================================================');
console.log('🚀 WEGROW Examination Platform Booting...');
console.log('Node Version:', process.version, '| Platform:', process.platform, '| Arch:', process.arch);
console.log('=======================================================');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const supabaseDb = require('./db_supabase');

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
app.get('/api/modules', async (req, res) => {
  try {
    if (supabaseDb.isConfigured()) {
      const modules = await supabaseDb.getModules();
      return res.json({ success: true, modules });
    }

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
app.get('/api/student/eligibility', async (req, res) => {
  const studentName = req.query.name;
  if (!studentName || !studentName.trim()) {
    return res.json({ success: true, hasCompleted: false });
  }

  const cleanName = studentName.trim();
  try {
    if (supabaseDb.isConfigured()) {
      const priorResult = await supabaseDb.getPriorResult(cleanName);
      return res.json({
        success: true,
        studentName: cleanName,
        hasCompleted: Boolean(priorResult),
        priorResult: priorResult || null
      });
    }

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
  } catch (err) {
    console.error('Error checking eligibility:', err);
    res.status(500).json({ success: false, message: "Query failed." });
  }
});

// 3. Start Exam - ROUND 1: COMPULSORY MNC APTITUDE (20 Questions randomly sampled from 150)
app.post('/api/exam/start', async (req, res) => {
  const { studentName, batch } = req.body;

  if (!studentName || !studentName.trim()) {
    return res.status(400).json({ success: false, message: "Student Name is compulsory." });
  }

  const cleanName = studentName.trim();
  const sessionId = 'SES_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const now = new Date();

  try {
    if (supabaseDb.isConfigured()) {
      const priorCompleted = await supabaseDb.getPriorResult(cleanName);
      const permit = await supabaseDb.getActivePermit(cleanName);

      if (priorCompleted && !permit) {
        return res.status(403).json({
          success: false,
          isCompleted: true,
          resultId: priorCompleted.id,
          message: `Candidate '${cleanName}' has already submitted the examination. If you need to re-attempt due to accidental closure or technical issues, request instructor for Re-exam permission.`
        });
      }

      const lockedSession = await supabaseDb.getLockedSession(cleanName);
      if (lockedSession && !permit) {
        return res.status(403).json({
          success: false,
          isLocked: true,
          message: `Your exam attempt was locked due to prohibited tab-switches or window exits. Contact the instructor to unlock your session.`
        });
      }

      if (permit) {
        await supabaseDb.markPermitUsed(permit.id);
      }

      const selected20Questions = await supabaseDb.getAptitudeQuestions();
      if (!selected20Questions || selected20Questions.length === 0) {
        return res.status(500).json({ success: false, message: "No aptitude questions found in Supabase database." });
      }

      const sanitizedQuestions = selected20Questions.map((q, idx) => ({
        questionIndex: idx + 1,
        id: q.id,
        category: q.category,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options)
      }));

      const orderedIds = selected20Questions.map(q => q.id);

      await supabaseDb.createSession({
        session_id: sessionId,
        student_name: cleanName,
        batch: batch ? batch.trim() : 'General',
        module_id: 'aptitude',
        module_name: 'Round 1: MNC Aptitude Assessment',
        round_type: 'round1',
        start_time: now.toISOString(),
        duration_minutes: 25,
        status: 'active',
        warnings: 0,
        violation_logs: [],
        question_order: orderedIds
      });

      return res.json({
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
    }

    // Local SQLite Fallback
    const priorCompleted = db.prepare(`
      SELECT id, student_name, score, percentage 
      FROM results 
      WHERE LOWER(student_name) = LOWER(?)
    `).get(cleanName);

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

    if (permit) {
      db.prepare('UPDATE reexam_permits SET used = 1, used_at = ? WHERE id = ?').run(new Date().toISOString(), permit.id);
    }

    const allAptitude = db.prepare(`
      SELECT id, question_order, category, topic, difficulty, question, options 
      FROM questions 
      WHERE module_id = 'aptitude'
    `).all();

    if (!allAptitude || allAptitude.length === 0) {
      return res.status(500).json({ success: false, message: "No aptitude questions found in database." });
    }

    const basicPool = allAptitude.filter(q => (q.difficulty || '').toLowerCase() === 'basic');
    const mediumPool = allAptitude.filter(q => (q.difficulty || '').toLowerCase() !== 'basic');

    const shuffledBasic = shuffleArray(basicPool).slice(0, 10);
    const shuffledMedium = shuffleArray(mediumPool).slice(0, 10);

    const selected20Questions = [...shuffledBasic, ...shuffledMedium];

    const sanitizedQuestions = selected20Questions.map((q, idx) => ({
      questionIndex: idx + 1,
      id: q.id,
      category: q.category,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      options: JSON.parse(q.options)
    }));

    const orderedIds = selected20Questions.map(q => q.id);

    db.prepare('DELETE FROM sessions WHERE LOWER(student_name) = LOWER(?)').run(cleanName);

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
  } catch (err) {
    console.error('Error in /api/exam/start:', err);
    res.status(500).json({ success: false, message: "Internal server error starting exam." });
  }
});

// 4. Submit Round 1 (Aptitude) & Prepare for Round 2 Topic Multi-Select
app.post('/api/exam/submit-round1', async (req, res) => {
  const { sessionId, answers, autoSubmitted, reason } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID required" });
  }

  let session = null;
  let masterQuestions = [];

  try {
    if (supabaseDb.isConfigured()) {
      session = await supabaseDb.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found." });
      }
      let qIds = Array.isArray(session.question_order) ? session.question_order : JSON.parse(session.question_order || '[]');
      masterQuestions = await supabaseDb.getQuestionsByIds(qIds);
    } else {
      session = db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found." });
      }

      let questionOrderIds = [];
      try {
        questionOrderIds = JSON.parse(session.question_order || '[]');
      } catch (e) {}

      if (questionOrderIds.length > 0) {
        const placeholders = questionOrderIds.map(() => '?').join(',');
        const unordered = db.prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`).all(...questionOrderIds);
        const map = new Map(unordered.map(q => [q.id, q]));
        masterQuestions = questionOrderIds.map(id => map.get(id)).filter(Boolean);
      } else {
        masterQuestions = db.prepare(`SELECT * FROM questions WHERE module_id = 'aptitude' LIMIT 20`).all();
      }
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

      const opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options);

      return {
        round: 1,
        roundName: "Round 1: MNC Aptitude",
        questionIndex: idx + 1,
        id: q.id,
        category: q.category,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        options: opts,
        studentSelected: isAttempted ? parseInt(selected) : null,
        correctAnswer: q.correct_answer,
        isCorrect,
        isAttempted,
        explanation: q.explanation
      };
    });

    const round1Score = correctCount;

    if (supabaseDb.isConfigured()) {
      await supabaseDb.client.from('sessions').update({
        round1_score: round1Score,
        status: 'round1_complete',
        completed_at: new Date().toISOString(),
        violation_logs: { round1Review, strikes: session.warnings || 0 }
      }).eq('session_id', sessionId);
    } else {
      db.prepare(`
        UPDATE sessions 
        SET round1_score = ?, status = 'round1_complete', completed_at = ?
        WHERE session_id = ?
      `).run(round1Score, new Date().toISOString(), sessionId);

      db.prepare(`
        UPDATE sessions
        SET violation_logs = ?
        WHERE session_id = ?
      `).run(JSON.stringify({ round1Review, strikes: session.warnings || 0 }), sessionId);
    }

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
  } catch (err) {
    console.error('Error submitting Round 1:', err);
    res.status(500).json({ success: false, message: "Error saving Round 1." });
  }
});

// 5. Start Round 2: DYNAMIC TOPIC MULTI-SELECT (30 Questions evenly distributed)
app.post('/api/exam/start-round2', async (req, res) => {
  const { sessionId, selectedModules } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID required" });
  }

  let session = null;
  try {
    if (supabaseDb.isConfigured()) {
      session = await supabaseDb.getSession(sessionId);
    } else {
      session = db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(sessionId);
    }

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found." });
    }

    if (!selectedModules || !Array.isArray(selectedModules) || selectedModules.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one topic for Round 2." });
    }

    const allowed = ['html', 'css', 'bootstrap', 'javascript', 'python', 'react', 'data_analytics', 'data_science'];
    const validModules = selectedModules.filter(m => allowed.includes(m));

    if (validModules.length === 0) {
      return res.status(400).json({ success: false, message: "No valid topics selected." });
    }

    const K = validModules.length;
    const baseCount = Math.floor(30 / K);
    const remainder = 30 % K;

    const topicAllocations = {};
    validModules.forEach((modId, index) => {
      topicAllocations[modId] = baseCount + (index < remainder ? 1 : 0);
    });

    let finalizedRound2 = [];

    if (supabaseDb.isConfigured()) {
      finalizedRound2 = await supabaseDb.getRound2Questions(topicAllocations);
    } else {
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

        let combined = [...sampleBasic, ...sampleMed];
        if (combined.length < needed) {
          const remainingNeeded = needed - combined.length;
          const alreadyIds = new Set(combined.map(q => q.id));
          const rest = modQuestions.filter(q => !alreadyIds.has(q.id));
          combined = [...combined, ...shuffleArray(rest).slice(0, remainingNeeded)];
        }

        round2Questions = [...round2Questions, ...combined];
      });

      const round2Basic = round2Questions.filter(q => (q.difficulty || '').toLowerCase() === 'basic');
      const round2Med = round2Questions.filter(q => (q.difficulty || '').toLowerCase() !== 'basic');
      finalizedRound2 = [...shuffleArray(round2Basic), ...shuffleArray(round2Med)];
    }

    const sanitizedQuestions = finalizedRound2.map((q, idx) => ({
      questionIndex: idx + 1,
      id: q.id,
      category: q.category,
      topic: q.topic,
      difficulty: q.difficulty,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : JSON.parse(q.options)
    }));

    const orderedIds = finalizedRound2.map(q => q.id);

    if (supabaseDb.isConfigured()) {
      await supabaseDb.updateSessionForRound2(sessionId, {
        selected_modules: validModules,
        round1_score: session.round1_score || 0,
        question_order: orderedIds,
        duration_minutes: 35
      });
    } else {
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
    }

    res.json({
      success: true,
      sessionId,
      studentName: session.student_name,
      round: 2,
      roundTitle: "Round 2: Technical Electives Assessment",
      selectedModules: validModules,
      allocations: topicAllocations,
      totalQuestions: finalizedRound2.length,
      durationMinutes: 35,
      questions: sanitizedQuestions
    });
  } catch (err) {
    console.error('Error starting Round 2:', err);
    res.status(500).json({ success: false, message: "Error starting Round 2." });
  }
});

// 6. Submit Final Exam (Round 2 Submit -> Combined 50 Questions Evaluation)
app.post('/api/exam/submit', async (req, res) => {
  const { sessionId, answers, autoSubmitted, reason } = req.body;

  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID required" });
  }

  let session = null;
  let masterRound2 = [];

  try {
    if (supabaseDb.isConfigured()) {
      session = await supabaseDb.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found." });
      }
      let round2Ids = Array.isArray(session.question_order) ? session.question_order : JSON.parse(session.question_order || '[]');
      masterRound2 = await supabaseDb.getQuestionsByIds(round2Ids);
    } else {
      session = db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(sessionId);
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found." });
      }

      let round2Ids = [];
      try {
        round2Ids = JSON.parse(session.question_order || '[]');
      } catch (e) {}

      if (round2Ids.length > 0) {
        const placeholders = round2Ids.map(() => '?').join(',');
        const unordered = db.prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`).all(...round2Ids);
        const map = new Map(unordered.map(q => [q.id, q]));
        masterRound2 = round2Ids.map(id => map.get(id)).filter(Boolean);
      }
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

      const opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options);

      return {
        round: 2,
        roundName: "Round 2: Technical",
        questionIndex: idx + 1,
        id: q.id,
        category: q.category,
        topic: q.topic,
        difficulty: q.difficulty,
        question: q.question,
        options: opts,
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
      const logData = typeof session.violation_logs === 'object' ? session.violation_logs : JSON.parse(session.violation_logs || '{}');
      if (logData && logData.round1Review) round1Review = logData.round1Review;
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
      selectedTopics = Array.isArray(session.selected_modules) ? session.selected_modules : JSON.parse(session.selected_modules || '[]');
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

    if (supabaseDb.isConfigured()) {
      await supabaseDb.saveResult({
        id: resultId,
        session_id: session.session_id,
        student_name: session.student_name,
        module_id: 'combined',
        module_name: 'MNC Recruitment Full Assessment',
        round: 'Round 1 & Round 2 Combined',
        batch: session.batch || 'General',
        round1_score: r1Score,
        round1_total: 20,
        round2_score: r2Score,
        round2_total: 30,
        score: totalScore,
        total_questions: 50,
        percentage,
        selected_topics: selectedTopics,
        correct_count: r1Score + r2Correct,
        incorrect_count: (20 - r1Score) + r2Incorrect,
        unattempted_count: r2Unattempted,
        time_taken_seconds: durationSeconds,
        time_taken_formatted: timeTakenStr,
        warnings_count: session.warnings || 0,
        violation_logs: [],
        auto_submitted: autoSubmitted ? 1 : 0,
        submit_reason: reason || (autoSubmitted ? 'Auto-submitted by proctoring engine' : 'Normal final submission'),
        performance_grade: performanceGrade,
        submitted_at: submittedAt,
        review_list: fullReviewList
      });
    } else {
      db.prepare('DELETE FROM results WHERE LOWER(student_name) = LOWER(?)').run(session.student_name);

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

      db.prepare(`
        UPDATE sessions 
        SET status = 'completed', completed_at = ?, round2_score = ?, total_score = ?
        WHERE session_id = ?
      `).run(submittedAt, r2Score, totalScore, session.session_id);
    }

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
  } catch (err) {
    console.error('Error submitting final exam:', err);
    res.status(500).json({ success: false, message: "Error saving final submission." });
  }
});

// 7. Log Violation / Tab Switch
app.post('/api/exam/violation', async (req, res) => {
  const { sessionId, type, details } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: "Session ID required" });
  }

  try {
    let session = null;
    if (supabaseDb.isConfigured()) {
      session = await supabaseDb.getSession(sessionId);
    } else {
      session = db.prepare('SELECT * FROM sessions WHERE session_id = ?').get(sessionId);
    }

    if (!session) {
      return res.status(404).json({ success: false, message: "Active session not found in database." });
    }

    const currentWarnings = (session.warnings || 0) + 1;
    const MAX_WARNINGS = 3;
    const isDisqualified = currentWarnings >= MAX_WARNINGS;

    if (supabaseDb.isConfigured()) {
      await supabaseDb.updateProctorViolation(sessionId, currentWarnings, session.violation_logs || [], isDisqualified);
    } else {
      const nextStatus = isDisqualified ? 'locked' : session.status;
      db.prepare(`
        UPDATE sessions 
        SET warnings = ?, status = ? 
        WHERE session_id = ?
      `).run(currentWarnings, nextStatus, sessionId);
    }

    res.json({
      success: true,
      warnings: currentWarnings,
      maxWarnings: MAX_WARNINGS,
      isDisqualified,
      message: isDisqualified 
        ? "Maximum allowed strikes exceeded. Exam has been locked." 
        : `Warning ${currentWarnings} of ${MAX_WARNINGS}: Tab switching and minimizing are strictly prohibited.`
    });
  } catch (err) {
    console.error('Error recording violation:', err);
    res.status(500).json({ success: false, message: "Error updating violation." });
  }
});

// 8. Get Result by ID
app.get('/api/result/:resultId', async (req, res) => {
  try {
    let row = null;
    if (supabaseDb.isConfigured()) {
      row = await supabaseDb.getResultById(req.params.resultId);
    } else {
      row = db.prepare('SELECT * FROM results WHERE id = ?').get(req.params.resultId);
    }

    if (!row) {
      return res.status(404).json({ success: false, message: "Result record not found." });
    }

    const selectedTopics = Array.isArray(row.selected_topics) ? row.selected_topics : JSON.parse(row.selected_topics || '[]');
    const reviewList = Array.isArray(row.review_list) ? row.review_list : JSON.parse(row.review_list || '[]');

    let hrAssessment = null;
    try {
      const logs = typeof row.violation_logs === 'object' ? row.violation_logs : JSON.parse(row.violation_logs || '{}');
      if (logs && logs.hrAssessment) hrAssessment = logs.hrAssessment;
    } catch(e) {}
    if (!hrAssessment && row.gd_score !== undefined && row.gd_score !== null) {
      hrAssessment = {
        gdScore: row.gd_score,
        interviewScore: row.interview_score,
        hrTotal: row.hr_total_score,
        grandTotal: row.grand_total_score,
        grandPercentage: row.grand_percentage,
        remarks: row.hr_remarks || '',
        status: row.hr_status || 'completed',
        scoredAt: row.hr_scored_at
      };
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
        selectedTopics,
        correctCount: row.correct_count,
        incorrectCount: row.incorrect_count,
        unattemptedCount: row.unattempted_count,
        timeTakenFormatted: row.time_taken_formatted,
        warningsCount: row.warnings_count,
        autoSubmitted: Boolean(row.auto_submitted),
        submitReason: row.submit_reason,
        performanceGrade: row.performance_grade,
        submittedAt: row.submitted_at,
        reviewList,
        hrAssessment: hrAssessment || { status: 'pending' }
      }
    });
  } catch (err) {
    console.error('Error fetching result:', err);
    res.status(500).json({ success: false, message: "Error loading result." });
  }
});

// -------------------------------------------------------------
// ADMIN APIS
// -------------------------------------------------------------

async function checkAdminAuth(req, res, next) {
  const authHeader = req.headers['x-admin-email'] || req.query.adminEmail || req.body.adminEmail;
  const authPin = req.headers['x-admin-pin'] || req.query.adminPin || req.body.adminPin;

  if (authHeader) {
    if (supabaseDb.isConfigured()) {
      try {
        const admin = await supabaseDb.getAdmin(authHeader);
        if (admin && authPin && authPin === admin.pin) {
          return next();
        }
      } catch (e) {
        console.error('Admin auth check error:', e);
      }
    } else {
      const admin = db.prepare('SELECT * FROM admin_config WHERE LOWER(email) = LOWER(?)').get(authHeader.trim());
      if (admin && authPin && authPin === admin.pin) {
        return next();
      }
    }
  }

  return res.status(401).json({ 
    success: false, 
    message: "Access denied. Valid instructor credentials required." 
  });
}

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { email, pin } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email required." });
  }

  try {
    let admin = null;
    if (supabaseDb.isConfigured()) {
      admin = await supabaseDb.getAdmin(email);
    } else {
      admin = db.prepare('SELECT * FROM admin_config WHERE LOWER(email) = LOWER(?)').get(email.trim());
    }

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
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

// Leaderboard: Top Mark to Low Mark
app.get('/api/admin/leaderboard', checkAdminAuth, async (req, res) => {
  try {
    let ranked = [];
    let stats = {};

    if (supabaseDb.isConfigured()) {
      const rows = await supabaseDb.getLeaderboard();
      ranked = rows.map((r, index) => {
        let hr = null;
        try {
          const logs = typeof r.violation_logs === 'object' ? r.violation_logs : JSON.parse(r.violation_logs || '{}');
          if (logs && logs.hrAssessment) hr = logs.hrAssessment;
        } catch(e) {}
        if (!hr && r.gd_score !== undefined && r.gd_score !== null) {
          hr = {
            gdScore: r.gd_score,
            interviewScore: r.interview_score,
            hrTotal: r.hr_total_score,
            grandTotal: r.grand_total_score,
            grandPercentage: r.grand_percentage,
            remarks: r.hr_remarks || '',
            status: r.hr_status || 'completed',
            scoredAt: r.hr_scored_at
          };
        }

        const gdScore = hr?.gdScore ?? null;
        const interviewScore = hr?.interviewScore ?? null;
        const hrTotal = hr?.hrTotal ?? (gdScore !== null && interviewScore !== null ? (gdScore + interviewScore) : null);
        const grandTotal = hr?.grandTotal ?? (hrTotal !== null ? (r.score + hrTotal) : r.score);
        const grandPercentage = hr?.grandPercentage ?? (hrTotal !== null ? Number(((grandTotal / 100) * 100).toFixed(1)) : null);

        return {
          id: r.id,
          sessionId: r.session_id,
          studentName: r.student_name,
          moduleId: r.module_id,
          moduleName: r.module_name,
          round: r.round,
          batch: r.batch,
          round1Score: r.round1_score,
          round1Total: r.round1_total,
          round2Score: r.round2_score,
          round2Total: r.round2_total,
          score: r.score, // Quiz Score /50
          totalQuestions: r.total_questions,
          percentage: r.percentage,
          selectedTopics: Array.isArray(r.selected_topics) ? r.selected_topics : JSON.parse(r.selected_topics || '[]'),
          correctCount: r.correct_count,
          incorrectCount: r.incorrect_count,
          unattemptedCount: r.unattempted_count,
          timeTakenSeconds: r.time_taken_seconds,
          timeTakenFormatted: r.time_taken_formatted,
          warningsCount: r.warnings_count,
          autoSubmitted: Boolean(r.auto_submitted),
          submitReason: r.submit_reason,
          performanceGrade: r.performance_grade,
          submittedAt: r.submitted_at,
          hrStatus: hr?.status || (hrTotal !== null ? 'completed' : 'pending'),
          gdScore,
          interviewScore,
          hrTotal,
          grandTotal,
          grandPercentage,
          hrRemarks: hr?.remarks || '',
          rank: index + 1
        };
      });

      const total = ranked.length;
      const avg = total > 0 ? (ranked.reduce((sum, r) => sum + (r.percentage || 0), 0) / total).toFixed(1) : 0;
      const max = total > 0 ? Math.max(...ranked.map(r => r.score || 0)) : 0;
      const hrDone = ranked.filter(r => r.hrStatus === 'completed').length;
      stats = {
        totalSubmissions: total,
        avgPercentage: Number(avg),
        highestScore: max,
        hrCompletedCount: hrDone,
        hrPendingCount: total - hrDone
      };
    } else {
      const rows = db.prepare(`
        SELECT id, session_id, student_name as studentName, module_id as moduleId, module_name as moduleName,
               round, batch, 
               round1_score as round1Score, round1_total as round1Total,
               round2_score as round2Score, round2_total as round2Total,
               score, total_questions as totalQuestions, percentage, selected_topics as selectedTopics,
               correct_count as correctCount, incorrect_count as incorrectCount, unattempted_count as unattemptedCount,
               time_taken_seconds as timeTakenSeconds, time_taken_formatted as timeTakenFormatted,
               warnings_count as warningsCount, auto_submitted as autoSubmitted, submit_reason as submitReason,
               performance_grade as performanceGrade, submitted_at as submittedAt,
               violation_logs as violationLogs, gd_score, interview_score, hr_total_score,
               grand_total_score, grand_percentage, hr_remarks, hr_status
        FROM results
        ORDER BY percentage DESC, score DESC, time_taken_seconds ASC
      `).all();

      ranked = rows.map((r, index) => {
        let hr = null;
        try {
          const logs = typeof r.violationLogs === 'object' ? r.violationLogs : JSON.parse(r.violationLogs || '{}');
          if (logs && logs.hrAssessment) hr = logs.hrAssessment;
        } catch(e) {}
        if (!hr && r.gd_score !== undefined && r.gd_score !== null) {
          hr = {
            gdScore: r.gd_score,
            interviewScore: r.interview_score,
            hrTotal: r.hr_total_score,
            grandTotal: r.grand_total_score,
            grandPercentage: r.grand_percentage,
            remarks: r.hr_remarks || '',
            status: r.hr_status || 'completed'
          };
        }

        const gdScore = hr?.gdScore ?? r.gd_score ?? null;
        const interviewScore = hr?.interviewScore ?? r.interview_score ?? null;
        const hrTotal = hr?.hrTotal ?? r.hr_total_score ?? (gdScore !== null && interviewScore !== null ? (gdScore + interviewScore) : null);
        const grandTotal = hr?.grandTotal ?? r.grand_total_score ?? (hrTotal !== null ? (r.score + hrTotal) : r.score);
        const grandPercentage = hr?.grandPercentage ?? r.grand_percentage ?? (hrTotal !== null ? Number(((grandTotal / 100) * 100).toFixed(1)) : null);

        return {
          ...r,
          rank: index + 1,
          selectedTopics: r.selectedTopics ? JSON.parse(r.selectedTopics) : [],
          autoSubmitted: Boolean(r.autoSubmitted),
          hrStatus: hr?.status || r.hr_status || (hrTotal !== null ? 'completed' : 'pending'),
          gdScore,
          interviewScore,
          hrTotal,
          grandTotal,
          grandPercentage,
          hrRemarks: hr?.remarks || r.hr_remarks || ''
        };
      });

      const dbStats = db.prepare(`
        SELECT COUNT(*) as total, AVG(percentage) as avg_pct, MAX(score) as max_score 
        FROM results
      `).get();

      const hrDone = ranked.filter(r => r.hrStatus === 'completed').length;
      stats = {
        totalSubmissions: dbStats.total || 0,
        avgPercentage: dbStats.avg_pct ? Number(dbStats.avg_pct.toFixed(1)) : 0,
        highestScore: dbStats.max_score || 0,
        hrCompletedCount: hrDone,
        hrPendingCount: (dbStats.total || 0) - hrDone
      };
    }

    res.json({
      success: true,
      stats,
      leaderboard: ranked
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, message: "Error loading leaderboard." });
  }
});

// Grant Re-Exam / Unlock Candidate
app.post('/api/admin/allow-reexam', checkAdminAuth, async (req, res) => {
  const { studentName, resetReason, clearPreviousResult } = req.body;

  if (!studentName || !studentName.trim()) {
    return res.status(400).json({ success: false, message: "Student Name required." });
  }

  const cleanName = studentName.trim();
  const permitId = 'PERMIT_' + Date.now();

  try {
    if (supabaseDb.isConfigured()) {
      await supabaseDb.grantPermit({
        id: permitId,
        student_name: cleanName,
        module_id: 'all',
        reason: resetReason || "Instructor unlocked re-exam",
        granted_at: new Date().toISOString(),
        used: 0
      });

      if (clearPreviousResult === true) {
        await supabaseDb.client.from('results').delete().ilike('student_name', cleanName);
      }
    } else {
      db.prepare(`
        INSERT INTO reexam_permits (id, student_name, module_id, reason, granted_at, used)
        VALUES (?, ?, 'all', ?, ?, 0)
      `).run(permitId, cleanName, resetReason || "Instructor unlocked re-exam", new Date().toISOString());

      db.prepare('DELETE FROM sessions WHERE LOWER(student_name) = LOWER(?)').run(cleanName);

      if (clearPreviousResult === true) {
        db.prepare('DELETE FROM results WHERE LOWER(student_name) = LOWER(?)').run(cleanName);
      }
    }

    res.json({
      success: true,
      message: `Re-exam permission successfully granted for student '${cleanName}'. They can now begin the exam.`
    });
  } catch (err) {
    console.error('Re-exam grant error:', err);
    res.status(500).json({ success: false, message: "Error granting permit." });
  }
});

// Master Questions & Answers Bank
app.get('/api/admin/questions', checkAdminAuth, async (req, res) => {
  const moduleId = req.query.module || 'aptitude';

  try {
    if (supabaseDb.isConfigured()) {
      const { data: mod } = await supabaseDb.client.from('modules').select('*').eq('id', moduleId).maybeSingle();
      if (!mod) {
        return res.status(400).json({ success: false, message: "Module not found." });
      }

      const { data: questions } = await supabaseDb.client
        .from('questions')
        .select('*')
        .eq('module_id', moduleId)
        .order('question_order', { ascending: true });

      const formatted = (questions || []).map((q, idx) => ({
        ...q,
        questionIndex: idx + 1,
        correctAnswer: q.correct_answer,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options)
      }));

      return res.json({
        success: true,
        module: mod,
        totalQuestions: formatted.length,
        questions: formatted
      });
    }

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
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ success: false, message: "Error loading question bank." });
  }
});

// MANUALLY ADD QUESTION
app.post('/api/admin/questions', checkAdminAuth, async (req, res) => {
  const { moduleId, category, topic, difficulty, question, options, correctAnswer, explanation } = req.body;

  if (!moduleId || !question || !options || options.length !== 4 || correctAnswer === undefined || correctAnswer === null) {
    return res.status(400).json({ 
      success: false, 
      message: "Please fill all required fields: Module, Question, exactly 4 Options, and Correct Answer index." 
    });
  }

  const cleanDifficulty = (difficulty && difficulty.toLowerCase() === 'basic') ? 'Basic' : 'Medium';
  const newId = `${moduleId}_custom_${Date.now()}`;

  try {
    if (supabaseDb.isConfigured()) {
      const { data: maxRow } = await supabaseDb.client
        .from('questions')
        .select('question_order')
        .eq('module_id', moduleId)
        .order('question_order', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nextOrder = ((maxRow && maxRow.question_order) || 0) + 1;

      await supabaseDb.addQuestion({
        id: newId,
        module_id: moduleId,
        question_order: nextOrder,
        category: category ? category.trim() : moduleId,
        topic: topic ? topic.trim() : 'General',
        difficulty: cleanDifficulty,
        question: question.trim(),
        options: options.map(o => o.trim()),
        correct_answer: parseInt(correctAnswer),
        explanation: explanation ? explanation.trim() : 'Verified by instructor.'
      });

      const { count } = await supabaseDb.client
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', moduleId);

      return res.json({
        success: true,
        message: `Question successfully added to '${moduleId}' in Supabase database!`,
        questionId: newId,
        newTotalQuestions: count
      });
    }

    const mod = db.prepare('SELECT * FROM modules WHERE id = ?').get(moduleId);
    if (!mod) {
      return res.status(400).json({ success: false, message: "Invalid module specified." });
    }

    const maxRow = db.prepare('SELECT MAX(question_order) as maxOrder FROM questions WHERE module_id = ?').get(moduleId);
    const nextOrder = (maxRow.maxOrder || 0) + 1;

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
      explanation ? explanation.trim() : 'Verified by instructor.'
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

// DELETE QUESTION
app.delete('/api/admin/question/:id', checkAdminAuth, async (req, res) => {
  const questionId = req.params.id;

  try {
    if (supabaseDb.isConfigured()) {
      await supabaseDb.client.from('questions').delete().eq('id', questionId);
      return res.json({ success: true, message: `Question '${questionId}' deleted successfully.` });
    }

    const q = db.prepare('SELECT * FROM questions WHERE id = ?').get(questionId);
    if (!q) {
      return res.status(404).json({ success: false, message: "Question not found in database." });
    }

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

// Live Sessions Monitor
app.get('/api/admin/live-sessions', checkAdminAuth, async (req, res) => {
  try {
    if (supabaseDb.isConfigured()) {
      const activeSessions = await supabaseDb.getLiveSessions();
      const formatted = (activeSessions || []).map(s => ({
        sessionId: s.session_id,
        studentName: s.student_name,
        moduleName: s.module_name,
        roundType: s.round_type,
        batch: s.batch,
        status: s.status,
        warnings: s.warnings,
        startTime: s.start_time
      }));
      return res.json({ success: true, activeSessions: formatted });
    }

    const activeSessions = db.prepare(`
      SELECT session_id as sessionId, student_name as studentName, module_name as moduleName, round_type as roundType, batch, status, warnings, start_time as startTime 
      FROM sessions 
      WHERE status IN ('active', 'round1_complete', 'locked') 
      ORDER BY start_time DESC
    `).all();

    res.json({ success: true, activeSessions });
  } catch (err) {
    console.error('Error fetching live sessions:', err);
    res.status(500).json({ success: false, message: "Error loading sessions." });
  }
});

// Delete Result Entry
app.delete('/api/admin/result/:id', checkAdminAuth, async (req, res) => {
  try {
    if (supabaseDb.isConfigured()) {
      await supabaseDb.client.from('results').delete().eq('id', req.params.id);
    } else {
      db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id);
    }
    res.json({ success: true, message: "Result deleted from database." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting result." });
  }
});

// Submit HR Assessment Score (Round 3 GD /25 + Round 4 Interview /25 = HR /50, Grand Total /100)
app.post('/api/admin/hr-score', checkAdminAuth, async (req, res) => {
  const { resultId, gdScore, interviewScore, remarks } = req.body;

  if (!resultId) {
    return res.status(400).json({ success: false, message: "Result ID is required." });
  }

  const parsedGd = Math.max(0, Math.min(25, parseInt(gdScore, 10) || 0));
  const parsedInterview = Math.max(0, Math.min(25, parseInt(interviewScore, 10) || 0));
  const cleanRemarks = (remarks || '').trim();

  try {
    let hrAssessment;
    if (supabaseDb.isConfigured()) {
      hrAssessment = await supabaseDb.saveHrScore(resultId, {
        gdScore: parsedGd,
        interviewScore: parsedInterview,
        remarks: cleanRemarks
      });
    } else {
      const row = db.prepare('SELECT * FROM results WHERE id = ?').get(resultId);
      if (!row) {
        return res.status(404).json({ success: false, message: "Candidate result record not found." });
      }

      const hrTotal = parsedGd + parsedInterview;
      const quizScore = row.score || 0;
      const grandTotal = quizScore + hrTotal;
      const grandPercentage = Number(((grandTotal / 100) * 100).toFixed(1));
      const scoredAt = new Date().toISOString();
      const status = 'completed';

      hrAssessment = {
        gdScore: parsedGd,
        interviewScore: parsedInterview,
        hrTotal,
        grandTotal,
        grandPercentage,
        remarks: cleanRemarks,
        scoredAt,
        status
      };

      let logs = {};
      try {
        logs = typeof row.violation_logs === 'object' ? (row.violation_logs || {}) : JSON.parse(row.violation_logs || '{}');
      } catch (e) { logs = {}; }
      logs.hrAssessment = hrAssessment;

      db.prepare(`
        UPDATE results SET 
          gd_score = ?, 
          interview_score = ?, 
          hr_total_score = ?, 
          grand_total_score = ?, 
          grand_percentage = ?, 
          hr_remarks = ?, 
          hr_status = ?, 
          hr_scored_at = ?,
          violation_logs = ?
        WHERE id = ?
      `).run(
        parsedGd, 
        parsedInterview, 
        hrTotal, 
        grandTotal, 
        grandPercentage, 
        cleanRemarks, 
        status, 
        scoredAt, 
        JSON.stringify(logs), 
        resultId
      );
    }

    res.json({
      success: true,
      message: `HR evaluation successfully saved! Grand Total: ${hrAssessment.grandTotal}/100.`,
      hrAssessment
    });
  } catch (err) {
    console.error('HR Score save error:', err);
    res.status(500).json({ success: false, message: "Error saving HR assessment marks." });
  }
});

// Export Leaderboard to CSV (Includes Round 1 Aptitude, Round 2 Tech, GD, Interview, Grand Total)
app.get('/api/admin/export-csv', checkAdminAuth, async (req, res) => {
  try {
    let rows = [];
    if (supabaseDb.isConfigured()) {
      rows = await supabaseDb.getLeaderboard();
    } else {
      rows = db.prepare(`
        SELECT * FROM results 
        ORDER BY percentage DESC, score DESC, time_taken_seconds ASC
      `).all();
    }

    let csv = "Rank,Student Name,Center / Branch,Round 1 (Aptitude /20),Round 2 (Technical /30),Quiz Score (/50),Round 3 GD (/25),Round 4 Interview (/25),HR Total (/50),Grand Total (/100),Grand %,HR Status,HR Remarks,Selected Topics,Time Taken,Warnings,Auto Submitted,Submitted At\n";

    rows.forEach((r, idx) => {
      let topics = '';
      try {
        const parsed = Array.isArray(r.selected_topics) ? r.selected_topics : JSON.parse(r.selected_topics || '[]');
        topics = parsed.join('; ');
      } catch(e) {}

      let hr = null;
      try {
        const logs = typeof r.violation_logs === 'object' ? r.violation_logs : JSON.parse(r.violation_logs || '{}');
        if (logs && logs.hrAssessment) hr = logs.hrAssessment;
      } catch(e) {}

      const gdScore = hr?.gdScore ?? r.gd_score ?? '';
      const interviewScore = hr?.interviewScore ?? r.interview_score ?? '';
      const hrTotal = hr?.hrTotal ?? r.hr_total_score ?? (gdScore !== '' && interviewScore !== '' ? (Number(gdScore) + Number(interviewScore)) : '');
      const grandTotal = hr?.grandTotal ?? r.grand_total_score ?? (hrTotal !== '' ? (r.score + Number(hrTotal)) : r.score);
      const grandPercentage = hr?.grandPercentage ?? r.grand_percentage ?? (hrTotal !== '' ? Number(((grandTotal / 100) * 100).toFixed(1)) : r.percentage);
      const hrStatus = hr?.status || r.hr_status || (hrTotal !== '' ? 'completed' : 'pending');
      const hrRemarks = hr?.remarks || r.hr_remarks || '';

      const row = [
        idx + 1,
        `"${(r.student_name || '').replace(/"/g, '""')}"`,
        `"${(r.batch || 'Sivakasi').replace(/"/g, '""')}"`,
        r.round1_score || 0,
        r.round2_score || 0,
        r.score,
        gdScore !== '' ? gdScore : '-',
        interviewScore !== '' ? interviewScore : '-',
        hrTotal !== '' ? hrTotal : '-',
        grandTotal,
        `${grandPercentage}%`,
        hrStatus.toUpperCase(),
        `"${hrRemarks.replace(/"/g, '""')}"`,
        `"${topics}"`,
        `"${r.time_taken_formatted || ''}"`,
        r.warnings_count || 0,
        r.auto_submitted ? "YES" : "NO",
        `"${r.submitted_at}"`
      ].join(",");
      csv += row + "\n";
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('WEGROW_MNC_Exam_Grand_Leaderboard.csv');
    res.send(csv);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).send("Error generating CSV.");
  }
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
  console.log(`🚀 WEGROW MNC Examination Platform`);
  console.log(`📍 Local URL:     http://localhost:${PORT}`);
  console.log(`👨‍🏫 Admin Portal: http://localhost:${PORT}/admin.html`);
  console.log(`⚡ Database:      ${supabaseDb.isConfigured() ? 'SUPABASE CLOUD (PostgreSQL)' : 'Local SQLite (Fallback)'}`);
  console.log(`=======================================================`);
});
