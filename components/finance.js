import { refreshDashboard, showToast } from "../app.js";

const KEY = "aolt-finance";
const BUDGET_KEY = "aolt-finance-budget";
const CATEGORIES_KEY = "aolt-finance-categories";

// Default categories
const defaultCategories = {
  income: ["Gaji", "Bonus", "Freelance", "Investasi", "Hadiah", "Lainnya"],
  expense: ["Makanan", "Transport", "Belanja", "Tagihan", "Hiburan", "Kesehatan", "Pendidikan", "Lainnya"]
};

function loadTx() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveTx(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  refreshDashboard();
}

function loadCategories() {
  try {
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || defaultCategories;
  } catch {
    return defaultCategories;
  }
}

function saveCategories(categories) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function getFinanceSummary() {
  const list = loadTx();
  const todayStr = new Date().toISOString().slice(0, 10);
  let spentToday = 0;
  let incomeMonth = 0;
  const month = todayStr.slice(0, 7);
  list.forEach((t) => {
    if (t.type === "expense" && t.date === todayStr) spentToday += t.amount;
    if (t.type === "income" && t.date.startsWith(month)) incomeMonth += t.amount;
  });
  return { spentToday, incomeMonth };
}

export function initFinance() {
  const section = document.getElementById("finance");
  let budget = Number(localStorage.getItem(BUDGET_KEY) || 0);
  let categories = loadCategories();
  
  section.innerHTML = `
    <div class="finance-container">
      <!-- Header -->
      <div class="finance-header">
        <div class="finance-header-content">
          <div class="finance-header-left">
            <div class="finance-icon">💰</div>
            <div>
              <div class="finance-header-title">Finance Tracker</div>
              <div class="finance-header-subtitle">Kelola keuangan pribadi dengan mudah</div>
            </div>
          </div>
          <div class="finance-stats">
            <div class="finance-stat-card finance-stat-income">
              <div class="finance-stat-icon">📈</div>
              <div class="finance-stat-content">
                <div class="finance-stat-label">Income Bulan Ini</div>
                <div class="finance-stat-value" id="total-income">Rp 0</div>
              </div>
            </div>
            <div class="finance-stat-card finance-stat-expense">
              <div class="finance-stat-icon">📉</div>
              <div class="finance-stat-content">
                <div class="finance-stat-label">Expense Bulan Ini</div>
                <div class="finance-stat-value" id="total-expense">Rp 0</div>
              </div>
            </div>
            <div class="finance-stat-card finance-stat-balance">
              <div class="finance-stat-icon">💵</div>
              <div class="finance-stat-content">
                <div class="finance-stat-label">Saldo</div>
                <div class="finance-stat-value" id="total-balance">Rp 0</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Add & Charts -->
      <div class="finance-main-grid">
        <!-- Quick Add Form -->
        <div class="finance-quick-add">
          <div class="finance-panel-header">
            <span class="finance-panel-icon">➕</span>
            <span class="finance-panel-title">Tambah Transaksi</span>
          </div>
          <div class="finance-form">
            <div class="finance-type-tabs">
              <button class="finance-type-tab active" data-type="expense">
                <span class="finance-type-icon">📉</span>
                <span>Pengeluaran</span>
              </button>
              <button class="finance-type-tab" data-type="income">
                <span class="finance-type-icon">📈</span>
                <span>Pemasukan</span>
              </button>
            </div>
            
            <div class="finance-form-group">
              <label class="finance-label">
                <span class="finance-label-icon">💵</span>
                <span>Jumlah (Rp)</span>
              </label>
              <input 
                id="fin-amount" 
                type="number" 
                min="0" 
                class="finance-input finance-input-amount" 
                placeholder="Contoh: 50000"
              />
            </div>

            <div class="finance-form-group">
              <label class="finance-label">
                <span class="finance-label-icon">🏷️</span>
                <span>Kategori</span>
              </label>
              <select id="fin-category" class="finance-input"></select>
            </div>

            <div class="finance-form-group">
              <label class="finance-label">
                <span class="finance-label-icon">📅</span>
                <span>Tanggal</span>
              </label>
              <input 
                id="fin-date" 
                type="date" 
                class="finance-input"
              />
            </div>

            <div class="finance-form-group">
              <label class="finance-label">
                <span class="finance-label-icon">📝</span>
                <span>Catatan (opsional)</span>
              </label>
              <input 
                id="fin-note" 
                class="finance-input" 
                placeholder="Contoh: Makan siang di restoran"
              />
            </div>

            <button id="fin-add" class="finance-btn-add">
              <span>💾</span>
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </div>

        <!-- Charts & Budget -->
        <div class="finance-charts">
          <!-- Budget Card -->
          <div class="finance-budget-card">
            <div class="finance-panel-header">
              <span class="finance-panel-icon">🎯</span>
              <span class="finance-panel-title">Budget Bulanan</span>
              <button class="finance-budget-edit" id="edit-budget" title="Edit Budget">✏️</button>
            </div>
            <div class="finance-budget-content">
              <div class="finance-budget-amount">
                <div class="finance-budget-label">Target Budget</div>
                <div class="finance-budget-value" id="budget-display">Belum diatur</div>
              </div>
              <div class="finance-budget-progress">
                <div class="finance-budget-bar">
                  <div class="finance-budget-bar-fill" id="budget-bar"></div>
                </div>
                <div class="finance-budget-info">
                  <span id="budget-used">Rp 0</span>
                  <span id="budget-percent">0%</span>
                </div>
              </div>
              <div class="finance-budget-status" id="budget-status"></div>
            </div>
          </div>

          <!-- Chart -->
          <div class="finance-chart-card">
            <div class="finance-panel-header">
              <span class="finance-panel-icon">📊</span>
              <span class="finance-panel-title">Visualisasi</span>
              <select id="chart-period" class="finance-chart-period">
                <option value="month">Bulan Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="all">Semua</option>
              </select>
            </div>
            <div class="finance-chart-content">
              <canvas id="fin-chart"></canvas>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="finance-category-card">
            <div class="finance-panel-header">
              <span class="finance-panel-icon">📋</span>
              <span class="finance-panel-title">Breakdown Kategori</span>
            </div>
            <div class="finance-category-list" id="category-breakdown"></div>
          </div>
        </div>
      </div>

      <!-- Transaction History -->
      <div class="finance-history">
        <div class="finance-panel-header">
          <div class="finance-panel-title-group">
            <span class="finance-panel-icon">📜</span>
            <span class="finance-panel-title">Riwayat Transaksi</span>
            <span class="finance-history-count" id="tx-count">0 transaksi</span>
          </div>
          <div class="finance-history-controls">
            <select id="fin-filter" class="finance-filter-select">
              <option value="month">Bulan Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="today">Hari Ini</option>
              <option value="all">Semua Waktu</option>
            </select>
            <button class="finance-btn-export" id="export-csv" title="Export ke CSV">
              <span>⬇️</span>
              <span>Export</span>
            </button>
          </div>
        </div>
        <div class="finance-transaction-list" id="transaction-list"></div>
      </div>

      <!-- Budget Modal -->
      <div class="finance-modal" id="budget-modal">
        <div class="finance-modal-content">
          <div class="finance-modal-header">
            <div class="finance-modal-title">🎯 Atur Budget Bulanan</div>
            <button class="finance-modal-close" id="close-budget-modal">✕</button>
          </div>
          <div class="finance-modal-body">
            <div class="finance-form-group">
              <label class="finance-label">Target Budget per Bulan</label>
              <input 
                id="budget-input" 
                type="number" 
                min="0" 
                class="finance-input finance-input-amount" 
                placeholder="Contoh: 5000000"
              />
            </div>
            <div class="finance-modal-hint">
              💡 Budget membantu Anda mengontrol pengeluaran bulanan
            </div>
          </div>
          <div class="finance-modal-footer">
            <button class="finance-btn-secondary" id="cancel-budget">Batal</button>
            <button class="finance-btn-primary" id="save-budget">💾 Simpan Budget</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Elements
  const amountEl = document.getElementById("fin-amount");
  const categoryEl = document.getElementById("fin-category");
  const dateEl = document.getElementById("fin-date");
  const noteEl = document.getElementById("fin-note");
  const addBtn = document.getElementById("fin-add");
  const typeTabs = document.querySelectorAll(".finance-type-tab");
  const filterEl = document.getElementById("fin-filter");
  const chartPeriodEl = document.getElementById("chart-period");
  const transactionList = document.getElementById("transaction-list");
  const budgetModal = document.getElementById("budget-modal");
  const editBudgetBtn = document.getElementById("edit-budget");
  const closeBudgetModalBtn = document.getElementById("close-budget-modal");
  const cancelBudgetBtn = document.getElementById("cancel-budget");
  const saveBudgetBtn = document.getElementById("save-budget");
  const budgetInputEl = document.getElementById("budget-input");
  const exportBtn = document.getElementById("export-csv");
  const canvas = document.getElementById("fin-chart");
  const ctx = canvas.getContext("2d");

  let currentType = "expense";
  dateEl.value = new Date().toISOString().slice(0, 10);
  
  function updateCategoryOptions() {
    const cats = categories[currentType];
    categoryEl.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  function formatRupiah(amount) {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  }

  function getDateRange(period) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const month = todayStr.slice(0, 7);
    
    if (period === 'today') {
      return (date) => date === todayStr;
    } else if (period === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().slice(0, 10);
      return (date) => date >= weekAgoStr && date <= todayStr;
    } else if (period === 'month') {
      return (date) => date.startsWith(month);
    }
    return () => true;
  }

  function calculateStats() {
    const list = loadTx();
    const filter = getDateRange('month');
    
    let income = 0;
    let expense = 0;
    
    list.forEach(t => {
      if (filter(t.date)) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    });
    
    const balance = income - expense;
    
    document.getElementById('total-income').textContent = formatRupiah(income);
    document.getElementById('total-expense').textContent = formatRupiah(expense);
    document.getElementById('total-balance').textContent = formatRupiah(balance);
    document.getElementById('total-balance').className = 'finance-stat-value ' + (balance >= 0 ? 'positive' : 'negative');
    
    return { income, expense, balance };
  }

  function updateBudgetDisplay() {
    const budgetDisplay = document.getElementById('budget-display');
    const budgetBar = document.getElementById('budget-bar');
    const budgetUsed = document.getElementById('budget-used');
    const budgetPercent = document.getElementById('budget-percent');
    const budgetStatus = document.getElementById('budget-status');
    
    if (budget <= 0) {
      budgetDisplay.textContent = 'Belum diatur';
      budgetBar.style.width = '0%';
      budgetUsed.textContent = 'Rp 0';
      budgetPercent.textContent = '0%';
      budgetStatus.innerHTML = '<span style="color: var(--text-secondary);">💡 Atur budget untuk tracking pengeluaran</span>';
      budgetBar.className = 'finance-budget-bar-fill';
      return;
    }
    
    budgetDisplay.textContent = formatRupiah(budget);
    
    const stats = calculateStats();
    const percent = budget > 0 ? Math.min(100, Math.round((stats.expense / budget) * 100)) : 0;
    
    budgetBar.style.width = `${percent}%`;
    budgetUsed.textContent = formatRupiah(stats.expense);
    budgetPercent.textContent = `${percent}%`;
    
    let statusClass = 'finance-budget-bar-fill';
    let statusText = '';
    
    if (percent < 50) {
      statusClass += ' safe';
      statusText = '<span style="color: #22c55e;">✅ Pengeluaran masih aman</span>';
    } else if (percent < 80) {
      statusClass += ' warning';
      statusText = '<span style="color: #f59e0b;">⚠️ Pengeluaran mendekati budget</span>';
    } else if (percent < 100) {
      statusClass += ' danger';
      statusText = '<span style="color: #ef4444;">🚨 Pengeluaran hampir melebihi budget!</span>';
    } else {
      statusClass += ' over';
      statusText = '<span style="color: #dc2626;">❌ Budget sudah terlampaui!</span>';
    }
    
    budgetBar.className = statusClass;
    budgetStatus.innerHTML = statusText;
  }

  function renderTransactions() {
    const list = loadTx();
    const period = filterEl.value;
    const filter = getDateRange(period);
    
    const filtered = list.filter(t => filter(t.date)).reverse();
    
    document.getElementById('tx-count').textContent = `${filtered.length} transaksi`;
    
    if (filtered.length === 0) {
      transactionList.innerHTML = `
        <div class="finance-empty-state">
          <div class="finance-empty-icon">📭</div>
          <div class="finance-empty-title">Belum ada transaksi</div>
          <div class="finance-empty-text">Mulai catat transaksi pertama Anda</div>
        </div>
      `;
      return;
    }
    
    transactionList.innerHTML = filtered.map((t, index) => `
      <div class="finance-transaction-item ${t.type}">
        <div class="finance-tx-icon">${t.type === 'income' ? '📈' : '📉'}</div>
        <div class="finance-tx-content">
          <div class="finance-tx-category">${t.category}</div>
          <div class="finance-tx-note">${t.note || '-'}</div>
          <div class="finance-tx-date">${new Date(t.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        <div class="finance-tx-amount ${t.type}">${formatRupiah(t.amount)}</div>
        <button class="finance-tx-delete" data-index="${list.length - 1 - index}" title="Hapus">🗑️</button>
      </div>
    `).join('');
    
    // Delete handlers
    document.querySelectorAll('.finance-tx-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(btn.dataset.index);
        if (confirm('Hapus transaksi ini?')) {
          list.splice(index, 1);
          saveTx(list);
          renderAll();
          showToast('🗑️ Transaksi dihapus');
        }
      });
    });
  }

  function renderCategoryBreakdown() {
    const list = loadTx();
    const filter = getDateRange('month');
    const breakdown = {};
    
    list.forEach(t => {
      if (filter(t.date) && t.type === 'expense') {
        breakdown[t.category] = (breakdown[t.category] || 0) + t.amount;
      }
    });
    
    const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((sum, [_, amount]) => sum + amount, 0);
    
    const container = document.getElementById('category-breakdown');
    
    if (sorted.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">Belum ada pengeluaran bulan ini</div>';
      return;
    }
    
    container.innerHTML = sorted.map(([cat, amount]) => {
      const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
      return `
        <div class="finance-category-item">
          <div class="finance-category-info">
            <div class="finance-category-name">${cat}</div>
            <div class="finance-category-amount">${formatRupiah(amount)}</div>
          </div>
          <div class="finance-category-bar">
            <div class="finance-category-bar-fill" style="width: ${percent}%"></div>
          </div>
          <div class="finance-category-percent">${percent}%</div>
        </div>
      `;
    }).join('');
  }

  function renderChart() {
    const list = loadTx();
    const period = chartPeriodEl.value;
    const filter = getDateRange(period);
    
    let income = 0;
    let expense = 0;
    
    list.forEach(t => {
      if (filter(t.date)) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    });
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 300 * 2;
    ctx.scale(2, 2);
    
    const w = canvas.width / 2;
    const h = canvas.height / 2;
    const max = Math.max(income, expense, 1);
    
    ctx.clearRect(0, 0, w, h);
    
    const barWidth = 80;
    const gap = 60;
    const baseY = h - 40;
    
    function drawBar(x, value, color, gradient, label) {
      const height = (value / max) * (h - 80);
      
      const grad = ctx.createLinearGradient(0, baseY - height, 0, baseY);
      grad.addColorStop(0, gradient[0]);
      grad.addColorStop(1, gradient[1]);
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, baseY - height, barWidth, height, [12, 12, 0, 0]);
      ctx.fill();
      
      // Value text
      ctx.fillStyle = color;
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(formatRupiah(value), x + barWidth / 2, baseY - height - 10);
      
      // Label
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px system-ui';
      ctx.fillText(label, x + barWidth / 2, baseY + 25);
    }
    
    drawBar(w / 2 - barWidth - gap / 2, income, '#22c55e', ['#22c55e', '#16a34a'], 'Pemasukan');
    drawBar(w / 2 + gap / 2, expense, '#ef4444', ['#ef4444', '#dc2626'], 'Pengeluaran');
  }

  function renderAll() {
    calculateStats();
    updateBudgetDisplay();
    renderTransactions();
    renderCategoryBreakdown();
    renderChart();
  }

  function exportToCSV() {
    const list = loadTx();
    if (list.length === 0) {
      showToast('❌ Tidak ada data untuk diekspor', 'error');
      return;
    }
    
    const headers = ['Tanggal', 'Tipe', 'Kategori', 'Jumlah', 'Catatan'];
    const rows = list.map(t => [
      t.date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.category,
      t.amount,
      t.note || ''
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('⬇️ Data berhasil diekspor!');
  }

  // Event Listeners
  typeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      typeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentType = tab.dataset.type;
      updateCategoryOptions();
    });
  });

  addBtn.addEventListener('click', () => {
    const amount = Number(amountEl.value);
    const category = categoryEl.value;
    const date = dateEl.value;
    const note = noteEl.value.trim();
    
    if (!amount || amount <= 0) {
      showToast('❌ Masukkan jumlah yang valid', 'error');
      return;
    }
    
    const list = loadTx();
    list.push({
      type: currentType,
      amount,
      category,
      date,
      note,
      timestamp: Date.now()
    });
    
    saveTx(list);
    
    amountEl.value = '';
    noteEl.value = '';
    dateEl.value = new Date().toISOString().slice(0, 10);
    
    renderAll();
    showToast(`💾 ${currentType === 'income' ? 'Pemasukan' : 'Pengeluaran'} berhasil ditambahkan!`);
  });

  filterEl.addEventListener('change', renderTransactions);
  chartPeriodEl.addEventListener('change', renderChart);

  // Budget modal
  editBudgetBtn.addEventListener('click', () => {
    budgetInputEl.value = budget > 0 ? budget : '';
    budgetModal.classList.add('active');
  });

  closeBudgetModalBtn.addEventListener('click', () => {
    budgetModal.classList.remove('active');
  });

  cancelBudgetBtn.addEventListener('click', () => {
    budgetModal.classList.remove('active');
  });

  saveBudgetBtn.addEventListener('click', () => {
    const value = Number(budgetInputEl.value);
    if (value > 0) {
      budget = value;
      localStorage.setItem(BUDGET_KEY, String(budget));
      updateBudgetDisplay();
      budgetModal.classList.remove('active');
      showToast('Budget berhasil diperbarui!');
    } else {
      showToast('Masukkan jumlah budget yang valid', 'error');
    }
  });

  exportBtn.addEventListener('click', exportToCSV);

  // Close modal on overlay click
  budgetModal.addEventListener('click', (e) => {
    if (e.target === budgetModal) {
      budgetModal.classList.remove('active');
    }
  });

  // Initialize
  updateCategoryOptions();
  renderAll();
}
