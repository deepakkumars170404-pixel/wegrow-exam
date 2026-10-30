const fs = require('fs');
const path = require('path');

const dataAnalyticsQuestions = [
  // --- PYTHON UP TO CONDITIONAL STATEMENTS (1-8) ---
  {
    id: "da_1",
    category: "Data Analytics",
    topic: "Python Fundamentals",
    difficulty: "Basic",
    question: "What is the output of the following Python code?\n\nx = 17 // 4\nprint(x)",
    options: ["4.25", "4", "4.0", "1"],
    correctAnswer: 1,
    explanation: "In Python, '//' is the floor division operator. It divides and truncates the decimal part, returning an integer. 17 // 4 evaluates to 4."
  },
  {
    id: "da_2",
    category: "Data Analytics",
    topic: "Python Fundamentals",
    difficulty: "Basic",
    question: "What is the data type of the result from Python's built-in input() function?\n\nage = input('Enter your age: ')",
    options: ["int", "float", "str (string)", "Depends on what user types"],
    correctAnswer: 2,
    explanation: "In Python 3, input() always returns user input as a string (str). You must explicitly cast it using int() or float() to perform arithmetic."
  },
  {
    id: "da_3",
    category: "Data Analytics",
    topic: "Python Fundamentals",
    difficulty: "Basic",
    question: "What will this Python expression evaluate to?\n\nprint(3 * 'Data ' + 'Analyst')",
    options: [
      "Data Data Data Analyst",
      "Data 3 Analyst",
      "TypeError: cannot multiply sequence by non-int",
      "Data Analyst Data Analyst Data Analyst"
    ],
    correctAnswer: 0,
    explanation: "In Python, the '*' operator on a string performs string repetition. 'Data ' * 3 results in 'Data Data Data ', followed by concatenation with 'Analyst'."
  },
  {
    id: "da_4",
    category: "Data Analytics",
    topic: "Python Conditionals",
    difficulty: "Basic",
    question: "In Python, how is a block of code (such as inside an if or else block) delineated?",
    options: [
      "Curly braces { }",
      "Consistent Indentation (whitespace/tabs)",
      "Keywords begin and end",
      "Parentheses ( )"
    ],
    correctAnswer: 1,
    explanation: "Python enforces block scoping strictly via indentation (conventionally 4 spaces) rather than curly braces."
  },
  {
    id: "da_5",
    category: "Data Analytics",
    topic: "Python Conditionals",
    difficulty: "Medium",
    question: "What will the following Python script print?\n\nmarks = 78\nif marks >= 90:\n    print('Grade A')\nelif marks >= 75:\n    print('Grade B')\nelif marks >= 60:\n    print('Grade C')\nelse:\n    print('Grade D')",
    options: ["Grade A", "Grade B", "Grade C", "Grade B and Grade C"],
    correctAnswer: 1,
    explanation: "The first condition (78 >= 90) is False. The second condition (78 >= 75) is True, so 'Grade B' is printed and the elif ladder terminates."
  },
  {
    id: "da_6",
    category: "Data Analytics",
    topic: "Python Conditionals",
    difficulty: "Medium",
    question: "What is the output of the following boolean expression in Python?\n\na = 10\nb = 20\nprint((a < 15 and b > 25) or not (a == 10))",
    options: ["True", "False", "None", "Error"],
    correctAnswer: 1,
    explanation: "(a < 15 and b > 25) -> (True and False) -> False. (a == 10) is True, so 'not True' -> False. Finally, False or False evaluates to False."
  },
  {
    id: "da_7",
    category: "Data Analytics",
    topic: "Python Conditionals",
    difficulty: "Medium",
    question: "What will be printed by the following code?\n\nx = 0\nif x:\n    print('Positive')\nelse:\n    print('Falsy value')",
    options: ["Positive", "Falsy value", "0", "SyntaxError"],
    correctAnswer: 1,
    explanation: "In Python, the number 0, empty string '', empty list [], and None are evaluated as falsy in boolean contexts. Thus, the else branch executes."
  },
  {
    id: "da_8",
    category: "Data Analytics",
    topic: "Python Conditionals",
    difficulty: "Medium",
    question: "What will happen in this nested condition?\n\nage = 22\nhas_id = True\nif age >= 18:\n    if has_id:\n        print('Access Granted')\n    else:\n        print('ID Required')\nelse:\n    print('Underage')",
    options: ["Access Granted", "ID Required", "Underage", "None"],
    correctAnswer: 0,
    explanation: "Outer condition age >= 18 is True (22 >= 18). Inner condition has_id is True, printing 'Access Granted'."
  },

  // --- EXCEL FULL (9-17) ---
  {
    id: "da_9",
    category: "Data Analytics",
    topic: "Excel Formulas",
    difficulty: "Basic",
    question: "What does the 4th argument (range_lookup) represent in =VLOOKUP(lookup_value, table_array, col_index, [range_lookup])?",
    options: [
      "The sheet name to search",
      "TRUE for approximate match, FALSE (or 0) for exact match",
      "The number of rows to skip",
      "The font color of the cell"
    ],
    correctAnswer: 1,
    explanation: "Passing FALSE (or 0) specifies an Exact Match search, while TRUE (or 1) specifies an Approximate Match (requiring sorted data)."
  },
  {
    id: "da_10",
    category: "Data Analytics",
    topic: "Excel Advanced Formulas",
    difficulty: "Medium",
    question: "Why do professional data analysts often prefer INDEX-MATCH or XLOOKUP over traditional VLOOKUP in Excel?",
    options: [
      "VLOOKUP cannot search for values to the left of the lookup column, whereas INDEX-MATCH and XLOOKUP can look in any direction",
      "VLOOKUP does not work on numbers",
      "INDEX-MATCH works without any formulas",
      "VLOOKUP requires an internet connection"
    ],
    correctAnswer: 0,
    explanation: "VLOOKUP can only search columns to the right of the lookup column. INDEX-MATCH and XLOOKUP can lookup to the left and right, and are more resilient to column insertions."
  },
  {
    id: "da_11",
    category: "Data Analytics",
    topic: "Excel Formulas",
    difficulty: "Medium",
    question: "Which Excel function calculates the sum of cells in a range that meet MULTIPLE criteria across different columns?",
    options: ["=SUMIF()", "=SUMIFS()", "=MULTISUM()", "=SUMPRODUCT_IF()"],
    correctAnswer: 1,
    explanation: "=SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2, ...) evaluates multiple conditional criteria."
  },
  {
    id: "da_12",
    category: "Data Analytics",
    topic: "Excel Pivot Tables",
    difficulty: "Basic",
    question: "What is the primary function of a Pivot Table in Excel?",
    options: [
      "To write VBA macros automatically",
      "To rapidly aggregate, summarize, slice, and analyze large datasets without complex formulas",
      "To translate text into foreign languages",
      "To protect the worksheet with a password"
    ],
    correctAnswer: 1,
    explanation: "Pivot Tables allow analysts to quickly cross-tabulate, group, filter, and calculate sums/averages across large raw data tables interactively."
  },
  {
    id: "da_13",
    category: "Data Analytics",
    topic: "Excel Data Cleaning",
    difficulty: "Basic",
    question: "Which Excel function is used to eliminate accidental leading, trailing, and excessive spaces between words in a text string?",
    options: ["=CLEAN()", "=REMOVE_SPACE()", "=TRIM()", "=STRIP()"],
    correctAnswer: 2,
    explanation: "=TRIM(text) removes all leading and trailing spaces and normalizes multiple internal consecutive spaces down to a single space."
  },
  {
    id: "da_14",
    category: "Data Analytics",
    topic: "Excel Data Validation",
    difficulty: "Medium",
    question: "How does 'Data Validation' help ensure data cleanliness in Excel spreadsheets?",
    options: [
      "It deletes blank rows automatically",
      "It restricts the type of data or values that users can enter into a cell (e.g. dropdown list, date range, number limits)",
      "It checks for grammar and spelling errors",
      "It encrypts the column values"
    ],
    correctAnswer: 1,
    explanation: "Data Validation sets entry rules (like creating a dropdown from a defined list or enforcing positive numbers) preventing invalid dirty data entry at the source."
  },
  {
    id: "da_15",
    category: "Data Analytics",
    topic: "Excel Conditional Formatting",
    difficulty: "Basic",
    question: "What is Conditional Formatting used for in Excel reports and dashboards?",
    options: [
      "Changing formula calculation speed",
      "Automatically applying formatting (such as colors, data bars, or icons) to cells based on specified rules or values",
      "Locking cells from edits",
      "Exporting data into SQL tables"
    ],
    correctAnswer: 1,
    explanation: "Conditional formatting dynamically highlights patterns, anomalies, top/bottom performers, and duplicates visually based on cell values."
  },
  {
    id: "da_16",
    category: "Data Analytics",
    topic: "Excel Error Handling",
    difficulty: "Medium",
    question: "How can you prevent unsightly #N/A or #DIV/0! error codes from showing in your Excel reports?",
    options: [
      "Wrap the formula inside =IFERROR(formula, 'Custom Message or 0')",
      "Delete the formula",
      "Change the font color to white",
      "Use =HIDE_ERRORS()"
    ],
    correctAnswer: 0,
    explanation: "=IFERROR(value, value_if_error) catches calculation or lookup errors and displays a user-friendly default value (like 0, '-' or 'Not Found')."
  },
  {
    id: "da_17",
    category: "Data Analytics",
    topic: "Excel Data Visualization",
    difficulty: "Basic",
    question: "Which chart type in Excel is best suited for showing trends and changes in a metric over continuous periods of time?",
    options: ["Pie Chart", "Line Chart", "Scatter Plot", "Radar Chart"],
    correctAnswer: 1,
    explanation: "Line charts are the industry standard for depicting temporal trends (e.g., monthly sales revenue over a year)."
  },

  // --- DATA ANALYTICS FUNDAMENTALS (18-21) ---
  {
    id: "da_18",
    category: "Data Analytics",
    topic: "Fundamentals",
    difficulty: "Basic",
    question: "What does the abbreviation 'ETL' stand for in data engineering and analytics pipelines?",
    options: [
      "Extract, Transform, Load",
      "Evaluate, Test, Launch",
      "Estimate, Transfer, Link",
      "Execute, Trace, Log"
    ],
    correctAnswer: 0,
    explanation: "ETL stands for Extract (pulling data from sources), Transform (cleaning, formatting, enriching), and Load (storing into a warehouse/database)."
  },
  {
    id: "da_19",
    category: "Data Analytics",
    topic: "Fundamentals",
    difficulty: "Basic",
    question: "Which of the following represents 'Structured Data'?",
    options: [
      "Customer audio call recordings",
      "Rows and columns stored in an SQL database or Excel table",
      "Raw email body text messages",
      "Satellite imagery files"
    ],
    correctAnswer: 1,
    explanation: "Structured data follows a predefined tabular schema with explicit rows and columns (e.g., relational databases and spreadsheets)."
  },
  {
    id: "da_20",
    category: "Data Analytics",
    topic: "Fundamentals",
    difficulty: "Medium",
    question: "What is the primary objective of Exploratory Data Analysis (EDA)?",
    options: [
      "Writing production-ready API microservices",
      "Understanding data distributions, spotting outliers, detecting missing values, and testing initial hypotheses",
      "Encrypting hard drives",
      "Selling software licenses to clients"
    ],
    correctAnswer: 1,
    explanation: "EDA is the crucial preliminary investigation step to discover patterns, detect anomalies, check assumptions, and summarize main data characteristics."
  },
  {
    id: "da_21",
    category: "Data Analytics",
    topic: "Fundamentals",
    difficulty: "Medium",
    question: "In data analytics, what is an 'Outlier'?",
    options: [
      "A database table that is missing an index",
      "A data point that differs significantly from other observations in the dataset",
      "A person who does not have access to the dashboard",
      "A software bug that crashes the Excel application"
    ],
    correctAnswer: 1,
    explanation: "An outlier is an observation point that is distant from other observations, often caused by measurement variability or experimental errors."
  },

  // --- TYPES OF ANALYTICS (22-25) ---
  {
    id: "da_22",
    category: "Data Analytics",
    topic: "Types of Analytics",
    difficulty: "Basic",
    question: "Which type of analytics answers the fundamental question: 'What happened in the past?'",
    options: [
      "Descriptive Analytics",
      "Diagnostic Analytics",
      "Predictive Analytics",
      "Prescriptive Analytics"
    ],
    correctAnswer: 0,
    explanation: "Descriptive Analytics looks at historical data to explain what has already occurred (e.g., monthly revenue summaries, standard KPI reports)."
  },
  {
    id: "da_23",
    category: "Data Analytics",
    topic: "Types of Analytics",
    difficulty: "Basic",
    question: "A company investigates a sudden 25% drop in product sales last month to discover the root cause. Which type of analytics is being performed?",
    options: [
      "Descriptive Analytics",
      "Diagnostic Analytics",
      "Predictive Analytics",
      "Prescriptive Analytics"
    ],
    correctAnswer: 1,
    explanation: "Diagnostic Analytics drills into historical performance to determine 'Why did it happen?' through drill-downs, correlation analysis, and root cause discovery."
  },
  {
    id: "da_24",
    category: "Data Analytics",
    topic: "Types of Analytics",
    difficulty: "Medium",
    question: "An e-commerce company uses machine learning models to forecast next month's customer demand. What type of analytics is this?",
    options: [
      "Descriptive Analytics",
      "Diagnostic Analytics",
      "Predictive Analytics",
      "Prescriptive Analytics"
    ],
    correctAnswer: 2,
    explanation: "Predictive Analytics uses historical trends and statistical modeling to forecast 'What is likely to happen in the future?'."
  },
  {
    id: "da_25",
    category: "Data Analytics",
    topic: "Types of Analytics",
    difficulty: "Medium",
    question: "Which advanced tier of analytics recommends specific actions and strategies to take advantage of future opportunities or mitigate risks?",
    options: [
      "Descriptive Analytics",
      "Diagnostic Analytics",
      "Predictive Analytics",
      "Prescriptive Analytics"
    ],
    correctAnswer: 3,
    explanation: "Prescriptive Analytics advises on possible outcomes and answers 'What action should we take?' (e.g., dynamic airline ticket pricing algorithms)."
  },

  // --- ROLE OF A DATA ANALYST & REAL WORLD PRACTICES (26-30) ---
  {
    id: "da_26",
    category: "Data Analytics",
    topic: "Role of Data Analyst",
    difficulty: "Basic",
    question: "As a professional Data Analyst, on which process do you spend the majority of your project time (approximately 70% to 80%)?",
    options: [
      "Building 3D animations and graphics",
      "Data Cleaning, Wrangling, and Preparation",
      "Installing operating systems",
      "Writing marketing blog posts"
    ],
    correctAnswer: 1,
    explanation: "Industry studies show Data Analysts spend 70-80% of their time on data preparation: cleaning dirty records, handling missing values, transforming schemas, and validation."
  },
  {
    id: "da_27",
    category: "Data Analytics",
    topic: "Role of Data Analyst",
    difficulty: "Basic",
    question: "What is a 'KPI' in business analytics?",
    options: [
      "Key Performance Indicator - a quantifiable metric used to measure success against strategic objectives",
      "Keyboard Programming Interface",
      "Kernel Protocol Index",
      "Knowledge Priority Integration"
    ],
    correctAnswer: 0,
    explanation: "A Key Performance Indicator (KPI) is a measurable target reflecting how effectively an organization is achieving key business objectives."
  },
  {
    id: "da_28",
    category: "Data Analytics",
    topic: "Role of Data Analyst",
    difficulty: "Medium",
    question: "When dealing with missing values in a numeric dataset column, which strategy is commonly considered during data cleaning?",
    options: [
      "Randomly type any numbers",
      "Imputation (replacing with Mean, Median, or Mode) or dropping rows if missingness is negligible",
      "Delete the entire dataset",
      "Change the column name"
    ],
    correctAnswer: 1,
    explanation: "Analysts handle missing numerical values either by removing records (if few) or using statistical imputation (mean/median for skewed distributions)."
  },
  {
    id: "da_29",
    category: "Data Analytics",
    topic: "Role of Data Analyst",
    difficulty: "Medium",
    question: "What is 'Data Storytelling' and why is it essential for a Data Analyst?",
    options: [
      "Writing fictional stories using spreadsheet cells",
      "The ability to translate complex data findings into clear, narrative-driven business insights that non-technical stakeholders can easily understand and act upon",
      "Reading dataset rows aloud during team meetings",
      "Writing SQL queries without comments"
    ],
    correctAnswer: 1,
    explanation: "Data Storytelling combines data metrics, clear visualizations, and a compelling business narrative to convince executive stakeholders to take data-driven decisions."
  },
  {
    id: "da_30",
    category: "Data Analytics",
    topic: "Role of Data Analyst",
    difficulty: "Basic",
    question: "Why is maintaining Data Privacy (such as protecting PII - Personally Identifiable Information) a critical ethical responsibility for a Data Analyst?",
    options: [
      "To comply with legal regulations (GDPR, HIPAA, IT Acts) and safeguard user confidentiality from data breaches and misuse",
      "To make SQL queries execute faster",
      "To reduce spreadsheet file sizes",
      "It is only required for hardware engineers"
    ],
    correctAnswer: 0,
    explanation: "Data analysts handle sensitive user information and must enforce data governance, anonymization, and regulatory compliance to protect user privacy and avoid severe legal liabilities."
  }
];

fs.writeFileSync(path.join(__dirname, 'data', 'questions', 'data_analytics.json'), JSON.stringify(dataAnalyticsQuestions, null, 2));
console.log('Saved data_analytics.json with ' + dataAnalyticsQuestions.length + ' questions.');

