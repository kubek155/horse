// =====================
// UNIWERSALNY PICKER KONI — identyczny styl jak picker wyprawy
// =====================

function openHorsePickerModal(options) {
  document.getElementById("universalHorsePicker")?.remove();

  let {title, subtitle, accentColor="#c9a84c", extraInfo, filterFn, onSelect} = options;

  let overlay = document.createElement("div");
  overlay.id  = "universalHorsePicker";
  overlay.style.cssText = "position:fixed;inset:0;z-index:950;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;padding:16px";
  overlay.onclick = e => { if(e.target===overlay) overlay.remove(); };

  let panel = document.createElement("div");
  panel.style.cssText = `width:100%;max-width:780px;max-height:92vh;background:#0f1a0f;border:1px solid ${accentColor}44;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 8px 60px rgba(0,0,0,0.9)`;

  // ── Header (jak w expeditionPicker) ──────────────────────
  let locBg = options.locBg || "";
  let header = document.createElement("div");
  header.style.cssText = `padding:18px 24px;background:linear-gradient(135deg,${accentColor}15,${accentColor}05);border-bottom:1px solid ${accentColor}33;flex-shrink:0;position:relative;overflow:hidden`;
  
  // Wielka ikona w tle
  if (options.bgIcon) {
    let bgIconEl = document.createElement("div");
    bgIconEl.style.cssText = `position:absolute;right:20px;top:50%;transform:translateY(-50%);font-size:72px;opacity:0.07;pointer-events:none;line-height:1`;
    bgIconEl.textContent = options.bgIcon;
    header.appendChild(bgIconEl);
  }

  let headerInner = document.createElement("div");
  headerInner.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <div style="font-size:9px;letter-spacing:3px;color:${accentColor};margin-bottom:5px">WYBIERZ KONIA DO ${options.context||"AKCJI"}</div>
        <div style="font-family:'Cinzel',serif;font-size:18px;color:${accentColor}">${title||"Wybierz konia"}</div>
        ${subtitle?`<div style="font-size:12px;color:var(--text2);margin-top:5px">${subtitle}</div>`:""}
        ${extraInfo?`<div style="display:flex;gap:14px;margin-top:8px;font-size:11px;color:var(--text2)">${extraInfo}</div>`:""}
      </div>
      <button onclick="document.getElementById('universalHorsePicker').remove()" style="background:transparent;border:none;color:#4a5a4a;font-size:22px;cursor:pointer;padding:0;line-height:1;flex-shrink:0">✕</button>
    </div>
  `;
  header.appendChild(headerInner);
  panel.appendChild(header);

  // ── Grid kart ─────────────────────────────────────────────
  let grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;padding:16px;overflow-y:auto;flex:1";

  if (!playerHorses.length) {
    let empty = document.createElement("div");
    empty.style.cssText = "grid-column:1/-1;text-align:center;padding:48px;color:var(--text2)";
    empty.innerHTML = `<svg viewBox="0 0 48 48" fill="none" width="48" height="48" style="margin:0 auto 12px;display:block;opacity:0.3"><ellipse cx="32" cy="28" rx="12" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 20Q12 16 16 13l4 2" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="13" cy="20" rx="3" ry="4" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(-20,13,20)"/></svg><div style="font-size:14px">Brak koni w stajni</div>`;
    grid.appendChild(empty);
  }

  let busyIdxs = new Set(
    typeof expeditions !== "undefined"
      ? expeditions.filter(e=>!e.done).map(e=>e.horseIdx)
      : []
  );

  playerHorses.forEach((h, hi) => {
    let rc = (typeof RARITY_COLORS!=="undefined" ? RARITY_COLORS[h.rarity] : null) || "#8aab84";
    let rl = (typeof RARITY_LABELS!=="undefined" ? RARITY_LABELS[h.rarity] : h.rarity) || "";
    let {blocked, badges} = filterFn ? filterFn(h, hi) : {blocked:false, badges:[]};

    let hunger  = typeof getHunger==="function" ? getHunger(h) : 0;
    let hCol    = hunger > 70 ? "#c94a4a" : hunger > 40 ? "#c97c2a" : "#4ab870";
    let age     = typeof getHorseAgeDays==="function" ? getHorseAgeDays(h) : 0;

    // Dodaj głód i wiek do badges jeśli nie zablokowany
    let allBadges = [...(badges||[])];
    if (!blocked && hunger > 40) allBadges.push({text:`Głód: ${hunger}%`, color:hCol});
    if (age > 0) allBadges.push({text:`${age} dni`, color:"#8aab84"});

    let card = document.createElement("div");
    card.style.cssText = `
      background:${blocked?"#0a0d0a":"#131f13"};
      border:1px solid ${blocked?"#1a2a1a":rc+"44"};
      border-radius:12px;padding:0;
      cursor:${blocked?"not-allowed":"pointer"};
      opacity:${blocked?0.5:1};
      transition:border-color 0.12s,background 0.12s,transform 0.1s;
      display:flex;flex-direction:column;overflow:hidden;
    `;

    // SVG konia — duży, bez paddingu
    let svgWrap = document.createElement("div");
    svgWrap.style.cssText = `width:100%;height:120px;overflow:hidden;background:${rc}08;border-bottom:1px solid ${rc}18;flex-shrink:0;position:relative`;
    if (typeof drawHorseSVG === "function") {
      svgWrap.innerHTML = drawHorseSVG(h.breedKey||h.name, h.rarity, h.stars||0);
      let s = svgWrap.querySelector("svg");
      if (s) {
        s.setAttribute("width","100%");
        s.setAttribute("height","120");
        s.setAttribute("preserveAspectRatio","xMidYMid meet");
      }
    }

    // Stars overlay
    if ((h.stars||0) > 0) {
      let starEl = document.createElement("div");
      starEl.style.cssText = "position:absolute;top:5px;right:6px;font-size:11px";
      starEl.textContent = "⭐".repeat(h.stars);
      svgWrap.appendChild(starEl);
    }

    // Rarity badge overlay
    let rarBadge = document.createElement("div");
    rarBadge.style.cssText = `position:absolute;bottom:5px;left:6px;font-size:9px;padding:2px 7px;border-radius:8px;background:rgba(0,0,0,0.65);color:${rc};border:1px solid ${rc}44;font-family:'Cinzel',serif;letter-spacing:1px`;
    rarBadge.textContent = rl;
    svgWrap.appendChild(rarBadge);

    card.appendChild(svgWrap);

    // Info sekcja
    let info = document.createElement("div");
    info.style.cssText = "padding:10px 11px 8px;display:flex;flex-direction:column;gap:6px";

    // Nazwa
    let nameEl = document.createElement("div");
    nameEl.style.cssText = `font-family:'Cinzel',serif;font-size:12px;color:${rc};white-space:nowrap;overflow:hidden;text-overflow:ellipsis`;
    nameEl.textContent = h.name;
    info.appendChild(nameEl);

    // Typ + płeć
    let typeEl = document.createElement("div");
    typeEl.style.cssText = "font-size:10px;color:var(--text2)";
    typeEl.textContent = `${rl}${h.type?" · "+h.type:""} ${h.gender==="male"?"♂":"♀"}`;
    info.appendChild(typeEl);

    // Statystyki — 2×2 grid z SVG ikonkami
    let statsGrid = document.createElement("div");
    statsGrid.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:3px";

    const STAT_SVGS = {
      speed:    `<svg viewBox="0 0 12 12" fill="none" width="11" height="11"><path d="M9 2.5L5.5 6l2 1L5 10" stroke="#4a7ec8" stroke-width="1.4" stroke-linecap="round"/></svg>`,
      strength: `<svg viewBox="0 0 12 12" fill="none" width="11" height="11"><rect x="1.5" y="4.5" width="2" height="3" rx="1" fill="#c97c2a"/><rect x="8.5" y="4.5" width="2" height="3" rx="1" fill="#c97c2a"/><rect x="3" y="5.2" width="6" height="1.6" fill="#c97c2a"/></svg>`,
      stamina:  `<svg viewBox="0 0 12 12" fill="none" width="11" height="11"><path d="M6 10.5Q2 7.5 2 5Q2 3 4 3Q5.2 3 6 4.5Q6.8 3 8 3Q10 3 10 5Q10 7.5 6 10.5Z" stroke="#c94a4a" stroke-width="1.3" fill="rgba(201,74,74,0.2)"/></svg>`,
      luck:     `<svg viewBox="0 0 12 12" fill="none" width="11" height="11"><circle cx="4" cy="4" r="2.5" fill="#3a8a3a" opacity=".9"/><circle cx="8" cy="4" r="2.5" fill="#4aa04a" opacity=".9"/><circle cx="6" cy="7.5" r="2.5" fill="#3a8a3a" opacity=".9"/><line x1="6" y1="10" x2="6" y2="12" stroke="#3a6a3a" stroke-width="1.2"/></svg>`,
    };
    const statColors = {speed:"#4a7ec8", strength:"#c97c2a", stamina:"#c94a4a", luck:"#4ab870"};

    [["speed","strength"],["stamina","luck"]].forEach(row => {
      row.forEach(stat => {
        let cell = document.createElement("div");
        cell.style.cssText = "display:flex;align-items:center;gap:3px;font-size:11px";
        cell.innerHTML = `<span style="display:inline-flex;flex-shrink:0">${STAT_SVGS[stat]}</span><span style="color:${statColors[stat]};font-family:'Cinzel',serif">${h.stats[stat]||0}</span>`;
        statsGrid.appendChild(cell);
      });
    });
    info.appendChild(statsGrid);

    // Status badges
    if (allBadges.length) {
      let bdiv = document.createElement("div");
      bdiv.style.cssText = "display:flex;flex-wrap:wrap;gap:3px;margin-top:1px";
      allBadges.forEach(b => {
        let sp = document.createElement("span");
        sp.style.cssText = `font-size:9px;padding:2px 6px;border-radius:5px;background:${b.color||"#555"}18;color:${b.color||"#888"};border:1px solid ${b.color||"#555"}33`;
        sp.textContent = b.text;
        bdiv.appendChild(sp);
      });
      info.appendChild(bdiv);
    }

    // Perk
    if (h.perk) {
      let perkEl = document.createElement("div");
      perkEl.style.cssText = "font-size:9px;color:#e08070;margin-top:1px";
      perkEl.textContent = `${h.perk.icon||""} ${h.perk.name||""}`;
      info.appendChild(perkEl);
    }

    card.appendChild(info);

    if (!blocked) {
      card.onclick = () => {
        overlay.remove();
        onSelect(hi);
      };
      card.onmouseenter = () => {
        card.style.borderColor = rc;
        card.style.background  = rc + "0d";
        card.style.transform   = "translateY(-1px)";
      };
      card.onmouseleave = () => {
        card.style.borderColor = rc + "44";
        card.style.background  = "#131f13";
        card.style.transform   = "";
      };
    }

    grid.appendChild(card);
  });

  panel.appendChild(grid);

  // ── Footer ────────────────────────────────────────────────
  let avail = playerHorses.filter((_,i) => !(filterFn && filterFn(playerHorses[i],i).blocked)).length;
  let footer = document.createElement("div");
  footer.style.cssText = "padding:10px 16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0";
  footer.innerHTML = `
    <div style="font-size:11px;color:var(--text2)">${avail} koni dostępnych</div>
    <button onclick="document.getElementById('universalHorsePicker').remove()" style="border-color:var(--border);color:var(--text2);font-size:12px;padding:6px 18px">Anuluj</button>
  `;
  panel.appendChild(footer);

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}
