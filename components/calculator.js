export function initCalculator() {
  const section = document.getElementById("calculator");
  section.innerHTML = `
    <div class="calc-header">
      <div class="calc-header-content">
        <div class="calc-header-left">
          <div class="calc-icon">🧮</div>
          <div>
            <div class="calc-header-title">Scientific Calculator</div>
            <div class="calc-header-subtitle">Kalkulator lengkap dengan fungsi ilmiah</div>
          </div>
        </div>
        <button class="calc-mode-btn" id="calc-toggle-mode">
          <span id="calc-mode-icon">🔬</span>
          <span id="calc-mode-text">Scientific</span>
        </button>
      </div>
    </div>

    <div class="calc-container">
      <div class="calc-main">
        <div class="calc-display-card">
          <div class="calc-expression" id="calc-expression"></div>
          <div class="calc-result" id="calc-result">0</div>
        </div>

        <div class="calc-buttons" id="calc-buttons">
          <!-- Buttons will be generated dynamically -->
        </div>
      </div>

      <div class="calc-history-panel" id="calc-history-panel">
        <div class="calc-history-header">
          <h3>📜 History</h3>
          <button class="calc-history-clear" id="calc-clear-history">Clear</button>
        </div>
        <div class="calc-history-list" id="calc-history-list">
          <div class="calc-history-empty">Belum ada riwayat</div>
        </div>
      </div>
    </div>
  `;

  const expressionEl = document.getElementById("calc-expression");
  const resultEl = document.getElementById("calc-result");
  const buttonsEl = document.getElementById("calc-buttons");
  const historyListEl = document.getElementById("calc-history-list");
  const toggleModeBtn = document.getElementById("calc-toggle-mode");
  const clearHistoryBtn = document.getElementById("calc-clear-history");
  const modeIcon = document.getElementById("calc-mode-icon");
  const modeText = document.getElementById("calc-mode-text");

  let currentExpression = "";
  let isScientific = true;
  let history = JSON.parse(localStorage.getItem("aolt-calc-history") || "[]");

  const basicButtons = [
    ["C", "⌫", "%", "/"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="]
  ];

  const scientificButtons = [
    ["C", "⌫", "(", ")", "%", "/"],
    ["sin", "cos", "tan", "7", "8", "9", "×"],
    ["log", "ln", "√", "4", "5", "6", "-"],
    ["π", "e", "^", "1", "2", "3", "+"],
    ["0", ".", "="]
  ];

  function renderButtons() {
    const buttons = isScientific ? scientificButtons : basicButtons;
    buttonsEl.innerHTML = "";
    buttonsEl.className = isScientific ? "calc-buttons calc-scientific" : "calc-buttons calc-basic";

    buttons.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "calc-row";
      
      row.forEach((btn) => {
        const btnEl = document.createElement("button");
        btnEl.className = "calc-btn";
        btnEl.textContent = btn;
        btnEl.dataset.value = btn;

        // Add specific classes for styling
        if (btn === "C") btnEl.classList.add("calc-btn-clear");
        else if (btn === "=") btnEl.classList.add("calc-btn-equal");
        else if (["/", "×", "-", "+", "%", "^"].includes(btn)) btnEl.classList.add("calc-btn-operator");
        else if (["sin", "cos", "tan", "log", "ln", "√", "π", "e", "(", ")"].includes(btn)) btnEl.classList.add("calc-btn-function");
        else if (btn === "0") btnEl.classList.add("calc-btn-zero");

        rowEl.appendChild(btnEl);
      });
      
      buttonsEl.appendChild(rowEl);
    });
  }

  function updateDisplay() {
    expressionEl.textContent = currentExpression || "";
    if (!currentExpression) {
      resultEl.textContent = "0";
    }
  }

  function evaluateExpression(expr) {
    let safe = expr.toLowerCase();
    
    // Replace functions
    safe = safe.replace(/sin\(([^)]+)\)/g, (_, a) => `Math.sin((${a}) * Math.PI / 180)`);
    safe = safe.replace(/cos\(([^)]+)\)/g, (_, a) => `Math.cos((${a}) * Math.PI / 180)`);
    safe = safe.replace(/tan\(([^)]+)\)/g, (_, a) => `Math.tan((${a}) * Math.PI / 180)`);
    safe = safe.replace(/log\(([^)]+)\)/g, (_, a) => `Math.log10(${a})`);
    safe = safe.replace(/ln\(([^)]+)\)/g, (_, a) => `Math.log(${a})`);
    safe = safe.replace(/√\(([^)]+)\)/g, (_, a) => `Math.sqrt(${a})`);
    safe = safe.replace(/√([0-9.]+)/g, (_, a) => `Math.sqrt(${a})`);
    safe = safe.replace(/π/g, "Math.PI");
    safe = safe.replace(/e(?![a-z])/g, "Math.E");
    
    // Replace operators
    safe = safe.replace(/×/g, "*");
    safe = safe.replace(/÷/g, "/");
    safe = safe.replace(/\^/g, "**");
    
    // Validate
    if (!/^[-+*/(). 0-9MathPIEsqrtlogencositan]+$/.test(safe)) {
      throw new Error("Invalid expression");
    }
    
    // eslint-disable-next-line no-new-func
    const fn = new Function(`return (${safe})`);
    return fn();
  }

  function addToHistory(expression, result) {
    history.unshift({ expression, result, time: new Date().toLocaleString() });
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem("aolt-calc-history", JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      historyListEl.innerHTML = '<div class="calc-history-empty">Belum ada riwayat</div>';
      return;
    }

    historyListEl.innerHTML = history.map((item) => `
      <div class="calc-history-item">
        <div class="calc-history-expr">${item.expression}</div>
        <div class="calc-history-result">= ${item.result}</div>
      </div>
    `).join("");
  }

  buttonsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".calc-btn");
    if (!btn) return;

    const value = btn.dataset.value;

    if (value === "C") {
      currentExpression = "";
      resultEl.textContent = "0";
      resultEl.classList.remove("calc-result-error");
      updateDisplay();
    } else if (value === "⌫") {
      currentExpression = currentExpression.slice(0, -1);
      updateDisplay();
    } else if (value === "=") {
      if (!currentExpression) return;
      try {
        const result = evaluateExpression(currentExpression);
        const formattedResult = typeof result === "number" ? 
          (Number.isInteger(result) ? result : result.toFixed(8).replace(/\.?0+$/, "")) : 
          String(result);
        
        resultEl.textContent = formattedResult;
        resultEl.classList.remove("calc-result-error");
        addToHistory(currentExpression, formattedResult);
        currentExpression = formattedResult;
        expressionEl.textContent = "";
      } catch (err) {
        resultEl.textContent = "Error";
        resultEl.classList.add("calc-result-error");
      }
    } else if (["sin", "cos", "tan", "log", "ln", "√"].includes(value)) {
      currentExpression += value + "(";
      updateDisplay();
    } else if (value === "π") {
      currentExpression += "π";
      updateDisplay();
    } else if (value === "e") {
      currentExpression += "e";
      updateDisplay();
    } else {
      currentExpression += value;
      updateDisplay();
    }

    // Add press animation
    btn.classList.add("calc-btn-pressed");
    setTimeout(() => btn.classList.remove("calc-btn-pressed"), 100);
  });

  toggleModeBtn.addEventListener("click", () => {
    isScientific = !isScientific;
    if (isScientific) {
      modeIcon.textContent = "🔬";
      modeText.textContent = "Scientific";
    } else {
      modeIcon.textContent = "🔢";
      modeText.textContent = "Basic";
    }
    renderButtons();
  });

  clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Hapus semua riwayat?")) {
      history = [];
      localStorage.setItem("aolt-calc-history", "[]");
      renderHistory();
    }
  });

  historyListEl.addEventListener("click", (e) => {
    const item = e.target.closest(".calc-history-item");
    if (item) {
      const expr = item.querySelector(".calc-history-expr").textContent;
      currentExpression = expr;
      updateDisplay();
    }
  });

  renderButtons();
  renderHistory();
  updateDisplay();
}
