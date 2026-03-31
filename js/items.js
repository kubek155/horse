// =====================
// MODAL PICKER
// =====================
let pendingItemIdx = null;

function openHorsePicker(itemIdx) {
  let item = inventory[itemIdx];
  if (!item) return;

  // Skrzynki — nie wymagają konia
  if (item.name === "Skrzynka z Łupem")   { openLootBox(itemIdx); return; }
  if (item.name === "Skrzynka Startowa")  { openStarterBoxAnimation(itemIdx); return; }

  // Przedmioty do slotów
  let itemData = ITEMS_DATABASE[item.name] || {};
  if (itemData.isSlotItem) {
    openSlotPickerForItem(itemIdx);
    return;
  }

  // Transporter Konia — odbiór kosztuje
  if (itemData.isTransporter) {
    let transporterItem = inventory[itemIdx];
    if (!transporterItem || !transporterItem.horse) { log("⚠️ Pusty transporter!"); return; }
    if (playerHorses.length >= STABLE_LIMIT) {
      log(`⚠️ Stajnia nadal pełna! Zwolnij miejsce dla ${transporterItem.horse.name}.`);
      return;
    }
    let h    = transporterItem.horse;
    let fee  = calcTransporterFee(h);
    openTransporterModal(itemIdx, h, fee);
    return;
  }

  // Materiały budowlane — pokaż info
  if (itemData.isBuildMat) {
    log(`🪵 ${item.name} — materiał budowlany. Użyj w Rozbudowie Stajni (przycisk w Stajni).`);
    return;
  }

  // Jabłko Sfinksa — przejdź do hodowli
  if (itemData.isBreedItem) {
    log(`🍏 Jabłko Sfinksa — przejdź do Stajni i wybierz Rozmnóż konie.`);
    showSection("stable");
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
  } else if (item.name === "Bandaż") {
    if (!h.injured) { log(`✅ ${h.name} jest zdrowy — bandaż nie jest potrzebny.`); return; }
    h.injured      = false;
    h.injuredSince = null;
    log(`🩹 ${h.name} wyleczony! Może teraz wrócić na wyprawy.`);
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
    h.stats.luck = Math.min(200, h.stats.luck + 5);
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
    {
      let h  = generateHorse();
      let rc = RARITY_COLORS[h.rarity]||"#8aab84";
      let horseSvgStr = (typeof drawHorseSVG === "function")
        ? drawHorseSVG(h.breedKey||h.name, h.rarity, h.stars) : null;

      if (playerHorses.length >= STABLE_LIMIT) {
        // Sprawdź limit transporterów
        let transporterCount = inventory.filter(i => (ITEMS_DATABASE[i.name]||{}).isTransporter && i.horse).length;
        if (transporterCount >= 10) {
          log(`⚠️ Limit transporterów (10)! Odbierz konie z transporterów żeby zrobić miejsce.`);
          return;
        }
        // Stajnia pełna — koń trafia do transportera w ekwipunku
        inventory.push({
          name:        "Transporter Konia",
          obtained:    Date.now(),
          horse:       h,   // koń zapisany w środku
        });
        log(`🧳 Stajnia pełna! ${h.flag} ${h.name} czeka w Transporterze w Ekwipunku.`);
        lootResult = {
          svg:   horseSvgStr,
          icon:  "🧳",
          name:  `${h.name} (w transporterze)`,
          desc:  `${RARITY_LABELS[h.rarity]||h.rarity} · Zwolnij miejsce w stajni!`,
          color: "#c97c2a"
        };
      } else {
        playerHorses.push(h);
        log(`📦 Skrzynka: Nowy koń — ${h.name}!`);
        lootResult = {
          svg:  horseSvgStr,
          icon: h.flag||"🐴",
          name: h.name,
          desc: RARITY_LABELS[h.rarity]||h.rarity,
          color: rc
        };
        lootResult._showRareEffect = { name: h.name, rarity: h.rarity, flag: h.flag };
      }
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

  // Zapisz do historii dropów
  if (typeof addDropHistory === "function" && lootResult.name) {
    // Oblicz szansę na ten wynik
    let chanceLabel = r < 66 ? "66% szans na konia" : r < 80 ? "14% szans na eliksir" : "20% szans na item";
    addDropHistory({
      icon:   lootResult.svg ? "🐴" : (lootResult.icon || "📦"),
      name:   lootResult.name,
      source: "📦 Skrzynka z Łupem",
      color:  lootResult.color || "#c9a84c",
      chance: chanceLabel,
    });
  }

  inventory.splice(itemIdx, 1);
  trackQuest("lootbox");
  saveGame();
  renderAll();
}

// =====================
// TRANSPORTER — opłata za odbiór
// =====================
function calcTransporterFee(h) {
  // Opłata zależna od rzadkości + statystyki
  const baseFee = { common:80, uncommon:150, rare:300, epic:600, legendary:1200, mythic:2500 };
  let fee = baseFee[h.rarity] || 200;
  // Dodatkowa opłata za wysokie staty
  let statSum = (h.stats.speed||0)+(h.stats.strength||0)+(h.stats.stamina||0)+(h.stats.luck||0);
  fee += Math.floor(statSum * 0.8);
  // Gwiazdki
  fee += (h.stars||0) * 200;
  return fee;
}

function openTransporterModal(itemIdx, h, fee) {
  let existing = document.getElementById("transporterModal");
  if (existing) existing.remove();

  let rc  = RARITY_COLORS[h.rarity] || "#8aab84";
  let lbl = RARITY_LABELS[h.rarity] || h.rarity;
  let canAfford = gold >= fee;

  let modal = document.createElement("div");
  modal.id = "transporterModal";
  modal.style.cssText = "position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;font-family:'Crimson Text',serif";

  modal.innerHTML = `
    <div style="background:var(--panel);border:1px solid ${rc}66;border-radius:16px;padding:24px;max-width:360px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.6)">
      <div style="font-family:'Cinzel',serif;font-size:14px;color:${rc};margin-bottom:4px">🧳 Odbiór z Transportera</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:16px">Koń czekał w transporterze — opłata za przechowywanie:</div>

      <div style="background:var(--panel2);border-radius:10px;padding:12px;margin-bottom:14px;border:1px solid ${rc}33">
        <div id="transporterSVGSlot" style="border-radius:8px;overflow:hidden;margin-bottom:8px;border:1px solid ${rc}22"></div>
        <div style="font-family:'Cinzel',serif;font-size:14px;color:${rc}">${h.flag||"🐴"} ${h.name}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:2px">${lbl} · ${h.type||""} · ${h.gender==="male"?"♂ Ogier":"♀ Klacz"}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck}</div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:10px 12px;border-radius:8px;background:${canAfford?"rgba(201,168,76,0.08)":"rgba(201,74,74,0.08)"};border:1px solid ${canAfford?"rgba(201,168,76,0.3)":"rgba(201,74,74,0.3)"}">
        <span style="font-size:13px;color:var(--text2)">Opłata za transport:</span>
        <span style="font-family:'Cinzel',serif;font-size:16px;color:${canAfford?"var(--gold2)":"#c94a4a"}">💰 ${fee}</span>
      </div>
      ${!canAfford ? `<div style="font-size:11px;color:#c94a4a;margin-bottom:12px;text-align:center">Brak złota! Potrzebujesz jeszcze ${fee-gold} 💰</div>` : ""}

      <div style="display:flex;gap:8px">
        <button id="transporterConfirmBtn" style="flex:2;${canAfford?"border-color:var(--gold);color:var(--gold);background:rgba(201,168,76,0.1)":"opacity:0.4"}" ${canAfford?"":"disabled"} onclick="confirmTransporter(${itemIdx},${fee})">
          💰 Zapłać i odbierz
        </button>
        <button style="flex:1" onclick="document.getElementById('transporterModal').remove()">Anuluj</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Wstaw SVG konia
  setTimeout(() => {
    let slot = document.getElementById("transporterSVGSlot");
    if (slot && typeof drawHorseSVG === "function") {
      slot.innerHTML = drawHorseSVG(h.breedKey||h.name, h.rarity, h.stars||0);
    }
  }, 30);
}

function confirmTransporter(itemIdx, fee) {
  let transporterItem = inventory[itemIdx];
  if (!transporterItem || !transporterItem.horse) return;
  if (playerHorses.length >= STABLE_LIMIT) { log("⚠️ Stajnia nadal pełna!"); return; }
  if (gold < fee) { log("⚠️ Za mało złota!"); return; }

  gold -= fee;
  let h = transporterItem.horse;
  playerHorses.push(h);
  inventory.splice(itemIdx, 1);

  document.getElementById("transporterModal")?.remove();
  saveGame(); renderAll();
  log(`🧳 Zapłacono ${fee}💰 — ${h.flag} ${h.name} odebrany z transportera!`);

  let tier = {common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5}[h.rarity]||0;
  if (tier >= 2 && typeof showRareHorseEffect === "function") {
    setTimeout(() => showRareHorseEffect(h.name, h.rarity, h.flag), 200);
  }
}

// =====================
// RENDER INVENTORY — zakładki
// =====================
let invTab = "all";

function setInvTab(tab) {
  invTab = tab;
  document.querySelectorAll(".inv-tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  renderInventory();
}

function getItemCategory(name) {
  let d = ITEMS_DATABASE[name] || {};
  if (d.isFood)      return "food";
  if (d.isBreedItem || d.isBreedSupport) return "breed";
  if (d.isPass)      return "pass";
  if (d.isSlotItem)  return "slot";
  if (d.isElixir || name.startsWith("Eliksir")) return "elixir";
  if (d.isTransporter) return "transport";
  if (name === "Bandaż") return "other";
  if (name === "Skrzynka z Łupem") return "other";
  return "other";
}

const INV_TABS = [
  { id:"all",       label:"Wszystko",    svg:`<svg viewBox="0 0 16 16" fill="none"><rect x="3" y="6" width="10" height="8" rx="1" stroke="currentColor" stroke-width="1.3" fill="none"/><path d="M5 6V4.5A3 2.5 0 0111 4.5V6" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>` },
  { id:"food",      label:"Jedzenie",    svg:`<svg viewBox="0 0 16 16" fill="none"><path d="M8 2c-3 0-5 3-5 6s2 6 5 6 5-3 5-6-2-6-5-6z" fill="#e84c3d" opacity=".9"/><path d="M7.5 2.5L7 1" stroke="#3a6a1a" stroke-width="1.2" fill="none"/></svg>` },
  { id:"breed",     label:"Hodowla",     svg:`<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#f0a0c8" stroke-width="1.3" fill="none"/><path d="M5 8h6M8 5v6" stroke="#f0a0c8" stroke-width="1.3"/></svg>` },
  { id:"elixir",    label:"Eliksiry",    svg:`<svg viewBox="0 0 16 16" fill="none"><path d="M6 2h4v4l3 7H3L6 6z" stroke="#4a7ec8" stroke-width="1.3" fill="none"/></svg>` },
  { id:"slot",      label:"Sloty",       svg:`<svg viewBox="0 0 16 16" fill="none"><polygon points="8,1.5 9.8,6 14.5,6 10.8,8.8 12.5,13.5 8,10.5 3.5,13.5 5.2,8.8 1.5,6 6.2,6" stroke="#c9a84c" stroke-width="1.2" fill="none"/></svg>` },
  { id:"pass",      label:"Przepustki",  svg:`<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="12" height="7" rx="1.5" stroke="#4a9e6a" stroke-width="1.3" fill="none"/><circle cx="5.5" cy="8.5" r="1" fill="#4a9e6a"/><line x1="8" y1="7" x2="12" y2="7" stroke="#4a9e6a" stroke-width="1"/><line x1="8" y1="10" x2="11" y2="10" stroke="#4a9e6a" stroke-width="1"/></svg>` },
  { id:"build",     label:"Budowlane",   svg:`<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="7" width="12" height="5" rx="1" stroke="#8B5E3C" stroke-width="1.3" fill="none"/><rect x="3" y="10" width="10" height="3" rx="0.5" stroke="#A0723A" stroke-width="1" fill="none"/></svg>` },
  { id:"transport", label:"Transportery",svg:`<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="#888" stroke-width="1.3" fill="none"/><path d="M6 8c0-2 4-2 4 0" stroke="#aaa" stroke-width="1" fill="none"/><circle cx="5.5" cy="13" r="1.5" fill="#555" stroke="#777" stroke-width="1"/><circle cx="10.5" cy="13" r="1.5" fill="#555" stroke="#777" stroke-width="1"/></svg>` },
  { id:"other",     label:"Inne",        svg:`<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="7" width="12" height="8" rx="1" stroke="#8aab84" stroke-width="1.3" fill="none"/><rect x="6" y="5" width="4" height="4" rx="0.5" stroke="#8aab84" stroke-width="1.3" fill="none"/></svg>` },
];

function renderInventory() {
  let el = document.getElementById("inventoryGrid");

  // Renderuj zakładki
  let tabBar = document.getElementById("invTabBar");
  if (tabBar) delete tabBar.dataset.rendered; // wymusz re-render
  if (tabBar && !tabBar.dataset.rendered) {
    tabBar.dataset.rendered = "1";
    tabBar.innerHTML = "";
    INV_TABS.forEach(t => {
      let btn = document.createElement("button");
      btn.className = "inv-tab-btn" + (invTab === t.id ? " active" : "");
      btn.dataset.tab = t.id;
      let count = t.id === "all" ? inventory.length
        : inventory.filter(i => getItemCategory(i.name) === t.id).length;
      let icoHtml = t.svg
        ? `<span style="display:inline-flex;width:13px;height:13px;vertical-align:middle;margin-right:3px">${t.svg}</span>`
        : (t.icon||"");
      btn.innerHTML = `${icoHtml}${t.label}${count>0?` <span style="font-size:10px;opacity:0.7">(${count})</span>`:""}`;
      btn.onclick = () => setInvTab(t.id);
      tabBar.appendChild(btn);
    });
  } else if (tabBar) {
    // Aktualizuj liczniki
    tabBar.querySelectorAll(".inv-tab-btn").forEach(btn => {
      let tid = btn.dataset.tab;
      let count = tid === "all" ? inventory.length
        : inventory.filter(i => getItemCategory(i.name) === tid).length;
      let t = INV_TABS.find(t2=>t2.id===tid);
      if (t) {
        let icoHtml2 = t.svg
          ? `<span style="display:inline-flex;width:13px;height:13px;vertical-align:middle;margin-right:3px">${t.svg}</span>`
          : (t.icon||"");
        btn.innerHTML = `${icoHtml2}${t.label}${count>0?` <span style="font-size:10px;opacity:0.7">(${count})</span>`:""}`;
      }
      btn.classList.toggle("active", tid === invTab);
    });
  }

  document.getElementById("invCount").textContent = inventory.length;

  let filtered = invTab === "all" ? inventory
    : inventory.filter(i => getItemCategory(i.name) === invTab);

  if (inventory.length === 0) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🎒</div>Ekwipunek jest pusty</div>`;
    return;
  }
  if (filtered.length === 0) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">${INV_TABS.find(t=>t.id===invTab)?.icon||"📦"}</div>Brak przedmiotów w tej kategorii</div>`;
    return;
  }

  const TRANSPORTER_LIMIT = 10;

  // Podziel na transportery i resztę
  let transporters = filtered.filter(i => (ITEMS_DATABASE[i.name]||{}).isTransporter && i.horse);
  let regularItems = filtered.filter(i => !((ITEMS_DATABASE[i.name]||{}).isTransporter && i.horse));

  el.innerHTML = "";

  // ── SEKCJA TRANSPORTERÓW (jeśli są widoczne w tym tabie) ──
  if ((invTab === "all" || invTab === "transport") && transporters.length > 0) {
    let tHeader = document.createElement("div");
    tHeader.style.cssText = "grid-column:1/-1;margin-bottom:4px";
    let pct = transporters.length / TRANSPORTER_LIMIT;
    let barColor = pct >= 1 ? "#c94a4a" : pct >= 0.7 ? "#c97c2a" : "#4ab870";
    tHeader.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#8aab84">🧳 TRANSPORTERY</div>
        <div style="font-size:11px;color:${barColor}">${transporters.length} / ${TRANSPORTER_LIMIT}</div>
      </div>
      <div style="height:3px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:12px">
        <div style="height:100%;width:${Math.min(100,pct*100)}%;background:${barColor};border-radius:2px;transition:width 0.5s"></div>
      </div>
    `;
    el.appendChild(tHeader);

    // Grid 2 kolumny dla transporterów
    let tGrid = document.createElement("div");
    tGrid.style.cssText = "grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px;margin-bottom:16px";

    transporters.forEach(item => {
      let idx  = inventory.indexOf(item);
      let h2   = item.horse;
      let hrc  = RARITY_COLORS[h2.rarity]||"#8aab84";
      let hlbl = RARITY_LABELS[h2.rarity]||h2.rarity;
      let fee  = calcTransporterFee(h2);

      let card = document.createElement("div");
      card.style.cssText = `
        border:1px solid ${hrc}44;border-radius:10px;background:var(--panel2);
        display:flex;align-items:center;gap:10px;padding:10px 12px;
      `;
      card.innerHTML = `
        <div class="transport-svg-slot" style="
          width:84px;height:68px;flex-shrink:0;
          background:var(--panel);border-radius:8px;overflow:hidden;
          border:1px solid ${hrc}33;
        "></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:9px;letter-spacing:1.5px;color:${hrc};opacity:0.7;margin-bottom:2px">🧳 TRANSPORTER</div>
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${hrc};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${h2.name}</div>
          <div style="font-size:10px;color:var(--text2);margin-top:1px">${hlbl} · ${h2.type||""} · ${h2.gender==="male"?"♂ Ogier":"♀ Klacz"}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;margin-top:4px">
            <div style="font-size:10px;color:var(--text2)">⚡<span style="color:var(--text)">${h2.stats.speed}</span></div>
            <div style="font-size:10px;color:var(--text2)">💪<span style="color:var(--text)">${h2.stats.strength}</span></div>
            <div style="font-size:10px;color:var(--text2)">❤️<span style="color:var(--text)">${h2.stats.stamina}</span></div>
            <div style="font-size:10px;color:var(--text2)">🍀<span style="color:var(--text)">${h2.stats.luck||0}</span></div>
          </div>
          <div style="font-size:10px;color:#c9a84c;margin-top:4px;font-family:'Cinzel',serif">Opłata: 💰${fee}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
          <button onclick="openHorsePicker(${idx})" style="border-color:${hrc};color:${hrc};background:${hrc}11;font-size:11px;padding:4px 10px;white-space:nowrap">🧳 Odbierz</button>
          <button style="border-color:#7b5ea7;color:#b090e0;background:rgba(123,94,167,0.1);font-size:11px;padding:4px 10px" onclick="openListItem(${idx})">🏪 Sprzedaj</button>
        </div>
      `;
      tGrid.appendChild(card);

      let svgSlot = card.querySelector(".transport-svg-slot");
      if (svgSlot && typeof drawHorseSVG === "function") {
        let svgStr = drawHorseSVG(h2.breedKey||h2.name, h2.rarity, h2.stars||0);
        svgSlot.innerHTML = svgStr;
        let svgEl = svgSlot.querySelector("svg");
        if (svgEl) { svgEl.setAttribute("width","84"); svgEl.setAttribute("height","68"); }
      }
    });
    el.appendChild(tGrid);

    // Ostrzeżenie o limicie
    if (transporters.length >= TRANSPORTER_LIMIT) {
      let warn = document.createElement("div");
      warn.style.cssText = "grid-column:1/-1;padding:8px 12px;background:rgba(201,74,74,0.1);border:1px solid #c94a4a44;border-radius:8px;font-size:12px;color:#c94a4a;margin-bottom:12px;text-align:center";
      warn.textContent = "⚠️ Limit transporterów osiągnięty! Odbierz konie żeby zwolnić miejsce.";
      el.appendChild(warn);
    }

    // Separator
    if (regularItems.length > 0) {
      let sep = document.createElement("div");
      sep.style.cssText = "grid-column:1/-1;font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:#8aab84;margin-bottom:8px;padding-top:4px;border-top:1px solid var(--border)";
      sep.textContent = "PRZEDMIOTY";
      el.appendChild(sep);
    }
  }

  // ── SEKCJA ZWYKŁYCH PRZEDMIOTÓW ──
  regularItems.forEach((item) => {
    let idx     = inventory.indexOf(item);
    let data    = ITEMS_DATABASE[item.name] || { icon:"📦", desc:"" };
    let isSlot  = !!data.isSlotItem;
    let isFood  = !!data.isFood;
    let isPass  = !!data.isPass;
    let isBreed = !!data.isBreedItem;
    let statIcon = { speed:"⚡", strength:"💪", stamina:"❤️", luck:"🍀" }[data.stat] || "";
    let rc       = { rare:"#4a7ec8", epic:"#7b5ea7", legendary:"#c9a84c", uncommon:"#8aab84" }[data.rarity] || "var(--border)";

    let bonusHtml = (isSlot && item.bonus !== undefined)
      ? `<div class="inv-bonus">+${item.bonus} ${statIcon}</div>` : "";
    let isBox = item.name === "Skrzynka z Łupem" || item.name === "Skrzynka Startowa";
  let useLabel = isFood ? "🍎 Karm" : isSlot ? "✨ Slot" : isPass ? "🎫 Info" : isBreed ? "🍏 Hoduj" : isBox ? "🎁 Otwórz" : "Użyj";

    let div = document.createElement("div");
    div.className = "inv-item";
    div.style.borderColor = rc;
    div.innerHTML = `
      <span class="inv-icon">${(typeof ITEM_ICONS_SVG!=="undefined"&&ITEM_ICONS_SVG[item.name])?`<span style="display:inline-flex;width:36px;height:36px">${ITEM_ICONS_SVG[item.name]}</span>`:data.icon}</span>
      <span class="inv-name">${item.name}</span>
      ${bonusHtml}
      <div class="inv-actions">
        <button onclick="${isBox ? 'openLootboxWithAnimation(' + idx + ')' : 'openHorsePicker(' + idx + ')'}">${useLabel}</button>
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

// =====================
// SKRZYNKA STARTOWA
// =====================
function openStarterBoxAnimation(itemIdx) {
  // Losuj konia: 60% uncommon, 35% rare, 5% epic
  let rarityRoll = Math.random();
  let rarity = rarityRoll < 0.05 ? "epic" : rarityRoll < 0.40 ? "rare" : "uncommon";

  // Losowe złoto startowe 200-500
  let bonusGold = 200 + Math.floor(Math.random() * 301);

  // Losowy item startowy
  let starterItems = ["Jabłko Sfinksa","Eliksir Szybkości","Eliksir Siły","Bandaż","Skrzynka z Łupem"];
  let bonusItem    = starterItems[Math.floor(Math.random() * starterItems.length)];

  // Generuj konia
  let pool = BREEDS.filter(b => b.rarity === rarity);
  if (!pool.length) pool = BREEDS.filter(b => b.rarity === "uncommon");
  let breed  = pool[Math.floor(Math.random() * pool.length)];
  let h      = generateHorse(rarity);
  let rc     = RARITY_COLORS[rarity] || "#4a7ec8";
  let svgStr = typeof drawHorseSVG === "function" ? drawHorseSVG(h.breedKey||h.name, rarity, h.stars||0) : null;

  // Zużyj skrzynkę
  inventory.splice(itemIdx, 1);

  // Daj nagrody
  gold += bonusGold;
  inventory.push({ name:bonusItem, obtained:Date.now() });
  if (playerHorses.length < STABLE_LIMIT) {
    playerHorses.push(h);
  } else {
    inventory.push({ name:"Transporter Konia", obtained:Date.now(), horse:h });
  }

  saveGame(); renderAll();

  // Animacja
  let overlay = document.createElement("div");
  overlay.id  = "starterBoxOverlay";
  overlay.style.cssText = `position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.95);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    font-family:'Crimson Text',serif;gap:16px;`;

  overlay.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:4px;color:#c9a84c;margin-bottom:4px">🎁 PAKIET STARTOWY</div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:8px">Twój pierwszy koń:</div>

    <div style="background:#0f1a0f;border:2px solid ${rc};border-radius:16px;padding:20px;text-align:center;max-width:280px;width:90%;
      animation:rareCardPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards">
      <div id="starterSVGSlot" style="border-radius:10px;overflow:hidden;margin-bottom:10px;border:1px solid ${rc}44;background:#0a140a"></div>
      <div style="font-family:'Cinzel',serif;font-size:16px;color:${rc}">${h.flag||"🐴"} ${h.name}</div>
      <div style="font-size:12px;color:var(--text2);margin-top:4px">${RARITY_LABELS[rarity]||rarity} · ${h.type||""} · ${h.gender==="male"?"♂":"♀"}</div>
      <div style="font-size:12px;color:var(--text2);margin-top:6px">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck}</div>
    </div>

    <div style="display:flex;gap:12px;margin-top:4px">
      <div style="background:#131f13;border:1px solid #c9a84c44;border-radius:10px;padding:10px 16px;text-align:center">
        <div style="font-size:11px;color:var(--text2)">Złoto startowe</div>
        <div style="font-family:'Cinzel',serif;font-size:18px;color:#c9a84c">💰 +${bonusGold}</div>
      </div>
      <div style="background:#131f13;border:1px solid #8aab8444;border-radius:10px;padding:10px 16px;text-align:center">
        <div style="font-size:11px;color:var(--text2)">Bonus item</div>
        <div style="font-size:18px">${ITEMS_DATABASE[bonusItem]?.icon||"📦"}</div>
        <div style="font-size:10px;color:#8aab84">${bonusItem}</div>
      </div>
    </div>

    <button onclick="document.getElementById('starterBoxOverlay').remove()" style="
      margin-top:8px;padding:10px 32px;border-radius:10px;
      border:1px solid ${rc};color:${rc};background:${rc}18;
      font-family:'Cinzel',serif;font-size:13px;cursor:pointer;letter-spacing:1px;
    ">✨ Zacznij przygodę!</button>
  `;
  document.body.appendChild(overlay);

  // Wstaw SVG
  setTimeout(() => {
    let slot = document.getElementById("starterSVGSlot");
    if (slot && svgStr) {
      slot.innerHTML = svgStr;
      let svgEl = slot.querySelector("svg");
      if (svgEl) { svgEl.setAttribute("width","100%"); svgEl.setAttribute("height","120"); }
    }
    // Cząsteczki
    for (let i=0; i<30; i++) {
      let p = document.createElement("div");
      let angle = Math.random()*360, dist=80+Math.random()*180;
      let tx = Math.cos(angle*Math.PI/180)*dist, ty = Math.sin(angle*Math.PI/180)*dist;
      p.style.cssText = `position:fixed;width:${4+Math.random()*8}px;height:${4+Math.random()*8}px;
        border-radius:50%;background:${rc};top:50%;left:50%;pointer-events:none;
        animation:particleFly ${0.6+Math.random()*0.8}s ease-out forwards;
        --tx:${tx}px;--ty:${ty}px;animation-delay:${Math.random()*0.3}s`;
      overlay.appendChild(p);
    }
  }, 100);

  log(`🎁 Pakiet startowy otwarty! ${h.flag} ${h.name} dołączył do stajni! +${bonusGold}💰`);
}
