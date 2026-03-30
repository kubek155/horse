// =====================
// SPECJALNE WYPRAWY
// =====================

const SPECIAL_EXPEDITIONS = [
  {
    id: "long_forest",
    name: "Leśna Wędrówka",
    icon: "🌲", duration: 24*60*60*1000,
    desc: "24h wyprawa — 3× więcej złota, +50% szans na item",
    gold: { min:500, max:900 },
    dropBonus: 0.5,
    goldMult: 3,
    minHorseLevel: 0,
    drops: ["Jabłko Sfinksa","Skrzynka z Łupem","Eliksir Szybkości","Leśna Przepustka","Boski Nektar"],
    lore: "Długa wyprawa przez gęsty las — tylko wytrzymałe konie dają radę",
    available: true,
  },
  {
    id: "long_desert",
    name: "Krzyż Pustyni",
    icon: "🏜️", duration: 24*60*60*1000,
    desc: "24h wyprawa — gwarantowany Rzadki item",
    gold: { min:700, max:1200 },
    dropBonus: 0,
    goldMult: 2.5,
    minHorseLevel: 0,
    guaranteedRarity: "rare",
    drops: ["Jabłko Sfinksa","Eliksir Siły","Eliksir Wytrzymałości","Pustynna Przepustka"],
    lore: "Przeprawa przez spalony piasek. Wróć z cennym ładunkiem",
    available: true,
  },
  {
    id: "long_shadow",
    name: "Mroczna Pielgrzymka",
    icon: "🌑", duration: 48*60*60*1000,
    desc: "48h — gwarantowany koń Rzadki+",
    gold: { min:1500, max:3000 },
    dropBonus: 0,
    goldMult: 1,
    guaranteedHorse: "rare",
    drops: [],
    lore: "Dwa dni w ciemnościach. Legendarny koń czeka na końcu",
    available: true,
  },
];

// Eventy specjalne — odnawiają się co 12h, dostępne przez 2h
const SPECIAL_EVENTS = [
  { id:"festival",  name:"Festiwal Koni",    icon:"🎪", desc:"2× złoto z wyprawy",    goldMult:2,   xpMult:1,  dropMult:1 },
  { id:"treasure",  name:"Polowanie na Skarb",icon:"🗺️", desc:"Gwarantowany item Legendarny", goldMult:1, xpMult:2, dropMult:3 },
  { id:"village",   name:"Turniej Wsi",       icon:"🏘️", desc:"XP ×3",               goldMult:1,   xpMult:3,  dropMult:1 },
];

function getActiveEvent() {
  let stored = JSON.parse(localStorage.getItem("hh_active_event")||"null");
  if (!stored) return null;
  if (Date.now() > stored.expiresAt) {
    localStorage.removeItem("hh_active_event");
    return null;
  }
  return stored;
}

function generateDailyEvent() {
  // Generuj event oparty na czasie (hash godziny)
  let hour = Math.floor(Date.now() / (12*60*60*1000));
  let idx  = hour % SPECIAL_EVENTS.length;
  let ev   = SPECIAL_EVENTS[idx];
  let startOfSlot = hour * 12*60*60*1000;
  let expiresAt   = startOfSlot + 2*60*60*1000; // 2h dostępności
  if (Date.now() > expiresAt) return null; // minął slot
  return { ...ev, expiresAt, startsAt: startOfSlot };
}

// ── Render specjalnych wypraw ───────────────────────────
function renderSpecialExpeditions() {
  let el = document.getElementById("specialExpeditionsDiv");
  if (!el) return;
  el.innerHTML = "";

  let activeEvent = generateDailyEvent();

  // Event banner
  if (activeEvent) {
    let msLeft = activeEvent.expiresAt - Date.now();
    let mLeft  = Math.floor(msLeft/60000);
    let banner = document.createElement("div");
    banner.style.cssText = "background:rgba(201,168,76,0.12);border:1px solid #c9a84c66;border-radius:10px;padding:12px 16px;margin-bottom:14px;display:flex;align-items:center;gap:12px";
    banner.innerHTML = `
      <span style="font-size:28px">${activeEvent.icon}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:13px;color:#c9a84c">${activeEvent.name}</div>
        <div style="font-size:11px;color:var(--text2)">${activeEvent.desc} · Kończy się za ${mLeft} min</div>
      </div>
      <div style="font-size:10px;color:#c9a84c;text-align:right">EVENT<br>AKTYWNY</div>
    `;
    el.appendChild(banner);
  }

  // Specjalne wyprawy
  SPECIAL_EXPEDITIONS.forEach(spec => {
    let hours = spec.duration / 3600000;
    let card  = document.createElement("div");
    card.style.cssText = "background:var(--panel2);border:1px solid #c9a84c44;border-radius:12px;padding:16px;margin-bottom:10px";
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px">
        <div>
          <div style="font-family:'Cinzel',serif;font-size:14px;color:#c9a84c">${spec.icon} ${spec.name}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:3px">${spec.lore}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;margin-left:12px">
          <div style="font-size:10px;color:var(--text2)">Czas</div>
          <div style="font-family:'Cinzel',serif;font-size:14px;color:#c9a84c">${hours}h</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
        <span style="font-size:11px;background:#c9a84c18;border:1px solid #c9a84c33;border-radius:6px;padding:3px 10px;color:#c9a84c">
          💰 ${spec.gold.min}–${spec.gold.max} złota
        </span>
        ${spec.goldMult>1 ? `<span style="font-size:11px;background:#4ab87018;border:1px solid #4ab87033;border-radius:6px;padding:3px 10px;color:#4ab870">×${spec.goldMult} złoto</span>` : ""}
        ${spec.dropBonus>0 ? `<span style="font-size:11px;background:#4a7ec818;border:1px solid #4a7ec833;border-radius:6px;padding:3px 10px;color:#6ab0e0">+${spec.dropBonus*100}% drop</span>` : ""}
        ${spec.guaranteedHorse ? `<span style="font-size:11px;background:#7b5ea718;border:1px solid #7b5ea733;border-radius:6px;padding:3px 10px;color:#b090e0">🐴 Gwarantowany ${RARITY_LABELS[spec.guaranteedHorse]}</span>` : ""}
        ${spec.guaranteedRarity ? `<span style="font-size:11px;background:#4a7ec818;border:1px solid #4a7ec833;border-radius:6px;padding:3px 10px;color:#6ab0e0">✨ Gwarantowany Rzadki+</span>` : ""}
      </div>
      <button onclick="startSpecialExpedition('${spec.id}')" style="width:100%;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);font-family:'Cinzel',serif;font-size:12px">
        🌟 Wyślij konia · ${hours}h
      </button>
    `;
    el.appendChild(card);
  });
}

function startSpecialExpedition(specId) {
  let spec = SPECIAL_EXPEDITIONS.find(s=>s.id===specId);
  if (!spec) return;
  if (playerHorses.length === 0) { log("⚠️ Brak koni!"); return; }

  // Picker koni
  let modal = document.createElement("div");
  modal.id  = "specExpPicker";
  modal.style.cssText = "position:fixed;inset:0;z-index:900;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center";
  modal.innerHTML = `
    <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:14px;padding:20px;width:340px;max-height:70vh;overflow-y:auto">
      <div style="font-family:'Cinzel',serif;font-size:12px;color:#c9a84c;margin-bottom:14px">${spec.icon} ${spec.name} · Wybierz konia</div>
      <div id="specExpPickerList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px"></div>
      <button onclick="document.getElementById('specExpPicker').remove()" style="width:100%;border-color:#333;color:#666">Anuluj</button>
    </div>
  `;
  document.body.appendChild(modal);

  let list = document.getElementById("specExpPickerList");
  let busyIdxs = new Set(expeditions.filter(e=>!e.done).map(e=>e.horseIdx));

  playerHorses.forEach((h,i) => {
    let rc      = RARITY_COLORS[h.rarity]||"#8aab84";
    let blocked = busyIdxs.has(i) || h.injured;
    let div     = document.createElement("div");
    div.style.cssText = `display:flex;align-items:center;gap:10px;padding:10px;background:#131f13;border:1px solid ${blocked?"#333":rc+"33"};border-radius:8px;cursor:${blocked?"not-allowed":"pointer"};opacity:${blocked?0.4:1}`;
    div.innerHTML = `
      <span style="font-size:20px">${h.flag||"🐴"}</span>
      <div style="flex:1">
        <div style="font-size:12px;color:${rc}">${h.name}</div>
        <div style="font-size:10px;color:var(--text2)">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina}</div>
        ${blocked?`<div style="font-size:10px;color:#c94a4a">${h.injured?"🤕 Ranny":"🌍 Na wyprawie"}</div>`:""}
      </div>
    `;
    if (!blocked) div.onclick = () => {
      document.getElementById("specExpPicker").remove();
      launchSpecialExpedition(specId, i);
    };
    list.appendChild(div);
  });
}

function launchSpecialExpedition(specId, horseIdx) {
  let spec = SPECIAL_EXPEDITIONS.find(s=>s.id===specId);
  let exp  = {
    locationIndex: -1,  // specjalna
    specId,
    horseIdx,
    start: Date.now(),
    end:   Date.now() + spec.duration,
    done:  false,
    isSpecial: true,
  };
  expeditions.push(exp);
  if(typeof addDaily==="function")addDaily();
  let h = playerHorses[horseIdx];
  log(`🌟 ${h.name} wyruszył na ${spec.name} (${spec.duration/3600000}h)!`);
  saveGame(); renderAll();
}

function finishSpecialExpedition(e) {
  let spec = SPECIAL_EXPEDITIONS.find(s=>s.id===e.specId);
  if (!spec) { e.done=true; return; }
  let h    = playerHorses[e.horseIdx];
  let ev   = generateDailyEvent();

  // Złoto
  let baseGold = spec.gold.min + Math.floor(Math.random()*(spec.gold.max-spec.gold.min+1));
  let gMult    = spec.goldMult * (ev?.goldMult||1) * (typeof getGoldBonus==="function"?getGoldBonus():1);
  let passGold = typeof getStablePassives==="function" ? (1+(getStablePassives().gold_pct||0)) : 1;
  let totalGold = Math.round(baseGold * gMult * passGold);
  gold += totalGold;

  // XP
  let xpGain = Math.round(150 * (ev?.xpMult||1));
  if (typeof addXP==="function") addXP(xpGain, spec.name);

  log(`🌟 ${h?.name||"Koń"} wrócił z ${spec.name}! +${totalGold}💰 +${xpGain}XP`);

  // Gwarantowany koń
  if (spec.guaranteedHorse) {
    let newH = generateHorse(spec.guaranteedHorse);
    if (playerHorses.length >= getStableLimit()) {
      inventory.push({name:"Transporter Konia",obtained:Date.now(),horse:newH});
    } else { playerHorses.push(newH); }
    log(`🐴 ${newH.flag} ${newH.name} (${RARITY_LABELS[spec.guaranteedHorse]}) przyłączył się!`);
  }

  // Gwarantowany item
  if (spec.guaranteedRarity && spec.drops.length>0) {
    let drop = spec.drops[Math.floor(Math.random()*spec.drops.length)];
    inventory.push({name:drop, obtained:Date.now()});
    log(`✨ Znaleziono: ${drop}!`);
  }

  if (typeof addNotification==="function") addNotification("expedition_done",
    `${h?.name||"Koń"} wrócił z ${spec.name}`,
    `+${totalGold}💰 · +${xpGain}XP`,
  );

  e.done = true;
  saveGame();
}
