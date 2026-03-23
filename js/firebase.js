// =====================
// FIREBASE — Happy Horses
// =====================
import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs,
         onSnapshot, query, where, orderBy, limit,
         serverTimestamp, deleteDoc, updateDoc, addDoc }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInAnonymously, signInWithPopup,
         GoogleAuthProvider, onAuthStateChanged, signOut,
         createUserWithEmailAndPassword, signInWithEmailAndPassword,
         updateProfile, sendPasswordResetEmail }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const auth  = getAuth(fbApp);

let currentUser = null;

// ── Logowanie ─────────────────────────────────────────────
async function loginWithGoogle() {
  try {
    let provider = new GoogleAuthProvider();
    let result   = await signInWithPopup(auth, provider);
    return result.user;
  } catch(e) {
    console.error("Login error:", e);
    // Fallback do anonimowego
    return loginAnonymous();
  }
}

async function loginAnonymous() {
  let result = await signInAnonymously(auth);
  return result.user;
}

async function registerWithEmail(email, password, nick) {
  let result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: nick });
  localStorage.setItem("hh_nick", nick);
  return result.user;
}

async function loginWithEmail(email, password) {
  let result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

async function logout() {
  await signOut(auth);
  currentUser = null;
  renderFirebaseStatus();
}

// Nasłuchuj zmian auth
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    // Załaduj profil z Firestore
    let snap = await getDoc(doc(db,"players",user.uid));
    if (snap.exists()) {
      let data = snap.data();
      if (data.nick) localStorage.setItem("hh_nick", data.nick);
    }
    // Jeśli Google — ustaw nick z displayName jeśli brak
    if (!user.isAnonymous && user.displayName && !localStorage.getItem("hh_nick")) {
      localStorage.setItem("hh_nick", user.displayName.split(" ")[0]);
    }
    await savePlayerProfile();
    if (typeof initGlobalMarket === "function") initGlobalMarket();
    // Zamknij ekran logowania
    if (typeof closeMandatoryLogin === "function") closeMandatoryLogin();
    // Odśwież cały UI natychmiast
    if (typeof renderAll === "function") setTimeout(renderAll, 100);
    if (typeof renderFirebaseStatus === "function") setTimeout(renderFirebaseStatus, 100);
    if (typeof initGlobalMarket === "function") setTimeout(initGlobalMarket, 500);
  } else {
    // Wylogowany — pokaż ekran logowania (z opóźnieniem żeby gra zdążyła się załadować)
    if (typeof showMandatoryLogin === "function") {
      setTimeout(showMandatoryLogin, 800);
    }
  }
  if (typeof renderFirebaseStatus === "function") renderFirebaseStatus();
});

function getPlayerId()   { return currentUser?.uid || localStorage.getItem("hh_player_id") || "anon"; }
function getPlayerNick() { return localStorage.getItem("hh_nick") || currentUser?.displayName || "Gracz"; }
function isLoggedIn()    { return !!currentUser && !currentUser.isAnonymous; }

// ── Profil ────────────────────────────────────────────────
async function savePlayerProfile() {
  if (!currentUser) return;
  let bestHorse = playerHorses.length > 0
    ? playerHorses.reduce((b,h)=>{
        let s=h.stats.speed+h.stats.strength+h.stats.stamina+h.stats.luck;
        let bs=b.stats.speed+b.stats.strength+b.stats.stamina+b.stats.luck;
        return s>bs?h:b;
      }, playerHorses[0])
    : null;
  await setDoc(doc(db,"players",currentUser.uid), {
    nick:       getPlayerNick(),
    email:      currentUser.email||null,
    avatar:     currentUser.photoURL||null,
    level:      typeof getPlayerLevel==="function"?getPlayerLevel():1,
    gold:       gold||0,
    horseCount: playerHorses.length,
    bestHorse:  bestHorse?{name:bestHorse.name,flag:bestHorse.flag||"🐴",rarity:bestHorse.rarity,stats:bestHorse.stats}:null,
    updatedAt:  serverTimestamp(),
  }, { merge:true });
}

// ── Globalny Rynek ────────────────────────────────────────
let marketUnsub = null;

async function listOnGlobalMarket(offer) {
  if (!currentUser) { openLoginModal(); return; }
  let ref = await addDoc(collection(db,"market"), {
    ...offer,
    sellerId:   getPlayerId(),
    sellerNick: getPlayerNick(),
    listedAt:   serverTimestamp(),
    active:     true,
  });
  return ref.id;
}

async function buyFromGlobalMarket(offerId) {
  if (!currentUser) { openLoginModal(); return; }
  let ref  = doc(db,"market",offerId);
  let snap = await getDoc(ref);
  if (!snap.exists()||!snap.data().active) { log("⚠️ Oferta niedostępna!"); if(typeof renderGlobalMarket==="function")renderGlobalMarket(); return; }
  let offer = snap.data();
  if (offer.sellerId===getPlayerId()) { log("⚠️ To Twoja oferta!"); return; }
  if (gold<offer.price) { log("⚠️ Za mało złota!"); return; }
  gold -= offer.price;
  await updateDoc(ref,{active:false,buyerId:getPlayerId(),buyerNick:getPlayerNick()});
  if (offer.type==="horse") {
    if (playerHorses.length>=STABLE_LIMIT) {
      inventory.push({name:"Transporter Konia",obtained:Date.now(),horse:offer.horse});
      log(`🧳 Stajnia pełna! ${offer.horse?.name} trafił do Transportera.`);
    } else { playerHorses.push(offer.horse); log(`🐴 Kupiono: ${offer.horse?.name}!`); }
  } else {
    inventory.push(offer.item);
    log(`✅ Kupiono: ${offer.item?.name}!`);
  }
  saveGame();
  if (typeof renderAll === "function") renderAll();
  if (typeof renderGlobalMarket === "function") setTimeout(renderGlobalMarket, 200);
}

async function cancelGlobalListing(offerId) {
  if (!currentUser) return;
  let snap = await getDoc(doc(db,"market",offerId));
  if (!snap.exists()) return;
  let offer = snap.data();
  if (offer.sellerId!==getPlayerId()) { log("⚠️ To nie Twoja oferta!"); return; }
  if (offer.type==="horse") playerHorses.push(offer.horse);
  else inventory.push(offer.item);
  await updateDoc(doc(db,"market",offerId),{active:false});
  log("✅ Oferta anulowana."); saveGame();
  if (typeof renderAll === "function") renderAll();
  if (typeof renderGlobalMarket === "function") setTimeout(renderGlobalMarket, 200);
}

function subscribeGlobalMarket(callback) {
  if (marketUnsub) marketUnsub();
  let q = query(collection(db,"market"),where("active","==",true),orderBy("listedAt","desc"),limit(100));
  marketUnsub = onSnapshot(q, snap=>{
    callback(snap.docs.map(d=>({id:d.id,...d.data()})));
  });
  return marketUnsub;
}

// ── Turnieje ──────────────────────────────────────────────
const TOURNAMENT_SCHEDULE = [
  {hour:12,minute:0, type:"sprint",    name:"Południowy Sprint"},
  {hour:18,minute:0, type:"endurance", name:"Wieczorny Maraton"},
  {hour:20,minute:0, type:"strength",  name:"Nocna Próba Siły"},
  {hour:22,minute:0, type:"grand_prix",name:"Nocne Grand Prix"},
];

function getNextTournament() {
  let now=new Date(), best=null, bestDiff=Infinity;
  TOURNAMENT_SCHEDULE.forEach(t=>{
    let next=new Date(now); next.setHours(t.hour,t.minute,0,0);
    if(next<=now) next.setDate(next.getDate()+1);
    let diff=next-now;
    if(diff<bestDiff){bestDiff=diff;best={...t,nextTime:next,msLeft:diff};}
  });
  return best;
}

async function registerForTournament(horse, tournamentId, fee) {
  if (!currentUser) { openLoginModal(); return; }
  await setDoc(doc(db,"tournaments",tournamentId,"entries",getPlayerId()),{
    playerId:getPlayerId(), playerNick:getPlayerNick(),
    horse:{name:horse.name,flag:horse.flag||"🐴",rarity:horse.rarity,stats:horse.stats,breedKey:horse.breedKey||horse.name},
    registeredAt:serverTimestamp(),
  });
  log(`🏆 ${horse.name} zapisany do turnieju!`);
}

async function unregisterFromTournament(tournamentId) {
  await deleteDoc(doc(db,"tournaments",tournamentId,"entries",getPlayerId()));
  log("✅ Wypisano z turnieju.");
}

function subscribeTournamentEntries(tournamentId, callback) {
  return onSnapshot(collection(db,"tournaments",tournamentId,"entries"), snap=>{
    callback(snap.docs.map(d=>({id:d.id,...d.data()})));
  });
}

async function runTournament(tournamentId, contestType) {
  let snap    = await getDocs(collection(db,"tournaments",tournamentId,"entries"));
  let entries = snap.docs.map(d=>({id:d.id,...d.data()}));
  if (!entries.length) return;
  let results = entries.map(e=>({...e,score:calcContestScoreFromStats(e.horse?.stats||{},contestType)})).sort((a,b)=>b.score-a.score);
  await setDoc(doc(db,"tournaments",tournamentId),{
    type:contestType.id, name:contestType.name, finishedAt:serverTimestamp(),
    results:results.slice(0,20).map((r,i)=>({place:i+1,playerId:r.playerId,playerNick:r.playerNick,horseName:r.horse?.name,horseFlag:r.horse?.flag,rarity:r.horse?.rarity,score:Math.round(r.score)})),
  });
  let myIdx = results.findIndex(r=>r.playerId===getPlayerId());
  if (myIdx>=0) {
    let prize = (contestType.prizes||[2000,1000,500])[myIdx]||0;
    if(prize>0){gold+=prize;saveGame();log(`🏆 Turniej! Miejsce #${myIdx+1} · +💰${prize}`);}
    else log(`🏁 Turniej zakończony! Miejsce #${myIdx+1}`);
    renderAll();
  }
}

function calcContestScoreFromStats(stats, type) {
  if(!type||type.id==="grand_prix") return (stats.speed+stats.strength+stats.stamina+stats.luck||0)*(0.7+Math.random()*0.3);
  let main=stats[type.stat]||0, luck=stats.luck*(type.luckWeight||0.15), sta=stats.stamina*(type.staminaWeight||0.15);
  return main*(type.statWeight||0.7)*(0.875+Math.random()*0.25)+luck+sta;
}

let tournamentWatcher = null;
function startTournamentWatcher() {
  if (tournamentWatcher) clearInterval(tournamentWatcher);
  tournamentWatcher = setInterval(async()=>{
    let now=new Date();
    for(let t of TOURNAMENT_SCHEDULE){
      if(now.getHours()===t.hour&&now.getMinutes()===t.minute&&now.getSeconds()<10){
        let tId=`${t.type}_${now.toISOString().slice(0,10)}_${t.hour}`;
        let ct=typeof CONTEST_TYPES!=="undefined"?CONTEST_TYPES.find(c=>c.id===t.type):null;
        if(ct) await runTournament(tId,ct);
      }
    }
  },10000);
}

// ── Ranking ───────────────────────────────────────────────
async function fetchGlobalRanking() {
  let snap = await getDocs(query(collection(db,"players"),orderBy("level","desc"),limit(20)));
  return snap.docs.map(d=>({id:d.id,...d.data()}));
}

// ── Eksport ───────────────────────────────────────────────
window.FB = {
  getPlayerId, getPlayerNick, isLoggedIn, savePlayerProfile,
  loginWithGoogle, loginAnonymous, loginWithEmail, registerWithEmail, resetPassword, logout,
  listOnGlobalMarket, buyFromGlobalMarket, cancelGlobalListing, subscribeGlobalMarket,
  registerForTournament, unregisterFromTournament, subscribeTournamentEntries,
  getNextTournament, runTournament, startTournamentWatcher,
  fetchGlobalRanking, calcContestScoreFromStats, db,
};

startTournamentWatcher();
