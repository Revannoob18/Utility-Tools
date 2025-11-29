import { showToast } from "../app.js";

const HISTORY_KEY = "aolt-password-history";
const PRESETS_KEY = "aolt-password-presets";

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

function loadPresets() {
  try {
    return JSON.parse(localStorage.getItem(PRESETS_KEY)) || [];
  } catch {
    return [];
  }
}

function savePresets(presets) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

function addToHistory(password, strength, settings) {
  const history = loadHistory();
  const now = new Date().toISOString();
  
  history.unshift({
    password,
    strength,
    settings,
    timestamp: now,
    copied: false
  });
  
  if (history.length > 20) history.pop();
  saveHistory(history);
}

function generatePassword(length, useUpper, useLower, useDigits, useSymbols, useExtended) {
  let chars = "";
  if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (useLower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (useDigits) chars += "0123456789";
  if (useSymbols) chars += "!@#$%^&*()-_=+[]{}";
  if (useExtended) chars += "|\\;:'\",.<>?/~`";
  if (!chars) return "";
  
  let out = "";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    out += chars[array[i] % chars.length];
  }
  
  return out;
}

function calculateStrength(password) {
  if (!password) return { score: 0, label: 'Sangat Lemah', color: '#ef4444', percentage: 0 };
  
  let score = 0;
  const length = password.length;
  
  // Length score
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (length >= 20) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  // Complexity
  if (length > 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
    score += 2;
  }
  
  const percentage = Math.min((score / 10) * 100, 100);
  
  if (score <= 2) return { score, label: 'Sangat Lemah', color: '#ef4444', percentage };
  if (score <= 4) return { score, label: 'Lemah', color: '#f59e0b', percentage };
  if (score <= 6) return { score, label: 'Sedang', color: '#eab308', percentage };
  if (score <= 8) return { score, label: 'Kuat', color: '#10b981', percentage };
  return { score, label: 'Sangat Kuat', color: '#059669', percentage };
}

function estimateCrackTime(password) {
  if (!password) return 'Instant';
  
  const length = password.length;
  let charsetSize = 0;
  
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33;
  
  const combinations = Math.pow(charsetSize, length);
  const guessesPerSecond = 1e9; // 1 billion guesses/second
  const seconds = combinations / guessesPerSecond;
  
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} detik`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} menit`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} jam`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} hari`;
  if (seconds < 315360000) return `${Math.round(seconds / 31536000)} tahun`;
  return 'Jutaan tahun';
}

export function initPassword() {
  const section = document.getElementById("password");
  section.innerHTML = `
    <div class="password-container">
      <!-- Header -->
      <div class="password-header">
        <div class="password-header-content">
          <div class="password-header-left">
            <div class="password-icon">🔐</div>
            <div>
              <div class="password-header-title">Password Generator</div>
              <div class="password-header-subtitle">Buat password kuat & aman dengan enkripsi acak</div>
            </div>
          </div>
          <div class="password-stats">
            <div class="password-stat-card">
              <div class="password-stat-icon">🎲</div>
              <div class="password-stat-content">
                <div class="password-stat-value" id="password-total-generated">0</div>
                <div class="password-stat-label">Total Generated</div>
              </div>
            </div>
            <div class="password-stat-card">
              <div class="password-stat-icon">📋</div>
              <div class="password-stat-content">
                <div class="password-stat-value" id="password-total-copied">0</div>
                <div class="password-stat-label">Total Copied</div>
              </div>
            </div>
            <div class="password-stat-card">
              <div class="password-stat-icon">⭐</div>
              <div class="password-stat-content">
                <div class="password-stat-value" id="password-total-presets">0</div>
                <div class="password-stat-label">Saved Presets</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="password-main-grid">
        <!-- Generator -->
        <div class="password-generator-card">
          <div class="password-panel-header">
            <span class="password-panel-icon">⚙️</span>
            <span class="password-panel-title">Generator Settings</span>
          </div>
          
          <div class="password-generator-content">
            <!-- Password Output -->
            <div class="password-output-section">
              <div class="password-output-wrapper">
                <input 
                  type="text" 
                  id="password-output" 
                  class="password-output-input" 
                  readonly 
                  placeholder="Generated password akan muncul di sini..."
                />
                <button class="password-copy-btn" id="password-copy-btn" title="Copy to clipboard">
                  <span id="password-copy-icon">📋</span>
                </button>
              </div>
              
              <!-- Strength Meter -->
              <div class="password-strength-section">
                <div class="password-strength-label">
                  <span>Password Strength:</span>
                  <span id="password-strength-text" style="font-weight: 700;">-</span>
                </div>
                <div class="password-strength-bar">
                  <div class="password-strength-fill" id="password-strength-fill"></div>
                </div>
                <div class="password-strength-info">
                  <div class="password-strength-info-item">
                    <span class="password-strength-info-icon">🔢</span>
                    <span id="password-char-count">0 karakter</span>
                  </div>
                  <div class="password-strength-info-item">
                    <span class="password-strength-info-icon">⏱️</span>
                    <span id="password-crack-time">-</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Length Slider -->
            <div class="password-setting-group">
              <div class="password-setting-header">
                <label class="password-setting-label">
                  <span class="password-setting-icon">📏</span>
                  <span>Panjang Password</span>
                </label>
                <span class="password-length-value" id="password-length-display">12</span>
              </div>
              <input 
                type="range" 
                id="password-length" 
                class="password-slider" 
                min="4" 
                max="64" 
                value="12"
              />
              <div class="password-slider-labels">
                <span>4</span>
                <span>16</span>
                <span>32</span>
                <span>64</span>
              </div>
            </div>

            <!-- Character Options -->
            <div class="password-setting-group">
              <div class="password-setting-header">
                <label class="password-setting-label">
                  <span class="password-setting-icon">🔤</span>
                  <span>Jenis Karakter</span>
                </label>
              </div>
              <div class="password-checkboxes">
                <label class="password-checkbox-label">
                  <input type="checkbox" id="password-uppercase" class="password-checkbox-input" checked />
                  <span class="password-checkbox-custom"></span>
                  <span class="password-checkbox-text">
                    <span class="password-checkbox-title">Huruf Besar (A-Z)</span>
                    <span class="password-checkbox-sample">ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
                  </span>
                </label>
                
                <label class="password-checkbox-label">
                  <input type="checkbox" id="password-lowercase" class="password-checkbox-input" checked />
                  <span class="password-checkbox-custom"></span>
                  <span class="password-checkbox-text">
                    <span class="password-checkbox-title">Huruf Kecil (a-z)</span>
                    <span class="password-checkbox-sample">abcdefghijklmnopqrstuvwxyz</span>
                  </span>
                </label>
                
                <label class="password-checkbox-label">
                  <input type="checkbox" id="password-numbers" class="password-checkbox-input" checked />
                  <span class="password-checkbox-custom"></span>
                  <span class="password-checkbox-text">
                    <span class="password-checkbox-title">Angka (0-9)</span>
                    <span class="password-checkbox-sample">0123456789</span>
                  </span>
                </label>
                
                <label class="password-checkbox-label">
                  <input type="checkbox" id="password-symbols" class="password-checkbox-input" />
                  <span class="password-checkbox-custom"></span>
                  <span class="password-checkbox-text">
                    <span class="password-checkbox-title">Simbol Umum</span>
                    <span class="password-checkbox-sample">!@#$%^&*()-_=+[]{}</span>
                  </span>
                </label>
                
                <label class="password-checkbox-label">
                  <input type="checkbox" id="password-extended" class="password-checkbox-input" />
                  <span class="password-checkbox-custom"></span>
                  <span class="password-checkbox-text">
                    <span class="password-checkbox-title">Simbol Extended</span>
                    <span class="password-checkbox-sample">|\\;:'",.<>?/~\`</span>
                  </span>
                </label>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="password-actions">
              <button class="password-generate-btn" id="password-generate-btn">
                <span class="password-btn-icon">🎲</span>
                <span>Generate Password</span>
              </button>
              <button class="password-save-preset-btn" id="password-save-preset-btn">
                <span class="password-btn-icon">⭐</span>
                <span>Save Preset</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Side Panel -->
        <div class="password-side-panel">
          <!-- Quick Presets -->
          <div class="password-presets-card">
            <div class="password-panel-header">
              <span class="password-panel-icon">⚡</span>
              <span class="password-panel-title">Quick Presets</span>
            </div>
            <div class="password-presets-content">
              <button class="password-preset-btn" data-preset="basic">
                <span class="password-preset-icon">🔵</span>
                <div class="password-preset-info">
                  <div class="password-preset-name">Basic</div>
                  <div class="password-preset-desc">8 char, A-Z, a-z, 0-9</div>
                </div>
              </button>
              <button class="password-preset-btn" data-preset="standard">
                <span class="password-preset-icon">🟢</span>
                <div class="password-preset-info">
                  <div class="password-preset-name">Standard</div>
                  <div class="password-preset-desc">12 char + symbols</div>
                </div>
              </button>
              <button class="password-preset-btn" data-preset="strong">
                <span class="password-preset-icon">🟡</span>
                <div class="password-preset-info">
                  <div class="password-preset-name">Strong</div>
                  <div class="password-preset-desc">16 char + symbols</div>
                </div>
              </button>
              <button class="password-preset-btn" data-preset="maximum">
                <span class="password-preset-icon">🔴</span>
                <div class="password-preset-info">
                  <div class="password-preset-name">Maximum</div>
                  <div class="password-preset-desc">32 char + extended</div>
                </div>
              </button>
              <button class="password-preset-btn" data-preset="pin">
                <span class="password-preset-icon">🔢</span>
                <div class="password-preset-info">
                  <div class="password-preset-name">PIN Code</div>
                  <div class="password-preset-desc">6 digit numbers only</div>
                </div>
              </button>
              <button class="password-preset-btn" data-preset="memorable">
                <span class="password-preset-icon">💭</span>
                <div class="password-preset-info">
                  <div class="password-preset-name">Memorable</div>
                  <div class="password-preset-desc">10 char, no symbols</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Custom Presets -->
          <div class="password-custom-presets-card">
            <div class="password-panel-header">
              <span class="password-panel-icon">⭐</span>
              <span class="password-panel-title">My Presets</span>
            </div>
            <div class="password-custom-presets-content" id="password-custom-presets"></div>
          </div>

          <!-- Tips -->
          <div class="password-tips-card">
            <div class="password-panel-header">
              <span class="password-panel-icon">💡</span>
              <span class="password-panel-title">Security Tips</span>
            </div>
            <div class="password-tips-content">
              <div class="password-tip">
                <span class="password-tip-icon">✅</span>
                <span class="password-tip-text">Gunakan minimal 12 karakter untuk keamanan optimal</span>
              </div>
              <div class="password-tip">
                <span class="password-tip-icon">✅</span>
                <span class="password-tip-text">Kombinasikan huruf besar, kecil, angka & simbol</span>
              </div>
              <div class="password-tip">
                <span class="password-tip-icon">✅</span>
                <span class="password-tip-text">Jangan gunakan informasi pribadi dalam password</span>
              </div>
              <div class="password-tip">
                <span class="password-tip-icon">✅</span>
                <span class="password-tip-text">Gunakan password berbeda untuk setiap akun</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- History -->
      <div class="password-history-section">
        <div class="password-panel-header">
          <span class="password-panel-icon">📖</span>
          <span class="password-panel-title">Generation History (20 Terakhir)</span>
          <button class="password-clear-history-btn" id="password-clear-history">
            <span>🗑️</span>
            <span>Clear All</span>
          </button>
        </div>
        <div class="password-history-content" id="password-history"></div>
      </div>
    </div>
  `;

  // Elements
  const lengthSlider = document.getElementById('password-length');
  const lengthDisplay = document.getElementById('password-length-display');
  const uppercaseCheck = document.getElementById('password-uppercase');
  const lowercaseCheck = document.getElementById('password-lowercase');
  const numbersCheck = document.getElementById('password-numbers');
  const symbolsCheck = document.getElementById('password-symbols');
  const extendedCheck = document.getElementById('password-extended');
  const generateBtn = document.getElementById('password-generate-btn');
  const savePresetBtn = document.getElementById('password-save-preset-btn');
  const outputInput = document.getElementById('password-output');
  const copyBtn = document.getElementById('password-copy-btn');
  const clearHistoryBtn = document.getElementById('password-clear-history');
  
  let currentPassword = '';
  let totalGenerated = 0;
  let totalCopied = 0;

  // Update length display
  lengthSlider.addEventListener('input', () => {
    lengthDisplay.textContent = lengthSlider.value;
  });

  // Generate password
  function generate() {
    const length = parseInt(lengthSlider.value);
    const useUpper = uppercaseCheck.checked;
    const useLower = lowercaseCheck.checked;
    const useNumbers = numbersCheck.checked;
    const useSymbols = symbolsCheck.checked;
    const useExtended = extendedCheck.checked;

    if (!useUpper && !useLower && !useNumbers && !useSymbols && !useExtended) {
      showToast('⚠️ Pilih minimal satu jenis karakter');
      return;
    }

    currentPassword = generatePassword(length, useUpper, useLower, useNumbers, useSymbols, useExtended);
    outputInput.value = currentPassword;
    
    const strength = calculateStrength(currentPassword);
    updateStrengthMeter(strength);
    
    const crackTime = estimateCrackTime(currentPassword);
    document.getElementById('password-crack-time').textContent = `Crack time: ${crackTime}`;
    document.getElementById('password-char-count').textContent = `${currentPassword.length} karakter`;
    
    totalGenerated++;
    updateStats();
    
    const settings = {
      length,
      uppercase: useUpper,
      lowercase: useLower,
      numbers: useNumbers,
      symbols: useSymbols,
      extended: useExtended
    };
    
    addToHistory(currentPassword, strength.label, settings);
    renderHistory();
    
    showToast('✅ Password berhasil dibuat');
  }

  function updateStrengthMeter(strength) {
    const fillEl = document.getElementById('password-strength-fill');
    const textEl = document.getElementById('password-strength-text');
    
    fillEl.style.width = `${strength.percentage}%`;
    fillEl.style.background = strength.color;
    textEl.textContent = strength.label;
    textEl.style.color = strength.color;
  }

  function copyToClipboard() {
    if (!currentPassword) {
      showToast('⚠️ Generate password terlebih dahulu');
      return;
    }

    navigator.clipboard.writeText(currentPassword).then(() => {
      const icon = document.getElementById('password-copy-icon');
      icon.textContent = '✅';
      setTimeout(() => {
        icon.textContent = '📋';
      }, 2000);
      
      totalCopied++;
      updateStats();
      
      // Update history
      const history = loadHistory();
      if (history.length > 0 && history[0].password === currentPassword) {
        history[0].copied = true;
        saveHistory(history);
        renderHistory();
      }
      
      showToast('📋 Password disalin ke clipboard');
    }).catch(() => {
      showToast('⚠️ Gagal menyalin password');
    });
  }

  function applyPreset(preset) {
    switch(preset) {
      case 'basic':
        lengthSlider.value = 8;
        uppercaseCheck.checked = true;
        lowercaseCheck.checked = true;
        numbersCheck.checked = true;
        symbolsCheck.checked = false;
        extendedCheck.checked = false;
        break;
      case 'standard':
        lengthSlider.value = 12;
        uppercaseCheck.checked = true;
        lowercaseCheck.checked = true;
        numbersCheck.checked = true;
        symbolsCheck.checked = true;
        extendedCheck.checked = false;
        break;
      case 'strong':
        lengthSlider.value = 16;
        uppercaseCheck.checked = true;
        lowercaseCheck.checked = true;
        numbersCheck.checked = true;
        symbolsCheck.checked = true;
        extendedCheck.checked = false;
        break;
      case 'maximum':
        lengthSlider.value = 32;
        uppercaseCheck.checked = true;
        lowercaseCheck.checked = true;
        numbersCheck.checked = true;
        symbolsCheck.checked = true;
        extendedCheck.checked = true;
        break;
      case 'pin':
        lengthSlider.value = 6;
        uppercaseCheck.checked = false;
        lowercaseCheck.checked = false;
        numbersCheck.checked = true;
        symbolsCheck.checked = false;
        extendedCheck.checked = false;
        break;
      case 'memorable':
        lengthSlider.value = 10;
        uppercaseCheck.checked = true;
        lowercaseCheck.checked = true;
        numbersCheck.checked = true;
        symbolsCheck.checked = false;
        extendedCheck.checked = false;
        break;
    }
    
    lengthDisplay.textContent = lengthSlider.value;
    showToast(`⚡ Preset "${preset}" diterapkan`);
    generate();
  }

  function saveCustomPreset() {
    const name = prompt('Nama preset:');
    if (!name || !name.trim()) return;
    
    const presets = loadPresets();
    
    if (presets.length >= 10) {
      showToast('⚠️ Maksimal 10 custom presets');
      return;
    }
    
    const preset = {
      name: name.trim(),
      length: parseInt(lengthSlider.value),
      uppercase: uppercaseCheck.checked,
      lowercase: lowercaseCheck.checked,
      numbers: numbersCheck.checked,
      symbols: symbolsCheck.checked,
      extended: extendedCheck.checked,
      timestamp: new Date().toISOString()
    };
    
    presets.push(preset);
    savePresets(presets);
    renderCustomPresets();
    updateStats();
    showToast(`⭐ Preset "${name}" disimpan`);
  }

  function renderCustomPresets() {
    const container = document.getElementById('password-custom-presets');
    const presets = loadPresets();
    
    if (presets.length === 0) {
      container.innerHTML = '<div class="password-empty-state">Belum ada custom preset</div>';
      return;
    }
    
    const html = presets.map((preset, index) => {
      const chars = [];
      if (preset.uppercase) chars.push('A-Z');
      if (preset.lowercase) chars.push('a-z');
      if (preset.numbers) chars.push('0-9');
      if (preset.symbols) chars.push('!@#');
      if (preset.extended) chars.push('|\\;');
      
      return `
        <div class="password-custom-preset-item">
          <button class="password-custom-preset-load" data-index="${index}">
            <span class="password-custom-preset-icon">⭐</span>
            <div class="password-custom-preset-info">
              <div class="password-custom-preset-name">${preset.name}</div>
              <div class="password-custom-preset-desc">${preset.length} char: ${chars.join(', ')}</div>
            </div>
          </button>
          <button class="password-custom-preset-delete" data-index="${index}">
            <span>🗑️</span>
          </button>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
    
    // Add event listeners
    container.querySelectorAll('.password-custom-preset-load').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        const presets = loadPresets();
        const preset = presets[index];
        
        lengthSlider.value = preset.length;
        uppercaseCheck.checked = preset.uppercase;
        lowercaseCheck.checked = preset.lowercase;
        numbersCheck.checked = preset.numbers;
        symbolsCheck.checked = preset.symbols;
        extendedCheck.checked = preset.extended;
        lengthDisplay.textContent = preset.length;
        
        showToast(`⭐ Preset "${preset.name}" diterapkan`);
        generate();
      });
    });
    
    container.querySelectorAll('.password-custom-preset-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        const presets = loadPresets();
        const preset = presets[index];
        
        if (confirm(`Hapus preset "${preset.name}"?`)) {
          presets.splice(index, 1);
          savePresets(presets);
          renderCustomPresets();
          updateStats();
          showToast(`🗑️ Preset "${preset.name}" dihapus`);
        }
      });
    });
  }

  function renderHistory() {
    const container = document.getElementById('password-history');
    const history = loadHistory();
    
    if (history.length === 0) {
      container.innerHTML = '<div class="password-empty-state">Belum ada riwayat password</div>';
      return;
    }
    
    const html = history.map((item, index) => {
      const date = new Date(item.timestamp);
      const timeStr = date.toLocaleString('id-ID', { 
        day: '2-digit', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const chars = [];
      if (item.settings.uppercase) chars.push('A-Z');
      if (item.settings.lowercase) chars.push('a-z');
      if (item.settings.numbers) chars.push('0-9');
      if (item.settings.symbols) chars.push('!@#');
      
      return `
        <div class="password-history-item ${item.copied ? 'copied' : ''}">
          <div class="password-history-main">
            <div class="password-history-password">${item.password}</div>
            <div class="password-history-meta">
              <span class="password-history-time">⏰ ${timeStr}</span>
              <span class="password-history-settings">📏 ${item.settings.length} char</span>
              <span class="password-history-strength">🛡️ ${item.strength}</span>
            </div>
          </div>
          <div class="password-history-actions">
            <button class="password-history-copy" data-password="${item.password.replace(/"/g, '&quot;')}">
              <span>📋</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
    
    // Add copy handlers
    container.querySelectorAll('.password-history-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const password = btn.dataset.password;
        navigator.clipboard.writeText(password).then(() => {
          btn.innerHTML = '<span>✅</span>';
          setTimeout(() => {
            btn.innerHTML = '<span>📋</span>';
          }, 2000);
          showToast('📋 Password disalin');
        });
      });
    });
  }

  function updateStats() {
    document.getElementById('password-total-generated').textContent = totalGenerated;
    document.getElementById('password-total-copied').textContent = totalCopied;
    document.getElementById('password-total-presets').textContent = loadPresets().length;
  }

  // Event listeners
  generateBtn.addEventListener('click', generate);
  copyBtn.addEventListener('click', copyToClipboard);
  savePresetBtn.addEventListener('click', saveCustomPreset);
  
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Hapus semua riwayat password?')) {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
      showToast('🗑️ Riwayat dihapus');
    }
  });
  
  // Preset buttons
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.dataset.preset;
      applyPreset(preset);
    });
  });

  // Initial render
  renderCustomPresets();
  renderHistory();
  updateStats();
  
  // Generate initial password
  generate();
}
