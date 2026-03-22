document.addEventListener("DOMContentLoaded", () => {

  loadGame();

  // Daj startowego konia jeśli gracz nie ma żadnego
  if (playerHorses.length === 0) {
    playerHorses.push(generateHorse("common"));
    saveGame();
  }

  renderLocations();
  renderAll();

  // Główna pętla gry — co sekundę
  setInterval(() => {
    expeditions.forEach(e => {
      if (!e.done && Date.now() >= e.end) finishExpedition(e);
    });
    renderAll();
  }, 1000);

});
