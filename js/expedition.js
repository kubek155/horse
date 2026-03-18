const LOCATIONS = [
  { name: "🌲 Las" },
  { name: "🏜️ Pustynia" },
  { name: "⛰️ Góry" },
  { name: "🌊 Wybrzeże" },
  { name: "🌋 Wulkan" }
];

const EXPEDITION_TIME = 6 * 60 * 60 * 1000; // 6 godzin
const DAILY_LIMIT = 4;

function getTodayKey() {
  let d = new Date();
  return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
}

function getDailyCount() {
  return parseInt(localStorage.getItem("daily_" + getTodayKey())) || 0;
}

function addDailyCount() {
  localStorage.setItem("daily_" + getTodayKey(), getDailyCount() + 1);
}

function renderLocations() {
  let container = document.getElementById("locations");
  if (!container) return;

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

  if (getDailyCount() >= DAILY_LIMIT) {
    log("❌ Wykorzystałeś limit wypraw na dziś!");
    return;
  }

  expeditions.push({
    end: Date.now() + EXPEDITION_TIME,
    location: LOCATIONS[index],
    done: false
  });

  addDailyCount();
  saveGame();
}

function finishExpedition(e) {

  // 🎲 LOSOWY DROP
  let roll = Math.random() * 100;

  if (roll < 20) {
    // 🐎 tylko 20% szans na konia
    let newHorse = {
      name: "Koń " + (playerHorses.length + 1),
      stats: generateStats()
    };

    playerHorses.push(newHorse);
    log("🐎 Zdobyto nowego konia!");
  } else if (roll < 70) {
    log("🎁 Znaleziono przedmiot!");
  } else {
    log("😐 Nic nie znaleziono...");
  }

  e.done = true;
  saveGame();
}

function log(text) {
  let logDiv = document.getElementById("log");
  if (logDiv) logDiv.innerText = text;
}