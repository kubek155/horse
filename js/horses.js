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
    // ważone: pospolity 60%, szlachetny 28%, bojowy 10%, legendarny 2%
    let r = Math.random();
    if (r < 0.60)      key = "common";
    else if (r < 0.88) key = "rare";
    else if (r < 0.98) key = "epic";
    else               key = "legendary";
  }

  let g      = HORSE_DATABASE[key];
  let breed  = g.breeds[Math.floor(Math.random() * g.breeds.length)];
  let stars  = rollStars();
  let bonus  = stars * 12;

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
      stamina:  Math.round(g.baseStats.stamina  + rollStatBonus() + bonus)
    }
  };
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
    if (roll < 0.4)      { h.stats.speed    += 3; h.bonusApplied = "+szybkość"; }
    else if (roll < 0.7) { h.stats.strength += 3; h.bonusApplied = "+siła"; }
    else if (roll < 0.9) { h.stats.stamina  += 3; h.bonusApplied = "+wytrzymałość"; }
    else                   h.bonusApplied = "brak";
  }
}

// =====================
// HUNGER
// =====================
function getHunger(h) {
  // 0 = pełny, 100 = głodny; rośnie od 0 do 100 przez 24 godziny
  if (!h.lastFed) h.lastFed = Date.now();
  let elapsed = (Date.now() - h.lastFed) / 86400000; // w dniach
  return Math.min(100, Math.floor(elapsed * 100));
}

function feedHorse(horseIdx, foodName) {
  let h    = playerHorses[horseIdx];
  let fill = foodName === "Jabłko" ? 0.5 : 0.25; // Jabłko 50%, Słoma 25%
  let hunger = getHunger(h);
  let reduce = hunger * fill;
  h.lastFed  = Date.now() - Math.max(0, (hunger - reduce) / 100 * 86400000);
  log(`${foodName === "Jabłko" ? "🍎" : "🌾"} ${h.name} nakarmiony! Głód −${Math.round(reduce)}%`);
}

// =====================
// RENDER HORSES
// =====================
function renderHorses() {
  // Usuń martwe konie (>365 dni)
  playerHorses = playerHorses.filter(h => getHorseAgeDays(h) < 365);

  let el = document.getElementById("horsesGrid");
  if (playerHorses.length === 0) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🐴</div>Brak koni — idź na wyprawę!</div>`;
    document.getElementById("horseCount").textContent = 0;
    return;
  }

  el.innerHTML = "";
  const maxStat = 150;

  playerHorses.forEach(h => {
    applyGrowth(h);

    let age         = getHorseAgeDays(h);
    let ageClass    = age > 300 ? "ancient" : age > 200 ? "old" : "";
    let starsClass  = h.stars > 0 ? `stars-${Math.min(h.stars, 3)}` : "";
    let hunger      = getHunger(h);
    let hungerColor = hunger > 70 ? "#c94a4a" : hunger > 40 ? "#c97c2a" : "#7ec870";
    let hungerLabel = hunger > 70 ? "Głodny!" : hunger > 40 ? "Lekko głodny" : "Najedzony";

    let card = document.createElement("div");
    card.className = `horse-card ${starsClass}`;
    card.innerHTML = `
      <div class="horse-name">${h.name}</div>
      <div class="horse-breed">${HORSE_DATABASE[h.group].name}</div>
      ${h.stars > 0 ? `<div class="horse-stars">${"⭐".repeat(h.stars)}</div>` : ""}
      <div class="horse-stats">
        <div class="stat-row"><span>⚡ Szybkość</span><span>${h.stats.speed}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${Math.min(100,(h.stats.speed/maxStat)*100)}%"></div></div>
        <div class="stat-row"><span>💪 Siła</span><span>${h.stats.strength}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${Math.min(100,(h.stats.strength/maxStat)*100)}%;background:var(--gold)"></div></div>
        <div class="stat-row"><span>❤️ Wytrzymałość</span><span>${h.stats.stamina}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${Math.min(100,(h.stats.stamina/maxStat)*100)}%;background:var(--rare)"></div></div>
      </div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border)">
        <div class="stat-row" style="margin-bottom:3px">
          <span style="color:${hungerColor}">🍽️ Głód</span>
          <span style="color:${hungerColor}">${hunger}% — ${hungerLabel}</span>
        </div>
        <div class="stat-bar-wrap">
          <div class="stat-bar" style="width:${hunger}%;background:${hungerColor};transition:width 0.5s"></div>
        </div>
      </div>
      <div class="horse-age ${ageClass}">🎂 ${age} dni ${h.bonusApplied ? `· ${h.bonusApplied}` : ""}</div>
    `;
    el.appendChild(card);
  });

  document.getElementById("horseCount").textContent = playerHorses.length;
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

  let playerScore = playerHorses.reduce((s, h) => s + h.stats.speed + h.stats.strength + h.stats.stamina, 0);
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
