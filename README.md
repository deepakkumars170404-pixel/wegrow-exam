# 🎓 WEGROW MNC Assessment & Examination Platform

A comprehensive, production-grade MNC-pattern assessment platform designed for student recruitment readiness (Cognizant / TCS / Infosys / Wipro standards).

---

## 💾 Database Architecture (SQLite Engine - `data/exam.db`)

All data is stored purely in an SQLite database powered by `better-sqlite3`:
- **`modules` Table**: Stores metadata for all 8 modules (Aptitude, HTML, CSS, Bootstrap, JavaScript, Python, React, Data Analytics).
- **`questions` Table**: Stores all **850 questions** with category, topic, difficulty (Basic first, then Medium), options (JSON array), correct answer index, and step-by-step verified explanations.
- **`sessions` Table**: Tracks active student exam sessions, proctoring strikes, question orders, and round progression in real time.
- **`results` Table**: Stores actual completed candidate submissions (Round 1 /20, Round 2 /30, Total /50, percentage, grades, time taken, proctoring violations, and full 50-question reviews). **Zero dummy records.**
- **`reexam_permits` Table**: Stores re-exam unlock permits issued by Deepak.
- **`admin_config` Table**: Stores instructor credentials securely in the database.

---

## 🚀 How to Run the Website

### Option 1: Double Click
Double click **`start_server.bat`** in `D:\WEGROW\Exam`.

### Option 2: Via Terminal / PowerShell
```bash
cd D:\WEGROW\Exam
npm start
# or: node server.js
```

---

## 🌐 URLs & Access Points

| Portal | URL | Description |
|---|---|---|
| **Student Assessment Portal** | `http://localhost:3000` | Candidates enter Full Name (Compulsory) & begin Round 1 |
| **Instructor Dashboard** | `http://localhost:3000/admin.html` | Instructor Admin Control Center |

### 🔑 Instructor Access:
- Configure your administrator credentials via `ADMIN_EMAIL` and `ADMIN_PIN` environment variables (or database `admin_config` table).
- Only authorized administrators can access answer keys and the leaderboard management.

---

## 📚 2-Round Examination Workflow (Total 50 Marks)

### **Round 1: MNC Aptitude Assessment (Compulsory &bull; 20 Questions / 20 Marks)**
- Every student writing the exam must take Round 1 first.
- Exactly **20 questions** are randomly sampled per student from the **150+ question bank** (Quantitative Aptitude, Logical Reasoning, Verbal Ability).
- Arranged progressively: **Basic questions first**, followed by **Medium questions**, with intra-tier random shuffling per student.
- Proctoring is active: Full screen takeover, tab-switch warnings (3-strike limit).
- Submitting Round 1 auto-scores out of 20 and smoothly transitions to the Round 2 Topic Multi-Select screen without breaking full screen!

### **Round 2: Technical Electives (Dynamic Multi-Select &bull; 30 Questions / 30 Marks)**
- Student selects any combination of the 7 technical modules:
  1. **HTML5 Core to Medium (100 in Bank)**
  2. **CSS3 Core to Medium (100 in Bank)**
  3. **Bootstrap 5 Framework (100 in Bank)**
  4. **JavaScript Mastery (100 in Bank)**
  5. **Python Programming (100 in Bank)**
  6. **React.js Essentials (100 in Bank)**
  7. **Data Analytics & Python Track (100 in Bank)** *(Python up to conditionals, Full Excel, EDA, Analytics Types, Role of Data Analyst)*
- **Dynamic 30-Question Allocation Formula**:
  - Exactly **30 questions** are dynamically and randomly distributed across their chosen topics!
  - 1 topic selected: 30 questions from that topic.
  - 2 topics selected (e.g. HTML + CSS): 15 from HTML + 15 from CSS = 30 total.
  - 3 topics selected: 10 each = 30 total.
  - 4 topics selected: 8, 8, 7, 7 = 30 total.
  - 5 topics selected (e.g. HTML, CSS, Bootstrap, Python, React): 6 each = 30 total.
  - 7 topics selected: 5, 5, 4, 4, 4, 4, 4 = 30 total.
- Submitting Round 2 compiles the final evaluation.

### **Final Scorecard & Step-by-Step Solutions (50 Total Questions)**
- Total Combined Score: **XX / 50 Marks (YY%)**
- Split Cards:
  - Round 1 (Aptitude): X / 20
  - Round 2 (Technical): Y / 30 (with list of chosen topics)
- Complete Question-by-Question Review of all 50 questions with student's selected answer, verified correct answer, and clear explanations.

---

## 🛡️ CTS / MNC Strict Anti-Cheating & Proctoring Features

1. **Full-Screen Enforcement:**
   - Test automatically requests and enforces browser Full Screen on start.
   - Exiting full screen triggers an audible alarm, warning modal, and a strike.
2. **Tab Switch & Minimize Detection:**
   - Prohibits switching browser tabs or minimizing the examination window.
   - Uses `visibilitychange` and window blur listeners.
3. **3-Strike Disqualification Rule:**
   - Strike 1 & 2: Warning modals with 10-second countdowns to resume focus.
   - Strike 3: Exam is automatically terminated and submitted with violation logs.
4. **Context Menu & Shortcut Locks:**
   - Right-click (`contextmenu`) is disabled.
   - Copy (`Ctrl+C`), Cut (`Ctrl+X`), Paste (`Ctrl+V`) are disabled.
   - Developer tools shortcuts (`F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+U`) are blocked.
5. **Cheating Prevention via Network:**
   - Correct answers and explanations are **never** transmitted to the student's browser during the exam. All evaluation is performed securely on the server upon submission.

---

## 🏆 Admin & Instructor Dashboard Features

- **Ranked Leaderboard:** Students sorted from **Top Mark to Low Mark** (Total /50, Round 1 /20, Round 2 /30, percentage, time taken, strikes).
- **Top 3 Podium:** Gold, Silver, and Bronze badges for the top 3 high scorers.
- **Instant Re-Exam Unlock:**
  - One-click **"Allow Re-exam"** button on the leaderboard table or Re-Exam Manager.
  - If a student mistakenly closes their tab or gets locked out, Deepak can grant them permission instantly.
- **Master Question & Answer Key:**
  - View all **850 questions** across all 8 modules with highlighted correct answers and comprehensive explanations.
- **Manually Add Questions:**
  - Deepak can add custom questions directly into SQLite `exam.db` for any module.
- **CSV Export:** Download candidate results directly into an Excel-ready spreadsheet.
