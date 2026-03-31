// =====================
// PANEL ADMINISTRATORA
// =====================
// Dostęp tylko dla uid w ADMIN_UIDS

const ADMIN_UIDS = [
  "jakub_admin_uid_placeholder", // zastąp prawdziwym UID z Firebase Console
];

function isAdmin() {
  let uid = window.FB?.getPlayerId() || "";
  // Również sprawdź localStorage dla dev mode
  return ADMIN_UIDS.includes(uid) || localStorage.getItem("hh_admin_mode") === "1";
}

// Wywołaj w konsoli: enableAdminMode() żeby aktywować panel dev
function enableAdminMode() {
  localStorage.setItem("hh_admin_mode", "1");
  renderAll();
  log("🔧 Tryb admina aktywny!");
}
function disableAdminMode() {
  localStorage.removeItem("hh_admin_mode");
  renderAll();
}

// ── PANEL GŁÓWNY ──────────────────────────────────────────
function openAdminPanel() {
  if (!isAdmin()) { log("⚠️ Brak dostępu!"); return; }
  document.getElementById("adminPanelOverlay")?.remove();

  let overlay = document.createElement("div");
  overlay.id  = "adminPanelOverlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:9800;background:rgba(0,0,0,0.95);display:flex;align-items:center;justify-content:center;font-family:'Crimson Text',serif;overflow-y:auto;padding:20px";

  overlay.innerHTML = `
    <div style="width:100%;max-width:800px;background:#080f08;border-radius:16px;padding:24px;border:1px solid #c9a84c66;position:relative">
      <button onclick="document.getElementById('adminPanelOverlay').remove()" style="position:absolute;top:12px;right:12px;background:transparent;border:none;color:#4a5a4a;font-size:18px;cursor:pointer">✕</button>

      <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:#c9a84c;margin-bottom:20px">
        🔧 PANEL ADMINISTRATORA
      </div>

      <!-- Zakładki admina -->
      <div style="display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap">
        <button id="adTab_tournaments" class="market-tab-btn active" onclick="switchAdminTab('tournaments')">🏆 Turnieje</button>
        <button id="adTab_events"      class="market-tab-btn"        onclick="switchAdminTab('events')">🎪 Eventy</button>
        <button id="adTab_broadcast"   class="market-tab-btn"        onclick="switchAdminTab('broadcast')">📢 Ogłoszenia</button>
        <button id="adTab_players"     class="market-tab-btn"        onclick="switchAdminTab('players')">👥 Gracze</button>
        <button id="adTab_config"      class="market-tab-btn"        onclick="switchAdminTab('config')">⚙️ Konfiguracja</button>
      </div>

      <div id="adminTabContent"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  renderAdminTab("tournaments");
}

function switchAdminTab(tab) {
  document.querySelectorAll("[id^='adTab_']").forEach(b => {
    b.classList.toggle("active", b.id === `adTab_${tab}`);
  });
  renderAdminTab(tab);
}

// ── ZAKŁADKA TURNIEJE ─────────────────────────────────────
async function renderAdminTab(tab) {
  let el = document.getElementById("adminTabContent");
  if (!el) return;

  if (tab === "tournaments") {
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <!-- Stwórz turniej -->
        <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:#c9a84c;margin-bottom:14px">STWÓRZ TURNIEJ</div>

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px;letter-spacing:1px">NAZWA</label>
          <input id="ad_tname" value="Turniej Mistrzów" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px;letter-spacing:1px">TYP ZAWODÓW</label>
          <select id="ad_ttype" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">
            <option value="sprint">Sprint 400m (szybkość)</option>
            <option value="endurance">Wyścig Wytrzymałościowy</option>
            <option value="strength">Próba Siły</option>
            <option value="luck">Turniej Fortuny</option>
            <option value="grand_prix">Grand Prix (wszystkie staty)</option>
          </select>

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px;letter-spacing:1px">START (za ile minut)</label>
          <input id="ad_tstart" type="number" value="60" min="1" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px;letter-spacing:1px">WPISOWE (💰)</label>
          <input id="ad_tfee" type="number" value="200" min="0" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

          <div style="font-size:11px;color:var(--text2);margin-bottom:6px;letter-spacing:1px">NAGRODY (💰)</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:14px">
            <div>
              <div style="font-size:10px;color:#f0d040;margin-bottom:3px">🥇 1. miejsce</div>
              <input id="ad_tp1" type="number" value="2000" style="width:100%;padding:6px;background:#131f13;border:1px solid #f0d04044;border-radius:6px;color:#f0d040;font-size:13px">
            </div>
            <div>
              <div style="font-size:10px;color:#c0c0c0;margin-bottom:3px">🥈 2. miejsce</div>
              <input id="ad_tp2" type="number" value="1000" style="width:100%;padding:6px;background:#131f13;border:1px solid #c0c0c044;border-radius:6px;color:#c0c0c0;font-size:13px">
            </div>
            <div>
              <div style="font-size:10px;color:#c97c2a;margin-bottom:3px">🥉 3. miejsce</div>
              <input id="ad_tp3" type="number" value="500" style="width:100%;padding:6px;background:#131f13;border:1px solid #c97c2a44;border-radius:6px;color:#c97c2a;font-size:13px">
            </div>
          </div>

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px;letter-spacing:1px">MAX UCZESTNIKÓW</label>
          <input id="ad_tmax" type="number" value="20" min="2" max="100" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:14px">

          <button onclick="adminCreateTournament()" style="width:100%;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);font-family:'Cinzel',serif">
            🏆 Utwórz turniej
          </button>
        </div>

        <!-- Aktywne turnieje -->
        <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div style="font-family:'Cinzel',serif;font-size:12px;color:#c9a84c">AKTYWNE TURNIEJE</div>
            <button onclick="renderAdminTab('tournaments')" style="font-size:10px;border-color:#333;color:#666;padding:2px 8px">↻ Odśwież</button>
          </div>
          <div id="ad_activeTournaments" style="font-size:12px;color:var(--text2)">Ładowanie...</div>
        </div>
      </div>
    `;
    loadAdminTournaments();

  } else if (tab === "events") {
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:#c9a84c;margin-bottom:14px">UTWÓRZ EVENT</div>

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px">NAZWA EVENTU</label>
          <input id="ad_ename" value="Festiwal Koni" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px">OPIS</label>
          <input id="ad_edesc" value="Specjalny weekend z podwójnymi nagrodami!" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px">TYP BONUSU</label>
          <select id="ad_etype" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">
            <option value="gold_x2">2× Złoto z wypraw</option>
            <option value="gold_x3">3× Złoto z wypraw</option>
            <option value="drop_x2">2× Drop rate</option>
            <option value="xp_x2">2× XP</option>
            <option value="xp_x3">3× XP</option>
            <option value="breeding_free">Darmowe rozmnażanie</option>
            <option value="shop_discount">50% zniżka w sklepie</option>
            <option value="lootbox_bonus">Gwarantowany Rzadki z Skrzynki</option>
          </select>

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px">CZAS TRWANIA (godziny)</label>
          <input id="ad_edur" type="number" value="24" min="1" max="168" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px">IKONA</label>
          <input id="ad_eicon" value="🎪" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:20px;margin-bottom:14px">

          <button onclick="adminCreateEvent()" style="width:100%;border-color:#4ab870;color:#4ab870;background:rgba(74,184,112,0.1);font-family:'Cinzel',serif">
            🎪 Uruchom event
          </button>
        </div>

        <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div style="font-family:'Cinzel',serif;font-size:12px;color:#4ab870">AKTYWNE EVENTY</div>
            <button onclick="renderAdminTab('events')" style="font-size:10px;border-color:#333;color:#666;padding:2px 8px">↻</button>
          </div>
          <div id="ad_activeEvents">Ładowanie...</div>
        </div>
      </div>
    `;
    loadAdminEvents();

  } else if (tab === "broadcast") {
    el.innerHTML = `
      <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px;max-width:500px">
        <div style="font-family:'Cinzel',serif;font-size:12px;color:#6ab0e0;margin-bottom:14px">OGŁOSZENIE DLA GRACZY</div>
        <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px">TYTUŁ</label>
        <input id="ad_btitle" value="Ogłoszenie administracji" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">
        <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px">TREŚĆ</label>
        <textarea id="ad_bmsg" rows="4" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px;resize:vertical">Witajcie! Dzisiejszej nocy odbędzie się specjalny turniej...</textarea>
        <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px">NAGRODA (złoto, 0 = brak)</label>
        <input id="ad_breward" type="number" value="0" min="0" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:14px">
        <button onclick="adminBroadcast()" style="width:100%;border-color:#6ab0e0;color:#6ab0e0;background:rgba(106,176,224,0.1);font-family:'Cinzel',serif">
          📢 Wyślij do wszystkich graczy
        </button>
      </div>
    `;

  } else if (tab === "players") {
    el.innerHTML = `
      <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
        <div style="font-family:'Cinzel',serif;font-size:12px;color:#b090e0;margin-bottom:14px">ZARZĄDZANIE GRACZAMI</div>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <input id="ad_pnick" placeholder="Nick gracza" style="flex:1;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
          <button onclick="adminFindPlayer()" style="border-color:#b090e0;color:#b090e0;background:rgba(176,144,224,0.1)">Szukaj</button>
        </div>
        <div id="ad_playerResult"></div>

        <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">
          <div style="font-family:'Cinzel',serif;font-size:11px;color:#b090e0;margin-bottom:10px">ROZDANIE (wszyscy gracze)</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <select id="ad_giftType" style="padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
              <option value="gold">💰 Złoto</option>
              <option value="item">📦 Przedmiot</option>
            </select>
            <input id="ad_giftAmount" type="number" value="1000" placeholder="Ilość złota" style="width:120px;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
            <input id="ad_giftItem" placeholder="Nazwa przedmiotu" style="width:160px;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
            <button onclick="adminGiftAll()" style="border-color:#4ab870;color:#4ab870;background:rgba(74,184,112,0.1)">🎁 Wyślij wszystkim</button>
          </div>
        </div>
      </div>
    `;

  } else if (tab === "config") {
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:#c9a84c;margin-bottom:14px">PARAMETRY GRY</div>

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px">DZIENNY LIMIT WYPRAW</label>
          <input id="ad_dailyLimit" type="number" value="${typeof DAILY_LIMIT!=='undefined'?DAILY_LIMIT:4}" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px">MNOŻNIK ZŁOTA Z WYPRAW</label>
          <input id="ad_goldMult" type="number" value="1" step="0.1" min="0.1" max="10" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px">MNOŻNIK DROP RATE</label>
          <input id="ad_dropMult" type="number" value="1" step="0.1" min="0.1" max="5" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:14px">

          <button onclick="adminSaveConfig()" style="width:100%;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1)">
            💾 Zapisz konfigurację
          </button>
        </div>

        <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:#c94a4a;margin-bottom:14px">NARZĘDZIA DEWELOPERSKIE</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button onclick="addDebugGold()" style="border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.08)">+10 000 złota (debug)</button>
            <button onclick="addDebugLootbox()" style="border-color:#7b5ea7;color:#b090e0;background:rgba(123,94,167,0.08)">+5 Skrzynek z Łupem</button>
            <button onclick="resetExpeditions()" style="border-color:#4a7ec8;color:#6ab0e0;background:rgba(74,126,200,0.08)">Reset limitów wypraw</button>
            <button onclick="disableAdminMode()" style="border-color:#c94a4a;color:#c94a4a;background:rgba(201,74,74,0.08)">Wyłącz tryb admina</button>
          </div>
        </div>
      </div>
    `;
  }
}

// ── Funkcje admin Firebase ────────────────────────────────

async function adminCreateTournament() {
  if (!window.FB) { log("⚠️ Brak połączenia Firebase!"); return; }
  let name   = document.getElementById("ad_tname")?.value || "Turniej";
  let type   = document.getElementById("ad_ttype")?.value || "sprint";
  let mins   = parseInt(document.getElementById("ad_tstart")?.value)||60;
  let fee    = parseInt(document.getElementById("ad_tfee")?.value)||0;
  let p1     = parseInt(document.getElementById("ad_tp1")?.value)||2000;
  let p2     = parseInt(document.getElementById("ad_tp2")?.value)||1000;
  let p3     = parseInt(document.getElementById("ad_tp3")?.value)||500;
  let maxP   = parseInt(document.getElementById("ad_tmax")?.value)||20;

  try {
    await window.FB.db.collection("tournaments").add({
      name, type,
      startTime: Date.now() + mins*60000,
      entryFee: fee,
      prizes: [p1, p2, p3],
      maxPlayers: maxP,
      createdBy: window.FB.getPlayerId(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      active: true,
      isAdminTournament: true,
    });
    log(`🏆 Turniej "${name}" zaplanowany za ${mins} minut!`);
    loadAdminTournaments();
  } catch(e) { log("⚠️ Błąd: "+e.message); }
}

async function loadAdminTournaments() {
  let el = document.getElementById("ad_activeTournaments");
  if (!el || !window.FB) return;
  try {
    let snap = await window.FB.db.collection("tournaments")
      .where("active","==",true).orderBy("startTime").limit(10).get();
    if (snap.empty) { el.innerHTML = `<div style="color:var(--text2);font-size:12px">Brak aktywnych turniejów</div>`; return; }
    el.innerHTML = "";
    snap.docs.forEach(doc => {
      let t = doc.data();
      let msLeft = t.startTime - Date.now();
      let timeStr = msLeft > 0
        ? `Za ${Math.floor(msLeft/60000)} min`
        : `W trakcie`;
      let div = document.createElement("div");
      div.style.cssText = "padding:10px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;margin-bottom:6px";
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <div style="font-size:13px;color:#c9a84c">${t.name}</div>
            <div style="font-size:11px;color:var(--text2)">${t.type} · wpisowe: ${t.entryFee}💰 · max: ${t.maxPlayers}</div>
            <div style="font-size:11px;color:#4ab870">Nagrody: ${t.prizes?.[0]} / ${t.prizes?.[1]} / ${t.prizes?.[2]}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;color:var(--text2)">${timeStr}</div>
            <button onclick="adminCancelTournament('${doc.id}')" style="font-size:10px;border-color:#c94a4a;color:#c94a4a;background:rgba(201,74,74,0.08);margin-top:4px">Anuluj</button>
          </div>
        </div>
      `;
      el.appendChild(div);
    });
  } catch(e) { el.innerHTML = `<div style="color:#c94a4a;font-size:12px">Błąd: ${e.message}</div>`; }
}

async function adminCancelTournament(id) {
  if (!window.FB) return;
  await window.FB.db.collection("tournaments").doc(id).update({ active:false });
  log("Turniej anulowany.");
  loadAdminTournaments();
}

async function adminCreateEvent() {
  if (!window.FB) return;
  let name = document.getElementById("ad_ename")?.value||"Event";
  let desc = document.getElementById("ad_edesc")?.value||"";
  let type = document.getElementById("ad_etype")?.value||"gold_x2";
  let dur  = parseInt(document.getElementById("ad_edur")?.value)||24;
  let icon = document.getElementById("ad_eicon")?.value||"🎪";
  try {
    await window.FB.db.collection("events").doc("current").set({
      name, desc, type, icon,
      startsAt: Date.now(),
      endsAt:   Date.now() + dur*3600000,
      active:   true,
      createdBy: window.FB.getPlayerId(),
    });
    log(`🎪 Event "${name}" uruchomiony na ${dur}h!`);
    loadAdminEvents();
  } catch(e) { log("⚠️ "+e.message); }
}

async function loadAdminEvents() {
  let el = document.getElementById("ad_activeEvents");
  if (!el || !window.FB) return;
  try {
    let doc = await window.FB.db.collection("events").doc("current").get();
    if (!doc.exists || !doc.data().active) {
      el.innerHTML = `<div style="font-size:12px;color:var(--text2)">Brak aktywnego eventu</div>`;
      return;
    }
    let ev = doc.data();
    let timeLeft = Math.max(0, ev.endsAt - Date.now());
    let hLeft = Math.floor(timeLeft/3600000);
    let mLeft = Math.floor((timeLeft%3600000)/60000);
    el.innerHTML = `
      <div style="padding:12px;background:#131f13;border:1px solid #4ab87044;border-radius:8px">
        <div style="font-size:20px;margin-bottom:6px">${ev.icon}</div>
        <div style="font-family:'Cinzel',serif;font-size:13px;color:#4ab870">${ev.name}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">${ev.desc}</div>
        <div style="font-size:11px;color:#c9a84c;margin-top:6px">Bonus: ${ev.type}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">Kończy się za: ${hLeft}h ${mLeft}min</div>
        <button onclick="adminEndEvent()" style="margin-top:10px;width:100%;border-color:#c94a4a;color:#c94a4a;background:rgba(201,74,74,0.08);font-size:11px">Zakończ event</button>
      </div>
    `;
  } catch(e) { el.innerHTML = `<div style="color:#c94a4a;font-size:12px">${e.message}</div>`; }
}

async function adminEndEvent() {
  if (!window.FB) return;
  await window.FB.db.collection("events").doc("current").update({ active:false });
  log("Event zakończony.");
  loadAdminEvents();
}

async function adminBroadcast() {
  if (!window.FB) return;
  let title   = document.getElementById("ad_btitle")?.value||"Ogłoszenie";
  let msg     = document.getElementById("ad_bmsg")?.value||"";
  let reward  = parseInt(document.getElementById("ad_breward")?.value)||0;
  try {
    await window.FB.db.collection("broadcasts").add({
      title, msg, reward,
      sentAt: firebase.firestore.FieldValue.serverTimestamp(),
      sentBy: window.FB.getPlayerNick(),
      readBy: [],
    });
    log(`📢 Ogłoszenie wysłane do wszystkich graczy!${reward>0?` (+${reward}💰 każdy)`:""}`);
  } catch(e) { log("⚠️ "+e.message); }
}

async function adminFindPlayer() {
  let nick = document.getElementById("ad_pnick")?.value;
  let el   = document.getElementById("ad_playerResult");
  if (!nick || !window.FB || !el) return;
  el.innerHTML = `<div style="color:var(--text2);font-size:12px">Szukam...</div>`;
  try {
    let snap = await window.FB.db.collection("players").where("nick","==",nick).limit(5).get();
    if (snap.empty) { el.innerHTML = `<div style="color:#c94a4a;font-size:12px">Nie znaleziono gracza "${nick}"</div>`; return; }
    el.innerHTML = "";
    snap.docs.forEach(doc => {
      let p = doc.data();
      let row = document.createElement("div");
      row.style.cssText = "padding:10px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;margin-bottom:6px";
      row.innerHTML = `
        <div style="font-size:13px;color:#c9a84c">${p.nick}</div>
        <div style="font-size:11px;color:var(--text2)">UID: ${doc.id}</div>
        <div style="font-size:11px;color:var(--text2)">Poz. ${p.level||1} · ${p.horseCount||0} koni · 💰${p.gold||0}</div>
        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
          <button onclick="adminGiftPlayer('${doc.id}',1000,'gold')" style="font-size:10px;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.08)">+1000💰</button>
          <button onclick="adminGiftPlayer('${doc.id}',5000,'gold')" style="font-size:10px;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.08)">+5000💰</button>
          <button onclick="adminGiftPlayer('${doc.id}',0,'lootbox')" style="font-size:10px;border-color:#7b5ea7;color:#b090e0;background:rgba(123,94,167,0.08)">Skrzynka</button>
        </div>
      `;
      el.appendChild(row);
    });
  } catch(e) { el.innerHTML = `<div style="color:#c94a4a;font-size:12px">${e.message}</div>`; }
}

async function adminGiftPlayer(uid, amount, type) {
  if (!window.FB) return;
  await window.FB.db.collection("payouts").add({
    toUid: uid, amount, giftType: type,
    itemName: type==="gold" ? `${amount}💰 od admina` : "Skrzynka z Łupem",
    fromNick: "Admin",
    collected: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  log(`🎁 Podarunek wysłany!`);
}

async function adminGiftAll() {
  if (!window.FB) return;
  let type   = document.getElementById("ad_giftType")?.value||"gold";
  let amount = parseInt(document.getElementById("ad_giftAmount")?.value)||1000;
  let item   = document.getElementById("ad_giftItem")?.value||"Skrzynka z Łupem";
  // Zapisz jako broadcast payout — każdy gracz odbiera przy logowaniu
  await window.FB.db.collection("broadcasts").add({
    title: "Rozdanie od admina!",
    msg:   type==="gold" ? `Wszyscy gracze otrzymali ${amount}💰!` : `Wszyscy gracze otrzymali: ${item}!`,
    reward: type==="gold" ? amount : 0,
    giftItem: type==="item" ? item : null,
    sentAt: firebase.firestore.FieldValue.serverTimestamp(),
    sentBy: "Admin",
    readBy: [],
  });
  log(`🎁 Rozdanie wysłane do wszystkich!`);
}

function adminSaveConfig() {
  let dailyLimit = parseInt(document.getElementById("ad_dailyLimit")?.value)||4;
  let goldMult   = parseFloat(document.getElementById("ad_goldMult")?.value)||1;
  let dropMult   = parseFloat(document.getElementById("ad_dropMult")?.value)||1;
  localStorage.setItem("hh_admin_gold_mult", goldMult);
  localStorage.setItem("hh_admin_drop_mult", dropMult);
  // DAILY_LIMIT jest const — można nadpisać przez window
  window._adminDailyLimit = dailyLimit;
  log(`⚙️ Konfiguracja zapisana! Złoto: ×${goldMult}, Drop: ×${dropMult}, Limit: ${dailyLimit}`);
}

// Odbierz ogłoszenia/rozdania
async function checkBroadcasts() {
  if (!window.FB?.isLoggedIn()) return;
  let myId = window.FB.getPlayerId();
  try {
    let snap = await window.FB.db.collection("broadcasts")
      .orderBy("sentAt","desc").limit(10).get();
    for (let doc of snap.docs) {
      let b = doc.data();
      if ((b.readBy||[]).includes(myId)) continue;
      // Oznacz jako przeczytane
      await doc.ref.update({ readBy: firebase.firestore.FieldValue.arrayUnion(myId) });
      // Dodaj złoto jeśli jest nagroda
      if (b.reward > 0) {
        window.gold = (window.gold||0) + b.reward;
        window.saveGame?.();
        if (typeof addNotification==="function") addNotification("item_sold",
          b.title, `${b.msg} +${b.reward}💰`);
        log(`📢 ${b.title}: +${b.reward}💰`);
      }
      if (b.giftItem) {
        window.inventory?.push({ name:b.giftItem, obtained:Date.now() });
        window.saveGame?.();
        if (typeof addNotification==="function") addNotification("item_bought",
          b.title, b.msg);
      }
      if (!b.reward && !b.giftItem) {
        if (typeof addNotification==="function") addNotification("system", b.title, b.msg);
      }
    }
    window.renderAll?.();
  } catch(e) { console.warn("checkBroadcasts:", e.message); }
}

// Sprawdź aktywny event z Firebase
async function checkActiveEvent() {
  if (!window.FB) return;
  try {
    let doc = await window.FB.db.collection("events").doc("current").get();
    if (!doc.exists || !doc.data().active) { window._activeEvent = null; return; }
    let ev = doc.data();
    if (Date.now() > ev.endsAt) { window._activeEvent = null; return; }
    window._activeEvent = ev;
  } catch(e) {}
}
