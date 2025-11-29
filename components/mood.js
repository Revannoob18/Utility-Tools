import { refreshDashboard, showToast } from "../app.js";

const KEY = "aolt-mood";
const ENTRIES_KEY = "aolt-mood-entries";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadMoods() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function saveMoods(map) {
  localStorage.setItem(KEY, JSON.stringify(map));
  refreshDashboard();
}

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

const MOODS = [
  { id: "sangat-bahagia", emoji: "😄", label: "Sangat Bahagia", color: "#22c55e", description: "Merasa luar biasa!", level: 5 },
  { id: "bahagia", emoji: "😊", label: "Bahagia", color: "#84cc16", description: "Hari yang menyenangkan", level: 4 },
  { id: "bersemangat", emoji: "🤩", label: "Bersemangat", color: "#ec4899", description: "Penuh energi!", level: 4.5 },
  { id: "netral", emoji: "😐", label: "Netral", color: "#eab308", description: "Biasa saja", level: 3 },
  { id: "cemas", emoji: "😰", label: "Cemas", color: "#f97316", description: "Khawatir atau gelisah", level: 2.5 },
  { id: "sedih", emoji: "😢", label: "Sedih", color: "#3b82f6", description: "Kurang bersemangat", level: 2 },
  { id: "sangat-sedih", emoji: "😭", label: "Sangat Sedih", color: "#8b5cf6", description: "Merasa down", level: 1 },
  { id: "marah", emoji: "😠", label: "Marah", color: "#ef4444", description: "Kesal atau frustrasi", level: 1.5 },
  { id: "lelah", emoji: "😴", label: "Lelah", color: "#64748b", description: "Butuh istirahat", level: 2.8 },
  { id: "santai", emoji: "😌", label: "Santai", color: "#06b6d4", description: "Tenang dan damai", level: 3.5 }
];

const ACTIVITIES = [
  { id: "kerja", label: "Kerja/Kuliah", icon: "💼" },
  { id: "olahraga", label: "Olahraga", icon: "🏃" },
  { id: "keluarga", label: "Keluarga", icon: "👨‍👩‍👧‍👦" },
  { id: "teman", label: "Teman", icon: "👥" },
  { id: "hobi", label: "Hobi", icon: "🎨" },
  { id: "istirahat", label: "Istirahat", icon: "😴" },
  { id: "belajar", label: "Belajar", icon: "📚" },
  { id: "hiburan", label: "Hiburan", icon: "🎮" },
  { id: "ibadah", label: "Ibadah", icon: "🕌" },
  { id: "alam", label: "Alam", icon: "🌳" }
];

export function getMoodSummary() {
  const map = loadMoods();
  const key = todayKey();
  const entry = map[key];
  if (!entry) return { label: "Belum diisi", note: "", moodClass: "" };
  
  const moodData = MOODS.find(m => m.id === entry.mood);
  const label = moodData ? moodData.label : entry.mood;
  const moodClass = entry.mood.includes("bahagia") ? "chip-success" : entry.mood.includes("sedih") ? "chip-danger" : "";
  return { label, note: entry.note, moodClass };
}

export function initMood() {
  const section = document.getElementById("mood");
  
  section.innerHTML = `
    <div class="mood-container">
      <!-- Header -->
      <div class="mood-header">
        <div class="mood-header-content">
          <div class="mood-header-left">
            <div class="mood-icon">😊</div>
            <div>
              <div class="mood-header-title">Mood Tracker</div>
              <div class="mood-header-subtitle">Catat dan pantau suasana hati Anda setiap hari</div>
            </div>
          </div>
          <div class="mood-stats">
            <div class="mood-stat-card">
              <div class="mood-stat-icon">📅</div>
              <div class="mood-stat-content">
                <div class="mood-stat-value" id="mood-streak">0</div>
                <div class="mood-stat-label">Hari Berturut</div>
              </div>
            </div>
            <div class="mood-stat-card">
              <div class="mood-stat-icon">📊</div>
              <div class="mood-stat-content">
                <div class="mood-stat-value" id="mood-total">0</div>
                <div class="mood-stat-label">Total Catatan</div>
              </div>
            </div>
            <div class="mood-stat-card">
              <div class="mood-stat-icon" id="mood-avg-icon">😊</div>
              <div class="mood-stat-content">
                <div class="mood-stat-value" id="mood-avg-label">-</div>
                <div class="mood-stat-label">Mood Umum</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="mood-main-grid">
        <!-- Today's Mood -->
        <div class="mood-today-card">
          <div class="mood-panel-header">
            <span class="mood-panel-icon">🎭</span>
            <span class="mood-panel-title">Bagaimana Perasaan Anda Hari Ini?</span>
          </div>
          
          <div class="mood-today-content">
            <div class="mood-selector-grid">
              ${MOODS.map(mood => `
                <button class="mood-option" data-mood="${mood.id}" data-emoji="${mood.emoji}" data-color="${mood.color}">
                  <div class="mood-option-emoji">${mood.emoji}</div>
                  <div class="mood-option-label">${mood.label}</div>
                </button>
              `).join('')}
            </div>

            <div class="mood-selected-display" id="mood-selected-display" style="display: none;">
              <div class="mood-selected-emoji" id="mood-selected-emoji">😊</div>
              <div class="mood-selected-info">
                <div class="mood-selected-label" id="mood-selected-label">Bahagia</div>
                <div class="mood-selected-desc" id="mood-selected-desc">Hari yang menyenangkan</div>
              </div>
            </div>

            <div class="mood-note-section">
              <label class="mood-label">
                <span class="mood-label-icon">📝</span>
                <span>Catatan (opsional)</span>
              </label>
              <textarea 
                id="mood-note-input" 
                class="mood-textarea" 
                rows="4" 
                placeholder="Apa yang membuat Anda merasa seperti ini? Ceritakan pengalaman atau pikiran Anda hari ini..."
              ></textarea>
              <div class="mood-note-hint">💡 Tips: Menulis jurnal membantu memahami pola emosi Anda</div>
            </div>

            <div class="mood-activities-section">
              <label class="mood-label">
                <span class="mood-label-icon">🎯</span>
                <span>Aktivitas Hari Ini (pilih yang sesuai)</span>
              </label>
              <div class="mood-activities-grid">
                ${ACTIVITIES.map(act => `
                  <button class="mood-activity-chip" data-activity="${act.id}">
                    <span class="mood-activity-icon">${act.icon}</span>
                    <span class="mood-activity-label">${act.label}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div class="mood-actions">
              <button class="mood-btn-save" id="mood-save-btn" disabled>
                <span>💾</span>
                <span>Simpan Mood Hari Ini</span>
              </button>
              <button class="mood-btn-export" id="mood-export-btn">
                <span>📥</span>
                <span>Export Data</span>
              </button>
            </div>

            <div class="mood-today-info" id="mood-today-info" style="display: none;">
              <div class="mood-today-info-icon">✅</div>
              <div class="mood-today-info-text">
                <div class="mood-today-info-title">Mood hari ini sudah tersimpan</div>
                <div class="mood-today-info-desc">Anda dapat mengubahnya dengan memilih mood baru</div>
              </div>
            </div>
          </div>
        </div>

        <!-- History & Analysis -->
        <div class="mood-side-panel">
          <!-- Chart -->
          <div class="mood-chart-card">
            <div class="mood-panel-header">
              <span class="mood-panel-icon">📈</span>
              <span class="mood-panel-title">Grafik 7 Hari Terakhir</span>
            </div>
            <div class="mood-chart-content">
              <canvas id="mood-chart" width="400" height="240"></canvas>
            </div>
          </div>

          <!-- Mood Distribution -->
          <div class="mood-distribution-card">
            <div class="mood-panel-header">
              <span class="mood-panel-icon">🎨</span>
              <span class="mood-panel-title">Distribusi Mood (30 Hari)</span>
            </div>
            <div class="mood-distribution-content" id="mood-distribution"></div>
          </div>
        </div>
      </div>

      <!-- History Timeline -->
      <div class="mood-history-section">
        <div class="mood-panel-header">
          <span class="mood-panel-icon">📖</span>
          <span class="mood-panel-title">Riwayat Mood</span>
        </div>
        <div class="mood-history-content" id="mood-history"></div>
      </div>
    </div>
  `;

  const moodOptions = document.querySelectorAll('.mood-option');
  const activityChips = document.querySelectorAll('.mood-activity-chip');
  const selectedDisplay = document.getElementById('mood-selected-display');
  const selectedEmoji = document.getElementById('mood-selected-emoji');
  const selectedLabel = document.getElementById('mood-selected-label');
  const selectedDesc = document.getElementById('mood-selected-desc');
  const noteInput = document.getElementById('mood-note-input');
  const saveBtn = document.getElementById('mood-save-btn');
  const exportBtn = document.getElementById('mood-export-btn');
  const todayInfo = document.getElementById('mood-today-info');
  const canvas = document.getElementById('mood-chart');
  const ctx = canvas.getContext('2d');

  let selectedMood = null;
  let selectedActivities = [];
  const map = loadMoods();
  const todayEntry = map[todayKey()];

  // Initialize with today's mood if exists
  if (todayEntry) {
    selectedMood = todayEntry.mood;
    noteInput.value = todayEntry.note || '';
    selectedActivities = todayEntry.activities || [];
    
    const moodData = MOODS.find(m => m.id === selectedMood);
    if (moodData) {
      selectedEmoji.textContent = moodData.emoji;
      selectedLabel.textContent = moodData.label;
      selectedDesc.textContent = moodData.description;
      selectedDisplay.style.display = 'flex';
      todayInfo.style.display = 'flex';
      
      // Highlight selected mood
      const selectedBtn = document.querySelector(`[data-mood="${selectedMood}"]`);
      if (selectedBtn) selectedBtn.classList.add('selected');
    }
    
    // Highlight selected activities
    selectedActivities.forEach(actId => {
      const actBtn = document.querySelector(`[data-activity="${actId}"]`);
      if (actBtn) actBtn.classList.add('selected');
    });
  }

  // Mood selection
  moodOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.dataset.mood;
      const emoji = btn.dataset.emoji;
      const color = btn.dataset.color;
      const moodData = MOODS.find(m => m.id === mood);
      
      selectedMood = mood;
      selectedEmoji.textContent = emoji;
      selectedLabel.textContent = moodData.label;
      selectedDesc.textContent = moodData.description;
      selectedDisplay.style.display = 'flex';
      selectedDisplay.style.borderLeftColor = color;
      
      saveBtn.disabled = false;
      
      // Update selection
      moodOptions.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Activity selection
  activityChips.forEach(btn => {
    btn.addEventListener('click', () => {
      const activity = btn.dataset.activity;
      
      if (selectedActivities.includes(activity)) {
        selectedActivities = selectedActivities.filter(a => a !== activity);
        btn.classList.remove('selected');
      } else {
        selectedActivities.push(activity);
        btn.classList.add('selected');
      }
    });
  });

  // Save mood
  saveBtn.addEventListener('click', () => {
    if (!selectedMood) return;
    
    const key = todayKey();
    const note = noteInput.value.trim();
    
    map[key] = { 
      mood: selectedMood, 
      note, 
      activities: selectedActivities,
      timestamp: new Date().toISOString() 
    };
    saveMoods(map);
    
    // Save to entries
    const entries = loadEntries();
    const existingIndex = entries.findIndex(e => e.date === key);
    const entry = { 
      date: key, 
      mood: selectedMood, 
      note, 
      activities: selectedActivities,
      timestamp: new Date().toISOString() 
    };
    
    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
      showToast('😊 Mood diperbarui!');
    } else {
      entries.unshift(entry);
      showToast('✅ Mood tersimpan!');
    }
    
    // Keep only last 90 days
    if (entries.length > 90) entries.length = 90;
    saveEntries(entries);
    
    todayInfo.style.display = 'flex';
    render();
  });

  function calculateStreak() {
    const entries = loadEntries();
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      
      if (map[key]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  function getCommonMood() {
    const entries = loadEntries().slice(0, 30);
    if (entries.length === 0) return null;
    
    const counts = {};
    entries.forEach(e => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    
    const commonMoodId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    return MOODS.find(m => m.id === commonMoodId);
  }

  function renderChart() {
    const today = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const entry = map[key];
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      days.push({ key, label: dayName, mood: entry ? entry.mood : null });
    }

    const w = canvas.width;
    const h = canvas.height;
    const padding = 40;
    const chartH = h - padding * 2;
    const chartW = w - padding * 2;
    const gap = chartW / (days.length - 1);

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }

    // Mood levels (inverted - higher is happier)
    const moodLevels = {
      'sangat-bahagia': 4,
      'bahagia': 3.5,
      'bersemangat': 3.8,
      'netral': 2.5,
      'cemas': 2,
      'sedih': 1.5,
      'sangat-sedih': 0.5,
      'marah': 1
    };

    // Line & Points
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const points = days.map((d, idx) => {
      const x = padding + gap * idx;
      const level = d.mood ? moodLevels[d.mood] : 2.5;
      const y = padding + chartH - (level / 4) * chartH;
      return { x, y, mood: d.mood, label: d.label };
    });

    // Draw line
    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    });
    ctx.strokeStyle = '#6366f1';
    ctx.stroke();

    // Draw points & emojis
    points.forEach(p => {
      if (p.mood) {
        const moodData = MOODS.find(m => m.id === p.mood);
        
        // Point
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = moodData ? moodData.color : '#9ca3af';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Emoji
        ctx.font = '20px system-ui';
        ctx.fillText(moodData ? moodData.emoji : '😐', p.x - 10, p.y - 15);
      } else {
        // Empty point
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#d1d5db';
        ctx.fill();
      }
      
      // Label
      ctx.font = '12px system-ui';
      ctx.fillStyle = '#6b7280';
      ctx.textAlign = 'center';
      ctx.fillText(p.label, p.x, h - 15);
    });
  }

  function renderDistribution() {
    const entries = loadEntries().slice(0, 30);
    const counts = {};
    
    entries.forEach(e => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });
    
    const total = entries.length;
    
    if (total === 0) {
      document.getElementById('mood-distribution').innerHTML = `
        <div class="mood-distribution-empty">
          <div class="mood-distribution-empty-icon">📊</div>
          <div class="mood-distribution-empty-text">Belum ada data</div>
        </div>
      `;
      return;
    }
    
    const html = MOODS
      .map(mood => {
        const count = counts[mood.id] || 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;
        
        if (count === 0) return '';
        
        return `
          <div class="mood-distribution-item">
            <div class="mood-distribution-info">
              <span class="mood-distribution-emoji">${mood.emoji}</span>
              <span class="mood-distribution-label">${mood.label}</span>
            </div>
            <div class="mood-distribution-bar-container">
              <div class="mood-distribution-bar" style="width: ${percent}%; background: ${mood.color};"></div>
            </div>
            <div class="mood-distribution-value">${percent}%</div>
          </div>
        `;
      })
      .filter(Boolean)
      .join('');
    
    document.getElementById('mood-distribution').innerHTML = html || '<div class="mood-distribution-empty-text">Belum ada data</div>';
  }

  function renderHistory() {
    const entries = loadEntries().slice(0, 10);
    
    if (entries.length === 0) {
      document.getElementById('mood-history').innerHTML = `
        <div class="mood-history-empty">
          <div class="mood-history-empty-icon">📖</div>
          <div class="mood-history-empty-text">Belum ada riwayat mood</div>
        </div>
      `;
      return;
    }
    
    const html = entries.map(entry => {
      const date = new Date(entry.date);
      const dateStr = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const moodData = MOODS.find(m => m.id === entry.mood);
      
      const activitiesHtml = (entry.activities && entry.activities.length > 0) 
        ? `<div class="mood-history-activities">
             ${entry.activities.map(actId => {
               const act = ACTIVITIES.find(a => a.id === actId);
               return act ? `<span class="mood-history-activity-tag">${act.icon} ${act.label}</span>` : '';
             }).join('')}
           </div>`
        : '';
      
      return `
        <div class="mood-history-item">
          <div class="mood-history-date-bar" style="background: ${moodData.color};"></div>
          <div class="mood-history-emoji">${moodData.emoji}</div>
          <div class="mood-history-content">
            <div class="mood-history-header">
              <div class="mood-history-mood">${moodData.label}</div>
              <div class="mood-history-date">${dateStr}</div>
            </div>
            ${activitiesHtml}
            ${entry.note ? `<div class="mood-history-note">${entry.note}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    document.getElementById('mood-history').innerHTML = html;
  }

  function render() {
    // Update stats
    const streak = calculateStreak();
    const total = loadEntries().length;
    const commonMood = getCommonMood();
    
    document.getElementById('mood-streak').textContent = streak;
    document.getElementById('mood-total').textContent = total;
    
    if (commonMood) {
      document.getElementById('mood-avg-icon').textContent = commonMood.emoji;
      document.getElementById('mood-avg-label').textContent = commonMood.label;
    }
    
    renderChart();
    renderDistribution();
    renderHistory();
  }

  // Export functionality
  exportBtn.addEventListener('click', () => {
    const entries = loadEntries();
    if (entries.length === 0) {
      showToast('⚠️ Tidak ada data untuk diexport');
      return;
    }
    
    let csv = 'Tanggal,Mood,Aktivitas,Catatan\n';
    entries.forEach(entry => {
      const moodData = MOODS.find(m => m.id === entry.mood);
      const activities = (entry.activities || []).map(actId => {
        const act = ACTIVITIES.find(a => a.id === actId);
        return act ? act.label : actId;
      }).join('; ');
      
      const note = (entry.note || '').replace(/"/g, '""').replace(/\n/g, ' ');
      csv += `"${entry.date}","${moodData ? moodData.label : entry.mood}","${activities}","${note}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mood-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    
    showToast('📥 Data mood berhasil diexport!');
  });

  render();
}
