import { refreshDashboard, showToast } from "../app.js";

const KEY = "aolt-todos";

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(KEY, JSON.stringify(todos));
  refreshDashboard();
}

export function getTodoSummary() {
  const todos = loadTodos();
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTodos = todos.filter((t) => !t.date || t.date === todayStr);
  const total = todayTodos.length;
  const done = todayTodos.filter((t) => t.done).length;
  const remaining = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, remaining, percent };
}

export function initTodo() {
  const section = document.getElementById("todo");
  section.innerHTML = `
    <div class="todo-header">
      <div class="todo-header-left">
        <div class="todo-icon">✅</div>
        <div>
          <div class="todo-header-title">To-Do List</div>
          <div class="todo-header-subtitle">Kelola tugas harian Anda dengan lebih produktif</div>
        </div>
      </div>
      <div class="todo-stats" id="todo-stats">
        <div class="stat-box stat-box-blue">
          <div class="stat-value" id="stat-total">0</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-box stat-box-green">
          <div class="stat-value" id="stat-done">0</div>
          <div class="stat-label">Selesai</div>
        </div>
        <div class="stat-box stat-box-orange">
          <div class="stat-value" id="stat-pending">0</div>
          <div class="stat-label">Belum</div>
        </div>
      </div>
    </div>

    <div class="todo-add-card">
      <div class="add-card-header">
        <span class="add-card-icon">➕</span>
        <span class="add-card-title">Tambah Tugas Baru</span>
      </div>
      <div class="add-card-body">
        <input id="todo-title" class="todo-input" placeholder="Apa yang ingin dikerjakan hari ini?" />
        <div class="add-card-controls">
          <div class="control-group">
            <label class="control-label">
              <span class="control-icon">🎯</span>
              Prioritas
            </label>
            <select id="todo-priority" class="todo-select">
              <option value="high">🔴 Tinggi</option>
              <option value="medium" selected>🟡 Sedang</option>
              <option value="low">🟢 Rendah</option>
            </select>
          </div>
          <div class="control-group">
            <label class="control-label">
              <span class="control-icon">📅</span>
              Tanggal
            </label>
            <input id="todo-date" type="date" class="todo-input-date" />
          </div>
          <button id="todo-add" class="todo-btn-add">
            <span class="btn-icon">✨</span>
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>
    </div>

    <div class="todo-filters-card">
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">🔍 Filter:</label>
          <div class="filter-pills">
            <button class="filter-pill active" data-filter="all">Semua</button>
            <button class="filter-pill" data-filter="today">Hari Ini</button>
            <button class="filter-pill" data-filter="pending">Belum Selesai</button>
            <button class="filter-pill" data-filter="done">Sudah Selesai</button>
          </div>
        </div>
        <div class="filter-group">
          <label class="filter-label">📊 Urutkan:</label>
          <div class="filter-pills">
            <button class="sort-pill active" data-sort="priority">Prioritas</button>
            <button class="sort-pill" data-sort="date">Tanggal</button>
            <button class="sort-pill" data-sort="title">Judul</button>
          </div>
        </div>
      </div>
      <div class="search-row">
        <div class="search-box">
          <span class="search-icon">🔎</span>
          <input id="todo-search" class="search-input" placeholder="Cari tugas..." />
        </div>
        <button id="todo-clear-done" class="btn-clear">
          <span>🗑️</span>
          <span>Bersihkan Selesai</span>
        </button>
      </div>
    </div>

    <div class="todo-list-container">
      <div id="todo-empty-state" class="todo-empty">
        <div class="empty-icon">📋</div>
        <div class="empty-title">Belum ada tugas</div>
        <div class="empty-subtitle">Mulai tambahkan tugas pertama Anda di atas!</div>
      </div>
      <div id="todo-list" class="todo-list"></div>
    </div>
  `;

  const titleInput = document.getElementById("todo-title");
  const prioritySelect = document.getElementById("todo-priority");
  const dateInput = document.getElementById("todo-date");
  const addBtn = document.getElementById("todo-add");
  const listEl = document.getElementById("todo-list");
  const searchEl = document.getElementById("todo-search");
  const clearDoneBtn = document.getElementById("todo-clear-done");
  const emptyState = document.getElementById("todo-empty-state");
  const statTotal = document.getElementById("stat-total");
  const statDone = document.getElementById("stat-done");
  const statPending = document.getElementById("stat-pending");
  
  dateInput.value = new Date().toISOString().slice(0, 10);

  let currentFilter = "all";
  let sortMode = "priority";

  function updateStats(todos) {
    const total = todos.length;
    const done = todos.filter(t => t.done).length;
    const pending = total - done;
    
    statTotal.textContent = total;
    statDone.textContent = done;
    statPending.textContent = pending;
  }

  function render() {
    const todos = loadTodos();
    const todayStr = new Date().toISOString().slice(0, 10);
    const query = searchEl.value.trim().toLowerCase();

    updateStats(todos);

    const filtered = todos
      .filter((t) => {
        if (currentFilter === "today") return !t.date || t.date === todayStr;
        if (currentFilter === "done") return t.done;
        if (currentFilter === "pending") return !t.done;
        return true;
      })
      .filter((t) => (query ? t.title.toLowerCase().includes(query) : true));

    if (filtered.length === 0) {
      emptyState.style.display = "flex";
      listEl.style.display = "none";
      return;
    }

    emptyState.style.display = "none";
    listEl.style.display = "block";
    listEl.innerHTML = "";

    const sorted = filtered.slice().sort((a, b) => {
      if (sortMode === "date") {
        return (a.date || "") > (b.date || "") ? 1 : -1;
      }
      if (sortMode === "title") {
        return a.title.localeCompare(b.title, "id-ID");
      }
      const order = { high: 0, medium: 1, low: 2 };
      if (order[a.priority] !== order[b.priority]) {
        return order[a.priority] - order[b.priority];
      }
      return a.done === b.done ? 0 : a.done ? 1 : -1;
    });

    sorted.forEach((todo, index) => {
      const originalIndex = todos.indexOf(todo);
      const priorityIcons = { high: "🔴", medium: "🟡", low: "🟢" };
      const priorityLabels = { high: "Tinggi", medium: "Sedang", low: "Rendah" };
      
      const row = document.createElement("div");
      row.className = `todo-card ${todo.done ? "todo-card-done" : ""}`;
      row.innerHTML = `
        <div class="todo-card-left">
          <label class="todo-checkbox-wrapper">
            <input type="checkbox" class="todo-checkbox" ${todo.done ? "checked" : ""} data-action="toggle" data-index="${originalIndex}" />
            <span class="checkbox-custom"></span>
          </label>
          <div class="todo-content">
            <div class="todo-title-text ${todo.done ? "todo-done" : ""}" data-action="edit" data-index="${originalIndex}">
              ${todo.title}
            </div>
            <div class="todo-meta-row">
              <span class="todo-badge todo-badge-${todo.priority}">
                ${priorityIcons[todo.priority]} ${priorityLabels[todo.priority]}
              </span>
              <span class="todo-date">
                📅 ${todo.date ? new Date(todo.date + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "Tanpa tanggal"}
              </span>
            </div>
          </div>
        </div>
        <div class="todo-card-actions">
          <button class="todo-action-btn todo-edit-btn" data-action="edit" data-index="${originalIndex}" title="Edit">
            ✏️
          </button>
          <button class="todo-action-btn todo-delete-btn" data-action="delete" data-index="${originalIndex}" title="Hapus">
            🗑️
          </button>
        </div>
      `;
      listEl.appendChild(row);
    });
  }

  addBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    if (!title) {
      showToast("Isi nama tugas terlebih dahulu.", "danger");
      titleInput.focus();
      return;
    }
    const todos = loadTodos();
    todos.push({
      title,
      priority: prioritySelect.value,
      date: dateInput.value || null,
      done: false,
    });
    saveTodos(todos);
    titleInput.value = "";
    showToast("✅ Tugas berhasil ditambahkan!", "success");
    render();
  });

  searchEl.addEventListener("input", render);

  titleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBtn.click();
    }
  });

  // Filter buttons
  section.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      section.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  // Sort buttons
  section.querySelectorAll(".sort-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      section.querySelectorAll(".sort-pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      sortMode = btn.dataset.sort;
      render();
    });
  });

  clearDoneBtn.addEventListener("click", () => {
    let todos = loadTodos();
    const before = todos.length;
    todos = todos.filter((t) => !t.done);
    saveTodos(todos);
    render();
    if (before !== todos.length) {
      showToast("🗑️ Tugas selesai telah dibersihkan!", "success");
    } else {
      showToast("Tidak ada tugas selesai untuk dibersihkan.", "danger");
    }
  });

  listEl.addEventListener("click", (e) => {
    const action = e.target.dataset.action || e.target.closest("[data-action]")?.dataset.action;
    const indexStr = e.target.dataset.index || e.target.closest("[data-action]")?.dataset.index;
    const index = Number(indexStr);
    if (!Number.isInteger(index)) return;
    
    const todos = loadTodos();
    if (action === "toggle") {
      todos[index].done = !todos[index].done;
      saveTodos(todos);
      showToast(todos[index].done ? "✅ Tugas selesai!" : "↩️ Tugas dibuka kembali", "success");
      render();
    } else if (action === "delete") {
      if (confirm(`Hapus tugas "${todos[index].title}"?`)) {
        todos.splice(index, 1);
        saveTodos(todos);
        showToast("🗑️ Tugas dihapus!", "success");
        render();
      }
    } else if (action === "edit") {
      const newTitle = prompt("Edit tugas:", todos[index].title);
      if (newTitle !== null && newTitle.trim()) {
        todos[index].title = newTitle.trim();
        saveTodos(todos);
        showToast("✏️ Tugas diperbarui!", "success");
        render();
      }
    }
  });

  render();
}
