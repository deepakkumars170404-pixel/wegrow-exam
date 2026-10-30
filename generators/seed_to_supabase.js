require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in .env');
  console.error('Example:');
  console.error('  SUPABASE_URL=https://xyzcompany.supabase.co');
  console.error('  SUPABASE_KEY=eyJh...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

async function seedSupabase() {
  console.log('========================================================');
  console.log('🚀 SEEDING QUESTION BANK & MODULES TO SUPABASE');
  console.log('========================================================');
  console.log('Target Project:', SUPABASE_URL);

  // 1. Upsert Modules
  console.log('\n[1/3] Uploading 8 Exam Modules...');
  const { error: modErr } = await supabase
    .from('modules')
    .upsert(modulesData, { onConflict: 'id' });

  if (modErr) {
    console.error('❌ Failed inserting modules:', modErr.message);
    process.exit(1);
  }
  console.log('✓ All 8 Modules upserted successfully.');

  // 2. Load and Upload Questions
  console.log('\n[2/3] Reading and Uploading 850 Questions...');
  let allQuestions = [];

  for (const [modId, fileName] of Object.entries(fileMap)) {
    const filePath = path.join(__dirname, '..', 'data', 'questions', fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Warning: Question file missing: ${filePath}`);
      continue;
    }

    const qList = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Sort: Basic first, then Medium
    qList.sort((a, b) => {
      const diffA = (a.difficulty || '').toLowerCase() === 'basic' ? 1 : 2;
      const diffB = (b.difficulty || '').toLowerCase() === 'basic' ? 1 : 2;
      return diffA - diffB;
    });

    qList.forEach((q, idx) => {
      allQuestions.push({
        id: q.id,
        module_id: modId,
        question_order: idx + 1,
        category: q.category || modId,
        topic: q.topic || q.category || modId,
        difficulty: q.difficulty || (idx < qList.length / 2 ? "Basic" : "Medium"),
        question: q.question,
        options: q.options, // stored as jsonb
        correct_answer: q.correctAnswer,
        explanation: q.explanation
      });
    });

    console.log(`  - Prepared ${qList.length} questions for module [${modId}]`);
  }

  console.log(`\nTotal questions to upload: ${allQuestions.length}`);

  // Batch insert in chunks of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
    const batch = allQuestions.slice(i, i + BATCH_SIZE);
    const { error: qErr } = await supabase
      .from('questions')
      .upsert(batch, { onConflict: 'id' });

    if (qErr) {
      console.error(`❌ Error uploading batch ${i} to ${i + batch.length}:`, qErr.message);
      process.exit(1);
    }
    console.log(`  ✓ Uploaded questions ${i + 1} to ${Math.min(i + BATCH_SIZE, allQuestions.length)}`);
  }

  // 3. Upsert Admin Config
  console.log('\n[3/3] Setting up Admin Configuration...');
  const adminEmail = process.env.ADMIN_EMAIL || "deepakkumars170404@gmail.com";
  const adminPin = process.env.ADMIN_PIN || "wegrow2026";

  const { error: adminErr } = await supabase
    .from('admin_config')
    .upsert({
      email: adminEmail,
      pin: adminPin,
      name: "Deepak Kumar",
      role: "Lead Instructor & Exam Administrator"
    }, { onConflict: 'email' });

  if (adminErr) {
    console.warn('⚠️ Admin config upsert warning:', adminErr.message);
  } else {
    console.log('✓ Admin configuration verified.');
  }

  // Verify counts
  const { count, error: countErr } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  console.log('\n========================================================');
  console.log(`🎉 SUPABASE SEEDING COMPLETE!`);
  console.log(`Total questions in Supabase: ${count}`);
  console.log('========================================================');
}

seedSupabase().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
