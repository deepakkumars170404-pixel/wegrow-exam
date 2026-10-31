-- =============================================================
-- WEGROW EXAMINATION PLATFORM: SUPABASE POSTGRESQL SCHEMA
-- =============================================================

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

-- 2. Questions Bank Table (850 Questions)
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  category TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,       -- 'Basic' or 'Medium'
  question TEXT NOT NULL,
  options JSONB NOT NULL,          -- Array of 4 options
  correct_answer INTEGER NOT NULL, -- 0, 1, 2, or 3
  explanation TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_module ON questions(module_id);
CREATE INDEX IF NOT EXISTS idx_questions_diff ON questions(module_id, difficulty);

-- 3. Sessions Table (Active exam tracking & anti-cheating)
CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  batch TEXT NOT NULL,
  module_id TEXT NOT NULL,
  module_name TEXT NOT NULL,
  round_type TEXT NOT NULL DEFAULT 'round1',
  selected_modules JSONB,
  round1_score INTEGER DEFAULT 0,
  round1_total INTEGER DEFAULT 20,
  round2_score INTEGER DEFAULT 0,
  round2_total INTEGER DEFAULT 30,
  total_score INTEGER DEFAULT 0,
  total_possible INTEGER DEFAULT 50,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL,             -- 'active', 'round1_complete', 'locked', 'completed'
  warnings INTEGER DEFAULT 0,
  violation_logs JSONB DEFAULT '[]'::jsonb,
  question_order JSONB,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_student ON sessions(LOWER(student_name));
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

-- 4. Results Table (Final evaluated student results)
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
  selected_topics JSONB,
  correct_count INTEGER NOT NULL,
  incorrect_count INTEGER NOT NULL,
  unattempted_count INTEGER NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  time_taken_formatted TEXT NOT NULL,
  warnings_count INTEGER NOT NULL DEFAULT 0,
  violation_logs JSONB DEFAULT '[]'::jsonb,
  auto_submitted INTEGER NOT NULL DEFAULT 0,
  submit_reason TEXT,
  performance_grade TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  review_list JSONB NOT NULL,
  gd_score INTEGER DEFAULT NULL,
  interview_score INTEGER DEFAULT NULL,
  hr_total_score INTEGER DEFAULT NULL,
  grand_total_score INTEGER DEFAULT NULL,
  grand_percentage REAL DEFAULT NULL,
  hr_remarks TEXT DEFAULT NULL,
  hr_status TEXT DEFAULT 'pending',
  hr_scored_at TIMESTAMPTZ DEFAULT NULL
);

-- HR Assessment Columns (Run this if table already exists)
ALTER TABLE results ADD COLUMN IF NOT EXISTS gd_score INTEGER DEFAULT NULL;
ALTER TABLE results ADD COLUMN IF NOT EXISTS interview_score INTEGER DEFAULT NULL;
ALTER TABLE results ADD COLUMN IF NOT EXISTS hr_total_score INTEGER DEFAULT NULL;
ALTER TABLE results ADD COLUMN IF NOT EXISTS grand_total_score INTEGER DEFAULT NULL;
ALTER TABLE results ADD COLUMN IF NOT EXISTS grand_percentage REAL DEFAULT NULL;
ALTER TABLE results ADD COLUMN IF NOT EXISTS hr_remarks TEXT DEFAULT NULL;
ALTER TABLE results ADD COLUMN IF NOT EXISTS hr_status TEXT DEFAULT 'pending';
ALTER TABLE results ADD COLUMN IF NOT EXISTS hr_scored_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_results_student ON results(LOWER(student_name));
CREATE INDEX IF NOT EXISTS idx_results_score ON results(score DESC, time_taken_seconds ASC);

-- 5. Re-Exam Permits Table
CREATE TABLE IF NOT EXISTS reexam_permits (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  module_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used INTEGER DEFAULT 0,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_permits_student ON reexam_permits(LOWER(student_name));

-- 6. Admin Configuration Table
CREATE TABLE IF NOT EXISTS admin_config (
  email TEXT PRIMARY KEY,
  pin TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL
);

-- Insert Default Admin
INSERT INTO admin_config (email, pin, name, role)
VALUES ('deepakkumars170404@gmail.com', 'wegrow2026', 'Deepak Kumar', 'Lead Instructor & Exam Administrator')
ON CONFLICT (email) DO NOTHING;
