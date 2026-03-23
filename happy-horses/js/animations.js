// =====================
// SYSTEM ANIMACJI
// =====================

// ── 1. ANIMOWANY KOŃ W STAJNI ─────────────────────────────────────────────
// Dodaje CSS animację galopowania do SVG wewnątrz karty konia
function animateHorseCard(svgEl, rarity) {
  if (!svgEl) return;
  let rc = RARITY_COLORS[rarity] || "#8aab84";

  // Użyj setAttribute żeby animacje działały na SVG sparsowanym przez innerHTML
  let rects = svgEl.querySelectorAll("rect");
  let legRects = [];
  rects.forEach(r => {
    let h = parseFloat(r.getAttribute("height")||0);
    let w = parseFloat(r.getAttribute("width")||0);
    if (h > 14 && h < 38 && w > 3 && w < 12) legRects.push(r);
  });

  legRects.forEach((leg, i) => {
    let delay = (i % 4) * 0.1;
    leg.setAttribute("style", `transform-box:fill-box;transform-origin:top center;animation:legSwing 0.4s ease-in-out ${delay}s infinite alternate`);
  });

  let paths = svgEl.querySelectorAll("path");
  paths.forEach((p, i) => {
    if (i < 2) {
      p.setAttribute("style", `transform-box:fill-box;transform-origin:0% 50%;animation:tailWave 0.35s ease-in-out ${i*0.05}s infinite alternate`);
    }
  });

  svgEl.setAttribute("style", `animation:horseBob 0.4s ease-in-out infinite alternate`);

  let tierVal = { common:0, uncommon:1, rare:2, epic:3, legendary:4, mythic:5 };
  if ((tierVal[rarity]||0) >= 3) {
    svgEl.setAttribute("style", `animation:horseBob 0.4s ease-in-out infinite alternate;filter:drop-shadow(0 0 6px ${rc}88)`);
  }
}

function stopHorseAnimation(svgEl) {
  if (!svgEl) return;
  svgEl.setAttribute("style","");
  svgEl.querySelectorAll("rect, path").forEach(el => el.setAttribute("style",""));
}


// Hook do renderHorses — stała animacja dla każdej karty
function hookHorseCardAnimations() {
  document.querySelectorAll(".horse-card").forEach((card, i) => {
    let svgEl  = card.querySelector("svg");
    if (!svgEl) return;
    let rarity = card.dataset.rarity || "common";
    // Stała animacja — opóźnienie staggered żeby nie wszystkie sync
    setTimeout(() => animateHorseCard(svgEl, rarity), i * 80);
  });
}

// ── 2. EKRAN WYPRAWY ─────────────────────────────────────────────────────────
function showExpeditionScene(horseName, breedKey, rarity, locationName, locationIcon, durationMs, onComplete) {
  // Usuń poprzedni ekran jeśli istnieje
  let existing = document.getElementById("expScene");
  if (existing) existing.remove();

  let rc   = RARITY_COLORS[rarity] || "#8aab84";
  let vis  = (typeof getBreedVisual === "function") ? getBreedVisual(breedKey||horseName) : { coat:"#8B6914", mane:"#4a2e00" };
  let coat = vis.coat || "#8B6914";
  let mane = vis.mane || "#4a2e00";

  let overlay = document.createElement("div");
  overlay.id  = "expScene";
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9000;
    background:#0a0e0a;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    font-family:'Crimson Text',serif;
    pointer-events:all;
  `;

  overlay.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:${rc};margin-bottom:8px;opacity:0.8">${locationIcon} WYPRAWA DO: ${locationName.toUpperCase()}</div>
    <div style="font-family:'Cinzel',serif;font-size:18px;color:${rc};margin-bottom:20px">${horseName}</div>

    <!-- SCENA -->
    <div style="width:100%;max-width:600px;height:200px;position:relative;overflow:hidden;border-radius:12px;border:1px solid ${rc}33">

      <!-- Niebo -->
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,#0a0e1a 0%,#1a2040 55%,#0f2f0f 100%)"></div>

      <!-- Gwiazdy -->
      <div id="expStars" style="position:absolute;inset:0"></div>

      <!-- Księżyc -->
      <div style="position:absolute;top:16px;right:60px;width:28px;height:28px;border-radius:50%;background:#f0d080;box-shadow:0 0 12px #c9a84c66"></div>

      <!-- Trawa - paralaksa -->
      <div class="exp-ground-far"></div>
      <div class="exp-ground-mid"></div>
      <div class="exp-ground-near"></div>

      <!-- Drzewa -->
      <div id="expTrees" style="position:absolute;bottom:50px;width:200%;animation:expScrollFar 6s linear infinite"></div>

      <!-- KOŃ SVG animowany -->
      <div id="expHorse" style="position:absolute;bottom:48px;left:50%;transform:translateX(-50%);animation:expBob 0.35s ease-in-out infinite alternate">
        <svg width="140" height="90" viewBox="0 0 140 90">
          <!-- Cień -->
          <ellipse cx="70" cy="86" rx="34" ry="5" fill="rgba(0,0,0,0.3)"/>
          <!-- Ogon -->
          <path class="exp-tail" d="M108,42 C124,36 130,50 120,62" stroke="${mane}" stroke-width="5" fill="none" stroke-linecap="round"/>
          <!-- Nogi tylne -->
          <rect class="exp-leg-bl" x="85" y="58" width="6" height="22" rx="3" fill="${darken2(coat,20)}"/>
          <rect class="exp-leg-br" x="95" y="58" width="6" height="22" rx="3" fill="${darken2(coat,20)}"/>
          <!-- Tułów -->
          <ellipse cx="70" cy="44" rx="38" ry="17" fill="${coat}"/>
          <!-- Szyja -->
          <ellipse cx="40" cy="30" rx="10" ry="17" fill="${coat}" transform="rotate(-20,40,30)"/>
          <!-- Głowa -->
          <ellipse cx="28" cy="15" rx="10" ry="8" fill="${coat}"/>
          <!-- Nos -->
          <ellipse cx="19" cy="18" rx="5" ry="4" fill="${darken2(coat,25)}"/>
          <!-- Oko -->
          <circle cx="31" cy="12" r="3" fill="#1a0800"/>
          <circle cx="32" cy="11" r="1" fill="#fff"/>
          <!-- Ucho -->
          <ellipse cx="35" cy="7" rx="3" ry="5" fill="${coat}" transform="rotate(-10,35,7)"/>
          <!-- Grzywa -->
          <path class="exp-mane" d="M37,17 C28,24 27,34 32,39" stroke="${mane}" stroke-width="7" fill="none" stroke-linecap="round"/>
          <!-- Nogi przednie -->
          <rect class="exp-leg-fl" x="54" y="58" width="6" height="22" rx="3" fill="${darken2(coat,15)}"/>
          <rect class="exp-leg-fr" x="64" y="58" width="6" height="22" rx="3" fill="${darken2(coat,15)}"/>
          <!-- Kopyta -->
          <rect x="85" y="78" width="6" height="4" rx="2" fill="#1a0800"/>
          <rect x="95" y="78" width="6" height="4" rx="2" fill="#1a0800"/>
          <rect x="54" y="78" width="6" height="4" rx="2" fill="#1a0800"/>
          <rect x="64" y="78" width="6" height="4" rx="2" fill="#1a0800"/>
        </svg>
      </div>

      <!-- Pyłek kopyt -->
      <div id="expDust" style="position:absolute;bottom:42px;left:45%"></div>

      <!-- Pasek postępu -->
      <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.08)">
        <div id="expProgressBar" style="height:100%;background:${rc};width:0%;transition:none;border-radius:2px"></div>
      </div>
    </div>

    <div id="expTimer" style="margin-top:14px;font-family:'Cinzel',serif;font-size:13px;color:var(--text2)">
      Wyprawa w toku...
    </div>
    <button onclick="skipExpeditionScene()" style="margin-top:10px;font-size:11px;border-color:var(--border);color:var(--text2);background:transparent;padding:4px 12px;border:1px solid var(--border);border-radius:6px;cursor:pointer">Pomiń</button>
  `;

  document.body.appendChild(overlay);

  // Gwiazdy
  let starsEl = document.getElementById("expStars");
  for(let i=0;i<25;i++){
    let s=document.createElement("div");
    let sz=Math.random()*2+1;
    s.style.cssText=`position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:#fff;
      left:${Math.random()*100}%;top:${Math.random()*55}%;
      opacity:${0.3+Math.random()*0.7};
      animation:expTwinkle ${1+Math.random()*2}s infinite alternate;
      animation-delay:${Math.random()*2}s`;
    starsEl.appendChild(s);
  }

  // Drzewa
  let treesEl = document.getElementById("expTrees");
  let treeHTML = "";
  for(let i=0;i<14;i++){
    let x=i*100+Math.random()*30, sc=0.5+Math.random()*0.5;
    treeHTML+=`<div style="position:absolute;bottom:0;left:${x}px;transform:scale(${sc});transform-origin:bottom center">
      <div style="width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-bottom:28px solid #0a2a0a;margin:0 auto -8px"></div>
      <div style="width:0;height:0;border-left:18px solid transparent;border-right:18px solid transparent;border-bottom:34px solid #0d3d0d;margin:0 auto"></div>
      <div style="width:6px;height:20px;background:#2a1200;margin:0 auto"></div>
    </div>`;
  }
  treesEl.innerHTML = treeHTML;

  // Animuj nogi konia
  let legs = [
    { id:"exp-leg-fl", delay:"0s",   dir:"front" },
    { id:"exp-leg-fr", delay:"0.2s", dir:"front" },
    { id:"exp-leg-bl", delay:"0.1s", dir:"back" },
    { id:"exp-leg-br", delay:"0.3s", dir:"back" },
  ];
  overlay.querySelectorAll(".exp-leg-fl,.exp-leg-fr,.exp-leg-bl,.exp-leg-br").forEach((leg,i) => {
    leg.style.transformBox    = "fill-box";
    leg.style.transformOrigin = "top center";
    leg.style.animation       = `${i<2?"expLegFront":"expLegBack"} 0.3s ease-in-out ${["0s","0.15s","0.08s","0.23s"][i]} infinite`;
  });
  overlay.querySelector(".exp-tail").style.animation = "expTailWave 0.25s ease-in-out infinite alternate";
  overlay.querySelector(".exp-mane").style.animation = "expManeWave 0.25s ease-in-out infinite alternate";

  // Pyłek
  let dustEl = document.getElementById("expDust");
  for(let i=0;i<5;i++){
    let p=document.createElement("div");
    p.style.cssText=`position:absolute;width:${5+i*2}px;height:${5+i*2}px;border-radius:50%;
      background:rgba(139,105,20,0.4);
      animation:expDust 0.5s ease-out ${i*0.1}s infinite`;
    dustEl.appendChild(p);
  }

  // Progress bar
  let startTime  = Date.now();
  let progressEl = document.getElementById("expProgressBar");
  let timerEl    = document.getElementById("expTimer");

  let interval = setInterval(() => {
    let elapsed = Date.now() - startTime;
    let pct     = Math.min(100, (elapsed / durationMs) * 100);
    if (progressEl) progressEl.style.width = pct + "%";
    let secLeft = Math.ceil((durationMs - elapsed) / 1000);
    if (timerEl) timerEl.textContent = secLeft > 0 ? `${secLeft}s do końca wyprawy` : "Zakończono!";
    if (elapsed >= durationMs) {
      clearInterval(interval);
      setTimeout(() => closeExpeditionScene(onComplete), 600);
    }
  }, 100);

  overlay._interval = interval;
  overlay._onComplete = onComplete;
}

function skipExpeditionScene() {
  let scene = document.getElementById("expScene");
  if (!scene) return;
  clearInterval(scene._interval);
  closeExpeditionScene(scene._onComplete);
}

function closeExpeditionScene(onComplete) {
  let scene = document.getElementById("expScene");
  if (scene) {
    scene.style.animation = "sceneFadeOut 0.4s ease forwards";
    setTimeout(() => { scene.remove(); if (onComplete) onComplete(); }, 400);
  } else {
    if (onComplete) onComplete();
  }
}

// ── 3. EFEKT RZADKIEGO KONIA ─────────────────────────────────────────────────
function showRareHorseEffect(horseName, rarity, flag) {
  let rc  = RARITY_COLORS[rarity] || "#8aab84";
  let lbl = RARITY_LABELS[rarity] || rarity;
  let tierVal = { common:0, uncommon:1, rare:2, epic:3, legendary:4, mythic:5 };
  let tier = tierVal[rarity] || 0;
  if (tier < 2) return; // tylko rare+

  let overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9001;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    pointer-events:none;
  `;

  // Ilość cząsteczek zależna od rzadkości
  let particleCount = tier === 2 ? 20 : tier === 3 ? 35 : tier === 4 ? 55 : 80;
  let particlesHTML = "";
  for(let i=0;i<particleCount;i++){
    let angle  = Math.random()*360;
    let dist   = 80 + Math.random()*180;
    let size   = 3 + Math.random()*6;
    let dur    = 0.6 + Math.random()*0.8;
    let tx     = Math.cos(angle*Math.PI/180)*dist;
    let ty     = Math.sin(angle*Math.PI/180)*dist;
    let colors = tier >= 4 ? [rc,"#f0d080","#ffffff"] : [rc,"#ffffff"];
    let col    = colors[Math.floor(Math.random()*colors.length)];
    particlesHTML += `<div style="
      position:absolute;width:${size}px;height:${size}px;border-radius:50%;
      background:${col};top:50%;left:50%;
      animation:particleFly ${dur}s ease-out forwards;
      --tx:${tx}px;--ty:${ty}px;
      animation-delay:${Math.random()*0.3}s;
    "></div>`;
  }

  // Mityczne i pradawne — dodatkowo iskry gwiazdkowe
  let starsHTML = "";
  if (tier >= 4) {
    for(let i=0;i<8;i++){
      let left = 20 + Math.random()*60;
      let top  = 20 + Math.random()*60;
      starsHTML += `<div style="
        position:absolute;font-size:${12+Math.random()*16}px;
        left:${left}%;top:${top}%;
        animation:starPop ${0.5+Math.random()*0.5}s ease-out forwards;
        animation-delay:${Math.random()*0.4}s;opacity:0;
      ">${tier>=5?"🌟":"✨"}</div>`;
    }
  }

  overlay.innerHTML = `
    ${particlesHTML}
    ${starsHTML}
    <div style="
      position:relative;z-index:2;
      display:flex;flex-direction:column;align-items:center;gap:10px;
      animation:rareCardPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
    ">
      <div id="rareHorseSVGWrap" style="width:160px;height:130px;border-radius:10px;overflow:hidden;border:2px solid ${rc}66;background:${rc}18;filter:drop-shadow(0 0 16px ${rc}88)"></div>
      <div style="font-size:22px;line-height:1">${flag||"🐴"}</div>
      <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:${rc};text-transform:uppercase">${lbl}</div>
      <div style="font-family:'Cinzel',serif;font-size:20px;color:#fff;text-shadow:0 0 20px ${rc}">${horseName}</div>
      <div style="font-size:13px;color:var(--text2)">Nowy koń dołączył do stajni!</div>
    </div>
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,${rc}22 0%,transparent 65%);pointer-events:none"></div>
  `;
  document.body.appendChild(overlay);

  // Wstaw SVG konia (musi być po appendChild bo DOM musi istnieć)
  setTimeout(() => {
    let wrap = document.getElementById("rareHorseSVGWrap");
    if (wrap && typeof drawHorseSVG === "function") {
      // horseName to nazwa rasy — szukamy po breedKey
      let h = playerHorses.find(h2 => h2.name === horseName || h2.breedKey === horseName);
      let breedKey = h ? (h.breedKey||h.name) : horseName;
      wrap.innerHTML = drawHorseSVGMutated ? drawHorseSVGMutated(breedKey, rarity, h?.stars||0, h?.mutation||null) : drawHorseSVG(breedKey, rarity, 0);
    }
  }, 50);

  setTimeout(() => { overlay.style.animation = "sceneFadeOut 0.4s ease forwards"; setTimeout(()=>overlay.remove(),400); }, 2800);
}

// ── 4. ANIMACJA SKRZYNKI Z ŁUPEM ─────────────────────────────────────────────
// Wywołaj z wynikiem żeby pokazać co wypadło
function showLootBoxAnimation(callback) {
  let overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.88);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    font-family:'Crimson Text',serif;cursor:pointer;
  `;

  overlay.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:var(--text2);margin-bottom:20px">SKRZYNKA Z ŁUPEM</div>
    <div id="lootBox" style="
      font-size:80px;line-height:1;
      animation:boxFloat 1s ease-in-out infinite alternate;
      filter:drop-shadow(0 0 24px rgba(201,168,76,0.7));
      cursor:pointer;user-select:none;
    ">📦</div>
    <div id="lootClickHint" style="margin-top:20px;font-size:13px;color:var(--text2);animation:pulse 1s infinite alternate">Kliknij aby otworzyć</div>
    <div id="lootResult" style="display:none;flex-direction:column;align-items:center;gap:10px;animation:rareCardPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards">
      <div id="lootResultIcon" style="font-size:64px;line-height:1"></div>
      <div id="lootResultName" style="font-family:'Cinzel',serif;font-size:16px"></div>
      <div id="lootResultDesc" style="font-size:12px;color:var(--text2)"></div>
    </div>
    <div id="lootParticles" style="position:absolute;inset:0;pointer-events:none"></div>
  `;

  document.body.appendChild(overlay);

  let opened = false;
  overlay.onclick = () => {
    if (opened) return;
    opened = true;

    let box  = document.getElementById("lootBox");
    let hint = document.getElementById("lootClickHint");
    hint.style.display = "none";

    // Faza 1: drżenie
    box.style.animation = "boxShake 0.4s ease-in-out";

    setTimeout(() => {
      // Faza 2: eksplozja — wywołaj callback żeby poznać wynik
      box.style.animation = "boxExplode 0.3s ease-out forwards";

      // Wykonaj callback który losuje wynik — przechwytujemy ostatni log
      let prevLog = window._lastLootResult;
      if(callback) callback();
      // Daj chwilę żeby renderAll zaktualizował stan
      setTimeout(() => {
        // Ustal wynik z ostatniego logu skrzynki
        let result = window._lastLootResult || {};
        let col    = result.color || "#c9a84c";
        let icon   = result.icon  || "✨";
        let name   = result.name  || "Nagroda!";
        let desc   = result.desc  || "";

        // Eksplozja cząsteczek w kolorze nagrody
        let particles = document.getElementById("lootParticles");
        let colors = [col, lighten3(col,40), "#ffffff", col];
        for(let i=0;i<40;i++){
          let p = document.createElement("div");
          let angle = Math.random()*360, dist=80+Math.random()*220;
          let tx = Math.cos(angle*Math.PI/180)*dist, ty = Math.sin(angle*Math.PI/180)*dist;
          p.style.cssText=`
            position:absolute;width:${3+Math.random()*9}px;height:${3+Math.random()*9}px;
            border-radius:${Math.random()>0.5?"50%":"3px"};
            background:${colors[Math.floor(Math.random()*colors.length)]};
            top:50%;left:50%;
            animation:particleFly ${0.5+Math.random()*0.7}s ease-out forwards;
            --tx:${tx}px;--ty:${ty}px;
          `;
          particles.appendChild(p);
        }

        // Świecenie tła w kolorze nagrody
        overlay.style.background = `radial-gradient(circle at 50% 50%, ${col}22 0%, rgba(0,0,0,0.9) 60%)`;

        // Pokaż wynik
        setTimeout(() => {
          let resultEl  = document.getElementById("lootResult");
          let iconEl    = document.getElementById("lootResultIcon");
          let nameEl    = document.getElementById("lootResultName");
          let descEl    = document.getElementById("lootResultDesc");

          // Jeśli koń — wstaw SVG (160x130 skalowane do 120x97)
          if (result.svg) {
            iconEl.innerHTML = "";
            let svgWrap = document.createElement("div");
            svgWrap.style.cssText = `width:120px;height:97px;background:${col}18;border-radius:10px;overflow:hidden;border:1px solid ${col}44;margin:0 auto`;
            svgWrap.innerHTML = result.svg;
            let svgEl2 = svgWrap.querySelector("svg");
            if (svgEl2) { svgEl2.setAttribute("width","120"); svgEl2.setAttribute("height","97"); }
            iconEl.appendChild(svgWrap);
          } else {
            iconEl.textContent = icon;
          }

          nameEl.style.color = col;
          nameEl.textContent = name;
          descEl.textContent = desc;
          resultEl.style.display = "flex";
        }, 200);

        // Zamknij po chwili, potem pokaż efekt rzadkości jeśli koń
        setTimeout(() => {
          overlay.style.animation = "sceneFadeOut 0.5s ease forwards";
          setTimeout(() => {
            overlay.remove();
            let r2 = window._lastLootResult;
            if (r2 && r2._showRareEffect && typeof showRareHorseEffect === "function") {
              let s = r2._showRareEffect;
              let tier = { common:0, uncommon:1, rare:2, epic:3, legendary:4, mythic:5 }[s.rarity]||0;
              if (tier >= 2) showRareHorseEffect(s.name, s.rarity, s.flag);
            }
          }, 500);
        }, 2200);
      }, 100);
    }, 400);
  };
}

function lighten3(hex, pct) {
  if (!hex||hex.length<7) return "#c9a84c";
  let r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  if(isNaN(r)) return "#c9a84c";
  return "#"+[Math.min(255,r+pct),Math.min(255,g+pct),Math.min(255,b+pct)].map(v=>v.toString(16).padStart(2,"0")).join("");
}

// Pomocnicze
function darken2(hex, pct) {
  if (!hex || hex.length < 7) return "#4a3520";
  let r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  if(isNaN(r)) return "#4a3520";
  return "#"+[Math.max(0,r-pct),Math.max(0,g-pct),Math.max(0,b-pct)].map(v=>v.toString(16).padStart(2,"0")).join("");
}

// ── 5. ANIMACJA BŁYSKU RZADKIEGO DROPU ────────────────────────────────────────
function flashRareDrop(icon, name) {
  let d    = ITEMS_DATABASE[name] || {};
  let tier = { uncommon:1, rare:2, epic:3, legendary:4, mythic:5 }[d.rarity] || 1;
  let col  = { uncommon:"#8aab84", rare:"#4a7ec8", epic:"#7b5ea7", legendary:"#c9a84c", mythic:"#c94a6a" }[d.rarity] || "#c9a84c";

  let overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:8500;pointer-events:none;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
  `;

  // Cząsteczki
  let particles = "";
  let count = tier * 8;
  for (let i=0;i<count;i++) {
    let angle = (i/count)*360, dist=60+Math.random()*100;
    let tx=Math.cos(angle*Math.PI/180)*dist, ty=Math.sin(angle*Math.PI/180)*dist;
    let sz = 3+Math.random()*5;
    particles += `<div style="position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:${col};top:50%;left:50%;
      animation:particleFly ${0.4+Math.random()*0.4}s ease-out forwards;--tx:${tx}px;--ty:${ty}px;animation-delay:${Math.random()*0.1}s"></div>`;
  }

  overlay.innerHTML = `
    ${particles}
    <div style="position:absolute;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,${col}44,transparent 70%);
      animation:rareFlashBg 0.8s ease-out forwards"></div>
    <div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:6px;
      animation:rareFlash 0.8s ease-out forwards">
      <div style="font-size:52px;line-height:1;filter:drop-shadow(0 0 12px ${col})">${icon}</div>
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${col};letter-spacing:2px">${name}</div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 900);
}
