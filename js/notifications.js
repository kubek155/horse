// =====================
// SYSTEM POWIADOMIEŃ
// =====================

const NOTIF_KEY = "hh_notifications";
const MAX_NOTIFS = 50;

const NOTIF_TYPES = {
  expedition_done:  { icon:"🌍", color:"#8aab84"  },
  expedition_found: { icon:"✨", color:"#c9a84c"  },
  horse_born:       { icon:"🐣", color:"#f0a0c8"  },
  item_sold:        { icon:"💰", color:"#4ab870"  },
  item_bought:      { icon:"🎉", color:"#4a7ec8"  },
  tournament_win:   { icon:"🏆", color:"#c9a84c"  },
  tournament_place: { icon:"🏁", color:"#8aab84"  },
  level_up:         { icon:"⭐", color:"#f0d080"  },
  horse_injured:    { icon:"🤕", color:"#c94a4a"  },
  pregnancy_done:   { icon:"🐴", color:"#f0a0c8"  },
  miscarriage:      { icon:"💔", color:"#c94a4a"  },
  system:           { icon:"🔔", color:"#8aab84"  },
};

function addNotification(type, title, body, extra) {
  let notifs = getNotifications();
  let meta   = NOTIF_TYPES[type] || NOTIF_TYPES.system;
  notifs.unshift({
    id:    Date.now() + Math.random(),
    type, title, body,
    icon:  meta.icon,
    color: meta.color,
    time:  Date.now(),
    read:  false,
    ...extra,
  });
  if (notifs.length > MAX_NOTIFS) notifs = notifs.slice(0, MAX_NOTIFS);
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  updateNotifBadge();
}

function getNotifications() {
  try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]"); }
  catch(e) { return []; }
}

function getUnreadCount() {
  return getNotifications().filter(n => !n.read).length;
}

function markNotificationsRead() {
  let notifs = getNotifications().map(n => ({...n, read:true}));
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  updateNotifBadge();
}

function clearNotifications() {
  localStorage.setItem(NOTIF_KEY, "[]");
  updateNotifBadge();
  renderNotifications();
}

function updateNotifBadge() {
  let badge = document.getElementById("notifBadge");
  if (!badge) return;
  let count = getUnreadCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline" : "none";
}

function renderNotifications() {
  let el = document.getElementById("notificationsList");
  if (!el) return;

  let notifs = getNotifications();
  if (notifs.length === 0) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">🔔</div>Brak powiadomień</div>`;
    return;
  }

  el.innerHTML = "";
  notifs.forEach(n => {
    let ago = timeSinceNotif(n.time);
    let div = document.createElement("div");
    div.style.cssText = `
      display:flex;align-items:flex-start;gap:12px;padding:12px 14px;
      border-radius:10px;margin-bottom:8px;
      background:${n.read ? "var(--panel2)" : "var(--panel)"};
      border:1px solid ${n.read ? "var(--border)" : n.color+"55"};
      transition:all 0.2s;
      ${!n.read ? `box-shadow:0 0 0 1px ${n.color}22;` : ""}
    `;
    div.innerHTML = `
      <div style="font-size:24px;min-width:32px;text-align:center;margin-top:2px">${n.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
          <div style="font-family:'Cinzel',serif;font-size:12px;color:${n.color};font-weight:${n.read?'normal':'500'}">${n.title}</div>
          <div style="font-size:10px;color:var(--text2);white-space:nowrap;flex-shrink:0">${ago}</div>
        </div>
        <div style="font-size:12px;color:var(--text2);margin-top:3px;line-height:1.4">${n.body||""}</div>
        ${n.sub ? `<div style="font-size:11px;color:${n.color};margin-top:4px;opacity:0.8">${n.sub}</div>` : ""}
      </div>
      ${!n.read ? `<div style="width:6px;height:6px;border-radius:50%;background:${n.color};margin-top:6px;flex-shrink:0"></div>` : ""}
    `;
    el.appendChild(div);
  });
}

function timeSinceNotif(ts) {
  let s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return `${s}s temu`;
  if (s < 3600) return `${Math.floor(s/60)}min temu`;
  if (s < 86400) return `${Math.floor(s/3600)}h temu`;
  return `${Math.floor(s/86400)}d temu`;
}

// ── Hooki do istniejących systemów ────────────────────────

// Wyprawa zakończona
const _origFinishExp = typeof finishExpedition !== "undefined" ? finishExpedition : null;
// Nie podmieniamy finishExpedition - zamiast tego wywołujemy addNotification
// bezpośrednio z expedition.js - dodajemy hooki poniżej

// Zaktualizuj badge co 10s
setInterval(updateNotifBadge, 10000);
