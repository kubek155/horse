// =====================
// SIŁOWNIA — system treningu koni z limitami
// =====================

const TRAINING_MAX = {
  common:    5,
  uncommon:  8,
  rare:      12,
  epic:      18,
  legendary: 25,
  mythic:    35,
};

const TRAINING_SESSIONS = [
  {
    id: "sprint_run",
    name: "Sprint",
    icon: "⚡",
    desc: "+2–5 Szybkości",
    stat: "speed",
    minGain: 2, maxGain: 5,
    cost: 300,
    duration: 30 * 60 * 1000, // 30 min
  },
  {
    id: "weight_lift",
    name: "Podnoszenie ciężarów",
    icon: "🏋️",
    desc: "+2–5 Siły",
    stat: "strength",
    minGain: 2, maxGain: 5,
    cost: 300,
    duration: 30 * 60 * 1000,
  },
  {
    id: "long_run",
    name: "Długi bieg",
    icon: "❤️",
    desc: "+2–5 Wytrzymałości",
    stat: "stamina",
    minGain: 2, maxGain: 5,
    cost: 300,
    duration: 30 * 60 * 1000,
  },
  {
    id: "meditation",
    name: "Medytacja",
    icon: "🍀",
    desc: "+2–5 Szczęścia",
    stat: "luck",
    minGain: 2, maxGain: 5,
    cost: 250,
    duration: 30 * 60 * 1000,
  },
  {
    id: "intensive",
    name: "Trening intensywny",
    icon: "🔥",
    desc: "+5–10 losowego statu",
    stat: "random",
    minGain: 5, maxGain: 10,
    cost: 800,
    duration: 2 * 60 * 60 * 1000, // 2h
  },
];

function getHorseTrainingData(horseId) {
  try {
    return JSON.parse(localStorage.getItem("hh_train_" + horseId) || "{}");
  } catch(e) { return {}; }
}

function saveHorseTrainingData(horseId, data) {
  localStorage.setItem("hh_train_" + horseId, JSON.stringify(data));
}

function getTrainingSessions(horseId) {
  return getHorseTrainingData(horseId).sessions || 0;
}

function getTrainingCooldown(horseId) {
  return getHorseTrainingData(horseId).cooldownUntil || 0;
}

function getTrainingMax(rarity) {
  return TRAINING_MAX[rarity] || 5;
}

function openGymScreen() {
  let existing = document.getElementById("gymOverlay");
  if (existing) { existing.remove(); return; }

  let overlay = document.createElement("div");
  overlay.id = "gymOverlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;padding:16px";

  overlay.innerHTML = `
    <div style="width:100%;max-width:680px;background:#0f1a0f;border-radius:16px;padding:24px;border:1px solid #1e3a1e;position:relative;max-height:90vh;overflow-y:auto">
      <button onclick="document.getElementById('gymOverlay').remove()" style="position:absolute;top:12px;right:12px;background:transparent;border:none;color:#4a5a4a;font-size:18px;cursor:pointer">✕</button>

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
          <rect x="2" y="10" width="20" height="4" rx="2" stroke="#c9a84c" stroke-width="1.5" fill="none"/>
          <rect x="0" y="8" width="5" height="8" rx="1.5" fill="#c9a84c" opacity="0.7"/>
          <rect x="19" y="8" width="5" height="8" rx="1.5" fill="#c9a84c" opacity="0.7"/>
        </svg>
        <div style="font-family:'Cinzel',serif;font-size:14px;letter-spacing:2px;color:#c9a84c">SIŁOWNIA</div>
      </div>

      <div style="font-size:12px;color:var(--text2);margin-bottom:16px;padding:10px;background:var(--panel2);border-radius:8px;border-left:3px solid #c9a84c">
        Każdy koń może być trenowany ograniczoną ilość razy zależnie od rzadkości. Treningi zwiększają statystyki trwale. Po treningu obowiązuje 30-minutowa przerwa.
      </div>

      <div id="gymHorseList"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  renderGymHorseList();
}

function renderGymHorseList() {
  let el = document.getElementById("gymHorseList");
  if (!el) return;
  el.innerHTML = "";

  if (!playerHorses.length) {
    el.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text2)">Brak koni w stajni</div>`;
    return;
  }

  playerHorses.forEach((h, hi) => {
    let rc       = (typeof RARITY_COLORS!=="undefined" ? RARITY_COLORS[h.rarity] : null) || "#8aab84";
    let trainData = getHorseTrainingData(h.id || hi);
    let sessions  = trainData.sessions || 0;
    let maxSess   = getTrainingMax(h.rarity);
    let cooldown  = trainData.cooldownUntil || 0;
    let onCooldown = Date.now() < cooldown;
    let cdLeft    = onCooldown ? cooldown - Date.now() : 0;
    let cdMin     = Math.floor(cdLeft/60000);
    let cdSec     = Math.floor((cdLeft%60000)/1000);
    let pct       = Math.min(100, (sessions/maxSess)*100);
    let barColor  = pct>=100?"#c94a4a":pct>=75?"#c97c2a":"#4ab870";
    let exhausted = sessions >= maxSess;

    let card = document.createElement("div");
    card.style.cssText = `background:var(--panel2);border:1px solid ${rc}33;border-radius:12px;padding:16px;margin-bottom:12px`;

    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div class="gym-horse-svg-${hi}" style="width:64px;height:52px;overflow:hidden;border-radius:8px;background:var(--panel);border:1px solid ${rc}22;flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${rc}">${h.name}</div>
          <div style="font-size:11px;color:var(--text2)">${(typeof RARITY_LABELS!=="undefined"?RARITY_LABELS[h.rarity]:h.rarity)} · ${h.type||""}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:2px">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck||0}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:10px;color:var(--text2)">Treningi</div>
          <div style="font-family:'Cinzel',serif;font-size:16px;color:${barColor}">${sessions}<span style="font-size:11px;color:var(--text2)">/${maxSess}</span></div>
        </div>
      </div>

      <!-- Pasek treningów -->
      <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden;margin-bottom:10px">
        <div style="height:100%;width:${pct}%;background:${barColor};border-radius:3px;transition:width 0.5s"></div>
      </div>

      ${exhausted
        ? `<div style="text-align:center;padding:8px;background:rgba(201,74,74,0.08);border:1px solid #c94a4a33;border-radius:8px;font-size:12px;color:#c94a4a">
            🔒 Koń osiągnął limit treningów dla swojej rzadkości
          </div>`
        : onCooldown
          ? `<div style="text-align:center;padding:8px;background:rgba(201,168,76,0.06);border:1px solid #c9a84c22;border-radius:8px;font-size:12px;color:#c9a84c">
              ⏳ Przerwa po treningu: ${cdMin}m ${cdSec}s
            </div>`
          : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px">
              ${TRAINING_SESSIONS.map(sess=>`
                <button onclick="doTraining(${hi},'${sess.id}')" style="
                  display:flex;align-items:center;gap:6px;padding:8px 10px;
                  background:#131f13;border:1px solid ${gold>=sess.cost?"#2a4a2a":"#1a2a1a"};
                  border-radius:8px;cursor:${gold>=sess.cost?"pointer":"not-allowed"};
                  opacity:${gold>=sess.cost?1:0.5};text-align:left;
                ">
                  <span style="font-size:16px">${sess.icon}</span>
                  <div>
                    <div style="font-size:11px;color:var(--text)">${sess.name}</div>
                    <div style="font-size:10px;color:#8aab84">${sess.desc}</div>
                    <div style="font-size:10px;color:#c9a84c">💰${sess.cost}</div>
                  </div>
                </button>
              `).join("")}
            </div>`
      }
    `;
    el.appendChild(card);

    // Wstaw SVG konia
    let svgSlot = card.querySelector(".gym-horse-svg-" + hi);
    if (svgSlot && typeof drawHorseSVG==="function") {
      svgSlot.innerHTML = drawHorseSVG(h.breedKey||h.name, h.rarity, h.stars||0);
      let svgEl = svgSlot.querySelector("svg");
      if (svgEl) { svgEl.setAttribute("width","64"); svgEl.setAttribute("height","52"); }
    }
  });
}

function doTraining(horseIdx, sessionId) {
  let h = playerHorses[horseIdx];
  let sess = TRAINING_SESSIONS.find(s=>s.id===sessionId);
  if (!h || !sess) return;
  if (gold < sess.cost) { log("⚠️ Za mało złota!"); return; }

  let horseId  = h.id || horseIdx;
  let trainData = getHorseTrainingData(horseId);
  let sessions  = trainData.sessions || 0;
  let maxSess   = getTrainingMax(h.rarity);

  if (sessions >= maxSess) { log("⚠️ Koń osiągnął limit treningów!"); return; }
  if (Date.now() < (trainData.cooldownUntil||0)) { log("⚠️ Koń jest na przerwie po treningu!"); return; }

  // Oblicz gain
  let gain = sess.minGain + Math.floor(Math.random()*(sess.maxGain - sess.minGain + 1));
  let stat = sess.stat;
  if (stat === "random") {
    stat = ["speed","strength","stamina","luck"][Math.floor(Math.random()*4)];
  }

  // Limit statystyki — zależy od rzadkości (cap per-stat)
  const STAT_CAP = { common:60, uncommon:80, rare:100, epic:130, legendary:160, mythic:200 };
  let cap = STAT_CAP[h.rarity] || 100;
  let oldVal = h.stats[stat] || 0;
  let newVal = Math.min(cap, oldVal + gain);
  let actualGain = newVal - oldVal;

  if (actualGain <= 0) {
    log(`⚠️ ${h.name} osiągnął limit ${cap} dla ${stat}! (rzadkość: ${h.rarity})`);
    return;
  }

  // Zastosuj
  gold -= sess.cost;
  h.stats[stat] = newVal;

  // Zapisz dane treningowe
  trainData.sessions = sessions + 1;
  trainData.cooldownUntil = Date.now() + sess.duration;
  trainData.history = trainData.history || [];
  trainData.history.push({ sessionId, stat, gain:actualGain, at:Date.now() });
  saveHorseTrainingData(horseId, trainData);

  saveGame(); renderAll();

  let statNames = { speed:"⚡ Szybkość", strength:"💪 Siła", stamina:"❤️ Wytrzymałość", luck:"🍀 Szczęście" };
  log(`${sess.icon} ${h.name} wytrenował! ${statNames[stat]}: +${actualGain} (${oldVal}→${newVal}). Sesja ${trainData.sessions}/${maxSess}`);

  if (typeof addNotification==="function") addNotification("level_up",
    `Trening: ${h.name}`,
    `${statNames[stat]} +${actualGain} · Sesja ${trainData.sessions}/${maxSess}`
  );

  renderGymHorseList();
}
