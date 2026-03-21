let inventory=JSON.parse(localStorage.getItem("inventory"))||[];

function saveInventory(){
localStorage.setItem("inventory",JSON.stringify(inventory));
}

function addItem(name){
inventory.push({name});
saveInventory();
}

function useRejuvenation(){
let h=playerHorses[0];
let age=getHorseAgeDays(h);
let reduce=Math.min(100,Math.floor(age/3));
h.born+=reduce*86400000;
log("Odmłodzono "+reduce+" dni");
saveGame();
}