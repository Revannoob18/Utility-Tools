import { showToast } from "../app.js";

const HISTORY_KEY = "aolt-converter-history";
const FAVORITES_KEY = "aolt-converter-favorites";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function addToHistory(category, from, to, input, output) {
  const history = loadHistory();
  history.unshift({
    category,
    from,
    to,
    input,
    output,
    timestamp: new Date().toISOString()
  });
  if (history.length > 20) history.pop();
  saveHistory(history);
}

// Comprehensive conversion units
const UNITS = {
  length: {
    name: "Panjang",
    icon: "📏",
    base: "meter",
    units: {
      kilometer: { symbol: "km", toBase: 1000, name: "Kilometer" },
      meter: { symbol: "m", toBase: 1, name: "Meter" },
      centimeter: { symbol: "cm", toBase: 0.01, name: "Centimeter" },
      millimeter: { symbol: "mm", toBase: 0.001, name: "Millimeter" },
      mile: { symbol: "mi", toBase: 1609.34, name: "Mile" },
      yard: { symbol: "yd", toBase: 0.9144, name: "Yard" },
      foot: { symbol: "ft", toBase: 0.3048, name: "Foot" },
      inch: { symbol: "in", toBase: 0.0254, name: "Inch" },
      nauticalMile: { symbol: "nmi", toBase: 1852, name: "Nautical Mile" }
    }
  },
  weight: {
    name: "Berat",
    icon: "⚖️",
    base: "kilogram",
    units: {
      ton: { symbol: "t", toBase: 1000, name: "Ton" },
      kilogram: { symbol: "kg", toBase: 1, name: "Kilogram" },
      gram: { symbol: "g", toBase: 0.001, name: "Gram" },
      milligram: { symbol: "mg", toBase: 0.000001, name: "Milligram" },
      pound: { symbol: "lb", toBase: 0.453592, name: "Pound" },
      ounce: { symbol: "oz", toBase: 0.0283495, name: "Ounce" },
      carat: { symbol: "ct", toBase: 0.0002, name: "Carat" }
    }
  },
  temperature: {
    name: "Suhu",
    icon: "🌡️",
    base: "celsius",
    special: true,
    units: {
      celsius: { symbol: "°C", name: "Celsius" },
      fahrenheit: { symbol: "°F", name: "Fahrenheit" },
      kelvin: { symbol: "K", name: "Kelvin" }
    }
  },
  speed: {
    name: "Kecepatan",
    icon: "🚀",
    base: "meterPerSecond",
    units: {
      kilometerPerHour: { symbol: "km/h", toBase: 0.277778, name: "Kilometer/Jam" },
      meterPerSecond: { symbol: "m/s", toBase: 1, name: "Meter/Detik" },
      milePerHour: { symbol: "mph", toBase: 0.44704, name: "Mile/Jam" },
      knot: { symbol: "kn", toBase: 0.514444, name: "Knot" },
      footPerSecond: { symbol: "ft/s", toBase: 0.3048, name: "Foot/Detik" }
    }
  },
  area: {
    name: "Luas",
    icon: "📐",
    base: "squareMeter",
    units: {
      squareKilometer: { symbol: "km²", toBase: 1000000, name: "Kilometer Persegi" },
      hectare: { symbol: "ha", toBase: 10000, name: "Hektar" },
      squareMeter: { symbol: "m²", toBase: 1, name: "Meter Persegi" },
      squareFoot: { symbol: "ft²", toBase: 0.092903, name: "Foot Persegi" },
      squareInch: { symbol: "in²", toBase: 0.00064516, name: "Inch Persegi" },
      acre: { symbol: "ac", toBase: 4046.86, name: "Acre" }
    }
  },
  volume: {
    name: "Volume",
    icon: "🧊",
    base: "liter",
    units: {
      cubicMeter: { symbol: "m³", toBase: 1000, name: "Meter Kubik" },
      liter: { symbol: "L", toBase: 1, name: "Liter" },
      milliliter: { symbol: "mL", toBase: 0.001, name: "Mililiter" },
      gallon: { symbol: "gal", toBase: 3.78541, name: "Gallon (US)" },
      quart: { symbol: "qt", toBase: 0.946353, name: "Quart" },
      pint: { symbol: "pt", toBase: 0.473176, name: "Pint" },
      cup: { symbol: "cup", toBase: 0.24, name: "Cup" },
      fluidOunce: { symbol: "fl oz", toBase: 0.0295735, name: "Fluid Ounce" }
    }
  },
  time: {
    name: "Waktu",
    icon: "⏱️",
    base: "second",
    units: {
      year: { symbol: "yr", toBase: 31536000, name: "Tahun" },
      month: { symbol: "mo", toBase: 2592000, name: "Bulan" },
      week: { symbol: "wk", toBase: 604800, name: "Minggu" },
      day: { symbol: "d", toBase: 86400, name: "Hari" },
      hour: { symbol: "h", toBase: 3600, name: "Jam" },
      minute: { symbol: "min", toBase: 60, name: "Menit" },
      second: { symbol: "s", toBase: 1, name: "Detik" },
      millisecond: { symbol: "ms", toBase: 0.001, name: "Milidetik" }
    }
  },
  digital: {
    name: "Data Digital",
    icon: "💾",
    base: "byte",
    units: {
      terabyte: { symbol: "TB", toBase: 1099511627776, name: "Terabyte" },
      gigabyte: { symbol: "GB", toBase: 1073741824, name: "Gigabyte" },
      megabyte: { symbol: "MB", toBase: 1048576, name: "Megabyte" },
      kilobyte: { symbol: "KB", toBase: 1024, name: "Kilobyte" },
      byte: { symbol: "B", toBase: 1, name: "Byte" },
      bit: { symbol: "bit", toBase: 0.125, name: "Bit" }
    }
  },
  energy: {
    name: "Energi",
    icon: "⚡",
    base: "joule",
    units: {
      kilowattHour: { symbol: "kWh", toBase: 3600000, name: "Kilowatt-Jam" },
      kilojoule: { symbol: "kJ", toBase: 1000, name: "Kilojoule" },
      joule: { symbol: "J", toBase: 1, name: "Joule" },
      calorie: { symbol: "cal", toBase: 4.184, name: "Kalori" },
      kilocalorie: { symbol: "kcal", toBase: 4184, name: "Kilokalori" }
    }
  },
  pressure: {
    name: "Tekanan",
    icon: "🔘",
    base: "pascal",
    units: {
      bar: { symbol: "bar", toBase: 100000, name: "Bar" },
      pascal: { symbol: "Pa", toBase: 1, name: "Pascal" },
      psi: { symbol: "psi", toBase: 6894.76, name: "PSI" },
      atmosphere: { symbol: "atm", toBase: 101325, name: "Atmosphere" },
      torr: { symbol: "Torr", toBase: 133.322, name: "Torr" }
    }
  }
};

// Temperature conversion (special case)
function convertTemperature(value, from, to) {
  if (from === to) return value;
  
  // Convert to Celsius first
  let celsius;
  if (from === 'celsius') celsius = value;
  else if (from === 'fahrenheit') celsius = (value - 32) * 5 / 9;
  else if (from === 'kelvin') celsius = value - 273.15;
  
  // Convert from Celsius to target
  if (to === 'celsius') return celsius;
  else if (to === 'fahrenheit') return celsius * 9 / 5 + 32;
  else if (to === 'kelvin') return celsius + 273.15;
  
  return value;
}

// Standard conversion
function convertUnits(value, from, to, category) {
  if (from === to) return value;
  
  const categoryData = UNITS[category];
  
  // Special handling for temperature
  if (categoryData.special) {
    return convertTemperature(value, from, to);
  }
  
  // Standard conversion through base unit
  const fromUnit = categoryData.units[from];
  const toUnit = categoryData.units[to];
  
  if (!fromUnit || !toUnit) return value;
  
  const baseValue = value * fromUnit.toBase;
  return baseValue / toUnit.toBase;
}

export function initConverter() {
  const section = document.getElementById("converter");
  section.innerHTML = `
    <div class="converter-container">
      <!-- Header -->
      <div class="converter-header">
        <div class="converter-header-content">
          <div class="converter-header-top">
            <div class="converter-icon">🔄</div>
            <div class="converter-header-text">
              <h2 class="converter-header-title">Unit Converter</h2>
              <p class="converter-header-subtitle">Konversi cepat & akurat untuk 10 kategori satuan berbeda</p>
            </div>
          </div>
          <div class="converter-stats">
            <div class="converter-stat-card">
              <span class="converter-stat-icon">🎯</span>
              <div class="converter-stat-value" id="converter-total-conversions">0</div>
              <div class="converter-stat-label">Konversi</div>
            </div>
            <div class="converter-stat-card">
              <span class="converter-stat-icon">📂</span>
              <div class="converter-stat-value" id="converter-total-categories">10</div>
              <div class="converter-stat-label">Kategori</div>
            </div>
            <div class="converter-stat-card">
              <span class="converter-stat-icon">⭐</span>
              <div class="converter-stat-value" id="converter-total-favorites">0</div>
              <div class="converter-stat-label">Favorit</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="converter-content">
        <!-- Main Column -->
        <div class="converter-main">
          <!-- Category Selector -->
          <div class="converter-section">
            <h3 class="converter-section-title">
              <span class="converter-section-icon">📂</span>
              Pilih Kategori
            </h3>
            <div class="converter-category-grid">
              ${Object.entries(UNITS).map(([key, data]) => `
                <button class="converter-category-btn ${key === 'length' ? 'active' : ''}" data-category="${key}">
                  <span class="converter-category-icon">${data.icon}</span>
                  <span class="converter-category-name">${data.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Converter Interface -->
          <div class="converter-section">
            <h3 class="converter-section-title">
              <span class="converter-section-icon">🔄</span>
              Konversi Satuan
            </h3>
            <div class="converter-interface">
              <!-- From Unit -->
              <div class="converter-unit-block">
                <label class="converter-label">
                  <span>📥</span>
                  Dari
                </label>
                <div class="converter-input-wrapper">
                  <input 
                    type="number" 
                    id="converter-input-value" 
                    class="converter-input" 
                    placeholder="Masukkan nilai..."
                    step="any"
                  />
                  <select id="converter-from-unit" class="converter-select">
                    <!-- Populated by JS -->
                  </select>
                </div>
              </div>

              <!-- Swap Button -->
              <div class="converter-swap-wrapper">
                <button id="converter-swap-btn" class="converter-swap-btn" title="Tukar satuan">
                  <span>⇅</span>
                </button>
              </div>

              <!-- To Unit -->
              <div class="converter-unit-block">
                <label class="converter-label">
                  <span>📤</span>
                  Ke
                </label>
                <div class="converter-input-wrapper">
                  <input 
                    type="number" 
                    id="converter-output-value" 
                    class="converter-input" 
                    placeholder="Hasil konversi..."
                    readonly
                  />
                  <select id="converter-to-unit" class="converter-select">
                    <!-- Populated by JS -->
                  </select>
                </div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="converter-actions">
              <button id="converter-convert-btn" class="converter-convert-btn">
                <span>✨</span>
                <span>Konversi</span>
              </button>
              <button id="converter-clear-btn" class="converter-clear-btn">
                <span>🔄</span>
                <span>Reset</span>
              </button>
              <button id="converter-favorite-btn" class="converter-favorite-btn">
                <span>⭐</span>
                <span>Simpan Favorit</span>
              </button>
            </div>

            <!-- Result Display -->
            <div id="converter-result-display" class="converter-result-display" style="display: none;">
              <div class="converter-result-icon">✅</div>
              <div class="converter-result-text" id="converter-result-text"></div>
            </div>
          </div>

          <!-- Quick Conversions -->
          <div class="converter-section">
            <h3 class="converter-section-title">
              <span class="converter-section-icon">⚡</span>
              Konversi Cepat
            </h3>
            <div id="converter-quick-conversions" class="converter-quick-grid">
              <!-- Populated by JS -->
            </div>
          </div>

          <!-- Tips -->
          <div class="converter-section">
            <h3 class="converter-section-title">
              <span class="converter-section-icon">💡</span>
              Tips & Info
            </h3>
            <ul class="converter-tips-list">
              <li class="converter-tip-item">
                <span class="converter-tip-icon">🎯</span>
                <div class="converter-tip-text">Ketik nilai dan pilih satuan, konversi otomatis saat input berubah</div>
              </li>
              <li class="converter-tip-item">
                <span class="converter-tip-icon">⇅</span>
                <div class="converter-tip-text">Gunakan tombol swap untuk menukar satuan asal dan tujuan dengan cepat</div>
              </li>
              <li class="converter-tip-item">
                <span class="converter-tip-icon">⭐</span>
                <div class="converter-tip-text">Simpan konversi favorit untuk akses cepat di kemudian hari</div>
              </li>
              <li class="converter-tip-item">
                <span class="converter-tip-icon">📊</span>
                <div class="converter-tip-text">Lihat quick conversions untuk konversi populer dari nilai yang diinput</div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="converter-sidebar">
          <!-- Favorites -->
          <div class="converter-section">
            <h3 class="converter-section-title">
              <span class="converter-section-icon">⭐</span>
              Favorit
            </h3>
            <div id="converter-favorites" class="converter-favorites">
              <div class="converter-empty-state">Belum ada konversi favorit</div>
            </div>
          </div>

          <!-- History -->
          <div class="converter-section">
            <h3 class="converter-section-title">
              <span class="converter-section-icon">📜</span>
              Riwayat
            </h3>
            <div id="converter-history" class="converter-history">
              <div class="converter-empty-state">Belum ada riwayat konversi</div>
            </div>
            <button id="converter-clear-history" class="converter-clear-history">
              <span>🗑️</span>
              <span>Hapus Semua Riwayat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Elements
  const categoryButtons = document.querySelectorAll('.converter-category-btn');
  const inputValue = document.getElementById('converter-input-value');
  const outputValue = document.getElementById('converter-output-value');
  const fromUnit = document.getElementById('converter-from-unit');
  const toUnit = document.getElementById('converter-to-unit');
  const swapBtn = document.getElementById('converter-swap-btn');
  const convertBtn = document.getElementById('converter-convert-btn');
  const clearBtn = document.getElementById('converter-clear-btn');
  const favoriteBtn = document.getElementById('converter-favorite-btn');
  const resultDisplay = document.getElementById('converter-result-display');
  const resultText = document.getElementById('converter-result-text');
  const quickConversions = document.getElementById('converter-quick-conversions');
  const clearHistoryBtn = document.getElementById('converter-clear-history');

  let currentCategory = 'length';
  let totalConversions = 0;

  // Populate unit dropdowns
  function populateUnits() {
    const categoryData = UNITS[currentCategory];
    const units = categoryData.units;

    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';

    Object.entries(units).forEach(([key, unit]) => {
      const option1 = document.createElement('option');
      option1.value = key;
      option1.textContent = `${unit.name} (${unit.symbol})`;
      fromUnit.appendChild(option1);

      const option2 = document.createElement('option');
      option2.value = key;
      option2.textContent = `${unit.name} (${unit.symbol})`;
      toUnit.appendChild(option2);
    });

    // Set different default selections
    const unitKeys = Object.keys(units);
    if (unitKeys.length > 1) {
      toUnit.value = unitKeys[1];
    }
  }

  // Category switching
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      populateUnits();
      clearInputs();
      updateQuickConversions();
    });
  });

  // Perform conversion
  function performConversion() {
    const value = parseFloat(inputValue.value);
    
    if (isNaN(value) || value === '') {
      outputValue.value = '';
      resultDisplay.style.display = 'none';
      updateQuickConversions();
      return;
    }

    const from = fromUnit.value;
    const to = toUnit.value;

    const result = convertUnits(value, from, to, currentCategory);
    outputValue.value = result.toFixed(8).replace(/\.?0+$/, '');

    // Show result display
    const fromUnitData = UNITS[currentCategory].units[from];
    const toUnitData = UNITS[currentCategory].units[to];
    resultText.innerHTML = `
      <strong>${value}</strong> ${fromUnitData.symbol} = 
      <strong>${outputValue.value}</strong> ${toUnitData.symbol}
    `;
    resultDisplay.style.display = 'flex';

    // Add to history
    addToHistory(currentCategory, from, to, value, outputValue.value);
    totalConversions++;
    updateStats();
    renderHistory();
    updateQuickConversions(value);
  }

  // Auto-convert on input
  inputValue.addEventListener('input', performConversion);
  fromUnit.addEventListener('change', performConversion);
  toUnit.addEventListener('change', performConversion);

  // Convert button
  convertBtn.addEventListener('click', () => {
    if (!inputValue.value) {
      showToast('⚠️ Masukkan nilai terlebih dahulu');
      return;
    }
    performConversion();
    showToast('✅ Konversi berhasil');
  });

  // Swap button
  swapBtn.addEventListener('click', () => {
    const tempUnit = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tempUnit;

    const tempValue = inputValue.value;
    inputValue.value = outputValue.value;
    
    performConversion();
    showToast('⇅ Satuan ditukar');
  });

  // Clear button
  clearBtn.addEventListener('click', clearInputs);

  function clearInputs() {
    inputValue.value = '';
    outputValue.value = '';
    resultDisplay.style.display = 'none';
    updateQuickConversions();
  }

  // Favorite button
  favoriteBtn.addEventListener('click', () => {
    if (!inputValue.value) {
      showToast('⚠️ Lakukan konversi terlebih dahulu');
      return;
    }

    const favorites = loadFavorites();
    
    if (favorites.length >= 10) {
      showToast('⚠️ Maksimal 10 favorit');
      return;
    }

    const favorite = {
      category: currentCategory,
      from: fromUnit.value,
      to: toUnit.value,
      timestamp: new Date().toISOString()
    };

    favorites.push(favorite);
    saveFavorites(favorites);
    renderFavorites();
    updateStats();
    showToast('⭐ Ditambahkan ke favorit');
  });

  // Update quick conversions
  function updateQuickConversions(value = 1) {
    const categoryData = UNITS[currentCategory];
    const units = categoryData.units;
    const from = fromUnit.value;
    
    const conversions = Object.entries(units)
      .filter(([key]) => key !== from)
      .slice(0, 6)
      .map(([key, unit]) => {
        const result = convertUnits(value, from, key, currentCategory);
        return {
          to: key,
          result: result.toFixed(6).replace(/\.?0+$/, ''),
          symbol: unit.symbol,
          name: unit.name
        };
      });

    quickConversions.innerHTML = conversions.map(conv => `
      <div class="converter-quick-item">
        <div class="converter-quick-value">${conv.result}</div>
        <div class="converter-quick-unit">${conv.symbol}</div>
        <div class="converter-quick-name">${conv.name}</div>
      </div>
    `).join('');
  }

  // Render favorites
  function renderFavorites() {
    const container = document.getElementById('converter-favorites');
    const favorites = loadFavorites();

    if (favorites.length === 0) {
      container.innerHTML = '<div class="converter-empty-state">Belum ada konversi favorit</div>';
      return;
    }

    const html = favorites.map((fav, index) => {
      const categoryData = UNITS[fav.category];
      const fromUnit = categoryData.units[fav.from];
      const toUnit = categoryData.units[fav.to];

      return `
        <div class="converter-favorite-item">
          <button class="converter-favorite-load" data-index="${index}">
            <span class="converter-favorite-icon">${categoryData.icon}</span>
            <div class="converter-favorite-info">
              <div class="converter-favorite-name">${categoryData.name}</div>
              <div class="converter-favorite-units">${fromUnit.symbol} → ${toUnit.symbol}</div>
            </div>
          </button>
          <button class="converter-favorite-delete" data-index="${index}">
            <span>🗑️</span>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    // Add event listeners
    container.querySelectorAll('.converter-favorite-load').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        const favorites = loadFavorites();
        const fav = favorites[index];

        // Switch category
        currentCategory = fav.category;
        categoryButtons.forEach(b => {
          b.classList.remove('active');
          if (b.dataset.category === currentCategory) {
            b.classList.add('active');
          }
        });

        populateUnits();
        fromUnit.value = fav.from;
        toUnit.value = fav.to;
        
        showToast('⭐ Favorit dimuat');
      });
    });

    container.querySelectorAll('.converter-favorite-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        const favorites = loadFavorites();
        
        if (confirm('Hapus dari favorit?')) {
          favorites.splice(index, 1);
          saveFavorites(favorites);
          renderFavorites();
          updateStats();
          showToast('🗑️ Favorit dihapus');
        }
      });
    });
  }

  // Render history
  function renderHistory() {
    const container = document.getElementById('converter-history');
    const history = loadHistory();

    if (history.length === 0) {
      container.innerHTML = '<div class="converter-empty-state">Belum ada riwayat konversi</div>';
      return;
    }

    const html = history.map((item, index) => {
      const categoryData = UNITS[item.category];
      const fromUnit = categoryData.units[item.from];
      const toUnit = categoryData.units[item.to];
      const date = new Date(item.timestamp);
      const timeStr = date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="converter-history-item">
          <div class="converter-history-icon">${categoryData.icon}</div>
          <div class="converter-history-main">
            <div class="converter-history-conversion">
              ${item.input} ${fromUnit.symbol} = ${item.output} ${toUnit.symbol}
            </div>
            <div class="converter-history-meta">
              <span class="converter-history-time">⏰ ${timeStr}</span>
              <span class="converter-history-category">📂 ${categoryData.name}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  // Clear history
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Hapus semua riwayat konversi?')) {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
      showToast('🗑️ Riwayat dihapus');
    }
  });

  // Update stats
  function updateStats() {
    document.getElementById('converter-total-conversions').textContent = totalConversions;
    document.getElementById('converter-total-favorites').textContent = loadFavorites().length;
  }

  // Initial setup
  populateUnits();
  renderFavorites();
  renderHistory();
  updateStats();
  updateQuickConversions();
}
