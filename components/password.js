function generatePassword(length, useUpper, useLower, useDigits, useSymbols) {
  let chars = "";
  if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (useLower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (useDigits) chars += "0123456789";
  if (useSymbols) chars += "!@#$%^&*()-_=+[]{}";
  if (!chars) return "";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * chars.length);
    out += chars[idx];
  }
  return out;
}

export function initPassword() {
  const section = document.getElementById("password");
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Password Generator</div>
          <div class="card-subtitle">Buat password acak yang kuat sesuai kebutuhan akun Anda.</div>
        </div>
      </div>
      <div class="mt-md">
        <div class="flex-gap">
          <label>Panjang: <input id="pw-length" type="number" min="4" max="64" value="12" class="input" style="width:80px;" /></label>
          <label><input type="checkbox" id="pw-upper" checked /> Huruf besar</label>
          <label><input type="checkbox" id="pw-lower" checked /> Huruf kecil</label>
          <label><input type="checkbox" id="pw-digits" checked /> Angka</label>
          <label><input type="checkbox" id="pw-symbols" /> Simbol</label>
        </div>
        <button id="pw-generate" class="btn btn-primary mt-sm">Generate</button>
        <input id="pw-output" class="input mt-sm" readonly />
      </div>
    </div>
  `;

  const lenEl = document.getElementById("pw-length");
  const upEl = document.getElementById("pw-upper");
  const lowEl = document.getElementById("pw-lower");
  const digEl = document.getElementById("pw-digits");
  const symEl = document.getElementById("pw-symbols");
  const genBtn = document.getElementById("pw-generate");
  const outEl = document.getElementById("pw-output");

  genBtn.addEventListener("click", () => {
    const length = Number(lenEl.value) || 12;
    const pw = generatePassword(length, upEl.checked, lowEl.checked, digEl.checked, symEl.checked);
    outEl.value = pw || "Pilih minimal satu jenis karakter.";
  });
}
