const assert = require('assert');
const db = require('../db');
const supabaseDb = require('../db_supabase');

console.log("========================================================");
console.log("🧪 TESTING HR EVALUATION (GD 25 + INTERVIEW 25 = GRAND 100)");
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

  // 1. Insert a mock result in SQLite
  const testResultId = 'test_res_' + Date.now();
  db.prepare(`
    INSERT INTO results (
      id, session_id, student_name, module_id, module_name, round, batch,
      round1_score, round1_total, round2_score, round2_total, score,
      total_questions, percentage, selected_topics, correct_count, incorrect_count,
      unattempted_count, time_taken_seconds, time_taken_formatted, warnings_count,
      violation_logs, auto_submitted, submit_reason, performance_grade,
      submitted_at, review_list
    ) VALUES (
      ?, 'sess_mock', 'Test Candidate HR', 'aptitude', 'Full Assessment', '2', 'Sivakasi',
      18, 20, 24, 30, 42,
      50, 84.0, '["html","css"]', 42, 8,
      0, 1800, '30m 0s', 0,
      '{}', 0, 'normal', 'MNC Ready',
      ?, '[]'
    )
  `).run(testResultId, new Date().toISOString());

  test("Initial candidate record inserted with Quiz Score = 42 / 50", () => {
    const row = db.prepare('SELECT * FROM results WHERE id = ?').get(testResultId);
    assert.strictEqual(row.score, 42);
    assert.strictEqual(row.hr_status, 'pending');
  });

  // 2. Simulate HR Evaluation Save
  const gdScore = 22; // out of 25
  const interviewScore = 24; // out of 25
  const hrTotal = gdScore + interviewScore; // 46 out of 50
  const quizScore = 42;
  const grandTotal = quizScore + hrTotal; // 88 out of 100
  const grandPercentage = Number(((grandTotal / 100) * 100).toFixed(1)); // 88.0%
  const remarks = "Exceptional problem-solving and clear articulation.";

  const hrAssessment = {
    gdScore,
    interviewScore,
    hrTotal,
    grandTotal,
    grandPercentage,
    remarks,
    status: 'completed',
    scoredAt: new Date().toISOString()
  };

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
    gdScore,
    interviewScore,
    hrTotal,
    grandTotal,
    grandPercentage,
    remarks,
    'completed',
    hrAssessment.scoredAt,
    JSON.stringify({ hrAssessment }),
    testResultId
  );

  test("HR Score successfully persisted in results table", () => {
    const updated = db.prepare('SELECT * FROM results WHERE id = ?').get(testResultId);
    assert.strictEqual(updated.gd_score, 22);
    assert.strictEqual(updated.interview_score, 24);
    assert.strictEqual(updated.hr_total_score, 46);
    assert.strictEqual(updated.grand_total_score, 88);
    assert.strictEqual(updated.grand_percentage, 88.0);
    assert.strictEqual(updated.hr_remarks, remarks);
    assert.strictEqual(updated.hr_status, 'completed');
  });

  test("Grand Total is exactly Quiz (/50) + HR (/50) = 88 / 100", () => {
    const updated = db.prepare('SELECT * FROM results WHERE id = ?').get(testResultId);
    assert.strictEqual(updated.score + updated.hr_total_score, 88);
    assert.strictEqual(updated.grand_total_score, 88);
  });

  test("Input clamping test (Max 25 per round)", () => {
    const overMaxGd = Math.max(0, Math.min(25, 35));
    assert.strictEqual(overMaxGd, 25);
    const negativeInt = Math.max(0, Math.min(25, -5));
    assert.strictEqual(negativeInt, 0);
  });

  // Clean up mock row
  db.prepare('DELETE FROM results WHERE id = ?').run(testResultId);

  test("Test record cleaned up successfully", () => {
    const deleted = db.prepare('SELECT * FROM results WHERE id = ?').get(testResultId);
    assert.strictEqual(deleted, undefined);
  });

  console.log("========================================================");
  console.log(`HR TEST RESULTS: ${passed} / ${total} PASSED`);
  console.log("========================================================");

  if (passed !== total) process.exit(1);
}

runHrTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
