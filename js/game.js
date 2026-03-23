// =====================
// STATE
// =====================
let playerHorses = [];
let expeditions  = [];
let inventory    = [];
let gold         = 0;
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
  renderExpeditions();
  renderHorses();
  renderInventory();
  renderShop();
  renderMarket();
  renderQuests();
  renderEncyclopedia();
  renderDropHistory();
  renderLevelBar();
  buildRanking();
  saveGame();
}

// =====================
// UI NAVIGATION
// =====================
function showSection(s) {
  ["expedition","stable","inventory","shop","market","quests","encyclopedia","drops","contests","tournaments","global-market"].forEach(sec => {
    document.getElementById(sec + "Section").style.display = "none";
    document.getElementById("menu-" + sec).classList.remove("active");
  });
  document.getElementById(s + "Section").style.display = "block";
  document.getElementById("menu-" + s).classList.add("active");
  if (s === "tournaments" && typeof renderTournamentsSection === "function") renderTournamentsSection();
  if (s === "global-market" && typeof renderGlobalRanking === "function") renderGlobalRanking();
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
