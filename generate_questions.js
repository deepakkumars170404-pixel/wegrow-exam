const fs = require('fs');
const path = require('path');

// 1. APTITUDE QUESTIONS (30 Questions: 10 Quant, 10 Logical, 10 Verbal)
const aptitudeQuestions = [
  // --- QUANTITATIVE APTITUDE (1-10) ---
  {
    id: "apt_1",
    category: "Quantitative Aptitude",
    topic: "Percentages",
    difficulty: "Basic",
    question: "A student scored 72 marks out of 120 in an exam. What is his percentage score?",
    options: ["55%", "60%", "65%", "70%"],
    correctAnswer: 1,
    explanation: "Percentage = (Marks Obtained / Total Marks) * 100 = (72 / 120) * 100 = 0.6 * 100 = 60%."
  },
  {
    id: "apt_2",
    category: "Quantitative Aptitude",
    topic: "Profit & Loss",
    difficulty: "Medium",
    question: "A merchant buys an item for Rs. 450 and sells it at Rs. 540. What is the profit percentage?",
    options: ["15%", "18%", "20%", "25%"],
    correctAnswer: 2,
    explanation: "Profit = Selling Price (SP) - Cost Price (CP) = 540 - 450 = Rs. 90. Profit % = (Profit / CP) * 100 = (90 / 450) * 100 = 20%."
  },
  {
    id: "apt_3",
    category: "Quantitative Aptitude",
    topic: "Time and Work",
    difficulty: "Medium",
    question: "A can complete a piece of work in 12 days and B can complete it in 24 days. If they work together, in how many days will the work be finished?",
    options: ["6 days", "8 days", "10 days", "16 days"],
    correctAnswer: 1,
    explanation: "A's 1 day work = 1/12. B's 1 day work = 1/24. Combined 1 day work = 1/12 + 1/24 = 3/24 = 1/8. Total days = 8 days."
  },
  {
    id: "apt_4",
    category: "Quantitative Aptitude",
    topic: "Speed, Time & Distance",
    difficulty: "Basic",
    question: "A train travels at a uniform speed of 72 km/h. How many meters does it cover in 20 seconds?",
    options: ["300 meters", "360 meters", "400 meters", "450 meters"],
    correctAnswer: 2,
    explanation: "Convert speed to m/s: 72 * (5/18) = 20 m/s. Distance = Speed * Time = 20 m/s * 20 s = 400 meters."
  },
  {
    id: "apt_5",
    category: "Quantitative Aptitude",
    topic: "Ratios & Proportions",
    difficulty: "Basic",
    question: "The ratio of boys to girls in a class of 60 students is 3:2. How many girls are there in the class?",
    options: ["20", "24", "30", "36"],
    correctAnswer: 1,
    explanation: "Total parts = 3 + 2 = 5 parts. Number of girls = (2 / 5) * 60 = 24 girls."
  },
  {
    id: "apt_6",
    category: "Quantitative Aptitude",
    topic: "Averages",
    difficulty: "Basic",
    question: "The average of 5 consecutive odd numbers is 27. What is the largest of these numbers?",
    options: ["29", "31", "33", "35"],
    correctAnswer: 1,
    explanation: "For consecutive numbers with an odd count, the average is the exact middle number. So the numbers are 23, 25, 27, 29, 31. The largest is 31."
  },
  {
    id: "apt_7",
    category: "Quantitative Aptitude",
    topic: "Simple Interest",
    difficulty: "Medium",
    question: "What is the Simple Interest earned on a principal of Rs. 8,000 at 5% per annum after 3 years?",
    options: ["Rs. 1,000", "Rs. 1,200", "Rs. 1,400", "Rs. 1,600"],
    correctAnswer: 1,
    explanation: "SI = (P * R * T) / 100 = (8000 * 5 * 3) / 100 = 80 * 15 = Rs. 1,200."
  },
  {
    id: "apt_8",
    category: "Quantitative Aptitude",
    topic: "Number System",
    difficulty: "Basic",
    question: "Find the HCF (Highest Common Factor) of 36 and 84.",
    options: ["6", "12", "18", "24"],
    correctAnswer: 1,
    explanation: "Factors of 36: 12 * 3. Factors of 84: 12 * 7. The highest common divisor is 12."
  },
  {
    id: "apt_9",
    category: "Quantitative Aptitude",
    topic: "Probability",
    difficulty: "Medium",
    question: "Two fair dice are thrown simultaneously. What is the probability of getting a sum of 7?",
    options: ["1/12", "1/9", "1/6", "5/36"],
    correctAnswer: 2,
    explanation: "Total outcomes = 6 * 6 = 36. Favorable pairs summing to 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 pairs. Probability = 6/36 = 1/6."
  },
  {
    id: "apt_10",
    category: "Quantitative Aptitude",
    topic: "Pipes & Cisterns",
    difficulty: "Medium",
    question: "Pipe X can fill a tank in 10 hours and Pipe Y can empty it in 15 hours. If both are opened together, in how many hours will the tank fill?",
    options: ["20 hours", "25 hours", "30 hours", "35 hours"],
    correctAnswer: 2,
    explanation: "Net rate per hour = 1/10 - 1/15 = (3 - 2) / 30 = 1/30. So the tank will be filled in 30 hours."
  },

  // --- LOGICAL REASONING (11-20) ---
  {
    id: "apt_11",
    category: "Logical Reasoning",
    topic: "Number Series",
    difficulty: "Basic",
    question: "Find the next number in the sequence: 4, 9, 16, 25, 36, ?",
    options: ["42", "48", "49", "64"],
    correctAnswer: 2,
    explanation: "The series represents squares of natural numbers: 2^2=4, 3^2=9, 4^2=16, 5^2=25, 6^2=36, 7^2=49."
  },
  {
    id: "apt_12",
    category: "Logical Reasoning",
    topic: "Coding-Decoding",
    difficulty: "Basic",
    question: "In a certain code, 'APPLE' is written as 'BQQMF'. How is 'GRAPE' written in that code?",
    options: ["HSBQF", "HSBPF", "HQBQF", "HSCQF"],
    correctAnswer: 0,
    explanation: "Each letter is shifted forward by +1 position in the alphabet: G->H, R->S, A->B, P->Q, E->F => HSBQF."
  },
  {
    id: "apt_13",
    category: "Logical Reasoning",
    topic: "Blood Relations",
    difficulty: "Medium",
    question: "Pointing to a photograph of a man, Suresh said, 'He is the only son of the mother of my mother.' How is Suresh related to the man?",
    options: ["Brother", "Nephew", "Son", "Father"],
    correctAnswer: 1,
    explanation: "Mother of Suresh's mother = Suresh's maternal grandmother. The only son of Suresh's maternal grandmother = Suresh's maternal uncle. Therefore, Suresh is his nephew."
  },
  {
    id: "apt_14",
    category: "Logical Reasoning",
    topic: "Direction Sense",
    difficulty: "Basic",
    question: "Ravi walks 10 meters North, turns right and walks 5 meters, then turns right again and walks 10 meters. How far is he from his starting point?",
    options: ["5 meters East", "5 meters West", "10 meters East", "Zero meters"],
    correctAnswer: 0,
    explanation: "He went 10m North, 5m East, and 10m South. The North and South movements cancel each other out, leaving him 5 meters East of the starting point."
  },
  {
    id: "apt_15",
    category: "Logical Reasoning",
    topic: "Syllogisms",
    difficulty: "Medium",
    question: "Statements:\n1. All cars are vehicles.\n2. All vehicles have wheels.\nConclusion I: All cars have wheels.\nConclusion II: All wheels are cars.",
    options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither follows"],
    correctAnswer: 0,
    explanation: "Since all cars are vehicles and all vehicles have wheels, it follows directly that all cars have wheels (Conclusion I). But all wheels are cars is not necessarily true."
  },
  {
    id: "apt_16",
    category: "Logical Reasoning",
    topic: "Analogy",
    difficulty: "Basic",
    question: "Doctor : Hospital :: Teacher : ?",
    options: ["Book", "School", "Student", "Library"],
    correctAnswer: 1,
    explanation: "A doctor's workplace is a hospital; similarly, a teacher's workplace is a school."
  },
  {
    id: "apt_17",
    category: "Logical Reasoning",
    topic: "Odd One Out",
    difficulty: "Basic",
    question: "Choose the odd one out from the following options:",
    options: ["Python", "Java", "C++", "Google Chrome"],
    correctAnswer: 3,
    explanation: "Python, Java, and C++ are programming languages, while Google Chrome is a web browser application."
  },
  {
    id: "apt_18",
    category: "Logical Reasoning",
    topic: "Seating Arrangement",
    difficulty: "Medium",
    question: "Five friends A, B, C, D, E are sitting in a row facing North. C is sitting in the middle. A is to the immediate right of C. B is at the extreme left. Who is sitting between B and C?",
    options: ["A", "D or E", "Only D", "Cannot be determined"],
    correctAnswer: 1,
    explanation: "Positions (1 to 5 from left): Position 1 is B, Position 3 is C, Position 4 is A. Position 2 (between B and C) must be either D or E, as no further constraints are given."
  },
  {
    id: "apt_19",
    category: "Logical Reasoning",
    topic: "Alphabet Series",
    difficulty: "Basic",
    question: "What comes next in the letter series: B, D, G, K, P, ?",
    options: ["S", "T", "V", "W"],
    correctAnswer: 2,
    explanation: "Differences between letters: B(+2)->D(+3)->G(+4)->K(+5)->P(+6)->V (P is 16th, 16 + 6 = 22nd letter, which is V)."
  },
  {
    id: "apt_20",
    category: "Logical Reasoning",
    topic: "Statement & Assumptions",
    difficulty: "Medium",
    question: "Statement: 'Please fasten seat belts before takeoff.'\nAssumption I: Passengers may get injured during turbulence or sudden maneuvers.\nAssumption II: Fastened seat belts ensure passenger safety.",
    options: ["Only I is implicit", "Only II is implicit", "Both I and II are implicit", "Neither is implicit"],
    correctAnswer: 2,
    explanation: "The instruction implies that turbulence/maneuvers pose a risk (Assumption I) and seat belts help mitigate this risk (Assumption II)."
  },

  // --- VERBAL ABILITY (21-30) ---
  {
    id: "apt_21",
    category: "Verbal Ability",
    topic: "Synonyms",
    difficulty: "Basic",
    question: "Select the word that is most SIMILAR in meaning to 'CANDID':",
    options: ["Frank", "Secretive", "Shy", "Dishonest"],
    correctAnswer: 0,
    explanation: "'Candid' means truthful, straightforward, and frank."
  },
  {
    id: "apt_22",
    category: "Verbal Ability",
    topic: "Antonyms",
    difficulty: "Basic",
    question: "Select the word that is OPPOSITE in meaning to 'METICULOUS':",
    options: ["Careful", "Careless", "Precise", "Detailed"],
    correctAnswer: 1,
    explanation: "'Meticulous' means showing great attention to detail. Its opposite is 'careless'."
  },
  {
    id: "apt_23",
    category: "Verbal Ability",
    topic: "Spotting Errors",
    difficulty: "Medium",
    question: "Identify the part containing an error: 'Neither the manager (A) / nor the employees (B) / was present at the meeting (C) / No error (D)'",
    options: ["A", "B", "C", "D"],
    correctAnswer: 2,
    explanation: "When subjects are joined by 'neither... nor', the verb agrees with the closer subject. 'Employees' is plural, so it should be 'were present', not 'was present'."
  },
  {
    id: "apt_24",
    category: "Verbal Ability",
    topic: "Sentence Completion",
    difficulty: "Basic",
    question: "The company's CEO emphasized the need to adapt _____ rapidly changing consumer demands.",
    options: ["with", "for", "to", "on"],
    correctAnswer: 2,
    explanation: "The verb 'adapt' is paired with the preposition 'to' when referring to adjusting to a new condition."
  },
  {
    id: "apt_25",
    category: "Verbal Ability",
    topic: "Idioms & Phrases",
    difficulty: "Medium",
    question: "What does the idiom 'Bite the bullet' mean?",
    options: [
      "To eat something dangerous",
      "To face a difficult situation with courage",
      "To initiate a fight",
      "To avoid responsibilities"
    ],
    correctAnswer: 1,
    explanation: "'To bite the bullet' means to endure a painful or difficult situation that cannot be avoided."
  },
  {
    id: "apt_26",
    category: "Verbal Ability",
    topic: "One Word Substitution",
    difficulty: "Basic",
    question: "A person who knows and speaks many languages is called a:",
    options: ["Polyglot", "Philanthropist", "Optimist", "Novice"],
    correctAnswer: 0,
    explanation: "A 'Polyglot' is a person who can speak, write, or understand several languages."
  },
  {
    id: "apt_27",
    category: "Verbal Ability",
    topic: "Sentence Correction",
    difficulty: "Medium",
    question: "Choose the correct sentence:",
    options: [
      "She has been working here since three years.",
      "She has been working here for three years.",
      "She is working here since three years.",
      "She worked here since three years."
    ],
    correctAnswer: 1,
    explanation: "'For' is used with a duration/period of time ('for three years'), whereas 'since' denotes a specific starting point in time."
  },
  {
    id: "apt_28",
    category: "Verbal Ability",
    topic: "Para Jumbles",
    difficulty: "Medium",
    question: "Rearrange the sentences into a coherent paragraph:\nP: Artificial Intelligence is revolutionizing industries.\nQ: Consequently, organizations are investing heavily in talent.\nR: From healthcare to finance, its footprint is undeniable.\nS: Those who fail to adapt risk becoming obsolete.",
    options: ["P-R-Q-S", "Q-P-S-R", "R-P-Q-S", "S-Q-P-R"],
    correctAnswer: 0,
    explanation: "P introduces the main subject (AI). R provides examples (healthcare to finance). Q outlines the consequence (investment). S concludes with the warning."
  },
  {
    id: "apt_29",
    category: "Verbal Ability",
    topic: "Active & Passive Voice",
    difficulty: "Basic",
    question: "Convert to Passive: 'The engineer resolved the technical glitch.'",
    options: [
      "The technical glitch was resolved by the engineer.",
      "The technical glitch has resolved by the engineer.",
      "The technical glitch is resolved by the engineer.",
      "The technical glitch was being resolved by the engineer."
    ],
    correctAnswer: 0,
    explanation: "Past simple active ('resolved') becomes 'was resolved + by + subject' in passive voice."
  },
  {
    id: "apt_30",
    category: "Verbal Ability",
    topic: "Spelling Check",
    difficulty: "Basic",
    question: "Choose the word with the correct spelling:",
    options: ["Accomodation", "Accommodation", "Acommodation", "Accomadation"],
    correctAnswer: 1,
    explanation: "The correct spelling is 'Accommodation' (double 'c' and double 'm')."
  }
];

fs.writeFileSync(path.join(__dirname, 'data', 'questions', 'aptitude.json'), JSON.stringify(aptitudeQuestions, null, 2));
console.log('Saved aptitude.json with ' + aptitudeQuestions.length + ' questions.');

