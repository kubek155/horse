// =====================
// FIREBASE UI
// =====================

// ── Modal logowania ───────────────────────────────────────
function openLoginModal() {
  let ex = document.getElementById("loginModal");
  if (ex) { ex.style.display="flex"; return; }
  let m = document.createElement("div");
  m.id = "loginModal";
  m.style.cssText = "position:fixed;inset:0;z-index:9500;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;font-family:'Crimson Text',serif";
  m.innerHTML = `
    <div style="background:#0f1a0f;border:1px solid #c9a84c66;border-radius:16px;padding:28px;width:360px;text-align:center">
      <div style="font-size:36px;margin-bottom:10px">🐎</div>
      <div style="font-family:'Cinzel',serif;font-size:15px;color:#c9a84c;margin-bottom:6px">Happy Horses Online</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:20px;line-height:1.5">Zaloguj się aby uczestniczyć<br>w turniejach i globalnym rynku</div>

      <button onclick="doGoogleLogin()" style="
        width:100%;padding:12px;border-radius:10px;margin-bottom:10px;
        border:1px solid #4a7ec8;color:#6ab0e0;background:rgba(74,126,200,0.1);
        font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
      ">
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
        Zaloguj przez Google
      </button>

      <button onclick="doAnonLogin()" style="width:100%;padding:10px;border-radius:10px;border:1px solid #333;color:#666;background:transparent;font-size:13px;cursor:pointer;margin-bottom:12px">
        👤 Graj jako Gość (anonimowo)
      </button>

      <div id="loginStatus" style="font-size:11px;color:var(--text2);min-height:16px"></div>
      <button onclick="document.getElementById('loginModal').style.display='none'" style="margin-top:10px;font-size:11px;border:none;background:transparent;color:#4a5a4a;cursor:pointer">Anuluj</button>
    </div>
  `;
  document.body.appendChild(m);
}

async function doGoogleLogin() {
  document.getElementById("loginStatus").textContent = "Logowanie...";
  let user = await window.FB.loginWithGoogle();
  if (user) {
    document.getElementById("loginModal")?.remove();
    renderFirebaseStatus();
    if (!localStorage.getItem("hh_nick") && !user.isAnonymous) {
      localStorage.setItem("hh_nick", user.displayName?.split(" ")[0] || "Gracz");
    }
    if (typeof initGlobalMarket==="function") initGlobalMarket();
  }
}

async function doAnonLogin() {
  document.getElementById("loginStatus").textContent = "Logowanie...";
  let user = await window.FB.loginAnonymous();
  if (user) {
    document.getElementById("loginModal")?.remove();
    openNickModal();
  }
}

// ── Nick ──────────────────────────────────────────────────
function openNickModal() {
  let ex = document.getElementById("nickModal");
  if (ex) { ex.style.display="flex"; return; }
  let m = document.createElement("div");
  m.id = "nickModal";
  m.style.cssText = "position:fixed;inset:0;z-index:9600;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;font-family:'Crimson Text',serif";
  m.innerHTML = `
    <div style="background:#0f1a0f;border:1px solid #c9a84c66;border-radius:14px;padding:24px;width:320px">
      <div style="font-family:'Cinzel',serif;font-size:13px;color:#c9a84c;margin-bottom:14px">👤 Ustaw nick gracza</div>
      <input id="nickInput" type="text" maxlength="20" placeholder="Twój nick..."
        style="width:100%;padding:10px 12px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;color:#d4e8d0;font-size:14px;margin-bottom:12px"
        value="${localStorage.getItem('hh_nick')||''}">
      <button onclick="saveNick()" style="width:100%;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);font-family:'Cinzel',serif">Zapisz</button>
    </div>
  `;
  document.body.appendChild(m);
}

function saveNick() {
  let val = (document.getElementById("nickInput")?.value||"").trim();
  if (!val) return;
  localStorage.setItem("hh_nick", val);
  document.getElementById("nickModal")?.remove();
  if (window.FB) window.FB.savePlayerProfile();
  log(`✅ Nick: ${val}`);
  renderFirebaseStatus();
}

// ── Status w topbarze / rynku ─────────────────────────────
function renderFirebaseStatus() {
  let el = document.getElementById("firebaseStatus");
  if (!el) return;
  if (!window.FB) { el.innerHTML=""; return; }
  let loggedIn = window.FB.isLoggedIn();
  let nick     = window.FB.getPlayerNick();
  let anon     = window.FB.getPlayerId().startsWith("p_");

  if (loggedIn) {
    el.innerHTML = `<span style="color:#4ab870;font-size:11px">🌐 ${nick}</span>
      <button onclick="openNickModal()" style="font-size:10px;padding:1px 6px;border-color:#333;color:#666;margin-left:4px">✏️</button>
      <button onclick="window.FB.logout()" style="font-size:10px;padding:1px 6px;border-color:#333;color:#666;margin-left:2px">Wyloguj</button>`;
  } else {
    el.innerHTML = `<button onclick="openLoginModal()" style="font-size:11px;padding:3px 10px;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1)">🔑 Zaloguj się</button>`;
  }
}

// ── Zakładki rynku ────────────────────────────────────────
function switchMarketTab(tab) {
  ["local","global","ranking"].forEach(t => {
    let content = document.getElementById(`marketTab${t.charAt(0).toUpperCase()+t.slice(1)}Content`);
    let btn     = document.getElementById(`marketTab${t.charAt(0).toUpperCase()+t.slice(1)}`);
    if (content) content.style.display = t===tab ? "block" : "none";
    if (btn) btn.classList.toggle("active", t===tab);
  });
  if (tab==="global") { initGlobalMarket(); }
  if (tab==="ranking") { renderGlobalRanking(); }
}

// CSS dla zakładek
if (!document.getElementById("marketTabStyle")) {
  let s = document.createElement("style");
  s.id = "marketTabStyle";
  s.textContent = `.market-tab-btn{padding:6px 14px;font-size:11px;font-family:'Cinzel',serif;letter-spacing:0.5px;border:1px solid var(--border);border-radius:20px;background:transparent;color:var(--text2);cursor:pointer;transition:all 0.15s}.market-tab-btn.active{border-color:var(--gold);color:var(--gold);background:rgba(201,168,76,0.1)}.market-tab-btn:hover{border-color:var(--accent2);color:var(--accent2)}`;
  document.head.appendChild(s);
}

// ── Globalny rynek render ─────────────────────────────────
let globalMarketOffers = [];
let globalMarketUnsub  = null;

function initGlobalMarket() {
  if (!window.FB || !window.FB.isLoggedIn()) return;
  if (globalMarketUnsub) { globalMarketUnsub(); globalMarketUnsub = null; }
  globalMarketUnsub = window.FB.subscribeGlobalMarket(offers => {
    globalMarketOffers = offers;
    renderGlobalMarket();
  });
  let el = document.getElementById("globalMarketList");
  if (el && !globalMarketOffers.length) {
    el.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text2);font-size:13px">🔄 Ładowanie ofert...</div>`;
  }
  // Odbierz zaległe płatności gdy wchodzisz na rynek
  if (window.FB?.collectPendingPayments) {
    setTimeout(() => window.FB.collectPendingPayments(), 500);
  }
}

function renderGlobalMarket() {
  let el = document.getElementById("globalMarketList");
  if (!el) return;
  let myId = window.FB ? window.FB.getPlayerId() : null;

  if (!window.FB || !window.FB.isLoggedIn()) {
    el.innerHTML = `<div style="text-align:center;padding:30px"><div style="font-size:13px;color:var(--text2);margin-bottom:12px">Zaloguj się aby zobaczyć oferty innych graczy</div><button onclick="openLoginModal()" style="border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1)">🔑 Zaloguj się</button></div>`;
    return;
  }
  if (!globalMarketOffers.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">🌐</div>Brak ofert na globalnym rynku</div>`;
    return;
  }

  el.innerHTML = "";

  // Zastosuj te same filtry co lokalny rynek
  let filtered = globalMarketOffers.filter(offer => {
    let mf = typeof marketFilters !== "undefined" ? marketFilters : {};
    if (mf.type && mf.type !== "all" && offer.type !== mf.type) return false;
    if (mf.rarity && mf.rarity !== "all") {
      let r = offer.type==="horse" ? (offer.horse?.rarity||offer.horse?.group) : null;
      if (r && r !== mf.rarity) return false;
    }
    return true;
  });

  // Sortowanie
  let mf2 = typeof marketFilters !== "undefined" ? marketFilters : {};
  let sorted = [...filtered].sort((a,b) => {
    if (mf2.sortBy === "mine") return a.sellerId===myId ? -1 : b.sellerId===myId ? 1 : 0;
    if (mf2.sortBy === "price_asc")  return (a.price||0)-(b.price||0);
    if (mf2.sortBy === "price_desc") return (b.price||0)-(a.price||0);
    if (mf2.sortBy === "stat_speed")    return (b.horse?.stats?.speed||0)-(a.horse?.stats?.speed||0);
    if (mf2.sortBy === "stat_strength") return (b.horse?.stats?.strength||0)-(a.horse?.stats?.strength||0);
    if (mf2.sortBy === "stat_stamina")  return (b.horse?.stats?.stamina||0)-(a.horse?.stats?.stamina||0);
    if (mf2.sortBy === "stat_luck")     return (b.horse?.stats?.luck||0)-(a.horse?.stats?.luck||0);
    return 0;
  });
  sorted.forEach(offer => {
    let isOwn = offer.sellerId===myId;
    let rc = offer.type==="horse" ? (RARITY_COLORS[offer.horse?.rarity]||"#8aab84") : "#8aab84";
    let div = document.createElement("div");
    div.className = "market-card" + (isOwn?" market-own":"");
    div.style.borderColor = rc+"44";

    if (offer.type==="horse") {
      let h = offer.horse||{};
      let horseIconHtml = (typeof renderHorseMiniSVG==="function")
        ? renderHorseMiniSVG(h,52)
        : `<span style="font-size:32px">${h.flag||"🐴"}</span>`;
      div.innerHTML = `
        <div class="mc-header">
          <span class="mc-icon" style="width:52px;height:52px;flex-shrink:0">${horseIconHtml}</span>
          <div style="flex:1">
            <div class="mc-name" style="color:${rc}">${h.name||"?"} ${isOwn?'<span style="font-size:10px;color:#c9a84c">· Twoja</span>':''}</div>
            <div class="mc-sub">${RARITY_LABELS[h.rarity]||h.rarity} · 👤 ${offer.sellerNick||"Gracz"}</div>
          </div>
        </div>
        <div class="mc-stats">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M9 2L4 6l2 1-2 3" stroke="#4a7ec8" stroke-width="1.3" stroke-linecap="round"/></svg>${h.stats?.speed}
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1" y="5" width="3" height="2.5" rx="1" fill="#c97c2a"/><rect x="8" y="5" width="3" height="2.5" rx="1" fill="#c97c2a"/><rect x="3.5" y="5.5" width="5" height="1.5" fill="#a06020"/></svg>${h.stats?.strength}
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 11Q2 7.5 2 5Q2 3 4 3Q5.2 3 6 4.5Q6.8 3 8 3Q10 3 10 5Q10 7.5 6 11Z" stroke="#e84040" stroke-width="1.2" fill="none"/></svg>${h.stats?.stamina}
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="4" cy="4" r="2.5" fill="#3a8a3a" opacity=".9"/><circle cx="8" cy="4" r="2.5" fill="#4aa04a" opacity=".9"/><circle cx="6" cy="7" r="2.5" fill="#3a8a3a" opacity=".9"/></svg>${h.stats?.luck}
        </div>
        <div class="mc-footer">
          <span class="mc-price">💰 ${offer.price}</span>
          ${isOwn
            ? `<button onclick="window.FB.cancelGlobalListing('${offer.id}')" style="border-color:#c94a4a;color:#c94a4a;background:rgba(201,74,74,0.1);font-size:11px">Anuluj</button>`
            : `<button class="btn-gold" onclick="window.FB.buyFromGlobalMarket('${offer.id}')" style="font-size:11px">Kup</button>`}
        </div>`;
    } else {
      let item = offer.item||{};
      let d    = ITEMS_DATABASE[item.name]||{icon:"📦",desc:""};
      let itemIconHtml = (typeof renderItemIconSVG==="function")
        ? renderItemIconSVG(item.name||"",42)
        : `<span style="font-size:26px">${d.icon}</span>`;
      div.innerHTML = `
        <div class="mc-header">
          <span class="mc-icon" style="width:44px;height:44px;flex-shrink:0;display:flex;align-items:center;justify-content:center">${itemIconHtml}</span>
          <div style="flex:1">
            <div class="mc-name">${item.name||"?"} ${isOwn?'<span style="font-size:10px;color:#c9a84c">· Twoja</span>':''}</div>
            <div class="mc-sub">${d.desc}${item.bonus!==undefined?` · +${item.bonus}`:""} · 👤 ${offer.sellerNick||"Gracz"}</div>
          </div>
        </div>
        <div class="mc-footer">
          <span class="mc-price">💰 ${offer.price}</span>
          ${isOwn
            ? `<button onclick="window.FB.cancelGlobalListing('${offer.id}')" style="border-color:#c94a4a;color:#c94a4a;background:rgba(201,74,74,0.1);font-size:11px">Anuluj</button>`
            : `<button class="btn-gold" onclick="window.FB.buyFromGlobalMarket('${offer.id}')" style="font-size:11px">Kup</button>`}
        </div>`;
    }
    el.appendChild(div);
  });
}

// Wystaw lokalną ofertę na globalny rynek
async function listOnGlobalMarketFromLocal(offerId) {
  if (!window.FB) { log("⚠️ Firebase niedostępny"); return; }
  if (!window.FB.isLoggedIn()) { openLoginModal(); return; }
  let offer = market.find(o=>o.id===offerId);
  if (!offer) return;
  await window.FB.listOnGlobalMarket({ type:offer.type, price:offer.price, horse:offer.horse||null, item:offer.item||null });
  log("🌐 Wystawiono na globalny rynek!");
}

// ── Turnieje UI ───────────────────────────────────────────
let tournamentEntries=[], tournamentUnsub=null, currentTournamentId=null;
// Turnieje obsługiwane przez tournaments.js

async function renderGlobalRanking() {
  let el=document.getElementById("globalRankingList");
  if(!el||!window.FB) return;
  el.innerHTML=`<div style="font-size:12px;color:var(--text2);text-align:center;padding:16px">Ładowanie...</div>`;
  let players=await window.FB.fetchGlobalRanking();
  let myId=window.FB.getPlayerId();
  el.innerHTML=players.map((p,i)=>{
    let medal=i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`, isMe=p.id===myId, rc=RARITY_COLORS[p.bestHorse?.rarity]||"#8aab84";
    return `<div style="display:flex;align-items:center;gap:8px;padding:10px;background:#131f13;border:1px solid ${isMe?"#c9a84c44":"#1e3a1e"};border-radius:8px;margin-bottom:6px">
      <span style="width:24px;text-align:center;font-size:14px">${medal}</span>
      <div style="flex:1">
        <div style="font-size:13px;color:${isMe?"#c9a84c":"var(--text)"}">${p.nick||"Gracz"}${isMe?' <span style="font-size:10px">(Ty)</span>':''}</div>
        <div style="font-size:10px;color:var(--text2)">Poz. ${p.level||1} · ${p.horseCount||0} koni</div>
        ${p.bestHorse?`<div style="font-size:10px;color:${rc}">${p.bestHorse.flag||"🐴"} ${p.bestHorse.name}</div>`:""}
      </div>
      <div style="font-size:11px;color:var(--text2)">💰 ${p.gold||0}</div>
    </div>`;
  }).join("");
}

// Nasłuchuj eventów z firebase.js (moduł ES komunikuje się przez window events)
window.addEventListener("hh_logged_in", (e) => {
  closeMandatoryLogin();
  renderFirebaseStatus();
  // Zawsze subskrybuj rynek po zalogowaniu
  setTimeout(() => {
    initGlobalMarket();
    renderAll();
  }, 300);
  log(`✅ Zalogowano jako ${window.FB?.getPlayerNick()||"Gracz"}!`);
});

window.addEventListener("hh_logged_out", () => {
  renderFirebaseStatus();
  // Pokaż tylko jeśli nie ma już overlay
  if (!document.getElementById("mandatoryLoginOverlay")) {
    setTimeout(showMandatoryLogin, 300);
  }
});

// Auto-init przy załadowaniu
document.addEventListener("DOMContentLoaded", () => {
  // Odśwież status co 1s przez pierwsze 10s (czekamy na Firebase)
  let checks = 0;
  let si = setInterval(() => {
    checks++;
    renderFirebaseStatus();
    if (window.FB) { clearInterval(si); }
    else if (checks > 10) clearInterval(si);
  }, 1000);
});

function showMandatoryLogin() {
  if (document.getElementById("mandatoryLoginOverlay")) return;

  let overlay = document.createElement("div");
  overlay.id  = "mandatoryLoginOverlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:99999;background:#0a0e0a;display:flex;align-items:center;justify-content:center;font-family:'Crimson Text',serif;overflow-y:auto;padding:20px";

  overlay.innerHTML = `
    <div style="width:100%;max-width:420px">
      <!-- Logo -->
      <div style="text-align:center;margin-bottom:24px">
        <div style="font-size:56px;margin-bottom:8px">🐎</div>
        <div style="font-family:'Cinzel',serif;font-size:24px;color:#c9a84c;letter-spacing:4px">HAPPY HORSES</div>
        <div style="font-size:13px;color:#8aab84;margin-top:4px">Zaloguj się aby zagrać</div>
      </div>

      <!-- Google -->
      <button onclick="doMandatoryGoogle()" style="
        width:100%;padding:13px;border-radius:10px;margin-bottom:16px;
        border:1px solid #4a7ec8;color:#6ab0e0;background:rgba(74,126,200,0.12);
        font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
      ">
        <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/><path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/><path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/></svg>
        Kontynuuj przez Google
      </button>

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <div style="flex:1;height:1px;background:#1e3a1e"></div>
        <span style="font-size:11px;color:#4a5a4a">lub przez email</span>
        <div style="flex:1;height:1px;background:#1e3a1e"></div>
      </div>

      <!-- Zakładki -->
      <div style="display:flex;gap:0;margin-bottom:16px;background:#131f13;border-radius:10px;padding:4px;border:1px solid #1e3a1e">
        <button id="authTabLogin" onclick="switchAuthTab('login')" style="
          flex:1;padding:8px;border:none;border-radius:7px;
          background:#1e3a1e;color:#7ec870;font-family:'Cinzel',serif;font-size:12px;cursor:pointer;
        ">Logowanie</button>
        <button id="authTabRegister" onclick="switchAuthTab('register')" style="
          flex:1;padding:8px;border:none;border-radius:7px;
          background:transparent;color:#4a5a4a;font-family:'Cinzel',serif;font-size:12px;cursor:pointer;
        ">Rejestracja</button>
      </div>

      <!-- LOGOWANIE -->
      <div id="authFormLogin" style="background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:18px">
        <input id="loginEmail" type="email" placeholder="Email"
          style="width:100%;padding:10px 12px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;color:#d4e8d0;font-size:14px;margin-bottom:8px">
        <input id="loginPassword" type="password" placeholder="Hasło"
          style="width:100%;padding:10px 12px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;color:#d4e8d0;font-size:14px;margin-bottom:12px">
        <button onclick="doEmailLogin()" style="
          width:100%;padding:11px;border-radius:8px;margin-bottom:8px;
          border:1px solid #c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);
          font-family:'Cinzel',serif;font-size:13px;cursor:pointer;
        ">Zaloguj się</button>
        <button onclick="doResetPassword()" style="width:100%;border:none;background:transparent;font-size:11px;color:#4a5a4a;cursor:pointer;padding:4px">Zapomniałem hasła</button>
      </div>

      <!-- REJESTRACJA -->
      <div id="authFormRegister" style="display:none;background:#0f1a0f;border:1px solid #1e3a1e;border-radius:12px;padding:18px">
        <input id="regNick" type="text" maxlength="20" placeholder="Nick gracza (widoczny dla innych)"
          style="width:100%;padding:10px 12px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;color:#d4e8d0;font-size:14px;margin-bottom:8px">
        <input id="regEmail" type="email" placeholder="Email"
          style="width:100%;padding:10px 12px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;color:#d4e8d0;font-size:14px;margin-bottom:8px">
        <input id="regPassword" type="password" placeholder="Hasło (min. 6 znaków)"
          style="width:100%;padding:10px 12px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;color:#d4e8d0;font-size:14px;margin-bottom:8px">
        <input id="regPassword2" type="password" placeholder="Powtórz hasło"
          style="width:100%;padding:10px 12px;background:#131f13;border:1px solid #1e3a1e;border-radius:8px;color:#d4e8d0;font-size:14px;margin-bottom:12px">
        <button onclick="doEmailRegister()" style="
          width:100%;padding:11px;border-radius:8px;
          border:1px solid #4ab870;color:#4ab870;background:rgba(74,184,112,0.1);
          font-family:'Cinzel',serif;font-size:13px;cursor:pointer;
        ">Utwórz konto</button>
      </div>

      <div id="mandatoryLoginStatus" style="font-size:12px;min-height:20px;text-align:center;margin-top:10px;color:#c94a4a"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Enter = submit
  setTimeout(()=>{
    ["loginPassword","regPassword2"].forEach(id=>{
      let el = document.getElementById(id);
      if(el) el.addEventListener("keydown", e=>{ if(e.key==="Enter") id.startsWith("login")?doEmailLogin():doEmailRegister(); });
    });
  },100);
}

function switchAuthTab(tab) {
  let isLogin = tab==="login";
  document.getElementById("authTabLogin").style.background    = isLogin ? "#1e3a1e" : "transparent";
  document.getElementById("authTabLogin").style.color         = isLogin ? "#7ec870" : "#4a5a4a";
  document.getElementById("authTabRegister").style.background = !isLogin ? "#1e3a1e" : "transparent";
  document.getElementById("authTabRegister").style.color      = !isLogin ? "#7ec870" : "#4a5a4a";
  document.getElementById("authFormLogin").style.display      = isLogin ? "block" : "none";
  document.getElementById("authFormRegister").style.display   = !isLogin ? "block" : "none";
  document.getElementById("mandatoryLoginStatus").textContent = "";
}

function setAuthStatus(msg, isError=true) {
  let el = document.getElementById("mandatoryLoginStatus");
  if (el) { el.textContent=msg; el.style.color=isError?"#c94a4a":"#4ab870"; }
}

async function doEmailLogin() {
  let email = document.getElementById("loginEmail")?.value?.trim();
  let pass  = document.getElementById("loginPassword")?.value;
  if (!email||!pass) { setAuthStatus("Wypełnij wszystkie pola"); return; }
  setAuthStatus("Logowanie...", false);
  try {
    await window.FB.loginWithEmail(email, pass);
  } catch(e) {
    console.error("Login error:", e);
    let msg = e.code==="auth/user-not-found"?"Nie znaleziono konta"
      : e.code==="auth/wrong-password"?"Złe hasło"
      : e.code==="auth/invalid-email"?"Nieprawidłowy email"
      : e.code==="auth/invalid-credential"?"Błędny email lub hasło"
      : e.code==="auth/network-request-failed"?"Błąd sieci — sprawdź połączenie"
      : `Błąd: ${e.message||e.code||"nieznany"}`;
    setAuthStatus(msg);
  }
}

async function doEmailRegister() {
  let nick  = document.getElementById("regNick")?.value?.trim();
  let email = document.getElementById("regEmail")?.value?.trim();
  let pass  = document.getElementById("regPassword")?.value;
  let pass2 = document.getElementById("regPassword2")?.value;
  if (!nick)            { setAuthStatus("Wpisz nick"); return; }
  if (nick.length < 3)  { setAuthStatus("Nick za krótki (min. 3 znaki)"); return; }
  if (!email)           { setAuthStatus("Wpisz email"); return; }
  if (!pass)            { setAuthStatus("Wpisz hasło"); return; }
  if (pass.length < 6)  { setAuthStatus("Hasło za krótkie (min. 6 znaków)"); return; }
  if (pass !== pass2)   { setAuthStatus("Hasła się nie zgadzają"); return; }
  setAuthStatus("Tworzenie konta...", false);
  try {
    await window.FB.registerWithEmail(email, pass, nick);
  } catch(e) {
    console.error("Register error:", e);
    let msg = e.code==="auth/email-already-in-use"?"Ten email jest już zarejestrowany"
      : e.code==="auth/invalid-email"?"Nieprawidłowy email"
      : e.code==="auth/weak-password"?"Hasło za słabe"
      : e.code==="auth/network-request-failed"?"Błąd sieci — sprawdź połączenie"
      : `Błąd: ${e.message||e.code||"nieznany"}`;
    setAuthStatus(msg);
  }
}

async function doResetPassword() {
  let email = document.getElementById("loginEmail")?.value?.trim();
  if (!email) { setAuthStatus("Wpisz email żeby zresetować hasło"); return; }
  try {
    await window.FB.resetPassword(email);
    setAuthStatus("Link resetujący wysłany na email!", false);
  } catch(e) {
    setAuthStatus("Nie znaleziono konta z tym emailem");
  }
}

function closeMandatoryLogin() {
  document.getElementById("mandatoryLoginOverlay")?.remove();
  renderFirebaseStatus();
  // Inicjuj rynek po zalogowaniu
  if (typeof initGlobalMarket === "function") setTimeout(initGlobalMarket, 300);
  if (typeof renderAll === "function") setTimeout(renderAll, 100);
}

async function doMandatoryGoogle() {
  let statusEl = document.getElementById("mandatoryLoginStatus");
  if (statusEl) statusEl.textContent = "Logowanie...";
  try {
    await window.FB.loginWithGoogle();
    // onAuthStateChanged w firebase.js zamknie overlay
  } catch(e) {
    if (statusEl) statusEl.textContent = "Błąd logowania — spróbuj ponownie";
  }
}

async function doMandatoryAnon() {
  // Legacy — nie używana
}

// Auto-sync profilu co 30s
setInterval(()=>{
  if (window.FB && window.FB.isLoggedIn()) {
    window.FB.savePlayerProfile();
  }
}, 30000);
