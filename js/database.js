const HORSE_DATABASE = {
  common: {
    name: "Pospolite",
    rarity: "common",
    baseStats: { speed: 30, strength: 25, stamina: 28, luck: 5 },
    breeds: ["Konik Polski", "Huculski", "Śląski", "Małopolski", "Wielkopolski"]
  },
  rare: {
    name: "Szlachetne",
    rarity: "rare",
    baseStats: { speed: 50, strength: 45, stamina: 48, luck: 15 },
    breeds: ["Arabski", "Lipicański", "Andaluzyjski", "Lusitano"]
  },
  epic: {
    name: "Bojowe",
    rarity: "epic",
    baseStats: { speed: 70, strength: 68, stamina: 65, luck: 25 },
    breeds: ["Destrier", "Frison", "Kladruber", "Azteca"]
  },
  legendary: {
    name: "Legendarne",
    rarity: "legendary",
    baseStats: { speed: 90, strength: 88, stamina: 85, luck: 40 },
    breeds: ["Pegaz", "Sleipnir", "Bucephalus", "Arion"]
  }
};

const LOCATIONS = [
  { name: "Las",      icon: "🌲", desc: "Spokojny teren, dobre dla młodych koni", reward: "common" },
  { name: "Pustynia", icon: "🏜️", desc: "Gorąco i piasek — wymagające warunki",   reward: "rare" },
  { name: "Góry",     icon: "⛰️", desc: "Strome zbocza, silne konie tylko",       reward: "epic" },
  { name: "Tundra",   icon: "❄️", desc: "Mróz i śnieg — tylko dla wytrwałych",    reward: "legendary" }
];

const ITEMS_DATABASE = {
  "Eliksir Odmłodzenia":   { icon: "🧪", desc: "Odmładza konia o 30–120 dni", rarity: "rare" },
  "Jabłko":                { icon: "🍎", desc: "Nakarm konia — uzupełnia 50% głodu", rarity: "common", isFood: true },
  "Słoma":                 { icon: "🌾", desc: "Nakarm konia — uzupełnia 25% głodu", rarity: "common", isFood: true },
  "Skrzynka z Łupem":      { icon: "📦", desc: "Zawiera losowy przedmiot — otwórz by sprawdzić", rarity: "rare" },
  "Eliksir Szybkości":     { icon: "⚡", desc: "+5 do szybkości konia", rarity: "uncommon" },
  "Eliksir Siły":          { icon: "💪", desc: "+5 do siły konia", rarity: "uncommon" },
  "Eliksir Wytrzymałości": { icon: "❤️", desc: "+5 do wytrzymałości konia", rarity: "uncommon" },
  "Eliksir Szczęścia":     { icon: "🍀", desc: "+5 do szczęścia konia", rarity: "uncommon" },
};

// Sklep — bez skrzynki, eliksir odmłodzenia rzadki z globalnym limitem 5 szt.
const SHOP_ITEMS = [
  { name: "Słoma",               price: 30,  icon: "🌾", desc: "Nakarm konia — uzupełnia 25% głodu", alwaysAvailable: true },
  { name: "Jabłko",              price: 60,  icon: "🍎", desc: "Nakarm konia — uzupełnia 50% głodu", alwaysAvailable: true },
  { name: "Eliksir Odmłodzenia", price: 800, icon: "🧪", desc: "Odmładza konia o 30–120 dni — bardzo rzadki, globalny limit 5 szt.", rare: true, globalLimit: 5 },
];

const SHOP_HORSES = [
  { rarity: "common",    price: 100,  icon: "🐴", label: "Koń Pospolity",  desc: "Gwarantowany koń pospolitej rzadkości" },
  { rarity: "rare",      price: 400,  icon: "🐎", label: "Koń Szlachetny", desc: "Gwarantowany koń szlachetnej rzadkości" },
  { rarity: "epic",      price: 1200, icon: "🦄", label: "Koń Bojowy",     desc: "Gwarantowany koń bojowej rzadkości" },
  { rarity: "legendary", price: 4000, icon: "✨", label: "Koń Legendarny", desc: "Gwarantowany legendarny koń — rzadkość!" },
];

// Szablony dziennych questów
const QUEST_TEMPLATES = [
  { id: "feed3",      desc: "Nakarm 3 konie",               goal: 3,  reward: 150, type: "feed" },
  { id: "feed5",      desc: "Nakarm 5 koni",                goal: 5,  reward: 250, type: "feed" },
  { id: "expedition2",desc: "Wyślij 2 wyprawy",             goal: 2,  reward: 200, type: "expedition" },
  { id: "expedition4",desc: "Wyślij 4 wyprawy",             goal: 4,  reward: 400, type: "expedition" },
  { id: "breed1",     desc: "Rozmnóż konie 1 raz",          goal: 1,  reward: 500, type: "breed" },
  { id: "buy1",       desc: "Kup 1 przedmiot w sklepie",    goal: 1,  reward: 120, type: "buy" },
  { id: "market1",    desc: "Wystaw coś na rynku",          goal: 1,  reward: 180, type: "market" },
  { id: "lootbox1",   desc: "Otwórz 1 Skrzynkę z Łupem",   goal: 1,  reward: 200, type: "lootbox" },
];
