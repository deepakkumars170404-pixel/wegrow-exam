const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

function loadAllToDb(customDbPath) {
  const dbPath = customDbPath || path.join(__dirname, '..', 'data', 'exam.db');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  console.log(`--- Initializing Database at ${dbPath} & Loading All 850 Questions ---`);

// 1. Ensure schema
db.exec(`
  CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    round TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    badge_color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    category TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correct_answer INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    FOREIGN KEY(module_id) REFERENCES modules(id)
  );

  CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    batch TEXT NOT NULL,
    module_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    round_type TEXT NOT NULL DEFAULT 'round1', -- 'round1', 'round2', 'combined'
    selected_modules TEXT,                     -- JSON array for round 2
    round1_score INTEGER DEFAULT 0,
    round1_total INTEGER DEFAULT 20,
    round2_score INTEGER DEFAULT 0,
    round2_total INTEGER DEFAULT 30,
    total_score INTEGER DEFAULT 0,
    total_possible INTEGER DEFAULT 50,
    start_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status TEXT NOT NULL,                      -- 'active', 'round1_complete', 'locked', 'completed'
    warnings INTEGER DEFAULT 0,
    violation_logs TEXT,
    question_order TEXT,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS results (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    module_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    round TEXT NOT NULL,
    batch TEXT NOT NULL,
    round1_score INTEGER NOT NULL DEFAULT 0,
    round1_total INTEGER NOT NULL DEFAULT 20,
    round2_score INTEGER NOT NULL DEFAULT 0,
    round2_total INTEGER NOT NULL DEFAULT 30,
    score INTEGER NOT NULL,                     -- Total score
    total_questions INTEGER NOT NULL,           -- Total possible (50)
    percentage REAL NOT NULL,
    selected_topics TEXT,                       -- JSON array of selected topics
    correct_count INTEGER NOT NULL,
    incorrect_count INTEGER NOT NULL,
    unattempted_count INTEGER NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    time_taken_formatted TEXT NOT NULL,
    warnings_count INTEGER NOT NULL,
    violation_logs TEXT,
    auto_submitted INTEGER NOT NULL,
    submit_reason TEXT,
    performance_grade TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    review_list TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reexam_permits (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    module_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    granted_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    used_at TEXT
  );

  CREATE TABLE IF NOT EXISTS admin_config (
    email TEXT PRIMARY KEY,
    pin TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  );
`);

// Add new columns to existing sessions / results if missing
const alterTable = (table, colDef) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
  } catch (e) {
    // Column already exists
  }
};

alterTable('sessions', "round_type TEXT NOT NULL DEFAULT 'round1'");
alterTable('sessions', 'selected_modules TEXT');
alterTable('sessions', 'round1_score INTEGER DEFAULT 0');
alterTable('sessions', 'round1_total INTEGER DEFAULT 20');
alterTable('sessions', 'round2_score INTEGER DEFAULT 0');
alterTable('sessions', 'round2_total INTEGER DEFAULT 30');
alterTable('sessions', 'total_score INTEGER DEFAULT 0');
alterTable('sessions', 'total_possible INTEGER DEFAULT 50');

alterTable('results', 'round1_score INTEGER NOT NULL DEFAULT 0');
alterTable('results', 'round1_total INTEGER NOT NULL DEFAULT 20');
alterTable('results', 'round2_score INTEGER NOT NULL DEFAULT 0');
alterTable('results', 'round2_total INTEGER NOT NULL DEFAULT 30');
alterTable('results', 'selected_topics TEXT');

// Ensure admin credentials
const adminEmail = process.env.ADMIN_EMAIL || "deepakkumars170404@gmail.com";
const adminPin = process.env.ADMIN_PIN || "wegrow2026";
db.prepare(`
  INSERT OR REPLACE INTO admin_config (email, pin, name, role)
  VALUES (?, ?, ?, ?)
`).run(adminEmail, adminPin, "Lead Instructor", "Exam Administrator");

// 2. Define All 8 Modules
const modulesData = [
  {
    id: "aptitude",
    name: "Round 1: MNC Aptitude Assessment",
    round: "Round 1 - Compulsory",
    subtitle: "Quantitative Aptitude, Logical Reasoning & Verbal Ability (150 Bank, 20 Random per student)",
    total_questions: 20,
    duration_minutes: 25,
    badge_color: "bg-blue-600"
  },
  {
    id: "html",
    name: "Round 2: HTML Core to Medium",
    round: "Round 2 - Technical Elective",
    subtitle: "Semantic Tags, Forms, Tables, DOM Elements & HTML5 Standards (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-orange-600"
  },
  {
    id: "css",
    name: "Round 2: CSS Core to Medium",
    round: "Round 2 - Technical Elective",
    subtitle: "Box Model, Flexbox, Grid, Specificity, Animations & Modern Layouts (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-sky-600"
  },
  {
    id: "bootstrap",
    name: "Round 2: Bootstrap 5 Framework",
    round: "Round 2 - Technical Elective",
    subtitle: "Grid System, Utilities, Breakpoints, Responsive Design & UI Components (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-purple-600"
  },
  {
    id: "javascript",
    name: "Round 2: JavaScript Mastery",
    round: "Round 2 - Technical Elective",
    subtitle: "ES6+, Scope, Closures, Async/Await, Promises & DOM Event Handling (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-yellow-600"
  },
  {
    id: "python",
    name: "Round 2: Python Programming",
    round: "Round 2 - Technical Elective",
    subtitle: "Data Types, Conditionals, Loops, Functions, Collections & Exceptions (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-emerald-600"
  },
  {
    id: "react",
    name: "Round 2: React.js Essentials",
    round: "Round 2 - Technical Elective",
    subtitle: "Hooks, Virtual DOM, Components, Props/State, Router & Architecture (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-cyan-600"
  },
  {
    id: "data_analytics",
    name: "Round 2: Data Analytics & Python Track",
    round: "Round 2 - Specialization Elective",
    subtitle: "Python (Conditionals), Full Excel, EDA, Analytics Types & Analyst Role (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-teal-600"
  }
];

const insertModule = db.prepare(`
  INSERT OR REPLACE INTO modules (id, name, round, subtitle, total_questions, duration_minutes, badge_color)
  VALUES (@id, @name, @round, @subtitle, @total_questions, @duration_minutes, @badge_color)
`);

const insertModulesTx = db.transaction((mods) => {
  for (const m of mods) insertModule.run(m);
});
insertModulesTx(modulesData);
console.log(`Loaded ${modulesData.length} modules into modules table.`);

// 3. Clear and Reload all questions from JSON files
db.exec('DELETE FROM questions');

const insertQuestion = db.prepare(`
  INSERT INTO questions (
    id, module_id, question_order, category, topic, difficulty, question, options, correct_answer, explanation
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const loadModuleQuestions = db.transaction((modId, fileName) => {
  const filePath = path.join(__dirname, '..', 'data', 'questions', fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`File missing: ${filePath}`);
    return 0;
  }
  const qList = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Sort: Basic first, then Medium!
  qList.sort((a, b) => {
    const diffA = (a.difficulty || '').toLowerCase() === 'basic' ? 1 : 2;
    const diffB = (b.difficulty || '').toLowerCase() === 'basic' ? 1 : 2;
    return diffA - diffB;
  });

  qList.forEach((q, idx) => {
    insertQuestion.run(
      q.id,
      modId,
      idx + 1,
      q.category || modId,
      q.topic || q.category || modId,
      q.difficulty || (idx < qList.length / 2 ? "Basic" : "Medium"),
      q.question,
      JSON.stringify(q.options),
      q.correctAnswer,
      q.explanation
    );
  });
  return qList.length;
});

const fileMap = {
  aptitude: 'aptitude.json',
  html: 'html.json',
  css: 'css.json',
  bootstrap: 'bootstrap.json',
  javascript: 'javascript.json',
  python: 'python.json',
  react: 'react.json',
  data_analytics: 'data_analytics.json'
};

let totalQuestionsLoaded = 0;
for (const [modId, fileName] of Object.entries(fileMap)) {
  const count = loadModuleQuestions(modId, fileName);
  console.log(`Loaded ${count.toString().padStart(3)} questions for module [${modId}]`);
  totalQuestionsLoaded += count;
}

console.log('----------------------------------------------------');
console.log(`TOTAL QUESTIONS INSERTED INTO DB: ${totalQuestionsLoaded}`);

// Verify counts in DB
const counts = db.prepare('SELECT module_id, COUNT(*) as c FROM questions GROUP BY module_id').all();
console.log('Database questions by module:', counts);

// Clean any dummy student records
const dummyStudentClean = db.prepare("DELETE FROM results WHERE student_name LIKE '%dummy%' OR student_name LIKE '%test%'").run();
console.log(`Cleaned ${dummyStudentClean.changes} dummy test records from results.`);

db.close();
  console.log('Database setup complete!');
  return dbPath;
}

if (require.main === module) {
  loadAllToDb();
}

module.exports = loadAllToDb;


