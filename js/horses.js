// =====================
// GENEROWANIE KONIA
// =====================
function rollStatVariance(base) {
  // ±15% wariancji od bazy, capped 0-100
  let variance = (Math.random() - 0.5) * 30;
  return Math.max(0, Math.min(100, Math.round(base + variance)));
}

function rollStars() {
  let s = 0;
  if (Math.random() < 0.02) {
    s++;
    if (Math.random() < 0.01) { s++; if (Math.random() < 0.005) s++; }
  }
  return s;
}

function rollRarity(override) {
  if (override && RARITY_WEIGHTS[override] !== undefined) return override;
  // mapowanie starych kluczy
  const legacyMap = { common:"common", rare:"rare", epic:"epic", legendary:"legendary" };
  if (override && legacyMap[override]) override = legacyMap[override];

  let total = Object.values(RARITY_WEIGHTS).reduce((a,b)=>a+b,0);
  let r = Math.random() * total;
  for (let [key, w] of Object.entries(RARITY_WEIGHTS)) {
    r -= w; if (r <= 0) return key;
  }
  return "common";
}

function generateHorse(rarityHint) {
  let rarity = rollRarity(rarityHint);

  // Losuj rasę z tej rzadkości
  let pool = BREEDS.filter(b => b.rarity === rarity);
  if (!pool.length) pool = BREEDS.filter(b => b.rarity === "common");
  let breed = pool[Math.floor(Math.random() * pool.length)];

  let stars     = rollStars();
  let starBonus = stars * 8;
  let bl        = BLOODLINE_BONUS[breed.bloodline] || {};

  let stats = {
    speed:    Math.min(100, rollStatVariance(breed.base.speed)    + (bl.speed||0)    + starBonus),
    strength: Math.min(100, rollStatVariance(breed.base.strength) + (bl.strength||0) + starBonus),
    stamina:  Math.min(100, rollStatVariance(breed.base.stamina)  + (bl.stamina||0)  + starBonus),
    luck:     Math.min(100, rollStatVariance(breed.base.luck)     + (bl.luck||0)     + Math.round(starBonus*0.5)),
  };

  return {
    id:           Date.now() + Math.random(),
    name:         breed.name,
    breedKey:     breed.name,   // referencja do BREEDS
    flag:         breed.flag,
    country:      breed.country,
    type:         breed.type,
    bloodline:    breed.bloodline,
    group:        rarity,
    rarity,
    stars,
    born:         Date.now(),
    lastFed:      Date.now(),
    bonusApplied: null,
    stats,
  };
}

function getBreedData(h) {
  return BREEDS.find(b => b.name === (h.breedKey || h.name)) || null;
}

// =====================
// WIEK / WZROST
// =====================
function getHorseAgeDays(h) {
  return Math.floor((Date.now() - h.born) / 86400000);
}

function applyGrowth(h) {
  if (h.bonusApplied) return;
  if (getHorseAgeDays(h) > 7) {
    let r = Math.random();
    if      (r < 0.30) { h.stats.speed    = Math.min(100, h.stats.speed+3);    h.bonusApplied="+szybkość"; }
    else if (r < 0.55) { h.stats.strength = Math.min(100, h.stats.strength+3); h.bonusApplied="+siła"; }
    else if (r < 0.75) { h.stats.stamina  = Math.min(100, h.stats.stamina+3);  h.bonusApplied="+wytrzymałość"; }
    else if (r < 0.90) { h.stats.luck     = Math.min(100, h.stats.luck+3);     h.bonusApplied="+szczęście"; }
    else               h.bonusApplied="brak";
  }
}

// =====================
// GŁÓD
// =====================
function getHunger(h) {
  if (!h.lastFed) h.lastFed = Date.now();
  return Math.min(100, Math.floor((Date.now()-h.lastFed)/86400000*100));
}

function feedHorse(horseIdx, foodName) {
  let h = playerHorses[horseIdx];
  let fill = foodName==="Jabłko" ? 0.5 : 0.25;
  let hunger = getHunger(h);
  let reduce = hunger * fill;
  h.lastFed = Date.now() - Math.max(0,(hunger-reduce)/100*86400000);
  trackQuest("feed");
  log(`${foodName==="Jabłko"?"🍎":"🌾"} ${h.name} nakarmiony! Głód −${Math.round(reduce)}%`);
}

// =====================
// SZCZĘŚCIE STAJNI
// =====================
function getPartyLuck() {
  if (!playerHorses.length) return 0;
  return playerHorses.reduce((s,h)=>s+(h.stats.luck||0),0)/playerHorses.length;
}

// =====================
// GENETYKA / ROZMNAŻANIE
// =====================
function breedHorses(idxA, idxB) {
  if (idxA===idxB)                          { log("⚠️ Wybierz dwa różne konie!"); return; }
  if (playerHorses.length>=STABLE_LIMIT)    { log(`⚠️ Stajnia pełna!`); return; }

  let a = playerHorses[idxA], b = playerHorses[idxB];
  const rarityTier = { common:0, uncommon:1, rare:2, epic:3, legendary:4, mythic:5 };
  const tierRarity = Object.keys(rarityTier);

  let tierA = rarityTier[a.rarity]||0, tierB = rarityTier[b.rarity]||0;
  let childRarity;
  let roll = Math.random();
  if      (roll < 0.45) childRarity = a.rarity;
  else if (roll < 0.90) childRarity = b.rarity;
  else    childRarity = tierRarity[Math.min(Math.max(tierA,tierB)+1, 5)];

  // Dziedziczenie bloodline — dominacja wyższego tier
  let childBloodline = tierA >= tierB ? a.bloodline : b.bloodline;

  // Pula ras dla tej rzadkości
  let pool = BREEDS.filter(b2 => b2.rarity===childRarity);
  if (!pool.length) pool = BREEDS.filter(b2=>b2.rarity==="common");
  let breed = pool[Math.floor(Math.random()*pool.length)];

  let stars = rollStars();
  let starBonus = stars*8;
  let bl = BLOODLINE_BONUS[childBloodline]||{};

  function inherit(sA,sB,base) {
    let v = sA*0.4+sB*0.4+base*0.2+(Math.random()-0.5)*10;
    if (Math.random()<0.05) v*=1.1; // super gen
    return Math.min(100, Math.max(0, Math.round(v)));
  }

  let child = {
    id:           Date.now()+Math.random(),
    name:         breed.name,
    breedKey:     breed.name,
    flag:         breed.flag,
    country:      breed.country,
    type:         breed.type,
    bloodline:    childBloodline,
    group:        childRarity,
    rarity:       childRarity,
    stars,
    born:         Date.now(),
    lastFed:      Date.now(),
    bonusApplied: null,
    parents:      [a.name, b.name],
    stats: {
      speed:    Math.min(100,inherit(a.stats.speed,    b.stats.speed,    breed.base.speed)    +(bl.speed||0)   +starBonus),
      strength: Math.min(100,inherit(a.stats.strength, b.stats.strength, breed.base.strength) +(bl.strength||0)+starBonus),
      stamina:  Math.min(100,inherit(a.stats.stamina,  b.stats.stamina,  breed.base.stamina)  +(bl.stamina||0) +starBonus),
      luck:     Math.min(100,inherit(a.stats.luck,     b.stats.luck,     breed.base.luck)     +(bl.luck||0)    +Math.round(starBonus*0.5)),
    }
  };

  playerHorses.push(child);
  trackQuest("breed");
  log(`🧬 Urodzono: ${child.flag} ${child.name} (${RARITY_LABELS[child.rarity]})! Rodzice: ${a.name} & ${b.name}`);
  saveGame(); renderAll(); closeBreedModal();
}

// =====================
// BREED MODAL
// =====================
let breedFirstIdx = null;

function openBreedModal() {
  if (playerHorses.length<2)              { log("⚠️ Potrzebujesz co najmniej 2 koni!"); return; }
  if (playerHorses.length>=STABLE_LIMIT)  { log("⚠️ Stajnia pełna — brak miejsca na źrebię!"); return; }
  breedFirstIdx=null;
  renderBreedModal();
  document.getElementById("breedModal").style.display="flex";
}
function closeBreedModal() {
  document.getElementById("breedModal").style.display="none";
  breedFirstIdx=null;
}

function renderBreedModal() {
  let list=document.getElementById("breedHorseList");
  list.innerHTML="";
  playerHorses.forEach((h,i)=>{
    let col=RARITY_COLORS[h.rarity]||"#8aab84";
    let btn=document.createElement("div");
    btn.className="breed-horse-btn"; btn.id=`breedBtn_${i}`;
    btn.innerHTML=`
      <span style="font-size:18px">${h.flag||"🐴"}</span>
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:12px;color:${col}">${h.name}${h.stars>0?" "+"⭐".repeat(h.stars):""}</div>
        <div style="font-size:11px;color:var(--text2)">${BLOODLINE_LABELS[h.bloodline]||""} · ⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck}</div>
      </div>`;
    btn.onclick=()=>selectBreedHorse(i);
    list.appendChild(btn);
  });
  document.getElementById("breedConfirmBtn").disabled=true;
  document.getElementById("breedStatus").textContent="Wybierz pierwszego rodzica";
}

function selectBreedHorse(idx) {
  if (breedFirstIdx===null) {
    breedFirstIdx=idx;
    document.querySelectorAll(".breed-horse-btn").forEach((b,i)=>{
      b.style.opacity=i===idx?"1":"0.5";
      b.style.borderColor=i===idx?"var(--accent2)":"";
    });
    document.getElementById("breedStatus").textContent=`✅ ${playerHorses[idx].name} — teraz wybierz drugiego`;
  } else {
    if (idx===breedFirstIdx) {
      breedFirstIdx=null;
      document.querySelectorAll(".breed-horse-btn").forEach(b=>{b.style.opacity="1";b.style.borderColor="";});
      document.getElementById("breedStatus").textContent="Wybierz pierwszego rodzica";
      return;
    }
    let a=playerHorses[breedFirstIdx], bh=playerHorses[idx];
    document.querySelectorAll(".breed-horse-btn").forEach((btn,i)=>{
      btn.style.opacity=(i===breedFirstIdx||i===idx)?"1":"0.4";
      btn.style.borderColor=(i===breedFirstIdx||i===idx)?"var(--gold)":"";
    });
    document.getElementById("breedStatus").innerHTML=`🐴 <strong style="color:var(--gold2)">${a.name}</strong> × <strong style="color:var(--gold2)">${bh.name}</strong>`;
    document.getElementById("breedConfirmBtn").disabled=false;
    document.getElementById("breedConfirmBtn").onclick=()=>breedHorses(breedFirstIdx,idx);
  }
}

// =====================
// RENDER STAJNI
// =====================
function renderHorses() {
  playerHorses=playerHorses.filter(h=>getHorseAgeDays(h)<365);
  let el=document.getElementById("horsesGrid");
  let count=playerHorses.length;

  let countEl=document.getElementById("stableCountDisplay");
  if (countEl) { countEl.textContent=`${count} / ${STABLE_LIMIT}`; countEl.style.color=count>=STABLE_LIMIT?"#c94a4a":"var(--gold2)"; }

  let breedBtn=document.getElementById("breedBtn");
  if (breedBtn) breedBtn.disabled=count<2||count>=STABLE_LIMIT;

  if (!count) {
    el.innerHTML=`<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🐴</div>Brak koni — idź na wyprawę!</div>`;
    document.getElementById("horseCount").textContent=0;
    return;
  }

  el.innerHTML="";
  playerHorses.forEach((h,idx)=>{
    applyGrowth(h);
    if (!h.stats.luck) h.stats.luck=10;
    let age=getHorseAgeDays(h);
    let ageClass=age>300?"ancient":age>200?"old":"";
    let rarCol=RARITY_COLORS[h.rarity]||"#8aab84";
    let starsClass=h.stars>0?`stars-${Math.min(h.stars,3)}`:"";
    let hunger=getHunger(h);
    let hCol=hunger>70?"#c94a4a":hunger>40?"#c97c2a":"#7ec870";
    let hLbl=hunger>70?"Głodny!":hunger>40?"Lekko głodny":"Najedzony";
    let bl=BLOODLINE_LABELS[h.bloodline]||"";

    let card=document.createElement("div");
    card.className=`horse-card ${starsClass}`;
    card.style.setProperty("--card-rarity-color", rarCol);
    card.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
        <div>
          <span style="font-size:18px">${h.flag||"🐴"}</span>
          <span class="horse-name" style="color:${rarCol};margin-left:4px">${h.name}</span>
        </div>
        <span style="font-size:10px;background:rgba(0,0,0,0.3);padding:2px 6px;border-radius:6px;color:${rarCol}">${RARITY_LABELS[h.rarity]||h.rarity}</span>
      </div>
      <div class="horse-breed">${h.type||""} · ${bl}</div>
      ${h.stars>0?`<div class="horse-stars">${"⭐".repeat(h.stars)}</div>`:""}
      ${h.parents?`<div style="font-size:10px;color:var(--text2);margin-bottom:4px">🧬 ${h.parents[0]} × ${h.parents[1]}</div>`:""}
      <div class="horse-stats">
        <div class="stat-row"><span>⚡ Szybkość</span><span>${h.stats.speed}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${h.stats.speed}%"></div></div>
        <div class="stat-row"><span>💪 Siła</span><span>${h.stats.strength}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${h.stats.strength}%;background:var(--gold)"></div></div>
        <div class="stat-row"><span>❤️ Wytrzymałość</span><span>${h.stats.stamina}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${h.stats.stamina}%;background:var(--rare)"></div></div>
        <div class="stat-row"><span>🍀 Szczęście</span><span>${h.stats.luck}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${h.stats.luck}%;background:#4ab870"></div></div>
      </div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border)">
        <div class="stat-row" style="margin-bottom:3px"><span style="color:${hCol}">🍽️ Głód</span><span style="color:${hCol}">${hunger}% — ${hLbl}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${hunger}%;background:${hCol};transition:width 0.5s"></div></div>
      </div>
      <div class="horse-age ${ageClass}">🎂 ${age} dni${h.bonusApplied?` · ${h.bonusApplied}`:""}</div>
      <button class="btn-market" onclick="openListHorse(${idx})">🏪 Wystaw na rynek</button>
    `;
    el.appendChild(card);
  });
  document.getElementById("horseCount").textContent=count;
}

// =====================
// RANKING
// =====================
function buildRanking() {
  const npcs=[{name:"Marek K.",score:1200},{name:"Zuzanna P.",score:980},{name:"Tomasz W.",score:750},{name:"Ania M.",score:610}];
  let ps=playerHorses.reduce((s,h)=>s+h.stats.speed+h.stats.strength+h.stats.stamina+(h.stats.luck||0),0);
  let entries=[{name:"Ty",score:Math.round(ps),isPlayer:true},...npcs];
  entries.sort((a,b)=>b.score-a.score);
  let list=document.getElementById("rankingList");
  list.innerHTML="";
  entries.forEach((e,i)=>{
    let div=document.createElement("div"); div.className="rank-item";
    if(e.isPlayer) div.style.borderColor="var(--accent)";
    let nc=i===0?"gold":i===1?"silver":i===2?"bronze":"";
    div.innerHTML=`<div class="rank-num ${nc}">#${i+1}</div><div class="rank-name">${e.isPlayer?`<strong style="color:var(--accent2)">${e.name}</strong>`:e.name}</div><div class="rank-score">${e.score} pkt</div>`;
    list.appendChild(div);
  });
}
