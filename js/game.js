// =====================
// STATE
// =====================
let playerHorses = [];
let expeditions  = [];
let inventory    = [];
let gold         = 0;

// =====================
// SAVE / LOAD
// =====================
function saveGame() {
  localStorage.setItem("hh_horses",      JSON.stringify(playerHorses));
  localStorage.setItem("hh_expeditions", JSON.stringify(expeditions));
  localStorage.setItem("hh_inventory",   JSON.stringify(inventory));
  localStorage.setItem("hh_gold",        gold);
}

function loadGame() {
  playerHorses = JSON.parse(localStorage.getItem("hh_horses"))      || [];
  expeditions  = JSON.parse(localStorage.getItem("hh_expeditions")) || [];
  inventory    = JSON.parse(localStorage.getItem("hh_inventory"))   || [];
  gold         = parseInt(localStorage.getItem("hh_gold"))          || 0;
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
  buildRanking();
  saveGame();
}

// =====================
// UI NAVIGATION
// =====================
function showSection(s) {
  ["expedition", "stable", "inventory", "shop"].forEach(sec => {
    document.getElementById(sec + "Section").style.display = "none";
    document.getElementById("menu-" + sec).classList.remove("active");
  });
  document.getElementById(s + "Section").style.display = "block";
  document.getElementById("menu-" + s).classList.add("active");
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
  logTimer = setTimeout(() => { el.style.display = "none"; }, 3000);
}
