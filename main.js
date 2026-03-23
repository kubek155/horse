// Czekaj na Firebase zanim odpalasz grę
function waitForFirebase(callback) {
  if (window.FB) { callback(); return; }
  let tries = 0;
  let interval = setInterval(() => {
    tries++;
    if (window.FB) { clearInterval(interval); callback(); }
    else if (tries > 50) { // 5s timeout — odpal bez Firebase
      clearInterval(interval);
      console.warn("Firebase timeout — uruchamiam grę bez online");
      callback();
    }
  }, 100);
}

document.addEventListener("DOMContentLoaded", () => {
  waitForFirebase(initGame);
});

function initGame() {

  loadGame();

  if (playerHorses.length === 0) {
    playerHorses.push({
      id:           Date.now(),
      name:         "Zefir",
      breedKey:     "Konik Polski",
      flag:         "🇵🇱",
      country:      "Polska",
      type:         "Prymitywny",
      bloodline:    "coldblood",
      group:        "common",
      rarity:       "common",
      stars:        0,
      born:         Date.now(),
      lastFed:      Date.now(),
      bonusApplied: null,
      isStarter:    true,
      gender:       "male",
      stats:        { speed:38, strength:32, stamina:35, luck:8 }
    });
    saveGame();
  }

  renderLocations();
  renderEncyclopedia();
  renderLevelBar();
  renderAll();

  setInterval(() => {
    expeditions.forEach(e => {
      if (!e.done && Date.now() >= e.end) finishExpedition(e);
    });
    if (typeof checkPregnancies === "function") checkPregnancies();
    renderAll();
  }, 1000);

}