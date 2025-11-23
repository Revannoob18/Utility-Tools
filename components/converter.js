export function initConverter() {
  const section = document.getElementById("converter");
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Konverter Satuan</div>
          <div class="card-subtitle">Konversi cepat antar satuan umum: panjang, berat, suhu, dan kecepatan.</div>
        </div>
      </div>
      <div class="grid-2 mt-md">
        <div>
          <select id="conv-type" class="select">
            <option value="length">Panjang (m, km)</option>
            <option value="weight">Berat (kg, g)</option>
            <option value="temp">Suhu (C, F)</option>
            <option value="speed">Kecepatan (km/h, m/s)</option>
          </select>
          <input id="conv-input" type="number" class="input mt-sm" placeholder="Nilai" />
          <select id="conv-from" class="select mt-sm"></select>
          <select id="conv-to" class="select mt-sm"></select>
          <button id="conv-do" class="btn btn-primary mt-sm">Konversi</button>
        </div>
        <div>
          <div class="card-subtitle">Hasil:</div>
          <div id="conv-result" class="mt-sm"></div>
        </div>
      </div>
    </div>
  `;

  const typeEl = document.getElementById("conv-type");
  const inputEl = document.getElementById("conv-input");
  const fromEl = document.getElementById("conv-from");
  const toEl = document.getElementById("conv-to");
  const btn = document.getElementById("conv-do");
  const resultEl = document.getElementById("conv-result");

  const units = {
    length: ["m", "km"],
    weight: ["kg", "g"],
    temp: ["C", "F"],
    speed: ["km/h", "m/s"],
  };

  function fillUnits() {
    const type = typeEl.value;
    const opts = units[type];
    fromEl.innerHTML = "";
    toEl.innerHTML = "";
    opts.forEach((u) => {
      const o1 = document.createElement("option");
      o1.value = u;
      o1.textContent = u;
      fromEl.appendChild(o1);
      const o2 = document.createElement("option");
      o2.value = u;
      o2.textContent = u;
      toEl.appendChild(o2);
    });
    toEl.selectedIndex = 1;
  }

  function convert() {
    const type = typeEl.value;
    const val = Number(inputEl.value);
    const from = fromEl.value;
    const to = toEl.value;
    if (Number.isNaN(val)) return;
    let out = val;
    if (type === "length") {
      if (from === "m" && to === "km") out = val / 1000;
      else if (from === "km" && to === "m") out = val * 1000;
    } else if (type === "weight") {
      if (from === "kg" && to === "g") out = val * 1000;
      else if (from === "g" && to === "kg") out = val / 1000;
    } else if (type === "temp") {
      if (from === "C" && to === "F") out = (val * 9) / 5 + 32;
      else if (from === "F" && to === "C") out = ((val - 32) * 5) / 9;
    } else if (type === "speed") {
      if (from === "km/h" && to === "m/s") out = (val * 1000) / 3600;
      else if (from === "m/s" && to === "km/h") out = (val * 3600) / 1000;
    }
    resultEl.textContent = `${val} ${from} = ${out} ${to}`;
  }

  typeEl.addEventListener("change", fillUnits);
  btn.addEventListener("click", convert);

  fillUnits();
}
