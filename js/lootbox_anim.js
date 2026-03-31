// =====================
// ANIMACJA OTWIERANIA SKRZYNKI — styl CSGO
// =====================

function openLootboxWithAnimation(itemIdx) {
  // Znajdź skrzynkę w ekwipunku
  let item = inventory[itemIdx];
  if (!item || (item.name !== "Skrzynka z Łupem" && item.name !== "Skrzynka Startowa")) {
    if (typeof openHorsePicker === "function") openHorsePicker(itemIdx);
    return;
  }

  // Usuń skrzynkę z ekwipunku PRZED animacją
  inventory.splice(itemIdx, 1);
  saveGame();

  // Stwórz overlay
  let overlay = document.createElement("div");
  overlay.id = "lootboxOverlay";
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9800;
    background:rgba(0,0,0,0.92);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:0;
  `;

  // Predefiniowane pule przedmiotów do rolowania
  const POOL = _buildLootPool();

  overlay.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:4px;color:#8aab84;margin-bottom:24px">OTWIERASZ SKRZYNKĘ Z ŁUPEM</div>

    <!-- Track z kartami -->
    <div style="position:relative;width:100%;max-width:780px;overflow:hidden;margin-bottom:20px">
      <!-- Wskaźnik - pionowa linia na środku -->
      <div style="position:absolute;top:0;bottom:0;left:50%;transform:translateX(-50%);width:3px;background:linear-gradient(180deg,transparent,#c9a84c,transparent);z-index:10;pointer-events:none"></div>
      <div style="position:absolute;top:0;bottom:0;left:50%;transform:translateX(-50%);width:1px;background:#c9a84c;box-shadow:0 0 8px #c9a84c;z-index:10"></div>
      <!-- Zaciemnienie boków -->
      <div style="position:absolute;top:0;bottom:0;left:0;width:120px;background:linear-gradient(90deg,rgba(0,0,0,0.95),transparent);z-index:9;pointer-events:none"></div>
      <div style="position:absolute;top:0;bottom:0;right:0;width:120px;background:linear-gradient(270deg,rgba(0,0,0,0.95),transparent);z-index:9;pointer-events:none"></div>

      <!-- Ruchomy track -->
      <div id="lbTrack" style="display:flex;gap:8px;padding:8px 0;will-change:transform;transition:none"></div>
    </div>

    <div id="lbStatus" style="font-size:13px;color:var(--text2);min-height:24px;margin-bottom:20px">Przygotowywanie...</div>

    <button id="lbSkipBtn" onclick="skipLootboxAnim()" style="
      border-color:#333;color:#666;font-size:11px;padding:5px 16px;
      display:none;
    ">Pomiń animację</button>
  `;
  document.body.appendChild(overlay);

  // Wypełnij track kartami (40 kart + nagroda w środku)
  let track   = document.getElementById("lbTrack");
  let cards   = [];
  let cardW   = 124; // px szerokość karty + gap
  let total   = 50;
  let winIdx  = Math.floor(total * 0.65) + Math.floor(Math.random() * 8); // wygrana ~65-75%

  // Najpierw wygeneruj nagrodę
  let winResult = _generateLootboxReward(item.isStarter);

  for (let i = 0; i < total; i++) {
    let isWin = (i === winIdx);
    let entry = isWin ? winResult : POOL[Math.floor(Math.random() * POOL.length)];
    let card  = _buildLootCard(entry, isWin);
    track.appendChild(card);
    cards.push(card);
  }

  // Pokaż przycisk pomiń
  setTimeout(() => {
    let skip = document.getElementById("lbSkipBtn");
    if (skip) skip.style.display = "inline-block";
  }, 800);

  // Oblicz pozycję startową i końcową
  let trackEl    = document.getElementById("lbTrack");
  let centerX    = overlay.offsetWidth / 2 - cardW / 2;

  // Start: lewo od widoku
  let startX = centerX;
  // Koniec: wygrana karta wycentrowana
  let endX   = centerX - (winIdx * cardW);

  // Faza 1: szybki spin
  let duration = 3200;
  let startTime = null;

  trackEl.style.transform = `translateX(${startX}px)`;

  // Zapisz winResult globalnie dla przycisku pomiń
  window._lbWinResult = winResult;
  window._lbItem = item;

  function animate(ts) {
    if (!startTime) startTime = ts;
    let elapsed = ts - startTime;
    let progress = Math.min(elapsed / duration, 1);

    // Easing - szybki start, powolne hamowanie (cubic out)
    let eased = 1 - Math.pow(1 - progress, 4);
    let current = startX + (endX - startX) * eased;

    let el = document.getElementById("lbTrack");
    if (!el) return;
    el.style.transform = `translateX(${current}px)`;

    let status = document.getElementById("lbStatus");
    if (status) {
      if (progress < 0.5) status.textContent = "🎲 Losowanie...";
      else if (progress < 0.9) status.textContent = "⏳ Prawie...";
      else status.textContent = "";
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Animacja zakończona — pokaż wynik
      setTimeout(() => _showLootboxResult(winResult, overlay, item), 300);
    }
  }

  requestAnimationFrame(animate);
}

function skipLootboxAnim() {
  let result = window._lbWinResult;
  let item   = window._lbItem;
  let overlay = document.getElementById("lootboxOverlay");
  if (!overlay || !result) return;
  _showLootboxResult(result, overlay, item);
}

function _buildLootCard(entry, isWin) {
  let div = document.createElement("div");
  let rc  = _rarityColor(entry.rarity);
  div.style.cssText = `
    flex-shrink:0;width:116px;height:150px;
    background:${isWin ? "rgba(201,168,76,0.08)" : "var(--panel2)"};
    border:${isWin ? "2px solid " + rc : "1px solid " + rc + "33"};
    border-radius:10px;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:6px;padding:8px;
    ${isWin ? "box-shadow:0 0 20px " + rc + "44" : ""}
  `;

  // Ikona
  if (entry.type === "horse" && entry.horseSVG) {
    let svgWrap = document.createElement("div");
    svgWrap.style.cssText = "width:72px;height:58px;overflow:hidden;border-radius:6px;border:1px solid "+rc+"22;background:var(--panel)";
    svgWrap.innerHTML = entry.horseSVG;
    let svgEl = svgWrap.querySelector("svg");
    if (svgEl) { svgEl.setAttribute("width","72"); svgEl.setAttribute("height","58"); }
    div.appendChild(svgWrap);
  } else if (entry.iconSVG) {
    let iw = document.createElement("div");
    iw.style.cssText = "width:44px;height:44px;display:flex;align-items:center;justify-content:center";
    iw.innerHTML = entry.iconSVG;
    div.appendChild(iw);
  } else {
    let em = document.createElement("div");
    em.style.cssText = "font-size:32px;line-height:1";
    em.textContent = entry.icon || "📦";
    div.appendChild(em);
  }

  let name = document.createElement("div");
  name.style.cssText = `font-size:10px;color:${rc};text-align:center;font-family:'Cinzel',serif;line-height:1.2;word-break:break-word`;
  name.textContent = entry.name;
  div.appendChild(name);

  let rar = document.createElement("div");
  rar.style.cssText = `font-size:9px;color:${rc};opacity:0.7;text-align:center`;
  rar.textContent = _rarityLabel(entry.rarity);
  div.appendChild(rar);

  return div;
}

function _buildLootPool() {
  let pool = [];
  // Konie różnych rzadkości (wypełniacze)
  const horseRarities = ["common","common","common","uncommon","uncommon","rare"];
  horseRarities.forEach(r => {
    let h = typeof generateHorse === "function" ? generateHorse(r) : {name:"Koń",rarity:r,flag:"🐴"};
    pool.push({
      type:"horse", name:h.name, rarity:r,
      horseSVG: typeof drawHorseSVG==="function" ? drawHorseSVG(h.breedKey||h.name, r, 0) : null,
      icon:"🐴", horse:h,
    });
  });
  // Przedmioty
  const items2 = [
    {name:"Jabłko",rarity:"common"},{name:"Słoma",rarity:"common"},
    {name:"Bandaż",rarity:"uncommon"},{name:"Eliksir Szybkości",rarity:"uncommon"},
    {name:"Eliksir Siły",rarity:"uncommon"},{name:"Jabłko Sfinksa",rarity:"rare"},
  ];
  items2.forEach(it => {
    let d = typeof ITEMS_DATABASE!=="undefined" ? ITEMS_DATABASE[it.name]||{} : {};
    pool.push({
      type:"item", name:it.name, rarity:it.rarity,
      iconSVG: typeof ITEM_ICONS_SVG!=="undefined" ? ITEM_ICONS_SVG[it.name] : null,
      icon: d.icon||"📦",
    });
  });
  return pool;
}

function _generateLootboxReward(isStarter) {
  // Użyj istniejącej logiki z items.js jeśli dostępna
  // Na potrzeby animacji — generuj nagrode i zwróć jej dane
  let r = Math.random() * 100;
  let horseChance = 15;

  if (isStarter || r < horseChance) {
    let rarity = isStarter ? "uncommon" : (typeof rollRarity==="function" ? rollRarity() : "common");
    let h = typeof generateHorse==="function" ? generateHorse(rarity) : {name:"Koń",rarity,flag:"🐴",stats:{speed:20,strength:20,stamina:20,luck:5}};
    return {
      type:"horse", name:h.name, rarity:h.rarity,
      horseSVG: typeof drawHorseSVG==="function" ? drawHorseSVG(h.breedKey||h.name, h.rarity, h.stars||0) : null,
      icon:"🐴", horse:h,
    };
  } else {
    let items3 = ["Jabłko","Eliksir Szybkości","Eliksir Siły","Eliksir Wytrzymałości","Eliksir Szczęścia","Jabłko Sfinksa","Bandaż"];
    let weights = [30,15,15,15,10,10,5];
    let tot = weights.reduce((a,b)=>a+b,0);
    let roll2 = Math.random()*tot;
    let picked = items3[0];
    for (let i=0;i<items3.length;i++) { roll2-=weights[i]; if(roll2<=0){picked=items3[i];break;} }
    let d = typeof ITEMS_DATABASE!=="undefined" ? ITEMS_DATABASE[picked]||{} : {};
    return {
      type:"item", name:picked, rarity:d.rarity||"common",
      iconSVG: typeof ITEM_ICONS_SVG!=="undefined" ? ITEM_ICONS_SVG[picked] : null,
      icon:d.icon||"📦",
    };
  }
}

function _showLootboxResult(result, overlay, item) {
  let rc = _rarityColor(result.rarity);

  // Dodaj nagrodę do gry
  if (result.type === "horse" && result.horse) {
    let h = result.horse;
    let limit = typeof getStableLimit==="function" ? getStableLimit() : (typeof STABLE_LIMIT!=="undefined" ? STABLE_LIMIT : 8);
    if (playerHorses.length >= limit) {
      inventory.push({name:"Transporter Konia",obtained:Date.now(),horse:h});
    } else {
      playerHorses.push(h);
    }
  } else {
    inventory.push({name:result.name, obtained:Date.now()});
  }
  saveGame();

  // Pokaż wynik
  overlay.innerHTML = `
    <div style="text-align:center;animation:rareCardPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards">
      <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:4px;color:#8aab84;margin-bottom:20px">ZAWARTOŚĆ SKRZYNKI</div>

      <!-- Karta wyniku -->
      <div style="
        width:200px;height:260px;margin:0 auto 24px;
        background:var(--panel);border:2px solid ${rc};border-radius:14px;
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:12px;padding:16px;
        box-shadow:0 0 40px ${rc}44, 0 0 80px ${rc}22;
        position:relative;overflow:hidden;
      ">
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,${rc}18,transparent 70%);pointer-events:none"></div>
        ${result.type==="horse" && result.horseSVG
          ? `<div style="width:120px;height:96px;overflow:hidden;border-radius:8px;border:1px solid ${rc}33;background:var(--panel2)">${result.horseSVG.replace(/width="[^"]*"/, 'width="120"').replace(/height="[^"]*"/, 'height="96"')}</div>`
          : result.iconSVG
            ? `<div style="width:72px;height:72px">${result.iconSVG}</div>`
            : `<div style="font-size:56px">${result.icon||"📦"}</div>`
        }
        <div style="font-family:'Cinzel',serif;font-size:15px;color:${rc};text-align:center">${result.name}</div>
        <div style="font-size:11px;padding:3px 10px;border-radius:6px;background:${rc}18;border:1px solid ${rc}44;color:${rc}">${_rarityLabel(result.rarity)}</div>
      </div>

      ${result.type==="horse" && result.horse
        ? `<div style="font-size:12px;color:var(--text2);margin-bottom:16px">
            ⚡${result.horse.stats?.speed} 💪${result.horse.stats?.strength} ❤️${result.horse.stats?.stamina} 🍀${result.horse.stats?.luck||0}
          </div>`
        : ""}

      <button onclick="document.getElementById('lootboxOverlay').remove();renderAll();" style="
        border-color:${rc};color:${rc};background:${rc}18;
        font-family:'Cinzel',serif;font-size:13px;padding:10px 32px;
      ">Odbierz!</button>
    </div>
  `;

  // Efekt świetlny dla rzadkich
  let tier = {common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5}[result.rarity]||0;
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
  return {common:"Zwykły",uncommon:"Pospolity",rare:"Rzadki",epic:"Legendarny",legendary:"Mityczny",mythic:"Pradawny"}[r]||r;
}
