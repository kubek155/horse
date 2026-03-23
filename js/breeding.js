// =====================
// NOWY EKRAN ROZMNAŻANIA
// =====================

// Maksymalna liczba ciąż klaczy zależna od rzadkości
const MAX_PREGNANCIES = {
  common:    3,
  uncommon:  4,
  rare:      5,
  epic:      6,
  legendary: 7,
  mythic:    8,
};

// Czas ciąży w ms — 48h = 172800000
const PREGNANCY_DURATION = 48 * 60 * 60 * 1000;

// Sprawdź i zakończ dojrzałe ciąże
function checkPregnancies() {
  let changed = false;
  playerHorses.forEach(h => {
    if (!h.pregnant) return;
    if (Date.now() >= h.pregnant.due) {
      birthFoal(h);
      changed = true;
    }
  });
  if (changed) { saveGame(); renderAll(); }
}

function birthFoal(mare) {
  let p = mare.pregnant;
  mare.pregnant = null;

  if (playerHorses.length >= STABLE_LIMIT) {
    // Stajnia pełna — foal do transportera
    let foal = generateFoalFromPregnancy(p);
    inventory.push({ name:"Transporter Konia", obtained:Date.now(), horse:foal });
    log(`🐣 ${mare.name} urodziła! Stajnia pełna — ${foal.name} czeka w Transporterze.`);
    return;
  }

  let foal = generateFoalFromPregnancy(p);
  playerHorses.push(foal);
  log(`🐣 ${mare.name} urodziła ${foal.flag} ${foal.name} (${RARITY_LABELS[foal.rarity]})!`);

  let tier = {common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5}[foal.rarity]||0;
  if (tier >= 2 && typeof showRareHorseEffect === "function") {
    setTimeout(() => showRareHorseEffect(foal.name, foal.rarity, foal.flag), 400);
  }
  if (typeof addDropHistory === "function") addDropHistory({
    icon: foal.flag||"🐴", name: `${foal.name} (narodziny)`,
    source: `🧬 ${mare.name} × ${p.sireNname||"Ogier"}`,
    color: RARITY_COLORS[foal.rarity]||"#8aab84",
  });
  trackQuest("breed");
}

function generateFoalFromPregnancy(p) {
  // p zawiera wszystkie dane potrzebne do wygenerowania źrebięcia
  const TIER = {common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5};
  const RARITY = ["common","uncommon","rare","epic","legendary","mythic"];

  let pool = BREEDS.filter(b2 => b2.rarity === p.childRarity);
  if (!pool.length) pool = BREEDS.filter(b2 => b2.rarity === "common");
  let breed = pool[Math.floor(Math.random() * pool.length)];

  let bl = BLOODLINE_BONUS[p.childBloodline] || {};
  let cRange = RARITY_STAT_RANGE[p.childRarity] || RARITY_STAT_RANGE.common;
  let cap = 200;
  let stars = rollStars(), starBonus = stars * 4;

  function inherit(sA, sB, base) {
    let parentAvg = sA*0.4 + sB*0.4 + base*0.2;
    let v = Math.max(parentAvg, cRange.lo + Math.random()*(cRange.hi-cRange.lo)*0.5);
    v += (Math.random()-0.5)*8;
    if (Math.random()<0.05) v*=1.1;
    return Math.max(cRange.lo, Math.min(cap, Math.round(v)));
  }

  let { bonuses, roll: cbRoll } = calcTypeBonuses(breed.type);
  let mutation = rollMutation(breed.name, p.childRarity);
  let pp = RARITY_PERKS[p.childRarity];
  let perk = pp ? pp[Math.floor(Math.random()*pp.length)] : null;
  let itemSlots = rollItemSlots(p.childRarity);

  let stats = {
    speed:    Math.max(cRange.lo,Math.min(cap,inherit(p.statsA.speed,   p.statsB.speed,   breed.base.speed)   +(bl.speed||0)   +starBonus+bonuses.speed)),
    strength: Math.max(cRange.lo,Math.min(cap,inherit(p.statsA.strength,p.statsB.strength,breed.base.strength)+(bl.strength||0)+starBonus+bonuses.strength)),
    stamina:  Math.max(cRange.lo,Math.min(cap,inherit(p.statsA.stamina, p.statsB.stamina, breed.base.stamina) +(bl.stamina||0) +starBonus+bonuses.stamina)),
    luck:     Math.max(cRange.lo,Math.min(cap,inherit(p.statsA.luck,    p.statsB.luck,    breed.base.luck)    +(bl.luck||0)   +Math.round(starBonus*0.5)+bonuses.luck)),
  };
  if (mutation) {
    stats[mutation.bonusStat] = Math.min(cap, stats[mutation.bonusStat]+mutation.bonusVal);
    if (mutation.secondaryBonus) stats[mutation.secondaryBonus.stat] = Math.min(cap, stats[mutation.secondaryBonus.stat]+mutation.secondaryBonus.val);
  }

  return {
    id: Date.now()+Math.random(), name: breed.name, breedKey: breed.name,
    flag: breed.flag, country: breed.country, type: breed.type,
    bloodline: p.childBloodline, group: p.childRarity, rarity: p.childRarity,
    gender: Math.random()<0.5?"male":"female", stars,
    born: Date.now(), lastFed: Date.now(), bonusApplied: null,
    parents: [p.mareName, p.sireName],
    typeBonus: { stat: TYPE_BONUS_STAT[breed.type]||null, value: cbRoll, bonuses },
    itemSlots, equippedItems: Array(itemSlots).fill(null),
    perk, mutation, stats,
  };
}

// Render paska ciąży na karcie klaczy
function getPregnancyStatus(h) {
  if (!h.pregnant) return null;
  let elapsed = Date.now() - h.pregnant.since;
  let total   = PREGNANCY_DURATION;
  let pct     = Math.min(100, (elapsed/total)*100);
  let msLeft  = Math.max(0, h.pregnant.due - Date.now());
  let hLeft   = Math.floor(msLeft/3600000);
  let mLeft   = Math.floor((msLeft%3600000)/60000);
  return { pct, hLeft, mLeft, due: h.pregnant.due };
}


let breedSlotA = null; // idx konia w playerHorses
let breedSlotB = null;
let breedItems = { nectar: false, compass: false, bloodElixir: false, moonstone: false };

// Szanse na rzadkość potomka zależne od rodziców
function calcBreedChances(hA, hB, hasNectar) {
  const TIER = { common:0, uncommon:1, rare:2, epic:3, legendary:4, mythic:5 };
  const LABEL = ["Zwykły","Pospolity","Rzadki","Legendarny","Mityczny","Pradawny"];
  const COLORS = ["#909090","#8aab84","#4a7ec8","#7b5ea7","#c9a84c","#c94a6a"];
  const RARITY = ["common","uncommon","rare","epic","legendary","mythic"];

  let tA = TIER[hA.rarity]||0, tB = TIER[hB.rarity]||0;
  let tMax = Math.max(tA, tB), tMin = Math.min(tA, tB);

  // Im wyższa rzadkość tym mniejsza szansa na awans
  // Mutacja (awans o 1) zależy od max tieru
  // Im wyższa rzadkość max rodzica, tym mniejsza szansa mutacji
  // common→uncommon: 8%, uncommon→rare: 5%, rare→epic: 3%, epic→legendary: 1.5%, legendary→mythic: 0.5%, mythic→(cap): 0%
  const MUTATION_CHANCE = [0.08, 0.05, 0.03, 0.015, 0.005, 0.0];
  let mutChance = MUTATION_CHANCE[tMax] * (hasNectar ? 1.5 : 1);

  let pA = (1 - mutChance) * 0.45; // 45% od rodzica A
  let pB = (1 - mutChance) * 0.45; // 45% od rodzica B
  let pMut = mutChance;             // mutacja = wyższy tier

  // Jeśli ta sama rzadkość — scala w jeden wynik
  let outcomes = [];
  if (tA === tB) {
    outcomes.push({ rarity: RARITY[tA], pct: (pA + pB), label: LABEL[tA], color: COLORS[tA], desc: "od rodziców" });
  } else {
    outcomes.push({ rarity: RARITY[tA], pct: pA, label: LABEL[tA], color: COLORS[tA], desc: "od ojca" });
    outcomes.push({ rarity: RARITY[tB], pct: pB, label: LABEL[tB], color: COLORS[tB], desc: "od matki" });
  }
  if (tMax < 5) {
    outcomes.push({ rarity: RARITY[tMax+1], pct: pMut, label: LABEL[tMax+1], color: COLORS[tMax+1], desc: hasNectar ? "Boski Nektar ✨" : "mutacja" });
  }

  return outcomes;
}

function rollBreedRarity(hA, hB, hasNectar) {
  const TIER = { common:0, uncommon:1, rare:2, epic:3, legendary:4, mythic:5 };
  const RARITY = ["common","uncommon","rare","epic","legendary","mythic"];
  let tA = TIER[hA.rarity]||0, tB = TIER[hB.rarity]||0, tMax = Math.max(tA, tB);
  // Im wyższa rzadkość max rodzica, tym mniejsza szansa mutacji
  // common→uncommon: 8%, uncommon→rare: 5%, rare→epic: 3%, epic→legendary: 1.5%, legendary→mythic: 0.5%, mythic→(cap): 0%
  const MUTATION_CHANCE = [0.08, 0.05, 0.03, 0.015, 0.005, 0.0];
  let mutChance = MUTATION_CHANCE[tMax] * (hasNectar ? 1.5 : 1);
  let roll = Math.random();
  if (roll < mutChance && tMax < 5) return RARITY[tMax+1];
  if (roll < mutChance + (1-mutChance)*0.5) return hA.rarity;
  return hB.rarity;
}

// =====================
// RENDER EKRANU HODOWLI
// =====================
function openBreedScreen() {
  if (playerHorses.length < 2) { log("⚠️ Potrzebujesz co najmniej 2 koni!"); return; }
  if (playerHorses.length >= STABLE_LIMIT) { log("⚠️ Stajnia pełna!"); return; }

  breedSlotA = null; breedSlotB = null;
  breedItems = { nectar: false, compass: false, bloodElixir: false, moonstone: false };

  let existing = document.getElementById("breedScreenOverlay");
  if (existing) existing.remove();

  let overlay = document.createElement("div");
  overlay.id = "breedScreenOverlay";
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.92);
    display:flex;align-items:center;justify-content:center;
    font-family:'Crimson Text',serif;overflow-y:auto;padding:20px;
  `;

  overlay.innerHTML = `
    <div style="width:100%;max-width:700px;background:#0f1a0f;border-radius:16px;padding:24px;border:1px solid #1e3a1e;position:relative">

      <button onclick="closeBreedScreen()" style="position:absolute;top:12px;right:12px;background:transparent;border:none;color:#4a5a4a;font-size:18px;cursor:pointer;line-height:1">✕</button>

      <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:#8aab84;text-align:center;margin-bottom:20px">🧬 ROZMNAŻANIE KONI</div>

      <!-- Sloty + serce -->
      <div style="display:grid;grid-template-columns:1fr 56px 1fr;gap:12px;align-items:start;margin-bottom:20px">

        <!-- Slot A (Ogier ♂) -->
        <div id="breedSlotA" onclick="openBreedHorsePicker('A')" style="
          background:#131f13;border:2px dashed #1e3a1e;border-radius:12px;
          padding:16px;text-align:center;min-height:180px;cursor:pointer;
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
          transition:border-color 0.2s;
        ">
          <div style="font-size:11px;letter-spacing:2px;color:#4a5a4a">OGIER ♂</div>
          <div style="font-size:36px;opacity:0.3">🐴</div>
          <div style="font-size:11px;color:#4a5a4a">Kliknij aby wybrać</div>
        </div>

        <!-- Środek -->
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding-top:60px">
          <div style="font-size:28px">🧬</div>
          <div style="font-size:10px;color:#4a5a4a;text-align:center;line-height:1.5">wybierz<br>parę</div>
        </div>

        <!-- Slot B (Klacz ♀) -->
        <div id="breedSlotB" onclick="openBreedHorsePicker('B')" style="
          background:#131f13;border:2px dashed #1e3a1e;border-radius:12px;
          padding:16px;text-align:center;min-height:180px;cursor:pointer;
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
          transition:border-color 0.2s;
        ">
          <div style="font-size:11px;letter-spacing:2px;color:#4a5a4a">KLACZ ♀</div>
          <div style="font-size:36px;opacity:0.3">🐴</div>
          <div style="font-size:11px;color:#4a5a4a">Kliknij aby wybrać</div>
        </div>
      </div>

      <!-- Wyniki -->
      <div id="breedOutcomes" style="background:#131f13;border-radius:10px;padding:14px;margin-bottom:14px;min-height:60px;display:flex;align-items:center;justify-content:center">
        <div style="font-size:12px;color:#4a5a4a">Wybierz parę koni aby zobaczyć możliwe wyniki</div>
      </div>

      <!-- Przedmioty wspomagające -->
      <div style="margin-bottom:14px">
        <div style="font-size:10px;letter-spacing:2px;color:#8aab84;margin-bottom:8px">PRZEDMIOTY WSPOMAGAJĄCE</div>
        <div id="breedItemSlots" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"></div>
      </div>

      <!-- Jabłko + przycisk -->
      <div id="breedAppleInfo" style="margin-bottom:10px;font-size:12px;text-align:center;color:#4a5a4a"></div>
      <button id="breedConfirmNewBtn" onclick="confirmBreed()" disabled style="
        width:100%;padding:13px;border-radius:10px;
        font-family:'Cinzel',serif;font-size:13px;letter-spacing:1px;
        background:#0a1a0a;border:1px solid #333;color:#555;cursor:not-allowed;
        transition:all 0.2s;
      ">✨ Rozmnóż konie</button>
    </div>

    <!-- Picker koni -->
    <div id="breedHorsePickerPanel" style="display:none;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:20px;
      width:320px;max-height:70vh;overflow-y:auto;z-index:900">
      <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#8aab84;margin-bottom:12px" id="breedPickerTitle">WYBIERZ KONIA</div>
      <div id="breedPickerList" style="display:flex;flex-direction:column;gap:6px"></div>
      <button onclick="closeBreedHorsePicker()" style="width:100%;margin-top:10px;border-color:#333;color:#666">Anuluj</button>
    </div>
  `;

  document.body.appendChild(overlay);
  renderBreedItemSlots();
  renderBreedAppleInfo();
}

function closeBreedScreen() {
  document.getElementById("breedScreenOverlay")?.remove();
}

// ── Picker koni ────────────────────────────────────────
let breedPickerTarget = null;

function openBreedHorsePicker(slot) {
  breedPickerTarget = slot;
  let panel = document.getElementById("breedHorsePickerPanel");
  let list  = document.getElementById("breedPickerList");
  let title = document.getElementById("breedPickerTitle");
  title.textContent = slot === "A" ? "WYBIERZ OGIERA ♂" : "WYBIERZ KLACZ ♀";
  list.innerHTML = "";

  let targetGender = slot === "A" ? "male" : "female";
  let otherIdx     = slot === "A" ? breedSlotB : breedSlotA;

  playerHorses.forEach((h, i) => {
    if (i === otherIdx) return;
    let hGender  = h.gender || "male";
    let wrongSex  = hGender !== targetGender;
    let maxPreg   = {common:3,uncommon:4,rare:5,epic:6,legendary:7,mythic:8}[h.rarity]||3;
    let usedPreg  = h.pregnancyCount||0;
    let exhausted = hGender==="female" && usedPreg>=maxPreg;
    let pregnant  = !!h.pregnant;
    let blocked   = wrongSex || exhausted || pregnant;
    let rc        = RARITY_COLORS[h.rarity] || "#8aab84";
    let gc        = hGender === "male" ? "#6ab0e0" : "#e080a0";
    let statusNote = exhausted ? `<div style="font-size:10px;color:#c94a4a">✕ Wyczerpany limit ciąż (${usedPreg}/${maxPreg})</div>`
      : pregnant ? `<div style="font-size:10px;color:#f0a0c8">🤰 W ciąży</div>`
      : hGender==="female" ? `<div style="font-size:10px;color:#4ab870">Ciąże: ${usedPreg}/${maxPreg}</div>`
      : "";
    let btn = document.createElement("div");
    btn.style.cssText = `
      display:flex;align-items:center;gap:10px;padding:10px;
      background:#131f13;border:1px solid ${blocked ? "#c94a4a33" : rc+"33"};
      border-radius:8px;cursor:${blocked?"not-allowed":"pointer"};
      opacity:${blocked ? 0.35 : 1};
    `;
    btn.innerHTML = `
      <span style="font-size:20px">${h.flag||"🐴"}</span>
      <div style="flex:1">
        <div style="font-size:12px;color:${rc};font-family:'Cinzel',serif">${h.name} <span style="color:${gc}">${hGender==="male"?"♂":"♀"}</span></div>
        <div style="font-size:10px;color:var(--text2)">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck}</div>
        ${statusNote}
      </div>
    `;
    if (!blocked) btn.onclick = () => selectBreedSlot(slot, i);
    list.appendChild(btn);
  });

  panel.style.display = "block";
}

function closeBreedHorsePicker() {
  document.getElementById("breedHorsePickerPanel").style.display = "none";
}

function selectBreedSlot(slot, idx) {
  if (slot === "A") breedSlotA = idx;
  else              breedSlotB = idx;
  closeBreedHorsePicker();
  renderBreedSlot(slot);
  renderBreedOutcomes();
  renderBreedConfirmBtn();
}

// ── Render slotu konia ─────────────────────────────────
function renderBreedSlot(slot) {
  let idx = slot === "A" ? breedSlotA : breedSlotB;
  let el  = document.getElementById(`breedSlot${slot}`);
  if (!el) return;

  if (idx === null) {
    el.innerHTML = `
      <div style="font-size:11px;letter-spacing:2px;color:#4a5a4a">${slot==="A"?"OGIER ♂":"KLACZ ♀"}</div>
      <div style="font-size:36px;opacity:0.3">🐴</div>
      <div style="font-size:11px;color:#4a5a4a">Kliknij aby wybrać</div>
    `;
    el.style.borderColor = "#1e3a1e";
    el.style.borderStyle = "dashed";
    return;
  }

  let h  = playerHorses[idx];
  let rc = RARITY_COLORS[h.rarity] || "#8aab84";
  let gc = h.gender === "male" ? "#6ab0e0" : "#e080a0";
  let gi = h.gender === "male" ? "♂" : "♀";

  el.style.borderColor = gc;
  el.style.borderStyle = "solid";
  el.innerHTML = `
    <div style="font-size:11px;letter-spacing:2px;color:${gc}">${h.gender==="male"?"OGIER ♂":"KLACZ ♀"}</div>
  `;

  // SVG konia
  let svgDiv = document.createElement("div");
  svgDiv.style.cssText = `width:100%;border-radius:8px;overflow:hidden;background:#0a140a;border:1px solid ${rc}22;margin:4px 0`;
  svgDiv.innerHTML = (typeof drawHorseSVG === "function") ? drawHorseSVG(h.breedKey||h.name, h.rarity, h.stars||0) : "🐴";
  el.appendChild(svgDiv);

  let info = document.createElement("div");
  info.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:12px;color:${rc}">${h.name}</div>
    <div style="font-size:10px;color:var(--text2);margin-top:2px">${RARITY_LABELS[h.rarity]||h.rarity} · ${h.type||""}</div>
    <div style="font-size:10px;color:var(--text2);margin-top:3px">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck}</div>
    ${h.gender==="female" ? `<div style="font-size:10px;color:#f0a0c8;margin-top:3px">Ciąże: ${h.pregnancyCount||0}/${({common:3,uncommon:4,rare:5,epic:6,legendary:7,mythic:8}[h.rarity]||3)}</div>` : ""}
    <button onclick="selectBreedSlot_clear('${slot}')" style="margin-top:6px;font-size:10px;border-color:#555;color:#777;width:100%">Zmień</button>
  `;
  el.appendChild(info);
}

function selectBreedSlot_clear(slot) {
  if (slot === "A") breedSlotA = null;
  else              breedSlotB = null;
  renderBreedSlot(slot);
  renderBreedOutcomes();
  renderBreedConfirmBtn();
}

// ── Render wyników ─────────────────────────────────────
function renderBreedOutcomes() {
  let el = document.getElementById("breedOutcomes");
  if (!el) return;
  if (breedSlotA === null || breedSlotB === null) {
    el.innerHTML = `<div style="font-size:12px;color:#4a5a4a">Wybierz parę koni aby zobaczyć możliwe wyniki</div>`;
    return;
  }
  let hA = playerHorses[breedSlotA], hB = playerHorses[breedSlotB];
  let outcomes = calcBreedChances(hA, hB, breedItems.nectar);

  el.innerHTML = `<div style="width:100%">
    <div style="font-size:10px;letter-spacing:2px;color:#8aab84;margin-bottom:10px">MOŻLIWE WYNIKI POTOMKA</div>
    <div style="display:grid;grid-template-columns:repeat(${outcomes.length},1fr);gap:8px">
      ${outcomes.map(o => `
        <div style="background:${o.color}18;border:1px solid ${o.color}44;border-radius:8px;padding:10px 8px;text-align:center">
          <div style="font-family:'Cinzel',serif;font-size:20px;color:${o.color}">${(o.pct*100).toFixed(1)}%</div>
          <div style="font-size:11px;color:${o.color};margin-top:2px">${o.label}</div>
          <div style="font-size:10px;color:var(--text2);margin-top:3px;opacity:0.8">${o.desc}</div>
        </div>
      `).join("")}
    </div>
  </div>`;
}

// ── Itemy wspomagające ─────────────────────────────────
const BREED_SUPPORT_ITEMS = [
  { key:"nectar",     name:"Boski Nektar",    icon:"🌟", desc:"+50% szans na mutację wyżej",    inv:"Boski Nektar"    },
  { key:"compass",    name:"Złoty Kompas",    icon:"🧭", desc:"Wybierz rasę potomka",            inv:"Złoty Kompas"    },
  { key:"bloodElixir",name:"Eliksir Krwi",   icon:"🩸", desc:"Przekaż krew silniejszego",       inv:"Eliksir Krwi"   },
  { key:"moonstone",  name:"Księżycowy Kamień",icon:"🌙",desc:"Pradawny dostaje 2 perki",        inv:"Księżycowy Kamień"},
];

function renderBreedItemSlots() {
  let el = document.getElementById("breedItemSlots");
  if (!el) return;
  el.innerHTML = "";
  BREED_SUPPORT_ITEMS.forEach(item => {
    let has    = inventory.some(i => i.name === item.inv);
    let active = breedItems[item.key];
    let div    = document.createElement("div");
    div.style.cssText = `
      padding:8px;border-radius:8px;text-align:center;cursor:${has?"pointer":"default"};
      background:${active?"rgba(201,168,76,0.1)":"#131f13"};
      border:1px solid ${active?"#c9a84c":has?"#2e4a2e":"#1e2e1e"};
      opacity:${has?1:0.4};transition:all 0.15s;
    `;
    div.innerHTML = `
      <div style="font-size:20px;margin-bottom:3px">${item.icon}</div>
      <div style="font-size:10px;color:${active?"#c9a84c":"#8aab84"};font-family:'Cinzel',serif;line-height:1.2">${item.name}</div>
      <div style="font-size:9px;color:var(--text2);margin-top:3px;line-height:1.3">${item.desc}</div>
      ${has ? `<div style="font-size:9px;color:${active?"#c9a84c":"#4ab870"};margin-top:4px">${active?"✓ aktywny":"+ kliknij"}</div>` : `<div style="font-size:9px;color:#555;margin-top:4px">brak</div>`}
    `;
    if (has) div.onclick = () => {
      breedItems[item.key] = !breedItems[item.key];
      renderBreedItemSlots();
      renderBreedOutcomes();
    };
    el.appendChild(div);
  });
}

function renderBreedAppleInfo() {
  let el = document.getElementById("breedAppleInfo");
  if (!el) return;
  let count = inventory.filter(i => i.name === "Jabłko Sfinksa").length;
  el.innerHTML = (count > 0
    ? `<span style="color:#4ab870">🍏 Jabłka Sfinksa: ${count} · jedno zostanie zużyte</span>`
    : `<span style="color:#c94a4a">⚠️ Brak Jabłka Sfinksa — wymagane do rozmnażania</span>`)
    + `<div style="font-size:10px;color:var(--text2);margin-top:4px">⏳ Ciąża trwa 48h — źrebię urodzi się automatycznie</div>`;
}

function renderBreedConfirmBtn() {
  let btn    = document.getElementById("breedConfirmNewBtn");
  if (!btn) return;
  let hasApple  = inventory.some(i => i.name === "Jabłko Sfinksa");
  let ready     = breedSlotA !== null && breedSlotB !== null && hasApple;
  btn.disabled  = !ready;
  btn.style.cssText = `
    width:100%;padding:13px;border-radius:10px;
    font-family:'Cinzel',serif;font-size:13px;letter-spacing:1px;
    background:${ready?"#0f2a0f":"#0a1a0a"};
    border:1px solid ${ready?"#c9a84c":"#333"};
    color:${ready?"#c9a84c":"#555"};
    cursor:${ready?"pointer":"not-allowed"};transition:all 0.2s;
  `;
  btn.textContent = ready ? "✨ Rozmnóż konie · koszt: 🍏 ×1" : "✨ Wybierz parę i Jabłko Sfinksa";
}

function confirmBreed() {
  if (breedSlotA === null || breedSlotB === null) return;
  let appleIdx = inventory.findIndex(i => i.name === "Jabłko Sfinksa");
  if (appleIdx === -1) { log("⚠️ Brak Jabłka Sfinksa!"); return; }

  let sire = playerHorses[breedSlotA]; // ogier ♂
  let mare = playerHorses[breedSlotB]; // klacz ♀
  // Upewnij się że klacz to ♀
  if ((sire.gender||"male") === "female") [sire, mare] = [mare, sire];

  // Sprawdź limit ciąż klaczy
  let maxPreg = MAX_PREGNANCIES[mare.rarity] || 3;
  let usedPreg = mare.pregnancyCount || 0;
  if (usedPreg >= maxPreg) {
    log(`⚠️ ${mare.name} osiągnęła limit ciąż (${maxPreg}/${maxPreg})!`);
    return;
  }

  // Sprawdź czy klacz nie jest już w ciąży
  if (mare.pregnant) {
    let st = getPregnancyStatus(mare);
    log(`⚠️ ${mare.name} jest już w ciąży! Poród za ${st.hLeft}h ${st.mLeft}min.`);
    return;
  }

  inventory.splice(appleIdx, 1);
  BREED_SUPPORT_ITEMS.forEach(item => {
    if (breedItems[item.key]) {
      let idx = inventory.findIndex(i => i.name === item.inv);
      if (idx >= 0) inventory.splice(idx, 1);
    }
  });

  // Określ cechy potomka teraz (rasa, rzadkość, krew) — urodzenie po 48h
  const TIER = {common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5};
  let childRarity   = rollBreedRarity(sire, mare, breedItems.nectar);
  let childBloodline = breedItems.bloodElixir
    ? ((TIER[sire.rarity]||0) >= (TIER[mare.rarity]||0) ? sire.bloodline : mare.bloodline)
    : (Math.random()<0.5 ? sire.bloodline : mare.bloodline);

  // Zapisz ciążę na klaczy
  mare.pregnant = {
    since:         Date.now(),
    due:           Date.now() + PREGNANCY_DURATION,
    childRarity,
    childBloodline,
    sireName:      sire.name,
    sireFlag:      sire.flag||"🐴",
    mareName:      mare.name,
    statsA:        { ...sire.stats },
    statsB:        { ...mare.stats },
  };
  mare.pregnancyCount = (mare.pregnancyCount||0) + 1;

  closeBreedScreen();
  saveGame(); renderAll();
  log(`🐣 ${mare.name} jest w ciąży! Źrebię urodzi się za 48h. (${mare.pregnancyCount}/${maxPreg} ciąż)`);
}

// Nowa wersja breedHorses używająca nowych szans i itemów
function breedHorsesNew(idxA, idxB, items) {
  let a = playerHorses[idxA], b = playerHorses[idxB];
  const TIER = { common:0, uncommon:1, rare:2, epic:3, legendary:4, mythic:5 };
  const RARITY = ["common","uncommon","rare","epic","legendary","mythic"];
  let tierA = TIER[a.rarity]||0, tierB = TIER[b.rarity]||0;

  let childRarity = rollBreedRarity(a, b, items.nectar);

  // Eliksir Krwi — dziecko dziedziczy krew silniejszego rodzica
  let childBloodline = items.bloodElixir
    ? (tierA >= tierB ? a.bloodline : b.bloodline)
    : (Math.random() < 0.5 ? a.bloodline : b.bloodline);

  let pool = BREEDS.filter(b2 => b2.rarity === childRarity);
  if (!pool.length) pool = BREEDS.filter(b2 => b2.rarity === "common");
  let breed = pool[Math.floor(Math.random() * pool.length)];

  let stars     = rollStars();
  let starBonus = stars * 4;
  let bl        = BLOODLINE_BONUS[childBloodline] || {};
  let cRange    = RARITY_STAT_RANGE[childRarity]  || RARITY_STAT_RANGE.common;
  let cap       = 200;

  function inherit(sA, sB, base) {
    let parentAvg = sA*0.4 + sB*0.4 + base*0.2;
    let minVal = cRange.lo;
    let v = Math.max(parentAvg, minVal + (Math.random() * (cRange.hi - minVal) * 0.5));
    v += (Math.random()-0.5) * 8;
    if (Math.random() < 0.05) v *= 1.1;
    return Math.max(cRange.lo, Math.min(cap, Math.round(v)));
  }

  let { bonuses: childBonuses, roll: cbRoll } = calcTypeBonuses(breed.type);
  let pp = RARITY_PERKS[childRarity];
  let perk = null;
  if (pp) {
    // Księżycowy Kamień — Pradawny dostaje 2 perki (bierzemy losowy z listy)
    perk = pp[Math.floor(Math.random() * pp.length)];
  }

  let childGender = Math.random() < 0.5 ? "male" : "female";
  let mutation    = rollMutation(breed.name, childRarity);

  let stats = {
    speed:    Math.max(cRange.lo, Math.min(cap, inherit(a.stats.speed,    b.stats.speed,    breed.base.speed)    + (bl.speed||0)    + starBonus + childBonuses.speed)),
    strength: Math.max(cRange.lo, Math.min(cap, inherit(a.stats.strength, b.stats.strength, breed.base.strength) + (bl.strength||0) + starBonus + childBonuses.strength)),
    stamina:  Math.max(cRange.lo, Math.min(cap, inherit(a.stats.stamina,  b.stats.stamina,  breed.base.stamina)  + (bl.stamina||0)  + starBonus + childBonuses.stamina)),
    luck:     Math.max(cRange.lo, Math.min(cap, inherit(a.stats.luck,     b.stats.luck,     breed.base.luck)     + (bl.luck||0)     + Math.round(starBonus*0.5) + childBonuses.luck)),
  };

  if (mutation) {
    stats[mutation.bonusStat] = Math.min(cap, stats[mutation.bonusStat] + mutation.bonusVal);
    if (mutation.secondaryBonus) stats[mutation.secondaryBonus.stat] = Math.min(cap, stats[mutation.secondaryBonus.stat] + mutation.secondaryBonus.val);
  }

  let itemSlots = rollItemSlots(childRarity);
  let child = {
    id: Date.now()+Math.random(), name: breed.name, breedKey: breed.name,
    flag: breed.flag, country: breed.country, type: breed.type,
    bloodline: childBloodline, group: childRarity, rarity: childRarity,
    gender: childGender, stars, born: Date.now(), lastFed: Date.now(),
    bonusApplied: null, parents: [a.name, b.name],
    typeBonus: { stat: TYPE_BONUS_STAT[breed.type]||null, value: cbRoll, bonuses: childBonuses },
    itemSlots, equippedItems: Array(itemSlots).fill(null),
    perk, mutation, stats,
  };

  if (mutation) log(`🧬✨ MUTACJA! ${child.flag} ${child.name} odziedziczył cechę od ${mutation.donorFlag} ${mutation.donor}!`);
  else          log(`🧬 Urodzono: ${child.flag} ${child.name} (${RARITY_LABELS[childRarity]})! Rodzice: ${a.name} & ${b.name}`);

  playerHorses.push(child);
  trackQuest("breed");

  // Animacja nowego konia jeśli rzadki
  let tier = {common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5}[childRarity]||0;
  if (tier >= 2 && typeof showRareHorseEffect === "function") {
    setTimeout(() => showRareHorseEffect(child.name, child.rarity, child.flag), 400);
  }

  saveGame(); renderAll();
}
