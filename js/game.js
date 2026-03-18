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
        let s = Math.floor(t / 1000);
        div.innerText = `⏳ ${s}s`;
      }
    }

    expDiv.appendChild(div);
  });

  renderHorses();
}