// =====================
// UNIWERSALNY PICKER KONI — styl wyprawy
// Fullscreen overlay, grid z SVG, filtry statusu
// =====================

/**
 * openHorsePickerModal(options)
 * options: {
 *   title: string,
 *   subtitle: string,
 *   accentColor: string,
 *   filterFn: (h, i) => { blocked:bool, badges:[{text,color}] }
 *   onSelect: (horseIdx) => void
 * }
 */
function openHorsePickerModal(options) {
  // Usuń poprzedni
  document.getElementById("universalHorsePicker")?.remove();

  let {title, subtitle, accentColor="#c9a84c", filterFn, onSelect} = options;

  let overlay = document.createElement("div");
  overlay.id  = "universalHorsePicker";
  overlay.style.cssText = [
    "position:fixed","inset:0","z-index:950",
    "background:rgba(0,0,0,0.88)",
    "display:flex","align-items:center","justify-content:center","padding:16px",
  ].join(";");
  overlay.onclick = e => { if(e.target===overlay) overlay.remove(); };

  let panel = document.createElement("div");
  panel.style.cssText = [
    "width:100%","max-width:760px","max-height:90vh",
    "background:#0f1a0f",`border:1px solid ${accentColor}44`,
    "border-radius:16px","display:flex","flex-direction:column","overflow:hidden",
    "box-shadow:0 0 60px rgba(0,0,0,0.8)",
  ].join(";");

  // Header
  let header = document.createElement("div");
  header.style.cssText = [
    "padding:20px 24px",
    `background:linear-gradient(135deg,${accentColor}14,${accentColor}06)`,
    `border-bottom:1px solid ${accentColor}33`,"flex-shrink:0",
  ].join(";");
  header.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:start">
      <div>
        <div style="font-size:9px;letter-spacing:3px;color:${accentColor};margin-bottom:4px">WYBIERZ KONIA</div>
        <div style="font-family:'Cinzel',serif;font-size:17px;color:${accentColor}">${title||"Wybierz konia"}</div>
        ${subtitle?`<div style="font-size:12px;color:var(--text2);margin-top:4px">${subtitle}</div>`:""}
      </div>
      <button onclick="document.getElementById('universalHorsePicker').remove()"
        style="background:transparent;border:none;color:#4a5a4a;font-size:22px;cursor:pointer;padding:0;line-height:1">✕</button>
    </div>
  `;
  panel.appendChild(header);

  // Grid
  let grid = document.createElement("div");
  grid.style.cssText = [
    "display:grid","grid-template-columns:repeat(auto-fill,minmax(190px,1fr))",
    "gap:10px","padding:16px","overflow-y:auto","flex:1",
  ].join(";");

  if (!playerHorses.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text2)">
      <div style="font-size:36px;margin-bottom:8px">🐴</div>
      Brak koni w stajni
    </div>`;
  }

  playerHorses.forEach((h, hi) => {
    let rc = (typeof RARITY_COLORS!=="undefined" ? RARITY_COLORS[h.rarity] : null) || "#8aab84";
    let {blocked, badges} = filterFn ? filterFn(h, hi) : {blocked:false, badges:[]};

    let card = document.createElement("div");
    card.style.cssText = [
      `background:${blocked?"#0a0e0a":"#131f13"}`,
      `border:1px solid ${blocked?"#1a2a1a":rc+"44"}`,
      "border-radius:12px","padding:12px",
      `cursor:${blocked?"not-allowed":"pointer"}`,
      `opacity:${blocked?0.5:1}`,
      "transition:border-color 0.15s,background 0.15s",
      "display:flex","flex-direction:column","gap:8px",
    ].join(";");

    // SVG konia
    let svgDiv = document.createElement("div");
    svgDiv.style.cssText = [
      "width:100%","height:80px","overflow:hidden","border-radius:8px",
      `background:${rc}0a`,`border:1px solid ${rc}22`,"flex-shrink:0",
    ].join(";");
    if (typeof drawHorseSVG === "function") {
      svgDiv.innerHTML = drawHorseSVG(h.breedKey||h.name, h.rarity, h.stars||0);
      let s = svgDiv.querySelector("svg");
      if (s) { s.setAttribute("width","100%"); s.setAttribute("height","80"); s.setAttribute("preserveAspectRatio","xMidYMid meet"); }
    }
    card.appendChild(svgDiv);

    // Info
    let rlabel = (typeof RARITY_LABELS!=="undefined" ? RARITY_LABELS[h.rarity] : h.rarity) || "";
    let info = document.createElement("div");
    info.innerHTML = `
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${rc};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
        ${h.name}${h.stars>0?" "+"⭐".repeat(h.stars):""}
      </div>
      <div style="font-size:10px;color:var(--text2);margin-top:1px">${rlabel}${h.type?" · "+h.type:""} ${h.gender==="male"?"♂":"♀"}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;font-size:10px;margin-top:3px">
        <span style="color:var(--text2)">⚡<span style="color:var(--text)">${h.stats.speed}</span></span>
        <span style="color:var(--text2)">💪<span style="color:var(--text)">${h.stats.strength}</span></span>
        <span style="color:var(--text2)">❤️<span style="color:var(--text)">${h.stats.stamina}</span></span>
        <span style="color:var(--text2)">🍀<span style="color:var(--text)">${h.stats.luck||0}</span></span>
      </div>
    `;
    card.appendChild(info);

    // Badges statusu
    if (badges && badges.length) {
      let bdiv = document.createElement("div");
      bdiv.style.cssText = "display:flex;flex-wrap:wrap;gap:3px";
      badges.forEach(b => {
        let span = document.createElement("span");
        span.style.cssText = `font-size:9px;padding:2px 6px;border-radius:6px;background:${b.color||"#333"}22;color:${b.color||"#888"};border:1px solid ${b.color||"#333"}44`;
        span.textContent = b.text;
        bdiv.appendChild(span);
      });
      card.appendChild(bdiv);
    }

    if (!blocked) {
      card.onclick = () => {
        overlay.remove();
        onSelect(hi);
      };
      card.onmouseenter = () => { card.style.borderColor=rc; card.style.background=rc+"0f"; };
      card.onmouseleave = () => { card.style.borderColor=rc+"44"; card.style.background="#131f13"; };
    }

    grid.appendChild(card);
  });

  panel.appendChild(grid);

  // Footer
  let footer = document.createElement("div");
  footer.style.cssText = "padding:10px 16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;font-size:11px;color:var(--text2)";
  let available = playerHorses.filter((_,i) => !(filterFn && filterFn(playerHorses[i],i).blocked)).length;
  footer.innerHTML = `<span>${available} z ${playerHorses.length} koni dostępnych</span>
    <button onclick="document.getElementById('universalHorsePicker').remove()" style="border-color:var(--border);color:var(--text2);font-size:11px;padding:5px 14px">Anuluj</button>`;
  panel.appendChild(footer);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}
