// =====================
// CRAFTING PRZEDMIOTÓW
// =====================

const RECIPES = [
  // Jedzenie
  {
    id:"jabłko_sfinksa",
    result:"Jabłko Sfinksa", qty:1, icon:"🍏",
    desc:"Wymagane do rozmnażania koni",
    ingredients:[ {name:"Jabłko",qty:3}, {name:"Siano",qty:2} ],
    category:"hodowla",
  },
  {
    id:"boski_nektar",
    result:"Boski Nektar", qty:1, icon:"🌟",
    desc:"+50% szans na mutację",
    ingredients:[ {name:"Jabłko Sfinksa",qty:2}, {name:"Eliksir Szczęścia",qty:1} ],
    category:"hodowla",
  },
  {
    id:"eliksir_krwi",
    result:"Eliksir Krwi", qty:1, icon:"🩸",
    desc:"Potomek dziedziczy krew silniejszego",
    ingredients:[ {name:"Jabłko Sfinksa",qty:1}, {name:"Eliksir Siły",qty:1}, {name:"Eliksir Wytrzymałości",qty:1} ],
    category:"hodowla",
  },
  // Sloty
  {
    id:"piorun_craft",
    result:"Piorun", qty:1, icon:"⚡️",
    desc:"Slot: +1–10 szybkości",
    ingredients:[ {name:"Metal",qty:5}, {name:"Gwóźdź",qty:3} ],
    category:"sloty",
  },
  {
    id:"kowadlo_craft",
    result:"Kowadło", qty:1, icon:"🔨",
    desc:"Slot: +1–10 siły",
    ingredients:[ {name:"Metal",qty:5}, {name:"Cegła",qty:3} ],
    category:"sloty",
  },
  {
    id:"koniczyna_craft",
    result:"Koniczyna", qty:1, icon:"🍀",
    desc:"Slot: +1–10 szczęścia",
    ingredients:[ {name:"Siano",qty:5}, {name:"Kamień",qty:3} ],
    category:"sloty",
  },
  {
    id:"serce_craft",
    result:"Serce", qty:1, icon:"❤️‍🔥",
    desc:"Slot: +1–10 wytrzymałości",
    ingredients:[ {name:"Siano",qty:3}, {name:"Metal",qty:3}, {name:"Gwóźdź",qty:2} ],
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
  hodowla:"🧬 Hodowla", sloty:"✨ Sloty", inne:"📦 Inne",
  materiały:"🪵 Materiały", eliksiry:"🧪 Eliksiry",
};

let craftCat = "hodowla";

function countInv(name) {
  return (window.inventory||[]).filter(i=>i.name===name).length;
}
function canCraft(recipe) {
  return recipe.ingredients.every(ing=>countInv(ing.name)>=ing.qty);
}

function openCraftingScreen() {
  document.getElementById("craftingOverlay")?.remove();
  let overlay = document.createElement("div");
  overlay.id  = "craftingOverlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:800;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;font-family:'Crimson Text',serif;overflow-y:auto;padding:20px";

  overlay.innerHTML = `
    <div style="width:100%;max-width:680px;background:#0f1a0f;border-radius:16px;padding:24px;border:1px solid #1e3a1e;position:relative">
      <button onclick="document.getElementById('craftingOverlay').remove()" style="position:absolute;top:12px;right:12px;background:transparent;border:none;color:#4a5a4a;font-size:18px;cursor:pointer">✕</button>
      <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:#8aab84;margin-bottom:16px">⚗️ CRAFTING</div>

      <!-- Kategorie -->
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
        ${Object.entries(CRAFT_CAT_LABELS).map(([id,label])=>`
          <button id="craftCat_${id}" class="market-tab-btn ${id===craftCat?"active":""}" onclick="setCraftCat('${id}')">${label}</button>
        `).join("")}
      </div>

      <div id="craftingGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  renderCraftingGrid();
}

function setCraftCat(cat) {
  craftCat = cat;
  document.querySelectorAll("[id^='craftCat_']").forEach(b=>{
    b.classList.toggle("active", b.id===`craftCat_${cat}`);
  });
  renderCraftingGrid();
}

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
        <span style="font-size:28px">${recipe.icon}</span>
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
              ${d.icon} ${ing.name} ${have}/${ing.qty}
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
  renderCraftingGrid(); // Odśwież dostępność
}
