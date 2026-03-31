// =====================
// SYSTEM JĘZYKÓW — Happy Horses
// =====================

const LANGUAGES = {
  pl: {
    name: "Polski", flag: "🇵🇱",
    menu: {
      expedition:"Wyprawy", stable:"Stajnia", inventory:"Ekwipunek",
      shop:"Sklep", crafting:"Crafting", market:"Rynek",
      tournaments:"Turnieje", contests:"Zawody", quests:"Questy",
      encyclopedia:"Encyklopedia", notifications:"Powiadomienia",
      events:"Eventy", ranking:"Ranking", drops:"Historia",
    },
    ui: {
      gold:"Złoto", level:"Poziom", horses:"Koni", expeditions:"Wyprawy",
      daily_limit:"Dzienny limit", active_expeditions:"Aktywne wyprawy",
      send_expedition:"Wyślij na wyprawę", back:"Powrót",
      buy:"Kup", sell:"Sprzedaj", use:"Użyj", craft:"Wytworz",
      feed:"Nakarm", heal:"Wylecz", breed:"Hoduj",
      stable_full:"Stajnia pełna!", not_enough_gold:"Za mało złota!",
      no_horses:"Brak koni!", expedition_limit:"Osiągnięto dzienny limit wypraw!",
    }
  },
  en: {
    name: "English", flag: "🇬🇧",
    menu: {
      expedition:"Expeditions", stable:"Stable", inventory:"Inventory",
      shop:"Shop", crafting:"Crafting", market:"Market",
      tournaments:"Tournaments", contests:"Contests", quests:"Quests",
      encyclopedia:"Encyclopedia", notifications:"Notifications",
      events:"Events", ranking:"Ranking", drops:"History",
    },
    ui: {
      gold:"Gold", level:"Level", horses:"Horses", expeditions:"Expeditions",
      daily_limit:"Daily limit", active_expeditions:"Active expeditions",
      send_expedition:"Send on expedition", back:"Back",
      buy:"Buy", sell:"Sell", use:"Use", craft:"Craft",
      feed:"Feed", heal:"Heal", breed:"Breed",
      stable_full:"Stable is full!", not_enough_gold:"Not enough gold!",
      no_horses:"No horses!", expedition_limit:"Daily expedition limit reached!",
    }
  },
  de: {
    name: "Deutsch", flag: "🇩🇪",
    menu: {
      expedition:"Expeditionen", stable:"Stall", inventory:"Inventar",
      shop:"Shop", crafting:"Handwerk", market:"Markt",
      tournaments:"Turniere", contests:"Wettkämpfe", quests:"Quests",
      encyclopedia:"Enzyklopädie", notifications:"Benachrichtigungen",
      events:"Events", ranking:"Rangliste", drops:"Verlauf",
    },
    ui: {
      gold:"Gold", level:"Stufe", horses:"Pferde", expeditions:"Expeditionen",
      daily_limit:"Tageslimit", active_expeditions:"Aktive Expeditionen",
      send_expedition:"Auf Expedition schicken", back:"Zurück",
      buy:"Kaufen", sell:"Verkaufen", use:"Benutzen", craft:"Herstellen",
      feed:"Füttern", heal:"Heilen", breed:"Züchten",
      stable_full:"Stall ist voll!", not_enough_gold:"Nicht genug Gold!",
      no_horses:"Keine Pferde!", expedition_limit:"Tageslimit erreicht!",
    }
  },
  fr: {
    name: "Français", flag: "🇫🇷",
    menu: {
      expedition:"Expéditions", stable:"Écurie", inventory:"Inventaire",
      shop:"Boutique", crafting:"Artisanat", market:"Marché",
      tournaments:"Tournois", contests:"Concours", quests:"Quêtes",
      encyclopedia:"Encyclopédie", notifications:"Notifications",
      events:"Événements", ranking:"Classement", drops:"Historique",
    },
    ui: {
      gold:"Or", level:"Niveau", horses:"Chevaux", expeditions:"Expéditions",
      daily_limit:"Limite quotidienne", active_expeditions:"Expéditions actives",
      send_expedition:"Envoyer en expédition", back:"Retour",
      buy:"Acheter", sell:"Vendre", use:"Utiliser", craft:"Fabriquer",
      feed:"Nourrir", heal:"Soigner", breed:"Élever",
      stable_full:"Écurie pleine !", not_enough_gold:"Pas assez d'or !",
      no_horses:"Pas de chevaux !", expedition_limit:"Limite quotidienne atteinte !",
    }
  },
};

let currentLang = localStorage.getItem("hh_lang") || "pl";

function getLang() { return LANGUAGES[currentLang] || LANGUAGES.pl; }
function t(key) { return getLang().ui[key] || LANGUAGES.pl.ui[key] || key; }
function tm(key) { return getLang().menu[key] || LANGUAGES.pl.menu[key] || key; }

function setLanguage(lang) {
  if (!LANGUAGES[lang]) return;
  currentLang = lang;
  localStorage.setItem("hh_lang", lang);
  applyLanguage();
}

function applyLanguage() {
  let L = getLang();
  // Zaktualizuj menu
  Object.entries(L.menu).forEach(([key, label]) => {
    let el = document.getElementById("menu-" + key);
    if (!el) return;
    // Zachowaj SVG ikony, zmień tylko tekst
    let svgEl = el.querySelector("svg");
    let badgeEl = el.querySelector("span[id]");
    let svgHtml = svgEl ? svgEl.outerHTML + " " : "";
    let badgeHtml = badgeEl ? " " + badgeEl.outerHTML : "";
    el.innerHTML = svgHtml + label + badgeHtml;
  });
  // Zaktualizuj przyciski wyboru języka
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
}

function renderLanguagePicker() {
  let el = document.getElementById("langPicker");
  if (!el) return;
  el.innerHTML = Object.entries(LANGUAGES).map(([code, L]) =>
    `<button class="lang-btn market-tab-btn${currentLang===code?" active":""}" data-lang="${code}"
      onclick="setLanguage('${code}')"
      style="font-size:11px;padding:4px 8px">
      ${L.flag} ${L.name}
    </button>`
  ).join("");
}

// Uruchom po załadowaniu
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => { applyLanguage(); renderLanguagePicker(); }, 200);
});
