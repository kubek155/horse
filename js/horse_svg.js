// =====================
// SYSTEM SVG KONI
// =====================
// Każda rasa ma: coat (kolor sierści), mane (grzywa), build (sylwetka), extras (dodatki)
// Build: "light" | "heavy" | "pony" | "baroque" | "gaited" | "mythic"

const BREED_VISUALS = {
  // ── POSPOLITE / KUCE ─────────────────────────────────────────────
  "Konik Polski":          { coat:"#8B6914", mane:"#4a2e00", build:"pony",    extras:[] },
  "Huculski":              { coat:"#6B4423", mane:"#3a1800", build:"pony",    extras:[] },
  "Śląski":                { coat:"#4a3520", mane:"#1a0800", build:"light",   extras:[] },
  "Małopolski":            { coat:"#C8A882", mane:"#8B6040", build:"light",   extras:[] },
  "Wielkopolski":          { coat:"#8B0000", mane:"#3a0000", build:"light",   extras:[] },
  "Shetland":              { coat:"#2a1a00", mane:"#1a0800", build:"pony",    extras:["fluffy"] },
  "Welsh Mountain Pony":   { coat:"#C8A882", mane:"#6B4423", build:"pony",    extras:[] },
  "Welsh Cob":             { coat:"#4a3520", mane:"#1a0800", build:"pony",    extras:["feathers"] },
  "Connemara":             { coat:"#9e9e9e", mane:"#5a5a5a", build:"pony",    extras:[] },
  "New Forest Pony":       { coat:"#8B6914", mane:"#4a3000", build:"pony",    extras:[] },
  "Dartmoor":              { coat:"#2a1a00", mane:"#1a0800", build:"pony",    extras:[] },
  "Exmoor":                { coat:"#6B4423", mane:"#3a2000", build:"pony",    extras:["primitive_stripe"] },
  "Highland Pony":         { coat:"#9e9e9e", mane:"#4a4a4a", build:"pony",    extras:["feathers"] },
  "Fell Pony":             { coat:"#1a1a1a", mane:"#000000", build:"pony",    extras:[] },
  "Dales Pony":            { coat:"#1a1a1a", mane:"#000000", build:"pony",    extras:["feathers"] },
  "Fjord":                 { coat:"#d4b870", mane:"#2a2000", build:"pony",    extras:["primitive_stripe","dun_stripe"] },
  "Haflinger (kucyk)":     { coat:"#C9A84C", mane:"#f0e0a0", build:"pony",    extras:[] },
  "Haflinger":             { coat:"#C9A84C", mane:"#f0e0a0", build:"pony",    extras:[] },
  "Camargue":              { coat:"#e0e0e0", mane:"#c0c0c0", build:"light",   extras:[] },
  "Islandzki (mały)":      { coat:"#8B6914", mane:"#4a2e00", build:"pony",    extras:[] },
  "Gotlandzki":            { coat:"#8B6914", mane:"#4a2e00", build:"pony",    extras:["primitive_stripe"] },
  "Žemaitukas":            { coat:"#7B8B6F", mane:"#3a4a30", build:"pony",    extras:["primitive_stripe"] },
  "Konik Biłgorajski":     { coat:"#7B8B6F", mane:"#2a3020", build:"pony",    extras:["primitive_stripe","dun_stripe"] },
  "Falabella":             { coat:"#6B4423", mane:"#3a2000", build:"pony",    extras:[] },
  "Caspian":               { coat:"#C8A882", mane:"#8B6040", build:"pony",    extras:[] },
  "Chincoteague":          { coat:"#8B6914", mane:"#4a2e00", build:"pony",    extras:["paint_spots"] },
  // ── GORĄCOKRWISTE ────────────────────────────────────────────────
  "Pinto":                 { coat:"#C8A882", mane:"#8B6040", build:"light",   extras:["paint_spots"] },
  "Palomino":              { coat:"#C9A84C", mane:"#f0e0a0", build:"light",   extras:[] },
  "Quarter Horse":         { coat:"#8B0000", mane:"#3a0000", build:"light",   extras:[] },
  "Paint Horse":           { coat:"#C8A882", mane:"#6B4423", build:"light",   extras:["paint_spots"] },
  "Appaloosa":             { coat:"#e0d0c0", mane:"#8B6040", build:"light",   extras:["spots"] },
  "Mustang":               { coat:"#8B6914", mane:"#4a2e00", build:"light",   extras:[] },
  "Morgan":                { coat:"#4a3520", mane:"#1a0800", build:"light",   extras:[] },
  "American Saddlebred":   { coat:"#6B4423", mane:"#3a1800", build:"gaited",  extras:[] },
  "Standardbred":          { coat:"#4a3520", mane:"#1a0800", build:"light",   extras:[] },
  "Criollo":               { coat:"#8B6914", mane:"#4a2e00", build:"light",   extras:[] },
  "Azteca":                { coat:"#C8A882", mane:"#8B6040", build:"light",   extras:[] },
  "Tennessee Walker":      { coat:"#2a1a00", mane:"#1a0800", build:"gaited",  extras:[] },
  "Missouri Fox Trotter":  { coat:"#8B6914", mane:"#4a2e00", build:"gaited",  extras:[] },
  "Rocky Mountain Horse":  { coat:"#3a2010", mane:"#c0c0c0", build:"gaited",  extras:[] },
  "Racking Horse":         { coat:"#6B4423", mane:"#3a1800", build:"gaited",  extras:[] },
  "Nordlandshest":         { coat:"#8B6914", mane:"#4a2e00", build:"gaited",  extras:["primitive_stripe"] },
  // ── ORIENTALNE ───────────────────────────────────────────────────
  "Arabski":               { coat:"#C8A882", mane:"#8B6040", build:"arab",    extras:[] },
  "Akhal-Teke":            { coat:"#C9A84C", mane:"#8a6010", build:"arab",    extras:["metallic"] },
  "Shagya Arabian":        { coat:"#e0e0e0", mane:"#9a9a9a", build:"arab",    extras:[] },
  "Barb":                  { coat:"#9e9e9e", mane:"#5a5a5a", build:"arab",    extras:[] },
  "Tersk":                 { coat:"#d0d0d0", mane:"#8a8a8a", build:"arab",    extras:[] },
  "Karabakh":              { coat:"#C9A84C", mane:"#8a6010", build:"arab",    extras:["metallic"] },
  "Budyonny":              { coat:"#8B0000", mane:"#3a0000", build:"light",   extras:[] },
  "Don":                   { coat:"#C9A84C", mane:"#8a6010", build:"light",   extras:[] },
  "Iomud":                 { coat:"#C8A882", mane:"#8B6040", build:"arab",    extras:[] },
  "Turkoman":              { coat:"#8B6914", mane:"#4a2e00", build:"arab",    extras:[] },
  "Marwari":               { coat:"#C8A882", mane:"#8B6040", build:"gaited",  extras:["curved_ears"] },
  "Kathiawari":            { coat:"#8B6914", mane:"#4a2e00", build:"gaited",  extras:["curved_ears"] },
  // ── IBERYJSKIE / BAROKOWE ────────────────────────────────────────
  "Andaluzyjski (PRE)":    { coat:"#e0e0e0", mane:"#b0b0b0", build:"baroque", extras:["lush_mane"] },
  "Lusitano":              { coat:"#d0c8b0", mane:"#8a8070", build:"baroque", extras:["lush_mane"] },
  "Lipicański":            { coat:"#e8e8e8", mane:"#c0c0c0", build:"baroque", extras:["lush_mane"] },
  "Friesian":              { coat:"#1a1a1a", mane:"#000000", build:"baroque", extras:["feathers","lush_mane"] },
  "Kladruber":             { coat:"#e0e0e0", mane:"#b0b0b0", build:"baroque", extras:["lush_mane"] },
  "Alter Real":            { coat:"#4a3520", mane:"#1a0800", build:"baroque", extras:[] },
  "Paso Fino":             { coat:"#8B6914", mane:"#4a2e00", build:"gaited",  extras:[] },
  "Peruvian Paso":         { coat:"#6B4423", mane:"#3a1800", build:"gaited",  extras:[] },
  "Mangalarga Marchador":  { coat:"#8B0000", mane:"#3a0000", build:"gaited",  extras:[] },
  "Campolina":             { coat:"#9e9e9e", mane:"#5a5a5a", build:"gaited",  extras:[] },
  // ── WARMBLOOD ────────────────────────────────────────────────────
  "Hanowerski":            { coat:"#8B0000", mane:"#3a0000", build:"sport",   extras:[] },
  "Holsztynski":           { coat:"#4a3520", mane:"#1a0800", build:"sport",   extras:[] },
  "Oldenburski":           { coat:"#2a1a00", mane:"#1a0800", build:"sport",   extras:[] },
  "Trakehner":             { coat:"#4a3520", mane:"#1a0800", build:"sport",   extras:[] },
  "Westfalski":            { coat:"#8B0000", mane:"#3a0000", build:"sport",   extras:[] },
  "KWPN (Holenderski)":    { coat:"#4a3520", mane:"#1a0800", build:"sport",   extras:[] },
  "Belgijski Warmblood":   { coat:"#8B6914", mane:"#4a2e00", build:"sport",   extras:[] },
  "Selle Français":        { coat:"#8B0000", mane:"#3a0000", build:"sport",   extras:[] },
  "Irish Sport Horse":     { coat:"#6B4423", mane:"#3a1800", build:"sport",   extras:[] },
  "Szwedzki Warmblood":    { coat:"#C8A882", mane:"#8B6040", build:"sport",   extras:[] },
  "Duński Warmblood":      { coat:"#4a3520", mane:"#1a0800", build:"sport",   extras:[] },
  "Mecklenburski":         { coat:"#8B6914", mane:"#4a2e00", build:"sport",   extras:[] },
  "Anglo-Arab":            { coat:"#8B0000", mane:"#3a0000", build:"arab",    extras:[] },
  // ── PEŁNA KREW / WYŚCIGOWE ───────────────────────────────────────
  "Pełna Krew Angielska":  { coat:"#2a1a00", mane:"#1a0800", build:"racer",   extras:[] },
  // ── CIĘŻKIE / DRAFT ──────────────────────────────────────────────
  "Shire":                 { coat:"#2a2a4a", mane:"#10103a", build:"heavy",   extras:["feathers","massive"] },
  "Clydesdale":            { coat:"#4a3520", mane:"#1a0800", build:"heavy",   extras:["feathers","massive"] },
  "Percheron":             { coat:"#9e9e9e", mane:"#5a5a5a", build:"heavy",   extras:["massive"] },
  "Belgian Draft":         { coat:"#C8A882", mane:"#8B6040", build:"heavy",   extras:["massive"] },
  "Suffolk Punch":         { coat:"#8B4513", mane:"#5a2a00", build:"heavy",   extras:["round","massive"] },
  "Boulonnais":            { coat:"#e0e0e0", mane:"#b0b0b0", build:"heavy",   extras:["massive"] },
  "Ardeny":                { coat:"#8B4513", mane:"#5a2a00", build:"heavy",   extras:["massive"] },
  "Noriker":               { coat:"#3a2510", mane:"#1a0800", build:"heavy",   extras:["spots","massive"] },
  "Breton":                { coat:"#C8A882", mane:"#8B6040", build:"heavy",   extras:["massive"] },
  "Comtois":               { coat:"#C9A84C", mane:"#8a6010", build:"heavy",   extras:["massive"] },
  "Auxois":                { coat:"#8B4513", mane:"#5a2a00", build:"heavy",   extras:["massive"] },
  "Soviet Heavy Draft":    { coat:"#8B6914", mane:"#4a2e00", build:"heavy",   extras:["massive"] },
  "Vladimir Heavy Draft":  { coat:"#4a3520", mane:"#1a0800", build:"heavy",   extras:["feathers","massive"] },
  "Jutlandzki":            { coat:"#8B4513", mane:"#f0e0a0", build:"heavy",   extras:["massive"] },
  "Koń Zimnokrwisty PL":  { coat:"#4a3520", mane:"#1a0800", build:"heavy",   extras:["massive"] },
  "Norddeutsches Kaltbl.": { coat:"#6B4423", mane:"#3a1800", build:"heavy",   extras:["massive"] },
  "Italian Heavy Draft":   { coat:"#8B4513", mane:"#5a2a00", build:"heavy",   extras:["massive"] },
  // ── MITYCZNE ─────────────────────────────────────────────────────
  "Tarpan (rekonstrukcja)":{ coat:"#7B8B6F", mane:"#2a3020", build:"light",   extras:["primitive_stripe","dun_stripe"] },
  "Przewalski":            { coat:"#8B6914", mane:"#2a1a00", build:"pony",    extras:["primitive_stripe","dun_stripe"] },
  "Destrier":              { coat:"#2a2a2a", mane:"#000000", build:"heavy",   extras:["massive","armor"] },
  "Sleipnir":              { coat:"#2a1535", mane:"#c94a6a", build:"mythic",  extras:["eight_legs","aura","glowing_eye"] },
  "Pegaz":                 { coat:"#e8e8e8", mane:"#c0c0c0", build:"mythic",  extras:["wings","aura"] },
  "Bucephalus":            { coat:"#2a1a00", mane:"#1a0800", build:"racer",   extras:["star_marking"] },
  "Arion":                 { coat:"#1a0825", mane:"#c94a6a", build:"mythic",  extras:["aura","glowing_eye"] },
  "Akhal-Teke Altyn":      { coat:"#FFD700", mane:"#c8a000", build:"arab",    extras:["metallic","golden_aura"] },
  "Turkoman Imperialny":   { coat:"#8B0000", mane:"#3a0000", build:"arab",    extras:["armor","aura"] },
};

// Fallback dla ras bez definicji
function getBreedVisual(name) {
  if (BREED_VISUALS[name]) return BREED_VISUALS[name];
  // Heurystyki z nazwy
  let coat = "#8B6914", mane = "#4a2e00", build = "light", extras = [];
  if (name.includes("Draft")||name.includes("Heavy")||name.includes("Clydes"))
    { build="heavy"; coat="#6B4423"; extras=["massive"]; }
  if (name.includes("Pony")||name.includes("Kucyk"))
    { build="pony"; }
  if (name.includes("Arab")||name.includes("Teke")||name.includes("Paso"))
    { build="arab"; coat="#C8A882"; }
  if (name.includes("Friesian")||name.includes("Andaluz")||name.includes("Lusitan"))
    { build="baroque"; coat="#1a1a1a"; extras=["lush_mane"]; }
  return { coat, mane, build, extras };
}

// =====================
// GENERATOR SVG
// =====================
function drawHorseSVG(horseName, rarity, stars) {
  let vis = getBreedVisual(horseName);
  let rc  = RARITY_COLORS[rarity] || "#8aab84";
  let W=160, H=130;

  // Parametry sylwetki
  const BUILDS = {
    pony:   { bw:28, bh:16, bx:0, by:12, neckLen:13, neckAngle:-20, headW:8,  headH:7,  legH:18, legW:5,  neckX:-17, neckY:-8  },
    light:  { bw:28, bh:14, bx:0, by:8,  neckLen:17, neckAngle:-22, headW:9,  headH:7.5,legH:26, legW:5,  neckX:-20, neckY:-12 },
    arab:   { bw:26, bh:13, bx:0, by:6,  neckLen:18, neckAngle:-25, headW:8,  headH:6.5,legH:28, legW:4,  neckX:-21, neckY:-13 },
    sport:  { bw:30, bh:15, bx:0, by:8,  neckLen:17, neckAngle:-20, headW:10, headH:8,  legH:26, legW:5.5,neckX:-20, neckY:-12 },
    racer:  { bw:27, bh:12, bx:0, by:5,  neckLen:19, neckAngle:-25, headW:8,  headH:6,  legH:30, legW:4,  neckX:-22, neckY:-14 },
    baroque:{ bw:30, bh:16, bx:0, by:8,  neckLen:20, neckAngle:-18, headW:10, headH:8,  legH:25, legW:5.5,neckX:-22, neckY:-14 },
    gaited: { bw:26, bh:13, bx:0, by:7,  neckLen:18, neckAngle:-22, headW:9,  headH:7,  legH:27, legW:4.5,neckX:-21, neckY:-12 },
    heavy:  { bw:36, bh:22, bx:0, by:14, neckLen:14, neckAngle:-15, headW:12, headH:10, legH:20, legW:8,  neckX:-20, neckY:-10 },
    mythic: { bw:27, bh:13, bx:0, by:6,  neckLen:18, neckAngle:-22, headW:9,  headH:7.5,legH:27, legW:4.5,neckX:-21, neckY:-13 },
  };
  let b = BUILDS[vis.build] || BUILDS.light;
  let c = vis.coat, m = vis.mane;
  let cx=80, cy=62; // centrum konia

  let parts = [];

  // Cień pod koniem
  parts.push(`<ellipse cx="${cx}" cy="${cy+b.by+b.legH+6}" rx="${b.bw+8}" ry="5" fill="rgba(0,0,0,0.2)"/>`);

  // Nogi tylne (za tułowiem)
  let legY = cy+b.by+b.bh-2;
  parts.push(`<rect x="${cx+5}"  y="${legY}" width="${b.legW}" height="${b.legH}" rx="${b.legW/2}" fill="${darken(c,20)}"/>`);
  parts.push(`<rect x="${cx+14}" y="${legY}" width="${b.legW}" height="${b.legH}" rx="${b.legW/2}" fill="${darken(c,20)}"/>`);
  // Kopyta tylne
  parts.push(`<rect x="${cx+5}"  y="${legY+b.legH-2}" width="${b.legW}" height="5" rx="2" fill="#1a0800"/>`);
  parts.push(`<rect x="${cx+14}" y="${legY+b.legH-2}" width="${b.legW}" height="5" rx="2" fill="#1a0800"/>`);

  // Tułów
  parts.push(`<ellipse cx="${cx}" cy="${cy+b.by}" rx="${b.bw}" ry="${b.bh}" fill="${c}"/>`);

  // Pióropusze (feathers) — na tylnych nogach
  if (vis.extras.includes("feathers")) {
    parts.push(`<ellipse cx="${cx+7}"  cy="${legY+b.legH+2}" rx="${b.legW+4}" ry="4" fill="${m}" opacity="0.8"/>`);
    parts.push(`<ellipse cx="${cx+16}" cy="${legY+b.legH+2}" rx="${b.legW+4}" ry="4" fill="${m}" opacity="0.8"/>`);
  }

  // Szyja
  let neckCX = cx + b.neckX, neckCY = cy + b.neckY;
  let rad = b.neckAngle * Math.PI/180;
  parts.push(`<ellipse cx="${neckCX}" cy="${neckCY}" rx="${b.legW+3}" ry="${b.neckLen}" fill="${c}" transform="rotate(${b.neckAngle},${neckCX},${neckCY})"/>`);

  // Głowa
  let hx = cx + b.neckX - 13, hy = cy + b.neckY - b.neckLen + 2;
  parts.push(`<ellipse cx="${hx}" cy="${hy}" rx="${b.headW}" ry="${b.headH}" fill="${c}"/>`);

  // Nos/nozdrze
  let noseX = hx - b.headW + 1, noseY = hy + 2;
  parts.push(`<ellipse cx="${noseX-2}" cy="${noseY}" rx="3" ry="2.5" fill="${darken(c,25)}"/>`);
  parts.push(`<ellipse cx="${noseX-4}" cy="${noseY+1}" rx="1.5" ry="1.2" fill="${darken(c,40)}"/>`);

  // Ucho
  if (vis.extras.includes("curved_ears")) {
    // Marwari — zagięte uszy
    parts.push(`<path d="M${hx+2},${hy-b.headH+1} C${hx+8},${hy-b.headH-8} ${hx+6},${hy-b.headH-4} ${hx+2},${hy-b.headH+2}" fill="${c}" stroke="${darken(c,15)}" stroke-width="1"/>`);
  } else {
    parts.push(`<ellipse cx="${hx+3}" cy="${hy-b.headH-2}" rx="2.5" ry="4.5" fill="${c}" transform="rotate(-10,${hx+3},${hy-b.headH-2})"/>`);
  }

  // Oko
  parts.push(`<circle cx="${hx+1}" cy="${hy-2}" r="${vis.extras.includes("glowing_eye")?3:2}" fill="${vis.extras.includes("glowing_eye")?"#c94a6a":"#1a0800"}"/>`);
  parts.push(`<circle cx="${hx+1.5}" cy="${hy-2.5}" r="0.8" fill="${vis.extras.includes("glowing_eye")?"#ffaacc":"#ffffff"}"/>`);

  // Nogi przednie
  parts.push(`<rect x="${cx-15}" y="${legY}" width="${b.legW}" height="${b.legH}" rx="${b.legW/2}" fill="${darken(c,15)}"/>`);
  parts.push(`<rect x="${cx-5}"  y="${legY}" width="${b.legW}" height="${b.legH}" rx="${b.legW/2}" fill="${darken(c,15)}"/>`);
  parts.push(`<rect x="${cx-15}" y="${legY+b.legH-2}" width="${b.legW}" height="5" rx="2" fill="#1a0800"/>`);
  parts.push(`<rect x="${cx-5}"  y="${legY+b.legH-2}" width="${b.legW}" height="5" rx="2" fill="#1a0800"/>`);

  // Pióropusze przednie
  if (vis.extras.includes("feathers")) {
    parts.push(`<ellipse cx="${cx-12}" cy="${legY+b.legH+2}" rx="${b.legW+4}" ry="4" fill="${m}" opacity="0.8"/>`);
    parts.push(`<ellipse cx="${cx-2}"  cy="${legY+b.legH+2}" rx="${b.legW+4}" ry="4" fill="${m}" opacity="0.8"/>`);
  }

  // Osiem nóg (Sleipnir)
  if (vis.extras.includes("eight_legs")) {
    parts.push(`<rect x="${cx-10}" y="${legY+4}" width="3.5" height="${b.legH-4}" rx="1.5" fill="${darken(c,10)}" opacity="0.6" transform="rotate(8,${cx-10},${legY+4})"/>`);
    parts.push(`<rect x="${cx+2}"  y="${legY+4}" width="3.5" height="${b.legH-4}" rx="1.5" fill="${darken(c,10)}" opacity="0.6" transform="rotate(-8,${cx+2},${legY+4})"/>`);
    parts.push(`<rect x="${cx+10}" y="${legY+4}" width="3.5" height="${b.legH-4}" rx="1.5" fill="${darken(c,10)}" opacity="0.6" transform="rotate(8,${cx+10},${legY+4})"/>`);
  }

  // Grzywa
  if (vis.extras.includes("lush_mane")) {
    parts.push(`<path d="M${neckCX-5},${neckCY+6} C${neckCX-16},${neckCY-2} ${neckCX-14},${neckCY-12} ${neckCX-8},${neckCY-16}" stroke="${m}" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.9"/>`);
    parts.push(`<path d="M${neckCX-4},${neckCY+6} C${neckCX-12},${neckCY} ${neckCX-10},${neckCY-10} ${neckCX-5},${neckCY-14}" stroke="${lighten(m,20)}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  } else {
    parts.push(`<path d="M${neckCX-3},${neckCY+5} C${neckCX-12},${neckCY-2} ${neckCX-10},${neckCY-10} ${neckCX-5},${neckCY-13}" stroke="${m}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  }

  // Ogon
  let tailX = cx+b.bw-4, tailY = cy+b.by-4;
  if (vis.build === "mythic" || vis.extras.includes("aura")) {
    parts.push(`<path d="M${tailX},${tailY} C${tailX+16},${tailY-6} ${tailX+20},${tailY+14} ${tailX+10},${tailY+26}" stroke="${m}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.9"/>`);
    parts.push(`<path d="M${tailX},${tailY} C${tailX+14},${tailY-4} ${tailX+18},${tailY+12} ${tailX+8},${tailY+24}" stroke="${lighten(m,40)}" stroke-width="2" fill="none" stroke-linecap="round"/>`);
  } else {
    parts.push(`<path d="M${tailX},${tailY} C${tailX+16},${tailY-6} ${tailX+18},${tailY+12} ${tailX+8},${tailY+24}" stroke="${m}" stroke-width="${vis.extras.includes("lush_mane")?6:4}" fill="none" stroke-linecap="round"/>`);
  }

  // ── EXTRAS ────────────────────────────────────────────────────────
  // Metaliczny połysk (Akhal-Teke)
  if (vis.extras.includes("metallic")) {
    parts.push(`<ellipse cx="${cx-4}" cy="${cy+b.by-4}" rx="${b.bw*0.4}" ry="${b.bh*0.5}" fill="#f0d080" opacity="0.25"/>`);
  }
  // Złota aura
  if (vis.extras.includes("golden_aura")) {
    parts.push(`<ellipse cx="${cx}" cy="${cy+b.by}" rx="${b.bw+10}" ry="${b.bh+10}" fill="none" stroke="#FFD700" stroke-width="1.5" opacity="0.5"/>`);
    parts.push(`<ellipse cx="${cx}" cy="${cy+b.by}" rx="${b.bw+18}" ry="${b.bh+18}" fill="none" stroke="#FFD700" stroke-width="0.8" opacity="0.25"/>`);
  }
  // Magiczna aura (mythic/pradawny)
  if (vis.extras.includes("aura")) {
    parts.push(`<ellipse cx="${cx}" cy="${cy+b.by}" rx="${b.bw+12}" ry="${b.bh+12}" fill="none" stroke="#c94a6a" stroke-width="1.2" opacity="0.45"/>`);
    parts.push(`<ellipse cx="${cx}" cy="${cy+b.by}" rx="${b.bw+22}" ry="${b.bh+22}" fill="none" stroke="#c94a6a" stroke-width="0.7" opacity="0.2"/>`);
  }
  // Skrzydła (Pegaz)
  if (vis.extras.includes("wings")) {
    parts.push(`<path d="M${cx+12},${cy+b.by-8} C${cx+35},${cy+b.by-30} ${cx+50},${cy+b.by-10} ${cx+30},${cy+b.by}" fill="#d0d0d0" opacity="0.8"/>`);
    parts.push(`<path d="M${cx+12},${cy+b.by-8} C${cx+35},${cy+b.by-28} ${cx+48},${cy+b.by-8} ${cx+30},${cy+b.by}" fill="none" stroke="#b0b0b0" stroke-width="1"/>`);
    parts.push(`<path d="M${cx-12},${cy+b.by-8} C${cx-35},${cy+b.by-30} ${cx-50},${cy+b.by-10} ${cx-30},${cy+b.by}" fill="#d0d0d0" opacity="0.8"/>`);
  }
  // Zbroja (Destrier, Turkoman Imperialny)
  if (vis.extras.includes("armor")) {
    parts.push(`<rect x="${cx-b.bw+4}" y="${cy+b.by-b.bh+2}" width="${b.bw*1.2}" height="${b.bh*0.7}" rx="3" fill="#888" opacity="0.4" stroke="#aaa" stroke-width="0.5"/>`);
    parts.push(`<ellipse cx="${hx}" cy="${hy}" rx="${b.headW+2}" ry="${b.headH+2}" fill="none" stroke="#888" stroke-width="1" opacity="0.6"/>`);
  }
  // Łaty Paint/Pinto
  if (vis.extras.includes("paint_spots")) {
    parts.push(`<ellipse cx="${cx-5}" cy="${cy+b.by-5}" rx="${b.bw*0.4}" ry="${b.bh*0.55}" fill="#ffffff" opacity="0.5"/>`);
    parts.push(`<ellipse cx="${cx+12}" cy="${cy+b.by+5}" rx="${b.bw*0.25}" ry="${b.bh*0.35}" fill="#ffffff" opacity="0.45"/>`);
  }
  // Cętki Appaloosa/Noriker
  if (vis.extras.includes("spots")) {
    for(let i=0;i<5;i++){
      let sx = cx + (Math.sin(i*1.3)*18), sy = cy+b.by + (Math.cos(i*2.1)*8);
      parts.push(`<circle cx="${sx}" cy="${sy}" r="${2+i%3}" fill="#6B4423" opacity="0.55"/>`);
    }
  }
  // Pasek prymitywny (grzbietowy)
  if (vis.extras.includes("primitive_stripe")) {
    parts.push(`<path d="M${cx-b.bw},${cy+b.by-b.bh+3} L${cx+b.bw},${cy+b.by-b.bh+3}" stroke="${darken(c,35)}" stroke-width="2" fill="none" opacity="0.7"/>`);
  }
  // Pasek dun (zebrowate paski na nogach)
  if (vis.extras.includes("dun_stripe")) {
    parts.push(`<line x1="${cx-14}" y1="${legY+8}" x2="${cx-8}" y2="${legY+8}" stroke="${darken(c,30)}" stroke-width="1" opacity="0.6"/>`);
    parts.push(`<line x1="${cx-14}" y1="${legY+14}" x2="${cx-8}" y2="${legY+14}" stroke="${darken(c,30)}" stroke-width="1" opacity="0.6"/>`);
  }
  // Białe oznaczenie (Bucephalus — gwiazda na czole)
  if (vis.extras.includes("star_marking")) {
    parts.push(`<circle cx="${hx+2}" cy="${hy-3}" r="3" fill="#ffffff" opacity="0.9"/>`);
  }
  // Gwiazdki rzadkości
  if (stars > 0) {
    for(let s=0;s<Math.min(stars,3);s++) {
      parts.push(`<circle cx="${cx-8+s*8}" cy="${cy+b.by-b.bh-14}" r="3" fill="${rc}" opacity="0.9"/>`);
    }
  }

  return `<svg width="160" height="130" viewBox="0 0 160 130" xmlns="http://www.w3.org/2000/svg">${parts.join("")}</svg>`;
}

// Pomocnicze — przyciemnianie / rozjaśnianie koloru hex
function darken(hex, pct) {
  let r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  if(isNaN(r)||isNaN(g)||isNaN(b)) return hex;
  r=Math.max(0,r-pct); g=Math.max(0,g-pct); b=Math.max(0,b-pct);
  return "#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");
}
function lighten(hex, pct) {
  let r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  if(isNaN(r)||isNaN(g)||isNaN(b)) return hex;
  r=Math.min(255,r+pct); g=Math.min(255,g+pct); b=Math.min(255,b+pct);
  return "#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("");
}

// =====================
// WRAPPER Z MUTACJĄ
// =====================
// Używa zmutowanego wyglądu (kolor/extra od donora) jeśli mutation istnieje
function drawHorseSVGMutated(breedName, rarity, stars, mutation) {
  if (!mutation) return drawHorseSVG(breedName, rarity, stars);

  // Pobierz bazowy wygląd i nadpisz zmutowaną częścią
  let vis = getMutatedVisual(breedName, mutation);

  // Tymczasowo nadpisz BREED_VISUALS dla tego wywołania
  let origVis = BREED_VISUALS[breedName];
  BREED_VISUALS[breedName] = vis;
  let svg = drawHorseSVG(breedName, rarity, stars);
  // Przywróć oryginał
  if (origVis) BREED_VISUALS[breedName] = origVis;
  else delete BREED_VISUALS[breedName];

  // Dodaj niebieski migoczący znacznik mutacji w rogu SVG
  svg = svg.replace(
    '</svg>',
    `<circle cx="148" cy="12" r="8" fill="#1a3a5a" stroke="#80d0ff" stroke-width="1.5"/>
     <text x="148" y="16" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#80d0ff">🧬</text>
     </svg>`
  );
  return svg;
}
