document.addEventListener("DOMContentLoaded", () => {

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
  renderAll();

  setInterval(() => {
    expeditions.forEach(e => {
      if (!e.done && Date.now() >= e.end) finishExpedition(e);
    });
    renderAll();
  }, 1000);

});
