import { showToast } from "../app.js";

const KEY = "aolt-recipes";
const CATEGORIES_KEY = "aolt-recipes-categories";

// Default categories
const defaultCategories = [
  { name: "Sarapan", icon: "🍳", color: "#f59e0b" },
  { name: "Makan Siang", icon: "🍱", color: "#10b981" },
  { name: "Makan Malam", icon: "🍽️", color: "#ef4444" },
  { name: "Camilan", icon: "🍪", color: "#ec4899" },
  { name: "Minuman", icon: "🥤", color: "#06b6d4" },
  { name: "Dessert", icon: "🍰", color: "#8b5cf6" },
  { name: "Tradisional", icon: "🏮", color: "#d97706" },
  { name: "Internasional", icon: "🌍", color: "#3b82f6" }
];

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

function loadCategories() {
  try {
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || defaultCategories;
  } catch {
    return defaultCategories;
  }
}

export function initRecipes() {
  const section = document.getElementById("recipes");
  let categories = loadCategories();
  let currentRecipe = null;
  let currentFilter = "all";
  let searchQuery = "";
  
  section.innerHTML = `
    <div class="recipes-container">
      <!-- Header -->
      <div class="recipes-header">
        <div class="recipes-header-content">
          <div class="recipes-header-left">
            <div class="recipes-icon">👨‍🍳</div>
            <div>
              <div class="recipes-header-title">Recipe Manager</div>
              <div class="recipes-header-subtitle">Kelola resep masakan favorit Anda</div>
            </div>
          </div>
          <div class="recipes-stats">
            <div class="recipes-stat-card">
              <div class="recipes-stat-icon">📖</div>
              <div class="recipes-stat-content">
                <div class="recipes-stat-value" id="total-recipes">0</div>
                <div class="recipes-stat-label">Total Resep</div>
              </div>
            </div>
            <div class="recipes-stat-card">
              <div class="recipes-stat-icon">📂</div>
              <div class="recipes-stat-content">
                <div class="recipes-stat-value" id="total-categories">0</div>
                <div class="recipes-stat-label">Kategori</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="recipes-search-bar">
        <div class="recipes-search-input-wrapper">
          <span class="recipes-search-icon">🔍</span>
          <input 
            type="text" 
            id="recipe-search" 
            class="recipes-search-input" 
            placeholder="Cari resep..."
          />
        </div>
        <button class="recipes-add-btn" id="add-recipe-btn">
          <span>➕</span>
          <span>Tambah Resep</span>
        </button>
      </div>

      <!-- Categories Filter -->
      <div class="recipes-categories-filter">
        <button class="recipes-category-chip active" data-category="all">
          <span>📋</span>
          <span>Semua</span>
        </button>
        ${categories.map(cat => `
          <button class="recipes-category-chip" data-category="${cat.name}">
            <span>${cat.icon}</span>
            <span>${cat.name}</span>
          </button>
        `).join('')}
      </div>

      <!-- Recipes Grid -->
      <div class="recipes-grid" id="recipes-grid"></div>

      <!-- Add/Edit Recipe Modal -->
      <div class="recipes-modal" id="recipe-modal">
        <div class="recipes-modal-content recipes-modal-large">
          <div class="recipes-modal-header">
            <div class="recipes-modal-title" id="modal-title">➕ Tambah Resep Baru</div>
            <button class="recipes-modal-close" id="close-recipe-modal">✕</button>
          </div>
          <div class="recipes-modal-body">
            <div class="recipes-form-grid">
              <!-- Left Column -->
              <div class="recipes-form-left">
                <div class="recipes-form-group">
                  <label class="recipes-label">
                    <span class="recipes-label-icon">📝</span>
                    <span>Nama Resep</span>
                  </label>
                  <input 
                    id="recipe-title" 
                    class="recipes-input" 
                    placeholder="Contoh: Nasi Goreng Spesial"
                  />
                </div>

                <div class="recipes-form-row">
                  <div class="recipes-form-group">
                    <label class="recipes-label">
                      <span class="recipes-label-icon">📂</span>
                      <span>Kategori</span>
                    </label>
                    <select id="recipe-category" class="recipes-input">
                      ${categories.map(cat => `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`).join('')}
                    </select>
                  </div>
                  <div class="recipes-form-group">
                    <label class="recipes-label">
                      <span class="recipes-label-icon">⏱️</span>
                      <span>Waktu (menit)</span>
                    </label>
                    <input 
                      id="recipe-time" 
                      type="number" 
                      min="1"
                      class="recipes-input" 
                      placeholder="30"
                    />
                  </div>
                  <div class="recipes-form-group">
                    <label class="recipes-label">
                      <span class="recipes-label-icon">👥</span>
                      <span>Porsi</span>
                    </label>
                    <input 
                      id="recipe-servings" 
                      type="number" 
                      min="1"
                      class="recipes-input" 
                      placeholder="4"
                    />
                  </div>
                </div>

                <div class="recipes-form-group">
                  <label class="recipes-label">
                    <span class="recipes-label-icon">🥘</span>
                    <span>Bahan-bahan</span>
                  </label>
                  <textarea 
                    id="recipe-ingredients" 
                    class="recipes-textarea" 
                    rows="6"
                    placeholder="Contoh:&#10;- 2 piring nasi putih&#10;- 2 butir telur&#10;- 3 siung bawang putih&#10;- 1 sdm kecap manis&#10;- Garam dan merica secukupnya"
                  ></textarea>
                </div>

                <div class="recipes-form-group">
                  <label class="recipes-label">
                    <span class="recipes-label-icon">📋</span>
                    <span>Langkah-langkah</span>
                  </label>
                  <textarea 
                    id="recipe-steps" 
                    class="recipes-textarea" 
                    rows="8"
                    placeholder="Contoh:&#10;1. Panaskan minyak di wajan&#10;2. Tumis bawang putih hingga harum&#10;3. Masukkan telur, orak-arik&#10;4. Tambahkan nasi, aduk rata&#10;5. Beri kecap, garam, dan merica&#10;6. Masak hingga matang dan harum"
                  ></textarea>
                </div>
              </div>

              <!-- Right Column -->
              <div class="recipes-form-right">
                <div class="recipes-form-group">
                  <label class="recipes-label">
                    <span class="recipes-label-icon">📸</span>
                    <span>Foto Resep</span>
                  </label>
                  <div class="recipes-photo-upload" id="photo-upload-area">
                    <input 
                      type="file" 
                      id="recipe-photo" 
                      accept="image/*" 
                      style="display: none;"
                    />
                    <div class="recipes-photo-placeholder" id="photo-placeholder">
                      <div class="recipes-photo-icon">📷</div>
                      <div class="recipes-photo-text">Klik untuk upload foto</div>
                      <div class="recipes-photo-hint">JPG, PNG, max 5MB</div>
                    </div>
                    <img id="photo-preview" class="recipes-photo-preview" style="display: none;" />
                    <button class="recipes-photo-remove" id="remove-photo" style="display: none;">✕</button>
                  </div>
                </div>

                <div class="recipes-form-group">
                  <label class="recipes-label">
                    <span class="recipes-label-icon">📝</span>
                    <span>Tips & Catatan (opsional)</span>
                  </label>
                  <textarea 
                    id="recipe-notes" 
                    class="recipes-textarea" 
                    rows="4"
                    placeholder="Contoh: Gunakan nasi yang sudah dingin agar tidak lengket"
                  ></textarea>
                </div>

                <div class="recipes-form-group">
                  <label class="recipes-label">
                    <span class="recipes-label-icon">🌶️</span>
                    <span>Tingkat Kesulitan</span>
                  </label>
                  <select id="recipe-difficulty" class="recipes-input">
                    <option value="Mudah">😊 Mudah</option>
                    <option value="Sedang">😐 Sedang</option>
                    <option value="Sulit">😰 Sulit</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="recipes-modal-footer">
            <button class="recipes-btn-secondary" id="cancel-recipe-btn">Batal</button>
            <button class="recipes-btn-primary" id="save-recipe-btn">💾 Simpan Resep</button>
          </div>
        </div>
      </div>

      <!-- View Recipe Modal -->
      <div class="recipes-modal" id="view-modal">
        <div class="recipes-modal-content recipes-modal-large">
          <div class="recipes-modal-header">
            <div class="recipes-modal-title" id="view-title">Resep</div>
            <button class="recipes-modal-close" id="close-view-modal">✕</button>
          </div>
          <div class="recipes-modal-body" id="view-body">
            <!-- Content will be dynamically inserted -->
          </div>
          <div class="recipes-modal-footer">
            <button class="recipes-btn-secondary" id="close-view-btn">Tutup</button>
            <button class="recipes-btn-edit" id="edit-recipe-btn">✏️ Edit Resep</button>
            <button class="recipes-btn-delete" id="delete-recipe-btn">🗑️ Hapus</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Elements
  const recipesGrid = document.getElementById("recipes-grid");
  const recipeModal = document.getElementById("recipe-modal");
  const viewModal = document.getElementById("view-modal");
  const addRecipeBtn = document.getElementById("add-recipe-btn");
  const closeRecipeModalBtn = document.getElementById("close-recipe-modal");
  const cancelRecipeBtn = document.getElementById("cancel-recipe-btn");
  const saveRecipeBtn = document.getElementById("save-recipe-btn");
  const closeViewModalBtn = document.getElementById("close-view-modal");
  const closeViewBtn = document.getElementById("close-view-btn");
  const editRecipeBtn = document.getElementById("edit-recipe-btn");
  const deleteRecipeBtn = document.getElementById("delete-recipe-btn");
  const searchInput = document.getElementById("recipe-search");
  const categoryChips = document.querySelectorAll(".recipes-category-chip");
  
  const titleEl = document.getElementById("recipe-title");
  const categoryEl = document.getElementById("recipe-category");
  const timeEl = document.getElementById("recipe-time");
  const servingsEl = document.getElementById("recipe-servings");
  const ingredientsEl = document.getElementById("recipe-ingredients");
  const stepsEl = document.getElementById("recipe-steps");
  const notesEl = document.getElementById("recipe-notes");
  const difficultyEl = document.getElementById("recipe-difficulty");
  const photoEl = document.getElementById("recipe-photo");
  const photoUploadArea = document.getElementById("photo-upload-area");
  const photoPlaceholder = document.getElementById("photo-placeholder");
  const photoPreview = document.getElementById("photo-preview");
  const removePhotoBtn = document.getElementById("remove-photo");

  let currentPhotoData = null;

  function updateStats() {
    const recipes = loadRecipes();
    const categoriesUsed = new Set(recipes.map(r => r.category)).size;
    
    document.getElementById("total-recipes").textContent = recipes.length;
    document.getElementById("total-categories").textContent = categoriesUsed;
  }

  function renderRecipes() {
    const recipes = loadRecipes();
    
    let filtered = recipes;
    
    // Filter by category
    if (currentFilter !== "all") {
      filtered = filtered.filter(r => r.category === currentFilter);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.ingredients.toLowerCase().includes(query) ||
        r.steps.toLowerCase().includes(query)
      );
    }

    if (filtered.length === 0) {
      recipesGrid.innerHTML = `
        <div class="recipes-empty-state">
          <div class="recipes-empty-icon">👨‍🍳</div>
          <div class="recipes-empty-title">Belum ada resep</div>
          <div class="recipes-empty-text">Tambahkan resep masakan favorit Anda!</div>
        </div>
      `;
      return;
    }

    recipesGrid.innerHTML = filtered.map(recipe => {
      const cat = categories.find(c => c.name === recipe.category) || categories[0];
      return `
        <div class="recipes-card" data-recipe-id="${recipe.id}">
          <div class="recipes-card-image" style="background-image: url('${recipe.photo || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="60" fill="%239ca3af"%3E🍳%3C/text%3E%3C/svg%3E'}');">
            <div class="recipes-card-category" style="background: ${cat.color};">
              <span>${cat.icon}</span>
              <span>${recipe.category}</span>
            </div>
          </div>
          <div class="recipes-card-content">
            <div class="recipes-card-title">${recipe.title}</div>
            <div class="recipes-card-meta">
              ${recipe.time ? `<span class="recipes-meta-item">⏱️ ${recipe.time} menit</span>` : ''}
              ${recipe.servings ? `<span class="recipes-meta-item">👥 ${recipe.servings} porsi</span>` : ''}
              ${recipe.difficulty ? `<span class="recipes-meta-item">${recipe.difficulty === 'Mudah' ? '😊' : recipe.difficulty === 'Sedang' ? '😐' : '😰'} ${recipe.difficulty}</span>` : ''}
            </div>
            <div class="recipes-card-preview">${recipe.ingredients.split('\n')[0].substring(0, 50)}...</div>
          </div>
          <div class="recipes-card-footer">
            <button class="recipes-card-btn" data-view-recipe="${recipe.id}">
              <span>👁️</span>
              <span>Lihat Resep</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Add event listeners
    document.querySelectorAll('[data-view-recipe]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.viewRecipe);
        viewRecipe(id);
      });
    });
  }

  function viewRecipe(id) {
    const recipes = loadRecipes();
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    currentRecipe = recipe;
    const cat = categories.find(c => c.name === recipe.category) || categories[0];

    document.getElementById("view-title").textContent = recipe.title;
    document.getElementById("view-body").innerHTML = `
      <div class="recipes-view-content">
        ${recipe.photo ? `
          <div class="recipes-view-image">
            <img src="${recipe.photo}" alt="${recipe.title}" />
          </div>
        ` : ''}
        
        <div class="recipes-view-info">
          <div class="recipes-view-category" style="background: ${cat.color}20; color: ${cat.color};">
            <span>${cat.icon}</span>
            <span>${recipe.category}</span>
          </div>
          <div class="recipes-view-meta">
            ${recipe.time ? `<div class="recipes-view-meta-item"><span class="recipes-view-meta-icon">⏱️</span><span>${recipe.time} menit</span></div>` : ''}
            ${recipe.servings ? `<div class="recipes-view-meta-item"><span class="recipes-view-meta-icon">👥</span><span>${recipe.servings} porsi</span></div>` : ''}
            ${recipe.difficulty ? `<div class="recipes-view-meta-item"><span class="recipes-view-meta-icon">${recipe.difficulty === 'Mudah' ? '😊' : recipe.difficulty === 'Sedang' ? '😐' : '😰'}</span><span>${recipe.difficulty}</span></div>` : ''}
          </div>
        </div>

        <div class="recipes-view-section">
          <div class="recipes-view-section-title">
            <span class="recipes-view-section-icon">🥘</span>
            <span>Bahan-bahan</span>
          </div>
          <div class="recipes-view-section-content">
            ${recipe.ingredients.split('\n').map(line => `<div class="recipes-view-ingredient">${line}</div>`).join('')}
          </div>
        </div>

        <div class="recipes-view-section">
          <div class="recipes-view-section-title">
            <span class="recipes-view-section-icon">📋</span>
            <span>Langkah-langkah</span>
          </div>
          <div class="recipes-view-section-content">
            ${recipe.steps.split('\n').map(line => `<div class="recipes-view-step">${line}</div>`).join('')}
          </div>
        </div>

        ${recipe.notes ? `
          <div class="recipes-view-section">
            <div class="recipes-view-section-title">
              <span class="recipes-view-section-icon">💡</span>
              <span>Tips & Catatan</span>
            </div>
            <div class="recipes-view-section-content">
              <div class="recipes-view-notes">${recipe.notes}</div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    viewModal.classList.add('active');
  }

  function openAddRecipeModal() {
    currentRecipe = null;
    document.getElementById("modal-title").textContent = "➕ Tambah Resep Baru";
    
    titleEl.value = '';
    categoryEl.value = categories[0].name;
    timeEl.value = '';
    servingsEl.value = '';
    ingredientsEl.value = '';
    stepsEl.value = '';
    notesEl.value = '';
    difficultyEl.value = 'Mudah';
    currentPhotoData = null;
    photoPreview.style.display = 'none';
    photoPlaceholder.style.display = 'flex';
    removePhotoBtn.style.display = 'none';
    
    recipeModal.classList.add('active');
  }

  function openEditRecipeModal() {
    if (!currentRecipe) return;
    
    document.getElementById("modal-title").textContent = "✏️ Edit Resep";
    
    titleEl.value = currentRecipe.title;
    categoryEl.value = currentRecipe.category;
    timeEl.value = currentRecipe.time || '';
    servingsEl.value = currentRecipe.servings || '';
    ingredientsEl.value = currentRecipe.ingredients;
    stepsEl.value = currentRecipe.steps;
    notesEl.value = currentRecipe.notes || '';
    difficultyEl.value = currentRecipe.difficulty || 'Mudah';
    currentPhotoData = currentRecipe.photo;
    
    if (currentPhotoData) {
      photoPreview.src = currentPhotoData;
      photoPreview.style.display = 'block';
      photoPlaceholder.style.display = 'none';
      removePhotoBtn.style.display = 'block';
    }
    
    viewModal.classList.remove('active');
    recipeModal.classList.add('active');
  }

  function saveRecipe() {
    const title = titleEl.value.trim();
    const category = categoryEl.value;
    const time = Number(timeEl.value) || null;
    const servings = Number(servingsEl.value) || null;
    const ingredients = ingredientsEl.value.trim();
    const steps = stepsEl.value.trim();
    const notes = notesEl.value.trim();
    const difficulty = difficultyEl.value;

    if (!title || !ingredients || !steps) {
      showToast('Lengkapi nama, bahan, dan langkah resep', 'error');
      return;
    }

    const recipes = loadRecipes();
    
    if (currentRecipe) {
      // Edit existing
      const index = recipes.findIndex(r => r.id === currentRecipe.id);
      if (index !== -1) {
        recipes[index] = {
          ...recipes[index],
          title,
          category,
          time,
          servings,
          ingredients,
          steps,
          notes,
          difficulty,
          photo: currentPhotoData,
          updatedAt: new Date().toISOString()
        };
        showToast('Resep berhasil diperbarui!');
      }
    } else {
      // Add new
      recipes.push({
        id: Date.now(),
        title,
        category,
        time,
        servings,
        ingredients,
        steps,
        notes,
        difficulty,
        photo: currentPhotoData,
        createdAt: new Date().toISOString()
      });
      showToast('Resep berhasil ditambahkan!');
    }

    saveRecipes(recipes);
    recipeModal.classList.remove('active');
    renderRecipes();
    updateStats();
  }

  function deleteRecipe() {
    if (!currentRecipe) return;
    
    if (confirm(`Hapus resep "${currentRecipe.title}"?`)) {
      const recipes = loadRecipes();
      const filtered = recipes.filter(r => r.id !== currentRecipe.id);
      saveRecipes(filtered);
      viewModal.classList.remove('active');
      renderRecipes();
      updateStats();
      showToast('Resep berhasil dihapus');
    }
  }

  // Photo upload
  photoUploadArea.addEventListener('click', () => {
    photoEl.click();
  });

  photoEl.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file terlalu besar. Maksimal 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      currentPhotoData = event.target.result;
      photoPreview.src = currentPhotoData;
      photoPreview.style.display = 'block';
      photoPlaceholder.style.display = 'none';
      removePhotoBtn.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  removePhotoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentPhotoData = null;
    photoPreview.style.display = 'none';
    photoPlaceholder.style.display = 'flex';
    removePhotoBtn.style.display = 'none';
    photoEl.value = '';
  });

  // Event listeners
  addRecipeBtn.addEventListener('click', openAddRecipeModal);
  closeRecipeModalBtn.addEventListener('click', () => recipeModal.classList.remove('active'));
  cancelRecipeBtn.addEventListener('click', () => recipeModal.classList.remove('active'));
  saveRecipeBtn.addEventListener('click', saveRecipe);
  closeViewModalBtn.addEventListener('click', () => viewModal.classList.remove('active'));
  closeViewBtn.addEventListener('click', () => viewModal.classList.remove('active'));
  editRecipeBtn.addEventListener('click', openEditRecipeModal);
  deleteRecipeBtn.addEventListener('click', deleteRecipe);

  // Search
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderRecipes();
  });

  // Category filter
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.category;
      renderRecipes();
    });
  });

  // Close modals on overlay click
  recipeModal.addEventListener('click', (e) => {
    if (e.target === recipeModal) {
      recipeModal.classList.remove('active');
    }
  });

  viewModal.addEventListener('click', (e) => {
    if (e.target === viewModal) {
      viewModal.classList.remove('active');
    }
  });

  // Initialize
  updateStats();
  renderRecipes();
}
