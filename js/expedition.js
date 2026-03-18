let DAILY_LIMIT = 4;

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

function startExpedition() {
  if (playerHorses.length === 0) {
    document.getElementById("log").innerText = "❌ Nie masz konia!";
    return;
  }

  if (getDailyCount() >= DAILY_LIMIT) {
    document.getElementById("log").innerText = "❌ Limit wypraw na dziś!";
    return;
  }

  let horse = playerHorses[0]; // na razie pierwszy koń

  if (horse.injuredUntil && horse.injuredUntil > Date.now()) {
    document.getElementById("log").innerText = "❌ Koń jest kontuzjowany!";
    return;
  }

  expeditions.push({
    end: Date.now() + 60000, // 1 min test
    horse: horse,
    done: false
  });

  addDailyCount();
  saveGame();
}

function finishExpedition(e) {
  let horse = e.horse;

  // 🔥 SZANSA NA KONTUZJĘ
  let injuryChance = Math.random() * 100;

  if (injuryChance < 3) {
    let time = 2 * 60 * 1000; // 2 minuty test
    horse.injuredUntil = Date.now() + time;

    document.getElementById("log").innerText =
      "💀 Koń został ranny!";
  } else {
    // 🎁 SZANSA NA LEPSZY LOOT
    let bonus = horse.stats.speed + horse.stats.strength;
    let roll = Math.random() * 100 + bonus / 10;

    let rarity = "Pospolity";

    if (roll > 120) rarity = "Legendarny";
    else if (roll > 100) rarity = "Epicki";
    else if (roll > 80) rarity = "Rzadki";

    let newHorse = {
      name: "Koń " + (playerHorses.length + 1),
      rarity: rarity,
      stats: generateStats()
    };

    playerHorses.push(newHorse);

    document.getElementById("log").innerText =
      "🎉 Zdobyto konia: " + rarity;
  }

  e.done = true;
  saveGame();
}