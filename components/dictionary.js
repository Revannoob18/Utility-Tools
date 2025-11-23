import { showToast } from "../app.js";

const HISTORY_KEY = "aolt-dict-history";
const FAVORITES_KEY = "aolt-dict-favorites";
const LANG_KEY = "aolt-dict-language";

// Language translations
const translations = {
  en: {
    title: "Smart Dictionary",
    subtitle: "English dictionary with pronunciation & examples",
    placeholder: "Search any English word...",
    searchBtn: "Search",
    resultTab: "Result",
    historyTab: "History",
    favoritesTab: "Favorites",
    startSearching: "Start Searching",
    startSearchingDesc: "Type any English word and press Enter or click Search",
    searching: "Searching...",
    recentSearches: "Recent Searches",
    favoriteWords: "Favorite Words",
    clearAll: "Clear All",
    listenBtn: "Listen",
    synonyms: "Synonyms",
    antonyms: "Antonyms",
    source: "Source",
    viewMore: "View more",
    wordNotFound: "Word Not Found",
    wordNotFoundDesc: "couldn't be found in the dictionary.",
    wordNotFoundHint: "Try checking the spelling or search for a different word.",
    removedFromFavorites: "☆ Removed from favorites",
    addedToFavorites: "⭐ Added to favorites",
    noHistoryYet: "No search history yet",
    noFavoritesYet: "No favorite words yet",
    clearHistoryConfirm: "Clear all search history?",
    clearFavoritesConfirm: "Clear all favorites?",
    historyCleared: "🗑️ History cleared",
    favoritesCleared: "🗑️ Favorites cleared",
    wordNotFoundToast: "❌ Word not found"
  },
  id: {
    title: "Kamus Pintar",
    subtitle: "Kamus Bahasa Indonesia dengan definisi & sinonim lengkap",
    placeholder: "Cari kata dalam Bahasa Indonesia...",
    searchBtn: "Cari",
    resultTab: "Hasil",
    historyTab: "Riwayat",
    favoritesTab: "Favorit",
    startSearching: "Mulai Pencarian",
    startSearchingDesc: "Ketik kata apapun dan tekan Enter atau klik Cari",
    searching: "Mencari...",
    recentSearches: "Pencarian Terkini",
    favoriteWords: "Kata Favorit",
    clearAll: "Hapus Semua",
    listenBtn: "Dengar",
    synonyms: "Sinonim",
    antonyms: "Antonim",
    source: "Sumber",
    viewMore: "Lihat lebih",
    wordNotFound: "Kata Tidak Ditemukan",
    wordNotFoundDesc: "tidak ditemukan dalam kamus.",
    wordNotFoundHint: "Coba periksa ejaan atau cari kata yang berbeda.",
    removedFromFavorites: "☆ Dihapus dari favorit",
    addedToFavorites: "⭐ Ditambah ke favorit",
    noHistoryYet: "Belum ada riwayat pencarian",
    noFavoritesYet: "Belum ada kata favorit",
    clearHistoryConfirm: "Hapus semua riwayat pencarian?",
    clearFavoritesConfirm: "Hapus semua favorit?",
    historyCleared: "🗑️ Riwayat dihapus",
    favoritesCleared: "🗑️ Favorit dihapus",
    wordNotFoundToast: "❌ Kata tidak ditemukan"
  }
};

function loadLanguage() {
  return localStorage.getItem(LANG_KEY) || "en";
}

function saveLanguage(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function initDictionary() {
  const section = document.getElementById("dictionary");
  let currentLang = loadLanguage();
  let history = loadHistory();
  let favorites = loadFavorites();
  let currentWord = null;

  function renderUI() {
    const t = translations[currentLang];
    
    section.innerHTML = `
      <div class="dict-header">
        <div class="dict-header-content">
          <div class="dict-header-left">
            <div class="dict-icon">📖</div>
            <div>
              <div class="dict-header-title">${t.title}</div>
              <div class="dict-header-subtitle">${t.subtitle}</div>
            </div>
          </div>
          <div class="dict-stats">
            <div class="dict-stat-item">
              <span class="dict-stat-icon">🔍</span>
              <span class="dict-stat-value" id="dict-search-count">0</span>
            </div>
            <div class="dict-stat-item">
              <span class="dict-stat-icon">⭐</span>
              <span class="dict-stat-value" id="dict-fav-count">0</span>
            </div>
            <button class="dict-lang-toggle" id="dict-lang-toggle">
              <span class="dict-lang-flag">${currentLang === 'en' ? '🇬🇧' : '🇮🇩'}</span>
              <span class="dict-lang-text">${currentLang === 'en' ? 'EN' : 'ID'}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="dict-search-container">
        <div class="dict-search-box">
          <span class="dict-search-icon">🔍</span>
          <input 
            id="dict-input" 
            class="dict-search-input" 
            placeholder="${t.placeholder}" 
            autocomplete="off"
          />
          <button id="dict-clear" class="dict-clear-btn" style="display: none;">×</button>
        </div>
        <button id="dict-search" class="dict-search-btn">
          <span>🔍</span> ${t.searchBtn}
        </button>
      </div>

      <div class="dict-quick-access">
        <div class="dict-tabs">
          <button class="dict-tab active" data-tab="result">📝 ${t.resultTab}</button>
          <button class="dict-tab" data-tab="history">🕒 ${t.historyTab}</button>
          <button class="dict-tab" data-tab="favorites">⭐ ${t.favoritesTab}</button>
        </div>
      </div>

      <div class="dict-content">
        <!-- Result Tab -->
        <div class="dict-tab-content active" id="dict-result-tab">
          <div class="dict-empty-state" id="dict-empty">
            <div class="dict-empty-icon">🔍</div>
            <div class="dict-empty-title">${t.startSearching}</div>
            <div class="dict-empty-text">${t.startSearchingDesc}</div>
          </div>

          <div class="dict-loading" id="dict-loading" style="display: none;">
            <div class="dict-loading-spinner"></div>
            <div>${t.searching}</div>
          </div>

          <div class="dict-result-container" id="dict-result" style="display: none;"></div>
        </div>

        <!-- History Tab -->
        <div class="dict-tab-content" id="dict-history-tab">
          <div class="dict-list-header">
            <h3>🕒 ${t.recentSearches}</h3>
            <button class="dict-clear-list-btn" id="dict-clear-history">${t.clearAll}</button>
          </div>
          <div class="dict-history-list" id="dict-history-list"></div>
        </div>

        <!-- Favorites Tab -->
        <div class="dict-tab-content" id="dict-favorites-tab">
          <div class="dict-list-header">
            <h3>⭐ ${t.favoriteWords}</h3>
            <button class="dict-clear-list-btn" id="dict-clear-favorites">${t.clearAll}</button>
          </div>
          <div class="dict-favorites-list" id="dict-favorites-list"></div>
        </div>
      </div>
    `;

    initializeEventListeners();
    updateStats();
    renderHistory();
    renderFavorites();
  }

  function updateStats() {
    const searchCount = document.getElementById("dict-search-count");
    const favCount = document.getElementById("dict-fav-count");
    if (searchCount) searchCount.textContent = history.length;
    if (favCount) favCount.textContent = favorites.length;
  }

  async function searchWord(word) {
    const query = word.trim().toLowerCase();
    if (!query) return;

    const emptyState = document.getElementById("dict-empty");
    const resultContainer = document.getElementById("dict-result");
    const loadingState = document.getElementById("dict-loading");

    // Show loading
    emptyState.style.display = "none";
    resultContainer.style.display = "none";
    loadingState.style.display = "flex";

    try {
      if (currentLang === 'id') {
        // Indonesian: Use KBBI API
        await searchIndonesian(query);
      } else {
        // English: Use Free Dictionary API
        await searchEnglish(query);
      }
    } catch (error) {
      displayError(query);
    } finally {
      loadingState.style.display = "none";
    }
  }

  async function searchEnglish(query) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`);
    
    if (!response.ok) {
      throw new Error("Word not found");
    }

    const data = await response.json();
    displayResultEnglish(data[0], query);
    addToHistory(query);
    currentWord = { word: query, data: data[0], lang: 'en' };
  }

  async function searchIndonesian(query) {
    try {
      // Try using CORS proxy for KBBI API
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const apiUrl = `https://new-kbbi-api.herokuapp.com/cari/${encodeURIComponent(query)}`;
      const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
      
      if (!response.ok) {
        throw new Error("Word not found");
      }

      const data = await response.json();
      
      if (!data || data.message === "Tidak ada hasil") {
        throw new Error("Word not found");
      }

      displayResultIndonesian(data, query);
      addToHistory(query);
      currentWord = { word: query, data: data, lang: 'id' };
    } catch (error) {
      // Fallback: show message that Indonesian dictionary requires internet
      displayIndonesianFallback(query);
    }
  }

  function displayResultEnglish(data, word) {
    const t = translations[currentLang];
    const resultContainer = document.getElementById("dict-result");
    const isFavorite = favorites.some(f => f.word === word);
    
    let phoneticsHTML = "";
    if (data.phonetics && data.phonetics.length > 0) {
      const phoneticWithAudio = data.phonetics.find(p => p.audio) || data.phonetics[0];
      const phoneticText = phoneticWithAudio.text || data.phonetic || "";
      const audioUrl = phoneticWithAudio.audio;
      
      phoneticsHTML = `
        <div class="dict-phonetic">
          <span class="dict-phonetic-text">${phoneticText}</span>
          ${audioUrl ? `
            <button class="dict-audio-btn" onclick="new Audio('${audioUrl}').play()">
              <span>🔊</span> ${t.listenBtn}
            </button>
          ` : ""}
        </div>
      `;
    }

    let meaningsHTML = "";
    if (data.meanings && data.meanings.length > 0) {
      meaningsHTML = data.meanings.map(meaning => {
        const definitionsHTML = meaning.definitions.slice(0, 3).map((def, idx) => `
          <div class="dict-definition-item">
            <div class="dict-definition-number">${idx + 1}</div>
            <div class="dict-definition-content">
              <div class="dict-definition-text">${def.definition}</div>
              ${def.example ? `<div class="dict-example">💬 "${def.example}"</div>` : ""}
            </div>
          </div>
        `).join("");

        const synonymsHTML = meaning.synonyms && meaning.synonyms.length > 0 ? `
          <div class="dict-synonyms">
            <strong>${t.synonyms}:</strong> ${meaning.synonyms.slice(0, 5).map(s => 
              `<span class="dict-synonym-tag" onclick="document.getElementById('dict-input').value='${s}'; document.getElementById('dict-search').click();">${s}</span>`
            ).join("")}
          </div>
        ` : "";

        const antonymsHTML = meaning.antonyms && meaning.antonyms.length > 0 ? `
          <div class="dict-antonyms">
            <strong>${t.antonyms}:</strong> ${meaning.antonyms.slice(0, 5).map(a => 
              `<span class="dict-antonym-tag" onclick="document.getElementById('dict-input').value='${a}'; document.getElementById('dict-search').click();">${a}</span>`
            ).join("")}
          </div>
        ` : "";

        return `
          <div class="dict-meaning-section">
            <div class="dict-part-of-speech">${meaning.partOfSpeech}</div>
            <div class="dict-definitions">${definitionsHTML}</div>
            ${synonymsHTML}
            ${antonymsHTML}
          </div>
        `;
      }).join("");
    }

    const sourceHTML = data.sourceUrls && data.sourceUrls.length > 0 ? `
      <div class="dict-source">
        <strong>${t.source}:</strong> 
        <a href="${data.sourceUrls[0]}" target="_blank" rel="noopener">🔗 ${t.viewMore}</a>
      </div>
    ` : "";

    resultContainer.innerHTML = `
      <div class="dict-result-card">
        <div class="dict-result-header">
          <div class="dict-result-title-section">
            <h2 class="dict-word-title">${word}</h2>
            ${phoneticsHTML}
          </div>
          <button class="dict-favorite-btn ${isFavorite ? 'active' : ''}" id="dict-toggle-favorite">
            <span>${isFavorite ? '⭐' : '☆'}</span>
          </button>
        </div>
        ${meaningsHTML}
        ${sourceHTML}
      </div>
    `;

    resultContainer.style.display = "block";

    // Add favorite toggle handler
    document.getElementById("dict-toggle-favorite").addEventListener("click", () => {
      toggleFavorite(word, data);
    });
  }

  function displayIndonesianFallback(word) {
    const t = translations[currentLang];
    const resultContainer = document.getElementById("dict-result");
    
    // Static Indonesian dictionary data (basic words)
    const staticDict = {
      'makan': {
        arti: [{
          kelas: 'Verba (kata kerja)',
          deskripsi: ['memasukkan makanan ke dalam mulut serta mengunyah dan menelannya', 'mendapat atau memperoleh sesuatu', 'menghancurkan atau melenyapkan']
        }]
      },
      'rumah': {
        arti: [{
          kelas: 'Nomina (kata benda)',
          deskripsi: ['bangunan untuk tempat tinggal', 'tempat kediaman (alamat)', 'bangunan pada umumnya']
        }]
      },
      'indah': {
        arti: [{
          kelas: 'Adjektiva (kata sifat)',
          deskripsi: ['amat bagus; elok; permai', 'cantik dan menarik hati']
        }]
      },
      'buku': {
        arti: [{
          kelas: 'Nomina (kata benda)',
          deskripsi: ['lembar kertas yang berjilid, berisi tulisan atau kosong', 'kitab']
        }]
      },
      'belajar': {
        arti: [{
          kelas: 'Verba (kata kerja)',
          deskripsi: ['berusaha memperoleh kepandaian atau ilmu', 'berlatih', 'berubah tingkah laku atau tanggapan']
        }]
      },
      'air': {
        arti: [{
          kelas: 'Nomina (kata benda)',
          deskripsi: ['cairan jernih tidak berwarna, tidak berasa, dan tidak berbau', 'cairan yang keluar atau terdapat dalam tubuh']
        }]
      },
      'api': {
        arti: [{
          kelas: 'Nomina (kata benda)',
          deskripsi: ['panas dan cahaya yang berasal dari sesuatu yang terbakar', 'kebakaran']
        }]
      }
    };

    const data = staticDict[word.toLowerCase()];
    
    if (data) {
      displayResultIndonesian(data, word);
      addToHistory(word);
      currentWord = { word: word, data: data, lang: 'id' };
    } else {
      resultContainer.innerHTML = `
        <div class="dict-error-card">
          <div class="dict-error-icon">🌐</div>
          <div class="dict-error-title">Memerlukan Koneksi Internet</div>
          <div class="dict-error-text">Kamus Bahasa Indonesia memerlukan koneksi internet yang stabil.</div>
          <div class="dict-error-hint">
            <p style="margin-top: 1rem;">Kata yang tersedia offline: makan, rumah, indah, buku, belajar, air, api</p>
            <p style="margin-top: 0.5rem;">Atau coba gunakan mode English (🇬🇧) untuk pencarian online.</p>
          </div>
        </div>
      `;
      resultContainer.style.display = "block";
    }
  }

  function displayError(word) {
    const t = translations[currentLang];
    const resultContainer = document.getElementById("dict-result");
    
    resultContainer.innerHTML = `
      <div class="dict-error-card">
        <div class="dict-error-icon">🔍</div>
        <div class="dict-error-title">${t.wordNotFound}</div>
        <div class="dict-error-text">"${word}" ${t.wordNotFoundDesc}</div>
        <div class="dict-error-hint">${t.wordNotFoundHint}</div>
      </div>
    `;
    resultContainer.style.display = "block";
    showToast(t.wordNotFoundToast);
  }

  function addToHistory(word) {
    history = history.filter(h => h.word !== word);
    history.unshift({ word, timestamp: new Date().toISOString() });
    if (history.length > 50) history = history.slice(0, 50);
    saveHistory(history);
    updateStats();
    renderHistory();
  }

  function toggleFavorite(word, data) {
    const t = translations[currentLang];
    const index = favorites.findIndex(f => f.word === word);
    if (index > -1) {
      favorites.splice(index, 1);
      showToast(t.removedFromFavorites);
    } else {
      favorites.unshift({ word, data, timestamp: new Date().toISOString() });
      showToast(t.addedToFavorites);
    }
    saveFavorites(favorites);
    updateStats();
    renderFavorites();
    
    // Update button if still showing same word
    if (currentWord && currentWord.word === word) {
      if (currentWord.lang === 'id') {
        displayResultIndonesian(data, word);
      } else {
        displayResultEnglish(data, word);
      }
    }
  }

  function renderHistory() {
    const t = translations[currentLang];
    const historyList = document.getElementById("dict-history-list");
    if (!historyList) return;

    if (history.length === 0) {
      historyList.innerHTML = `<div class="dict-empty-list">🕒 ${t.noHistoryYet}</div>`;
      return;
    }

    historyList.innerHTML = history.map(item => `
      <div class="dict-list-item" data-word="${item.word}">
        <div class="dict-list-item-content">
          <div class="dict-list-word">${item.word}</div>
          <div class="dict-list-time">${new Date(item.timestamp).toLocaleDateString()}</div>
        </div>
        <button class="dict-list-search-btn" data-word="${item.word}">🔍</button>
      </div>
    `).join("");
  }

  function renderFavorites() {
    const t = translations[currentLang];
    const favoritesList = document.getElementById("dict-favorites-list");
    if (!favoritesList) return;

    if (favorites.length === 0) {
      favoritesList.innerHTML = `<div class="dict-empty-list">⭐ ${t.noFavoritesYet}</div>`;
      return;
    }

    favoritesList.innerHTML = favorites.map(item => `
      <div class="dict-list-item" data-word="${item.word}">
        <div class="dict-list-item-content">
          <div class="dict-list-word">${item.word}</div>
          <div class="dict-list-time">${new Date(item.timestamp).toLocaleDateString()}</div>
        </div>
        <div class="dict-list-actions">
          <button class="dict-list-search-btn" data-word="${item.word}">🔍</button>
          <button class="dict-list-remove-btn" data-word="${item.word}">×</button>
        </div>
      </div>
    `).join("");
  }

  function initializeEventListeners() {
    const input = document.getElementById("dict-input");
    const searchBtn = document.getElementById("dict-search");
    const clearBtn = document.getElementById("dict-clear");
    const langToggle = document.getElementById("dict-lang-toggle");
    const historyList = document.getElementById("dict-history-list");
    const favoritesList = document.getElementById("dict-favorites-list");
    const clearHistoryBtn = document.getElementById("dict-clear-history");
    const clearFavoritesBtn = document.getElementById("dict-clear-favorites");
    const tabs = document.querySelectorAll(".dict-tab");
    const tabContents = document.querySelectorAll(".dict-tab-content");

    // Language toggle
    langToggle.addEventListener("click", () => {
      currentLang = currentLang === 'en' ? 'id' : 'en';
      saveLanguage(currentLang);
      renderUI();
      showToast(currentLang === 'en' ? "🇬🇧 Switched to English" : "🇮🇩 Beralih ke Bahasa Indonesia");
    });

    // Search button
    searchBtn.addEventListener("click", () => {
      const word = input.value.trim();
      if (word) searchWord(word);
    });

    // Enter key
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const word = input.value.trim();
        if (word) searchWord(word);
      }
    });

    // Clear button visibility
    input.addEventListener("input", () => {
      clearBtn.style.display = input.value ? "block" : "none";
    });

    // Clear input
    clearBtn.addEventListener("click", () => {
      input.value = "";
      clearBtn.style.display = "none";
      input.focus();
    });

    // Tab navigation
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tabContents.forEach(tc => tc.classList.remove("active"));
        
        tab.classList.add("active");
        const tabName = tab.dataset.tab;
        document.getElementById(`dict-${tabName}-tab`).classList.add("active");
      });
    });

    // History list clicks
    historyList.addEventListener("click", (e) => {
      const searchBtn = e.target.closest(".dict-list-search-btn");
      if (searchBtn) {
        const word = searchBtn.dataset.word;
        input.value = word;
        searchWord(word);
        document.querySelector('[data-tab="result"]').click();
      }
    });

    // Favorites list clicks
    favoritesList.addEventListener("click", (e) => {
      const searchBtn = e.target.closest(".dict-list-search-btn");
      const removeBtn = e.target.closest(".dict-list-remove-btn");
      
      if (searchBtn) {
        const word = searchBtn.dataset.word;
        input.value = word;
        searchWord(word);
        document.querySelector('[data-tab="result"]').click();
      } else if (removeBtn) {
        const word = removeBtn.dataset.word;
        const fav = favorites.find(f => f.word === word);
        if (fav) toggleFavorite(word, fav.data);
      }
    });

    // Clear history
    clearHistoryBtn.addEventListener("click", () => {
      const t = translations[currentLang];
      if (confirm(t.clearHistoryConfirm)) {
        history = [];
        saveHistory(history);
        updateStats();
        renderHistory();
        showToast(t.historyCleared);
      }
    });

    // Clear favorites
    clearFavoritesBtn.addEventListener("click", () => {
      const t = translations[currentLang];
      if (confirm(t.clearFavoritesConfirm)) {
        favorites = [];
        saveFavorites(favorites);
        updateStats();
        renderFavorites();
        showToast(t.favoritesCleared);
      }
    });
  }

  renderUI();
}
