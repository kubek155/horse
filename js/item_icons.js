// =====================
// IKONY ITEMÓW — SVG zamiast emoji
// =====================
const ITEM_ICONS_SVG = {

  // Jedzenie
  "Jabłko": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8c-1.5-3-5-3-5-3s1 3 0 5" stroke="#5a3a1a" stroke-width="1.5" fill="none"/>
    <ellipse cx="20" cy="24" rx="12" ry="13" fill="#e84c3d"/>
    <ellipse cx="15" cy="20" rx="4" ry="6" fill="#f27a72" opacity="0.5"/>
    <path d="M20 11c-8 0-12 7-12 13s4 13 12 13 12-7 12-13-4-13-12-13z" fill="#e84c3d"/>
    <ellipse cx="15" cy="22" rx="3" ry="5" fill="#f09090" opacity="0.4"/>
  </svg>`,

  "Jabłko Sfinksa": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 8c-1.5-3-5-3-5-3s1 3 0 5" stroke="#3a5a1a" stroke-width="1.5" fill="none"/>
    <path d="M20 11c-8 0-12 7-12 13s4 13 12 13 12-7 12-13-4-13-12-13z" fill="#4ab840"/>
    <ellipse cx="15" cy="22" rx="3" ry="5" fill="#80e060" opacity="0.4"/>
    <circle cx="28" cy="14" r="5" fill="#f0d040" opacity="0.9"/>
    <path d="M26 14l1.5-1.5 1.5 1.5-1.5 1.5z" fill="#c9a84c"/>
  </svg>`,

  "Słoma": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="16" width="24" height="14" rx="3" fill="#d4a840"/>
    <rect x="10" y="18" width="20" height="10" rx="2" fill="#e8c060"/>
    <line x1="14" y1="16" x2="14" y2="30" stroke="#b89030" stroke-width="1.5"/>
    <line x1="20" y1="16" x2="20" y2="30" stroke="#b89030" stroke-width="1.5"/>
    <line x1="26" y1="16" x2="26" y2="30" stroke="#b89030" stroke-width="1.5"/>
    <rect x="6" y="20" width="28" height="3" rx="1.5" fill="#c9a84c" opacity="0.6"/>
  </svg>`,

  "Siano": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="26" rx="14" ry="9" fill="#d4a840"/>
    <ellipse cx="20" cy="24" rx="12" ry="7" fill="#e8c060"/>
    <path d="M12 20 Q16 15 20 20 Q24 15 28 20" stroke="#c9a84c" stroke-width="1.5" fill="none"/>
    <path d="M10 24 Q14 18 18 24" stroke="#b89030" stroke-width="1.2" fill="none"/>
    <path d="M22 24 Q26 18 30 24" stroke="#b89030" stroke-width="1.2" fill="none"/>
  </svg>`,

  // Budowlane
  "Deska": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="14" width="32" height="7" rx="1" fill="#8B5E3C"/>
    <rect x="4" y="22" width="32" height="7" rx="1" fill="#A0723A"/>
    <line x1="14" y1="14" x2="14" y2="29" stroke="#6b4a28" stroke-width="1"/>
    <line x1="26" y1="14" x2="26" y2="29" stroke="#6b4a28" stroke-width="1"/>
    <rect x="4" y="13" width="32" height="2" rx="1" fill="#C4946A" opacity="0.5"/>
  </svg>`,

  "Cegła": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="12" width="15" height="8" rx="1.5" fill="#c1440e"/>
    <rect x="21" y="12" width="15" height="8" rx="1.5" fill="#d4521a"/>
    <rect x="12" y="22" width="15" height="8" rx="1.5" fill="#c1440e"/>
    <rect x="4" y="22" width="6" height="8" rx="1.5" fill="#d4521a"/>
    <rect x="29" y="22" width="7" height="8" rx="1.5" fill="#c1440e"/>
    <line x1="4" y1="20" x2="36" y2="20" stroke="#8a2a04" stroke-width="1.5"/>
    <line x1="4" y1="30" x2="36" y2="30" stroke="#8a2a04" stroke-width="1.5"/>
  </svg>`,

  "Dachówka": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 28 L20 12 L36 28Z" fill="#b04020"/>
    <path d="M4 28 L20 14 L36 28Z" fill="#c85030"/>
    <path d="M10 28 L20 18 L30 28Z" fill="#d06040" opacity="0.7"/>
    <line x1="4" y1="28" x2="36" y2="28" stroke="#8a3010" stroke-width="2"/>
    <path d="M20 12 L20 28" stroke="#8a3010" stroke-width="1" opacity="0.4"/>
  </svg>`,

  "Gwóźdź": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="16" y="8" width="8" height="6" rx="1" fill="#888"/>
    <rect x="18.5" y="14" width="3" height="20" rx="1" fill="#aaa"/>
    <ellipse cx="20" cy="34" rx="2" ry="1.5" fill="#777"/>
    <rect x="17" y="8" width="6" height="2" rx="1" fill="#bbb" opacity="0.6"/>
  </svg>`,

  "Kamień": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 28 Q6 20 12 15 Q18 10 26 13 Q34 16 34 24 Q34 32 24 32 Q14 34 8 28Z" fill="#7a7a8a"/>
    <path d="M10 26 Q9 20 14 16 Q20 12 26 15" fill="#9a9aaa" opacity="0.6"/>
    <ellipse cx="22" cy="20" rx="4" ry="3" fill="#b0b0c0" opacity="0.4"/>
  </svg>`,

  "Szkło": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="24" height="24" rx="2" fill="#a8d8f0" opacity="0.3" stroke="#60a8d0" stroke-width="1.5"/>
    <line x1="8" y1="16" x2="32" y2="16" stroke="#80c0e8" stroke-width="1" opacity="0.6"/>
    <line x1="8" y1="24" x2="32" y2="24" stroke="#80c0e8" stroke-width="1" opacity="0.6"/>
    <line x1="16" y1="8" x2="16" y2="32" stroke="#80c0e8" stroke-width="1" opacity="0.6"/>
    <line x1="24" y1="8" x2="24" y2="32" stroke="#80c0e8" stroke-width="1" opacity="0.6"/>
    <path d="M10 10 L18 10 L10 18Z" fill="white" opacity="0.5"/>
  </svg>`,

  "Metal": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="20,6 34,14 34,26 20,34 6,26 6,14" fill="#5a6a7a" stroke="#3a4a5a" stroke-width="1.5"/>
    <polygon points="20,10 30,16 30,24 20,30 10,24 10,16" fill="#7a8a9a" opacity="0.8"/>
    <polygon points="20,14 26,18 26,22 20,26 14,22 14,18" fill="#9aaaba" opacity="0.6"/>
    <circle cx="20" cy="20" r="3" fill="#b0c0d0" opacity="0.5"/>
  </svg>`,

  // Leczenie i eliksiry
  "Bandaż": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="14" width="28" height="12" rx="6" fill="#f0f0f0"/>
    <rect x="15" y="14" width="10" height="12" fill="#e0e0e0"/>
    <rect x="6" y="18" width="28" height="4" fill="#e8e8e8"/>
    <rect x="18" y="14" width="4" height="12" fill="#e8e8e8"/>
    <path d="M17 20h6M20 17v6" stroke="#e05050" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  "Eliksir Szybkości": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8 L24 8 L28 18 Q32 28 20 34 Q8 28 12 18Z" fill="#4a7ec8" opacity="0.9"/>
    <path d="M17 10 L23 10 L26 18 Q28 25 20 30 Q14 25 16 18Z" fill="#6ab0e0" opacity="0.6"/>
    <path d="M18 8 L22 8 L22 6 L18 6Z" fill="#888"/>
    <path d="M14 20 L20 16 L18 22 L24 18 L20 24" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  </svg>`,

  "Eliksir Siły": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8 L24 8 L28 18 Q32 28 20 34 Q8 28 12 18Z" fill="#c97c2a" opacity="0.9"/>
    <path d="M17 10 L23 10 L26 18 Q28 25 20 30 Q14 25 16 18Z" fill="#e8a050" opacity="0.6"/>
    <path d="M18 8 L22 8 L22 6 L18 6Z" fill="#888"/>
    <path d="M14 22 Q14 18 17 18 Q17 16 20 16 Q23 16 23 18 Q26 18 26 22 Q26 25 20 25 Q14 25 14 22Z" stroke="#ffffff" stroke-width="1.5" fill="none"/>
  </svg>`,

  "Eliksir Wytrzymałości": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8 L24 8 L28 18 Q32 28 20 34 Q8 28 12 18Z" fill="#c94a4a" opacity="0.9"/>
    <path d="M17 10 L23 10 L26 18 Q28 25 20 30 Q14 25 16 18Z" fill="#e87070" opacity="0.6"/>
    <path d="M18 8 L22 8 L22 6 L18 6Z" fill="#888"/>
    <path d="M20 16 Q24 16 24 20 Q24 23 20 25 Q16 23 16 20 Q16 16 20 16Z" stroke="#ffffff" stroke-width="1.5" fill="none"/>
  </svg>`,

  "Eliksir Szczęścia": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8 L24 8 L28 18 Q32 28 20 34 Q8 28 12 18Z" fill="#4a9e6a" opacity="0.9"/>
    <path d="M17 10 L23 10 L26 18 Q28 25 20 30 Q14 25 16 18Z" fill="#70c090" opacity="0.6"/>
    <path d="M18 8 L22 8 L22 6 L18 6Z" fill="#888"/>
    <path d="M20 17 L21 20 L24 20 L21.5 22 L22.5 25 L20 23 L17.5 25 L18.5 22 L16 20 L19 20Z" stroke="#ffffff" stroke-width="1" fill="#ffffff" opacity="0.8"/>
  </svg>`,

  "Eliksir Odmłodzenia": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8 L24 8 L28 18 Q32 28 20 34 Q8 28 12 18Z" fill="#7b5ea7" opacity="0.9"/>
    <path d="M17 10 L23 10 L26 18 Q28 25 20 30 Q14 25 16 18Z" fill="#b090e0" opacity="0.5"/>
    <path d="M18 8 L22 8 L22 6 L18 6Z" fill="#888"/>
    <path d="M16 22 Q16 17 20 17 Q24 17 24 22" stroke="#ffffff" stroke-width="1.5" fill="none"/>
    <path d="M18 28 Q18 24 20 24 Q22 24 22 28" stroke="#ffffff" stroke-width="1.2" fill="none" opacity="0.7"/>
  </svg>`,

  "Boski Nektar": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8 L24 8 L28 18 Q32 28 20 34 Q8 28 12 18Z" fill="#c9a84c" opacity="0.9"/>
    <path d="M17 10 L23 10 L26 18 Q28 25 20 30 Q14 25 16 18Z" fill="#f0d080" opacity="0.5"/>
    <path d="M18 8 L22 8 L22 6 L18 6Z" fill="#888"/>
    <path d="M20 15 L21.5 19.5 L26 19.5 L22.5 22 L24 26.5 L20 24 L16 26.5 L17.5 22 L14 19.5 L18.5 19.5Z" fill="#ffffff" opacity="0.9"/>
  </svg>`,

  "Eliksir Krwi": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 8 L24 8 L28 18 Q32 28 20 34 Q8 28 12 18Z" fill="#8a0a0a" opacity="0.95"/>
    <path d="M17 10 L23 10 L26 18 Q28 25 20 30 Q14 25 16 18Z" fill="#d04040" opacity="0.5"/>
    <path d="M18 8 L22 8 L22 6 L18 6Z" fill="#888"/>
    <path d="M20 16 L20 28 M15 21 L25 21" stroke="#ff6060" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
  </svg>`,

  // Sloty
  "Piorun": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 6 L14 22 L19 22 L16 34 L28 18 L22 18Z" fill="#f0d040" stroke="#c9a800" stroke-width="1"/>
    <path d="M21 8 L15 22 L19 22" fill="#fff080" opacity="0.5"/>
  </svg>`,

  "Kowadło": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="14" width="24" height="10" rx="2" fill="#606060"/>
    <rect x="10" y="14" width="20" height="4" rx="1" fill="#808080" opacity="0.6"/>
    <rect x="14" y="24" width="12" height="4" rx="1" fill="#505050"/>
    <rect x="16" y="28" width="8" height="4" rx="1" fill="#404040"/>
    <ellipse cx="20" cy="14" rx="8" ry="3" fill="#707070"/>
  </svg>`,

  "Koniczyna": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="7" fill="#3a8a3a"/>
    <circle cx="24" cy="16" r="7" fill="#4aa04a"/>
    <circle cx="20" cy="22" r="7" fill="#3a8a3a"/>
    <ellipse cx="16" cy="16" rx="4" ry="3" fill="#70c070" opacity="0.4"/>
    <line x1="20" y1="26" x2="20" y2="34" stroke="#3a6a3a" stroke-width="2"/>
    <path d="M16 32 Q20 30 24 32" stroke="#3a6a3a" stroke-width="1.5" fill="none"/>
  </svg>`,

  "Serce": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 32 Q6 22 6 14 Q6 8 12 8 Q16 8 20 13 Q24 8 28 8 Q34 8 34 14 Q34 22 20 32Z" fill="#e84040"/>
    <path d="M20 28 Q10 20 10 14 Q10 11 13 11 Q16 11 20 16" fill="#ff7070" opacity="0.4"/>
    <path d="M20 14 Q22 10 26 11" stroke="#ff9090" stroke-width="1" opacity="0.6"/>
    <path d="M14 12 Q16 10 18 12" stroke="#ff9090" stroke-width="1.5" opacity="0.5" fill="none"/>
  </svg>`,

  // Przepustki
  "Leśna Przepustka": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="28" height="20" rx="3" fill="#1a3a1a" stroke="#4a8a4a" stroke-width="1.5"/>
    <path d="M20 14 L23 20 L17 20Z" fill="#4ab840"/>
    <path d="M20 18 L24 26 L16 26Z" fill="#3a9030"/>
    <rect x="19" y="26" width="2" height="4" fill="#6a4a2a"/>
    <circle cx="28" cy="14" r="3" fill="#c9a84c" opacity="0.8"/>
  </svg>`,

  "Pustynna Przepustka": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="28" height="20" rx="3" fill="#3a2010" stroke="#c97c2a" stroke-width="1.5"/>
    <ellipse cx="20" cy="22" rx="4" ry="6" fill="#d4a040" opacity="0.8"/>
    <path d="M16 22 Q16 18 20 18 Q24 18 24 22" fill="#e8c060" opacity="0.5"/>
    <circle cx="28" cy="14" r="3" fill="#c9a84c" opacity="0.8"/>
  </svg>`,

  "Górska Przepustka": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="28" height="20" rx="3" fill="#1a1a2a" stroke="#6a6ab0" stroke-width="1.5"/>
    <path d="M10 28 L18 16 L26 28Z" fill="#4a4a8a"/>
    <path d="M18 28 L24 18 L30 28Z" fill="#6060a0"/>
    <path d="M18 16 L19 14 L20 16" fill="white" opacity="0.7"/>
    <circle cx="28" cy="14" r="3" fill="#c9a84c" opacity="0.8"/>
  </svg>`,

  "Tundrowa Przepustka": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="28" height="20" rx="3" fill="#0a1a2a" stroke="#4a9ab0" stroke-width="1.5"/>
    <ellipse cx="20" cy="24" rx="10" ry="4" fill="#c0e8f0" opacity="0.4"/>
    <path d="M14 20 L20 14 L26 20 L23 20 L23 26 L17 26 L17 20Z" fill="#80c8e0" opacity="0.7"/>
    <circle cx="28" cy="14" r="3" fill="#c9a84c" opacity="0.8"/>
  </svg>`,

  "Mroczna Przepustka": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="10" width="28" height="20" rx="3" fill="#080510" stroke="#8a4ab0" stroke-width="1.5"/>
    <path d="M24 16 Q24 12 20 12 Q14 12 14 18 Q14 26 20 28 Q26 26 26 22 Q26 18 24 18 Q22 18 22 20" fill="none" stroke="#b090e0" stroke-width="1.5"/>
    <circle cx="28" cy="14" r="3" fill="#c9a84c" opacity="0.8"/>
  </svg>`,

  // Skrzynki
  "Skrzynka z Łupem": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="18" width="28" height="16" rx="2" fill="#8B5E3C"/>
    <rect x="6" y="18" width="28" height="5" rx="2" fill="#A0723A"/>
    <rect x="16" y="16" width="8" height="6" rx="1" fill="#c9a84c"/>
    <line x1="6" y1="23" x2="34" y2="23" stroke="#6b4a28" stroke-width="1"/>
    <line x1="20" y1="18" x2="20" y2="34" stroke="#6b4a28" stroke-width="1"/>
    <path d="M14 20 L20 16 L26 20" stroke="#c9a84c" stroke-width="1.5" fill="none"/>
  </svg>`,

  "Skrzynka Startowa": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="18" width="28" height="16" rx="2" fill="#8a4ab0"/>
    <rect x="6" y="18" width="28" height="5" rx="2" fill="#b060e0"/>
    <rect x="16" y="16" width="8" height="6" rx="1" fill="#f0d040"/>
    <line x1="6" y1="23" x2="34" y2="23" stroke="#6a3a90" stroke-width="1"/>
    <line x1="20" y1="18" x2="20" y2="34" stroke="#6a3a90" stroke-width="1"/>
    <path d="M14 20 L20 15 L26 20" stroke="#f0d040" stroke-width="1.5" fill="none"/>
    <circle cx="20" cy="28" r="3" fill="#f0d040" opacity="0.8"/>
  </svg>`,

  // Hodowla
  "Księżycowy Kamień": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M28 20 Q28 10 20 8 Q26 8 30 14 Q34 20 30 28 Q26 34 20 34 Q28 30 28 20Z" fill="#c0d8f0"/>
    <circle cx="18" cy="20" r="10" fill="#e0eeff" opacity="0.3"/>
    <circle cx="16" cy="18" r="2" fill="#a0b8d0" opacity="0.5"/>
    <circle cx="22" cy="24" r="1.5" fill="#a0b8d0" opacity="0.5"/>
  </svg>`,

  "Złoty Kompas": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="14" stroke="#c9a84c" stroke-width="2" fill="#1a1a0a"/>
    <circle cx="20" cy="20" r="11" stroke="#c9a84c" stroke-width="0.5" fill="none" opacity="0.4"/>
    <path d="M20 10 L22 20 L20 22 L18 20Z" fill="#c9a84c"/>
    <path d="M20 30 L18 20 L20 18 L22 20Z" fill="#888"/>
    <circle cx="20" cy="20" r="2" fill="#c9a84c"/>
  </svg>`,

  // Misc
  "Transporter Konia": `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="24" height="20" rx="3" fill="#404040" stroke="#606060" stroke-width="1.5"/>
    <rect x="10" y="12" width="20" height="14" rx="2" fill="#505050"/>
    <path d="M16 18 Q20 14 24 18 Q24 22 20 24 Q16 22 16 18Z" fill="#8aab84" opacity="0.7"/>
    <circle cx="14" cy="32" r="3" fill="#333" stroke="#555" stroke-width="1"/>
    <circle cx="26" cy="32" r="3" fill="#333" stroke="#555" stroke-width="1"/>
    <rect x="8" y="29" width="24" height="2" fill="#404040"/>
  </svg>`,
};

// Funkcja zwracająca SVG lub emoji fallback
function getItemIcon(name, size=36) {
  let svg = ITEM_ICONS_SVG[name];
  if (!svg) return null;
  return `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center">${svg}</div>`;
}

// Podmień emoji w elementach DOM
function applyItemIcon(el, name, size=36) {
  if (!el) return;
  let svg = ITEM_ICONS_SVG[name];
  if (svg) {
    el.innerHTML = `<div style="width:${size}px;height:${size}px">${svg}</div>`;
  }
}
