const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('[DB INIT] Initializing SQLite connection...');

const isLinux = process.platform === 'linux' || !!process.env.RENDER;
let DB_PATH = process.env.DB_PATH;

if (!DB_PATH) {
  if (isLinux) {
    DB_PATH = path.join('/tmp', 'exam.db');
  } else {
    DB_PATH = path.join(__dirname, 'data', 'exam.db');
  }
}

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const localSeedDb = path.join(__dirname, 'data', 'exam.db');

// If DB doesn't exist at DB_PATH, either copy from pre-built seed or generate fresh
if (!fs.existsSync(DB_PATH)) {
  if (fs.existsSync(localSeedDb) && DB_PATH !== localSeedDb) {
    console.log(`[DB INIT] Copying pre-built database from ${localSeedDb} to ${DB_PATH}...`);
    try {
      fs.copyFileSync(localSeedDb, DB_PATH);
    } catch (err) {
      console.warn('[DB INIT] Copy failed, will generate fresh:', err.message);
    }
  }

  if (!fs.existsSync(DB_PATH)) {
    console.log(`[DB INIT] Generating fresh native database at ${DB_PATH} from question bank...`);
    const loadAllToDb = require('./generators/load_all_to_db');
    if (typeof loadAllToDb === 'function') {
      loadAllToDb(DB_PATH);
    }
  }
}

console.log('[DB INIT] Active DB Path:', DB_PATH);
const db = new Database(DB_PATH);

// High concurrency tuning for 100+ concurrent students
try {
  db.pragma('journal_mode = WAL');
  db.pragma('busy_timeout = 10000');
  db.pragma('synchronous = NORMAL');
} catch (e) {
  console.warn('[DB WARNING] Pragmas fallback:', e.message);
}

// -------------------------------------------------------------
// DATABASE SCHEMA DEFINITION
// -------------------------------------------------------------
db.exec(`
  -- 1. Modules Table
  CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    round TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    badge_color TEXT NOT NULL
  );

  -- 2. Questions Bank Table
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    question_order INTEGER NOT NULL,
    category TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,       -- 'Basic' or 'Medium'
    question TEXT NOT NULL,
    options TEXT NOT NULL,           -- JSON array of 4 options
    correct_answer INTEGER NOT NULL, -- 0, 1, 2, or 3
    explanation TEXT NOT NULL,
    FOREIGN KEY(module_id) REFERENCES modules(id)
  );

  -- 3. Active Sessions Table (Proctoring & Anti-Cheat)
  CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    batch TEXT NOT NULL,
    module_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    round_type TEXT NOT NULL DEFAULT 'round1',
    selected_modules TEXT,
    round1_score INTEGER DEFAULT 0,
    round1_total INTEGER DEFAULT 20,
    round2_score INTEGER DEFAULT 0,
    round2_total INTEGER DEFAULT 30,
    total_score INTEGER DEFAULT 0,
    total_possible INTEGER DEFAULT 50,
    start_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status TEXT NOT NULL,             -- 'active', 'round1_complete', 'locked', 'completed'
    warnings INTEGER DEFAULT 0,
    violation_logs TEXT,             -- JSON array of violations
    question_order TEXT,             -- JSON array of question IDs
    completed_at TEXT
  );

  -- 4. Results & Leaderboard Table (No dummy records!)
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
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage REAL NOT NULL,
    selected_topics TEXT,
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

  -- 5. Re-Exam Permits Table
  CREATE TABLE IF NOT EXISTS reexam_permits (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    module_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    granted_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    used_at TEXT
  );

  -- 6. Admin Configuration
  CREATE TABLE IF NOT EXISTS admin_config (
    email TEXT PRIMARY KEY,
    pin TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL
  );
`);

// Alter existing tables if needed
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
alterTable('sessions', 'question_order TEXT');

alterTable('results', 'round1_score INTEGER NOT NULL DEFAULT 0');
alterTable('results', 'round1_total INTEGER NOT NULL DEFAULT 20');
alterTable('results', 'round2_score INTEGER NOT NULL DEFAULT 0');
alterTable('results', 'round2_total INTEGER NOT NULL DEFAULT 30');
alterTable('results', 'selected_topics TEXT');

// Admin Configuration
const adminEmail = process.env.ADMIN_EMAIL || "deepakkumars170404@gmail.com";
const adminPin = process.env.ADMIN_PIN || "wegrow2026";
db.prepare(`
  INSERT OR IGNORE INTO admin_config (email, pin, name, role)
  VALUES (?, ?, ?, ?)
`).run(adminEmail, adminPin, "Lead Instructor", "Exam Administrator");

// All 8 Modules
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
    subtitle: "Box Model, Flexbox, Grid, Specificity, Transitions & Layouts (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-sky-600"
  },
  {
    id: "bootstrap",
    name: "Round 2: Bootstrap 5 Framework",
    round: "Round 2 - Technical Elective",
    subtitle: "Grid System, Utilities, Breakpoints, Responsive Design & Components (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-purple-600"
  },
  {
    id: "javascript",
    name: "Round 2: JavaScript Mastery",
    round: "Round 2 - Technical Elective",
    subtitle: "ES6+, Scope, Closures, Async/Await, Promises & DOM Events (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-yellow-600"
  },
  {
    id: "python",
    name: "Round 2: Python Programming",
    round: "Round 2 - Technical Elective",
    subtitle: "Syntax, Conditionals, Loops, Data Structures & Exceptions (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-emerald-600"
  },
  {
    id: "react",
    name: "Round 2: React.js Essentials",
    round: "Round 2 - Technical Elective",
    subtitle: "Hooks, Virtual DOM, Components, Props/State, Routing & Batching (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-cyan-600"
  },
  {
    id: "data_analytics",
    name: "Round 2: Data Analytics & Python Track",
    round: "Round 2 - Specialization Elective",
    subtitle: "Python (Conditionals), Full Excel, EDA, Analytics Types & Analyst Roles (100 Pool)",
    total_questions: 100,
    duration_minutes: 30,
    badge_color: "bg-teal-600"
  },
  {
    id: "data_science",
    name: "Round 2: Data Science (Python, NumPy, Pandas)",
    round: "Round 2 - Specialization Elective",
    subtitle: "Python for Data Science, NumPy Arrays & Vectorization, Pandas DataFrames & Cleaning (120 Pool)",
    total_questions: 120,
    duration_minutes: 30,
    badge_color: "bg-indigo-600"
  }
];

const insertModule = db.prepare(`
  INSERT OR REPLACE INTO modules (id, name, round, subtitle, total_questions, duration_minutes, badge_color)
  VALUES (@id, @name, @round, @subtitle, @total_questions, @duration_minutes, @badge_color)
`);

const insertManyModules = db.transaction((mods) => {
  for (const m of mods) insertModule.run(m);
});
insertManyModules(modulesData);

module.exports = db;
