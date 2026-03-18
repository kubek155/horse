function generateStats() {
  return {
    speed: Math.floor(Math.random() * 100),
    strength: Math.floor(Math.random() * 100),
    stamina: Math.floor(Math.random() * 100)
  };
}

function renderHorses() {
  let container = document.getElementById("horses");
  container.innerHTML = "";

  playerHorses.forEach(h => {
    let div = document.createElement("div");
    div.className = "horse";

    let injured = "";

    if (h.injuredUntil && h.injuredUntil > Date.now()) {
      let s = Math.floor((h.injuredUntil - Date.now()) / 1000);
      injured = `💀 Kontuzja (${s}s)`;
    }

    div.innerHTML = `
      ${h.name}<br>
      ${h.rarity}<br>
      ⚡ ${h.stats.speed} 💪 ${h.stats.strength} 🎯 ${h.stats.stamina}<br>
      ${injured}
    `;

    container.appendChild(div);
  });

  document.getElementById("horseCount").innerText = playerHorses.length;
}