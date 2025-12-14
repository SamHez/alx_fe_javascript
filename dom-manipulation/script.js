/*************************
 * STORAGE KEYS
 *************************/
const QUOTES_KEY = "quotesData";
const FILTER_KEY = "selectedCategory";

/*************************
 * LOAD & SAVE
 *************************/
function loadQuotes() {
  const stored = localStorage.getItem(QUOTES_KEY);
  return stored ? JSON.parse(stored) : [
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
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteButton = document.getElementById("newQuote");

/*************************
 * POPULATE CATEGORIES
 *************************/
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

/*************************
 * FILTER + DISPLAY LOGIC
 *************************/
function filterQuotes() {
  const selectedCategory = categoryFilter.value;

  //  Save selected category
  localStorage.setItem(FILTER_KEY, selectedCategory);

  let filteredQuotes = quotes;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(
      quote => quote.category === selectedCategory
    );
  }

  //  Update displayed quotes
  quoteDisplay.innerHTML = "";

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  filteredQuotes.forEach(quote => {
    const p = document.createElement("p");
    p.textContent = `"${quote.text}" — ${quote.category}`;
    quoteDisplay.appendChild(p);
  });
}

/*************************
 * SHOW RANDOM QUOTE
 *************************/
function showRandomQuote() {
  if (!quotes.length) return;
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.textContent = `"${random.text}" — ${random.category}`;
}

/*************************
 * ADD QUOTE FORM (REQUIRED)
 *************************/
function createAddQuoteForm() {
  const container = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const button = document.createElement("button");
  button.textContent = "Add Quote";
  button.addEventListener("click", addQuote);

  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(button);

  document.body.appendChild(container);
}

/*************************
 * ADD QUOTE LOGIC
 *************************/
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

/*************************
 * EVENT LISTENERS
 *************************/
categoryFilter.addEventListener("change", filterQuotes);
newQuoteButton.addEventListener("click", showRandomQuote);

/*************************
 * RESTORE LAST FILTER
 *************************/
populateCategories();

const savedCategory = localStorage.getItem(FILTER_KEY);
if (savedCategory) {
  categoryFilter.value = savedCategory;
}

/*************************
 * INITIALIZE
 *************************/
createAddQuoteForm();
filterQuotes();
