// =====================
// SYSTEM ZAWODÓW
// =====================

const CONTEST_TYPES = [
  {
    id: "sprint",
    name: "Sprint 400m",
    icon: "⚡",
    desc: "Krótki dystans — liczy się szybkość",
    stat: "speed",
    statWeight: 0.7,
    luckWeight: 0.15,
    staminaWeight: 0.15,
    minLevel: 1,
    entryFee: 100,
    prizes: [400, 200, 100],
    color: "#4a7ec8",
  },
  {
    id: "endurance",
    name: "Wyścig Wytrzymałościowy",
    icon: "❤️",
    desc: "Długi dystans — wytrzymałość kluczowa",
    stat: "stamina",
    statWeight: 0.65,
    luckWeight: 0.1,
    staminaWeight: 0.25,
    minLevel: 3,
    entryFee: 200,
    prizes: [800, 400, 200],
    color: "#c94a4a",
  },
  {
    id: "strength",
    name: "Próba Siły",
    icon: "💪",
    desc: "Przeciąganie — liczy się siła i masa",
    stat: "strength",
    statWeight: 0.75,
    luckWeight: 0.1,
    staminaWeight: 0.15,
    minLevel: 5,
    entryFee: 300,
    prizes: [1200, 600, 300],
    color: "#c97c2a",
  },
  {
    id: "luck",
    name: "Turniej Fortuny",
    icon: "🍀",
    desc: "Losowy tor — szczęście decyduje",
    stat: "luck",
    statWeight: 0.5,
    luckWeight: 0.4,
    staminaWeight: 0.1,
    minLevel: 1,
    entryFee: 150,
    prizes: [600, 300, 150],
    color: "#4a9e6a",
  },
  {
    id: "grand_prix",
    name: "Grand Prix",
    icon: "🏆",
    desc: "Prestiżowy wyścig — wszystkie staty",
    stat: null,
    statWeight: 0,
    luckWeight: 0.2,
    staminaWeight: 0.2,
    minLevel: 10,
    entryFee: 500,
    prizes: [2000, 1000, 500],
    color: "#c9a84c",
  },
];

// Generuj NPC rywali zależnie od poziomu gracza
function generateRivals(contest, playerLevel) {
  let rivals = [];
  let difficulty = Math.max(1, playerLevel);
  for (let i = 0; i < 7; i++) {
    let rarity = ["common","uncommon","rare","epic","legendary"][Math.min(4, Math.floor(difficulty/4) + Math.floor(Math.random()*2))];
    let range  = { common:[5,30], uncommon:[15,40], rare:[30,55], epic:[45,75], legendary:[65,100] }[rarity];
    let base   = range[0] + Math.random()*(range[1]-range[0]);
    let jitter = (Math.random()-0.5)*15;
    let npc = {
      name: generateNPCName(),
      flag: ["🇵🇱","🇩🇪","🇫🇷","🇬🇧","🇪🇸","🇮🇹","🇺🇸","🇦🇪","🇦🇺"][Math.floor(Math.random()*9)],
      rarity,
      isNPC: true,
      stats: {
        speed:    Math.max(1, Math.round(base + jitter)),
        strength: Math.max(1, Math.round(base + jitter*0.8)),
        stamina:  Math.max(1, Math.round(base + jitter*0.9)),
        luck:     Math.max(1, Math.round(base*0.6 + jitter)),
      }
    };
    rivals.push(npc);
  }
  return rivals;
}

const CONTEST_NPC_NAMES = [
  "Burza","Wicher","Błysk","Meteor","Kometa","Grom","Zorza","Struna","Ognik","Mgła",
  "Jaskółka","Sokół","Orzeł","Piorun","Srebro","Złoto","Diament","Księżyc","Słońce","Gwiazda",
  "Arabela","Bellatrix","Cassiopeia","Dafne","Elara","Fawna","Galatea","Hera","Iris","Juno",
];
let npcNameIdx = 0;
function generateNPCName() {
  return CONTEST_NPC_NAMES[(npcNameIdx++ + Math.floor(Math.random()*5)) % CONTEST_NPC_NAMES.length];
}

// Oblicz wynik konia w zawodach
function calcContestScore(horse, contest) {
  let stats = horse.stats;
  let totalStat = stats.speed + stats.strength + stats.stamina + stats.luck;

  if (contest.id === "grand_prix") {
    // Grand Prix — suma wszystkich statów
    return totalStat * (0.6 + Math.random()*0.4) + stats.luck * 0.5 * (Math.random()*2);
  }

  let mainStat   = stats[contest.stat] || 0;
  let luckBonus  = stats.luck * contest.luckWeight;
  let stamBonus  = stats.stamina * contest.staminaWeight;
  let random     = (Math.random()*0.25 + 0.875); // 0.875–1.125

  return (mainStat * contest.statWeight * random) + luckBonus + stamBonus;
}

// =====================
// OTWÓRZ EKRAN ZAWODÓW
// =====================
let contestState = { step:"pick_type", type:null, horse:null, rivals:[], results:[] };

function openContestScreen() {
  // Nie resetuj jeśli już ustawiony krok (np. pick_horse z inline)
  if (contestState.step === "pick_type" || !contestState.step) {
    contestState = { step:"pick_type", type:null, horse:null, rivals:[], results:[] };
  }
  let existing = document.getElementById("contestOverlay");
  if (existing) existing.remove();

  let overlay = document.createElement("div");
  overlay.id  = "contestOverlay";
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.92);
    display:flex;align-items:center;justify-content:center;
    font-family:'Crimson Text',serif;overflow-y:auto;padding:20px;
  `;
  overlay.innerHTML = `
    <div id="contestPanel" style="width:100%;max-width:680px;background:#0f1a0f;border-radius:16px;padding:24px;border:1px solid #1e3a1e;position:relative">
      <button onclick="closeContestScreen()" style="position:absolute;top:12px;right:12px;background:transparent;border:none;color:#4a5a4a;font-size:18px;cursor:pointer">✕</button>
      <div id="contestContent"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  renderContestStep();
}

function closeContestScreen() {
  document.getElementById("contestOverlay")?.remove();
}

function renderContestStep() {
  let el = document.getElementById("contestContent");
  if (!el) return;

  if (contestState.step === "pick_type")  renderPickType(el);
  else if (contestState.step === "pick_horse") renderPickHorse(el);
  else if (contestState.step === "preview")    renderPreview(el);
  else if (contestState.step === "race")       renderRace(el);
  else if (contestState.step === "results")    renderResults(el);
}

// ── Krok 1: Wybór rodzaju zawodów ─────────────────────────
function renderPickType(el) {
  let lvl = typeof getPlayerLevel === "function" ? getPlayerLevel() : 1;
  el.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:#8aab84;text-align:center;margin-bottom:20px;display:flex;align-items:center;justify-content:center;gap:6px"><span style="display:inline-flex;width:14px;height:14px">${typeof UI_ICONS!=="undefined"?UI_ICONS.medal:""}</span> ZAWODY</div>
    <div style="font-size:12px;color:var(--text2);text-align:center;margin-bottom:16px">Wybierz rodzaj zawodów</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px"></div>
  `;
  let grid = el.querySelector("div div");
  CONTEST_TYPES.forEach(type => {
    let locked = lvl < type.minLevel;
    let div = document.createElement("div");
    div.style.cssText = `
      background:#131f13;border:1px solid ${locked?"#1e2e1e":type.color+"44"};
      border-radius:10px;padding:14px;cursor:${locked?"not-allowed":"pointer"};
      opacity:${locked?0.45:1};transition:all 0.15s;
    `;
    div.innerHTML = `
      <div style="font-size:28px;margin-bottom:6px">${type.icon}</div>
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${locked?"#555":type.color};margin-bottom:4px">${type.name}</div>
      <div style="font-size:11px;color:var(--text2);margin-bottom:8px;line-height:1.4">${type.desc}</div>
      <div style="font-size:10px;color:var(--text2)">Wpisowe: <span style="color:var(--gold2)">💰 ${type.entryFee}</span></div>
      <div style="font-size:10px;color:var(--text2)">1. miejsce: <span style="color:#c9a84c">💰 ${type.prizes[0]}</span></div>
      ${locked ? `<div style="font-size:10px;color:#c94a4a;margin-top:4px">🔒 Wymaga poziomu ${type.minLevel}</div>` : ""}
    `;
    if (!locked) div.onclick = () => {
      contestState.type = type;
      contestState.step = "pick_horse";
      renderContestStep();
    };
    grid.appendChild(div);
  });
}

// ── Krok 2: Wybór konia ────────────────────────────────────
function renderPickHorse(el) {
  let type = contestState.type;
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <button onclick="contestState.step='pick_type';renderContestStep()" style="border-color:#333;color:#666;font-size:11px;padding:4px 10px">← Wróć</button>
      <div style="font-family:'Cinzel',serif;font-size:13px;color:${type.color}">${type.icon} ${type.name}</div>
    </div>
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px">Wybierz konia do zawodów:</div>
    <div id="contestHorseList" style="display:flex;flex-direction:column;gap:8px;max-height:60vh;overflow-y:auto"></div>
  `;
  // Zamknij modal i użyj uniwersalnego pickera
  let contestModal = document.getElementById("contestModal");
  if (contestModal) contestModal.style.display = "none";

  openHorsePickerModal({
    title:       type.name || "Zawody",
    subtitle:    type.desc || "",
    accentColor: type.color || "#c9a84c",
    context:     "ZAWODÓW",
    bgIcon:      "🌟",
    filterFn: (h, hi) => {
      let badges = [];
      let blocked = false;
      if (h.injured)  { badges.push({text:"🤕 Ranny",color:"#c94a4a"}); blocked=true; }
      if (h.pregnant) { badges.push({text:"🤰 W ciąży",color:"#f0a0c8"}); blocked=true; }
      if (!blocked) {
        let score = Math.round(calcContestScore(h, type));
        let mainStat = type.stat ? h.stats[type.stat] : (h.stats.speed+h.stats.strength+h.stats.stamina+h.stats.luck);
        badges.push({text:"Wynik: "+mainStat, color: type.color||"#8aab84"});
      }
      return {blocked, badges};
    },
    onSelect: (hi) => {
      contestState.horse = hi;
      contestState.rivals = generateRivals(type, typeof getPlayerLevel==="function"?getPlayerLevel():1);
      contestState.step = "preview";
      if (contestModal) contestModal.style.display = "flex";
      renderContestStep();
    },
  });
}

// ── Krok 3: Podgląd przed startem ─────────────────────────
function renderPreview(el) {
  let type  = contestState.type;
  let horse = playerHorses[contestState.horse];
  let rc    = RARITY_COLORS[horse.rarity]||"#8aab84";
  let canAfford = gold >= type.entryFee;

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <button onclick="contestState.step='pick_horse';renderContestStep()" style="border-color:#333;color:#666;font-size:11px;padding:4px 10px">← Wróć</button>
      <div style="font-family:'Cinzel',serif;font-size:13px;color:${type.color}">${type.icon} ${type.name}</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div style="background:#131f13;border:1px solid ${rc}33;border-radius:10px;padding:12px">
        <div style="font-size:10px;letter-spacing:2px;color:#8aab84;margin-bottom:8px">TWÓJ KOŃ</div>
        <div id="previewHorseSVG" style="border-radius:8px;overflow:hidden;margin-bottom:6px;background:#0a140a"></div>
        <div style="font-family:'Cinzel',serif;font-size:13px;color:${rc}">${horse.name}</div>
        <div style="font-size:10px;color:var(--text2);margin-top:3px">${RARITY_LABELS[horse.rarity]||""}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:6px;display:flex;gap:6px;align-items:center"><span style="display:inline-flex;width:11px;height:11px">${typeof UI_ICONS!=="undefined"?UI_ICONS.speed:""}</span>${horse.stats.speed} <span style="display:inline-flex;width:11px;height:11px">${typeof UI_ICONS!=="undefined"?UI_ICONS.strength:""}</span>${horse.stats.strength} <span style="display:inline-flex;width:11px;height:11px">${typeof UI_ICONS!=="undefined"?UI_ICONS.stamina:""}</span>${horse.stats.stamina} <span style="display:inline-flex;width:11px;height:11px">${typeof UI_ICONS!=="undefined"?UI_ICONS.luck:""}</span>${horse.stats.luck}</div>
      </div>
      <div style="background:#131f13;border:1px solid #1e3a1e;border-radius:10px;padding:12px">
        <div style="font-size:10px;letter-spacing:2px;color:#8aab84;margin-bottom:8px">RYWALE (7 NPC)</div>
        ${contestState.rivals.slice(0,5).map(r=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #1e2e1e">
            <span style="font-size:12px">${r.flag} <span style="color:${RARITY_COLORS[r.rarity]||"#8aab84"};font-size:11px">${r.name}</span></span>
            <span style="font-size:10px;color:var(--text2)">${type.stat?r.stats[type.stat]:(r.stats.speed+r.stats.strength+r.stats.stamina+r.stats.luck)}</span>
          </div>`).join("")}
        <div style="font-size:10px;color:var(--text2);margin-top:4px">...i ${contestState.rivals.length-5} więcej</div>
      </div>
    </div>

    <div style="background:#131f13;border-radius:8px;padding:12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:12px;color:var(--text2)">Wpisowe: <span style="color:${canAfford?"var(--gold2)":"#c94a4a"}">💰 ${type.entryFee}</span> · Twoje złoto: <span style="color:var(--gold2)">💰 ${gold}</span></div>
      <div style="font-size:11px;color:var(--text2);display:flex;gap:8px;align-items:center"><svg width="11" height="11" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="8" r="4" stroke="#f0d040" stroke-width="1.2"/><text x="7" y="11" text-anchor="middle" font-size="5" fill="#f0d040">1</text></svg>${type.prizes[0]} <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="8" r="4" stroke="#c0c0c0" stroke-width="1.2"/><text x="7" y="11" text-anchor="middle" font-size="5" fill="#c0c0c0">2</text></svg>${type.prizes[1]} <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="8" r="4" stroke="#c97c2a" stroke-width="1.2"/><text x="7" y="11" text-anchor="middle" font-size="5" fill="#c97c2a">3</text></svg>${type.prizes[2]}</div>
    </div>

    <button onclick="startContest()" ${canAfford?"":"disabled"} style="
      width:100%;padding:13px;border-radius:10px;
      font-family:'Cinzel',serif;font-size:13px;letter-spacing:1px;
      background:${canAfford?"#0f2a0f":"#0a1a0a"};
      border:1px solid ${canAfford?"var(--gold)":"#333"};
      color:${canAfford?"var(--gold)":"#555"};
      cursor:${canAfford?"pointer":"not-allowed"};
    ">${canAfford?"Startuj · 💰 "+type.entryFee:"Za mało złota (brakuje "+(type.entryFee-gold)+"💰)"}</button>
  `;

  // Wstaw SVG konia
  setTimeout(()=>{
    let slot = document.getElementById("previewHorseSVG");
    if (slot && typeof drawHorseSVG==="function") slot.innerHTML = drawHorseSVG(horse.breedKey||horse.name, horse.rarity, horse.stars||0);
  },30);
}

// ── Krok 4: Wyścig — animacja ──────────────────────────────
function startContest() {
  let type  = contestState.type;
  if (gold < type.entryFee) { log("⚠️ Za mało złota!"); return; }
  gold -= type.entryFee;

  // Oblicz wyniki
  let horse     = playerHorses[contestState.horse];
  let playerScore = calcContestScore(horse, type);
  let allEntries = [
    { name: horse.name, flag: horse.flag||"🐴", score: playerScore, isPlayer: true, rarity: horse.rarity, horse },
    ...contestState.rivals.map(r => ({ name: r.name, flag: r.flag, score: calcContestScore(r, type), isPlayer: false, rarity: r.rarity }))
  ];
  allEntries.sort((a,b)=>b.score-a.score);
  contestState.results = allEntries;
  contestState.playerPlace = allEntries.findIndex(e=>e.isPlayer)+1;
  contestState.step = "race";
  renderContestStep();
}

function renderRace(el) {
  let type    = contestState.type;
  let results = contestState.results;
  let horse   = playerHorses[contestState.horse];
  let rc      = RARITY_COLORS[horse.rarity]||"#8aab84";

  el.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:#8aab84;text-align:center;margin-bottom:16px">${type.icon} WYŚCIG TRWA...</div>
    <div style="position:relative;background:#131f13;border-radius:10px;overflow:hidden;margin-bottom:16px;height:260px">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0a0e1a,#0f2f0f 80%,#1a5a1a)"></div>
      <!-- Linia mety -->
      <div style="position:absolute;right:60px;top:0;bottom:0;width:2px;background:rgba(255,255,255,0.15);border-right:2px dashed rgba(255,255,255,0.1)"></div>
      <div style="position:absolute;right:52px;top:8px;font-size:10px;color:rgba(255,255,255,0.4);writing-mode:vertical-rl">META</div>
      <!-- Konie -->
      <div id="raceTrack" style="position:absolute;inset:10px 70px 10px 10px;display:flex;flex-direction:column;gap:6px"></div>
    </div>
    <button id="raceSkipBtn" onclick="finishRace()" style="width:100%;border-color:#333;color:#666;font-size:12px">Pomiń animację →</button>
  `;

  let track = document.getElementById("raceTrack");
  let maxScore = results[0].score;

  results.forEach((entry, i) => {
    let pct   = 0;
    let finalPct = (entry.score / maxScore) * 85;
    let erc   = RARITY_COLORS[entry.rarity]||"#8aab84";
    let row   = document.createElement("div");
    row.style.cssText = "position:relative;flex:1;display:flex;align-items:center;";
    row.innerHTML = `
      <div class="race-horse-dot" data-idx="${i}" style="
        position:absolute;left:0%;font-size:16px;
        transition:left 0.05s linear;
        filter:drop-shadow(0 0 4px ${entry.isPlayer?rc:erc}88);
      ">${entry.flag}</div>
      <div style="position:absolute;right:-60px;font-size:10px;color:${entry.isPlayer?rc:"#4a5a4a"};white-space:nowrap;overflow:hidden;width:58px;text-overflow:ellipsis">${entry.name}</div>
    `;
    track.appendChild(row);

    // Animuj
    let start = Date.now();
    let duration = 2500 + Math.random()*800;
    let dot = row.querySelector(".race-horse-dot");
    function animate() {
      let elapsed = Date.now()-start;
      let t = Math.min(1, elapsed/duration);
      let ease = t<0.5 ? 2*t*t : -1+(4-2*t)*t;
      let curPct = ease*finalPct;
      dot.style.left = curPct+"%";
      if (t < 1) requestAnimationFrame(animate);
      else if (i === results.length-1) {
        setTimeout(finishRace, 500);
      }
    }
    requestAnimationFrame(animate);
  });
}

function finishRace() {
  contestState.step = "results";
  renderContestStep();
}

// ── Krok 5: Wyniki ─────────────────────────────────────────
function renderResults(el) {
  let type  = contestState.type;
  let place = contestState.playerPlace;
  let horse = playerHorses[contestState.horse];
  let rc    = RARITY_COLORS[horse.rarity]||"#8aab84";
  let prize = type.prizes[place-1] || 0;

  if (prize > 0) {
    gold += prize;
    saveGame();
  }

  let placeIcon = place===1?"🥇":place===2?"🥈":place===3?"🥉":`#${place}`;
  let placeColor = place===1?"#c9a84c":place===2?"#aaa":place===3?"#c97c2a":"#4a5a4a";
  let placeMsg  = place===1?"Zwycięstwo!":place<=3?"Podium!":place<=5?"Dobry wynik":"Następnym razem lepiej";

  // Dodaj XP za zawody
  let xpGain = Math.max(10, Math.floor(50/place));
  if (typeof addXP==="function") addXP(xpGain, type.name);

  // Historia
  if (typeof addDropHistory==="function") addDropHistory({
    icon: placeIcon, name: `${placeMsg} · ${type.name}`,
    source: `Zawody · ${horse.name}`,
    color: placeColor,
    chance: prize>0?`+💰${prize}`:"-",
  });

  el.innerHTML = `
    <div style="text-align:center;padding:10px 0 20px">
      <div style="font-size:56px;margin-bottom:8px">${placeIcon}</div>
      <div style="font-family:'Cinzel',serif;font-size:20px;color:${placeColor};margin-bottom:4px">${placeMsg}</div>
      <div style="font-size:14px;color:var(--text2)">${horse.name} zajął <strong style="color:${placeColor}">${place}. miejsce</strong> na 8</div>
      ${prize>0?`<div style="font-family:'Cinzel',serif;font-size:18px;color:var(--gold2);margin-top:10px">+💰 ${prize}</div>`:""}
      <div style="font-size:12px;color:#f0d080;margin-top:4px">+${xpGain} XP</div>
    </div>

    <div style="background:#131f13;border-radius:10px;padding:12px;margin-bottom:16px">
      <div style="font-size:10px;letter-spacing:2px;color:#8aab84;margin-bottom:10px">PEŁNE WYNIKI</div>
      ${contestState.results.map((e,i)=>{
        let erc = e.isPlayer ? rc : (RARITY_COLORS[e.rarity]||"#4a5a4a");
        let medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":"";
        return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #1e2e1e;${e.isPlayer?"background:rgba(201,168,76,0.05);border-radius:4px;padding:5px 6px;":""}">
          <span style="width:20px;text-align:center;display:inline-flex;align-items:center;justify-content:center">${medal||'<span style="font-size:10px;color:#555">#'+(i+1)+'</span>'}</span>
          <span style="font-size:14px">${e.flag}</span>
          <span style="flex:1;font-size:12px;color:${erc}${e.isPlayer?";font-weight:500":""}">${e.name}</span>
          <span style="font-size:11px;color:var(--text2)">${Math.round(e.score)}</span>
          ${e.isPlayer?`<span style="font-size:10px;color:var(--gold2)">${type.prizes[i]?"+💰"+type.prizes[i]:""}</span>`:""}
        </div>`;
      }).join("")}
    </div>

    <div style="display:flex;gap:8px">
      <button onclick="contestState.step='pick_type';renderContestStep()" style="flex:1;border-color:#333;color:#666">Nowe zawody</button>
      <button onclick="closeContestScreen()" style="flex:1;border-color:var(--gold);color:var(--gold);background:rgba(201,168,76,0.1)">Zamknij</button>
    </div>
  `;
}

// ── Render inline (zamiast overlay) ───────────────────────
const CONTEST_TYPE_SVGS = {
  sprint:    `<svg viewBox="0 0 40 40" fill="none"><path d="M22 6L14 22l5 0L16 34l12-16h-6z" fill="#f0d040" stroke="#c9a800" stroke-width="1"/></svg>`,
  endurance: `<svg viewBox="0 0 40 40" fill="none"><path d="M20 32Q6 22 6 14Q6 8 12 8Q16 8 20 13Q24 8 28 8Q34 8 34 14Q34 22 20 32Z" fill="#e84040"/><path d="M20 28Q10 20 10 14Q10 11 13 11Q16 11 20 16" fill="#ff7070" opacity="0.4"/></svg>`,
  strength:  `<svg viewBox="0 0 40 40" fill="none"><rect x="6" y="18" width="8" height="6" rx="3" fill="#c97c2a"/><rect x="26" y="18" width="8" height="6" rx="3" fill="#c97c2a"/><rect x="12" y="20" width="16" height="2" fill="#a06020"/><rect x="14" y="16" width="4" height="10" rx="1" fill="#c97c2a"/><rect x="22" y="16" width="4" height="10" rx="1" fill="#c97c2a"/></svg>`,
  luck:      `<svg viewBox="0 0 40 40" fill="none"><circle cx="16" cy="16" r="7" fill="#3a8a3a"/><circle cx="24" cy="16" r="7" fill="#4aa04a"/><circle cx="20" cy="22" r="7" fill="#3a8a3a"/><line x1="20" y1="26" x2="20" y2="34" stroke="#3a6a3a" stroke-width="2"/></svg>`,
  grand_prix:`<svg viewBox="0 0 40 40" fill="none"><path d="M14 8h12l2 6h4l-3 6h2l-4 8H13l-4-8h2L8 14h4z" fill="#c9a84c"/><rect x="16" y="28" width="8" height="4" rx="1" fill="#a08030"/><rect x="12" y="32" width="16" height="3" rx="1" fill="#a08030"/></svg>`,
};

function renderContestsInline() {
  let el = document.getElementById("contestsInlineContent");
  if (!el) return;
  let lvl = typeof getPlayerLevel === "function" ? getPlayerLevel() : 1;
  el.innerHTML = "";
  let grid = document.createElement("div");
  grid.style.cssText = "display:flex;flex-direction:column;gap:10px;max-width:560px;margin:0 auto";

  CONTEST_TYPES.forEach(type => {
    let locked = lvl < type.minLevel;
    let svg = CONTEST_TYPE_SVGS[type.id] || "";
    let div    = document.createElement("div");
    div.style.cssText = `
      background:var(--panel2);
      border:1px solid ${locked?"#1e2e1e":type.color+"55"};
      border-radius:12px;padding:16px 20px;
      display:flex;align-items:center;gap:16px;
      opacity:${locked?0.4:1};
    `;
    div.innerHTML = `
      <div style="width:52px;height:52px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
        background:${type.color}15;border-radius:10px;border:1px solid ${type.color}33">
        <div style="width:40px;height:40px">${svg}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Cinzel',serif;font-size:14px;color:${locked?"#555":type.color};margin-bottom:3px">${type.name}</div>
        <div style="font-size:12px;color:var(--text2);margin-bottom:6px">${type.desc}</div>
        <div style="display:flex;gap:12px;font-size:11px">
          <span style="color:var(--text2)">Wpisowe: <span style="color:#c97c2a">💰${type.entryFee}</span></span>
          <span style="color:var(--text2)">1. miejsce: <span style="color:#c9a84c">💰${type.prizes[0]}</span></span>
          ${locked?`<span style="color:#555">🔒 Poz. ${type.minLevel}</span>`:""}
        </div>
      </div>
      ${locked
        ? ""
        : `<button onclick="startContestInline('${type.id}')" style="
            flex-shrink:0;
            border-color:${type.color};color:${type.color};
            background:${type.color}15;font-family:'Cinzel',serif;
            font-size:12px;padding:8px 16px;white-space:nowrap">
            🏁 Startuj
          </button>`
      }
    `;
    grid.appendChild(div);
  });

  el.appendChild(grid);
}

function startContestInline(typeId) {
  let type = CONTEST_TYPES.find(t => t.id === typeId);
  if (!type) return;
  if (gold < type.entryFee) { log(`⚠️ Za mało złota! Potrzebujesz ${type.entryFee}💰`); return; }
  contestState = { step:"pick_horse", type, horse:null, rivals:[], results:[] };
  // Otwórz od razu picker konia (bez ekranu wyboru typu)
  openContestScreen();
}
