import { refreshDashboard, showToast } from "../app.js";

const KEY = "aolt-finance";

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
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Personal Finance Tracker</div>
          <div class="card-subtitle">Lacak pemasukan dan pengeluaran harian/bulanan secara sederhana.</div>
        </div>
      </div>
      <div class="grid-2 mt-md">
        <div>
          <select id="fin-type" class="select">
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <input id="fin-amount" type="number" min="0" class="input mt-sm" placeholder="Jumlah (Rp)" />
          <input id="fin-category" class="input mt-sm" placeholder="Kategori (misal: Makan)" />
          <input id="fin-date" type="date" class="input mt-sm" />
          <button id="fin-add" class="btn btn-primary mt-sm">+ Simpan</button>
        </div>
        <div>
          <div class="card-subtitle" id="fin-summary-text"></div>
          <div class="mt-sm">
            <label class="card-subtitle">Budget bulan ini (opsional):</label>
            <input id="fin-budget" type="number" min="0" class="input mt-sm" placeholder="Contoh: 3000000" />
            <div class="progress-bar mt-sm">
              <div id="fin-budget-bar" class="progress-bar-inner"></div>
            </div>
            <div class="card-subtitle mt-sm" id="fin-budget-text"></div>
          </div>
          <canvas id="fin-chart" width="320" height="180" style="width:100%; margin-top:0.6rem;"></canvas>
        </div>
      </div>
      <div class="mt-md">
        <div class="flex-between mt-sm">
          <div class="card-subtitle">Riwayat transaksi</div>
          <select id="fin-filter" class="select" style="width:150px;">
            <option value="month">Bulan ini</option>
            <option value="all">Semua waktu</option>
          </select>
        </div>
        <table class="table-simple" id="fin-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Jenis</th>
              <th>Kategori</th>
              <th>Jumlah</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;

  const typeEl = document.getElementById("fin-type");
  const amountEl = document.getElementById("fin-amount");
  const categoryEl = document.getElementById("fin-category");
  const dateEl = document.getElementById("fin-date");
  const addBtn = document.getElementById("fin-add");
  const tableBody = document.querySelector("#fin-table tbody");
  const canvas = document.getElementById("fin-chart");
  const ctx = canvas.getContext("2d");
  const summaryEl = document.getElementById("fin-summary-text");
  const filterEl = document.getElementById("fin-filter");
  const budgetInput = document.getElementById("fin-budget");
  const budgetBar = document.getElementById("fin-budget-bar");
  const budgetText = document.getElementById("fin-budget-text");
  let budget = Number(localStorage.getItem("aolt-finance-budget") || 0);
  if (budget) budgetInput.value = String(budget);

  dateEl.value = new Date().toISOString().slice(0, 10);

  function renderSummary() {
    const list = loadTx();
    if (list.length === 0) {
      summaryEl.textContent = "Belum ada transaksi. Mulai dengan mencatat 1 pemasukan atau pengeluaran.";
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const month = todayStr.slice(0, 7);
    let income = 0;
    let expense = 0;
    list.forEach((t) => {
      if (t.date.startsWith(month)) {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
      }
    });
    const balance = income - expense;
    summaryEl.textContent = `Bulan ini: Income Rp ${income.toLocaleString("id-ID")}, Expense Rp ${expense.toLocaleString("id-ID")}, Selisih Rp ${balance.toLocaleString("id-ID")}.`;

    if (budget > 0) {
      const percent = Math.min(100, Math.round((expense / budget) * 100));
      budgetBar.style.width = `${percent}%`;
      budgetText.textContent = `Pengeluaran sudah ${percent}% dari budget Rp ${budget.toLocaleString("id-ID")}.`;
    } else {
      budgetBar.style.width = "0%";
      budgetText.textContent = "Belum ada budget. Isi untuk melihat progress pengeluaran vs budget.";
    }
  }

  function renderTable() {
    const list = loadTx();
    const todayStr = new Date().toISOString().slice(0, 10);
    const month = todayStr.slice(0, 7);
    const mode = filterEl.value;
    const filtered = list.filter((t) => {
      if (mode === "month") return t.date.startsWith(month);
      return true;
    });
    tableBody.innerHTML = "";
    filtered
      .slice()
      .reverse()
      .forEach((t) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${t.date}</td>
          <td>${t.type === "income" ? "Income" : "Expense"}</td>
          <td>${t.category}</td>
          <td>Rp ${t.amount.toLocaleString("id-ID")}</td>
        `;
        tableBody.appendChild(tr);
      });
  }

  function renderChart() {
    const list = loadTx();
    const todayStr = new Date().toISOString().slice(0, 10);
    const month = todayStr.slice(0, 7);
    let income = 0;
    let expense = 0;
    list.forEach((t) => {
      if (t.date.startsWith(month)) {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
      }
    });

    const max = Math.max(income, expense, 1);
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const barWidth = 60;
    const gap = 40;
    const baseY = h - 20;

    function drawBar(x, value, color, label) {
      const height = (value / max) * (h - 60);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, baseY - height, barWidth, height, 8);
      ctx.fill();
      ctx.fillStyle = "#6b7280";
      ctx.font = "12px system-ui";
      ctx.fillText(label, x, baseY + 14);
    }

    drawBar(w / 2 - barWidth - gap / 2, income, "#22c55e", "Income");
    drawBar(w / 2 + gap / 2, expense, "#ef4444", "Expense");
  }

  addBtn.addEventListener("click", () => {
    const amount = Number(amountEl.value);
    const cat = categoryEl.value.trim();
    const date = dateEl.value || new Date().toISOString().slice(0, 10);
    if (!amount || !cat) {
      showToast("Isi jumlah dan kategori transaksi.", "danger");
      return;
    }
    const list = loadTx();
    list.push({
      type: typeEl.value,
      amount,
      category: cat,
      date,
    });
    saveTx(list);
    amountEl.value = "";
    categoryEl.value = "";
    renderTable();
    renderChart();
    renderSummary();
  });

  renderTable();
  renderChart();
  renderSummary();

  filterEl.addEventListener("change", () => {
    renderTable();
  });

  budgetInput.addEventListener("change", () => {
    const value = Number(budgetInput.value);
    budget = Number.isFinite(value) && value > 0 ? value : 0;
    localStorage.setItem("aolt-finance-budget", String(budget));
    renderSummary();
    showToast("Budget bulan ini diperbarui.", "success");
  });
}
