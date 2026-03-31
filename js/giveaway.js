// =====================
// SYSTEM GIVEAWAY — Koło Fortuny
// =====================

let _giveawayUnsubs = {};  // mapa unsub per giveaway ID
let _gwTimers = [];  // globalny tracker timerów — czyszczone przy re-render


// ── Render sekcji giveaway ─────────────────────────────────

// ── Auto-payout giveaway ────────────────────────────────────
function _tryPayoutGiveaway(g, myId) {
  if (!g.winner || g.winner.uid !== myId) return;
  let payKey = "hh_giveaway_paid_" + g.id;
  if (localStorage.getItem(payKey)) return; // już wypłacono
  localStorage.setItem(payKey, "1");

  let msg = "";
  if (g.rewardType === "gold") {
    let amt = g.rewardAmount || 0;
    gold = (gold||0) + amt;
    saveGame();
    msg = `+💰${amt} złota`;
    log(`🎡 Wygrałeś Giveaway! ${msg}`);
  } else if (g.rewardType === "item") {
    let item = g.rewardItem || "Skrzynka z Łupem";
    inventory.push({ name:item, obtained:Date.now() });
    saveGame();
    msg = item;
    log(`🎡 Wygrałeś Giveaway! Nagroda: ${item}`);
  } else if (g.rewardType === "horse") {
    let rarity = g.rewardRarity || "rare";
    if (typeof generateHorse === "function") {
      let h = generateHorse(rarity);
      let limit = typeof getStableLimit==="function" ? getStableLimit() : 8;
      if (playerHorses.length >= limit) {
        inventory.push({ name:"Transporter Konia", obtained:Date.now(), horse:h });
      } else {
        playerHorses.push(h);
      }
      saveGame();
      msg = `${h.flag||"🐴"} ${h.name}`;
      log(`🎡 Wygrałeś Giveaway! Koń: ${msg}`);
    }
  }

  if (typeof addNotification==="function") {
    addNotification("tournament_win",
      `🎡 WYGRAŁEŚ GIVEAWAY!`,
      `${g.title||"Giveaway"} · Nagroda: ${msg}`
    );
  }
  if (typeof renderAll==="function") setTimeout(renderAll, 500);
}

function renderGiveawaySection() {
  let el = document.getElementById("giveawaySection");
  if (!el) return;

  let content = document.getElementById("giveawayContent");
  if (!content) return;

  if (!window.FB?.isLoggedIn()) {
    content.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text2)">
      <div style="font-size:40px;margin-bottom:12px">🎡</div>
      <div style="font-family:'Cinzel',serif;font-size:14px;color:#c9a84c;margin-bottom:8px">Zaloguj się aby wziąć udział</div>
      <button onclick="openLoginModal()" style="border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1)">🔑 Zaloguj się</button>
    </div>`;
    return;
  }

  // Wyczyść stare timery i subskrypcje
  _gwTimers.forEach(iv => clearInterval(iv)); _gwTimers = [];
  Object.values(_giveawayUnsubs).forEach(u => u && u()); _giveawayUnsubs = {};
  content.innerHTML = `<div style="text-align:center;padding:30px;color:var(--text2)">⏳ Ładowanie...</div>`;
  _loadActiveGiveaways();
}

async function _loadActiveGiveaways() {
  let content = document.getElementById("giveawayContent");
  if (!content || !window.FB?.db) return;

  try {
    let now  = Date.now();
    let snap = await window.FB.db.collection("giveaways").limit(20).get();
    let docs = snap.docs.map(d => ({id:d.id,...d.data()}));

    // Filtruj aktywne (jeszcze nie zakończone + 5min po zakończeniu)
    let active = docs.filter(g => g.active && (g.drawTime||0) + 5*60*1000 > now - 60000)
                     .sort((a,b) => (a.drawTime||0)-(b.drawTime||0));

    if (!active.length) {
      content.innerHTML = `
        <div style="text-align:center;padding:60px 20px">
          <div style="font-size:56px;margin-bottom:16px">🎡</div>
          <div style="font-family:'Cinzel',serif;font-size:16px;color:#c9a84c;margin-bottom:8px">Brak aktywnych giveaway</div>
          <div style="font-size:13px;color:var(--text2)">Obserwuj tę zakładkę — admin ogłosi giveaway wkrótce!</div>
        </div>`;
      return;
    }

    content.innerHTML = "";
    active.forEach(g => _renderGiveawayCard(content, g));

  } catch(e) {
    content.innerHTML = `<div style="color:#c94a4a;padding:20px">Błąd: ${e.message}</div>`;
  }
}

function _renderGiveawayCard(container, g) {
  let now     = Date.now();
  let msLeft  = Math.max(0, (g.drawTime||0) - now);
  let phase   = msLeft > 0 ? "waiting" : "spinning";
  let myId    = window.FB.getPlayerId();
  let myNick  = window.FB.getPlayerNick();
  let participants = g.participants || [];
  let hasJoined    = participants.some(p => p.uid === myId);
  let isWinner     = (g.winner?.uid === myId);

  // Kolor nagrody
  let rewardColor = g.rewardType === "horse" ? "#c9a84c"
                  : g.rewardType === "item"  ? "#4a7ec8" : "#4ab870";

  // Opis nagrody
  let rewardDesc = g.rewardType === "gold"  ? `💰 ${g.rewardAmount} złota`
                 : g.rewardType === "horse" ? `🐴 Koń rzadkości: ${_rarityLabel(g.rewardRarity)}`
                 : `📦 ${g.rewardItem}`;

  let card = document.createElement("div");
  card.id  = "giveaway_" + g.id;
  card.style.cssText = `
    background:#131f13;border:1px solid ${rewardColor}44;border-radius:16px;
    padding:24px;margin-bottom:20px;position:relative;overflow:hidden;
  `;

  // Gradient tła
  card.innerHTML = `
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,${rewardColor}08,transparent 60%);pointer-events:none"></div>

    <!-- Nagłówek -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <div style="width:48px;height:48px;border-radius:50%;background:${rewardColor}18;border:2px solid ${rewardColor}44;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0">🎡</div>
      <div>
        <div style="font-family:'Cinzel',serif;font-size:18px;color:${rewardColor}">${g.title||"GIVEAWAY"}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:2px">${g.description||""}</div>
      </div>
    </div>

    <!-- Nagroda -->
    <div style="background:${rewardColor}12;border:1px solid ${rewardColor}33;border-radius:12px;padding:16px;margin-bottom:20px;text-align:center">
      <div style="font-size:10px;letter-spacing:2px;color:${rewardColor};margin-bottom:8px">NAGRODA${(g.rewardCount||1)>1?" (×"+g.rewardCount+" zwycięzców)":""}</div>
      <div style="font-family:'Cinzel',serif;font-size:22px;color:${rewardColor}">${rewardDesc}</div>
    </div>

    <!-- Licznik / status -->
    <div id="gw_timer_${g.id}" style="text-align:center;margin-bottom:20px"></div>

    <!-- Uczestnicy -->
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-size:10px;letter-spacing:2px;color:#8aab84">UCZESTNICY</div>
      <div id="gw_count_${g.id}" style="font-family:'Cinzel',serif;font-size:14px;color:#4ab870">${participants.length}</div>
    </div>
    <div id="gw_participants_${g.id}" style="display:flex;flex-wrap:wrap;gap:6px;min-height:32px;margin-bottom:16px"></div>

    <!-- Przycisk / wynik -->
    <div id="gw_action_${g.id}"></div>

    <!-- Koło fortuny (pojawi się w momencie losowania) -->
    <div id="gw_wheel_${g.id}"></div>
  `;

  container.appendChild(card);

  // Render dynamicznych części
  _renderGwParticipants(g.id, participants, myId);
  _renderGwAction(g.id, g, myId, myNick, hasJoined, isWinner, phase);
  _startGwTimer(g);

  // Subskrybuj zmiany per ID
  if (_giveawayUnsubs[g.id]) _giveawayUnsubs[g.id]();
  _giveawayUnsubs[g.id] = window.FB.db.collection("giveaways").doc(g.id)
    .onSnapshot(snap => {
      if (!snap.exists) return;
      let updated = {id:snap.id,...snap.data()};
      let updPart = updated.participants || [];
      let updJoined = updPart.some(p=>p.uid===myId);
      let updWinner = (updated.winner?.uid === myId);
      let updPhase  = Date.now() < (updated.drawTime||0) ? "waiting" : "spinning";

      let countEl = document.getElementById("gw_count_"+g.id);
      if (countEl) countEl.textContent = updPart.length;
      _renderGwParticipants(g.id, updPart, myId);
      _renderGwAction(g.id, updated, myId, myNick, updJoined, updWinner, updPhase);

      // Jeśli nowy zwycięzca — uruchom koło i wypłać nagrodę
      if (updated.winner && !g.winner) {
        g.winner = updated.winner;
        _spinWheel(g.id, updPart, updated.winner, rewardColor);
        // Auto-payout jeśli to ja wygrałem
        _tryPayoutGiveaway(updated, myId);
      }
    });
}

function _renderGwParticipants(gid, participants, myId) {
  let el = document.getElementById("gw_participants_" + gid);
  if (!el) return;
  if (!participants.length) {
    el.innerHTML = `<div style="font-size:12px;color:#4a5a4a">Brak uczestników — bądź pierwszy!</div>`;
    return;
  }
  el.innerHTML = participants.slice(0,20).map(p => `
    <div style="font-size:11px;padding:4px 10px;border-radius:20px;
      background:${p.uid===myId?"rgba(201,168,76,0.15)":"var(--panel2)"};
      border:1px solid ${p.uid===myId?"#c9a84c44":"var(--border)"};
      color:${p.uid===myId?"#c9a84c":"var(--text2)"}">
      ${p.nick||"Gracz"}${p.uid===myId?" ✓":""}
    </div>
  `).join("") + (participants.length>20 ? `<div style="font-size:11px;color:var(--text2);padding:4px">+${participants.length-20} więcej</div>` : "");
}

function _renderGwAction(gid, g, myId, myNick, hasJoined, isWinner, phase) {
  let el = document.getElementById("gw_action_" + gid);
  if (!el) return;

  if (g.winner) {
    let isMe = g.winner.uid === myId;
    el.innerHTML = `
      <div style="text-align:center;padding:16px;background:${isMe?"rgba(201,168,76,0.12)":"rgba(74,184,112,0.08)"};border:1px solid ${isMe?"#c9a84c44":"#4ab87033"};border-radius:12px">
        <div style="font-size:24px;margin-bottom:8px">${isMe?"🎉":"🏆"}</div>
        <div style="font-family:'Cinzel',serif;font-size:14px;color:${isMe?"#c9a84c":"#4ab870"}">
          ${isMe?"🎊 WYGRAŁEŚ!":"Zwycięzca: "+g.winner.nick}
        </div>
        ${isMe?`<div style="font-size:12px;color:var(--text2);margin-top:6px">Nagroda zostanie wysłana przez admina</div>`:""}
      </div>`;
    return;
  }

  if (phase === "spinning") {
    el.innerHTML = `<div style="text-align:center;padding:16px;color:#c9a84c;font-family:'Cinzel',serif">🎡 Losowanie trwa...</div>`;
    return;
  }

  if (hasJoined) {
    el.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;padding:12px;background:rgba(74,184,112,0.08);border:1px solid #4ab87033;border-radius:10px">
        <div style="font-size:20px">✅</div>
        <div style="flex:1">
          <div style="font-size:13px;color:#4ab870">Jesteś zapisany!</div>
          <div style="font-size:11px;color:var(--text2)">Trzymaj kciuki — powodzenia!</div>
        </div>
        <button onclick="leaveGiveaway('${gid}')" style="font-size:10px;border-color:#c94a4a44;color:#c94a4a;padding:4px 10px">Wypisz</button>
      </div>`;
  } else {
    el.innerHTML = `
      <button onclick="joinGiveaway('${gid}')" style="
        width:100%;padding:14px;font-family:'Cinzel',serif;font-size:14px;
        border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);
        display:flex;align-items:center;justify-content:center;gap:10px;
      ">
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M10 2l2.5 6h6.5l-5 4 2 6.5L10 15l-6 3.5 2-6.5L1 8h6.5z" stroke="#c9a84c" stroke-width="1.3" fill="none"/></svg>
        Dołącz do Giveaway — BEZPŁATNIE
      </button>`;
  }
}

function _startGwTimer(g) {
  let update = () => {
    let el = document.getElementById("gw_timer_" + g.id);
    if (!el) return;
    let now    = Date.now();
    let msLeft = Math.max(0, (g.drawTime||0) - now);

    if (msLeft <= 0) {
      el.innerHTML = `<div style="font-family:'Cinzel',serif;font-size:13px;color:#c9a84c">🎡 Czas na losowanie!</div>`;
      clearInterval(timerIv);
      return;
    }

    let h = Math.floor(msLeft/3600000);
    let m = Math.floor((msLeft%3600000)/60000);
    let s = Math.floor((msLeft%60000)/1000);

    el.innerHTML = `
      <div style="display:inline-flex;align-items:center;gap:6px;padding:8px 20px;background:var(--panel2);border:1px solid var(--border);border-radius:20px">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><circle cx="8" cy="8" r="6" stroke="#8aab84" stroke-width="1.2"/><path d="M8 5v3l2 1.5" stroke="#8aab84" stroke-width="1.2" stroke-linecap="round"/></svg>
        <span style="font-family:'Cinzel',serif;font-size:15px;color:#c9a84c">${h>0?h+"h ":""}${m}m ${s}s</span>
        <span style="font-size:11px;color:var(--text2)">do losowania</span>
      </div>`;
  };
  update();
  let timerIv = setInterval(update, 1000);
  _gwTimers.push(timerIv);
}

// ── Koło Fortuny ───────────────────────────────────────────
function _spinWheel(gid, participants, winner, rewardColor) {
  let wheelEl = document.getElementById("gw_wheel_" + gid);
  if (!wheelEl || !participants.length) return;

  let count   = (window._pendingSpins || 1);
  let rounds  = count; // tyle zakręceń
  let current = 0;

  function doOneSpin(winnerForThisSpin) {
    return new Promise(resolve => {
      wheelEl.innerHTML = "";

      let canvas = document.createElement("canvas");
      canvas.width  = 400;
      canvas.height = 400;
      canvas.style.cssText = "display:block;margin:20px auto;border-radius:50%;box-shadow:0 0 40px "+rewardColor+"44";
      wheelEl.appendChild(canvas);

      let ctx   = canvas.getContext("2d");
      let cx    = 200, cy = 200, radius = 190;
      let names = participants.map(p => p.nick || "Gracz");
      let N     = names.length;
      let sliceAngle = (2 * Math.PI) / N;
      let colors = ["#1e3a1e","#162e16","#1a3a1a","#0f2a0f","#243a24"];

      function drawWheel(angle) {
        ctx.clearRect(0, 0, 400, 400);
        names.forEach((name, i) => {
          let start = angle + i * sliceAngle;
          let end   = start + sliceAngle;
          // Sekcja
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, radius, start, end);
          ctx.closePath();
          ctx.fillStyle = colors[i % colors.length];
          ctx.fill();
          ctx.strokeStyle = "#0a1a0a";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Tekst
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(start + sliceAngle / 2);
          ctx.textAlign = "right";
          ctx.fillStyle = i === participants.findIndex(p=>p.uid===winnerForThisSpin.uid) ? "#c9a84c" : "#8aab84";
          ctx.font = `bold ${Math.max(10, Math.min(14, 180/N))}px 'Cinzel', serif`;
          let dispName = name.length > 12 ? name.slice(0,10)+"…" : name;
          ctx.fillText(dispName, radius - 10, 5);
          ctx.restore();
        });

        // Środek
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, 2*Math.PI);
        ctx.fillStyle = "#0a1a0a";
        ctx.fill();
        ctx.strokeStyle = rewardColor;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = rewardColor;
        ctx.font = "bold 16px 'Cinzel'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🎡", cx, cy);

        // Strzałka (wskaźnik) na górze — środek ekranu
        ctx.beginPath();
        ctx.moveTo(cx, cy - radius - 5);
        ctx.lineTo(cx - 12, cy - radius - 22);
        ctx.lineTo(cx + 12, cy - radius - 22);
        ctx.closePath();
        ctx.fillStyle = rewardColor;
        ctx.fill();
      }

      // Oblicz kąt docelowy — winner ma być pod strzałką (góra = -PI/2)
      let winnerIdx = participants.findIndex(p => p.uid === winnerForThisSpin.uid);
      if (winnerIdx < 0) winnerIdx = 0;
      let targetSliceCenter = winnerIdx * sliceAngle + sliceAngle / 2;
      let targetAngle = -Math.PI / 2 - targetSliceCenter;
      // Dodaj losowy offset w obrębie slotu
      targetAngle += (Math.random() - 0.5) * sliceAngle * 0.6;
      // Dodaj pełne obroty (min 5)
      let totalRotation = 5 * 2 * Math.PI + ((2*Math.PI - (targetAngle % (2*Math.PI) + 2*Math.PI) % (2*Math.PI)));
      let startAngle  = 0;
      let DURATION    = 4000 + Math.random() * 1000;
      let startTime   = null;

      function animWheel(ts) {
        if (!startTime) startTime = ts;
        let p = Math.min((ts - startTime) / DURATION, 1);
        // Cubic out easing
        let e = 1 - Math.pow(1-p, 4);
        let angle = startAngle + totalRotation * e;
        drawWheel(angle);

        if (p < 1) {
          requestAnimationFrame(animWheel);
        } else {
          // Koło zatrzymane — pokaż zwycięzcę
          setTimeout(() => {
            _showWheelWinner(wheelEl, winnerForThisSpin, rewardColor);
            setTimeout(resolve, 2000);
          }, 500);
        }
      }

      drawWheel(0);
      requestAnimationFrame(animWheel);
    });
  }

  // Kręć tyle razy ile nagród
  (async () => {
    for (let i = 0; i < rounds; i++) {
      await doOneSpin(winner);
    }
  })();
}

function _showWheelWinner(el, winner, color) {
  let popup = document.createElement("div");
  popup.style.cssText = `text-align:center;padding:20px;animation:rareCardPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards;margin-top:12px`;
  popup.innerHTML = `
    <div style="font-size:40px;margin-bottom:8px">🎉</div>
    <div style="font-family:'Cinzel',serif;font-size:20px;color:${color}">ZWYCIĘZCA!</div>
    <div style="font-family:'Cinzel',serif;font-size:26px;color:#d4e8d0;margin:8px 0">${winner.nick || "Gracz"}</div>
    <div style="font-size:12px;color:var(--text2)">Gratulacje! Nagroda zostanie dostarczona przez admina.</div>
  `;
  el.appendChild(popup);
}

// ── Dołącz / Wypisz ────────────────────────────────────────
async function joinGiveaway(gid) {
  if (!window.FB?.isLoggedIn()) { log("⚠️ Zaloguj się!"); return; }
  try {
    let ref = window.FB.db.collection("giveaways").doc(gid);
    let snap = await ref.get();
    if (!snap.exists) return;
    let g = snap.data();
    if ((g.drawTime||0) <= Date.now()) { log("⚠️ Czas zapisów minął!"); return; }

    let parts = g.participants || [];
    if (parts.some(p => p.uid === window.FB.getPlayerId())) { log("Już jesteś zapisany!"); return; }

    parts.push({ uid: window.FB.getPlayerId(), nick: window.FB.getPlayerNick() });
    await ref.update({ participants: parts });
    log("🎡 Dołączono do giveaway!");
  } catch(e) { log("⚠️ Błąd: " + e.message); }
}

async function leaveGiveaway(gid) {
  if (!window.FB?.isLoggedIn()) return;
  try {
    let ref  = window.FB.db.collection("giveaways").doc(gid);
    let snap = await ref.get();
    if (!snap.exists) return;
    let parts = (snap.data().participants || []).filter(p => p.uid !== window.FB.getPlayerId());
    await ref.update({ participants: parts });
    log("↩️ Wypisano z giveaway.");
  } catch(e) { log("⚠️ Błąd: " + e.message); }
}

function _rarityLabel(r) {
  return (typeof RARITY_LABELS!=="undefined"&&RARITY_LABELS[r]) || {common:"Zwykły",uncommon:"Pospolity",rare:"Rzadki",epic:"Legendarny",legendary:"Mityczny",mythic:"Pradawny"}[r] || r;
}
