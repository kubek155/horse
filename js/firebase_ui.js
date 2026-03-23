// =====================
// FIREBASE UI — Rynek globalny + Turnieje
// =====================

// ── NICK GRACZA ───────────────────────────────────────────
function openNickModal() {
  let existing = document.getElementById("nickModal");
  if (existing) { existing.style.display="flex"; return; }
  let m = document.createElement("div");
  m.id = "nickModal";
  m.style.cssText = "position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;font-family:'Crimson Text',serif";
  m.innerHTML = `
    <div style="background:#0f1a0f;border:1px solid #c9a84c66;border-radius:16px;padding:28px;width:340px">
      <div style="font-family:'Cinzel',serif;font-size:14px;color:#c9a84c;margin-bottom:6px">👤 Twój nick gracza</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:16px">Widoczny dla innych graczy na rynku i w turniejach</div>
      <input id="nickInput" type="text" maxlength="20" placeholder="Wpisz nick..."
        style="width:100%;padding:10px 12px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;color:#d4e8d0;font-size:14px;margin-bottom:12px"
        value="${localStorage.getItem('hh_nick')||''}">
      <button onclick="saveNick()" style="width:100%;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);font-family:'Cinzel',serif">Zapisz</button>
    </div>
  `;
  document.body.appendChild(m);
}

function saveNick() {
  let val = (document.getElementById("nickInput")?.value||"").trim();
  if (!val) { alert("Wpisz nick!"); return; }
  localStorage.setItem("hh_nick", val);
  document.getElementById("nickModal")?.remove();
  if (window.FB) window.FB.savePlayerProfile();
  log(`✅ Nick ustawiony: ${val}`);
  renderFirebaseStatus();
}

// ── STATUS POŁĄCZENIA ─────────────────────────────────────
function renderFirebaseStatus() {
  let el = document.getElementById("firebaseStatus");
  if (!el) return;
  let nick = localStorage.getItem("hh_nick");
  let pid  = window.FB ? window.FB.getPlayerId() : null;
  el.innerHTML = nick
    ? `<span style="color:#4ab870">🌐 Online · ${nick}</span> <button onclick="openNickModal()" style="font-size:10px;padding:2px 8px;border-color:#333;color:#666">Zmień</button>`
    : `<button onclick="openNickModal()" style="font-size:11px;border-color:#c9a84c;color:#c9a84c">👤 Ustaw nick aby grać online</button>`;
}

// =====================
// GLOBALNY RYNEK UI
// =====================
let globalMarketOffers  = [];
let globalMarketUnsub   = null;

function initGlobalMarket() {
  if (!window.FB) return;
  if (globalMarketUnsub) globalMarketUnsub();
  globalMarketUnsub = window.FB.subscribeGlobalMarket(offers => {
    globalMarketOffers = offers;
    renderGlobalMarket();
  });
}

function renderGlobalMarket() {
  let el = document.getElementById("globalMarketList");
  if (!el) return;

  let myId = window.FB ? window.FB.getPlayerId() : null;

  if (globalMarketOffers.length === 0) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">🌐</div>Brak ofert na globalnym rynku</div>`;
    return;
  }

  el.innerHTML = "";

  // Moje oferty pierwsze
  let sorted = [...globalMarketOffers].sort((a,b) => {
    let am = a.sellerId===myId?1:0, bm = b.sellerId===myId?1:0;
    return bm-am;
  });

  sorted.forEach(offer => {
    let isOwn = offer.sellerId === myId;
    let rc    = offer.type==="horse"
      ? (RARITY_COLORS[offer.horse?.rarity]||"#8aab84")
      : "#8aab84";

    let div = document.createElement("div");
    div.style.cssText = `
      background:var(--panel2);border:1px solid ${isOwn?"#c9a84c44":rc+"33"};
      border-radius:10px;padding:12px;margin-bottom:8px;
    `;

    if (offer.type==="horse") {
      let h = offer.horse;
      div.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:22px">${h.flag||"🐴"}</span>
          <div style="flex:1">
            <div style="font-family:'Cinzel',serif;font-size:13px;color:${rc}">${h.name} ${isOwn?'<span style="font-size:10px;color:#c9a84c">· Twoja oferta</span>':''}</div>
            <div style="font-size:11px;color:var(--text2)">${RARITY_LABELS[h.rarity]||h.rarity} · ⚡${h.stats?.speed} 💪${h.stats?.strength} ❤️${h.stats?.stamina}</div>
            <div style="font-size:10px;color:var(--text2);margin-top:2px">👤 ${offer.sellerNick||"Gracz"}</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:'Cinzel',serif;font-size:16px;color:#c9a84c">💰 ${offer.price}</div>
            ${isOwn
              ? `<button onclick="window.FB.cancelGlobalListing('${offer.id}')" style="font-size:10px;border-color:#c94a4a;color:#c94a4a;margin-top:4px">Anuluj</button>`
              : `<button onclick="window.FB.buyFromGlobalMarket('${offer.id}')" class="btn-gold" style="font-size:11px;margin-top:4px">Kup</button>`}
          </div>
        </div>
      `;
    } else {
      let d = ITEMS_DATABASE[offer.item?.name]||{icon:"📦",desc:""};
      div.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:22px">${d.icon}</span>
          <div style="flex:1">
            <div style="font-size:13px;color:var(--text)">${offer.item?.name||"Przedmiot"} ${isOwn?'<span style="font-size:10px;color:#c9a84c">· Twoja oferta</span>':''}</div>
            <div style="font-size:11px;color:var(--text2)">${d.desc}${offer.item?.bonus!==undefined?` · +${offer.item.bonus}`:""}</div>
            <div style="font-size:10px;color:var(--text2);margin-top:2px">👤 ${offer.sellerNick||"Gracz"}</div>
          </div>
          <div style="text-align:right">
            <div style="font-family:'Cinzel',serif;font-size:16px;color:#c9a84c">💰 ${offer.price}</div>
            ${isOwn
              ? `<button onclick="window.FB.cancelGlobalListing('${offer.id}')" style="font-size:10px;border-color:#c94a4a;color:#c94a4a;margin-top:4px">Anuluj</button>`
              : `<button onclick="window.FB.buyFromGlobalMarket('${offer.id}')" class="btn-gold" style="font-size:11px;margin-top:4px">Kup</button>`}
          </div>
        </div>
      `;
    }
    el.appendChild(div);
  });
}

// Wystaw na globalny rynek (integracja z istniejącym rynkiem)
async function listOnGlobalMarketFromLocal(offerId) {
  if (!window.FB) { log("⚠️ Firebase niedostępny"); return; }
  if (!localStorage.getItem("hh_nick")) { openNickModal(); return; }
  let offer = market.find(o=>o.id===offerId);
  if (!offer) return;
  let fbOffer = {
    type:  offer.type,
    price: offer.price,
    horse: offer.horse || null,
    item:  offer.item  || null,
  };
  await window.FB.listOnGlobalMarket(fbOffer);
}

// =====================
// TURNIEJE UI
// =====================
let tournamentEntries  = [];
let tournamentUnsub    = null;
let currentTournamentId = null;

function renderTournamentsSection() {
  let el = document.getElementById("tournamentsContent");
  if (!el) return;

  if (!window.FB) {
    el.innerHTML = `<div style="color:#c94a4a;font-size:13px;padding:20px;text-align:center">⚠️ Firebase niedostępny — sprawdź połączenie</div>`;
    return;
  }
  if (!localStorage.getItem("hh_nick")) {
    el.innerHTML = `<div style="text-align:center;padding:20px"><div style="font-size:13px;color:var(--text2);margin-bottom:12px">Ustaw nick aby dołączyć do turniejów</div><button onclick="openNickModal()" style="border-color:#c9a84c;color:#c9a84c">👤 Ustaw nick</button></div>`;
    return;
  }

  let next = window.FB.getNextTournament();
  let msLeft = next.msLeft;
  let h = Math.floor(msLeft/3600000), m = Math.floor((msLeft%3600000)/60000), s = Math.floor((msLeft%60000)/1000);
  let tId = `${next.type}_${new Date(next.nextTime).toISOString().slice(0,10)}_${next.hour}`;

  if (tId !== currentTournamentId) {
    currentTournamentId = tId;
    if (tournamentUnsub) tournamentUnsub();
    tournamentUnsub = window.FB.subscribeTournamentEntries(tId, entries => {
      tournamentEntries = entries;
      renderTournamentEntries();
    });
  }

  let contestType = typeof CONTEST_TYPES!=="undefined"
    ? CONTEST_TYPES.find(c=>c.id===next.type) : null;
  let myId   = window.FB.getPlayerId();
  let myEntry = tournamentEntries.find(e=>e.playerId===myId);

  el.innerHTML = `
    <div style="background:#131f13;border:1px solid #c9a84c44;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:12px">
        <div>
          <div style="font-family:'Cinzel',serif;font-size:15px;color:#c9a84c">${contestType?.icon||"🏆"} ${next.name}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:3px">${contestType?.desc||""}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:10px;color:var(--text2)">Start za</div>
          <div id="tourneyCountdown" style="font-family:'Cinzel',serif;font-size:18px;color:#c9a84c">${h}h ${m}m ${s}s</div>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-bottom:12px">
        <div style="flex:1;background:#0a140a;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:10px;color:var(--text2)">Wpisowe</div>
          <div style="font-size:14px;color:#c97c2a">💰 ${contestType?.entryFee||0}</div>
        </div>
        <div style="flex:1;background:#0a140a;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:10px;color:var(--text2)">1. miejsce</div>
          <div style="font-size:14px;color:#c9a84c">💰 ${contestType?.prizes?.[0]||0}</div>
        </div>
        <div style="flex:1;background:#0a140a;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:10px;color:var(--text2)">Zapisani</div>
          <div style="font-size:14px;color:#4ab870" id="entryCount">${tournamentEntries.length}</div>
        </div>
      </div>

      ${myEntry
        ? `<div style="margin-bottom:10px;padding:8px;background:rgba(74,171,112,0.1);border:1px solid rgba(74,171,112,0.3);border-radius:8px;font-size:12px;color:#4ab870">
            ✅ Zapisany: ${myEntry.horse?.flag||"🐴"} ${myEntry.horse?.name||""} · <button onclick="unregisterTournament()" style="font-size:10px;border-color:#c94a4a;color:#c94a4a;padding:2px 8px">Wypisz</button>
           </div>`
        : `<button onclick="openTournamentRegister('${tId}')" style="width:100%;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);font-family:'Cinzel',serif">🏁 Zapisz konia · 💰 ${contestType?.entryFee||0}</button>`
      }
    </div>

    <div>
      <div style="font-size:10px;letter-spacing:2px;color:#8aab84;margin-bottom:8px">LOBBY — ZAPISANI GRACZE</div>
      <div id="tournamentEntriesList"></div>
    </div>
  `;

  renderTournamentEntries();

  // Odliczanie
  let cdInterval = setInterval(() => {
    let el2 = document.getElementById("tourneyCountdown");
    if (!el2) { clearInterval(cdInterval); return; }
    let diff = Math.max(0, next.nextTime - Date.now());
    let h2=Math.floor(diff/3600000), m2=Math.floor((diff%3600000)/60000), s2=Math.floor((diff%60000)/1000);
    el2.textContent = `${h2}h ${m2}m ${s2}s`;
    if (diff <= 0) { clearInterval(cdInterval); renderTournamentsSection(); }
  }, 1000);
}

function renderTournamentEntries() {
  let el = document.getElementById("tournamentEntriesList");
  if (!el) return;
  let myId = window.FB ? window.FB.getPlayerId() : null;
  let countEl = document.getElementById("entryCount");
  if (countEl) countEl.textContent = tournamentEntries.length;

  if (tournamentEntries.length === 0) {
    el.innerHTML = `<div style="font-size:12px;color:#4a5a4a;text-align:center;padding:16px">Brak zapisanych graczy. Bądź pierwszy!</div>`;
    return;
  }
  el.innerHTML = tournamentEntries.map((e,i) => {
    let isMe = e.playerId === myId;
    let rc   = RARITY_COLORS[e.horse?.rarity]||"#8aab84";
    return `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:#131f13;border:1px solid ${isMe?"#c9a84c44":"#1e3a1e"};border-radius:8px;margin-bottom:6px">
      <span style="font-size:18px">${e.horse?.flag||"🐴"}</span>
      <div style="flex:1">
        <div style="font-size:12px;color:${rc}">${e.horse?.name||"?"} <span style="font-size:10px;color:var(--text2)">· ${e.playerNick||"Gracz"}</span>${isMe?' <span style="color:#c9a84c;font-size:10px">(Ty)</span>':''}</div>
        <div style="font-size:10px;color:var(--text2)">⚡${e.horse?.stats?.speed} 💪${e.horse?.stats?.strength} ❤️${e.horse?.stats?.stamina}</div>
      </div>
      <span style="font-size:10px;color:${rc}">${RARITY_LABELS[e.horse?.rarity]||""}</span>
    </div>`;
  }).join("");
}

function openTournamentRegister(tId) {
  if (!window.FB) return;
  if (gold < (typeof CONTEST_TYPES!=="undefined" ? (CONTEST_TYPES.find(c=>c.id===window.FB.getNextTournament()?.type)?.entryFee||0) : 0)) {
    log("⚠️ Za mało złota na wpisowe!");
    return;
  }

  let m = document.createElement("div");
  m.id = "tournRegModal";
  m.style.cssText = "position:fixed;inset:0;z-index:9200;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;font-family:'Crimson Text',serif";
  m.innerHTML = `
    <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:14px;padding:22px;width:340px;max-height:80vh;overflow-y:auto">
      <div style="font-family:'Cinzel',serif;font-size:13px;color:#c9a84c;margin-bottom:14px">🏁 Wybierz konia do turnieju</div>
      <div id="tournRegList" style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px"></div>
      <button onclick="document.getElementById('tournRegModal').remove()" style="width:100%;border-color:#333;color:#666">Anuluj</button>
    </div>
  `;
  document.body.appendChild(m);

  let list = document.getElementById("tournRegList");
  let next = window.FB.getNextTournament();
  let contestType = typeof CONTEST_TYPES!=="undefined" ? CONTEST_TYPES.find(c=>c.id===next?.type) : null;
  let fee = contestType?.entryFee || 0;

  playerHorses.forEach((h,i) => {
    let blocked = !!h.injured || !!h.pregnant;
    let rc = RARITY_COLORS[h.rarity]||"#8aab84";
    let div = document.createElement("div");
    div.style.cssText = `display:flex;align-items:center;gap:8px;padding:10px;background:#131f13;border:1px solid ${blocked?"#333":rc+"33"};border-radius:8px;cursor:${blocked?"not-allowed":"pointer"};opacity:${blocked?0.4:1}`;
    div.innerHTML = `
      <span style="font-size:18px">${h.flag||"🐴"}</span>
      <div style="flex:1">
        <div style="font-size:12px;color:${rc}">${h.name}</div>
        <div style="font-size:10px;color:var(--text2)">⚡${h.stats.speed} 💪${h.stats.strength} ❤️${h.stats.stamina} 🍀${h.stats.luck}</div>
        ${blocked?`<div style="font-size:10px;color:#c94a4a">${h.injured?"🤕 Ranny":h.pregnant?"🤰 W ciąży":""}</div>`:""}
      </div>
    `;
    if (!blocked) div.onclick = async () => {
      if (gold < fee) { log("⚠️ Za mało złota!"); return; }
      gold -= fee;
      saveGame();
      await window.FB.registerForTournament(h, tId);
      document.getElementById("tournRegModal")?.remove();
      renderTournamentsSection();
      renderAll();
    };
    list.appendChild(div);
  });
}

async function unregisterTournament() {
  if (!window.FB || !currentTournamentId) return;
  let next = window.FB.getNextTournament();
  let contestType = typeof CONTEST_TYPES!=="undefined" ? CONTEST_TYPES.find(c=>c.id===next?.type) : null;
  let fee = contestType?.entryFee || 0;
  gold += fee; // zwrot wpisowego
  saveGame();
  await window.FB.unregisterFromTournament(currentTournamentId);
  renderTournamentsSection();
  renderAll();
}

// =====================
// GLOBALNY RANKING UI
// =====================
async function renderGlobalRanking() {
  let el = document.getElementById("globalRankingList");
  if (!el || !window.FB) return;
  el.innerHTML = `<div style="font-size:12px;color:var(--text2);text-align:center;padding:16px">Ładowanie...</div>`;
  let players = await window.FB.fetchGlobalRanking();
  let myId    = window.FB.getPlayerId();
  el.innerHTML = players.map((p,i)=>{
    let medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`;
    let isMe  = p.id===myId;
    let rc    = RARITY_COLORS[p.bestHorse?.rarity]||"#8aab84";
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px;background:#131f13;border:1px solid ${isMe?"#c9a84c44":"#1e3a1e"};border-radius:8px;margin-bottom:6px">
      <span style="width:28px;text-align:center;font-size:14px">${medal}</span>
      <div style="flex:1">
        <div style="font-size:13px;color:${isMe?"#c9a84c":"var(--text)"};">${p.nick||"Gracz"}${isMe?' <span style="font-size:10px">(Ty)</span>':''}</div>
        <div style="font-size:10px;color:var(--text2)">Poziom ${p.level||1} · ${p.horseCount||0} koni</div>
        ${p.bestHorse?`<div style="font-size:10px;color:${rc};margin-top:1px">${p.bestHorse.flag||"🐴"} ${p.bestHorse.name} · ⚡${p.bestHorse.stats?.speed}</div>`:""}
      </div>
      <div style="text-align:right;font-size:11px;color:var(--text2)">💰 ${p.gold||0}</div>
    </div>`;
  }).join("");
}

// Auto-init gdy Firebase gotowy
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    renderFirebaseStatus();
    initGlobalMarket();
  }, 2000);
});
