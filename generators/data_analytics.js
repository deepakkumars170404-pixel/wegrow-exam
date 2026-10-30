const fs = require('fs');
const path = require('path');

const daPool = [
  // =========================================================================
  // 1-25: Python (Covered up to Conditional Statements only!)
  // =========================================================================
  {
    q: "In Python, which of the following is the correct syntax to create a variable and assign the integer value 25 to it?",
    opts: ["int age = 25;", "var age = 25;", "age = 25", "let age := 25;"],
    ans: 2,
    exp: "Python is dynamically typed and does not require type keywords. You assign variables using 'name = value'."
  },
  {
    q: "What data type does the Python built-in input() function always return?",
    opts: ["int", "float", "str (string)", "bool"],
    ans: 2,
    exp: "input() always captures user input as a string (str), even if the user enters numeric digits."
  },
  {
    q: "What is the output of the following Python expression?\n\nprint(type(15 / 3))",
    opts: ["<class 'int'>", "<class 'float'>", "<class 'number'>", "<class 'double'>"],
    ans: 1,
    exp: "In Python 3, the standard division operator '/' always returns a float (5.0), even for exact divisions."
  },
  {
    q: "What is the output of evaluating 19 // 4 in Python?",
    opts: ["4.75", "4", "4.0", "3"],
    ans: 1,
    exp: "'//' is the floor division operator. It divides and truncates the decimal part, returning the integer 4."
  },
  {
    q: "What is the output of evaluating 19 % 4 in Python?",
    opts: ["4", "3", "0.75", "1"],
    ans: 1,
    exp: "'%' is the modulo operator, returning the integer remainder of division: 19 = (4 * 4) + 3."
  },
  {
    q: "What does the expression 2 ** 4 evaluate to in Python?",
    opts: ["8", "16", "6", "24"],
    ans: 1,
    exp: "'**' is Python's exponentiation operator. 2 ** 4 equals 2 * 2 * 2 * 2 = 16."
  },
  {
    q: "Which comparison operator checks if two values are equal in Python?",
    opts: ["=", "==", "===", "equals"],
    ans: 1,
    exp: "'==' checks equality of values, whereas '=' is the variable assignment operator."
  },
  {
    q: "What is the result of the expression: 10 != 10 in Python?",
    opts: ["True", "False", "None", "Error"],
    ans: 1,
    exp: "'!=' is the 'not equal to' operator. Since 10 is equal to 10, 10 != 10 evaluates to False."
  },
  {
    q: "How are code blocks inside an if statement delimited in Python?",
    opts: [
      "Enclosed within curly braces { }",
      "Using consistent indentation (spaces or tabs)",
      "Using 'begin' and 'end' keywords",
      "Terminated with a semicolon"
    ],
    ans: 1,
    exp: "Python enforces block scoping through indentation (conventionally 4 spaces) rather than curly braces."
  },
  {
    q: "What is the keyword used in Python for 'else if' in conditional statements?",
    opts: ["else if", "elseif", "elif", "elsif"],
    ans: 2,
    exp: "Python uses 'elif' for secondary conditional branches between 'if' and 'else'."
  },
  {
    q: "What will the following Python code output?\n\nmarks = 75\nif marks >= 90:\n    print('Grade A')\nelif marks >= 70:\n    print('Grade B')\nelse:\n    print('Grade C')",
    opts: ["Grade A", "Grade B", "Grade C", "Grade B and Grade C"],
    ans: 1,
    exp: "marks is 75. 75 >= 90 is False. 75 >= 70 is True, so 'Grade B' is printed and the ladder terminates."
  },
  {
    q: "What is the output of the logical expression: True and False in Python?",
    opts: ["True", "False", "None", "SyntaxError"],
    ans: 1,
    exp: "The 'and' operator returns True only if both operands are truthy. Here, True and False yields False."
  },
  {
    q: "What is the output of the logical expression: False or True in Python?",
    opts: ["True", "False", "None", "TypeError"],
    ans: 0,
    exp: "The 'or' operator returns True if at least one operand is truthy. Here, False or True yields True."
  },
  {
    q: "What is the output of: not (5 > 2) in Python?",
    opts: ["True", "False", "None", "5 < 2"],
    ans: 1,
    exp: "5 > 2 evaluates to True. The 'not' operator negates True to False."
  },
  {
    q: "What is the output of the chained comparison: 5 < 10 < 20 in Python?",
    opts: ["True", "False", "SyntaxError", "10"],
    ans: 0,
    exp: "Python supports chained comparisons. '5 < 10 < 20' is equivalent to '5 < 10 and 10 < 20', which is True."
  },
  {
    q: "Which of the following values is considered FALSY in a Python boolean context?",
    opts: ["0", "Empty string \"\"", "None", "All of the above"],
    ans: 3,
    exp: "In Python, 0, 0.0, None, empty string '', empty list [], empty dict {}, and False are all falsy."
  },
  {
    q: "What will the following code print?\n\nx = 0\nif x:\n    print('Yes')\nelse:\n    print('No')",
    opts: ["Yes", "No", "0", "SyntaxError"],
    ans: 1,
    exp: "The integer 0 evaluates to False in a boolean context, so the else branch executes and prints 'No'."
  },
  {
    q: "What is the syntax for Python's one-line ternary conditional expression?",
    opts: [
      "condition ? val_if_true : val_if_false",
      "val_if_true if condition else val_if_false",
      "if condition then val_if_true else val_if_false",
      "val_if_true ? condition : val_if_false"
    ],
    ans: 1,
    exp: "Python's ternary syntax is: 'value_if_true if condition else value_if_false' (e.g. status = 'Adult' if age >= 18 else 'Minor')."
  },
  {
    q: "What will this code print?\n\nage = 16\nstatus = 'Allowed' if age >= 18 else 'Denied'\nprint(status)",
    opts: ["Allowed", "Denied", "True", "False"],
    ans: 1,
    exp: "16 >= 18 is False, so the else branch value 'Denied' is assigned to status."
  },
  {
    q: "What is short-circuit evaluation in Python boolean logic?",
    opts: [
      "Evaluation stops as soon as the outcome is determined (e.g., False and ... stops immediately)",
      "An electrical fault in the CPU",
      "Evaluating code in reverse order",
      "A syntax error caused by missing colons"
    ],
    ans: 0,
    exp: "With 'and', if the first operand is False, Python immediately returns False without evaluating the second. With 'or', if the first is True, it returns True immediately."
  },
  {
    q: "What will this code print?\n\nx = 10\ny = 5\nif x > 5:\n    if y > 10:\n        print('Option 1')\n    else:\n        print('Option 2')\nelse:\n    print('Option 3')",
    opts: ["Option 1", "Option 2", "Option 3", "Nothing"],
    ans: 1,
    exp: "Outer condition x > 5 (10 > 5) is True. Inner condition y > 10 (5 > 10) is False, so inner else prints 'Option 2'."
  },
  {
    q: "Which membership operator checks if a substring or element exists within a string or list in Python?",
    opts: ["exists", "in", "contains", "has"],
    ans: 1,
    exp: "The 'in' operator tests membership: 'cat' in 'scatter' returns True."
  },
  {
    q: "What character is used to write single-line comments in Python?",
    opts: ["//", "#", "/*", "--"],
    ans: 1,
    exp: "In Python, the hash symbol '#' denotes a single-line comment."
  },
  {
    q: "What is the purpose of the 'pass' statement in an empty Python if block?",
    opts: [
      "It skips the entire program",
      "It acts as a syntactic null placeholder so Python doesn't throw an IndentationError",
      "It passes data to the next function",
      "It prints 'pass' to the console"
    ],
    ans: 1,
    exp: "'pass' is a null statement used when code is syntactically required (e.g. empty branch) but no action needs to be taken."
  },
  {
    q: "What is the output of the following code?\n\ns = 'Analytics'\nprint(len(s))",
    opts: ["8", "9", "10", "7"],
    ans: 1,
    exp: "len('Analytics') counts the number of characters in the string: A-n-a-l-y-t-i-c-s = 9 characters."
  },

  // =========================================================================
  // 26-50: Excel Mastery (Full Coverage)
  // =========================================================================
  {
    q: "In Microsoft Excel, what symbol must every formula or function begin with?",
    opts: ["@", "#", "=", "$"],
    ans: 2,
    exp: "All Excel formulas and functions must start with an equals sign '=' so Excel knows to calculate an expression rather than treat it as text."
  },
  {
    q: "What is the difference between relative cell reference A1 and absolute cell reference $A$1 when copying formulas?",
    opts: [
      "A1 changes relatively based on target row and column; $A$1 locks both column A and row 1 permanently",
      "$A$1 formats the number as US Dollars; A1 formats as text",
      "A1 only works in Excel online; $A$1 works in desktop Excel",
      "There is no difference"
    ],
    ans: 0,
    exp: "Relative references (A1) adjust automatically when copied to other cells. Absolute references ($A$1) lock the column and row so the reference remains fixed."
  },
  {
    q: "Which keyboard shortcut in Excel toggles cell references between Relative (A1), Absolute ($A$1), and Mixed ($A1, A$1)?",
    opts: ["F2", "F4", "F9", "Ctrl + Shift + L"],
    ans: 1,
    exp: "Pressing F4 while editing a cell reference cycles through relative, absolute, and mixed reference modes."
  },
  {
    q: "What is the difference between Excel's COUNT() and COUNTA() functions?",
    opts: [
      "COUNT counts only cells containing numeric values; COUNTA counts all non-empty cells (numbers, text, booleans)",
      "COUNTA counts only numbers; COUNT counts text",
      "COUNT is alphabetical; COUNTA is numeric",
      "They are identical functions"
    ],
    ans: 0,
    exp: "COUNT() only tallies cells containing numbers. COUNTA() tallies all non-blank cells regardless of whether they contain text, numbers, or dates."
  },
  {
    q: "Which Excel function counts cells within a range that meet a single specific condition (e.g., Sales > 5000)?",
    opts: ["COUNTIF", "SUMIF", "COUNTIFS", "VLOOKUP"],
    ans: 0,
    exp: "COUNTIF(range, criteria) counts cells within a designated range meeting one specified criterion."
  },
  {
    q: "Which Excel function sums values in a range based on MULTIPLE criteria across different columns?",
    opts: ["SUMIF", "SUMIFS", "MULTISUM", "TOTALIF"],
    ans: 1,
    exp: "SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2, ...) evaluates multiple criteria simultaneously."
  },
  {
    q: "What does the 4th argument [range_lookup] represent in =VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])?",
    opts: [
      "Row number to return",
      "Match type: FALSE (or 0) for an EXACT match, TRUE (or 1) for an APPROXIMATE match",
      "Font color of the cell",
      "Sorting direction"
    ],
    ans: 1,
    exp: "The 4th argument specifies the match mode. In 99% of business analytics cases, FALSE or 0 is used for an exact match."
  },
  {
    q: "What is a major limitation of the traditional VLOOKUP function in Excel?",
    opts: [
      "It cannot search for numbers",
      "The lookup column must always be the first (leftmost) column of the table; it cannot look to the left",
      "It can only look up data in the same row",
      "It only works with 10 rows of data"
    ],
    ans: 1,
    exp: "VLOOKUP can only search in the first column of the selected range and return data from columns to its right. It cannot search backwards (to the left)."
  },
  {
    q: "Which combination of functions is traditionally used in Excel as a flexible replacement for VLOOKUP that can look up values in ANY direction?",
    opts: ["SUM and AVERAGE", "INDEX and MATCH", "IF and AND", "LEFT and RIGHT"],
    ans: 1,
    exp: "INDEX and MATCH combined allow two-way lookups and can look up values to the left, right, top, or bottom without column-index limitations."
  },
  {
    q: "What modern Excel function (available in Office 365 and Excel 2021) replaces VLOOKUP, HLOOKUP, and INDEX/MATCH with default exact matching?",
    opts: ["ZLOOKUP", "XLOOKUP", "SUPERLOOKUP", "FINDVALUE"],
    ans: 1,
    exp: "XLOOKUP is the modern, powerful replacement. It defaults to exact match, searches both vertically and horizontally, and can look left or right."
  },
  {
    q: "What Excel function wraps around a formula to return a clean default message (like 'Not Found') if the formula evaluates to an error like #N/A or #VALUE!?",
    opts: ["IFERROR", "CATCH", "TRY", "CLEANERROR"],
    ans: 0,
    exp: "IFERROR(value, value_if_error) evaluates an expression and returns a specified fallback value if an error occurs."
  },
  {
    q: "Which Excel text function extracts a specified number of characters starting from the very beginning (left side) of a text string?",
    opts: ["MID()", "LEFT()", "START()", "FIRST()"],
    ans: 1,
    exp: "LEFT(text, num_chars) returns the specified number of characters from the start of a text string."
  },
  {
    q: "Which Excel function removes unnecessary leading, trailing, and repeated spaces from text cells?",
    opts: ["CLEAN()", "TRIM()", "STRIP()", "COMPACT()"],
    ans: 1,
    exp: "TRIM() removes all leading and trailing whitespace and reduces multiple consecutive internal spaces to a single space."
  },
  {
    q: "Which Excel function or operator is used to join text strings from multiple cells together (e.g. combining First Name and Last Name)?",
    opts: ["& (Ampersand) or CONCAT()", "+ (Plus sign)", "MERGE()", "ATTACH()"],
    ans: 0,
    exp: "You can concatenate strings using the '&' operator (e.g., =A2 & \" \" & B2) or the CONCAT() / CONCATENATE() functions."
  },
  {
    q: "Which Excel function returns the current system date without the time?",
    opts: ["NOW()", "TODAY()", "DATE()", "CURRENT()"],
    ans: 1,
    exp: "TODAY() returns the current date. NOW() returns both the current date and current system time."
  },
  {
    q: "What does Excel feature 'Text to Columns' allow a data analyst to do?",
    opts: [
      "Translate text into another language",
      "Split text in a single column into multiple separate columns based on a delimiter (like comma, tab, or space)",
      "Rotate cell orientation 90 degrees",
      "Convert numbers into currency format"
    ],
    ans: 1,
    exp: "'Text to Columns' is used to parse delimited (CSV, tab-separated) or fixed-width text data into distinct columns."
  },
  {
    q: "What is Excel's 'Flash Fill' (shortcut: Ctrl + E) primarily used for by data analysts?",
    opts: [
      "Formatting numbers as percentages",
      "Automatically sensing patterns in your manual data entry and filling the rest of the column instantly",
      "Deleting empty rows",
      "Highlighting negative values"
    ],
    ans: 1,
    exp: "Flash Fill (Ctrl + E) detects patterns (like extracting domain from emails or splitting full names) and completes the data series automatically."
  },
  {
    q: "What is the primary purpose of a Pivot Table in Excel?",
    opts: [
      "To lock the worksheet with a password",
      "To summarize, aggregate, slice, and analyze large datasets without writing complex formulas",
      "To create 3D animations",
      "To write VBA macros"
    ],
    ans: 1,
    exp: "Pivot Tables allow analysts to rapidly aggregate thousands of rows, group categories, calculate sums/averages, and rearrange dimensions dynamically."
  },
  {
    q: "What are the four primary quadrant areas in the Excel Pivot Table Fields pane?",
    opts: [
      "Filters, Columns, Rows, Values",
      "Header, Footer, Left, Right",
      "Title, Subtitle, Data, Charts",
      "Input, Output, Process, Memory"
    ],
    ans: 0,
    exp: "Pivot Tables organize data into four operational areas: Filters (page level), Columns (horizontal categorization), Rows (vertical categorization), and Values (numeric aggregations)."
  },
  {
    q: "What is a 'Slicer' in an Excel Pivot Table?",
    opts: [
      "A tool to permanently delete columns",
      "An interactive, visual on-screen clickable button filter for Pivot Tables and Charts",
      "A formula that cuts text strings in half",
      "A pie chart segment"
    ],
    ans: 1,
    exp: "Slicers provide user-friendly visual buttons that allow stakeholders to easily filter Pivot Tables and Pivot Dashboards with a single click."
  },
  {
    q: "What Excel feature allows you to automatically color-code cells (e.g. green for high profit, red for low) based on cell values?",
    opts: ["Cell Palette", "Conditional Formatting", "Style Wizard", "Theme Builder"],
    ans: 1,
    exp: "Conditional Formatting applies visual formatting (colors, data bars, icon sets) based on rules and criteria you define."
  },
  {
    q: "Which Excel tool prevents invalid user entries by creating a restricted drop-down list of allowed choices in a cell?",
    opts: ["Data Validation", "Cell Protection", "Lock Range", "Input Guard"],
    ans: 0,
    exp: "Data Validation (Settings -> Allow: List) creates drop-down select boxes to enforce data integrity and prevent typing errors."
  },
  {
    q: "What does the #DIV/0! error mean in an Excel cell?",
    opts: [
      "The column is not wide enough to display the number",
      "A formula is attempting to divide a number by zero or by an empty cell",
      "The function name was misspelled",
      "A cell reference was deleted"
    ],
    ans: 1,
    exp: "#DIV/0! occurs when a formula attempts to divide by 0 or an empty cell, which is mathematically undefined."
  },
  {
    q: "What does the #N/A error signify in a VLOOKUP or MATCH function?",
    opts: [
      "No value is available because the lookup value was not found in the search range",
      "The formula contains a circular reference",
      "The computer has run out of RAM",
      "The worksheet is locked"
    ],
    ans: 0,
    exp: "#N/A means 'Not Available'—indicating the lookup function could not find an exact match for the requested search key."
  },
  {
    q: "What does it mean when an Excel cell displays '########' instead of a number?",
    opts: [
      "The formula has a fatal logic error",
      "The column is too narrow to display the full numeric value or date formatted in that cell",
      "The cell contains encrypted confidential data",
      "The database link was broken"
    ],
    ans: 1,
    exp: "Excel displays '#####' when the column width is too narrow to fit the formatted number or date. Double-clicking the column boundary auto-fits the width."
  },

  // =========================================================================
  // 51-75: Data Analytics Fundamentals & Statistics
  // =========================================================================
  {
    q: "What is the primary objective of Data Analytics in a business organization?",
    opts: [
      "To store as many gigabytes of raw data as possible on hard drives",
      "To inspect, clean, transform, and model data to discover useful insights and support data-driven decision-making",
      "To design graphic website logos",
      "To replace human managers completely"
    ],
    ans: 1,
    exp: "Data Analytics focuses on turning raw data into actionable business intelligence to optimize processes, increase revenue, and solve business challenges."
  },
  {
    q: "What is the difference between Qualitative and Quantitative data?",
    opts: [
      "Qualitative data is numerical and measurable; Quantitative is descriptive text",
      "Qualitative data is categorical and descriptive (e.g. feedback, colors); Quantitative data is numerical and measurable (e.g. sales, temperature)",
      "Qualitative data comes from computers; Quantitative data comes from people",
      "They are identical terms"
    ],
    ans: 1,
    exp: "Qualitative data deals with non-numerical qualities and categories (Nominal/Ordinal). Quantitative data deals with measurable numerical quantities (Discrete/Continuous)."
  },
  {
    q: "Which of the following is an example of Structured Data?",
    opts: [
      "Customer records organized in tables with defined columns in an SQL database or Excel sheet",
      "An audio recording of a customer support call",
      "A video file of a webinar",
      "A PDF scan of a handwritten letter"
    ],
    ans: 0,
    exp: "Structured data has a standardized, predefined data model organized in rows and columns (e.g. SQL tables, spreadsheets)."
  },
  {
    q: "What is the difference between a 'Population' and a 'Sample' in data statistics?",
    opts: [
      "Population is the entire group of individuals or items under study; Sample is a representative subset selected from that population",
      "Sample is the whole country; Population is one city",
      "Population is always qualitative; Sample is always quantitative",
      "There is no statistical difference"
    ],
    ans: 0,
    exp: "A Population includes all members of a specified group, while a Sample is a manageable subset analyzed to infer properties of the entire population."
  },
  {
    q: "What are the three core measures of central tendency in statistics?",
    opts: [
      "Mean, Median, and Mode",
      "Range, Variance, and Standard Deviation",
      "Minimum, Maximum, and Average",
      "Sample, Population, and Hypothesis"
    ],
    ans: 0,
    exp: "Mean (arithmetic average), Median (middle value), and Mode (most frequent value) are the three primary statistical measures of central tendency."
  },
  {
    q: "Why is the Median preferred over the Mean when analyzing datasets with extreme outliers (such as employee salaries or house prices)?",
    opts: [
      "The Median is always easier to compute by hand",
      "The Mean is heavily pulled by extreme high or low values (outliers), whereas the Median is robust and unaffected by outliers",
      "The Mean only works on even numbers of rows",
      "The Median is always larger than the Mean"
    ],
    ans: 1,
    exp: "Outliers significantly skew the arithmetic Mean. The Median represents the true 50th percentile midpoint, making it resistant to extreme distortions."
  },
  {
    q: "What does the Mode of a dataset represent?",
    opts: [
      "The difference between the highest and lowest value",
      "The value that appears most frequently in a dataset",
      "The sum of all values divided by count",
      "The middle value when sorted"
    ],
    ans: 1,
    exp: "The Mode is the most frequently occurring value in a dataset. A dataset can have one mode (unimodal), multiple modes (multimodal), or no mode."
  },
  {
    q: "What does Standard Deviation measure in a dataset?",
    opts: [
      "The total sum of all observations",
      "The amount of dispersion or spread of data points around the mean",
      "The percentage of missing values",
      "The speed of database queries"
    ],
    ans: 1,
    exp: "Standard Deviation quantifies how spread out values are from the mean. A low standard deviation means values cluster tightly around the mean."
  },
  {
    q: "What is an 'Outlier' in data analytics?",
    opts: [
      "A column that contains text instead of numbers",
      "A data point that deviates significantly from the overall pattern or distribution of the rest of the dataset",
      "A customer who lives in an outer suburb",
      "A row with an empty primary key"
    ],
    ans: 1,
    exp: "An outlier is an observation that lies an abnormal distance away from other values in a random sample, often caused by measurement error, fraud, or genuine anomalies."
  },
  {
    q: "In the Interquartile Range (IQR) method for outlier detection, how is IQR calculated?",
    opts: [
      "IQR = Q3 (75th percentile) - Q1 (25th percentile)",
      "IQR = Maximum - Minimum",
      "IQR = Mean / Standard Deviation",
      "IQR = Q2 * 2"
    ],
    ans: 0,
    exp: "IQR is the range between the 3rd quartile (75th percentile) and 1st quartile (25th percentile), covering the middle 50% of sorted data."
  },
  {
    q: "According to the standard Tukey IQR rule, a data point is considered an outlier if it falls beyond which thresholds?",
    opts: [
      "Below Q1 - 1.5*IQR or Above Q3 + 1.5*IQR",
      "Below 0 or Above 100",
      "Below Mean - 1 or Above Mean + 1",
      "Outside the top 10 rows"
    ],
    ans: 0,
    exp: "The standard statistical rule defines outliers as points lying below Q1 - (1.5 * IQR) or above Q3 + (1.5 * IQR)."
  },
  {
    q: "What does the famous statistical principle 'Correlation does not imply Causation' mean?",
    opts: [
      "Just because two variables move together statistically does not prove that one variable causes the other to change",
      "Correlation and causation are identical concepts",
      "Correlation only applies to numbers greater than 100",
      "Causation can be proven purely with an Excel chart"
    ],
    ans: 0,
    exp: "A statistical correlation indicates a mutual relationship, but it may be a coincidence or caused by an unseen third variable (confounder), not direct cause-and-effect."
  },
  {
    q: "What is the range of values for Pearson's Correlation Coefficient (r)?",
    opts: [
      "From 0 to 100",
      "From -1.0 to +1.0",
      "From 0.0 to 1.0 only",
      "Any positive number up to infinity"
    ],
    ans: 1,
    exp: "Pearson's r ranges between -1.0 (perfect negative linear correlation) through 0.0 (no linear correlation) to +1.0 (perfect positive linear correlation)."
  },
  {
    q: "What does a correlation coefficient of r = 0 between two variables indicate?",
    opts: [
      "There is a perfect linear relationship",
      "There is no linear relationship between the two variables",
      "One variable causes the other to increase",
      "The dataset contains errors"
    ],
    ans: 1,
    exp: "An r of 0 indicates the absence of any linear association between the two variables."
  },
  {
    q: "What is the 68-95-99.7 Empirical Rule in a standard Normal (Gaussian) Distribution?",
    opts: [
      "68% of data lies within 1 standard deviation of the mean, 95% within 2 SD, and 99.7% within 3 SD",
      "68% of employees pass exams, 95% get promoted, 99.7% stay",
      "68% of data is text, 95% is numbers, 99.7% is dates",
      "A rule for sizing Excel columns"
    ],
    ans: 0,
    exp: "In a normal distribution, ~68.27% of observations fall within ±1σ of the mean, ~95.45% within ±2σ, and ~99.73% within ±3σ."
  },
  {
    q: "What is a Right-Skewed (Positively Skewed) distribution?",
    opts: [
      "A distribution where the tail on the right side is longer, and Mean > Median > Mode",
      "A distribution that is perfectly symmetrical like a mirror",
      "A distribution where all values are negative",
      "A distribution with the tail stretched to the left"
    ],
    ans: 0,
    exp: "In a right-skewed distribution, a few high outliers stretch the right tail, pulling the Mean higher than the Median."
  },
  {
    q: "What are the standard 6 stages of the Data Analytics Life Cycle?",
    opts: [
      "Ask -> Prepare -> Process -> Analyze -> Share -> Act",
      "Buy -> Install -> Run -> Crash -> Reboot -> Delete",
      "Collect -> Sell -> Trade -> Cache -> Format -> Print",
      "Draft -> Review -> Approve -> Submit -> Grade -> Archive"
    ],
    ans: 0,
    exp: "The Google/Industry data analytics process consists of: Ask questions, Prepare data, Process/clean data, Analyze patterns, Share insights, and Act on decisions."
  },
  {
    q: "What is the difference between Primary Data and Secondary Data?",
    opts: [
      "Primary data is collected first-hand by the analyst for the specific project; Secondary data was already collected by someone else",
      "Primary data is in SQL; Secondary data is in Excel",
      "Primary data is free; Secondary data is paid",
      "Primary data has no errors"
    ],
    ans: 0,
    exp: "Primary data is original research gathered directly for a specific purpose (surveys, experiments). Secondary data is pre-existing data gathered by third parties or past records."
  },
  {
    q: "What is 'Data Integrity' in database and analytics systems?",
    opts: [
      "The physical speed of server hard drives",
      "The overall accuracy, completeness, consistency, and reliability of data across its entire lifecycle",
      "The dollar cost of purchasing data",
      "Encrypting data with passwords"
    ],
    ans: 1,
    exp: "Data integrity ensures data remains trustworthy, accurate, consistent, and unaltered by unauthorized modifications throughout its lifecycle."
  },
  {
    q: "What is 'Data Anonymization' and why is it important for data analysts?",
    opts: [
      "Deleting all records older than 1 year",
      "Removing or encrypting Personally Identifiable Information (PII) like names, phone numbers, and SSNs to protect user privacy and comply with regulations (GDPR/HIPAA)",
      "Changing font sizes in spreadsheets",
      "Making company dashboards public"
    ],
    ans: 1,
    exp: "Anonymization strips or masks PII so that records cannot be traced back to individual people, ensuring ethical compliance with privacy laws."
  },
  {
    q: "What is a 'Continuous Variable' in statistics?",
    opts: [
      "A variable that can take on an infinite number of possible values within a given range (e.g. weight, height, time)",
      "A variable that only counts whole numbers (e.g. number of children)",
      "A variable that repeats forever in a loop",
      "A variable that cannot be changed"
    ],
    ans: 0,
    exp: "Continuous variables can assume any value along a continuum (e.g. 5.72 seconds, 68.4 kg). Discrete variables only take distinct, countable integer values."
  },
  {
    q: "Which type of chart is specifically designed to display the frequency distribution of a continuous numeric variable divided into bins?",
    opts: ["Pie Chart", "Histogram", "Scatter Plot", "Donut Chart"],
    ans: 1,
    exp: "Histograms group continuous data into consecutive numerical intervals (bins) to visualize the shape of the data distribution."
  },
  {
    q: "Which type of chart is ideal for visualizing the relationship or correlation between TWO continuous numerical variables?",
    opts: ["Scatter Plot", "Bar Chart", "Pie Chart", "Treemap"],
    ans: 0,
    exp: "A Scatter Plot plots one variable on the X-axis and another on the Y-axis, clearly highlighting correlations, clusters, and bivariate outliers."
  },
  {
    q: "Which visual chart displays summary statistics: Minimum, Q1, Median, Q3, Maximum, and individual outliers?",
    opts: ["Box and Whisker Plot (Boxplot)", "Line Chart", "Area Chart", "Radar Chart"],
    ans: 0,
    exp: "A Boxplot provides a five-number summary (Min, Q1, Median, Q3, Max) and renders outliers as distinct dots beyond the whiskers."
  },
  {
    q: "What does the term 'Data Wrangling' or 'Data Munging' mean in practice?",
    opts: [
      "Selling datasets to brokers",
      "The process of cleaning, structuring, and enriching raw messy data into a usable format for analysis",
      "Compressing CSV files into ZIP archives",
      "Writing CSS styles for websites"
    ],
    ans: 1,
    exp: "Data Wrangling transforms chaotic raw data into a reliable, consistent format ready for modeling and business analysis."
  },

  // =========================================================================
  // 76-100: Types of Analytics, Role of Data Analyst & Real-World Practice
  // =========================================================================
  {
    q: "As a professional Data Analyst, on which process do you typically spend the MOST time (often 70% to 80% of your total working hours)?",
    opts: [
      "Building complex machine learning models",
      "Data Cleaning, Preparation, and Wrangling (handling missing values, format corrections, deduping)",
      "Designing PowerPoint presentation slide animations",
      "Writing long executive emails"
    ],
    ans: 1,
    exp: "Industry surveys consistently demonstrate that data analysts spend 70-80% of their time collecting, cleaning, and preparing messy raw data before any meaningful analysis can occur."
  },
  {
    q: "Which type of analytics answers the core question: 'What happened in the past?'",
    opts: ["Descriptive Analytics", "Diagnostic Analytics", "Predictive Analytics", "Prescriptive Analytics"],
    ans: 0,
    exp: "Descriptive Analytics looks at historical data to summarize what occurred (e.g., quarterly sales reports, web traffic dashboards)."
  },
  {
    q: "Which type of analytics answers the question: 'Why did it happen?'",
    opts: ["Descriptive Analytics", "Diagnostic Analytics", "Predictive Analytics", "Prescriptive Analytics"],
    ans: 1,
    exp: "Diagnostic Analytics investigates root causes, drill-downs, and correlations to understand the reasons behind past trends or anomalies."
  },
  {
    q: "Which type of analytics answers the question: 'What is likely to happen in the future?'",
    opts: ["Descriptive Analytics", "Diagnostic Analytics", "Predictive Analytics", "Prescriptive Analytics"],
    ans: 2,
    exp: "Predictive Analytics uses historical patterns, statistical models, and trend forecasting to estimate future outcomes."
  },
  {
    q: "Which type of analytics answers the question: 'What specific action should the business take?'",
    opts: ["Descriptive Analytics", "Diagnostic Analytics", "Predictive Analytics", "Prescriptive Analytics"],
    ans: 3,
    exp: "Prescriptive Analytics recommends optimal decisions and specific courses of action using optimization algorithms and simulation models."
  },
  {
    q: "If an e-commerce dashboard shows: 'Revenue dropped by 18% last month', which type of analytics is this statement an example of?",
    opts: ["Descriptive Analytics", "Diagnostic Analytics", "Predictive Analytics", "Prescriptive Analytics"],
    ans: 0,
    exp: "It simply reports historical fact and metric performance—which is the definition of Descriptive Analytics."
  },
  {
    q: "If an analyst investigates and discovers: 'Revenue dropped because the checkout payment gateway experienced a 4-hour server outage during a flash sale', what type of analytics is this?",
    opts: ["Descriptive Analytics", "Diagnostic Analytics", "Predictive Analytics", "Prescriptive Analytics"],
    ans: 1,
    exp: "Identifying the root cause ('why did it happen') is Diagnostic Analytics."
  },
  {
    q: "If an analyst builds a forecast showing: 'Based on seasonal trends, holiday sales in December are expected to reach $2.4 Million', what type of analytics is this?",
    opts: ["Descriptive Analytics", "Diagnostic Analytics", "Predictive Analytics", "Prescriptive Analytics"],
    ans: 2,
    exp: "Forecasting future trends based on historical models is Predictive Analytics."
  },
  {
    q: "If a recommendation engine suggests: 'Automatically increase server capacity by 50% and offer 10% coupon codes during peak hours to maximize conversions', what type of analytics is this?",
    opts: ["Descriptive Analytics", "Diagnostic Analytics", "Predictive Analytics", "Prescriptive Analytics"],
    ans: 3,
    exp: "Recommending specific actions to achieve an optimal business outcome is Prescriptive Analytics."
  },
  {
    q: "When a dataset has missing values (nulls) in an age column, what is 'Imputation'?",
    opts: [
      "Deleting all rows with missing values permanently",
      "Replacing missing values with an estimated substitute value, such as the Mean or Median of the column",
      "Filling all blanks with zero unconditionally",
      "Ignoring the column completely"
    ],
    ans: 1,
    exp: "Imputation is the statistical practice of substituting missing data with calculated values (mean, median, mode, or predictive model) to retain sample size."
  },
  {
    q: "When should you impute missing numeric values with the MEDIAN rather than the MEAN?",
    opts: [
      "When the column has significant outliers or a heavily skewed distribution",
      "When the column contains text names",
      "Only when the sample size is under 10",
      "Never; the Mean is always mathematically superior"
    ],
    ans: 0,
    exp: "When data is skewed or contains extreme outliers, the Mean is distorted. The Median provides a robust, representative center value for imputation."
  },
  {
    q: "What is a major risk of simply deleting every row that contains any missing value (listwise deletion)?",
    opts: [
      "It speeds up calculations too much",
      "It can drastically reduce sample size and introduce significant bias if the data is not Missing Completely At Random (MCAR)",
      "It deletes formulas from Excel",
      "Databases do not allow row deletions"
    ],
    ans: 1,
    exp: "Listwise deletion throws away valid information from other non-null columns and can severely bias results if missingness is correlated with other factors."
  },
  {
    q: "What is a 'Duplicate Record' in a dataset, and why is it dangerous for analysis?",
    opts: [
      "Two identical columns with different names",
      "Multiple identical rows representing the same real-world entity, which artificially inflates counts, sums, and averages",
      "A record backed up on another server",
      "A record that contains negative numbers"
    ],
    ans: 1,
    exp: "Duplicate rows count transactions or users multiple times, leading to falsely inflated revenue numbers and distorted business metrics."
  },
  {
    q: "What does the term KPI stand for in business analytics?",
    opts: [
      "Key Performance Indicator",
      "Knowledge Processing Interface",
      "Kernel Protocol Index",
      "Key Product Identification"
    ],
    ans: 0,
    exp: "KPI stands for Key Performance Indicator—a quantifiable measure used to evaluate the success of an organization in meeting strategic objectives."
  },
  {
    q: "What is the difference between a general 'Metric' and a 'KPI'?",
    opts: [
      "Every KPI is a metric, but only the specific metrics that directly tie to critical business goals and strategic decisions are designated as KPIs",
      "Metrics are in percentages; KPIs are in whole numbers",
      "KPIs only apply to software developers; metrics apply to managers",
      "There is no distinction"
    ],
    ans: 0,
    exp: "A metric is any measurable data point. A KPI is a critical metric chosen specifically because it tracks progress toward key strategic business objectives."
  },
  {
    q: "What does 'Customer Churn Rate' measure?",
    opts: [
      "The rate at which new customers register on the website",
      "The percentage of customers who stop doing business with a company or cancel subscriptions over a given time period",
      "The average purchase value per customer",
      "The speed of customer support ticket responses"
    ],
    ans: 1,
    exp: "Churn rate = (Customers Lost during period / Total Customers at start of period) * 100. Lower churn indicates strong customer retention."
  },
  {
    q: "What does Customer Acquisition Cost (CAC) represent?",
    opts: [
      "The total revenue earned from a customer over their lifetime",
      "The total sales and marketing cost divided by the number of new customers acquired in that period",
      "The retail price of the most expensive product",
      "The monthly fee for web hosting"
    ],
    ans: 1,
    exp: "CAC measures the financial investment required to convince a new lead to become a paying customer."
  },
  {
    q: "Which chart is universally considered the best choice to show changes and trends in a metric OVER TIME (e.g. monthly revenue over 3 years)?",
    opts: ["Pie Chart", "Line Chart", "Radar Chart", "Treemap"],
    ans: 1,
    exp: "Line charts connect data points sequentially across continuous time intervals, making trends, seasonality, and spikes immediately visible."
  },
  {
    q: "Which chart type is best for comparing the magnitude of values across discrete, non-sequential categories (e.g. Sales by Product Category)?",
    opts: ["Bar Chart or Column Chart", "Scatter Plot", "Line Chart", "Bubble Chart"],
    ans: 0,
    exp: "Bar/Column charts align categories along a common baseline, allowing human eyes to accurately judge differences in bar lengths."
  },
  {
    q: "Why do data visualization experts and professional analysts discourage the use of 3D Pie Charts?",
    opts: [
      "3D pie charts take too long to print",
      "The perspective angle distorts slice proportions, making front slices look artificially larger than rear slices, misleading viewers",
      "Pie charts only work with negative numbers",
      "3D charts require VR headsets"
    ],
    ans: 1,
    exp: "Perspective distortion in 3D charts skews angles and surface areas, making accurate visual comparison of parts-to-whole virtually impossible."
  },
  {
    q: "What is 'Data Storytelling' for a business data analyst?",
    opts: [
      "Writing fictional stories about company employees",
      "The ability to translate complex data findings into a clear, narrative-driven presentation with visual charts so business leaders can make informed decisions",
      "Reading spreadsheets aloud in meetings",
      "Memorizing database tables"
    ],
    ans: 1,
    exp: "Data storytelling combines data, visualizations, and human narrative to explain the context, findings, and actionable recommendations to stakeholders."
  },
  {
    q: "What is a 'Sanity Check' or 'Smoke Test' in data analytics?",
    opts: [
      "Running an antivirus scan on the Excel file",
      "A quick high-level verification to check if calculated results make reasonable sense (e.g., verifying conversion rate isn't 120% or total revenue isn't negative)",
      "Checking the temperature of computer hardware",
      "Testing if the monitor screen works"
    ],
    ans: 1,
    exp: "A sanity check is a quick reality check to confirm that calculations, totals, and logic are within reasonable real-world bounds before presenting to management."
  },
  {
    q: "If an analyst is asked: 'Which marketing channel has the highest conversion rate?', what is the formula for Conversion Rate?",
    opts: [
      "(Number of Conversions / Total Number of Visitors or Leads) * 100",
      "(Total Sales / Total Expenses) * 100",
      "Total Revenue * Number of Clicks",
      "Number of Visitors - Number of Buyers"
    ],
    ans: 0,
    exp: "Conversion Rate is calculated as (Conversions / Total Visitors) * 100, expressing the percentage of prospects who completed a desired action."
  },
  {
    q: "What is the best practice when you discover inconsistent date formats in your dataset (e.g., '12/04/2023', '2023-04-12', 'April 12, 2023')?",
    opts: [
      "Delete all rows that don't match the first row",
      "Standardize all dates into a single uniform format (e.g. ISO 8601: YYYY-MM-DD) across the entire dataset",
      "Leave them mixed since Excel doesn't care",
      "Convert all dates into random numbers"
    ],
    ans: 1,
    exp: "Standardizing dates into a uniform standard (such as ISO 8601 YYYY-MM-DD) prevents incorrect month/day parsing and ensures accurate sorting and filtering."
  },
  {
    q: "When presenting analytical insights to non-technical business stakeholders, what should you prioritize?",
    opts: [
      "Showing all 50 lines of complex SQL code and raw formulas",
      "Focusing on the business impact, key actionable insights, clear charts, and recommended next steps in plain business language",
      "Using as much statistical jargon and technical acronyms as possible to sound smart",
      "Sending a 200-page raw CSV file without any explanation"
    ],
    ans: 1,
    exp: "Business stakeholders need clarity and impact: what does this data mean for revenue, efficiency, and strategy, and what specific action should be taken next."
  }
];

console.log(`Data Analytics question pool size: ${daPool.length}`);

// Map to structured question objects
const structuredQuestions = daPool.map((q, idx) => ({
  id: `da_${idx + 1}`,
  category: "Data Analytics",
  topic: idx < 25 ? "Python Fundamentals (Conditionals)" : (idx < 50 ? "Excel Mastery" : (idx < 75 ? "DA Fundamentals & Statistics" : "Types of Analytics & Analyst Role")),
  difficulty: idx < 50 ? "Basic" : "Medium",
  question: q.q,
  options: q.opts,
  correctAnswer: q.ans,
  explanation: q.exp
}));

const outPath = path.join(__dirname, '..', 'data', 'questions', 'data_analytics.json');
fs.writeFileSync(outPath, JSON.stringify(structuredQuestions, null, 2), 'utf8');
console.log(`Saved ${structuredQuestions.length} Data Analytics questions to ${outPath}`);

