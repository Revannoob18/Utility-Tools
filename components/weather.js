import { refreshDashboard, showToast } from "../app.js";

const DEFAULT_COORD = { lat: -6.2088, lon: 106.8456, city: "Jakarta" };
const KEY = "aolt-weather";
const FAVORITES_KEY = "aolt-weather-favorites";
const HISTORY_KEY = "aolt-weather-history";

function loadCoords() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || DEFAULT_COORD;
  } catch {
    return DEFAULT_COORD;
  }
}

function saveCoords(c) {
  localStorage.setItem(KEY, JSON.stringify(c));
}

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

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

function addToHistory(location) {
  const history = loadHistory();
  const exists = history.find(h => h.city === location.city);
  
  if (!exists) {
    history.unshift(location);
    if (history.length > 10) history.pop();
    saveHistory(history);
  }
}

let latestSummary = { description: "Belum dimuat" };
let currentWeatherData = null;

export function getWeatherSummary() {
  return latestSummary;
}

// Popular Indonesian cities
const INDONESIAN_CITIES = [
  { city: "Jakarta", lat: -6.2088, lon: 106.8456, country: "Indonesia" },
  { city: "Surabaya", lat: -7.2575, lon: 112.7521, country: "Indonesia" },
  { city: "Bandung", lat: -6.9175, lon: 107.6191, country: "Indonesia" },
  { city: "Medan", lat: 3.5952, lon: 98.6722, country: "Indonesia" },
  { city: "Semarang", lat: -6.9667, lon: 110.4167, country: "Indonesia" },
  { city: "Makassar", lat: -5.1477, lon: 119.4327, country: "Indonesia" },
  { city: "Palembang", lat: -2.9761, lon: 104.7754, country: "Indonesia" },
  { city: "Tangerang", lat: -6.1783, lon: 106.6319, country: "Indonesia" },
  { city: "Depok", lat: -6.4025, lon: 106.7942, country: "Indonesia" },
  { city: "Bekasi", lat: -6.2349, lon: 106.9896, country: "Indonesia" },
  { city: "Yogyakarta", lat: -7.7956, lon: 110.3695, country: "Indonesia" },
  { city: "Malang", lat: -7.9797, lon: 112.6304, country: "Indonesia" },
  { city: "Bogor", lat: -6.5950, lon: 106.7969, country: "Indonesia" },
  { city: "Batam", lat: 1.0456, lon: 104.0305, country: "Indonesia" },
  { city: "Bali", lat: -8.3405, lon: 115.0920, country: "Indonesia" }
];

// World popular cities
const WORLD_CITIES = [
  { city: "Tokyo", country: "Japan", flag: "🇯🇵" },
  { city: "London", country: "United Kingdom", flag: "🇬🇧" },
  { city: "New York", country: "United States", flag: "🇺🇸" },
  { city: "Paris", country: "France", flag: "🇫🇷" },
  { city: "Dubai", country: "United Arab Emirates", flag: "🇦🇪" },
  { city: "Singapore", country: "Singapore", flag: "🇸🇬" }
];

// Weather condition icons
function getWeatherIcon(code, isDay) {
  const weatherCodes = {
    0: { day: "☀️", night: "🌙", desc: "Cerah" },
    1: { day: "🌤️", night: "🌙", desc: "Cerah Sebagian" },
    2: { day: "⛅", night: "☁️", desc: "Berawan Sebagian" },
    3: { day: "☁️", night: "☁️", desc: "Berawan" },
    45: { day: "🌫️", night: "🌫️", desc: "Kabut" },
    48: { day: "🌫️", night: "🌫️", desc: "Kabut Tebal" },
    51: { day: "🌦️", night: "🌧️", desc: "Gerimis Ringan" },
    53: { day: "🌦️", night: "🌧️", desc: "Gerimis" },
    55: { day: "🌦️", night: "🌧️", desc: "Gerimis Lebat" },
    61: { day: "🌧️", night: "🌧️", desc: "Hujan Ringan" },
    63: { day: "🌧️", night: "🌧️", desc: "Hujan Sedang" },
    65: { day: "🌧️", night: "🌧️", desc: "Hujan Lebat" },
    71: { day: "🌨️", night: "🌨️", desc: "Salju Ringan" },
    73: { day: "🌨️", night: "🌨️", desc: "Salju" },
    75: { day: "🌨️", night: "🌨️", desc: "Salju Lebat" },
    77: { day: "🌨️", night: "🌨️", desc: "Hujan Salju" },
    80: { day: "🌦️", night: "🌧️", desc: "Hujan Ringan" },
    81: { day: "🌧️", night: "🌧️", desc: "Hujan Deras" },
    82: { day: "⛈️", night: "⛈️", desc: "Hujan Sangat Deras" },
    85: { day: "🌨️", night: "🌨️", desc: "Salju Ringan" },
    86: { day: "🌨️", night: "🌨️", desc: "Salju Lebat" },
    95: { day: "⛈️", night: "⛈️", desc: "Badai Petir" },
    96: { day: "⛈️", night: "⛈️", desc: "Badai dengan Hujan Es" },
    99: { day: "⛈️", night: "⛈️", desc: "Badai Petir Hebat" }
  };
  
  const weather = weatherCodes[code] || weatherCodes[0];
  return {
    icon: isDay ? weather.day : weather.night,
    desc: weather.desc
  };
}

export function initWeather() {
  const section = document.getElementById("weather");
  section.innerHTML = `
    <div class="weather-container">
      <!-- Header -->
      <div class="weather-header">
        <div class="weather-header-content">
          <div class="weather-header-left">
            <div class="weather-icon">🌤️</div>
            <div>
              <div class="weather-header-title">Weather Tracker</div>
              <div class="weather-header-subtitle">Prakiraan cuaca real-time dari Open-Meteo</div>
            </div>
          </div>
          <div class="weather-stats">
            <div class="weather-stat-card">
              <div class="weather-stat-icon">🌡️</div>
              <div class="weather-stat-content">
                <div class="weather-stat-value" id="weather-temp">--°C</div>
                <div class="weather-stat-label">Suhu Saat Ini</div>
              </div>
            </div>
            <div class="weather-stat-card">
              <div class="weather-stat-icon">💧</div>
              <div class="weather-stat-content">
                <div class="weather-stat-value" id="weather-humidity">--%</div>
                <div class="weather-stat-label">Kelembaban</div>
              </div>
            </div>
            <div class="weather-stat-card">
              <div class="weather-stat-icon">💨</div>
              <div class="weather-stat-content">
                <div class="weather-stat-value" id="weather-wind">-- km/h</div>
                <div class="weather-stat-label">Kecepatan Angin</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="weather-main-grid">
        <!-- Current Weather -->
        <div class="weather-current-card">
          <div class="weather-panel-header">
            <span class="weather-panel-icon">🌍</span>
            <span class="weather-panel-title">Cuaca Saat Ini</span>
          </div>
          
          <div class="weather-current-content">
            <!-- City Search -->
            <div class="weather-search">
              <div class="weather-search-wrapper">
                <input 
                  type="text" 
                  id="weather-city-input" 
                  class="weather-input" 
                  placeholder="Cari kota di seluruh dunia..."
                  autocomplete="off"
                />
              </div>
              <button class="weather-search-btn" id="weather-search-btn">
                <span>🔍</span>
              </button>
              <button class="weather-location-btn" id="weather-location-btn" title="Gunakan lokasi saat ini">
                <span>📍</span>
              </button>
            </div>

            <!-- Loading -->
            <div class="weather-loading" id="weather-loading" style="display: none;">
              <div class="weather-loading-spinner">⏳</div>
              <div class="weather-loading-text">Memuat data cuaca...</div>
            </div>

            <!-- Current Weather Display -->
            <div class="weather-current-display" id="weather-current-display">
              <div class="weather-location-info">
                <div class="weather-city-name" id="weather-city-name">Jakarta</div>
                <div class="weather-coords" id="weather-coords">-6.21, 106.85</div>
              </div>
              
              <div class="weather-main-info">
                <div class="weather-main-icon" id="weather-main-icon">☀️</div>
                <div class="weather-main-temp" id="weather-main-temp">--°C</div>
                <div class="weather-main-desc" id="weather-main-desc">Memuat...</div>
              </div>

              <div class="weather-details-grid">
                <div class="weather-detail-item">
                  <span class="weather-detail-icon">🌡️</span>
                  <div class="weather-detail-content">
                    <div class="weather-detail-label">Terasa Seperti</div>
                    <div class="weather-detail-value" id="weather-feels-like">--°C</div>
                  </div>
                </div>
                <div class="weather-detail-item">
                  <span class="weather-detail-icon">💧</span>
                  <div class="weather-detail-content">
                    <div class="weather-detail-label">Kelembaban</div>
                    <div class="weather-detail-value" id="weather-humidity-detail">--%</div>
                  </div>
                </div>
                <div class="weather-detail-item">
                  <span class="weather-detail-icon">💨</span>
                  <div class="weather-detail-content">
                    <div class="weather-detail-label">Angin</div>
                    <div class="weather-detail-value" id="weather-wind-detail">-- km/h</div>
                  </div>
                </div>
                <div class="weather-detail-item">
                  <span class="weather-detail-icon">🧭</span>
                  <div class="weather-detail-content">
                    <div class="weather-detail-label">Arah Angin</div>
                    <div class="weather-detail-value" id="weather-wind-direction">--</div>
                  </div>
                </div>
                <div class="weather-detail-item">
                  <span class="weather-detail-icon">🌡️</span>
                  <div class="weather-detail-content">
                    <div class="weather-detail-label">Tekanan</div>
                    <div class="weather-detail-value" id="weather-pressure">-- hPa</div>
                  </div>
                </div>
                <div class="weather-detail-item">
                  <span class="weather-detail-icon">👁️</span>
                  <div class="weather-detail-content">
                    <div class="weather-detail-label">Jarak Pandang</div>
                    <div class="weather-detail-value" id="weather-visibility">-- km</div>
                  </div>
                </div>
                <div class="weather-detail-item">
                  <span class="weather-detail-icon">☁️</span>
                  <div class="weather-detail-content">
                    <div class="weather-detail-label">Tutupan Awan</div>
                    <div class="weather-detail-value" id="weather-cloud-cover">--%</div>
                  </div>
                </div>
                <div class="weather-detail-item">
                  <span class="weather-detail-icon">☀️</span>
                  <div class="weather-detail-content">
                    <div class="weather-detail-label">UV Index</div>
                    <div class="weather-detail-value" id="weather-uv-index">--</div>
                  </div>
                </div>
              </div>

              <button class="weather-favorite-btn" id="weather-favorite-btn">
                <span id="weather-favorite-icon">⭐</span>
                <span id="weather-favorite-text">Tambah ke Favorit</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Side Panel -->
        <div class="weather-side-panel">
          <!-- 24 Hour Forecast -->
          <div class="weather-forecast-card">
            <div class="weather-panel-header">
              <span class="weather-panel-icon">⏰</span>
              <span class="weather-panel-title">Prakiraan 24 Jam</span>
            </div>
            <div class="weather-forecast-content" id="weather-hourly-forecast"></div>
          </div>

          <!-- Quick Cities -->
          <div class="weather-quick-cities-card">
            <div class="weather-panel-header">
              <span class="weather-panel-icon">🌍</span>
              <span class="weather-panel-title">Kota Populer Dunia</span>
            </div>
            <div class="weather-quick-cities" id="weather-quick-cities"></div>
          </div>

          <!-- Favorites -->
          <div class="weather-favorites-card">
            <div class="weather-panel-header">
              <span class="weather-panel-icon">⭐</span>
              <span class="weather-panel-title">Kota Favorit</span>
            </div>
            <div class="weather-favorites-content" id="weather-favorites"></div>
          </div>
        </div>
      </div>

      <!-- 7 Day Forecast -->
      <div class="weather-week-forecast">
        <div class="weather-panel-header">
          <span class="weather-panel-icon">📅</span>
          <span class="weather-panel-title">Prakiraan 7 Hari</span>
        </div>
        <div class="weather-week-content" id="weather-week-forecast"></div>
      </div>

      <!-- History -->
      <div class="weather-history-section">
        <div class="weather-panel-header">
          <span class="weather-panel-icon">📖</span>
          <span class="weather-panel-title">Riwayat Pencarian</span>
          <button class="weather-clear-history-btn" id="weather-clear-history">
            <span>🗑️</span>
            <span>Hapus</span>
          </button>
        </div>
        <div class="weather-history-content" id="weather-history"></div>
      </div>
    </div>
  `;

  // Elements
  const cityInput = document.getElementById('weather-city-input');
  const searchBtn = document.getElementById('weather-search-btn');
  const locationBtn = document.getElementById('weather-location-btn');
  const favoriteBtn = document.getElementById('weather-favorite-btn');
  const clearHistoryBtn = document.getElementById('weather-clear-history');
  const loading = document.getElementById('weather-loading');
  const currentDisplay = document.getElementById('weather-current-display');

  const coords = loadCoords();
  cityInput.value = coords.city || '';

  let searchTimeout = null;
  let searchResults = [];

  async function searchCity(query) {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=id&format=json`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results.map(result => ({
          city: result.name,
          lat: result.latitude,
          lon: result.longitude,
          country: result.country,
          admin: result.admin1 || '',
          id: result.id
        }));
      }
      return [];
    } catch (err) {
      console.error('Search error:', err);
      return [];
    }
  }

  function showSearchResults(results) {
    let datalist = document.getElementById('weather-cities');
    
    // Remove old datalist and create new one
    if (datalist) {
      datalist.remove();
    }
    
    // Create dropdown div
    let dropdown = document.getElementById('weather-search-dropdown');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'weather-search-dropdown';
      dropdown.className = 'weather-search-dropdown';
      cityInput.parentElement.appendChild(dropdown);
    }
    
    if (results.length === 0) {
      dropdown.style.display = 'none';
      return;
    }
    
    const html = results.map(result => `
      <div class="weather-search-result-item" 
           data-city="${result.city}" 
           data-lat="${result.lat}" 
           data-lon="${result.lon}"
           data-country="${result.country}">
        <div class="weather-search-result-main">
          <span class="weather-search-result-city">${result.city}</span>
          <span class="weather-search-result-country">${result.country}</span>
        </div>
        ${result.admin ? `<div class="weather-search-result-admin">${result.admin}</div>` : ''}
      </div>
    `).join('');
    
    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
    
    // Add click handlers
    dropdown.querySelectorAll('.weather-search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const city = item.dataset.city;
        const lat = parseFloat(item.dataset.lat);
        const lon = parseFloat(item.dataset.lon);
        const country = item.dataset.country;
        
        cityInput.value = `${city}, ${country}`;
        dropdown.style.display = 'none';
        loadWeather(lat, lon, `${city}, ${country}`);
      });
    });
  }

  function hideSearchResults() {
    setTimeout(() => {
      const dropdown = document.getElementById('weather-search-dropdown');
      if (dropdown) {
        dropdown.style.display = 'none';
      }
    }, 200);
  }

  function getWindDirection(degrees) {
    const directions = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  function getUVLevel(uv) {
    if (uv < 3) return { level: 'Rendah', color: '#10b981' };
    if (uv < 6) return { level: 'Sedang', color: '#f59e0b' };
    if (uv < 8) return { level: 'Tinggi', color: '#ef4444' };
    if (uv < 11) return { level: 'Sangat Tinggi', color: '#dc2626' };
    return { level: 'Ekstrem', color: '#991b1b' };
  }

  async function loadWeather(lat, lon, cityName) {
    loading.style.display = 'flex';
    currentDisplay.style.display = 'none';
    
    const url = `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m` +
      `&hourly=temperature_2m,weather_code,precipitation_probability` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,wind_speed_10m_max` +
      `&timezone=auto`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.current) throw new Error("Data tidak tersedia");
      
      currentWeatherData = data;
      const location = { lat, lon, city: cityName };
      
      saveCoords(location);
      addToHistory(location);
      
      renderCurrentWeather(data, cityName, lat, lon);
      renderHourlyForecast(data);
      renderWeekForecast(data);
      renderHistory();
      
      // Update summary for dashboard
      const temp = Math.round(data.current.temperature_2m);
      const weatherInfo = getWeatherIcon(data.current.weather_code, data.current.is_day);
      latestSummary = { description: `${temp}°C - ${weatherInfo.desc} di ${cityName}` };
      refreshDashboard();
      
      loading.style.display = 'none';
      currentDisplay.style.display = 'block';
      
      showToast(`✅ Data cuaca ${cityName} berhasil dimuat`);
    } catch (err) {
      loading.style.display = 'none';
      showToast(`⚠️ Gagal memuat: ${err.message}`);
    }
  }

  function renderCurrentWeather(data, cityName, lat, lon) {
    const current = data.current;
    const weatherInfo = getWeatherIcon(current.weather_code, current.is_day);
    const uvData = getUVLevel(data.daily.uv_index_max[0] || 0);
    
    // Update header stats
    document.getElementById('weather-temp').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('weather-humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('weather-wind').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    
    // Update location
    document.getElementById('weather-city-name').textContent = cityName;
    document.getElementById('weather-coords').textContent = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    
    // Update main weather
    document.getElementById('weather-main-icon').textContent = weatherInfo.icon;
    document.getElementById('weather-main-temp').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('weather-main-desc').textContent = weatherInfo.desc;
    
    // Update details
    document.getElementById('weather-feels-like').textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById('weather-humidity-detail').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('weather-wind-detail').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById('weather-wind-direction').textContent = getWindDirection(current.wind_direction_10m);
    document.getElementById('weather-pressure').textContent = `${Math.round(current.pressure_msl)} hPa`;
    document.getElementById('weather-visibility').textContent = '10 km';
    document.getElementById('weather-cloud-cover').textContent = `${current.cloud_cover}%`;
    
    const uvElement = document.getElementById('weather-uv-index');
    uvElement.textContent = uvData.level;
    uvElement.style.color = uvData.color;
    
    // Update favorite button
    updateFavoriteButton(cityName, lat, lon);
  }

  function renderHourlyForecast(data) {
    const container = document.getElementById('weather-hourly-forecast');
    const hourly = data.hourly;
    const now = new Date();
    
    const html = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(hourly.time[i]);
      const temp = Math.round(hourly.temperature_2m[i]);
      const weatherInfo = getWeatherIcon(hourly.weather_code[i], 1);
      const precipitation = hourly.precipitation_probability[i] || 0;
      
      return `
        <div class="weather-hourly-item">
          <div class="weather-hourly-time">${hour.getHours()}:00</div>
          <div class="weather-hourly-icon">${weatherInfo.icon}</div>
          <div class="weather-hourly-temp">${temp}°C</div>
          <div class="weather-hourly-precip">💧 ${precipitation}%</div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
  }

  function renderWeekForecast(data) {
    const container = document.getElementById('weather-week-forecast');
    const daily = data.daily;
    
    const html = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(daily.time[i]);
      const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
      const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const weatherInfo = getWeatherIcon(daily.weather_code[i], 1);
      const maxTemp = Math.round(daily.temperature_2m_max[i]);
      const minTemp = Math.round(daily.temperature_2m_min[i]);
      const precipitation = daily.precipitation_probability_max[i] || 0;
      const windSpeed = Math.round(daily.wind_speed_10m_max[i]);
      
      return `
        <div class="weather-day-item">
          <div class="weather-day-header">
            <div class="weather-day-date">
              <div class="weather-day-name">${dayName}</div>
              <div class="weather-day-date-text">${dateStr}</div>
            </div>
            <div class="weather-day-icon">${weatherInfo.icon}</div>
          </div>
          <div class="weather-day-temp">
            <span class="weather-day-max">${maxTemp}°</span>
            <span class="weather-day-separator">/</span>
            <span class="weather-day-min">${minTemp}°</span>
          </div>
          <div class="weather-day-info">
            <div class="weather-day-info-item">
              <span>💧</span>
              <span>${precipitation}%</span>
            </div>
            <div class="weather-day-info-item">
              <span>💨</span>
              <span>${windSpeed} km/h</span>
            </div>
          </div>
          <div class="weather-day-desc">${weatherInfo.desc}</div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
  }

  function renderQuickCities() {
    const container = document.getElementById('weather-quick-cities');
    
    const indonesianHtml = INDONESIAN_CITIES.slice(0, 3).map(city => `
      <button class="weather-quick-city-btn" data-city="${city.city}" data-lat="${city.lat}" data-lon="${city.lon}" data-country="${city.country}">
        <span class="weather-quick-city-icon">🇮🇩</span>
        <span class="weather-quick-city-name">${city.city}</span>
      </button>
    `).join('');
    
    const worldHtml = WORLD_CITIES.map(city => `
      <button class="weather-quick-city-btn world-city" data-city="${city.city}" data-country="${city.country}">
        <span class="weather-quick-city-icon">${city.flag}</span>
        <span class="weather-quick-city-name">${city.city}</span>
      </button>
    `).join('');
    
    container.innerHTML = indonesianHtml + worldHtml;
    
    // Add event listeners
    container.querySelectorAll('.weather-quick-city-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const city = btn.dataset.city;
        const country = btn.dataset.country;
        
        if (btn.dataset.lat && btn.dataset.lon) {
          // Indonesian cities with coordinates
          const lat = parseFloat(btn.dataset.lat);
          const lon = parseFloat(btn.dataset.lon);
          cityInput.value = city;
          loadWeather(lat, lon, city);
        } else {
          // World cities - need to geocode
          cityInput.value = `${city}, ${country}`;
          const results = await searchCity(city);
          if (results.length > 0) {
            const result = results[0];
            loadWeather(result.lat, result.lon, `${result.city}, ${result.country}`);
          } else {
            showToast('⚠️ Kota tidak ditemukan');
          }
        }
      });
    });
  }

  function updateFavoriteButton(cityName, lat, lon) {
    const favorites = loadFavorites();
    const isFavorite = favorites.some(f => f.city === cityName);
    
    const icon = document.getElementById('weather-favorite-icon');
    const text = document.getElementById('weather-favorite-text');
    
    if (isFavorite) {
      icon.textContent = '⭐';
      text.textContent = 'Hapus dari Favorit';
      favoriteBtn.classList.add('active');
    } else {
      icon.textContent = '☆';
      text.textContent = 'Tambah ke Favorit';
      favoriteBtn.classList.remove('active');
    }
    
    favoriteBtn.onclick = () => toggleFavorite(cityName, lat, lon);
  }

  function toggleFavorite(cityName, lat, lon) {
    const favorites = loadFavorites();
    const index = favorites.findIndex(f => f.city === cityName);
    
    if (index > -1) {
      favorites.splice(index, 1);
      showToast(`⭐ ${cityName} dihapus dari favorit`);
    } else {
      if (favorites.length >= 10) {
        showToast('⚠️ Maksimal 10 kota favorit');
        return;
      }
      favorites.push({ city: cityName, lat, lon });
      showToast(`⭐ ${cityName} ditambahkan ke favorit`);
    }
    
    saveFavorites(favorites);
    updateFavoriteButton(cityName, lat, lon);
    renderFavorites();
  }

  function renderFavorites() {
    const container = document.getElementById('weather-favorites');
    const favorites = loadFavorites();
    
    if (favorites.length === 0) {
      container.innerHTML = '<div class="weather-empty-state">Belum ada kota favorit</div>';
      return;
    }
    
    const html = favorites.map(fav => `
      <div class="weather-favorite-item">
        <button class="weather-favorite-load" data-city="${fav.city}" data-lat="${fav.lat}" data-lon="${fav.lon}">
          <span class="weather-favorite-icon">⭐</span>
          <span class="weather-favorite-name">${fav.city}</span>
        </button>
        <button class="weather-favorite-remove" data-city="${fav.city}">
          <span>🗑️</span>
        </button>
      </div>
    `).join('');
    
    container.innerHTML = html;
    
    // Add event listeners
    container.querySelectorAll('.weather-favorite-load').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = btn.dataset.city;
        const lat = parseFloat(btn.dataset.lat);
        const lon = parseFloat(btn.dataset.lon);
        cityInput.value = city;
        loadWeather(lat, lon, city);
      });
    });
    
    container.querySelectorAll('.weather-favorite-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const city = btn.dataset.city;
        const favorites = loadFavorites();
        const filtered = favorites.filter(f => f.city !== city);
        saveFavorites(filtered);
        showToast(`🗑️ ${city} dihapus dari favorit`);
        renderFavorites();
        
        // Update button if current city
        const coords = loadCoords();
        if (coords.city === city) {
          updateFavoriteButton(city, coords.lat, coords.lon);
        }
      });
    });
  }

  function renderHistory() {
    const container = document.getElementById('weather-history');
    const history = loadHistory();
    
    if (history.length === 0) {
      container.innerHTML = '<div class="weather-empty-state">Belum ada riwayat pencarian</div>';
      return;
    }
    
    const html = history.map(item => `
      <button class="weather-history-item" data-city="${item.city}" data-lat="${item.lat}" data-lon="${item.lon}">
        <span class="weather-history-icon">📍</span>
        <div class="weather-history-info">
          <div class="weather-history-city">${item.city}</div>
          <div class="weather-history-coords">${item.lat.toFixed(2)}, ${item.lon.toFixed(2)}</div>
        </div>
      </button>
    `).join('');
    
    container.innerHTML = html;
    
    // Add event listeners
    container.querySelectorAll('.weather-history-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = btn.dataset.city;
        const lat = parseFloat(btn.dataset.lat);
        const lon = parseFloat(btn.dataset.lon);
        cityInput.value = city;
        loadWeather(lat, lon, city);
      });
    });
  }

  // Event handlers
  cityInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (query.length < 2) {
      hideSearchResults();
      return;
    }
    
    searchTimeout = setTimeout(async () => {
      const results = await searchCity(query);
      searchResults = results;
      showSearchResults(results);
    }, 300);
  });

  cityInput.addEventListener('blur', hideSearchResults);
  
  cityInput.addEventListener('focus', () => {
    if (searchResults.length > 0) {
      showSearchResults(searchResults);
    }
  });

  searchBtn.addEventListener('click', async () => {
    const cityName = cityInput.value.trim();
    if (!cityName) {
      showToast('⚠️ Masukkan nama kota');
      return;
    }
    
    // Hide dropdown
    hideSearchResults();
    
    // Check if it's from Indonesian cities
    const localCity = INDONESIAN_CITIES.find(c => c.city.toLowerCase() === cityName.toLowerCase());
    if (localCity) {
      loadWeather(localCity.lat, localCity.lon, localCity.city);
      return;
    }
    
    // Search using geocoding API
    showToast('🔍 Mencari kota...');
    const results = await searchCity(cityName);
    
    if (results.length === 0) {
      showToast('⚠️ Kota tidak ditemukan');
      return;
    }
    
    // Use first result
    const result = results[0];
    cityInput.value = `${result.city}, ${result.country}`;
    loadWeather(result.lat, result.lon, `${result.city}, ${result.country}`);
  });

  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });

  locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('⚠️ Geolocation tidak didukung browser');
      return;
    }
    
    showToast('📍 Mendapatkan lokasi...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Reverse geocode to get city name
        try {
          const url = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=id&format=json`;
          const response = await fetch(url);
          const data = await response.json();
          
          let cityName = 'Lokasi Saya';
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            cityName = `${result.name}, ${result.country}`;
          }
          
          cityInput.value = cityName;
          loadWeather(lat, lon, cityName);
        } catch (err) {
          cityInput.value = 'Lokasi Saya';
          loadWeather(lat, lon, 'Lokasi Saya');
        }
      },
      (error) => {
        showToast('⚠️ Gagal mendapatkan lokasi');
      }
    );
  });

  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Hapus semua riwayat pencarian?')) {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
      showToast('🗑️ Riwayat dihapus');
    }
  });

  // Initial load
  renderQuickCities();
  renderFavorites();
  renderHistory();
  
  if (coords.city) {
    loadWeather(coords.lat, coords.lon, coords.city);
  }
}
