// =====================
// OSIĄGNIĘCIA
// =====================

const ACHIEVEMENTS = [
  // Wyprawy
  { id:"exp10",    icon:"🌍", name:"Wędrowiec",       desc:"Wyślij 10 wypraw",                cat:"expedition", check: ()=>getAchStat("expeditions")>=10,      reward:200  },
  { id:"exp50",    icon:"🗺️", name:"Odkrywca",        desc:"Wyślij 50 wypraw",                cat:"expedition", check: ()=>getAchStat("expeditions")>=50,      reward:500  },
  { id:"exp100",   icon:"🌐", name:"Globtroter",      desc:"Wyślij 100 wypraw",               cat:"expedition", check: ()=>getAchStat("expeditions")>=100,     reward:1500 },
  { id:"shadow1",  icon:"🌑", name:"Cień Mroku",      desc:"Ukończ wyprawę do Mrocznych Ostępów", cat:"expedition", check: ()=>getAchStat("shadow_exp")>=1,    reward:800  },

  // Hodowla
  { id:"breed1",   icon:"🧬", name:"Hodowca",         desc:"Rozmnóż konie 1 raz",             cat:"breed",      check: ()=>getAchStat("breeds")>=1,            reward:300  },
  { id:"breed10",  icon:"🐣", name:"Mistrz Hodowli",  desc:"Rozmnóż konie 10 razy",           cat:"breed",      check: ()=>getAchStat("breeds")>=10,           reward:1000 },
  { id:"mutation", icon:"✨", name:"Mutant",           desc:"Wyhoduj konia z mutacją",         cat:"breed",      check: ()=>getAchStat("mutations")>=1,         reward:500  },
  { id:"rare_born",icon:"⭐", name:"Błękitna Krew",   desc:"Wyhoduj Rzadkiego konia",         cat:"breed",      check: ()=>getAchStat("rare_bred")>=1,         reward:600  },

  // Kolekcja
  { id:"horses5",  icon:"🐴", name:"Właściciel",      desc:"Posiadaj 5 koni",                 cat:"collection", check: ()=>playerHorses.length>=5,             reward:300  },
  { id:"legendary",icon:"👑", name:"Legenda",          desc:"Zdobądź Legendarnego konia",      cat:"collection", check: ()=>playerHorses.some(h=>h.rarity==="legendary"||h.rarity==="mythic"), reward:1000 },
  { id:"alllands", icon:"🌏", name:"Zdobywca Krain",  desc:"Wyślij wyprawę do każdej krainy", cat:"collection", check: ()=>getAchStat("lands_visited")>=5,     reward:800  },

  // Ekonomia
  { id:"gold10k",  icon:"💰", name:"Bogacz",           desc:"Zgromadź 10 000 złota",           cat:"economy",    check: ()=>gold>=10000,                        reward:0    },
  { id:"sell5",    icon:"🏪", name:"Kupiec",           desc:"Sprzedaj 5 przedmiotów na rynku", cat:"economy",    check: ()=>getAchStat("sold")>=5,              reward:400  },
  { id:"gold100k", icon:"🏦", name:"Magnat",           desc:"Zgromadź 100 000 złota",          cat:"economy",    check: ()=>gold>=100000,                       reward:0    },

  // Poziomy
  { id:"lvl10",    icon:"📈", name:"Doświadczony",    desc:"Osiągnij poziom 10",              cat:"level",      check: ()=>(typeof getPlayerLevel==="function"?getPlayerLevel():1)>=10, reward:500 },
  { id:"lvl25",    icon:"🔥", name:"Weteran",          desc:"Osiągnij poziom 25",              cat:"level",      check: ()=>(typeof getPlayerLevel==="function"?getPlayerLevel():1)>=25, reward:2000 },

  // Stajnia
  { id:"stable3",  icon:"🏠", name:"Dobra Stajnia",   desc:"Rozbuduj stajnię do poz. 3",      cat:"stable",     check: ()=>(typeof getStableLevel==="function"?getStableLevel():1)>=3, reward:500 },
  { id:"stable5",  icon:"🏰", name:"Stadnina",        desc:"Rozbuduj stajnię do poz. 5",      cat:"stable",     check: ()=>(typeof getStableLevel==="function"?getStableLevel():1)>=5, reward:3000 },
];

function getAchStat(key) {
  return parseInt(localStorage.getItem("hh_ach_"+key)||"0");
}
function incAchStat(key, by=1) {
  let v = getAchStat(key)+by;
  localStorage.setItem("hh_ach_"+key, v);
  checkAchievements();
}
function getUnlocked() {
  try { return JSON.parse(localStorage.getItem("hh_achievements")||"[]"); } catch(e) { return []; }
}
function isUnlocked(id) { return getUnlocked().includes(id); }

function checkAchievements() {
  let unlocked = getUnlocked();
  let changed  = false;
  ACHIEVEMENTS.forEach(a => {
    if (unlocked.includes(a.id)) return;
    try {
      if (a.check()) {
        unlocked.push(a.id);
        changed = true;
        showAchievementPopup(a);
        if (a.reward>0) { gold += a.reward; saveGame(); }
      }
    } catch(e) {}
  });
  if (changed) localStorage.setItem("hh_achievements", JSON.stringify(unlocked));
}

function showAchievementPopup(a) {
  let pop = document.createElement("div");
  pop.style.cssText = `
    position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);
    z-index:9000;background:#0f1a0f;border:1px solid #c9a84c;border-radius:12px;
    padding:12px 20px;display:flex;align-items:center;gap:12px;
    animation:rareCardPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
    max-width:320px;
  `;
  pop.innerHTML = `
    <span style="font-size:28px">${a.icon}</span>
    <div>
      <div style="font-size:10px;letter-spacing:2px;color:#c9a84c">OSIĄGNIĘCIE ODBLOKOWANE!</div>
      <div style="font-family:'Cinzel',serif;font-size:13px;color:#d4e8d0">${a.name}</div>
      <div style="font-size:11px;color:var(--text2)">${a.desc}${a.reward>0?` · +${a.reward}💰`:""}</div>
    </div>
  `;
  document.body.appendChild(pop);
  setTimeout(()=>{pop.style.animation="sceneFadeOut 0.5s forwards";setTimeout(()=>pop.remove(),500);},3000);

  if (typeof addNotification==="function") addNotification("level_up",
    `Osiągnięcie: ${a.name}`,
    a.desc + (a.reward>0?` · +${a.reward}💰`:""),
  );
}

function renderAchievements() {
  let el = document.getElementById("achievementsList");
  if (!el) return;
  let unlocked = getUnlocked();
  let cats     = [...new Set(ACHIEVEMENTS.map(a=>a.cat))];
  const CAT_LABELS = { expedition:"🌍 Wyprawy", breed:"🧬 Hodowla", collection:"🐴 Kolekcja", economy:"💰 Ekonomia", level:"📈 Poziomy", stable:"🏠 Stajnia" };

  el.innerHTML = `<div style="font-size:13px;color:var(--text2);margin-bottom:16px">Odblokowano: <strong style="color:#c9a84c">${unlocked.length}</strong> / ${ACHIEVEMENTS.length}</div>`;

  cats.forEach(cat => {
    let catAchs = ACHIEVEMENTS.filter(a=>a.cat===cat);
    let sec = document.createElement("div");
    sec.style.marginBottom = "16px";
    sec.innerHTML = `<div style="font-size:10px;letter-spacing:2px;color:#8aab84;margin-bottom:8px">${CAT_LABELS[cat]||cat.toUpperCase()}</div>`;
    let grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px";
    catAchs.forEach(a => {
      let done = unlocked.includes(a.id);
      let div  = document.createElement("div");
      div.style.cssText = `background:${done?"var(--panel)":"var(--panel2)"};border:1px solid ${done?"#c9a84c44":"var(--border)"};border-radius:8px;padding:10px 12px;opacity:${done?1:0.45}`;
      div.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-size:20px">${a.icon}</span>
          <div style="font-family:'Cinzel',serif;font-size:11px;color:${done?"#c9a84c":"var(--text2)"}">${a.name}</div>
          ${done?`<span style="margin-left:auto;font-size:14px">✅</span>`:""}
        </div>
        <div style="font-size:10px;color:var(--text2)">${a.desc}</div>
        ${a.reward>0?`<div style="font-size:10px;color:#4ab870;margin-top:3px">Nagroda: +${a.reward}💰</div>`:""}
      `;
      grid.appendChild(div);
    });
    sec.appendChild(grid);
    el.appendChild(sec);
  });
}

// Sprawdzaj osiągnięcia po każdym renderAll
setInterval(checkAchievements, 15000);
