const fs = require('fs');
const path = require('path');

const reactPool = [
  // =========================================================================
  // 1-25: React Basics & JSX Fundamentals (Basic)
  // =========================================================================
  {
    q: "What is React primarily categorized as in web development?",
    opts: [
      "A complete back-end server framework",
      "An open-source JavaScript library for building user interfaces",
      "A relational database management system",
      "A CSS styling preprocessor"
    ],
    ans: 1,
    exp: "React is a front-end JavaScript library developed by Facebook (Meta) specifically designed for building declarative, component-based user interfaces."
  },
  {
    q: "Who originally developed and open-sourced React?",
    opts: ["Google", "Meta (Facebook)", "Microsoft", "Twitter"],
    ans: 1,
    exp: "React was created by Jordan Walke, a software engineer at Facebook (now Meta), and open-sourced in 2013."
  },
  {
    q: "What is a Single Page Application (SPA)?",
    opts: [
      "A website containing only one paragraph of text",
      "A web application that interacts with the user by dynamically rewriting the current web page rather than loading entire new pages from the server",
      "A website that does not require JavaScript",
      "A web page that only works on desktop monitors"
    ],
    ans: 1,
    exp: "SPAs load a single HTML document and update portions of the page dynamically via JavaScript as user interactions occur, eliminating full-page reloads."
  },
  {
    q: "What does JSX stand for in React?",
    opts: ["JavaScript XML", "Java Syntax Extension", "JSON Style X-code", "JavaScript X-Engine"],
    ans: 0,
    exp: "JSX stands for JavaScript XML. It is a syntax extension to JavaScript that allows developers to write HTML-like markup inside JavaScript files."
  },
  {
    q: "Can web browsers directly understand and execute JSX code natively?",
    opts: [
      "Yes, all modern browsers natively execute JSX without tools",
      "No, JSX must be transpiled into standard JavaScript (using tools like Babel) before browsers can run it",
      "Only Google Chrome can run JSX natively",
      "Yes, if the file extension is .jsx"
    ],
    ans: 1,
    exp: "Browsers only understand standard JavaScript. Transpilers like Babel or SWC compile JSX into React.createElement() calls."
  },
  {
    q: "Which attribute must be used in JSX to assign CSS classes to an HTML element instead of the traditional 'class' attribute?",
    opts: ["class", "className", "styleClass", "classList"],
    ans: 1,
    exp: "In JavaScript, 'class' is a reserved keyword for ES6 classes. Therefore, JSX uses 'className' for HTML classes."
  },
  {
    q: "Which attribute is used in JSX instead of HTML's 'for' attribute in `<label>` elements?",
    opts: ["htmlFor", "labelFor", "forElement", "targetFor"],
    ans: 0,
    exp: "Because 'for' is a reserved keyword in JavaScript (used for loops), JSX uses 'htmlFor' to associate a label with an input."
  },
  {
    q: "How do you embed a dynamic JavaScript variable or expression inside JSX markup?",
    opts: [
      "Wrap it in double curly braces: {{ variable }}",
      "Wrap it in single curly braces: { variable }",
      "Wrap it in quotes: 'variable'",
      "Wrap it in angle brackets: <variable>"
    ],
    ans: 1,
    exp: "In JSX, any valid JavaScript expression can be placed between single curly braces { expression }."
  },
  {
    q: "What rule must be followed regarding the root return element of a React component's JSX?",
    opts: [
      "A component must return multiple unparented sibling elements",
      "A component must return a single root element (or a Fragment)",
      "A component cannot return any HTML tags",
      "A component must return an array of 5 elements minimum"
    ],
    ans: 1,
    exp: "A React component must return a single parent root element, or wrap multiple sibling elements inside a React Fragment (<>...</>)."
  },
  {
    q: "What is a React Fragment used for?",
    opts: [
      "To group multiple elements together without adding an extra node to the browser DOM",
      "To break a component into multiple server files",
      "To create 3D animations in canvas",
      "To store data in local storage"
    ],
    ans: 0,
    exp: "React Fragments (<React.Fragment> or shorthand <>...</>) group a list of children without adding unnecessary wrapper divs to the real DOM."
  },
  {
    q: "What is the short syntax for a React Fragment?",
    opts: ["<fragment>...</fragment>", "<>...</>", "[...]", "<!-- -->"],
    ans: 1,
    exp: "The shorthand syntax for React.Fragment is empty tags: <> and </>."
  },
  {
    q: "How must void/self-closing elements (such as `<img>`, `<input>`, `<br>`) be written in JSX?",
    opts: [
      "They do not need to be closed: <img>",
      "They must be explicitly closed with a slash: <img /> or <br />",
      "They must be wrapped in a string: 'img'",
      "They are not supported in React"
    ],
    ans: 1,
    exp: "JSX follows XML rules strictly; all tags, including self-closing tags like <img />, <input />, and <br />, must be closed."
  },
  {
    q: "How are inline styles applied to JSX elements?",
    opts: [
      "As a standard CSS string: style='color: red; margin: 10px'",
      "As a JavaScript object with camelCase properties: style={{ color: 'red', margin: '10px' }}",
      "As a stylesheet file path: style='style.css'",
      "Inline styles are prohibited in React"
    ],
    ans: 1,
    exp: "Inline styles in JSX are written as JavaScript objects with camelCase property names (e.g., style={{ backgroundColor: 'blue', fontSize: '16px' }})."
  },
  {
    q: "How do you write comments inside JSX markup?",
    opts: [
      "<!-- This is a comment -->",
      "{/* This is a comment */}",
      "// This is a comment",
      "/* This is a comment */"
    ],
    ans: 1,
    exp: "Inside JSX expressions, comments must be enclosed in curly braces with standard multi-line comment syntax: {/* comment */}."
  },
  {
    q: "What naming convention must be followed for custom React component names?",
    opts: [
      "They must start with a lowercase letter (e.g., myButton)",
      "They must start with an uppercase PascalCase letter (e.g., MyButton)",
      "They must start with an underscore (e.g., _button)",
      "They must all be in ALLCAPS"
    ],
    ans: 1,
    exp: "React treats elements starting with lowercase letters as standard built-in HTML tags (like <div>). Custom components must start with an uppercase letter."
  },
  {
    q: "In modern React (React 18+), how do you render the root React application into the browser DOM element `<div id='root'></div>`?",
    opts: [
      "ReactDOM.render(<App />, document.getElementById('root'))",
      "const root = ReactDOM.createRoot(document.getElementById('root')); root.render(<App />);",
      "document.getElementById('root').innerHTML = <App />",
      "React.mount(<App />, '#root')"
    ],
    ans: 1,
    exp: "React 18 introduced createRoot: const root = ReactDOM.createRoot(container); root.render(<App />); which replaces the deprecated ReactDOM.render."
  },
  {
    q: "What is the Virtual DOM in React?",
    opts: [
      "A copy of the browser's operating system memory",
      "A lightweight, in-memory JavaScript representation of the real DOM",
      "A cloud database used by Meta",
      "A physical hardware graphics chip"
    ],
    ans: 1,
    exp: "The Virtual DOM is a lightweight JavaScript object representation of the real DOM. React updates this in memory and diffs it before touching the slower real DOM."
  },
  {
    q: "What is the main performance benefit of using the Virtual DOM in React?",
    opts: [
      "It completely eliminates the need for JavaScript",
      "It minimizes expensive browser repaints and reflows by calculating changes in memory and batch-updating only what changed",
      "It encrypts the HTML source code from viewers",
      "It increases internet download speed"
    ],
    ans: 1,
    exp: "Direct DOM manipulation is slow due to layout reflows. React diffs the Virtual DOM and updates only the modified DOM nodes in the real browser DOM."
  },
  {
    q: "What is the process of comparing the new Virtual DOM tree with the previous Virtual DOM tree called?",
    opts: ["Reconciliation / Diffing", "Compiling", "Parsing", "Minification"],
    ans: 0,
    exp: "React's diffing algorithm compares the current Virtual DOM with the previous snapshot to identify differences; this overall process is called Reconciliation."
  },
  {
    q: "What data flow model does React follow between parent and child components?",
    opts: [
      "Two-way automatic data binding",
      "Unidirectional (one-way) data flow from parent to child",
      "Circular random data flow",
      "Child-to-parent only data flow"
    ],
    ans: 1,
    exp: "React utilizes unidirectional data flow: data is passed down from top-level parent components to child components via props."
  },
  {
    q: "What is a Functional Component in React?",
    opts: [
      "A JavaScript function that accepts props as an argument and returns JSX markup",
      "A function that only executes mathematical formulas",
      "A function that cannot display UI",
      "A database stored procedure"
    ],
    ans: 0,
    exp: "A functional component is simply a JavaScript function that takes optional props and returns JSX elements describing what should appear on screen."
  },
  {
    q: "Which tool is commonly used today to quickly scaffold a modern, lightning-fast React application setup?",
    opts: ["Vite", "Wordpress", "Photoshop", "Apache Ant"],
    ans: 0,
    exp: "Vite (along with Create React App) is a widely used modern build tool that quickly initializes and bundles React applications."
  },
  {
    q: "What does the expression `{isLoggedIn ? <UserGreeting /> : <GuestGreeting />}` do in React JSX?",
    opts: [
      "It renders both components simultaneously",
      "It conditionally renders UserGreeting if isLoggedIn is true, otherwise GuestGreeting",
      "It causes a runtime error because ternary operators are not allowed in JSX",
      "It deletes the isLoggedIn variable"
    ],
    ans: 1,
    exp: "Ternary operators are valid JavaScript expressions; if isLoggedIn is truthy, <UserGreeting /> renders; otherwise <GuestGreeting /> renders."
  },
  {
    q: "What happens if a JavaScript expression in JSX evaluates to `false`, `null`, `undefined`, or `true`?",
    opts: [
      "The string 'false' or 'null' is printed onto the screen",
      "Nothing is rendered to the screen (they are ignored)",
      "The application crashes",
      "An alert dialog pops up"
    ],
    ans: 1,
    exp: "Booleans (true/false), null, and undefined are valid children in JSX that simply render nothing. This makes `{hasNewMessage && <Badge />}` possible."
  },
  {
    q: "What will `{messages.length > 0 && <p>You have messages</p>}` render when messages.length is 0?",
    opts: [
      "Nothing at all",
      "0 (the number zero)",
      "You have messages",
      "undefined"
    ],
    ans: 1,
    exp: "In JavaScript, 0 && <p> evaluates to 0 because 0 is falsy, and React renders the number 0. To avoid this, write: `messages.length > 0 ? <p>...</p> : null`."
  },

  // =========================================================================
  // 26-50: Props, State & Component Architecture (Basic to Medium)
  // =========================================================================
  {
    q: "What are 'props' in React?",
    opts: [
      "Private variables that only the component itself can modify",
      "Inputs or arguments passed from a parent component to a child component",
      "CSS style property sheets",
      "Database connection strings"
    ],
    ans: 1,
    exp: "Props (short for properties) are read-only attributes passed from parent to child components to configure or pass data into them."
  },
  {
    q: "Are props in React mutable (can a child component modify its own props directly)?",
    opts: [
      "Yes, a child component can modify props anytime: props.title = 'New'",
      "No, props are read-only and immutable; a component must never modify its own props",
      "Yes, but only if props are numbers",
      "Yes, if using modern React"
    ],
    ans: 1,
    exp: "All React components must act like pure functions with respect to their props. A component must never mutate the props it receives."
  },
  {
    q: "How can you destructure props in a functional component: `function UserCard(props)`?",
    opts: [
      "function UserCard({ name, age })",
      "function UserCard(name, age)",
      "function UserCard([ name, age ])",
      "function UserCard(props: { name, age })"
    ],
    ans: 0,
    exp: "ES6 parameter destructuring `function UserCard({ name, age })` allows direct access to `name` and `age` without typing `props.name`."
  },
  {
    q: "What is `props.children` in React?",
    opts: [
      "A list of all sub-components installed via npm",
      "A special prop that represents the content placed between the opening and closing tags of a component: `<Card>Hello</Card>`",
      "The age of the user's children",
      "An array of database child tables"
    ],
    ans: 1,
    exp: "props.children contains whatever JSX elements or text are nested inside the component invocation: `<Parent><Child /></Parent>`."
  },
  {
    q: "What is 'State' in React?",
    opts: [
      "A geographical territory in the country",
      "An internal data store managed inside a component that can change over time and causes the component to re-render when updated",
      "A static global CSS file",
      "The URL address of the website"
    ],
    ans: 1,
    exp: "State represents the dynamic memory of a component. When state changes, React automatically re-renders the component to reflect new UI."
  },
  {
    q: "Which React Hook is used to declare state variables in functional components?",
    opts: ["useEffect()", "useState()", "useContext()", "useReducer()"],
    ans: 1,
    exp: "The useState hook allows functional components to declare and maintain local state."
  },
  {
    q: "What does the `useState` hook return?",
    opts: [
      "Only the current state value",
      "An array with exactly two elements: the current state value and a function to update it",
      "An object with get and set methods",
      "A callback function"
    ],
    ans: 1,
    exp: "useState returns a two-element array: [currentState, setStateFunction]. We typically unpack it using array destructuring: const [count, setCount] = useState(0);"
  },
  {
    q: "In the line: `const [count, setCount] = useState(10);`, what does the argument `10` represent?",
    opts: [
      "The maximum allowed value of count",
      "The initial state value on the first render",
      "The number of times the component can re-render",
      "The delay in milliseconds"
    ],
    ans: 1,
    exp: "The argument passed to useState(initialValue) sets the initial state value during the component's initial mount."
  },
  {
    q: "What happens if you update state directly without calling the setter function, e.g., `count = count + 1`?",
    opts: [
      "React updates the screen immediately",
      "The variable changes in memory, but React does NOT know about it and will NOT re-render the UI",
      "The browser displays a red syntax error",
      "The component resets to zero"
    ],
    ans: 1,
    exp: "Directly mutating a state variable bypasses React's change detection; the component will not re-render and the UI will remain outdated."
  },
  {
    q: "If a new state value depends on the previous state value, what is the recommended way to call the setter function?",
    opts: [
      "setCount(count + 1)",
      "setCount(prevCount => prevCount + 1)",
      "count++",
      "setCount(1 + 1)"
    ],
    ans: 1,
    exp: "Passing an updater function `setCount(prev => prev + 1)` ensures you are working with the most up-to-date state, avoiding stale state issues during batching."
  },
  {
    q: "What is the primary difference between State and Props?",
    opts: [
      "Props are internal and managed by the component; State is passed from outside",
      "State is internal and managed within the component; Props are external and passed down from parent components",
      "Props can be changed by the component; State is permanent and immutable",
      "There is no difference"
    ],
    ans: 1,
    exp: "State is owned and managed privately by the component itself. Props are external configuration passed in from a parent component."
  },
  {
    q: "How do you toggle a boolean state variable `const [isOpen, setIsOpen] = useState(false);`?",
    opts: [
      "setIsOpen(!isOpen) or setIsOpen(prev => !prev)",
      "isOpen = !isOpen",
      "setIsOpen(reverse)",
      "setIsOpen(toggle())"
    ],
    ans: 0,
    exp: "Calling `setIsOpen(prev => !prev)` flips the boolean value between true and false cleanly."
  },
  {
    q: "How do you correctly add a new item to an array stored in state: `const [items, setItems] = useState(['Apple', 'Banana']);`?",
    opts: [
      "items.push('Orange'); setItems(items);",
      "setItems([...items, 'Orange'])",
      "setItems(items.append('Orange'))",
      "items[2] = 'Orange'; setItems(items);"
    ],
    ans: 1,
    exp: "State must be treated as immutable. `items.push()` mutates the original array in place. `setItems([...items, 'Orange'])` creates a new array with the item added."
  },
  {
    q: "How do you update a single field `age` in an object stored in state: `const [user, setUser] = useState({ name: 'Alex', age: 20 });`?",
    opts: [
      "user.age = 21; setUser(user);",
      "setUser({ ...user, age: 21 })",
      "setUser(age = 21)",
      "setUser({ age: 21 })"
    ],
    ans: 1,
    exp: "Using the object spread syntax `{ ...user, age: 21 }` copies all existing user properties and overwrites only the `age` property immutably."
  },
  {
    q: "What is meant by 'Lifting State Up' in React?",
    opts: [
      "Uploading state to a remote cloud server",
      "Moving shared state to the closest common parent of components that need to share it",
      "Converting local state into global CSS variables",
      "Deleting state to make components faster"
    ],
    ans: 1,
    exp: "When two sibling components need to share the same data, you lift the state up to their nearest common parent and pass it down as props."
  },
  {
    q: "Can a parent component pass a function down to a child component as a prop?",
    opts: [
      "No, props can only be strings or numbers",
      "Yes, parent functions can be passed as callback props, allowing the child to communicate back to the parent",
      "Only in class components",
      "No, functions cannot be passed in JavaScript"
    ],
    ans: 1,
    exp: "Passing callback functions as props allows child components to notify parent components of events (e.g. `<Button onClick={handleClick} />`)."
  },
  {
    q: "What causes a React component to re-render?",
    opts: [
      "Only when the browser window is resized",
      "When its state changes or when its props change",
      "Only when a page refresh button is clicked",
      "Every 5 seconds automatically"
    ],
    ans: 1,
    exp: "React components re-render automatically whenever their internal state updates or when new props are passed to them by their parent."
  },
  {
    q: "What is a 'Pure Component' or pure function in React?",
    opts: [
      "A component written entirely in HTML without JavaScript",
      "A component that given the same props and state, always renders the exact same output without side effects",
      "A component that has no styles",
      "A component with zero lines of code"
    ],
    ans: 1,
    exp: "A pure component produces identical UI output whenever given identical props and state, and has no hidden side effects."
  },
  {
    q: "Can a React component have more than one `useState` hook call?",
    opts: [
      "No, only one useState call is allowed per component",
      "Yes, you can call useState as many times as needed for different independent pieces of state",
      "Only up to a maximum of 2 calls",
      "Yes, but they must all share the same data type"
    ],
    ans: 1,
    exp: "You can declare multiple state variables using multiple useState calls (e.g., const [name, setName] = useState(''); const [age, setAge] = useState(0);)."
  },
  {
    q: "What is the default value of a prop if you pass it as `<MyComponent isFeatured />` without specifying `= {true}`?",
    opts: ["false", "true", "undefined", "null"],
    ans: 1,
    exp: "In JSX, passing a prop without a value (e.g. `<TextInput disabled />`) defaults its value to boolean `true`."
  },
  {
    q: "How can you specify default values for props using modern ES6 JavaScript in functional components?",
    opts: [
      "function Greeting({ name = 'Guest' })",
      "function Greeting(name: default 'Guest')",
      "Greeting.propDefaults = { name: 'Guest' }",
      "function Greeting(default name = 'Guest')"
    ],
    ans: 0,
    exp: "ES6 parameter default values `function Greeting({ name = 'Guest' })` provide a clean and standard way to assign default props."
  },
  {
    q: "What happens if a component renders another component inside it: `function App() { return <Header />; }`?",
    opts: [
      "Header replaces App completely",
      "App is the parent component and Header is the child component nested inside App's tree",
      "A syntax error is thrown",
      "Header is ignored by React"
    ],
    ans: 1,
    exp: "In React's component hierarchy, App acts as the parent component that composes and renders child components like Header."
  },
  {
    q: "What does the term 'Composition' mean in React?",
    opts: [
      "Writing music inside JavaScript",
      "Building complex UIs by combining smaller, independent, and reusable components together",
      "Compressing code files before deployment",
      "Compiling TypeScript into JavaScript"
    ],
    ans: 1,
    exp: "React favors composition over inheritance: components can contain other components, allowing flexible and reusable UI architecture."
  },
  {
    q: "Can state in React be initialized with a function?",
    opts: [
      "No, initial state must always be a hardcoded number or string",
      "Yes, passing a function `useState(() => expensiveCalculation())` runs the function only once on initial mount (Lazy Initial State)",
      "Yes, but it runs on every single render",
      "Only in Node.js"
    ],
    ans: 1,
    exp: "Passing an initializer function to useState is called lazy initialization; React only calls it once during the initial render."
  },
  {
    q: "Where should business logic and state that impacts multiple components generally reside?",
    opts: [
      "In the deepest child component",
      "In the common ancestor component of those components",
      "In index.html directly",
      "In a CSS file"
    ],
    ans: 1,
    exp: "Sharing state across multiple components is done by keeping the state in their common parent and passing data and handlers down as props."
  },

  // =========================================================================
  // 51-75: Events, Forms, Lists & Keys (Basic to Medium)
  // =========================================================================
  {
    q: "How are event names formatted in React JSX compared to standard HTML?",
    opts: [
      "All lowercase: onclick, onchange, onsubmit",
      "camelCase: onClick, onChange, onSubmit",
      "kebab-case: on-click, on-change",
      "UPPERCASE: ONCLICK, ONCHANGE"
    ],
    ans: 1,
    exp: "In JSX, event handlers are named using camelCase (e.g., onClick, onSubmit, onChange) rather than lowercase."
  },
  {
    q: "Which is the correct way to pass an event handler function to a button in React?",
    opts: [
      "<button onClick={handleClick}>Click</button>",
      "<button onClick={handleClick()}>Click</button>",
      "<button onClick='handleClick()'>Click</button>",
      "<button onclick='handleClick'>Click</button>"
    ],
    ans: 0,
    exp: "You pass the function reference `<button onClick={handleClick}>`. Adding parentheses `handleClick()` executes the function immediately during rendering."
  },
  {
    q: "If you need to pass an argument `id` to an event handler `handleDelete(id)`, how do you write the JSX?",
    opts: [
      "<button onClick={handleDelete(id)}>Delete</button>",
      "<button onClick={() => handleDelete(id)}>Delete</button>",
      "<button onClick={handleDelete:id}>Delete</button>",
      "<button onClick='handleDelete(id)'>Delete</button>"
    ],
    ans: 1,
    exp: "Wrapping the call in an arrow function `<button onClick={() => handleDelete(id)}>` ensures the function only runs when the button is clicked."
  },
  {
    q: "What does `e.preventDefault()` do inside an onSubmit form event handler in React?",
    opts: [
      "It disables all form inputs permanently",
      "It prevents the default browser behavior of submitting an HTTP request and reloading the entire page",
      "It resets all form fields to blank",
      "It prints the form to a physical printer"
    ],
    ans: 1,
    exp: "In standard HTML, submitting a form refreshes the page. Calling `e.preventDefault()` halts this reload, allowing React to handle the submission in JavaScript."
  },
  {
    q: "What is a 'SyntheticEvent' in React?",
    opts: [
      "An automated bot testing event",
      "A cross-browser wrapper around the browser's native event to ensure identical behavior across all browsers",
      "An event that only triggers on mobile phones",
      "A fake simulated keystroke"
    ],
    ans: 1,
    exp: "React wraps native browser DOM events in SyntheticEvent objects so that event handling behaves identically across Chrome, Firefox, Safari, and Edge."
  },
  {
    q: "What is a 'Controlled Component' in React forms?",
    opts: [
      "An input field whose value is controlled by React state and updated via an onChange event handler",
      "An input field that cannot be edited by the user",
      "A component protected by a password",
      "An input field whose value is stored directly in the DOM"
    ],
    ans: 0,
    exp: "In a controlled component, the input element's value is bound to a React state variable, and user typing updates that state via onChange."
  },
  {
    q: "In a controlled text input: `<input type='text' value={name} onChange={handleChange} />`, how do you extract the typed text inside handleChange?",
    opts: [
      "e.target.value",
      "e.target.text",
      "e.value.input",
      "e.current.data"
    ],
    ans: 0,
    exp: "`e.target.value` accesses the current string value of the input DOM element that triggered the change event."
  },
  {
    q: "How do you capture the checked status of a controlled checkbox input?",
    opts: [
      "e.target.value",
      "e.target.checked",
      "e.target.selected",
      "e.target.status"
    ],
    ans: 1,
    exp: "For checkboxes, `e.target.checked` returns a boolean indicating whether the checkbox is currently checked."
  },
  {
    q: "What is an 'Uncontrolled Component' in React forms?",
    opts: [
      "A broken component with infinite loops",
      "A form input whose current value is handled directly by the browser DOM rather than React state, typically accessed via a `ref`",
      "A component without CSS styling",
      "A form with no submit button"
    ],
    ans: 1,
    exp: "In an uncontrolled component, form data is stored in the DOM itself. Developers access its value imperatively using a React ref (e.g., inputRef.current.value)."
  },
  {
    q: "Which JavaScript array method is commonly used in React to transform an array of data into an array of JSX elements for rendering?",
    opts: [".forEach()", ".map()", ".filter()", ".reduce()"],
    ans: 1,
    exp: "The `.map()` method returns a new array of JSX elements for each item in the original data array, making it the standard tool for list rendering."
  },
  {
    q: "Why does `.forEach()` not work for rendering lists directly inside JSX like `{items.forEach(...)}`?",
    opts: [
      "forEach is deprecated in JavaScript",
      "forEach returns undefined instead of returning an array of elements",
      "forEach only works with strings",
      "forEach causes memory leaks"
    ],
    ans: 1,
    exp: "`.forEach()` simply executes a callback for each element and returns `undefined`. JSX needs an array of elements returned, which `.map()` provides."
  },
  {
    q: "When rendering a list of elements using `.map()`, why does React require each item to have a unique `key` prop?",
    opts: [
      "Keys are used for styling elements with CSS",
      "Keys help React identify which items have changed, been added, or been removed, optimizing re-rendering and DOM updates",
      "Keys are required by HTML5 standards",
      "Keys encrypt list items"
    ],
    ans: 1,
    exp: "The `key` prop gives elements a stable identity across renders, allowing React to diff list changes efficiently rather than re-creating the entire list."
  },
  {
    q: "What is the best practice for choosing a value for the `key` prop in a list of items?",
    opts: [
      "A unique, stable identifier from your data (such as a database id: `item.id`)",
      "A randomly generated number like `Math.random()` on every render",
      "The index of the array in every situation",
      "The word 'key'"
    ],
    ans: 0,
    exp: "Using a unique, persistent ID (such as `item.id`) is recommended. Using random numbers breaks reconciliation, and array indices can cause issues if items are reordered or filtered."
  },
  {
    q: "Why can using the array index as the `key` prop (e.g. `items.map((item, index) => <li key={index}>)`) cause UI bugs?",
    opts: [
      "Array indices are not supported by JavaScript",
      "If the list is sorted, filtered, or items are inserted/deleted, indices change, causing React to incorrectly associate component state with the wrong items",
      "It makes the page render in black and white",
      "It converts all numbers to strings"
    ],
    ans: 1,
    exp: "When the order of items changes, an item's index changes. This confuses React's diffing algorithm and can lead to bugs with input focus or local component state."
  },
  {
    q: "Where must the `key` prop be placed when rendering items in a list?",
    opts: [
      "On the outermost element returned inside the `.map()` callback",
      "On every single child tag inside the item",
      "Inside the parent `<ul>` tag only",
      "In the CSS file"
    ],
    ans: 0,
    exp: "The `key` prop must be applied to the topmost, outermost JSX tag returned directly inside the `.map()` iteration."
  },
  {
    q: "How do you conditionally apply a CSS class based on a boolean `isActive` in React JSX?",
    opts: [
      "className={isActive ? 'nav-item active' : 'nav-item'}",
      "class={isActive && 'active'}",
      "style={if isActive 'active'}",
      "className: active"
    ],
    ans: 0,
    exp: "Using a JavaScript template literal or ternary operator `className={isActive ? 'nav-item active' : 'nav-item'}` dynamically sets the CSS class."
  },
  {
    q: "How can you filter a list of products before rendering them in JSX?",
    opts: [
      "products.filter(p => p.price < 50).map(p => <ProductCard key={p.id} product={p} />)",
      "products.delete(p => p.price >= 50)",
      "products.slice(0, 10)",
      "products.remove()"
    ],
    ans: 0,
    exp: "Chaining `.filter()` followed by `.map()` is the idiomatic way to display a subset of data matching a criterion in React."
  },
  {
    q: "In React, how do you handle multiple input fields in a single form using one state object?",
    opts: [
      "You cannot use one state object for multiple inputs",
      "Give each input a `name` attribute matching the state property and use `[e.target.name]: e.target.value` in the change handler",
      "Use document.getElementById for each input",
      "Create 50 different handler functions"
    ],
    ans: 1,
    exp: "Using computed property names: `setFormData({ ...formData, [e.target.name]: e.target.value })` allows a single handler to update any input field by its `name` attribute."
  },
  {
    q: "How do you handle a `<textarea>` element in React compared to traditional HTML?",
    opts: [
      "In React, `<textarea>` uses a `value` prop instead of placing text between tags `<textarea>text</textarea>`",
      "Textareas are not supported in React",
      "Textareas must use `<input type='textarea'>`",
      "Textareas must be read-only"
    ],
    ans: 0,
    exp: "In HTML, `<textarea>` holds text as children. In React, `<textarea value={text} onChange={handleChange} />` uses the `value` prop just like a text input."
  },
  {
    q: "How is a `<select>` dropdown menu managed as a controlled component in React?",
    opts: [
      "By adding `selected` attributes to each individual `<option>`",
      "By passing the `value` prop to the parent `<select>` element: `<select value={selectedVal} onChange={handleChange}>`",
      "By using radio buttons instead",
      "By writing custom C++ scripts"
    ],
    ans: 1,
    exp: "React simplifies dropdowns: you place the `value` prop directly on the `<select>` tag rather than marking `selected` on options."
  },
  {
    q: "What happens if you provide a `value` prop to an `<input>` without an `onChange` handler?",
    opts: [
      "The input becomes editable as normal",
      "The input becomes read-only and React prints a console warning",
      "The browser closes automatically",
      "The text disappears on typing"
    ],
    ans: 1,
    exp: "A controlled input with a `value` but no `onChange` handler cannot be changed by user keystrokes because React forces the value to match the unchanged state."
  },
  {
    q: "How can you specify an uncontrolled input's initial default value without making it controlled?",
    opts: ["Use `defaultValue` instead of `value`", "Use `initialValue`", "Use `valueDefault`", "Use `startText`"],
    ans: 0,
    exp: "The `defaultValue` prop sets the initial text for an uncontrolled input while allowing the user to type freely without React managing every keystroke."
  },
  {
    q: "What is event bubbling in React?",
    opts: [
      "Events pop like physical bubbles on the screen",
      "An event triggered on an innermost child element propagates upwards through its parent elements in the DOM tree",
      "Events that only work on button clicks",
      "A memory overflow error"
    ],
    ans: 1,
    exp: "Event bubbling is standard DOM behavior where events propagate up the component hierarchy. You can stop it using `e.stopPropagation()`."
  },
  {
    q: "How do you stop an event from propagating up to parent elements in React?",
    opts: ["e.stopPropagation()", "e.preventDefault()", "e.halt()", "e.stop()"],
    ans: 0,
    exp: "`e.stopPropagation()` stops the event from bubbling up to ancestor DOM nodes and parent event handlers."
  },
  {
    q: "Which event is triggered in React when an input field loses focus?",
    opts: ["onBlur", "onFocus", "onLeave", "onExit"],
    ans: 0,
    exp: "The `onBlur` event fires when an element loses keyboard focus (the opposite of `onFocus`)."
  },

  // =========================================================================
  // 76-100: Hooks, Lifecycle, Router & Best Practices (Basic to Medium)
  // =========================================================================
  {
    q: "What is the primary purpose of the `useEffect` hook in React?",
    opts: [
      "To perform side effects in functional components, such as data fetching, subscriptions, timers, or DOM manipulation",
      "To write CSS styles inside JavaScript",
      "To declare local state variables",
      "To create HTML tables"
    ],
    ans: 0,
    exp: "useEffect allows you to run side effects in functional components after React has rendered and painted the DOM."
  },
  {
    q: "When does a `useEffect` hook run if NO dependency array is provided at all: `useEffect(() => { ... })`?",
    opts: [
      "Only once when the component mounts",
      "After every single render of the component",
      "Never",
      "Only when the browser window closes"
    ],
    ans: 1,
    exp: "Without a dependency array, useEffect executes after the initial mount and after every subsequent update/render."
  },
  {
    q: "When does a `useEffect` hook run if an EMPTY dependency array `[]` is provided: `useEffect(() => { ... }, [])`?",
    opts: [
      "After every render",
      "Only once after the component's initial mount (render)",
      "Whenever any state variable in the component changes",
      "Only when the component is about to unmount"
    ],
    ans: 1,
    exp: "An empty dependency array `[]` tells React that the effect doesn't depend on any props or state, so it runs only once after the component mounts."
  },
  {
    q: "When does `useEffect(() => { ... }, [userId])` run?",
    opts: [
      "Only on mount",
      "On mount, and whenever the `userId` prop or state value changes between renders",
      "Only when userId is equal to 0",
      "Every millisecond"
    ],
    ans: 1,
    exp: "React checks the items in the dependency array. If any item (like userId) has changed since the last render, the effect re-runs."
  },
  {
    q: "How do you specify a cleanup function in `useEffect` (e.g. to clear a timer or unsubscribe from an event)?",
    opts: [
      "Call useEffect.cleanup()",
      "Return a cleanup function from inside the effect callback: `return () => { clearInterval(timer); }`",
      "Pass a second function parameter to useEffect",
      "Add a 'clean' prop to the component"
    ],
    ans: 1,
    exp: "Returning a function from useEffect specifies the cleanup logic. React runs it before re-running the effect and when the component unmounts."
  },
  {
    q: "What are the two fundamental 'Rules of Hooks' in React?",
    opts: [
      "1. Only call hooks at the top level of your component (not inside loops, conditions, or nested functions). 2. Only call hooks from React function components or custom hooks.",
      "1. Hooks must only be used in class components. 2. Hooks must be written in TypeScript.",
      "1. You can only call one hook per file. 2. Hooks must return strings.",
      "There are no rules for hooks in React."
    ],
    ans: 0,
    exp: "React relies on the call order of hooks across renders to preserve state. Therefore, hooks must never be nested inside loops, if-statements, or nested functions."
  },
  {
    q: "Why can't you place a React Hook inside an `if` condition (e.g. `if (isLoggedIn) useState(...)`)?",
    opts: [
      "Because if statements are illegal in React",
      "Because React relies on hooks being called in the exact same order on every render; conditional calls change the order and corrupt state tracking",
      "Because it slows down computer fans",
      "Because hooks only work with switch statements"
    ],
    ans: 1,
    exp: "Hooks must be called in the exact same sequence on every render so React can correctly match state variables to their corresponding hook calls."
  },
  {
    q: "What is the primary use case for the `useRef` hook in React?",
    opts: [
      "To access and interact directly with a real DOM element (like focusing an input), or to hold a mutable value that does not trigger a re-render when changed",
      "To fetch data from backend servers",
      "To create global CSS animations",
      "To reload the web browser"
    ],
    ans: 0,
    exp: "useRef returns a mutable object with a `.current` property. It's commonly used to hold direct references to DOM nodes (e.g. `inputRef.current.focus()`)."
  },
  {
    q: "Does changing the value of `ref.current` cause the React component to re-render?",
    opts: [
      "Yes, modifying ref.current always triggers a re-render just like setState",
      "No, mutating ref.current does NOT cause a component re-render",
      "Yes, but only if the value is a number",
      "Only in production mode"
    ],
    ans: 1,
    exp: "Unlike state, updating `ref.current` is a silent in-memory mutation that does not trigger a component re-render."
  },
  {
    q: "What naming convention must all Custom Hooks follow in React?",
    opts: [
      "They must start with the prefix 'use' (e.g., `useFetch`, `useAuth`, `useLocalStorage`)",
      "They must end with 'Hook' (e.g., `fetchHook`)",
      "They must be named in ALLCAPS",
      "They must start with an underscore `_`"
    ],
    ans: 0,
    exp: "Custom hooks must start with the word 'use' (camelCase). This convention allows React and linter plugins to automatically verify the Rules of Hooks."
  },
  {
    q: "Can a Custom Hook call other built-in React hooks like `useState` and `useEffect`?",
    opts: [
      "No, custom hooks cannot use any built-in hooks",
      "Yes, the core purpose of custom hooks is to extract and share reusable stateful logic that uses built-in hooks",
      "Only in React class components",
      "Only if authorized by Redux"
    ],
    ans: 1,
    exp: "Custom hooks allow developers to extract component logic into reusable functions that compose built-in hooks like useState and useEffect."
  },
  {
    q: "If two separate components call the exact same custom hook `useCounter()`, do they share the same state data?",
    opts: [
      "Yes, custom hooks create a global singleton state shared by all components",
      "No, each component that calls a custom hook gets its own completely independent instance of state",
      "Yes, if they are rendered on the same web page",
      "Only if they have the same CSS class"
    ],
    ans: 1,
    exp: "Custom hooks share stateful logic, not state itself. Each component calling the hook creates its own isolated, independent state."
  },
  {
    q: "What is the purpose of the `useContext` hook in React?",
    opts: [
      "To subscribe to and consume data from a React Context without passing props manually down every level of the component tree (solving 'prop drilling')",
      "To connect directly to MySQL databases",
      "To translate text into different spoken languages",
      "To compile JSX into HTML"
    ],
    ans: 0,
    exp: "React Context provides a way to pass data (like themes or authenticated user info) through the component tree without manually passing props at every level."
  },
  {
    q: "What problem does React Context and `useContext` primarily solve?",
    opts: [
      "Prop Drilling (passing props down through many layers of intermediate components that don't need them)",
      "Slow internet connections",
      "Syntax errors in CSS",
      "Browser compatibility with Internet Explorer 6"
    ],
    ans: 0,
    exp: "'Prop drilling' occurs when props must be passed through multiple intermediary components just to reach a deeply nested child. Context avoids this by providing direct access."
  },
  {
    q: "In React Router (v6), which component wraps your application to enable client-side routing?",
    opts: ["<BrowserRouter>", "<PageRouter>", "<AppRouter>", "<UrlProvider>"],
    ans: 0,
    exp: "`<BrowserRouter>` wraps the app and uses the HTML5 History API to synchronize your UI with the browser URL."
  },
  {
    q: "Which component in React Router should be used for user navigation links instead of the standard HTML `<a href='...'>` tag?",
    opts: ["<Link to='...'>", "<Hyperlink href='...'>", "<NavAnchor to='...'>", "<RouteLink url='...'>"],
    ans: 0,
    exp: "`<Link to='/about'>` intercepts the browser's default link behavior and navigates client-side without a full page refresh."
  },
  {
    q: "Which hook in React Router v6 is used to extract dynamic URL parameters (e.g. reading `:id` from `/users/:id`)?",
    opts: ["useParams()", "useQuery()", "useUrl()", "useRouteParams()"],
    ans: 0,
    exp: "The `useParams()` hook returns an object of key/value pairs of dynamic URL parameters defined in route paths."
  },
  {
    q: "Which hook in React Router v6 is used to programmatically navigate the user to another page (e.g. after a form submission)?",
    opts: ["useNavigate()", "useHistory()", "useRedirect()", "usePush()"],
    ans: 0,
    exp: "In React Router v6, `const navigate = useNavigate();` is used to programmatically redirect users (e.g., `navigate('/dashboard')`)."
  },
  {
    q: "What are the three main phases of a React component's lifecycle?",
    opts: [
      "Mounting (creation), Updating (growth), and Unmounting (removal)",
      "Downloading, Compiling, and Running",
      "Opening, Typing, and Closing",
      "Input, Process, and Output"
    ],
    ans: 0,
    exp: "A component's lifecycle consists of: Mounting (inserted into DOM), Updating (re-rendered due to state/prop changes), and Unmounting (removed from DOM)."
  },
  {
    q: "Which hook cleanup in functional components corresponds to the unmounting phase (componentWillUnmount)?",
    opts: [
      "The cleanup function returned inside `useEffect(() => { return () => { ... } }, [])`",
      "The useState setter",
      "The return statement containing JSX",
      "The useRef hook"
    ],
    ans: 0,
    exp: "The function returned by an effect with an empty dependency array `[]` executes when the component unmounts from the DOM."
  },
  {
    q: "What is React's `<React.StrictMode>` component used for during development?",
    opts: [
      "It activates additional checks, warnings, and double-invokes lifecycles/effects in development to help detect unintended side effects and deprecated APIs",
      "It prevents users from right-clicking on the webpage",
      "It forces TypeScript type checking on the server",
      "It encrypts all React components"
    ],
    ans: 0,
    exp: "StrictMode is a development-only tool that highlights potential problems, legacy code, and unexpected side effects without rendering visible UI."
  },
  {
    q: "What is a major advantage of splitting a large React application into multiple small, modular components?",
    opts: [
      "Components become easier to read, test, debug, and reuse across different parts of the application",
      "It decreases the number of lines of JavaScript to zero",
      "It eliminates the need for HTML and CSS entirely",
      "It makes the application incompatible with mobile browsers"
    ],
    ans: 0,
    exp: "Modular components improve code maintainability, separation of concerns, testability, and reusability."
  },
  {
    q: "What is the recommended file naming convention for React component files?",
    opts: [
      "PascalCase, matching the component name (e.g., `Button.jsx`, `UserProfile.jsx`)",
      "ALLCAPS (e.g., `BUTTON.JSX`)",
      "kebab-case with numbers only",
      "lowercase without extensions"
    ],
    ans: 0,
    exp: "By widespread convention, React component files are named in PascalCase (e.g., `Navbar.jsx`, `UserProfile.jsx`) matching the component's name."
  },
  {
    q: "What browser extension is officially provided by the React team to inspect component hierarchies, props, and state in real-time?",
    opts: ["React Developer Tools (React DevTools)", "Redux Inspector", "Chrome Element Inspector", "Firebug React"],
    ans: 0,
    exp: "React Developer Tools is an official browser extension that lets you inspect the React component tree, props, and state inside browser DevTools."
  },
  {
    q: "Which command in package.json is typically used to launch the local development server in a standard React project?",
    opts: ["npm run dev or npm start", "npm push", "npm build --production", "npm deploy"],
    ans: 0,
    exp: "In Create React App projects `npm start` is used; in Vite-based React projects `npm run dev` starts the local development server."
  }
];

console.log(`React question pool size: ${reactPool.length}`);

// Map to structured question objects
const structuredQuestions = reactPool.map((q, idx) => ({
  id: `react_${idx + 1}`,
  category: "React",
  topic: idx < 25 ? "React Basics & JSX" : (idx < 50 ? "Props, State & Architecture" : (idx < 75 ? "Events, Forms & Lists" : "Hooks, Lifecycle & Router")),
  difficulty: idx < 50 ? "Basic" : "Medium",
  question: q.q,
  options: q.opts,
  correctAnswer: q.ans,
  explanation: q.exp
}));

const outPath = path.join(__dirname, '..', 'data', 'questions', 'react.json');
fs.writeFileSync(outPath, JSON.stringify(structuredQuestions, null, 2), 'utf8');
console.log(`Saved ${structuredQuestions.length} React questions to ${outPath}`);
