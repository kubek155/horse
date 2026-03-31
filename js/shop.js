
// rareShop — 5% szans że item pojawi się w danym oknie 48h
function isRareShopAvailable(item) {
  if (!item.rareShop) return true;
  // Seed oparty na nazwie itemu + aktualnym oknie 48h
  let window48 = Math.floor(Date.now() / (48*3600000));
  // Deterministyczny hash — żeby każdy gracz widział to samo
  let hash = 0;
  let key  = item.name + "_" + window48;
  for (let i=0; i<key.length; i++) hash = (hash*31 + key.charCodeAt(i)) & 0xffffffff;
  let pseudo = Math.abs(hash) / 0xffffffff;
  return pseudo < item.rareChance;
}
function getElixirSold() { return parseInt(localStorage.getItem("hh_elixir_sold"))||0; }
function addElixirSold()  { localStorage.setItem("hh_elixir_sold", getElixirSold()+1); }
const ELIXIR_AVAILABLE = Math.random() < 0.10 && getElixirSold() < 5;

// Klucz limitu dla itemu — reset co limitHours godzin
function getShopLimitKey(itemName) {
  return `hh_shop_${itemName.replace(/ /g,"_")}`;
}
function getShopBought(item) {
  if (!item.limitHours && !item.dailyLimit) return { count:0, resetsAt:0 };
  let key  = getShopLimitKey(item.name);
  let data = JSON.parse(localStorage.getItem(key)||"null");
  if (!data) return { count:0, resetsAt:0 };
  let hours = item.limitHours || 24;
  if (Date.now() > data.resetsAt) return { count:0, resetsAt:0 };
  return data;
}
function incShopBought(item) {
  let key   = getShopLimitKey(item.name);
  let hours = item.limitHours || 24;
  let data  = getShopBought(item);
  if (data.count === 0) data.resetsAt = Date.now() + hours*3600000;
  data.count++;
  localStorage.setItem(key, JSON.stringify(data));
}
function getShopLimit(item) {
  if (item.limitQty)   return item.limitQty;
  if (item.dailyLimit) return item.dailyLimit;
  return Infinity;
}
function shopTimeLeft(item) {
  let data = getShopBought(item);
  if (!data.resetsAt || Date.now() > data.resetsAt) return "";
  let ms = data.resetsAt - Date.now();
  let h  = Math.floor(ms/3600000), m = Math.floor((ms%3600000)/60000);
  return `${h}h ${m}m`;
}

function buyItem(idx) {
  let item = SHOP_ITEMS[idx];
  // rareShop — 5% szans co 48h
  if (item.rareShop && !isRareShopAvailable(item)) {
    log("⚠️ Ten przedmiot nie jest dziś dostępny w sklepie!");
    return;
  }
  // Sprawdź limit czasowy
  let limit   = getShopLimit(item);
  let bought  = getShopBought(item);
  if (bought.count >= limit) {
    let tl = shopTimeLeft(item);
    log(`⚠️ Limit zakupów wyczerpany! Odnowi się za ${tl}.`);
    return;
  }
  if (gold < item.price) { log("⚠️ Za mało złota!"); return; }
  gold -= item.price;
  if (item.isSlotShop) {
    inventory.push(generateSlotItem(item.name));
    log(`✅ Kupiono: ${item.icon} ${item.name}!`);
  } else {
    inventory.push({ name: item.name, obtained: Date.now() });
    log(`✅ Kupiono: ${item.icon} ${item.name}!`);
  }
  if (limit < Infinity) incShopBought(item);
  trackQuest("buy");
  saveGame(); renderAll();
}

function renderShop() {
  document.querySelectorAll("#goldCount, #shopGoldDisplay").forEach(el => { if(el) el.textContent=gold; });

  let itemsGrid = document.getElementById("shopItemsGrid");
  if (!itemsGrid) return;
  itemsGrid.innerHTML = "";
  let elixirSold = getElixirSold();

  // Grupowanie
  const groups = [
    { label: "🍽️ Jedzenie & Leczenie", filter: i => ITEMS_DATABASE[i.name]?.isFood || i.name==="Bandaż" },
    { label: "🧪 Eliksiry (jednorazowe)", filter: i => ITEMS_DATABASE[i.name]?.isElixir },
    { label: "✨ Przedmioty do slotów", filter: i => i.isSlotShop },
    { label: "🍏 Hodowla",           filter: i => ITEMS_DATABASE[i.name]?.isBreedItem || ITEMS_DATABASE[i.name]?.isBreedSupport },
    { label: "💎 Specjalne",         filter: i => i.globalLimit },
  ];

  groups.forEach(g => {
    let groupItems = SHOP_ITEMS.map((item,i)=>({item,i})).filter(({item})=>g.filter(item));
    if (!groupItems.length) return;

    // Nagłówek grupy
    let header = document.createElement("div");
    header.style.cssText = "grid-column:1/-1;font-family:'Cinzel',serif;font-size:11px;letter-spacing:1px;color:var(--text2);padding:8px 0 4px;border-bottom:1px solid var(--border);margin-bottom:4px";
    header.textContent = g.label;
    itemsGrid.appendChild(header);

    groupItems.forEach(({item, i}) => {
      let available  = true;
      let statusBadge = "";
      let borderOverride = "";

      if (item.globalLimit) {
        let remaining = item.globalLimit - elixirSold;
        if (remaining <= 0) {
          available = false;
          statusBadge = `<span style="color:#c94a4a;font-size:10px">● Wyprzedany (0/5)</span>`;
        } else if (!ELIXIR_AVAILABLE) {
          available = false;
          statusBadge = `<span style="color:#c97c2a;font-size:10px">● Niedostępny dziś · zostało ${remaining}/5</span>`;
          borderOverride = "var(--epic)";
        } else {
          statusBadge = `<span style="color:var(--accent2);font-size:10px">● W sprzedaży! Zostało: ${remaining}/5</span>`;
          borderOverride = "var(--gold)";
        }
      }

      let limit      = getShopLimit(item);
      let bought     = getShopBought(item);
      let limitLeft  = limit - bought.count;
      let timeLeft   = shopTimeLeft(item);
      let rareAvail  = isRareShopAvailable(item);
      let available2 = limitLeft > 0 && rareAvail;
      let canAfford  = gold >= item.price && available && available2;
      let div = document.createElement("div");
      div.className = "shop-item";
      if (borderOverride) div.style.borderColor = borderOverride;

      // Dodatkowy opis dla slot items
      let extraDesc = "";
      if (item.isSlotShop) {
        extraDesc = `<div style="font-size:10px;color:var(--gold2);margin-top:2px">Bonus +0–10 losowany przy zakupie</div>`;
      }

      div.innerHTML = `
        <div class="si-icon">${(typeof ITEM_ICONS_SVG!=="undefined"&&ITEM_ICONS_SVG[item.name])?`<div style="width:44px;height:44px">${ITEM_ICONS_SVG[item.name]}</div>`:item.icon}</div>
        <div class="si-name" ${item.globalLimit?`style="color:var(--gold)"`:""}>${item.name} ${statusBadge}</div>
        <div class="si-desc">${item.desc}</div>
        ${extraDesc}
        <div class="si-price">💰 ${item.price} złota</div>
        <button class="si-buy ${canAfford?"btn-gold":""}" ${canAfford?"":"disabled"} onclick="buyItem(${i})">
          ${!available?"Niedostępny":canAfford?"Kup":"Za mało złota"}
        </button>
      `;
      itemsGrid.appendChild(div);
    });
  });

  // Ukryj sekcję koni
  let horsesSection = document.getElementById("shopHorsesSection");
  if (horsesSection) horsesSection.style.display = "none";
}
