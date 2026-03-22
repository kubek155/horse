const EXPEDITION_TIME = 60000; // 60 sekund
const DAILY_LIMIT     = 4;

// =====================
// DZIENNY LIMIT
// =====================
function getTodayKey() {
  let d = new Date();
  return `d_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getDailyCount() {
  return parseInt(localStorage.getItem(getTodayKey())) || 0;
}

function addDaily() {
  localStorage.setItem(getTodayKey(), getDailyCount() + 1);
}

// =====================
// START WYPRAWY
// =====================
function startExpedition(i) {
  if (getDailyCount() >= DAILY_LIMIT) { log("⚠️ Osiągnięto dzienny limit wypraw!"); return; }
  if (playerHorses.length === 0)      { log("⚠️ Nie masz żadnych koni!"); return; }

  expeditions.push({
    end:           Date.now() + EXPEDITION_TIME,
    locationIndex: i,
    done:          false
  });
  addDaily();
  saveGame();
  log(`🌍 Wyprawa do ${LOCATIONS[i].name} rozpoczęta!`);
}

// =====================
// KONIEC WYPRAWY
// =====================
function finishExpedition(e) {
  let loc = LOCATIONS[e.locationIndex];
  let r   = Math.random() * 100;

  // koń 7% | skrzynka 3% | jedzenie 10% | reszta nic
  if (r < 7) {
    let newHorse = generateHorse(loc.reward);
    playerHorses.push(newHorse);
    log(`🐴 Nowy koń: ${newHorse.name} (${HORSE_DATABASE[newHorse.group].name})!`);
  } else if (r < 10) {
    inventory.push({ name: "Skrzynka z Łupem", obtained: Date.now() });
    log(`📦 Znaleziono Skrzynkę z Łupem!`);
  } else if (r < 20) {
    let food = Math.random() < 0.6 ? "Słoma" : "Jabłko";
    inventory.push({ name: food, obtained: Date.now() });
    log(`${food === "Jabłko" ? "🍎" : "🌾"} Znaleziono: ${food}!`);
  } else {
    log(`📜 Wyprawa do ${loc.name} zakończona — nic nie znaleziono.`);
  }

  // Złoto 50–200 za każdą wyprawę (zawsze)
  let goldGain = 50 + Math.floor(Math.random() * 151);
  gold += goldGain;
  log(`💰 +${goldGain} złota z wyprawy!`);

  e.done = true;
  saveGame();
}

// =====================
// RENDER WYPRAW
// =====================
function renderLimitBar() {
  let used = getDailyCount();
  let bar  = document.getElementById("limitBar");
  bar.innerHTML = "";
  for (let i = 0; i < DAILY_LIMIT; i++) {
    let pip = document.createElement("div");
    pip.className = "limit-pip" + (i < used ? " used" : "");
    bar.appendChild(pip);
  }
  document.getElementById("remainingExp").textContent = Math.max(0, DAILY_LIMIT - used);
  document.getElementById("dailyCount").textContent   = used;
}

function renderLocations() {
  let el = document.getElementById("locations");
  el.innerHTML = "";
  LOCATIONS.forEach((l, i) => {
    let b = document.createElement("div");
    b.className = "location-btn";
    b.innerHTML = `
      <span class="loc-icon">${l.icon}</span>
      <span class="loc-name">${l.name}</span>
      <span class="loc-desc">${l.desc}</span>
    `;
    b.onclick = () => startExpedition(i);
    el.appendChild(b);
  });
}

function renderExpeditions() {
  let el     = document.getElementById("expeditionsDiv");
  let active = expeditions.filter(e => !e.done);

  if (active.length === 0) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">🗺️</div>Brak aktywnych wypraw</div>`;
    return;
  }

  el.innerHTML = "";
  active.forEach(e => {
    let t = e.end - Date.now();
    if (t <= 0) { finishExpedition(e); return; }
    let div = document.createElement("div");
    div.className = "exp-item";
    let loc = LOCATIONS[e.locationIndex];
    div.innerHTML = `
      <span>${loc.icon} ${loc.name}</span>
      <span class="exp-timer">${Math.ceil(t / 1000)}s</span>
    `;
    el.appendChild(div);
  });
}
