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

    div.innerHTML = `
      🐎 ${h.name}<br>
      ⚡ ${h.stats.speed} 💪 ${h.stats.strength} 🎯 ${h.stats.stamina}
    `;

    container.appendChild(div);
  });

  document.getElementById("horseCount").innerText = playerHorses.length;
}