import { refreshDashboard, showToast } from "../app.js";

const KEY = "aolt-weekly-planner";

function defaultState() {
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  return days.map((d) => ({ day: d, items: [] }));
}

function loadPlanner() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || defaultState();
  } catch {
    return defaultState();
  }
}

function savePlanner(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function initPlanner() {
  const section = document.getElementById("planner");
  section.innerHTML = `
    <div class="planner-header">
      <div class="planner-header-content">
        <div class="planner-header-left">
          <div class="planner-icon">📅</div>
          <div>
            <div class="planner-header-title">Weekly Planner</div>
            <div class="planner-header-subtitle">Rencanakan minggu Anda dengan efektif</div>
          </div>
        </div>
        <button class="planner-clear-btn" id="planner-clear-week">
          <span>🗑️</span> Clear Week
        </button>
      </div>
    </div>

    <div class="planner-stats-row">
      <div class="planner-stat-card">
        <div class="planner-stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">📊</div>
        <div>
          <div class="planner-stat-value" id="planner-stat-total">0</div>
          <div class="planner-stat-label">Total Tasks</div>
        </div>
      </div>
      <div class="planner-stat-card">
        <div class="planner-stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">✅</div>
        <div>
          <div class="planner-stat-value" id="planner-stat-done">0</div>
          <div class="planner-stat-label">Completed</div>
        </div>
      </div>
      <div class="planner-stat-card">
        <div class="planner-stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">🔥</div>
        <div>
          <div class="planner-stat-value" id="planner-stat-busy">-</div>
          <div class="planner-stat-label">Busiest Day</div>
        </div>
      </div>
    </div>

    <div class="planner-tips-card">
      <div class="planner-tips-icon">💡</div>
      <div>
        <strong>Tips:</strong> Gunakan untuk agenda berulang mingguan (kuliah, meeting, olahraga). 
        Seret task antar hari untuk mengubah jadwal. Klik checkbox untuk tandai selesai.
      </div>
    </div>

    <div class="planner-grid" id="planner-grid"></div>
  `;

  const grid = document.getElementById("planner-grid");
  let data = loadPlanner();

  function updateStats() {
    let total = 0;
    let done = 0;
    let maxTasks = 0;
    let busiestDay = "-";

    data.forEach((col) => {
      total += col.items.length;
      done += col.items.filter((item) => typeof item === "object" && item.done).length;
      if (col.items.length > maxTasks) {
        maxTasks = col.items.length;
        busiestDay = col.day;
      }
    });

    document.getElementById("planner-stat-total").textContent = total;
    document.getElementById("planner-stat-done").textContent = done;
    document.getElementById("planner-stat-busy").textContent = busiestDay;
  }

  function render() {
    grid.innerHTML = "";
    
    data.forEach((col, dayIndex) => {
      const totalTasks = col.items.length;
      const doneTasks = col.items.filter((item) => typeof item === "object" && item.done).length;
      const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

      const card = document.createElement("div");
      card.className = "planner-day-card";
      card.innerHTML = `
        <div class="planner-day-header">
          <div class="planner-day-name">${col.day}</div>
          <div class="planner-day-count">${totalTasks} task${totalTasks !== 1 ? 's' : ''}</div>
        </div>
        <div class="planner-day-progress">
          <div class="planner-day-progress-bar" style="width: ${progress}%"></div>
        </div>
        <div class="planner-add-wrapper">
          <input class="planner-add-input" data-day="${dayIndex}" placeholder="+ Tambah task..." />
        </div>
        <div class="planner-column" data-day="${dayIndex}"></div>
      `;
      grid.appendChild(card);

      const list = card.querySelector(".planner-column");
      
      if (col.items.length === 0) {
        list.innerHTML = '<div class="planner-empty">📋<br>Belum ada task</div>';
      } else {
        col.items.forEach((item, itemIndex) => {
          const taskText = typeof item === "object" ? item.text : item;
          const isDone = typeof item === "object" && item.done;
          const priority = typeof item === "object" ? item.priority : "normal";

          const el = document.createElement("div");
          el.className = `planner-task ${isDone ? "planner-task-done" : ""} planner-task-${priority}`;
          el.draggable = true;
          el.dataset.day = dayIndex;
          el.dataset.index = itemIndex;
          el.innerHTML = `
            <label class="planner-task-checkbox">
              <input type="checkbox" ${isDone ? "checked" : ""} data-day="${dayIndex}" data-index="${itemIndex}" />
              <span class="planner-task-checkmark"></span>
            </label>
            <div class="planner-task-content">
              <div class="planner-task-text">${taskText}</div>
            </div>
            <button class="planner-task-delete" data-day="${dayIndex}" data-index="${itemIndex}">×</button>
          `;
          list.appendChild(el);
        });
      }
    });

    updateStats();
  }

  grid.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("input[data-day]")) {
      const dayIndex = Number(e.target.dataset.day);
      const value = e.target.value.trim();
      if (!value) return;
      data[dayIndex].items.push({ text: value, done: false, priority: "normal" });
      savePlanner(data);
      refreshDashboard();
      e.target.value = "";
      render();
      showToast("✅ Task ditambahkan!");
    }
  });

  grid.addEventListener("change", (e) => {
    if (e.target.matches('.planner-task-checkbox input[type="checkbox"]')) {
      const dayIndex = Number(e.target.dataset.day);
      const itemIndex = Number(e.target.dataset.index);
      const item = data[dayIndex].items[itemIndex];
      if (typeof item === "object") {
        item.done = e.target.checked;
      } else {
        data[dayIndex].items[itemIndex] = { text: item, done: e.target.checked, priority: "normal" };
      }
      savePlanner(data);
      refreshDashboard();
      render();
      showToast(e.target.checked ? "✅ Task selesai!" : "🔄 Task dibuka kembali");
    }
  });

  grid.addEventListener("click", (e) => {
    if (e.target.matches(".planner-task-delete")) {
      const dayIndex = Number(e.target.dataset.day);
      const itemIndex = Number(e.target.dataset.index);
      if (confirm("Hapus task ini?")) {
        data[dayIndex].items.splice(itemIndex, 1);
        savePlanner(data);
        refreshDashboard();
        render();
        showToast("🗑️ Task dihapus");
      }
    }
  });

  let dragInfo = null;

  grid.addEventListener("dragstart", (e) => {
    if (e.target.matches(".planner-task")) {
      e.target.classList.add("planner-task-dragging");
      dragInfo = {
        fromDay: Number(e.target.dataset.day),
        fromIndex: Number(e.target.dataset.index),
        item: data[Number(e.target.dataset.day)].items[Number(e.target.dataset.index)],
      };
    }
  });

  grid.addEventListener("dragend", (e) => {
    if (e.target.matches(".planner-task")) {
      e.target.classList.remove("planner-task-dragging");
      document.querySelectorAll(".planner-column").forEach((col) => {
        col.classList.remove("planner-column-dragover");
      });
    }
  });

  grid.addEventListener("dragover", (e) => {
    const col = e.target.closest(".planner-column");
    if (col) {
      e.preventDefault();
      col.classList.add("planner-column-dragover");
    }
  });

  grid.addEventListener("dragleave", (e) => {
    const col = e.target.closest(".planner-column");
    if (col && !col.contains(e.relatedTarget)) {
      col.classList.remove("planner-column-dragover");
    }
  });

  grid.addEventListener("drop", (e) => {
    const col = e.target.closest(".planner-column");
    if (!col || !dragInfo) return;
    const toDay = Number(col.dataset.day);
    if (Number.isNaN(toDay)) return;
    
    col.classList.remove("planner-column-dragover");
    data[dragInfo.fromDay].items.splice(dragInfo.fromIndex, 1);
    data[toDay].items.push(dragInfo.item);
    dragInfo = null;
    savePlanner(data);
    refreshDashboard();
    render();
    showToast("📅 Task dipindahkan!");
  });

  document.getElementById("planner-clear-week").addEventListener("click", () => {
    if (confirm("Hapus semua task minggu ini?")) {
      data = defaultState();
      savePlanner(data);
      refreshDashboard();
      render();
      showToast("🗑️ Semua task dihapus");
    }
  });

  render();
}
