import { refreshDashboard, showToast } from "../app.js";

const KEY = "aolt-water";
const HISTORY_KEY = "aolt-water-history";

function loadWater() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { target: 8, current: 0, lastReset: new Date().toISOString().slice(0, 10) };
  } catch {
    return { target: 8, current: 0, lastReset: new Date().toISOString().slice(0, 10) };
  }
}

function saveWater(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  refreshDashboard();
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

export function getWaterSummary() {
  const { target, current } = loadWater();
  const percent = target === 0 ? 0 : Math.min(100, Math.round((current / target) * 100));
  return { target, current, percent };
}

export function initWater() {
  const section = document.getElementById("water");
  
  section.innerHTML = `
    <div class="water-container">
      <!-- Header -->
      <div class="water-header">
        <div class="water-header-content">
          <div class="water-header-left">
            <div class="water-icon">💧</div>
            <div>
              <div class="water-header-title">Water Intake Tracker</div>
              <div class="water-header-subtitle">Tetap terhidrasi dengan baik setiap hari</div>
            </div>
          </div>
          <div class="water-stats">
            <div class="water-stat-card">
              <div class="water-stat-icon">🎯</div>
              <div class="water-stat-content">
                <div class="water-stat-value" id="water-target-display">8</div>
                <div class="water-stat-label">Target Gelas</div>
              </div>
            </div>
            <div class="water-stat-card">
              <div class="water-stat-icon">✅</div>
              <div class="water-stat-content">
                <div class="water-stat-value" id="water-current-display">0</div>
                <div class="water-stat-label">Sudah Minum</div>
              </div>
            </div>
            <div class="water-stat-card">
              <div class="water-stat-icon">📊</div>
              <div class="water-stat-content">
                <div class="water-stat-value" id="water-percent-display">0%</div>
                <div class="water-stat-label">Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="water-main-grid">
        <!-- Water Tracker -->
        <div class="water-tracker-card">
          <div class="water-panel-header">
            <span class="water-panel-icon">💧</span>
            <span class="water-panel-title">Tracker Hari Ini</span>
          </div>
          
          <div class="water-tracker-content">
            <!-- Big Water Glass -->
            <div class="water-glass-container">
              <div class="water-glass">
                <div class="water-glass-fill" id="water-glass-fill">
                  <div class="water-wave"></div>
                  <div class="water-wave wave-2"></div>
                </div>
                <div class="water-glass-text" id="water-glass-text">0/8</div>
              </div>
              <div class="water-glass-label">Gelas Air</div>
            </div>

            <!-- Quick Actions -->
            <div class="water-actions">
              <button class="water-btn-primary" id="add-water-btn">
                <span>💧</span>
                <span>+ 1 Gelas</span>
              </button>
              
              <div class="water-quick-add">
                <button class="water-quick-btn" data-amount="0.5">
                  <span>💧</span>
                  <span>+½</span>
                </button>
                <button class="water-quick-btn" data-amount="2">
                  <span>💧💧</span>
                  <span>+2</span>
                </button>
                <button class="water-quick-btn" data-amount="3">
                  <span>💧💧💧</span>
                  <span>+3</span>
                </button>
              </div>

              <button class="water-btn-secondary" id="remove-water-btn">
                <span>➖</span>
                <span>-1 Gelas</span>
              </button>

              <button class="water-btn-reset" id="reset-water-btn">
                <span>🔄</span>
                <span>Reset Hari Ini</span>
              </button>
            </div>

            <!-- Progress Info -->
            <div class="water-progress-info">
              <div class="water-progress-bar">
                <div class="water-progress-fill" id="water-progress-fill"></div>
              </div>
              <div class="water-progress-text" id="water-progress-text">
                <span id="water-ml-current">0</span> ml / <span id="water-ml-target">2000</span> ml
              </div>
            </div>

            <!-- Reminder Message -->
            <div class="water-reminder" id="water-reminder">
              <div class="water-reminder-icon">💡</div>
              <div class="water-reminder-text">Mulai hari dengan 1-2 gelas air!</div>
            </div>
          </div>
        </div>

        <!-- Settings & History -->
        <div class="water-side-panel">
          <!-- Settings -->
          <div class="water-settings-card">
            <div class="water-panel-header">
              <span class="water-panel-icon">⚙️</span>
              <span class="water-panel-title">Pengaturan</span>
            </div>
            <div class="water-settings-content">
              <div class="water-form-group">
                <label class="water-label">
                  <span class="water-label-icon">🎯</span>
                  <span>Target Gelas Per Hari</span>
                </label>
                <div class="water-target-control">
                  <button class="water-target-btn" id="decrease-target">➖</button>
                  <input 
                    type="number" 
                    id="water-target-input" 
                    class="water-input-target" 
                    min="1" 
                    max="20"
                    value="8"
                  />
                  <button class="water-target-btn" id="increase-target">➕</button>
                </div>
                <div class="water-target-hint">
                  💧 1 gelas ≈ 250ml | Rekomendasi: 8 gelas (2 liter)
                </div>
              </div>

              <div class="water-form-group">
                <label class="water-label">
                  <span class="water-label-icon">⏰</span>
                  <span>Interval Pengingat (menit)</span>
                </label>
                <select id="reminder-interval" class="water-input">
                  <option value="0">Tidak Ada</option>
                  <option value="30">30 menit</option>
                  <option value="60" selected>1 jam</option>
                  <option value="90">1.5 jam</option>
                  <option value="120">2 jam</option>
                </select>
              </div>

              <div class="water-benefits">
                <div class="water-benefit-title">💪 Manfaat Air Putih:</div>
                <ul class="water-benefit-list">
                  <li>Meningkatkan energi & fokus</li>
                  <li>Melancarkan pencernaan</li>
                  <li>Menjaga kesehatan kulit</li>
                  <li>Membantu detoksifikasi tubuh</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- History/Stats -->
          <div class="water-history-card">
            <div class="water-panel-header">
              <span class="water-panel-icon">📅</span>
              <span class="water-panel-title">Riwayat 7 Hari</span>
            </div>
            <div class="water-history-content" id="water-history"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Elements
  const addWaterBtn = document.getElementById("add-water-btn");
  const removeWaterBtn = document.getElementById("remove-water-btn");
  const resetWaterBtn = document.getElementById("reset-water-btn");
  const quickAddBtns = document.querySelectorAll(".water-quick-btn");
  const targetInput = document.getElementById("water-target-input");
  const decreaseTargetBtn = document.getElementById("decrease-target");
  const increaseTargetBtn = document.getElementById("increase-target");
  const reminderIntervalEl = document.getElementById("reminder-interval");
  
  const waterGlassFill = document.getElementById("water-glass-fill");
  const waterGlassText = document.getElementById("water-glass-text");
  const waterProgressFill = document.getElementById("water-progress-fill");
  const waterProgressText = document.getElementById("water-progress-text");
  const waterReminder = document.getElementById("water-reminder");
  
  const waterTargetDisplay = document.getElementById("water-target-display");
  const waterCurrentDisplay = document.getElementById("water-current-display");
  const waterPercentDisplay = document.getElementById("water-percent-display");
  const waterMlCurrent = document.getElementById("water-ml-current");
  const waterMlTarget = document.getElementById("water-ml-target");
  
  let state = loadWater();
  let reminderInterval = null;

  // Check if new day
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastReset !== today) {
    // Save yesterday's data to history
    if (state.current > 0) {
      const history = loadHistory();
      history.push({
        date: state.lastReset,
        target: state.target,
        current: state.current,
        percent: Math.round((state.current / state.target) * 100)
      });
      // Keep only last 30 days
      if (history.length > 30) history.shift();
      saveHistory(history);
    }
    
    // Reset for new day
    state.current = 0;
    state.lastReset = today;
    saveWater(state);
  }

  function render() {
    const percent = Math.min(100, Math.round((state.current / state.target) * 100));
    const mlCurrent = state.current * 250;
    const mlTarget = state.target * 250;
    
    // Update stats
    waterTargetDisplay.textContent = state.target;
    waterCurrentDisplay.textContent = state.current;
    waterPercentDisplay.textContent = `${percent}%`;
    
    // Update glass
    waterGlassFill.style.height = `${percent}%`;
    waterGlassText.textContent = `${state.current}/${state.target}`;
    
    // Update progress bar
    waterProgressFill.style.width = `${percent}%`;
    waterMlCurrent.textContent = mlCurrent;
    waterMlTarget.textContent = mlTarget;
    
    // Update target input
    targetInput.value = state.target;
    
    // Update reminder message
    updateReminderMessage(percent);
    
    // Update history
    renderHistory();
  }

  function updateReminderMessage(percent) {
    const hour = new Date().getHours();
    let message = "";
    let icon = "💡";
    
    if (percent >= 100) {
      message = "🎉 Target tercapai! Pertahankan hidrasi Anda!";
      icon = "🎉";
    } else if (percent >= 75) {
      message = "💪 Hampir sampai! Sedikit lagi mencapai target!";
      icon = "💪";
    } else if (percent >= 50) {
      message = "👍 Bagus! Sudah setengah jalan!";
      icon = "👍";
    } else if (percent >= 25) {
      message = "⏰ Jangan lupa minum air secara teratur!";
      icon = "⏰";
    } else if (hour < 12) {
      message = "🌅 Mulai hari dengan 1-2 gelas air!";
      icon = "🌅";
    } else if (hour < 18) {
      message = "☀️ Tetap terhidrasi di siang hari!";
      icon = "☀️";
    } else {
      message = "🌙 Jangan lupa minum sebelum tidur!";
      icon = "🌙";
    }
    
    waterReminder.innerHTML = `
      <div class="water-reminder-icon">${icon}</div>
      <div class="water-reminder-text">${message}</div>
    `;
  }

  function renderHistory() {
    const history = loadHistory();
    const last7Days = history.slice(-7).reverse();
    
    if (last7Days.length === 0) {
      document.getElementById("water-history").innerHTML = `
        <div class="water-history-empty">
          <div class="water-history-empty-icon">📊</div>
          <div class="water-history-empty-text">Belum ada riwayat</div>
        </div>
      `;
      return;
    }
    
    document.getElementById("water-history").innerHTML = last7Days.map(day => {
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
      const achieved = day.current >= day.target;
      
      return `
        <div class="water-history-item">
          <div class="water-history-date">${dayName}</div>
          <div class="water-history-bar">
            <div class="water-history-bar-fill ${achieved ? 'achieved' : ''}" style="width: ${Math.min(100, day.percent)}%"></div>
          </div>
          <div class="water-history-value">${day.current}/${day.target}</div>
          <div class="water-history-icon">${achieved ? '✅' : '📊'}</div>
        </div>
      `;
    }).join('');
  }

  function addWater(amount = 1) {
    state.current += amount;
    saveWater(state);
    render();
    
    const percent = Math.round((state.current / state.target) * 100);
    if (percent >= 100) {
      showToast('🎉 Selamat! Target harian tercapai!');
    } else {
      showToast(`💧 +${amount} gelas ditambahkan`);
    }
  }

  function removeWater() {
    if (state.current > 0) {
      state.current -= 1;
      saveWater(state);
      render();
      showToast('➖ 1 gelas dikurangi');
    }
  }

  function resetWater() {
    if (confirm('Reset tracker hari ini?')) {
      state.current = 0;
      saveWater(state);
      render();
      showToast('🔄 Tracker direset');
    }
  }

  function updateTarget(newTarget) {
    if (newTarget >= 1 && newTarget <= 20) {
      state.target = newTarget;
      saveWater(state);
      render();
      showToast(`🎯 Target diubah menjadi ${newTarget} gelas`);
    }
  }

  // Event Listeners
  addWaterBtn.addEventListener('click', () => addWater(1));
  removeWaterBtn.addEventListener('click', removeWater);
  resetWaterBtn.addEventListener('click', resetWater);
  
  quickAddBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = parseFloat(btn.dataset.amount);
      addWater(amount);
    });
  });
  
  targetInput.addEventListener('change', (e) => {
    const value = parseInt(e.target.value);
    if (value) updateTarget(value);
  });
  
  decreaseTargetBtn.addEventListener('click', () => {
    updateTarget(state.target - 1);
  });
  
  increaseTargetBtn.addEventListener('click', () => {
    updateTarget(state.target + 1);
  });
  
  reminderIntervalEl.addEventListener('change', (e) => {
    const minutes = parseInt(e.target.value);
    if (reminderInterval) {
      clearInterval(reminderInterval);
      reminderInterval = null;
    }
    
    if (minutes > 0) {
      reminderInterval = setInterval(() => {
        const percent = Math.round((state.current / state.target) * 100);
        if (percent < 100) {
          showToast('💧 Waktunya minum air!');
        }
      }, minutes * 60 * 1000);
      showToast(`⏰ Pengingat diatur setiap ${minutes} menit`);
    }
  });

  // Initialize
  render();
}
