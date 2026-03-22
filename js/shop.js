// Globalny licznik eliksirów odmłodzenia
function getElixirSold() {
  return parseInt(localStorage.getItem("hh_elixir_sold")) || 0;
}
function addElixirSold() {
  localStorage.setItem("hh_elixir_sold", getElixirSold() + 1);
}

const ELIXIR_AVAILABLE = Math.random() < 0.10 && getElixirSold() < 5;

function buyItem(idx) {
  let item = SHOP_ITEMS[idx];
  if (item.globalLimit) {
    if (!ELIXIR_AVAILABLE)                   { log("⚠️ Eliksir Odmłodzenia niedostępny dziś!"); return; }
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
        statusBadge = `<span style="color:#c94a4a;font-size:11px">● Wyprzedany globalnie (0 szt.)</span>`;
      } else if (!ELIXIR_AVAILABLE) {
        available = false;
        statusBadge = `<span style="color:#c97c2a;font-size:11px">● Niedostępny dziś · pozostało ${remaining}/5 szt.</span>`;
        borderOverride = "var(--epic)";
      } else {
        statusBadge = `<span style="color:var(--accent2);font-size:11px">● W sprzedaży! Zostało: ${remaining}/5 szt.</span>`;
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

  // Ukryj sekcję koni (usunięte ze sklepu)
  let horsesSection = document.getElementById("shopHorsesSection");
  if (horsesSection) horsesSection.style.display = "none";
}
