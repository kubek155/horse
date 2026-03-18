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

  expeditions.forEach(e => {
    let div = document.createElement("div");

    if (!e.done) {
      let t = e.end - Date.now();

      if (t <= 0) {
        finishExpedition(e);
      } else {
        let s = Math.floor(t / 1000);
        div.innerText = `${e.location.name} ⏳ ${s}s`;
      }
    }

    expDiv.appendChild(div);
  });

  renderHorses();
}