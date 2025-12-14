/*************************
 * STORAGE KEYS
 *************************/
const QUOTES_KEY = "quotesData";
const FILTER_KEY = "lastCategoryFilter";
const LAST_VIEWED_QUOTE_KEY = "lastViewedQuote";

/*************************
 * LOAD & SAVE
 *************************/
function loadQuotes() {
  const data = localStorage.getItem(QUOTES_KEY);
  return data ? JSON.parse(data) : [
    { text: "The best way to predict the future is to invent it.", category: "Technology" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Do or do not. There is no try.", category: "Motivation" }
  ];
}

function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

/*************************
 * INITIAL DATA
 *************************/
let quotes = loadQuotes();

/*************************
 * DOM REFERENCES
 *************************/
const quoteDisplay = document.getElementById("quoteDisplay");
const quoteList = document.getElementById("quoteList");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteButton = document.getElementById("newQuote");

/*************************
 * CATEGORY HANDLING
 *************************/
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

/*************************
 * DISPLAY QUOTES
 *************************/
function displayQuotes(list) {
  quoteList.innerHTML = "";

  list.forEach(q => {
    const div = document.createElement("div");
    div.textContent = `"${q.text}" — ${q.category}`;
    quoteList.appendChild(div);
  });
}

/*************************
 * FILTER LOGIC
 *************************/
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selected);

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  displayQuotes(filtered);
}

/*************************
 * SHOW RANDOM QUOTE
 *************************/
function showRandomQuote() {
  if (!quotes.length) return;

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}"`;

  sessionStorage.setItem(LAST_VIEWED_QUOTE_KEY, JSON.stringify(randomQuote));
}

/*************************
 * createAddQuoteForm
 *************************/
function createAddQuoteForm() {
  const form = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const button = document.createElement("button");
  button.textContent = "Add Quote";
  button.addEventListener("click", addQuote);

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(button);

  document.body.appendChild(form);
}

/*************************
 * addQuote
 *************************/
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category");
    return;
  }

  //  Logic to add quote
  quotes.push({ text, category });

  //  Update storage + DOM
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

/*************************
 *  EVENT LISTENER CHECK
 * “Show New Quote” Button
 *************************/
newQuoteButton.addEventListener("click", showRandomQuote);

/*************************
 * INITIALIZATION
 *************************/
populateCategories();
createAddQuoteForm();

const lastFilter = localStorage.getItem(FILTER_KEY);
if (lastFilter) categoryFilter.value = lastFilter;

filterQuotes();
