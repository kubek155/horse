// =====================
// MODAL PICKER
// =====================
let pendingItemIdx = null;

function openHorsePicker(itemIdx) {
  let item = inventory[itemIdx];
  if (!item) return;

  // Skrzynka nie wymaga wyboru konia
  if (item.name === "Skrzynka z Łupem") { openLootBox(itemIdx); return; }

  // Przedmioty do slotów
  let itemData = ITEMS_DATABASE[item.name] || {};
  if (itemData.isSlotItem) {
    openSlotPickerForItem(itemIdx);
    return;
  }

  // Przepustki — pokaż info gdzie można użyć
  if (itemData.isPass) {
    log(`🎫 ${item.name} — użyj przy wyborze krainy "${itemData.location}" na Wyprawach.`);
    showSection("expedition");
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
    // Sprawdź czy eliksir już użyty na tym koniu
    let curItem  = inventory[pendingItemIdx] || {};
    let curData  = ITEMS_DATABASE[curItem.name] || {};
    let alreadyUsed = curData.isElixir && h.usedElixirs?.[curItem.name];
    let rarC = RARITY_COLORS[h.rarity]||"#8aab84";
    btn.innerHTML = `
      <span style="font-size:20px">${h.flag||"🐴"}</span>
      <div style="flex:1">
        <div class="mh-name" style="color:${rarC}">${h.name} ${h.stars > 0 ? "⭐".repeat(h.stars) : ""}</div>
        <div class="mh-stats" style="color:var(--text2)">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina}</div>
        ${isFood ? `<div style="font-size:11px;color:${hungerColor};margin-top:2px">🍽️ Głód: ${hunger}%</div>` : ""}
        ${alreadyUsed ? `<div style="font-size:11px;color:#c94a4a;margin-top:2px">✕ Już użyto na tym koniu</div>` : ""}
      </div>
      <div class="mh-age">🎂 ${age} dni</div>
    `;
    if (alreadyUsed) btn.disabled = true;
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

  // Sprawdź czy eliksir jednorazowy już był użyty na tym koniu
  let data = ITEMS_DATABASE[item.name] || {};
  if (data.isElixir) {
    if (!h.usedElixirs) h.usedElixirs = {};
    if (h.usedElixirs[item.name]) {
      log(`⚠️ ${h.name} już otrzymał ${item.name} — nie można użyć ponownie!`);
      return;
    }
    h.usedElixirs[item.name] = true;
  }

  if (item.name === "Jabłko" || item.name === "Słoma") {
    feedHorse(horseIdx, item.name);
  } else if (item.name === "Eliksir Odmłodzenia") {
    let age    = getHorseAgeDays(h);
    let reduce = Math.min(age - 1, Math.min(120, Math.floor(age / 3) + 20)); // nie cofaj poniżej 1 dnia
    if (reduce <= 0) { log(`⚠️ ${h.name} jest za młody na odmłodzenie!`); return; }
    h.born    += reduce * 86400000;
    // Zabezpieczenie — born nie może być w przyszłości
    if (h.born > Date.now() - 86400000) h.born = Date.now() - 86400000;
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
    h.stats.luck = Math.min(110, h.stats.luck + 5);
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
  // Animacja otwarcia skrzynki — wykonaj callback po animacji
  if (typeof showLootBoxAnimation === "function") {
    showLootBoxAnimation(() => _doOpenLootBox(itemIdx));
    return;
  }
  _doOpenLootBox(itemIdx);
}

function _doOpenLootBox(itemIdx) {
  let r = Math.random() * 100;
  let lootResult = { icon:"✨", name:"Nagroda!", desc:"", color:"#c9a84c" };

  if (r < 66) {
    if (playerHorses.length >= STABLE_LIMIT) {
      log(`📦 Skrzynka: Znaleziono konia, ale stajnia pełna!`);
      lootResult = { icon:"🐴", name:"Stajnia pełna!", desc:"Zwolnij miejsce na konia", color:"#c97c2a" };
    } else {
      let h = generateHorse();
      playerHorses.push(h);
      let rc = RARITY_COLORS[h.rarity]||"#8aab84";
      log(`📦 Skrzynka: Nowy koń — ${h.name}!`);
      // Generuj SVG konia dla wyniku loot boxa
      let horseSvgStr = (typeof drawHorseSVG === "function")
        ? drawHorseSVG(h.breedKey||h.name, h.rarity, h.stars)
        : null;
      lootResult = { svg: horseSvgStr, icon: h.flag||"🐴", name: h.name, desc: RARITY_LABELS[h.rarity]||h.rarity, color: rc };
      // Efekt rzadkości pokazany po zamknięciu loot box animacji
      lootResult._showRareEffect = { name: h.name, rarity: h.rarity, flag: h.flag };
    }
  } else if (r < 80) {
    inventory.push({ name: "Eliksir Odmłodzenia", obtained: Date.now() });
    log(`📦 Skrzynka: Eliksir Odmłodzenia! 🧪`);
    lootResult = { icon:"🧪", name:"Eliksir Odmłodzenia", desc:"Odmładza konia o 30–120 dni", color:"#c9a84c" };
  } else {
    let roll3 = Math.random();
    if (roll3 < 0.35) {
      // Eliksir statystyki
      let statItems = ["Eliksir Szybkości", "Eliksir Siły", "Eliksir Wytrzymałości", "Eliksir Szczęścia"];
      let picked    = statItems[Math.floor(Math.random() * statItems.length)];
      inventory.push({ name: picked, obtained: Date.now() });
      let d = ITEMS_DATABASE[picked]||{icon:"⚡",desc:""};
      log(`📦 Skrzynka: ${d.icon} ${picked}!`);
      let cols = { speed:"#4a7ec8", strength:"#c97c2a", stamina:"#c94a4a", luck:"#4a9e6a" };
      lootResult = { icon: d.icon, name: picked, desc: d.desc, color: cols[d.stat]||"#7b5ea7" };
    } else if (roll3 < 0.70) {
      // Slot item
      let slotItems = ["Piorun","Kowadło","Koniczyna","Serce"];
      let picked    = slotItems[Math.floor(Math.random() * slotItems.length)];
      let generated = generateSlotItem(picked);
      inventory.push(generated);
      let d = ITEMS_DATABASE[picked]||{icon:"📦",desc:""};
      log(`📦 Skrzynka: ${d.icon} ${picked} (+${generated.bonus})!`);
      let cols = { speed:"#4a7ec8", strength:"#c97c2a", stamina:"#c94a4a", luck:"#4a9e6a" };
      lootResult = { icon: d.icon, name: `${picked} +${generated.bonus}`, desc: d.desc, color: cols[d.stat]||"#c9a84c" };
    } else {
      // Przepustka (rzadka!)
      let passes = ["Leśna Przepustka","Pustynna Przepustka","Górska Przepustka"];
      let picked  = passes[Math.floor(Math.random() * passes.length)];
      inventory.push({ name: picked, obtained: Date.now() });
      let d = ITEMS_DATABASE[picked]||{icon:"🎫",desc:""};
      log(`📦 Skrzynka: ${d.icon} ${picked}!`);
      lootResult = { icon: d.icon, name: picked, desc: d.desc, color: "#4a9e6a" };
    }
  }

  window._lastLootResult = lootResult;
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
    let data    = ITEMS_DATABASE[item.name] || { icon:"📦", desc:"" };
    let isSlot  = !!data.isSlotItem;
    let isFood  = !!data.isFood;
    let statIcon = { speed:"⚡", strength:"💪", stamina:"❤️", luck:"🍀" }[data.stat] || "";

    // Bonus tag — dla slot itemów
    let bonusHtml = (isSlot && item.bonus !== undefined)
      ? `<div class="inv-bonus">+${item.bonus} ${statIcon}</div>`
      : "";

    // Przycisk akcji
    let isPass  = !!data.isPass;
    let useLabel = isFood ? "🍎 Karm" : isSlot ? "✨ Slot" : isPass ? "🎫 Info" : "Użyj";

    let div = document.createElement("div");
    div.className = "inv-item";
    div.innerHTML = `
      <span class="inv-icon">${data.icon}</span>
      <span class="inv-name">${item.name}</span>
      ${bonusHtml}
      <div class="inv-actions">
        <button onclick="openHorsePicker(${idx})">${useLabel}</button>
        <button style="border-color:#7b5ea7;color:#b090e0;background:rgba(123,94,167,0.1)" onclick="openListItem(${idx})">🏪</button>
      </div>
    `;
    el.appendChild(div);
  });
}

// alias
function useItem(idx) { openHorsePicker(idx); }

// =====================
// SLOT PICKER
// =====================
const SLOT_ITEMS = ["Eliksir Szybkości","Eliksir Siły","Eliksir Wytrzymałości","Eliksir Szczęścia","Piorun","Kowadło","Koniczyna","Serce"];

let pendingSlot = null; // { horseIdx, slotIdx }

// Otwiera picker wyboru konia dla itemu (przedmiot inicjuje wybór konia)
function openSlotPickerForItem(itemIdx) {
  if (playerHorses.length === 0) { log("⚠️ Brak koni z wolnymi slotami!"); return; }
  let horsesWithSlots = playerHorses
    .map((h,i)=>({h,i}))
    .filter(({h}) => h.itemSlots > 0 && (h.equippedItems||[]).some(s=>s===null));

  if (!horsesWithSlots.length) { log("⚠️ Żaden koń nie ma wolnego slotu!"); return; }

  // Jeśli tylko jeden koń z wolnym slotem — od razu wybierz
  if (horsesWithSlots.length === 1) {
    let {h, i} = horsesWithSlots[0];
    let slotIdx = (h.equippedItems||[]).findIndex(s=>s===null);
    equipItemToSlot(i, slotIdx, itemIdx);
    return;
  }

  // Picker konia
  pendingItemIdx = itemIdx;
  document.getElementById("modalTitle").textContent    = "✨ Wybierz konia do slotu";
  document.getElementById("modalSubtitle").textContent = "Który koń ma otrzymać przedmiot?";
  let list = document.getElementById("modalHorseList");
  list.innerHTML = "";
  horsesWithSlots.forEach(({h, i}) => {
    let col = RARITY_COLORS[h.rarity]||"#8aab84";
    let freeSlots = (h.equippedItems||[]).filter(s=>s===null).length;
    let btn = document.createElement("button");
    btn.className = "modal-horse-btn";
    btn.innerHTML = `
      <span style="font-size:20px">${h.flag||"🐴"}</span>
      <div style="flex:1">
        <div class="mh-name" style="color:${col}">${h.name}</div>
        <div class="mh-stats">✨ Wolnych slotów: ${freeSlots}/${h.itemSlots}</div>
      </div>`;
    btn.onclick = () => {
      let slotIdx = (h.equippedItems||[]).findIndex(s=>s===null);
      equipItemToSlot(i, slotIdx, pendingItemIdx);
      closeModal();
    };
    list.appendChild(btn);
  });
  document.getElementById("horsePickerModal").style.display = "flex";
}

function openSlotPicker(horseIdx, slotIdx) {
  let h = playerHorses[horseIdx];
  if (!h) return;
  pendingSlot = { horseIdx, slotIdx };

  let rarCol = RARITY_COLORS[h.rarity] || "#8aab84";
  document.getElementById("slotPickerSubtitle").innerHTML =
    `<span style="color:${rarCol}">${h.flag||"🐴"} ${h.name}</span> — Slot ${slotIdx+1}/${h.itemSlots}`;

  // Tylko elixiry statystyk z ekwipunku
  let eligible = inventory
    .map((item,i) => ({item,i}))
    .filter(({item}) => {
      let d = ITEMS_DATABASE[item.name]||{};
      return d.isSlotItem || d.isElixir || SLOT_ITEMS.includes(item.name);
    });

  let list = document.getElementById("slotPickerList");
  list.innerHTML = "";

  if (!eligible.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">🧪</div>Brak eliksirów statystyk w ekwipunku</div>`;
  } else {
    eligible.forEach(({item, i}) => {
      let data = ITEMS_DATABASE[item.name] || { icon:"📦" };
      let btn  = document.createElement("button");
      btn.className = "modal-horse-btn";
      let bonusStr = item.bonus !== undefined ? ` <span style="color:var(--gold2);font-size:11px">(+${item.bonus})</span>` : "";
      btn.innerHTML = `
        <span style="font-size:22px">${data.icon}</span>
        <div style="flex:1">
          <div class="mh-name">${item.name}${bonusStr}</div>
          <div class="mh-stats" style="color:var(--text2)">${data.desc}</div>
        </div>
        <span style="font-size:11px;color:var(--gold2)">Wyposażaj</span>
      `;
      btn.onclick = () => { equipItemToSlot(horseIdx, slotIdx, i); closeSlotPicker(); };
      list.appendChild(btn);
    });
  }

  document.getElementById("slotPickerModal").style.display = "flex";
}

function closeSlotPicker() {
  document.getElementById("slotPickerModal").style.display = "none";
  pendingSlot = null;
}
