// Losowy stan dostępności rzadkich przedmiotów (odświeża się co sesję)
const SHOP_RARE_STOCK = {};
SHOP_ITEMS.forEach((item, i) => {
  if (item.rare) SHOP_RARE_STOCK[i] = Math.random() < 0.25; // 25% szans że jest w sprzedaży
});

// =====================
// KUP PRZEDMIOT
// =====================
function buyItem(idx) {
  let item = SHOP_ITEMS[idx];
  if (item.rare && !SHOP_RARE_STOCK[idx]) { log("⚠️ Niedostępny w tej chwili!"); return; }
  if (gold < item.price)                  { log("⚠️ Za mało złota!"); return; }
  gold -= item.price;
  inventory.push({ name: item.name, obtained: Date.now() });
  saveGame();
  renderAll();
  log(`✅ Kupiono: ${item.icon} ${item.name}!`);
}

// =====================
// KUP KONIA
// =====================
function buyHorse(idx) {
  let entry = SHOP_HORSES[idx];
  if (gold < entry.price) { log("⚠️ Za mało złota!"); return; }
  gold -= entry.price;
  let h = generateHorse(entry.rarity);
  playerHorses.push(h);
  saveGame();
  renderAll();
  log(`🐴 Kupiono: ${h.name} (${HORSE_DATABASE[h.group].name})!`);
}

// =====================
// RENDER SKLEPU
// =====================
function renderShop() {
  // Aktualizuj złoto wszędzie
  document.querySelectorAll("#goldCount, #shopGoldDisplay").forEach(el => {
    if (el) el.textContent = gold;
  });

  // --- Przedmioty ---
  let itemsGrid = document.getElementById("shopItemsGrid");
  if (!itemsGrid) return;
  itemsGrid.innerHTML = "";

  SHOP_ITEMS.forEach((item, i) => {
    let inStock   = !item.rare || SHOP_RARE_STOCK[i];
    let canAfford = gold >= item.price && inStock;
    let div       = document.createElement("div");
    div.className = "shop-item";
    if (item.rare) div.style.borderColor = inStock ? "var(--gold)" : "var(--border)";

    let stockBadge = item.rare
      ? (inStock
          ? `<span style="color:var(--accent2);font-size:11px">● W sprzedaży</span>`
          : `<span style="color:#c94a4a;font-size:11px">● Niedostępny</span>`)
      : "";

    div.innerHTML = `
      <div class="si-icon">${item.icon}</div>
      <div class="si-name" ${item.rare ? `style="color:var(--gold)"` : ""}>${item.name} ${stockBadge}</div>
      <div class="si-desc">${item.desc}</div>
      <div class="si-price">💰 ${item.price} złota</div>
      <button class="si-buy ${canAfford ? "btn-gold" : ""}" ${canAfford ? "" : "disabled"} onclick="buyItem(${i})">
        ${!inStock ? "Niedostępny" : canAfford ? "Kup" : "Za mało złota"}
      </button>
    `;
    itemsGrid.appendChild(div);
  });

  // --- Konie ---
  let horsesGrid = document.getElementById("shopHorsesGrid");
  if (!horsesGrid) return;
  horsesGrid.innerHTML = "";

  const rarityColors = { common:"#8aab84", rare:"#7b5ea7", epic:"#c97c2a", legendary:"#c9a84c" };

  SHOP_HORSES.forEach((entry, i) => {
    let canAfford = gold >= entry.price;
    let col       = rarityColors[entry.rarity];
    let div       = document.createElement("div");
    div.className = "shop-item";
    div.style.borderColor = canAfford ? col : "";

    div.innerHTML = `
      <div class="si-icon">${entry.icon}</div>
      <div class="si-name" style="color:${col}">${entry.label}</div>
      <div class="si-desc">${entry.desc}</div>
      <div class="si-price">💰 ${entry.price} złota</div>
      <button class="si-buy" style="${canAfford ? `border-color:${col};color:${col}` : ""}" ${canAfford ? "" : "disabled"} onclick="buyHorse(${i})">
        ${canAfford ? "Kup" : "Za mało złota"}
      </button>
    `;
    horsesGrid.appendChild(div);
  });
}
