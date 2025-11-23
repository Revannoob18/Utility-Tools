const KEY = "aolt-workout";

function loadWorkouts() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function saveWorkouts(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function initWorkout() {
  const section = document.getElementById("workout");
  section.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">Workout Log</div>
          <div class="card-subtitle">Catat jenis latihan dan durasi agar progres olahraga Anda terekam.</div>
        </div>
      </div>
      <div class="mt-md flex-gap">
        <input id="wo-name" class="input" placeholder="Nama latihan" />
        <input id="wo-duration" type="number" min="1" class="input" style="width:100px;" placeholder="Durasi (menit)" />
        <button id="wo-add" class="btn btn-primary">+ Tambah</button>
      </div>
      <div class="mt-md">
        <table class="table-simple" id="wo-table">
          <thead>
            <tr><th>Tanggal</th><th>Latihan</th><th>Durasi</th></tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
  `;

  const nameEl = document.getElementById("wo-name");
  const durEl = document.getElementById("wo-duration");
  const addBtn = document.getElementById("wo-add");
  const bodyEl = document.querySelector("#wo-table tbody");

  function render() {
    const list = loadWorkouts();
    bodyEl.innerHTML = "";
    list
      .slice()
      .reverse()
      .forEach((w) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${w.date}</td><td>${w.name}</td><td>${w.duration} mnt</td>`;
        bodyEl.appendChild(tr);
      });
  }

  addBtn.addEventListener("click", () => {
    const name = nameEl.value.trim();
    const dur = Number(durEl.value);
    if (!name || !dur) return;
    const list = loadWorkouts();
    list.push({
      date: new Date().toISOString().slice(0, 10),
      name,
      duration: dur,
    });
    saveWorkouts(list);
    nameEl.value = "";
    durEl.value = "";
    render();
  });

  render();
}
