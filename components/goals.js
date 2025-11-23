import { refreshDashboard, showToast } from "../app.js";

const KEY = "aolt-goals";

function loadGoals() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveGoals(goals) {
  localStorage.setItem(KEY, JSON.stringify(goals));
}

export function initGoals() {
  const section = document.getElementById("goals");
  section.innerHTML = `
    <div class="goals-header">
      <div class="goals-header-content">
        <div class="goals-header-left">
          <div class="goals-icon">🎯</div>
          <div>
            <div class="goals-header-title">Goals Tracker</div>
            <div class="goals-header-subtitle">Tetapkan dan capai tujuan bulanan Anda</div>
          </div>
        </div>
        <button class="goals-add-btn" id="goals-toggle-form">
          <span>➕</span> Tambah Goal
        </button>
      </div>
    </div>

    <div class="goals-stats-row">
      <div class="goals-stat-card">
        <div class="goals-stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">📊</div>
        <div>
          <div class="goals-stat-value" id="goals-stat-total">0</div>
          <div class="goals-stat-label">Total Goals</div>
        </div>
      </div>
      <div class="goals-stat-card">
        <div class="goals-stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">✅</div>
        <div>
          <div class="goals-stat-value" id="goals-stat-completed">0</div>
          <div class="goals-stat-label">Completed</div>
        </div>
      </div>
      <div class="goals-stat-card">
        <div class="goals-stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">🔥</div>
        <div>
          <div class="goals-stat-value" id="goals-stat-progress">0%</div>
          <div class="goals-stat-label">Avg Progress</div>
        </div>
      </div>
    </div>

    <div class="goals-add-card" id="goals-form" style="display: none;">
      <div class="goals-form-header">
        <h3>Tambah Goal Baru</h3>
        <button class="goals-close-btn" id="goals-close-form">✕</button>
      </div>
      <div class="goals-form-body">
        <div class="goals-form-group">
          <label class="goals-form-label">Judul Goal</label>
          <input id="goal-title" class="goals-input" placeholder="Contoh: Baca 5 buku" />
        </div>
        <div class="goals-form-row">
          <div class="goals-form-group">
            <label class="goals-form-label">Target</label>
            <input id="goal-target" type="number" min="1" class="goals-input" placeholder="10" />
          </div>
          <div class="goals-form-group">
            <label class="goals-form-label">Kategori</label>
            <select id="goal-category" class="goals-input">
              <option value="personal">🌟 Personal</option>
              <option value="health">💪 Kesehatan</option>
              <option value="learning">📚 Belajar</option>
              <option value="work">💼 Pekerjaan</option>
              <option value="finance">💰 Keuangan</option>
              <option value="other">📌 Lainnya</option>
            </select>
          </div>
        </div>
        <button id="goal-add" class="goals-submit-btn">🎯 Tambah Goal</button>
      </div>
    </div>

    <div class="goals-list" id="goal-list"></div>
  `;

  const titleInput = document.getElementById("goal-title");
  const targetInput = document.getElementById("goal-target");
  const categoryInput = document.getElementById("goal-category");
  const addBtn = document.getElementById("goal-add");
  const listEl = document.getElementById("goal-list");
  const formEl = document.getElementById("goals-form");
  const toggleFormBtn = document.getElementById("goals-toggle-form");
  const closeFormBtn = document.getElementById("goals-close-form");

  const categoryIcons = {
    personal: "🌟",
    health: "💪",
    learning: "📚",
    work: "💼",
    finance: "💰",
    other: "📌"
  };

  const categoryColors = {
    personal: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    health: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    learning: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    work: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    finance: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    other: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
  };

  function updateStats() {
    const goals = loadGoals();
    const total = goals.length;
    const completed = goals.filter(g => g.current >= g.target).length;
    const avgProgress = total > 0 
      ? Math.round(goals.reduce((sum, g) => sum + Math.min(100, (g.current / g.target) * 100), 0) / total)
      : 0;

    document.getElementById("goals-stat-total").textContent = total;
    document.getElementById("goals-stat-completed").textContent = completed;
    document.getElementById("goals-stat-progress").textContent = avgProgress + "%";
  }

  function render() {
    const goals = loadGoals();
    
    if (goals.length === 0) {
      listEl.innerHTML = `
        <div class="goals-empty">
          <div class="goals-empty-icon">🎯</div>
          <div class="goals-empty-title">Belum Ada Goal</div>
          <div class="goals-empty-text">Mulai tetapkan tujuan bulanan Anda dan capai satu per satu!</div>
        </div>
      `;
      updateStats();
      return;
    }

    listEl.innerHTML = "";
    goals.forEach((g, index) => {
      const percent = g.target === 0 ? 0 : Math.min(100, Math.round((g.current / g.target) * 100));
      const isCompleted = g.current >= g.target;
      const category = g.category || "other";
      const circumference = 2 * Math.PI * 45;
      const offset = circumference - (percent / 100) * circumference;

      const card = document.createElement("div");
      card.className = `goals-card ${isCompleted ? "goals-card-completed" : ""}`;
      card.innerHTML = `
        <div class="goals-card-header">
          <div class="goals-card-category" style="background: ${categoryColors[category]};">
            ${categoryIcons[category]}
          </div>
          <button class="goals-card-delete" data-delete="${index}">🗑️</button>
        </div>
        
        <div class="goals-card-body">
          <svg class="goals-progress-ring" width="120" height="120">
            <circle cx="60" cy="60" r="45" stroke="#e5e7eb" stroke-width="8" fill="none"/>
            <circle cx="60" cy="60" r="45" 
              stroke="url(#goals-gradient-${index})" 
              stroke-width="8" 
              fill="none"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"
              stroke-linecap="round"
              transform="rotate(-90 60 60)"
              class="goals-progress-circle"/>
            <defs>
              <linearGradient id="goals-gradient-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
              </linearGradient>
            </defs>
            <text x="60" y="55" text-anchor="middle" class="goals-progress-percent">${percent}%</text>
            <text x="60" y="75" text-anchor="middle" class="goals-progress-label">${g.current}/${g.target}</text>
          </svg>
          
          <div class="goals-card-title">${g.title}</div>
          ${isCompleted ? '<div class="goals-completed-badge">✅ Selesai!</div>' : ''}
        </div>
        
        <div class="goals-card-actions">
          <button class="goals-action-btn goals-action-minus" data-minus="${index}">−</button>
          <button class="goals-action-btn goals-action-plus" data-plus="${index}">+</button>
        </div>
      `;
      listEl.appendChild(card);
    });

    updateStats();
  }

  toggleFormBtn.addEventListener("click", () => {
    formEl.style.display = formEl.style.display === "none" ? "block" : "none";
  });

  closeFormBtn.addEventListener("click", () => {
    formEl.style.display = "none";
  });

  addBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const target = Number(targetInput.value);
    const category = categoryInput.value;
    if (!title || !target || target < 1) {
      showToast("⚠️ Isi semua field dengan benar!");
      return;
    }
    const goals = loadGoals();
    goals.push({ title, target, current: 0, category });
    saveGoals(goals);
    refreshDashboard();
    titleInput.value = "";
    targetInput.value = "";
    categoryInput.value = "personal";
    formEl.style.display = "none";
    render();
    showToast("🎯 Goal berhasil ditambahkan!");
  });

  listEl.addEventListener("click", (e) => {
    const plus = e.target.dataset.plus;
    const minus = e.target.dataset.minus;
    const del = e.target.dataset.delete;
    const goals = loadGoals();
    
    if (plus !== undefined) {
      const i = Number(plus);
      goals[i].current += 1;
      const isNewlyCompleted = goals[i].current === goals[i].target;
      saveGoals(goals);
      refreshDashboard();
      render();
      if (isNewlyCompleted) {
        showToast("🎉 Goal tercapai! Selamat!");
      } else {
        showToast("📈 Progress +1");
      }
    } else if (minus !== undefined) {
      const i = Number(minus);
      if (goals[i].current > 0) {
        goals[i].current -= 1;
        saveGoals(goals);
        refreshDashboard();
        render();
        showToast("📉 Progress -1");
      }
    } else if (del !== undefined) {
      const i = Number(del);
      if (confirm("Hapus goal ini?")) {
        goals.splice(i, 1);
        saveGoals(goals);
        refreshDashboard();
        render();
        showToast("🗑️ Goal dihapus");
      }
    }
  });

  render();
}
