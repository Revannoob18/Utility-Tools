const KEY = "aolt-recipes";

function loadRecipes() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecipes(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function initRecipes() {
  const section = document.getElementById("recipes");
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Recipe Manager</div>
          <div class="card-subtitle">Simpan resep favorit + foto (base64)</div>
        </div>
      </div>
      <div class="grid-2 mt-md">
        <div>
          <input id="rec-title" class="input" placeholder="Nama resep" />
          <textarea id="rec-steps" class="textarea mt-sm" rows="4" placeholder="Langkah singkat"></textarea>
          <input id="rec-photo" type="file" accept="image/*" class="mt-sm" />
          <button id="rec-add" class="btn btn-primary mt-sm">+ Simpan</button>
        </div>
        <div id="rec-list" style="max-height:260px; overflow:auto;"></div>
      </div>
    </div>
  `;

  const titleEl = document.getElementById("rec-title");
  const stepsEl = document.getElementById("rec-steps");
  const photoEl = document.getElementById("rec-photo");
  const addBtn = document.getElementById("rec-add");
  const listEl = document.getElementById("rec-list");

  function render() {
    const list = loadRecipes();
    listEl.innerHTML = "";
    list.forEach((r) => {
      const card = document.createElement("div");
      card.className = "card mt-sm";
      card.innerHTML = `
        <strong>${r.title}</strong>
        <div class="card-subtitle mt-sm">${r.steps}</div>
        ${r.photo ? `<img src="${r.photo}" alt="${r.title}" style="margin-top:0.5rem;max-width:100%;border-radius:10px;"/>` : ""}
      `;
      listEl.appendChild(card);
    });
  }

  addBtn.addEventListener("click", () => {
    const title = titleEl.value.trim();
    const steps = stepsEl.value.trim();
    if (!title || !steps) return;

    const file = photoEl.files[0];
    const save = (photo) => {
      const list = loadRecipes();
      list.push({ title, steps, photo });
      saveRecipes(list);
      titleEl.value = "";
      stepsEl.value = "";
      photoEl.value = "";
      render();
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => save(e.target.result);
      reader.readAsDataURL(file);
    } else {
      save(null);
    }
  });

  render();
}
