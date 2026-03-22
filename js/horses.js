// =====================
// ZAKRESY STATYSTYK
// =====================
const RARITY_STAT_RANGE = {
  common:    { lo:0,   hi:30  },
  uncommon:  { lo:0,   hi:35  },
  rare:      { lo:0,   hi:45  },
  epic:      { lo:45,  hi:70  },
  legendary: { lo:70,  hi:100 },
  mythic:    { lo:80,  hi:110 },
};

// =====================
// BONUS TYPOWY — który stat dostaje bonus wg typu konia
// =====================
const TYPE_BONUS_STAT = {
  "Wyścigowy":   "speed",
  "Sportowy":    "speed",
  "Pociągowy":   null,        // siła + wytrzymałość — obsługiwane osobno
  "Kucyk":       null,        // brak bonusu
  "Chód":        "stamina",
  "Mityczny":    "all",       // wszystkie
  "Bojowy":      "strength",
  "Prymitywny":  "luck",
  // reszta — brak bonusu typowego
};

// Bonus szybkości (dla wszystkich koni, jako "naturalny" bonus)
// 0-5: 78% | 5-8: 12% | 8-12: 7% | 12-16: 2.8% | 20: 0.2%
function rollTypeBonus() {
  let r = Math.random() * 100;
  if (r < 78)   return Math.round(Math.random() * 5);
  if (r < 90)   return 5  + Math.round(Math.random() * 3);
  if (r < 97)   return 8  + Math.round(Math.random() * 4);
  if (r < 99.8) return 12 + Math.round(Math.random() * 4);
  return 20;
}

// Zwraca obiekt z bonusami do statystyk wg typu konia
function calcTypeBonuses(type) {
  let bonuses = { speed:0, strength:0, stamina:0, luck:0 };
  let stat = TYPE_BONUS_STAT[type];
  let roll = rollTypeBonus();

  if (type === "Pociągowy") {
    // Połowa bonusu na siłę, połowa na wytrzymałość
    bonuses.strength = Math.floor(roll / 2);
    bonuses.stamina  = roll - bonuses.strength;
  } else if (type === "Kucyk" || stat === null) {
    // Brak bonusu
  } else if (stat === "all") {
    // Mityczny — bonus do wszystkich
    bonuses.speed    = roll;
    bonuses.strength = roll;
    bonuses.stamina  = roll;
    bonuses.luck     = roll;
  } else if (stat) {
    bonuses[stat] = roll;
  }

  return { bonuses, roll };
}

// =====================
// SLOTY NA ITEM
// =====================
// legendary: 50% szans na 1 slot
// mythic:    zawsze 2 sloty
function rollItemSlots(rarity) {
  if (rarity === "mythic")    return 2;
  if (rarity === "legendary") return Math.random() < 0.5 ? 1 : 0;
  return 0;
}

// =====================
// GENEROWANIE KONIA
// =====================
function rollStatInRange(base, rarity) {
  let range = RARITY_STAT_RANGE[rarity] || RARITY_STAT_RANGE.common;
  let lo = range.lo, hi = range.hi;
  let span = hi - lo;
  let normalized = (base / 110) * span + lo;
  let jitter     = (Math.random() - 0.5) * span * 0.2;
  return Math.max(lo, Math.min(hi, Math.round(normalized + jitter)));
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

  let pool = BREEDS.filter(b => b.rarity === rarity);
  if (!pool.length) pool = BREEDS.filter(b => b.rarity === "common");
  let breed = pool[Math.floor(Math.random() * pool.length)];

  let stars     = rollStars();
  let starBonus = stars * 4;
  let bl        = BLOODLINE_BONUS[breed.bloodline] || {};

  // Baza statystyk — zakres rzadkości + proporcje rasy + krew
  let stats = {
    speed:    rollStatInRange(breed.base.speed,    rarity) + (bl.speed||0),
    strength: rollStatInRange(breed.base.strength, rarity) + (bl.strength||0),
    stamina:  rollStatInRange(breed.base.stamina,  rarity) + (bl.stamina||0),
    luck:     rollStatInRange(breed.base.luck,     rarity) + (bl.luck||0),
  };

  // Bonus typowy (zależy od typu konia)
  let { bonuses, roll: typeBonusRoll } = calcTypeBonuses(breed.type);
  stats.speed    += bonuses.speed;
  stats.strength += bonuses.strength;
  stats.stamina  += bonuses.stamina;
  stats.luck     += bonuses.luck;

  // Gwiazdki
  stats.speed    += starBonus;
  stats.strength += starBonus;
  stats.stamina  += starBonus;
  stats.luck     += Math.round(starBonus * 0.5);

  // Cap
  let cap = rarity === "mythic" ? 110 : 100;
  Object.keys(stats).forEach(k => { stats[k] = Math.max(0, Math.min(cap, stats[k])); });

  // Perk
  let perk = null;
  let perkPool = RARITY_PERKS[rarity];
  if (perkPool && perkPool.length) {
    perk = perkPool[Math.floor(Math.random() * perkPool.length)];
    if (perk.id === "war_born") {
      stats.strength = Math.min(cap, stats.strength + 20);
      stats.stamina  = Math.min(cap, stats.stamina  + 20);
    }
  }

  // Sloty na item
  let itemSlots     = rollItemSlots(rarity);
  let equippedItems = Array(itemSlots).fill(null); // null = pusty slot

  return {
    id:           Date.now() + Math.random(),
    name:         breed.name,
    breedKey:     breed.name,
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
    perk,
    typeBonus:    { stat: TYPE_BONUS_STAT[breed.type] || null, value: typeBonusRoll, bonuses },
    itemSlots,
    equippedItems,
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
    let cap = h.rarity === "mythic" ? 110 : 100;
    let r = Math.random();
    if      (r < 0.30) { h.stats.speed    = Math.min(cap, h.stats.speed+3);    h.bonusApplied="+szybkość"; }
    else if (r < 0.55) { h.stats.strength = Math.min(cap, h.stats.strength+3); h.bonusApplied="+siła"; }
    else if (r < 0.75) { h.stats.stamina  = Math.min(cap, h.stats.stamina+3);  h.bonusApplied="+wytrzymałość"; }
    else if (r < 0.90) { h.stats.luck     = Math.min(cap, h.stats.luck+3);     h.bonusApplied="+szczęście"; }
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
  // Perk golden_luck podwaja szczęście konia
  let total = playerHorses.reduce((s,h) => {
    let lk = h.stats.luck || 0;
    if (h.perk?.id === "golden_luck") lk *= 2;
    return s + lk;
  }, 0);
  return total / playerHorses.length;
}

// =====================
// SLOTY — użyj itemu w slocie konia
// =====================
function equipItemToSlot(horseIdx, slotIdx, inventoryIdx) {
  let h    = playerHorses[horseIdx];
  let item = inventory[inventoryIdx];
  if (!h || !item) return;
  if (!h.equippedItems || slotIdx >= h.itemSlots) { log("⚠️ Brak slotu!"); return; }

  // Zwróć stary item do ekwipunku jeśli był
  if (h.equippedItems[slotIdx]) {
    inventory.push(h.equippedItems[slotIdx]);
  }

  // Aplicuj bonus do statystyk (tylko elixiry statystyk)
  let bonusApplied = applySlotItemBonus(h, item, true);
  h.equippedItems[slotIdx] = { ...item, slotBonusApplied: bonusApplied };
  inventory.splice(inventoryIdx, 1);

  saveGame();
  renderAll();
  log(`✨ ${item.name} wyposażony w slot konia ${h.name}!`);
}

function unequipSlot(horseIdx, slotIdx) {
  let h = playerHorses[horseIdx];
  if (!h || !h.equippedItems?.[slotIdx]) return;
  let item = h.equippedItems[slotIdx];
  // Cofnij bonus
  applySlotItemBonus(h, item, false);
  inventory.push({ name: item.name, obtained: Date.now() });
  h.equippedItems[slotIdx] = null;
  saveGame();
  renderAll();
  log(`↩️ ${item.name} zdjęty z konia ${h.name}.`);
}

function applySlotItemBonus(h, item, apply) {
  let cap  = h.rarity === "mythic" ? 110 : 100;
  let mult = apply ? 1 : -1;
  let applied = null;
  let d    = ITEMS_DATABASE[item.name] || {};

  // Eliksiry — stały bonus +5
  if (d.isElixir && d.stat) {
    let val = 5 * mult;
    h.stats[d.stat] = Math.max(0, Math.min(cap, h.stats[d.stat] + val));
    applied = d.stat;
  }

  // Przedmioty do slotów — bonus z item.bonus (0-10)
  if (d.isSlotItem && d.stat) {
    let val = (item.bonus || 0) * mult;
    h.stats[d.stat] = Math.max(0, Math.min(cap, h.stats[d.stat] + val));
    applied = d.stat;
  }

  // Legacy — stare nazwy eliksirów
  if (!applied) {
    if (item.name === "Eliksir Szybkości")     { h.stats.speed    = Math.max(0,Math.min(cap, h.stats.speed    + 5*mult)); applied="speed"; }
    if (item.name === "Eliksir Siły")          { h.stats.strength = Math.max(0,Math.min(cap, h.stats.strength + 5*mult)); applied="strength"; }
    if (item.name === "Eliksir Wytrzymałości") { h.stats.stamina  = Math.max(0,Math.min(cap, h.stats.stamina  + 5*mult)); applied="stamina"; }
    if (item.name === "Eliksir Szczęścia")     { h.stats.luck     = Math.max(0,Math.min(cap, h.stats.luck     + 5*mult)); applied="luck"; }
  }

  return applied;
}

// Pomocnicze — label bonusu typowego
function typeBonusLabel(h) {
  if (!h.typeBonus || !h.typeBonus.value) return null;
  let val = h.typeBonus.value;
  let type = h.type;
  if (type === "Pociągowy")      return `+${val} 💪❤️`;
  if (type === "Kucyk")          return null;
  if (type === "Mityczny")       return `+${val} wszystkim`;
  if (type === "Bojowy")         return `+${val} 💪`;
  if (type === "Prymitywny")     return `+${val} 🍀`;
  let stat = h.typeBonus.stat;
  if (stat === "speed")   return `+${val} ⚡`;
  if (stat === "stamina") return `+${val} ❤️`;
  return null;
}

// =====================
// GENETYKA / ROZMNAŻANIE
// =====================
function breedHorses(idxA, idxB) {
  if (idxA===idxB)                       { log("⚠️ Wybierz dwa różne konie!"); return; }
  if (playerHorses.length>=STABLE_LIMIT) { log("⚠️ Stajnia pełna!"); return; }

  let a = playerHorses[idxA], b = playerHorses[idxB];
  const rarityTier = { common:0, uncommon:1, rare:2, epic:3, legendary:4, mythic:5 };
  const tierRarity = ["common","uncommon","rare","epic","legendary","mythic"];
  let tierA = rarityTier[a.rarity]||0, tierB = rarityTier[b.rarity]||0;

  let childRarity;
  let roll = Math.random();
  if      (roll < 0.45) childRarity = a.rarity;
  else if (roll < 0.90) childRarity = b.rarity;
  else    childRarity = tierRarity[Math.min(Math.max(tierA,tierB)+1, 5)];

  let childBloodline = tierA >= tierB ? a.bloodline : b.bloodline;
  let pool = BREEDS.filter(b2=>b2.rarity===childRarity);
  if (!pool.length) pool = BREEDS.filter(b2=>b2.rarity==="common");
  let breed = pool[Math.floor(Math.random()*pool.length)];

  let stars     = rollStars();
  let starBonus = stars * 4;
  let bl        = BLOODLINE_BONUS[childBloodline] || {};
  let cRange    = RARITY_STAT_RANGE[childRarity]  || RARITY_STAT_RANGE.common;
  let cap       = childRarity === "mythic" ? 110 : 100;

  function inherit(sA, sB, base) {
    let v = sA*0.4 + sB*0.4 + base*0.2 + (Math.random()-0.5)*8;
    if (Math.random() < 0.05) v *= 1.1;
    return Math.max(cRange.lo, Math.min(cap, Math.round(v)));
  }

  let { bonuses: childBonuses, roll: cbRoll } = calcTypeBonuses(breed.type);

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
    typeBonus:    { stat: TYPE_BONUS_STAT[breed.type]||null, value: cbRoll, bonuses: childBonuses },
    itemSlots:    rollItemSlots(childRarity),
    equippedItems: Array(rollItemSlots(childRarity)).fill(null),
    perk:         null,
    stats: (()=>{
      let s = {
        speed:    Math.max(cRange.lo,Math.min(cap, inherit(a.stats.speed,    b.stats.speed,    breed.base.speed)    +(bl.speed||0)   +starBonus+childBonuses.speed)),
        strength: Math.max(cRange.lo,Math.min(cap, inherit(a.stats.strength, b.stats.strength, breed.base.strength) +(bl.strength||0)+starBonus+childBonuses.strength)),
        stamina:  Math.max(cRange.lo,Math.min(cap, inherit(a.stats.stamina,  b.stats.stamina,  breed.base.stamina)  +(bl.stamina||0) +starBonus+childBonuses.stamina)),
        luck:     Math.max(cRange.lo,Math.min(cap, inherit(a.stats.luck,     b.stats.luck,     breed.base.luck)     +(bl.luck||0)    +Math.round(starBonus*0.5)+childBonuses.luck)),
      };
      return s;
    })(),
  };

  // Perk dla dziecka jeśli odpowiednia rzadkość
  let pp = RARITY_PERKS[childRarity];
  if (pp) child.perk = pp[Math.floor(Math.random()*pp.length)];

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
  if (playerHorses.length<2)             { log("⚠️ Potrzebujesz co najmniej 2 koni!"); return; }
  if (playerHorses.length>=STABLE_LIMIT) { log("⚠️ Stajnia pełna!"); return; }
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
  playerHorses=playerHorses.filter(h=>{ let maxAge=h.perk?.id==="immortal"?730:365; return getHorseAgeDays(h)<maxAge; });
  let el=document.getElementById("horsesGrid");
  let count=playerHorses.length;

  let countEl=document.getElementById("stableCountDisplay");
  if(countEl){ countEl.textContent=`${count} / ${STABLE_LIMIT}`; countEl.style.color=count>=STABLE_LIMIT?"#c94a4a":"var(--gold2)"; }

  let breedBtn=document.getElementById("breedBtn");
  if(breedBtn) breedBtn.disabled=count<2||count>=STABLE_LIMIT;

  if(!count){
    el.innerHTML=`<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🐴</div>Brak koni — idź na wyprawę!</div>`;
    document.getElementById("horseCount").textContent=0;
    return;
  }

  el.innerHTML="";
  playerHorses.forEach((h,idx)=>{
    applyGrowth(h);
    if(!h.stats.luck) h.stats.luck=5;
    // Migracja starych koni — dodaj brakujące pola
    if(!h.itemSlots)     h.itemSlots=0;
    if(!h.equippedItems) h.equippedItems=[];

    let age=getHorseAgeDays(h);
    let ageClass=age>300?"ancient":age>200?"old":"";
    let rarCol=RARITY_COLORS[h.rarity]||"#8aab84";
    let starsClass=h.stars>0?`stars-${Math.min(h.stars,3)}`:"";
    let hunger=getHunger(h);
    let hCol=hunger>70?"#c94a4a":hunger>40?"#c97c2a":"#7ec870";
    let hLbl=hunger>70?"Głodny!":hunger>40?"Lekko głodny":"Najedzony";
    let bl=BLOODLINE_LABELS[h.bloodline]||"";
    let tbLabel=typeBonusLabel(h);

    // Sloty na item HTML
    let slotsHtml="";
    if(h.itemSlots>0){
      slotsHtml=`<div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border)">
        <div style="font-family:'Cinzel',serif;font-size:10px;color:var(--text2);letter-spacing:1px;margin-bottom:6px">
          ✨ SLOTY PRZEDMIOTÓW (${h.itemSlots})
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">`;
      for(let s=0;s<h.itemSlots;s++){
        let equipped=h.equippedItems?.[s];
        if(equipped){
          let d=ITEMS_DATABASE[equipped.name]||{icon:"📦"};
          let bonusTxt = equipped.bonus !== undefined
            ? `<span style="font-size:9px;color:var(--gold2)">+${equipped.bonus}</span>`
            : `<span style="font-size:9px;color:var(--gold2)">+5</span>`;
          slotsHtml+=`<div class="item-slot item-slot-filled" title="${equipped.name}: ${d.desc}" onclick="unequipSlot(${idx},${s})">
            <span style="font-size:18px">${d.icon}</span>
            ${bonusTxt}
            <span style="font-size:8px;color:#c94a4a">✕ zdejmij</span>
          </div>`;
        } else {
          slotsHtml+=`<div class="item-slot item-slot-empty" onclick="openSlotPicker(${idx},${s})">
            <span style="font-size:16px;opacity:0.4">＋</span>
          </div>`;
        }
      }
      slotsHtml+="</div></div>";
    }

    let card=document.createElement("div");
    card.className=`horse-card ${starsClass}`;
    card.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:20px">${h.flag||"🐴"}</span>
          <span class="horse-name" style="color:${rarCol}">${h.name}</span>
        </div>
        <span style="font-size:10px;background:${rarCol}22;padding:2px 7px;border-radius:6px;color:${rarCol};border:1px solid ${rarCol}55">${RARITY_LABELS[h.rarity]||h.rarity}</span>
      </div>
      <div class="horse-breed">${h.type||""} · ${bl}</div>
      ${h.stars>0?`<div class="horse-stars">${"⭐".repeat(h.stars)}</div>`:""}
      ${h.parents?`<div style="font-size:10px;color:var(--text2);margin-bottom:4px">🧬 ${h.parents[0]} × ${h.parents[1]}</div>`:""}
      ${tbLabel?`<div style="font-size:11px;color:var(--gold2);margin-bottom:6px;padding:3px 8px;background:rgba(201,168,76,0.1);border-radius:5px;border:1px solid rgba(201,168,76,0.2)">
        🎯 Bonus typowy: ${tbLabel}
      </div>`:""}
      ${h.perk?`<div style="margin-bottom:6px;padding:5px 8px;background:rgba(201,74,106,0.1);border:1px solid rgba(201,74,106,0.3);border-radius:6px;font-size:11px">
        <span style="color:#e08070">${h.perk.icon} <strong>${h.perk.name}</strong></span>
        <span style="color:var(--text2)"> — ${h.perk.desc}</span>
      </div>`:""}
      <div class="horse-stats">
        <div class="stat-row"><span>⚡ Szybkość</span><span>${h.stats.speed}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${Math.min(100,(h.stats.speed/110)*100).toFixed(1)}%"></div></div>
        <div class="stat-row"><span>💪 Siła</span><span>${h.stats.strength}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${Math.min(100,(h.stats.strength/110)*100).toFixed(1)}%;background:var(--gold)"></div></div>
        <div class="stat-row"><span>❤️ Wytrzymałość</span><span>${h.stats.stamina}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${Math.min(100,(h.stats.stamina/110)*100).toFixed(1)}%;background:var(--rare)"></div></div>
        <div class="stat-row"><span>🍀 Szczęście</span><span>${h.stats.luck}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${Math.min(100,(h.stats.luck/110)*100).toFixed(1)}%;background:#4ab870"></div></div>
      </div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border)">
        <div class="stat-row" style="margin-bottom:3px"><span style="color:${hCol}">🍽️ Głód</span><span style="color:${hCol}">${hunger}% — ${hLbl}</span></div>
        <div class="stat-bar-wrap"><div class="stat-bar" style="width:${hunger}%;background:${hCol};transition:width 0.5s"></div></div>
      </div>
      ${slotsHtml}
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
