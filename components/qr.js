import { showToast } from "../app.js";

const HISTORY_KEY = "aolt-qr-history";
const TEMPLATES_KEY = "aolt-qr-templates";

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

function loadTemplates() {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTemplates(templates) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

function addToHistory(data, type) {
  const history = loadHistory();
  const now = new Date().toISOString();
  
  history.unshift({
    data,
    type,
    timestamp: now
  });
  
  if (history.length > 20) history.pop();
  saveHistory(history);
}

// QR Code generation using QRCode.js library
function generateQRCode(container, text, options = {}) {
  const {
    size = 300,
    colorDark = '#000000',
    colorLight = '#ffffff',
    errorCorrectionLevel = 'M'
  } = options;

  // Clear container
  container.innerHTML = '';

  if (!text) {
    container.innerHTML = '<div class="qr-placeholder">Generate QR Code untuk melihat preview</div>';
    return null;
  }

  try {
    // Create QR code using library
    const qrcode = new QRCode(container, {
      text: text,
      width: size,
      height: size,
      colorDark: colorDark,
      colorLight: colorLight,
      correctLevel: QRCode.CorrectLevel[errorCorrectionLevel]
    });

    return qrcode;
  } catch (err) {
    console.error('QR generation error:', err);
    container.innerHTML = '<div class="qr-placeholder" style="color:#ef4444;">Error generating QR Code</div>';
    return null;
  }
}

export function initQr() {
  const section = document.getElementById("qr");
  section.innerHTML = `
    <div class="qr-container">
      <!-- Header -->
      <div class="qr-header">
        <div class="qr-header-content">
          <div class="qr-header-top">
            <div class="qr-icon">📱</div>
            <div class="qr-header-text">
              <h2 class="qr-header-title">QR Code Generator</h2>
              <p class="qr-header-subtitle">Buat QR Code scannable untuk berbagai kebutuhan</p>
            </div>
          </div>
          <div class="qr-stats">
            <div class="qr-stat-card">
              <span class="qr-stat-icon">🎯</span>
              <div class="qr-stat-value" id="qr-total-generated">0</div>
              <div class="qr-stat-label">Generated</div>
            </div>
            <div class="qr-stat-card">
              <span class="qr-stat-icon">📥</span>
              <div class="qr-stat-value" id="qr-total-downloaded">0</div>
              <div class="qr-stat-label">Downloaded</div>
            </div>
            <div class="qr-stat-card">
              <span class="qr-stat-icon">⭐</span>
              <div class="qr-stat-value" id="qr-total-templates">0</div>
              <div class="qr-stat-label">Templates</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="qr-content">
        <!-- Main Column -->
        <div class="qr-main">
          <!-- Type Selector -->
          <div class="qr-section">
            <h3 class="qr-section-title">
              <span class="qr-section-icon">📋</span>
              Pilih Tipe QR Code
            </h3>
            <div class="qr-type-selector">
              <button class="qr-type-btn active" data-type="text">
                <span class="qr-type-icon">📝</span>
                <span>Text</span>
              </button>
              <button class="qr-type-btn" data-type="url">
                <span class="qr-type-icon">🔗</span>
                <span>URL</span>
              </button>
              <button class="qr-type-btn" data-type="email">
                <span class="qr-type-icon">📧</span>
                <span>Email</span>
              </button>
              <button class="qr-type-btn" data-type="phone">
                <span class="qr-type-icon">📞</span>
                <span>Phone</span>
              </button>
              <button class="qr-type-btn" data-type="sms">
                <span class="qr-type-icon">💬</span>
                <span>SMS</span>
              </button>
              <button class="qr-type-btn" data-type="wifi">
                <span class="qr-type-icon">📶</span>
                <span>WiFi</span>
              </button>
              <button class="qr-type-btn" data-type="vcard">
                <span class="qr-type-icon">👤</span>
                <span>vCard</span>
              </button>
              <button class="qr-type-btn" data-type="location">
                <span class="qr-type-icon">📍</span>
                <span>Location</span>
              </button>
            </div>
          </div>

          <!-- Input Forms -->
          <div class="qr-section">
            <h3 class="qr-section-title">
              <span class="qr-section-icon">✏️</span>
              Data QR Code
            </h3>
            <div class="qr-inputs">
              <!-- Text Form -->
              <div class="qr-input-form active" data-form="text">
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>📝</span>
                    Text Content
                  </label>
                  <textarea 
                    id="qr-text-input" 
                    class="qr-form-textarea" 
                    placeholder="Enter your text here..."
                  ></textarea>
                </div>
              </div>

              <!-- URL Form -->
              <div class="qr-input-form" data-form="url">
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>🔗</span>
                    Website URL
                  </label>
                  <input 
                    type="url" 
                    id="qr-url-input" 
                    class="qr-form-input" 
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <!-- Email Form -->
              <div class="qr-input-form" data-form="email">
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>📧</span>
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="qr-email-input" 
                    class="qr-form-input" 
                    placeholder="email@example.com"
                  />
                </div>
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>💭</span>
                    Subject (Optional)
                  </label>
                  <input 
                    type="text" 
                    id="qr-email-subject" 
                    class="qr-form-input" 
                    placeholder="Email subject"
                  />
                </div>
              </div>

              <!-- Phone Form -->
              <div class="qr-input-form" data-form="phone">
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>📞</span>
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    id="qr-phone-input" 
                    class="qr-form-input" 
                    placeholder="+62 812 3456 7890"
                  />
                </div>
              </div>

              <!-- SMS Form -->
              <div class="qr-input-form" data-form="sms">
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>📞</span>
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    id="qr-sms-phone" 
                    class="qr-form-input" 
                    placeholder="+62 812 3456 7890"
                  />
                </div>
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>💬</span>
                    Message
                  </label>
                  <textarea 
                    id="qr-sms-message" 
                    class="qr-form-textarea" 
                    placeholder="SMS message"
                  ></textarea>
                </div>
              </div>

              <!-- WiFi Form -->
              <div class="qr-input-form" data-form="wifi">
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>📶</span>
                    Network Name (SSID)
                  </label>
                  <input 
                    type="text" 
                    id="qr-wifi-ssid" 
                    class="qr-form-input" 
                    placeholder="WiFi network name"
                  />
                </div>
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>🔐</span>
                    Password
                  </label>
                  <input 
                    type="text" 
                    id="qr-wifi-password" 
                    class="qr-form-input" 
                    placeholder="WiFi password"
                  />
                </div>
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>🔒</span>
                    Security Type
                  </label>
                  <select id="qr-wifi-security" class="qr-form-select">
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="">None</option>
                  </select>
                </div>
              </div>

              <!-- vCard Form -->
              <div class="qr-input-form" data-form="vcard">
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>👤</span>
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    id="qr-vcard-name" 
                    class="qr-form-input" 
                    placeholder="John Doe"
                  />
                </div>
                <div class="qr-form-row">
                  <div class="qr-form-group">
                    <label class="qr-form-label">
                      <span>📞</span>
                      Phone
                    </label>
                    <input 
                      type="tel" 
                      id="qr-vcard-phone" 
                      class="qr-form-input" 
                      placeholder="+62 812 3456 7890"
                    />
                  </div>
                  <div class="qr-form-group">
                    <label class="qr-form-label">
                      <span>📧</span>
                      Email
                    </label>
                    <input 
                      type="email" 
                      id="qr-vcard-email" 
                      class="qr-form-input" 
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div class="qr-form-group">
                  <label class="qr-form-label">
                    <span>🏢</span>
                    Company (Optional)
                  </label>
                  <input 
                    type="text" 
                    id="qr-vcard-company" 
                    class="qr-form-input" 
                    placeholder="Company name"
                  />
                </div>
              </div>

              <!-- Location Form -->
              <div class="qr-input-form" data-form="location">
                <div class="qr-form-row">
                  <div class="qr-form-group">
                    <label class="qr-form-label">
                      <span>🌍</span>
                      Latitude
                    </label>
                    <input 
                      type="text" 
                      id="qr-location-lat" 
                      class="qr-form-input" 
                      placeholder="-6.200000"
                    />
                  </div>
                  <div class="qr-form-group">
                    <label class="qr-form-label">
                      <span>🌍</span>
                      Longitude
                    </label>
                    <input 
                      type="text" 
                      id="qr-location-lon" 
                      class="qr-form-input" 
                      placeholder="106.816666"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Customization -->
          <div class="qr-section">
            <h3 class="qr-section-title">
              <span class="qr-section-icon">🎨</span>
              Kustomisasi
            </h3>
            <div class="qr-customization-grid">
              <div class="qr-form-group">
                <label class="qr-form-label">
                  <span>📏</span>
                  Ukuran
                </label>
                <select id="qr-size" class="qr-form-select">
                  <option value="200">Small (200x200)</option>
                  <option value="300" selected>Medium (300x300)</option>
                  <option value="400">Large (400x400)</option>
                  <option value="512">Extra Large (512x512)</option>
                </select>
              </div>
              <div class="qr-form-group">
                <label class="qr-form-label">
                  <span>🔧</span>
                  Error Correction
                </label>
                <select id="qr-error-level" class="qr-form-select">
                  <option value="L">Low (7%)</option>
                  <option value="M" selected>Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
              <div class="qr-form-group">
                <label class="qr-form-label">
                  <span>⬛</span>
                  Warna Gelap
                </label>
                <div class="qr-color-input-wrapper">
                  <input 
                    type="color" 
                    id="qr-color-dark" 
                    class="qr-color-input" 
                    value="#000000"
                  />
                  <input 
                    type="text" 
                    class="qr-color-value" 
                    value="#000000" 
                    readonly
                  />
                </div>
              </div>
              <div class="qr-form-group">
                <label class="qr-form-label">
                  <span>⬜</span>
                  Warna Terang
                </label>
                <div class="qr-color-input-wrapper">
                  <input 
                    type="color" 
                    id="qr-color-light" 
                    class="qr-color-input" 
                    value="#ffffff"
                  />
                  <input 
                    type="text" 
                    class="qr-color-value" 
                    value="#ffffff" 
                    readonly
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="qr-section">
            <div class="qr-actions">
              <button id="qr-generate-btn" class="qr-generate-btn">
                <span>✨</span>
                <span>Generate QR Code</span>
              </button>
              <button id="qr-save-template-btn" class="qr-template-btn">
                <span>⭐</span>
                <span>Simpan Template</span>
              </button>
            </div>
          </div>

          <!-- Tips -->
          <div class="qr-section">
            <h3 class="qr-section-title">
              <span class="qr-section-icon">💡</span>
              Tips & Trik
            </h3>
            <ul class="qr-tips-list">
              <li class="qr-tip-item">
                <span class="qr-tip-icon">🎯</span>
                <div class="qr-tip-text">Error correction tinggi membantu QR code tetap terbaca meski rusak</div>
              </li>
              <li class="qr-tip-item">
                <span class="qr-tip-icon">🎨</span>
                <div class="qr-tip-text">Gunakan kontras tinggi antara warna gelap dan terang untuk hasil terbaik</div>
              </li>
              <li class="qr-tip-item">
                <span class="qr-tip-icon">📏</span>
                <div class="qr-tip-text">QR Code dengan data banyak butuh ukuran lebih besar untuk mudah di-scan</div>
              </li>
              <li class="qr-tip-item">
                <span class="qr-tip-icon">✅</span>
                <div class="qr-tip-text">Selalu test QR code sebelum digunakan untuk memastikan data benar</div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="qr-sidebar">
          <!-- Preview -->
          <div class="qr-section">
            <h3 class="qr-section-title">
              <span class="qr-section-icon">👁️</span>
              Preview
            </h3>
            <div class="qr-preview-wrapper">
              <div id="qr-preview">
                <div class="qr-placeholder">Generate QR Code untuk melihat preview</div>
              </div>
              <div class="qr-download-actions">
                <button id="qr-download-png" class="qr-download-btn qr-download-png">
                  <span>🖼️</span>
                  <span>PNG</span>
                </button>
                <button id="qr-download-svg" class="qr-download-btn qr-download-svg">
                  <span>📐</span>
                  <span>SVG</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Templates -->
          <div class="qr-section">
            <h3 class="qr-section-title">
              <span class="qr-section-icon">⭐</span>
              Templates Tersimpan
            </h3>
            <div id="qr-templates" class="qr-templates">
              <div class="qr-empty-state">Belum ada template tersimpan</div>
            </div>
          </div>

          <!-- History -->
          <div class="qr-section">
            <h3 class="qr-section-title">
              <span class="qr-section-icon">📜</span>
              Riwayat
            </h3>
            <div id="qr-history" class="qr-history">
              <div class="qr-empty-state">Belum ada riwayat QR Code</div>
            </div>
            <button id="qr-clear-history" class="qr-clear-history">
              <span>🗑️</span>
              <span>Hapus Semua Riwayat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Elements
  const typeButtons = document.querySelectorAll('.qr-type-btn');
  const inputForms = document.querySelectorAll('.qr-input-form');
  const generateBtn = document.getElementById('qr-generate-btn');
  const saveTemplateBtn = document.getElementById('qr-save-template-btn');
  const downloadPngBtn = document.getElementById('qr-download-png');
  const downloadSvgBtn = document.getElementById('qr-download-svg');
  const clearHistoryBtn = document.getElementById('qr-clear-history');
  const previewContainer = document.getElementById('qr-preview');
  
  const sizeSelect = document.getElementById('qr-size');
  const colorDark = document.getElementById('qr-color-dark');
  const colorLight = document.getElementById('qr-color-light');
  const errorLevel = document.getElementById('qr-error-level');

  let currentType = 'text';
  let currentQRCode = null;
  let totalGenerated = 0;
  let totalDownloaded = 0;

  // Update color value displays
  colorDark.addEventListener('input', (e) => {
    e.target.nextElementSibling.value = e.target.value;
  });
  
  colorLight.addEventListener('input', (e) => {
    e.target.nextElementSibling.value = e.target.value;
  });

  // Type switching
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update active form
      currentType = btn.dataset.type;
      inputForms.forEach(form => {
        form.classList.remove('active');
        if (form.dataset.form === currentType) {
          form.classList.add('active');
        }
      });
    });
  });

  // Get QR data based on type
  function getQRData() {
    switch(currentType) {
      case 'text':
        return document.getElementById('qr-text-input').value.trim();
      
      case 'url':
        const url = document.getElementById('qr-url-input').value.trim();
        if (!url) return '';
        return url.startsWith('http') ? url : `https://${url}`;
      
      case 'email':
        const email = document.getElementById('qr-email-input').value.trim();
        const subject = document.getElementById('qr-email-subject').value.trim();
        if (!email) return '';
        return `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
      
      case 'phone':
        const phone = document.getElementById('qr-phone-input').value.trim();
        if (!phone) return '';
        return `tel:${phone}`;
      
      case 'sms':
        const smsPhone = document.getElementById('qr-sms-phone').value.trim();
        const smsMessage = document.getElementById('qr-sms-message').value.trim();
        if (!smsPhone) return '';
        return `SMSTO:${smsPhone}:${smsMessage}`;
      
      case 'wifi':
        const ssid = document.getElementById('qr-wifi-ssid').value.trim();
        const password = document.getElementById('qr-wifi-password').value.trim();
        const security = document.getElementById('qr-wifi-security').value;
        if (!ssid) return '';
        return `WIFI:T:${security};S:${ssid};P:${password};;`;
      
      case 'vcard':
        const name = document.getElementById('qr-vcard-name').value.trim();
        const vcardPhone = document.getElementById('qr-vcard-phone').value.trim();
        const vcardEmail = document.getElementById('qr-vcard-email').value.trim();
        const company = document.getElementById('qr-vcard-company').value.trim();
        if (!name) return '';
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\n${vcardPhone ? `TEL:${vcardPhone}\n` : ''}${vcardEmail ? `EMAIL:${vcardEmail}\n` : ''}${company ? `ORG:${company}\n` : ''}END:VCARD`;
      
      case 'location':
        const lat = document.getElementById('qr-location-lat').value.trim();
        const lon = document.getElementById('qr-location-lon').value.trim();
        if (!lat || !lon) return '';
        return `geo:${lat},${lon}`;
      
      default:
        return '';
    }
  }

  // Generate QR Code
  function generate() {
    const data = getQRData();
    
    if (!data) {
      showToast('⚠️ Masukkan data terlebih dahulu');
      return;
    }

    const options = {
      size: parseInt(sizeSelect.value),
      colorDark: colorDark.value,
      colorLight: colorLight.value,
      errorCorrectionLevel: errorLevel.value
    };

    currentQRCode = generateQRCode(previewContainer, data, options);
    
    if (currentQRCode) {
      totalGenerated++;
      updateStats();
      addToHistory(data, currentType);
      renderHistory();
      showToast('✅ QR Code berhasil dibuat');
    }
  }

  // Download as PNG
  function downloadPNG() {
    if (!currentQRCode) {
      showToast('⚠️ Generate QR Code terlebih dahulu');
      return;
    }

    try {
      const canvas = previewContainer.querySelector('canvas');
      if (!canvas) {
        showToast('⚠️ QR Code tidak ditemukan');
        return;
      }

      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      totalDownloaded++;
      updateStats();
      showToast('📥 QR Code berhasil didownload');
    } catch (err) {
      showToast('⚠️ Gagal download QR Code');
    }
  }

  // Download as SVG
  function downloadSVG() {
    if (!currentQRCode) {
      showToast('⚠️ Generate QR Code terlebih dahulu');
      return;
    }

    try {
      const canvas = previewContainer.querySelector('canvas');
      if (!canvas) {
        showToast('⚠️ QR Code tidak ditemukan');
        return;
      }

      // Convert canvas to SVG
      const size = parseInt(sizeSelect.value);
      const imgData = canvas.toDataURL('image/png');
      
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <image width="${size}" height="${size}" xlink:href="${imgData}"/>
</svg>`;

      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      
      totalDownloaded++;
      updateStats();
      showToast('📥 QR Code SVG berhasil didownload');
    } catch (err) {
      showToast('⚠️ Gagal download SVG');
    }
  }

  // Save Template
  function saveTemplate() {
    const name = prompt('Nama template:');
    if (!name || !name.trim()) return;
    
    const templates = loadTemplates();
    
    if (templates.length >= 10) {
      showToast('⚠️ Maksimal 10 templates');
      return;
    }

    const data = getQRData();
    if (!data) {
      showToast('⚠️ Masukkan data terlebih dahulu');
      return;
    }

    const template = {
      name: name.trim(),
      type: currentType,
      data: data,
      settings: {
        size: parseInt(sizeSelect.value),
        colorDark: colorDark.value,
        colorLight: colorLight.value,
        errorLevel: errorLevel.value
      },
      timestamp: new Date().toISOString()
    };

    templates.push(template);
    saveTemplates(templates);
    renderTemplates();
    updateStats();
    showToast(`⭐ Template "${name}" disimpan`);
  }

  // Render Templates
  function renderTemplates() {
    const container = document.getElementById('qr-templates');
    const templates = loadTemplates();
    
    if (templates.length === 0) {
      container.innerHTML = '<div class="qr-empty-state">Belum ada template tersimpan</div>';
      return;
    }

    const typeIcons = {
      text: '📝', url: '🔗', email: '📧', phone: '📞',
      sms: '💬', wifi: '📶', vcard: '👤', location: '📍'
    };

    const html = templates.map((template, index) => {
      return `
        <div class="qr-template-item">
          <button class="qr-template-load" data-index="${index}">
            <span class="qr-template-icon">${typeIcons[template.type] || '📝'}</span>
            <div class="qr-template-info">
              <div class="qr-template-name">${template.name}</div>
              <div class="qr-template-type">${template.type.toUpperCase()}</div>
            </div>
          </button>
          <button class="qr-template-delete" data-index="${index}">
            <span>🗑️</span>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    // Add event listeners
    container.querySelectorAll('.qr-template-load').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        const templates = loadTemplates();
        const template = templates[index];
        
        // Switch type
        currentType = template.type;
        typeButtons.forEach(b => {
          b.classList.remove('active');
          if (b.dataset.type === currentType) {
            b.classList.add('active');
          }
        });
        
        inputForms.forEach(form => {
          form.classList.remove('active');
          if (form.dataset.form === currentType) {
            form.classList.add('active');
          }
        });

        // Set values based on type (simplified - you'd parse the data properly)
        if (currentType === 'text') {
          document.getElementById('qr-text-input').value = template.data;
        } else if (currentType === 'url') {
          document.getElementById('qr-url-input').value = template.data;
        }
        // Add more type handling as needed

        // Apply settings
        sizeSelect.value = template.settings.size;
        colorDark.value = template.settings.colorDark;
        colorLight.value = template.settings.colorLight;
        errorLevel.value = template.settings.errorLevel;

        showToast(`⭐ Template "${template.name}" dimuat`);
        generate();
      });
    });

    container.querySelectorAll('.qr-template-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        const templates = loadTemplates();
        const template = templates[index];
        
        if (confirm(`Hapus template "${template.name}"?`)) {
          templates.splice(index, 1);
          saveTemplates(templates);
          renderTemplates();
          updateStats();
          showToast(`🗑️ Template "${template.name}" dihapus`);
        }
      });
    });
  }

  // Render History
  function renderHistory() {
    const container = document.getElementById('qr-history');
    const history = loadHistory();
    
    if (history.length === 0) {
      container.innerHTML = '<div class="qr-empty-state">Belum ada riwayat QR Code</div>';
      return;
    }

    const typeIcons = {
      text: '📝', url: '🔗', email: '📧', phone: '📞',
      sms: '💬', wifi: '📶', vcard: '👤', location: '📍'
    };

    const html = history.map((item, index) => {
      const date = new Date(item.timestamp);
      const timeStr = date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });

      return `
        <div class="qr-history-item">
          <div class="qr-history-icon">${typeIcons[item.type] || '📝'}</div>
          <div class="qr-history-main">
            <div class="qr-history-data">${item.data.substring(0, 60)}${item.data.length > 60 ? '...' : ''}</div>
            <div class="qr-history-meta">
              <span class="qr-history-time">⏰ ${timeStr}</span>
              <span class="qr-history-type">📋 ${item.type.toUpperCase()}</span>
            </div>
          </div>
          <button class="qr-history-regenerate" data-index="${index}">
            <span>🔄</span>
            <span>Regenerate</span>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    // Add regenerate handlers
    container.querySelectorAll('.qr-history-regenerate').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        const history = loadHistory();
        const item = history[index];
        
        // Switch to correct type
        currentType = item.type;
        typeButtons.forEach(b => {
          b.classList.remove('active');
          if (b.dataset.type === currentType) {
            b.classList.add('active');
          }
        });
        
        inputForms.forEach(form => {
          form.classList.remove('active');
          if (form.dataset.form === currentType) {
            form.classList.add('active');
          }
        });

        // Set the data
        if (currentType === 'text') {
          document.getElementById('qr-text-input').value = item.data;
        } else if (currentType === 'url') {
          document.getElementById('qr-url-input').value = item.data;
        }
        // Add more type handling

        showToast('🔄 Data dimuat dari history');
        generate();
      });
    });
  }

  // Update Stats
  function updateStats() {
    document.getElementById('qr-total-generated').textContent = totalGenerated;
    document.getElementById('qr-total-downloaded').textContent = totalDownloaded;
    document.getElementById('qr-total-templates').textContent = loadTemplates().length;
  }

  // Event listeners
  generateBtn.addEventListener('click', generate);
  downloadPngBtn.addEventListener('click', downloadPNG);
  downloadSvgBtn.addEventListener('click', downloadSVG);
  saveTemplateBtn.addEventListener('click', saveTemplate);
  
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Hapus semua riwayat QR Code?')) {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
      showToast('🗑️ Riwayat dihapus');
    }
  });

  // Initial render
  renderTemplates();
  renderHistory();
  updateStats();
}
