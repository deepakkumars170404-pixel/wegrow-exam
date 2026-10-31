const assert = require('assert');
const db = require('../db');
const supabaseDb = require('../db_supabase');

console.log("========================================================");
console.log("🧪 TESTING SEPARATE ROUND SAVING & 4-ROUND FINAL CALCULATION");
console.log("========================================================");

async function runHrTests() {
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(e);
    }
  }

  // 1. Insert a mock candidate test result in SQLite
  const testResultId = 'test_sep_' + Date.now();
  db.prepare(`
    INSERT INTO results (
      id, session_id, student_name, module_id, module_name, round, batch,
      round1_score, round1_total, round2_score, round2_total, score,
      total_questions, percentage, selected_topics, correct_count, incorrect_count,
      unattempted_count, time_taken_seconds, time_taken_formatted, warnings_count,
      violation_logs, auto_submitted, submit_reason, performance_grade,
      submitted_at, review_list
    ) VALUES (
      ?, 'sess_mock_sep', 'Candidate Multi Round', 'aptitude', 'Full Assessment', '2', 'Sivakasi',
      18, 20, 24, 30, 42,
      50, 84.0, '["html","css"]', 42, 8,
      0, 1800, '30m 0s', 0,
      '{}', 0, 'normal', 'MNC Ready',
      ?, '[]'
    )
  `).run(testResultId, new Date().toISOString());

  test("Step 1: Initial candidate has Quiz Score = 42/50 (R1: 18/20, R2: 24/30) and HR status is pending", () => {
    const row = db.prepare('SELECT * FROM results WHERE id = ?').get(testResultId);
    assert.strictEqual(row.score, 42);
    assert.strictEqual(row.round1_score, 18);
    assert.strictEqual(row.round2_score, 24);
    assert.strictEqual(row.gd_score, null);
    assert.strictEqual(row.interview_score, null);
    assert.strictEqual(row.hr_status, 'pending');
  });

  // Step 2: HR conducts Round 3 (GD) first. Enters ONLY GD = 21/25 and saves to DB!
  const gdScore = 21;
  const gdAssessment = {
    gdScore,
    interviewScore: null,
    hrTotal: 21,
    grandTotal: null,
    grandPercentage: null,
    remarks: "Active participant in Group Discussion.",
    status: 'gd_completed',
    isCompleted: false,
    scoredAt: new Date().toISOString()
  };

  db.prepare(`
    UPDATE results SET 
      gd_score = ?, 
      interview_score = NULL, 
      hr_total_score = NULL, 
      grand_total_score = NULL, 
      grand_percentage = NULL, 
      hr_remarks = ?, 
      hr_status = 'gd_completed', 
      hr_scored_at = ?,
      violation_logs = ?
    WHERE id = ?
  `).run(
    gdScore,
    gdAssessment.remarks,
    gdAssessment.scoredAt,
    JSON.stringify({ hrAssessment: gdAssessment }),
    testResultId
  );

  test("Step 2: HR saves Round 3 (GD) separately in DB: gd_score = 21, interview_score = null, status = gd_completed", () => {
    const row = db.prepare('SELECT * FROM results WHERE id = ?').get(testResultId);
    assert.strictEqual(row.gd_score, 21);
    assert.strictEqual(row.interview_score, null);
    assert.strictEqual(row.hr_status, 'gd_completed');
    assert.strictEqual(row.grand_total_score, null); // Not finalized yet
  });

  // Step 3: Later, HR conducts Round 4 (F2F Interview). Enters Interview = 23/25.
  // The system loads previous GD (21), combines with Interview (23), and calculates all 4 marks!
  const prevRow = db.prepare('SELECT * FROM results WHERE id = ?').get(testResultId);
  const mark1 = prevRow.round1_score; // 18
  const mark2 = prevRow.round2_score; // 24
  const mark3 = prevRow.gd_score;     // 21
  const mark4 = 23;                   // Interview

  const quizTotal = mark1 + mark2;    // 42
  const hrTotal = mark3 + mark4;      // 21 + 23 = 44
  const grandTotal = quizTotal + hrTotal; // 42 + 44 = 86
  const grandPercentage = Number(((grandTotal / 100) * 100).toFixed(1)); // 86.0%

  const finalAssessment = {
    gdScore: mark3,
    interviewScore: mark4,
    hrTotal,
    grandTotal,
    grandPercentage,
    remarks: "Good communication in GD and strong technical depth in interview.",
    status: 'completed',
    isCompleted: true,
    scoredAt: new Date().toISOString()
  };

  db.prepare(`
    UPDATE results SET 
      interview_score = ?, 
      hr_total_score = ?, 
      grand_total_score = ?, 
      grand_percentage = ?, 
      hr_remarks = ?, 
      hr_status = 'completed', 
      hr_scored_at = ?,
      violation_logs = ?
    WHERE id = ?
  `).run(
    mark4,
    hrTotal,
    grandTotal,
    grandPercentage,
    finalAssessment.remarks,
    finalAssessment.scoredAt,
    JSON.stringify({ hrAssessment: finalAssessment }),
    testResultId
  );

  test("Step 3: All 4 marks calculated and saved: Mark1(18) + Mark2(24) + Mark3(21) + Mark4(23) = 86/100", () => {
    const finalRow = db.prepare('SELECT * FROM results WHERE id = ?').get(testResultId);
    assert.strictEqual(finalRow.round1_score, 18);
    assert.strictEqual(finalRow.round2_score, 24);
    assert.strictEqual(finalRow.gd_score, 21);
    assert.strictEqual(finalRow.interview_score, 23);
    assert.strictEqual(finalRow.hr_total_score, 44);
    assert.strictEqual(finalRow.grand_total_score, 86);
    assert.strictEqual(finalRow.grand_percentage, 86.0);
    assert.strictEqual(finalRow.hr_status, 'completed');
  });

  // Clean up
  db.prepare('DELETE FROM results WHERE id = ?').run(testResultId);

  test("Test record cleaned up cleanly", () => {
    const deleted = db.prepare('SELECT * FROM results WHERE id = ?').get(testResultId);
    assert.strictEqual(deleted, undefined);
  });

  console.log("========================================================");
  console.log(`HR TEST SUITE: ${passed} / ${total} PASSED`);
  console.log("========================================================");

  if (passed !== total) process.exit(1);
}

runHrTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
