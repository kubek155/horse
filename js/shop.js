// Globalny licznik eliksirów odmłodzenia (wspólny dla wszystkich "graczy" na tej przeglądarce)
function getElixirSold() {
  return parseInt(localStorage.getItem("hh_elixir_sold")) || 0;
}
function addElixirSold() {
  localStorage.setItem("hh_elixir_sold", getElixirSold() + 1);
}

// Losowa dostępność eliksiru — 10% szans per sesję, jeśli nie wyczerpany
const ELIXIR_AVAILABLE = Math.random() < 0.10 && getElixirSold() < 5;

function buyItem(idx) {
  let item = SHOP_ITEMS[idx];

  if (item.globalLimit) {
    if (!ELIXIR_AVAILABLE)        { log("⚠️ Eliksir Odmłodzenia niedostępny w tej chwili!"); return; }
    if (getElixirSold() >= item.globalLimit) { log("⚠️ Globalny limit sprzedaży wyczerpany!"); return; }
  }

  if (gold < item.price) { log("⚠️ Za mało złota!"); return; }
  gold -= item.price;
  inventory.push({ name: item.name, obtained: Date.now() });

  if (item.globalLimit) addElixirSold();

  trackQuest("buy");
  saveGame();
  renderAll();
  log(`✅ Kupiono: ${item.icon} ${item.name}!`);
}

function buyHorse(idx) {
  let entry = SHOP_HORSES[idx];
  if (playerHorses.length >= STABLE_LIMIT) { log(`⚠️ Stajnia pełna! (${STABLE_LIMIT}/${STABLE_LIMIT})`); return; }
  if (gold < entry.price) { log("⚠️ Za mało złota!"); return; }
  gold -= entry.price;
  let h = generateHorse(entry.rarity);
  playerHorses.push(h);
  saveGame();
  renderAll();
  log(`🐴 Kupiono: ${h.name} (${HORSE_DATABASE[h.group].name})!`);
}

function renderShop() {
  document.querySelectorAll("#goldCount, #shopGoldDisplay").forEach(el => {
    if (el) el.textContent = gold;
  });

  let itemsGrid = document.getElementById("shopItemsGrid");
  if (!itemsGrid) return;
  itemsGrid.innerHTML = "";

  let elixirSold = getElixirSold();

  SHOP_ITEMS.forEach((item, i) => {
    let available = true;
    let statusBadge = "";
    let borderOverride = "";

    if (item.globalLimit) {
      let remaining = item.globalLimit - elixirSold;
      if (remaining <= 0) {
        available = false;
        statusBadge = `<span style="color:#c94a4a;font-size:11px">● Wyprzedany globalnie</span>`;
      } else if (!ELIXIR_AVAILABLE) {
        available = false;
        statusBadge = `<span style="color:#c97c2a;font-size:11px">● Niedostępny dziś (${remaining} szt. pozostało)</span>`;
        borderOverride = "var(--epic)";
      } else {
        statusBadge = `<span style="color:var(--accent2);font-size:11px">● Dostępny! Pozostało globalnie: ${remaining} szt.</span>`;
        borderOverride = "var(--gold)";
      }
    }

    let canAfford = gold >= item.price && available;
    let div = document.createElement("div");
    div.className = "shop-item";
    if (borderOverride) div.style.borderColor = borderOverride;

    div.innerHTML = `
      <div class="si-icon">${item.icon}</div>
      <div class="si-name" ${item.globalLimit ? `style="color:var(--gold)"` : ""}>${item.name} ${statusBadge}</div>
      <div class="si-desc">${item.desc}</div>
      <div class="si-price">💰 ${item.price} złota</div>
      <button class="si-buy ${canAfford ? "btn-gold" : ""}" ${canAfford ? "" : "disabled"} onclick="buyItem(${i})">
        ${!available ? "Niedostępny" : canAfford ? "Kup" : "Za mało złota"}
      </button>
    `;
    itemsGrid.appendChild(div);
  });

  let horsesGrid = document.getElementById("shopHorsesGrid");
  if (!horsesGrid) return;
  horsesGrid.innerHTML = "";
  const rarityColors = { common:"#8aab84", rare:"#7b5ea7", epic:"#c97c2a", legendary:"#c9a84c" };

  SHOP_HORSES.forEach((entry, i) => {
    let canAfford = gold >= entry.price && playerHorses.length < STABLE_LIMIT;
    let col = rarityColors[entry.rarity];
    let div = document.createElement("div");
    div.className = "shop-item";
    div.style.borderColor = canAfford ? col : "";
    div.innerHTML = `
      <div class="si-icon">${entry.icon}</div>
      <div class="si-name" style="color:${col}">${entry.label}</div>
      <div class="si-desc">${entry.desc}</div>
      <div class="si-price">💰 ${entry.price} złota</div>
      <button class="si-buy" style="${canAfford ? `border-color:${col};color:${col}` : ""}" ${canAfford ? "" : "disabled"} onclick="buyHorse(${i})">
        ${playerHorses.length >= STABLE_LIMIT ? "Stajnia pełna" : canAfford ? "Kup" : "Za mało złota"}
      </button>
    `;
    horsesGrid.appendChild(div);
  });
}
