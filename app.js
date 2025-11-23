import { initTodo, getTodoSummary } from "./components/todo.js";
import { initHabit, getHabitSummary } from "./components/habit.js";
import { initPomodoro } from "./components/pomodoro.js";
import { initPlanner } from "./components/planner.js";
import { initGoals } from "./components/goals.js";
import { initCalculator } from "./components/calculator.js";
import { initFlashcard } from "./components/flashcard.js";
import { initDictionary } from "./components/dictionary.js";
import { initNotes } from "./components/notes.js";
import { initFinance, getFinanceSummary } from "./components/finance.js";
import { initShopping } from "./components/shopping.js";
import { initRecipes } from "./components/recipes.js";
import { initWater, getWaterSummary } from "./components/water.js";
import { initMood, getMoodSummary } from "./components/mood.js";
import { initWorkout } from "./components/workout.js";
import { initSholat } from "./components/sholat.js";
import { initWeather, getWeatherSummary } from "./components/weather.js";
import { initPassword } from "./components/password.js";
import { initQr } from "./components/qr.js";
import { initConverter } from "./components/converter.js";

const root = document.documentElement;

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(4px)";
    setTimeout(() => el.remove(), 180);
  }, 2000);
}

function formatDateId(date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function initTheme() {
  const stored = localStorage.getItem("aolt-theme");
  if (stored === "dark") {
    root.setAttribute("data-theme", "dark");
  }
  const btn = document.getElementById("toggle-theme");
  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    if (current === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    localStorage.setItem("aolt-theme", current);
  });
}

function initNavigation() {
  const nav = document.getElementById("nav");
  const sections = document.querySelectorAll(".section");
  const title = document.getElementById("page-title");

  nav.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-section]");
    if (!btn) return;
    const id = btn.dataset.section;
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    sections.forEach((s) => {
      s.classList.toggle("active", s.id === id);
    });
    title.textContent = btn.textContent;
  });
}

function initTodayLabel() {
  const el = document.getElementById("today-label");
  el.textContent = formatDateId(new Date());
}

function renderDashboard() {
  const el = document.getElementById("dashboard");
  const todoSummary = getTodoSummary();
  const habitSummary = getHabitSummary();
  const waterSummary = getWaterSummary();
  const moodSummary = getMoodSummary();
  const financeSummary = getFinanceSummary();
  const weatherSummary = getWeatherSummary();

  el.innerHTML = `
    <div class="dashboard-intro">
      <div class="dashboard-hero">
        <div class="dashboard-hero-emoji">🎯</div>
        <div class="dashboard-hero-title">Selamat datang di All-in-One Life Toolkit</div>
        <div class="dashboard-hero-text">Ringkas semua alat penting harian Anda di satu tempat. Mulai dari tugas, kebiasaan, fokus, hingga keuangan, ibadah, dan cuaca.</div>
        <div class="quick-actions mt-md">
          <button class="quick-action-btn" data-jump="todo">
            <span class="quick-action-icon">✅</span>
            <span class="quick-action-label">Tambah Tugas</span>
          </button>
          <button class="quick-action-btn" data-jump="habit">
            <span class="quick-action-icon">⭐</span>
            <span class="quick-action-label">Atur Kebiasaan</span>
          </button>
          <button class="quick-action-btn" data-jump="pomodoro">
            <span class="quick-action-icon">⏱️</span>
            <span class="quick-action-label">Mulai Fokus</span>
          </button>
          <button class="quick-action-btn" data-jump="finance">
            <span class="quick-action-icon">💰</span>
            <span class="quick-action-label">Cek Keuangan</span>
          </button>
        </div>
      </div>
      <div class="dashboard-onboarding">
        <div class="onboarding-header">
          <span class="onboarding-icon">🚀</span>
          <div class="card-title">Panduan Cepat Memulai</div>
        </div>
        <div class="onboarding-steps">
          <div class="onboarding-step">
            <div class="step-number">1</div>
            <div class="step-content">
              <div class="step-title">Catat Tugas Penting</div>
              <div class="step-desc">Buka <span class="onboarding-tag">To-Do</span> dan tulis 3 tugas terpenting hari ini</div>
            </div>
          </div>
          <div class="onboarding-step">
            <div class="step-number">2</div>
            <div class="step-content">
              <div class="step-title">Bangun Kebiasaan Baik</div>
              <div class="step-desc">Tambah 1–2 kebiasaan di <span class="onboarding-tag">Habit</span> yang ingin dijaga setiap hari</div>
            </div>
          </div>
          <div class="onboarding-step">
            <div class="step-number">3</div>
            <div class="step-content">
              <div class="step-title">Fokus & Produktif</div>
              <div class="step-desc">Jalankan sesi <span class="onboarding-tag">Pomodoro</span> untuk mengerjakan tugas utama</div>
            </div>
          </div>
        </div>
        <div class="onboarding-footer">💡 Jelajahi 20 alat lainnya sesuai kebutuhan Anda</div>
      </div>
    </div>

    <div class="dashboard-shortcuts">
      <div class="shortcuts-header">
        <span class="shortcuts-icon">🧭</span>
        <div class="card-title">Jelajahi Semua Alat (20 Fitur)</div>
      </div>
      <div class="shortcuts-grid">
        <button class="shortcut-card" data-jump="todo">
          <span class="shortcut-icon">📝</span>
          <span class="shortcut-label">To-Do</span>
        </button>
        <button class="shortcut-card" data-jump="habit">
          <span class="shortcut-icon">⭐</span>
          <span class="shortcut-label">Habit</span>
        </button>
        <button class="shortcut-card" data-jump="pomodoro">
          <span class="shortcut-icon">⏱️</span>
          <span class="shortcut-label">Pomodoro</span>
        </button>
        <button class="shortcut-card" data-jump="planner">
          <span class="shortcut-icon">📅</span>
          <span class="shortcut-label">Planner</span>
        </button>
        <button class="shortcut-card" data-jump="goals">
          <span class="shortcut-icon">🎯</span>
          <span class="shortcut-label">Goals</span>
        </button>
        <button class="shortcut-card" data-jump="calculator">
          <span class="shortcut-icon">🔢</span>
          <span class="shortcut-label">Kalkulator</span>
        </button>
        <button class="shortcut-card" data-jump="flashcard">
          <span class="shortcut-icon">🃏</span>
          <span class="shortcut-label">Flashcard</span>
        </button>
        <button class="shortcut-card" data-jump="dictionary">
          <span class="shortcut-icon">📖</span>
          <span class="shortcut-label">Kamus</span>
        </button>
        <button class="shortcut-card" data-jump="notes">
          <span class="shortcut-icon">📄</span>
          <span class="shortcut-label">Markdown</span>
        </button>
        <button class="shortcut-card" data-jump="finance">
          <span class="shortcut-icon">💰</span>
          <span class="shortcut-label">Keuangan</span>
        </button>
        <button class="shortcut-card" data-jump="shopping">
          <span class="shortcut-icon">🛒</span>
          <span class="shortcut-label">Belanja</span>
        </button>
        <button class="shortcut-card" data-jump="recipes">
          <span class="shortcut-icon">🍳</span>
          <span class="shortcut-label">Resep</span>
        </button>
        <button class="shortcut-card" data-jump="water">
          <span class="shortcut-icon">💧</span>
          <span class="shortcut-label">Air</span>
        </button>
        <button class="shortcut-card" data-jump="mood">
          <span class="shortcut-icon">😊</span>
          <span class="shortcut-label">Mood</span>
        </button>
        <button class="shortcut-card" data-jump="workout">
          <span class="shortcut-icon">💪</span>
          <span class="shortcut-label">Workout</span>
        </button>
        <button class="shortcut-card" data-jump="sholat">
          <span class="shortcut-icon">🕌</span>
          <span class="shortcut-label">Sholat</span>
        </button>
        <button class="shortcut-card" data-jump="weather">
          <span class="shortcut-icon">🌤️</span>
          <span class="shortcut-label">Cuaca</span>
        </button>
        <button class="shortcut-card" data-jump="password">
          <span class="shortcut-icon">🔐</span>
          <span class="shortcut-label">Password</span>
        </button>
        <button class="shortcut-card" data-jump="qr">
          <span class="shortcut-icon">📱</span>
          <span class="shortcut-label">QR Code</span>
        </button>
        <button class="shortcut-card" data-jump="converter">
          <span class="shortcut-icon">🔄</span>
          <span class="shortcut-label">Converter</span>
        </button>
      </div>
    </div>

    <div class="card-grid">
      <div class="card dashboard-card dashboard-card-blue">
        <div class="card-icon">📝</div>
        <div class="card-header">
          <div>
            <div class="card-title">Tugas Hari Ini</div>
            <div class="card-subtitle">Ringkasan to-do harian</div>
          </div>
        </div>
        <div class="mt-md">
          <div class="dashboard-stat">
            <span class="stat-number">${todoSummary.remaining}</span>
            <span class="stat-label">tugas tersisa dari ${todoSummary.total}</span>
          </div>
          <div class="progress-bar mt-sm">
            <div class="progress-bar-inner" style="width:${todoSummary.percent}%"></div>
          </div>
        </div>
      </div>

      <div class="card dashboard-card dashboard-card-purple">
        <div class="card-icon">⭐</div>
        <div class="card-header">
          <div>
            <div class="card-title">Progress Kebiasaan</div>
            <div class="card-subtitle">Kebiasaan selesai hari ini</div>
          </div>
        </div>
        <div class="mt-md">
          <div class="dashboard-stat">
            <span class="stat-number">${habitSummary.done}</span>
            <span class="stat-label">dari ${habitSummary.total} kebiasaan</span>
          </div>
          <div class="progress-bar mt-sm">
            <div class="progress-bar-inner" style="width:${habitSummary.percent}%"></div>
          </div>
        </div>
      </div>

      <div class="card dashboard-card dashboard-card-yellow">
        <div class="card-icon">😊</div>
        <div class="card-header">
          <div>
            <div class="card-title">Mood Hari Ini</div>
            <div class="card-subtitle">Catatan singkat suasana hati</div>
          </div>
          <span class="chip ${moodSummary.moodClass}">${moodSummary.label}</span>
        </div>
        <div class="mt-sm card-subtitle">${moodSummary.note || "Belum ada catatan mood hari ini."}</div>
      </div>

      <div class="card dashboard-card dashboard-card-cyan">
        <div class="card-icon">💧</div>
        <div class="card-header">
          <div>
            <div class="card-title">Air Minum</div>
            <div class="card-subtitle">Target harian ${waterSummary.target} gelas</div>
          </div>
        </div>
        <div class="mt-md">
          <div class="dashboard-stat">
            <span class="stat-number">${waterSummary.current}</span>
            <span class="stat-label">gelas diminum</span>
          </div>
          <div class="progress-bar mt-sm">
            <div class="progress-bar-inner" style="width:${waterSummary.percent}%"></div>
          </div>
        </div>
      </div>

      <div class="card dashboard-card dashboard-card-green">
        <div class="card-icon">💰</div>
        <div class="card-header">
          <div>
            <div class="card-title">Pengeluaran Hari Ini</div>
            <div class="card-subtitle">Ringkasan keuangan personal</div>
          </div>
        </div>
        <div class="mt-md">
          <div class="dashboard-stat">
            <span class="stat-number">Rp ${financeSummary.spentToday.toLocaleString("id-ID")}</span>
          </div>
          <div class="card-subtitle mt-sm">Pemasukan: Rp ${financeSummary.incomeMonth.toLocaleString("id-ID")}</div>
        </div>
      </div>

      <div class="card dashboard-card dashboard-card-orange">
        <div class="card-icon">🌤️</div>
        <div class="card-header">
          <div>
            <div class="card-title">Cuaca</div>
            <div class="card-subtitle">Perkiraan hari ini</div>
          </div>
        </div>
        <div class="mt-md">
          <div class="dashboard-stat">
            <span class="stat-label">${weatherSummary.description}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  el.querySelectorAll(".quick-action-btn, .shortcut-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.jump;
      const navBtn = document.querySelector(`.nav-item[data-section="${target}"]`);
      if (navBtn) navBtn.click();
    });
  });
}

export function refreshDashboard() {
  renderDashboard();
}

export { showToast };

function initSections() {
  initTodo();
  initHabit();
  initPomodoro();
  initPlanner();
  initGoals();
  initCalculator();
  initFlashcard();
  initDictionary();
  initNotes();
  initFinance();
  initShopping();
  initRecipes();
  initWater();
  initMood();
  initWorkout();
  initSholat();
  initWeather();
  initPassword();
  initQr();
  initConverter();
}

window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNavigation();
  initTodayLabel();
  initSections();
  renderDashboard();
});
