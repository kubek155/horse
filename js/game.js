let horses = [];
let expeditions = [];

function loadUserData() {
  horses = JSON.parse(localStorage.getItem(currentUser + "_horses")) || [];
  expeditions = JSON.parse(localStorage.getItem(currentUser + "_exp")) || [];
}

function saveGame() {
  localStorage.setItem(currentUser + "_horses", JSON.stringify(horses));
  localStorage.setItem(currentUser + "_exp", JSON.stringify(expeditions));
}

function render() {
  expeditionsDiv.innerHTML = "";

  expeditions.forEach(e => {
    if (!e.done) {
      let t = e.end - Date.now();

      if (t <= 0) {
        finishExpedition(e);
      } else {
        let d = document.createElement("div");
        d.className = "expedition";
        d.innerText = Math.floor(t / 60000) + " min";
        expeditionsDiv.appendChild(d);
      }
    }
  });

  renderHorses();
}