const KEY = "aolt-pomodoro";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { mode: "focus", secondsLeft: 25 * 60, running: false, sessions: 0, preset: "25-5" };
  } catch {
    return { mode: "focus", secondsLeft: 25 * 60, running: false, sessions: 0, preset: "25-5" };
  }
}

function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function initPomodoro() {
  const section = document.getElementById("pomodoro");
  section.innerHTML = `
    <div class="pomodoro-container">
      <div class="pomodoro-header">
        <div class="pomodoro-header-content">
          <div class="pomodoro-logo">⏱️</div>
          <div>
            <div class="pomodoro-header-title">Pomodoro Timer</div>
            <div class="pomodoro-header-subtitle">Teknik fokus yang terbukti meningkatkan produktivitas</div>
          </div>
        </div>
        <div class="pomodoro-stats">
          <div class="stat-mini">
            <div class="stat-mini-icon">🎯</div>
            <div class="stat-mini-content">
              <div class="stat-mini-value" id="pomodoro-sessions">0</div>
              <div class="stat-mini-label">Sesi Selesai</div>
            </div>
          </div>
        </div>
      </div>

      <div class="pomodoro-main-card">
        <div class="pomodoro-mode-badge" id="pomodoro-mode-badge">
          <span class="mode-icon" id="mode-icon">🔥</span>
          <span class="mode-text" id="mode-text">Sesi Fokus</span>
        </div>

        <div class="pomodoro-timer-ring">
          <svg width="320" height="320" viewBox="0 0 320 320" id="timer-svg">
            <defs>
              <linearGradient id="timer-gradient-focus" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
              </linearGradient>
              <linearGradient id="timer-gradient-break" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
              </linearGradient>
            </defs>
            <circle cx="160" cy="160" r="140" fill="none" stroke="rgba(148, 163, 184, 0.2)" stroke-width="12"/>
            <circle id="timer-progress-circle" cx="160" cy="160" r="140" fill="none" 
                    stroke="url(#timer-gradient-focus)" stroke-width="12" 
                    stroke-linecap="round" transform="rotate(-90 160 160)" 
                    stroke-dasharray="879.646" stroke-dashoffset="0"/>
          </svg>
          <div class="timer-content">
            <div class="timer-display" id="pomodoro-display">25:00</div>
            <div class="timer-label" id="timer-label">Siap untuk fokus?</div>
          </div>
        </div>

        <div class="pomodoro-controls">
          <button class="pomodoro-btn pomodoro-btn-primary" id="pomodoro-toggle">
            <span class="btn-icon" id="toggle-icon">▶️</span>
            <span id="toggle-text">Mulai Sesi</span>
          </button>
          <button class="pomodoro-btn pomodoro-btn-secondary" id="pomodoro-reset">
            <span class="btn-icon">🔄</span>
            <span>Reset</span>
          </button>
          <button class="pomodoro-btn pomodoro-btn-secondary" id="pomodoro-skip">
            <span class="btn-icon">⏭️</span>
            <span>Skip</span>
          </button>
        </div>
      </div>

      <div class="pomodoro-presets-card">
        <div class="presets-header">
          <span class="presets-icon">⚙️</span>
          <span class="presets-title">Pilih Durasi Sesi</span>
        </div>
        <div class="presets-grid" id="pomodoro-preset">
          <button class="preset-btn active" data-preset="25-5">
            <div class="preset-main">25 menit</div>
            <div class="preset-sub">Fokus / 5 min istirahat</div>
          </button>
          <button class="preset-btn" data-preset="50-10">
            <div class="preset-main">50 menit</div>
            <div class="preset-sub">Fokus / 10 min istirahat</div>
          </button>
          <button class="preset-btn" data-preset="90-20">
            <div class="preset-main">90 menit</div>
            <div class="preset-sub">Fokus / 20 min istirahat</div>
          </button>
        </div>
      </div>

      <div class="pomodoro-tips-card">
        <div class="tips-header">
          <span class="tips-icon">💡</span>
          <span class="tips-title">Tips Produktif</span>
        </div>
        <div class="tips-content">
          <div class="tip-item">
            <span class="tip-bullet">1️⃣</span>
            <span class="tip-text">Eliminasi semua distraksi sebelum mulai sesi fokus</span>
          </div>
          <div class="tip-item">
            <span class="tip-bullet">2️⃣</span>
            <span class="tip-text">Gunakan waktu istirahat untuk bangun dan bergerak</span>
          </div>
          <div class="tip-item">
            <span class="tip-bullet">3️⃣</span>
            <span class="tip-text">Setelah 4 sesi, ambil istirahat panjang 15-30 menit</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const display = document.getElementById("pomodoro-display");
  const toggleBtn = document.getElementById("pomodoro-toggle");
  const toggleText = document.getElementById("toggle-text");
  const toggleIcon = document.getElementById("toggle-icon");
  const resetBtn = document.getElementById("pomodoro-reset");
  const skipBtn = document.getElementById("pomodoro-skip");
  const presetSwitch = document.getElementById("pomodoro-preset");
  const sessionsDisplay = document.getElementById("pomodoro-sessions");
  const modeBadge = document.getElementById("pomodoro-mode-badge");
  const modeIcon = document.getElementById("mode-icon");
  const modeText = document.getElementById("mode-text");
  const timerLabel = document.getElementById("timer-label");
  const progressCircle = document.getElementById("timer-progress-circle");
  const timerSvg = document.getElementById("timer-svg");

  let state = loadState();
  let timer = null;
  let totalSeconds = state.secondsLeft;

  function format(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  function updateProgress() {
    const circumference = 879.646;
    const percent = totalSeconds > 0 ? (state.secondsLeft / totalSeconds) : 0;
    const offset = circumference * (1 - percent);
    progressCircle.style.strokeDashoffset = offset;
    progressCircle.style.transition = "stroke-dashoffset 0.3s ease";
  }

  function updateView() {
    display.textContent = format(state.secondsLeft);
    if (!state.sessions) state.sessions = 0;
    sessionsDisplay.textContent = state.sessions;
    
    // Update mode badge and colors
    if (state.mode === "focus") {
      modeBadge.className = "pomodoro-mode-badge mode-focus";
      modeIcon.textContent = "🔥";
      modeText.textContent = "Sesi Fokus";
      progressCircle.setAttribute("stroke", "url(#timer-gradient-focus)");
      if (state.running) {
        timerLabel.textContent = "Tetap fokus, kamu bisa!";
      } else {
        timerLabel.textContent = state.secondsLeft === totalSeconds ? "Siap untuk fokus?" : "Lanjutkan sesi fokus";
      }
    } else {
      modeBadge.className = "pomodoro-mode-badge mode-break";
      modeIcon.textContent = "☕";
      modeText.textContent = "Waktu Istirahat";
      progressCircle.setAttribute("stroke", "url(#timer-gradient-break)");
      if (state.running) {
        timerLabel.textContent = "Santai sejenak, kamu hebat!";
      } else {
        timerLabel.textContent = "Ambil napas dalam";
      }
    }
    
    // Update button
    if (state.running) {
      toggleText.textContent = "Jeda";
      toggleIcon.textContent = "⏸️";
      toggleBtn.classList.add("btn-running");
    } else {
      toggleText.textContent = state.secondsLeft === totalSeconds ? "Mulai Sesi" : "Lanjutkan";
      toggleIcon.textContent = "▶️";
      toggleBtn.classList.remove("btn-running");
    }
    
    updateProgress();
  }

  function switchMode() {
    if (state.mode === "focus") {
      state.mode = "break";
      const [focus, brk] = (state.preset || "25-5").split("-").map((n) => Number(n));
      state.secondsLeft = (brk || 5) * 60;
      totalSeconds = state.secondsLeft;
      state.sessions = (state.sessions || 0) + 1;
      // Notifikasi sesi selesai
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("🎉 Sesi Fokus Selesai!", {
          body: "Waktunya istirahat sejenak. Kamu hebat!",
          icon: "⏱️"
        });
      }
    } else {
      state.mode = "focus";
      const [focus] = (state.preset || "25-5").split("-").map((n) => Number(n));
      state.secondsLeft = (focus || 25) * 60;
      totalSeconds = state.secondsLeft;
      // Notifikasi istirahat selesai
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("⏱️ Istirahat Selesai!", {
          body: "Mari kembali fokus untuk sesi berikutnya!",
          icon: "🔥"
        });
      }
    }
  }

  function tick() {
    if (!state.running) return;
    if (state.secondsLeft <= 0) {
      switchMode();
    } else {
      state.secondsLeft -= 1;
    }
    saveState(state);
    updateView();
  }

  // Request notification permission
  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    Notification.requestPermission();
  }

  toggleBtn.addEventListener("click", () => {
    state.running = !state.running;
    saveState(state);
    updateView();
  });

  resetBtn.addEventListener("click", () => {
    const [focus] = (state.preset || "25-5").split("-").map((n) => Number(n));
    state = { 
      mode: "focus", 
      secondsLeft: focus * 60, 
      running: false, 
      sessions: state.sessions || 0, 
      preset: state.preset || "25-5" 
    };
    totalSeconds = state.secondsLeft;
    saveState(state);
    updateView();
  });

  skipBtn.addEventListener("click", () => {
    if (confirm(`Skip ${state.mode === "focus" ? "sesi fokus" : "istirahat"} ini?`)) {
      state.secondsLeft = 0;
      tick();
      updateView();
    }
  });

  presetSwitch.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-preset]");
    if (!btn) return;
    const preset = btn.dataset.preset;
    state.preset = preset;
    const [focus] = preset.split("-").map((n) => Number(n));
    state.mode = "focus";
    state.secondsLeft = (focus || 25) * 60;
    totalSeconds = state.secondsLeft;
    state.running = false;
    saveState(state);
    presetSwitch.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    updateView();
  });

  // Set initial total seconds
  totalSeconds = state.secondsLeft;
  updateView();
  timer = setInterval(tick, 1000);
}
