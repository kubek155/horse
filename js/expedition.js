const EXPEDITION_TIME = 60000;
const DAILY_LIMIT     = 4;

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

function startExpedition(i) {
  if (getDailyCount() >= DAILY_LIMIT) { log("⚠️ Osiągnięto dzienny limit wypraw!"); return; }
  if (playerHorses.length === 0)      { log("⚠️ Nie masz żadnych koni!"); return; }
  expeditions.push({ end: Date.now() + EXPEDITION_TIME, locationIndex: i, done: false });
  addDaily();
  trackQuest("expedition");
  saveGame();
  log(`🌍 Wyprawa do ${LOCATIONS[i].name} rozpoczęta!`);
}

function finishExpedition(e) {
  let loc   = LOCATIONS[e.locationIndex];
  let luck  = getPartyLuck(); // 0–100+
  // Szczęście dodaje bonus do szansy: np. luck=50 → +5% do dropów
  let luckBonus = luck / 10;
  let r     = Math.random() * 100;

  // koń: 7%+luck/20 | skrzynka: 3%+luck/30 | jedzenie: 10% | reszta nic
  let horseChance = 7  + luckBonus / 2;
  let boxChance   = horseChance + 3 + luckBonus / 3;
  let foodChance  = boxChance   + 10;

  if (r < horseChance) {
    if (playerHorses.length >= STABLE_LIMIT) {
      log(`🐴 Znaleziono konia, ale stajnia pełna!`);
    } else {
      let h = generateHorse(loc.reward);
      playerHorses.push(h);
      log(`🐴 Nowy koń: ${h.name} (${HORSE_DATABASE[h.group].name})!`);
    }
  } else if (r < boxChance) {
    inventory.push({ name: "Skrzynka z Łupem", obtained: Date.now() });
    log(`📦 Znaleziono Skrzynkę z Łupem!`);
  } else if (r < foodChance) {
    let food = Math.random() < 0.6 ? "Słoma" : "Jabłko";
    inventory.push({ name: food, obtained: Date.now() });
    log(`${food === "Jabłko" ? "🍎" : "🌾"} Znaleziono: ${food}!`);
  } else {
    log(`📜 Wyprawa do ${loc.name} — nic nie znaleziono.`);
  }

  let goldGain = 50 + Math.floor(Math.random() * 151) + Math.floor(luck * 0.5);
  gold += goldGain;
  log(`💰 +${goldGain} złota z wyprawy!`);

  e.done = true;
  saveGame();
}

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

  // Pokaż aktualny bonus szczęścia
  let luck = getPartyLuck();
  let luckEl = document.getElementById("luckBonus");
  if (luckEl) {
    luckEl.textContent = luck > 0 ? `🍀 Bonus szczęścia: +${luck.toFixed(0)} pkt (drop +${(luck/10).toFixed(1)}%)` : "";
  }
}

function renderLocations() {
  let el = document.getElementById("locations");
  el.innerHTML = "";
  LOCATIONS.forEach((l, i) => {
    let b = document.createElement("div");
    b.className = "location-btn";
    b.innerHTML = `<span class="loc-icon">${l.icon}</span><span class="loc-name">${l.name}</span><span class="loc-desc">${l.desc}</span>`;
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
    div.innerHTML = `<span>${loc.icon} ${loc.name}</span><span class="exp-timer">${Math.ceil(t/1000)}s</span>`;
    el.appendChild(div);
  });
}
