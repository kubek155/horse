// =====================
// FIREBASE — Happy Horses
// =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot,
         query, where, orderBy, limit, serverTimestamp, deleteDoc, updateDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyC5r2sRvdzHScrzkLcoW5Hw0QTB3mLvBv0",
  authDomain:        "happy-horse-f506c.firebaseapp.com",
  projectId:         "happy-horse-f506c",
  storageBucket:     "happy-horse-f506c.firebasestorage.app",
  messagingSenderId: "1021644315412",
  appId:             "1:1021644315412:web:972b5c5f1ee06a0c254001",
};

const fbApp = initializeApp(firebaseConfig);
const db    = getFirestore(fbApp);

// ── ID gracza (generowany raz, zapisywany w localStorage) ──
function getPlayerId() {
  let id = localStorage.getItem("hh_player_id");
  if (!id) {
    id = "p_" + Date.now() + "_" + Math.random().toString(36).slice(2,8);
    localStorage.setItem("hh_player_id", id);
  }
  return id;
}
function getPlayerNick() { return localStorage.getItem("hh_nick") || "Gracz"; }

// =====================
// PROFIL GRACZA
// =====================
async function savePlayerProfile() {
  let id  = getPlayerId();
  let lvl = typeof getPlayerLevel === "function" ? getPlayerLevel() : 1;
  let bestHorse = playerHorses.length > 0
    ? playerHorses.reduce((b,h) => {
        let s = h.stats.speed+h.stats.strength+h.stats.stamina+h.stats.luck;
        let bs= b.stats.speed+b.stats.strength+b.stats.stamina+b.stats.luck;
        return s>bs?h:b;
      }, playerHorses[0])
    : null;

  await setDoc(doc(db,"players",id), {
    nick:       getPlayerNick(),
    level:      lvl,
    gold:       gold,
    horseCount: playerHorses.length,
    bestHorse:  bestHorse ? {
      name:   bestHorse.name,
      flag:   bestHorse.flag||"🐴",
      rarity: bestHorse.rarity,
      stats:  bestHorse.stats,
    } : null,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// =====================
// GLOBALNY RYNEK FIREBASE
// =====================
let marketUnsubscribe = null;

// Wystaw przedmiot/konia na globalny rynek
async function listOnGlobalMarket(offer) {
  let id = getPlayerId();
  let docId = `${id}_${Date.now()}`;
  await setDoc(doc(db, "market", docId), {
    ...offer,
    sellerId:   id,
    sellerNick: getPlayerNick(),
    listedAt:   serverTimestamp(),
    active:     true,
  });
  log(`🌐 Wystawiono na globalny rynek!`);
}

// Kup z globalnego rynku
async function buyFromGlobalMarket(offerId) {
  let offerRef = doc(db, "market", offerId);
  let snap     = await getDoc(offerRef);
  if (!snap.exists() || !snap.data().active) {
    log("⚠️ Oferta już niedostępna!");
    renderGlobalMarket();
    return;
  }
  let offer = snap.data();
  if (gold < offer.price) { log("⚠️ Za mało złota!"); return; }

  gold -= offer.price;
  await updateDoc(offerRef, { active: false, buyerId: getPlayerId(), buyerNick: getPlayerNick() });

  // Dodaj przedmiot/konia lokalnie
  if (offer.type === "horse") {
    if (playerHorses.length >= STABLE_LIMIT) {
      inventory.push({ name:"Transporter Konia", obtained:Date.now(), horse: offer.horse });
      log(`🧳 Stajnia pełna! Koń trafił do Transportera.`);
    } else {
      playerHorses.push(offer.horse);
      log(`🐴 Kupiono: ${offer.horse.name}!`);
    }
  } else {
    inventory.push(offer.item);
    log(`✅ Kupiono: ${offer.item.name}!`);
  }
  saveGame(); renderAll();
}

// Anuluj własną ofertę
async function cancelGlobalListing(offerId) {
  let snap = await getDoc(doc(db, "market", offerId));
  if (!snap.exists()) return;
  let offer = snap.data();
  // Zwróć przedmiot
  if (offer.type === "horse") playerHorses.push(offer.horse);
  else inventory.push(offer.item);
  await deleteDoc(doc(db, "market", offerId));
  log("✅ Oferta anulowana — przedmiot zwrócony.");
  saveGame(); renderAll();
}

// Nasłuchuj rynku w czasie rzeczywistym
function subscribeGlobalMarket(callback) {
  if (marketUnsubscribe) marketUnsubscribe();
  let q = query(
    collection(db, "market"),
    where("active","==",true),
    orderBy("listedAt","desc"),
    limit(100)
  );
  marketUnsubscribe = onSnapshot(q, snap => {
    let offers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(offers);
  });
}

// =====================
// SYSTEM TURNIEJÓW
// =====================

// Harmonogram — turnieje o stałych godzinach
const TOURNAMENT_SCHEDULE = [
  { hour:12, minute:0,  type:"sprint",    name:"Południowy Sprint" },
  { hour:18, minute:0,  type:"endurance", name:"Wieczorny Maraton" },
  { hour:20, minute:0,  type:"strength",  name:"Nocna Próba Siły"  },
  { hour:22, minute:0,  type:"grand_prix",name:"Nocne Grand Prix"  },
];

// Oblicz następny turniej
function getNextTournament() {
  let now  = new Date();
  let best = null, bestDiff = Infinity;
  TOURNAMENT_SCHEDULE.forEach(t => {
    let next = new Date(now);
    next.setHours(t.hour, t.minute, 0, 0);
    if (next <= now) next.setDate(next.getDate()+1);
    let diff = next-now;
    if (diff < bestDiff) { bestDiff=diff; best={...t, nextTime:next, msLeft:diff}; }
  });
  return best;
}

// Zapisz konia do turnieju
async function registerForTournament(horse, tournamentId) {
  let id  = getPlayerId();
  let ref = doc(db, "tournaments", tournamentId, "entries", id);
  await setDoc(ref, {
    playerId:   id,
    playerNick: getPlayerNick(),
    horse: {
      name:     horse.name,
      flag:     horse.flag||"🐴",
      rarity:   horse.rarity,
      stats:    horse.stats,
      breedKey: horse.breedKey||horse.name,
    },
    registeredAt: serverTimestamp(),
  });
  log(`🏆 ${horse.name} zapisany do turnieju!`);
}

// Wypisz konia z turnieju
async function unregisterFromTournament(tournamentId) {
  let id = getPlayerId();
  await deleteDoc(doc(db,"tournaments",tournamentId,"entries",id));
  log("✅ Wypisano z turnieju.");
}

// Nasłuchuj wpisów do turnieju
function subscribeTournamentEntries(tournamentId, callback) {
  let q = collection(db, "tournaments", tournamentId, "entries");
  return onSnapshot(q, snap => {
    let entries = snap.docs.map(d => ({ id:d.id, ...d.data() }));
    callback(entries);
  });
}

// Rozegraj turniej (uruchamiany gdy nadejdzie czas)
async function runTournament(tournamentId, contestType) {
  let entriesSnap = await getDocs(collection(db,"tournaments",tournamentId,"entries"));
  let entries     = entriesSnap.docs.map(d=>({id:d.id,...d.data()}));
  if (entries.length === 0) return;

  // Oblicz wyniki
  let results = entries.map(e => {
    let score = calcContestScoreFromStats(e.horse.stats, contestType);
    return { ...e, score };
  }).sort((a,b)=>b.score-a.score);

  // Zapisz wyniki do Firebase
  await setDoc(doc(db,"tournaments",tournamentId), {
    type:      contestType.id,
    name:      contestType.name,
    results:   results.slice(0,20).map((r,i)=>({
      place:      i+1,
      playerId:   r.playerId,
      playerNick: r.playerNick,
      horseName:  r.horse.name,
      horseFlag:  r.horse.flag,
      rarity:     r.horse.rarity,
      score:      Math.round(r.score),
    })),
    finishedAt: serverTimestamp(),
    entryCount: entries.length,
  });

  // Nagrody dla gracza jeśli brał udział
  let myId    = getPlayerId();
  let myEntry = results.findIndex(r=>r.playerId===myId);
  if (myEntry >= 0) {
    let place  = myEntry+1;
    let prizes = contestType.prizes || [2000,1000,500];
    let prize  = prizes[place-1] || 0;
    if (prize>0) {
      gold += prize;
      saveGame();
      log(`🏆 Turniej zakończony! Twoje miejsce: #${place} · +💰${prize}`);
    } else {
      log(`🏁 Turniej zakończony! Twoje miejsce: #${place}`);
    }
    renderAll();
  }
}

function calcContestScoreFromStats(stats, contestType) {
  if (!contestType || contestType.id === "grand_prix") {
    return (stats.speed+stats.strength+stats.stamina+stats.luck) * (0.6+Math.random()*0.4);
  }
  let main = stats[contestType.stat] || 0;
  let luck = stats.luck * (contestType.luckWeight||0.15);
  let sta  = stats.stamina * (contestType.staminaWeight||0.15);
  return main*(contestType.statWeight||0.7)*(0.875+Math.random()*0.25) + luck + sta;
}

// Sprawdzaj czy czas turnieju nadszedł (co minutę)
let tournamentCheckInterval = null;
function startTournamentWatcher() {
  if (tournamentCheckInterval) clearInterval(tournamentCheckInterval);
  tournamentCheckInterval = setInterval(async () => {
    let now  = new Date();
    for (let t of TOURNAMENT_SCHEDULE) {
      if (now.getHours()===t.hour && now.getMinutes()===t.minute && now.getSeconds()<10) {
        let tId = `${t.type}_${now.toISOString().slice(0,10)}_${t.hour}`;
        let contestType = typeof CONTEST_TYPES!=="undefined"
          ? CONTEST_TYPES.find(c=>c.id===t.type) : null;
        if (contestType) {
          await runTournament(tId, contestType);
        }
      }
    }
  }, 10000); // co 10 sekund
}

// =====================
// GLOBALNY RANKING
// =====================
async function fetchGlobalRanking() {
  let snap = await getDocs(query(
    collection(db,"players"),
    orderBy("level","desc"),
    limit(20)
  ));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}

// =====================
// EKSPORT — dostępne globalnie
// =====================
window.FB = {
  getPlayerId, getPlayerNick, savePlayerProfile,
  listOnGlobalMarket, buyFromGlobalMarket, cancelGlobalListing, subscribeGlobalMarket,
  registerForTournament, unregisterFromTournament, subscribeTournamentEntries,
  getNextTournament, runTournament, startTournamentWatcher,
  fetchGlobalRanking, db,
};

// Auto-start watchers
startTournamentWatcher();
setTimeout(() => savePlayerProfile(), 3000);
