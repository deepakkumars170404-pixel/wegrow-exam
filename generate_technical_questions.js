const fs = require('fs');
const path = require('path');

// ==========================================
// 1. HTML QUESTIONS (30 Basic to Medium)
// ==========================================
const htmlQuestions = [
  {
    id: "html_1",
    category: "HTML",
    topic: "Document Structure",
    difficulty: "Basic",
    question: "What does the <!DOCTYPE html> declaration do in an HTML document?",
    options: [
      "It connects the HTML file to CSS styles",
      "It informs the browser that the document is written in HTML5 standard",
      "It creates the root container element of the web page",
      "It is an HTML tag that renders page header metadata"
    ],
    correctAnswer: 1,
    explanation: "<!DOCTYPE html> is not an HTML tag; it is a document type declaration that tells modern browsers to render the page in HTML5 standard mode."
  },
  {
    id: "html_2",
    category: "HTML",
    topic: "Semantic Elements",
    difficulty: "Basic",
    question: "Which of the following is a semantic HTML5 element meant for major navigation links?",
    options: ["<navigate>", "<nav>", "<links>", "<menu-bar>"],
    correctAnswer: 1,
    explanation: "The <nav> element represents a section of a page whose purpose is to provide navigation links (menus, tables of contents, breadcrumbs)."
  },
  {
    id: "html_3",
    category: "HTML",
    topic: "Hyperlinks",
    difficulty: "Basic",
    question: "Which attribute is used to open a hyperlink in a new browser tab?",
    options: ["target='_self'", "target='_newtab'", "target='_blank'", "target='_window'"],
    correctAnswer: 2,
    explanation: "target='_blank' tells the browser to open the linked document in a new tab or window."
  },
  {
    id: "html_4",
    category: "HTML",
    topic: "Forms & Input Types",
    difficulty: "Basic",
    question: "Which HTML5 input type allows users to pick a date from an interactive calendar interface?",
    options: ["<input type='calendar'>", "<input type='date'>", "<input type='datetime-picker'>", "<input type='day'>"],
    correctAnswer: 1,
    explanation: "<input type='date'> creates an input field that lets the user enter a date using a built-in browser date picker."
  },
  {
    id: "html_5",
    category: "HTML",
    topic: "Images",
    difficulty: "Basic",
    question: "Why is the 'alt' attribute essential on an <img> tag?",
    options: [
      "It defines the animation duration for the image",
      "It specifies the image file format",
      "It provides alternative text for accessibility (screen readers) and when the image fails to load",
      "It aligns the image to the center of the web page"
    ],
    correctAnswer: 2,
    explanation: "The 'alt' attribute provides an alternate text description for visual impaired users using screen readers and displays if the image file cannot be rendered."
  },
  {
    id: "html_6",
    category: "HTML",
    topic: "Tables",
    difficulty: "Medium",
    question: "Which attribute is used in a table cell (<td> or <th>) to make it span across multiple columns?",
    options: ["rowspan", "colspan", "col-width", "span-col"],
    correctAnswer: 1,
    explanation: "'colspan' defines how many columns a single table cell should span horizontally."
  },
  {
    id: "html_7",
    category: "HTML",
    topic: "Lists",
    difficulty: "Basic",
    question: "Which tag is used to create a numbered (ordered) list in HTML?",
    options: ["<ul>", "<nl>", "<ol>", "<list type='numbered'>"],
    correctAnswer: 2,
    explanation: "<ol> stands for Ordered List, which renders items with numbers or letters by default."
  },
  {
    id: "html_8",
    category: "HTML",
    topic: "Block vs Inline",
    difficulty: "Medium",
    question: "Which of the following elements is an INLINE element by default in HTML?",
    options: ["<div>", "<p>", "<span>", "<h1>"],
    correctAnswer: 2,
    explanation: "<span> is an inline element that does not start on a new line and only occupies as much width as its content. <div>, <p>, and <h1> are block-level elements."
  },
  {
    id: "html_9",
    category: "HTML",
    topic: "Semantic Elements",
    difficulty: "Medium",
    question: "What is the key difference between the <b> tag and the <strong> tag in modern HTML?",
    options: [
      "<b> makes text bigger while <strong> makes it bold",
      "<b> is stylistic (bold without added importance), whereas <strong> conveys strong semantic importance",
      "<strong> is deprecated in HTML5",
      "There is no difference at all"
    ],
    correctAnswer: 1,
    explanation: "<b> draws visual attention (bold text) without assigning importance, while <strong> represents semantic emphasis and importance, recognized by screen readers."
  },
  {
    id: "html_10",
    category: "HTML",
    topic: "Metadata",
    difficulty: "Medium",
    question: "What is the purpose of the <meta name='viewport' content='width=device-width, initial-scale=1.0'> tag?",
    options: [
      "It configures web server caching policies",
      "It optimizes the page dimensions and scaling for responsive mobile viewing",
      "It imports Google Fonts",
      "It forces the page to display in dark mode"
    ],
    correctAnswer: 1,
    explanation: "The viewport meta tag ensures proper scaling and responsive layout across various mobile, tablet, and desktop display widths."
  },
  {
    id: "html_11",
    category: "HTML",
    topic: "Audio & Video",
    difficulty: "Basic",
    question: "Which attribute must be added to a <video> element so that the browser displays play, pause, and volume controls?",
    options: ["interface", "controls", "buttons", "enable-ui"],
    correctAnswer: 1,
    explanation: "The boolean 'controls' attribute adds the browser's native playback UI (play, pause, volume, seeking)."
  },
  {
    id: "html_12",
    category: "HTML",
    topic: "Forms",
    difficulty: "Basic",
    question: "Which HTML attribute specifies that an input field must be filled out before submitting the form?",
    options: ["validate", "required", "mandatory", "not-null"],
    correctAnswer: 1,
    explanation: "The 'required' attribute triggers client-side browser validation to ensure the field is not left blank."
  },
  {
    id: "html_13",
    category: "HTML",
    topic: "Canvas vs SVG",
    difficulty: "Medium",
    question: "What is the fundamental difference between the HTML5 <canvas> element and <svg>?",
    options: [
      "<canvas> is resolution-independent vector graphics, while <svg> is raster pixel-based",
      "<canvas> is pixel/raster-based and rendered via JavaScript, while <svg> is XML vector-based with DOM elements",
      "<canvas> does not support animations",
      "<svg> requires flash plugins"
    ],
    correctAnswer: 1,
    explanation: "<canvas> renders pixels directly via JS bitmap drawing, while SVG creates vector graphics where individual elements remain part of the DOM."
  },
  {
    id: "html_14",
    category: "HTML",
    topic: "Forms",
    difficulty: "Medium",
    question: "Which attribute on the <form> element determines how form data is sent to the server (e.g., GET or POST)?",
    options: ["action", "method", "target", "enctype"],
    correctAnswer: 1,
    explanation: "'method' defines the HTTP method used (GET or POST), while 'action' defines the destination URL."
  },
  {
    id: "html_15",
    category: "HTML",
    topic: "Semantic Elements",
    difficulty: "Medium",
    question: "Which HTML5 tag is most appropriate for enclosing self-contained blog posts, news stories, or forum threads?",
    options: ["<section>", "<article>", "<aside>", "<main>"],
    correctAnswer: 1,
    explanation: "<article> represents an independent, self-contained composition (like an article, post, or widget) that can be distributed or reused independently."
  },
  {
    id: "html_16",
    category: "HTML",
    topic: "Embedded Content",
    difficulty: "Basic",
    question: "Which tag is used to embed another HTML page or external interactive content within the current document?",
    options: ["<embed-page>", "<iframe>", "<webview>", "<framebox>"],
    correctAnswer: 1,
    explanation: "<iframe> (Inline Frame) embeds another HTML document inside the current page."
  },
  {
    id: "html_17",
    category: "HTML",
    topic: "Form Elements",
    difficulty: "Medium",
    question: "Which element provides an 'autocomplete' drop-down list of predefined options for an <input> element?",
    options: ["<select>", "<datalist>", "<optionlist>", "<combobox>"],
    correctAnswer: 1,
    explanation: "<datalist> contains a set of <option> elements that suggest values as the user types into an associated <input list='...'>."
  },
  {
    id: "html_18",
    category: "HTML",
    topic: "Description Lists",
    difficulty: "Medium",
    question: "In a description list (<dl>), which tag defines the item/term, and which defines the description?",
    options: [
      "<dt> is the term, <dd> is the description",
      "<dd> is the term, <dt> is the description",
      "<li> is the term, <desc> is the description",
      "<item> is the term, <detail> is the description"
    ],
    correctAnswer: 0,
    explanation: "<dl> contains <dt> (Definition/Description Term) and <dd> (Definition/Description Details)."
  },
  {
    id: "html_19",
    category: "HTML",
    topic: "Head Elements",
    difficulty: "Basic",
    question: "Where in an HTML document is the <title> tag placed?",
    options: ["Inside the <body> tag", "Inside the <head> tag", "Directly before <!DOCTYPE html>", "Inside the <footer> tag"],
    correctAnswer: 1,
    explanation: "The <title> tag resides within the <head> section and specifies the webpage title displayed in the browser tab."
  },
  {
    id: "html_20",
    category: "HTML",
    topic: "Attributes",
    difficulty: "Basic",
    question: "Which attribute is used to provide tooltip text when a user hovers their mouse over an element?",
    options: ["tooltip", "hint", "title", "caption"],
    correctAnswer: 2,
    explanation: "The 'title' attribute offers advisory information and renders as a default browser tooltip on hover."
  },
  {
    id: "html_21",
    category: "HTML",
    topic: "Character Encoding",
    difficulty: "Basic",
    question: "Which meta tag correctly sets the character encoding for a webpage to support global languages?",
    options: [
      "<meta charset='UTF-8'>",
      "<meta encoding='standard-unicode'>",
      "<meta language='utf-8'>",
      "<meta type='text/unicode'>"
    ],
    correctAnswer: 0,
    explanation: "<meta charset='UTF-8'> declares the character encoding so browsers interpret international symbols and emojis properly."
  },
  {
    id: "html_22",
    category: "HTML",
    topic: "Security",
    difficulty: "Medium",
    question: "When using target='_blank' on an external link, which attribute values should be added for security and performance?",
    options: [
      "rel='nofollow'",
      "rel='noopener noreferrer'",
      "rel='secure'",
      "rel='protect-tab'"
    ],
    correctAnswer: 1,
    explanation: "'noopener noreferrer' prevents the opened page from accessing window.opener (reverse tabnabbing security vulnerability) and hides referrer information."
  },
  {
    id: "html_23",
    category: "HTML",
    topic: "HTML Entities",
    difficulty: "Basic",
    question: "Which HTML entity represents a non-breaking space?",
    options: ["&space;", "&nbsp;", "&blank;", "&break;"],
    correctAnswer: 1,
    explanation: "&nbsp; stands for Non-Breaking Space, which prevents an automatic line break at its position."
  },
  {
    id: "html_24",
    category: "HTML",
    topic: "Forms & Accessibility",
    difficulty: "Medium",
    question: "How do you associate a <label> element with an <input> element programmatically?",
    options: [
      "Match the label's 'for' attribute with the input's 'id' attribute",
      "Match the label's 'name' attribute with the input's 'name' attribute",
      "Place them in the same <div> container",
      "Use the 'connect' attribute on both"
    ],
    correctAnswer: 0,
    explanation: "Setting <label for='username'> with <input id='username'> links them so clicking the label focuses the input."
  },
  {
    id: "html_25",
    category: "HTML",
    topic: "Semantic Layout",
    difficulty: "Basic",
    question: "Which HTML5 tag is typically used for sidebars, callout boxes, or related advertisements?",
    options: ["<sidebar>", "<aside>", "<complementary>", "<section-sub>"],
    correctAnswer: 1,
    explanation: "<aside> represents content tangentially related to the main content, commonly used for sidebars and callouts."
  },
  {
    id: "html_26",
    category: "HTML",
    topic: "Preformatted Text",
    difficulty: "Basic",
    question: "Which tag displays text with preserved whitespace, indentation, and monospace font?",
    options: ["<code>", "<pre>", "<p format='exact'>", "<kbd>"],
    correctAnswer: 1,
    explanation: "The <pre> tag renders text exactly as typed, preserving spaces and line breaks."
  },
  {
    id: "html_27",
    category: "HTML",
    topic: "File Upload",
    difficulty: "Medium",
    question: "When submitting binary files via an HTML form with POST, which 'enctype' attribute must be specified on the <form>?",
    options: [
      "enctype='application/x-www-form-urlencoded'",
      "enctype='multipart/form-data'",
      "enctype='text/plain'",
      "enctype='binary/stream'"
    ],
    correctAnswer: 1,
    explanation: "multipart/form-data is required whenever a form includes <input type='file'> to encode file data into distinct boundary parts."
  },
  {
    id: "html_28",
    category: "HTML",
    topic: "Buttons",
    difficulty: "Basic",
    question: "Inside a <form>, what is the default 'type' attribute value of a <button> if omitted?",
    options: ["type='button'", "type='submit'", "type='reset'", "type='menu'"],
    correctAnswer: 1,
    explanation: "The HTML standard defaults a button's type to 'submit' if omitted, causing it to submit the enclosing form when clicked."
  },
  {
    id: "html_29",
    category: "HTML",
    topic: "HTML5 APIs",
    difficulty: "Medium",
    question: "Which HTML5 feature allows web applications to store key-value data persistently in the browser with no expiration date?",
    options: ["sessionStorage", "localStorage", "HTTP Cookies", "Web SQL"],
    correctAnswer: 1,
    explanation: "localStorage persists data with no expiration time even after browser closures, unlike sessionStorage which resets upon tab closure."
  },
  {
    id: "html_30",
    category: "HTML",
    topic: "Progress & Metrics",
    difficulty: "Medium",
    question: "Which HTML5 tag is specifically designed to indicate the completion progress of a background task?",
    options: ["<gauge>", "<meter>", "<progress>", "<loader>"],
    correctAnswer: 2,
    explanation: "<progress> represents the completion progress of a task, whereas <meter> represents a scalar measurement within a known range (like disk usage)."
  }
];

// ==========================================
// 2. CSS QUESTIONS (30 Basic to Medium)
// ==========================================
const cssQuestions = [
  {
    id: "css_1",
    category: "CSS",
    topic: "Box Model",
    difficulty: "Basic",
    question: "What are the 4 core components of the CSS Box Model, ordered from innermost to outermost?",
    options: [
      "Content, Margin, Border, Padding",
      "Content, Padding, Border, Margin",
      "Margin, Border, Padding, Content",
      "Padding, Content, Border, Margin"
    ],
    correctAnswer: 1,
    explanation: "The CSS box model consists of Content (innermost), surrounded by Padding, then Border, and finally Margin (outermost)."
  },
  {
    id: "css_2",
    category: "CSS",
    topic: "Box Sizing",
    difficulty: "Medium",
    question: "What is the practical benefit of applying 'box-sizing: border-box;' across all elements?",
    options: [
      "It makes elements circular automatically",
      "Padding and borders are included in the element's total declared width and height, preventing unexpected layout expansions",
      "It converts inline elements into flex containers",
      "It removes all margins from headings and paragraphs"
    ],
    correctAnswer: 1,
    explanation: "With 'border-box', an element width: 200px remains 200px even if you add padding or borders; the browser shrinks the content area instead of expanding total dimensions."
  },
  {
    id: "css_3",
    category: "CSS",
    topic: "Flexbox",
    difficulty: "Basic",
    question: "Which Flexbox property aligns items along the main axis (horizontally by default)?",
    options: ["align-items", "justify-content", "align-content", "flex-direction"],
    correctAnswer: 1,
    explanation: "'justify-content' aligns items along the main axis, while 'align-items' aligns items along the cross axis."
  },
  {
    id: "css_4",
    category: "CSS",
    topic: "Flexbox",
    difficulty: "Medium",
    question: "How do you center an element both horizontally and vertically using Flexbox on its parent?",
    options: [
      "display: flex; center: both;",
      "display: flex; justify-content: center; align-items: center;",
      "display: flex; margin: auto center;",
      "display: flex; vertical-align: middle; text-align: center;"
    ],
    correctAnswer: 1,
    explanation: "Setting 'display: flex;', 'justify-content: center;' (main axis) and 'align-items: center;' (cross axis) centers child items in both directions."
  },
  {
    id: "css_5",
    category: "CSS",
    topic: "Selectors",
    difficulty: "Basic",
    question: "Which symbol denotes an ID selector in CSS?",
    options: [". (dot)", "# (hash)", "* (asterisk)", "@ (at)"],
    correctAnswer: 1,
    explanation: "In CSS, '#' is used for ID selectors (e.g. #header), while '.' is used for class selectors (e.g. .card)."
  },
  {
    id: "css_6",
    category: "CSS",
    topic: "Selectors",
    difficulty: "Medium",
    question: "What does the selector 'div > p' target?",
    options: [
      "All <p> elements that are anywhere inside a <div>",
      "Only <p> elements that are DIRECT children of a <div>",
      "All <div> elements preceded by a <p>",
      "The first paragraph immediately following a <div>"
    ],
    correctAnswer: 1,
    explanation: "The child combinator (>) targets only direct child elements, whereas the descendant combinator (space) targets all nested descendants."
  },
  {
    id: "css_7",
    category: "CSS",
    topic: "Specificity",
    difficulty: "Medium",
    question: "Which of the following has the HIGHEST specificity in CSS?",
    options: [
      "Class selector (.button)",
      "ID selector (#submit-btn)",
      "Element selector (button)",
      "Universal selector (*)"
    ],
    correctAnswer: 1,
    explanation: "ID selectors carry a specificity weight of 0-1-0-0, which overrides class selectors (0-0-1-0) and element selectors (0-0-0-1)."
  },
  {
    id: "css_8",
    category: "CSS",
    topic: "Positioning",
    difficulty: "Medium",
    question: "When an element has 'position: absolute;', what is its position calculated relative to?",
    options: [
      "The viewport window only",
      "Its nearest positioned ancestor (an ancestor with position other than static)",
      "Its direct parent regardless of position property",
      "The bottom right corner of the page"
    ],
    correctAnswer: 1,
    explanation: "An absolutely positioned element is placed relative to its nearest ancestor that has a position value other than static (e.g. relative, absolute, fixed)."
  },
  {
    id: "css_9",
    category: "CSS",
    topic: "Positioning",
    difficulty: "Basic",
    question: "Which position value keeps an element anchored in the exact same place on the screen even when the user scrolls?",
    options: ["position: static;", "position: relative;", "position: fixed;", "position: inherit;"],
    correctAnswer: 2,
    explanation: "'position: fixed;' positions the element relative to the browser viewport, keeping it visible during page scrolling."
  },
  {
    id: "css_10",
    category: "CSS",
    topic: "Units",
    difficulty: "Basic",
    question: "What does '1rem' equal in CSS when the default browser font size is 16px?",
    options: ["10px", "14px", "16px", "32px"],
    correctAnswer: 2,
    explanation: "'rem' refers to the root element's font size (usually <html>). If <html> has the standard 16px font-size, 1rem = 16px."
  },
  {
    id: "css_11",
    category: "CSS",
    topic: "Units",
    difficulty: "Medium",
    question: "What is the difference between 'em' and 'rem' units?",
    options: [
      "'em' is relative to its parent element's font size, whereas 'rem' is relative to the root (html) font size",
      "'rem' is only for margins, while 'em' is only for padding",
      "'em' is an absolute unit like pixels",
      "They are identical aliases"
    ],
    correctAnswer: 0,
    explanation: "'em' compounds and scales relative to the parent element's font-size, while 'rem' (root em) always scales relative to the root <html> font-size."
  },
  {
    id: "css_12",
    category: "CSS",
    topic: "CSS Grid",
    difficulty: "Medium",
    question: "Which CSS Grid property creates three columns where the middle column takes twice the width of the outer columns?",
    options: [
      "grid-template-columns: 1fr 2fr 1fr;",
      "grid-columns: 100px 200px 100px;",
      "columns: 1fr 2fr 1fr;",
      "display-grid: 3-cols(1, 2, 1);"
    ],
    correctAnswer: 0,
    explanation: "'grid-template-columns: 1fr 2fr 1fr;' divides available space into 4 equal shares (1+2+1), giving 1 share to cols 1 & 3, and 2 shares to col 2."
  },
  {
    id: "css_13",
    category: "CSS",
    topic: "Display",
    difficulty: "Basic",
    question: "What happens when an element is styled with 'display: none;'?",
    options: [
      "The element becomes transparent but keeps its layout space",
      "The element is completely removed from the document layout flow",
      "The element is blurred",
      "The element is shifted off the screen by 1000px"
    ],
    correctAnswer: 1,
    explanation: "'display: none;' removes the element completely from layout rendering, taking up 0 space. 'visibility: hidden;' hides it while keeping its space."
  },
  {
    id: "css_14",
    category: "CSS",
    topic: "Pseudo-Classes",
    difficulty: "Basic",
    question: "Which pseudo-class applies styles when the user hovers their cursor over an interactive element?",
    options: [":active", ":focus", ":hover", ":visited"],
    correctAnswer: 2,
    explanation: "The ':hover' pseudo-class triggers when the pointer hovers over an element."
  },
  {
    id: "css_15",
    category: "CSS",
    topic: "Pseudo-Classes",
    difficulty: "Medium",
    question: "Which selector styles every EVEN row in an HTML table?",
    options: [
      "tr:nth-child(even)",
      "tr:even-child",
      "tr:child(2n)",
      "Both A and C"
    ],
    correctAnswer: 3,
    explanation: "Both 'tr:nth-child(even)' and 'tr:nth-child(2n)' correctly select every even row."
  },
  {
    id: "css_16",
    category: "CSS",
    topic: "Pseudo-Elements",
    difficulty: "Medium",
    question: "What CSS property is MANDATORY for '::before' and '::after' pseudo-elements to render anything on screen?",
    options: ["display", "content", "visibility", "width"],
    correctAnswer: 1,
    explanation: "Pseudo-elements ::before and ::after must have the 'content' property declared (even if empty string `content: '';`) to generate a renderable box."
  },
  {
    id: "css_17",
    category: "CSS",
    topic: "Z-Index",
    difficulty: "Medium",
    question: "Why might a 'z-index: 999;' not work on an element?",
    options: [
      "z-index only accepts negative integers",
      "The element has 'position: static;' (default), so z-index is ignored",
      "z-index only applies to images",
      "The browser does not support values higher than 100"
    ],
    correctAnswer: 1,
    explanation: "The 'z-index' property only applies to positioned elements (i.e., position relative, absolute, fixed, or sticky) or flex/grid items."
  },
  {
    id: "css_18",
    category: "CSS",
    topic: "Media Queries",
    difficulty: "Basic",
    question: "Which CSS rule applies styles only to screens narrower than or equal to 768px?",
    options: [
      "@media (min-width: 768px) { ... }",
      "@media (max-width: 768px) { ... }",
      "@media screen and (device-width: 768px) { ... }",
      "@screen <= 768px { ... }"
    ],
    correctAnswer: 1,
    explanation: "@media (max-width: 768px) targets screen viewports with a maximum width of 768px (tablets and mobile devices)."
  },
  {
    id: "css_19",
    category: "CSS",
    topic: "Typography",
    difficulty: "Basic",
    question: "Which property adjusts the spacing between lines of text?",
    options: ["letter-spacing", "line-height", "word-spacing", "text-indent"],
    correctAnswer: 1,
    explanation: "'line-height' sets the distance between lines of text, controlling line vertical pacing."
  },
  {
    id: "css_20",
    category: "CSS",
    topic: "Transitions",
    difficulty: "Medium",
    question: "What are the shorthand components of 'transition: background-color 0.3s ease-in-out 0.1s;'?",
    options: [
      "property, duration, timing-function, delay",
      "property, delay, timing-function, duration",
      "duration, property, delay, timing-function",
      "timing-function, property, duration, delay"
    ],
    correctAnswer: 0,
    explanation: "The transition shorthand order is: property, duration, timing-function, and delay."
  },
  {
    id: "css_21",
    category: "CSS",
    topic: "Flexbox",
    difficulty: "Medium",
    question: "What does the shorthand 'flex: 1;' assign to flex-grow, flex-shrink, and flex-basis?",
    options: [
      "flex-grow: 1, flex-shrink: 1, flex-basis: 0%",
      "flex-grow: 1, flex-shrink: 0, flex-basis: auto",
      "flex-grow: 0, flex-shrink: 1, flex-basis: 100px",
      "flex-grow: 1, flex-shrink: 1, flex-basis: auto"
    ],
    correctAnswer: 0,
    explanation: "In standard CSS flex shorthand, 'flex: 1;' expands to 'flex: 1 1 0%' allowing items to grow and shrink proportionally from an initial basis of 0%."
  },
  {
    id: "css_22",
    category: "CSS",
    topic: "Text Effects",
    difficulty: "Basic",
    question: "Which CSS property causes overflowing text to truncate with an ellipsis (...) inside an element with fixed width and nowrap?",
    options: ["overflow-wrap: break-word;", "text-overflow: ellipsis;", "white-space: dot;", "word-break: cut;"],
    correctAnswer: 1,
    explanation: "'text-overflow: ellipsis;' renders an ellipsis (...) for cut-off text when paired with 'overflow: hidden;' and 'white-space: nowrap;'."
  },
  {
    id: "css_23",
    category: "CSS",
    topic: "Overflow",
    difficulty: "Basic",
    question: "Which property value automatically generates scrollbars ONLY when an element's content exceeds its box boundaries?",
    options: ["overflow: hidden;", "overflow: scroll;", "overflow: auto;", "overflow: visible;"],
    correctAnswer: 2,
    explanation: "'overflow: auto;' displays scrollbars only when needed, whereas 'overflow: scroll;' always renders scrollbars even when content fits."
  },
  {
    id: "css_24",
    category: "CSS",
    topic: "CSS Variables",
    difficulty: "Medium",
    question: "How do you define and consume a custom CSS variable (custom property)?",
    options: [
      "Define with $color: blue; consume with $color;",
      "Define with --brand-color: #007bff; consume with var(--brand-color);",
      "Define with @brand: #007bff; consume with @brand;",
      "Define with const(--brand): #007bff; consume with get(--brand);"
    ],
    correctAnswer: 1,
    explanation: "CSS custom properties use two leading dashes (e.g. --brand-color) and are retrieved with the var(--brand-color) function."
  },
  {
    id: "css_25",
    category: "CSS",
    topic: "Opacity vs RGBA",
    difficulty: "Medium",
    question: "What is the key difference between 'opacity: 0.5;' and 'background-color: rgba(0,0,0,0.5);'?",
    options: [
      "'opacity' affects the element AND all of its child elements, while 'rgba' only affects the background transparency",
      "'rgba' makes text invisible",
      "'opacity' only works on images",
      "There is no difference"
    ],
    correctAnswer: 0,
    explanation: "'opacity: 0.5;' makes the container and all nested child text/content semi-transparent, whereas 'rgba()' only sets transparency for the specific background color."
  },
  {
    id: "css_26",
    category: "CSS",
    topic: "Sticky Positioning",
    difficulty: "Medium",
    question: "How does 'position: sticky;' behave in a document?",
    options: [
      "It remains fixed permanently at the top of the browser window",
      "It behaves as relative until a given scroll threshold is reached, then behaves as fixed within its parent container",
      "It pins the element to the bottom right corner",
      "It prevents user interaction"
    ],
    correctAnswer: 1,
    explanation: "'position: sticky;' toggles between relative and fixed positioning based on the user's scroll offset relative to its scroll ancestor."
  },
  {
    id: "css_27",
    category: "CSS",
    topic: "Centering with Margin",
    difficulty: "Basic",
    question: "Which CSS property will center a block-level element horizontally inside its container if a width is specified?",
    options: ["margin: 0 auto;", "padding: auto 0;", "align-self: center;", "text-align: middle;"],
    correctAnswer: 0,
    explanation: "'margin: 0 auto;' or 'margin-inline: auto;' splits remaining horizontal margin equally on both sides of a block element with defined width."
  },
  {
    id: "css_28",
    category: "CSS",
    topic: "Animations",
    difficulty: "Medium",
    question: "Which at-rule is used to declare keyframe animations in CSS?",
    options: ["@animate", "@keyframes", "@transitions", "@transform"],
    correctAnswer: 1,
    explanation: "@keyframes defines the stages and styles of an animation cycle (e.g. @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } })."
  },
  {
    id: "css_29",
    category: "CSS",
    topic: "Important Rule",
    difficulty: "Basic",
    question: "What does adding '!important' to a CSS property value accomplish?",
    options: [
      "It causes an error in strict mode",
      "It overrides virtually all standard specificity declarations for that property",
      "It speeds up browser rendering by 50%",
      "It forces the style to only apply on desktop"
    ],
    correctAnswer: 1,
    explanation: "'!important' gives maximum priority to a property value, overriding normal specificity rules."
  },
  {
    id: "css_30",
    category: "CSS",
    topic: "Transforms",
    difficulty: "Basic",
    question: "Which CSS transform function moves an element 50px to the right and 20px down?",
    options: ["rotate(50px, 20px)", "scale(50px, 20px)", "translate(50px, 20px)", "skew(50px, 20px)"],
    correctAnswer: 2,
    explanation: "translate(X, Y) shifts an element along the X (horizontal) and Y (vertical) axes."
  }
];

// ==========================================
// 3. BOOTSTRAP QUESTIONS (30 Basic to Medium)
// ==========================================
const bootstrapQuestions = [
  {
    id: "bs_1",
    category: "Bootstrap",
    topic: "Grid System",
    difficulty: "Basic",
    question: "The default Bootstrap grid system divides each row into how many equal columns?",
    options: ["8 columns", "10 columns", "12 columns", "16 columns"],
    correctAnswer: 2,
    explanation: "Bootstrap's responsive grid system is built around a standard 12-column flexbox layout."
  },
  {
    id: "bs_2",
    category: "Bootstrap",
    topic: "Containers",
    difficulty: "Basic",
    question: "What is the difference between class '.container' and class '.container-fluid' in Bootstrap?",
    options: [
      "'.container' provides a responsive fixed-width layout with breakpoints, while '.container-fluid' spans 100% width across all viewports",
      "'.container-fluid' has no padding",
      "'.container' is only for mobile screens",
      "There is no difference"
    ],
    correctAnswer: 0,
    explanation: "'.container' adjusts its max-width at responsive breakpoints (sm, md, lg, xl, xxl), whereas '.container-fluid' always spans 100% of the viewport width."
  },
  {
    id: "bs_3",
    category: "Bootstrap",
    topic: "Breakpoints",
    difficulty: "Medium",
    question: "In Bootstrap 5, which breakpoint class corresponds to viewports >= 768px?",
    options: [".col-sm", ".col-md", ".col-lg", ".col-xl"],
    correctAnswer: 1,
    explanation: "Bootstrap breakpoints are: xs (<576px), sm (>=576px), md (>=768px), lg (>=992px), xl (>=1200px), xxl (>=1400px)."
  },
  {
    id: "bs_4",
    category: "Bootstrap",
    topic: "Buttons",
    difficulty: "Basic",
    question: "Which class creates a solid primary theme button in Bootstrap?",
    options: [".btn-blue", ".btn-main", ".btn .btn-primary", ".button-solid"],
    correctAnswer: 2,
    explanation: "Bootstrap requires the base '.btn' class combined with a contextual modifier like '.btn-primary' for styling."
  },
  {
    id: "bs_5",
    category: "Bootstrap",
    topic: "Buttons",
    difficulty: "Basic",
    question: "Which class is used to create an outline (transparent background with colored border) button?",
    options: [".btn-border-primary", ".btn-outline-primary", ".btn-hollow-primary", ".btn-transparent"],
    correctAnswer: 1,
    explanation: "The '.btn-outline-*' classes provide outline button styling without a solid background fill."
  },
  {
    id: "bs_6",
    category: "Bootstrap",
    topic: "Spacing Utilities",
    difficulty: "Basic",
    question: "What does the Bootstrap utility class 'mb-3' signify?",
    options: [
      "Margin bottom of size 3 (1rem / 16px by default)",
      "Margin body of 3px",
      "Maximum border width 3px",
      "Min-width box 300px"
    ],
    correctAnswer: 0,
    explanation: "'m' stands for margin, 'b' stands for bottom, and '3' sets the spacing scale spacer to $spacer * 1 (1rem / 16px)."
  },
  {
    id: "bs_7",
    category: "Bootstrap",
    topic: "Spacing Utilities",
    difficulty: "Medium",
    question: "Which class applies padding to BOTH the left and right (horizontal) sides of an element?",
    options: [".py-4", ".px-4", ".p-both-4", ".pad-x-4"],
    correctAnswer: 1,
    explanation: "'px-*' applies padding along the horizontal X-axis (both padding-left and padding-right)."
  },
  {
    id: "bs_8",
    category: "Bootstrap",
    topic: "Typography",
    difficulty: "Basic",
    question: "Which utility class aligns text to the center in Bootstrap 5?",
    options: [".align-center", ".text-center", ".center-text", ".justify-center"],
    correctAnswer: 1,
    explanation: "'.text-center' sets CSS 'text-align: center;'."
  },
  {
    id: "bs_9",
    category: "Bootstrap",
    topic: "Flex Utilities",
    difficulty: "Medium",
    question: "Which Bootstrap 5 utility classes turn a container into a flex container and center children both horizontally and vertically?",
    options: [
      ".d-flex .justify-content-center .align-items-center",
      ".flex-box .center-all",
      ".d-flex .align-center .valign-center",
      ".flex-container .center"
    ],
    correctAnswer: 0,
    explanation: "'.d-flex' applies display: flex, '.justify-content-center' centers on the main axis, and '.align-items-center' centers on the cross axis."
  },
  {
    id: "bs_10",
    category: "Bootstrap",
    topic: "Cards",
    difficulty: "Basic",
    question: "What is the primary content wrapper inside a Bootstrap '.card' component?",
    options: [".card-content", ".card-body", ".card-inner", ".card-main"],
    correctAnswer: 1,
    explanation: "'.card-body' is the core structural class providing padding inside a '.card'."
  },
  {
    id: "bs_11",
    category: "Bootstrap",
    topic: "Forms",
    difficulty: "Basic",
    question: "Which class is applied to <input> and <textarea> elements for full-width, styled Bootstrap form inputs?",
    options: [".form-input", ".form-control", ".form-field", ".input-styled"],
    correctAnswer: 1,
    explanation: "'.form-control' is Bootstrap's standard styling class for text inputs, textareas, and file inputs."
  },
  {
    id: "bs_12",
    category: "Bootstrap",
    topic: "Forms",
    difficulty: "Basic",
    question: "In Bootstrap 5, which class styles <select> dropdown menus?",
    options: [".form-control", ".form-select", ".custom-select", ".select-control"],
    correctAnswer: 1,
    explanation: "Bootstrap 5 introduced '.form-select' specifically for styling HTML <select> dropdown elements."
  },
  {
    id: "bs_13",
    category: "Bootstrap",
    topic: "Colors & Alerts",
    difficulty: "Basic",
    question: "Which contextual class indicates a green success state in Bootstrap alerts and badges?",
    options: [".alert-green", ".alert-success", ".alert-confirm", ".alert-ok"],
    correctAnswer: 1,
    explanation: "Bootstrap uses contextual naming: 'primary' (blue), 'success' (green), 'danger' (red), 'warning' (yellow), 'info' (teal/cyan)."
  },
  {
    id: "bs_14",
    category: "Bootstrap",
    topic: "Tables",
    difficulty: "Basic",
    question: "Which class adds zebra-striping (alternating row backgrounds) to an HTML table?",
    options: [".table-zebra", ".table-striped", ".table-alternate", ".table-hover"],
    correctAnswer: 1,
    explanation: "'.table-striped' adds background coloring to alternating rows within the <tbody>."
  },
  {
    id: "bs_15",
    category: "Bootstrap",
    topic: "Tables",
    difficulty: "Medium",
    question: "How do you make a table horizontally scrollable on small mobile screens without breaking page width?",
    options: [
      "Wrap the table in a container with class '.table-responsive'",
      "Add class '.table-scroll' to the <table>",
      "Add class '.overflow-table' to the <body>",
      "Set table width to 500px"
    ],
    correctAnswer: 0,
    explanation: "Wrapping the table inside a '<div class='table-responsive'>' adds responsive horizontal scrolling when viewport width is exceeded."
  },
  {
    id: "bs_16",
    category: "Bootstrap",
    topic: "Navbar",
    difficulty: "Medium",
    question: "Which class enables a Bootstrap navigation bar to collapse into a hamburger menu on screens below large (992px)?",
    options: [".navbar-responsive", ".navbar-expand-lg", ".navbar-collapse-sm", ".navbar-toggleable"],
    correctAnswer: 1,
    explanation: "'.navbar-expand-lg' keeps the navbar expanded horizontally on screens >= 992px and collapses into a toggler menu on screens smaller than 992px."
  },
  {
    id: "bs_17",
    category: "Bootstrap",
    topic: "Modals",
    difficulty: "Medium",
    question: "In Bootstrap 5, what data attribute triggers opening a modal with id 'myModal'?",
    options: [
      "data-target='#myModal'",
      "data-bs-toggle='modal' data-bs-target='#myModal'",
      "data-toggle='modal' data-target='#myModal'",
      "data-open-modal='myModal'"
    ],
    correctAnswer: 1,
    explanation: "Bootstrap 5 namespaced all JavaScript data attributes with 'bs-', so it uses 'data-bs-toggle='modal'' and 'data-bs-target='#myModal''."
  },
  {
    id: "bs_18",
    category: "Bootstrap",
    topic: "Bootstrap 5 Changes",
    difficulty: "Medium",
    question: "Which major JavaScript dependency was completely dropped in Bootstrap 5 in favor of pure Vanilla JavaScript?",
    options: ["Axios", "jQuery", "Popper.js", "Lodash"],
    correctAnswer: 1,
    explanation: "Bootstrap 5 removed jQuery as a required dependency, rewriting its plugins in native Vanilla JavaScript."
  },
  {
    id: "bs_19",
    category: "Bootstrap",
    topic: "Display Utilities",
    difficulty: "Medium",
    question: "Which class hides an element on mobile screens (<768px) but displays it as a block on screens >= 768px?",
    options: [
      ".d-none .d-md-block",
      ".hide-sm .show-md",
      ".invisible-mobile .visible-desktop",
      ".display-none-md"
    ],
    correctAnswer: 0,
    explanation: "'.d-none' applies display: none by default for all viewports, and '.d-md-block' overrides it to display: block starting from medium breakpoints (>=768px)."
  },
  {
    id: "bs_20",
    category: "Bootstrap",
    topic: "Grid Column Sizing",
    difficulty: "Medium",
    question: "To make two elements share equal 50% width on desktop (>=992px) and stack 100% on mobile, which class combination should be on each?",
    options: [
      ".col-12 .col-lg-6",
      ".col-6 .col-lg-12",
      ".col-sm-6 .col-lg-4",
      ".col-half"
    ],
    correctAnswer: 0,
    explanation: "'.col-12' takes the full 12 columns (100% width) on mobile viewports, and '.col-lg-6' takes 6 of 12 columns (50% width) on large displays."
  },
  {
    id: "bs_21",
    category: "Bootstrap",
    topic: "Badges",
    difficulty: "Basic",
    question: "Which class shapes a badge into a rounded pill style with curved ends?",
    options: [".badge-circle", ".rounded-pill", ".badge-round", ".pill-shape"],
    correctAnswer: 1,
    explanation: "The utility '.rounded-pill' gives elements an oblong pill-shaped border radius."
  },
  {
    id: "bs_22",
    category: "Bootstrap",
    topic: "Shadows",
    difficulty: "Basic",
    question: "Which Bootstrap class adds a standard subtle drop shadow to a card or card-like container?",
    options: [".drop-shadow", ".box-shadow", ".shadow-sm or .shadow", ".elevation-2"],
    correctAnswer: 2,
    explanation: "Bootstrap provides '.shadow-none', '.shadow-sm', '.shadow', and '.shadow-lg' utilities."
  },
  {
    id: "bs_23",
    category: "Bootstrap",
    topic: "Spinners",
    difficulty: "Basic",
    question: "Which class renders an animated loading spinner in Bootstrap?",
    options: [".spinner-border", ".loader-circle", ".spinning-icon", ".progress-rotate"],
    correctAnswer: 0,
    explanation: "'.spinner-border' renders a circular CSS loading spinner indicator."
  },
  {
    id: "bs_24",
    category: "Bootstrap",
    topic: "Text Truncation",
    difficulty: "Basic",
    question: "Which utility class truncates overflowing text with an ellipsis in Bootstrap?",
    options: [".text-cut", ".text-truncate", ".truncate-overflow", ".ellipsis-text"],
    correctAnswer: 1,
    explanation: "'.text-truncate' automatically applies overflow: hidden, text-overflow: ellipsis, and white-space: nowrap."
  },
  {
    id: "bs_25",
    category: "Bootstrap",
    topic: "Gutters",
    difficulty: "Medium",
    question: "In Bootstrap 5 grid, which class modifies horizontal and vertical gutter spacing between columns?",
    options: [".spacing-3", ".g-3 (or .gx-3 / .gy-3)", ".gap-col-3", ".margin-grid-3"],
    correctAnswer: 1,
    explanation: "Bootstrap 5 uses the '.g-*' (both axes), '.gx-*' (horizontal), and '.gy-*' (vertical) gutter utility classes."
  },
  {
    id: "bs_26",
    category: "Bootstrap",
    topic: "Borders",
    difficulty: "Basic",
    question: "Which class removes all borders from an element in Bootstrap?",
    options: [".no-border", ".border-0", ".border-none", ".border-hidden"],
    correctAnswer: 1,
    explanation: "'.border-0' sets border: 0 !important; removing borders."
  },
  {
    id: "bs_27",
    category: "Bootstrap",
    topic: "Position Utilities",
    difficulty: "Medium",
    question: "Which utility class centers an element absolutely inside its relative parent?",
    options: [
      ".position-absolute .top-50 .start-50 .translate-middle",
      ".center-absolute",
      ".position-center",
      ".absolute-middle"
    ],
    correctAnswer: 0,
    explanation: "Top 50%, start 50% combined with '.translate-middle' (transform: translate(-50%, -50%)) perfectly centers absolute elements."
  },
  {
    id: "bs_28",
    category: "Bootstrap",
    topic: "Forms & Checkboxes",
    difficulty: "Basic",
    question: "In Bootstrap 5, which class wraps custom styled checkboxes and radio inputs?",
    options: [".form-check", ".custom-control", ".form-radio-box", ".input-choice"],
    correctAnswer: 0,
    explanation: "'.form-check' wraps the checkbox/radio and its label, with '.form-check-input' on the input and '.form-check-label' on the label."
  },
  {
    id: "bs_29",
    category: "Bootstrap",
    topic: "Colors",
    difficulty: "Basic",
    question: "Which class changes an element's text color to a subdued muted gray?",
    options: [".text-gray", ".text-muted", ".text-lighten", ".text-faded"],
    correctAnswer: 1,
    explanation: "'.text-muted' applies a softer, secondary grey color (often used for subtitles or helper text)."
  },
  {
    id: "bs_30",
    category: "Bootstrap",
    topic: "Ratio Utilities",
    difficulty: "Medium",
    question: "Which utility class creates a responsive 16:9 aspect ratio container for video or iframes?",
    options: [
      ".embed-responsive .embed-responsive-16by9",
      ".ratio .ratio-16x9",
      ".aspect-16-9",
      ".video-container-16x9"
    ],
    correctAnswer: 1,
    explanation: "Bootstrap 5 replaced legacy embed-responsive classes with the modern '.ratio .ratio-16x9' utility classes."
  }
];

// ==========================================
// 4. JAVASCRIPT QUESTIONS (30 Basic to Medium)
// ==========================================
const jsQuestions = [
  {
    id: "js_1",
    category: "JavaScript",
    topic: "Variables & Scope",
    difficulty: "Basic",
    question: "What is the difference between 'var', 'let', and 'const' regarding scope?",
    options: [
      "'var' is block-scoped, while 'let' and 'const' are function-scoped",
      "'var' is function-scoped (or globally scoped), while 'let' and 'const' are block-scoped",
      "All three have identical block scoping",
      "'const' can be redeclared anywhere"
    ],
    correctAnswer: 1,
    explanation: "'var' declarations are hoisted and scoped to the enclosing function. 'let' and 'const' are strictly block-scoped within '{ ... }'."
  },
  {
    id: "js_2",
    category: "JavaScript",
    topic: "Data Types",
    difficulty: "Basic",
    question: "Which of the following is NOT a primitive data type in JavaScript?",
    options: ["String", "Number", "Boolean", "Object"],
    correctAnswer: 3,
    explanation: "JavaScript primitives include String, Number, BigInt, Boolean, Undefined, Symbol, and Null. Objects (including Arrays and Functions) are reference types."
  },
  {
    id: "js_3",
    category: "JavaScript",
    topic: "Equality Operators",
    difficulty: "Basic",
    question: "What is the result of evaluating: 5 == '5' and 5 === '5'?",
    options: [
      "true and false",
      "false and true",
      "true and true",
      "false and false"
    ],
    correctAnswer: 0,
    explanation: "'==' performs type coercion, converting '5' to number 5 (true). '===' checks both value and type without coercion, so number vs string evaluates to false."
  },
  {
    id: "js_4",
    category: "JavaScript",
    topic: "Hoisting",
    difficulty: "Medium",
    question: "What will the following code log to the console?\n\nconsole.log(x);\nvar x = 10;",
    options: ["10", "ReferenceError: x is not defined", "undefined", "null"],
    correctAnswer: 2,
    explanation: "'var x' is hoisted to the top and initialized with 'undefined'. The assignment (x = 10) happens at runtime after console.log."
  },
  {
    id: "js_5",
    category: "JavaScript",
    topic: "Temporal Dead Zone",
    difficulty: "Medium",
    question: "What occurs if you attempt to access a 'let' variable before its declaration line?",
    options: [
      "It returns undefined",
      "It throws a ReferenceError due to the Temporal Dead Zone (TDZ)",
      "It returns null",
      "It defaults to zero"
    ],
    correctAnswer: 1,
    explanation: "Variables declared with 'let' and 'const' are hoisted but remain uninitialized in the Temporal Dead Zone (TDZ) until the line of declaration is executed."
  },
  {
    id: "js_6",
    category: "JavaScript",
    topic: "Array Methods",
    difficulty: "Basic",
    question: "Which array method creates a NEW array populated with the results of calling a provided function on every element?",
    options: ["forEach()", "map()", "filter()", "reduce()"],
    correctAnswer: 1,
    explanation: ".map() transforms every element and returns a new array. .forEach() simply executes a callback without returning a new array."
  },
  {
    id: "js_7",
    category: "JavaScript",
    topic: "Array Methods",
    difficulty: "Medium",
    question: "What is the output of:\n\n[1, 2, 3, 4].filter(num => num % 2 === 0);",
    options: ["[1, 3]", "[2, 4]", "[true, false, true, false]", "2"],
    correctAnswer: 1,
    explanation: ".filter() retains elements for which the callback returns true. 2 and 4 are even numbers, so [2, 4] is returned."
  },
  {
    id: "js_8",
    category: "JavaScript",
    topic: "Array Methods",
    difficulty: "Medium",
    question: "What is the difference between Array.prototype.slice() and Array.prototype.splice()?",
    options: [
      "slice() modifies the original array; splice() returns a shallow copy",
      "slice() returns a shallow copy without modifying the original array; splice() modifies the original array by removing/replacing elements",
      "They are identical",
      "splice() only works on strings"
    ],
    correctAnswer: 1,
    explanation: "slice(start, end) is non-mutating and extracts a portion into a new array. splice(start, deleteCount, items) mutates the source array directly."
  },
  {
    id: "js_9",
    category: "JavaScript",
    topic: "Closures",
    difficulty: "Medium",
    question: "What is a Closure in JavaScript?",
    options: [
      "A function that terminates immediately upon execution",
      "A combination of a function bundled together with references to its surrounding lexical environment",
      "A method to close browser tabs",
      "A syntax error caused by unclosed curly braces"
    ],
    correctAnswer: 1,
    explanation: "A closure gives an inner function access to an outer function's scope even after the outer function has finished executing and returned."
  },
  {
    id: "js_10",
    category: "JavaScript",
    topic: "Arrow Functions",
    difficulty: "Medium",
    question: "How do Arrow Functions handle the 'this' keyword compared to traditional function declarations?",
    options: [
      "Arrow functions bind 'this' to the global window object in all cases",
      "Arrow functions do not have their own 'this'; they inherit 'this' lexically from the enclosing execution context",
      "Arrow functions create an isolated private 'this'",
      "Arrow functions can be used as constructors with the 'new' keyword"
    ],
    correctAnswer: 1,
    explanation: "Arrow functions lexically inherit 'this' from the outer parent scope. They cannot be used as constructors with 'new'."
  },
  {
    id: "js_11",
    category: "JavaScript",
    topic: "Promises",
    difficulty: "Basic",
    question: "What are the three possible states of a JavaScript Promise?",
    options: [
      "Pending, Fulfilled, Rejected",
      "Waiting, Done, Failed",
      "Open, In-Progress, Closed",
      "Active, Resolved, Terminated"
    ],
    correctAnswer: 0,
    explanation: "A Promise is always in one of three states: Pending (initial), Fulfilled (operation succeeded), or Rejected (operation failed)."
  },
  {
    id: "js_12",
    category: "JavaScript",
    topic: "Async/Await",
    difficulty: "Medium",
    question: "What does an 'async' function ALWAYS return?",
    options: ["A Promise", "A boolean", "Undefined", "The raw unwrapped value"],
    correctAnswer: 0,
    explanation: "An async function always returns a Promise. If a non-promise value is returned, JavaScript automatically wraps it into a resolved Promise."
  },
  {
    id: "js_13",
    category: "JavaScript",
    topic: "DOM Manipulation",
    difficulty: "Basic",
    question: "Which method selects the FIRST element that matches a specified CSS selector in the document?",
    options: [
      "document.querySelectorAll()",
      "document.querySelector()",
      "document.getElementBySelector()",
      "document.findFirst()"
    ],
    correctAnswer: 1,
    explanation: "document.querySelector() returns the first matching Element within the document, or null if no matches are found."
  },
  {
    id: "js_14",
    category: "JavaScript",
    topic: "Event Propagation",
    difficulty: "Medium",
    question: "What is Event Bubbling in JavaScript?",
    options: [
      "Events trigger on the window first and travel down to the target element",
      "Events trigger on the innermost target element and propagate upwards through ancestor elements in the DOM tree",
      "Events repeating every 5 seconds",
      "A CSS animation of bubbles"
    ],
    correctAnswer: 1,
    explanation: "Event bubbling starts from the deepest nested target element and bubbles up through parent and ancestor DOM elements up to document and window."
  },
  {
    id: "js_15",
    category: "JavaScript",
    topic: "Event Methods",
    difficulty: "Basic",
    question: "Which method prevents the default browser behavior of an event (such as preventing form submission from reloading the page)?",
    options: [
      "event.stopPropagation()",
      "event.preventDefault()",
      "event.stopImmediatePropagation()",
      "event.cancelBubble()"
    ],
    correctAnswer: 1,
    explanation: "event.preventDefault() stops the default browser action from happening without stopping propagation."
  },
  {
    id: "js_16",
    category: "JavaScript",
    topic: "Event Methods",
    difficulty: "Medium",
    question: "What does 'event.stopPropagation()' do?",
    options: [
      "Stops the event from traveling further up or down the DOM tree during bubbling or capturing",
      "Prevents a form from submitting",
      "Deletes the event listener",
      "Pauses JavaScript thread execution"
    ],
    correctAnswer: 0,
    explanation: "event.stopPropagation() stops the propagation of the current event in the capturing and bubbling phases."
  },
  {
    id: "js_17",
    category: "JavaScript",
    topic: "JSON Handling",
    difficulty: "Basic",
    question: "Which function converts a JavaScript object into a JSON formatted string?",
    options: ["JSON.parse()", "JSON.stringify()", "JSON.toText()", "JSON.encode()"],
    correctAnswer: 1,
    explanation: "JSON.stringify() serializes a JavaScript object/value into a JSON string. JSON.parse() parses a JSON string back into a JavaScript object."
  },
  {
    id: "js_18",
    category: "JavaScript",
    topic: "Destructuring",
    difficulty: "Basic",
    question: "What is the value of 'b' after this code executes?\n\nconst [a, b, c] = [10, 20, 30];",
    options: ["10", "20", "30", "undefined"],
    correctAnswer: 1,
    explanation: "Array destructuring matches by position index. Index 0 is a=10, index 1 is b=20, index 2 is c=30."
  },
  {
    id: "js_19",
    category: "JavaScript",
    topic: "Spread Operator",
    difficulty: "Medium",
    question: "What will this code output?\n\nconst arr1 = [1, 2];\nconst arr2 = [...arr1, 3, 4];\nconsole.log(arr2);",
    options: ["[[1, 2], 3, 4]", "[1, 2, 3, 4]", "[1, 2, [3, 4]]", "NaN"],
    correctAnswer: 1,
    explanation: "The spread operator '...' expands the elements of arr1 into the new array, resulting in [1, 2, 3, 4]."
  },
  {
    id: "js_20",
    category: "JavaScript",
    topic: "Typeof Operator",
    difficulty: "Medium",
    question: "What is the historical output of: typeof null in JavaScript?",
    options: ["'null'", "'undefined'", "'object'", "'boolean'"],
    correctAnswer: 2,
    explanation: "Due to a legacy bug dating back to the first release of JavaScript (where objects had a type tag of 0), typeof null returns 'object'."
  },
  {
    id: "js_21",
    category: "JavaScript",
    topic: "Event Loop",
    difficulty: "Medium",
    question: "What will be printed to the console first?\n\nconsole.log('A');\nsetTimeout(() => console.log('B'), 0);\nconsole.log('C');",
    options: ["A, then B, then C", "A, then C, then B", "B, then A, then C", "C, then B, then A"],
    correctAnswer: 1,
    explanation: "'A' and 'C' run synchronously on the Call Stack. setTimeout callback 'B' is placed in the Task/Macrotask Queue and runs only after synchronous code completes."
  },
  {
    id: "js_22",
    category: "JavaScript",
    topic: "Ternary Operator",
    difficulty: "Basic",
    question: "What does the expression (score >= 50 ? 'Pass' : 'Fail') return when score is 45?",
    options: ["Pass", "Fail", "undefined", "true"],
    correctAnswer: 1,
    explanation: "The condition 45 >= 50 evaluates to false, so the expression following the colon ('Fail') is returned."
  },
  {
    id: "js_23",
    category: "JavaScript",
    topic: "Modern Operators",
    difficulty: "Medium",
    question: "What is the Nullish Coalescing Operator (??) used for?",
    options: [
      "Returns the right-hand value only if the left-hand operand is null or undefined",
      "Returns the right-hand value if the left-hand operand is any falsy value (0, '', false)",
      "Checks if two values are equal",
      "Performs deep comparison of objects"
    ],
    correctAnswer: 0,
    explanation: "Unlike '||' which treats 0, false, and '' as falsy, '??' only triggers if the left-hand value is strictly null or undefined."
  },
  {
    id: "js_24",
    category: "JavaScript",
    topic: "Optional Chaining",
    difficulty: "Medium",
    question: "What does 'user?.profile?.name' prevent?",
    options: [
      "SQL injection attacks",
      "TypeError: Cannot read properties of undefined/null if user or profile does not exist",
      "Memory leaks in DOM trees",
      "Duplicate object keys"
    ],
    correctAnswer: 1,
    explanation: "Optional chaining (?.) short-circuits and returns undefined instead of throwing a TypeError if an intermediate reference is nullish."
  },
  {
    id: "js_25",
    category: "JavaScript",
    topic: "Functions",
    difficulty: "Basic",
    question: "What is an IIFE in JavaScript?",
    options: [
      "Internal Interface Function Execution",
      "Immediately Invoked Function Expression",
      "Integrated Instance Framework Element",
      "Inherited Iteration For Each"
    ],
    correctAnswer: 1,
    explanation: "An Immediately Invoked Function Expression (IIFE) is a function that runs as soon as it is defined: `(function(){ ... })();`."
  },
  {
    id: "js_26",
    category: "JavaScript",
    topic: "Storage APIs",
    difficulty: "Basic",
    question: "Data saved in sessionStorage is cleared when:",
    options: [
      "The page is refreshed",
      "The browser tab or window session is closed",
      "Never, it lasts forever",
      "After exactly 1 hour"
    ],
    correctAnswer: 1,
    explanation: "sessionStorage persists through page refreshes, but is wiped when the specific tab or window session terminates."
  },
  {
    id: "js_27",
    category: "JavaScript",
    topic: "Array Reduce",
    difficulty: "Medium",
    question: "What is the output of:\n\n[10, 20, 30].reduce((acc, curr) => acc + curr, 5);",
    options: ["60", "65", "50", "[10, 20, 30, 5]"],
    correctAnswer: 1,
    explanation: "Initial accumulator is 5. Sum = 5 + 10 + 20 + 30 = 65."
  },
  {
    id: "js_28",
    category: "JavaScript",
    topic: "Object Methods",
    difficulty: "Basic",
    question: "Which method returns an array of an object's own enumerable property names?",
    options: ["Object.values()", "Object.entries()", "Object.keys()", "Object.properties()"],
    correctAnswer: 2,
    explanation: "Object.keys(obj) returns an array containing the string-keyed property names of the specified object."
  },
  {
    id: "js_29",
    category: "JavaScript",
    topic: "Strict Mode",
    difficulty: "Medium",
    question: "What happens when you declare 'use strict;' at the top of a JavaScript file?",
    options: [
      "It enables experimental ES2030 syntax",
      "It catches common coding bloopers and prevents accidental global variable leaks by throwing errors",
      "It disables all asynchronous calls",
      "It compiles JS directly to WebAssembly"
    ],
    correctAnswer: 1,
    explanation: "'use strict' enforces strict parsing and error handling, turning silent mistakes into loud runtime errors."
  },
  {
    id: "js_30",
    category: "JavaScript",
    topic: "Error Handling",
    difficulty: "Basic",
    question: "In a try...catch...finally statement, when does the 'finally' block execute?",
    options: [
      "Only if an error is caught in the catch block",
      "Only if no error occurred in the try block",
      "Always, regardless of whether an error was thrown or caught",
      "Only if manually triggered by throw"
    ],
    correctAnswer: 2,
    explanation: "The 'finally' block always runs after try and catch have completed, regardless of whether an exception occurred."
  }
];

// ==========================================
// 5. REACT QUESTIONS (30 Basic to Medium)
// ==========================================
const reactQuestions = [
  {
    id: "react_1",
    category: "React",
    topic: "Fundamentals",
    difficulty: "Basic",
    question: "What is React?",
    options: [
      "A relational database management system",
      "An open-source JavaScript library for building user interfaces based on UI components",
      "A back-end server framework for Node.js",
      "A CSS styling preprocessor"
    ],
    correctAnswer: 1,
    explanation: "React is a JavaScript front-end library created by Meta for creating interactive and declarative user interfaces through reusable components."
  },
  {
    id: "react_2",
    category: "React",
    topic: "Virtual DOM",
    difficulty: "Medium",
    question: "How does the Virtual DOM optimize UI rendering performance in React?",
    options: [
      "It bypasses the browser completely and renders on the GPU",
      "It compares a lightweight in-memory representation with the previous one (diffing) and batches updates to only change what is necessary in the real DOM (reconciliation)",
      "It converts React components directly into SVG images",
      "It deletes the real DOM completely on every state change"
    ],
    correctAnswer: 1,
    explanation: "React keeps a virtual representation in memory. When state changes, it performs a diffing algorithm and updates only the altered DOM nodes via reconciliation."
  },
  {
    id: "react_3",
    category: "React",
    topic: "JSX",
    difficulty: "Basic",
    question: "What is JSX in React?",
    options: [
      "Java Syntax Extension",
      "A syntax extension to JavaScript that allows writing HTML-like markup inside JavaScript code",
      "A database query language",
      "A build tool replacing Webpack"
    ],
    correctAnswer: 1,
    explanation: "JSX stands for JavaScript XML, allowing developers to write declarative HTML-like component markup directly within JavaScript."
  },
  {
    id: "react_4",
    category: "React",
    topic: "JSX Rules",
    difficulty: "Basic",
    question: "In JSX, why must you use 'className' instead of 'class' when applying CSS styles?",
    options: [
      "'class' is a reserved keyword in JavaScript for OOP classes",
      "React requires 10-character property names",
      "'className' is faster to render",
      "Browsers do not support CSS classes in React"
    ],
    correctAnswer: 0,
    explanation: "Because JSX is compiled to JavaScript and 'class' is a reserved keyword in JS, React attributes use camelCase equivalents like 'className' and 'htmlFor'."
  },
  {
    id: "react_5",
    category: "React",
    topic: "Props vs State",
    difficulty: "Basic",
    question: "What is the primary difference between 'props' and 'state' in a React component?",
    options: [
      "Props are mutable and managed internally; state is immutable and passed from parent",
      "Props are passed down from parent to child (read-only); state is managed internally by the component (mutable via setter)",
      "Props are only for class components; state is only for functional components",
      "There is no difference"
    ],
    correctAnswer: 1,
    explanation: "Props are read-only inputs passed from parents. State is local, private data managed within the component that triggers re-renders when updated."
  },
  {
    id: "react_6",
    category: "React",
    topic: "useState Hook",
    difficulty: "Basic",
    question: "What does the useState hook return?",
    options: [
      "An object with get and set functions",
      "An array containing the current state value and a function to update it",
      "A promise that resolves to state",
      "Only the current state value"
    ],
    correctAnswer: 1,
    explanation: "const [state, setState] = useState(initialValue); returns a 2-element array: [currentValue, updaterFunction]."
  },
  {
    id: "react_7",
    category: "React",
    topic: "useState Hook",
    difficulty: "Medium",
    question: "When updating state based on the previous state value, what is the best practice?",
    options: [
      "Directly mutate the state variable (e.g., count++)",
      "Pass an updater callback function: setCount(prevCount => prevCount + 1)",
      "Call useState again",
      "Use window.location.reload()"
    ],
    correctAnswer: 1,
    explanation: "State updates may be asynchronous and batched; passing an updater function `(prev => prev + 1)` guarantees you are calculating against the latest state."
  },
  {
    id: "react_8",
    category: "React",
    topic: "useEffect Hook",
    difficulty: "Basic",
    question: "When does an effect run if you pass an empty dependency array `[]` to useEffect?",
    options: [
      "On every single component re-render",
      "Only once after the initial render (mount)",
      "Never",
      "Only right before the component unmounts"
    ],
    correctAnswer: 1,
    explanation: "An empty dependency array `[]` tells React the effect does not depend on any props or state, so it executes only once when the component mounts."
  },
  {
    id: "react_9",
    category: "React",
    topic: "useEffect Hook",
    difficulty: "Medium",
    question: "How do you define a cleanup operation (e.g., unsubscribing from a timer or socket) inside useEffect?",
    options: [
      "Call useEffect.destroy()",
      "Return a cleanup function from inside the useEffect callback",
      "Call window.removeEventListener at the bottom of the component",
      "Use the useCleanup hook"
    ],
    correctAnswer: 1,
    explanation: "React executes the function returned by useEffect when the component unmounts or before re-running the effect on dependency change."
  },
  {
    id: "react_10",
    category: "React",
    topic: "Lists & Keys",
    difficulty: "Basic",
    question: "Why should each item rendered in a list have a unique 'key' prop?",
    options: [
      "To set the CSS id of the element",
      "To help React identify which items have changed, been added, or removed during reconciliation",
      "Keys are required by HTML5 standard",
      "To sort the list automatically"
    ],
    correctAnswer: 1,
    explanation: "Keys provide a stable identity to list elements so React's diffing engine can preserve DOM state and update list items efficiently."
  },
  {
    id: "react_11",
    category: "React",
    topic: "Lists & Keys",
    difficulty: "Medium",
    question: "Why is using the array index as a 'key' discouraged when rendering a dynamic list?",
    options: [
      "React will throw a compile-time crash",
      "If the list is re-ordered, filtered, or items inserted, index keys can cause incorrect component state and rendering bugs",
      "Indices are strings instead of numbers",
      "Index keys disable CSS styles"
    ],
    correctAnswer: 1,
    explanation: "Using array indices as keys can cause bugs with component state and unnecessary re-renders if list order changes or items are inserted/deleted."
  },
  {
    id: "react_12",
    category: "React",
    topic: "Conditional Rendering",
    difficulty: "Basic",
    question: "Which pattern conditionally renders an element ONLY when 'isLoggedIn' is true?",
    options: [
      "{isLoggedIn && <UserProfile />}",
      "<UserProfile if={isLoggedIn} />",
      "<if condition={isLoggedIn}><UserProfile /></if>",
      "{isLoggedIn ? null : <UserProfile />}"
    ],
    correctAnswer: 0,
    explanation: "The short-circuit inline evaluation `{condition && <Component />}` renders the component if condition is truthy, and skips it otherwise."
  },
  {
    id: "react_13",
    category: "React",
    topic: "Fragments",
    difficulty: "Basic",
    question: "Why are React Fragments (`<React.Fragment>` or `<> ... </>`) used?",
    options: [
      "To group multiple elements together without adding an extra node to the DOM",
      "To create 3D visual effects",
      "To divide a component into multiple threads",
      "To cache network requests"
    ],
    correctAnswer: 0,
    explanation: "Fragments let you return multiple sibling elements without introducing an unnecessary wrapper div into the rendered DOM."
  },
  {
    id: "react_14",
    category: "React",
    topic: "Rules of Hooks",
    difficulty: "Medium",
    question: "Which of the following is a strict Rule of Hooks in React?",
    options: [
      "Hooks can be called inside loops and nested if statements",
      "Hooks can only be called at the top level of React function components or custom hooks",
      "Hooks must be called inside class lifecycle methods",
      "Hooks can be called anywhere in asynchronous promises"
    ],
    correctAnswer: 1,
    explanation: "Hooks must be called unconditionally at the top level so React can reliably preserve hook state between renders."
  },
  {
    id: "react_15",
    category: "React",
    topic: "Forms & Inputs",
    difficulty: "Medium",
    question: "What is a 'Controlled Component' in React?",
    options: [
      "A component that cannot be edited by the user",
      "A form input whose value is bound to and controlled by React component state",
      "A component controlled by an external server API",
      "A class component wrapped in Redux"
    ],
    correctAnswer: 1,
    explanation: "In a controlled component, form data is handled by component state (`value={text}` with `onChange={e => setText(e.target.value)}`)."
  },
  {
    id: "react_16",
    category: "React",
    topic: "Context API",
    difficulty: "Medium",
    question: "What is the primary purpose of React Context API?",
    options: [
      "To avoid prop-drilling by sharing data (like theme, authenticated user) globally across the component tree",
      "To manipulate the browser history stack",
      "To compile TypeScript files",
      "To store database tables in localStorage"
    ],
    correctAnswer: 0,
    explanation: "Context provides a way to pass data through the component tree without manually passing props down through intermediate components (prop drilling)."
  },
  {
    id: "react_17",
    category: "React",
    topic: "useRef Hook",
    difficulty: "Medium",
    question: "What is a primary use case for the 'useRef' hook?",
    options: [
      "To directly access a DOM element or persist mutable values across renders WITHOUT triggering re-renders",
      "To re-render the component whenever the ref changes",
      "To make HTTP GET requests",
      "To define component props"
    ],
    correctAnswer: 0,
    explanation: "useRef returns a mutable object whose `.current` property persists across renders. Changing `.current` does NOT trigger a component re-render."
  },
  {
    id: "react_18",
    category: "React",
    topic: "useMemo Hook",
    difficulty: "Medium",
    question: "What does the 'useMemo' hook do?",
    options: [
      "Caches a component's rendered HTML in sessionStorage",
      "Memoizes the result of an expensive calculation so it only recomputes when dependencies change",
      "Prevents network latency",
      "Automates browser memory garbage collection"
    ],
    correctAnswer: 1,
    explanation: "useMemo(() => computeExpensiveValue(a, b), [a, b]) caches the calculated value between renders unless specified dependencies have changed."
  },
  {
    id: "react_19",
    category: "React",
    topic: "useCallback Hook",
    difficulty: "Medium",
    question: "How does 'useCallback' differ from 'useMemo'?",
    options: [
      "useCallback returns a memoized callback function instance; useMemo returns a memoized value",
      "useCallback only works in class components",
      "useMemo is for styling while useCallback is for forms",
      "They are identical and can be swapped interchangeably"
    ],
    correctAnswer: 0,
    explanation: "useCallback(fn, deps) caches the function definition between renders, while useMemo(() => fn(), deps) caches the returned value."
  },
  {
    id: "react_20",
    category: "React",
    topic: "Synthetic Events",
    difficulty: "Medium",
    question: "What is a SyntheticEvent in React?",
    options: [
      "A simulated click generated by automated bots",
      "A cross-browser wrapper around the browser's native event with identical interface across all platforms",
      "An artificial intelligence event listener",
      "A mock event used only in unit tests"
    ],
    correctAnswer: 1,
    explanation: "React wraps native browser events in a cross-browser SyntheticEvent wrapper to provide a consistent event interface regardless of browser quirks."
  },
  {
    id: "react_21",
    category: "React",
    topic: "Children Prop",
    difficulty: "Basic",
    question: "What does the special 'props.children' property represent?",
    options: [
      "Only sub-components that inherit from the parent class",
      "Whatever elements or content are nested inside the component's opening and closing JSX tags",
      "An array of child process workers",
      "The child's internal state variables"
    ],
    correctAnswer: 1,
    explanation: "props.children allows components to compose and pass arbitrary child JSX markup between <Card>...children...</Card>."
  },
  {
    id: "react_22",
    category: "React",
    topic: "Lifting State Up",
    difficulty: "Medium",
    question: "What does 'Lifting State Up' mean in React?",
    options: [
      "Moving state to a common ancestor component so sibling components can share and synchronize the same data",
      "Storing state in the cloud",
      "Upgrading React from version 17 to version 18",
      "Converting local state to a Redux store"
    ],
    correctAnswer: 0,
    explanation: "When two sibling components need to reflect the same changing data, you lift the shared state up to their closest common ancestor."
  },
  {
    id: "react_23",
    category: "React",
    topic: "Custom Hooks",
    difficulty: "Medium",
    question: "What naming convention MUST all custom React hooks follow?",
    options: [
      "Must begin with the word 'use' in camelCase (e.g., useFetch, useWindowSize)",
      "Must end with 'Hook'",
      "Must begin with 'get'",
      "Must be in ALL_CAPS"
    ],
    correctAnswer: 0,
    explanation: "React requires custom hooks to start with 'use' so the linter can automatically enforce the Rules of Hooks."
  },
  {
    id: "react_24",
    category: "React",
    topic: "useReducer Hook",
    difficulty: "Medium",
    question: "When is 'useReducer' preferred over 'useState'?",
    options: [
      "When managing complex state logic that involves multiple sub-values or when the next state depends on the previous one in complicated ways",
      "When state is a simple single boolean or string",
      "When fetching images",
      "Only when using TypeScript"
    ],
    correctAnswer: 0,
    explanation: "useReducer is ideal for managing complex state transitions and state machines via action dispatching, similar to Redux patterns."
  },
  {
    id: "react_25",
    category: "React",
    topic: "React 18 Features",
    difficulty: "Medium",
    question: "What is React 18's automatic batching feature?",
    options: [
      "Group multiple state updates into a single re-render, even inside promises, setTimeout, and native event handlers",
      "Combining all CSS files into one file",
      "Batching all network requests into a single GraphQL query",
      "Auto-installing npm dependencies"
    ],
    correctAnswer: 0,
    explanation: "In React 18, all state updates—even those inside async callbacks, promises, and timeouts—are automatically batched for fewer re-renders."
  },
  {
    id: "react_26",
    category: "React",
    topic: "Component Types",
    difficulty: "Basic",
    question: "How are modern React functional components declared?",
    options: [
      "As a plain JavaScript function that accepts props and returns JSX markup",
      "As a class extending React.FunctionalComponent",
      "As a JSON schema file",
      "Using the 'component' keyword in ES6"
    ],
    correctAnswer: 0,
    explanation: "Modern React components are simple JavaScript functions that take a props object as an argument and return JSX elements."
  },
  {
    id: "react_27",
    category: "React",
    topic: "React Router",
    difficulty: "Basic",
    question: "Which component in React Router is used to create navigable links without triggering full page reloads?",
    options: ["<a href='...'>", "<Link to='...'>", "<Navigate path='...'>", "<RouteLink>"],
    correctAnswer: 1,
    explanation: "<Link to='...'> updates the browser URL and navigates client-side without causing a traditional full browser page refresh."
  },
  {
    id: "react_28",
    category: "React",
    topic: "Immutability",
    difficulty: "Medium",
    question: "Why should you NEVER mutate state directly (e.g., state.items.push(newItem)) in React?",
    options: [
      "React relies on reference equality checks (shallow comparison); direct mutation does not change object reference and will fail to trigger a re-render",
      "Direct mutation deletes the browser cache",
      "JavaScript does not allow array modification",
      "It causes an unhandled fatal syntax error"
    ],
    correctAnswer: 0,
    explanation: "React relies on comparing references. Mutating an object/array directly preserves the same reference, so React will assume nothing changed and skip re-rendering."
  },
  {
    id: "react_29",
    category: "React",
    topic: "React DOM",
    difficulty: "Basic",
    question: "In React 18, which method is used to initialize and mount the root of a React application?",
    options: [
      "ReactDOM.render(<App />, container)",
      "ReactDOM.createRoot(container).render(<App />)",
      "React.mountRoot(<App />)",
      "document.renderReact(<App />)"
    ],
    correctAnswer: 1,
    explanation: "React 18 introduced `createRoot(container).render(<App />)` to enable new concurrent features."
  },
  {
    id: "react_30",
    category: "React",
    topic: "Prop Types",
    difficulty: "Basic",
    question: "What is the purpose of the 'prop-types' package in React?",
    options: [
      "Runtime type-checking for component props to warn developers about mismatched data types during development",
      "Converting JavaScript to C++",
      "Speeding up production build bundle sizes",
      "Encrypting sensitive component data"
    ],
    correctAnswer: 0,
    explanation: "PropTypes performs runtime type checking on props during development, emitting console warnings if incorrect types are supplied."
  }
];

fs.writeFileSync(path.join(__dirname, 'data', 'questions', 'html.json'), JSON.stringify(htmlQuestions, null, 2));
fs.writeFileSync(path.join(__dirname, 'data', 'questions', 'css.json'), JSON.stringify(cssQuestions, null, 2));
fs.writeFileSync(path.join(__dirname, 'data', 'questions', 'bootstrap.json'), JSON.stringify(bootstrapQuestions, null, 2));
fs.writeFileSync(path.join(__dirname, 'data', 'questions', 'javascript.json'), JSON.stringify(jsQuestions, null, 2));
fs.writeFileSync(path.join(__dirname, 'data', 'questions', 'react.json'), JSON.stringify(reactQuestions, null, 2));

console.log('Saved html.json, css.json, bootstrap.json, javascript.json, react.json (30 questions each).');

