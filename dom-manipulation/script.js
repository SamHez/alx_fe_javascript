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
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
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
syncNotice.textContent = "Quotes updated from server.";
document.body.appendChild(syncNotice);

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
 * ADD QUOTE
 *************************/
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Missing fields");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  // 🔹 POST new quote to server
  postQuoteToServer(newQuote);
}

/*************************
 * POST TO SERVER (REQUIRED)
 *************************/
function postQuoteToServer(quote) {
  fetch(SERVER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(quote)
  })
  .then(response => response.json())
  .then(data => console.log("Posted to server:", data));
}

/*************************
 * FETCH FROM SERVER
 *************************/
async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_API);
  const data = await response.json();

  return data.slice(0, 5).map(item => ({
    text: item.title,
    category: "Server"
  }));
}

/*************************
 * SYNC + CONFLICT RESOLUTION
 *************************/
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const localMap = new Map(quotes.map(q => [q.text, q]));

  let conflictDetected = false;

  serverQuotes.forEach(serverQuote => {
    if (localMap.has(serverQuote.text)) {
      conflictDetected = true;
    }
    // SERVER WINS
    localMap.set(serverQuote.text, serverQuote);
  });

  quotes = Array.from(localMap.values());
  saveQuotes();
  populateCategories();
  filterQuotes();

  localStorage.setItem(LAST_SYNC_KEY, Date.now());

  if (conflictDetected) {
    syncNotice.style.display = "block";
  }
}

/*************************
 * EVENT LISTENERS
 *************************/
categoryFilter.addEventListener("change", filterQuotes);
newQuoteButton.addEventListener("click", showRandomQuote);

/*************************
 * INITIALIZATION
 *************************/
populateCategories();

const savedCategory = localStorage.getItem(FILTER_KEY);
if (savedCategory) categoryFilter.value = savedCategory;

filterQuotes();

/*************************
 * PERIODIC SERVER CHECK
 *************************/
syncQuotes();
setInterval(syncQuotes, 30000);
