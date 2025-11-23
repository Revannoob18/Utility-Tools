const KEY = "aolt-sholat-city";

function loadCity() {
  return localStorage.getItem(KEY) || "Jakarta";
}

function saveCity(city) {
  localStorage.setItem(KEY, city);
}

export function initSholat() {
  const section = document.getElementById("sholat");
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Jadwal Sholat</div>
          <div class="card-subtitle">Masukkan nama kota di Indonesia untuk melihat jadwal sholat hari ini.</div>
        </div>
      </div>
      <div class="mt-md flex-gap">
        <input id="sholat-city" class="input" placeholder="Kota (mis: Jakarta)" />
        <button id="sholat-load" class="btn btn-primary">Muat</button>
      </div>
      <div class="mt-md" id="sholat-result" class="card-subtitle"></div>
    </div>
  `;

  const cityEl = document.getElementById("sholat-city");
  const loadBtn = document.getElementById("sholat-load");
  const resultEl = document.getElementById("sholat-result");

  cityEl.value = loadCity();

  function load() {
    const city = cityEl.value.trim() || "Jakarta";
    saveCity(city);
    const today = new Date();
    const d = today.getDate();
    const m = today.getMonth() + 1;
    const y = today.getFullYear();
    const url = `https://api.aladhan.com/v1/timingsByCity/${d}-${m}-${y}?city=${encodeURIComponent(city)}&country=Indonesia&method=2`;
    resultEl.textContent = "Memuat...";
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (!json.data) throw new Error("Data tidak tersedia");
        const t = json.data.timings;
        resultEl.innerHTML = `
          <div class="card-subtitle">${city}</div>
          <table class="table-simple mt-sm">
            <tbody>
              <tr><td>Subuh</td><td>${t.Fajr}</td></tr>
              <tr><td>Dzuhur</td><td>${t.Dhuhr}</td></tr>
              <tr><td>Ashar</td><td>${t.Asr}</td></tr>
              <tr><td>Maghrib</td><td>${t.Maghrib}</td></tr>
              <tr><td>Isya</td><td>${t.Isha}</td></tr>
            </tbody>
          </table>
        `;
      })
      .catch((err) => {
        resultEl.textContent = `Gagal memuat: ${err.message}`;
      });
  }

  loadBtn.addEventListener("click", load);
  load();
}
