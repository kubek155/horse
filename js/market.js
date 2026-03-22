// =====================
// NPC NAMES
// =====================
const NPC_NAMES = ["Marek K.", "Zuzanna P.", "Tomasz W.", "Ania M.", "Bartek S.", "Kasia L."];

// =====================
// SEED NPC OFFERS
// =====================
function seedMarket() {
  // Kilka ofert NPC żeby rynek nie był pusty na start
  const npcItems = ["Jabłko", "Słoma", "Eliksir Szybkości", "Skrzynka z Łupem", "Eliksir Odmłodzenia"];

  for (let i = 0; i < 4; i++) {
    let name   = NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)];
    let isHorse = Math.random() < 0.4;
    if (isHorse) {
      let h = generateHorse();
      market.push({
        id:         `npc_${Date.now()}_${i}`,
        sellerId:   "npc",
        sellerName: name,
        type:       "horse",
        horse:      h,
        price:      calcHorsePrice(h),
        listedAt:   Date.now()
      });
    } else {
      let itemName = npcItems[Math.floor(Math.random() * npcItems.length)];
      let data     = ITEMS_DATABASE[itemName] || { icon: "📦" };
      let basePrice = { "Jabłko": 40, "Słoma": 20, "Eliksir Szybkości": 180, "Skrzynka z Łupem": 250, "Eliksir Odmłodzenia": 1200 };
      market.push({
        id:         `npc_${Date.now()}_${i}`,
        sellerId:   "npc",
        sellerName: name,
        type:       "item",
        item:       { name: itemName, obtained: Date.now() },
        price:      (basePrice[itemName] || 100) + Math.floor(Math.random() * 50),
        listedAt:   Date.now()
      });
    }
  }
}

function calcHorsePrice(h) {
  let base = { common: 120, rare: 450, epic: 1400, legendary: 5000 }[h.group] || 120;
  let statSum = h.stats.speed + h.stats.strength + h.stats.stamina;
  let starBonus = h.stars * 300;
  return base + Math.floor(statSum * 1.5) + starBonus + Math.floor(Math.random() * 100);
}

// =====================
// LIST MODAL STATE
// =====================
let listingTarget = null; // { type: 'horse'|'item', idx }

function openListHorse(horseIdx) {
  listingTarget = { type: "horse", idx: horseIdx };
  let h = playerHorses[horseIdx];
  let suggested = calcHorsePrice(h);
  document.getElementById("listModalTitle").textContent    = `🐴 Wystaw: ${h.name}`;
  document.getElementById("listModalSubtitle").textContent = `${HORSE_DATABASE[h.group].name} · ⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina}`;
  document.getElementById("listPriceInput").value          = suggested;
  document.getElementById("listModal").style.display       = "flex";
}

function openListItem(itemIdx) {
  listingTarget = { type: "item", idx: itemIdx };
  let item = inventory[itemIdx];
  let data = ITEMS_DATABASE[item.name] || { icon: "📦" };
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
    market.push({
      id:         `player_${Date.now()}`,
      sellerId:   "player",
      sellerName: "Ty",
      type:       "horse",
      horse:      JSON.parse(JSON.stringify(h)), // kopia
      price,
      listedAt:   Date.now()
    });
    playerHorses.splice(listingTarget.idx, 1);
    log(`🏪 Wystawiono ${h.name} za ${price} złota!`);
  } else {
    let item = inventory[listingTarget.idx];
    if (!item) return;
    let data = ITEMS_DATABASE[item.name] || { icon: "📦" };
    market.push({
      id:         `player_${Date.now()}`,
      sellerId:   "player",
      sellerName: "Ty",
      type:       "item",
      item:       JSON.parse(JSON.stringify(item)),
      price,
      listedAt:   Date.now()
    });
    inventory.splice(listingTarget.idx, 1);
    log(`🏪 Wystawiono ${data.icon} ${item.name} za ${price} złota!`);
  }

  closeListModal();
  saveGame();
  renderAll();
}

// =====================
// BUY FROM MARKET
// =====================
function buyFromMarket(offerId) {
  let idx   = market.findIndex(o => o.id === offerId);
  if (idx === -1) return;
  let offer = market[idx];

  if (offer.sellerId === "player") { log("⚠️ To Twoja własna oferta!"); return; }
  if (gold < offer.price)          { log("⚠️ Za mało złota!"); return; }

  if (offer.type === "horse") {
    if (playerHorses.length >= STABLE_LIMIT) { log(`⚠️ Stajnia pełna! (${STABLE_LIMIT}/${STABLE_LIMIT})`); return; }
    playerHorses.push(offer.horse);
    log(`🐴 Kupiono: ${offer.horse.name} od ${offer.sellerName}!`);
  } else {
    inventory.push(offer.item);
    log(`🎒 Kupiono: ${offer.item.name} od ${offer.sellerName}!`);
  }

  gold -= offer.price;
  market.splice(idx, 1);
  saveGame();
  renderAll();
}

// =====================
// CANCEL OWN LISTING
// =====================
function cancelListing(offerId) {
  let idx   = market.findIndex(o => o.id === offerId);
  if (idx === -1) return;
  let offer = market[idx];
  if (offer.sellerId !== "player") return;

  if (offer.type === "horse") {
    if (playerHorses.length >= STABLE_LIMIT) {
      log("⚠️ Stajnia pełna — nie możesz anulować oferty konia!");
      return;
    }
    playerHorses.push(offer.horse);
    log(`↩️ Anulowano ofertę — ${offer.horse.name} wrócił do stajni.`);
  } else {
    inventory.push(offer.item);
    log(`↩️ Anulowano ofertę — ${offer.item.name} wrócił do ekwipunku.`);
  }

  market.splice(idx, 1);
  saveGame();
  renderAll();
}

// =====================
// RENDER MARKET
// =====================
function renderMarket() {
  let el = document.getElementById("marketListings");
  if (!el) return;

  // Filtr
  let filter = document.getElementById("marketFilter") ? document.getElementById("marketFilter").value : "all";
  let shown  = market.filter(o => filter === "all" || o.type === filter);

  if (shown.length === 0) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🏪</div>Brak ofert — wystaw coś ze stajni lub ekwipunku!</div>`;
    return;
  }

  el.innerHTML = "";
  const rarityColors = { common:"#8aab84", rare:"#7b5ea7", epic:"#c97c2a", legendary:"#c9a84c" };

  shown.forEach(offer => {
    let isOwn = offer.sellerId === "player";
    let div   = document.createElement("div");
    div.className = "market-card" + (isOwn ? " market-own" : "");

    if (offer.type === "horse") {
      let h   = offer.horse;
      let col = rarityColors[h.group] || "#8aab84";
      div.innerHTML = `
        <div class="mc-header">
          <span class="mc-icon">🐴</span>
          <div>
            <div class="mc-name" style="color:${col}">${h.name} ${h.stars > 0 ? "⭐".repeat(h.stars) : ""}</div>
            <div class="mc-sub">${HORSE_DATABASE[h.group]?.name || h.group} · 🎂 ${getHorseAgeDays(h)} dni</div>
          </div>
          ${isOwn ? `<span class="mc-badge">Twoja oferta</span>` : `<span class="mc-seller">👤 ${offer.sellerName}</span>`}
        </div>
        <div class="mc-stats">⚡ ${h.stats.speed} &nbsp; 💪 ${h.stats.strength} &nbsp; ❤️ ${h.stats.stamina}</div>
        <div class="mc-footer">
          <span class="mc-price">💰 ${offer.price}</span>
          ${isOwn
            ? `<button onclick="cancelListing('${offer.id}')" style="border-color:#c94a4a;color:#c94a4a;background:rgba(201,74,74,0.1)">Anuluj</button>`
            : `<button class="btn-gold" onclick="buyFromMarket('${offer.id}')">Kup</button>`}
        </div>
      `;
    } else {
      let data = ITEMS_DATABASE[offer.item.name] || { icon: "📦", desc: "" };
      div.innerHTML = `
        <div class="mc-header">
          <span class="mc-icon">${data.icon}</span>
          <div>
            <div class="mc-name">${offer.item.name}</div>
            <div class="mc-sub">${data.desc}</div>
          </div>
          ${isOwn ? `<span class="mc-badge">Twoja oferta</span>` : `<span class="mc-seller">👤 ${offer.sellerName}</span>`}
        </div>
        <div class="mc-footer">
          <span class="mc-price">💰 ${offer.price}</span>
          ${isOwn
            ? `<button onclick="cancelListing('${offer.id}')" style="border-color:#c94a4a;color:#c94a4a;background:rgba(201,74,74,0.1)">Anuluj</button>`
            : `<button class="btn-gold" onclick="buyFromMarket('${offer.id}')">Kup</button>`}
        </div>
      `;
    }

    el.appendChild(div);
  });
}
