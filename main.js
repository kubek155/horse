// main.js — startuje grę natychmiast, Firebase dołącza się asynchronicznie

document.addEventListener("DOMContentLoaded", () => {

  // 1. Start gry lokalnie — natychmiast
  loadGame();

  if (playerHorses.length === 0 && !localStorage.getItem("hh_starter_given")) {
    // Daj starter loot box z gwarantowanym koniem
    inventory.push({ name:"Skrzynka Startowa", obtained:Date.now(), isStarter:true });
    localStorage.setItem("hh_starter_given","1");
    saveGame();
    // Pokaż powiadomienie po chwili
    setTimeout(()=>{
      log("🎁 Witaj w Happy Horses! Otwórz Skrzynkę Startową z Ekwipunku!");
    }, 1500);
  }

  renderLocations();
  renderEncyclopedia();
  renderLevelBar();
  renderAll();

  // 2. Główna pętla gry — co sekundę
  setInterval(() => {
    expeditions.forEach(e => {
      if (!e.done && Date.now() >= e.end) {
        if (e.isSpecial && typeof finishSpecialExpedition==="function") finishSpecialExpedition(e);
        else finishExpedition(e);
      }
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
