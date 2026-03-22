// =====================
// HORSE GENERATION
// =====================
function rollStatBonus() {
  let r = Math.random();
  if (r < 0.50) return Math.random() * 10;
  if (r < 0.80) return Math.random() * 20;
  if (r < 0.95) return Math.random() * 35;
  if (r < 0.99) return Math.random() * 45;
  return Math.random() * 60;
}

function rollLuckBonus() {
  return Math.random() * 15; // szczęście ma węższą losowość
}

function rollStars() {
  let s = 0;
  if (Math.random() < 0.02) {
    s++;
    if (Math.random() < 0.01) {
      s++;
      if (Math.random() < 0.005) s++;
    }
  }
  return s;
}

function generateHorse(rarityOverride) {
  let key;
  if (rarityOverride && HORSE_DATABASE[rarityOverride]) {
    key = rarityOverride;
  } else {
    let r = Math.random();
    if (r < 0.60)      key = "common";
    else if (r < 0.88) key = "rare";
    else if (r < 0.98) key = "epic";
    else               key = "legendary";
  }

  let g     = HORSE_DATABASE[key];
  let breed = g.breeds[Math.floor(Math.random() * g.breeds.length)];
  let stars = rollStars();
  let bonus = stars * 12;

  return {
    id:           Date.now() + Math.random(),
    name:         breed,
    group:        key,
    rarity:       g.rarity,
    stars,
    born:         Date.now(),
    lastFed:      Date.now(),
    bonusApplied: null,
    stats: {
      speed:    Math.round(g.baseStats.speed    + rollStatBonus() + bonus),
      strength: Math.round(g.baseStats.strength + rollStatBonus() + bonus),
      stamina:  Math.round(g.baseStats.stamina  + rollStatBonus() + bonus),
      luck:     Math.round(g.baseStats.luck     + rollLuckBonus() + bonus * 0.5)
    }
  };
}

// =====================
// GENETYKA — ROZMNAŻANIE
// =====================
function breedHorses(idxA, idxB) {
  if (idxA === idxB) { log("⚠️ Wybierz dwa różne konie!"); return; }
  if (playerHorses.length >= STABLE_LIMIT) { log(`⚠️ Stajnia pełna! (${STABLE_LIMIT}/${STABLE_LIMIT})`); return; }

  let a = playerHorses[idxA];
  let b = playerHorses[idxB];

  // Dziedziczenie rasy — wyższy tier ma większą szansę
  let tierA = ["common","rare","epic","legendary"].indexOf(a.group);
  let tierB = ["common","rare","epic","legendary"].indexOf(b.group);
  let childKey;
  let roll = Math.random();
  if (roll < 0.45) childKey = a.group;       // 45% od rodzica A
  else if (roll < 0.90) childKey = b.group;  // 45% od rodzica B
  else {
    // 10% szansa na mutację — wyższy tier
    let maxTier = Math.max(tierA, tierB);
    let keys    = ["common","rare","epic","legendary"];
    childKey    = keys[Math.min(maxTier + 1, 3)];
  }

  let gA = HORSE_DATABASE[a.group];
  let gB = HORSE_DATABASE[b.group];
  let gC = HORSE_DATABASE[childKey];

  // Statystyki: 40% od każdego rodzica + 20% losowe + mały bonus za gwiazdy
  function inheritStat(statA, statB, base) {
    let inherited = statA * 0.4 + statB * 0.4 + base * 0.2 + rollStatBonus() * 0.5;
    // szansa na "super gen" — 5%
    if (Math.random() < 0.05) inherited *= 1.1;
    return Math.round(inherited);
  }

  let starBonus = Math.max(a.stars, b.stars) * 6; // dziedziczy część bonusu gwiazd

  let child = {
    id:           Date.now() + Math.random(),
    name:         gC.breeds[Math.floor(Math.random() * gC.breeds.length)],
    group:        childKey,
    rarity:       gC.rarity,
    stars:        rollStars(),
    born:         Date.now(),
    lastFed:      Date.now(),
    bonusApplied: null,
    parents:      [a.name, b.name],
    stats: {
      speed:    inheritStat(a.stats.speed,    b.stats.speed,    gC.baseStats.speed)    + starBonus,
      strength: inheritStat(a.stats.strength, b.stats.strength, gC.baseStats.strength) + starBonus,
      stamina:  inheritStat(a.stats.stamina,  b.stats.stamina,  gC.baseStats.stamina)  + starBonus,
      luck:     inheritStat(a.stats.luck,     b.stats.luck,     gC.baseStats.luck)     + Math.round(starBonus * 0.5),
    }
  };

  playerHorses.push(child);
  trackQuest("breed");
  log(`🧬 Urodzono: ${child.name} (${gC.name})! Rodzice: ${a.name} & ${b.name}`);
  saveGame();
  renderAll();
  closeBreedModal();
}

// =====================
// MODAL ROZMNAŻANIA
// =====================
let breedFirstIdx = null;

function openBreedModal() {
  if (playerHorses.length < 2) { log("⚠️ Potrzebujesz co najmniej 2 koni!"); return; }
  if (playerHorses.length >= STABLE_LIMIT) { log(`⚠️ Stajnia pełna — brak miejsca na źrebię!`); return; }
  breedFirstIdx = null;
  renderBreedModal();
  document.getElementById("breedModal").style.display = "flex";
}

function closeBreedModal() {
  document.getElementById("breedModal").style.display = "none";
  breedFirstIdx = null;
}

function renderBreedModal() {
  let list = document.getElementById("breedHorseList");
  list.innerHTML = "";
  const rarityColors = { common:"#8aab84", rare:"#7b5ea7", epic:"#c97c2a", legendary:"#c9a84c" };

  playerHorses.forEach((h, i) => {
    let col = rarityColors[h.group] || "#8aab84";
    let btn = document.createElement("div");
    btn.className = "breed-horse-btn";
    btn.id = `breedBtn_${i}`;
    btn.innerHTML = `
      <span style="font-size:18px">🐴</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:12px;color:${col}">${h.name} ${h.stars > 0 ? "⭐".repeat(h.stars) : ""}</div>
        <div style="font-size:11px;color:var(--text2)">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck}</div>
      </div>
    `;
    btn.onclick = () => selectBreedHorse(i);
    list.appendChild(btn);
  });

  document.getElementById("breedConfirmBtn").disabled = true;
  document.getElementById("breedStatus").textContent  = "Wybierz pierwszego rodzica";
}

function selectBreedHorse(idx) {
  if (breedFirstIdx === null) {
    breedFirstIdx = idx;
    document.querySelectorAll(".breed-horse-btn").forEach((b, i) => {
      b.style.opacity = i === idx ? "1" : "0.5";
      b.style.borderColor = i === idx ? "var(--accent2)" : "";
    });
    document.getElementById("breedStatus").textContent = `✅ ${playerHorses[idx].name} wybrany — teraz wybierz drugiego rodzica`;
  } else {
    if (idx === breedFirstIdx) {
      breedFirstIdx = null;
      document.querySelectorAll(".breed-horse-btn").forEach(b => { b.style.opacity = "1"; b.style.borderColor = ""; });
      document.getElementById("breedStatus").textContent = "Wybierz pierwszego rodzica";
      return;
    }
    // Podgląd potomka
    let a = playerHorses[breedFirstIdx], b = playerHorses[idx];
    document.querySelectorAll(".breed-horse-btn").forEach((btn, i) => {
      btn.style.opacity = (i === breedFirstIdx || i === idx) ? "1" : "0.4";
      btn.style.borderColor = (i === breedFirstIdx || i === idx) ? "var(--gold)" : "";
    });
    document.getElementById("breedStatus").innerHTML =
      `🐴 <strong style="color:var(--gold2)">${a.name}</strong> × <strong style="color:var(--gold2)">${b.name}</strong> — gotowe do rozmnożenia`;
    document.getElementById("breedConfirmBtn").disabled = false;
    document.getElementById("breedConfirmBtn").onclick  = () => breedHorses(breedFirstIdx, idx);
  }
}

// =====================
// AGE & GROWTH
// =====================
function getHorseAgeDays(h) {
  return Math.floor((Date.now() - h.born) / 86400000);
}

function applyGrowth(h) {
  if (h.bonusApplied) return;
  if (getHorseAgeDays(h) > 7) {
    let roll = Math.random();
    if (roll < 0.3)      { h.stats.speed    += 3; h.bonusApplied = "+szybkość"; }
    else if (roll < 0.6) { h.stats.strength += 3; h.bonusApplied = "+siła"; }
    else if (roll < 0.8) { h.stats.stamina  += 3; h.bonusApplied = "+wytrzymałość"; }
    else if (roll < 0.95){ h.stats.luck     += 3; h.bonusApplied = "+szczęście"; }
    else                   h.bonusApplied = "brak";
  }
}

// =====================
// HUNGER
// =====================
function getHunger(h) {
  if (!h.lastFed) h.lastFed = Date.now();
  let elapsed = (Date.now() - h.lastFed) / 86400000;
  return Math.min(100, Math.floor(elapsed * 100));
}

function feedHorse(horseIdx, foodName) {
  let h    = playerHorses[horseIdx];
  let fill = foodName === "Jabłko" ? 0.5 : 0.25;
  let hunger = getHunger(h);
  let reduce = hunger * fill;
  h.lastFed  = Date.now() - Math.max(0, (hunger - reduce) / 100 * 86400000);
  trackQuest("feed");
  log(`${foodName === "Jabłko" ? "🍎" : "🌾"} ${h.name} nakarmiony! Głód −${Math.round(reduce)}%`);
}

// =====================
// SZCZĘŚCIE → BONUS DROPU
// =====================
function getPartyLuck() {
  if (playerHorses.length === 0) return 0;
  // Średnie szczęście wszystkich koni w stajni
  let avg = playerHorses.reduce((s, h) => s + (h.stats.luck || 0), 0) / playerHorses.length;
  return avg; // 0–100+
}

// =====================
// RENDER HORSES
// =====================
function renderHorses() {
  playerHorses = playerHorses.filter(h => getHorseAgeDays(h) < 365);

  let el    = document.getElementById("horsesGrid");
  let count = playerHorses.length;

  let countEl = document.getElementById("stableCountDisplay");
  if (countEl) {
    countEl.textContent = `${count} / ${STABLE_LIMIT}`;
    countEl.style.color = count >= STABLE_LIMIT ? "#c94a4a" : "var(--gold2)";
  }

  // Przycisk rozmnażania
  let breedBtn = document.getElementById("breedBtn");
  if (breedBtn) breedBtn.disabled = count < 2 || count >= STABLE_LIMIT;

  if (count === 0) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🐴</div>Brak koni — idź na wyprawę!</div>`;
    document.getElementById("horseCount").textContent = 0;
    return;
  }

  el.innerHTML = "";
  const maxStat = 150;

  playerHorses.forEach((h, idx) => {
    applyGrowth(h);
    let age         = getHorseAgeDays(h);
    let ageClass    = age > 300 ? "ancient" : age > 200 ? "old" : "";
    let starsClass  = h.stars > 0 ? `stars-${Math.min(h.stars, 3)}` : "";
    let hunger      = getHunger(h);
    let hungerColor = hunger > 70 ? "#c94a4a" : hunger > 40 ? "#c97c2a" : "#7ec870";
    let hungerLabel = hunger > 70 ? "Głodny!" : hunger > 40 ? "Lekko głodny" : "Najedzony";
    if (!h.stats.luck) h.stats.luck = HORSE_DATABASE[h.group]?.baseStats?.luck || 5;

    let card = document.createElement("div");
    card.className = `horse-card ${starsClass}`;
    card.innerHTML = `
      <div class="horse-name">${h.name}</div>
      <div class="horse-breed">${HORSE_DATABASE[h.group]?.name || h.group}${h.parents ? ` <span style="font-size:10px;color:var(--text2)">· hodowany</span>` : ""}</div>
      ${h.stars > 0 ? `<div class="horse-stars">${"⭐".repeat(h.stars)}</div>` : ""}
      <div class="horse-stats">
        <div class="stat-row"><span>⚡ Szybkość</span><span>${h.stats.speed}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${Math.min(100,(h.stats.speed/maxStat)*100)}%"></div></div>
        <div class="stat-row"><span>💪 Siła</span><span>${h.stats.strength}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${Math.min(100,(h.stats.strength/maxStat)*100)}%;background:var(--gold)"></div></div>
        <div class="stat-row"><span>❤️ Wytrzymałość</span><span>${h.stats.stamina}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${Math.min(100,(h.stats.stamina/maxStat)*100)}%;background:var(--rare)"></div></div>
        <div class="stat-row"><span>🍀 Szczęście</span><span>${h.stats.luck}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${Math.min(100,(h.stats.luck/maxStat)*100)}%;background:#4ab870"></div></div>
      </div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border)">
        <div class="stat-row" style="margin-bottom:3px">
          <span style="color:${hungerColor}">🍽️ Głód</span>
          <span style="color:${hungerColor}">${hunger}% — ${hungerLabel}</span>
        </div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${hunger}%;background:${hungerColor};transition:width 0.5s"></div></div>
      </div>
      <div class="horse-age ${ageClass}">🎂 ${age} dni ${h.bonusApplied ? `· ${h.bonusApplied}` : ""}</div>
      <button class="btn-market" onclick="openListHorse(${idx})">🏪 Wystaw na rynek</button>
    `;
    el.appendChild(card);
  });

  document.getElementById("horseCount").textContent = count;
}

// =====================
// RANKING
// =====================
function buildRanking() {
  const npcs = [
    { name: "Marek K.",   score: 1200 },
    { name: "Zuzanna P.", score: 980  },
    { name: "Tomasz W.",  score: 750  },
    { name: "Ania M.",    score: 610  }
  ];

  let playerScore = playerHorses.reduce((s, h) => s + h.stats.speed + h.stats.strength + h.stats.stamina + (h.stats.luck || 0), 0);
  let entries = [{ name: "Ty", score: Math.round(playerScore), isPlayer: true }, ...npcs];
  entries.sort((a, b) => b.score - a.score);

  let list = document.getElementById("rankingList");
  list.innerHTML = "";
  entries.forEach((e, i) => {
    let div = document.createElement("div");
    div.className = "rank-item";
    if (e.isPlayer) div.style.borderColor = "var(--accent)";
    let numClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
    div.innerHTML = `
      <div class="rank-num ${numClass}">#${i + 1}</div>
      <div class="rank-name">${e.isPlayer ? `<strong style="color:var(--accent2)">${e.name}</strong>` : e.name}</div>
      <div class="rank-score">${e.score} pkt</div>
    `;
    list.appendChild(div);
  });
}
