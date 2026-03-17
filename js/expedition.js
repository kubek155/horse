function getRandomRarity() {
  let r = Math.random() * 100;
  if (r < 60) return "Pospolity";
  if (r < 85) return "Rzadki";
  if (r < 95) return "Epicki";
  if (r < 99) return "Legendarny";
  return "Pradawny";
}

function startExpedition() {
  expeditions.push({
    end: Date.now() + 60000, // 1 minuta TESTOWO (zmień potem na 6h)
    done: false
  });

  saveGame();
}

function finishExpedition(e) {
  let horse = {
    name: "Koń " + (playerHorses.length + 1),
    rarity: getRandomRarity(),
    stats: generateStats()
  };

  playerHorses.push(horse);
  e.done = true;
  saveGame();
}