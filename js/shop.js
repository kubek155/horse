function getElixirSold() { return parseInt(localStorage.getItem("hh_elixir_sold"))||0; }
function addElixirSold()  { localStorage.setItem("hh_elixir_sold", getElixirSold()+1); }
const ELIXIR_AVAILABLE = Math.random() < 0.10 && getElixirSold() < 5;

function buyItem(idx) {
  let item = SHOP_ITEMS[idx];
  if (item.globalLimit) {
    if (!ELIXIR_AVAILABLE)                   { log("⚠️ Eliksir Odmłodzenia niedostępny dziś!"); return; }
    if (getElixirSold() >= item.globalLimit) { log("⚠️ Globalny limit sprzedaży wyczerpany!"); return; }
  }
  if (gold < item.price) { log("⚠️ Za mało złota!"); return; }
  gold -= item.price;

  // Slot items — generuj z losowym bonusem
  if (item.isSlotShop) {
    inventory.push(generateSlotItem(item.name));
    log(`✅ Kupiono: ${item.icon} ${item.name} (bonus losowany)!`);
  } else {
    inventory.push({ name: item.name, obtained: Date.now() });
    log(`✅ Kupiono: ${item.icon} ${item.name}!`);
  }

  if (item.globalLimit) addElixirSold();
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
    { label: "🍏 Hodowla",           filter: i => ITEMS_DATABASE[i.name]?.isBreedItem },
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

      let canAfford = gold >= item.price && available;
      let div = document.createElement("div");
      div.className = "shop-item";
      if (borderOverride) div.style.borderColor = borderOverride;

      // Dodatkowy opis dla slot items
      let extraDesc = "";
      if (item.isSlotShop) {
        extraDesc = `<div style="font-size:10px;color:var(--gold2);margin-top:2px">Bonus +0–10 losowany przy zakupie</div>`;
      }

      div.innerHTML = `
        <div class="si-icon">${item.icon}</div>
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
