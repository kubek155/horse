// =====================
// DZIENNY RYNEK LOSOWYCH PRZEDMIOTÓW
// Odświeża się codziennie o północy, losowe itemy z ważonymi szansami
// =====================

const DAILY_MARKET_POOL = [
  // Materiały budowlane — pospolite
  { name:"Deska",     weight:40, rarity:"common",   limitDay:10, priceMin:40,  priceMax:80  },
  { name:"Cegła",     weight:35, rarity:"common",   limitDay:8,  priceMin:50,  priceMax:100 },
  { name:"Siano",     weight:40, rarity:"common",   limitDay:10, priceMin:30,  priceMax:60  },
  { name:"Kamień",    weight:40, rarity:"common",   limitDay:12, priceMin:25,  priceMax:55  },
  { name:"Gwóźdź",    weight:35, rarity:"common",   limitDay:10, priceMin:35,  priceMax:70  },
  { name:"Dachówka",  weight:20, rarity:"uncommon", limitDay:6,  priceMin:80,  priceMax:140 },
  { name:"Szkło",     weight:15, rarity:"uncommon", limitDay:5,  priceMin:100, priceMax:180 },
  { name:"Metal",     weight:12, rarity:"uncommon", limitDay:5,  priceMin:120, priceMax:200 },
  // Jedzenie
  { name:"Jabłko",    weight:35, rarity:"common",   limitDay:8,  priceMin:50,  priceMax:90  },
  { name:"Słoma",     weight:30, rarity:"common",   limitDay:8,  priceMin:25,  priceMax:50  },
  { name:"Bandaż",    weight:20, rarity:"uncommon", limitDay:4,  priceMin:70,  priceMax:120 },
  // Eliksiry — rzadkie
  { name:"Eliksir Szybkości",     weight:8,  rarity:"rare",     limitDay:3, priceMin:160, priceMax:260 },
  { name:"Eliksir Siły",          weight:8,  rarity:"rare",     limitDay:3, priceMin:160, priceMax:260 },
  { name:"Eliksir Wytrzymałości", weight:8,  rarity:"rare",     limitDay:3, priceMin:160, priceMax:260 },
  { name:"Eliksir Szczęścia",     weight:6,  rarity:"rare",     limitDay:3, priceMin:160, priceMax:280 },
  { name:"Eliksir Odmłodzenia",   weight:3,  rarity:"rare",     limitDay:2, priceMin:400, priceMax:700 },
  // Hodowla — bardzo rzadkie
  { name:"Jabłko Sfinksa",        weight:4,  rarity:"rare",     limitDay:2, priceMin:700, priceMax:1400 },
  { name:"Boski Nektar",          weight:1,  rarity:"epic",     limitDay:1, priceMin:1200, priceMax:2000 },
  // Slot itemy
  { name:"Piorun",    weight:5,  rarity:"uncommon", limitDay:2, priceMin:200, priceMax:400 },
  { name:"Kowadło",   weight:5,  rarity:"uncommon", limitDay:2, priceMin:200, priceMax:400 },
  { name:"Koniczyna", weight:5,  rarity:"uncommon", limitDay:2, priceMin:200, priceMax:400 },
  { name:"Serce",     weight:5,  rarity:"uncommon", limitDay:2, priceMin:200, priceMax:400 },
];

const DAILY_MARKET_ITEMS_COUNT = 12; // ile różnych itemów per dzień

function _getDailyMarketSeed() {
  // Seed zmieniający się codziennie — ten sam dla wszystkich graczy
  let d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth()+1) * 100 + d.getDate();
}

function _seededRandom(seed, n) {
  // Deterministyczny generator LCG
  let s = seed;
  return Array.from({length:n}, () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(s) / 0x7fffffff;
  });
}

function getDailyMarketItems() {
  let seed   = _getDailyMarketSeed();
  let randoms = _seededRandom(seed, DAILY_MARKET_ITEMS_COUNT * 3);
  let chosen  = [];
  let usedNames = new Set();
  let totalWeight = DAILY_MARKET_POOL.reduce((s,x) => s+x.weight, 0);
  let ri = 0;

  while (chosen.length < DAILY_MARKET_ITEMS_COUNT && ri < randoms.length) {
    let roll = randoms[ri++] * totalWeight;
    let cumul = 0;
    for (let item of DAILY_MARKET_POOL) {
      cumul += item.weight;
      if (roll < cumul && !usedNames.has(item.name)) {
        // Deterministyczna cena
        let priceRand = randoms[ri++] || 0.5;
        let price = Math.round(item.priceMin + priceRand * (item.priceMax - item.priceMin));
        chosen.push({...item, price});
        usedNames.add(item.name);
        break;
      }
    }
    ri++;
  }
  return chosen;
}

function getDailyBoughtKey(itemName) {
  let d = new Date();
  return `hh_dailymkt_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}_${itemName.replace(/ /g,"_")}`;
}

function getDailyBought(itemName) {
  return parseInt(localStorage.getItem(getDailyBoughtKey(itemName))||"0");
}

function incDailyBought(itemName) {
  let k = getDailyBoughtKey(itemName);
  localStorage.setItem(k, (getDailyBought(itemName)+1).toString());
}

function renderDailyMarket() {
  let el = document.getElementById("dailyMarketGrid");
  if (!el) return;

  let items = getDailyMarketItems();
  let now   = new Date();
  let midnight = new Date(now); midnight.setHours(24,0,0,0);
  let msLeft  = midnight - now;
  let hLeft   = Math.floor(msLeft/3600000);
  let mLeft   = Math.floor((msLeft%3600000)/60000);

  // Timer do odświeżenia
  let timerEl = document.getElementById("dailyMarketTimer");
  if (timerEl) timerEl.textContent = `Odświeża się za: ${hLeft}h ${mLeft}m`;

  el.innerHTML = "";

  const RC = {common:"#909090", uncommon:"#8aab84", rare:"#4a7ec8", epic:"#7b5ea7", legendary:"#c9a84c", mythic:"#c94a6a"};
  const RL = {common:"Zwykły", uncommon:"Pospolity", rare:"Rzadki", epic:"Legendarny", legendary:"Mityczny", mythic:"Pradawny"};

  items.forEach(item => {
    let bought   = getDailyBought(item.name);
    let left     = item.limitDay - bought;
    let canBuy   = left > 0 && gold >= item.price;
    let rc       = RC[item.rarity] || "#8aab84";
    let rl       = RL[item.rarity] || item.rarity;
    let db       = (typeof ITEMS_DATABASE!=="undefined" && ITEMS_DATABASE[item.name]) || {icon:"📦",desc:""};
    let iconSvg  = (typeof ITEM_ICONS_SVG!=="undefined" && ITEM_ICONS_SVG[item.name])
      ? `<div style="width:56px;height:56px;display:flex;align-items:center;justify-content:center">${ITEM_ICONS_SVG[item.name]}</div>`
      : `<span style="font-size:40px">${db.icon||"📦"}</span>`;

    let card = document.createElement("div");
    card.style.cssText = `
      background:${left<=0?"#0a0a0a":"#131f13"};
      border:1px solid ${left<=0?"#1a1a1a":rc+"33"};
      border-radius:12px;overflow:hidden;
      display:flex;flex-direction:column;
      opacity:${left<=0?0.5:1};
      transition:border-color 0.12s,transform 0.1s;
    `;

    // Ikona
    let iconArea = document.createElement("div");
    iconArea.style.cssText = `width:100%;height:90px;display:flex;align-items:center;justify-content:center;background:${rc}08;border-bottom:1px solid ${rc}18;position:relative`;
    iconArea.innerHTML = iconSvg;

    // Rarity badge
    let rarBadge = document.createElement("span");
    rarBadge.style.cssText = `position:absolute;top:6px;left:6px;font-size:9px;padding:2px 7px;border-radius:8px;background:rgba(0,0,0,0.6);color:${rc};border:1px solid ${rc}44;font-family:'Cinzel',serif`;
    rarBadge.textContent = rl;
    iconArea.appendChild(rarBadge);

    // Limit badge
    let limitBadge = document.createElement("span");
    limitBadge.style.cssText = `position:absolute;top:6px;right:6px;font-size:9px;padding:2px 7px;border-radius:8px;background:rgba(0,0,0,0.6);color:${left>0?"#4ab870":"#c94a4a"}`;
    limitBadge.textContent = left > 0 ? `${left}/${item.limitDay}` : "Wyczerpany";
    iconArea.appendChild(limitBadge);

    card.appendChild(iconArea);

    // Info
    let info = document.createElement("div");
    info.style.cssText = "padding:10px 12px 12px;display:flex;flex-direction:column;gap:5px;flex:1";
    info.innerHTML = `
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${rc}">${item.name}</div>
      <div style="font-size:10px;color:var(--text2);flex:1">${db.desc||""}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
        <div style="font-family:'Cinzel',serif;font-size:15px;color:#c9a84c">💰${item.price}</div>
        <div style="font-size:10px;color:${left>0?"var(--text2)":"#c94a4a"}">Limit: ${item.limitDay}/dzień</div>
      </div>
    `;

    let buyBtn = document.createElement("button");
    buyBtn.style.cssText = `
      width:100%;border-color:${canBuy?rc:"#333"};color:${canBuy?rc:"#444"};
      background:${canBuy?rc+"11":"transparent"};font-family:'Cinzel',serif;
      font-size:11px;padding:7px;cursor:${canBuy?"pointer":"not-allowed"};
      border-radius:0 0 0 0;
    `;
    buyBtn.disabled = !canBuy;
    buyBtn.textContent = left <= 0 ? "Wyczerpany" : !canBuy ? "Za mało złota" : "💰 Kup";
    buyBtn.onclick = () => buyDailyMarketItem(item);
    info.appendChild(buyBtn);

    card.appendChild(info);

    if (canBuy) {
      card.onmouseenter = () => { card.style.borderColor=rc; card.style.transform="translateY(-1px)"; };
      card.onmouseleave = () => { card.style.borderColor=rc+"33"; card.style.transform=""; };
    }

    el.appendChild(card);
  });
}

function buyDailyMarketItem(item) {
  let bought = getDailyBought(item.name);
  if (bought >= item.limitDay) { log("⚠️ Dzienny limit wyczerpany!"); return; }
  if (gold < item.price) { log("⚠️ Za mało złota!"); return; }

  gold -= item.price;
  incDailyBought(item.name);

  // Generuj item (slot item z bonusem jeśli potrzeba)
  let db = (typeof ITEMS_DATABASE!=="undefined" && ITEMS_DATABASE[item.name]) || {};
  if (db.isSlotItem && typeof generateSlotItem==="function") {
    inventory.push(generateSlotItem(item.name));
  } else {
    inventory.push({name:item.name, obtained:Date.now()});
  }

  saveGame(); renderAll();
  log(`✅ Kupiono: ${item.name} za 💰${item.price}!`);
  if (typeof trackQuest==="function") trackQuest("buy");
  renderDailyMarket();
}

// Odśwież timer co minutę
setInterval(() => {
  let timerEl = document.getElementById("dailyMarketTimer");
  if (!timerEl) return;
  let now = new Date();
  let midnight = new Date(now); midnight.setHours(24,0,0,0);
  let ms = midnight - now;
  let h = Math.floor(ms/3600000), m = Math.floor((ms%3600000)/60000);
  timerEl.textContent = `Odświeża się za: ${h}h ${m}m`;
}, 60000);
