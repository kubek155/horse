// =====================
// SYSTEM JĘZYKÓW — Happy Horses
// =====================
const LANGUAGES = {
  pl: {
    name:"Polski", flag:"🇵🇱",
    // Menu
    menu_expedition:"Wyprawy", menu_stable:"Stajnia", menu_inventory:"Ekwipunek",
    menu_shop:"Sklep", menu_crafting:"Crafting", menu_market:"Rynek",
    menu_tournaments:"Turnieje", menu_contests:"Zawody", menu_quests:"Questy",
    menu_encyclopedia:"Encyklopedia", menu_notifications:"Powiadomienia",
    menu_events:"Eventy", menu_ranking:"Ranking", menu_drops:"Historia",
    // Stajnia
    stable_title:"Stajnia", stable_upgrade:"Rozbuduj stajnię", stable_level:"Poziom stajni",
    stable_capacity:"Pojemność", stable_upgrades_tab:"Ulepszenia", stable_materials_tab:"Materiały",
    stable_limit:"Limit stajni", auto_feed:"Auto-karmienie",
    // Wyprawy
    exp_daily_limit:"Dzienny limit", exp_active:"Aktywne wyprawy", exp_send:"Wyślij na wyprawę",
    exp_remaining:"Pozostałe wyprawy", exp_none:"Brak aktywnych wypraw",
    // Ekwipunek
    inv_title:"Ekwipunek", inv_all:"Wszystko", inv_food:"Jedzenie", inv_breed:"Hodowla",
    inv_elixir:"Eliksiry", inv_slot:"Sloty", inv_pass:"Przepustki",
    inv_build:"Budowlane", inv_transport:"Transportery", inv_other:"Inne",
    inv_empty:"Ekwipunek jest pusty",
    // Sklep
    shop_title:"Sklep", shop_buy:"Kup", shop_price:"Cena", shop_limit:"Limit",
    shop_sold_out:"Wyprzedany", shop_unavailable:"Niedostępny", shop_not_enough:"Za mało złota",
    shop_food:"Jedzenie & Leczenie", shop_elixirs:"Eliksiry (jednorazowe)",
    shop_slots:"Przedmioty do slotów", shop_breed:"Hodowla", shop_special:"Specjalne",
    // Rynek
    market_title:"Rynek", market_local:"Lokalny", market_global:"Globalny",
    market_sell:"Sprzedaj", market_buy:"Kup", market_list:"Wystaw",
    market_price:"Cena", market_seller:"Sprzedawca",
    // Turnieje
    tourn_title:"Turnieje", tourn_register:"Zapisz konia", tourn_unregister:"Wypisz",
    tourn_fee:"Wpisowe", tourn_prize:"Nagroda", tourn_lobby:"Lobby",
    tourn_loading:"Ładowanie turniejów...", tourn_login:"Zaloguj się aby dołączyć",
    // Crafting
    craft_title:"Crafting", craft_make:"Wytworz", craft_ingredients:"Składniki",
    // Questy
    quest_title:"Questy", quest_daily:"Dzienne", quest_weekly:"Tygodniowe",
    quest_claim:"Odbierz!", quest_claimed:"Odebrano", quest_reset:"Nowe questy za:",
    // Hodowla/stajnia konie
    horse_speed:"Szybkość", horse_strength:"Siła", horse_stamina:"Wytrzymałość",
    horse_luck:"Szczęście", horse_age:"Wiek", horse_hunger:"Głód",
    horse_injured:"Ranny", horse_pregnant:"W ciąży", horse_feed:"Nakarm",
    horse_heal:"Wylecz", horse_breed:"Rozmnóż", horse_sell:"Sprzedaj",
    // Ogólne
    btn_back:"Powrót", btn_cancel:"Anuluj", btn_confirm:"Potwierdź",
    btn_close:"Zamknij", btn_refresh:"Odśwież",
    err_no_horses:"Brak koni!", err_stable_full:"Stajnia pełna!",
    err_no_gold:"Za mało złota!", err_exp_limit:"Osiągnięto dzienny limit wypraw!",
  },
  en: {
    name:"English", flag:"🇬🇧",
    menu_expedition:"Expeditions", menu_stable:"Stable", menu_inventory:"Inventory",
    menu_shop:"Shop", menu_crafting:"Crafting", menu_market:"Market",
    menu_tournaments:"Tournaments", menu_contests:"Contests", menu_quests:"Quests",
    menu_encyclopedia:"Encyclopedia", menu_notifications:"Notifications",
    menu_events:"Events", menu_ranking:"Ranking", menu_drops:"History",
    stable_title:"Stable", stable_upgrade:"Upgrade Stable", stable_level:"Stable Level",
    stable_capacity:"Capacity", stable_upgrades_tab:"Upgrades", stable_materials_tab:"Materials",
    stable_limit:"Stable Limit", auto_feed:"Auto-Feed",
    exp_daily_limit:"Daily Limit", exp_active:"Active Expeditions", exp_send:"Send on Expedition",
    exp_remaining:"Remaining Expeditions", exp_none:"No active expeditions",
    inv_title:"Inventory", inv_all:"All", inv_food:"Food", inv_breed:"Breeding",
    inv_elixir:"Elixirs", inv_slot:"Slots", inv_pass:"Passes",
    inv_build:"Building", inv_transport:"Transporters", inv_other:"Other",
    inv_empty:"Inventory is empty",
    shop_title:"Shop", shop_buy:"Buy", shop_price:"Price", shop_limit:"Limit",
    shop_sold_out:"Sold Out", shop_unavailable:"Unavailable", shop_not_enough:"Not Enough Gold",
    shop_food:"Food & Healing", shop_elixirs:"Elixirs (one-use)",
    shop_slots:"Slot Items", shop_breed:"Breeding", shop_special:"Special",
    market_title:"Market", market_local:"Local", market_global:"Global",
    market_sell:"Sell", market_buy:"Buy", market_list:"List",
    market_price:"Price", market_seller:"Seller",
    tourn_title:"Tournaments", tourn_register:"Register Horse", tourn_unregister:"Unregister",
    tourn_fee:"Entry Fee", tourn_prize:"Prize", tourn_lobby:"Lobby",
    tourn_loading:"Loading tournaments...", tourn_login:"Log in to join tournaments",
    craft_title:"Crafting", craft_make:"Craft", craft_ingredients:"Ingredients",
    quest_title:"Quests", quest_daily:"Daily", quest_weekly:"Weekly",
    quest_claim:"Claim!", quest_claimed:"Claimed", quest_reset:"New quests in:",
    horse_speed:"Speed", horse_strength:"Strength", horse_stamina:"Stamina",
    horse_luck:"Luck", horse_age:"Age", horse_hunger:"Hunger",
    horse_injured:"Injured", horse_pregnant:"Pregnant", horse_feed:"Feed",
    horse_heal:"Heal", horse_breed:"Breed", horse_sell:"Sell",
    btn_back:"Back", btn_cancel:"Cancel", btn_confirm:"Confirm",
    btn_close:"Close", btn_refresh:"Refresh",
    err_no_horses:"No horses!", err_stable_full:"Stable is full!",
    err_no_gold:"Not enough gold!", err_exp_limit:"Daily expedition limit reached!",
  },
  de: {
    name:"Deutsch", flag:"🇩🇪",
    menu_expedition:"Expeditionen", menu_stable:"Stall", menu_inventory:"Inventar",
    menu_shop:"Shop", menu_crafting:"Handwerk", menu_market:"Markt",
    menu_tournaments:"Turniere", menu_contests:"Wettkämpfe", menu_quests:"Quests",
    menu_encyclopedia:"Enzyklopädie", menu_notifications:"Benachrichtigungen",
    menu_events:"Events", menu_ranking:"Rangliste", menu_drops:"Verlauf",
    stable_title:"Stall", stable_upgrade:"Stall ausbauen", stable_level:"Stallstufe",
    stable_capacity:"Kapazität", stable_upgrades_tab:"Verbesserungen", stable_materials_tab:"Materialien",
    stable_limit:"Stalllimit", auto_feed:"Auto-Füttern",
    exp_daily_limit:"Tageslimit", exp_active:"Aktive Expeditionen", exp_send:"Auf Expedition schicken",
    exp_remaining:"Verbleibende Expeditionen", exp_none:"Keine aktiven Expeditionen",
    inv_title:"Inventar", inv_all:"Alles", inv_food:"Essen", inv_breed:"Zucht",
    inv_elixir:"Elixiere", inv_slot:"Slots", inv_pass:"Pässe",
    inv_build:"Baumaterialien", inv_transport:"Transporter", inv_other:"Sonstiges",
    inv_empty:"Inventar ist leer",
    shop_title:"Shop", shop_buy:"Kaufen", shop_price:"Preis", shop_limit:"Limit",
    shop_sold_out:"Ausverkauft", shop_unavailable:"Nicht verfügbar", shop_not_enough:"Nicht genug Gold",
    shop_food:"Essen & Heilung", shop_elixirs:"Elixiere (einmalig)",
    shop_slots:"Slot-Gegenstände", shop_breed:"Zucht", shop_special:"Spezial",
    market_title:"Markt", market_local:"Lokal", market_global:"Global",
    market_sell:"Verkaufen", market_buy:"Kaufen", market_list:"Einstellen",
    market_price:"Preis", market_seller:"Verkäufer",
    tourn_title:"Turniere", tourn_register:"Pferd anmelden", tourn_unregister:"Abmelden",
    tourn_fee:"Startgebühr", tourn_prize:"Preis", tourn_lobby:"Lobby",
    tourn_loading:"Turniere werden geladen...", tourn_login:"Anmelden um beizutreten",
    craft_title:"Handwerk", craft_make:"Herstellen", craft_ingredients:"Zutaten",
    quest_title:"Quests", quest_daily:"Täglich", quest_weekly:"Wöchentlich",
    quest_claim:"Abholen!", quest_claimed:"Abgeholt", quest_reset:"Neue Quests in:",
    horse_speed:"Geschwindigkeit", horse_strength:"Stärke", horse_stamina:"Ausdauer",
    horse_luck:"Glück", horse_age:"Alter", horse_hunger:"Hunger",
    horse_injured:"Verletzt", horse_pregnant:"Trächtig", horse_feed:"Füttern",
    horse_heal:"Heilen", horse_breed:"Züchten", horse_sell:"Verkaufen",
    btn_back:"Zurück", btn_cancel:"Abbrechen", btn_confirm:"Bestätigen",
    btn_close:"Schließen", btn_refresh:"Aktualisieren",
    err_no_horses:"Keine Pferde!", err_stable_full:"Stall ist voll!",
    err_no_gold:"Nicht genug Gold!", err_exp_limit:"Tageslimit erreicht!",
  },
  fr: {
    name:"Français", flag:"🇫🇷",
    menu_expedition:"Expéditions", menu_stable:"Écurie", menu_inventory:"Inventaire",
    menu_shop:"Boutique", menu_crafting:"Artisanat", menu_market:"Marché",
    menu_tournaments:"Tournois", menu_contests:"Concours", menu_quests:"Quêtes",
    menu_encyclopedia:"Encyclopédie", menu_notifications:"Notifications",
    menu_events:"Événements", menu_ranking:"Classement", menu_drops:"Historique",
    stable_title:"Écurie", stable_upgrade:"Améliorer l'écurie", stable_level:"Niveau écurie",
    stable_capacity:"Capacité", stable_upgrades_tab:"Améliorations", stable_materials_tab:"Matériaux",
    stable_limit:"Limite écurie", auto_feed:"Auto-nourrir",
    exp_daily_limit:"Limite quotidienne", exp_active:"Expéditions actives", exp_send:"Envoyer en expédition",
    exp_remaining:"Expéditions restantes", exp_none:"Aucune expédition active",
    inv_title:"Inventaire", inv_all:"Tout", inv_food:"Nourriture", inv_breed:"Élevage",
    inv_elixir:"Élixirs", inv_slot:"Emplacements", inv_pass:"Passes",
    inv_build:"Matériaux", inv_transport:"Transporteurs", inv_other:"Autres",
    inv_empty:"L'inventaire est vide",
    shop_title:"Boutique", shop_buy:"Acheter", shop_price:"Prix", shop_limit:"Limite",
    shop_sold_out:"Épuisé", shop_unavailable:"Indisponible", shop_not_enough:"Pas assez d'or",
    shop_food:"Nourriture & Soins", shop_elixirs:"Élixirs (usage unique)",
    shop_slots:"Objets d'emplacement", shop_breed:"Élevage", shop_special:"Spécial",
    market_title:"Marché", market_local:"Local", market_global:"Global",
    market_sell:"Vendre", market_buy:"Acheter", market_list:"Mettre en vente",
    market_price:"Prix", market_seller:"Vendeur",
    tourn_title:"Tournois", tourn_register:"Inscrire cheval", tourn_unregister:"Se désinscrire",
    tourn_fee:"Frais d'entrée", tourn_prize:"Prix", tourn_lobby:"Lobby",
    tourn_loading:"Chargement des tournois...", tourn_login:"Connectez-vous pour participer",
    craft_title:"Artisanat", craft_make:"Fabriquer", craft_ingredients:"Ingrédients",
    quest_title:"Quêtes", quest_daily:"Quotidiennes", quest_weekly:"Hebdomadaires",
    quest_claim:"Réclamer !", quest_claimed:"Réclamé", quest_reset:"Nouvelles quêtes dans :",
    horse_speed:"Vitesse", horse_strength:"Force", horse_stamina:"Endurance",
    horse_luck:"Chance", horse_age:"Âge", horse_hunger:"Faim",
    horse_injured:"Blessé", horse_pregnant:"En gestation", horse_feed:"Nourrir",
    horse_heal:"Soigner", horse_breed:"Élever", horse_sell:"Vendre",
    btn_back:"Retour", btn_cancel:"Annuler", btn_confirm:"Confirmer",
    btn_close:"Fermer", btn_refresh:"Rafraîchir",
    err_no_horses:"Pas de chevaux !", err_stable_full:"Écurie pleine !",
    err_no_gold:"Pas assez d'or !", err_exp_limit:"Limite quotidienne atteinte !",
  },
};

let currentLang = localStorage.getItem("hh_lang") || "pl";
function getLang() { return LANGUAGES[currentLang] || LANGUAGES.pl; }
function t(key) {
  let L = getLang();
  return L[key] || LANGUAGES.pl[key] || key;
}

function setLanguage(lang) {
  if (!LANGUAGES[lang]) return;
  currentLang = lang;
  localStorage.setItem("hh_lang", lang);
  applyLanguage();
  closeLangModal();
}

function applyLanguage() {
  let L = getLang();
  // Menu items
  const menuMap = {
    expedition:"menu_expedition", stable:"menu_stable", inventory:"menu_inventory",
    shop:"menu_shop", crafting:"menu_crafting", market:"menu_market",
    tournaments:"menu_tournaments", contests:"menu_contests", quests:"menu_quests",
    encyclopedia:"menu_encyclopedia", notifications:"menu_notifications",
    events:"menu_events", ranking:"menu_ranking", drops:"menu_drops",
  };
  Object.entries(menuMap).forEach(([sec, key]) => {
    let el = document.getElementById("menu-" + sec);
    if (!el) return;
    let svgEl = el.querySelector("svg");
    let badgeEl = el.querySelector("span[id]");
    let svgHtml = svgEl ? svgEl.outerHTML + " " : "";
    let badgeHtml = badgeEl ? " " + badgeEl.outerHTML : "";
    el.innerHTML = svgHtml + (L[key]||key) + badgeHtml;
  });

  // Zakładki ekwipunku
  const invTabMap = {all:"inv_all",food:"inv_food",breed:"inv_breed",elixir:"inv_elixir",
    slot:"inv_slot",pass:"inv_pass",build:"inv_build",transport:"inv_transport",other:"inv_other"};
  Object.entries(invTabMap).forEach(([id,key])=>{
    let btn = document.querySelector(`.inv-tab-btn[data-tab="${id}"]`);
    if (!btn) return;
    let svgEl = btn.querySelector("span");
    let svgHtml = svgEl ? svgEl.outerHTML + " " : "";
    let countMatch = btn.innerHTML.match(/\(<span[^>]*>(\d+)<\/span>\)/);
    let countHtml = countMatch ? ` <span style="font-size:10px;opacity:0.7">(${countMatch[1]})</span>` : "";
    btn.innerHTML = svgHtml + (L[key]||key) + countHtml;
  });

  // Nagłówki sekcji — data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    let key = el.dataset.i18n;
    if (L[key]) el.textContent = L[key];
  });

  // Zakładki sklepu (grupy)
  const shopGroupMap = {
    "Jedzenie & Leczenie":"shop_food",
    "Eliksiry (jednorazowe)":"shop_elixirs",
    "Przedmioty do slotów":"shop_slots",
    "Hodowla":"shop_breed",
    "Specjalne":"shop_special",
    "Food & Healing":"shop_food",
  };
  document.querySelectorAll(".shop-group-header").forEach(el => {
    let key = shopGroupMap[el.textContent.trim()];
    if (key && L[key]) el.textContent = L[key];
  });

  // Aktualizuj przycisk wyboru języka
  let langBtn = document.getElementById("langToggleBtn");
  if (langBtn) langBtn.innerHTML = `${L.flag} ${L.name} ▾`;
}

// Modal wyboru języka
function openLangModal() {
  let existing = document.getElementById("langModal");
  if (existing) { existing.remove(); return; }

  let modal = document.createElement("div");
  modal.id = "langModal";
  modal.style.cssText = "position:fixed;z-index:9999;background:rgba(0,0,0,0.7);inset:0;display:flex;align-items:flex-start;justify-content:flex-end;padding-top:48px;padding-right:16px";
  modal.onclick = (e) => { if(e.target===modal) modal.remove(); };

  modal.innerHTML = `
    <div style="background:#0f1a0f;border:1px solid #c9a84c44;border-radius:12px;padding:16px;min-width:200px;box-shadow:0 8px 32px rgba(0,0,0,0.6)">
      <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;color:var(--text2);margin-bottom:12px">🌐 WYBIERZ JĘZYK</div>
      ${Object.entries(LANGUAGES).map(([code,L])=>`
        <button onclick="setLanguage('${code}')" style="
          width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;
          background:${currentLang===code?"rgba(201,168,76,0.12)":"transparent"};
          border:1px solid ${currentLang===code?"#c9a84c44":"#1e3a1e"};
          border-radius:8px;margin-bottom:6px;cursor:pointer;
          color:${currentLang===code?"#c9a84c":"var(--text2)"};text-align:left;font-size:13px
        ">
          <span style="font-size:20px">${L.flag}</span>
          <span style="font-family:'Cinzel',serif">${L.name}</span>
          ${currentLang===code?'<svg viewBox="0 0 12 12" fill="none" style="margin-left:auto;width:12px;height:12px"><path d="M2 6l3 3 5-5" stroke="#c9a84c" stroke-width="1.5" stroke-linecap="round"/></svg>':""}
        </button>
      `).join("")}
    </div>
  `;
  document.body.appendChild(modal);
}

function closeLangModal() {
  document.getElementById("langModal")?.remove();
}

// Inicjalizacja
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => { applyLanguage(); }, 300);
});

// Eksport globalny
window.openLangModal = openLangModal;
window.setLanguage = setLanguage;
