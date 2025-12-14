/*************************
 * STORAGE KEYS
 *************************/
const QUOTES_KEY = "quotesData";
const FILTER_KEY = "lastCategoryFilter";
const LAST_VIEWED_QUOTE_KEY = "lastViewedQuote";
const SERVER_API = "https://jsonplaceholder.typicode.com/posts";
const LAST_SYNC_KEY = "lastServerSync";

/*************************
 * LOAD & SAVE
 *************************/
function loadQuotes() {
  const data = localStorage.getItem(QUOTES_KEY);
  return data ? JSON.parse(data) : [
    { text: "The best way to predict the future is to invent it.", category: "Technology", updatedAt: Date.now() },
    { text: "Life is what happens when you're busy making other plans.", category: "Life", updatedAt: Date.now() },
    { text: "Do or do not. There is no try.", category: "Motivation", updatedAt: Date.now() }
  ];
}

function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

/*************************
 * INITIAL STATE
 *************************/
let quotes = loadQuotes();

/*************************
 * DOM REFERENCES
 *************************/
const quoteList = document.getElementById("quoteList");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuoteBtn");
const syncStatus = document.getElementById("syncStatus");

/*************************
 * CATEGORY HANDLING
 *************************/
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

/*************************
 * DISPLAY & FILTER
 *************************/
function displayQuotes(list) {
  quoteList.innerHTML = "";
  if (!list.length) {
    quoteList.textContent = "No quotes found.";
    return;
  }

  list.forEach(q => {
    const div = document.createElement("div");
    div.className = "quote";
    div.textContent = `"${q.text}" — ${q.category}`;
    quoteList.appendChild(div);
  });
}

function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem(FILTER_KEY, selected);

  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  displayQuotes(filtered);
}

/*************************
 * RANDOM QUOTE
 *************************/
function showRandomQuote() {
  const selected = categoryFilter.value;
  const filtered = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (!filtered.length) return;

  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  alert(`"${quote.text}"`);
  sessionStorage.setItem(LAST_VIEWED_QUOTE_KEY, JSON.stringify(quote));
}

/*************************
 * ADD QUOTE
 *************************/
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert("Both fields required");
    return;
  }

  quotes.push({ text, category, updatedAt: Date.now() });
  saveQuotes();
  populateCategories();
  filterQuotes();

  newQuoteText.value = "";
  newQuoteCategory.value = "";
}

/*************************
 * JSON EXPORT
 *************************/
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

/*************************
 * JSON IMPORT
 *************************/
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error();
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

/*************************
 * SERVER SYNC SIMULATION
 *************************/
async function fetchQuotesFromServer() {
  const res = await fetch(SERVER_API);
  const data = await res.json();

  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: "Server",
    updatedAt: Date.now()
  }));
}

async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  const map = new Map(quotes.map(q => [q.text, q]));
  let conflict = false;

  serverQuotes.forEach(sq => {
    if (map.has(sq.text)) conflict = true;
    map.set(sq.text, sq); // server wins
  });

  quotes = Array.from(map.values());
  saveQuotes();
  populateCategories();
  filterQuotes();

  if (conflict) syncStatus.style.display = "block";
  localStorage.setItem(LAST_SYNC_KEY, Date.now());
}

function acknowledgeSync() {
  syncStatus.style.display = "none";
}

/*************************
 * EVENT LISTENERS
 *************************/
categoryFilter.addEventListener("change", filterQuotes);
newQuoteBtn.addEventListener("click", showRandomQuote);

/*************************
 * RESTORE STATE
 *************************/
populateCategories();

const lastFilter = localStorage.getItem(FILTER_KEY);
if (lastFilter) categoryFilter.value = lastFilter;

filterQuotes();

/*************************
 * PERIODIC SERVER SYNC
 *************************/
syncWithServer();
setInterval(syncWithServer, 30000);
