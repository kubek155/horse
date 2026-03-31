// =====================
// ANIMACJA OTWIERANIA SKRZYNKI — styl CSGO
// =====================

function openLootboxWithAnimation(itemIdx) {
  let item = inventory[itemIdx];
  if (!item || (item.name !== "Skrzynka z Łupem" && item.name !== "Skrzynka Startowa")) {
    if (typeof openHorsePicker === "function") openHorsePicker(itemIdx);
    return;
  }

  // Usuń skrzynkę z ekwipunku
  inventory.splice(itemIdx, 1);
  saveGame();

  // Wygeneruj nagrodę
  let winResult = _generateLootboxReward(item.isStarter);
  window._lbWinResult = winResult;
  window._lbItem      = item;

  // Zbuduj overlay
  let overlay = document.createElement("div");
  overlay.id  = "lootboxOverlay";
  overlay.style.cssText = [
    "position:fixed","inset:0","z-index:9800",
    "background:rgba(0,0,0,0.93)",
    "display:flex","flex-direction:column","align-items:center","justify-content:center",
  ].join(";");

  // Kontener toru
  let trackWrap = document.createElement("div");
  trackWrap.id  = "lbTrackWrap";
  trackWrap.style.cssText = [
    "position:relative","width:100%","max-width:820px",
    "overflow:hidden","margin-bottom:20px","height:170px",
  ].join(";");

  // Wskaźnik centralny
  let indicator = document.createElement("div");
  indicator.style.cssText = [
    "position:absolute","top:0","bottom:0",
    "left:50%","transform:translateX(-50%)",
    "width:2px","background:#c9a84c",
    "box-shadow:0 0 12px #c9a84c88,0 0 24px #c9a84c44",
    "z-index:10","pointer-events:none",
  ].join(";");

  // Gradient boki
  let gradL = document.createElement("div");
  gradL.style.cssText = "position:absolute;top:0;bottom:0;left:0;width:140px;background:linear-gradient(90deg,rgba(0,0,0,0.98),transparent);z-index:9;pointer-events:none";
  let gradR = document.createElement("div");
  gradR.style.cssText = "position:absolute;top:0;bottom:0;right:0;width:140px;background:linear-gradient(270deg,rgba(0,0,0,0.98),transparent);z-index:9;pointer-events:none";

  // Track (ruchomy)
  let track = document.createElement("div");
  track.id  = "lbTrack";
  track.style.cssText = [
    "position:absolute","top:8px","left:0",
    "display:flex","gap:8px",
    "will-change:transform",
  ].join(";");

  trackWrap.appendChild(indicator);
  trackWrap.appendChild(gradL);
  trackWrap.appendChild(gradR);
  trackWrap.appendChild(track);

  let title = document.createElement("div");
  title.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:4px;color:#8aab84;margin-bottom:20px";
  title.textContent = "OTWIERASZ SKRZYNKĘ";

  let status = document.createElement("div");
  status.id  = "lbStatus";
  status.style.cssText = "font-size:13px;color:var(--text2);min-height:24px;margin-bottom:16px;text-align:center";
  status.textContent   = "⏳ Przygotowywanie...";

  let skipBtn = document.createElement("button");
  skipBtn.id  = "lbSkipBtn";
  skipBtn.textContent = "Pomiń";
  skipBtn.style.cssText = "border-color:#333;color:#555;font-size:11px;padding:4px 14px;display:none";
  skipBtn.onclick = skipLootboxAnim;

  overlay.appendChild(title);
  overlay.appendChild(trackWrap);
  overlay.appendChild(status);
  overlay.appendChild(skipBtn);
  document.body.appendChild(overlay);

  // Wypełnij karty — po dodaniu do DOM żeby offsetWidth działało
  const CARD_W  = 124; // karta + gap
  const TOTAL   = 50;
  const WIN_IDX = 34 + Math.floor(Math.random() * 8); // karta wygrana bliżej końca

  const POOL = _buildLootPool();
  for (let i = 0; i < TOTAL; i++) {
    let isWin = (i === WIN_IDX);
    let entry = isWin ? winResult : POOL[Math.floor(Math.random() * POOL.length)];
    track.appendChild(_buildLootCard(entry, isWin));
  }

  // Poczekaj 1 klatkę na layout — wtedy offsetWidth jest prawdziwy
  requestAnimationFrame(() => requestAnimationFrame(() => {
    let wrapW = trackWrap.offsetWidth || 820;
    let centerX = wrapW / 2;

    // Start: track przesuwa się od prawej — karta 0 jest daleko po prawej
    // Gdy translateX = 0, karta 0 jest na left:0
    // Gdy translateX = -N*CARD_W, karta N jest na left:0
    // Chcemy żeby karta WIN_IDX była na left=centerX - CARD_W/2
    let endX   = -(WIN_IDX * CARD_W) + centerX - (CARD_W / 2) + 8;
    let startX = endX + (TOTAL * CARD_W) * 0.6; // start dalej w prawo

    track.style.transform = `translateX(${startX}px)`;

    // Pokaż przycisk pomiń po chwili
    setTimeout(() => { skipBtn.style.display = "inline-block"; }, 1200);

    // Animacja
    const DURATION = 3800;
    let startTime  = null;

    function animate(ts) {
      if (!startTime) startTime = ts;
      let elapsed  = ts - startTime;
      let progress = Math.min(elapsed / DURATION, 1);

      // Easing — szybki start, długie hamowanie
      let eased   = 1 - Math.pow(1 - progress, 5);
      let current = startX + (endX - startX) * eased;

      let el = document.getElementById("lbTrack");
      if (!el) return;
      el.style.transform = `translateX(${current}px)`;

      let st = document.getElementById("lbStatus");
      if (st) {
        if      (progress < 0.3) st.textContent = "🎲 Losowanie...";
        else if (progress < 0.7) st.textContent = "⚡ Spinning...";
        else if (progress < 0.92) st.textContent = "⏳ Prawie...";
        else                     st.textContent  = "";
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Zaznacz wygraną kartę
        let cards = track.querySelectorAll(".lb-card");
        if (cards[WIN_IDX]) {
          cards[WIN_IDX].style.transform = "scale(1.06)";
          cards[WIN_IDX].style.boxShadow = `0 0 24px ${_rarityColor(winResult.rarity)}88`;
          cards[WIN_IDX].style.transition = "transform 0.3s,box-shadow 0.3s";
        }
        setTimeout(() => _showLootboxResult(winResult, overlay, item), 600);
      }
    }

    requestAnimationFrame(animate);
  }));
}

function skipLootboxAnim() {
  let result  = window._lbWinResult;
  let item    = window._lbItem;
  let overlay = document.getElementById("lootboxOverlay");
  if (!overlay || !result) return;
  _showLootboxResult(result, overlay, item);
}

// ── Karta na torze ─────────────────────────────────────────
function _buildLootCard(entry, isWin) {
  let rc  = _rarityColor(entry.rarity);
  let div = document.createElement("div");
  div.className = "lb-card";
  div.style.cssText = [
    "flex-shrink:0","width:116px","height:150px",
    `background:${isWin ? "rgba(201,168,76,0.10)" : "var(--panel2)"}`,
    `border:${isWin ? "2px solid " + rc : "1px solid " + rc + "22"}`,
    "border-radius:10px",
    "display:flex","flex-direction:column",
    "align-items:center","justify-content:center",
    "gap:6px","padding:8px","overflow:hidden",
  ].join(";");

  // Ikona / SVG
  let iconEl = document.createElement("div");
  iconEl.style.cssText = "width:72px;height:58px;display:flex;align-items:center;justify-content:center;border-radius:7px;overflow:hidden;flex-shrink:0";

  if (entry.type === "horse" && entry.horseSVG) {
    iconEl.style.background = "var(--panel)";
    iconEl.style.border = `1px solid ${rc}22`;
    iconEl.innerHTML = entry.horseSVG;
    let s = iconEl.querySelector("svg");
    if (s) { s.setAttribute("width","72"); s.setAttribute("height","58"); }
  } else if (entry.iconSVG) {
    iconEl.innerHTML = entry.iconSVG;
  } else {
    iconEl.innerHTML = `<span style="font-size:36px;line-height:1">${entry.icon || "📦"}</span>`;
  }
  div.appendChild(iconEl);

  let nameEl = document.createElement("div");
  nameEl.style.cssText = `font-size:10px;color:${rc};text-align:center;font-family:'Cinzel',serif;line-height:1.3;word-break:break-word;max-width:100px`;
  nameEl.textContent = entry.name;
  div.appendChild(nameEl);

  let rarEl = document.createElement("div");
  rarEl.style.cssText = `font-size:9px;color:${rc};opacity:0.65;text-align:center`;
  rarEl.textContent = _rarityLabel(entry.rarity);
  div.appendChild(rarEl);

  return div;
}

// ── Pula kart wypełniaczy ──────────────────────────────────
function _buildLootPool() {
  let pool = [];
  ["common","common","uncommon","uncommon","rare"].forEach(r => {
    let h = typeof generateHorse === "function" ? generateHorse(r) : {name:"Koń",rarity:r,flag:"🐴",stats:{speed:20,strength:20,stamina:20,luck:5}};
    pool.push({
      type:"horse", name:h.name, rarity:r,
      horseSVG: typeof drawHorseSVG==="function" ? drawHorseSVG(h.breedKey||h.name, r, 0) : null,
      icon:"🐴", horse:h,
    });
  });
  [
    {name:"Jabłko",rarity:"common"},{name:"Słoma",rarity:"common"},
    {name:"Bandaż",rarity:"uncommon"},{name:"Eliksir Szybkości",rarity:"uncommon"},
    {name:"Eliksir Siły",rarity:"uncommon"},{name:"Jabłko Sfinksa",rarity:"rare"},
    {name:"Piorun",rarity:"uncommon"},{name:"Kowadło",rarity:"uncommon"},
  ].forEach(it => {
    let d = typeof ITEMS_DATABASE!=="undefined" ? ITEMS_DATABASE[it.name]||{} : {};
    pool.push({
      type:"item", name:it.name, rarity:it.rarity,
      iconSVG: typeof ITEM_ICONS_SVG!=="undefined" ? ITEM_ICONS_SVG[it.name] : null,
      icon: d.icon||"📦",
    });
  });
  // Przetasuj
  for (let i = pool.length-1; i>0; i--) {
    let j = Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]] = [pool[j],pool[i]];
  }
  return pool;
}

// ── Generowanie nagrody ─────────────────────────────────────
function _generateLootboxReward(isStarter) {
  let r = Math.random() * 100;
  let horseChance = isStarter ? 100 : 15;

  if (r < horseChance) {
    let rarity = isStarter ? "uncommon" : (typeof rollRarity==="function" ? rollRarity() : "common");
    let h = typeof generateHorse==="function" ? generateHorse(rarity) : {name:"Koń",rarity,flag:"🐴",stats:{speed:20,strength:20,stamina:20,luck:5}};
    return {
      type:"horse", name:h.name, rarity:h.rarity,
      horseSVG: typeof drawHorseSVG==="function" ? drawHorseSVG(h.breedKey||h.name, h.rarity, h.stars||0) : null,
      icon:"🐴", horse:h,
    };
  }

  let items = ["Jabłko","Eliksir Szybkości","Eliksir Siły","Eliksir Wytrzymałości","Eliksir Szczęścia","Jabłko Sfinksa","Bandaż","Piorun","Kowadło","Koniczyna","Serce"];
  let weights = [20,12,12,12,10,8,8,5,5,5,3];
  let tot = weights.reduce((a,b)=>a+b,0);
  let roll = Math.random()*tot;
  let picked = items[0];
  for (let i=0;i<items.length;i++) { roll-=weights[i]; if(roll<=0){picked=items[i];break;} }
  let d = typeof ITEMS_DATABASE!=="undefined" ? ITEMS_DATABASE[picked]||{} : {};
  return {
    type:"item", name:picked, rarity:d.rarity||"common",
    iconSVG: typeof ITEM_ICONS_SVG!=="undefined" ? ITEM_ICONS_SVG[picked] : null,
    icon:d.icon||"📦",
  };
}

// ── Ekran wyniku ────────────────────────────────────────────
function _showLootboxResult(result, overlay, item) {
  // Dodaj do gry
  if (result.type === "horse" && result.horse) {
    let h = result.horse;
    let limit = typeof getStableLimit==="function" ? getStableLimit() : (typeof STABLE_LIMIT!=="undefined" ? STABLE_LIMIT : 8);
    if (playerHorses.length >= limit) {
      inventory.push({name:"Transporter Konia",obtained:Date.now(),horse:h});
    } else {
      playerHorses.push(h);
    }
  } else if (result.type === "item") {
    if (typeof generateSlotItem==="function" && typeof ITEMS_DATABASE!=="undefined" && ITEMS_DATABASE[result.name]?.isSlotItem) {
      inventory.push(generateSlotItem(result.name));
    } else {
      inventory.push({name:result.name, obtained:Date.now()});
    }
  }
  if (typeof trackQuest==="function") trackQuest("lootbox");
  saveGame();

  let rc = _rarityColor(result.rarity);
  let tier = {common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5}[result.rarity]||0;

  overlay.innerHTML = "";
  overlay.style.cursor = "pointer";

  let inner = document.createElement("div");
  inner.style.cssText = "text-align:center;animation:rareCardPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards";

  inner.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:4px;color:#8aab84;margin-bottom:20px">ZAWARTOŚĆ SKRZYNKI</div>
    <div id="lbResultCard" style="
      width:200px;height:260px;margin:0 auto 20px;
      background:var(--panel);border:2px solid ${rc};border-radius:14px;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:12px;padding:16px;position:relative;overflow:hidden;
      box-shadow:0 0 40px ${rc}44,0 0 80px ${rc}22;
    ">
      <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 35%,${rc}15,transparent 65%);pointer-events:none"></div>
      <div id="lbResultIcon" style="width:120px;height:96px;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:8px"></div>
      <div style="font-family:'Cinzel',serif;font-size:15px;color:${rc};text-align:center;z-index:1">${result.name}</div>
      <div style="font-size:11px;padding:3px 12px;border-radius:8px;background:${rc}18;border:1px solid ${rc}44;color:${rc};z-index:1">${_rarityLabel(result.rarity)}</div>
    </div>
    ${result.type==="horse"&&result.horse
      ? `<div style="font-size:12px;color:var(--text2);margin-bottom:16px">⚡${result.horse.stats?.speed} 💪${result.horse.stats?.strength} ❤️${result.horse.stats?.stamina} 🍀${result.horse.stats?.luck||0}</div>`
      : ""}
    <button id="lbCloseBtn" style="border-color:${rc};color:${rc};background:${rc}18;font-family:'Cinzel',serif;font-size:13px;padding:10px 32px">
      Odbierz!
    </button>
    <div style="font-size:11px;color:#4a5a4a;margin-top:8px">lub kliknij gdziekolwiek</div>
  `;

  overlay.appendChild(inner);

  // Wstaw ikonę
  let iconDiv = inner.querySelector("#lbResultIcon");
  if (result.type==="horse" && result.horseSVG) {
    iconDiv.style.cssText += ";background:var(--panel2);border:1px solid "+rc+"22";
    iconDiv.innerHTML = result.horseSVG;
    let s = iconDiv.querySelector("svg"); if(s){s.setAttribute("width","120");s.setAttribute("height","96");}
  } else if (result.iconSVG) {
    iconDiv.innerHTML = result.iconSVG;
    let s = iconDiv.querySelector("svg"); if(s){s.setAttribute("width","72");s.setAttribute("height","72");}
  } else {
    iconDiv.innerHTML = `<span style="font-size:56px">${result.icon||"📦"}</span>`;
  }

  // Close handlers
  let close = () => { overlay.remove(); renderAll(); };
  inner.querySelector("#lbCloseBtn").addEventListener("click", e => { e.stopPropagation(); close(); });
  overlay.addEventListener("click", close);

  // Rare effect
  if (tier >= 3 && typeof showRareHorseEffect==="function" && result.type==="horse") {
    setTimeout(()=>showRareHorseEffect(result.name, result.rarity, result.horse?.flag||"🐴"), 200);
  }

  if (typeof addNotification==="function") {
    addNotification(result.type==="horse"?"expedition_found":"item_bought",
      `Skrzynka: ${result.name}`,
      `${_rarityLabel(result.rarity)} · Dodano do ekwipunku`
    );
  }
}

function _rarityColor(r) {
  return {common:"#909090",uncommon:"#8aab84",rare:"#4a7ec8",epic:"#7b5ea7",legendary:"#c9a84c",mythic:"#c94a6a"}[r]||"#8aab84";
}
function _rarityLabel(r) {
  return (typeof RARITY_LABELS!=="undefined"&&RARITY_LABELS[r]) || {common:"Zwykły",uncommon:"Pospolity",rare:"Rzadki",epic:"Legendarny",legendary:"Mityczny",mythic:"Pradawny"}[r] || r;
}
