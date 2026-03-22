// =====================
// DZIENNY SYSTEM QUESTÓW
// =====================

function getQuestDayKey() {
  let d = new Date();
  return `q_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function refreshDailyQuests() {
  let dayKey = getQuestDayKey();
  let saved  = quests;

  // Jeśli questy są z dzisiaj — zachowaj
  if (saved.length > 0 && saved[0].dayKey === dayKey) return;

  // Nowy dzień — wylosuj 3 nowe questy
  let shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  quests = shuffled.slice(0, 3).map(q => ({
    ...q,
    dayKey,
    progress: 0,
    done:     false,
    claimed:  false
  }));
}

function trackQuest(type) {
  quests.forEach(q => {
    if (q.done || q.claimed) return;
    if (q.type === type) {
      q.progress = Math.min(q.goal, q.progress + 1);
      if (q.progress >= q.goal) {
        q.done = true;
        log(`🎯 Quest ukończony: ${q.desc}! Odbierz nagrodę w zakładce Questy.`);
      }
    }
  });
  saveGame();
}

function claimQuest(idx) {
  let q = quests[idx];
  if (!q || !q.done || q.claimed) return;
  q.claimed = true;
  gold += q.reward;
  saveGame();
  renderAll();
  log(`🏆 Nagroda odebrana: +${q.reward} złota!`);
}

function renderQuests() {
  let el = document.getElementById("questsList");
  if (!el) return;

  refreshDailyQuests();

  // Licznik do resetu
  let now        = new Date();
  let midnight   = new Date(now); midnight.setHours(24,0,0,0);
  let msLeft     = midnight - now;
  let hLeft      = Math.floor(msLeft / 3600000);
  let mLeft      = Math.floor((msLeft % 3600000) / 60000);
  let resetEl    = document.getElementById("questReset");
  if (resetEl) resetEl.textContent = `Nowe questy za: ${hLeft}h ${mLeft}m`;

  el.innerHTML = "";
  quests.forEach((q, i) => {
    let pct      = Math.min(100, Math.round((q.progress / q.goal) * 100));
    let barColor = q.claimed ? "#8aab84" : q.done ? "var(--gold)" : "var(--accent)";
    let div      = document.createElement("div");
    div.className = "quest-card" + (q.done && !q.claimed ? " quest-ready" : q.claimed ? " quest-claimed" : "");
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div style="flex:1">
          <div class="quest-title">${q.desc}</div>
          <div class="quest-progress-text">${q.progress} / ${q.goal}</div>
          <div class="quest-bar-wrap">
            <div class="quest-bar-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="color:var(--gold2);font-family:'Cinzel',serif;font-size:14px">+${q.reward} 💰</div>
          ${q.claimed
            ? `<div style="color:var(--text2);font-size:12px;margin-top:4px">✅ Odebrano</div>`
            : q.done
              ? `<button class="btn-gold" style="margin-top:6px;font-size:12px;padding:5px 12px" onclick="claimQuest(${i})">Odbierz!</button>`
              : `<div style="color:var(--text2);font-size:12px;margin-top:4px">${pct}%</div>`
          }
        </div>
      </div>
    `;
    el.appendChild(div);
  });
}
