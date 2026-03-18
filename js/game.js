let playerHorses = [];
let expeditions = [];

function loadGame() {
  playerHorses = JSON.parse(localStorage.getItem("horses")) || [];
  expeditions = JSON.parse(localStorage.getItem("expeditions")) || [];
}

function saveGame() {
  localStorage.setItem("horses", JSON.stringify(playerHorses));
  localStorage.setItem("expeditions", JSON.stringify(expeditions));
}

function render() {
  let expDiv = document.getElementById("expeditions");
  expDiv.innerHTML = "";

  // 🔥 LIMIT INFO
  let remaining = 4 - getDailyCount();
  let info = document.createElement("div");
  info.innerText = `Pozostało wypraw dziś: ${remaining}`;
  expDiv.appendChild(info);

  expeditions.forEach(e => {
    let div = document.createElement("div");
    div.className = "expedition";

    if (!e.done) {
      let t = e.end - Date.now();

      if (t <= 0) {
        finishExpedition(e);
      } else {
        let h = Math.floor(t / 3600000);
        let m = Math.floor((t % 3600000) / 60000);
        let s = Math.floor((t % 60000) / 1000);

        div.innerText = `${e.location.name} ⏳ ${h}h ${m}m ${s}s`;
      }
    }

    expDiv.appendChild(div);
  });

  renderHorses();
}