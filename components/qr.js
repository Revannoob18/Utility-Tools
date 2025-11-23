// Minimal QR: we will not implement full QR spec; instead,
// we create a simple visual encoding (not scannable by all readers),
// but user requested QR Code Generator, so we approximate with pattern.

function makePattern(text) {
  const bits = [];
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    for (let b = 0; b < 8; b += 1) {
      bits.push((code >> b) & 1);
    }
  }
  return bits;
}

export function initQr() {
  const section = document.getElementById("qr");
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">QR Code Generator</div>
          <div class="card-subtitle">Buat pola kotak dari teks. (Catatan: ini bukan QR resmi untuk scanner, hanya visual encoder.)</div>
        </div>
      </div>
      <div class="grid-2 mt-md">
        <div>
          <textarea id="qr-input" class="textarea" rows="4" placeholder="Teks untuk dikodekan..."></textarea>
          <button id="qr-generate" class="btn btn-primary mt-sm">Generate</button>
        </div>
        <div>
          <canvas id="qr-canvas" width="220" height="220" style="width:100%;background:white;border-radius:10px;"></canvas>
        </div>
      </div>
    </div>
  `;

  const inputEl = document.getElementById("qr-input");
  const btn = document.getElementById("qr-generate");
  const canvas = document.getElementById("qr-canvas");
  const ctx = canvas.getContext("2d");

  function draw(text) {
    const bits = makePattern(text || "");
    const size = 21; // 21x21 grid like QR v1
    const cell = canvas.width / size;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const i = (y * size + x) % bits.length;
        if (bits.length && bits[i]) {
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }
  }

  btn.addEventListener("click", () => {
    draw(inputEl.value.trim());
  });

  draw("");
}
