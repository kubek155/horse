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

function trackQuest(type, amount=1) {
  if (typeof trackWeeklyQuest==="function") trackWeeklyQuest(type, amount);
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

// =====================
// QUESTY TYGODNIOWE
// =====================
const WEEKLY_QUEST_TEMPLATES = [
  { id:"wexp20",   desc:"Wyślij 20 wypraw",             goal:20,  reward:1500, type:"expedition" },
  { id:"wbreed3",  desc:"Rozmnóż konie 3 razy",         goal:3,   reward:2000, type:"breed"      },
  { id:"wsell10",  desc:"Sprzedaj 10 przedmiotów",      goal:10,  reward:1800, type:"market"     },
  { id:"wloot5",   desc:"Otwórz 5 Skrzynek z Łupem",   goal:5,   reward:2500, type:"lootbox"    },
  { id:"wfeed15",  desc:"Nakarm konie 15 razy",         goal:15,  reward:1200, type:"feed"       },
  { id:"wgold",    desc:"Zdobądź 5000 złota z wypraw",  goal:5000,reward:3000, type:"gold_earned"},
  { id:"wshadow",  desc:"Ukończ 3 specjalne wyprawy",   goal:3,   reward:4000, type:"special_exp"},
];

function getWeeklyQuests() {
  let stored = JSON.parse(localStorage.getItem("hh_weekly_quests")||"null");
  let now    = new Date();
  // Tydzień: poniedziałek = dzień 0
  let dayOfWeek = (now.getDay()+6)%7;
  let monday    = new Date(now); monday.setDate(now.getDate()-dayOfWeek); monday.setHours(0,0,0,0);

  if (!stored || stored.weekStart !== monday.getTime()) {
    // Nowy tydzień — generuj 3 losowe questy
    let shuffled = [...WEEKLY_QUEST_TEMPLATES].sort(()=>Math.random()-0.5).slice(0,3);
    stored = {
      weekStart: monday.getTime(),
      quests: shuffled.map(t=>({...t, progress:0, done:false})),
    };
    localStorage.setItem("hh_weekly_quests", JSON.stringify(stored));
  }
  return stored;
}

function trackWeeklyQuest(type, amount=1) {
  let stored = getWeeklyQuests();
  let changed = false;
  stored.quests.forEach(q => {
    if (q.done || q.type !== type) return;
    q.progress = Math.min(q.goal, (q.progress||0)+amount);
    if (q.progress >= q.goal) {
      q.done = true;
      gold += q.reward;
      changed = true;
      log(`🎯 Tygodniowy quest ukończony! "${q.desc}" · +${q.reward}💰`);
      if (typeof addNotification==="function") addNotification("level_up",
        `Quest tygodniowy: ${q.desc}`, `Nagroda: +${q.reward}💰`);
    }
  });
  if (changed) saveGame();
  localStorage.setItem("hh_weekly_quests", JSON.stringify(stored));
}

function renderWeeklyQuests() {
  let el = document.getElementById("weeklyQuestsList");
  if (!el) return;
  let stored = getWeeklyQuests();
  let now    = new Date();
  let monday = new Date(stored.weekStart);
  let nextMon = new Date(monday); nextMon.setDate(monday.getDate()+7);
  let msLeft = nextMon - now;
  let dLeft  = Math.floor(msLeft/86400000);
  let hLeft  = Math.floor((msLeft%86400000)/3600000);

  el.innerHTML = `<div style="font-size:11px;color:var(--text2);margin-bottom:12px">Resetuje się za ${dLeft}d ${hLeft}h</div>`;
  stored.quests.forEach(q => {
    let pct = Math.min(100, Math.round((q.progress||0)/q.goal*100));
    let div = document.createElement("div");
    div.style.cssText = `padding:12px;background:${q.done?"rgba(74,184,112,0.08)":"var(--panel2)"};border:1px solid ${q.done?"#4ab87044":"var(--border)"};border-radius:10px;margin-bottom:8px`;
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <div style="font-size:13px;color:${q.done?"#4ab870":"var(--text)"}">
          ${q.done?"✅ ":"🎯 "} ${q.desc}
        </div>
        <div style="font-size:13px;color:#c9a84c">+${q.reward}💰</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${q.done?"#4ab870":"#c9a84c"};border-radius:3px;transition:width 0.5s"></div>
        </div>
        <div style="font-size:11px;color:var(--text2);white-space:nowrap">${q.progress||0}/${q.goal}</div>
      </div>
    `;
    el.appendChild(div);
  });
}
