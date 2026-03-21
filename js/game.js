let playerHorses=[];
let expeditions=[];

function loadGame(){
playerHorses=JSON.parse(localStorage.getItem("horses"))||[];
expeditions=JSON.parse(localStorage.getItem("expeditions"))||[];
}

function saveGame(){
localStorage.setItem("horses",JSON.stringify(playerHorses));
localStorage.setItem("expeditions",JSON.stringify(expeditions));
}

function render(){
expeditionsDiv.innerHTML="";

let info=document.createElement("div");
info.innerText="Pozostało: "+(4-getDailyCount());
expeditionsDiv.appendChild(info);

expeditions.forEach(e=>{
let d=document.createElement("div");

if(!e.done){
let t=e.end-Date.now();
if(t<=0)finishExpedition(e);
else d.innerText=e.location.name+" "+Math.floor(t/1000)+"s";
}

expeditionsDiv.appendChild(d);
});

renderHorses();
}