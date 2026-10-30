const http = require('http');
const path = require('path');

console.log('Testing 100 simultaneous student exam registrations...');

const TOTAL_STUDENTS = 100;
let successCount = 0;
let failCount = 0;
let finished = 0;

const startTime = Date.now();

for (let i = 1; i <= TOTAL_STUDENTS; i++) {
  const studentName = `StressTest_Student_${i}`;
  const postData = JSON.stringify({
    studentName,
    batch: "CSE-2026"
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/exam/start',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      finished++;
      if (res.statusCode === 200) {
        try {
          const json = JSON.parse(body);
          if (json.success && json.questions?.length === 20) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (e) {
          failCount++;
        }
      } else {
        failCount++;
      }

      if (finished === TOTAL_STUDENTS) {
        const duration = Date.now() - startTime;
        console.log(`\n========================================`);
        console.log(`STRESS TEST COMPLETED in ${duration}ms`);
        console.log(`SUCCESSFUL REQUESTS: ${successCount} / ${TOTAL_STUDENTS}`);
        console.log(`FAILED REQUESTS:     ${failCount} / ${TOTAL_STUDENTS}`);
        console.log(`AVERAGE PER REQUEST: ${(duration / TOTAL_STUDENTS).toFixed(2)}ms`);
        console.log(`========================================\n`);

        // Clean up test sessions from Supabase and SQLite
        try {
          require('dotenv').config();
          if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
            supabase.from('sessions').delete().ilike('student_name', '%StressTest%').then(() => {
              console.log('Cleaned up stress test sessions from Supabase.');
            });
          }
        } catch(e) {}

        try {
          const Database = require('better-sqlite3');
          const db = new Database(path.join(__dirname, '..', 'data', 'exam.db'));
          const del = db.prepare("DELETE FROM sessions WHERE student_name LIKE 'StressTest_Student_%'").run();
          console.log(`Cleaned up ${del.changes} stress test sessions from database.`);
          db.close();
        } catch(e) {}
      }
    });
  });

  req.on('error', (err) => {
    finished++;
    failCount++;
    console.error(`Request ${i} error:`, err.message);
    if (finished === TOTAL_STUDENTS) {
      console.log('Done with errors.');
    }
  });

  req.write(postData);
  req.end();
}

