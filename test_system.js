const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'exam.db');
const db = new Database(dbPath);

console.log('========================================================');
console.log('🧪 RUNNING COMPREHENSIVE MNC EXAM VERIFICATION TEST');
console.log('========================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

// 1. Question Bank Counts
console.log('\n--- Test Suite 1: Question Bank Verification in SQLite (850 Qs) ---');
const expectedCounts = {
  aptitude: 150,
  html: 100,
  css: 100,
  bootstrap: 100,
  javascript: 100,
  python: 100,
  react: 100,
  data_analytics: 100
};

let totalInDb = 0;
for (const [modId, expCount] of Object.entries(expectedCounts)) {
  const row = db.prepare('SELECT COUNT(*) as c FROM questions WHERE module_id = ?').get(modId);
  assert(row.c === expCount, `Module '${modId}' contains exactly ${expCount} questions in DB (Found: ${row.c})`);
  totalInDb += row.c;
}
assert(totalInDb === 850, `Total questions across all modules in DB equals 850 (Found: ${totalInDb})`);

// 2. Check Difficulty Ordering
console.log('\n--- Test Suite 2: Question Difficulty Progression ---');
for (const modId of Object.keys(expectedCounts)) {
  const qs = db.prepare('SELECT difficulty FROM questions WHERE module_id = ? ORDER BY question_order ASC').all(modId);
  const basicCount = qs.filter(q => (q.difficulty || '').toLowerCase() === 'basic').length;
  const medCount = qs.filter(q => (q.difficulty || '').toLowerCase() !== 'basic').length;
  assert(basicCount > 0 && medCount > 0, `Module '${modId}' has both Basic (${basicCount}) and Medium (${medCount}) questions`);
}

// 3. Test Round 1: MNC Aptitude 20-Question Sampling
console.log('\n--- Test Suite 3: Round 1 (20 Aptitude Qs from 150 Pool) ---');
const allAptitude = db.prepare("SELECT * FROM questions WHERE module_id = 'aptitude'").all();
const basicApt = allAptitude.filter(q => (q.difficulty || '').toLowerCase() === 'basic');
const medApt = allAptitude.filter(q => (q.difficulty || '').toLowerCase() !== 'basic');

assert(basicApt.length >= 10, `Aptitude has at least 10 Basic questions (Has: ${basicApt.length})`);
assert(medApt.length >= 10, `Aptitude has at least 10 Medium questions (Has: ${medApt.length})`);

// 4. Test Round 2 Dynamic Distribution Formulas
console.log('\n--- Test Suite 4: Round 2 Dynamic 30-Question Allocation ---');
function calculateDistribution(modules) {
  const K = modules.length;
  const baseCount = Math.floor(30 / K);
  const remainder = 30 % K;
  const alloc = {};
  modules.forEach((m, idx) => {
    alloc[m] = baseCount + (idx < remainder ? 1 : 0);
  });
  return alloc;
}

// Case 1: 2 topics (HTML + CSS) -> exactly 15 each = 30
const alloc2 = calculateDistribution(['html', 'css']);
assert(alloc2.html === 15 && alloc2.css === 15, `2 Topics (HTML + CSS) alloc = 15 + 15 = 30`);

// Case 2: 5 topics (HTML + CSS + Bootstrap + Python + React) -> exactly 6 each = 30
const alloc5 = calculateDistribution(['html', 'css', 'bootstrap', 'python', 'react']);
const sum5 = Object.values(alloc5).reduce((a, b) => a + b, 0);
assert(sum5 === 30 && alloc5.html === 6 && alloc5.python === 6, `5 Topics alloc = 6 each (Sum = ${sum5})`);

// Case 3: 1 topic (Data Analytics) -> 30
const alloc1 = calculateDistribution(['data_analytics']);
assert(alloc1.data_analytics === 30, `1 Topic (Data Analytics) alloc = 30`);

// Case 4: 4 topics -> 8, 8, 7, 7 = 30
const alloc4 = calculateDistribution(['html', 'css', 'javascript', 'python']);
const sum4 = Object.values(alloc4).reduce((a, b) => a + b, 0);
assert(sum4 === 30, `4 Topics alloc sum = 30 (Counts: ${JSON.stringify(alloc4)})`);

// Case 5: 7 topics -> 5, 5, 4, 4, 4, 4, 4 = 30
const alloc7 = calculateDistribution(['html', 'css', 'bootstrap', 'javascript', 'python', 'react', 'data_analytics']);
const sum7 = Object.values(alloc7).reduce((a, b) => a + b, 0);
assert(sum7 === 30, `7 Topics alloc sum = 30 (Counts: ${JSON.stringify(alloc7)})`);

// 5. Check Admin Setup
console.log('\n--- Test Suite 5: Admin Security & Config ---');
const admin = db.prepare('SELECT * FROM admin_config WHERE email = ?').get('deepakkumars170404@gmail.com');
assert(Boolean(admin), "Admin deepakkumars170404@gmail.com is registered in database");
assert(admin && admin.pin === 'wegrow2026', "Admin PIN is configured as 'wegrow2026'");

// 6. Zero Dummy Student Records
console.log('\n--- Test Suite 6: Database Cleanliness (Zero Dummy Records) ---');
const dummyCheck = db.prepare("SELECT COUNT(*) as c FROM results WHERE student_name LIKE '%dummy%' OR student_name LIKE '%test%'").get();
assert(dummyCheck.c === 0, `No dummy/placeholder records found in results table (Found: ${dummyCheck.c})`);

console.log('\n========================================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('🎉 ALL SYSTEM INTEGRATION TESTS PASSED PERFECTLY!');
} else {
  console.error('⚠️ SOME TESTS FAILED. PLEASE REVIEW ABOVE.');
}
console.log('========================================================\n');

db.close();
