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

// =====================
// PERKI AKTYWNE W STAJNI
// =====================
function getActivePerkBonus() {
  let goldBonus    = 1.0;  // mnożnik złota
  let dropBonus    = 0;    // flat % do dropu
  let doubleReward = false;

  playerHorses.forEach(h => {
    if (!h.perk) return;
    if (h.perk.id === "divine_aura")  { goldBonus  += 0.25; dropBonus += 5; }
    if (h.perk.id === "swift_blood")  { goldBonus  += 0.15; }
    if (h.perk.id === "golden_luck")  { dropBonus  += 3; }
    if (h.perk.id === "star_born" && Math.random() < 0.20) doubleReward = true;
    // immortal obsługiwany w renderHorses (wiek)
  });

  return { goldBonus, dropBonus, doubleReward };
}

function startExpedition(i, horseIdx) {
  if (getDailyCount() >= DAILY_LIMIT) { log("⚠️ Osiągnięto dzienny limit wypraw!"); return; }
  if (playerHorses.length === 0)      { log("⚠️ Nie masz żadnych koni!"); return; }
  let h = playerHorses[horseIdx !== undefined ? horseIdx : 0];
  expeditions.push({ end: Date.now() + EXPEDITION_TIME, locationIndex: i, horseIdx: horseIdx||0, horseName: h?.name||"?", done: false });
  addDaily();
  trackQuest("expedition");
  closeExpeditionHorsePicker();
  saveGame();
  log(`🌍 ${h?.flag||"🐴"} ${h?.name||"Koń"} wyruszył na wyprawę do ${LOCATIONS[i].name}!`);
}

// =====================
// MODAL WYBORU KONIA DO WYPRAWY
// =====================
let pendingExpLocation = null;

function openExpeditionHorsePicker(locIdx) {
  if (getDailyCount() >= DAILY_LIMIT) { log("⚠️ Osiągnięto dzienny limit wypraw!"); return; }
  if (playerHorses.length === 0)      { log("⚠️ Nie masz żadnych koni!"); return; }
  pendingExpLocation = locIdx;

  let loc = LOCATIONS[locIdx];
  document.getElementById("expPickerTitle").textContent    = `${loc.icon} Wyprawa do: ${loc.name}`;
  document.getElementById("expPickerSubtitle").textContent = loc.desc;

  let list = document.getElementById("expHorseList");
  list.innerHTML = "";

  // Konie które są już na aktywnej wyprawie
  let busyHorseIdxs = new Set(
    expeditions.filter(e => !e.done).map(e => e.horseIdx)
  );

  playerHorses.forEach((h, hi) => {
    let col    = RARITY_COLORS[h.rarity] || "#8aab84";
    let hunger = getHunger(h);
    let hCol   = hunger > 70 ? "#c94a4a" : hunger > 40 ? "#c97c2a" : "#7ec870";
    let age    = getHorseAgeDays(h);
    let busy   = busyHorseIdxs.has(hi);
    let btn    = document.createElement("button");
    btn.className = "modal-horse-btn";
    if (busy) btn.style.opacity = "0.45";
    btn.innerHTML = `
      <span style="font-size:22px">${h.flag||"🐴"}</span>
      <div style="flex:1">
        <div class="mh-name" style="color:${col}">${h.name}${h.stars>0?" "+"⭐".repeat(h.stars):""}</div>
        <div class="mh-stats">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck}</div>
        ${h.perk ? `<div style="font-size:10px;color:#e08070;margin-top:2px">${h.perk.icon} ${h.perk.name}</div>` : ""}
        <div style="font-size:10px;color:${hCol};margin-top:2px">🍽️ Głód: ${hunger}% &nbsp; 🎂 ${age} dni</div>
        ${busy ? `<div style="font-size:10px;color:#c97c2a;margin-top:2px">🌍 Już na wyprawie</div>` : ""}
      </div>
    `;
    if (busy) {
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
    } else {
      btn.onclick = () => startExpedition(pendingExpLocation, hi);
    }
    list.appendChild(btn);
  });

  document.getElementById("expeditionHorsePickerModal").style.display = "flex";
}

function closeExpeditionHorsePicker() {
  document.getElementById("expeditionHorsePickerModal").style.display = "none";
  pendingExpLocation = null;
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

  let perks    = getActivePerkBonus();
  let baseGold = 50 + Math.floor(Math.random() * 151) + Math.floor(luck * 0.5);
  let goldGain = Math.round(baseGold * perks.goldBonus);
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
    b.onclick = () => openExpeditionHorsePicker(i);
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
    let expHorse = playerHorses[e.horseIdx] || null;
    let hFlag = expHorse ? (expHorse.flag||"🐴") : "🐴";
    let hName = e.horseName || (expHorse?.name||"Koń");
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">${hFlag}</span>
        <div>
          <div style="font-size:13px;color:var(--text)">${hName}</div>
          <div style="font-size:11px;color:var(--text2)">${loc.icon} ${loc.name}</div>
        </div>
      </div>
      <span class="exp-timer">${Math.ceil(t/1000)}s</span>
    `;
    el.appendChild(div);
  });
}
