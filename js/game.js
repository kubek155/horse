let playerHorses = [];
let expeditions = [];

function loadUserData() {
  playerHorses = JSON.parse(localStorage.getItem(currentUser + "_horses")) || [];
  expeditions = JSON.parse(localStorage.getItem(currentUser + "_exp")) || [];
}

function saveGame() {
  localStorage.setItem(currentUser + "_horses", JSON.stringify(playerHorses));
  localStorage.setItem(currentUser + "_exp", JSON.stringify(expeditions));
}

function render() {
  expeditionsDiv.innerHTML = "";

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

    expeditionsDiv.appendChild(div);
  });

  renderHorses();
}