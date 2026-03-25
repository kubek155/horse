// =====================
// FIREBASE — Happy Horses
// Używa firebase-compat SDK (globalny firebase obiekt z CDN)
// =====================
(function() {
  const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyC5r2sRvdzHScrzkLcoW5Hw0QTB3mLvBv0",
    authDomain:        "happy-horse-f506c.firebaseapp.com",
    projectId:         "happy-horse-f506c",
    storageBucket:     "happy-horse-f506c.firebasestorage.app",
    messagingSenderId: "1021644315412",
    appId:             "1:1021644315412:web:972b5c5f1ee06a0c254001",
  };

  // Inicjalizuj gdy Firebase SDK jest gotowe
  function waitForFirebaseSDK(cb) {
    if (typeof firebase !== "undefined") { cb(); return; }
    let t = 0;
    const iv = setInterval(() => {
      t += 50;
      if (typeof firebase !== "undefined") { clearInterval(iv); cb(); }
      else if (t > 10000) { clearInterval(iv); console.error("Firebase SDK timeout"); }
    }, 50);
  }

  waitForFirebaseSDK(() => {
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
    } catch(e) {
      // Już zainicjowany
      if (!e.message?.includes("already exists")) console.error(e);
    }

    const auth = firebase.auth();
    const db   = firebase.firestore();
    let currentUser = null;
    let authReady = false;

    // ── Funkcje auth ───────────────────────────────────────
    function getPlayerId()   { return currentUser?.uid || "anon"; }
    function getPlayerNick() { return localStorage.getItem("hh_nick") || currentUser?.displayName || "Gracz"; }
    function isLoggedIn()    { return !!currentUser; }

    async function loginWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      return (await auth.signInWithPopup(provider)).user;
    }
    async function loginAnonymous() {
      return (await auth.signInAnonymously()).user;
    }
    async function loginWithEmail(email, password) {
      return (await auth.signInWithEmailAndPassword(email, password)).user;
    }
    async function registerWithEmail(email, password, nick) {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await result.user.updateProfile({ displayName: nick });
      localStorage.setItem("hh_nick", nick);
      return result.user;
    }
    async function resetPassword(email) {
      await auth.sendPasswordResetEmail(email);
    }
    async function logout() {
      await auth.signOut();
    }

    // ── Profil ────────────────────────────────────────────
    async function savePlayerProfile() {
      if (!currentUser) return;
      try {
        const best = (window.playerHorses||[]).reduce((b,h) => {
          const s = h.stats.speed+h.stats.strength+h.stats.stamina+h.stats.luck;
          return (!b || s > b.stats.speed+b.stats.strength+b.stats.stamina+b.stats.luck) ? h : b;
        }, null);
        await db.collection("players").doc(currentUser.uid).set({
          nick: getPlayerNick(),
          level: typeof getPlayerLevel==="function" ? getPlayerLevel() : 1,
          gold: window.gold||0,
          horseCount: (window.playerHorses||[]).length,
          bestHorse: best ? {name:best.name,flag:best.flag||"🐴",rarity:best.rarity,stats:best.stats} : null,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }, {merge:true});
      } catch(e) { console.warn("saveProfile:", e.message); }
    }

    // ── Globalny Rynek ────────────────────────────────────
    let marketUnsub = null;
    async function listOnGlobalMarket(offer) {
      if (!currentUser) return null;
      const ref = await db.collection("market").add({
        ...offer,
        sellerId:   currentUser.uid,
        sellerNick: getPlayerNick(),
        listedAt:   firebase.firestore.FieldValue.serverTimestamp(),
        active:     true,
      });
      return ref.id;
    }
    async function buyFromGlobalMarket(offerId) {
      if (!currentUser) return;
      const ref  = db.collection("market").doc(offerId);
      const snap = await ref.get();
      if (!snap.exists || !snap.data().active) { window.log?.("⚠️ Oferta niedostępna!"); return; }
      const offer = snap.data();
      if (offer.sellerId === currentUser.uid) { window.log?.("⚠️ To Twoja oferta!"); return; }
      if ((window.gold||0) < offer.price) { window.log?.("⚠️ Za mało złota!"); return; }
      window.gold -= offer.price;
      await ref.update({ active:false, buyerId:currentUser.uid });
      if (offer.type==="horse") {
        if ((window.playerHorses||[]).length >= (window.STABLE_LIMIT||8))
          window.inventory?.push({name:"Transporter Konia",obtained:Date.now(),horse:offer.horse});
        else window.playerHorses?.push(offer.horse);
      } else { window.inventory?.push(offer.item); }
      window.saveGame?.(); window.renderAll?.();
    }
    async function cancelGlobalListing(offerId) {
      if (!currentUser) return;
      const snap = await db.collection("market").doc(offerId).get();
      if (!snap.exists || snap.data().sellerId !== currentUser.uid) return;
      const offer = snap.data();
      if (offer.type==="horse") window.playerHorses?.push(offer.horse);
      else window.inventory?.push(offer.item);
      await db.collection("market").doc(offerId).update({active:false});
      window.saveGame?.(); window.renderAll?.();
    }
    function subscribeGlobalMarket(callback) {
      if (marketUnsub) { marketUnsub(); marketUnsub = null; }
      marketUnsub = db.collection("market")
        .where("active","==",true)
        .limit(100)
        .onSnapshot(snap => {
          callback(snap.docs.map(d => ({id:d.id, ...d.data()})));
        }, err => console.warn("market snapshot:", err.message));
      return () => { if(marketUnsub) marketUnsub(); };
    }

    // ── Turnieje ──────────────────────────────────────────
    const TOURNAMENT_SCHEDULE = [
      {hour:12,minute:0,type:"sprint",    name:"Południowy Sprint"},
      {hour:18,minute:0,type:"endurance", name:"Wieczorny Maraton"},
      {hour:20,minute:0,type:"strength",  name:"Nocna Próba Siły"},
      {hour:22,minute:0,type:"grand_prix",name:"Nocne Grand Prix"},
    ];
    function getNextTournament() {
      const now=new Date(); let best=null, bestDiff=Infinity;
      TOURNAMENT_SCHEDULE.forEach(t => {
        const next=new Date(now); next.setHours(t.hour,t.minute,0,0);
        if (next<=now) next.setDate(next.getDate()+1);
        const diff=next-now;
        if (diff<bestDiff) { bestDiff=diff; best={...t,nextTime:next,msLeft:diff}; }
      });
      return best;
    }
    async function registerForTournament(horse, tournamentId) {
      if (!currentUser) return;
      await db.collection("tournaments").doc(tournamentId)
        .collection("entries").doc(currentUser.uid).set({
          playerId: currentUser.uid, playerNick: getPlayerNick(),
          horse: {name:horse.name,flag:horse.flag||"🐴",rarity:horse.rarity,stats:horse.stats},
          registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
    }
    async function unregisterFromTournament(tournamentId) {
      if (!currentUser) return;
      await db.collection("tournaments").doc(tournamentId)
        .collection("entries").doc(currentUser.uid).delete();
    }
    function subscribeTournamentEntries(tournamentId, callback) {
      return db.collection("tournaments").doc(tournamentId)
        .collection("entries")
        .onSnapshot(snap => callback(snap.docs.map(d=>({id:d.id,...d.data()}))));
    }
    async function fetchGlobalRanking() {
      const snap = await db.collection("players").orderBy("level","desc").limit(20).get();
      return snap.docs.map(d => ({id:d.id,...d.data()}));
    }

    // ── Auth State ────────────────────────────────────────
    auth.onAuthStateChanged(async (user) => {
      currentUser = user;

      if (!authReady) {
        // Pierwsze wywołanie — gra już działa, tylko obsłuż stan
        authReady = true;
        if (!user) {
          // Niezalogowany — pokaż ekran logowania
          setTimeout(() => {
            if (typeof showMandatoryLogin === "function") showMandatoryLogin();
          }, 500);
          return;
        }
      }

      if (user) {
        // Wczytaj nick z Firestore
        try {
          const snap = await db.collection("players").doc(user.uid).get();
          if (snap.exists && snap.data().nick) localStorage.setItem("hh_nick", snap.data().nick);
        } catch(e) {}
        if (!user.isAnonymous && user.displayName && !localStorage.getItem("hh_nick"))
          localStorage.setItem("hh_nick", user.displayName.split(" ")[0]);
        savePlayerProfile();
        window.dispatchEvent(new CustomEvent("hh_logged_in"));
      } else {
        window.dispatchEvent(new CustomEvent("hh_logged_out"));
      }
    });

    // ── Eksport ───────────────────────────────────────────
    window.FB = {
      getPlayerId, getPlayerNick, isLoggedIn, savePlayerProfile,
      loginWithGoogle, loginAnonymous, loginWithEmail, registerWithEmail, resetPassword, logout,
      listOnGlobalMarket, buyFromGlobalMarket, cancelGlobalListing, subscribeGlobalMarket,
      registerForTournament, unregisterFromTournament, subscribeTournamentEntries,
      getNextTournament, fetchGlobalRanking, db,
    };

    console.log("✅ Firebase załadowany");
    setInterval(() => { if(currentUser) savePlayerProfile(); }, 60000);
  });
})();
