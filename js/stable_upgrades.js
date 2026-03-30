// =====================
// ROZBUDOWA STAJNI
// =====================

const STABLE_LEVELS = [
  { level:1, horses:8,  cost:0,     bonus:"Startowa stajnia",               icon:"🏠", passives:[] },
  { level:2, horses:10, cost:2000,  bonus:"Pastwisko (+10% szczęścia)",      icon:"🌿", passives:[{type:"luck_pct", val:0.10}] },
  { level:3, horses:12, cost:8000,  bonus:"Kuźnia (-20% kontuzji)",          icon:"⚒️", passives:[{type:"injury_reduce", val:0.20}] },
  { level:4, horses:15, cost:25000, bonus:"Siłownia (+5% statów)",           icon:"💪", passives:[{type:"stats_pct", val:0.05}] },
  { level:5, horses:18, cost:80000, bonus:"Gabinet wet (leczenie 1×dzień)",  icon:"🩺", passives:[{type:"free_heal", val:1}] },
];

const STABLE_UPGRADES = [
  { id:"pasture",   name:"Pastwisko",        icon:"🌿", desc:"+10% szczęścia wszystkich koni",        cost:1500,  bonus:{type:"luck_pct",    val:0.10}, requires:2 },
  { id:"forge",     name:"Kuźnia",           icon:"⚒️", desc:"-20% szans na kontuzję",               cost:3000,  bonus:{type:"injury_reduce",val:0.20}, requires:2 },
  { id:"gym",       name:"Siłownia",         icon:"💪", desc:"+5% do wszystkich statów koni",         cost:10000, bonus:{type:"stats_pct",   val:0.05}, requires:3 },
  { id:"vet",       name:"Gabinet vet",      icon:"🩺", desc:"Leczenie 1 konia dziennie za darmo",    cost:5000,  bonus:{type:"free_heal",   val:1},    requires:3 },
  { id:"fountain",  name:"Fontanna Szczęścia",icon:"⛲",desc:"+5% do drop rate na wyprawach",         cost:15000, bonus:{type:"drop_pct",    val:0.05}, requires:4 },
  { id:"treadmill", name:"Bieżnia",          icon:"🏃", desc:"+10% złota z wypraw",                  cost:12000, bonus:{type:"gold_pct",    val:0.10}, requires:4 },
];

function getStableLevel()    { return parseInt(localStorage.getItem("hh_stable_level"))   || 1; }
function setStableLevel(lvl) { localStorage.setItem("hh_stable_level", lvl); }
function getStableUpgrades() { try { return JSON.parse(localStorage.getItem("hh_stable_upgrades")||"[]"); } catch(e) { return []; } }
function hasUpgrade(id)      { return getStableUpgrades().includes(id); }

// Dynamiczny STABLE_LIMIT na podstawie poziomu stajni
function getStableLimit() {
  return STABLE_LEVELS[Math.min(getStableLevel()-1, STABLE_LEVELS.length-1)].horses;
}

// Bonusy pasywne stajni (zebrane z poziomu + ulepszeń)
function getStablePassives() {
  let passives = {};
  let upgrades = getStableUpgrades();
  STABLE_UPGRADES.forEach(u => {
    if (upgrades.includes(u.id)) {
      passives[u.bonus.type] = (passives[u.bonus.type]||0) + u.bonus.val;
    }
  });
  return passives;
}

// Zastąp globalny STABLE_LIMIT
function patchStableLimit() {
  Object.defineProperty(window, 'STABLE_LIMIT', {
    get: () => getStableLimit(),
    configurable: true,
  });
}

// Zastosuj pasywne bonusy koni
function applyStablePassives(horse) {
  let p = getStablePassives();
  let h = JSON.parse(JSON.stringify(horse));
  if (p.luck_pct)  h.stats.luck     = Math.min(200, Math.round(h.stats.luck    * (1+p.luck_pct)));
  if (p.stats_pct) {
    h.stats.speed    = Math.min(200, Math.round(h.stats.speed    * (1+p.stats_pct)));
    h.stats.strength = Math.min(200, Math.round(h.stats.strength * (1+p.stats_pct)));
    h.stats.stamina  = Math.min(200, Math.round(h.stats.stamina  * (1+p.stats_pct)));
    h.stats.luck     = Math.min(200, Math.round(h.stats.luck     * (1+p.stats_pct)));
  }
  return h;
}

// Darmowe leczenie (vet)
function hasFreeHealToday() {
  let day = new Date().toDateString();
  return localStorage.getItem("hh_free_heal_day") === day;
}
function useFreeHeal() {
  localStorage.setItem("hh_free_heal_day", new Date().toDateString());
}

// ── EKRAN ROZBUDOWY ──────────────────────────────────────
function openStableUpgradeScreen() {
  let ex = document.getElementById("stableUpgradeOverlay");
  if (ex) ex.remove();

  let overlay = document.createElement("div");
  overlay.id  = "stableUpgradeOverlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;font-family:'Crimson Text',serif;overflow-y:auto;padding:20px";

  let lvl    = getStableLevel();
  let cur    = STABLE_LEVELS[lvl-1];
  let next   = STABLE_LEVELS[lvl] || null;
  let upgrades = getStableUpgrades();
  let passives = getStablePassives();

  overlay.innerHTML = `
    <div style="width:100%;max-width:660px;background:#0f1a0f;border-radius:16px;padding:24px;border:1px solid #1e3a1e;position:relative">
      <button onclick="document.getElementById('stableUpgradeOverlay').remove()" style="position:absolute;top:12px;right:12px;background:transparent;border:none;color:#4a5a4a;font-size:18px;cursor:pointer">✕</button>

      <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:#8aab84;margin-bottom:16px">🏠 ROZBUDOWA STAJNI</div>

      <!-- Aktualny poziom -->
      <div style="background:#131f13;border:1px solid #c9a84c44;border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div>
            <div style="font-family:'Cinzel',serif;font-size:16px;color:#c9a84c">${cur.icon} Poziom ${lvl} — ${cur.horses} koni</div>
            <div style="font-size:12px;color:var(--text2);margin-top:3px">${cur.bonus}</div>
          </div>
          ${next ? `<button onclick="upgradeStable()" style="border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);font-family:'Cinzel',serif">
            ⬆️ Poziom ${lvl+1} · 💰${next.cost.toLocaleString()}
          </button>` : `<div style="font-size:12px;color:#4ab870">✅ Maksymalny poziom</div>`}
        </div>
        <!-- Pasek poziomów -->
        <div style="display:flex;gap:6px">
          ${STABLE_LEVELS.map((l,i) => `
            <div style="flex:1;text-align:center">
              <div style="height:4px;border-radius:2px;background:${i<lvl?"#c9a84c":"#1e3a1e"};margin-bottom:4px"></div>
              <div style="font-size:9px;color:${i<lvl?"#c9a84c":"#4a5a4a"}">${l.icon}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Aktywne bonusy -->
      ${Object.keys(passives).length > 0 ? `
        <div style="background:#131f13;border:1px solid #4ab87044;border-radius:10px;padding:12px;margin-bottom:16px">
          <div style="font-size:10px;letter-spacing:2px;color:#4ab870;margin-bottom:8px">AKTYWNE BONUSY</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${passives.luck_pct    ? `<span style="background:#c9a84c22;border:1px solid #c9a84c44;border-radius:6px;padding:3px 10px;font-size:11px;color:#c9a84c">🍀 +${Math.round(passives.luck_pct*100)}% szczęścia</span>` : ""}
            ${passives.injury_reduce?`<span style="background:#4a7ec822;border:1px solid #4a7ec844;border-radius:6px;padding:3px 10px;font-size:11px;color:#6ab0e0">⚒️ -${Math.round(passives.injury_reduce*100)}% kontuzji</span>` : ""}
            ${passives.stats_pct   ? `<span style="background:#7b5ea722;border:1px solid #7b5ea744;border-radius:6px;padding:3px 10px;font-size:11px;color:#b090e0">💪 +${Math.round(passives.stats_pct*100)}% statów</span>` : ""}
            ${passives.drop_pct    ? `<span style="background:#4ab87022;border:1px solid #4ab87044;border-radius:6px;padding:3px 10px;font-size:11px;color:#4ab870">✨ +${Math.round(passives.drop_pct*100)}% drop rate</span>` : ""}
            ${passives.gold_pct    ? `<span style="background:#c9a84c22;border:1px solid #c9a84c44;border-radius:6px;padding:3px 10px;font-size:11px;color:#c9a84c">💰 +${Math.round(passives.gold_pct*100)}% złota</span>` : ""}
            ${passives.free_heal   ? `<span style="background:#c94a4a22;border:1px solid #c94a4a44;border-radius:6px;padding:3px 10px;font-size:11px;color:#e08080">🩺 Darmowe leczenie</span>` : ""}
          </div>
        </div>
      ` : ""}

      <!-- Ulepszenia -->
      <div style="font-size:10px;letter-spacing:2px;color:#8aab84;margin-bottom:10px">ULEPSZENIA STAJNI</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${STABLE_UPGRADES.map(u => {
          let owned   = upgrades.includes(u.id);
          let canBuy  = !owned && lvl >= u.requires && gold >= u.cost;
          let locked  = lvl < u.requires;
          let color   = owned ? "#4ab870" : locked ? "#333" : "#8aab84";
          return `<div style="background:#131f13;border:1px solid ${color}44;border-radius:10px;padding:12px;opacity:${locked?0.45:1}">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="font-size:20px">${u.icon}</span>
              <div>
                <div style="font-size:12px;color:${color};font-family:'Cinzel',serif">${u.name}</div>
                <div style="font-size:10px;color:var(--text2)">${u.desc}</div>
              </div>
            </div>
            ${owned
              ? `<div style="font-size:11px;color:#4ab870">✅ Zakupione</div>`
              : locked
              ? `<div style="font-size:11px;color:#555">🔒 Wymaga poz. ${u.requires} stajni</div>`
              : `<button onclick="buyStableUpgrade('${u.id}')" ${canBuy?"":"disabled"} style="
                  width:100%;border-color:${canBuy?"#c9a84c":"#333"};
                  color:${canBuy?"#c9a84c":"#555"};
                  background:${canBuy?"rgba(201,168,76,0.1)":"transparent"};
                  font-size:11px;cursor:${canBuy?"pointer":"not-allowed"}">
                  💰 ${u.cost.toLocaleString()}
                </button>`}
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function upgradeStable() {
  let lvl  = getStableLevel();
  let next = STABLE_LEVELS[lvl];
  if (!next) { log("✅ Stajnia na maksymalnym poziomie!"); return; }
  if (gold < next.cost) { log(`⚠️ Za mało złota! Potrzebujesz ${next.cost}💰`); return; }
  gold -= next.cost;
  setStableLevel(lvl+1);
  saveGame(); renderAll();
  document.getElementById("stableUpgradeOverlay")?.remove();
  openStableUpgradeScreen();
  log(`🏠 Stajnia rozbudowana do poziomu ${lvl+1}! Limit: ${getStableLimit()} koni.`);
  if (typeof addNotification==="function") addNotification("level_up",
    `Stajnia — Poziom ${lvl+1}!`, `Nowy limit: ${getStableLimit()} koni · ${STABLE_LEVELS[lvl].bonus}`);
}

function buyStableUpgrade(id) {
  let u = STABLE_UPGRADES.find(x=>x.id===id);
  if (!u) return;
  if (gold < u.cost) { log("⚠️ Za mało złota!"); return; }
  let upgrades = getStableUpgrades();
  if (upgrades.includes(id)) return;
  gold -= u.cost;
  upgrades.push(id);
  localStorage.setItem("hh_stable_upgrades", JSON.stringify(upgrades));
  saveGame(); renderAll();
  document.getElementById("stableUpgradeOverlay")?.remove();
  openStableUpgradeScreen();
  log(`${u.icon} ${u.name} zakupiona! ${u.desc}`);
}

// Inicjalizacja — podmień STABLE_LIMIT na dynamiczny
patchStableLimit();
