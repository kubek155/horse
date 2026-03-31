// =====================
// SYSTEM GILDII — Happy Horses
// Struktura: tworzenie, dołączanie, budynki, wspólne wyprawy
// =====================

let _myGuild       = null;   // dane gildii gracza
let _guildUnsub    = null;

// ── Ładowanie gildii gracza ────────────────────────────────
async function loadMyGuild() {
  if (!window.FB?.isLoggedIn()) return null;
  try {
    let myId = window.FB.getPlayerId();
    let snap = await window.FB.db.collection("guilds")
      .where("memberIds","array-contains", myId).limit(1).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch(e) { console.warn("loadMyGuild:", e.message); return null; }
}

// ── Render sekcji gildii ───────────────────────────────────
function renderGuildSection() {
  let content = document.getElementById("guildContent");
  if (!content) return;

  if (!window.FB?.isLoggedIn()) {
    content.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text2)">
      <div style="font-size:40px;margin-bottom:12px">🏰</div>
      <div style="font-family:'Cinzel',serif;font-size:14px;color:#c9a84c;margin-bottom:8px">Zaloguj się aby zarządzać gildią</div>
      <button onclick="openLoginModal()" style="border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1)">🔑 Zaloguj się</button>
    </div>`;
    return;
  }

  content.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text2)">⏳ Ładowanie...</div>`;

  loadMyGuild().then(guild => {
    _myGuild = guild;
    if (guild) _renderMyGuild(content, guild);
    else _renderNoGuild(content);
  });
}

// ── Brak gildii ────────────────────────────────────────────
function _renderNoGuild(el) {
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">

      <!-- Utwórz gildię -->
      <div style="background:#131f13;border:1px solid #c9a84c44;border-radius:14px;padding:20px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M12 2L14.5 9H22L16 13.5 18 21 12 17 6 21 8 13.5 2 9H9.5Z" stroke="#c9a84c" stroke-width="1.4" fill="rgba(201,168,76,0.1)"/></svg>
          <div style="font-family:'Cinzel',serif;font-size:14px;color:#c9a84c">UTWÓRZ GILDIĘ</div>
        </div>

        <label style="font-size:10px;color:var(--text2);letter-spacing:1px;display:block;margin-bottom:4px">NAZWA GILDII</label>
        <input id="guildCreateName" maxlength="30" placeholder="np. Stado Wolnych Koni" style="width:100%;padding:8px;background:#0a140a;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

        <label style="font-size:10px;color:var(--text2);letter-spacing:1px;display:block;margin-bottom:4px">TAG (2-5 znaków)</label>
        <input id="guildCreateTag" maxlength="5" placeholder="HH" style="width:100%;padding:8px;background:#0a140a;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px;margin-bottom:10px">

        <label style="font-size:10px;color:var(--text2);letter-spacing:1px;display:block;margin-bottom:4px">OPIS</label>
        <textarea id="guildCreateDesc" maxlength="200" rows="3" placeholder="Opis gildii..." style="width:100%;padding:8px;background:#0a140a;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;resize:vertical;margin-bottom:14px"></textarea>

        <div style="font-size:11px;color:#c97c2a;margin-bottom:14px">💰 Koszt założenia: 2 000 złota</div>

        <button onclick="createGuild()" style="width:100%;border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.1);font-family:'Cinzel',serif">
          🏰 Utwórz Gildię
        </button>
      </div>

      <!-- Dołącz do gildii -->
      <div style="background:#131f13;border:1px solid #4a7ec844;border-radius:14px;padding:20px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#4a7ec8" stroke-width="1.4" fill="none"/><circle cx="9" cy="7" r="4" stroke="#4a7ec8" stroke-width="1.4" fill="none"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#4a7ec8" stroke-width="1.4" fill="none"/></svg>
          <div style="font-family:'Cinzel',serif;font-size:14px;color:#4a7ec8">DOŁĄCZ DO GILDII</div>
        </div>

        <div style="display:flex;gap:8px;margin-bottom:14px">
          <input id="guildSearchInput" placeholder="Szukaj po nazwie lub tagu..." style="flex:1;padding:8px;background:#0a140a;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
          <button onclick="searchGuilds()" style="border-color:#4a7ec8;color:#4a7ec8;background:rgba(74,126,200,0.1)">Szukaj</button>
        </div>

        <div id="guildSearchResults" style="max-height:320px;overflow-y:auto"></div>
      </div>
    </div>
  `;

  // Auto-załaduj listę gildii
  searchGuilds();
}

// ── Moja Gildia ─────────────────────────────────────────────
function _renderMyGuild(el, g) {
  let myId     = window.FB.getPlayerId();
  let isLeader = g.leaderId === myId;
  let members  = g.members || [];
  let level    = g.level || 1;
  let xp       = g.xp || 0;
  let xpNeeded = _guildXpNeeded(level);

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">

      <!-- Panel gildii -->
      <div>
        <!-- Nagłówek -->
        <div style="background:#131f13;border:1px solid #c9a84c44;border-radius:14px;padding:20px;margin-bottom:16px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div style="width:52px;height:52px;border-radius:12px;background:rgba(201,168,76,0.12);border:2px solid #c9a84c44;display:flex;align-items:center;justify-content:center;font-size:28px">${g.icon||"🏰"}</div>
            <div>
              <div style="font-family:'Cinzel',serif;font-size:18px;color:#c9a84c">${g.name} <span style="font-size:12px;color:#8aab84">[${g.tag||"??"}]</span></div>
              <div style="font-size:11px;color:var(--text2);margin-top:2px">${g.description||""}</div>
              <div style="font-size:11px;color:#4ab870;margin-top:2px">👑 ${g.leaderNick||"Lider"} · 👥 ${members.length} członków</div>
            </div>
          </div>

          <!-- XP bar -->
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text2);margin-bottom:4px">
              <span>Poziom Gildii ${level}</span>
              <span>${xp} / ${xpNeeded} XP</span>
            </div>
            <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${Math.min(100,(xp/xpNeeded)*100)}%;background:#c9a84c;border-radius:3px;transition:width 0.5s"></div>
            </div>
          </div>

          <!-- Statystyki -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
            <div style="background:#0a140a;border-radius:8px;padding:8px;text-align:center">
              <div style="font-size:10px;color:var(--text2)">Poziom</div>
              <div style="font-family:'Cinzel',serif;font-size:16px;color:#c9a84c">${level}</div>
            </div>
            <div style="background:#0a140a;border-radius:8px;padding:8px;text-align:center">
              <div style="font-size:10px;color:var(--text2)">Członkowie</div>
              <div style="font-family:'Cinzel',serif;font-size:16px;color:#4ab870">${members.length}/${5+level*2}</div>
            </div>
            <div style="background:#0a140a;border-radius:8px;padding:8px;text-align:center">
              <div style="font-size:10px;color:var(--text2)">Skarb</div>
              <div style="font-family:'Cinzel',serif;font-size:16px;color:#c97c2a">💰${g.treasury||0}</div>
            </div>
          </div>
        </div>

        <!-- Budynki -->
        <div style="background:#131f13;border:1px solid #4a7ec844;border-radius:14px;padding:20px;margin-bottom:16px">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:#4a7ec8;margin-bottom:14px;letter-spacing:1px">🏗️ BUDYNKI GILDII</div>
          ${_renderGuildBuildings(g)}
        </div>

        <!-- Wpłać do skarbu -->
        <div style="background:#131f13;border:1px solid #4ab87033;border-radius:12px;padding:16px">
          <div style="font-size:11px;color:#4ab870;letter-spacing:1px;margin-bottom:10px">💰 WPŁAĆ DO SKARBU</div>
          <div style="display:flex;gap:8px">
            <input id="guildDonateAmt" type="number" value="500" min="1" style="flex:1;padding:8px;background:#0a140a;border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:13px">
            <button onclick="donateToGuild('${g.id}')" style="border-color:#4ab870;color:#4ab870;background:rgba(74,184,112,0.1)">Wpłać</button>
          </div>
        </div>
      </div>

      <!-- Prawa kolumna: członkowie -->
      <div>
        <div style="background:#131f13;border:1px solid #1e3a1e;border-radius:14px;padding:20px;margin-bottom:16px">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:#8aab84;margin-bottom:14px;letter-spacing:1px">👥 CZŁONKOWIE</div>
          <div id="guildMemberList" style="max-height:320px;overflow-y:auto">
            ${members.map(m => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:#0a140a;border-radius:8px;margin-bottom:6px;border:1px solid ${m.uid===g.leaderId?"#c9a84c22":"var(--border)"}">
                <div style="width:32px;height:32px;border-radius:50%;background:var(--panel2);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:11px;color:${m.uid===g.leaderId?"#c9a84c":"#8aab84"};border:1px solid ${m.uid===g.leaderId?"#c9a84c44":"var(--border)"};flex-shrink:0">
                  ${m.uid===g.leaderId?"👑":(m.level||1)}
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:12px;color:${m.uid===g.leaderId?"#c9a84c":"var(--text)"};font-family:'Cinzel',serif">${m.nick||"Gracz"}</div>
                  <div style="font-size:10px;color:var(--text2)">Poz. ${m.level||1} · 🐴 ${m.horseCount||0} koni</div>
                </div>
                <div style="font-size:10px;color:${m.uid===myId?"#4ab870":"var(--text2)"}">${m.uid===myId?"(Ty)":""}</div>
                ${isLeader && m.uid !== myId ? `<button onclick="kickFromGuild('${g.id}','${m.uid}')" style="font-size:9px;border-color:#c94a4a44;color:#c94a4a;padding:2px 6px">Wyrzuć</button>` : ""}
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Akcje -->
        <div style="display:flex;flex-direction:column;gap:8px">
          ${isLeader ? `
            <button onclick="openGuildSettings('${g.id}')" style="border-color:#c9a84c;color:#c9a84c;background:rgba(201,168,76,0.08);font-family:'Cinzel',serif">⚙️ Ustawienia Gildii</button>
            <button onclick="upgradeGuild('${g.id}')" style="border-color:#4a7ec8;color:#4a7ec8;background:rgba(74,126,200,0.08)">⬆️ Ulepszenie (${_guildUpgradeCost(level)}💰 + ${_guildXpNeeded(level)}XP)</button>
          ` : ""}
          <button onclick="leaveGuild('${g.id}')" style="border-color:#c94a4a44;color:#c94a4a;background:rgba(201,74,74,0.05)">↩️ Opuść Gildię</button>
        </div>
      </div>
    </div>
  `;
}

function _guildXpNeeded(level) { return level * 500; }
function _guildUpgradeCost(level) { return level * 3000; }

function _renderGuildBuildings(g) {
  const BUILDINGS = [
    { id:"stable",   name:"Wspólna Stajnia",   icon:"🏠", desc:"Zwiększa limit koni każdego członka o 2", maxLevel:5, cost:2000, bonusDesc:"+2 miejsc w stajni na poziom" },
    { id:"forge",    name:"Kuźnia Gildii",      icon:"⚒️",  desc:"-5% szans kontuzji koni", maxLevel:3, cost:3000, bonusDesc:"-5% kontuzji na poziom" },
    { id:"market",   name:"Rynek Gildii",       icon:"🏪", desc:"+5% do cen sprzedaży na rynku", maxLevel:3, cost:4000, bonusDesc:"+5% ceny na poziom" },
    { id:"academy",  name:"Akademia Jeźdźców",  icon:"📚", desc:"+10% XP z wypraw", maxLevel:5, cost:2500, bonusDesc:"+10% XP na poziom" },
    { id:"treasury", name:"Bankier Gildii",     icon:"💎", desc:"+2% bonus złota z wypraw", maxLevel:5, cost:3500, bonusDesc:"+2% złota na poziom" },
  ];

  let buildings = g.buildings || {};

  return `<div style="display:flex;flex-direction:column;gap:8px">
    ${BUILDINGS.map(b => {
      let lvl = buildings[b.id] || 0;
      let maxed = lvl >= b.maxLevel;
      let cost  = b.cost * (lvl + 1);
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#0a140a;border-radius:8px;border:1px solid ${maxed?"#c9a84c22":"var(--border)"}">
          <div style="font-size:22px;flex-shrink:0">${b.icon}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
              <span style="font-size:12px;color:${maxed?"#c9a84c":"var(--text)"};font-family:'Cinzel',serif">${b.name}</span>
              <span style="font-size:9px;padding:1px 6px;border-radius:8px;background:${maxed?"rgba(201,168,76,0.15)":"var(--panel2)"};color:${maxed?"#c9a84c":"var(--text2)"}">Poz. ${lvl}/${b.maxLevel}</span>
            </div>
            <div style="font-size:10px;color:var(--text2)">${b.bonusDesc}</div>
            <!-- Pasek poziomu -->
            <div style="height:3px;background:var(--border);border-radius:2px;overflow:hidden;margin-top:4px">
              <div style="height:100%;width:${(lvl/b.maxLevel)*100}%;background:#c9a84c;border-radius:2px"></div>
            </div>
          </div>
          ${maxed
            ? `<div style="font-size:10px;color:#c9a84c">MAX</div>`
            : `<button onclick="upgradeGuildBuilding('${g?.id}','${b.id}',${cost})" style="font-size:9px;border-color:#4a7ec844;color:#4a7ec8;background:rgba(74,126,200,0.08);padding:4px 8px;white-space:nowrap;flex-shrink:0">⬆️${cost}💰</button>`
          }
        </div>`;
    }).join("")}
  </div>`;
}

// ── Wyszukiwanie gildii ─────────────────────────────────────
async function searchGuilds() {
  let el    = document.getElementById("guildSearchResults");
  let query = (document.getElementById("guildSearchInput")?.value || "").toLowerCase().trim();
  if (!el || !window.FB?.db) return;

  el.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text2);font-size:12px">Ładowanie...</div>`;

  try {
    let snap = await window.FB.db.collection("guilds").limit(20).get();
    let guilds = snap.docs.map(d=>({id:d.id,...d.data()}));
    if (query) guilds = guilds.filter(g =>
      (g.name||"").toLowerCase().includes(query) ||
      (g.tag||"").toLowerCase().includes(query)
    );

    if (!guilds.length) {
      el.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text2);font-size:12px">Brak gildii${query?" pasujących do \""+query+"\"":""}</div>`;
      return;
    }

    el.innerHTML = "";
    guilds.forEach(g => {
      let row = document.createElement("div");
      row.style.cssText = "padding:12px;background:#0a140a;border:1px solid #1e3a1e;border-radius:10px;margin-bottom:8px";
      let members = g.members || [];
      let maxM    = 5 + (g.level||1)*2;
      let full    = members.length >= maxM;

      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px">
          <div style="font-size:24px;flex-shrink:0">${g.icon||"🏰"}</div>
          <div style="flex:1;min-width:0">
            <div style="font-family:'Cinzel',serif;font-size:13px;color:#c9a84c">${g.name} <span style="font-size:11px;color:#8aab84">[${g.tag||"??"}]</span></div>
            <div style="font-size:11px;color:var(--text2)">Poziom ${g.level||1} · 👥 ${members.length}/${maxM} · 👑 ${g.leaderNick||"?"}</div>
            <div style="font-size:10px;color:var(--text2);margin-top:2px">${(g.description||"").slice(0,60)}${(g.description||"").length>60?"…":""}</div>
          </div>
          <button onclick="joinGuildById('${g.id}')" ${full?"disabled":""} style="font-size:11px;border-color:${full?"#333":"#4a7ec8"};color:${full?"#555":"#4a7ec8"};background:${full?"transparent":"rgba(74,126,200,0.1)"};flex-shrink:0;padding:6px 12px">${full?"Pełna":"Dołącz"}</button>
        </div>
      `;
      el.appendChild(row);
    });
  } catch(e) { el.innerHTML = `<div style="color:#c94a4a;font-size:12px;padding:12px">${e.message}</div>`; }
}

// ── Akcje gildii ────────────────────────────────────────────
async function createGuild() {
  if (!window.FB?.isLoggedIn()) return;
  let name = document.getElementById("guildCreateName")?.value?.trim();
  let tag  = document.getElementById("guildCreateTag")?.value?.trim().toUpperCase();
  let desc = document.getElementById("guildCreateDesc")?.value?.trim();

  if (!name || name.length < 3) { log("⚠️ Nazwa musi mieć min. 3 znaki!"); return; }
  if (!tag  || tag.length < 2)  { log("⚠️ Tag musi mieć 2-5 znaków!"); return; }
  if (gold < 2000) { log("⚠️ Za mało złota! Potrzebujesz 2 000💰"); return; }

  try {
    gold -= 2000;
    let myId   = window.FB.getPlayerId();
    let myNick = window.FB.getPlayerNick();
    let playerLevel = typeof getPlayerLevel==="function" ? getPlayerLevel() : 1;
    let horseCount  = playerHorses.length;

    await window.FB.db.collection("guilds").add({
      name, tag, description: desc||"",
      icon: "🏰",
      leaderId:   myId,
      leaderNick: myNick,
      memberIds:  [myId],
      members:    [{ uid:myId, nick:myNick, level:playerLevel, horseCount }],
      level:  1,
      xp:     0,
      treasury: 0,
      buildings: {},
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    saveGame(); renderAll();
    log("🏰 Gildia \"" + name + "\" założona!");
    renderGuildSection();
  } catch(e) { log("⚠️ Błąd: " + e.message); gold += 2000; }
}

async function joinGuildById(guildId) {
  if (!window.FB?.isLoggedIn()) { log("⚠️ Zaloguj się!"); return; }
  let myId   = window.FB.getPlayerId();
  let myNick = window.FB.getPlayerNick();
  try {
    let ref  = window.FB.db.collection("guilds").doc(guildId);
    let snap = await ref.get();
    if (!snap.exists) return;
    let g       = snap.data();
    let maxM    = 5 + (g.level||1)*2;
    if ((g.members||[]).length >= maxM) { log("⚠️ Gildia jest pełna!"); return; }
    if ((g.memberIds||[]).includes(myId)) { log("Już jesteś w tej gildii!"); return; }

    let playerLevel = typeof getPlayerLevel==="function" ? getPlayerLevel() : 1;
    await ref.update({
      memberIds: firebase.firestore.FieldValue.arrayUnion(myId),
      members:   firebase.firestore.FieldValue.arrayUnion({ uid:myId, nick:myNick, level:playerLevel, horseCount:playerHorses.length }),
    });
    log("🏰 Dołączono do gildii \"" + g.name + "\"!");
    renderGuildSection();
  } catch(e) { log("⚠️ Błąd: " + e.message); }
}

async function leaveGuild(guildId) {
  if (!window.FB?.isLoggedIn()) return;
  let myId = window.FB.getPlayerId();
  if (!confirm("Czy na pewno chcesz opuścić gildię?")) return;
  try {
    let ref  = window.FB.db.collection("guilds").doc(guildId);
    let snap = await ref.get();
    if (!snap.exists) return;
    let g = snap.data();
    if (g.leaderId === myId) { log("⚠️ Lider nie może opuścić gildii! Najpierw przekaż dowodzenie."); return; }

    let newMembers   = (g.members||[]).filter(m=>m.uid!==myId);
    let newMemberIds = (g.memberIds||[]).filter(id=>id!==myId);
    await ref.update({ members:newMembers, memberIds:newMemberIds });
    log("↩️ Opuszczono gildię.");
    renderGuildSection();
  } catch(e) { log("⚠️ Błąd: " + e.message); }
}

async function donateToGuild(guildId) {
  let amount = parseInt(document.getElementById("guildDonateAmt")?.value)||0;
  if (amount <= 0 || amount > gold) { log("⚠️ Nieprawidłowa kwota!"); return; }
  try {
    gold -= amount;
    await window.FB.db.collection("guilds").doc(guildId).update({
      treasury: firebase.firestore.FieldValue.increment(amount),
      xp:       firebase.firestore.FieldValue.increment(Math.floor(amount/10)),
    });
    saveGame(); renderAll();
    log(`💰 Wpłacono ${amount}💰 do skarbu gildii! +${Math.floor(amount/10)} XP dla gildii`);
    renderGuildSection();
  } catch(e) { log("⚠️ Błąd: " + e.message); gold += amount; }
}

async function upgradeGuildBuilding(guildId, buildingId, cost) {
  if (!_myGuild || _myGuild.leaderId !== window.FB.getPlayerId()) { log("⚠️ Tylko lider może ulepszać budynki!"); return; }
  let treasury = _myGuild.treasury || 0;
  if (treasury < cost) { log(`⚠️ Za mało złota w skarbie gildii! Potrzeba ${cost}💰`); return; }
  try {
    let key = "buildings." + buildingId;
    await window.FB.db.collection("guilds").doc(guildId).update({
      [key]:    firebase.firestore.FieldValue.increment(1),
      treasury: firebase.firestore.FieldValue.increment(-cost),
      xp:       firebase.firestore.FieldValue.increment(100),
    });
    log(`⬆️ Budynek ulepszony!`);
    renderGuildSection();
  } catch(e) { log("⚠️ Błąd: " + e.message); }
}

async function kickFromGuild(guildId, memberId) {
  if (!_myGuild || _myGuild.leaderId !== window.FB.getPlayerId()) return;
  try {
    let ref  = window.FB.db.collection("guilds").doc(guildId);
    let snap = await ref.get();
    let g    = snap.data();
    await ref.update({
      members:   (g.members||[]).filter(m=>m.uid!==memberId),
      memberIds: (g.memberIds||[]).filter(id=>id!==memberId),
    });
    log("👢 Członek usunięty z gildii.");
    renderGuildSection();
  } catch(e) { log("⚠️ Błąd: " + e.message); }
}

async function upgradeGuild(guildId) {
  if (!_myGuild) return;
  let level   = _myGuild.level || 1;
  let cost    = _guildUpgradeCost(level);
  let xpNeed  = _guildXpNeeded(level);
  let treasury = _myGuild.treasury || 0;
  let currentXp = _myGuild.xp || 0;

  if (treasury < cost) { log(`⚠️ Za mało złota w skarbie! Potrzeba ${cost}💰`); return; }
  if (currentXp < xpNeed) { log(`⚠️ Za mało XP gildii! Potrzeba ${xpNeed} XP`); return; }

  try {
    await window.FB.db.collection("guilds").doc(guildId).update({
      level:    firebase.firestore.FieldValue.increment(1),
      treasury: firebase.firestore.FieldValue.increment(-cost),
      xp:       firebase.firestore.FieldValue.increment(-xpNeed),
    });
    log(`🏰 Gildia awansowała na poziom ${level+1}!`);
    renderGuildSection();
  } catch(e) { log("⚠️ Błąd: " + e.message); }
}

function openGuildSettings(guildId) {
  log("⚙️ Ustawienia gildii — wkrótce!");
}
