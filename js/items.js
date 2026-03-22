// =====================
// MODAL PICKER
// =====================
let pendingItemIdx = null;

function openHorsePicker(itemIdx) {
  let item = inventory[itemIdx];
  if (!item) return;

  // Skrzynka nie wymaga wyboru konia — otwiera się od razu
  if (item.name === "Skrzynka z Łupem") {
    openLootBox(itemIdx);
    return;
  }

  if (playerHorses.length === 0) { log("⚠️ Brak koni!"); return; }

  pendingItemIdx = itemIdx;
  let data   = ITEMS_DATABASE[item.name] || { icon: "📦" };
  let isFood = !!(data.isFood);

  document.getElementById("modalTitle").textContent    = `${data.icon} ${item.name}`;
  document.getElementById("modalSubtitle").textContent = isFood
    ? "Wybierz konia do nakarmienia:"
    : "Na którego konia użyć przedmiotu?";

  let list = document.getElementById("modalHorseList");
  list.innerHTML = "";

  playerHorses.forEach((h, hi) => {
    let age         = getHorseAgeDays(h);
    let hunger      = getHunger(h);
    let rarityColor = { common:"#8aab84", rare:"#7b5ea7", epic:"#c97c2a", legendary:"#c9a84c" }[h.group] || "#8aab84";
    let hungerColor = hunger > 70 ? "#c94a4a" : hunger > 40 ? "#c97c2a" : "#7ec870";

    let btn = document.createElement("button");
    btn.className = "modal-horse-btn";
    btn.innerHTML = `
      <span style="font-size:20px">🐴</span>
      <div style="flex:1">
        <div class="mh-name">${h.name} ${h.stars > 0 ? "⭐".repeat(h.stars) : ""}</div>
        <div class="mh-stats" style="color:${rarityColor}">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina}</div>
        ${isFood ? `<div style="font-size:11px;color:${hungerColor};margin-top:2px">🍽️ Głód: ${hunger}%</div>` : ""}
      </div>
      <div class="mh-age">🎂 ${age} dni</div>
    `;
    btn.onclick = () => { applyItemToHorse(pendingItemIdx, hi); closeModal(); };
    list.appendChild(btn);
  });

  document.getElementById("horsePickerModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("horsePickerModal").style.display = "none";
  pendingItemIdx = null;
}

// =====================
// APPLY ITEM TO HORSE
// =====================
function applyItemToHorse(itemIdx, horseIdx) {
  let item = inventory[itemIdx];
  let h    = playerHorses[horseIdx];
  if (!item || !h) return;

  if (item.name === "Jabłko" || item.name === "Słoma") {
    feedHorse(horseIdx, item.name);
  } else if (item.name === "Eliksir Odmłodzenia") {
    let age    = getHorseAgeDays(h);
    let reduce = Math.min(120, Math.floor(age / 3) + 20);
    h.born    += reduce * 86400000;
    log(`🧪 Odmłodzono ${h.name} o ${reduce} dni!`);
  } else if (item.name === "Eliksir Szybkości") {
    h.stats.speed    += 5;
    log(`⚡ ${h.name}: +5 szybkości!`);
  } else if (item.name === "Eliksir Siły") {
    h.stats.strength += 5;
    log(`💪 ${h.name}: +5 siły!`);
  } else if (item.name === "Eliksir Wytrzymałości") {
    h.stats.stamina  += 5;
    log(`❤️ ${h.name}: +5 wytrzymałości!`);
  } else if (item.name === "Eliksir Szczęścia") {
    if (!h.stats.luck) h.stats.luck = 5;
    h.stats.luck += 5;
    log(`🍀 ${h.name}: +5 szczęścia!`);
  } else {
    log(`✨ Użyto ${item.name} na ${h.name}!`);
  }

  inventory.splice(itemIdx, 1);
  saveGame();
  renderAll();
}

// =====================
// LOOT BOX
// =====================
function openLootBox(itemIdx) {
  let r = Math.random() * 100;
  if (r < 66) {
    if (playerHorses.length >= STABLE_LIMIT) {
      log(`📦 Skrzynka: Znaleziono konia, ale stajnia pełna!`);
    } else {
      let h = generateHorse();
      playerHorses.push(h);
      log(`📦 Skrzynka: Nowy koń — ${h.name}!`);
    }
  } else if (r < 80) {
    inventory.push({ name: "Eliksir Odmłodzenia", obtained: Date.now() });
    log(`📦 Skrzynka: Eliksir Odmłodzenia! 🧪`);
  } else {
    let statItems = ["Eliksir Szybkości", "Eliksir Siły", "Eliksir Wytrzymałości", "Eliksir Szczęścia"];
    let picked    = statItems[Math.floor(Math.random() * statItems.length)];
    inventory.push({ name: picked, obtained: Date.now() });
    log(`📦 Skrzynka: ${ITEMS_DATABASE[picked].icon} ${picked}!`);
  }
  inventory.splice(itemIdx, 1);
  trackQuest("lootbox");
  saveGame();
  renderAll();
}

// =====================
// RENDER INVENTORY
// =====================
function renderInventory() {
  let el = document.getElementById("inventoryGrid");
  document.getElementById("invCount").textContent = inventory.length;

  if (inventory.length === 0) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🎒</div>Ekwipunek jest pusty</div>`;
    return;
  }

  el.innerHTML = "";
  inventory.forEach((item, idx) => {
    let data = ITEMS_DATABASE[item.name] || { icon: "📦", desc: "" };
    let div  = document.createElement("div");
    div.className = "inv-item";
    div.innerHTML = `
      <span class="inv-icon">${data.icon}</span>
      <span class="inv-name">${item.name}</span>
      <div style="display:flex;gap:4px;margin-top:6px">
        <button style="flex:1;font-size:11px;padding:4px 6px" onclick="openHorsePicker(${idx})">Użyj</button>
        <button style="flex:1;font-size:11px;padding:4px 6px;border-color:#7b5ea7;color:#b090e0;background:rgba(123,94,167,0.1)" onclick="openListItem(${idx})">🏪</button>
      </div>
    `;
    el.appendChild(div);
  });
}

// alias
function useItem(idx) { openHorsePicker(idx); }
