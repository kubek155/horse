// =====================
// STATE
// =====================
let playerHorses = [];
let expeditions  = [];
let inventory    = [];
let gold         = 0;

// Eksportuj gold do window żeby firebase.js mógł go czytać/modyfikować
// Eksport zmiennych gry do window (dla firebase.js i innych modułów)
Object.defineProperty(window, 'gold', {
  get: () => gold,
  set: (v) => { gold = v; },
  configurable: true,
});
Object.defineProperty(window, 'playerHorses', {
  get: () => playerHorses,
  set: (v) => { playerHorses = v; },
  configurable: true,
});
Object.defineProperty(window, 'inventory', {
  get: () => inventory,
  set: (v) => { inventory = v; },
  configurable: true,
});
let market       = [];
let quests       = [];   // aktywne dzienne questy

const STABLE_LIMIT = 8;

// =====================
// SAVE / LOAD
// =====================
function saveGame() {
  localStorage.setItem("hh_horses",      JSON.stringify(playerHorses));
  localStorage.setItem("hh_expeditions", JSON.stringify(expeditions));
  localStorage.setItem("hh_inventory",   JSON.stringify(inventory));
  localStorage.setItem("hh_gold",        gold);
  localStorage.setItem("hh_market",      JSON.stringify(market));
  localStorage.setItem("hh_quests",      JSON.stringify(quests));
}

function loadGame() {
  playerHorses = JSON.parse(localStorage.getItem("hh_horses"))      || [];
  expeditions  = JSON.parse(localStorage.getItem("hh_expeditions")) || [];
  inventory    = JSON.parse(localStorage.getItem("hh_inventory"))   || [];
  gold         = parseInt(localStorage.getItem("hh_gold"))          || 0;
  market       = JSON.parse(localStorage.getItem("hh_market"))      || [];
  quests       = JSON.parse(localStorage.getItem("hh_quests"))      || [];

  if (market.length === 0) seedMarket();
  refreshDailyQuests();
}

// =====================
// RENDER ALL
// =====================

// ── Helper: sprawdź czy sekcja jest widoczna ──────────────
function _sectionVisible(id) {
  let el = document.getElementById(id + "Section");
  return el && el.style.display !== "none";
}

function renderAll() {
  // Renderuj tylko widoczne sekcje (oprócz zawsze potrzebnych)
  renderLimitBar();
  // renderExpeditions jest w setInterval co 1s — nie przebudowuj co 5s
  if (_sectionVisible("stable"))    renderHorses();
  if (_sectionVisible("inventory"))  renderInventory();
  if (_sectionVisible("shop"))       renderShop();
  if (_sectionVisible("market"))     renderMarket();
  if (_sectionVisible("quests"))     renderQuests();
  // Renderuj tylko jeśli sekcja jest widoczna
  let _visEnc = document.getElementById("encyclopediaSection");
  if (_visEnc && _visEnc.style.display !== "none") renderEncyclopedia();
  let _visDrop = document.getElementById("dropsSection");
  if (_visDrop && _visDrop.style.display !== "none") renderDropHistory();
  renderLevelBar();
  if (typeof renderFirebaseStatus === "function") renderFirebaseStatus();
  // Aktualizuj badge poziomu stajni
  let slb = document.getElementById("stableLevelBadge");
  if (slb && typeof getStableLevel==="function") slb.textContent = getStableLevel();
  // Przycisk admin — pokaż tylko dla admina
  if (typeof isAdmin==="function" && isAdmin()) {
    if (!document.getElementById("adminBtn")) {
      let ab = document.createElement("button");
      ab.id = "adminBtn";
      ab.style.cssText = "font-size:10px;padding:2px 8px;border-color:#c94a4a;color:#c94a4a;background:rgba(201,74,74,0.08);margin-left:6px;cursor:pointer";
      ab.textContent = "🔧 Admin";
      ab.onclick = openAdminPanel;
      let fs = document.getElementById("firebaseStatus");
      if (fs) fs.parentNode.insertBefore(ab, fs);
    }
  }
  // Specjalne wyprawy
  if (typeof renderSpecialExpeditions==="function") renderSpecialExpeditions();
  // Sprawdź osiągnięcia
  if (typeof checkAchievements==="function") checkAchievements();
  saveGame();
}

// =====================
// UI NAVIGATION
// =====================
function showSection(s) {
  ["expedition","stable","inventory","shop","crafting","market","quests","encyclopedia","drops","contests","tournaments","notifications","ranking","events","giveaway","guild"].forEach(sec => {
    document.getElementById(sec + "Section").style.display = "none";
    document.getElementById("menu-" + sec).classList.remove("active");
  });
  document.getElementById(s + "Section").style.display = "block";
  document.getElementById("menu-" + s).classList.add("active");
  if (s === "tournaments") {
    if (typeof renderTournamentsSection === "function") renderTournamentsSection();
  }
  if (s === "notifications") {
    if (typeof renderNotifications === "function") renderNotifications();
    markNotificationsRead();
  }
  if (s === "crafting" && typeof renderCraftingSection === "function") renderCraftingSection();
  if (s === "ranking" && typeof renderGlobalRanking === "function") renderGlobalRanking();
  if (s === "events" && typeof renderEventsSection === "function") renderEventsSection();
  if (s === "contests" && typeof renderContestsInline === "function") renderContestsInline();
  if (s === "giveaway" && typeof renderGiveawaySection === "function") renderGiveawaySection();
  if (s === "guild"    && typeof renderGuildSection    === "function") renderGuildSection();
  if (s === "market") {
    if (typeof switchMarketTab === "function") switchMarketTab("local");
    if (typeof renderFirebaseStatus === "function") renderFirebaseStatus();
  }
}

// =====================
// LOG
// =====================
let logTimer;
function log(t) {
  let el = document.getElementById("logBox");
  el.textContent = t;
  el.style.display = "block";
  clearTimeout(logTimer);
  logTimer = setTimeout(() => { el.style.display = "none"; }, 3500);
}

// =====================
// RESET WYPRAW (debug / test)
// =====================
function resetExpeditions() {
  expeditions = [];
  // Wyczyść wszystkie klucze dziennego limitu
  let keys = Object.keys(localStorage).filter(k => k.startsWith("d_"));
  keys.forEach(k => localStorage.removeItem(k));
  saveGame();
  renderAll();
  log("🔄 Wyprawy zresetowane! Limit dzienny wyczyszczony.");
}

function addDebugGold() {
  gold += 10000;
  saveGame();
  renderAll();
  log("💰 Dodano 10 000 złota!");
}

function addDebugLootbox() {
  for (let i = 0; i < 5; i++) {
    inventory.push({ name: "Skrzynka z Łupem", obtained: Date.now() });
  }
  saveGame();
  renderAll();
  log("📦 Dodano 5 Skrzynek z Łupem!");
}

function switchQuestTab(tab) {
  ["daily","weekly","ach"].forEach(t => {
    let content = document.getElementById(`questTab${t.charAt(0).toUpperCase()+t.slice(1)}Content`);
    let btn     = document.getElementById(`questTab${t.charAt(0).toUpperCase()+t.slice(1)}`);
    if (content) content.style.display = t===tab?"block":"none";
    if (btn) btn.classList.toggle("active", t===tab);
  });
  if (tab==="weekly" && typeof renderWeeklyQuests==="function") renderWeeklyQuests();
  if (tab==="ach" && typeof renderAchievements==="function") renderAchievements();
}

// Pomocnicza - SVG konia miniaturka (dla rynku itp.)
function renderHorseMiniSVG(h, size=52) {
  let svgStr = (typeof drawHorseSVG === "function")
    ? drawHorseSVG(h.breedKey||h.name, h.rarity, h.stars||0)
    : null;
  if (!svgStr) return `<span style="font-size:${size*0.6}px">${h.flag||"🐴"}</span>`;
  return `<div style="width:${size}px;height:${size}px;overflow:hidden;border-radius:6px">${svgStr.replace(/width="[^"]*"/, `width="${size}"`).replace(/height="[^"]*"/, `height="${size}"`)}</div>`;
}

// SVG ikona itemu (lub fallback emoji)
function renderItemIconSVG(name, size=36) {
  if (typeof ITEM_ICONS_SVG !== "undefined" && ITEM_ICONS_SVG[name]) {
    return `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center">${ITEM_ICONS_SVG[name]}</div>`;
  }
  let d = (typeof ITEMS_DATABASE !== "undefined" && ITEMS_DATABASE[name]) || { icon:"📦" };
  return `<span style="font-size:${size*0.7}px">${d.icon}</span>`;
}

function renderEventsSection() {
  let activeEl = document.getElementById("eventsActiveDiv");
  if (!activeEl) return;

  // Sprawdź event z Firebase
  if (window._activeEvent) {
    let ev = window._activeEvent;
    let msLeft = ev.endsAt - Date.now();
    let hLeft  = Math.floor(msLeft/3600000);
    let mLeft  = Math.floor((msLeft%3600000)/60000);
    activeEl.innerHTML = `
      <div style="background:rgba(201,168,76,0.08);border:1px solid #c9a84c55;border-radius:12px;padding:20px;display:flex;gap:16px;align-items:center">
        <div style="font-size:48px">${ev.icon||"🎪"}</div>
        <div style="flex:1">
          <div style="font-size:10px;letter-spacing:2px;color:#c9a84c;margin-bottom:4px">AKTYWNY EVENT</div>
          <div style="font-family:'Cinzel',serif;font-size:18px;color:#d4e8d0">${ev.name}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:4px">${ev.desc}</div>
          <div style="font-size:12px;color:#4ab870;margin-top:8px">Bonus: <strong>${ev.type.replace(/_/g," ")}</strong></div>
          <div style="font-size:11px;color:var(--text2);margin-top:4px">Kończy się za: <strong style="color:#c9a84c">${hLeft}h ${mLeft}min</strong></div>
        </div>
      </div>`;
  } else {
    activeEl.innerHTML = `<div style="padding:16px;background:var(--panel2);border:1px solid var(--border);border-radius:10px;font-size:13px;color:var(--text2)">Brak aktywnego eventu. Eventy ogłaszane są przez administrację.</div>`;
  }

  // Historia
  let histEl = document.getElementById("eventsHistoryDiv");
  if (!histEl) return;
  histEl.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:var(--text2);margin-bottom:10px">NADCHODZĄCE I PRZESZŁE</div>
    <div style="font-size:12px;color:var(--text2)">Obserwuj tę zakładkę i powiadomienia — admin ogłasza eventy z wyprzedzeniem.</div>`;

  // Załaduj z Firebase
  if (window.FB?.db) {
    checkActiveEvent().then(()=>{
      if (window._activeEvent) renderEventsSection();
    });
    checkBroadcasts();
  }
}
