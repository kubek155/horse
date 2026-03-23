// =====================
// SYSTEM POZIOMÓW
// =====================

// XP per wyprawa zależny od krainy
const LOCATION_XP = {
  "Las Zielony":      20,
  "Złota Pustynia":   45,
  "Górskie Szczyty":  80,
  "Wieczna Tundra":   130,
  "Mroczne Ostępy":   200,
};

// Ile XP potrzeba do kolejnego poziomu (wzrost wykładniczy)
function xpForLevel(lvl) {
  return Math.floor(100 * Math.pow(1.35, lvl - 1));
}

// Łączne XP do osiągnięcia poziomu
function totalXpForLevel(lvl) {
  let total = 0;
  for (let i = 1; i < lvl; i++) total += xpForLevel(i);
  return total;
}

// Bonusy drop rate per poziom (każde 5 poziomów = +1% do każdego dropu)
function getDropBonus(locationName) {
  let lvl  = getPlayerLevel();
  let base = Math.floor(lvl / 5); // +1% co 5 poziomów
  return base; // dodatkowe % szansy na drop
}

// Bonus gold per poziom (+2% złota co poziom)
function getGoldBonus() {
  return 1 + (getPlayerLevel() - 1) * 0.02;
}

function getPlayerXP()    { return parseInt(localStorage.getItem("hh_xp"))    || 0; }
function getPlayerLevel() { return parseInt(localStorage.getItem("hh_level")) || 1; }

function addXP(amount, source) {
  let xp    = getPlayerXP() + amount;
  let level = getPlayerLevel();

  // Sprawdź level up
  let leveled = false;
  while (xp >= xpForLevel(level)) {
    xp    -= xpForLevel(level);
    level += 1;
    leveled = true;
  }

  localStorage.setItem("hh_xp",    xp);
  localStorage.setItem("hh_level", level);

  if (leveled) {
    showLevelUpEffect(level);
    log(`🎉 Poziom ${level}! Bonus drop rate +${getDropBonus()}%`);
  }

  renderLevelBar();
  return { xp, level, leveled };
}

function renderLevelBar() {
  let lvl  = getPlayerLevel();
  let xp   = getPlayerXP();
  let need = xpForLevel(lvl);
  let pct  = Math.min(100, (xp / need) * 100);

  let lvlEl  = document.getElementById("playerLevel");
  let xpEl   = document.getElementById("playerXP");
  let barEl  = document.getElementById("xpBar");
  let dropEl = document.getElementById("dropBonusDisplay");

  if (lvlEl)  lvlEl.textContent  = lvl;
  if (xpEl)   xpEl.textContent   = `${xp} / ${need} XP`;
  if (barEl)  barEl.style.width  = pct + "%";
  if (dropEl) {
    let db = getDropBonus();
    dropEl.textContent = db > 0 ? `+${db}% drop` : "";
  }
}

// =====================
// LEVEL UP EFEKT
// =====================
function showLevelUpEffect(level) {
  let overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9500;pointer-events:none;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
  `;

  // Cząsteczki złote
  let particles = "";
  for (let i = 0; i < 50; i++) {
    let angle = Math.random()*360, dist = 100+Math.random()*200;
    let tx = Math.cos(angle*Math.PI/180)*dist, ty = Math.sin(angle*Math.PI/180)*dist;
    let sz = 3+Math.random()*7;
    let cols = ["#c9a84c","#f0d080","#ffffff","#ffdd44"];
    let col = cols[Math.floor(Math.random()*cols.length)];
    particles += `<div style="position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:${col};
      top:50%;left:50%;animation:particleFly ${0.5+Math.random()*0.6}s ease-out forwards;
      --tx:${tx}px;--ty:${ty}px;animation-delay:${Math.random()*0.2}s"></div>`;
  }

  overlay.innerHTML = `
    ${particles}
    <div style="position:absolute;width:300px;height:300px;border-radius:50%;
      background:radial-gradient(circle,rgba(201,168,76,0.35),transparent 70%);
      animation:rareFlashBg 1s ease-out forwards"></div>
    <div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:8px;
      animation:rareCardPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards">
      <div style="font-size:14px;letter-spacing:4px;color:#f0d080;font-family:'Cinzel',serif">POZIOM WYŻEJ!</div>
      <div style="font-size:72px;font-family:'Cinzel',serif;color:#c9a84c;
        text-shadow:0 0 30px #c9a84c,0 0 60px #c9a84c88;line-height:1">${level}</div>
      <div style="font-size:13px;color:var(--text2)">Bonus drop rate: +${getDropBonus()}%</div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.style.animation = "sceneFadeOut 0.5s ease forwards";
    setTimeout(() => overlay.remove(), 500);
  }, 2500);
}

// =====================
// HISTORIA DROPÓW
// =====================
const MAX_DROP_HISTORY = 50;

function addDropHistory(entry) {
  let history = JSON.parse(localStorage.getItem("hh_drops") || "[]");
  history.unshift({
    ...entry,
    time: Date.now(),
  });
  if (history.length > MAX_DROP_HISTORY) history = history.slice(0, MAX_DROP_HISTORY);
  localStorage.setItem("hh_drops", JSON.stringify(history));
}

function getDropHistory() {
  return JSON.parse(localStorage.getItem("hh_drops") || "[]");
}

function renderDropHistory() {
  let el = document.getElementById("dropHistoryList");
  if (!el) return;
  let history = getDropHistory();

  if (history.length === 0) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">📜</div>Brak historii — idź na wyprawę!</div>`;
    return;
  }

  el.innerHTML = "";
  history.forEach(entry => {
    let ago  = timeSince(entry.time);
    let rc   = entry.color || "#8aab84";
    let div  = document.createElement("div");
    div.style.cssText = `
      display:flex;align-items:center;gap:10px;padding:8px 12px;
      border-radius:8px;margin-bottom:6px;
      background:var(--panel2);border:1px solid ${rc}33;
    `;
    div.innerHTML = `
      <span style="font-size:22px;min-width:28px;text-align:center">${entry.icon||"📦"}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;color:${rc};font-family:'Cinzel',serif;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${entry.name}</div>
        <div style="font-size:10px;color:var(--text2);margin-top:1px">
          ${entry.source||""} ${entry.bonus?`<span style="color:var(--gold2)">+${entry.bonus}</span>`:""}
        </div>
      </div>
      <div style="font-size:10px;color:var(--text2);white-space:nowrap">${ago}</div>
    `;
    el.appendChild(div);
  });
}

function timeSince(ts) {
  let s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return `${s}s temu`;
  if (s < 3600) return `${Math.floor(s/60)}min temu`;
  return `${Math.floor(s/3600)}h temu`;
}
