// =====================
// ROZBUDOWA STAJNI — zasoby budowlane + ulepszenia per koń
// =====================

// Zasoby budowlane — dropują na wyprawach
const BUILD_MATERIALS = {
  "Deska":       { icon:"🪵", desc:"Drewno budowlane — potrzebne do rozbudowy stajni" },
  "Cegła":       { icon:"🧱", desc:"Wypalona cegła — fundament każdej stajni" },
  "Dachówka":    { icon:"🏗️", svgIcon:"roof",  desc:"Ceramiczna dachówka — okrywa dach stajni" },
  "Gwóźdź":      { icon:"📌", desc:"Stalowy gwóźdź — łączy deski i belki" },
  "Siano":       { icon:"🌾", desc:"Bele siana — wypełnienie i izolacja ścian" },
  "Kamień":      { icon:"🪨", desc:"Kamień polny — wzmocnienie fundamentów" },
  "Szkło":       { icon:"🪟", desc:"Szyba okienna — doświetla stajnię" },
  "Metal":       { icon:"⚙️",  desc:"Okucia metalowe — zawiasy i zamki" },
};

// Poziomy stajni — wymagają złota + materiałów
const STABLE_LEVELS = [
  {
    level:1, horses:8, cost:0, bonus:"Startowa stajnia", icon:"🏠",
    materials: {},
  },
  {
    level:2, horses:10, cost:1500, bonus:"Solidna stajnia +2 miejsca", icon:"🏡",
    materials: { "Deska":20, "Gwóźdź":10, "Siano":5 },
  },
  {
    level:3, horses:13, cost:5000, bonus:"Rozbudowana stajnia +3 miejsca", icon:"🏘️",
    materials: { "Deska":40, "Cegła":20, "Gwóźdź":25, "Kamień":15 },
  },
  {
    level:4, horses:16, cost:15000, bonus:"Wielka stajnia +3 miejsca", icon:"🏰",
    materials: { "Cegła":50, "Dachówka":30, "Metal":20, "Szkło":10, "Kamień":30 },
  },
  {
    level:5, horses:20, cost:50000, bonus:"Stadnina +4 miejsca", icon:"🏟️", svgIcon:"arena",
    materials: { "Cegła":80, "Dachówka":60, "Metal":40, "Szkło":25, "Kamień":50, "Deska":60 },
  },
];

// Ulepszenia stajni — per koń (można kupić wielokrotnie)
const STABLE_UPGRADES = [
  {
    id:"gym",         name:"Siłownia",          icon:"💪", svgIcon:"gym",
    desc:"+5 do wszystkich statów wybranego konia (jednorazowe, per koń)",
    cost:3000, materials:{ "Metal":5, "Deska":8 },
    type:"per_horse", stat:"all", val:5,
    requires:2,
  },
  {
    id:"track",       name:"Tor wyścigowy",      icon:"🏁", svgIcon:"track",
    desc:"+8 szybkości wybranego konia",
    cost:2500, materials:{ "Deska":12, "Gwóźdź":8 },
    type:"per_horse", stat:"speed", val:8,
    requires:2,
  },
  {
    id:"pool",        name:"Basen regeneracyjny",icon:"💧", svgIcon:"pool",
    desc:"+8 wytrzymałości wybranego konia",
    cost:2500, materials:{ "Kamień":10, "Metal":5, "Szkło":3 },
    type:"per_horse", stat:"stamina", val:8,
    requires:2,
  },
  {
    id:"arena",       name:"Arena treningowa",   icon:"🏟️", svgIcon:"arena",
    desc:"+8 siły wybranego konia",
    cost:2500, materials:{ "Cegła":15, "Metal":8 },
    type:"per_horse", stat:"strength", val:8,
    requires:3,
  },
  {
    id:"garden",      name:"Ogród ziołowy",      icon:"🌿", svgIcon:"garden",
    desc:"+8 szczęścia wybranego konia",
    cost:2000, materials:{ "Siano":15, "Kamień":5 },
    type:"per_horse", stat:"luck", val:8,
    requires:2,
  },
  // Globalne pasywne
  {
    id:"vet",         name:"Gabinet weterynarza", icon:"🩺", svgIcon:"vet",
    desc:"Leczenie 1 konia dziennie za darmo",
    cost:4000, materials:{ "Szkło":15, "Metal":10, "Cegła":20 },
    type:"global", bonus:{type:"free_heal", val:1},
    requires:3,
  },
  {
    id:"fountain",    name:"Fontanna Szczęścia",  icon:"⛲", svgIcon:"fountain",
    desc:"+5% do drop rate na wszystkich wyprawach",
    cost:12000, materials:{ "Kamień":40, "Metal":20, "Szkło":15 },
    type:"global", bonus:{type:"drop_pct", val:0.05},
    requires:4,
  },
  {
    id:"forge",       name:"Kuźnia",             icon:"⚒️", svgIcon:"forge",
    desc:"-25% szans na kontuzję wszystkich koni",
    cost:8000, materials:{ "Metal":35, "Cegła":25, "Gwóźdź":30 },
    type:"global", bonus:{type:"injury_reduce", val:0.25},
    requires:3,
  },
  {
    id:"treadmill",   name:"Bieżnia",            icon:"🏃", svgIcon:"treadmill",
    desc:"+10% złota z każdej wyprawy",
    cost:10000, materials:{ "Metal":30, "Deska":40, "Gwóźdź":20 },
    type:"global", bonus:{type:"gold_pct", val:0.10},
    requires:4,
  },
  {
    id:"roof",        name:"Luksusowy dach",     icon:"🏗️", svgIcon:"roof",
    desc:"Konie w stajni regenerują głód +20% szybciej",
    cost:6000, materials:{ "Dachówka":50, "Deska":30, "Gwóźdź":40 },
    type:"global", bonus:{type:"hunger_regen", val:0.20},
    requires:3,
  },
];

// ── Gettery / settery ────────────────────────────────────
function getStableLevel()    { return parseInt(localStorage.getItem("hh_stable_level"))||1; }
function setStableLevel(lvl) { localStorage.setItem("hh_stable_level", lvl); }
function getGlobalUpgrades() {
  try { return JSON.parse(localStorage.getItem("hh_stable_upgrades")||"[]"); } catch(e) { return []; }
}
function getHorseUpgrades(horseId) {
  try {
    let all = JSON.parse(localStorage.getItem("hh_horse_upgrades")||"{}");
    return all[horseId] || [];
  } catch(e) { return []; }
}
function addHorseUpgrade(horseId, upgradeId) {
  let all = JSON.parse(localStorage.getItem("hh_horse_upgrades")||"{}");
  if (!all[horseId]) all[horseId] = [];
  all[horseId].push(upgradeId);
  localStorage.setItem("hh_horse_upgrades", JSON.stringify(all));
}

// Dynamiczny STABLE_LIMIT
function getStableLimit() {
  return STABLE_LEVELS[Math.min(getStableLevel()-1, STABLE_LEVELS.length-1)].horses;
}
function patchStableLimit() {
  Object.defineProperty(window, 'STABLE_LIMIT', {
    get: ()=>getStableLimit(), configurable:true,
  });
}

// Globalne pasywne bonusy
function getStablePassives() {
  let passives = {};
  getGlobalUpgrades().forEach(uid => {
    let u = STABLE_UPGRADES.find(x=>x.id===uid && x.type==="global");
    if (u?.bonus) passives[u.bonus.type] = (passives[u.bonus.type]||0) + u.bonus.val;
  });
  return passives;
}

// Materiały w ekwipunku — liczba sztuk
function countMaterial(name) {
  return (window.inventory||[]).filter(i=>i.name===name).length;
}
function hasMaterials(mats) {
  return Object.entries(mats).every(([name,qty])=>countMaterial(name)>=qty);
}
function consumeMaterials(mats) {
  Object.entries(mats).forEach(([name,qty])=>{
    let left = qty;
    window.inventory = (window.inventory||[]).filter(i=>{
      if (i.name===name && left>0) { left--; return false; }
      return true;
    });
  });
}

// ── EKRAN ROZBUDOWY ──────────────────────────────────────

// ── SVG wizualizacja stajni zależna od poziomu ─────────────
function drawStableSVG(level) {
  const W = 280, H = 160;
  // Kolory per poziom
  const COLS = {
    1: { wall:"#5a3a1a", roof:"#8a2010", ground:"#3a2a10", detail:"#7a5a2a" },
    2: { wall:"#6a4a2a", roof:"#a03020", ground:"#4a3a18", detail:"#9a7a3a" },
    3: { wall:"#7a5a3a", roof:"#b04030", ground:"#5a4a20", detail:"#b08a4a" },
    4: { wall:"#8a6a4a", roof:"#c05040", ground:"#6a5828", detail:"#c09a5a" },
    5: { wall:"#a0804a", roof:"#c9a84c", ground:"#7a6830", detail:"#d4b870" },
  };
  const col = COLS[Math.min(level, 5)];

  // Elementy per poziom
  const hasTower   = level >= 3;
  const hasWindows = level >= 2;
  const hasWeather = level >= 4;
  const hasGarden  = level >= 5;

  let svg = `<svg viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Podłoże -->
  <rect x="0" y="130" width="${W}" height="30" fill="${col.ground}" opacity="0.6"/>

  <!-- Główny budynek -->
  <rect x="40" y="60" width="200" height="70" fill="${col.wall}" rx="2"/>
  <rect x="40" y="60" width="200" height="8" fill="${col.detail}" opacity="0.5" rx="1"/>

  <!-- Dach główny -->
  <polygon points="30,62 140,18 250,62" fill="${col.roof}"/>
  <polygon points="36,62 140,22 244,62" fill="${col.roof}" opacity="0.7"/>
  <line x1="140" y1="18" x2="140" y2="62" stroke="${col.detail}" stroke-width="1.5" opacity="0.4"/>

  <!-- Drzwi -->
  <rect x="112" y="90" width="32" height="40" rx="16 16 2 2" fill="${col.detail}" opacity="0.8"/>
  <rect x="114" y="92" width="28" height="36" rx="14 14 2 2" fill="#1a0e06" opacity="0.7"/>
  <circle cx="138" cy="112" r="2.5" fill="${col.detail}"/>

  <!-- Belki poziome -->
  <line x1="40" y1="90" x2="240" y2="90" stroke="${col.detail}" stroke-width="1.2" opacity="0.4"/>
  <line x1="40" y1="110" x2="112" y2="110" stroke="${col.detail}" stroke-width="1" opacity="0.3"/>
  <line x1="144" y1="110" x2="240" y2="110" stroke="${col.detail}" stroke-width="1" opacity="0.3"/>`;

  if (hasWindows) {
    svg += `
  <!-- Okna (poz 2+) -->
  <rect x="52" y="70" width="28" height="20" rx="3" fill="#a8d8f0" opacity="0.4" stroke="${col.detail}" stroke-width="1"/>
  <line x1="66" y1="70" x2="66" y2="90" stroke="${col.detail}" stroke-width="0.8" opacity="0.5"/>
  <line x1="52" y1="80" x2="80" y2="80" stroke="${col.detail}" stroke-width="0.8" opacity="0.5"/>
  <rect x="200" y="70" width="28" height="20" rx="3" fill="#a8d8f0" opacity="0.4" stroke="${col.detail}" stroke-width="1"/>
  <line x1="214" y1="70" x2="214" y2="90" stroke="${col.detail}" stroke-width="0.8" opacity="0.5"/>
  <line x1="200" y1="80" x2="228" y2="80" stroke="${col.detail}" stroke-width="0.8" opacity="0.5"/>`;
  }

  if (hasTower) {
    svg += `
  <!-- Wieżyczka (poz 3+) -->
  <rect x="170" y="34" width="30" height="30" fill="${col.wall}" rx="1"/>
  <polygon points="165,36 185,10 205,36" fill="${col.roof}"/>
  <rect x="178" y="44" width="14" height="18" rx="7 7 1 1" fill="#1a0e06" opacity="0.6"/>`;
  }

  if (hasWeather) {
    svg += `
  <!-- Kurek pogodowy / złoty akcent (poz 4+) -->
  <circle cx="140" cy="14" r="5" fill="${col.detail}" opacity="0.9"/>
  <path d="M137 14 Q140 10 143 14" stroke="${col.detail}" stroke-width="1.5" fill="none"/>
  <!-- Latarnie -->
  <rect x="36" y="95" width="4" height="30" fill="${col.detail}" opacity="0.7"/>
  <circle cx="38" cy="93" r="4" fill="#f0e070" opacity="0.6"/>
  <rect x="240" y="95" width="4" height="30" fill="${col.detail}" opacity="0.7"/>
  <circle cx="242" cy="93" r="4" fill="#f0e070" opacity="0.6"/>`;
  }

  if (hasGarden) {
    svg += `
  <!-- Ogród (poz 5 — stadnina) -->
  <circle cx="18" cy="118" r="12" fill="#2a5a1a" opacity="0.8"/>
  <circle cx="262" cy="118" r="12" fill="#2a5a1a" opacity="0.8"/>
  <circle cx="12" cy="110" r="8" fill="#3a7a2a" opacity="0.7"/>
  <circle cx="268" cy="110" r="8" fill="#3a7a2a" opacity="0.7"/>
  <!-- Złote detale dachu -->
  <line x1="40" y1="62" x2="240" y2="62" stroke="${col.detail}" stroke-width="2" opacity="0.5"/>`;
  }

  // Numer poziomu i słupki HP
  svg += `
  <!-- Pasek poziomów na dole -->
  <g transform="translate(40,148)">`;
  for (let i=1; i<=5; i++) {
    let x = (i-1)*42;
    let filled = i<=level;
    svg += `<rect x="${x}" y="0" width="36" height="6" rx="3" fill="${filled?col.detail:"#1e2e1e"}"/>`;
    if (i<5) svg += `<rect x="${x+36}" y="2" width="6" height="2" fill="#111" opacity="0.5"/>`;
  }
  svg += `</g></svg>`;
  return svg;
}

function openStableUpgradeScreen() {
  document.getElementById("stableUpgradeOverlay")?.remove();
  let overlay = document.createElement("div");
  overlay.id  = "stableUpgradeOverlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;font-family:'Crimson Text',serif;overflow-y:auto;padding:20px";

  let lvl      = getStableLevel();
  let cur      = STABLE_LEVELS[lvl-1];
  let next     = STABLE_LEVELS[lvl]||null;
  let passives = getStablePassives();
  let globals  = getGlobalUpgrades();

  // Sprawdź czy mamy materiały na następny poziom
  let hasNextMats = next ? hasMaterials(next.materials) : false;
  let hasNextGold = next ? gold>=next.cost : false;

  function matRow(mats) {
    return Object.entries(mats).map(([name,qty])=>{
      let have = countMaterial(name);
      let ok   = have>=qty;
      let d    = BUILD_MATERIALS[name]||{icon:"📦"};
      return `<span style="font-size:11px;padding:2px 8px;border-radius:5px;background:${ok?"rgba(74,184,112,0.12)":"rgba(201,74,74,0.12)"};border:1px solid ${ok?"#4ab87044":"#c94a4a44"};color:${ok?"#4ab870":"#c94a4a"}">
        ${d.icon} ${name} ${have}/${qty}
      </span>`;
    }).join(" ");
  }

  overlay.innerHTML = `
    <div style="width:100%;max-width:680px;background:#0f1a0f;border-radius:16px;padding:24px;border:1px solid #1e3a1e;position:relative">
      <button onclick="document.getElementById('stableUpgradeOverlay').remove()" style="position:absolute;top:12px;right:12px;background:transparent;border:none;color:#4a5a4a;font-size:18px;cursor:pointer">✕</button>
      <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:#8aab84;margin-bottom:16px"><span style="display:inline-flex;width:14px;height:14px;vertical-align:middle">${UI_ICONS?.roof||""}</span> ROZBUDOWA STAJNI</div>

      <!-- Poziom -->
      <div style="background:#131f13;border:1px solid #c9a84c44;border-radius:12px;padding:16px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
          <div>
            <div style="font-family:'Cinzel',serif;font-size:16px;color:#c9a84c">${cur.icon} Poziom ${lvl} — max ${cur.horses} koni</div>
            <div style="font-size:12px;color:var(--text2);margin-top:3px">${cur.bonus}</div>
          </div>
          ${next ? `<div style="text-align:right">
            <button onclick="upgradeStable()" ${hasNextMats&&hasNextGold?"":"disabled"} style="
              border-color:${hasNextMats&&hasNextGold?"#c9a84c":"#333"};
              color:${hasNextMats&&hasNextGold?"#c9a84c":"#555"};
              background:${hasNextMats&&hasNextGold?"rgba(201,168,76,0.1)":"transparent"};
              font-family:'Cinzel',serif;font-size:11px;margin-bottom:6px;white-space:nowrap">
              Poz. ${lvl+1} · 💰${next.cost.toLocaleString()}
            </button>
            <div style="font-size:10px;color:var(--text2);margin-bottom:4px">Potrzebne materiały:</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end">${matRow(next.materials)}</div>
          </div>` : `<div style="color:#4ab870;font-size:13px;display:flex;align-items:center;gap:4px">${UI_ICONS?.check||""} Max poziom</div>`}
        </div>
        <!-- SVG stajni -->
        <div style="border-radius:10px;overflow:hidden;margin-top:8px;opacity:0.95">
          ${drawStableSVG(lvl)}
        </div>
      </div>

      <!-- Aktywne bonusy -->
      ${Object.keys(passives).length>0?`
        <div style="background:#131f13;border:1px solid #4ab87044;border-radius:10px;padding:10px 14px;margin-bottom:14px">
          <div style="font-size:10px;letter-spacing:2px;color:#4ab870;margin-bottom:6px">AKTYWNE BONUSY GLOBALNE</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${passives.drop_pct    ?`<span style="font-size:11px;background:#c9a84c18;border:1px solid #c9a84c44;border-radius:6px;padding:2px 10px;color:#c9a84c">✨ +${Math.round(passives.drop_pct*100)}% drop</span>`:""}
            ${passives.gold_pct    ?`<span style="font-size:11px;background:#c9a84c18;border:1px solid #c9a84c44;border-radius:6px;padding:2px 10px;color:#c9a84c">💰 +${Math.round(passives.gold_pct*100)}% złota</span>`:""}
            ${passives.injury_reduce?`<span style="font-size:11px;background:#4a7ec818;border:1px solid #4a7ec844;border-radius:6px;padding:2px 10px;color:#6ab0e0;display:inline-flex;align-items:center;gap:4px"><span style=\"display:inline-flex;width:12px;height:12px\">${UI_ICONS?.forge||""}</span> -${Math.round(passives.injury_reduce*100)}% kontuzji</span>`:""}
            ${passives.free_heal   ?`<span style="font-size:11px;background:#c94a4a18;border:1px solid #c94a4a44;border-radius:6px;padding:2px 10px;color:#e08080;display:inline-flex;align-items:center;gap:4px"><span style=\"display:inline-flex;width:12px;height:12px\">${UI_ICONS?.vet||""}</span> Darmowe leczenie</span>`:""}
            ${passives.hunger_regen?`<span style="font-size:11px;background:#4ab87018;border:1px solid #4ab87044;border-radius:6px;padding:2px 10px;color:#4ab870">🌾 +${Math.round(passives.hunger_regen*100)}% reg. głodu</span>`:""}
          </div>
        </div>` : ""}

      <!-- Zakładki ulepszeń -->
      <div style="display:flex;gap:6px;margin-bottom:12px">
        <button id="stUpgTabGlobal" class="market-tab-btn active" onclick="switchStableTab('global')">${UI_ICONS?.roof||""} Globalne</button>
        <button id="stUpgTabHorse"  class="market-tab-btn"        onclick="switchStableTab('horse')">🐴 Per koń</button>
        <button id="stUpgTabMats"   class="market-tab-btn"        onclick="switchStableTab('mats')">🪵 Materiały</button>
      </div>

      <!-- Globalne ulepszenia -->
      <div id="stUpgGlobalContent">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${STABLE_UPGRADES.filter(u=>u.type==="global").map(u=>{
            let owned   = globals.includes(u.id);
            let locked  = lvl < u.requires;
            let canMats = hasMaterials(u.materials);
            let canGold = gold >= u.cost;
            let canBuy  = !owned && !locked && canMats && canGold;
            let col     = owned?"#4ab870":locked?"#333":"#8aab84";
            return `<div style="background:#131f13;border:1px solid ${col}44;border-radius:10px;padding:12px;opacity:${locked?0.4:1}">
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
                <span style="display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center">${u.svgIcon&&typeof UI_ICONS!=="undefined"&&UI_ICONS[u.svgIcon]?UI_ICONS[u.svgIcon]:u.icon}</span>
                <div>
                  <div style="font-size:12px;color:${col};font-family:'Cinzel',serif">${u.name}</div>
                  <div style="font-size:10px;color:var(--text2)">${u.desc}</div>
                </div>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">${matRow(u.materials)}</div>
              ${owned?`<div style="font-size:11px;color:#4ab870;display:flex;align-items:center;gap:3px"><span style=\"display:inline-flex;width:12px;height:12px\">${UI_ICONS?.check||""}</span> Aktywne</div>`
              :locked?`<div style="font-size:11px;color:#555;display:flex;align-items:center;gap:3px"><span style=\"display:inline-flex;width:12px;height:12px\">${UI_ICONS?.lock||""}</span> Wymaga poz. ${u.requires}</div>`
              :`<button onclick="buyGlobalUpgrade('${u.id}')" ${canBuy?"":"disabled"} style="
                  width:100%;border-color:${canBuy?"#c9a84c":"#333"};color:${canBuy?"#c9a84c":"#555"};
                  background:${canBuy?"rgba(201,168,76,0.1)":"transparent"};font-size:11px">
                  💰 ${u.cost.toLocaleString()}
                </button>`}
            </div>`;
          }).join("")}
        </div>
      </div>

      <!-- Per koń ulepszenia -->
      <div id="stUpgHorseContent" style="display:none">
        <div style="font-size:12px;color:var(--text2);margin-bottom:10px">Wybierz ulepszenie, potem konia. Można dokupić wielokrotnie dla różnych koni.</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${STABLE_UPGRADES.filter(u=>u.type==="per_horse").map(u=>{
            let locked  = lvl < u.requires;
            let canMats = hasMaterials(u.materials);
            let canGold = gold >= u.cost;
            let canBuy  = !locked && canMats && canGold;
            let col     = locked?"#333":"#8aab84";
            return `<div style="background:#131f13;border:1px solid ${col}44;border-radius:10px;padding:12px;opacity:${locked?0.4:1}">
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">
                <span style="display:inline-flex;width:24px;height:24px;align-items:center;justify-content:center">${u.svgIcon&&typeof UI_ICONS!=="undefined"&&UI_ICONS[u.svgIcon]?UI_ICONS[u.svgIcon]:u.icon}</span>
                <div>
                  <div style="font-size:12px;color:${col};font-family:'Cinzel',serif">${u.name}</div>
                  <div style="font-size:10px;color:var(--text2)">${u.desc}</div>
                </div>
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:6px">${matRow(u.materials)}</div>
              ${locked?`<div style="font-size:11px;color:#555;display:flex;align-items:center;gap:3px"><span style=\"display:inline-flex;width:12px;height:12px\">${UI_ICONS?.lock||""}</span> Wymaga poz. ${u.requires}</div>`
              :`<button onclick="openHorseUpgradePicker('${u.id}')" ${canBuy?"":"disabled"} style="
                  width:100%;border-color:${canBuy?"#6ab0e0":"#333"};color:${canBuy?"#6ab0e0":"#555"};
                  background:${canBuy?"rgba(74,176,224,0.1)":"transparent"};font-size:11px">
                  🐴 Wybierz konia · 💰${u.cost.toLocaleString()}
                </button>`}
            </div>`;
          }).join("")}
        </div>
      </div>

      <!-- Materiały -->
      <div id="stUpgMatsContent" style="display:none">
        <div style="font-size:12px;color:var(--text2);margin-bottom:12px">Materiały budowlane — dropują na wyprawach lub można zdobyć w questach.</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
          ${Object.entries(BUILD_MATERIALS).map(([name,d])=>{
            let have = countMaterial(name);
            return `<div style="background:#131f13;border:1px solid ${have>0?"#c9a84c44":"#1e3a1e"};border-radius:10px;padding:12px;text-align:center">
              <div style="font-size:28px;margin-bottom:4px">${d.icon}</div>
              <div style="font-family:'Cinzel',serif;font-size:11px;color:${have>0?"#c9a84c":"#4a5a4a"}">${name}</div>
              <div style="font-size:18px;color:${have>0?"#d4e8d0":"#4a5a4a"};margin:4px 0">${have}</div>
              <div style="font-size:10px;color:var(--text2);line-height:1.3">${d.desc}</div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function switchStableTab(tab) {
  ["global","horse","mats"].forEach(t=>{
    let el = document.getElementById(`stUpg${t.charAt(0).toUpperCase()+t.slice(1)}Content`);
    let btn= document.getElementById(`stUpgTab${t.charAt(0).toUpperCase()+t.slice(1)}`);
    if(el)  el.style.display  = t===tab?"block":"none";
    if(btn) btn.classList.toggle("active", t===tab);
  });
}

function upgradeStable() {
  let lvl  = getStableLevel();
  let next = STABLE_LEVELS[lvl];
  if (!next) { log("✅ Stajnia na maksymalnym poziomie!"); return; }
  if (gold < next.cost) { log(`⚠️ Za mało złota! Potrzebujesz ${next.cost}💰`); return; }
  if (!hasMaterials(next.materials)) { log("⚠️ Brak materiałów budowlanych!"); return; }
  gold -= next.cost;
  consumeMaterials(next.materials);
  setStableLevel(lvl+1);
  saveGame(); renderAll();
  document.getElementById("stableUpgradeOverlay")?.remove();
  openStableUpgradeScreen();
  log(`🏠 Stajnia rozbudowana do poziomu ${lvl+1}! Limit: ${getStableLimit()} koni.`);
  if (typeof addNotification==="function") addNotification("level_up",
    `Stajnia — Poziom ${lvl+1}!`, `Nowy limit: ${getStableLimit()} koni`);
}

function buyGlobalUpgrade(id) {
  let u = STABLE_UPGRADES.find(x=>x.id===id&&x.type==="global");
  if (!u) return;
  if (gold<u.cost) { log("⚠️ Za mało złota!"); return; }
  if (!hasMaterials(u.materials)) { log("⚠️ Brak materiałów!"); return; }
  let ups = getGlobalUpgrades();
  if (ups.includes(id)) return;
  gold -= u.cost;
  consumeMaterials(u.materials);
  ups.push(id);
  localStorage.setItem("hh_stable_upgrades", JSON.stringify(ups));
  saveGame(); renderAll();
  document.getElementById("stableUpgradeOverlay")?.remove();
  openStableUpgradeScreen();
  log(`${u.icon} ${u.name} zakupiona!`);
}

function openHorseUpgradePicker(upgradeId) {
  let u = STABLE_UPGRADES.find(x=>x.id===upgradeId);
  if (!u || playerHorses.length===0) return;

  let modal = document.createElement("div");
  modal.id  = "horseUpgradePicker";
  modal.style.cssText = "position:fixed;inset:0;z-index:900;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center";
  modal.innerHTML = `
    <div style="background:#0f1a0f;border:1px solid #6ab0e044;border-radius:14px;padding:20px;width:340px;max-height:70vh;overflow-y:auto">
      <div style="font-family:'Cinzel',serif;font-size:12px;color:#6ab0e0;margin-bottom:4px">${u.icon} ${u.name}</div>
      <div style="font-size:11px;color:var(--text2);margin-bottom:14px">${u.desc}</div>
      <div id="horseUpgradePickerList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px"></div>
      <button onclick="document.getElementById('horseUpgradePicker').remove()" style="width:100%;border-color:#333;color:#666">Anuluj</button>
    </div>
  `;
  document.body.appendChild(modal);

  let list = document.getElementById("horseUpgradePickerList");
  playerHorses.forEach((h,i)=>{
    let rc    = RARITY_COLORS[h.rarity]||"#8aab84";
    let times = getHorseUpgrades(h.id).filter(x=>x===upgradeId).length;
    let div   = document.createElement("div");
    div.style.cssText = `display:flex;align-items:center;gap:10px;padding:10px;background:#131f13;border:1px solid ${rc}33;border-radius:8px;cursor:pointer`;
    div.innerHTML = `
      <span style="font-size:20px">${h.flag||"🐴"}</span>
      <div style="flex:1">
        <div style="font-size:12px;color:${rc}">${h.name}</div>
        <div style="font-size:10px;color:var(--text2)">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck}</div>
        ${times>0?`<div style="font-size:10px;color:#6ab0e0">Ulepszony ${times}×</div>`:""}
      </div>
      <div style="font-size:11px;color:#6ab0e0">+${u.val||u.stat}</div>
    `;
    div.onclick = ()=>{
      applyHorseUpgrade(i, upgradeId);
      document.getElementById("horseUpgradePicker").remove();
    };
    list.appendChild(div);
  });
}

function applyHorseUpgrade(horseIdx, upgradeId) {
  let u = STABLE_UPGRADES.find(x=>x.id===upgradeId);
  let h = playerHorses[horseIdx];
  if (!u||!h) return;
  if (gold<u.cost) { log("⚠️ Za mało złota!"); return; }
  if (!hasMaterials(u.materials)) { log("⚠️ Brak materiałów!"); return; }
  gold -= u.cost;
  consumeMaterials(u.materials);
  const cap = 200;
  if (u.stat==="all") {
    h.stats.speed    = Math.min(cap, h.stats.speed    + u.val);
    h.stats.strength = Math.min(cap, h.stats.strength + u.val);
    h.stats.stamina  = Math.min(cap, h.stats.stamina  + u.val);
    h.stats.luck     = Math.min(cap, h.stats.luck     + u.val);
  } else {
    h.stats[u.stat] = Math.min(cap, (h.stats[u.stat]||0) + u.val);
  }
  addHorseUpgrade(h.id, upgradeId);
  saveGame(); renderAll();
  log(`${u.icon} ${h.name} ulepszony! ${u.desc}`);
  document.getElementById("stableUpgradeOverlay")?.remove();
  openStableUpgradeScreen();
}

patchStableLimit();
