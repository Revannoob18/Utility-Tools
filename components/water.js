import { refreshDashboard } from "../app.js";

const KEY = "aolt-water";

function loadWater() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { target: 8, current: 0 };
  } catch {
    return { target: 8, current: 0 };
  }
}

function saveWater(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  refreshDashboard();
}

export function getWaterSummary() {
  const { target, current } = loadWater();
  const percent = target === 0 ? 0 : Math.min(100, Math.round((current / target) * 100));
  return { target, current, percent };
}

export function initWater() {
  const section = document.getElementById("water");
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Water Intake Tracker</div>
          <div class="card-subtitle">Tentukan target gelas per hari dan klik setiap kali selesai minum.</div>
        </div>
      </div>
      <div class="mt-md">
        <div class="flex-gap">
          <label>Target gelas: <input id="water-target" type="number" min="1" class="input" style="width:80px;" /></label>
          <button id="water-inc" class="btn btn-primary">+ 1 Gelas</button>
          <button id="water-reset" class="btn btn-ghost">Reset</button>
        </div>
        <div class="mt-sm">Saat ini: <strong id="water-current"></strong> gelas</div>
        <div class="progress-bar mt-sm"><div id="water-progress" class="progress-bar-inner"></div></div>
      </div>
    </div>
  `;

  const targetEl = document.getElementById("water-target");
  const incEl = document.getElementById("water-inc");
  const resetEl = document.getElementById("water-reset");
  const currentEl = document.getElementById("water-current");
  const progressEl = document.getElementById("water-progress");

  let state = loadWater();

  function render() {
    targetEl.value = state.target;
    currentEl.textContent = state.current;
    const { percent } = getWaterSummary();
    progressEl.style.width = `${percent}%`;
  }

  targetEl.addEventListener("change", () => {
    const v = Number(targetEl.value);
    if (!v) return;
    state.target = v;
    saveWater(state);
    render();
  });

  incEl.addEventListener("click", () => {
    state.current += 1;
    saveWater(state);
    render();
  });

  resetEl.addEventListener("click", () => {
    state.current = 0;
    saveWater(state);
    render();
  });

  render();
}
