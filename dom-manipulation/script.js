/*************************
 * CONFIG & STORAGE KEYS
 *************************/
const LOCAL_KEY = "quotesData";
const SYNC_KEY = "lastSyncTimestamp";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

/*************************
 * LOAD & SAVE
 *************************/
function loadLocalQuotes() {
  return JSON.parse(localStorage.getItem(LOCAL_KEY)) || [];
}

function saveLocalQuotes() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
}

/*************************
 * INITIAL STATE
 *************************/
let quotes = loadLocalQuotes();

/*************************
 * DOM REFERENCES
 *************************/
const quoteList = document.getElementById("quoteList");
const categoryFilter = document.getElementById("categoryFilter");
const syncNotice = document.getElementById("syncNotice");

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
function filterQuotes() {
  const category = categoryFilter.value;
  const filtered = category === "all"
    ? quotes
    : quotes.filter(q => q.category === category);

  quoteList.innerHTML = "";
  filtered.forEach(q => {
    const div = document.createElement("div");
    div.className = "quote";
    div.textContent = `"${q.text}" — ${q.category}`;
    quoteList.appendChild(div);
  });
}

/*************************
 * ADD QUOTE (LOCAL)
 *************************/
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) return alert("Missing fields");

  quotes.push({
    text,
    category,
    updatedAt: Date.now()
  });

  saveLocalQuotes();
  populateCategories();
  filterQuotes();
}

/*************************
 * SERVER FETCH (SIMULATED)
 *************************/
async function fetchServerQuotes() {
  const response = await fetch(SERVER_URL);
  const data = await response.json();

  // Convert posts → quotes
  return data.slice(0, 5).map(post => ({
    text: post.title,
    category: "Server",
    updatedAt: Date.now()
  }));
}

/*************************
 * SYNC & CONFLICT RESOLUTION
 * Strategy: SERVER WINS
 *************************/
async function syncWithServer() {
  const serverQuotes = await fetchServerQuotes();
  const localMap = new Map(quotes.map(q => [q.text, q]));

  let conflictDetected = false;

  serverQuotes.forEach(serverQuote => {
    if (localMap.has(serverQuote.text)) {
      conflictDetected = true;
      localMap.set(serverQuote.text, serverQuote); // server wins
    } else {
      localMap.set(serverQuote.text, serverQuote);
    }
  });

  quotes = Array.from(localMap.values());
  saveLocalQuotes();
  populateCategories();
  filterQuotes();

  if (conflictDetected) {
    syncNotice.style.display = "block";
  }

  localStorage.setItem(SYNC_KEY, Date.now());
}

/*************************
 * MANUAL CONFLICT REVIEW
 *************************/
function manualResolve() {
  alert("Server data has replaced conflicting local entries.");
  syncNotice.style.display = "none";
}

/*************************
 * PERIODIC SYNC (SIMULATION)
 *************************/
setInterval(syncWithServer, 30000); // every 30 seconds

/*************************
 * INIT APP
 *************************/
populateCategories();
filterQuotes();
syncWithServer();
