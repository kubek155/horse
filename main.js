document.addEventListener("DOMContentLoaded",()=>{

  loadGame();

  if(playerHorses.length===0){
    playerHorses.push(generateHorse());
    saveGame();
  }

  renderLocations(); 
  render();

  setInterval(render,1000);

});