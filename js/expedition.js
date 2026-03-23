const EXPEDITION_TIME = 60000;
const DAILY_LIMIT     = 4;

function getTodayKey() {
  let d = new Date();
  return `d_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getDailyCount() {
  return parseInt(localStorage.getItem(getTodayKey())) || 0;
}

function addDaily() {
  localStorage.setItem(getTodayKey(), getDailyCount() + 1);
}

// =====================
// PERKI AKTYWNE W STAJNI
// =====================
function getActivePerkBonus() {
  let goldBonus    = 1.0;  // mnożnik złota
  let dropBonus    = 0;    // flat % do dropu
  let doubleReward = false;

  playerHorses.forEach(h => {
    if (!h.perk) return;
    if (h.perk.id === "divine_aura")  { goldBonus  += 0.25; dropBonus += 5; }
    if (h.perk.id === "swift_blood")  { goldBonus  += 0.15; }
    if (h.perk.id === "golden_luck")  { dropBonus  += 3; }
    if (h.perk.id === "star_born" && Math.random() < 0.20) doubleReward = true;
    // immortal obsługiwany w renderHorses (wiek)
  });

  return { goldBonus, dropBonus, doubleReward };
}

function startExpedition(i, horseIdx) {
  if (getDailyCount() >= DAILY_LIMIT) { log("⚠️ Osiągnięto dzienny limit wypraw!"); return; }
  if (playerHorses.length === 0)      { log("⚠️ Nie masz żadnych koni!"); return; }
  let h = playerHorses[horseIdx !== undefined ? horseIdx : 0];
  // 5% szans na kontuzję — koń wraca wcześniej bez nagrody
  let injured = Math.random() < 0.05;
  expeditions.push({
    end: injured ? Date.now() + Math.floor(EXPEDITION_TIME * 0.3) : Date.now() + EXPEDITION_TIME,
    locationIndex: i,
    horseIdx: horseIdx||0,
    horseName: h?.name||"?",
    done: false,
    injured,
  });
  addDaily();
  trackQuest("expedition");
  closeExpeditionHorsePicker();
  saveGame();
  log(`🌍 ${h?.flag||"🐴"} ${h?.name||"Koń"} wyruszył na wyprawę do ${LOCATIONS[i].name}!`);

  // Animacja jest w karcie wyprawy (bez popup)
}

// =====================
// MODAL WYBORU KONIA DO WYPRAWY
// =====================
let pendingExpLocation = null;

function openExpeditionHorsePicker(locIdx) {
  if (getDailyCount() >= DAILY_LIMIT) { log("⚠️ Osiągnięto dzienny limit wypraw!"); return; }
  if (playerHorses.length === 0)      { log("⚠️ Nie masz żadnych koni!"); return; }
  pendingExpLocation = locIdx;

  let loc = LOCATIONS[locIdx];
  document.getElementById("expPickerTitle").textContent    = `${loc.icon} Wyprawa do: ${loc.name}`;
  document.getElementById("expPickerSubtitle").textContent = loc.desc;

  let list = document.getElementById("expHorseList");
  list.innerHTML = "";

  // Konie które są już na aktywnej wyprawie
  let busyHorseIdxs = new Set(
    expeditions.filter(e => !e.done).map(e => e.horseIdx)
  );

  playerHorses.forEach((h, hi) => {
    let col    = RARITY_COLORS[h.rarity] || "#8aab84";
    let hunger = getHunger(h);
    let hCol   = hunger > 70 ? "#c94a4a" : hunger > 40 ? "#c97c2a" : "#7ec870";
    let age    = getHorseAgeDays(h);
    let busy   = busyHorseIdxs.has(hi);
    let btn    = document.createElement("button");
    btn.className = "modal-horse-btn";
    if (busy) btn.style.opacity = "0.45";
    btn.innerHTML = `
      <span style="font-size:22px">${h.flag||"🐴"}</span>
      <div style="flex:1">
        <div class="mh-name" style="color:${col}">${h.name}${h.stars>0?" "+"⭐".repeat(h.stars):""}</div>
        <div class="mh-stats">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck}</div>
        ${h.perk ? `<div style="font-size:10px;color:#e08070;margin-top:2px">${h.perk.icon} ${h.perk.name}</div>` : ""}
        <div style="font-size:10px;color:${hCol};margin-top:2px">🍽️ Głód: ${hunger}% &nbsp; 🎂 ${age} dni</div>
        ${busy ? `<div style="font-size:10px;color:#c97c2a;margin-top:2px">🌍 Już na wyprawie</div>` : ""}
        ${h.injured ? `<div style="font-size:10px;color:#c94a4a;margin-top:2px">🤕 Ranny — wymaga Bandaża!</div>` : ""}
      </div>
    `;
    let injured2 = !!h.injured;
    if (busy || injured2) {
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
      if (injured2) btn.style.opacity = "0.35";
    } else {
      btn.onclick = () => startExpedition(pendingExpLocation, hi);
    }
    list.appendChild(btn);
  });

  document.getElementById("expeditionHorsePickerModal").style.display = "flex";
}

function closeExpeditionHorsePicker() {
  document.getElementById("expeditionHorsePickerModal").style.display = "none";
  pendingExpLocation = null;
}

function rollLocationDrop(loc) {
  if (!loc.drops || !loc.dropWeights) return null;
  let total = loc.dropWeights.reduce((a,b)=>a+b,0);
  let r = Math.random() * total;
  for (let i=0; i<loc.drops.length; i++) {
    r -= loc.dropWeights[i];
    if (r <= 0) {
      let name = loc.drops[i];
      let d    = ITEMS_DATABASE[name] || {};
      return { name, isSlot: !!d.isSlotItem };
    }
  }
  return null;
}

function finishExpedition(e) {
  let loc   = LOCATIONS[e.locationIndex];

  // Kontuzja — koń wrócił ranny, brak nagrody
  if (e.injured) {
    let expHorse = playerHorses[e.horseIdx];
    if (expHorse) {
      expHorse.injured = true;
      expHorse.injuredSince = Date.now();
    }
    inventory.push({ name: "Bandaż", obtained: Date.now() });
    log(`🤕 ${expHorse?.name||"Koń"} wrócił ranny z wyprawy! Użyj Bandaża żeby go wyleczyć.`);
    e.done = true;
    saveGame();
    return;
  }

  let luck  = getPartyLuck();
  let luckBonus = luck / 10;
  let r     = Math.random() * 100;

  // koń: 7%+luck/20 | skrzynka: 3%+luck/30 | bonus z poziomu
  let lvlBonus    = (typeof getDropBonus === "function") ? getDropBonus() : 0;
  let horseChance = 7  + luckBonus / 2 + lvlBonus;
  let boxChance   = horseChance + 3 + luckBonus / 3 + lvlBonus * 0.5;
  let foodChance  = boxChance   + 10;

  if (r < horseChance) {
    {
      let h = generateHorse(loc.reward);
      if (playerHorses.length >= STABLE_LIMIT) {
        // Koń trafia do transportera
        inventory.push({ name:"Transporter Konia", obtained:Date.now(), horse:h });
        log(`🧳 Stajnia pełna! ${h.flag} ${h.name} czeka w Transporterze w Ekwipunku.`);
      } else {
        playerHorses.push(h);
        log(`🐴 Nowy koń: ${h.name} (${HORSE_DATABASE[h.group]?.name||h.rarity})!`);
        if (typeof showRareHorseEffect === "function") {
          let tier = {common:0,uncommon:1,rare:2,epic:3,legendary:4,mythic:5}[h.rarity]||0;
          if (tier >= 2) setTimeout(() => showRareHorseEffect(h.name, h.rarity, h.flag), 300);
        }
        if (typeof addDropHistory === "function") addDropHistory({
          icon: h.flag||"🐴", name: h.name,
          source: `${loc.icon} ${loc.name}`,
          color: RARITY_COLORS[h.rarity]||"#8aab84",
        });
      }
    }
  } else if (r < boxChance) {
    // Drop z tabeli lokacji
    let dropped = rollLocationDrop(loc);
    if (dropped) {
      let item = dropped.isSlot ? generateSlotItem(dropped.name) : { name: dropped.name, obtained: Date.now() };
      inventory.push(item);
      let d = ITEMS_DATABASE[dropped.name] || { icon:"📦" };
      let isRareDrop = ["Jabłko Sfinksa","Eliksir Odmłodzenia"].includes(dropped.name) ||
                       dropped.name.includes("Przepustka");
      if (isRareDrop && typeof flashRareDrop === "function") {
        setTimeout(() => flashRareDrop(d.icon, dropped.name), 300);
      }
      log(`✨ Znaleziono: ${d.icon} ${dropped.name}${item.bonus!==undefined?" (+"+item.bonus+")":""}!`);
    } else {
      log(`📜 Wyprawa do ${loc.name} — nic nie znaleziono.`);
    }
  } else {
    log(`📜 Wyprawa do ${loc.name} — nic nie znaleziono.`);
  }

  let perks    = getActivePerkBonus();
  let locGold  = loc.gold || { min:50, max:200 };
  let baseGold = locGold.min + Math.floor(Math.random() * (locGold.max - locGold.min + 1)) + Math.floor(luck * 0.5);
  let lvlGoldMult = (typeof getGoldBonus === "function") ? getGoldBonus() : 1;
  let goldGain = Math.round(baseGold * perks.goldBonus * lvlGoldMult);
  gold += goldGain;
  log(`💰 +${goldGain} złota z wyprawy!`);

  // Dodaj XP za wyprawę
  if (typeof addXP === "function") {
    let xpGain = LOCATION_XP[loc.name] || 20;
    addXP(xpGain, loc.name);
  }

  e.done = true;
  saveGame();
}

function renderLimitBar() {
  let used = getDailyCount();
  let bar  = document.getElementById("limitBar");
  bar.innerHTML = "";
  for (let i = 0; i < DAILY_LIMIT; i++) {
    let pip = document.createElement("div");
    pip.className = "limit-pip" + (i < used ? " used" : "");
    bar.appendChild(pip);
  }
  document.getElementById("remainingExp").textContent = Math.max(0, DAILY_LIMIT - used);
  document.getElementById("dailyCount").textContent   = used;

  // Pokaż aktualny bonus szczęścia
  let luck = getPartyLuck();
  let luckEl = document.getElementById("luckBonus");
  if (luckEl) {
    luckEl.textContent = luck > 0 ? `🍀 Bonus szczęścia: +${luck.toFixed(0)} pkt (drop +${(luck/10).toFixed(1)}%)` : "";
  }
}

// Generuje tło SVG dla lokacji
function locationBgSVG(bg, w, h) {
  const skies = {
    forest:   ["#0a1a0a","#0f2f0f"],
    desert:   ["#1a1000","#3a2000"],
    mountain: ["#0a0a1a","#1a1a3a"],
    tundra:   ["#0a0f1a","#0f1a2f"],
    shadow:   ["#050508","#0a0510"],
  };
  const grounds = {
    forest:   ["#0a2a0a","#0f3a0f","#1a5a1a"],
    desert:   ["#3a2000","#5a3000","#7a5010"],
    mountain: ["#1a1a2a","#2a2a3a","#6a6a7a"],
    tundra:   ["#0a1a2a","#1a2a3a","#c8e8f0"],
    shadow:   ["#050508","#0a050a","#1a051a"],
  };
  let sk = skies[bg]||skies.forest;
  let gr = grounds[bg]||grounds.forest;

  // Elementy tematyczne
  const extras = {
    forest:   `<circle cx="70%" cy="25%" r="8" fill="#f0d080" opacity="0.6"/>
               <ellipse cx="20%" cy="55%" rx="8" ry="20" fill="${gr[1]}" opacity="0.8"/>
               <ellipse cx="75%" cy="50%" rx="6" ry="18" fill="${gr[1]}" opacity="0.7"/>`,
    desert:   `<circle cx="75%" cy="20%" r="12" fill="#f0a000" opacity="0.9"/>
               <polygon points="15%,${h},20%,${h*0.55},25%,${h}" fill="${gr[1]}" opacity="0.7"/>
               <polygon points="70%,${h},76%,${h*0.5},82%,${h}" fill="${gr[1]}" opacity="0.6"/>`,
    mountain: `<circle cx="20%" cy="30%" r="6" fill="#f0f0ff" opacity="0.8"/>
               <polygon points="10%,${h},28%,${h*0.25},46%,${h}" fill="#3a3a5a" opacity="0.8"/>
               <polygon points="50%,${h},65%,${h*0.3},80%,${h}" fill="#4a4a6a" opacity="0.7"/>`,
    tundra:   `<circle cx="30%" cy="25%" r="7" fill="#c0e0ff" opacity="0.7"/>
               <ellipse cx="50%" cy="60%" rx="40%" ry="8" fill="white" opacity="0.15"/>
               <ellipse cx="20%" cy="70%" rx="15%" ry="4" fill="white" opacity="0.2"/>`,
    shadow:   `<circle cx="50%" cy="20%" r="10" fill="#300020" opacity="0.9"/>
               <circle cx="50%" cy="20%" r="8" fill="#100010" opacity="0.95"/>
               <line x1="0" y1="${h*0.4}" x2="100%" y2="${h*0.4}" stroke="#3a003a" stroke-width="1" opacity="0.3"/>`,
  };

  return `<svg width="100%" height="${h}" viewBox="0 0 300 ${h}" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0">
    <defs><linearGradient id="sky_${bg}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${sk[0]}"/>
      <stop offset="100%" stop-color="${sk[1]}"/>
    </linearGradient></defs>
    <rect width="300" height="${h}" fill="url(#sky_${bg})"/>
    ${extras[bg]||""}
    <rect y="${h*0.62}" width="300" height="${h*0.38}" fill="${gr[0]}"/>
    <rect y="${h*0.72}" width="300" height="${h*0.28}" fill="${gr[1]}"/>
    <rect y="${h*0.82}" width="300" height="${h*0.18}" fill="${gr[2]}"/>
  </svg>`;
}

function checkLocationRequirement(loc, horse) {
  if (!loc.requires) return { ok: true };
  if (loc.requires.pass) {
    let hasPass = inventory.some(i => i.name === loc.requires.pass);
    return { ok: hasPass, label: loc.requires.label, isPass: true };
  }
  if (loc.requires.stat) {
    let val = horse ? (horse.stats[loc.requires.stat]||0) : 0;
    return { ok: val >= loc.requires.value, label: loc.requires.label, isPass: false, val, need: loc.requires.value };
  }
  return { ok: true };
}

function renderLocations() {
  let el = document.getElementById("locations");
  el.innerHTML = "";

  // Najlepszy koń gracza (do sprawdzania wymagań)
  let bestHorse = playerHorses.length > 0
    ? playerHorses.reduce((best, h) => {
        let s = h.stats.speed+h.stats.strength+h.stats.stamina+h.stats.luck;
        let b = best.stats.speed+best.stats.strength+best.stats.stamina+best.stats.luck;
        return s > b ? h : best;
      }, playerHorses[0])
    : null;

  LOCATIONS.forEach((l, i) => {
    let req   = checkLocationRequirement(l, bestHorse);
    let locked = !req.ok;
    let rc    = { common:"#8aab84", uncommon:"#4a9e6a", rare:"#4a7ec8", epic:"#7b5ea7", legendary:"#c9a84c", mythic:"#c94a6a" }[l.reward] || "#8aab84";
    if (l.bg === "shadow") rc = "#c94a6a";

    let card = document.createElement("div");
    card.className = "location-card" + (locked ? " location-locked" : "");
    card.style.borderColor = locked ? "#333" : rc + "66";

    // Tło SVG
    let bgDiv = document.createElement("div");
    bgDiv.style.cssText = "position:relative;height:80px;overflow:hidden;border-radius:8px;margin-bottom:10px";
    bgDiv.innerHTML = locationBgSVG(l.bg, 300, 80);

    // Overlay tekstu na tle
    let overlay = document.createElement("div");
    overlay.style.cssText = "position:absolute;inset:0;display:flex;align-items:flex-end;padding:6px 8px;background:linear-gradient(transparent 30%,rgba(0,0,0,0.7))";
    overlay.innerHTML = `
      <div style="flex:1">
        <div style="font-family:'Cinzel',serif;font-size:13px;color:${locked?"#555":rc}">${l.icon} ${l.name}</div>
        <div style="font-size:10px;color:${locked?"#444":"#aaa"};margin-top:1px">${l.lore}</div>
      </div>
      ${locked ? `<span style="font-size:18px;opacity:0.6">🔒</span>` : ""}
    `;
    bgDiv.appendChild(overlay);

    // Ambiance emoji (tle atmosferyczne)
    if (!locked && l.ambiance) {
      l.ambiance.forEach((em, j) => {
        let span = document.createElement("span");
        span.style.cssText = `position:absolute;font-size:${10+j%3*2}px;opacity:${0.3+j*0.1};
          left:${8+j*18}%;top:${10+j%3*15}%;animation:expTwinkle ${1.5+j*0.3}s infinite alternate ${j*0.2}s`;
        span.textContent = em;
        bgDiv.appendChild(span);
      });
    }

    card.appendChild(bgDiv);

    // Info pod tłem
    let info = document.createElement("div");
    info.innerHTML = `
      <div style="font-size:11px;color:${locked?"#555":"var(--text2)"};margin-bottom:6px;line-height:1.4">${l.desc}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px">
        <div style="font-size:10px;color:${locked?"#444":"var(--text2)"}">
          💰 ${l.gold.min}–${l.gold.max} &nbsp;
          📦 Nagroda: <span style="color:${rc}">${l.reward}</span>
        </div>
        ${l.rewardPass ? `<div style="font-size:10px;color:#4a9e6a">🎫 ${l.rewardPass}</div>` : ""}
      </div>
      ${locked ? `<div style="margin-top:6px;padding:5px 8px;background:rgba(201,74,74,0.08);border:1px solid #c94a4a44;border-radius:6px;font-size:11px;color:#c94a4a">
        🔒 ${req.label}${req.val !== undefined ? ` (masz: ${req.val})` : ""}
      </div>` : ""}
    `;
    card.appendChild(info);

    if (!locked) {
      let btn = document.createElement("button");
      btn.style.cssText = `width:100%;margin-top:8px;border-color:${rc};color:${rc};background:${rc}15;font-size:12px`;
      btn.textContent = "🌍 Wyślij na wyprawę";
      btn.onclick = () => {
        if (l.requires?.pass) {
          // Zużyj przepustkę
          let passIdx = inventory.findIndex(it => it.name === l.requires.pass);
          if (passIdx >= 0) { inventory.splice(passIdx, 1); saveGame(); }
        }
        openExpeditionHorsePicker(i);
      };
      card.appendChild(btn);
    }

    el.appendChild(card);
  });
}

function renderExpeditions() {
  let el     = document.getElementById("expeditionsDiv");
  let active = expeditions.filter(e => !e.done);

  // Sprawdź czy są jakieś po zakończeniu
  active.forEach(e => { if (Date.now() >= e.end) finishExpedition(e); });
  active = expeditions.filter(e => !e.done);

  if (active.length === 0) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">🗺️</div>Brak aktywnych wypraw</div>`;
    return;
  }
  // Upewnij się że nie ma "brak" komunikatu gdy są aktywne
  let emptyEl = el.querySelector(".empty");
  if (emptyEl) emptyEl.remove();

  // Zachowaj istniejące karty — tylko aktualizuj timer i progress
  active.forEach(e => {
    let t   = e.end - Date.now();
    let tot = EXPEDITION_TIME;
    let pct = Math.max(0, Math.min(100, ((tot - t) / tot) * 100));
    if (t <= 0) { finishExpedition(e); return; }

    let existingId = `exp_card_${e.end}`;
    let existing   = document.getElementById(existingId);

    if (existing) {
      let timerEl = existing.querySelector(".exp-card-timer");
      let barEl   = existing.querySelector(".exp-card-bar");
      let horseEl = existing.querySelector(".exp-card-horse");
      let dustEl  = existing.querySelector(".exp-card-dust");
      let newLeft = Math.max(2, Math.min(88, pct)) + "%";
      if (timerEl) timerEl.textContent = Math.ceil(t/1000) + "s";
      if (barEl)   { barEl.style.width = pct + "%"; }
      if (horseEl) { horseEl.style.left = newLeft; }
      if (dustEl)  { dustEl.style.left  = newLeft; }
      return;
    }

    // Stwórz nową kartę wyprawy z animowanym koniem
    let loc       = LOCATIONS[e.locationIndex];
    let expHorse  = playerHorses[e.horseIdx] || null;
    let hName     = e.horseName || (expHorse?.name||"Koń");
    let hRarity   = expHorse?.rarity || "common";
    let rc        = RARITY_COLORS[hRarity] || "#8aab84";
    let hBreed    = expHorse?.breedKey || expHorse?.name || hName;
    let vis       = (typeof getBreedVisual === "function") ? getBreedVisual(hBreed) : { coat:"#8B6914", mane:"#4a2e00" };
    let coat      = vis.coat || "#8B6914";
    let mane      = vis.mane || "#4a2e00";

    let card = document.createElement("div");
    card.id  = existingId;
    card.className = "exp-card-anim";
    card.style.cssText = `
      background:var(--panel2);border:1px solid ${rc}44;border-radius:12px;
      padding:12px 16px;margin-bottom:10px;position:relative;overflow:hidden;
    `;

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:20px">${expHorse?.flag||"🐴"}</span>
          <div>
            <div style="font-family:'Cinzel',serif;font-size:13px;color:${rc}">${hName}${e.injured ? " 🤕" : ""}</div>
            <div style="font-size:11px;color:var(--text2)">${loc.icon} ${loc.name}${e.injured ? ` <span style="color:#c94a4a">· Kontuzja!</span>` : ""}</div>
          </div>
        </div>
        <span class="exp-card-timer exp-timer">${Math.ceil(t/1000)}s</span>
      </div>

      <!-- Scena animowana -->
      <div style="position:relative;height:64px;border-radius:8px;overflow:hidden;background:linear-gradient(180deg,#0a0e1a 0%,#1a2040 55%,#0f3a0f 100%)">
        <!-- Gwiazdy -->
        <div style="position:absolute;top:4px;left:10%;width:2px;height:2px;border-radius:50%;background:#fff;opacity:0.8;animation:expTwinkle 1.5s infinite alternate"></div>
        <div style="position:absolute;top:8px;left:30%;width:1px;height:1px;border-radius:50%;background:#fff;opacity:0.6;animation:expTwinkle 2s infinite alternate 0.5s"></div>
        <div style="position:absolute;top:5px;left:60%;width:2px;height:2px;border-radius:50%;background:#fff;opacity:0.7;animation:expTwinkle 1.8s infinite alternate 0.3s"></div>
        <div style="position:absolute;top:3px;left:80%;width:1px;height:1px;border-radius:50%;background:#fff;opacity:0.5;animation:expTwinkle 2.2s infinite alternate 0.8s"></div>
        <!-- Trawa paralaksa -->
        <div style="position:absolute;bottom:0;width:200%;height:22px;background:#0a2a0a;animation:expScrollFar 5s linear infinite"></div>
        <div style="position:absolute;bottom:0;width:200%;height:14px;background:#0f3a0f;animation:expScrollMid 3.5s linear infinite"></div>
        <div style="position:absolute;bottom:0;width:200%;height:8px;background:#1a5a1a;animation:expScrollNear 2s linear infinite"></div>
        <div class="exp-card-horse" style="position:absolute;bottom:6px;left:${Math.max(2,Math.min(88,pct))}%;transform:translateX(-50%);animation:expBob 0.35s ease-in-out infinite alternate;transition:left 1s linear">
          <!-- koń wstawiany przez JS po render -->
        </div>
        <div class="exp-card-dust" style="position:absolute;bottom:5px;left:${Math.max(2,Math.min(88,pct))}%;margin-left:-12px">
          <div style="width:5px;height:5px;border-radius:50%;background:rgba(139,105,20,0.4);position:absolute;animation:expDust 0.5s ease-out 0s infinite"></div>
          <div style="width:4px;height:4px;border-radius:50%;background:rgba(139,105,20,0.35);position:absolute;left:8px;animation:expDust 0.5s ease-out 0.15s infinite"></div>
        </div>
      </div>

      <!-- Pasek postępu -->
      <div style="margin-top:8px;height:4px;background:var(--border);border-radius:2px;overflow:hidden">
        <div class="exp-card-bar" style="height:100%;background:${rc};width:${pct}%;border-radius:2px;transition:width 1s linear"></div>
      </div>
    `;
    el.appendChild(card);

    // Wstaw konia SVG przez DOM — querySelector na właśnie dodanej karcie
    let horseWrap = card.querySelector(".exp-card-horse");
    if (horseWrap) {
      let svgDiv = document.createElement("div");
      svgDiv.innerHTML = buildExpHorseSVG(coat, mane);
      let svgEl = svgDiv.querySelector("svg");
      if (svgEl) {
        // Animuj nogi CSS
        svgEl.querySelectorAll(".efl").forEach((el2,i) => {
          el2.style.transformBox = "fill-box";
          el2.style.transformOrigin = "top center";
          el2.style.animation = `expLegFront 0.3s ease-in-out ${["0s","0.2s"][i]||"0s"} infinite`;
        });
        svgEl.querySelectorAll(".ebl").forEach((el2,i) => {
          el2.style.transformBox = "fill-box";
          el2.style.transformOrigin = "top center";
          el2.style.animation = `expLegBack 0.3s ease-in-out ${["0.1s","0.3s"][i]||"0s"} infinite`;
        });
        let tail = svgEl.querySelector(".etail");
        if (tail) { tail.style.transformBox="fill-box"; tail.style.transformOrigin="0% 50%"; tail.style.animation="expTailWave 0.25s ease-in-out infinite alternate"; }
        let maneEl = svgEl.querySelector(".emane");
        if (maneEl) { maneEl.style.transformBox="fill-box"; maneEl.style.transformOrigin="right top"; maneEl.style.animation="expManeWave 0.25s ease-in-out infinite alternate"; }
        horseWrap.appendChild(svgEl);
      }
    }
  });

  // Usuń karty dla zakończonych wypraw
  el.querySelectorAll(".exp-card-anim").forEach(card => {
    let id = card.id.replace("exp_card_","");
    if (!active.find(e => String(e.end) === id)) card.remove();
  });
}

function buildExpHorseSVG(coat, mane) {
  let d20 = darken3(coat,20), d25 = darken3(coat,25), d15 = darken3(coat,15);
  let svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("width","52"); svg.setAttribute("height","38"); svg.setAttribute("viewBox","0 0 52 38");
  svg.innerHTML = `
    <ellipse cx="38" cy="34" rx="16" ry="3" fill="rgba(0,0,0,0.25)"/>
    <path class="etail" d="M44,16 C50,13 52,20 47,26" stroke="${mane}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <rect class="ebl" x="32" y="22" width="3" height="11" rx="1.5" fill="${d20}"/>
    <rect class="ebl" x="37" y="22" width="3" height="11" rx="1.5" fill="${d20}"/>
    <ellipse cx="28" cy="18" rx="17" ry="8" fill="${coat}"/>
    <ellipse cx="14" cy="12" rx="5" ry="8" fill="${coat}" transform="rotate(-18,14,12)"/>
    <ellipse cx="8" cy="6" rx="5.5" ry="4" fill="${coat}"/>
    <ellipse cx="4" cy="8" rx="2.5" ry="2" fill="${d25}"/>
    <circle cx="10" cy="5" r="1.5" fill="#1a0800"/>
    <circle cx="10.5" cy="4.5" r="0.5" fill="#fff"/>
    <ellipse cx="13" cy="2" rx="1.5" ry="2.5" fill="${coat}" transform="rotate(-10,13,2)"/>
    <path class="emane" d="M13,7 C9,10 8,14 10,17" stroke="${mane}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <rect class="efl" x="18" y="22" width="3" height="11" rx="1.5" fill="${d15}"/>
    <rect class="efl" x="23" y="22" width="3" height="11" rx="1.5" fill="${d15}"/>
    <rect x="32" y="31" width="3" height="2" rx="1" fill="#1a0800"/>
    <rect x="37" y="31" width="3" height="2" rx="1" fill="#1a0800"/>
    <rect x="18" y="31" width="3" height="2" rx="1" fill="#1a0800"/>
    <rect x="23" y="31" width="3" height="2" rx="1" fill="#1a0800"/>
  `;
  return svg.outerHTML;
}

function darken3(hex, pct) {
  if (!hex||hex.length<7) return "#4a3520";
  let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  if(isNaN(r)) return "#4a3520";
  return "#"+[Math.max(0,r-pct),Math.max(0,g-pct),Math.max(0,b-pct)].map(v=>v.toString(16).padStart(2,"0")).join("");
}
