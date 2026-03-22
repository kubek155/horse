// =====================
// ENCYKLOPEDIA KONI
// =====================
let encyFilter = { rarity:"all", bloodline:"all", type:"all", search:"" };

function setEncyFilter(key, val) {
  encyFilter[key] = val;
  document.querySelectorAll(`[data-ency="${key}"]`).forEach(b=>{
    b.classList.toggle("active", b.dataset.val===val);
  });
  renderEncyclopedia();
}

function renderEncyclopedia() {
  let el = document.getElementById("encyclopediaGrid");
  if (!el) return;

  let list = BREEDS.filter(b => {
    if (encyFilter.rarity   !== "all" && b.rarity    !== encyFilter.rarity)    return false;
    if (encyFilter.bloodline !== "all" && b.bloodline !== encyFilter.bloodline) return false;
    if (encyFilter.type     !== "all" && b.type       !== encyFilter.type)      return false;
    if (encyFilter.search) {
      let q = encyFilter.search.toLowerCase();
      if (!b.name.toLowerCase().includes(q) && !b.country.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Grupuj wg rzadkości
  const ORDER = ["mythic","legendary","epic","rare","uncommon","common"];
  list.sort((a,b) => ORDER.indexOf(a.rarity) - ORDER.indexOf(b.rarity) || a.name.localeCompare(b.name));

  document.getElementById("encyclopediaCount").textContent = `${list.length} / ${BREEDS.length} ras`;

  if (!list.length) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">📖</div>Brak ras pasujących do filtrów</div>`;
    return;
  }

  el.innerHTML = "";
  let lastRarity = null;

  list.forEach(breed => {
    // Separator rzadkości
    if (breed.rarity !== lastRarity) {
      lastRarity = breed.rarity;
      let sep = document.createElement("div");
      sep.style.cssText = "grid-column:1/-1;margin:8px 0 4px";
      let rc = RARITY_COLORS[breed.rarity] || "#8aab84";
      sep.innerHTML = `<div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:2px;color:${rc};border-bottom:1px solid ${rc}33;padding-bottom:4px">
        ${RARITY_LABELS[breed.rarity]||breed.rarity} · ${list.filter(b=>b.rarity===breed.rarity).length} ras
      </div>`;
      el.appendChild(sep);
    }

    let rc  = RARITY_COLORS[breed.rarity] || "#8aab84";
    let bl  = BLOODLINE_LABELS[breed.bloodline] || breed.bloodline;
    let card = document.createElement("div");
    card.className = "ency-card";
    card.style.borderColor = rc + "55";

    // Sprawdź czy gracz ma tego konia
    let owned = playerHorses.some(h => (h.breedKey||h.name) === breed.name);

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:22px">${breed.flag}</span>
          <div>
            <div style="font-family:'Cinzel',serif;font-size:13px;color:${rc}">${breed.name}</div>
            <div style="font-size:11px;color:var(--text2)">${breed.country}</div>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
          <span style="font-size:10px;background:${rc}22;color:${rc};padding:2px 7px;border-radius:8px;border:1px solid ${rc}55">${RARITY_LABELS[breed.rarity]}</span>
          ${owned ? `<span style="font-size:10px;color:var(--accent2)">✔ W stajni</span>` : ""}
        </div>
      </div>
      <div style="font-size:11px;color:var(--text2);margin-bottom:8px;font-style:italic">${breed.desc}</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
        <span class="ency-tag">${bl}</span>
        <span class="ency-tag">${breed.type}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:11px;margin-bottom:6px">
        <div class="ency-stat"><span style="color:var(--text2)">⚡ Szybkość</span><span style="color:var(--text)">${breed.base.speed}</span></div>
        <div class="ency-stat"><span style="color:var(--text2)">💪 Siła</span><span style="color:var(--text)">${breed.base.strength}</span></div>
        <div class="ency-stat"><span style="color:var(--text2)">❤️ Wytrzymałość</span><span style="color:var(--text)">${breed.base.stamina}</span></div>
        <div class="ency-stat"><span style="color:var(--text2)">🍀 Szczęście</span><span style="color:var(--text)">${breed.base.luck}</span></div>
      </div>
      ${(()=>{
        let rr = RARITY_STAT_RANGE[breed.rarity]||{lo:0,hi:30};
        let racingNote = breed.type === "Wyścigowy" ? `<div style="font-size:10px;color:#c9a84c;margin-top:4px">🏇 Bonus wyścigowy: +0–20 szybkości (losowy)</div>` : "";
        return `<div style="font-size:10px;color:var(--text2);padding:4px 6px;background:var(--panel2);border-radius:4px">📊 Zakres statystyk: ${rr.lo}–${rr.hi}</div>${racingNote}`;
      })()}
    `;
    el.appendChild(card);
  });
}
