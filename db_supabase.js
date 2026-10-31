require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('✅ Supabase Connected to:', SUPABASE_URL);
} else {
  console.warn('⚠️ [SUPABASE] SUPABASE_URL & SUPABASE_KEY not yet configured in .env');
}

// Fisher-Yates array shuffle utility
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// High-speed In-Memory Question Cache for 100+ concurrent users
let questionsMemoryCache = null;
let cacheExpiry = 0;

async function getAllQuestionsCached() {
  const now = Date.now();
  if (questionsMemoryCache && now < cacheExpiry) {
    return questionsMemoryCache;
  }
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('question_order', { ascending: true });
  if (error) throw error;
  questionsMemoryCache = data || [];
  cacheExpiry = now + 10 * 60 * 1000; // 10 minutes cache TTL
  return questionsMemoryCache;
}

const db = {
  client: supabase,
  isConfigured: () => Boolean(supabase),

  // 1. Get modules with counts
  async getModules() {
    if (!supabase) return [];
    const { data: mods, error: mErr } = await supabase
      .from('modules')
      .select('*')
      .order('id');
    if (mErr) throw mErr;

    const { data: qCounts, error: qErr } = await supabase
      .from('questions')
      .select('module_id');
    if (qErr) throw qErr;

    const countMap = {};
    (qCounts || []).forEach(q => {
      countMap[q.module_id] = (countMap[q.module_id] || 0) + 1;
    });

    return mods.map(m => ({
      id: m.id,
      name: m.name,
      round: m.round,
      subtitle: m.subtitle,
      totalQuestions: countMap[m.id] || m.total_questions || 0,
      durationMinutes: m.duration_minutes,
      badgeColor: m.badge_color
    }));
  },

  // 2. Prior result check
  async getPriorResult(cleanName) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .ilike('student_name', cleanName)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 3. Completed session check
  async getPriorCompletedSession(cleanName) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .ilike('student_name', cleanName)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 4. Re-exam permit check
  async getActivePermit(cleanName) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('reexam_permits')
      .select('*')
      .ilike('student_name', cleanName)
      .eq('used', 0)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 5. Mark permit as used
  async markPermitUsed(permitId) {
    if (!supabase) return;
    const { error } = await supabase
      .from('reexam_permits')
      .update({ used: 1, used_at: new Date().toISOString() })
      .eq('id', permitId);
    if (error) throw error;
  },

  // 6. Locked session check
  async getLockedSession(cleanName) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .ilike('student_name', cleanName)
      .eq('status', 'locked')
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 7. Get 20 Aptitude Questions (10 Basic, 10 Medium) - Instant in-memory sampling
  async getAptitudeQuestions() {
    if (!supabase) return [];
    const all = await getAllQuestionsCached();
    const allApt = all.filter(q => q.module_id === 'aptitude');

    const basicPool = shuffleArray(allApt.filter(q => (q.difficulty || '').toLowerCase() === 'basic'));
    const mediumPool = shuffleArray(allApt.filter(q => (q.difficulty || '').toLowerCase() === 'medium'));

    let selected = [];
    if (basicPool.length >= 10 && mediumPool.length >= 10) {
      selected = [...basicPool.slice(0, 10), ...mediumPool.slice(0, 10)];
    } else {
      selected = shuffleArray(allApt).slice(0, 20);
    }
    return shuffleArray(selected);
  },

  // 8. Create new session (cleans prior active sessions)
  async createSession(sessionData) {
    if (!supabase) return;
    // Delete prior active session if any
    await supabase
      .from('sessions')
      .delete()
      .ilike('student_name', sessionData.student_name);

    const { error } = await supabase
      .from('sessions')
      .insert({
        session_id: sessionData.session_id,
        student_name: sessionData.student_name,
        batch: sessionData.batch,
        module_id: sessionData.module_id,
        module_name: sessionData.module_name,
        round_type: sessionData.round_type || 'round1',
        start_time: sessionData.start_time,
        duration_minutes: sessionData.duration_minutes,
        status: sessionData.status || 'active',
        warnings: sessionData.warnings || 0,
        violation_logs: sessionData.violation_logs || [],
        question_order: sessionData.question_order || []
      });
    if (error) throw error;
  },

  // 9. Get Session by ID
  async getSession(sessionId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 10. Get Questions by list of IDs - High speed in-memory map lookup
  async getQuestionsByIds(idArray) {
    if (!supabase || !idArray || idArray.length === 0) return [];
    const all = await getAllQuestionsCached();
    const map = {};
    all.forEach(q => { map[q.id] = q; });
    return idArray.map(id => map[id]).filter(Boolean);
  },

  // 11. Fetch dynamic Round 2 questions - Instant sampling with Fisher-Yates
  async getRound2Questions(topicAllocations) {
    if (!supabase) return [];
    const all = await getAllQuestionsCached();
    let pool = [];

    for (const [modId, count] of Object.entries(topicAllocations)) {
      const modQuestions = all.filter(q => q.module_id === modId);

      const basicPool = shuffleArray(modQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'basic'));
      const mediumPool = shuffleArray(modQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'medium'));

      const halfBasic = Math.ceil(count / 2);
      const halfMed = count - halfBasic;

      let picked = [];
      if (basicPool.length >= halfBasic && mediumPool.length >= halfMed) {
        picked = [...basicPool.slice(0, halfBasic), ...mediumPool.slice(0, halfMed)];
      } else {
        picked = shuffleArray(modQuestions).slice(0, count);
      }
      pool.push(...picked);
    }

    return shuffleArray(pool);
  },

  // 12. Update session for Round 2
  async updateSessionForRound2(sessionId, updateData) {
    if (!supabase) return;
    const { error } = await supabase
      .from('sessions')
      .update({
        round_type: 'round2',
        selected_modules: updateData.selected_modules,
        round1_score: updateData.round1_score,
        question_order: updateData.question_order,
        duration_minutes: updateData.duration_minutes
      })
      .eq('session_id', sessionId);
    if (error) throw error;
  },

  // 13. Update proctoring violations
  async updateProctorViolation(sessionId, warningsCount, violationLogs, isLocked) {
    if (!supabase) return;
    const payload = {
      warnings: warningsCount,
      violation_logs: violationLogs
    };
    if (isLocked) {
      payload.status = 'locked';
    }
    const { error } = await supabase
      .from('sessions')
      .update(payload)
      .eq('session_id', sessionId);
    if (error) throw error;
  },

  // 14. Save completed result
  async saveResult(resultData) {
    if (!supabase) return;
    // Delete prior result for student
    await supabase
      .from('results')
      .delete()
      .ilike('student_name', resultData.student_name);

    const { error } = await supabase
      .from('results')
      .insert(resultData);
    if (error) throw error;

    // Mark session completed
    await supabase
      .from('sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('session_id', resultData.session_id);
  },

  // 15. Get result by ID
  async getResultById(resultId) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 16. Admin login check
  async getAdmin(email) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('admin_config')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // 17. Get Leaderboard
  async getLeaderboard() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .order('score', { ascending: false })
      .order('time_taken_seconds', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // 18. Get Live Sessions
  async getLiveSessions() {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .in('status', ['active', 'round1_complete', 'locked'])
      .order('start_time', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // 19. Grant Re-Exam Permit
  async grantPermit(permitData) {
    if (!supabase) return;
    const { error } = await supabase
      .from('reexam_permits')
      .insert(permitData);
    if (error) throw error;

    // Delete locked session and prior results
    await supabase.from('sessions').delete().ilike('student_name', permitData.student_name);
    await supabase.from('results').delete().ilike('student_name', permitData.student_name);
  },

  // 20. Add Question
  async addQuestion(questionData) {
    if (!supabase) return;
    const { error } = await supabase
      .from('questions')
      .insert(questionData);
    if (error) throw error;
    questionsMemoryCache = null; // Invalidate cache so new question is immediately accessible
  },

  // 21. Save HR Assessment Marks (Supports saving GD or Interview separately, or both together)
  async saveHrScore(resultId, hrData) {
    if (!supabase) return null;
    const { data: existing, error: fetchErr } = await supabase
      .from('results')
      .select('*')
      .eq('id', resultId)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!existing) throw new Error("Candidate result record not found.");

    // Extract any existing HR evaluation from violation_logs or native columns
    let existingHr = null;
    let logs = existing.violation_logs;
    if (typeof logs === 'string') {
      try { logs = JSON.parse(logs); } catch (e) { logs = {}; }
    }
    if (!logs || typeof logs !== 'object' || Array.isArray(logs)) {
      logs = { violations: Array.isArray(logs) ? logs : [] };
    }
    if (logs && logs.hrAssessment) existingHr = logs.hrAssessment;

    const prevGd = (existingHr && existingHr.gdScore !== undefined && existingHr.gdScore !== null) 
      ? existingHr.gdScore 
      : (existing.gd_score !== undefined && existing.gd_score !== null ? existing.gd_score : null);

    const prevInterview = (existingHr && existingHr.interviewScore !== undefined && existingHr.interviewScore !== null) 
      ? existingHr.interviewScore 
      : (existing.interview_score !== undefined && existing.interview_score !== null ? existing.interview_score : null);

    const prevRemarks = (existingHr && existingHr.remarks) || existing.hr_remarks || '';

    // Check if new values were explicitly passed
    const hasNewGd = hrData.gdScore !== undefined && hrData.gdScore !== null && String(hrData.gdScore).trim() !== '';
    const hasNewInterview = hrData.interviewScore !== undefined && hrData.interviewScore !== null && String(hrData.interviewScore).trim() !== '';

    let gdScore = prevGd;
    if (hasNewGd) {
      gdScore = Math.max(0, Math.min(25, parseInt(hrData.gdScore, 10) || 0));
    }

    let interviewScore = prevInterview;
    if (hasNewInterview) {
      interviewScore = Math.max(0, Math.min(25, parseInt(hrData.interviewScore, 10) || 0));
    }

    const remarks = (hrData.remarks !== undefined && hrData.remarks !== null) 
      ? String(hrData.remarks).trim() 
      : prevRemarks;

    const scoredAt = new Date().toISOString();
    const quizScore = existing.score || 0; // Round 1 (/20) + Round 2 (/30) = /50

    const isGdDone = (gdScore !== null && gdScore !== undefined);
    const isInterviewDone = (interviewScore !== null && interviewScore !== undefined);
    const isBothDone = isGdDone && isInterviewDone;

    let hrTotal = null;
    let grandTotal = quizScore;
    let grandPercentage = null;
    let status = 'pending';

    if (isBothDone) {
      // All 4 rounds complete! Calculate all 4 marks into Grand Total (/100)
      hrTotal = gdScore + interviewScore; // Max 50
      grandTotal = quizScore + hrTotal;   // Max 100
      grandPercentage = Number(((grandTotal / 100) * 100).toFixed(1));
      status = 'completed';
    } else if (isGdDone) {
      hrTotal = gdScore;
      grandTotal = quizScore + gdScore;
      status = 'gd_completed';
    } else if (isInterviewDone) {
      hrTotal = interviewScore;
      grandTotal = quizScore + interviewScore;
      status = 'interview_completed';
    }

    const hrAssessment = {
      gdScore,
      interviewScore,
      hrTotal: isBothDone ? hrTotal : (isGdDone ? gdScore : (isInterviewDone ? interviewScore : null)),
      grandTotal: isBothDone ? grandTotal : null,
      grandPercentage: isBothDone ? grandPercentage : null,
      remarks,
      scoredAt,
      status,
      isCompleted: isBothDone,
      round1Score: existing.round1_score || 0,
      round2Score: existing.round2_score || 0,
      quizScore
    };

    logs.hrAssessment = hrAssessment;

    const { error: updateErr } = await supabase
      .from('results')
      .update({
        violation_logs: logs
      })
      .eq('id', resultId);
    if (updateErr) throw updateErr;

    try {
      await supabase.from('results').update({
        gd_score: gdScore,
        interview_score: interviewScore,
        hr_total_score: isBothDone ? hrTotal : null,
        grand_total_score: isBothDone ? grandTotal : null,
        grand_percentage: isBothDone ? grandPercentage : null,
        hr_remarks: remarks,
        hr_status: status,
        hr_scored_at: scoredAt
      }).eq('id', resultId);
    } catch (e) {}

    return hrAssessment;
  }
};

module.exports = db;
