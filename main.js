document.addEventListener("DOMContentLoaded", () => {

  loadGame();

  // Startowy koń — konkretna rasa, nie losowy loot
  if (playerHorses.length === 0) {
    let starter = {
      id:           Date.now() + Math.random(),
      name:         "Zefir",
      group:        "common",
      rarity:       "common",
      stars:        0,
      born:         Date.now(),
      lastFed:      Date.now(),
      bonusApplied: null,
      isStarter:    true,
      stats: {
        speed:    38,
        strength: 32,
        stamina:  35,
        luck:     8
      }
    };
    playerHorses.push(starter);
    saveGame();
  }

  renderLocations();
  renderAll();

  setInterval(() => {
    expeditions.forEach(e => {
      if (!e.done && Date.now() >= e.end) finishExpedition(e);
    });
    renderAll();
  }, 1000);

});
