import { showToast } from "../app.js";

const KEY = "aolt-sholat-city";
const TRACKER_KEY = "aolt-sholat-tracker";
const STREAK_KEY = "aolt-sholat-streak";
const NOTIFICATION_KEY = "aolt-sholat-notifications";
const NOTIFIED_KEY = "aolt-sholat-notified";

function loadCity() {
  return localStorage.getItem(KEY) || "Jakarta";
}

function saveCity(city) {
  localStorage.setItem(KEY, city);
}

function loadNotificationSettings() {
  return localStorage.getItem(NOTIFICATION_KEY) === 'true';
}

function saveNotificationSettings(enabled) {
  localStorage.setItem(NOTIFICATION_KEY, enabled.toString());
}

function loadNotifiedPrayers() {
  try {
    return JSON.parse(localStorage.getItem(NOTIFIED_KEY)) || {};
  } catch {
    return {};
  }
}

function saveNotifiedPrayers(data) {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(data));
}

function resetDailyNotifications() {
  const notified = loadNotifiedPrayers();
  const today = todayKey();
  
  // Clear old dates
  Object.keys(notified).forEach(key => {
    if (key !== today) {
      delete notified[key];
    }
  });
  
  saveNotifiedPrayers(notified);
}

function loadTracker() {
  try {
    return JSON.parse(localStorage.getItem(TRACKER_KEY)) || {};
  } catch {
    return {};
  }
}

function saveTracker(data) {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(data));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const PRAYERS = [
  { id: "subuh", label: "Subuh", icon: "🌅", color: "#0ea5e9", apiKey: "Fajr" },
  { id: "dzuhur", label: "Dzuhur", icon: "☀️", color: "#f59e0b", apiKey: "Dhuhr" },
  { id: "ashar", label: "Ashar", icon: "🌤️", color: "#eab308", apiKey: "Asr" },
  { id: "maghrib", label: "Maghrib", icon: "🌆", color: "#f97316", apiKey: "Maghrib" },
  { id: "isya", label: "Isya", icon: "🌙", color: "#8b5cf6", apiKey: "Isha" }
];

export function initSholat() {
  const section = document.getElementById("sholat");
  
  section.innerHTML = `
    <div class="sholat-container">
      <!-- Header -->
      <div class="sholat-header">
        <div class="sholat-header-content">
          <div class="sholat-header-left">
            <div class="sholat-icon">🕌</div>
            <div>
              <div class="sholat-header-title">Sholat Tracker</div>
              <div class="sholat-header-subtitle">Jadwal sholat & tracking ibadah harian</div>
            </div>
          </div>
          <div class="sholat-stats">
            <div class="sholat-stat-card">
              <div class="sholat-stat-icon">📅</div>
              <div class="sholat-stat-content">
                <div class="sholat-stat-value" id="sholat-today-count">0/5</div>
                <div class="sholat-stat-label">Hari Ini</div>
              </div>
            </div>
            <div class="sholat-stat-card">
              <div class="sholat-stat-icon">🔥</div>
              <div class="sholat-stat-content">
                <div class="sholat-stat-value" id="sholat-streak">0</div>
                <div class="sholat-stat-label">Hari Berturut</div>
              </div>
            </div>
            <div class="sholat-stat-card">
              <div class="sholat-stat-icon">📊</div>
              <div class="sholat-stat-content">
                <div class="sholat-stat-value" id="sholat-percentage">0%</div>
                <div class="sholat-stat-label">Minggu Ini</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="sholat-main-grid">
        <!-- Prayer Times & Tracker -->
        <div class="sholat-times-card">
          <div class="sholat-panel-header">
            <span class="sholat-panel-icon">🕌</span>
            <span class="sholat-panel-title">Jadwal Sholat Hari Ini</span>
            <div class="sholat-date" id="sholat-current-date"></div>
          </div>
          
          <div class="sholat-times-content">
            <!-- City Selector -->
            <div class="sholat-city-selector">
              <label class="sholat-label">
                <span class="sholat-label-icon">📍</span>
                <span>Pilih Kota</span>
              </label>
              <div class="sholat-city-input-group">
                <input 
                  type="text" 
                  id="sholat-city-input" 
                  class="sholat-input" 
                  placeholder="Nama kota..."
                  list="indonesia-cities"
                />
                <datalist id="indonesia-cities">
                  <option value="Jakarta">
                  <option value="Surabaya">
                  <option value="Bandung">
                  <option value="Medan">
                  <option value="Semarang">
                  <option value="Makassar">
                  <option value="Palembang">
                  <option value="Tangerang">
                  <option value="Depok">
                  <option value="Bekasi">
                  <option value="Yogyakarta">
                  <option value="Malang">
                  <option value="Bogor">
                  <option value="Batam">
                  <option value="Pekanbaru">
                  <option value="Bandar Lampung">
                  <option value="Padang">
                  <option value="Denpasar">
                  <option value="Samarinda">
                  <option value="Balikpapan">
                </datalist>
                <button class="sholat-city-btn" id="sholat-load-btn">
                  <span>🔄</span>
                  <span>Muat</span>
                </button>
              </div>
            </div>

            <!-- Notification Toggle -->
            <div class="sholat-notification-toggle">
              <label class="sholat-notification-label">
                <span class="sholat-notification-icon">🔔</span>
                <div class="sholat-notification-text">
                  <div class="sholat-notification-title">Pengingat Sholat</div>
                  <div class="sholat-notification-desc">Notifikasi 10 menit sebelum waktu sholat</div>
                </div>
                <label class="sholat-toggle-switch">
                  <input type="checkbox" id="sholat-notification-toggle" />
                  <span class="sholat-toggle-slider"></span>
                </label>
              </label>
            </div>

            <!-- Loading State -->
            <div class="sholat-loading" id="sholat-loading" style="display: none;">
              <div class="sholat-loading-spinner">⏳</div>
              <div class="sholat-loading-text">Memuat jadwal sholat...</div>
            </div>

            <!-- Prayer Times List -->
            <div class="sholat-times-list" id="sholat-times-list"></div>

            <!-- Quick Stats -->
            <div class="sholat-quick-stats">
              <div class="sholat-quick-stat">
                <span class="sholat-quick-stat-icon">🌅</span>
                <div class="sholat-quick-stat-content">
                  <div class="sholat-quick-stat-label">Waktu Imsak</div>
                  <div class="sholat-quick-stat-value" id="sholat-imsak">-</div>
                </div>
              </div>
              <div class="sholat-quick-stat">
                <span class="sholat-quick-stat-icon">🌄</span>
                <div class="sholat-quick-stat-content">
                  <div class="sholat-quick-stat-label">Terbit Matahari</div>
                  <div class="sholat-quick-stat-value" id="sholat-sunrise">-</div>
                </div>
              </div>
              <div class="sholat-quick-stat">
                <span class="sholat-quick-stat-icon">🌃</span>
                <div class="sholat-quick-stat-content">
                  <div class="sholat-quick-stat-label">Tengah Malam</div>
                  <div class="sholat-quick-stat-value" id="sholat-midnight">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistics & History -->
        <div class="sholat-side-panel">
          <!-- Weekly Chart -->
          <div class="sholat-chart-card">
            <div class="sholat-panel-header">
              <span class="sholat-panel-icon">📊</span>
              <span class="sholat-panel-title">Aktivitas 7 Hari</span>
            </div>
            <div class="sholat-chart-content">
              <canvas id="sholat-chart" width="400" height="200"></canvas>
            </div>
          </div>

          <!-- Prayer Stats -->
          <div class="sholat-prayer-stats-card">
            <div class="sholat-panel-header">
              <span class="sholat-panel-icon">📈</span>
              <span class="sholat-panel-title">Statistik Sholat</span>
            </div>
            <div class="sholat-prayer-stats-content" id="sholat-prayer-stats"></div>
          </div>

          <!-- Motivational Tips -->
          <div class="sholat-tips-card">
            <div class="sholat-panel-header">
              <span class="sholat-panel-icon">💡</span>
              <span class="sholat-panel-title">Tips Ibadah</span>
            </div>
            <div class="sholat-tips-content">
              <div class="sholat-tip">
                <span class="sholat-tip-icon">🌟</span>
                <span class="sholat-tip-text">Sholat adalah tiang agama. Jagalah dengan istiqomah.</span>
              </div>
              <div class="sholat-tip">
                <span class="sholat-tip-icon">⏰</span>
                <span class="sholat-tip-text">Sholat di awal waktu lebih utama dan dicintai Allah.</span>
              </div>
              <div class="sholat-tip">
                <span class="sholat-tip-icon">🤲</span>
                <span class="sholat-tip-text">Berdoa setelah sholat adalah waktu mustajab.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="sholat-history-section">
        <div class="sholat-panel-header">
          <span class="sholat-panel-icon">📖</span>
          <span class="sholat-panel-title">Riwayat 7 Hari Terakhir</span>
        </div>
        <div class="sholat-history-content" id="sholat-history"></div>
      </div>
    </div>
  `;

  // Elements
  const cityInput = document.getElementById('sholat-city-input');
  const loadBtn = document.getElementById('sholat-load-btn');
  const notificationToggle = document.getElementById('sholat-notification-toggle');
  const loading = document.getElementById('sholat-loading');
  const timesList = document.getElementById('sholat-times-list');
  const canvas = document.getElementById('sholat-chart');
  const ctx = canvas.getContext('2d');

  let currentTimings = null;
  let notificationInterval = null;

  cityInput.value = loadCity();
  notificationToggle.checked = loadNotificationSettings();

  // Set current date
  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('sholat-current-date').textContent = dateStr;

  function loadPrayerTimes() {
    const city = cityInput.value.trim() || "Jakarta";
    saveCity(city);
    
    const d = today.getDate();
    const m = today.getMonth() + 1;
    const y = today.getFullYear();
    const url = `https://api.aladhan.com/v1/timingsByCity/${d}-${m}-${y}?city=${encodeURIComponent(city)}&country=Indonesia&method=2`;
    
    loading.style.display = 'flex';
    timesList.innerHTML = '';
    
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (!json.data) throw new Error("Data tidak tersedia");
        
        currentTimings = json.data.timings;
        loading.style.display = 'none';
        
        renderPrayerTimes();
        renderAdditionalTimes();
        showToast(`📍 Jadwal ${city} berhasil dimuat`);
        
        // Restart notification monitoring with new times
        if (loadNotificationSettings()) {
          startNotificationMonitoring();
        }
      })
      .catch((err) => {
        loading.style.display = 'none';
        timesList.innerHTML = `
          <div class="sholat-error">
            <div class="sholat-error-icon">⚠️</div>
            <div class="sholat-error-text">Gagal memuat: ${err.message}</div>
          </div>
        `;
        showToast('⚠️ Gagal memuat jadwal sholat');
      });
  }

  function renderPrayerTimes() {
    if (!currentTimings) return;
    
    const tracker = loadTracker();
    const todayData = tracker[todayKey()] || {};
    
    const html = PRAYERS.map(prayer => {
      const time = currentTimings[prayer.apiKey];
      const isChecked = todayData[prayer.id] || false;
      const now = new Date();
      const [hours, minutes] = time.split(':');
      const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));
      const isPassed = now > prayerTime;
      
      return `
        <div class="sholat-time-item ${isChecked ? 'checked' : ''} ${isPassed ? 'passed' : ''}">
          <div class="sholat-time-icon" style="background: ${prayer.color};">
            ${prayer.icon}
          </div>
          <div class="sholat-time-content">
            <div class="sholat-time-label">${prayer.label}</div>
            <div class="sholat-time-value">${time}</div>
          </div>
          <label class="sholat-checkbox">
            <input 
              type="checkbox" 
              class="sholat-checkbox-input" 
              data-prayer="${prayer.id}"
              ${isChecked ? 'checked' : ''}
            />
            <span class="sholat-checkbox-custom"></span>
          </label>
        </div>
      `;
    }).join('');
    
    timesList.innerHTML = html;
    
    // Add event listeners
    document.querySelectorAll('.sholat-checkbox-input').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const prayerId = e.target.dataset.prayer;
        togglePrayer(prayerId, e.target.checked);
      });
    });
  }

  function renderAdditionalTimes() {
    if (!currentTimings) return;
    
    document.getElementById('sholat-imsak').textContent = currentTimings.Imsak || '-';
    document.getElementById('sholat-sunrise').textContent = currentTimings.Sunrise || '-';
    document.getElementById('sholat-midnight').textContent = currentTimings.Midnight || '-';
  }

  function togglePrayer(prayerId, isChecked) {
    const tracker = loadTracker();
    const key = todayKey();
    
    if (!tracker[key]) {
      tracker[key] = {};
    }
    
    tracker[key][prayerId] = isChecked;
    saveTracker(tracker);
    
    const prayer = PRAYERS.find(p => p.id === prayerId);
    if (isChecked) {
      showToast(`✅ ${prayer.label} dicatat`);
    } else {
      showToast(`↩️ ${prayer.label} dibatalkan`);
    }
    
    renderPrayerTimes();
    render();
  }

  function calculateStreak() {
    const tracker = loadTracker();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayData = tracker[key];
      
      if (!dayData) break;
      
      // Count if at least 3 prayers were done
      const count = Object.values(dayData).filter(Boolean).length;
      if (count >= 3) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function calculateWeekPercentage() {
    const tracker = loadTracker();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    let totalPossible = 0;
    let totalDone = 0;
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      if (d > new Date()) break;
      
      const key = d.toISOString().slice(0, 10);
      const dayData = tracker[key];
      
      totalPossible += 5;
      if (dayData) {
        totalDone += Object.values(dayData).filter(Boolean).length;
      }
    }
    
    return totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
  }

  function renderChart() {
    const tracker = loadTracker();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      const dayData = tracker[key] || {};
      const count = Object.values(dayData).filter(Boolean).length;
      
      days.push({ label: dayName, count });
    }

    const w = canvas.width;
    const h = canvas.height;
    const padding = 30;
    const chartH = h - padding * 2;
    const chartW = w - padding * 2;
    const barWidth = chartW / days.length;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartH / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }

    // Draw bars
    days.forEach((day, idx) => {
      const barHeight = (day.count / 5) * chartH;
      const x = padding + idx * barWidth;
      const y = h - padding - barHeight;
      
      // Bar
      const gradient = ctx.createLinearGradient(0, y, 0, h - padding);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(1, '#6366f1');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
      
      // Value
      if (day.count > 0) {
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(day.count, x + barWidth / 2, y - 5);
      }
      
      // Label
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px system-ui';
      ctx.fillText(day.label, x + barWidth / 2, h - 10);
    });
  }

  function renderPrayerStats() {
    const tracker = loadTracker();
    const stats = {};
    
    PRAYERS.forEach(p => {
      stats[p.id] = 0;
    });
    
    // Count last 30 days
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayData = tracker[key];
      
      if (dayData) {
        PRAYERS.forEach(p => {
          if (dayData[p.id]) stats[p.id]++;
        });
      }
    }
    
    const html = PRAYERS.map(prayer => {
      const count = stats[prayer.id];
      const percent = Math.round((count / 30) * 100);
      
      return `
        <div class="sholat-prayer-stat-item">
          <div class="sholat-prayer-stat-info">
            <span class="sholat-prayer-stat-icon">${prayer.icon}</span>
            <span class="sholat-prayer-stat-label">${prayer.label}</span>
          </div>
          <div class="sholat-prayer-stat-bar-container">
            <div class="sholat-prayer-stat-bar" style="width: ${percent}%; background: ${prayer.color};"></div>
          </div>
          <div class="sholat-prayer-stat-value">${count}/30</div>
        </div>
      `;
    }).join('');
    
    document.getElementById('sholat-prayer-stats').innerHTML = html;
  }

  function renderHistory() {
    const tracker = loadTracker();
    const history = [];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayData = tracker[key] || {};
      const count = Object.values(dayData).filter(Boolean).length;
      
      history.push({
        date: d,
        key,
        count,
        data: dayData
      });
    }
    
    const html = history.map(day => {
      const dateStr = day.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
      const isToday = day.key === todayKey();
      
      return `
        <div class="sholat-history-item ${isToday ? 'today' : ''}">
          <div class="sholat-history-date">
            <div class="sholat-history-date-label">${dateStr}</div>
            <div class="sholat-history-date-count">${day.count}/5 sholat</div>
          </div>
          <div class="sholat-history-prayers">
            ${PRAYERS.map(prayer => `
              <div class="sholat-history-prayer ${day.data[prayer.id] ? 'done' : 'missed'}">
                <span class="sholat-history-prayer-icon">${prayer.icon}</span>
                <span class="sholat-history-prayer-label">${prayer.label}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    document.getElementById('sholat-history').innerHTML = html;
  }

  function render() {
    const tracker = loadTracker();
    const todayData = tracker[todayKey()] || {};
    const todayCount = Object.values(todayData).filter(Boolean).length;
    
    document.getElementById('sholat-today-count').textContent = `${todayCount}/5`;
    document.getElementById('sholat-streak').textContent = calculateStreak();
    document.getElementById('sholat-percentage').textContent = `${calculateWeekPercentage()}%`;
    
    renderChart();
    renderPrayerStats();
    renderHistory();
  }

  // Notification functions
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      showToast('⚠️ Browser tidak mendukung notifikasi');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('✅ Izin notifikasi diberikan');
        return true;
      }
    }

    showToast('⚠️ Izin notifikasi ditolak');
    return false;
  }

  function showPrayerNotification(prayer, minutesBefore = 0) {
    if (Notification.permission !== 'granted') return;

    const title = minutesBefore > 0 
      ? `🕌 ${prayer.label} ${minutesBefore} Menit Lagi`
      : `🕌 Waktu ${prayer.label} Telah Tiba`;
    
    const body = minutesBefore > 0
      ? `Bersiaplah untuk melaksanakan sholat ${prayer.label}`
      : `Saatnya melaksanakan sholat ${prayer.label}. Jangan tunda kebaikan!`;

    const notification = new Notification(title, {
      body: body,
      icon: '🕌',
      badge: prayer.icon,
      tag: `prayer-${prayer.id}-${minutesBefore}`,
      requireInteraction: true,
      vibrate: [200, 100, 200]
    });

    // Play simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      // Ignore audio errors
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  function checkPrayerTimes() {
    if (!currentTimings || !loadNotificationSettings()) return;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const today = todayKey();
    const notified = loadNotifiedPrayers();
    
    if (!notified[today]) {
      notified[today] = {};
    }

    PRAYERS.forEach(prayer => {
      const time = currentTimings[prayer.apiKey];
      if (!time) return;

      const [hours, minutes] = time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;

      // Check 10 minutes before
      const tenMinutesBefore = prayerTime - 10;
      if (currentTime === tenMinutesBefore && !notified[today][`${prayer.id}-10`]) {
        showPrayerNotification(prayer, 10);
        notified[today][`${prayer.id}-10`] = true;
        saveNotifiedPrayers(notified);
      }

      // Check at prayer time
      if (currentTime === prayerTime && !notified[today][`${prayer.id}-0`]) {
        showPrayerNotification(prayer, 0);
        notified[today][`${prayer.id}-0`] = true;
        saveNotifiedPrayers(notified);
      }
    });
  }

  function startNotificationMonitoring() {
    if (notificationInterval) {
      clearInterval(notificationInterval);
    }

    if (loadNotificationSettings() && currentTimings) {
      // Check every minute
      notificationInterval = setInterval(() => {
        checkPrayerTimes();
      }, 60000); // 60 seconds

      // Initial check
      checkPrayerTimes();
    }
  }

  function stopNotificationMonitoring() {
    if (notificationInterval) {
      clearInterval(notificationInterval);
      notificationInterval = null;
    }
  }

  // Event listeners
  loadBtn.addEventListener('click', loadPrayerTimes);
  
  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      loadPrayerTimes();
    }
  });

  notificationToggle.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        saveNotificationSettings(true);
        startNotificationMonitoring();
        showToast('🔔 Pengingat sholat diaktifkan');
      } else {
        e.target.checked = false;
        saveNotificationSettings(false);
      }
    } else {
      saveNotificationSettings(false);
      stopNotificationMonitoring();
      showToast('🔕 Pengingat sholat dinonaktifkan');
    }
  });

  // Reset notifications daily at midnight
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      resetDailyNotifications();
    }
  }, 60000);

  // Initial load
  loadPrayerTimes();
  render();
  
  // Start monitoring if notifications are enabled
  if (loadNotificationSettings()) {
    startNotificationMonitoring();
  }
}
