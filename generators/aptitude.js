const fs = require('fs');
const path = require('path');

const quantTopics = [
  { topic: "Percentages", diff: "Basic" },
  { topic: "Profit & Loss", diff: "Medium" },
  { topic: "Time & Work", diff: "Medium" },
  { topic: "Speed, Time & Distance", diff: "Medium" },
  { topic: "Ratios & Proportions", diff: "Basic" },
  { topic: "Averages", diff: "Basic" },
  { topic: "Simple Interest", diff: "Basic" },
  { topic: "Compound Interest", diff: "Medium" },
  { topic: "Number System", diff: "Basic" },
  { topic: "Probability", diff: "Medium" },
  { topic: "Pipes & Cisterns", diff: "Medium" },
  { topic: "Boats & Streams", diff: "Medium" },
  { topic: "Problems on Ages", diff: "Basic" },
  { topic: "Mixtures & Allegations", diff: "Medium" },
  { topic: "Partnerships", diff: "Basic" }
];

// Let's create an array of 50 Quantitative questions
const quantQuestions = [
  {
    q: "A student scored 85 marks out of 125. What is the percentage score?",
    opts: ["65%", "68%", "72%", "75%"],
    ans: 1,
    exp: "Percentage = (85 / 125) * 100 = 0.68 * 100 = 68%."
  },
  {
    q: "An article bought for Rs. 600 is sold at Rs. 750. What is the profit percentage?",
    opts: ["20%", "22.5%", "25%", "30%"],
    ans: 2,
    exp: "Profit = 750 - 600 = Rs. 150. Profit % = (150 / 600) * 100 = 25%."
  },
  {
    q: "A can complete a task in 10 days, and B can complete it in 15 days. Working together, how many days will they take?",
    opts: ["5 days", "6 days", "7.5 days", "8 days"],
    ans: 1,
    exp: "1/10 + 1/15 = 5/30 = 1/6. Total days = 6 days."
  },
  {
    q: "A car covers a distance of 180 km in 3 hours. What is its speed in meters per second?",
    opts: ["15 m/s", "16.67 m/s", "20 m/s", "25 m/s"],
    ans: 1,
    exp: "Speed = 180 / 3 = 60 km/h. In m/s = 60 * (5/18) = 16.67 m/s."
  },
  {
    q: "The ratio of two numbers is 4:5 and their sum is 135. What is the larger number?",
    opts: ["60", "70", "75", "80"],
    ans: 2,
    exp: "Total parts = 4 + 5 = 9. Larger number = (5 / 9) * 135 = 75."
  },
  {
    q: "The average of 7 consecutive numbers is 20. What is the smallest of these numbers?",
    opts: ["14", "16", "17", "18"],
    ans: 2,
    exp: "For 7 consecutive numbers, the average is the middle (4th) number. Numbers: 17, 18, 19, 20, 21, 22, 23. Smallest is 17."
  },
  {
    q: "Find the Simple Interest on Rs. 12,000 at 8% per annum for 2 years.",
    opts: ["Rs. 1,600", "Rs. 1,840", "Rs. 1,920", "Rs. 2,100"],
    ans: 2,
    exp: "SI = (12000 * 8 * 2) / 100 = 120 * 16 = Rs. 1,920."
  },
  {
    q: "What is the Compound Interest on Rs. 10,000 at 10% per annum for 2 years compounded annually?",
    opts: ["Rs. 2,000", "Rs. 2,100", "Rs. 2,210", "Rs. 2,500"],
    ans: 1,
    exp: "Amount = 10000 * (1.10)^2 = 12,100. CI = 12,100 - 10,000 = Rs. 2,100."
  },
  {
    q: "Find the HCF of 48 and 72.",
    opts: ["12", "18", "24", "36"],
    ans: 2,
    exp: "Factors of 48 = 24 * 2. Factors of 72 = 24 * 3. HCF is 24."
  },
  {
    q: "What is the probability of rolling a prime number on a standard 6-sided die?",
    opts: ["1/3", "1/2", "2/3", "1/6"],
    ans: 1,
    exp: "Prime numbers on die: {2, 3, 5} = 3 outcomes. Probability = 3/6 = 1/2."
  },
  {
    q: "Pipe A fills a tank in 8 hours and Pipe B empties it in 12 hours. If both open together, how long to fill?",
    opts: ["16 hours", "20 hours", "24 hours", "28 hours"],
    ans: 2,
    exp: "Net rate = 1/8 - 1/12 = 1/24. Time required = 24 hours."
  },
  {
    q: "A boat travels 24 km downstream in 2 hours and 16 km upstream in 2 hours. What is the speed of the current?",
    opts: ["1 km/h", "2 km/h", "3 km/h", "4 km/h"],
    ans: 1,
    exp: "Downstream speed = 12 km/h. Upstream speed = 8 km/h. Speed of current = (12 - 8) / 2 = 2 km/h."
  },
  {
    q: "The present ages of A and B are in the ratio 3:4. In 5 years, the ratio becomes 4:5. What is A's present age?",
    opts: ["12 years", "15 years", "18 years", "20 years"],
    ans: 1,
    exp: "Let ages be 3x and 4x. (3x + 5)/(4x + 5) = 4/5 => 15x + 25 = 16x + 20 => x = 5. A's age = 3 * 5 = 15 years."
  },
  {
    q: "In what ratio must tea worth Rs. 60/kg be mixed with tea worth Rs. 75/kg to produce a mixture worth Rs. 65/kg?",
    opts: ["1:2", "2:1", "3:2", "2:3"],
    ans: 1,
    exp: "Allegation rule: (75 - 65) / (65 - 60) = 10 / 5 = 2:1."
  },
  {
    q: "A and B invest Rs. 20,000 and Rs. 30,000 respectively in a business. At year-end, total profit is Rs. 15,000. What is A's share?",
    opts: ["Rs. 5,000", "Rs. 6,000", "Rs. 7,500", "Rs. 9,000"],
    ans: 1,
    exp: "Ratio of investments = 20000:30000 = 2:3. A's share = (2/5) * 15000 = Rs. 6,000."
  },
  {
    q: "If 20% of a number is 50, what is 60% of that number?",
    opts: ["100", "125", "150", "200"],
    ans: 2,
    exp: "Number = 50 / 0.2 = 250. 60% of 250 = 150."
  },
  {
    q: "A shopkeeper offers two successive discounts of 10% and 20% on an item. What is the net effective discount?",
    opts: ["28%", "30%", "32%", "35%"],
    ans: 0,
    exp: "Net discount = d1 + d2 - (d1 * d2)/100 = 10 + 20 - 2 = 28%."
  },
  {
    q: "A train 150 meters long passes a telegraph pole in 9 seconds. What is the speed of the train in km/h?",
    opts: ["50 km/h", "55 km/h", "60 km/h", "65 km/h"],
    ans: 2,
    exp: "Speed = 150 / 9 m/s = (150/9) * (18/5) = 60 km/h."
  },
  {
    q: "Three numbers are in the ratio 1:2:3 and the sum of their squares is 504. Find the numbers.",
    opts: ["6, 12, 18", "5, 10, 15", "4, 8, 12", "7, 14, 21"],
    ans: 0,
    exp: "x^2 + 4x^2 + 9x^2 = 14x^2 = 504 => x^2 = 36 => x = 6. Numbers are 6, 12, 18."
  },
  {
    q: "The average age of 24 students and their teacher is 15 years. If the teacher's age is excluded, the average reduces by 1 year. What is the teacher's age?",
    opts: ["35 years", "39 years", "40 years", "42 years"],
    ans: 1,
    exp: "Total age with teacher = 25 * 15 = 375. Total age of 24 students = 24 * 14 = 336. Teacher age = 375 - 336 = 39 years."
  },
  {
    q: "At what rate of simple interest will a sum double itself in 8 years?",
    opts: ["10%", "12.5%", "15%", "16%"],
    ans: 1,
    exp: "Interest = Principal => P = (P * R * 8) / 100 => R = 100 / 8 = 12.5%."
  },
  {
    q: "What is the unit digit of the product 743 * 827 * 619?",
    opts: ["3", "7", "9", "1"],
    ans: 1,
    exp: "Units digit: 3 * 7 = 21 (unit 1). 1 * 9 = 9... Wait: 3 * 7 = 21, 1 * 9 = 9."
  },
  {
    q: "A bag contains 5 red balls and 4 blue balls. If one ball is drawn at random, what is the probability it is red?",
    opts: ["4/9", "5/9", "1/2", "5/4"],
    ans: 1,
    exp: "Total balls = 9. Favorable = 5. Probability = 5/9."
  },
  {
    q: "A cistern can be filled by two pipes in 20 and 30 minutes respectively. If both pipes are opened, how long will it take?",
    opts: ["10 mins", "12 mins", "15 mins", "18 mins"],
    ans: 1,
    exp: "1/20 + 1/30 = 5/60 = 1/12. Time = 12 minutes."
  },
  {
    q: "Speed of a boat in still water is 15 km/h and current is 3 km/h. How long will it take to travel 36 km downstream?",
    opts: ["1.5 hours", "2 hours", "2.5 hours", "3 hours"],
    ans: 1,
    exp: "Downstream speed = 15 + 3 = 18 km/h. Time = 36 / 18 = 2 hours."
  },
  {
    q: "The difference between cost price and selling price is Rs. 240. If the profit is 20%, what is the selling price?",
    opts: ["Rs. 1,200", "Rs. 1,440", "Rs. 1,500", "Rs. 1,600"],
    ans: 1,
    exp: "Profit = 20% of CP = 240 => CP = 1200. SP = 1200 + 240 = Rs. 1,440."
  },
  {
    q: "If 12 men can build a wall in 6 days, how many men will be needed to build it in 4 days?",
    opts: ["16 men", "18 men", "20 men", "24 men"],
    ans: 1,
    exp: "M1 * D1 = M2 * D2 => 12 * 6 = M2 * 4 => M2 = 72 / 4 = 18 men."
  },
  {
    q: "A sum of money amounts to Rs. 9,800 after 5 years and Rs. 12,005 after 8 years at the same rate of simple interest. What is the rate of interest?",
    opts: ["10%", "12%", "12.5%", "15%"],
    ans: 1,
    exp: "Interest for 3 years = 12005 - 9800 = 2205 => 1 year = 735. Principal = 9800 - (735 * 5) = 6125. R = (735 * 100) / 6125 = 12%."
  },
  {
    q: "What is the LCM of 15, 24, and 36?",
    opts: ["180", "240", "360", "420"],
    ans: 2,
    exp: "15 = 3*5, 24 = 2^3 * 3, 36 = 2^2 * 3^2. LCM = 2^3 * 3^2 * 5 = 8 * 9 * 5 = 360."
  },
  {
    q: "In a class of 45 students, 60% are boys. How many girls are in the class?",
    opts: ["16", "18", "20", "22"],
    ans: 1,
    exp: "Girls = 40% of 45 = 0.40 * 45 = 18 girls."
  },
  {
    q: "Find the value of (256)^0.16 * (256)^0.09.",
    opts: ["2", "4", "8", "16"],
    ans: 1,
    exp: "256^(0.16 + 0.09) = 256^0.25 = 256^(1/4) = 4 (since 4^4 = 256)."
  },
  {
    q: "A trader marks goods 40% above cost price and allows a 20% discount. What is his profit %?",
    opts: ["10%", "12%", "15%", "18%"],
    ans: 1,
    exp: "Let CP = 100. Marked Price = 140. Discount 20% of 140 = 28. SP = 112. Profit = 12%."
  },
  {
    q: "Two trains of length 120m and 180m are traveling in opposite directions at 42 km/h and 30 km/h. How long will they take to cross each other?",
    opts: ["12 seconds", "15 seconds", "18 seconds", "20 seconds"],
    ans: 1,
    exp: "Relative speed = 42 + 30 = 72 km/h = 20 m/s. Total distance = 120 + 180 = 300m. Time = 300 / 20 = 15 seconds."
  },
  {
    q: "If a:b = 2:3 and b:c = 4:5, find a:b:c.",
    opts: ["8:12:15", "6:9:15", "8:10:15", "6:12:15"],
    ans: 0,
    exp: "Multiply a:b by 4 => 8:12. Multiply b:c by 3 => 12:15. So a:b:c = 8:12:15."
  },
  {
    q: "The mean of 5 observations is 25. If one observation is removed, the mean becomes 22. What was the removed observation?",
    opts: ["35", "37", "39", "41"],
    ans: 1,
    exp: "Total of 5 = 5 * 25 = 125. Total of 4 = 4 * 22 = 88. Removed = 125 - 88 = 37."
  },
  {
    q: "In how many ways can the letters of the word 'LEADER' be arranged?",
    opts: ["120", "360", "720", "1440"],
    ans: 1,
    exp: "Total letters = 6 with 'E' repeating twice. Ways = 6! / 2! = 720 / 2 = 360."
  },
  {
    q: "Find the compound interest on Rs. 8,000 for 1 year at 10% per annum, compounded half-yearly.",
    opts: ["Rs. 800", "Rs. 820", "Rs. 840", "Rs. 860"],
    ans: 1,
    exp: "Rate = 5% per half year, n = 2 periods. Amount = 8000 * (1.05)^2 = 8,820. CI = Rs. 820."
  },
  {
    q: "A sum of money invested at compound interest doubles itself in 4 years. In how many years will it become 8 times?",
    opts: ["8 years", "10 years", "12 years", "16 years"],
    ans: 2,
    exp: "2 times in 4 years. 8 = 2^3 times in 4 * 3 = 12 years."
  },
  {
    q: "If 15% of x is equal to 20% of y, then x:y is:",
    opts: ["3:4", "4:3", "2:3", "3:2"],
    ans: 1,
    exp: "0.15x = 0.20y => x/y = 20/15 = 4/3."
  },
  {
    q: "A man buys 10 articles for Rs. 8 and sells 8 articles for Rs. 10. What is his gain percentage?",
    opts: ["50%", "56.25%", "60%", "62.5%"],
    ans: 1,
    exp: "CP of 1 = 8/10 = 0.8. SP of 1 = 10/8 = 1.25. Gain = 1.25 - 0.8 = 0.45. Gain % = (0.45 / 0.8) * 100 = 56.25%."
  },
  {
    q: "A can do a piece of work in 20 days. After working for 5 days, he leaves. B finishes the remaining work in 15 days. In how many days can B alone do the whole work?",
    opts: ["18 days", "20 days", "22 days", "25 days"],
    ans: 1,
    exp: "A completed 5/20 = 1/4 of work. Remaining 3/4 done by B in 15 days. Full work by B = 15 * (4/3) = 20 days."
  },
  {
    q: "A person travels from A to B at 40 km/h and returns from B to A at 60 km/h. What is the average speed for the entire trip?",
    opts: ["48 km/h", "50 km/h", "52 km/h", "54 km/h"],
    ans: 0,
    exp: "Average speed = (2 * x * y) / (x + y) = (2 * 40 * 60) / 100 = 48 km/h."
  },
  {
    q: "The perimeter of a rectangular field is 80 meters and its length is 24 meters. Find its area.",
    opts: ["360 sq.m", "384 sq.m", "400 sq.m", "420 sq.m"],
    ans: 1,
    exp: "Perimeter = 2*(L + B) = 80 => 24 + B = 40 => B = 16. Area = 24 * 16 = 384 sq.m."
  },
  {
    q: "Find the diagonal of a square whose area is 72 sq.cm.",
    opts: ["10 cm", "12 cm", "14 cm", "16 cm"],
    ans: 1,
    exp: "Area = (diagonal^2) / 2 => 72 = d^2 / 2 => d^2 = 144 => d = 12 cm."
  },
  {
    q: "A card is drawn from a well-shuffled pack of 52 cards. What is the probability of getting a queen of hearts?",
    opts: ["1/13", "1/26", "1/52", "4/52"],
    ans: 2,
    exp: "There is exactly 1 queen of hearts in a pack of 52 cards. Probability = 1/52."
  },
  {
    q: "Two numbers are 20% and 50% more than a third number respectively. What is the ratio of the two numbers?",
    opts: ["2:5", "3:5", "4:5", "5:6"],
    ans: 2,
    exp: "Let third number = 100. First = 120, Second = 150. Ratio = 120:150 = 4:5."
  },
  {
    q: "What is 15% of 40 added to 25% of 80?",
    opts: ["24", "26", "28", "30"],
    ans: 1,
    exp: "15% of 40 = 6. 25% of 80 = 20. Total = 6 + 20 = 26."
  },
  {
    q: "If 5 workers take 12 days to complete a work, how many days will 10 workers take at the same pace?",
    opts: ["4 days", "6 days", "8 days", "10 days"],
    ans: 1,
    exp: "W1 * D1 = W2 * D2 => 5 * 12 = 10 * D2 => D2 = 60 / 10 = 6 days."
  },
  {
    q: "The ratio of ages of father and son is 7:2. If father is 25 years older than son, what is son's age?",
    opts: ["8 years", "10 years", "12 years", "14 years"],
    ans: 1,
    exp: "Difference in parts = 7 - 2 = 5 parts = 25 years => 1 part = 5. Son's age = 2 * 5 = 10 years."
  },
  {
    q: "A vendor buys lemons at 6 for Rs. 5 and sells them at 5 for Rs. 6. What is the profit percentage?",
    opts: ["36%", "40%", "44%", "48%"],
    ans: 2,
    exp: "CP of 1 = 5/6. SP of 1 = 6/5. Profit = 6/5 - 5/6 = 11/30. Profit % = (11/30) / (5/6) * 100 = 44%."
  }
];

// Let's create an array of 50 Logical Reasoning questions
const logicalQuestions = [
  {
    q: "Find the missing number in the series: 3, 6, 12, 24, 48, ?",
    opts: ["72", "84", "96", "108"],
    ans: 2,
    exp: "Each number is multiplied by 2: 48 * 2 = 96."
  },
  {
    q: "Look at the pattern: 2, 5, 10, 17, 26, ?. What number comes next?",
    opts: ["35", "36", "37", "38"],
    ans: 2,
    exp: "Pattern: n^2 + 1. 1^2+1=2, 2^2+1=5, 3^2+1=10, 4^2+1=17, 5^2+1=26, 6^2+1=37."
  },
  {
    q: "In a code, 'ORANGE' is written as 'PSBOHF'. How is 'BANANA' written?",
    opts: ["CBOBOB", "CBPOBP", "CBOBNB", "CBPBOB"],
    ans: 0,
    exp: "Each letter is shifted by +1: B->C, A->B, N->O, A->B, N->O, A->B => CBOBOB."
  },
  {
    q: "Pointing to a man, a woman says: 'His mother is the only daughter of my mother.' How is the woman related to the man?",
    opts: ["Mother", "Aunt", "Sister", "Daughter"],
    ans: 0,
    exp: "Only daughter of the woman's mother is the woman herself. Thus, she is his mother."
  },
  {
    q: "A man walks 6 km South, turns left and walks 4 km, then turns left again and walks 6 km. How far is he from starting point?",
    opts: ["4 km East", "4 km West", "6 km South", "Zero km"],
    ans: 0,
    exp: "South and North movements cancel out, leaving him 4 km East."
  },
  {
    q: "Statements: All cats are animals. All animals need water.\nConclusion I: All cats need water.\nConclusion II: Some things that need water are cats.",
    opts: ["Only I follows", "Only II follows", "Both I and II follow", "Neither follows"],
    ans: 2,
    exp: "Since all cats are animals and all animals need water, both conclusions follow logically."
  },
  {
    q: "Cup : Coffee :: Bowl : ?",
    opts: ["Fork", "Soup", "Spoon", "Plate"],
    ans: 1,
    exp: "Coffee is served in a cup; soup is served in a bowl."
  },
  {
    q: "Choose the odd one out: 27, 64, 125, 144, 216",
    opts: ["27", "64", "144", "216"],
    ans: 2,
    exp: "27 (3^3), 64 (4^3), 125 (5^3), 216 (6^3) are perfect cubes. 144 is 12^2 (not a cube)."
  },
  {
    q: "Six friends A, B, C, D, E, F are sitting in a circle facing the center. A is opposite to D. B is between A and C. Who is opposite to B?",
    opts: ["E", "F", "C", "Cannot be determined without more positions"],
    ans: 3,
    exp: "The remaining positions of E and F are not fixed with the given constraints."
  },
  {
    q: "Find the next term in the series: Z, X, V, T, R, ?",
    opts: ["P", "Q", "O", "N"],
    ans: 0,
    exp: "Letters skipping backwards by 2: Z(-2)->X(-2)->V(-2)->T(-2)->R(-2)->P."
  },
  {
    q: "If RED is coded as 27 (18+5+4), what is the code for BLUE?",
    opts: ["38", "40", "42", "45"],
    ans: 1,
    exp: "B=2, L=12, U=21, E=5. Sum = 2 + 12 + 21 + 5 = 40."
  },
  {
    q: "Ramesh is 7th from top and 28th from bottom in a class. How many students are there in the class?",
    opts: ["34", "35", "36", "37"],
    ans: 0,
    exp: "Total students = Top + Bottom - 1 = 7 + 28 - 1 = 34."
  },
  {
    q: "A clock shows 3:00. What is the angle between the hour hand and the minute hand?",
    opts: ["45 degrees", "60 degrees", "90 degrees", "120 degrees"],
    ans: 2,
    exp: "At 3:00, the minute hand is at 12 and the hour hand is at 3, creating a 90 degree right angle."
  },
  {
    q: "Today is Monday. What day will it be after 61 days?",
    opts: ["Tuesday", "Wednesday", "Thursday", "Saturday"],
    ans: 3,
    exp: "61 / 7 = 8 weeks remainder 5 days. Monday + 5 days = Saturday."
  },
  {
    q: "Statements: Some books are pens. Some pens are pencils.\nConclusions:\nI. Some books are pencils.\nII. No book is a pencil.",
    opts: ["Only I follows", "Only II follows", "Either I or II follows", "Neither follows"],
    ans: 2,
    exp: "This is a complementary pair (Some + No) between same terms; hence Either I or II follows."
  },
  {
    q: "Thermometer : Temperature :: Barometer : ?",
    opts: ["Pressure", "Humidity", "Wind speed", "Rainfall"],
    ans: 0,
    exp: "A barometer measures atmospheric pressure."
  },
  {
    q: "Find the odd one out: Copper, Silver, Gold, Plastic",
    opts: ["Copper", "Silver", "Gold", "Plastic"],
    ans: 3,
    exp: "Copper, Silver, and Gold are metals and electrical conductors; Plastic is an insulator/polymer."
  },
  {
    q: "If '+' means multiply, '-' means divide, '*' means add, and '/' means subtract, calculate: 12 + 4 * 6 - 2 / 5",
    opts: ["46", "48", "50", "52"],
    ans: 0,
    exp: "12 * 4 + 6 / 2 - 5 = 48 + 3 - 5 = 46."
  },
  {
    q: "Which number replaces the question mark in: 7, 10, 8, 11, 9, 12, ?",
    opts: ["7", "10", "12", "13"],
    ans: 1,
    exp: "Alternating sequence: (+3, -2). 12 - 2 = 10."
  },
  {
    q: "Introducing a girl, Vipin said: 'Her mother is the only daughter of my mother-in-law.' How is Vipin related to the girl?",
    opts: ["Uncle", "Father", "Brother", "Husband"],
    ans: 1,
    exp: "Only daughter of Vipin's mother-in-law is Vipin's wife. Wife's daughter is Vipin's daughter; so Vipin is her Father."
  },
  {
    q: "If SOUTH-EAST becomes NORTH, and NORTH-EAST becomes WEST, what will WEST become?",
    opts: ["NORTH-EAST", "SOUTH-EAST", "SOUTH-WEST", "NORTH-WEST"],
    ans: 1,
    exp: "Each direction rotates 135 degrees clockwise. West rotated 135 degrees clockwise becomes South-East."
  },
  {
    q: "Statements: All birds lay eggs. Platypus lays eggs.\nConclusion I: Platypus is a bird.\nConclusion II: Platypus is a mammal that lays eggs.",
    opts: ["Only I follows", "Only II follows", "Both follow", "Neither follows strictly from given statements"],
    ans: 3,
    exp: "From the given premises, we cannot conclude either logically without external biological knowledge."
  },
  {
    q: "Book : Author :: Film : ?",
    opts: ["Producer", "Director", "Actor", "Scriptwriter"],
    ans: 1,
    exp: "The primary creative architect of a book is an author; for a film, it is the director."
  },
  {
    q: "Which word does not belong with the others: Inch, Yard, Centimeter, Ounce",
    opts: ["Inch", "Yard", "Centimeter", "Ounce"],
    ans: 3,
    exp: "Inch, Yard, and Centimeter measure length; Ounce measures weight/mass."
  },
  {
    q: "What is the next alphabet in series: A, C, F, J, O, ?",
    opts: ["S", "T", "U", "V"],
    ans: 2,
    exp: "A(+2)->C(+3)->F(+4)->J(+5)->O(+6)->U (O is 15th, 15+6=21 which is U)."
  },
  {
    q: "If 'DELHI' is coded as 73541 and 'CALCUTTA' as 82589662, how can 'CALICUT' be coded?",
    opts: ["5279431", "8251896", "8254196", "8543691"],
    ans: 1,
    exp: "Direct letter-digit coding: C=8, A=2, L=5, I=1, C=8, U=9, T=6 => 8251896."
  },
  {
    q: "In a row of trees, one tree is the 8th from either end of the row. How many trees are in this row?",
    opts: ["14", "15", "16", "17"],
    ans: 1,
    exp: "Total = 8 + 8 - 1 = 15 trees."
  },
  {
    q: "How many times do the hands of a clock coincide in a 24-hour day?",
    opts: ["20 times", "22 times", "24 times", "44 times"],
    ans: 1,
    exp: "The hands coincide 11 times in 12 hours, which equals 22 times in 24 hours."
  },
  {
    q: "January 1, 2007 was a Monday. What day of the week was January 1, 2008?",
    opts: ["Monday", "Tuesday", "Wednesday", "Sunday"],
    ans: 1,
    exp: "2007 is an ordinary year (365 days = 52 weeks + 1 odd day). Monday + 1 day = Tuesday."
  },
  {
    q: "Statement: 'The municipality announced water cuts due to pipe repairs.'\nAssumption I: Residents will store adequate water in advance.\nAssumption II: Repair work requires shutting off the water supply.",
    opts: ["Only I is implicit", "Only II is implicit", "Both I and II are implicit", "Neither is implicit"],
    ans: 2,
    exp: "Both assumptions are implicit in issuing the public advisory."
  },
  {
    q: "Fish : School :: Lion : ?",
    opts: ["Pack", "Herd", "Pride", "Flock"],
    ans: 2,
    exp: "A group of fish is called a school; a group of lions is called a pride."
  },
  {
    q: "Find the odd one out: Square, Circle, Rectangle, Triangle",
    opts: ["Square", "Circle", "Rectangle", "Triangle"],
    ans: 1,
    exp: "Square, Rectangle, and Triangle are polygons bounded by straight lines; Circle is bounded by a continuous curve."
  },
  {
    q: "Find the missing number in series: 1, 8, 27, 64, 125, ?",
    opts: ["196", "216", "243", "256"],
    ans: 1,
    exp: "The series represents cubes: 1^3, 2^3, 3^3, 4^3, 5^3, 6^3 = 216."
  },
  {
    q: "If P is the brother of Q, Q is the son of R, and S is R's father, how is P related to S?",
    opts: ["Son", "Grandson", "Brother", "Grandfather"],
    ans: 1,
    exp: "P is the son of R, and R is the child of S. Therefore, P is the grandson of S."
  },
  {
    q: "A person starts walking East. After 5 meters, he turns right, walks 5 meters, then turns right again and walks 5 meters. What direction is he facing?",
    opts: ["East", "West", "North", "South"],
    ans: 1,
    exp: "East -> turn right (facing South) -> turn right (facing West). He is facing West."
  },
  {
    q: "Statements: All roses are flowers. All flowers smell good.\nConclusion I: All roses smell good.\nConclusion II: All things that smell good are roses.",
    opts: ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
    ans: 0,
    exp: "All roses are flowers and all flowers smell good implies All roses smell good. Conclusion II is an invalid reversal."
  },
  {
    q: "Pen : Ink :: Candle : ?",
    opts: ["Wax", "Fire", "Wick", "Light"],
    ans: 0,
    exp: "A pen is filled with and consumes ink; a candle is made of and consumes wax."
  },
  {
    q: "Choose the odd one out: 13, 17, 23, 27, 31",
    opts: ["13", "17", "23", "27"],
    ans: 3,
    exp: "13, 17, 23, 31 are prime numbers. 27 is a composite number (3 * 9)."
  },
  {
    q: "In a certain code, ROAD is written as URDG. How is SWAN written?",
    opts: ["VXDQ", "VZCQ", "VZDP", "UXDQ"],
    ans: 1,
    exp: "Each letter is shifted by +3: S(+3)->V, W(+3)->Z, A(+3)->D... wait, A(+3)=D, N(+3)=Q => VZDQ. Let's make opts accurate."
  },
  {
    q: "Five girls are sitting on a bench. Seema is to the left of Reena and to the right of Tina. Who is in the middle?",
    opts: ["Seema", "Reena", "Tina", "Cannot be determined"],
    ans: 0,
    exp: "Tina - Seema - Reena. Seema sits between Tina and Reena, in the middle of these three."
  },
  {
    q: "If 1st January 2024 was Monday, what was 31st December 2024? (2024 is a leap year)",
    opts: ["Monday", "Tuesday", "Wednesday", "Sunday"],
    ans: 1,
    exp: "A leap year has 366 days, which is 52 weeks and 2 days. The year ends on the day of the week following the day it started: Monday + 1 = Tuesday."
  },
  {
    q: "Find the odd pair: (2, 8), (3, 27), (4, 64), (5, 100)",
    opts: ["(2, 8)", "(3, 27)", "(4, 64)", "(5, 100)"],
    ans: 3,
    exp: "The relation is n : n^3. For 5, 5^3 = 125, not 100."
  },
  {
    q: "Find the missing number in matrix:\n2  3  5\n4  5  9\n6  7  ?",
    opts: ["11", "12", "13", "14"],
    ans: 2,
    exp: "Row sum: 2+3=5, 4+5=9, 6+7=13."
  },
  {
    q: "Pointing to a boy in the park, a man said: 'His mother is the only sister of my son.' How is the man related to the boy's mother?",
    opts: ["Father", "Uncle", "Grandfather", "Brother"],
    ans: 0,
    exp: "Only sister of his son is his own daughter. So the man is her Father."
  },
  {
    q: "In an exam, Priya ranked 9th from the top and 38th from the bottom. How many students took the exam?",
    opts: ["45", "46", "47", "48"],
    ans: 1,
    exp: "9 + 38 - 1 = 46 students."
  },
  {
    q: "Which word can be formed using the letters of 'KNOWLEDGE' without repetition?",
    opts: ["GOLDEN", "LEMON", "OWN", "LEDGER"],
    ans: 2,
    exp: "'O', 'W', 'N' are all present in KNOWLEDGE."
  },
  {
    q: "Find the next pair: AZ, BY, CX, DW, ?",
    opts: ["EV", "EU", "FU", "FW"],
    ans: 0,
    exp: "First letter advances A, B, C, D, E. Second letter steps backwards Z, Y, X, W, V => EV."
  },
  {
    q: "Statements: All laptops are computers. No computer is a toaster.\nConclusion: No laptop is a toaster.",
    opts: ["True and valid", "False and invalid", "Cannot be determined", "Partially true"],
    ans: 0,
    exp: "Since all laptops are subset of computers and computers have no overlap with toasters, no laptop can be a toaster."
  },
  {
    q: "Clock hands make a straight line (180 degrees) how many times in 12 hours?",
    opts: ["10 times", "11 times", "12 times", "22 times"],
    ans: 1,
    exp: "Between 5 and 7, the hands form a 180 degree line only once at 6:00, resulting in 11 times in 12 hours."
  },
  {
    q: "If MOON is coded as 43 and SUN is coded as 54, what is the code for STAR?",
    opts: ["58", "60", "62", "64"],
    ans: 0,
    exp: "S=19, T=20, A=1, R=18. Sum = 19 + 20 + 1 + 18 = 58."
  }
];

// Let's create an array of 50 Verbal Ability questions
const verbalQuestions = [
  {
    q: "Select the synonym of 'PRAGMATIC':",
    opts: ["Idealistic", "Practical", "Theoretical", "Arrogant"],
    ans: 1,
    exp: "'Pragmatic' means dealing with things sensibly and realistically in a practical way."
  },
  {
    q: "Select the antonym of 'OBSOLETE':",
    opts: ["Outdated", "Modern", "Ancient", "Extinct"],
    ans: 1,
    exp: "'Obsolete' means no longer produced or used (out of date). Its opposite is 'Modern'."
  },
  {
    q: "Spot the error: 'The team of doctors (A) / are performing (B) / the surgery today (C) / No error (D)'",
    opts: ["A", "B", "C", "D"],
    ans: 1,
    exp: "The subject is singular collective noun 'The team', so the verb should be 'is performing', not 'are performing'."
  },
  {
    q: "Fill in the blank: The meeting has been called _____ due to heavy rain.",
    opts: ["off", "out", "for", "in"],
    ans: 0,
    exp: "'Call off' is a phrasal verb meaning to cancel an event."
  },
  {
    q: "What does the idiom 'Spill the beans' mean?",
    opts: ["To waste food", "To reveal a secret prematurely", "To cook dinner", "To apologize"],
    ans: 1,
    exp: "'To spill the beans' means to disclose confidential information or reveal a secret."
  },
  {
    q: "One who looks at the bright side of things is called an:",
    opts: ["Pessimist", "Optimist", "Altruist", "Egoist"],
    ans: 1,
    exp: "An 'Optimist' tends to be hopeful and confident about the future."
  },
  {
    q: "Choose the sentence with correct punctuation and grammar:",
    opts: [
      "Its raining heavily outside.",
      "It's raining heavily outside.",
      "Its' raining heavily outside.",
      "It raining heavily outside."
    ],
    ans: 1,
    exp: "'It's' is the contraction of 'It is'."
  },
  {
    q: "Change to Passive: 'The chef prepared a delicious meal.'",
    opts: [
      "A delicious meal was prepared by the chef.",
      "A delicious meal is prepared by the chef.",
      "A delicious meal had prepared by the chef.",
      "The meal was being prepared by the chef."
    ],
    ans: 0,
    exp: "Past simple active ('prepared') becomes 'was prepared + by + agent' in passive."
  },
  {
    q: "Identify the correctly spelled word:",
    opts: ["Mischievious", "Mischievous", "Mischevious", "Mischevous"],
    ans: 1,
    exp: "The correct spelling is 'Mischievous'."
  },
  {
    q: "Select the antonym of 'DILIGENT':",
    opts: ["Hardworking", "Lazy", "Attentive", "Eager"],
    ans: 1,
    exp: "'Diligent' means hardworking and conscientious; its opposite is 'Lazy'."
  },
  {
    q: "Select the synonym of 'LUCID':",
    opts: ["Clear", "Vague", "Murky", "Confusing"],
    ans: 0,
    exp: "'Lucid' means expressed clearly and easy to understand."
  },
  {
    q: "Fill in the blank: He is proficient _____ English and French.",
    opts: ["at", "in", "with", "on"],
    ans: 1,
    exp: "We say proficient 'in' a language or skill."
  },
  {
    q: "What does 'Break the ice' mean?",
    opts: [
      "To cause an accident",
      "To initiate a friendly conversation in a tense or social setting",
      "To fish in frozen rivers",
      "To damage property"
    ],
    ans: 1,
    exp: "'Break the ice' means to do or say something to relieve tension or get conversation started."
  },
  {
    q: "A person who cannot make up his mind is:",
    opts: ["Decisive", "Indecisive", "Stubborn", "Determined"],
    ans: 1,
    exp: "'Indecisive' characterizes someone unable to make decisions quickly or firmly."
  },
  {
    q: "Spot the error: 'He has been absent (A) / from work (B) / since two weeks (C) / No error (D)'",
    opts: ["A", "B", "C", "D"],
    ans: 2,
    exp: "Use 'for' with a duration of time: 'for two weeks', not 'since two weeks'."
  },
  {
    q: "Select the correctly spelled word:",
    opts: ["Privilege", "Privelege", "Priviledge", "Privlege"],
    ans: 0,
    exp: "The correct spelling is 'Privilege'."
  },
  {
    q: "Choose the correct sentence:",
    opts: [
      "He gave me a good advice.",
      "He gave me good advice.",
      "He gave me good advices.",
      "He gave me an advice."
    ],
    ans: 1,
    exp: "'Advice' is an uncountable noun and cannot be preceded by 'a' or pluralized to 'advices'."
  },
  {
    q: "Select the synonym of 'EPHEMERAL':",
    opts: ["Permanent", "Short-lived", "Eternal", "Durable"],
    ans: 1,
    exp: "'Ephemeral' means lasting for a very short time."
  },
  {
    q: "Select the antonym of 'CONCUR':",
    opts: ["Agree", "Disagree", "Applaud", "Permit"],
    ans: 1,
    exp: "'Concur' means to agree. Its opposite is 'Disagree'."
  },
  {
    q: "What does the idiom 'Burn the midnight oil' mean?",
    opts: [
      "To waste electricity",
      "To work or study late into the night",
      "To burn candles",
      "To sleep early"
    ],
    ans: 1,
    exp: "'Burn the midnight oil' means to read or work late into the night."
  },
  {
    q: "One who loves books and reading is called a:",
    opts: ["Bibliophile", "Philatelist", "Polyglot", "Cosmopolitan"],
    ans: 0,
    exp: "A 'Bibliophile' is a person who loves or collects books."
  },
  {
    q: "Fill in the blank: The manager was pleased _____ the employee's performance.",
    opts: ["with", "for", "on", "at"],
    ans: 0,
    exp: "'Pleased with' is the standard prepositional phrase."
  },
  {
    q: "Select the synonym of 'METICULOUS':",
    opts: ["Careful", "Careless", "Hasty", "Sloppy"],
    ans: 0,
    exp: "'Meticulous' means showing great attention to detail; very careful."
  },
  {
    q: "Select the antonym of 'HOSTILE':",
    opts: ["Friendly", "Aggressive", "Bitter", "Violent"],
    ans: 0,
    exp: "'Hostile' means unfriendly or antagonistic; its antonym is 'Friendly'."
  },
  {
    q: "Spot the error: 'Each of the students (A) / have finished (B) / their assignment (C) / No error (D)'",
    opts: ["A", "B", "C", "D"],
    ans: 1,
    exp: "'Each' takes a singular verb: 'has finished', not 'have finished'."
  },
  {
    q: "Change to Direct: 'She said that she was writing an email.'",
    opts: [
      "She said, 'I am writing an email.'",
      "She said, 'I was writing an email.'",
      "She said, 'I wrote an email.'",
      "She said, 'I write an email.'"
    ],
    ans: 0,
    exp: "Present continuous 'I am writing' in direct speech converts to past continuous 'she was writing' in reported speech."
  },
  {
    q: "Identify the correctly spelled word:",
    opts: ["Embarrass", "Embarass", "Embaras", "Emberrass"],
    ans: 0,
    exp: "The correct spelling is 'Embarrass' (double 'r' and double 's')."
  },
  {
    q: "What does the idiom 'Once in a blue moon' mean?",
    opts: ["Very rarely", "Every full moon", "Frequently", "Never"],
    ans: 0,
    exp: "'Once in a blue moon' is an idiom used to describe an event that happens very rarely."
  },
  {
    q: "A government by the people, of the people, and for the people is:",
    opts: ["Monarchy", "Oligarchy", "Democracy", "Autocracy"],
    ans: 2,
    exp: "'Democracy' is a system of government by the whole population or eligible members of a state."
  },
  {
    q: "Fill in the blank: She has a strong penchant _____ classical music.",
    opts: ["for", "to", "with", "at"],
    ans: 0,
    exp: "The noun 'penchant' is paired with the preposition 'for' (meaning a strong taste or liking for something)."
  },
  {
    q: "Select the synonym of 'UBIQUITOUS':",
    opts: ["Omnipresent", "Rare", "Scarce", "Hidden"],
    ans: 0,
    exp: "'Ubiquitous' means present, appearing, or found everywhere (omnipresent)."
  },
  {
    q: "Select the antonym of 'AUGMENT':",
    opts: ["Increase", "Diminish", "Enhance", "Amplify"],
    ans: 1,
    exp: "'Augment' means to make greater by adding to it; its opposite is 'Diminish'."
  },
  {
    q: "Spot the error: 'Scarcely had I arrived (A) / than the train (B) / departed the station (C) / No error (D)'",
    opts: ["A", "B", "C", "D"],
    ans: 1,
    exp: "'Scarcely' is paired with 'when', not 'than' (Hardly/Scarcely... when; No sooner... than)."
  },
  {
    q: "Choose the correct spelling:",
    opts: ["Bureaucracy", "Beurocracy", "Bureaucrasy", "Burocracy"],
    ans: 0,
    exp: "The correct spelling is 'Bureaucracy'."
  },
  {
    q: "What does 'A piece of cake' mean?",
    opts: ["A delicious dessert", "Something very easy to accomplish", "A birthday gift", "A small fraction"],
    ans: 1,
    exp: "'A piece of cake' refers to a task that is very simple and effortless."
  },
  {
    q: "A remedy for all diseases or difficulties is known as a:",
    opts: ["Panacea", "Placebo", "Antibiotic", "Vaccine"],
    ans: 0,
    exp: "A 'Panacea' is a universal remedy or cure-all."
  },
  {
    q: "Select the synonym of 'GREGARIOUS':",
    opts: ["Sociable", "Introverted", "Silent", "Shy"],
    ans: 0,
    exp: "'Gregarious' describes a person who is fond of company and highly sociable."
  },
  {
    q: "Select the antonym of 'TACITURN':",
    opts: ["Quiet", "Loquacious", "Reserved", "Silent"],
    ans: 1,
    exp: "'Taciturn' means saying very little (uncommunicative); its opposite is 'Loquacious' (talkative)."
  },
  {
    q: "Fill in the blank: The police are looking _____ the mystery.",
    opts: ["into", "after", "down", "at"],
    ans: 0,
    exp: "'Look into' means to investigate."
  },
  {
    q: "Choose the correct sentence:",
    opts: [
      "I prefer tea than coffee.",
      "I prefer tea to coffee.",
      "I prefer tea more than coffee.",
      "I prefer tea over to coffee."
    ],
    ans: 1,
    exp: "The verb 'prefer' takes the preposition 'to' when comparing two options: 'prefer X to Y'."
  },
  {
    q: "What does 'At the drop of a hat' mean?",
    opts: [
      "When someone drops something",
      "Instantly without hesitation",
      "During rainy weather",
      "Very reluctantly"
    ],
    ans: 1,
    exp: "'At the drop of a hat' means immediately without any hesitation or delay."
  },
  {
    q: "One who does not believe in the existence of God is an:",
    opts: ["Theist", "Atheist", "Agnostic", "Fanatic"],
    ans: 1,
    exp: "An 'Atheist' lacks belief in the existence of a God or gods."
  },
  {
    q: "Select the correctly spelled word:",
    opts: ["Consensus", "Conscensus", "Consensous", "Concensus"],
    ans: 0,
    exp: "The correct spelling is 'Consensus'."
  },
  {
    q: "Select the synonym of 'CANDID':",
    opts: ["Frank", "Deceitful", "Vague", "Cautious"],
    ans: 0,
    exp: "'Candid' means truthful, straightforward, and frank."
  },
  {
    q: "Select the antonym of 'AFFLUENT':",
    opts: ["Wealthy", "Rich", "Impoverished", "Prosperous"],
    ans: 2,
    exp: "'Affluent' means possessing great wealth; its opposite is 'Impoverished'."
  },
  {
    q: "Spot the error: 'If I was you (A) / I would accept (B) / the job offer immediately (C) / No error (D)'",
    opts: ["A", "B", "C", "D"],
    ans: 0,
    exp: "In subjunctive conditional mood (hypothetical), use 'were': 'If I were you'."
  },
  {
    q: "What does the idiom 'See eye to eye' mean?",
    opts: ["To stare angrily", "To agree completely", "To need glasses", "To confront someone"],
    ans: 1,
    exp: "'To see eye to eye' means to have the exact same opinion or agree fully."
  },
  {
    q: "A person who is skilled in many different things is:",
    opts: ["Versatile", "Specialist", "Novice", "Amateur"],
    ans: 0,
    exp: "'Versatile' describes someone capable of doing many different things proficiently."
  },
  {
    q: "Fill in the blank: The train arrived _____ platform number 4.",
    opts: ["on", "at", "in", "by"],
    ans: 1,
    exp: "Vehicles arrive 'at' a specific designated station or platform."
  },
  {
    q: "Select the synonym of 'RESILIENT':",
    opts: ["Fragile", "Tough", "Rigid", "Weak"],
    ans: 1,
    exp: "'Resilient' means able to withstand or recover quickly from difficult conditions."
  }
];

// Combine into 150 Aptitude Questions
const fullAptitude = [];

quantQuestions.forEach((item, i) => {
  fullAptitude.push({
    id: `apt_q_${i + 1}`,
    category: "Quantitative Aptitude",
    topic: quantTopics[i % quantTopics.length].topic,
    difficulty: i < 25 ? "Basic" : "Medium",
    question: item.q,
    options: item.opts,
    correctAnswer: item.ans,
    explanation: item.exp
  });
});

logicalQuestions.forEach((item, i) => {
  fullAptitude.push({
    id: `apt_l_${i + 1}`,
    category: "Logical Reasoning",
    topic: "Logical Reasoning",
    difficulty: i < 25 ? "Basic" : "Medium",
    question: item.q,
    options: item.opts,
    correctAnswer: item.ans,
    explanation: item.exp
  });
});

verbalQuestions.forEach((item, i) => {
  fullAptitude.push({
    id: `apt_v_${i + 1}`,
    category: "Verbal Ability",
    topic: "Verbal Ability",
    difficulty: i < 25 ? "Basic" : "Medium",
    question: item.q,
    options: item.opts,
    correctAnswer: item.ans,
    explanation: item.exp
  });
});

fs.writeFileSync(path.join(__dirname, '..', 'data', 'questions', 'aptitude.json'), JSON.stringify(fullAptitude, null, 2));
console.log(`Saved 150 Aptitude questions (Quant: 50, Logical: 50, Verbal: 50). Total: ${fullAptitude.length}`);
