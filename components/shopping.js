const KEY = "aolt-shopping";

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function initShopping() {
  const section = document.getElementById("shopping");
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Daftar Belanja</div>
          <div class="card-subtitle">Tambah, centang, hapus item</div>
        </div>
      </div>
      <div class="mt-md flex-gap">
        <input id="shop-input" class="input" placeholder="Tambahkan item..." />
        <button id="shop-add" class="btn btn-primary">+ Tambah</button>
      </div>
      <div class="mt-md" id="shop-list"></div>
    </div>
  `;

  const input = document.getElementById("shop-input");
  const addBtn = document.getElementById("shop-add");
  const listEl = document.getElementById("shop-list");

  function render() {
    const items = loadItems();
    listEl.innerHTML = "";
    items.forEach((it, index) => {
      const row = document.createElement("div");
      row.className = "flex-between mt-sm";
      row.innerHTML = `
        <label class="flex-gap">
          <input type="checkbox" data-index="${index}" ${it.done ? "checked" : ""} />
          <span style="${it.done ? "text-decoration:line-through;opacity:0.6;" : ""}">${it.title}</span>
        </label>
        <button class="btn btn-ghost" data-delete="${index}">✕</button>
      `;
      listEl.appendChild(row);
    });
  }

  addBtn.addEventListener("click", () => {
    const title = input.value.trim();
    if (!title) return;
    const items = loadItems();
    items.push({ title, done: false });
    saveItems(items);
    input.value = "";
    render();
  });

  listEl.addEventListener("click", (e) => {
    if (e.target.matches("input[type=checkbox]")) {
      const i = Number(e.target.dataset.index);
      const items = loadItems();
      items[i].done = e.target.checked;
      saveItems(items);
      render();
    } else if (e.target.dataset.delete) {
      const i = Number(e.target.dataset.delete);
      const items = loadItems();
      items.splice(i, 1);
      saveItems(items);
      render();
    }
  });

  render();
}
