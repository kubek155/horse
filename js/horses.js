function generateStats() {
  return {
    speed: Math.floor(Math.random() * 100),
    strength: Math.floor(Math.random() * 100),
    stamina: Math.floor(Math.random() * 100)
  };
}

function generateType() {
  let types = ["speed", "power", "endurance"];
  return types[Math.floor(Math.random() * types.length)];
}

function generateRace() {
  let races = ["arab", "war", "wild"];
  return races[Math.floor(Math.random() * races.length)];
}

function renderHorses() {
  let container = document.getElementById("horses");
  container.innerHTML = "";

  playerHorses.forEach(h => {
    let div = document.createElement("div");

    div.innerHTML = `
      🐎 ${h.name}<br>
      Typ: ${h.type} | Rasa: ${h.race}<br>
      ⚡ ${h.stats.speed} 💪 ${h.stats.strength} 🎯 ${h.stats.stamina}
    `;

    container.appendChild(div);
  });
}