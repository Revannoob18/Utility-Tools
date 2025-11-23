import { refreshDashboard } from "../app.js";

// Default: Berlin coordinates per user-given example URL
const DEFAULT_COORD = { lat: 52.52, lon: 13.41 };
const KEY = "aolt-weather";

function loadCoords() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || DEFAULT_COORD;
  } catch {
    return DEFAULT_COORD;
  }
}

function saveCoords(c) {
  localStorage.setItem(KEY, JSON.stringify(c));
}

let latestSummary = { description: "Belum dimuat" };

export function getWeatherSummary() {
  return latestSummary;
}

export function initWeather() {
  const section = document.getElementById("weather");
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Cuaca Real-Time</div>
          <div class="card-subtitle">Masukkan koordinat (latitude & longitude) untuk melihat suhu dari Open-Meteo.</div>
        </div>
      </div>
      <div class="mt-md grid-2">
        <div>
          <label class="card-subtitle">Latitude</label>
          <input id="weather-lat" class="input" type="number" step="0.01" />
          <label class="card-subtitle mt-sm">Longitude</label>
          <input id="weather-lon" class="input" type="number" step="0.01" />
          <button id="weather-load" class="btn btn-primary mt-sm">Muat Cuaca</button>
        </div>
        <div>
          <div id="weather-info" class="card-subtitle">Belum dimuat.</div>
        </div>
      </div>
    </div>
  `;

  const latEl = document.getElementById("weather-lat");
  const lonEl = document.getElementById("weather-lon");
  const loadBtn = document.getElementById("weather-load");
  const infoEl = document.getElementById("weather-info");

  const coords = loadCoords();
  latEl.value = coords.lat;
  lonEl.value = coords.lon;

  function load() {
    const lat = Number(latEl.value) || DEFAULT_COORD.lat;
    const lon = Number(lonEl.value) || DEFAULT_COORD.lon;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`;
    saveCoords({ lat, lon });
    infoEl.textContent = "Memuat...";
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        const temps = json.hourly && json.hourly.temperature_2m;
        const times = json.hourly && json.hourly.time;
        if (!temps || temps.length === 0) throw new Error("Data tidak tersedia");
        const current = temps[0];
        latestSummary = { description: `${current}°C di koordinat (${lat.toFixed(2)}, ${lon.toFixed(2)})` };
        infoEl.textContent = latestSummary.description;
        refreshDashboard();
      })
      .catch((err) => {
        infoEl.textContent = `Gagal memuat: ${err.message}`;
      });
  }

  loadBtn.addEventListener("click", load);
  load();
}
