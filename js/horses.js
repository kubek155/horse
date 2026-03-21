function rollStatBonus(){
let r=Math.random();
if(r<0.5)return Math.random()*10;
if(r<0.8)return Math.random()*20;
if(r<0.95)return Math.random()*35;
if(r<0.99)return Math.random()*45;
return Math.random()*50;
}

function rollStars(){
let s=0;
if(Math.random()<0.02){
s++;
if(Math.random()<0.01){
s++;
if(Math.random()<0.005)s++;
}}
return s;
}

function generateHorse(){
let g=Object.values(HORSE_DATABASE)[Math.floor(Math.random()*3)];
let breed=g.breeds[Math.floor(Math.random()*g.breeds.length)];
let stars=rollStars();
let bonus=stars*10;

return{
name:breed,
group:g.name,
rarity:g.rarity,
stars,
born:Date.now(),
bonus:null,
stats:{
speed:g.baseStats.speed+rollStatBonus()+bonus,
strength:g.baseStats.strength+rollStatBonus()+bonus,
stamina:g.baseStats.stamina+rollStatBonus()+bonus
}};
}

function getHorseAgeDays(h){
return Math.floor((Date.now()-h.born)/(86400000));
}

function applyGrowth(h){
if(h.bonus)return;
if(getHorseAgeDays(h)>7){
if(Math.random()<0.5){h.stats.speed+=2;h.bonus="+speed";}
else h.bonus="brak";
}
}

function renderHorses(){
horses.innerHTML="";
playerHorses=playerHorses.filter(h=>getHorseAgeDays(h)<365);

playerHorses.forEach(h=>{
applyGrowth(h);
let d=document.createElement("div");
d.className="horse";

d.innerHTML=`
${h.name}<br>
⭐ ${"⭐".repeat(h.stars)}<br>
🎂 ${getHorseAgeDays(h)} dni<br>
${h.bonus}<br>
⚡ ${h.stats.speed.toFixed(0)}
`;

horses.appendChild(d);
});

horseCount.innerText=playerHorses.length;
}