const EXPEDITION_TIME=60000; // test
const DAILY_LIMIT=4;

const LOCATIONS=[{name:"Las"},{name:"Góry"}];

function getTodayKey(){
  let d=new Date();
  return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate();
}

function getDailyCount(){
  return parseInt(localStorage.getItem("d_"+getTodayKey()))||0;
}

function addDaily(){
  localStorage.setItem("d_"+getTodayKey(),getDailyCount()+1);
}

function renderLocations(){
  locations.innerHTML="";
  LOCATIONS.forEach((l,i)=>{
    let b=document.createElement("button");
    b.innerText=l.name;
    b.onclick=()=>startExpedition(i);
    locations.appendChild(b);
  });
}

function startExpedition(i){
  if(getDailyCount()>=DAILY_LIMIT){log("limit");return;}

  expeditions.push({
    end:Date.now()+EXPEDITION_TIME,
    location:LOCATIONS[i],
    done:false
  });

  addDaily();
  saveGame();
}

function finishExpedition(e){
  let r=Math.random()*100;

  if(r<20){
    playerHorses.push(generateHorse());
    log("Nowy koń!");
  }else if(r<40){
    addItem("Eliksir");
    log("Item!");
  }else{
    log("Nic");
  }

  e.done=true;
  saveGame();
}

function log(t){logDiv.innerText=t;}