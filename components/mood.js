import { refreshDashboard } from "../app.js";

const KEY = "aolt-mood";

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

export function getMoodSummary() {
  const map = loadMoods();
  const key = todayKey();
  const entry = map[key];
  if (!entry) return { label: "Belum diisi", note: "", moodClass: "" };
  const label = entry.mood;
  const moodClass = entry.mood === "bahagia" ? "chip-success" : entry.mood === "sedih" ? "chip-danger" : "";
  return { label, note: entry.note, moodClass };
}

export function initMood() {
  const section = document.getElementById("mood");
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Mood Tracker</div>
          <div class="card-subtitle">Simpan suasana hati setiap hari dan lihat pola mood selama seminggu.</div>
        </div>
      </div>
      <div class="mt-md grid-2">
        <div>
          <select id="mood-select" class="select">
            <option value="bahagia">Bahagia</option>
            <option value="normal">Normal</option>
            <option value="sedih">Sedih</option>
            <option value="marah">Marah</option>
          </select>
          <textarea id="mood-note" class="textarea mt-sm" rows="3" placeholder="Catatan singkat..."></textarea>
          <button id="mood-save" class="btn btn-primary mt-sm">Simpan</button>
        </div>
        <div>
          <canvas id="mood-chart" width="320" height="180" style="width:100%;"></canvas>
        </div>
      </div>
    </div>
  `;

  const selectEl = document.getElementById("mood-select");
  const noteEl = document.getElementById("mood-note");
  const saveBtn = document.getElementById("mood-save");
  const canvas = document.getElementById("mood-chart");
  const ctx = canvas.getContext("2d");

  function renderChart() {
    const map = loadMoods();
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const entry = map[key];
      days.push({ key, label: d.getDate(), mood: entry ? entry.mood : null });
    }

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const gap = w / (days.length + 1);
    const centerY = h / 2;

    days.forEach((d, idx) => {
      let color = "#9ca3af";
      if (d.mood === "bahagia") color = "#22c55e";
      else if (d.mood === "sedih") color = "#3b82f6";
      else if (d.mood === "marah") color = "#ef4444";
      else if (d.mood === "normal") color = "#eab308";
      const x = gap * (idx + 1);
      ctx.beginPath();
      ctx.arc(x, centerY, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = "#6b7280";
      ctx.font = "11px system-ui";
      ctx.fillText(String(d.label), x - 4, h - 6);
    });
  }

  saveBtn.addEventListener("click", () => {
    const map = loadMoods();
    const key = todayKey();
    map[key] = { mood: selectEl.value, note: noteEl.value.trim() };
    saveMoods(map);
    renderChart();
  });

  renderChart();
}
