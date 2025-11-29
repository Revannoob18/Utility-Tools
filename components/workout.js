import { showToast } from "../app.js";

const KEY = "aolt-workout";
const STATS_KEY = "aolt-workout-stats";

function loadWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveWorkouts(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || { totalWorkouts: 0, totalMinutes: 0, streak: 0 };
  } catch {
    return { totalWorkouts: 0, totalMinutes: 0, streak: 0 };
  }
}

function saveStats(stats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

const EXERCISE_CATEGORIES = [
  { id: "cardio", label: "Cardio", icon: "🏃", color: "#ef4444", exercises: ["Lari", "Bersepeda", "Renang", "Jumping Jack", "Burpees", "Jump Rope"] },
  { id: "strength", label: "Strength", icon: "💪", color: "#f59e0b", exercises: ["Push Up", "Pull Up", "Squat", "Plank", "Lunges", "Dumbbell"] },
  { id: "flexibility", label: "Flexibility", icon: "🧘", color: "#8b5cf6", exercises: ["Yoga", "Stretching", "Pilates", "Tai Chi"] },
  { id: "sports", label: "Sports", icon: "⚽", color: "#22c55e", exercises: ["Futsal", "Basketball", "Badminton", "Tennis", "Voli"] },
  { id: "martial", label: "Martial Arts", icon: "🥋", color: "#3b82f6", exercises: ["Karate", "Taekwondo", "Boxing", "Muay Thai", "Silat"] },
  { id: "dance", label: "Dance", icon: "💃", color: "#ec4899", exercises: ["Zumba", "Hip Hop", "Ballet", "Salsa"] }
];

export function initWorkout() {
  const section = document.getElementById("workout");
  
  section.innerHTML = `
    <div class="workout-container">
      <!-- Header -->
      <div class="workout-header">
        <div class="workout-header-content">
          <div class="workout-header-left">
            <div class="workout-icon">💪</div>
            <div>
              <div class="workout-header-title">Workout Tracker</div>
              <div class="workout-header-subtitle">Catat latihan dan pantau progress fitness Anda</div>
            </div>
          </div>
          <div class="workout-stats">
            <div class="workout-stat-card">
              <div class="workout-stat-icon">🏋️</div>
              <div class="workout-stat-content">
                <div class="workout-stat-value" id="workout-total">0</div>
                <div class="workout-stat-label">Total Workout</div>
              </div>
            </div>
            <div class="workout-stat-card">
              <div class="workout-stat-icon">⏱️</div>
              <div class="workout-stat-content">
                <div class="workout-stat-value" id="workout-minutes">0</div>
                <div class="workout-stat-label">Total Menit</div>
              </div>
            </div>
            <div class="workout-stat-card">
              <div class="workout-stat-icon">🔥</div>
              <div class="workout-stat-content">
                <div class="workout-stat-value" id="workout-streak">0</div>
                <div class="workout-stat-label">Hari Berturut</div>
              </div>
            </div>
            <div class="workout-stat-card">
              <div class="workout-stat-icon">📅</div>
              <div class="workout-stat-content">
                <div class="workout-stat-value" id="workout-week">0</div>
                <div class="workout-stat-label">Minggu Ini</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="workout-main-grid">
        <!-- Add Workout -->
        <div class="workout-add-card">
          <div class="workout-panel-header">
            <span class="workout-panel-icon">➕</span>
            <span class="workout-panel-title">Tambah Latihan</span>
          </div>
          
          <div class="workout-add-content">
            <!-- Category Selection -->
            <div class="workout-form-group">
              <label class="workout-label">
                <span class="workout-label-icon">🎯</span>
                <span>Kategori Latihan</span>
              </label>
              <div class="workout-categories-grid">
                ${EXERCISE_CATEGORIES.map(cat => `
                  <button class="workout-category-btn" data-category="${cat.id}">
                    <span class="workout-category-icon">${cat.icon}</span>
                    <span class="workout-category-label">${cat.label}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Quick Exercise Buttons -->
            <div class="workout-form-group" id="workout-quick-exercises" style="display: none;">
              <label class="workout-label">
                <span class="workout-label-icon">⚡</span>
                <span>Pilihan Cepat</span>
              </label>
              <div class="workout-quick-grid" id="workout-quick-grid"></div>
            </div>

            <!-- Custom Exercise Input -->
            <div class="workout-form-group">
              <label class="workout-label">
                <span class="workout-label-icon">🏋️</span>
                <span>Nama Latihan</span>
              </label>
              <input 
                type="text" 
                id="workout-name-input" 
                class="workout-input" 
                placeholder="Contoh: Push Up, Lari, Yoga..."
              />
            </div>

            <!-- Duration Input -->
            <div class="workout-form-row">
              <div class="workout-form-group">
                <label class="workout-label">
                  <span class="workout-label-icon">⏱️</span>
                  <span>Durasi (menit)</span>
                </label>
                <div class="workout-duration-control">
                  <button class="workout-duration-btn" id="decrease-duration">➖</button>
                  <input 
                    type="number" 
                    id="workout-duration-input" 
                    class="workout-input-duration" 
                    min="1" 
                    value="30"
                  />
                  <button class="workout-duration-btn" id="increase-duration">➕</button>
                </div>
              </div>

              <div class="workout-form-group">
                <label class="workout-label">
                  <span class="workout-label-icon">💧</span>
                  <span>Intensitas</span>
                </label>
                <select id="workout-intensity" class="workout-input">
                  <option value="ringan">🟢 Ringan</option>
                  <option value="sedang" selected>🟡 Sedang</option>
                  <option value="berat">🔴 Berat</option>
                </select>
              </div>
            </div>

            <!-- Calories & Notes -->
            <div class="workout-form-row">
              <div class="workout-form-group">
                <label class="workout-label">
                  <span class="workout-label-icon">🔥</span>
                  <span>Kalori (opsional)</span>
                </label>
                <input 
                  type="number" 
                  id="workout-calories" 
                  class="workout-input" 
                  placeholder="Estimasi kalori terbakar"
                />
              </div>

              <div class="workout-form-group">
                <label class="workout-label">
                  <span class="workout-label-icon">📝</span>
                  <span>Catatan (opsional)</span>
                </label>
                <input 
                  type="text" 
                  id="workout-notes" 
                  class="workout-input" 
                  placeholder="PR, target, dll..."
                />
              </div>
            </div>

            <!-- Quick Duration Buttons -->
            <div class="workout-quick-duration">
              <button class="workout-quick-duration-btn" data-duration="15">15 menit</button>
              <button class="workout-quick-duration-btn" data-duration="30">30 menit</button>
              <button class="workout-quick-duration-btn" data-duration="45">45 menit</button>
              <button class="workout-quick-duration-btn" data-duration="60">60 menit</button>
            </div>

            <!-- Action Buttons -->
            <div class="workout-actions">
              <button class="workout-btn-add" id="workout-add-btn">
                <span>➕</span>
                <span>Tambah Workout</span>
              </button>
              <button class="workout-btn-export" id="workout-export-btn">
                <span>📥</span>
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Statistics & Chart -->
        <div class="workout-side-panel">
          <!-- Weekly Chart -->
          <div class="workout-chart-card">
            <div class="workout-panel-header">
              <span class="workout-panel-icon">📊</span>
              <span class="workout-panel-title">Aktivitas 7 Hari</span>
            </div>
            <div class="workout-chart-content">
              <canvas id="workout-chart" width="400" height="240"></canvas>
            </div>
          </div>

          <!-- Category Stats -->
          <div class="workout-category-stats-card">
            <div class="workout-panel-header">
              <span class="workout-panel-icon">📈</span>
              <span class="workout-panel-title">Kategori Favorit</span>
            </div>
            <div class="workout-category-stats-content" id="workout-category-stats"></div>
          </div>
        </div>
      </div>

      <!-- History List -->
      <div class="workout-history-section">
        <div class="workout-panel-header">
          <span class="workout-panel-icon">📋</span>
          <span class="workout-panel-title">Riwayat Latihan</span>
          <div class="workout-history-filter">
            <button class="workout-filter-btn active" data-filter="all">Semua</button>
            <button class="workout-filter-btn" data-filter="today">Hari Ini</button>
            <button class="workout-filter-btn" data-filter="week">Minggu Ini</button>
            <button class="workout-filter-btn" data-filter="month">Bulan Ini</button>
          </div>
        </div>
        <div class="workout-history-content" id="workout-history"></div>
      </div>
    </div>
  `;

  // Elements
  const categoryBtns = document.querySelectorAll('.workout-category-btn');
  const quickExercisesSection = document.getElementById('workout-quick-exercises');
  const quickGrid = document.getElementById('workout-quick-grid');
  const nameInput = document.getElementById('workout-name-input');
  const durationInput = document.getElementById('workout-duration-input');
  const decreaseDurationBtn = document.getElementById('decrease-duration');
  const increaseDurationBtn = document.getElementById('increase-duration');
  const intensityInput = document.getElementById('workout-intensity');
  const caloriesInput = document.getElementById('workout-calories');
  const notesInput = document.getElementById('workout-notes');
  const quickDurationBtns = document.querySelectorAll('.workout-quick-duration-btn');
  const addBtn = document.getElementById('workout-add-btn');
  const exportBtn = document.getElementById('workout-export-btn');
  const filterBtns = document.querySelectorAll('.workout-filter-btn');
  const canvas = document.getElementById('workout-chart');
  const ctx = canvas.getContext('2d');

  let selectedCategory = null;
  let currentFilter = 'all';

  // Category selection
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const categoryId = btn.dataset.category;
      selectedCategory = EXERCISE_CATEGORIES.find(c => c.id === categoryId);
      
      categoryBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      
      // Show quick exercises
      quickGrid.innerHTML = selectedCategory.exercises.map(ex => 
        `<button class="workout-quick-exercise-btn" data-exercise="${ex}">
          ${selectedCategory.icon} ${ex}
        </button>`
      ).join('');
      
      quickExercisesSection.style.display = 'block';
      
      // Add event listeners to quick exercise buttons
      document.querySelectorAll('.workout-quick-exercise-btn').forEach(exBtn => {
        exBtn.addEventListener('click', () => {
          nameInput.value = exBtn.dataset.exercise;
        });
      });
    });
  });

  // Duration controls
  decreaseDurationBtn.addEventListener('click', () => {
    const current = parseInt(durationInput.value) || 30;
    if (current > 1) durationInput.value = current - 5;
  });

  increaseDurationBtn.addEventListener('click', () => {
    const current = parseInt(durationInput.value) || 30;
    durationInput.value = current + 5;
  });

  // Quick duration
  quickDurationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      durationInput.value = btn.dataset.duration;
    });
  });

  // Add workout
  addBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const duration = parseInt(durationInput.value);
    const intensity = intensityInput.value;
    const calories = parseInt(caloriesInput.value) || 0;
    const notes = notesInput.value.trim();
    
    if (!name || !duration) {
      showToast('⚠️ Nama latihan dan durasi wajib diisi!');
      return;
    }
    
    const workouts = loadWorkouts();
    const newWorkout = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      name,
      duration,
      intensity,
      calories,
      notes,
      category: selectedCategory ? selectedCategory.id : 'other',
      categoryIcon: selectedCategory ? selectedCategory.icon : '🏋️',
      timestamp: new Date().toISOString()
    };
    
    workouts.unshift(newWorkout);
    saveWorkouts(workouts);
    
    // Update stats
    updateStats();
    
    // Clear form
    nameInput.value = '';
    durationInput.value = '30';
    caloriesInput.value = '';
    notesInput.value = '';
    intensityInput.value = 'sedang';
    categoryBtns.forEach(b => b.classList.remove('selected'));
    quickExercisesSection.style.display = 'none';
    selectedCategory = null;
    
    showToast('💪 Workout berhasil ditambahkan!');
    render();
  });

  // Filter
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderHistory();
    });
  });

  // Export
  exportBtn.addEventListener('click', () => {
    const workouts = loadWorkouts();
    if (workouts.length === 0) {
      showToast('⚠️ Tidak ada data untuk diexport');
      return;
    }
    
    let csv = 'Tanggal,Waktu,Latihan,Durasi (menit),Intensitas,Kalori,Kategori,Catatan\n';
    workouts.forEach(w => {
      const category = EXERCISE_CATEGORIES.find(c => c.id === w.category);
      const categoryLabel = category ? category.label : 'Lainnya';
      const notes = (w.notes || '').replace(/"/g, '""');
      csv += `"${w.date}","${w.time || '-'}","${w.name}",${w.duration},"${w.intensity || '-'}",${w.calories || 0},"${categoryLabel}","${notes}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `workout-log-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    
    showToast('📥 Data workout berhasil diexport!');
  });

  function updateStats() {
    const workouts = loadWorkouts();
    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
    
    // Calculate streak
    let streak = 0;
    const today = new Date();
    const dates = new Set();
    
    workouts.forEach(w => dates.add(w.date));
    
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      
      if (dates.has(key)) {
        streak++;
      } else {
        break;
      }
    }
    
    // Week count
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekKey = weekStart.toISOString().slice(0, 10);
    
    const weekWorkouts = workouts.filter(w => w.date >= weekKey).length;
    
    const stats = { totalWorkouts, totalMinutes, streak, weekWorkouts };
    saveStats(stats);
    
    return stats;
  }

  function renderChart() {
    const workouts = loadWorkouts();
    const today = new Date();
    const days = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
      
      const dayWorkouts = workouts.filter(w => w.date === key);
      const totalMinutes = dayWorkouts.reduce((sum, w) => sum + w.duration, 0);
      
      days.push({ key, label: dayName, minutes: totalMinutes, count: dayWorkouts.length });
    }

    const w = canvas.width;
    const h = canvas.height;
    const padding = 40;
    const chartH = h - padding * 2;
    const chartW = w - padding * 2;
    const barWidth = chartW / days.length;
    const maxMinutes = Math.max(...days.map(d => d.minutes), 60);

    ctx.clearRect(0, 0, w, h);

    // Draw bars
    days.forEach((day, idx) => {
      const barHeight = (day.minutes / maxMinutes) * chartH;
      const x = padding + idx * barWidth;
      const y = h - padding - barHeight;
      
      // Bar
      const gradient = ctx.createLinearGradient(0, y, 0, h - padding);
      gradient.addColorStop(0, '#f59e0b');
      gradient.addColorStop(1, '#ef4444');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
      
      // Value
      if (day.minutes > 0) {
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`${day.minutes}m`, x + barWidth / 2, y - 5);
      }
      
      // Label
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px system-ui';
      ctx.fillText(day.label, x + barWidth / 2, h - 15);
    });
  }

  function renderCategoryStats() {
    const workouts = loadWorkouts();
    const categoryCounts = {};
    
    workouts.forEach(w => {
      categoryCounts[w.category] = (categoryCounts[w.category] || 0) + 1;
    });
    
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    if (sortedCategories.length === 0) {
      document.getElementById('workout-category-stats').innerHTML = `
        <div class="workout-category-stats-empty">
          <div class="workout-category-stats-empty-icon">📊</div>
          <div class="workout-category-stats-empty-text">Belum ada data</div>
        </div>
      `;
      return;
    }
    
    const total = workouts.length;
    
    const html = sortedCategories.map(([catId, count]) => {
      const category = EXERCISE_CATEGORIES.find(c => c.id === catId);
      const percent = Math.round((count / total) * 100);
      
      return `
        <div class="workout-category-stat-item">
          <div class="workout-category-stat-info">
            <span class="workout-category-stat-icon">${category ? category.icon : '🏋️'}</span>
            <span class="workout-category-stat-label">${category ? category.label : 'Lainnya'}</span>
          </div>
          <div class="workout-category-stat-bar-container">
            <div class="workout-category-stat-bar" style="width: ${percent}%; background: ${category ? category.color : '#94a3b8'};"></div>
          </div>
          <div class="workout-category-stat-value">${count}x</div>
        </div>
      `;
    }).join('');
    
    document.getElementById('workout-category-stats').innerHTML = html;
  }

  function renderHistory() {
    const workouts = loadWorkouts();
    let filtered = workouts;
    
    const today = new Date().toISOString().slice(0, 10);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().slice(0, 10);
    
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthKey = monthStart.toISOString().slice(0, 10);
    
    if (currentFilter === 'today') {
      filtered = workouts.filter(w => w.date === today);
    } else if (currentFilter === 'week') {
      filtered = workouts.filter(w => w.date >= weekKey);
    } else if (currentFilter === 'month') {
      filtered = workouts.filter(w => w.date >= monthKey);
    }
    
    if (filtered.length === 0) {
      document.getElementById('workout-history').innerHTML = `
        <div class="workout-history-empty">
          <div class="workout-history-empty-icon">🏋️</div>
          <div class="workout-history-empty-text">Belum ada workout di periode ini</div>
        </div>
      `;
      return;
    }
    
    const html = filtered.map(workout => {
      const date = new Date(workout.date);
      const dateStr = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const category = EXERCISE_CATEGORIES.find(c => c.id === workout.category);
      
      const intensityClass = workout.intensity === 'berat' ? 'high' : workout.intensity === 'sedang' ? 'medium' : 'low';
      const intensityIcon = workout.intensity === 'berat' ? '🔴' : workout.intensity === 'sedang' ? '🟡' : '🟢';
      
      return `
        <div class="workout-history-item">
          <div class="workout-history-icon" style="background: ${category ? category.color : '#94a3b8'};">
            ${workout.categoryIcon || '🏋️'}
          </div>
          <div class="workout-history-content">
            <div class="workout-history-header">
              <div class="workout-history-name">${workout.name}</div>
              <div class="workout-history-date">${dateStr} • ${workout.time || '-'}</div>
            </div>
            <div class="workout-history-meta">
              <span class="workout-meta-badge">
                <span>⏱️</span>
                <span>${workout.duration} menit</span>
              </span>
              <span class="workout-meta-badge intensity-${intensityClass}">
                <span>${intensityIcon}</span>
                <span>${workout.intensity || 'sedang'}</span>
              </span>
              ${workout.calories ? `
                <span class="workout-meta-badge">
                  <span>🔥</span>
                  <span>${workout.calories} kal</span>
                </span>
              ` : ''}
              ${category ? `
                <span class="workout-meta-badge">
                  <span>${category.icon}</span>
                  <span>${category.label}</span>
                </span>
              ` : ''}
            </div>
            ${workout.notes ? `<div class="workout-history-notes">${workout.notes}</div>` : ''}
          </div>
          <button class="workout-delete-btn" data-id="${workout.id}">
            <span>🗑️</span>
          </button>
        </div>
      `;
    }).join('');
    
    document.getElementById('workout-history').innerHTML = html;
    
    // Add delete listeners
    document.querySelectorAll('.workout-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Hapus workout ini?')) {
          const id = parseInt(btn.dataset.id);
          const workouts = loadWorkouts();
          const filtered = workouts.filter(w => w.id !== id);
          saveWorkouts(filtered);
          updateStats();
          showToast('🗑️ Workout dihapus');
          render();
        }
      });
    });
  }

  function render() {
    const stats = updateStats();
    
    document.getElementById('workout-total').textContent = stats.totalWorkouts;
    document.getElementById('workout-minutes').textContent = stats.totalMinutes;
    document.getElementById('workout-streak').textContent = stats.streak;
    document.getElementById('workout-week').textContent = stats.weekWorkouts;
    
    renderChart();
    renderCategoryStats();
    renderHistory();
  }

  render();
}
