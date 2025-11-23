import { refreshDashboard, showToast } from "../app.js";

const KEY = "aolt-habits";
const LAST_RESET_KEY = "aolt-habits-last-reset";

function loadHabits() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveHabits(habits) {
  localStorage.setItem(KEY, JSON.stringify(habits));
  refreshDashboard();
}

function getLastResetDate() {
  return localStorage.getItem(LAST_RESET_KEY) || null;
}

function setLastResetDate(dateStr) {
  localStorage.setItem(LAST_RESET_KEY, dateStr);
}

function getTodayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function checkAndAutoReset() {
  const today = getTodayDateStr();
  const lastReset = getLastResetDate();
  
  // Jika tidak ada reset sebelumnya atau tanggal berbeda, reset otomatis
  if (!lastReset || lastReset !== today) {
    const habits = loadHabits();
    if (habits.length > 0) {
      let needReset = false;
      habits.forEach((h) => {
        if (h.doneToday) {
          h.doneToday = false;
          needReset = true;
        }
      });
      
      if (needReset) {
        saveHabits(habits);
        setLastResetDate(today);
        showToast("🌅 Hari baru! Status kebiasaan direset otomatis.", "success");
        return true;
      }
    }
    setLastResetDate(today);
  }
  return false;
}

export function getHabitSummary() {
  const habits = loadHabits();
  const total = habits.length;
  const done = habits.filter((h) => h.doneToday).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent };
}

export function initHabit() {
  const section = document.getElementById("habit");
  section.innerHTML = `
    <div class="habit-header">
      <div class="habit-header-left">
        <div class="habit-icon">⭐</div>
        <div>
          <div class="habit-header-title">Habit Tracker</div>
          <div class="habit-header-subtitle">Bangun kebiasaan baik, satu hari dalam satu waktu</div>
        </div>
      </div>
      <div class="habit-progress-ring" id="habit-progress-ring">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="8"/>
          <circle id="habit-progress-circle" cx="60" cy="60" r="54" fill="none" stroke="url(#gradient)" stroke-width="8" 
                  stroke-linecap="round" transform="rotate(-90 60 60)" 
                  stroke-dasharray="339.292" stroke-dashoffset="339.292"/>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
        <div class="progress-ring-text">
          <div class="progress-ring-percent" id="habit-percent">0%</div>
          <div class="progress-ring-label">Selesai</div>
        </div>
      </div>
    </div>

    <div class="habit-stats-row">
      <div class="habit-stat-card stat-purple">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <div class="stat-number" id="habit-stat-total">0</div>
          <div class="stat-text">Total Habit</div>
        </div>
      </div>
      <div class="habit-stat-card stat-green">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-number" id="habit-stat-done">0</div>
          <div class="stat-text">Selesai Hari Ini</div>
        </div>
      </div>
      <div class="habit-stat-card stat-orange">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <div class="stat-number" id="habit-stat-streak">0</div>
          <div class="stat-text">Hari Berturut</div>
        </div>
      </div>
    </div>

    <div class="habit-add-section">
      <div class="habit-add-header">
        <span class="add-icon">✨</span>
        <span class="add-title">Tambah Kebiasaan Baru</span>
      </div>
      <div class="habit-add-body">
        <div class="habit-input-wrapper">
          <span class="input-icon">⭐</span>
          <input id="habit-name" class="habit-input" placeholder="Contoh: Berolahraga 30 menit, Membaca buku, Meditasi..." />
        </div>
        <button id="habit-add" class="habit-btn-add">
          <span class="btn-icon">➕</span>
          <span>Tambah Habit</span>
        </button>
      </div>
      <div class="habit-tips">
        <span class="tip-icon">💡</span>
        <span class="tip-text">Tips: Mulai dengan 3-5 kebiasaan sederhana yang bisa dilakukan setiap hari</span>
      </div>
    </div>

    <div class="habit-list-section">
      <div class="habit-list-header">
        <div class="list-header-left">
          <span class="list-icon">📋</span>
          <span class="list-title">Kebiasaan Harian Saya</span>
          <span class="habit-count" id="habit-count">0 habit</span>
        </div>
        <div class="habit-header-right">
          <div class="habit-date-indicator" id="habit-date-indicator">
            <span class="date-icon">📅</span>
            <span class="date-text" id="habit-date-text">Hari ini</span>
          </div>
          <button id="habit-reset" class="btn-reset">
            <span>🌅</span>
            <span>Reset Hari Baru</span>
          </button>
        </div>
      </div>
      <div id="habit-empty-state" class="habit-empty">
        <div class="empty-illustration">🌱</div>
        <div class="empty-title">Mulai Perjalanan Kebiasaan Anda</div>
        <div class="empty-subtitle">Tambahkan kebiasaan pertama dan lihat transformasi hidup Anda!</div>
      </div>
      <div id="habit-list" class="habit-list"></div>
    </div>
  `;

  const nameInput = document.getElementById("habit-name");
  const addBtn = document.getElementById("habit-add");
  const listEl = document.getElementById("habit-list");
  const resetBtn = document.getElementById("habit-reset");
  const emptyState = document.getElementById("habit-empty-state");
  const progressCircle = document.getElementById("habit-progress-circle");
  const percentText = document.getElementById("habit-percent");
  const statTotal = document.getElementById("habit-stat-total");
  const statDone = document.getElementById("habit-stat-done");
  const statStreak = document.getElementById("habit-stat-streak");
  const habitCount = document.getElementById("habit-count");
  const dateText = document.getElementById("habit-date-text");

  // Auto-reset saat halaman dimuat jika sudah ganti hari
  const wasReset = checkAndAutoReset();

  function updateDateIndicator() {
    const today = new Date();
    const formatted = today.toLocaleDateString("id-ID", { 
      weekday: "long", 
      day: "numeric", 
      month: "long" 
    });
    dateText.textContent = formatted;
  }

  function updateProgress(percent) {
    const circumference = 339.292;
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
    progressCircle.style.transition = "stroke-dashoffset 0.5s ease";
    percentText.textContent = `${percent}%`;
  }

  function render() {
    const habits = loadHabits();
    const total = habits.length;
    const done = habits.filter(h => h.doneToday).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    
    // Update stats
    statTotal.textContent = total;
    statDone.textContent = done;
    statStreak.textContent = "0"; // Placeholder for streak feature
    habitCount.textContent = `${total} habit${total !== 1 ? 's' : ''}`;
    updateProgress(percent);
    updateDateIndicator();

    if (total === 0) {
      emptyState.style.display = "flex";
      listEl.style.display = "none";
      return;
    }

    emptyState.style.display = "none";
    listEl.style.display = "flex";
    listEl.innerHTML = "";

    habits.forEach((habit, index) => {
      const card = document.createElement("div");
      card.className = `habit-card ${habit.doneToday ? "habit-card-completed" : ""}`;
      card.innerHTML = `
        <div class="habit-card-left">
          <label class="habit-checkbox-container">
            <input type="checkbox" class="habit-checkbox" ${habit.doneToday ? "checked" : ""} data-index="${index}" />
            <span class="habit-checkmark">
              <span class="checkmark-icon">${habit.doneToday ? "✓" : ""}</span>
            </span>
          </label>
          <div class="habit-info">
            <div class="habit-name">${habit.name}</div>
            <div class="habit-status">
              ${habit.doneToday 
                ? '<span class="status-badge status-done">✅ Selesai hari ini</span>' 
                : '<span class="status-badge status-pending">⏳ Belum selesai</span>'}
            </div>
          </div>
        </div>
        <div class="habit-card-actions">
          <button class="habit-action-btn habit-edit-btn" data-edit="${index}" title="Edit">
            ✏️
          </button>
          <button class="habit-action-btn habit-delete-btn" data-delete="${index}" title="Hapus">
            🗑️
          </button>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) {
      showToast("Isi nama kebiasaan terlebih dahulu.", "danger");
      nameInput.focus();
      return;
    }
    const habits = loadHabits();
    habits.push({ name, doneToday: false });
    saveHabits(habits);
    nameInput.value = "";
    showToast("⭐ Kebiasaan baru berhasil ditambahkan!", "success");
    render();
  });

  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBtn.click();
    }
  });

  listEl.addEventListener("click", (e) => {
    const checkbox = e.target.closest("input[type=checkbox]");
    const deleteBtn = e.target.closest("[data-delete]");
    const editBtn = e.target.closest("[data-edit]");

    if (checkbox) {
      const index = Number(checkbox.dataset.index);
      const habits = loadHabits();
      habits[index].doneToday = checkbox.checked;
      saveHabits(habits);
      showToast(
        checkbox.checked 
          ? "🎉 Hebat! Kebiasaan selesai!" 
          : "↩️ Kebiasaan dibuka kembali",
        "success"
      );
      render();
    } else if (deleteBtn) {
      const index = Number(deleteBtn.dataset.delete);
      const habits = loadHabits();
      if (confirm(`Hapus kebiasaan "${habits[index].name}"?`)) {
        habits.splice(index, 1);
        saveHabits(habits);
        showToast("🗑️ Kebiasaan dihapus!", "success");
        render();
      }
    } else if (editBtn) {
      const index = Number(editBtn.dataset.edit);
      const habits = loadHabits();
      const newName = prompt("Edit kebiasaan:", habits[index].name);
      if (newName !== null && newName.trim()) {
        habits[index].name = newName.trim();
        saveHabits(habits);
        showToast("✏️ Kebiasaan diperbarui!", "success");
        render();
      }
    }
  });

  resetBtn.addEventListener("click", () => {
    const habits = loadHabits();
    if (habits.length === 0) {
      showToast("Belum ada kebiasaan untuk direset.", "danger");
      return;
    }
    if (confirm("Reset semua kebiasaan untuk hari baru?")) {
      habits.forEach((h) => {
        h.doneToday = false;
      });
      saveHabits(habits);
      setLastResetDate(getTodayDateStr());
      showToast("🌅 Status kebiasaan direset. Semangat hari baru!", "success");
      render();
    }
  });

  // Cek setiap 1 menit apakah sudah ganti hari (untuk tab yang dibuka lama)
  const autoResetInterval = setInterval(() => {
    const wasReset = checkAndAutoReset();
    if (wasReset) {
      render();
    }
  }, 60000); // 60 detik = 1 menit

  // Cleanup interval saat section tidak aktif (opsional, untuk performa)
  section.dataset.cleanupInterval = autoResetInterval;

  render();
}
