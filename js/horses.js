function generateStats() {
  return {
    speed: Math.floor(Math.random() * 100),
    strength: Math.floor(Math.random() * 100),
    stamina: Math.floor(Math.random() * 100)
  };
}

function renderHorses() {
  horses.innerHTML = "";

  playerHorses.forEach(h => {
    let d = document.createElement("div");
    d.className = "horse";

    d.innerHTML = `
      ${h.name}<br>
      ${h.rarity}<br>
      ⚡ ${h.stats.speed} 💪 ${h.stats.strength} 🎯 ${h.stats.stamina}
    `;

    horses.appendChild(d);
  });
}