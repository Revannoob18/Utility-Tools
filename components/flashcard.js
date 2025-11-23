import { refreshDashboard, showToast } from "../app.js";

const KEY = "aolt-flashcards";
const SESSION_KEY = "aolt-flashcard-session";

function loadCards() {
  try {
    const cards = JSON.parse(localStorage.getItem(KEY)) || [];
    // Migrate old cards to new format
    return cards.map(card => ({
      front: card.front,
      back: card.back,
      category: card.category || "general",
      mastery: card.mastery || 0,
      lastReviewed: card.lastReviewed || null,
      correctCount: card.correctCount || 0,
      wrongCount: card.wrongCount || 0
    }));
  } catch {
    return [];
  }
}

function saveCards(cards) {
  localStorage.setItem(KEY, JSON.stringify(cards));
}

export function initFlashcard() {
  const section = document.getElementById("flashcard");
  section.innerHTML = `
    <div class="flashcard-header">
      <div class="flashcard-header-content">
        <div class="flashcard-header-left">
          <div class="flashcard-icon">🎴</div>
          <div>
            <div class="flashcard-header-title">Flashcard Studio</div>
            <div class="flashcard-header-subtitle">Belajar cerdas dengan sistem mastery</div>
          </div>
        </div>
        <div class="flashcard-header-actions">
          <button class="flashcard-mode-btn" id="fc-toggle-form">
            <span>➕</span> Buat Kartu
          </button>
          <button class="flashcard-mode-btn" id="fc-study-mode">
            <span>🎯</span> Study Mode
          </button>
        </div>
      </div>
    </div>

    <div class="flashcard-stats-row">
      <div class="flashcard-stat-card">
        <div class="flashcard-stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">📊</div>
        <div>
          <div class="flashcard-stat-value" id="fc-stat-total">0</div>
          <div class="flashcard-stat-label">Total Cards</div>
        </div>
      </div>
      <div class="flashcard-stat-card">
        <div class="flashcard-stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">⭐</div>
        <div>
          <div class="flashcard-stat-value" id="fc-stat-mastered">0</div>
          <div class="flashcard-stat-label">Mastered</div>
        </div>
      </div>
      <div class="flashcard-stat-card">
        <div class="flashcard-stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">🔥</div>
        <div>
          <div class="flashcard-stat-value" id="fc-stat-streak">0%</div>
          <div class="flashcard-stat-label">Accuracy</div>
        </div>
      </div>
    </div>

    <div class="flashcard-add-form" id="fc-form" style="display: none;">
      <div class="flashcard-form-header">
        <h3>✨ Buat Flashcard Baru</h3>
        <button class="flashcard-close-btn" id="fc-close-form">✕</button>
      </div>
      <div class="flashcard-form-body">
        <div class="flashcard-form-row">
          <div class="flashcard-form-group">
            <label class="flashcard-form-label">🎴 Depan (Pertanyaan/Term)</label>
            <textarea id="fc-front" class="flashcard-textarea" rows="3" placeholder="Contoh: Apa itu OOP?"></textarea>
          </div>
        </div>
        <div class="flashcard-form-row">
          <div class="flashcard-form-group">
            <label class="flashcard-form-label">💡 Belakang (Jawaban/Definisi)</label>
            <textarea id="fc-back" class="flashcard-textarea" rows="4" placeholder="Contoh: Object-Oriented Programming adalah..."></textarea>
          </div>
        </div>
        <div class="flashcard-form-row">
          <div class="flashcard-form-group">
            <label class="flashcard-form-label">📚 Kategori</label>
            <select id="fc-category" class="flashcard-input">
              <option value="general">📌 General</option>
              <option value="programming">💻 Programming</option>
              <option value="language">🌎 Language</option>
              <option value="science">🧪 Science</option>
              <option value="math">🔢 Math</option>
              <option value="history">📜 History</option>
              <option value="other">✨ Other</option>
            </select>
          </div>
        </div>
        <button id="fc-add" class="flashcard-submit-btn">🎯 Tambah Flashcard</button>
      </div>
    </div>

    <div class="flashcard-filters">
      <div class="flashcard-filter-group">
        <button class="flashcard-filter-btn active" data-category="all">All</button>
        <button class="flashcard-filter-btn" data-category="general">General</button>
        <button class="flashcard-filter-btn" data-category="programming">Programming</button>
        <button class="flashcard-filter-btn" data-category="language">Language</button>
        <button class="flashcard-filter-btn" data-category="science">Science</button>
      </div>
    </div>

    <div class="flashcard-study-container">
      <div class="flashcard-controls">
        <button class="flashcard-control-btn" id="fc-prev">
          <span>◀</span> Previous
        </button>
        <div class="flashcard-counter" id="fc-counter">0 / 0</div>
        <button class="flashcard-control-btn" id="fc-next">
          Next <span>▶</span>
        </button>
      </div>

      <div class="flashcard-3d-container" id="fc-3d-container">
        <div class="flashcard-card" id="fc-card">
          <div class="flashcard-face flashcard-front">
            <div class="flashcard-face-label">QUESTION</div>
            <div class="flashcard-face-content" id="fc-front-content">Klik kartu untuk membalik</div>
            <div class="flashcard-tap-hint">👆 Tap to flip</div>
          </div>
          <div class="flashcard-face flashcard-back">
            <div class="flashcard-face-label">ANSWER</div>
            <div class="flashcard-face-content" id="fc-back-content"></div>
            <div class="flashcard-tap-hint">👆 Tap to flip</div>
          </div>
        </div>
        <div class="flashcard-category-badge" id="fc-category-badge"></div>
        <div class="flashcard-mastery-indicator" id="fc-mastery"></div>
      </div>

      <div class="flashcard-actions" id="fc-actions">
        <button class="flashcard-action-btn flashcard-btn-wrong" id="fc-wrong">
          <span>❌</span>
          <div>Hard</div>
        </button>
        <button class="flashcard-action-btn flashcard-btn-okay" id="fc-okay">
          <span>🔄</span>
          <div>Good</div>
        </button>
        <button class="flashcard-action-btn flashcard-btn-correct" id="fc-correct">
          <span>✅</span>
          <div>Easy</div>
        </button>
      </div>

      <div class="flashcard-extra-controls">
        <button class="flashcard-extra-btn" id="fc-shuffle">
          <span>🔀</span> Shuffle
        </button>
        <button class="flashcard-extra-btn" id="fc-delete">
          <span>🗑️</span> Delete
        </button>
        <button class="flashcard-extra-btn" id="fc-edit">
          <span>✏️</span> Edit
        </button>
      </div>
    </div>
  `;

  const frontInput = document.getElementById("fc-front");
  const backInput = document.getElementById("fc-back");
  const categoryInput = document.getElementById("fc-category");
  const addBtn = document.getElementById("fc-add");
  const prevBtn = document.getElementById("fc-prev");
  const nextBtn = document.getElementById("fc-next");
  const shuffleBtn = document.getElementById("fc-shuffle");
  const deleteBtn = document.getElementById("fc-delete");
  const editBtn = document.getElementById("fc-edit");
  const cardEl = document.getElementById("fc-card");
  const frontContentEl = document.getElementById("fc-front-content");
  const backContentEl = document.getElementById("fc-back-content");
  const counterEl = document.getElementById("fc-counter");
  const categoryBadgeEl = document.getElementById("fc-category-badge");
  const masteryEl = document.getElementById("fc-mastery");
  const formEl = document.getElementById("fc-form");
  const toggleFormBtn = document.getElementById("fc-toggle-form");
  const closeFormBtn = document.getElementById("fc-close-form");
  const wrongBtn = document.getElementById("fc-wrong");
  const okayBtn = document.getElementById("fc-okay");
  const correctBtn = document.getElementById("fc-correct");
  const filterBtns = document.querySelectorAll(".flashcard-filter-btn");

  let cards = loadCards();
  let filteredCards = [...cards];
  let index = 0;
  let showingFront = true;
  let currentFilter = "all";

  const categoryIcons = {
    general: "📌",
    programming: "💻",
    language: "🌎",
    science: "🧪",
    math: "🔢",
    history: "📜",
    other: "✨"
  };

  function updateStats() {
    const total = cards.length;
    const mastered = cards.filter(c => c.mastery >= 3).length;
    const totalReviews = cards.reduce((sum, c) => sum + c.correctCount + c.wrongCount, 0);
    const correctReviews = cards.reduce((sum, c) => sum + c.correctCount, 0);
    const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

    document.getElementById("fc-stat-total").textContent = total;
    document.getElementById("fc-stat-mastered").textContent = mastered;
    document.getElementById("fc-stat-streak").textContent = accuracy + "%";
  }

  function filterCards() {
    if (currentFilter === "all") {
      filteredCards = [...cards];
    } else {
      filteredCards = cards.filter(c => c.category === currentFilter);
    }
    if (index >= filteredCards.length) index = Math.max(0, filteredCards.length - 1);
  }

  function render() {
    if (filteredCards.length === 0) {
      frontContentEl.textContent = "Belum ada kartu. Buat kartu pertamamu!";
      backContentEl.textContent = "";
      counterEl.textContent = "0 / 0";
      categoryBadgeEl.textContent = "";
      masteryEl.innerHTML = "";
      cardEl.classList.remove("flipped");
      return;
    }

    const card = filteredCards[index];
    frontContentEl.textContent = card.front;
    backContentEl.textContent = card.back;
    counterEl.textContent = `${index + 1} / ${filteredCards.length}`;
    
    const categoryIcon = categoryIcons[card.category] || "📌";
    categoryBadgeEl.textContent = `${categoryIcon} ${card.category}`;
    
    // Mastery stars
    const stars = Array(5).fill(0).map((_, i) => 
      i < card.mastery ? "⭐" : "☆"
    ).join("");
    masteryEl.innerHTML = `<div class="flashcard-mastery-label">Mastery</div><div class="flashcard-mastery-stars">${stars}</div>`;
    
    // Reset flip state
    if (showingFront) {
      cardEl.classList.remove("flipped");
    } else {
      cardEl.classList.add("flipped");
    }
    
    updateStats();
  }

  toggleFormBtn.addEventListener("click", () => {
    formEl.style.display = formEl.style.display === "none" ? "block" : "none";
  });

  closeFormBtn.addEventListener("click", () => {
    formEl.style.display = "none";
  });

  addBtn.addEventListener("click", () => {
    const front = frontInput.value.trim();
    const back = backInput.value.trim();
    const category = categoryInput.value;
    
    if (!front || !back) {
      showToast("⚠️ Isi pertanyaan dan jawaban!");
      return;
    }
    
    cards.push({ 
      front, 
      back, 
      category,
      mastery: 0,
      lastReviewed: null,
      correctCount: 0,
      wrongCount: 0
    });
    saveCards(cards);
    refreshDashboard();
    
    frontInput.value = "";
    backInput.value = "";
    categoryInput.value = "general";
    formEl.style.display = "none";
    
    filterCards();
    index = filteredCards.length - 1;
    showingFront = true;
    render();
    showToast("🎉 Flashcard berhasil ditambahkan!");
  });

  prevBtn.addEventListener("click", () => {
    if (filteredCards.length === 0) return;
    index = (index - 1 + filteredCards.length) % filteredCards.length;
    showingFront = true;
    render();
  });

  nextBtn.addEventListener("click", () => {
    if (filteredCards.length === 0) return;
    index = (index + 1) % filteredCards.length;
    showingFront = true;
    render();
  });

  shuffleBtn.addEventListener("click", () => {
    if (cards.length === 0) return;
    for (let i = cards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    saveCards(cards);
    filterCards();
    index = 0;
    showingFront = true;
    render();
    showToast("🔀 Cards shuffled!");
  });

  deleteBtn.addEventListener("click", () => {
    if (filteredCards.length === 0) return;
    if (!confirm("Hapus flashcard ini?")) return;
    
    const cardToDelete = filteredCards[index];
    const originalIndex = cards.indexOf(cardToDelete);
    cards.splice(originalIndex, 1);
    saveCards(cards);
    refreshDashboard();
    
    filterCards();
    if (index >= filteredCards.length) index = Math.max(0, filteredCards.length - 1);
    showingFront = true;
    render();
    showToast("🗑️ Flashcard dihapus");
  });

  cardEl.addEventListener("click", () => {
    if (filteredCards.length === 0) return;
    showingFront = !showingFront;
    cardEl.classList.toggle("flipped");
  });

  // Mastery buttons
  wrongBtn.addEventListener("click", () => {
    if (filteredCards.length === 0) return;
    const card = filteredCards[index];
    card.wrongCount++;
    card.mastery = Math.max(0, card.mastery - 1);
    card.lastReviewed = new Date().toISOString();
    saveCards(cards);
    refreshDashboard();
    showToast("💪 Keep practicing!");
    nextBtn.click();
  });

  okayBtn.addEventListener("click", () => {
    if (filteredCards.length === 0) return;
    const card = filteredCards[index];
    card.correctCount++;
    card.lastReviewed = new Date().toISOString();
    saveCards(cards);
    refreshDashboard();
    showToast("👍 Good job!");
    nextBtn.click();
  });

  correctBtn.addEventListener("click", () => {
    if (filteredCards.length === 0) return;
    const card = filteredCards[index];
    card.correctCount++;
    card.mastery = Math.min(5, card.mastery + 1);
    card.lastReviewed = new Date().toISOString();
    saveCards(cards);
    refreshDashboard();
    
    if (card.mastery === 5) {
      showToast("🎉 Mastered! Perfect!");
    } else {
      showToast("✨ Excellent!");
    }
    nextBtn.click();
  });

  // Category filters
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.category;
      filterCards();
      index = 0;
      showingFront = true;
      render();
    });
  });

  filterCards();
  render();
}
