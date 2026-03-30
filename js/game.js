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
function renderAll() {
  renderLimitBar();
  // renderExpeditions jest w setInterval co 1s — nie przebudowuj co 5s
  renderHorses();
  renderInventory();
  renderShop();
  renderMarket();
  renderQuests();
  renderEncyclopedia();
  renderDropHistory();
  renderLevelBar();
  buildRanking();
  if (typeof renderFirebaseStatus === "function") renderFirebaseStatus();
  // Aktualizuj badge poziomu stajni
  let slb = document.getElementById("stableLevelBadge");
  if (slb && typeof getStableLevel==="function") slb.textContent = getStableLevel();
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
  ["expedition","stable","inventory","shop","crafting","market","quests","encyclopedia","drops","contests","tournaments","notifications"].forEach(sec => {
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
