/*************************
 * STORAGE KEYS
 *************************/
const QUOTES_KEY = "quotesData";
const FILTER_KEY = "selectedCategory";
const LAST_SYNC_KEY = "lastSyncTime";

/*************************
 * MOCK SERVER API
 *************************/
const SERVER_API = "https://jsonplaceholder.typicode.com/posts";

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
 * UI NOTIFICATION
 *************************/
const syncNotice = document.createElement("div");
syncNotice.id = "syncNotice";
syncNotice.style.display = "none";
syncNotice.style.padding = "10px";
syncNotice.style.marginTop = "10px";
syncNotice.style.border = "1px solid #ccc";
syncNotice.style.backgroundColor = "#f0f8ff";
syncNotice.textContent = "Quotes synced with server!";
document.body.appendChild(syncNotice);

function acknowledgeSync() {
  syncNotice.style.display = "none";
}

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
 * FILTER & DISPLAY
 *************************/
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selectedCategory);

  let filtered = quotes;
  if (selectedCategory !== "all") {
    filtered = quotes.filter(q => q.category === selectedCategory);
  }

  quoteDisplay.innerHTML = "";
  filtered.forEach(q => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" — ${q.category}`;
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
 * ✅ CREATE ADD-QUOTE FORM
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
 * ✅ ADD QUOTE FUNCTION
 *************************/
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both text and category.");
    return;
  }

  // Add to quotes array
  const newQuote = { text, category };
  quotes.push(newQuote);

  // Update storage and DOM
  saveQuotes();
  populateCategories();
  filterQuotes();

  // Clear inputs
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // POST to server
  postQuoteToServer(newQuote);
}

/*************************
 * POST TO SERVER
 *************************/
function postQuoteToServer(quote) {
  fetch(SERVER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(quote)
  })
  .then(res => res.json())
  .then(data => console.log("Posted to server:", data));
}

/*************************
 * FETCH & SYNC FROM SERVER
 *************************/
async function fetchQuotesFromServer() {
  const res = await fetch(SERVER_API);
  const data = await res.json();
  return data.slice(0, 5).map(item => ({
    text: item.title,
    category: "Server"
  }));
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const localMap = new Map(quotes.map(q => [q.text, q]));

  serverQuotes.forEach(sq => {
    // SERVER WINS
    localMap.set(sq.text, sq);
  });

  quotes = Array.from(localMap.values());
  saveQuotes();
  populateCategories();
  filterQuotes();
  syncNotice.style.display = "block";
  localStorage.setItem(LAST_SYNC_KEY, Date.now());
}

/*************************
 * EVENT LISTENERS
 *************************/
categoryFilter.addEventListener("change", filterQuotes);
newQuoteButton.addEventListener("click", showRandomQuote);

/*************************
 * INITIALIZE
 *************************/
populateCategories();
createAddQuoteForm();

// Restore last selected category
const savedCategory = localStorage.getItem(FILTER_KEY);
if (savedCategory) categoryFilter.value = savedCategory;

filterQuotes();

// Periodic server sync every 30s
syncQuotes();
setInterval(syncQuotes, 30000);
