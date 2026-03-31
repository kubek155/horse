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
  overlay.style.cssText = "position:fixed;inset:0;z-index:9800;background:#060c06;display:flex;align-items:stretch;font-family:'Crimson Text',serif;overflow:hidden";

  overlay.innerHTML = `
    <div style="width:100%;max-width:1200px;background:#080f08;border-radius:16px;padding:24px;border:1px solid #c9a84c66;position:relative">
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
        <button id="adTab_giveaway"    class="market-tab-btn"        onclick="switchAdminTab('giveaway')">🎁 Giveaway</button>
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
    // SVG ikony typów turniejów
    const T_TYPE_ICONS = {
      sprint:     `<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M5 12h14M14 7l5 5-5 5" stroke="#c9a84c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      endurance:  `<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M3 18 Q7 8 12 10 Q17 12 21 5" stroke="#4ab870" stroke-width="1.8" stroke-linecap="round" fill="none"/><circle cx="21" cy="5" r="2" fill="#4ab870"/></svg>`,
      strength:   `<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><rect x="5" y="10" width="14" height="4" rx="2" stroke="#c97c2a" stroke-width="1.5" fill="none"/><rect x="2" y="8" width="4" height="8" rx="1.5" fill="#c97c2a" opacity="0.8"/><rect x="18" y="8" width="4" height="8" rx="1.5" fill="#c97c2a" opacity="0.8"/></svg>`,
      luck:       `<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M12 2C8 2 5 5.5 5 9c0 5 7 13 7 13s7-8 7-13c0-3.5-3-7-7-7z" stroke="#4a9e6a" stroke-width="1.5" fill="none"/><circle cx="12" cy="9" r="2.5" fill="#4ab870" opacity="0.8"/></svg>`,
      grand_prix: `<svg viewBox="0 0 24 24" fill="none" width="20" height="20"><polygon points="12,2 14.5,9 22,9 16,14 18.5,21 12,16.5 5.5,21 8,14 2,9 9.5,9" stroke="#c9a84c" stroke-width="1.5" fill="rgba(201,168,76,0.2)"/></svg>`,
    };

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <!-- Stwórz turniej -->
        <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
            <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><polygon points="12,2 14.5,9 22,9 16,14 18.5,21 12,16.5 5.5,21 8,14 2,9 9.5,9" stroke="#c9a84c" stroke-width="1.5" fill="rgba(201,168,76,0.15)"/></svg>
            <div style="font-family:'Cinzel',serif;font-size:12px;color:#c9a84c">STWÓRZ TURNIEJ</div>
          </div>

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px;letter-spacing:1px">NAZWA</label>
          <input id="ad_tname" value="Turniej Mistrzów" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:6px;letter-spacing:1px">TYP ZAWODÓW</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px" id="ad_ttype_picker">
            ${Object.entries({sprint:"Sprint 400m",endurance:"Maraton",strength:"Próba Siły",luck:"Turniej Fortuny",grand_prix:"Grand Prix"}).map(([id,label],i)=>`
              <label style="display:flex;align-items:center;gap:6px;padding:8px;background:#131f13;border:1px solid ${i===0?"#c9a84c44":"#1e3a1e"};border-radius:8px;cursor:pointer" id="ad_tlabel_${id}" onclick="document.querySelectorAll('[id^=ad_tlabel_]').forEach(l=>l.style.borderColor='#1e3a1e');this.style.borderColor='#c9a84c44';document.getElementById('ad_ttype').value='${id}'">
                <span style="display:inline-flex;width:20px;height:20px">${T_TYPE_ICONS[id]||""}</span>
                <span style="font-size:11px;color:var(--text2)">${label}</span>
              </label>
            `).join("")}
          </div>
          <input type="hidden" id="ad_ttype" value="sprint">

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px;letter-spacing:1px">START (za ile minut)</label>
          <input id="ad_tstart" type="number" value="60" min="1" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px;letter-spacing:1px">WPISOWE (💰)</label>
          <input id="ad_tfee" type="number" value="200" min="0" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

          <div style="font-size:11px;color:var(--text2);margin-bottom:6px;letter-spacing:1px">NAGRODY (💰)</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:14px">
            <div>
              <div style="display:flex;align-items:center;gap:4px;margin-bottom:3px">
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12"><circle cx="8" cy="7" r="5" stroke="#f0d040" stroke-width="1.3" fill="rgba(240,208,64,0.2)"/><text x="8" y="11" text-anchor="middle" fill="#f0d040" font-size="6" font-family="serif">1</text></svg>
                <div style="font-size:10px;color:#f0d040">1. miejsce</div>
              </div>
              <input id="ad_tp1" type="number" value="2000" style="width:100%;padding:6px;background:#131f13;border:1px solid #f0d04044;border-radius:6px;color:#f0d040;font-size:13px">
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:4px;margin-bottom:3px">
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12"><circle cx="8" cy="7" r="5" stroke="#c0c0c0" stroke-width="1.3" fill="rgba(192,192,192,0.15)"/><text x="8" y="11" text-anchor="middle" fill="#c0c0c0" font-size="6" font-family="serif">2</text></svg>
                <div style="font-size:10px;color:#c0c0c0">2. miejsce</div>
              </div>
              <input id="ad_tp2" type="number" value="1000" style="width:100%;padding:6px;background:#131f13;border:1px solid #c0c0c044;border-radius:6px;color:#c0c0c0;font-size:13px">
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:4px;margin-bottom:3px">
                <svg viewBox="0 0 16 16" fill="none" width="12" height="12"><circle cx="8" cy="7" r="5" stroke="#c97c2a" stroke-width="1.3" fill="rgba(201,124,42,0.15)"/><text x="8" y="11" text-anchor="middle" fill="#c97c2a" font-size="6" font-family="serif">3</text></svg>
                <div style="font-size:10px;color:#c97c2a">3. miejsce</div>
              </div>
              <input id="ad_tp3" type="number" value="500" style="width:100%;padding:6px;background:#131f13;border:1px solid #c97c2a44;border-radius:6px;color:#c97c2a;font-size:13px">
            </div>
          </div>

          <label style="font-size:11px;color:var(--text2);display:block;margin-bottom:4px;letter-spacing:1px">MAX UCZESTNIKÓW</label>
          <input id="ad_tmax" type="number" value="20" min="2" max="100" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:14px">

          <button onclick="adminCreateTournament()" style="width:100%;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);font-family:'Cinzel',serif;display:flex;align-items:center;justify-content:center;gap:8px">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><polygon points="10,1 12.5,7.5 20,7.5 14,12 16.5,18.5 10,14.5 3.5,18.5 6,12 0,7.5 7.5,7.5" stroke="#c9a84c" stroke-width="1.5" fill="rgba(201,168,76,0.15)"/></svg>
            Utwórz turniej
          </button>
        </div>

        <!-- Aktywne turnieje -->
        <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:8px">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><rect x="2" y="3" width="16" height="14" rx="2" stroke="#8aab84" stroke-width="1.3" fill="none"/><line x1="2" y1="8" x2="18" y2="8" stroke="#8aab84" stroke-width="1"/><line x1="7" y1="3" x2="7" y2="8" stroke="#8aab84" stroke-width="1"/><line x1="13" y1="3" x2="13" y2="8" stroke="#8aab84" stroke-width="1"/></svg>
              <div style="font-family:'Cinzel',serif;font-size:12px;color:#c9a84c">AKTYWNE TURNIEJE</div>
            </div>
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
    // Ikony rzadkości koni
    const RARITY_SVG_ICONS = {
      common:    `<svg viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#909090" stroke-width="1.2" fill="rgba(144,144,144,0.15)"/></svg>`,
      uncommon:  `<svg viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#8aab84" stroke-width="1.2" fill="rgba(138,171,132,0.15)"/></svg>`,
      rare:      `<svg viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#4a7ec8" stroke-width="1.2" fill="rgba(74,126,200,0.15)"/></svg>`,
      epic:      `<svg viewBox="0 0 12 12" fill="none"><polygon points="6,1 7.8,4.5 12,4.5 8.8,7 10,11 6,8.5 2,11 3.2,7 0,4.5 4.2,4.5" stroke="#7b5ea7" stroke-width="1" fill="rgba(123,94,167,0.15)"/></svg>`,
      legendary: `<svg viewBox="0 0 12 12" fill="none"><polygon points="6,1 7.8,4.5 12,4.5 8.8,7 10,11 6,8.5 2,11 3.2,7 0,4.5 4.2,4.5" stroke="#c9a84c" stroke-width="1" fill="rgba(201,168,76,0.2)"/></svg>`,
      mythic:    `<svg viewBox="0 0 12 12" fill="none"><polygon points="6,1 7.8,4.5 12,4.5 8.8,7 10,11 6,8.5 2,11 3.2,7 0,4.5 4.2,4.5" stroke="#c94a6a" stroke-width="1" fill="rgba(201,74,106,0.2)"/></svg>`,
    };

    // Lista popularnych przedmiotów do wysyłki
    const GIFT_ITEMS = [
      { name:"Skrzynka z Łupem", icon:"📦" },
      { name:"Jabłko Sfinksa",   icon:"🍏" },
      { name:"Eliksir Szybkości",icon:"⚡" },
      { name:"Eliksir Siły",     icon:"💪" },
      { name:"Eliksir Wytrzymałości", icon:"❤️" },
      { name:"Eliksir Szczęścia",icon:"🍀" },
      { name:"Eliksir Odmłodzenia", icon:"🧪" },
      { name:"Boski Nektar",     icon:"🌟" },
      { name:"Jabłko",           icon:"🍎" },
      { name:"Bandaż",           icon:"🩹" },
      { name:"Piorun",           icon:"⚡️" },
      { name:"Kowadło",          icon:"🔨" },
      { name:"Koniczyna",        icon:"🍀" },
      { name:"Serce",            icon:"❤️‍🔥" },
    ];

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

        <!-- Lewa kolumna: lista + wyszukiwanie -->
        <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><circle cx="9" cy="9" r="6" stroke="#b090e0" stroke-width="1.5" fill="none"/><path d="M14 14l3 3" stroke="#b090e0" stroke-width="1.5" stroke-linecap="round"/></svg>
            <div style="font-family:'Cinzel',serif;font-size:12px;color:#b090e0">ZARZĄDZANIE GRACZAMI</div>
          </div>

          <div style="display:flex;gap:8px;margin-bottom:12px">
            <input id="ad_pnick" placeholder="Szukaj po nicku..." style="flex:1;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
            <button onclick="adminFindPlayer()" style="border-color:#b090e0;color:#b090e0;background:rgba(176,144,224,0.1)">Szukaj</button>
            <button onclick="adminLoadAllPlayers()" style="border-color:#4ab870;color:#4ab870;background:rgba(74,184,112,0.08);font-size:11px">Lista</button>
          </div>
          <div id="ad_playerResult" style="max-height:400px;overflow-y:auto"></div>
        </div>

        <!-- Prawa kolumna: rozdanie -->
        <div style="display:flex;flex-direction:column;gap:12px">

          <!-- Rozdanie dla wszystkich -->
          <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16"><path d="M10 2L12 8h6l-5 3.5 2 6-5-3.5L5 17.5l2-6L2 8h6z" stroke="#4ab870" stroke-width="1.3" fill="none"/></svg>
              <div style="font-family:'Cinzel',serif;font-size:11px;color:#4ab870">ROZDANIE — WSZYSCY GRACZE</div>
            </div>

            <div style="display:flex;gap:6px;margin-bottom:10px">
              <button onclick="document.getElementById('ad_giftTypeGold').classList.add('active');document.getElementById('ad_giftTypeItem').classList.remove('active');document.getElementById('ad_giftTypeHorse').classList.remove('active');document.getElementById('ad_giftGoldRow').style.display='flex';document.getElementById('ad_giftItemRow').style.display='none';document.getElementById('ad_giftHorseRow').style.display='none'"
                id="ad_giftTypeGold" class="market-tab-btn active" style="font-size:11px">💰 Złoto</button>
              <button onclick="document.getElementById('ad_giftTypeItem').classList.add('active');document.getElementById('ad_giftTypeGold').classList.remove('active');document.getElementById('ad_giftTypeHorse').classList.remove('active');document.getElementById('ad_giftGoldRow').style.display='none';document.getElementById('ad_giftItemRow').style.display='flex';document.getElementById('ad_giftHorseRow').style.display='none'"
                id="ad_giftTypeItem" class="market-tab-btn" style="font-size:11px">📦 Przedmiot</button>
              <button onclick="document.getElementById('ad_giftTypeHorse').classList.add('active');document.getElementById('ad_giftTypeGold').classList.remove('active');document.getElementById('ad_giftTypeItem').classList.remove('active');document.getElementById('ad_giftGoldRow').style.display='none';document.getElementById('ad_giftItemRow').style.display='none';document.getElementById('ad_giftHorseRow').style.display='flex'"
                id="ad_giftTypeHorse" class="market-tab-btn" style="font-size:11px">🐴 Koń</button>
            </div>

            <!-- Złoto -->
            <div id="ad_giftGoldRow" style="display:flex;gap:8px;align-items:center;margin-bottom:10px">
              <input id="ad_giftAmount" type="number" value="1000" style="flex:1;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
              <span style="font-size:12px;color:var(--text2)">💰</span>
            </div>

            <!-- Przedmiot -->
            <div id="ad_giftItemRow" style="display:none;flex-direction:column;gap:8px;margin-bottom:10px">
              <div style="font-size:10px;color:var(--text2);letter-spacing:1px;margin-bottom:4px">WYBIERZ PRZEDMIOT</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;max-height:160px;overflow-y:auto">
                ${GIFT_ITEMS.map((it,i)=>`
                  <label onclick="document.querySelectorAll('.gift-item-opt').forEach(b=>b.style.borderColor='#1e3a1e');this.style.borderColor='#c9a84c44';document.getElementById('ad_giftItem').value='${it.name}'"
                    class="gift-item-opt" style="display:flex;align-items:center;gap:5px;padding:6px;background:#131f13;border:1px solid #1e3a1e;border-radius:7px;cursor:pointer;font-size:11px;color:var(--text2)">
                    <span style="font-size:14px">${it.icon}</span> ${it.name}
                  </label>
                `).join("")}
              </div>
              <input type="hidden" id="ad_giftItem" value="Skrzynka z Łupem">
            </div>

            <!-- Koń -->
            <div id="ad_giftHorseRow" style="display:none;flex-direction:column;gap:8px;margin-bottom:10px">
              <div style="font-size:10px;color:var(--text2);letter-spacing:1px;margin-bottom:4px">RZADKOŚĆ KONIA</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">
                ${Object.entries({common:"Zwykły",uncommon:"Pospolity",rare:"Rzadki",epic:"Legendarny",legendary:"Mityczny",mythic:"Pradawny"}).map(([r,lbl],i)=>`
                  <label onclick="document.querySelectorAll('.gift-rarity-opt').forEach(b=>b.style.borderColor='#1e3a1e');this.style.borderColor='${["#909090","#8aab84","#4a7ec8","#7b5ea7","#c9a84c","#c94a6a"][i]}44';document.getElementById('ad_giftHorseRarity').value='${r}'"
                    class="gift-rarity-opt" style="display:flex;align-items:center;gap:4px;padding:6px;background:#131f13;border:1px solid #1e3a1e;border-radius:7px;cursor:pointer;font-size:10px;color:${["#909090","#8aab84","#4a7ec8","#7b5ea7","#c9a84c","#c94a6a"][i]}">
                    <span style="display:inline-flex;width:12px;height:12px">${RARITY_SVG_ICONS[r]}</span> ${lbl}
                  </label>
                `).join("")}
              </div>
              <input type="hidden" id="ad_giftHorseRarity" value="rare">
            </div>

            <button onclick="adminGiftAll()" style="width:100%;border-color:#4ab870;color:#4ab870;background:rgba(74,184,112,0.1);font-family:'Cinzel',serif;display:flex;align-items:center;justify-content:center;gap:6px">
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M8 2L9.5 6h4l-3.2 2.5 1.2 4L8 10 4.5 12.5l1.2-4L2.5 6h4z" stroke="#4ab870" stroke-width="1.2" fill="none"/></svg>
              Wyślij wszystkim
            </button>
          </div>

          <!-- Wyślij do konkretnego gracza -->
          <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
            <div style="font-family:'Cinzel',serif;font-size:11px;color:#6ab0e0;margin-bottom:10px">WYŚLIJ DO GRACZA (po UID)</div>
            <input id="ad_giftUid" placeholder="UID gracza (z listy powyżej)" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;margin-bottom:8px">
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              <button onclick="adminGiftPlayer(document.getElementById('ad_giftUid').value,1000,'gold')" style="font-size:10px;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.08)">+1000💰</button>
              <button onclick="adminGiftPlayer(document.getElementById('ad_giftUid').value,5000,'gold')" style="font-size:10px;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.08)">+5000💰</button>
              <button onclick="adminGiftPlayer(document.getElementById('ad_giftUid').value,0,'lootbox')" style="font-size:10px;border-color:#7b5ea7;color:#b090e0;background:rgba(123,94,167,0.08)">Skrzynka</button>
              <button onclick="adminGiftPlayerHorse(document.getElementById('ad_giftUid').value,'rare')" style="font-size:10px;border-color:#4a7ec8;color:#6ab0e0;background:rgba(74,126,200,0.08)">🐴 Rzadki+</button>
            </div>
          </div>

        </div>
      </div>
    `;

  } else if (tab === "giveaway") {
    const GIFT_ITEMS_LIST = [
      {name:"Skrzynka z Łupem",icon:"📦"},{name:"Jabłko Sfinksa",icon:"🍏"},
      {name:"Eliksir Szybkości",icon:"⚡"},{name:"Eliksir Siły",icon:"💪"},
      {name:"Eliksir Wytrzymałości",icon:"❤️"},{name:"Eliksir Szczęścia",icon:"🍀"},
      {name:"Eliksir Odmłodzenia",icon:"🧪"},{name:"Boski Nektar",icon:"🌟"},
      {name:"Jabłko",icon:"🍎"},{name:"Bandaż",icon:"🩹"},
      {name:"Piorun",icon:"⚡️"},{name:"Kowadło",icon:"🔨"},
      {name:"Koniczyna",icon:"🍀"},{name:"Serce",icon:"❤️‍🔥"},
      {name:"Jabłko Sfinksa",icon:"🍏"},{name:"Eliksir Krwi",icon:"🩸"},
    ];
    const RARITY_DATA = [
      {r:"common",l:"Zwykły",c:"#909090"},{r:"uncommon",l:"Pospolity",c:"#8aab84"},
      {r:"rare",l:"Rzadki",c:"#4a7ec8"},{r:"epic",l:"Legendarny",c:"#7b5ea7"},
      {r:"legendary",l:"Mityczny",c:"#c9a84c"},{r:"mythic",l:"Pradawny",c:"#c94a6a"},
    ];

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

        <!-- Konfiguracja giveaway -->
        <div style="background:#0f1a0f;border:1px solid #c9a84c44;border-radius:12px;padding:16px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
            <svg viewBox="0 0 20 20" fill="none" width="18" height="18"><path d="M10 2l2 5h5l-4 3 1.5 5L10 12l-4.5 3 1.5-5L3 7h5z" stroke="#c9a84c" stroke-width="1.3" fill="none"/></svg>
            <div style="font-family:'Cinzel',serif;font-size:13px;color:#c9a84c">STWÓRZ GIVEAWAY</div>
          </div>

          <!-- Typ nagrody -->
          <div style="font-size:10px;color:var(--text2);letter-spacing:1px;margin-bottom:8px">TYP NAGRODY</div>
          <div style="display:flex;gap:6px;margin-bottom:14px">
            <button id="gw_typeGold" class="market-tab-btn active" style="font-size:11px"
              onclick="['gw_typeGold','gw_typeItem','gw_typeHorse'].forEach(id=>document.getElementById(id).classList.remove('active'));this.classList.add('active');document.getElementById('gw_goldSection').style.display='block';document.getElementById('gw_itemSection').style.display='none';document.getElementById('gw_horseSection').style.display='none'">
              💰 Złoto
            </button>
            <button id="gw_typeItem" class="market-tab-btn" style="font-size:11px"
              onclick="['gw_typeGold','gw_typeItem','gw_typeHorse'].forEach(id=>document.getElementById(id).classList.remove('active'));this.classList.add('active');document.getElementById('gw_goldSection').style.display='none';document.getElementById('gw_itemSection').style.display='block';document.getElementById('gw_horseSection').style.display='none'">
              📦 Przedmiot
            </button>
            <button id="gw_typeHorse" class="market-tab-btn" style="font-size:11px"
              onclick="['gw_typeGold','gw_typeItem','gw_typeHorse'].forEach(id=>document.getElementById(id).classList.remove('active'));this.classList.add('active');document.getElementById('gw_goldSection').style.display='none';document.getElementById('gw_itemSection').style.display='none';document.getElementById('gw_horseSection').style.display='block'">
              🐴 Koń
            </button>
          </div>

          <!-- Złoto -->
          <div id="gw_goldSection">
            <label style="font-size:10px;color:var(--text2);letter-spacing:1px;display:block;margin-bottom:4px">ILOŚĆ ZŁOTA</label>
            <input id="gw_goldAmount" type="number" value="5000" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:#c9a84c;font-size:16px;margin-bottom:10px;font-family:'Cinzel',serif;text-align:center">
          </div>

          <!-- Przedmiot -->
          <div id="gw_itemSection" style="display:none">
            <div style="font-size:10px;color:var(--text2);letter-spacing:1px;margin-bottom:6px">WYBIERZ PRZEDMIOT</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;max-height:200px;overflow-y:auto;margin-bottom:10px">
              ${GIFT_ITEMS_LIST.map(it=>`
                <label onclick="document.querySelectorAll('.gw-item-opt').forEach(b=>b.style.cssText=b.style.cssText.replace(/border:[^;]+/,'border:1px solid #1e3a1e'));this.style.border='1px solid #c9a84c44';document.getElementById('gw_itemName').value='${it.name.replace(/'/g,"\\'")}'"
                  class="gw-item-opt" style="display:flex;align-items:center;gap:6px;padding:7px;background:#131f13;border:1px solid #1e3a1e;border-radius:7px;cursor:pointer;font-size:11px;color:var(--text2)">
                  <span style="font-size:16px">${it.icon}</span> ${it.name}
                </label>
              `).join("")}
            </div>
            <input type="hidden" id="gw_itemName" value="Skrzynka z Łupem">
          </div>

          <!-- Koń -->
          <div id="gw_horseSection" style="display:none">
            <div style="font-size:10px;color:var(--text2);letter-spacing:1px;margin-bottom:6px">RZADKOŚĆ KONIA</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:10px">
              ${RARITY_DATA.map(({r,l,c},i)=>`
                <label onclick="document.querySelectorAll('.gw-rarity-opt').forEach(b=>b.style.borderColor='#1e3a1e');this.style.borderColor='${c}';document.getElementById('gw_horseRarity').value='${r}'"
                  class="gw-rarity-opt" style="display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;cursor:pointer">
                  <div style="width:28px;height:24px;overflow:hidden;border-radius:4px" id="gw_horse_preview_${r}"></div>
                  <span style="font-size:10px;color:${c}">${l}</span>
                </label>
              `).join("")}
            </div>
            <input type="hidden" id="gw_horseRarity" value="rare">
          </div>

          <!-- Wiadomość -->
          <label style="font-size:10px;color:var(--text2);letter-spacing:1px;display:block;margin-top:8px;margin-bottom:4px">WIADOMOŚĆ DLA GRACZY</label>
          <textarea id="gw_message" rows="2" style="width:100%;padding:8px;background:#131f13;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;resize:vertical;margin-bottom:12px">🎁 Specjalny Giveaway od Admina!</textarea>

          <button onclick="adminLaunchGiveaway()" style="width:100%;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);font-family:'Cinzel',serif;font-size:13px;padding:10px;display:flex;align-items:center;justify-content:center;gap:8px">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M8 1L9.5 5.5h5l-4 3 1.5 5.5L8 11.5 3 14l1.5-5.5-4-3h5z" stroke="#c9a84c" stroke-width="1.2" fill="none"/></svg>
            Uruchom Giveaway dla WSZYSTKICH
          </button>
        </div>

        <!-- Historia giveaway -->
        <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:#8aab84;margin-bottom:12px">HISTORIA GIVEAWAY</div>
          <div id="gw_history" style="font-size:12px;color:var(--text2)">Ładowanie...</div>
        </div>

      </div>
    `;
    // Załaduj historię i mini-previews koni
    adminLoadGiveawayHistory();
    if (typeof drawHorseSVG === "function") {
      RARITY_DATA.forEach(({r})=>{
        let el2 = document.getElementById("gw_horse_preview_"+r);
        if(el2){ el2.innerHTML = drawHorseSVG("Arabski", r, 0); let s=el2.querySelector("svg"); if(s){s.setAttribute("width","28");s.setAttribute("height","24");} }
      });
    }

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
        <div style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:16px;margin-top:12px">
          <div style="font-family:'Cinzel',serif;font-size:11px;color:#6ab0e0;margin-bottom:10px">🌐 JĘZYK INTERFEJSU</div>
          <div id="adminLangPicker" style="display:flex;gap:6px;flex-wrap:wrap"></div>
          <script>if(typeof renderLanguagePicker==="function")setTimeout(()=>{
            let el=document.getElementById("adminLangPicker");
            if(el&&typeof LANGUAGES!=="undefined"){
              el.innerHTML=Object.entries(LANGUAGES).map(([code,L])=>
                \`<button class="lang-btn market-tab-btn\${(localStorage.getItem("hh_lang")||"pl")===code?" active":""}" onclick="setLanguage('\${code}')" style="font-size:12px;padding:6px 12px">\${L.flag} \${L.name}</button>\`
              ).join("");
            }
          },100);</script>
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
      .where("active","==",true).limit(20).get();
    if (snap.empty) { el.innerHTML = `<div style="color:var(--text2);font-size:12px">Brak aktywnych turniejów</div>`; return; }
    el.innerHTML = "";
    let docs = snap.docs.sort((a,b)=>(a.data().startTime||0)-(b.data().startTime||0));
    docs.forEach(doc => {
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
  let nick = document.getElementById("ad_pnick")?.value?.trim();
  let el   = document.getElementById("ad_playerResult");
  if (!nick || !window.FB || !el) return;
  el.innerHTML = `<div style="color:var(--text2);font-size:12px;padding:8px">Szukam "${nick}"...</div>`;
  try {
    let snap = await window.FB.db.collection("players").where("nick","==",nick).limit(5).get();
    if (snap.empty) { el.innerHTML = `<div style="color:#c94a4a;font-size:12px;padding:8px">Nie znaleziono gracza "${nick}"</div>`; return; }
    el.innerHTML = "";
    snap.docs.forEach(doc => {
      let p = doc.data();
      let uid = doc.id;
      let lvlColor = p.level>=20?"#c9a84c":p.level>=10?"#4a7ec8":"#8aab84";
      let row = document.createElement("div");
      row.style.cssText = "padding:12px;background:#131f13;border:1px solid #c9a84c33;border-radius:10px;margin-bottom:8px";
      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <div style="width:28px;height:28px;border-radius:50%;background:var(--panel);display:flex;align-items:center;justify-content:center;font-family:Cinzel,serif;font-size:11px;color:${lvlColor};border:1px solid ${lvlColor}44">${p.level||1}</div>
          <div>
            <div style="font-size:14px;color:#c9a84c;font-family:Cinzel,serif">${p.nick}</div>
            <div style="font-size:10px;color:var(--text2)">🐴 ${p.horseCount||0} koni · 💰${p.gold||0}</div>
          </div>
        </div>
        <div style="font-size:9px;color:#4a5a4a;margin-bottom:8px;word-break:break-all">UID: ${uid}</div>
        <div style="font-size:10px;color:#8aab84;margin-bottom:6px;letter-spacing:1px">WYŚLIJ BEZPOŚREDNIO:</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">
          <button onclick="adminGiftPlayer('${uid}',1000,'gold')" style="font-size:10px;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.08)">💰 +1 000</button>
          <button onclick="adminGiftPlayer('${uid}',5000,'gold')" style="font-size:10px;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.08)">💰 +5 000</button>
          <button onclick="adminGiftPlayer('${uid}',10000,'gold')" style="font-size:10px;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.08)">💰 +10 000</button>
          <button onclick="adminGiftPlayer('${uid}',0,'lootbox')" style="font-size:10px;border-color:#7b5ea7;color:#b090e0;background:rgba(123,94,167,0.08)">📦 Skrzynka</button>
          <button onclick="adminGiftPlayerItem('${uid}')" style="font-size:10px;border-color:#4a7ec8;color:#6ab0e0;background:rgba(74,126,200,0.08)">🎁 Przedmiot</button>
          <button onclick="adminGiftPlayerHorse('${uid}')" style="font-size:10px;border-color:#4ab870;color:#4ab870;background:rgba(74,184,112,0.08)">🐴 Koń</button>
        </div>
      `;
      el.appendChild(row);
    });
  } catch(e) { el.innerHTML = `<div style="color:#c94a4a;font-size:12px">${e.message}</div>`; }
}

async function adminGiftPlayerItem(uid) {
  if (!uid) { log("⚠️ Brak UID!"); return; }
  let item = prompt("Nazwa przedmiotu do wysłania:", "Skrzynka z Łupem");
  if (!item) return;
  await adminGiftPlayer(uid, 0, 'item_direct', item);
}

async function adminGiftPlayer(uid, amount, type, itemName) {
  if (!window.FB || !uid) { log("⚠️ Brak UID!"); return; }
  let data = {
    toUid: uid, amount: amount||0, giftType: type,
    fromNick: "Admin",
    collected: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  if (type === "gold") {
    data.itemName = `${amount}💰 od admina`;
  } else if (type === "item_direct" && itemName) {
    data.itemName = itemName;
    data.giftItem = itemName;
    data.amount = 0;
  } else if (type === "horse") {
    data.itemName = `Koń (${itemName||"rare"}) od admina`;
    data.giftHorse = itemName || "rare";
    data.amount = 0;
  } else {
    data.itemName = "Skrzynka z Łupem";
    data.giftItem = "Skrzynka z Łupem";
    data.amount = 0;
  }
  await window.FB.db.collection("payouts").add(data);
  log(`🎁 Podarunek wysłany do gracza!`);
}

async function adminGiftAll() {
  if (!window.FB) return;
  // Ustal typ na podstawie aktywnego przycisku
  let isGold  = document.getElementById("ad_giftTypeGold")?.classList.contains("active");
  let isItem  = document.getElementById("ad_giftTypeItem")?.classList.contains("active");
  let isHorse = document.getElementById("ad_giftTypeHorse")?.classList.contains("active");

  let amount = parseInt(document.getElementById("ad_giftAmount")?.value)||1000;
  let item   = document.getElementById("ad_giftItem")?.value||"Skrzynka z Łupem";
  let horseRarity = document.getElementById("ad_giftHorseRarity")?.value||"rare";

  let broadcastData = {
    sentAt: firebase.firestore.FieldValue.serverTimestamp(),
    sentBy: "Admin",
    readBy: [],
  };

  if (isHorse) {
    broadcastData.title   = "Koń od admina!";
    broadcastData.msg     = `Wszyscy gracze otrzymali konia rzadkości: ${horseRarity}!`;
    broadcastData.reward  = 0;
    broadcastData.giftItem = null;
    broadcastData.giftHorse = horseRarity;
  } else if (isItem) {
    broadcastData.title   = "Przedmiot od admina!";
    broadcastData.msg     = `Wszyscy gracze otrzymali: ${item}!`;
    broadcastData.reward  = 0;
    broadcastData.giftItem = item;
  } else {
    broadcastData.title   = "Złoto od admina!";
    broadcastData.msg     = `Wszyscy gracze otrzymali ${amount}💰!`;
    broadcastData.reward  = amount;
    broadcastData.giftItem = null;
  }

  await window.FB.db.collection("broadcasts").add(broadcastData);
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
// Załaduj pełną listę graczy
async function adminLoadAllPlayers() {
  let el = document.getElementById("ad_playerResult");
  if (!el || !window.FB) return;
  el.innerHTML = '<div style="color:var(--text2);font-size:12px;padding:8px">Ładowanie...</div>';
  try {
    let snap = await window.FB.db.collection("players").orderBy("level","desc").limit(50).get();
    if (snap.empty) { el.innerHTML = '<div style="color:var(--text2);font-size:12px">Brak graczy</div>'; return; }
    el.innerHTML = "";
    snap.docs.forEach(doc => {
      let p = doc.data();
      let rc = { 1:"#909090",5:"#8aab84",10:"#4a7ec8",20:"#7b5ea7",30:"#c9a84c" };
      let lvlColor = p.level>=30?"#c9a84c":p.level>=20?"#7b5ea7":p.level>=10?"#4a7ec8":p.level>=5?"#8aab84":"#909090";
      let row = document.createElement("div");
      row.style.cssText = "padding:10px 12px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;margin-bottom:6px;cursor:pointer";
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="display:flex;align-items:center;gap:6px">
              <div style="width:24px;height:24px;border-radius:50%;background:var(--panel2);display:flex;align-items:center;justify-content:center;font-family:Cinzel,serif;font-size:10px;color:${lvlColor};border:1px solid ${lvlColor}44">${p.level||1}</div>
              <span style="font-size:13px;color:#c9a84c;font-family:Cinzel,serif">${p.nick||"?"}</span>
            </div>
            <div style="font-size:10px;color:var(--text2);margin-top:3px">🐴 ${p.horseCount||0} koni · 💰${p.gold||0} · UID: <span style="color:#4a5a4a;font-size:9px">${doc.id.slice(0,12)}...</span></div>
          </div>
          <div style="display:flex;gap:4px">
            <button onclick="event.stopPropagation();adminGiftPlayer('${doc.id}',1000,'gold')" style="font-size:9px;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.08);padding:2px 6px">+1k💰</button>
            <button onclick="event.stopPropagation();document.getElementById('ad_giftUid').value='${doc.id}'" style="font-size:9px;border-color:#4ab870;color:#4ab870;background:rgba(74,184,112,0.08);padding:2px 6px">Wybierz</button>
          </div>
        </div>
      `;
      el.appendChild(row);
    });
  } catch(e) { el.innerHTML = `<div style="color:#c94a4a;font-size:12px">${e.message}</div>`; }
}

// Wyślij konia do konkretnego gracza
async function adminGiftPlayerHorse(uid, rarity) {
  if (!uid || !window.FB) { log("⚠️ Podaj UID gracza!"); return; }
  rarity = rarity || document.getElementById("ad_giftHorseRarity")?.value || "rare";
  await window.FB.db.collection("broadcasts_personal").add({
    toUid:     uid,
    type:      "horse",
    rarity:    rarity,
    fromNick:  "Admin",
    collected: false,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    msg:       `Koń rzadkości "${rarity}" od admina!`,
  });
  log(`🐴 Koń (${rarity}) wysłany do gracza!`);
}

async function adminLaunchGiveaway() {
  if (!window.FB) return;
  let isGold  = document.getElementById("gw_typeGold")?.classList.contains("active");
  let isItem  = document.getElementById("gw_typeItem")?.classList.contains("active");
  let isHorse = document.getElementById("gw_typeHorse")?.classList.contains("active");
  let msg     = document.getElementById("gw_message")?.value || "Giveaway od admina!";

  let data = {
    title: "🎁 GIVEAWAY!",
    msg,
    sentAt: firebase.firestore.FieldValue.serverTimestamp(),
    sentBy: "Admin",
    readBy: [],
    isGiveaway: true,
  };

  if (isHorse) {
    let rarity = document.getElementById("gw_horseRarity")?.value || "rare";
    data.giftHorse = rarity;
    data.reward = 0;
    data.msg = msg + ` Koń rzadkości: ${rarity}!`;
  } else if (isItem) {
    let item = document.getElementById("gw_itemName")?.value || "Skrzynka z Łupem";
    data.giftItem = item;
    data.reward = 0;
    data.msg = msg + ` Przedmiot: ${item}!`;
  } else {
    let amount = parseInt(document.getElementById("gw_goldAmount")?.value) || 5000;
    data.reward = amount;
    data.msg = msg + ` +${amount}💰`;
  }

  try {
    await window.FB.db.collection("broadcasts").add(data);
    log(`🎁 Giveaway uruchomiony! "${data.msg}"`);
    adminLoadGiveawayHistory();
  } catch(e) { log("⚠️ Błąd: " + e.message); }
}

async function adminLoadGiveawayHistory() {
  let el = document.getElementById("gw_history");
  if (!el || !window.FB) return;
  try {
    let snap = await window.FB.db.collection("broadcasts")
      .where("isGiveaway","==",true)
      .limit(10)
      .get();
    if (snap.empty) { el.innerHTML = '<div style="color:var(--text2)">Brak historii giveaway</div>'; return; }
    let docs = snap.docs.map(d=>({id:d.id,...d.data()}));
    docs.sort((a,b)=>(b.sentAt?.seconds||0)-(a.sentAt?.seconds||0));
    el.innerHTML = "";
    docs.forEach(d => {
      let row = document.createElement("div");
      row.style.cssText = "padding:10px;background:#131f13;border:1px solid #c9a84c22;border-radius:8px;margin-bottom:6px";
      let time = d.sentAt?.seconds ? new Date(d.sentAt.seconds*1000).toLocaleString("pl-PL") : "—";
      let type = d.giftHorse ? "🐴 Koń" : d.giftItem ? "📦 "+d.giftItem : "💰 "+d.reward;
      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:start">
          <div>
            <div style="font-size:12px;color:#c9a84c">${d.title||"Giveaway"}</div>
            <div style="font-size:11px;color:var(--text2);margin-top:2px">${type}</div>
            <div style="font-size:10px;color:#4a5a4a;margin-top:2px">${d.msg||""}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:10px;color:var(--text2)">${time}</div>
            <div style="font-size:10px;color:#4ab870;margin-top:2px">👥 ${(d.readBy||[]).length} odebrano</div>
          </div>
        </div>
      `;
      el.appendChild(row);
    });
  } catch(e) { el.innerHTML = `<div style="color:#c94a4a;font-size:11px">${e.message}</div>`; }
}

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
      if (b.giftHorse) {
        if (typeof generateHorse === "function") {
          let h = generateHorse(b.giftHorse);
          let limit = typeof getStableLimit==="function" ? getStableLimit() : 8;
          if ((window.playerHorses||[]).length < limit) {
            window.playerHorses?.push(h);
          } else {
            window.inventory?.push({ name:"Transporter Konia", obtained:Date.now(), horse:h });
          }
          window.saveGame?.();
          if (typeof addNotification==="function") addNotification("horse_born",
            b.title, `${h.flag||"🐴"} ${h.name} · ${b.msg}`);
          log(`🐴 Admin: ${h.flag||"🐴"} ${h.name} dołączył do stajni!`);
        }
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
