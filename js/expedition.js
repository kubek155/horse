function getRandomRarity() {
  let r = Math.random() * 100;
  if (r < 60) return "Pospolity";
  if (r < 85) return "Rzadki";
  if (r < 95) return "Epicki";
  if (r < 99) return "Legendarny";
  return "Pradawny";
}

function startExpedition() {
  let key = currentUser + "_daily";
  let count = parseInt(localStorage.getItem(key)) || 0;

  if (count >= 4) {
    log.innerText = "Limit!";
    return;
  }

  expeditions.push({
    end: Date.now() + 6 * 60 * 60 * 1000,
    done: false
  });

  localStorage.setItem(key, count + 1);
  saveGame();
}

function finishExpedition(e) {
  let horse = {
    name: "Koń " + (horses.length + 1),
    rarity: getRandomRarity(),
    stats: generateStats()
  };

  horses.push(horse);
  e.done = true;
  saveGame();
}