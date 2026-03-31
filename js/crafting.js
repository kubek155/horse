// =====================
// CRAFTING PRZEDMIOTÓW
// =====================

const RECIPES = [
  // Hodowla — rzadkie, wymagają wielu materiałów
  {
    id:"jabłko_sfinksa",
    result:"Jabłko Sfinksa", qty:1, icon:"🍏",
    desc:"Wymagane do rozmnażania koni",
    ingredients:[ {name:"Jabłko",qty:8}, {name:"Siano",qty:6}, {name:"Kamień",qty:4}, {name:"Gwóźdź",qty:3} ],
    category:"hodowla",
  },
  {
    id:"boski_nektar",
    result:"Boski Nektar", qty:1, icon:"🌟",
    desc:"+50% szans na mutację (hodowla)",
    ingredients:[ {name:"Jabłko Sfinksa",qty:3}, {name:"Eliksir Szczęścia",qty:2}, {name:"Metal",qty:5}, {name:"Szkło",qty:3} ],
    category:"hodowla",
  },
  {
    id:"eliksir_krwi",
    result:"Eliksir Krwi", qty:1, icon:"🩸",
    desc:"Potomek dziedziczy krew silniejszego",
    ingredients:[ {name:"Jabłko Sfinksa",qty:2}, {name:"Eliksir Siły",qty:2}, {name:"Eliksir Wytrzymałości",qty:2}, {name:"Metal",qty:8} ],
    category:"hodowla",
  },
  {
    id:"ksiezycowy_kamien",
    result:"Księżycowy Kamień", qty:1, icon:"🌙",
    desc:"Pradawny potomek dostaje 2 perki",
    ingredients:[ {name:"Szkło",qty:10}, {name:"Metal",qty:10}, {name:"Jabłko Sfinksa",qty:3}, {name:"Boski Nektar",qty:1} ],
    category:"hodowla",
  },
  // Sloty — wymagają rzadkich materiałów
  {
    id:"piorun_craft",
    result:"Piorun", qty:1, icon:"⚡️",
    desc:"Slot: +1–10 szybkości",
    ingredients:[ {name:"Metal",qty:12}, {name:"Gwóźdź",qty:8}, {name:"Szkło",qty:4} ],
    category:"sloty",
  },
  {
    id:"kowadlo_craft",
    result:"Kowadło", qty:1, icon:"🔨",
    desc:"Slot: +1–10 siły",
    ingredients:[ {name:"Metal",qty:12}, {name:"Cegła",qty:8}, {name:"Gwóźdź",qty:6} ],
    category:"sloty",
  },
  {
    id:"koniczyna_craft",
    result:"Koniczyna", qty:1, icon:"🍀",
    desc:"Slot: +1–10 szczęścia",
    ingredients:[ {name:"Siano",qty:12}, {name:"Kamień",qty:8}, {name:"Metal",qty:4} ],
    category:"sloty",
  },
  {
    id:"serce_craft",
    result:"Serce", qty:1, icon:"❤️‍🔥",
    desc:"Slot: +1–10 wytrzymałości",
    ingredients:[ {name:"Siano",qty:10}, {name:"Metal",qty:8}, {name:"Kamień",qty:6}, {name:"Gwóźdź",qty:4} ],
    category:"sloty",
  },
  // Skrzynki
  {
    id:"skrzynka_craft",
    result:"Skrzynka z Łupem", qty:1, icon:"📦",
    desc:"Losowy koń lub przedmiot",
    ingredients:[ {name:"Deska",qty:5}, {name:"Gwóźdź",qty:5}, {name:"Metal",qty:2} ],
    category:"inne",
  },
  // Materiały — konwersja
  {
    id:"deska_z_kamien",
    result:"Deska", qty:3, icon:"🪵",
    desc:"Zmień kamień w deski",
    ingredients:[ {name:"Kamień",qty:5} ],
    category:"materiały",
  },
  {
    id:"cegla_z_kamien",
    result:"Cegła", qty:2, icon:"🧱",
    desc:"Wypal kamień w cegły",
    ingredients:[ {name:"Kamień",qty:4}, {name:"Metal",qty:1} ],
    category:"materiały",
  },
  {
    id:"metal_z_cegly",
    result:"Metal", qty:1, icon:"⚙️",
    desc:"Przetop cegły na metal",
    ingredients:[ {name:"Cegła",qty:5} ],
    category:"materiały",
  },
  {
    id:"dachowka_craft",
    result:"Dachówka", qty:2, icon:"🏗️",
    desc:"Wypal cegły w dachówki",
    ingredients:[ {name:"Cegła",qty:3}, {name:"Kamień",qty:2} ],
    category:"materiały",
  },
  {
    id:"szklo_craft",
    result:"Szkło", qty:1, icon:"🪟",
    desc:"Przetop kamień w szkło",
    ingredients:[ {name:"Kamień",qty:6}, {name:"Metal",qty:2} ],
    category:"materiały",
  },
  // Eliksiry z materiałów
  {
    id:"eliksir_sz_craft",
    result:"Eliksir Szybkości", qty:1, icon:"⚡",
    desc:"+5 szybkości konia",
    ingredients:[ {name:"Jabłko",qty:3}, {name:"Gwóźdź",qty:2} ],
    category:"eliksiry",
  },
  {
    id:"eliksir_si_craft",
    result:"Eliksir Siły", qty:1, icon:"💪",
    desc:"+5 siły konia",
    ingredients:[ {name:"Jabłko",qty:3}, {name:"Metal",qty:2} ],
    category:"eliksiry",
  },
  {
    id:"eliksir_wy_craft",
    result:"Eliksir Wytrzymałości", qty:1, icon:"❤️",
    desc:"+5 wytrzymałości konia",
    ingredients:[ {name:"Jabłko",qty:3}, {name:"Siano",qty:3} ],
    category:"eliksiry",
  },
  {
    id:"eliksir_sc_craft",
    result:"Eliksir Szczęścia", qty:1, icon:"🍀",
    desc:"+5 szczęścia konia",
    ingredients:[ {name:"Jabłko",qty:3}, {name:"Kamień",qty:2} ],
    category:"eliksiry",
  },
];

const CRAFT_CAT_LABELS = {
  hodowla:"<span style='display:inline-flex;width:14px;height:14px;vertical-align:middle'><svg viewBox='0 0 18 18' fill='none'><circle cx='9' cy='9' r='7' stroke='#f0a0c8' stroke-width='1.5' fill='none'/><path d='M6 9h6M9 6v6' stroke='#f0a0c8' stroke-width='1.5'/></svg></span> Hodowla",
  sloty:"<span style='display:inline-flex;width:14px;height:14px;vertical-align:middle'><svg viewBox='0 0 18 18' fill='none'><polygon points='9,2 11,7 16,7 12,11 14,16 9,13 4,16 6,11 2,7 7,7' stroke='#c9a84c' stroke-width='1.2' fill='none'/></svg></span> Sloty",
  inne:"<span style='display:inline-flex;width:14px;height:14px;vertical-align:middle'><svg viewBox='0 0 18 18' fill='none'><rect x='3' y='9' width='12' height='8' rx='1.5' stroke='#8aab84' stroke-width='1.5' fill='none'/><path d='M5 9V7a4 4 0 018 0v2' stroke='#8aab84' stroke-width='1.5' fill='none'/></svg></span> Inne",
  materiały:"<span style='display:inline-flex;width:14px;height:14px;vertical-align:middle'><svg viewBox='0 0 18 18' fill='none'><rect x='3' y='8' width='12' height='5' rx='1' stroke='#8B5E3C' stroke-width='1.5' fill='none'/><rect x='4' y='11' width='10' height='4' rx='1' stroke='#A0723A' stroke-width='1' fill='none'/></svg></span> Materiały",
  eliksiry:"<span style='display:inline-flex;width:14px;height:14px;vertical-align:middle'><svg viewBox='0 0 18 18' fill='none'><path d='M7 3h4v4l3 7H4L7 7z' stroke='#4a7ec8' stroke-width='1.5' fill='none'/></svg></span> Eliksiry",
};

let craftCat = "hodowla";

function countInv(name) {
  return (window.inventory||[]).filter(i=>i.name===name).length;
}
function canCraft(recipe) {
  return recipe.ingredients.every(ing=>countInv(ing.name)>=ing.qty);
}

function openCraftingScreen() {
  renderCraftingSection();
}

function renderCraftingSection() {
  // Kategorie
  let catBar = document.getElementById("craftCatBar");
  if (catBar) {
    catBar.innerHTML = "";
    Object.entries(CRAFT_CAT_LABELS).forEach(([id,label]) => {
      let btn = document.createElement("button");
      btn.id = `craftCat_${id}`;
      btn.className = `market-tab-btn${id===craftCat?" active":""}`;
      btn.textContent = label;
      btn.onclick = () => setCraftCat(id);
      catBar.appendChild(btn);
    });
  }
  // Pasek materiałów
  let matsBar = document.getElementById("craftMatsBar");
  if (matsBar) {
    let mats = Object.entries(BUILD_MATERIALS||{}).map(([name,d])=>{
    let svg = (typeof ITEM_ICONS_SVG!=="undefined"&&ITEM_ICONS_SVG[name])
      ? `<span style="display:inline-flex;width:16px;height:16px;vertical-align:middle">${ITEM_ICONS_SVG[name]}</span>`
      : d.icon;
    let have = countInv(name);
    return `<span style="opacity:${have>0?1:0.35}">${svg}<span style="font-size:10px;color:${have>0?"#c9a84c":"#444"}">${have}</span></span>`;
  }).join(" ");
    matsBar.innerHTML = mats;
  }
  renderCraftingGrid();
}

function setCraftCat(cat) {
  craftCat = cat;
  document.querySelectorAll("[id^='craftCat_']").forEach(b=>{
    b.classList.toggle("active", b.id===`craftCat_${cat}`);
  });
  renderCraftingGrid();
}

function renderCrafting() { renderCraftingSection(); }

function renderCraftingGrid() {
  let el = document.getElementById("craftingGrid");
  if (!el) return;
  let recipes = RECIPES.filter(r=>r.category===craftCat);
  el.innerHTML = "";

  recipes.forEach(recipe => {
    let can = canCraft(recipe);
    let div = document.createElement("div");
    div.style.cssText = `background:#131f13;border:1px solid ${can?"#c9a84c44":"#1e3a1e"};border-radius:12px;padding:14px`;
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="display:inline-flex;width:36px;height:36px">${(typeof ITEM_ICONS_SVG!=="undefined"&&ITEM_ICONS_SVG[recipe.result])?ITEM_ICONS_SVG[recipe.result]:recipe.icon}</span>
        <div>
          <div style="font-family:'Cinzel',serif;font-size:13px;color:${can?"#c9a84c":"var(--text)"}">
            ${recipe.result}${recipe.qty>1?` ×${recipe.qty}`:""}
          </div>
          <div style="font-size:11px;color:var(--text2)">${recipe.desc}</div>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:10px;letter-spacing:1px;color:#8aab84;margin-bottom:5px">SKŁADNIKI</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">
          ${recipe.ingredients.map(ing=>{
            let have = countInv(ing.name);
            let ok   = have >= ing.qty;
            let d    = ITEMS_DATABASE[ing.name]||{icon:"📦"};
            return `<span style="font-size:11px;padding:2px 8px;border-radius:5px;background:${ok?"rgba(74,184,112,0.1)":"rgba(201,74,74,0.1)"};border:1px solid ${ok?"#4ab87044":"#c94a4a44"};color:${ok?"#4ab870":"#c94a4a"}">
              <span style="display:inline-flex;width:16px;height:16px;vertical-align:middle">${(typeof ITEM_ICONS_SVG!=="undefined"&&ITEM_ICONS_SVG[ing.name])?ITEM_ICONS_SVG[ing.name]:d.icon}</span> ${ing.name} ${have}/${ing.qty}
            </span>`;
          }).join("")}
        </div>
      </div>
      <button onclick="doCraft('${recipe.id}')" ${can?"":"disabled"} style="
        width:100%;border-color:${can?"#c9a84c":"#333"};color:${can?"#c9a84c":"#555"};
        background:${can?"rgba(201,168,76,0.1)":"transparent"};
        font-family:'Cinzel',serif;font-size:12px;cursor:${can?"pointer":"not-allowed"}">
        ⚗️ Wytworz
      </button>
    `;
    el.appendChild(div);
  });

  if (recipes.length === 0) {
    el.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text2);padding:30px">Brak przepisów w tej kategorii</div>`;
  }
}

function doCraft(recipeId) {
  let recipe = RECIPES.find(r=>r.id===recipeId);
  if (!recipe || !canCraft(recipe)) return;

  // Zużyj składniki
  recipe.ingredients.forEach(ing=>{
    let left = ing.qty;
    window.inventory = (window.inventory||[]).filter(i=>{
      if (i.name===ing.name && left>0) { left--; return false; }
      return true;
    });
  });

  // Dodaj wynik
  for (let i=0; i<recipe.qty; i++) {
    let d = ITEMS_DATABASE[recipe.result]||{};
    if (d.isSlotItem) inventory.push(generateSlotItem(recipe.result));
    else inventory.push({ name:recipe.result, obtained:Date.now() });
  }

  log(`⚗️ Wytworzono: ${recipe.icon} ${recipe.result}${recipe.qty>1?` ×${recipe.qty}`:""}!`);
  saveGame(); renderAll();
  renderCraftingSection();
}
