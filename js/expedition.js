const LOCATIONS = [
  { name: "🌲 Las" },
  { name: "🏜️ Pustynia" },
  { name: "⛰️ Góry" },
  { name: "🌊 Wybrzeże" },
  { name: "🌋 Wulkan" },
  { name: "❄️ Tundra" },
  { name: "🌌 Cienie" },
  { name: "🏰 Ruiny" },
  { name: "🌿 Dżungla" },
  { name: "✨ Dolina" }
];

function renderLocations() {
  let container = document.getElementById("locations");
  container.innerHTML = "";

  LOCATIONS.forEach((loc, index) => {
    let btn = document.createElement("button");
    btn.innerText = loc.name;
    btn.onclick = () => startExpedition(index);

    container.appendChild(btn);
  });
}

function startExpedition(index) {
  if (playerHorses.length === 0) {
    log("❌ Nie masz konia!");
    return;
  }

  expeditions.push({
    end: Date.now() + 60000,
    location: LOCATIONS[index],
    done: false
  });

  saveGame();
}

function finishExpedition(e) {
  let newHorse = {
    name: "Koń " + (playerHorses.length + 1),
    stats: generateStats()
  };

  playerHorses.push(newHorse);

  log("🎉 Zdobyto nowego konia!");
  e.done = true;
  saveGame();
}

function log(text) {
  document.getElementById("log").innerText = text;
}