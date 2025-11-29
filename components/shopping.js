import { showToast } from "../app.js";

const KEY = "aolt-shopping";
const CATEGORIES_KEY = "aolt-shopping-categories";
const LISTS_KEY = "aolt-shopping-lists";

// Default categories with icons
const defaultCategories = {
  "Makanan & Minuman": { icon: "🍔", color: "#f59e0b" },
  "Sayuran & Buah": { icon: "🥬", color: "#10b981" },
  "Daging & Ikan": { icon: "🥩", color: "#ef4444" },
  "Susu & Telur": { icon: "🥛", color: "#3b82f6" },
  "Roti & Kue": { icon: "🍞", color: "#d97706" },
  "Bumbu & Minyak": { icon: "🧂", color: "#8b5cf6" },
  "Minuman": { icon: "🥤", color: "#06b6d4" },
  "Snack": { icon: "🍿", color: "#ec4899" },
  "Kebersihan": { icon: "🧼", color: "#14b8a6" },
  "Perawatan": { icon: "💄", color: "#f43f5e" },
  "Elektronik": { icon: "📱", color: "#6366f1" },
  "Lainnya": { icon: "📦", color: "#6b7280" }
};

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

function loadCategories() {
  try {
    return JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || defaultCategories;
  } catch {
    return defaultCategories;
  }
}

function loadLists() {
  try {
    return JSON.parse(localStorage.getItem(LISTS_KEY)) || [{ id: Date.now(), name: "Belanja Utama", items: [] }];
  } catch {
    return [{ id: Date.now(), name: "Belanja Utama", items: [] }];
  }
}

function saveLists(lists) {
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
}

export function initShopping() {
  const section = document.getElementById("shopping");
  let categories = loadCategories();
  let lists = loadLists();
  let currentListId = lists[0].id;
  
  section.innerHTML = `
    <div class="shopping-container">
      <!-- Header -->
      <div class="shopping-header">
        <div class="shopping-header-content">
          <div class="shopping-header-left">
            <div class="shopping-icon">🛒</div>
            <div>
              <div class="shopping-header-title">Shopping List</div>
              <div class="shopping-header-subtitle">Kelola daftar belanja dengan mudah</div>
            </div>
          </div>
          <div class="shopping-stats">
            <div class="shopping-stat-card">
              <div class="shopping-stat-icon">📝</div>
              <div class="shopping-stat-content">
                <div class="shopping-stat-value" id="total-items">0</div>
                <div class="shopping-stat-label">Total Item</div>
              </div>
            </div>
            <div class="shopping-stat-card">
              <div class="shopping-stat-icon">✅</div>
              <div class="shopping-stat-content">
                <div class="shopping-stat-value" id="checked-items">0</div>
                <div class="shopping-stat-label">Sudah Dibeli</div>
              </div>
            </div>
            <div class="shopping-stat-card">
              <div class="shopping-stat-icon">💰</div>
              <div class="shopping-stat-content">
                <div class="shopping-stat-value" id="total-price">Rp 0</div>
                <div class="shopping-stat-label">Total Harga</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lists Tabs -->
      <div class="shopping-lists-tabs">
        <div class="shopping-tabs-container" id="lists-tabs"></div>
        <button class="shopping-add-list-btn" id="add-list-btn" title="Tambah List Baru">➕</button>
      </div>

      <!-- Main Content -->
      <div class="shopping-main-grid">
        <!-- Quick Add Form -->
        <div class="shopping-quick-add">
          <div class="shopping-panel-header">
            <span class="shopping-panel-icon">➕</span>
            <span class="shopping-panel-title">Tambah Item</span>
          </div>
          <div class="shopping-form">
            <div class="shopping-form-group">
              <label class="shopping-label">
                <span class="shopping-label-icon">🏷️</span>
                <span>Nama Item</span>
              </label>
              <input 
                id="item-name" 
                class="shopping-input" 
                placeholder="Contoh: Susu UHT 1 Liter"
              />
            </div>

            <div class="shopping-form-row">
              <div class="shopping-form-group">
                <label class="shopping-label">
                  <span class="shopping-label-icon">🔢</span>
                  <span>Jumlah</span>
                </label>
                <input 
                  id="item-qty" 
                  type="number" 
                  min="1" 
                  value="1"
                  class="shopping-input" 
                  placeholder="1"
                />
              </div>
              <div class="shopping-form-group">
                <label class="shopping-label">
                  <span class="shopping-label-icon">📏</span>
                  <span>Satuan</span>
                </label>
                <select id="item-unit" class="shopping-input">
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="gram">gram</option>
                  <option value="liter">liter</option>
                  <option value="ml">ml</option>
                  <option value="pack">pack</option>
                  <option value="box">box</option>
                  <option value="botol">botol</option>
                  <option value="kaleng">kaleng</option>
                </select>
              </div>
            </div>

            <div class="shopping-form-group">
              <label class="shopping-label">
                <span class="shopping-label-icon">💵</span>
                <span>Harga (opsional)</span>
              </label>
              <input 
                id="item-price" 
                type="number" 
                min="0"
                class="shopping-input" 
                placeholder="Contoh: 15000"
              />
            </div>

            <div class="shopping-form-group">
              <label class="shopping-label">
                <span class="shopping-label-icon">📂</span>
                <span>Kategori</span>
              </label>
              <select id="item-category" class="shopping-input"></select>
            </div>

            <div class="shopping-form-group">
              <label class="shopping-label">
                <span class="shopping-label-icon">📝</span>
                <span>Catatan (opsional)</span>
              </label>
              <input 
                id="item-note" 
                class="shopping-input" 
                placeholder="Contoh: Merek ABC"
              />
            </div>

            <button id="add-item-btn" class="shopping-btn-add">
              <span>💾</span>
              <span>Tambah ke List</span>
            </button>
          </div>
        </div>

        <!-- Items List -->
        <div class="shopping-items-section">
          <!-- Filter & Actions -->
          <div class="shopping-actions">
            <div class="shopping-filter-tabs">
              <button class="shopping-filter-tab active" data-filter="all">
                <span>📋</span>
                <span>Semua</span>
              </button>
              <button class="shopping-filter-tab" data-filter="pending">
                <span>🛒</span>
                <span>Belum Dibeli</span>
              </button>
              <button class="shopping-filter-tab" data-filter="done">
                <span>✅</span>
                <span>Sudah Dibeli</span>
              </button>
            </div>
            <div class="shopping-actions-btns">
              <button class="shopping-action-btn" id="clear-checked-btn" title="Hapus Item yang Sudah Dibeli">
                <span>🗑️</span>
                <span>Bersihkan</span>
              </button>
              <button class="shopping-action-btn" id="export-list-btn" title="Export Daftar">
                <span>⬇️</span>
                <span>Export</span>
              </button>
            </div>
          </div>

          <!-- Items List -->
          <div class="shopping-items-list" id="items-list"></div>
        </div>
      </div>

      <!-- Add List Modal -->
      <div class="shopping-modal" id="add-list-modal">
        <div class="shopping-modal-content">
          <div class="shopping-modal-header">
            <div class="shopping-modal-title">📝 Buat List Baru</div>
            <button class="shopping-modal-close" id="close-list-modal">✕</button>
          </div>
          <div class="shopping-modal-body">
            <div class="shopping-form-group">
              <label class="shopping-label">Nama List</label>
              <input 
                id="list-name-input" 
                class="shopping-input" 
                placeholder="Contoh: Belanja Bulanan"
              />
            </div>
            <div class="shopping-modal-hint">
              💡 Buat list terpisah untuk berbagai keperluan belanja
            </div>
          </div>
          <div class="shopping-modal-footer">
            <button class="shopping-btn-secondary" id="cancel-list-btn">Batal</button>
            <button class="shopping-btn-primary" id="save-list-btn">💾 Buat List</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Elements
  const itemNameEl = document.getElementById("item-name");
  const itemQtyEl = document.getElementById("item-qty");
  const itemUnitEl = document.getElementById("item-unit");
  const itemPriceEl = document.getElementById("item-price");
  const itemCategoryEl = document.getElementById("item-category");
  const itemNoteEl = document.getElementById("item-note");
  const addItemBtn = document.getElementById("add-item-btn");
  const itemsList = document.getElementById("items-list");
  const filterTabs = document.querySelectorAll(".shopping-filter-tab");
  const clearCheckedBtn = document.getElementById("clear-checked-btn");
  const exportListBtn = document.getElementById("export-list-btn");
  const addListBtn = document.getElementById("add-list-btn");
  const addListModal = document.getElementById("add-list-modal");
  const closeListModalBtn = document.getElementById("close-list-modal");
  const cancelListBtn = document.getElementById("cancel-list-btn");
  const saveListBtn = document.getElementById("save-list-btn");
  const listNameInput = document.getElementById("list-name-input");
  const listsTabsContainer = document.getElementById("lists-tabs");

  let currentFilter = "all";

  function updateCategoryOptions() {
    const cats = Object.keys(categories);
    itemCategoryEl.innerHTML = cats.map(c => 
      `<option value="${c}">${categories[c].icon} ${c}</option>`
    ).join('');
  }

  function getCurrentList() {
    return lists.find(l => l.id === currentListId) || lists[0];
  }

  function updateStats() {
    const list = getCurrentList();
    const items = list.items || [];
    const checked = items.filter(i => i.done).length;
    const total = items.reduce((sum, i) => sum + (i.price ? i.price * i.qty : 0), 0);
    
    document.getElementById("total-items").textContent = items.length;
    document.getElementById("checked-items").textContent = checked;
    document.getElementById("total-price").textContent = `Rp ${total.toLocaleString('id-ID')}`;
  }

  function renderListsTabs() {
    listsTabsContainer.innerHTML = lists.map(list => `
      <div class="shopping-list-tab ${list.id === currentListId ? 'active' : ''}" data-list-id="${list.id}">
        <span class="shopping-list-tab-name">${list.name}</span>
        <span class="shopping-list-tab-count">${(list.items || []).length}</span>
        ${lists.length > 1 ? `<button class="shopping-list-tab-delete" data-delete-list="${list.id}" title="Hapus List">✕</button>` : ''}
      </div>
    `).join('');

    // Tab click handlers
    document.querySelectorAll('.shopping-list-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        if (!e.target.classList.contains('shopping-list-tab-delete')) {
          currentListId = Number(tab.dataset.listId);
          renderListsTabs();
          renderItems();
          updateStats();
        }
      });
    });

    // Delete list handlers
    document.querySelectorAll('.shopping-list-tab-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const listId = Number(btn.dataset.deleteList);
        if (confirm('Hapus list ini dan semua itemnya?')) {
          lists = lists.filter(l => l.id !== listId);
          if (currentListId === listId) {
            currentListId = lists[0].id;
          }
          saveLists(lists);
          renderListsTabs();
          renderItems();
          updateStats();
          showToast('List berhasil dihapus');
        }
      });
    });
  }

  function renderItems() {
    const list = getCurrentList();
    const items = list.items || [];
    
    let filtered = items;
    if (currentFilter === "pending") {
      filtered = items.filter(i => !i.done);
    } else if (currentFilter === "done") {
      filtered = items.filter(i => i.done);
    }

    if (filtered.length === 0) {
      const emptyMsg = currentFilter === "done" 
        ? "Belum ada item yang dibeli" 
        : currentFilter === "pending"
        ? "Semua item sudah dibeli!"
        : "Belum ada item. Tambahkan item pertama Anda!";
      
      itemsList.innerHTML = `
        <div class="shopping-empty-state">
          <div class="shopping-empty-icon">${currentFilter === "pending" ? "🛒" : currentFilter === "done" ? "✅" : "📭"}</div>
          <div class="shopping-empty-title">${emptyMsg}</div>
        </div>
      `;
      return;
    }

    // Group by category
    const grouped = {};
    filtered.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    itemsList.innerHTML = Object.keys(grouped).map(cat => {
      const catItems = grouped[cat];
      const catInfo = categories[cat] || { icon: "📦", color: "#6b7280" };
      
      return `
        <div class="shopping-category-group">
          <div class="shopping-category-header">
            <span class="shopping-category-icon" style="background: ${catInfo.color}20; color: ${catInfo.color};">
              ${catInfo.icon}
            </span>
            <span class="shopping-category-name">${cat}</span>
            <span class="shopping-category-count">${catItems.length} item</span>
          </div>
          <div class="shopping-category-items">
            ${catItems.map((item, index) => `
              <div class="shopping-item ${item.done ? 'done' : ''}" data-item-id="${item.id}">
                <div class="shopping-item-checkbox">
                  <input 
                    type="checkbox" 
                    ${item.done ? 'checked' : ''} 
                    data-toggle-item="${item.id}"
                    class="shopping-checkbox"
                  />
                </div>
                <div class="shopping-item-content">
                  <div class="shopping-item-name">${item.name}</div>
                  <div class="shopping-item-details">
                    <span class="shopping-item-qty">${item.qty} ${item.unit}</span>
                    ${item.price ? `<span class="shopping-item-price">Rp ${(item.price * item.qty).toLocaleString('id-ID')}</span>` : ''}
                    ${item.note ? `<span class="shopping-item-note">📝 ${item.note}</span>` : ''}
                  </div>
                </div>
                <button class="shopping-item-delete" data-delete-item="${item.id}" title="Hapus Item">🗑️</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Event handlers
    document.querySelectorAll('[data-toggle-item]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const itemId = Number(checkbox.dataset.toggleItem);
        const list = getCurrentList();
        const item = list.items.find(i => i.id === itemId);
        if (item) {
          item.done = checkbox.checked;
          saveLists(lists);
          renderItems();
          updateStats();
          showToast(item.done ? 'Item sudah dibeli!' : 'Item dikembalikan ke list');
        }
      });
    });

    document.querySelectorAll('[data-delete-item]').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = Number(btn.dataset.deleteItem);
        if (confirm('Hapus item ini?')) {
          const list = getCurrentList();
          list.items = list.items.filter(i => i.id !== itemId);
          saveLists(lists);
          renderItems();
          updateStats();
          showToast('Item dihapus');
        }
      });
    });
  }

  function renderAll() {
    updateStats();
    renderListsTabs();
    renderItems();
  }

  // Add item
  addItemBtn.addEventListener('click', () => {
    const name = itemNameEl.value.trim();
    const qty = Number(itemQtyEl.value) || 1;
    const unit = itemUnitEl.value;
    const price = Number(itemPriceEl.value) || 0;
    const category = itemCategoryEl.value;
    const note = itemNoteEl.value.trim();

    if (!name) {
      showToast('Masukkan nama item', 'error');
      return;
    }

    const list = getCurrentList();
    list.items = list.items || [];
    list.items.push({
      id: Date.now(),
      name,
      qty,
      unit,
      price,
      category,
      note,
      done: false,
      createdAt: new Date().toISOString()
    });

    saveLists(lists);
    
    itemNameEl.value = '';
    itemQtyEl.value = '1';
    itemPriceEl.value = '';
    itemNoteEl.value = '';
    
    renderAll();
    showToast('Item ditambahkan!');
  });

  // Filter tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      renderItems();
    });
  });

  // Clear checked items
  clearCheckedBtn.addEventListener('click', () => {
    const list = getCurrentList();
    const checkedCount = list.items.filter(i => i.done).length;
    
    if (checkedCount === 0) {
      showToast('Tidak ada item yang sudah dibeli', 'error');
      return;
    }

    if (confirm(`Hapus ${checkedCount} item yang sudah dibeli?`)) {
      list.items = list.items.filter(i => !i.done);
      saveLists(lists);
      renderAll();
      showToast(`${checkedCount} item dihapus`);
    }
  });

  // Export list
  exportListBtn.addEventListener('click', () => {
    const list = getCurrentList();
    if (!list.items || list.items.length === 0) {
      showToast('List kosong, tidak ada yang diekspor', 'error');
      return;
    }

    const content = [
      `=== ${list.name} ===`,
      `Dibuat: ${new Date().toLocaleDateString('id-ID')}`,
      '',
      ...list.items.map((item, i) => 
        `${i + 1}. ${item.done ? '[✓]' : '[ ]'} ${item.name} - ${item.qty} ${item.unit}${item.price ? ` (Rp ${(item.price * item.qty).toLocaleString('id-ID')})` : ''}${item.note ? ` - ${item.note}` : ''}`
      ),
      '',
      `Total: ${list.items.length} item`,
      `Sudah dibeli: ${list.items.filter(i => i.done).length} item`,
      `Total harga: Rp ${list.items.reduce((sum, i) => sum + (i.price ? i.price * i.qty : 0), 0).toLocaleString('id-ID')}`
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${list.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Daftar berhasil diekspor!');
  });

  // Add list modal
  addListBtn.addEventListener('click', () => {
    listNameInput.value = '';
    addListModal.classList.add('active');
  });

  closeListModalBtn.addEventListener('click', () => {
    addListModal.classList.remove('active');
  });

  cancelListBtn.addEventListener('click', () => {
    addListModal.classList.remove('active');
  });

  saveListBtn.addEventListener('click', () => {
    const name = listNameInput.value.trim();
    if (!name) {
      showToast('Masukkan nama list', 'error');
      return;
    }

    lists.push({
      id: Date.now(),
      name,
      items: []
    });

    saveLists(lists);
    addListModal.classList.remove('active');
    renderListsTabs();
    showToast('List baru dibuat!');
  });

  // Close modal on overlay click
  addListModal.addEventListener('click', (e) => {
    if (e.target === addListModal) {
      addListModal.classList.remove('active');
    }
  });

  // Enter key support
  itemNameEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItemBtn.click();
  });

  listNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveListBtn.click();
  });

  // Initialize
  updateCategoryOptions();
  renderAll();
}
