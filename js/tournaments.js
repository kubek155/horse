// =====================
// SYSTEM TURNIEJÓW — v2
// Wiele turniejów naraz, fazy: zapisy → wyścig (10min) → wyniki
// =====================

let _tourneyUnsubs   = {};   // unsub per tournamentId
let _tourneyEntries  = {};   // entries per tournamentId
let _activeTourneys  = [];   // lista aktywnych z Firebase
let _raceIntervals   = {};   // setInterval per race

// ── Fazy turnieju ──────────────────────────────────────────
// startTime      = czas startu wyścigu (koniec zapisów)
// raceEndTime    = startTime + 2 minuty
// active:true + startTime > now       → ZAPISY
// active:true + startTime <= now < raceEndTime → WYŚCIG (2 min)
// active:true + raceEndTime <= now    → ZAKOŃCZONY (wyniki)

function getTourneyPhase(t) {
  let now = Date.now();
  let raceEnd = (t.startTime||0) + 2*60*1000;
  if ((t.startTime||0) > now)         return "registration"; // zapisy
  if (now < raceEnd)                   return "racing";       // wyścig
  return "finished";                                          // wyniki
}

// ── Ładowanie z Firebase ───────────────────────────────────
async function loadAllActiveTournaments() {
  if (!window.FB?.db) return [];
  try {
    let snap = await window.FB.db.collection("tournaments").limit(30).get();
    let now  = Date.now();
    let docs = snap.docs.map(d=>({id:d.id,...d.data()}));
    // Pokaż tylko turnieje w fazie zapisów lub wyścigu (nie zakończone)
    // Zakończone = startTime + 10min + 60s buffer upłynął
    let SHOW_BUFFER = 60 * 1000; // 60s po końcu wyścigu jeszcze widoczny
    return docs.filter(t => {
      if (!t.active) return false;
      let raceEnd = (t.startTime||0) + 2*60*1000;
      return Date.now() < raceEnd + SHOW_BUFFER;
    }).sort((a,b)=>(a.startTime||0)-(b.startTime||0));
  } catch(e) {
    console.warn("loadAllActiveTournaments:", e.message);
    return [];
  }
}

// ── Renderowanie sekcji ────────────────────────────────────
function renderTournamentsSection() {
  let el = document.getElementById("tournamentsContent");
  if (!el) return;
  if (!window.FB) {
    el.innerHTML = `<div style="color:#c94a4a;padding:20px;text-align:center">⚠️ Firebase niedostępny</div>`;
    return;
  }
  if (!window.FB.isLoggedIn()) {
    el.innerHTML = `<div style="text-align:center;padding:30px">
      <div style="font-size:13px;color:var(--text2);margin-bottom:12px">Zaloguj się aby dołączyć do turniejów</div>
      <button onclick="openLoginModal()" style="border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1)">🔑 Zaloguj się</button>
    </div>`;
    return;
  }

  // Wyczyść stare timery i subskrypcje przed ponownym renderem
  Object.values(_raceIntervals).forEach(iv => clearInterval(iv)); _raceIntervals = {};
  Object.values(_tourneyUnsubs).forEach(u => u && u()); _tourneyUnsubs = {};

  el.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text2);font-size:13px">🏆 Ładowanie turniejów...</div>`;

  loadAllActiveTournaments().then(tourneys => {
    _activeTourneys = tourneys;
    _renderAllTournaments(tourneys);
  });
}

function _renderAllTournaments(tourneys) {
  let el = document.getElementById("tournamentsContent");
  if (!el) return;

  // Zatrzymaj stare interwały
  Object.values(_raceIntervals).forEach(iv => clearInterval(iv));
  _raceIntervals = {};

  el.innerHTML = "";

  // Przycisk odświeżania
  let refreshBtn = document.createElement("div");
  refreshBtn.style.cssText = "display:flex;justify-content:flex-end;margin-bottom:12px";
  refreshBtn.innerHTML = `<button onclick="renderTournamentsSection()" style="font-size:11px;border-color:#333;color:#666;padding:4px 12px">↻ Odśwież</button>`;
  el.appendChild(refreshBtn);

  if (!tourneys.length) {
    let empty = document.createElement("div");
    empty.style.cssText = "text-align:center;padding:40px;color:var(--text2)";
    empty.innerHTML = `
      <div style="font-size:40px;margin-bottom:12px">🏆</div>
      <div style="font-family:'Cinzel',serif;font-size:14px;color:#c9a84c;margin-bottom:8px">Brak aktywnych turniejów</div>
      <div style="font-size:12px">Administrator ogłosi nowe turnieje wkrótce</div>
    `;
    el.appendChild(empty);
    return;
  }

  // Renderuj każdy turniej (sprawdź czy karta już istnieje)
  tourneys.forEach(t => {
    let existing = document.getElementById("tourney_card_" + t.id);
    if (existing) return; // już wyrenderowana - nie duplikuj
    _renderOneTournament(el, t);
  });
}

const TOURNEY_TYPE_SVG = {
  sprint:     `<svg viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="14" stroke="#4a7ec8" stroke-width="1.5" fill="none"/><path d="M12 24 L18 10 L24 24" stroke="#4a7ec8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/><line x1="14" y1="20" x2="22" y2="20" stroke="#4a7ec8" stroke-width="1.5"/></svg>`,
  endurance:  `<svg viewBox="0 0 36 36" fill="none"><path d="M6 26 Q10 14 18 16 Q26 18 30 10" stroke="#c94a4a" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="30" cy="10" r="3" fill="#c94a4a"/><circle cx="6" cy="26" r="3" fill="#c94a4a" opacity="0.5"/></svg>`,
  strength:   `<svg viewBox="0 0 36 36" fill="none"><rect x="8" y="15" width="20" height="6" rx="3" stroke="#c97c2a" stroke-width="1.5" fill="none"/><rect x="3" y="11" width="6" height="14" rx="2" fill="#c97c2a" opacity="0.8"/><rect x="27" y="11" width="6" height="14" rx="2" fill="#c97c2a" opacity="0.8"/></svg>`,
  grand_prix: `<svg viewBox="0 0 36 36" fill="none"><polygon points="18,3 21.5,13 33,13 23.5,20 27,30 18,23 9,30 12.5,20 3,13 14.5,13" stroke="#c9a84c" stroke-width="1.5" fill="rgba(201,168,76,0.15)"/></svg>`,
  luck:       `<svg viewBox="0 0 36 36" fill="none"><path d="M18 5 C12 5 7 10 7 16 C7 24 18 33 18 33 C18 33 29 24 29 16 C29 10 24 5 18 5Z" stroke="#4ab870" stroke-width="1.5" fill="none"/><circle cx="18" cy="16" r="4" fill="#4ab870" opacity="0.6"/></svg>`,
};

function _renderOneTournament(container, t) {
  let phase = getTourneyPhase(t);
  let ct    = typeof CONTEST_TYPES !== "undefined" ? CONTEST_TYPES.find(c=>c.id===t.type) : null;
  let rc    = ct?.color || "#c9a84c";
  let typeIcon = TOURNEY_TYPE_SVG[t.type] || TOURNEY_TYPE_SVG.grand_prix;
  let myId  = window.FB.getPlayerId();

  let card  = document.createElement("div");
  card.id   = "tourney_card_" + t.id;
  card.style.cssText = `
    background:#131f13;border:1px solid ${rc}33;border-radius:14px;
    padding:18px;margin-bottom:16px;position:relative;overflow:hidden;
  `;

  // Faza badge
  let phaseBadge = {
    registration: `<span style="font-size:9px;letter-spacing:2px;padding:3px 8px;border-radius:10px;background:rgba(74,184,112,0.15);border:1px solid #4ab87044;color:#4ab870">🟢 ZAPISY OTWARTE</span>`,
    racing:       `<span style="font-size:9px;letter-spacing:2px;padding:3px 8px;border-radius:10px;background:rgba(201,74,74,0.15);border:1px solid #c94a4a44;color:#c94a4a;animation:pulse 1s infinite">🔴 WYŚCIG TRWA</span>`,
    finished:     `<span style="font-size:9px;letter-spacing:2px;padding:3px 8px;border-radius:10px;background:rgba(144,144,144,0.1);border:1px solid #55555544;color:#888">⚫ ZAKOŃCZONY</span>`,
  }[phase];

  let rfLabel = {"all":"Wszystkie","common_uncommon":"Zwykłe+Pospolite","rare":"Rzadkie","epic_legendary_mythic":"Leg/Mit/Prad","epic":"Legendarne","legendary_mythic":"Mityczne+Pradawne"}[t.rarityFilter||"all"]||"Wszystkie";
  let rfColor = {"all":"#8aab84","common_uncommon":"#909090","rare":"#4a7ec8","epic_legendary_mythic":"#c9a84c","epic":"#7b5ea7","legendary_mythic":"#c94a6a"}[t.rarityFilter||"all"]||"#8aab84";
  let rfBadge = t.rarityFilter && t.rarityFilter!=="all" ? `<span style="font-size:9px;padding:2px 7px;border-radius:8px;background:${rfColor}18;border:1px solid ${rfColor}44;color:${rfColor};margin-left:6px">🔒 ${rfLabel}</span>` : "";

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;flex-shrink:0">${typeIcon}</div>
        <div>
          <div style="font-family:'Cinzel',serif;font-size:15px;color:${rc}">${t.name}${rfBadge}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:2px">${ct?.desc||t.type}</div>
          <div style="margin-top:5px">${phaseBadge}</div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0" id="tourney_timer_${t.id}"></div>
    </div>

    <!-- Statystyki -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:14px">
      <div style="background:#0a140a;border-radius:8px;padding:8px;text-align:center">
        <div style="font-size:10px;color:var(--text2)">Wpisowe</div>
        <div style="font-size:13px;color:#c97c2a;font-family:'Cinzel',serif">💰${t.entryFee||0}</div>
      </div>
      <div style="background:#0a140a;border-radius:8px;padding:8px;text-align:center">
        <div style="font-size:10px;color:var(--text2)">🥇 Miejsce</div>
        <div style="font-size:13px;color:#c9a84c;font-family:'Cinzel',serif">💰${(t.prizes||[])[0]||0}</div>
      </div>
      <div style="background:#0a140a;border-radius:8px;padding:8px;text-align:center">
        <div style="font-size:10px;color:var(--text2)">🥈 Miejsce</div>
        <div style="font-size:13px;color:#8aab84;font-family:'Cinzel',serif">💰${(t.prizes||[])[1]||0}</div>
      </div>
      <div style="background:#0a140a;border-radius:8px;padding:8px;text-align:center">
        <div style="font-size:10px;color:var(--text2)">Zapisani</div>
        <div style="font-size:13px;color:#4ab870;font-family:'Cinzel',serif" id="tourney_count_${t.id}">0</div>
      </div>
    </div>

    <!-- Sekcja fazowa -->
    <div id="tourney_phase_${t.id}"></div>

    <!-- Lobby -->
    <div style="font-size:10px;letter-spacing:2px;color:#8aab84;margin:12px 0 8px" id="tourney_lobby_label_${t.id}">LOBBY</div>
    <div id="tourney_entries_${t.id}"></div>
  `;

  container.appendChild(card);

  // Subskrybuj entries
  if (_tourneyUnsubs[t.id]) _tourneyUnsubs[t.id]();
  _tourneyUnsubs[t.id] = window.FB.subscribeTournamentEntries(t.id, entries => {
    _tourneyEntries[t.id] = entries;
    _updateTourneyEntries(t.id, entries, myId, phase);
    let cnt = document.getElementById("tourney_count_" + t.id);
    if (cnt) cnt.textContent = entries.length;
  });

  // Timer i faza
  _startTourneyTimer(t, myId, ct);
}

function _startTourneyTimer(t, myId, ct) {
  function update() {
    let phase    = getTourneyPhase(t);
    let now      = Date.now();
    let raceEnd  = (t.startTime||0) + 2*60*1000;
    let timerEl  = document.getElementById("tourney_timer_" + t.id);
    let phaseEl  = document.getElementById("tourney_phase_" + t.id);
    if (!timerEl) { clearInterval(_raceIntervals[t.id]); return; }

    if (phase === "registration") {
      let ms   = Math.max(0, (t.startTime||0) - now);
      let h    = Math.floor(ms/3600000);
      let m    = Math.floor((ms%3600000)/60000);
      let s    = Math.floor((ms%60000)/1000);
      timerEl.innerHTML = `
        <div style="font-size:10px;color:var(--text2)">Zapisy kończą się za</div>
        <div style="font-family:'Cinzel',serif;font-size:18px;color:#4ab870">${h>0?h+"h ":""}${m}m ${s}s</div>
      `;
      _renderRegistrationPhase(phaseEl, t, myId, ct);

    } else if (phase === "racing") {
      let ms   = Math.max(0, raceEnd - now);
      let m    = Math.floor(ms/60000);
      let s    = Math.floor((ms%60000)/1000);
      timerEl.innerHTML = `
        <div style="font-size:10px;color:#c94a4a">Wyścig kończy się za</div>
        <div style="font-family:'Cinzel',serif;font-size:18px;color:#c94a4a">${m}:${String(s).padStart(2,"0")}</div>
      `;
      _renderRacingPhase(phaseEl, t, myId);

    } else {
      timerEl.innerHTML = `<div style="font-size:12px;color:#555">Zakończony</div>`;
      _renderFinishedPhase(phaseEl, t, myId, ct);
      clearInterval(_raceIntervals[t.id]);
      // Usuń kartę po 60 sekundach
      setTimeout(() => {
        let card = document.getElementById("tourney_card_" + t.id);
        if (card) {
          card.style.transition = "opacity 1s, max-height 1s";
          card.style.opacity = "0";
          card.style.overflow = "hidden";
          card.style.maxHeight = card.offsetHeight + "px";
          setTimeout(() => { card.style.maxHeight = "0"; card.style.marginBottom = "0"; card.style.padding = "0"; }, 100);
          setTimeout(() => card.remove(), 1100);
        }
      }, 60000);
    }
  }

  update();
  _raceIntervals[t.id] = setInterval(update, 250); // 4x/s dla płynności
}

function _renderRegistrationPhase(el, t, myId, ct) {
  if (!el) return;
  let entries = _tourneyEntries[t.id] || [];
  let myEntry = entries.find(e => e.playerId === myId);

  el.innerHTML = myEntry
    ? `<div style="padding:8px 12px;background:rgba(74,171,112,0.1);border:1px solid #4ab87033;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:8px">
          <div class="reg-horse-svg" style="width:44px;height:36px;background:var(--panel);border-radius:6px;overflow:hidden" data-id="${t.id}"></div>
          <div>
            <div style="font-size:12px;color:#4ab870">✅ ${myEntry.horse?.name}</div>
            <div style="font-size:10px;color:var(--text2)">⚡${myEntry.horse?.stats?.speed||0} 💪${myEntry.horse?.stats?.strength||0} ❤️${myEntry.horse?.stats?.stamina||0} 🍀${myEntry.horse?.stats?.luck||0}</div>
          </div>
        </div>
        <button onclick="unregisterFromTourney('${t.id}',${t.entryFee||0})" style="font-size:10px;border-color:#c94a4a;color:#c94a4a;padding:3px 8px">Wypisz +💰${t.entryFee||0}</button>
      </div>`
    : `<button onclick="openTournamentRegister('${t.id}')" style="width:100%;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);font-family:'Cinzel',serif;padding:10px">🏁 Zapisz konia · 💰 ${t.entryFee||0}</button>`;

  // Wstaw SVG konia
  if (myEntry?.horse) {
    setTimeout(() => {
      let slot = el.querySelector(".reg-horse-svg");
      if (slot && typeof drawHorseSVG === "function") {
        let h2 = myEntry.horse;
        slot.innerHTML = drawHorseSVG(h2.breedKey||h2.name, h2.rarity, h2.stars||0);
        let svgEl = slot.querySelector("svg");
        if (svgEl) { svgEl.setAttribute("width","44"); svgEl.setAttribute("height","36"); }
      }
    }, 0);
  }
}

function _renderRacingPhase(el, t, myId) {
  if (!el) return;
  let entries = _tourneyEntries[t.id] || [];
  if (!entries.length) {
    el.innerHTML = `<div style="text-align:center;padding:12px;font-size:12px;color:var(--text2)">Brak uczestników</div>`;
    return;
  }

  // Oblicz pozycje koni na podstawie statystyk + losowości
  let ranked = _calcRacePositions(entries, t.type, Date.now() - (t.startTime||0), 10*60*1000);

  el.innerHTML = `
    <div style="background:#0a0e0a;border-radius:10px;overflow:hidden;border:1px solid #c94a4a33;padding:12px">
      <div style="font-size:10px;color:#c94a4a;letter-spacing:2px;margin-bottom:10px">🏁 WYŚCIG W TOKU</div>
      <div id="race_track_${t.id}" style="position:relative;min-height:${Math.max(60, entries.length * 44)}px"></div>
    </div>
  `;

  _renderRaceTrack(t.id, ranked, myId);
}

function _calcRacePositions(entries, type, elapsed, total) {
  // statKey: który stat decyduje o wyniku
  let statKey = {sprint:"speed", endurance:"stamina", strength:"strength", grand_prix:null, luck:"luck"}[type];
  let progress = Math.min(1, elapsed / total);

  // Każdy koń dostaje deterministyczny "score" (nie zmienia się między re-renderami)
  let scored = entries.map(e => {
    let h    = e.horse || {};
    // Główna statystyka (0-200)
    let stat = statKey
      ? (h.stats?.[statKey] || 20)
      : (((h.stats?.speed||20)+(h.stats?.stamina||20)+(h.stats?.strength||20)+(h.stats?.luck||20))/4);

    // Deterministyczna "losowość" per gracz (seed z playerId + typ turnieju)
    let seed  = _hashStr(e.playerId + type);
    // Losowość: ±20% wartości statu (żeby słabszy koń mógł wygrać z nieco lepszym)
    let jitter = ((seed % 200) - 100) / 100; // -1.0 do +1.0
    let luck   = h.stats?.luck || 10;
    let rand   = jitter * stat * 0.15 + jitter * luck * 0.05;

    let score = Math.max(1, stat + rand);
    return {...e, score};
  });

  // Sortuj wg score — lider ma najwyższy
  scored.sort((a,b) => b.score - a.score);

  // Pozycja na torze:
  // - Lider (idx=0): zawsze nieco z przodu
  // - Na końcu wyścigu (progress=1): lider jest na 95%, ostatni na ~65%
  // - Wszyscy poruszają się proporcjonalnie do czasu
  let N = scored.length;
  return scored.map((e, i) => {
    // Pozycja bazowa zależna od ranku w stawce
    // Lider (i=0) → 1.0 * progress, ostatni (i=N-1) → 0.65 * progress
    let rankFactor = 1.0 - (i / Math.max(1, N-1)) * 0.30; // 1.0 → 0.70
    // Dodaj krzywiznę — lider przyspiesza na końcu (easing out)
    let easedProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2*progress+2, 2)/2;
    let pos = Math.min(97, easedProgress * 100 * rankFactor);
    // Na samym końcu wyścigu — WSZYSCY dochodzą do mety
    if (progress >= 1) pos = 95 - i * (20 / Math.max(1, N-1));
    return {...e, pos};
  });
}

function _hashStr(s) {
  let h = 0;
  for (let i=0; i<s.length; i++) h = (h*31 + s.charCodeAt(i)) & 0x7fffffff;
  return h;
}

function _renderRaceTrack(tid, ranked, myId) {
  let track = document.getElementById("race_track_" + tid);
  if (!track) return;
  track.innerHTML = "";

  ranked.forEach((e, i) => {
    let rc    = (typeof RARITY_COLORS !== "undefined" ? RARITY_COLORS[e.horse?.rarity] : null) || "#8aab84";
    let isMe  = e.playerId === myId;
    // Tor: lewa strona = numer + start, prawa strona = meta (flaga)
    // Koń porusza się w zakresie left: 20px → calc(100% - 60px)
    // Używamy % z offsetem żeby koń nie wychodził poza kontenery
    let leftPct = 3 + (e.pos / 100) * 88; // 3% → 91% (zostaje miejsce na nick + flagę)
    leftPct = Math.max(3, Math.min(91, leftPct));

    let lane  = document.createElement("div");
    lane.style.cssText = `position:relative;height:54px;margin-bottom:6px;
      background:${isMe?"rgba(201,168,76,0.05)":"rgba(0,0,0,0.1)"};
      border-radius:6px;border:1px solid ${isMe?"#c9a84c22":"#1a2a1a"};
      overflow:hidden`;

    // Tor (linia pozioma)
    let track2 = document.createElement("div");
    track2.style.cssText = `position:absolute;top:50%;left:20px;right:40px;height:1px;background:${rc}18`;
    lane.appendChild(track2);

    // Numer miejsca (lewy skraj)
    let num = document.createElement("div");
    num.style.cssText = `position:absolute;left:4px;top:50%;transform:translateY(-50%);
      font-family:'Cinzel',serif;font-size:10px;
      color:${i===0?"#c9a84c":i===1?"#909090":i===2?"#c97c2a":"#4a5a4a"};
      width:14px;text-align:center`;
    num.textContent = i + 1;
    lane.appendChild(num);

    // Koń + nick (animowany)
    let horseEl = document.createElement("div");
    horseEl.dataset.tid  = tid;
    horseEl.dataset.rank = i;
    horseEl.style.cssText = `
      position:absolute;top:50%;left:${leftPct}%;
      transform:translate(-50%,-50%);
      transition:left 0.3s linear;
      display:flex;align-items:center;gap:4px;
      z-index:2;
    `;

    // Mini SVG konia z animacją biegu
    let svgWrap = document.createElement("div");
    svgWrap.className = "race-horse-wrap";
    svgWrap.style.cssText = `width:40px;height:32px;overflow:visible;flex-shrink:0`;
    if (e.horse && typeof buildExpHorseSVG === "function") {
      // Użyj SVG konia z ekspedycji - ma klasy .efl .ebl .etail .emane
      let h2 = e.horse;
      let vis = (typeof getBreedVisual==="function") ? getBreedVisual(h2.breedKey||h2.name) : {coat:"#8B6914",mane:"#4a2e00"};
      svgWrap.innerHTML = buildExpHorseSVG(vis.coat||"#8B6914", vis.mane||"#4a2e00");
      let svgEl = svgWrap.querySelector("svg");
      if (svgEl) { svgEl.setAttribute("width","40"); svgEl.setAttribute("height","32"); }
    } else if (e.horse && typeof drawHorseSVG === "function") {
      svgWrap.innerHTML = drawHorseSVG(e.horse.breedKey||e.horse.name, e.horse.rarity, 0);
      let svgEl = svgWrap.querySelector("svg");
      if (svgEl) { svgEl.setAttribute("width","40"); svgEl.setAttribute("height","32"); }
    } else {
      svgWrap.innerHTML = `<span style="font-size:22px;line-height:32px;display:block;text-align:center">🐴</span>`;
    }
    horseEl.appendChild(svgWrap);

    // Nick (tylko jeśli widoczny - nie nachodzi na inne)
    let nick = document.createElement("div");
    nick.style.cssText = `font-size:9px;color:${rc};white-space:nowrap;max-width:55px;
      overflow:hidden;text-overflow:ellipsis;
      text-shadow:0 0 6px #000,0 0 3px #000`;
    nick.textContent = (e.horse?.name||e.playerNick||"?").split(" ")[0];
    horseEl.appendChild(nick);

    // Pył za koniem (widoczny podczas wyścigu)
    let dust = document.createElement("div");
    dust.style.cssText = `position:absolute;top:65%;pointer-events:none`;
    dust.innerHTML = `
      <div style="width:6px;height:6px;border-radius:50%;background:rgba(139,105,20,0.35);display:inline-block;animation:raceDust 0.5s ease-out infinite 0s"></div>
      <div style="width:4px;height:4px;border-radius:50%;background:rgba(139,105,20,0.25);display:inline-block;animation:raceDust 0.5s ease-out infinite 0.2s;margin-left:4px"></div>
    `;
    horseEl.appendChild(dust);

    lane.appendChild(horseEl);

    // Meta (flaga) — prawy skraj
    let flag = document.createElement("div");
    flag.style.cssText = `position:absolute;right:4px;top:50%;transform:translateY(-50%);
      font-size:16px;opacity:0.5;z-index:1`;
    flag.textContent = "🏁";
    lane.appendChild(flag);

    track.appendChild(lane);
  });
}

function _renderFinishedPhase(el, t, myId, ct) {
  if (!el) return;
  let entries = _tourneyEntries[t.id] || [];
  if (!entries.length) {
    el.innerHTML = `<div style="text-align:center;padding:12px;font-size:12px;color:var(--text2)">Brak uczestników — turniej zakończony</div>`;
    return;
  }

  let ranked  = _calcRacePositions(entries, t.type, 2*60*1000, 2*60*1000);
  let prizes  = t.prizes || [0,0,0];
  let myRank  = ranked.findIndex(e => e.playerId === myId);
  let myPrize = myRank >= 0 && myRank < prizes.length ? prizes[myRank] : 0;

  // ── Auto-payout: wypłać nagrodę graczowi (raz, po zakończeniu) ──
  let payKey = "hh_tourn_paid_" + t.id;
  if (myPrize > 0 && !localStorage.getItem(payKey)) {
    localStorage.setItem(payKey, "1");
    gold = (gold||0) + myPrize;
    saveGame();
    // Powiadom
    let medalNames = ["🥇 1. miejsce","🥈 2. miejsce","🥉 3. miejsce"];
    if (typeof addNotification==="function") addNotification("tournament_win",
      `${medalNames[myRank]||"Turniej"}: ${t.name}`,
      `+💰${myPrize} złota! Koń: ${ranked[myRank]?.horse?.name||"?"}`
    );
    if (typeof log==="function") log(`🏆 Nagroda turnieju: ${medalNames[myRank]||"Nagroda"} · +💰${myPrize}!`);
    if (typeof renderAll==="function") setTimeout(renderAll, 300);
  }

  let medals = ["🥇","🥈","🥉"];
  let podium = ranked.slice(0,3).map((e,i) => {
    let rc = (typeof RARITY_COLORS!=="undefined" ? RARITY_COLORS[e.horse?.rarity] : null)||"#8aab84";
    return `<div style="flex:1;text-align:center;padding:10px 6px;background:#0a140a;border-radius:8px;border:1px solid ${rc}${i===0?"66":"22"};${i===0?"box-shadow:0 0 12px "+rc+"22":""}">
      <div style="font-size:${i===0?"28":"22"}px;margin-bottom:4px">${medals[i]}</div>
      <div class="fin-svg-${t.id}-${i}" style="width:${i===0?56:44}px;height:${i===0?46:36}px;margin:0 auto 4px;overflow:hidden;border-radius:5px;background:var(--panel);border:1px solid ${rc}33"></div>
      <div style="font-size:${i===0?12:10}px;color:${rc};font-family:'Cinzel',serif">${e.horse?.name||"?"}</div>
      <div style="font-size:10px;color:var(--text2)">${e.playerNick||"Gracz"}</div>
      ${prizes[i]?`<div style="font-size:11px;color:#c9a84c;margin-top:4px;font-family:'Cinzel',serif">+💰${prizes[i]}</div>`:""}
      ${e.playerId===myId?`<div style="font-size:9px;color:#4ab870;margin-top:2px">(Ty)</div>`:""}
    </div>`;
  }).join("");

  el.innerHTML = `
    <div style="background:#0a0e0a;border-radius:10px;padding:14px;border:1px solid #c9a84c33">
      <div style="font-size:10px;color:#c9a84c;letter-spacing:2px;margin-bottom:12px">🏆 WYNIKI TURNIEJU</div>
      <div style="display:flex;gap:6px;align-items:flex-end;margin-bottom:12px">${podium}</div>
      ${myPrize > 0 ? `<div style="padding:10px;background:rgba(201,168,76,0.12);border:1px solid #c9a84c55;border-radius:8px;text-align:center;font-family:'Cinzel',serif;color:#c9a84c">
        🎉 Nagroda wypłacona: +💰${myPrize}
      </div>` : (myRank>=0?`<div style="padding:8px;background:var(--panel2);border-radius:8px;text-align:center;font-size:12px;color:var(--text2)">Ukończyłeś na miejscu ${myRank+1} — bez nagrody</div>`:"") }
    </div>
  `;

  // Wstaw SVG koni w podium
  ranked.slice(0,3).forEach((e,i) => {
    setTimeout(() => {
      let slot = el.querySelector(".fin-svg-" + t.id + "-" + i);
      if (slot && e.horse && typeof drawHorseSVG === "function") {
        let w = i===0?56:44, h2 = i===0?46:36;
        slot.innerHTML = drawHorseSVG(e.horse.breedKey||e.horse.name, e.horse.rarity, 0);
        let svgEl = slot.querySelector("svg");
        if (svgEl) { svgEl.setAttribute("width",w); svgEl.setAttribute("height",h2); }
      }
    }, 0);
  });
}

function _updateTourneyEntries(tid, entries, myId, phase) {
  let el = document.getElementById("tourney_entries_" + tid);
  let lbl = document.getElementById("tourney_lobby_label_" + tid);
  if (!el) return;
  if (lbl) lbl.textContent = `LOBBY (${entries.length} graczy)`;

  if (phase === "racing" || phase === "finished") { el.innerHTML = ""; return; }

  if (!entries.length) {
    el.innerHTML = `<div style="font-size:12px;color:#4a5a4a;text-align:center;padding:12px">Brak zapisanych graczy. Bądź pierwszy!</div>`;
    return;
  }
  el.innerHTML = "";
  entries.forEach((e, rank) => {
    let rc   = (typeof RARITY_COLORS !== "undefined" ? RARITY_COLORS[e.horse?.rarity] : null) || "#8aab84";
    let isMe = e.playerId === myId;
    let row  = document.createElement("div");
    row.style.cssText = `display:flex;align-items:center;gap:10px;padding:8px 10px;background:#131f13;border:1px solid ${isMe?"#c9a84c44":"#1e3a1e"};border-radius:8px;margin-bottom:5px`;
    row.innerHTML = `
      <div style="font-size:10px;color:var(--text2);width:14px">${rank+1}</div>
      <div class="lb-svg" style="width:40px;height:32px;background:var(--panel);border-radius:5px;overflow:hidden;border:1px solid ${rc}22;flex-shrink:0"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;color:${rc};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.horse?.name||"?"} ${isMe?'<span style="font-size:10px;color:#c9a84c">(Ty)</span>':''}</div>
        <div style="font-size:10px;color:var(--text2)">⚡${e.horse?.stats?.speed||0} 💪${e.horse?.stats?.strength||0} ❤️${e.horse?.stats?.stamina||0} 🍀${e.horse?.stats?.luck||0}</div>
      </div>
      <span style="font-size:9px;padding:2px 6px;border-radius:4px;background:${rc}18;color:${rc}">${(typeof RARITY_LABELS!=="undefined"?RARITY_LABELS[e.horse?.rarity]:null)||""}</span>
    `;
    el.appendChild(row);
    let svgSlot = row.querySelector(".lb-svg");
    if (svgSlot && e.horse && typeof drawHorseSVG==="function") {
      svgSlot.innerHTML = drawHorseSVG(e.horse.breedKey||e.horse.name, e.horse.rarity, 0);
      let svgEl = svgSlot.querySelector("svg"); if(svgEl){svgEl.setAttribute("width","40");svgEl.setAttribute("height","32");}
    }
  });
}

// ── Wypisanie z turnieju ───────────────────────────────────
async function unregisterFromTourney(tId, fee) {
  if (!window.FB) return;
  await window.FB.unregisterFromTournament(tId);
  if (fee > 0) { gold += fee; saveGame(); renderAll(); }
  log(`↩️ Wypisano z turnieju · Zwrócono 💰${fee}`);
  renderTournamentsSection();
}

// ── Zachowaj stary alias ───────────────────────────────────
function unregisterTournament() {
  if (currentTournamentId) unregisterFromTourney(currentTournamentId, 0);
}

// Cleanup przy zmianie zakładki
window.addEventListener("beforeunload", () => {
  Object.values(_tourneyUnsubs).forEach(u => u && u());
  Object.values(_raceIntervals).forEach(iv => clearInterval(iv));
});

// ── Rejestracja do turnieju ────────────────────────────────
function _horsePasses(h, rarityFilter) {
  if (!rarityFilter || rarityFilter === "all") return true;
  if (rarityFilter === "common_uncommon")       return ["common","uncommon"].includes(h.rarity);
  if (rarityFilter === "rare")                  return h.rarity === "rare";
  if (rarityFilter === "epic_legendary_mythic") return ["epic","legendary","mythic"].includes(h.rarity);
  if (rarityFilter === "epic")                  return h.rarity === "epic";
  if (rarityFilter === "legendary_mythic")      return ["legendary","mythic"].includes(h.rarity);
  return h.rarity === rarityFilter;
}

function openTournamentRegister(tId) {
  let t   = _activeTourneys.find(t2=>t2.id===tId);
  let fee = t?.entryFee || 0;
  if (gold < fee) { log("⚠️ Za mało złota!"); return; }

  let rarityFilter = t?.rarityFilter || "all";
  let rfLabel = {all:"",common_uncommon:"Zwykłe+Pospolite",rare:"Rzadkie",
    epic_legendary_mythic:"Leg/Mit/Prad",epic:"Legendarne",legendary_mythic:"Mityczne+Pradawne"}[rarityFilter]||"";
  let subtitle = fee > 0 ? `Wpisowe: 💰${fee}` : "Bez wpisowego";
  if (rfLabel) subtitle += ` · Tylko: ${rfLabel}`;

  let busyIdxs = new Set(expeditions.filter(e=>!e.done).map(e=>e.horseIdx));

  openHorsePickerModal({
    title:       t?.name || "Turniej",
    subtitle,
    accentColor: "#c9a84c",
    context:     "TURNIEJU",
    bgIcon:      "🏆",
    filterFn: (h, hi) => {
      let badges = [];
      let blocked = false;
      if (busyIdxs.has(hi))           { badges.push({text:"Na wyprawie",color:"#c97c2a"}); blocked=true; }
      if (h.injured)                  { badges.push({text:"🤕 Ranny",color:"#c94a4a"}); blocked=true; }
      if (h.pregnant)                 { badges.push({text:"🤰 W ciąży",color:"#f0a0c8"}); blocked=true; }
      if (!_horsePasses(h,rarityFilter)){ badges.push({text:"❌ Zła rzadkość",color:"#c94a4a"}); blocked=true; }
      return {blocked, badges};
    },
    onSelect: async (hi) => {
      let h = playerHorses[hi];
      if (fee > 0) { gold -= fee; saveGame(); renderAll(); }
      await window.FB.registerForTournament(h, tId);
      log(`🏁 ${h.name} zapisany do turnieju!`);
      renderTournamentsSection();
    },
  });
}
