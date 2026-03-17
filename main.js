if (localStorage.getItem("currentUser")) {
  startGame();
}
setInterval(render, 1000);