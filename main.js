// main.js — startuje grę natychmiast, Firebase dołącza się asynchronicznie


// ── Ripple animacja na wszystkich przyciskach ──────────────
document.addEventListener("click", (e) => {
  let btn = e.target.closest("button");
  if (!btn) return;
  let ripple = document.createElement("span");
  ripple.className = "btn-ripple";
  let rect = btn.getBoundingClientRect();
  let size = Math.max(rect.width, rect.height);
  ripple.style.width  = ripple.style.height = size + "px";
  ripple.style.left   = (e.clientX - rect.left  - size/2) + "px";
  ripple.style.top    = (e.clientY - rect.top   - size/2) + "px";
  btn.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}, true);

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
    // Automatyczne karmienie (stajnia poz.2+)
    if (typeof autoFeedHorses === "function") autoFeedHorses();
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
