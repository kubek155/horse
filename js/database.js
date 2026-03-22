// =====================
// RZADKOŚCI
// =====================
// common     = Pospolity   (szary)
// uncommon   = Piękny      (zielony)
// rare       = Rzadki      (niebieski)
// epic       = Legendarny  (fioletowy)
// legendary  = Mityczny    (złoty)
// mythic     = Pradawny     (czerwony/tęczowy)

// =====================
// KREW
// =====================
// hotblood   = Gorącokrwisty  — szybki, wrażliwy, energiczny
// coldblood  = Zimnokrwisty   — silny, spokojny, wytrzymały
// warmblood  = Ciepłokrwisty  — zbalansowany, sportowy
// oriental   = Orientalny     — szczęście, szybkość, elegancja
// gaited     = Chodzący       — wytrzymałość, płynność

// Bonus krwi do bazowych statystyk
const BLOODLINE_BONUS = {
  hotblood:  { speed:+10, strength:-5,  stamina:+0,  luck:+5  },
  coldblood: { speed:-5,  strength:+15, stamina:+10, luck:-5  },
  warmblood: { speed:+5,  strength:+5,  stamina:+5,  luck:+0  },
  oriental:  { speed:+8,  strength:-8,  stamina:+0,  luck:+15 },
  gaited:    { speed:+0,  strength:+0,  stamina:+15, luck:+5  },
};

const BLOODLINE_LABELS = {
  hotblood:  "🔴 Gorącokrwisty",
  coldblood: "🔵 Zimnokrwisty",
  warmblood: "🟡 Ciepłokrwisty",
  oriental:  "🟠 Orientalny",
  gaited:    "🟢 Chodzący",
};

const RARITY_COLORS = {
  common:    "#909090",
  uncommon:  "#8aab84",
  rare:      "#4a7ec8",
  epic:      "#7b5ea7",
  legendary: "#c9a84c",
  mythic:    "#c94a6a",
};

const RARITY_LABELS = {
  common:    "Zwykły",
  uncommon:  "Pospolity",
  rare:      "Rzadki",
  epic:      "Legendarny",
  legendary: "Mityczny",
  mythic:    "Pradawny",
};

// Wagi losowania rzadkości (mniejsze dla rzadkich)
const RARITY_WEIGHTS = {
  common:    58,
  uncommon:  24,
  rare:      11,
  epic:      4.5,
  legendary: 2,
  mythic:    0.5,
};

// =====================
// PERKI SPECJALNE (mityczny i pradawny)
// =====================
const RARITY_PERKS = {
  legendary: [
    { id:"swift_blood",   name:"Szybka Krew",      icon:"💨", desc:"+15% złota z wypraw" },
    { id:"star_born",     name:"Dziecko Gwiazd",   icon:"⭐", desc:"Szansa na 2 nagrody z wyprawy" },
    { id:"ancient_wisdom",name:"Dawna Mądrość",    icon:"📜", desc:"+10 do wszystkich statystyk potomków" },
  ],
  mythic: [
    { id:"divine_aura",   name:"Boska Aura",       icon:"✨", desc:"+25% złota z wypraw, +5% drop rate" },
    { id:"immortal",      name:"Nieśmiertelny",    icon:"♾️", desc:"Żyje 2× dłużej (730 dni zamiast 365)" },
    { id:"legend_breed",  name:"Legendarny Ród",   icon:"🧬", desc:"Potomki mają +1 do minimalnej rzadkości" },
    { id:"golden_luck",   name:"Złote Szczęście",  icon:"🍀", desc:"Szczęście liczy się podwójnie dla stajni" },
    { id:"war_born",      name:"Zrodzony z Bitwy",icon:"⚔️", desc:"+20 siły, +20 wytrzymałości" },
  ],
};

// =====================
// HORSE BREEDS — 120 ras
// format: { name, flag, country, type, bloodline, rarity, base:{speed,strength,stamina,luck}, desc }
// =====================
const BREEDS = [

  // ── GORĄCOKRWISTE LEKKIE ────────────────────────────────
  { name:"Pełna Krew Angielska", flag:"🇬🇧", country:"Wielka Brytania", type:"Wyścigowy",      bloodline:"hotblood",  rarity:"legendary", base:{speed:98,strength:84,stamina:88,luck:76}, desc:"Najszybsza rasa wyścigowa na świecie." },
  { name:"Quarter Horse",        flag:"🇺🇸", country:"USA",             type:"Wyścigowy",      bloodline:"hotblood",  rarity:"uncommon",  base:{speed:31,strength:21,stamina:19,luck:5}, desc:"Najszybszy koń na dystansie ćwierć mili." },
  { name:"Paint Horse",          flag:"🇺🇸", country:"USA",             type:"Reining",        bloodline:"hotblood",  rarity:"uncommon",  base:{speed:25,strength:22,stamina:23,luck:7}, desc:"Kolorowy koń z plamami, potomek Quarter Horse." },
  { name:"Appaloosa",            flag:"🇺🇸", country:"USA",             type:"Wszechstronny",  bloodline:"hotblood",  rarity:"uncommon",  base:{speed:24,strength:21,stamina:24,luck:6}, desc:"Charakterystyczne cętki — rasa Indian Nez Perce." },
  { name:"Mustang",              flag:"🇺🇸", country:"USA",             type:"Dziki",          bloodline:"hotblood",  rarity:"rare",      base:{speed:34,strength:26,stamina:36,luck:11}, desc:"Feralne konie Dzikiego Zachodu." },
  { name:"Morgan",               flag:"🇺🇸", country:"USA",             type:"Wszechstronny",  bloodline:"hotblood",  rarity:"uncommon",  base:{speed:24,strength:22,stamina:24,luck:5}, desc:"Pierwsza rasa wyhodowana w USA." },
  { name:"American Saddlebred",  flag:"🇺🇸", country:"USA",             type:"Pokazowy",       bloodline:"gaited",    rarity:"rare",      base:{speed:29,strength:22,stamina:28,luck:10}, desc:"Elegancki koń pokazowy z naturalnym chodem." },
  { name:"Standardbred",         flag:"🇺🇸", country:"USA",             type:"Wyścigowy",      bloodline:"hotblood",  rarity:"uncommon",  base:{speed:29,strength:19,stamina:24,luck:4}, desc:"Wyścigi w zaprzęgu — kłus i inochód." },
  { name:"Palomino",             flag:"🇺🇸", country:"USA",             type:"Pokazowy",       bloodline:"hotblood",  rarity:"uncommon",  base:{speed:23,strength:20,stamina:22,luck:7}, desc:"Złocista sierść z białą grzywą." },
  { name:"Pinto",                flag:"🇺🇸", country:"USA",             type:"Wszechstronny",  bloodline:"hotblood",  rarity:"common",    base:{speed:19,strength:17,stamina:19,luck:5}, desc:"Typ kolorowy, biało-łaty." },

  // ── ORIENTALNE ──────────────────────────────────────────
  { name:"Arabski",              flag:"🇸🇦", country:"Arabia",          type:"Wyścigowy",      bloodline:"oriental",  rarity:"rare",      base:{speed:37,strength:22,stamina:35,luck:17}, desc:"Jedna z najstarszych i najpiękniejszych ras." },
  { name:"Akhal-Teke",           flag:"🇹🇲", country:"Turkmenistan",    type:"Wyścigowy",      bloodline:"oriental",  rarity:"epic",      base:{speed:67,strength:56,stamina:63,luck:56}, desc:"Metaliczny połysk sierści, nazywany 'Niebiańskim Koniem'." },
  { name:"Shagya Arabian",       flag:"🇭🇺", country:"Węgry",           type:"Wszechstronny",  bloodline:"oriental",  rarity:"rare",      base:{speed:35,strength:22,stamina:34,luck:16}, desc:"Szlachetny arab hodowany w Austro-Węgrzech." },
  { name:"Barb",                 flag:"🇲🇦", country:"Maroko",          type:"Jeździecki",     bloodline:"oriental",  rarity:"rare",      base:{speed:34,strength:23,stamina:32,luck:14}, desc:"Starożytna rasa berberyjska, przodek wielu ras." },
  { name:"Tersk",                flag:"🇷🇺", country:"Rosja",           type:"Wyścigowy",      bloodline:"oriental",  rarity:"rare",      base:{speed:36,strength:22,stamina:31,luck:14}, desc:"Rosyjski arab o srebrzystej sierści." },
  { name:"Karabakh",             flag:"🇦🇿", country:"Azerbejdżan",     type:"Wyścigowy",      bloodline:"oriental",  rarity:"epic",      base:{speed:66,strength:56,stamina:62,luck:55}, desc:"Rzadka rasa z Górskiego Karabachu, złocisty połysk." },
  { name:"Budyonny",             flag:"🇷🇺", country:"Rosja",           type:"Wszechstronny",  bloodline:"oriental",  rarity:"uncommon",  base:{speed:27,strength:19,stamina:24,luck:9}, desc:"Radziecki koń militarny, Arab × Don." },
  { name:"Don",                  flag:"🇷🇺", country:"Rosja",           type:"Wojskowy",       bloodline:"oriental",  rarity:"uncommon",  base:{speed:25,strength:20,stamina:26,luck:8}, desc:"Koń Kozaków Dońskich, hardzki i wytrzymały." },
  { name:"Iomud",                flag:"🇹🇲", country:"Turkmenistan",    type:"Wyścigowy",      bloodline:"oriental",  rarity:"rare",      base:{speed:36,strength:21,stamina:32,luck:16}, desc:"Turkmeński krewny Akhal-Teke." },
  { name:"Turkoman",             flag:"🇮🇷", country:"Iran",            type:"Wyścigowy",      bloodline:"oriental",  rarity:"epic",      base:{speed:66,strength:56,stamina:62,luck:56}, desc:"Wymarła rasa perska, protoplasta Thoroughbreda." },
  { name:"Marwari",              flag:"🇮🇳", country:"Indie",           type:"Wojskowy",       bloodline:"gaited",    rarity:"epic",      base:{speed:64,strength:59,stamina:62,luck:56}, desc:"Zagięte uszy, chód rewaal — koń Radżputów." },
  { name:"Kathiawari",           flag:"🇮🇳", country:"Indie",           type:"Jeździecki",     bloodline:"gaited",    rarity:"rare",      base:{speed:31,strength:24,stamina:30,luck:17}, desc:"Indyjski krewny Marwariego." },

  // ── IBERYJSKIE / BAROKOWE ───────────────────────────────
  { name:"Andaluzyjski (PRE)",   flag:"🇪🇸", country:"Hiszpania",       type:"Barokowy",       bloodline:"hotblood",  rarity:"epic",      base:{speed:63,strength:60,stamina:61,luck:54}, desc:"Czysty Koń Hiszpański — ujeżdżenie i pokazy." },
  { name:"Lusitano",             flag:"🇵🇹", country:"Portugalia",      type:"Barokowy",       bloodline:"hotblood",  rarity:"epic",      base:{speed:62,strength:61,stamina:62,luck:53}, desc:"Koń bullfighting, bliźniak Andaluzyjskiego." },
  { name:"Lipicański",           flag:"🇦🇹", country:"Austria",         type:"Barokowy",       bloodline:"warmblood", rarity:"epic",      base:{speed:61,strength:61,stamina:62,luck:55}, desc:"Słynne białe konie Hiszpańskiej Szkoły Jeździeckiej." },
  { name:"Friesian",             flag:"🇳🇱", country:"Holandia",        type:"Barokowy",       bloodline:"coldblood", rarity:"rare",      base:{speed:28,strength:31,stamina:31,luck:14}, desc:"Czarny jak noc, gęsta grzywa — koń z bajki." },
  { name:"Kladruber",            flag:"🇨🇿", country:"Czechy",          type:"Barokowy",       bloodline:"warmblood", rarity:"rare",      base:{speed:27,strength:31,stamina:31,luck:16}, desc:"Cesarski koń dworski, hodowany od 1579 r." },
  { name:"Alter Real",           flag:"🇵🇹", country:"Portugalia",      type:"Barokowy",       bloodline:"hotblood",  rarity:"rare",      base:{speed:31,strength:28,stamina:29,luck:14}, desc:"Portugalski koń królewskiej stajni." },
  { name:"Paso Fino",            flag:"🇨🇴", country:"Kolumbia",        type:"Chód",           bloodline:"gaited",    rarity:"rare",      base:{speed:29,strength:23,stamina:32,luck:13}, desc:"Drobny chód paso fino — niezwykle płynny." },
  { name:"Peruvian Paso",        flag:"🇵🇪", country:"Peru",            type:"Chód",           bloodline:"gaited",    rarity:"rare",      base:{speed:29,strength:24,stamina:33,luck:14}, desc:"Peruwiański chód z termino — ruch przednich nóg." },
  { name:"Criollo",              flag:"🇦🇷", country:"Argentyna",       type:"Kowbojski",      bloodline:"hotblood",  rarity:"uncommon",  base:{speed:24,strength:21,stamina:30,luck:7}, desc:"Koń Gaucho — legendarna wytrzymałość w Pampasach." },
  { name:"Azteca",               flag:"🇲🇽", country:"Meksyk",          type:"Jeździecki",     bloodline:"hotblood",  rarity:"uncommon",  base:{speed:24,strength:22,stamina:24,luck:8}, desc:"Meksykański krzyż Andaluz × Quarter Horse." },
  { name:"Mangalarga Marchador", flag:"🇧🇷", country:"Brazylia",        type:"Chód",           bloodline:"gaited",    rarity:"rare",      base:{speed:30,strength:25,stamina:34,luck:13}, desc:"Brazylijska rasa narodowa z płynnym marcha." },
  { name:"Campolina",            flag:"🇧🇷", country:"Brazylia",        type:"Chód",           bloodline:"gaited",    rarity:"uncommon",  base:{speed:22,strength:20,stamina:26,luck:9}, desc:"Duży brazylijski koń chodzący." },

  // ── CIEPŁOKRWISTE SPORTOWE ──────────────────────────────
  { name:"Hanowerski",           flag:"🇩🇪", country:"Niemcy",          type:"Sportowy",       bloodline:"warmblood", rarity:"uncommon",  base:{speed:25,strength:24,stamina:24,luck:6}, desc:"Najpopularniejszy warmblood do skoków i ujeżdżenia." },
  { name:"Holsztynski",          flag:"🇩🇪", country:"Niemcy",          type:"Skokowy",        bloodline:"warmblood", rarity:"uncommon",  base:{speed:24,strength:24,stamina:24,luck:6}, desc:"Specjalista od skoków, solidna budowa." },
  { name:"Oldenburski",          flag:"🇩🇪", country:"Niemcy",          type:"Ujeżdżeniowy",   bloodline:"warmblood", rarity:"rare",      base:{speed:31,strength:32,stamina:31,luck:9}, desc:"Elegancki warmblood do ujeżdżenia." },
  { name:"Trakehner",            flag:"🇩🇪", country:"Niemcy",          type:"Sportowy",       bloodline:"warmblood", rarity:"rare",      base:{speed:33,strength:30,stamina:31,luck:10}, desc:"Najbardziej gorącokrwisty warmblood — pruscy wojskowi." },
  { name:"Westfalski",           flag:"🇩🇪", country:"Niemcy",          type:"Sportowy",       bloodline:"warmblood", rarity:"uncommon",  base:{speed:24,strength:24,stamina:24,luck:6}, desc:"Wszechstronny warmblood do sportu olimpijskiego." },
  { name:"KWPN (Holenderski)",   flag:"🇳🇱", country:"Holandia",        type:"Skokowy",        bloodline:"warmblood", rarity:"rare",      base:{speed:32,strength:31,stamina:31,luck:10}, desc:"Holenderski warmblood — skoki i ujeżdżenie." },
  { name:"Belgijski Warmblood",  flag:"🇧🇪", country:"Belgia",          type:"Skokowy",        bloodline:"warmblood", rarity:"uncommon",  base:{speed:24,strength:24,stamina:24,luck:6}, desc:"BWP — regularny laureat Grand Prix skoków." },
  { name:"Selle Français",       flag:"🇫🇷", country:"Francja",         type:"Skokowy",        bloodline:"warmblood", rarity:"uncommon",  base:{speed:26,strength:23,stamina:24,luck:7}, desc:"Francuski koń sportowy z krwią arabską." },
  { name:"Irish Sport Horse",    flag:"🇮🇪", country:"Irlandia",        type:"Wszechstronny",  bloodline:"warmblood", rarity:"uncommon",  base:{speed:25,strength:24,stamina:25,luck:7}, desc:"Irlandzki krzyż Thoroughbred × Cob — cross-country." },
  { name:"Szwedzki Warmblood",   flag:"🇸🇪", country:"Szwecja",         type:"Ujeżdżeniowy",   bloodline:"warmblood", rarity:"uncommon",  base:{speed:24,strength:23,stamina:24,luck:6}, desc:"Szwedzki koń olimpijski, elegancki ruch." },
  { name:"Duński Warmblood",     flag:"🇩🇰", country:"Dania",           type:"Sportowy",       bloodline:"warmblood", rarity:"uncommon",  base:{speed:24,strength:24,stamina:24,luck:6}, desc:"Duński warmblood do ujeżdżenia i skoków." },
  { name:"Mecklenburski",        flag:"🇩🇪", country:"Niemcy",          type:"Sportowy",       bloodline:"warmblood", rarity:"common",    base:{speed:20,strength:20,stamina:20,luck:4}, desc:"Wschodnioberliński warmblood." },
  { name:"Anglo-Arab",           flag:"🇫🇷", country:"Francja",         type:"Sportowy",       bloodline:"hotblood",  rarity:"rare",      base:{speed:36,strength:25,stamina:32,luck:14}, desc:"Thoroughbred × Arab — szybkość i wytrzymałość." },

  // ── CIĘŻKIE / DRAFT ─────────────────────────────────────
  { name:"Shire",                flag:"🇬🇧", country:"Wielka Brytania", type:"Pociągowy",      bloodline:"coldblood", rarity:"rare",      base:{speed:13,strength:44,stamina:34,luck:4}, desc:"Największy koń świata — do 220 cm w kłębie." },
  { name:"Clydesdale",           flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", country:"Szkocja",          type:"Pociągowy",      bloodline:"coldblood", rarity:"uncommon",  base:{speed:10,strength:33,stamina:25,luck:4}, desc:"Szkocki olbrzym z pióropuszami na nogach." },
  { name:"Percheron",            flag:"🇫🇷", country:"Francja",         type:"Pociągowy",      bloodline:"coldblood", rarity:"uncommon",  base:{speed:12,strength:33,stamina:27,luck:4}, desc:"Elegancki ciężki koń z krwią arabską." },
  { name:"Belgian Draft",        flag:"🇧🇪", country:"Belgia",          type:"Pociągowy",      bloodline:"coldblood", rarity:"uncommon",  base:{speed:28,strength:99,stamina:74,luck:8 }, desc:"Najpotężniejsza rasa pociągowa świata." },
  { name:"Suffolk Punch",        flag:"🇬🇧", country:"Wielka Brytania", type:"Pociągowy",      bloodline:"coldblood", rarity:"rare",      base:{speed:10,strength:34,stamina:27,luck:4}, desc:"Zawsze kasztanowy — zagrożony wymarciem." },
  { name:"Boulonnais",           flag:"🇫🇷", country:"Francja",         type:"Pociągowy",      bloodline:"coldblood", rarity:"rare",      base:{speed:15,strength:41,stamina:34,luck:6}, desc:"'Biały marmur Francji' — najszlachetniejszy draft." },
  { name:"Ardeny",               flag:"🇧🇪", country:"Belgia/Francja",  type:"Pociągowy",      bloodline:"coldblood", rarity:"common",    base:{speed:28,strength:94,stamina:80,luck:8 }, desc:"Jedna z najstarszych ras roboczych Europy." },
  { name:"Noriker",              flag:"🇦🇹", country:"Austria",         type:"Pociągowy",      bloodline:"coldblood", rarity:"uncommon",  base:{speed:10,strength:26,stamina:23,luck:4}, desc:"Alpejski koń roboczy, cętkowana sierść." },
  { name:"Haflinger",            flag:"🇦🇹", country:"Austria",         type:"Górski",         bloodline:"coldblood", rarity:"common",    base:{speed:13,strength:22,stamina:25,luck:5}, desc:"Złocisty konik alpejski z białą grzywą." },
  { name:"Breton",               flag:"🇫🇷", country:"Francja",         type:"Pociągowy",      bloodline:"coldblood", rarity:"uncommon",  base:{speed:13,strength:31,stamina:27,luck:4}, desc:"Bretoński koń o krępej budowie, 3 podtypy." },
  { name:"Comtois",              flag:"🇫🇷", country:"Francja",         type:"Pociągowy",      bloodline:"coldblood", rarity:"common",    base:{speed:10,strength:26,stamina:23,luck:3}, desc:"Koń z Jura i Alzacji, naturalnie złocisty." },
  { name:"Auxois",               flag:"🇫🇷", country:"Francja",         type:"Pociągowy",      bloodline:"coldblood", rarity:"uncommon",  base:{speed:10,strength:32,stamina:27,luck:4}, desc:"Rzadka burgundzka rasa pociągowa." },
  { name:"Soviet Heavy Draft",   flag:"🇷🇺", country:"Rosja",           type:"Pociągowy",      bloodline:"coldblood", rarity:"uncommon",  base:{speed:30,strength:96,stamina:74,luck:8 }, desc:"Radziecki koń roboczy, rekordowa siła uciągu." },
  { name:"Vladimir Heavy Draft", flag:"🇷🇺", country:"Rosja",           type:"Pociągowy",      bloodline:"coldblood", rarity:"uncommon",  base:{speed:32,strength:94,stamina:72,luck:8 }, desc:"Rosyjski ciężki draft z krwią Shire." },
  { name:"Jutlandzki",           flag:"🇩🇰", country:"Dania",           type:"Pociągowy",      bloodline:"coldblood", rarity:"uncommon",  base:{speed:10,strength:32,stamina:26,luck:4}, desc:"Duński koń pociągowy — kasztan z jasną grzywą." },
  { name:"Koń Zimnokrwisty PL",  flag:"🇵🇱", country:"Polska",          type:"Pociągowy",      bloodline:"coldblood", rarity:"common",    base:{speed:10,strength:26,stamina:23,luck:3}, desc:"Polski koń roboczy — niegdyś na każdej wsi." },
  { name:"Norddeutsches Kaltbl.", flag:"🇩🇪", country:"Niemcy",          type:"Pociągowy",      bloodline:"coldblood", rarity:"common",    base:{speed:30,strength:86,stamina:74,luck:8 }, desc:"Północnoniemiecki koń ciężki." },
  { name:"Italian Heavy Draft",  flag:"🇮🇹", country:"Włochy",          type:"Pociągowy",      bloodline:"coldblood", rarity:"uncommon",  base:{speed:10,strength:27,stamina:22,luck:3}, desc:"Włoski koń roboczy, bardzo muskularne zady." },

  // ── KONIE CHÓD (GAITED) ─────────────────────────────────
  { name:"Tennessee Walker",     flag:"🇺🇸", country:"USA",             type:"Chód",           bloodline:"gaited",    rarity:"uncommon",  base:{speed:22,strength:19,stamina:25,luck:8}, desc:"Running walk — płynny, bez odbicia." },
  { name:"Islandzki",            flag:"🇮🇸", country:"Islandia",        type:"Chód",           bloodline:"gaited",    rarity:"rare",      base:{speed:26,strength:25,stamina:40,luck:14}, desc:"Tölt i skeid — pięć chodów, odporny jak skała." },
  { name:"Missouri Fox Trotter", flag:"🇺🇸", country:"USA",             type:"Chód",           bloodline:"gaited",    rarity:"uncommon",  base:{speed:23,strength:20,stamina:26,luck:7}, desc:"Fox trot — chód ambalny z kiwaniem głową." },
  { name:"Rocky Mountain Horse", flag:"🇺🇸", country:"USA",             type:"Chód",           bloodline:"gaited",    rarity:"rare",      base:{speed:28,strength:25,stamina:35,luck:11}, desc:"Czekoladowo-srebrny, naturalny chód." },
  { name:"Racking Horse",        flag:"🇺🇸", country:"USA",             type:"Chód",           bloodline:"gaited",    rarity:"uncommon",  base:{speed:23,strength:18,stamina:25,luck:7}, desc:"Efektowny rack — szybki chód ambalny." },
  { name:"Nordlandshest",        flag:"🇳🇴", country:"Norwegia",        type:"Chód",           bloodline:"gaited",    rarity:"rare",      base:{speed:25,strength:24,stamina:37,luck:12}, desc:"Norweska rasa górska z naturalnym tölt." },

  // ── KUCE ────────────────────────────────────────────────
  { name:"Konik Polski",         flag:"🇵🇱", country:"Polska",          type:"Prymitywny",     bloodline:"coldblood", rarity:"common",    base:{speed:14,strength:16,stamina:22,luck:4}, desc:"Potomek tarpana — żywy zabytek Polski." },
  { name:"Huculski",             flag:"🇵🇱", country:"Polska/Ukraina",  type:"Górski",         bloodline:"coldblood", rarity:"common",    base:{speed:13,strength:17,stamina:24,luck:4}, desc:"Karpacki konik — niezastąpiony w górach." },
  { name:"Shetland",             flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", country:"Szkocja",          type:"Kucyk",          bloodline:"coldblood", rarity:"common",    base:{speed:12,strength:16,stamina:22,luck:5}, desc:"Najmniejszy i najsilniejszy względem wagi." },
  { name:"Welsh Mountain Pony",  flag:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", country:"Walia",            type:"Kucyk",          bloodline:"coldblood", rarity:"common",    base:{speed:16,strength:15,stamina:21,luck:5}, desc:"Welsh A — mały i zwinny pony górski." },
  { name:"Welsh Cob",            flag:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", country:"Walia",            type:"Kucyk",          bloodline:"warmblood", rarity:"uncommon",  base:{speed:21,strength:23,stamina:25,luck:6}, desc:"Welsh D — duży, energiczny, do zaprzęgu." },
  { name:"Connemara",            flag:"🇮🇪", country:"Irlandia",        type:"Skokowy",        bloodline:"warmblood", rarity:"uncommon",  base:{speed:20,strength:20,stamina:26,luck:7}, desc:"Irlandzki pony skalisto-atlantycki, świetne skoki." },
  { name:"New Forest Pony",      flag:"🇬🇧", country:"Wielka Brytania", type:"Kucyk",          bloodline:"coldblood", rarity:"common",    base:{speed:16,strength:16,stamina:21,luck:4}, desc:"Pony z lasów Hampshire, szybki i pokorny." },
  { name:"Dartmoor",             flag:"🇬🇧", country:"Wielka Brytania", type:"Kucyk",          bloodline:"coldblood", rarity:"uncommon",  base:{speed:18,strength:18,stamina:25,luck:6}, desc:"Pony z wrzosowisk Devon, zagrożony wymarciem." },
  { name:"Exmoor",               flag:"🇬🇧", country:"Wielka Brytania", type:"Prymitywny",     bloodline:"coldblood", rarity:"rare",      base:{speed:22,strength:23,stamina:35,luck:9}, desc:"Jedna z najstarszych ras — żywa skamieniałość." },
  { name:"Highland Pony",        flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", country:"Szkocja",          type:"Górski",         bloodline:"coldblood", rarity:"uncommon",  base:{speed:16,strength:21,stamina:28,luck:6}, desc:"Szkocki góral — silny, spokojny, odporny." },
  { name:"Fell Pony",            flag:"🇬🇧", country:"Wielka Brytania", type:"Kucyk",          bloodline:"coldblood", rarity:"uncommon",  base:{speed:18,strength:20,stamina:27,luck:6}, desc:"Czarny pony z Cumbrii, naturalny inochód." },
  { name:"Dales Pony",           flag:"🇬🇧", country:"Wielka Brytania", type:"Kucyk",          bloodline:"coldblood", rarity:"uncommon",  base:{speed:17,strength:22,stamina:27,luck:5}, desc:"Silny pony z Yorkshire, dobry do zaprzęgu." },
  { name:"Fjord",                flag:"🇳🇴", country:"Norwegia",        type:"Górski",         bloodline:"coldblood", rarity:"uncommon",  base:{speed:17,strength:23,stamina:29,luck:6}, desc:"Kremowy z ciemną grzywą — wiking wśród koni." },
  { name:"Haflinger (kucyk)",    flag:"🇦🇹", country:"Austria",         type:"Górski",         bloodline:"coldblood", rarity:"common",    base:{speed:13,strength:20,stamina:24,luck:4}, desc:"Złocisty alpejczyk, używany też jako kucyk." },
  { name:"Camargue",             flag:"🇫🇷", country:"Francja",         type:"Prymitywny",     bloodline:"coldblood", rarity:"rare",      base:{speed:25,strength:25,stamina:37,luck:12}, desc:"Białe konie deltaiczne — symbol Prowansji." },
  { name:"Islandzki (mały)",     flag:"🇮🇸", country:"Islandia",        type:"Chód",           bloodline:"gaited",    rarity:"rare",      base:{speed:25,strength:23,stamina:40,luck:13}, desc:"Mniejsza forma konia islandzkiego." },
  { name:"Gotlandzki",           flag:"🇸🇪", country:"Szwecja",         type:"Prymitywny",     bloodline:"coldblood", rarity:"rare",      base:{speed:22,strength:22,stamina:34,luck:9}, desc:"Najstarszy skandynawski pony, dziki na Gotlandii." },
  { name:"Žemaitukas",           flag:"🇱🇹", country:"Litwa",           type:"Prymitywny",     bloodline:"coldblood", rarity:"uncommon",  base:{speed:17,strength:19,stamina:27,luck:6}, desc:"Bałtycki konik — żmudzki, odporny i skromny." },
  { name:"Konik Biłgorajski",    flag:"🇵🇱", country:"Polska",          type:"Prymitywny",     bloodline:"coldblood", rarity:"rare",      base:{speed:20,strength:22,stamina:36,luck:10}, desc:"Ostatnia refugium mysi tarpana w Polsce." },
  { name:"Falabella",            flag:"🇦🇷", country:"Argentyna",       type:"Miniatura",      bloodline:"hotblood",  rarity:"rare",      base:{speed:16,strength:11,stamina:20,luck:18}, desc:"Najmniejszy koń świata — maks. 8 HH." },
  { name:"Caspian",              flag:"🇮🇷", country:"Iran",            type:"Miniatura",      bloodline:"oriental",  rarity:"epic",      base:{speed:60,strength:54,stamina:59,luck:56}, desc:"Miniatura arabskiego — żywa skamieniałość z Iranu." },
  { name:"Chincoteague",         flag:"🇺🇸", country:"USA",             type:"Prymitywny",     bloodline:"hotblood",  rarity:"uncommon",  base:{speed:19,strength:18,stamina:27,luck:8}, desc:"Dzikie pony z wyspy Assateague." },

  // ── SPECJALNE / MITYCZNE ────────────────────────────────
  { name:"Tarpan (rekonstrukcja)",flag:"🇵🇱",country:"Polska/Europa",   type:"Prymitywny",     bloodline:"coldblood", rarity:"legendary", base:{speed:89,strength:87,stamina:97,luck:85}, desc:"Rekonstrukcja wymarłego dzikiego konia Europy." },
  { name:"Przewalski",           flag:"🇲🇳", country:"Mongolia",        type:"Dziki",          bloodline:"coldblood", rarity:"legendary", base:{speed:90,strength:89,stamina:98,luck:86}, desc:"Jedyny prawdziwy dziki koń na świecie." },
  { name:"Destrier",             flag:"🏰",  country:"Średniowiecze",   type:"Bojowy",         bloodline:"coldblood", rarity:"mythic",    base:{speed:95,strength:104,stamina:100,luck:88}, desc:"Wymarły koń bojowy rycerzy — ogromny i waleczny." },
  { name:"Sleipnir",             flag:"🇳🇴", country:"Mitologia nordyc.",type:"Mityczny",       bloodline:"oriental",  rarity:"mythic",    base:{speed:105,strength:100,stamina:105,luck:105}, desc:"Ośmionogi rumak Odyna — szybszy niż wiatr." },
  { name:"Pegaz",                flag:"🇬🇷", country:"Mitologia grecka",type:"Mityczny",       bloodline:"oriental",  rarity:"mythic",    base:{speed:105,strength:98,stamina:104,luck:102}, desc:"Skrzydlaty koń Bellerofonta — symbol poezji." },
  { name:"Bucephalus",           flag:"🇬🇷", country:"Macedonia",       type:"Bojowy",         bloodline:"hotblood",  rarity:"mythic",    base:{speed:103,strength:101,stamina:102,luck:99}, desc:"Legendarny rumak Aleksandra Wielkiego." },
  { name:"Arion",                flag:"🇬🇷", country:"Mitologia grecka",type:"Mityczny",       bloodline:"oriental",  rarity:"mythic",    base:{speed:104,strength:99,stamina:103,luck:104}, desc:"Boski koń Posejdona — nieśmiertelny i niepokonany." },
  { name:"Akhal-Teke Altyn",     flag:"🇹🇲", country:"Turkmenistan",    type:"Wyścigowy",      bloodline:"oriental",  rarity:"mythic",    base:{speed:104,strength:94,stamina:101,luck:100}, desc:"Legendarny złoty Akhal-Teke — 'Koń z Niebios'." },
  { name:"Turkoman Imperialny",  flag:"🇮🇷", country:"Persja",          type:"Bojowy",         bloodline:"oriental",  rarity:"mythic",    base:{speed:104,strength:97,stamina:102,luck:101}, desc:"Perski koń szachów — wymarły i legendarny." },

];

// Zbuduj HORSE_DATABASE ze BREEDS (kompatybilność wsteczna)
const HORSE_DATABASE = {};
BREEDS.forEach(b => {
  if (!HORSE_DATABASE[b.rarity]) {
    HORSE_DATABASE[b.rarity] = {
      name:    RARITY_LABELS[b.rarity],
      rarity:  b.rarity,
      baseStats: { speed:50, strength:50, stamina:50, luck:15 },
      breeds:  []
    };
  }
  HORSE_DATABASE[b.rarity].breeds.push(b.name);
});

const LOCATIONS = [
  { name:"Las",      icon:"🌲", desc:"Spokojny teren, dobre dla młodych koni", reward:"common"   },
  { name:"Pustynia", icon:"🏜️", desc:"Gorąco i piasek — wymagające warunki",  reward:"rare"     },
  { name:"Góry",     icon:"⛰️", desc:"Strome zbocza, silne konie tylko",      reward:"epic"     },
  { name:"Tundra",   icon:"❄️", desc:"Mróz i śnieg — tylko dla wytrwałych",   reward:"legendary"},
];

const ITEMS_DATABASE = {
  // Jedzenie
  "Jabłko":                { icon:"🍎", desc:"Nakarm konia — uzupełnia 50% głodu",  rarity:"common",   isFood:true },
  "Słoma":                 { icon:"🌾", desc:"Nakarm konia — uzupełnia 25% głodu",  rarity:"common",   isFood:true },
  // Specjalne
  "Eliksir Odmłodzenia":   { icon:"🧪", desc:"Odmładza konia o 30–120 dni",         rarity:"rare"     },
  "Skrzynka z Łupem":      { icon:"📦", desc:"Zawiera losowy przedmiot",             rarity:"rare"     },
  // Eliksiry (stałe +5)
  "Eliksir Szybkości":     { icon:"⚡", desc:"+5 do szybkości konia (jednorazowy)", rarity:"uncommon", isElixir:true, stat:"speed"    },
  "Eliksir Siły":          { icon:"💪", desc:"+5 do siły konia (jednorazowy)",       rarity:"uncommon", isElixir:true, stat:"strength" },
  "Eliksir Wytrzymałości": { icon:"❤️", desc:"+5 do wytrzymałości konia (jednorazowy)", rarity:"uncommon", isElixir:true, stat:"stamina" },
  "Eliksir Szczęścia":     { icon:"🍀", desc:"+5 do szczęścia konia (jednorazowy)", rarity:"uncommon", isElixir:true, stat:"luck"     },
  // Przedmioty do slotów — generowane z losowym bonusem 0-10
  "Piorun":                { icon:"⚡️", desc:"Slot: +0–10 do szybkości",            rarity:"uncommon", isSlotItem:true, stat:"speed"    },
  "Kowadło":               { icon:"🔨", desc:"Slot: +0–10 do siły",                  rarity:"uncommon", isSlotItem:true, stat:"strength" },
  "Koniczyna":             { icon:"🍀", desc:"Slot: +0–10 do szczęścia",             rarity:"uncommon", isSlotItem:true, stat:"luck"     },
  "Serce":                 { icon:"❤️‍🔥", desc:"Slot: +0–10 do wytrzymałości",       rarity:"uncommon", isSlotItem:true, stat:"stamina"  },
};

// Generuje przedmiot do slotu z losowym bonusem 0-10
// Stat przypisany przy generowaniu — nie zmienia się nigdy
function generateSlotItem(name) {
  let bonus = Math.floor(Math.random() * 11); // 0-10
  let stat  = (ITEMS_DATABASE[name] || {}).stat || null; // przypisz stat z bazy
  return { name, bonus, stat, obtained: Date.now() };
}

const SHOP_ITEMS = [
  { name:"Słoma",               price:30,  icon:"🌾",  desc:"Nakarm konia — 25% głodu",                     alwaysAvailable:true },
  { name:"Jabłko",              price:60,  icon:"🍎",  desc:"Nakarm konia — 50% głodu",                     alwaysAvailable:true },
  { name:"Eliksir Szybkości",   price:150, icon:"⚡",  desc:"+5 szybkości konia (jednorazowy)",             alwaysAvailable:true },
  { name:"Eliksir Siły",        price:150, icon:"💪",  desc:"+5 siły konia (jednorazowy)",                  alwaysAvailable:true },
  { name:"Eliksir Wytrzymałości",price:150,icon:"❤️",  desc:"+5 wytrzymałości konia (jednorazowy)",         alwaysAvailable:true },
  { name:"Eliksir Szczęścia",   price:150, icon:"🍀",  desc:"+5 szczęścia konia (jednorazowy)",             alwaysAvailable:true },
  { name:"Piorun",              price:220, icon:"⚡️", desc:"Slot: +0–10 szybkości (losowy bonus)",         alwaysAvailable:true, isSlotShop:true },
  { name:"Kowadło",             price:220, icon:"🔨",  desc:"Slot: +0–10 siły (losowy bonus)",              alwaysAvailable:true, isSlotShop:true },
  { name:"Koniczyna",           price:220, icon:"🍀",  desc:"Slot: +0–10 szczęścia (losowy bonus)",         alwaysAvailable:true, isSlotShop:true },
  { name:"Serce",               price:220, icon:"❤️‍🔥", desc:"Slot: +0–10 wytrzymałości (losowy bonus)",   alwaysAvailable:true, isSlotShop:true },
  { name:"Eliksir Odmłodzenia", price:800, icon:"🧪",  desc:"Odmładza konia — globalny limit 5 szt.",       rare:true, globalLimit:5 },
];

const QUEST_TEMPLATES = [
  { id:"feed3",       desc:"Nakarm 3 konie",             goal:3, reward:150, type:"feed"       },
  { id:"feed5",       desc:"Nakarm 5 koni",              goal:5, reward:250, type:"feed"       },
  { id:"expedition2", desc:"Wyślij 2 wyprawy",           goal:2, reward:200, type:"expedition" },
  { id:"expedition4", desc:"Wyślij 4 wyprawy",           goal:4, reward:400, type:"expedition" },
  { id:"breed1",      desc:"Rozmnóż konie 1 raz",        goal:1, reward:500, type:"breed"      },
  { id:"buy1",        desc:"Kup 1 przedmiot w sklepie",  goal:1, reward:120, type:"buy"        },
  { id:"market1",     desc:"Wystaw coś na rynku",        goal:1, reward:180, type:"market"     },
  { id:"lootbox1",    desc:"Otwórz 1 Skrzynkę z Łupem", goal:1, reward:200, type:"lootbox"    },
];
