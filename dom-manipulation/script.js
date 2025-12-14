/***********************
 * STORAGE KEYS
 ***********************/
const QUOTES_KEY = "quotesData";
const FILTER_KEY = "lastCategoryFilter";

/***********************
 * LOAD & SAVE
 ***********************/
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

/***********************
 * INITIAL DATA
 ***********************/
let quotes = loadQuotes();

/***********************
 * DOM REFERENCES
 ***********************/
const quoteList = document.getElementById("quoteList");
const categoryFilter = document.getElementById("categoryFilter");

/***********************
 * POPULATE CATEGORIES
 ***********************/
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];

  // Reset dropdown
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

/***********************
 * DISPLAY QUOTES
 ***********************/
function displayQuotes(filteredQuotes) {
  quoteList.innerHTML = "";

  if (filteredQuotes.length === 0) {
    quoteList.textContent = "No quotes found for this category.";
    return;
  }

  filteredQuotes.forEach(q => {
    const div = document.createElement("div");
    div.className = "quote";
    div.textContent = `"${q.text}" — ${q.category}`;
    quoteList.appendChild(div);
  });
}

/***********************
 * FILTER LOGIC
 ***********************/
function filterQuotes() {
  const selectedCategory = categoryFilter.value;

  // Save filter preference
  localStorage.setItem(FILTER_KEY, selectedCategory);

  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  displayQuotes(filtered);
}

/***********************
 * ADD QUOTE
 ***********************/
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  filterQuotes(); // Refresh view in real time
}

/***********************
 * RESTORE FILTER
 ***********************/
function restoreLastFilter() {
  const lastFilter = localStorage.getItem(FILTER_KEY);
  if (lastFilter) {
    categoryFilter.value = lastFilter;
  }
}

/***********************
 * INITIALIZE APP
 ***********************/
populateCategories();
restoreLastFilter();
filterQuotes();
