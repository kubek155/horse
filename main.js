// main.js — startuje grę natychmiast, Firebase dołącza się asynchronicznie

document.addEventListener("DOMContentLoaded", () => {

  // 1. Start gry lokalnie — natychmiast
  loadGame();

  if (playerHorses.length === 0) {
    playerHorses.push({
      id: Date.now(), name:"Zefir", breedKey:"Konik Polski",
      flag:"🇵🇱", country:"Polska", type:"Prymitywny",
      bloodline:"coldblood", group:"common", rarity:"common",
      stars:0, born:Date.now(), lastFed:Date.now(),
      bonusApplied:null, isStarter:true, gender:"male",
      stats:{ speed:38, strength:32, stamina:35, luck:8 }
    });
    saveGame();
  }

  renderLocations();
  renderEncyclopedia();
  renderLevelBar();
  renderAll();

  // 2. Główna pętla gry — co sekundę
  setInterval(() => {
    expeditions.forEach(e => {
      if (!e.done && Date.now() >= e.end) finishExpedition(e);
    });
    if (typeof checkPregnancies === "function") checkPregnancies();
    // Aktualizuj tylko aktywne wyprawy (nie pełny renderAll — za wolne)
    renderExpeditions();
    renderLimitBar();
  }, 1000);

  // 3. Pełny renderAll co 5s (złoto, stajnia, inne)
  setInterval(() => {
    renderAll();
  }, 5000);

  // 4. Pokaż ekran logowania gdy Firebase gotowy
  // firebase.js ładuje się asynchronicznie i sam obsługuje logowanie
  // przez onAuthStateChanged → showMandatoryLogin
});
