/***********************
 * STORAGE UTILITIES
 ***********************/
const STORAGE_KEY = "quotesData";
const SESSION_KEY = "lastViewedQuote";

// Load quotes from localStorage or use defaults
function loadQuotes() {
  const storedQuotes = localStorage.getItem(STORAGE_KEY);
  return storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The best way to predict the future is to invent it.", category: "Technology" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Do or do not. There is no try.", category: "Motivation" }
  ];
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
}

// Initialize quotes
let quotes = loadQuotes();

/***********************
 * DOM REFERENCES
 ***********************/
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");
const formContainer = document.getElementById("formContainer");
const exportBtn = document.getElementById("exportQuotes");
const importInput = document.getElementById("importFile");

/***********************
 * CATEGORY HANDLING
 ***********************/
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = "";

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

/***********************
 * QUOTE DISPLAY
 ***********************/
function showRandomQuote() {
  const category = categorySelect.value;
  const filtered = quotes.filter(q => q.category === category);

  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${randomQuote.text}"`;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(randomQuote));
}

/***********************
 * ADD QUOTE FORM
 ***********************/
function createAddQuoteForm() {
  const title = document.createElement("h3");
  title.textContent = "Add a New Quote";

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter quote text";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const button = document.createElement("button");
  button.textContent = "Add Quote";
  button.addEventListener("click", addQuote);

  formContainer.append(title, quoteInput, categoryInput, button);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Both fields are required.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added and saved!");
}

/***********************
 * JSON EXPORT
 ***********************/
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

/***********************
 * JSON IMPORT
 ***********************/
function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        throw new Error("Invalid JSON format");
      }

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();

      alert("Quotes imported successfully!");
    } catch {
      alert("Failed to import quotes. Invalid JSON file.");
    }
  };

  fileReader.readAsText(event.target.files[0]);
}

/***********************
 * EVENT LISTENERS
 ***********************/
newQuoteBtn.addEventListener("click", showRandomQuote);
exportBtn.addEventListener("click", exportQuotes);
importInput.addEventListener("change", importFromJsonFile);

/***********************
 * APP INITIALIZATION
 ***********************/
populateCategories();
createAddQuoteForm();

// Restore last viewed quote from sessionStorage
const lastQuote = sessionStorage.getItem(SESSION_KEY);
if (lastQuote) {
  quoteDisplay.textContent = `"${JSON.parse(lastQuote).text}"`;
}
