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
  expeditions.push({ end: Date.now() + EXPEDITION_TIME, locationIndex: i, horseIdx: horseIdx||0, horseName: h?.name||"?", done: false });
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
      </div>
    `;
    if (busy) {
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
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

function finishExpedition(e) {
  let loc   = LOCATIONS[e.locationIndex];
  let luck  = getPartyLuck(); // 0–100+
  // Szczęście dodaje bonus do szansy: np. luck=50 → +5% do dropów
  let luckBonus = luck / 10;
  let r     = Math.random() * 100;

  // koń: 7%+luck/20 | skrzynka: 3%+luck/30 | jedzenie: 10% | reszta nic
  let horseChance = 7  + luckBonus / 2;
  let boxChance   = horseChance + 3 + luckBonus / 3;
  let foodChance  = boxChance   + 10;

  if (r < horseChance) {
    if (playerHorses.length >= STABLE_LIMIT) {
      log(`🐴 Znaleziono konia, ale stajnia pełna!`);
    } else {
      let h = generateHorse(loc.reward);
      playerHorses.push(h);
      log(`🐴 Nowy koń: ${h.name} (${HORSE_DATABASE[h.group].name})!`);
      // Efekt wizualny dla rzadkich+
      if (typeof showRareHorseEffect === "function") {
        setTimeout(() => showRareHorseEffect(h.name, h.rarity, h.flag), 300);
      }
    }
  } else if (r < boxChance) {
    inventory.push({ name: "Skrzynka z Łupem", obtained: Date.now() });
    log(`📦 Znaleziono Skrzynkę z Łupem!`);
  } else if (r < foodChance) {
    let food = Math.random() < 0.6 ? "Słoma" : "Jabłko";
    inventory.push({ name: food, obtained: Date.now() });
    log(`${food === "Jabłko" ? "🍎" : "🌾"} Znaleziono: ${food}!`);
  } else {
    log(`📜 Wyprawa do ${loc.name} — nic nie znaleziono.`);
  }

  let perks    = getActivePerkBonus();
  let baseGold = 50 + Math.floor(Math.random() * 151) + Math.floor(luck * 0.5);
  let goldGain = Math.round(baseGold * perks.goldBonus);
  gold += goldGain;
  log(`💰 +${goldGain} złota z wyprawy!`);

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

function renderLocations() {
  let el = document.getElementById("locations");
  el.innerHTML = "";
  LOCATIONS.forEach((l, i) => {
    let b = document.createElement("div");
    b.className = "location-btn";
    b.innerHTML = `<span class="loc-icon">${l.icon}</span><span class="loc-name">${l.name}</span><span class="loc-desc">${l.desc}</span>`;
    b.onclick = () => openExpeditionHorsePicker(i);
    el.appendChild(b);
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
      // Tylko aktualizuj timer i pasek
      let timerEl = existing.querySelector(".exp-card-timer");
      let barEl   = existing.querySelector(".exp-card-bar");
      let horseEl = existing.querySelector(".exp-card-horse");
      if (timerEl) timerEl.textContent = Math.ceil(t/1000) + "s";
      if (barEl)   barEl.style.width = pct + "%";
      // Przesuń konia wzdłuż paska
      if (horseEl) horseEl.style.left = Math.max(2, Math.min(88, pct)) + "%";
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
            <div style="font-family:'Cinzel',serif;font-size:13px;color:${rc}">${hName}</div>
            <div style="font-size:11px;color:var(--text2)">${loc.icon} ${loc.name}</div>
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
        <!-- KOŃ — przesuwa się od lewej do prawej wraz z postępem -->
        <div class="exp-card-horse" style="
          position:absolute;bottom:6px;
          left:${Math.max(2,Math.min(88,pct))}%;
          transform:translateX(-50%);
          animation:expBob 0.35s ease-in-out infinite alternate;
          transition:left 1s linear;
        ">
          <svg width="52" height="38" viewBox="0 0 52 38">
            <ellipse cx="38" cy="34" rx="16" ry="3" fill="rgba(0,0,0,0.25)"/>
            <!-- Ogon -->
            <path style="animation:expTailWave 0.25s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:0% 50%" d="M44,16 C50,13 52,20 47,26" stroke="${mane}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <!-- Nogi tylne -->
            <rect style="animation:expLegBack 0.3s ease-in-out 0.1s infinite;transform-box:fill-box;transform-origin:top center" x="32" y="22" width="3" height="11" rx="1.5" fill="${darken3(coat,20)}"/>
            <rect style="animation:expLegBack 0.3s ease-in-out 0.3s infinite;transform-box:fill-box;transform-origin:top center" x="37" y="22" width="3" height="11" rx="1.5" fill="${darken3(coat,20)}"/>
            <!-- Tułów -->
            <ellipse cx="28" cy="18" rx="17" ry="8" fill="${coat}"/>
            <!-- Szyja -->
            <ellipse cx="14" cy="12" rx="5" ry="8" fill="${coat}" transform="rotate(-18,14,12)"/>
            <!-- Głowa -->
            <ellipse cx="8" cy="6" rx="5.5" ry="4" fill="${coat}"/>
            <!-- Nos -->
            <ellipse cx="4" cy="8" rx="2.5" ry="2" fill="${darken3(coat,25)}"/>
            <!-- Oko -->
            <circle cx="10" cy="5" r="1.5" fill="#1a0800"/>
            <circle cx="10.5" cy="4.5" r="0.5" fill="#fff"/>
            <!-- Ucho -->
            <ellipse cx="13" cy="2" rx="1.5" ry="2.5" fill="${coat}" transform="rotate(-10,13,2)"/>
            <!-- Grzywa -->
            <path style="animation:expManeWave 0.25s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:right top" d="M13,7 C9,10 8,14 10,17" stroke="${mane}" stroke-width="3" fill="none" stroke-linecap="round"/>
            <!-- Nogi przednie -->
            <rect style="animation:expLegFront 0.3s ease-in-out 0s infinite;transform-box:fill-box;transform-origin:top center" x="18" y="22" width="3" height="11" rx="1.5" fill="${darken3(coat,15)}"/>
            <rect style="animation:expLegFront 0.3s ease-in-out 0.2s infinite;transform-box:fill-box;transform-origin:top center" x="23" y="22" width="3" height="11" rx="1.5" fill="${darken3(coat,15)}"/>
            <!-- Kopyta -->
            <rect x="32" y="31" width="3" height="2" rx="1" fill="#1a0800"/>
            <rect x="37" y="31" width="3" height="2" rx="1" fill="#1a0800"/>
            <rect x="18" y="31" width="3" height="2" rx="1" fill="#1a0800"/>
            <rect x="23" y="31" width="3" height="2" rx="1" fill="#1a0800"/>
          </svg>
        </div>
        <!-- Pyłek -->
        <div style="position:absolute;bottom:5px;left:${Math.max(2,Math.min(88,pct))}%;margin-left:-12px">
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
  });

  // Usuń karty dla zakończonych wypraw
  el.querySelectorAll(".exp-card-anim").forEach(card => {
    let id = card.id.replace("exp_card_","");
    if (!active.find(e => String(e.end) === id)) card.remove();
  });
}

function darken3(hex, pct) {
  if (!hex||hex.length<7) return "#4a3520";
  let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  if(isNaN(r)) return "#4a3520";
  return "#"+[Math.max(0,r-pct),Math.max(0,g-pct),Math.max(0,b-pct)].map(v=>v.toString(16).padStart(2,"0")).join("");
}
