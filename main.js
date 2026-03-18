document.addEventListener("DOMContentLoaded", () => {

  loadGame();

  if (playerHorses.length === 0) {
    playerHorses.push({
      name: "Startowy koń",
      stats: {
        speed: 50,
        strength: 50,
        stamina: 50
      }
    });
    saveGame();
  }

  renderLocations();
  render();

  setInterval(render, 1000);

});