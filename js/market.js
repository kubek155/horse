const NPC_NAMES = ["Marek K.", "Zuzanna P.", "Tomasz W.", "Ania M.", "Bartek S.", "Kasia L."];

// =====================
// SEED NPC OFFERS
// =====================
function seedMarket() {
  const npcItems = ["Jabłko", "Słoma", "Eliksir Szybkości", "Skrzynka z Łupem", "Eliksir Odmłodzenia", "Eliksir Szczęścia"];
  for (let i = 0; i < 5; i++) {
    let name    = NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)];
    let isHorse = Math.random() < 0.5;
    if (isHorse) {
      let h = generateHorse();
      market.push({ id:`npc_${Date.now()}_${i}`, sellerId:"npc", sellerName:name, type:"horse", horse:h, price:calcHorsePrice(h), listedAt:Date.now() });
    } else {
      let itemName  = npcItems[Math.floor(Math.random() * npcItems.length)];
      let basePrice = { "Jabłko":40,"Słoma":20,"Eliksir Szybkości":180,"Skrzynka z Łupem":250,"Eliksir Odmłodzenia":1200,"Eliksir Szczęścia":180 };
      market.push({ id:`npc_${Date.now()}_${i}`, sellerId:"npc", sellerName:name, type:"item", item:{name:itemName,obtained:Date.now()}, price:(basePrice[itemName]||100)+Math.floor(Math.random()*50), listedAt:Date.now() });
    }
  }
}

function calcHorsePrice(h) {
  let base     = { common:120, rare:450, epic:1400, legendary:5000 }[h.group] || 120;
  let statSum  = (h.stats.speed||0) + (h.stats.strength||0) + (h.stats.stamina||0) + (h.stats.luck||0);
  let starBonus = (h.stars||0) * 300;
  return base + Math.floor(statSum * 1.5) + starBonus + Math.floor(Math.random() * 100);
}

// =====================
// FILTER STATE
// =====================
let marketFilters = {
  type:     "all",   // all | horse | item
  rarity:   "all",   // all | common | rare | epic | legendary
  sortBy:   "mine",  // mine | price_asc | price_desc | stat_speed | stat_strength | stat_stamina | stat_luck
};

function setMarketFilter(key, val) {
  marketFilters[key] = val;
  // sync button active states
  document.querySelectorAll(`[data-filter="${key}"]`).forEach(b => {
    b.classList.toggle("active", b.dataset.val === val);
  });
  renderMarket();
}

// =====================
// LIST MODAL
// =====================
let listingTarget = null;

function openListHorse(horseIdx) {
  listingTarget = { type:"horse", idx:horseIdx };
  let h = playerHorses[horseIdx];
  document.getElementById("listModalTitle").textContent    = `🐴 Wystaw: ${h.name}`;
  document.getElementById("listModalSubtitle").textContent = `${HORSE_DATABASE[h.group]?.name} · ⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck||0}`;
  document.getElementById("listPriceInput").value          = calcHorsePrice(h);
  document.getElementById("listModal").style.display       = "flex";
}

function openListItem(itemIdx) {
  listingTarget = { type:"item", idx:itemIdx };
  let item = inventory[itemIdx];
  let data = ITEMS_DATABASE[item.name] || { icon:"📦" };
  document.getElementById("listModalTitle").textContent    = `${data.icon} Wystaw: ${item.name}`;
  document.getElementById("listModalSubtitle").textContent = data.desc || "";
  document.getElementById("listPriceInput").value          = 100;
  document.getElementById("listModal").style.display       = "flex";
}

function closeListModal() {
  document.getElementById("listModal").style.display = "none";
  listingTarget = null;
}

function confirmListing() {
  if (!listingTarget) return;
  let price = parseInt(document.getElementById("listPriceInput").value);
  if (!price || price < 1) { log("⚠️ Podaj prawidłową cenę!"); return; }

  if (listingTarget.type === "horse") {
    let h = playerHorses[listingTarget.idx];
    if (!h) return;
    market.push({ id:`player_${Date.now()}`, sellerId:"player", sellerName:"Ty", type:"horse", horse:JSON.parse(JSON.stringify(h)), price, listedAt:Date.now() });
    playerHorses.splice(listingTarget.idx, 1);
    log(`🏪 Wystawiono ${h.name} za ${price} złota!`);
  } else {
    let item = inventory[listingTarget.idx];
    if (!item) return;
    let data = ITEMS_DATABASE[item.name] || { icon:"📦" };
    market.push({ id:`player_${Date.now()}`, sellerId:"player", sellerName:"Ty", type:"item", item:JSON.parse(JSON.stringify(item)), price, listedAt:Date.now() });
    inventory.splice(listingTarget.idx, 1);
    log(`🏪 Wystawiono ${data.icon} ${item.name} za ${price} złota!`);
  }

  closeListModal();
  trackQuest("market");
  saveGame();
  renderAll();
}

// =====================
// BUY / CANCEL
// =====================
function buyFromMarket(offerId) {
  let idx   = market.findIndex(o => o.id === offerId);
  if (idx === -1) return;
  let offer = market[idx];
  if (offer.sellerId === "player") { log("⚠️ To Twoja własna oferta!"); return; }
  if (gold < offer.price)          { log("⚠️ Za mało złota!"); return; }
  if (offer.type === "horse") {
    if (playerHorses.length >= STABLE_LIMIT) { log(`⚠️ Stajnia pełna!`); return; }
    playerHorses.push(offer.horse);
    log(`🐴 Kupiono: ${offer.horse.name} od ${offer.sellerName}!`);
  } else {
    inventory.push(offer.item);
    log(`🎒 Kupiono: ${offer.item.name} od ${offer.sellerName}!`);
  }
  gold -= offer.price;
  market.splice(idx, 1);
  saveGame(); renderAll();
}

function cancelListing(offerId) {
  let idx   = market.findIndex(o => o.id === offerId);
  if (idx === -1) return;
  let offer = market[idx];
  if (offer.sellerId !== "player") return;
  if (offer.type === "horse") {
    if (playerHorses.length >= STABLE_LIMIT) { log("⚠️ Stajnia pełna!"); return; }
    playerHorses.push(offer.horse);
    log(`↩️ ${offer.horse.name} wrócił do stajni.`);
  } else {
    inventory.push(offer.item);
    log(`↩️ ${offer.item.name} wrócił do ekwipunku.`);
  }
  market.splice(idx, 1);
  saveGame(); renderAll();
}

// =====================
// RENDER MARKET
// =====================
function renderMarket() {
  let el = document.getElementById("marketListings");
  if (!el) return;

  const RC = { common:"#8aab84", rare:"#7b5ea7", epic:"#c97c2a", legendary:"#c9a84c" };

  // --- filtrowanie ---
  let list = market.filter(o => {
    if (marketFilters.type !== "all" && o.type !== marketFilters.type) return false;
    if (marketFilters.rarity !== "all" && o.type === "horse" && o.horse.group !== marketFilters.rarity) return false;
    return true;
  });

  // --- sortowanie: własne zawsze na górze, potem wg sortBy ---
  list.sort((a, b) => {
    let aOwn = a.sellerId === "player" ? 0 : 1;
    let bOwn = b.sellerId === "player" ? 0 : 1;
    if (aOwn !== bOwn) return aOwn - bOwn;

    switch (marketFilters.sortBy) {
      case "price_asc":  return a.price - b.price;
      case "price_desc": return b.price - a.price;
      case "stat_speed":
        return ((b.horse?.stats.speed||0)) - ((a.horse?.stats.speed||0));
      case "stat_strength":
        return ((b.horse?.stats.strength||0)) - ((a.horse?.stats.strength||0));
      case "stat_stamina":
        return ((b.horse?.stats.stamina||0)) - ((a.horse?.stats.stamina||0));
      case "stat_luck":
        return ((b.horse?.stats.luck||0)) - ((a.horse?.stats.luck||0));
      default: // mine first = newest
        return b.listedAt - a.listedAt;
    }
  });

  // --- licznik własnych ofert ---
  let myCount = market.filter(o => o.sellerId === "player").length;
  let myEl    = document.getElementById("myListingsCount");
  if (myEl) myEl.textContent = myCount > 0 ? `Twoje oferty: ${myCount}` : "";

  if (list.length === 0) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🏪</div>Brak ofert pasujących do filtrów</div>`;
    return;
  }

  el.innerHTML = "";
  let lastWasOwn = false;

  list.forEach((offer, i) => {
    let isOwn = offer.sellerId === "player";

    // Separator między własnymi a resztą
    if (i > 0 && lastWasOwn && !isOwn) {
      let sep = document.createElement("div");
      sep.style.cssText = "grid-column:1/-1;border-top:1px dashed var(--border);margin:4px 0;padding-top:4px";
      sep.innerHTML = `<div style="font-size:11px;color:var(--text2);font-family:'Cinzel',serif;letter-spacing:1px;margin-bottom:8px">POZOSTAŁE OFERTY</div>`;
      el.appendChild(sep);
    }
    lastWasOwn = isOwn;

    let div = document.createElement("div");
    div.className = "market-card" + (isOwn ? " market-own" : "");

    if (offer.type === "horse") {
      let h   = offer.horse;
      let col = RC[h.group] || "#8aab84";
      let luckVal = h.stats.luck || 0;
      div.innerHTML = `
        <div class="mc-header">
          <span class="mc-icon">🐴</span>
          <div style="flex:1">
            <div class="mc-name" style="color:${col}">${h.name}${h.stars > 0 ? " " + "⭐".repeat(h.stars) : ""}${h.parents ? ` <span style="font-size:10px;opacity:0.7">· hodowany</span>` : ""}</div>
            <div class="mc-sub">${HORSE_DATABASE[h.group]?.name || h.group} · 🎂 ${getHorseAgeDays(h)} dni</div>
          </div>
          ${isOwn ? `<span class="mc-badge">Twoja oferta</span>` : `<span class="mc-seller">👤 ${offer.sellerName}</span>`}
        </div>
        <div class="mc-stats">⚡ ${h.stats.speed} &nbsp;💪 ${h.stats.strength} &nbsp;❤️ ${h.stats.stamina} &nbsp;🍀 ${luckVal}</div>
        ${h.mutation ? `<div style="font-size:10px;color:#80d0ff;padding:2px 0">🧬 Mutacja: ${h.mutation.name} (${h.mutation.donorFlag} ${h.mutation.donor})</div>` : ""}
        <div class="mc-footer">
          <span class="mc-price">💰 ${offer.price}</span>
          ${isOwn
            ? `<div style="display:flex;gap:6px;flex-direction:column">
            <button onclick="cancelListing('${offer.id}')" style="border-color:#c94a4a;color:#c94a4a;background:rgba(201,74,74,0.1);font-size:11px">Anuluj</button>
            <button onclick="listOnGlobalMarketFromLocal('${offer.id}')" style="border-color:#4a7ec8;color:#4a7ec8;background:rgba(74,126,200,0.1);font-size:10px">🌐 Globalnie</button>
          </div>`
            : `<button class="btn-gold" onclick="buyFromMarket('${offer.id}')">Kup</button>`}
        </div>
      `;
    } else {
      let data    = ITEMS_DATABASE[offer.item.name] || { icon:"📦", desc:"" };
      let statIcon = { speed:"⚡", strength:"💪", stamina:"❤️", luck:"🍀" }[data.stat] || "";
      // Dla slot itemów pokaż konkretny bonus zapisany w przedmiocie
      let bonusLine = (data.isSlotItem && offer.item.bonus !== undefined)
        ? `<div style="font-size:14px;color:var(--gold2);font-family:'Cinzel',serif;margin-top:2px">+${offer.item.bonus} ${statIcon}</div>`
        : "";
      // Opis: jeśli slot item — zastąp generyczny opis konkretnym bonusem
      let descLine = data.isSlotItem
        ? `Slot: ${statIcon} +${offer.item.bonus ?? "?"} do ${data.stat==="speed"?"szybkości":data.stat==="strength"?"siły":data.stat==="stamina"?"wytrzymałości":"szczęścia"}`
        : data.desc;

      div.innerHTML = `
        <div class="mc-header">
          <span class="mc-icon">${data.icon}</span>
          <div style="flex:1">
            <div class="mc-name">${offer.item.name}</div>
            <div class="mc-sub">${descLine}</div>
            ${bonusLine}
          </div>
          ${isOwn ? `<span class="mc-badge">Twoja oferta</span>` : `<span class="mc-seller">👤 ${offer.sellerName}</span>`}
        </div>
        <div class="mc-footer">
          <span class="mc-price">💰 ${offer.price}</span>
          ${isOwn
            ? `<div style="display:flex;gap:6px;flex-direction:column">
            <button onclick="cancelListing('${offer.id}')" style="border-color:#c94a4a;color:#c94a4a;background:rgba(201,74,74,0.1);font-size:11px">Anuluj</button>
            <button onclick="listOnGlobalMarketFromLocal('${offer.id}')" style="border-color:#4a7ec8;color:#4a7ec8;background:rgba(74,126,200,0.1);font-size:10px">🌐 Globalnie</button>
          </div>`
            : `<button class="btn-gold" onclick="buyFromMarket('${offer.id}')">Kup</button>`}
        </div>
      `;
    }
    el.appendChild(div);
  });
}
