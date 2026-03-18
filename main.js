loadGame();

// 🔥 STARTOWY KOŃ
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
setInterval(render, 1000);