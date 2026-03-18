const LOCATIONS = [
  { name: "🌲 Las", stat: "speed", min: 30 },
  { name: "🏜️ Pustynia", stat: "stamina", min: 40 },
  { name: "⛰️ Góry", stat: "strength", min: 50 },
  { name: "🌊 Wybrzeże", stat: "speed", min: 20 },
  { name: "🌋 Wulkan", stat: "strength", min: 70 },
  { name: "❄️ Tundra", stat: "stamina", min: 60 },
  { name: "🌌 Kraina Cieni", stat: "speed", min: 80 },
  { name: "🏰 Ruiny", stat: "strength", min: 40 },
  { name: "🌿 Dżungla", stat: "stamina", min: 30 },
  { name: "✨ Magiczna Dolina", stat: "speed", min: 90 }
];

function startExpedition(locationIndex = 0) {
  if (playerHorses.length === 0) {
    log("❌ Brak konia");
    return;
  }

  let horse = playerHorses[0];
  let loc = LOCATIONS[locationIndex];

  let statValue = horse.stats[loc.stat];

  if (statValue < loc.min) {
    log("❌ Koń za słaby na tę krainę!");
    return;
  }

  if (horse.injuredUntil && horse.injuredUntil > Date.now()) {
    log("❌ Koń kontuzjowany!");
    return;
  }

  expeditions.push({
    end: Date.now() + 60000,
    horse: horse,
    location: loc,
    done: false
  });

  saveGame();
}

function finishExpedition(e) {
  let horse = e.horse;
  let loc = e.location;

  let stat = horse.stats[loc.stat];

  let roll = Math.random() * 100 + stat / 2;

  let reward = "nic";

  if (roll > 120) reward = "legendarny item";
  else if (roll > 90) reward = "rzadki item";
  else if (roll > 60) reward = "zwykły item";

  if (Math.random() < 0.03) {
    horse.injuredUntil = Date.now() + 120000;
    log("💀 Kontuzja w " + loc.name);
  } else {
    log("🎁 Zdobyto: " + reward + " (" + loc.name + ")");
  }

  e.done = true;
  saveGame();
}

function log(text) {
  document.getElementById("log").innerText = text;
}