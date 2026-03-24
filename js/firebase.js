// =====================
// FIREBASE — Happy Horses (zwykły skrypt, nie moduł ES)
// =====================

// Ładuje Firebase SDK przez dynamiczny import
(function() {
  // Wczytaj Firebase jako moduł ale eksportuj do window.FB od razu
  const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyC5r2sRvdzHScrzkLcoW5Hw0QTB3mLvBv0",
    authDomain:        "happy-horse-f506c.firebaseapp.com",
    projectId:         "happy-horse-f506c",
    storageBucket:     "happy-horse-f506c.firebasestorage.app",
    messagingSenderId: "1021644315412",
    appId:             "1:1021644315412:web:972b5c5f1ee06a0c254001",
  };

  async function initFirebase() {
    try {
      const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
      const { getFirestore, collection, doc, setDoc, getDoc, getDocs,
              onSnapshot, query, where, orderBy, limit,
              serverTimestamp, deleteDoc, updateDoc, addDoc }
        = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
      const { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider,
              onAuthStateChanged, signOut,
              createUserWithEmailAndPassword, signInWithEmailAndPassword,
              updateProfile, sendPasswordResetEmail }
        = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

      const app  = initializeApp(FIREBASE_CONFIG);
      const db   = getFirestore(app);
      const auth = getAuth(app);
      let currentUser = null;

      // ── Auth ──────────────────────────────────────────────
      function getPlayerId()   { return currentUser?.uid || "anon_" + (localStorage.getItem("hh_anon_id") || Math.random().toString(36).slice(2)); }
      function getPlayerNick() { return localStorage.getItem("hh_nick") || currentUser?.displayName || "Gracz"; }
      function isLoggedIn()    { return !!currentUser; }

      async function loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        return (await signInWithPopup(auth, provider)).user;
      }
      async function loginAnonymous() {
        return (await signInAnonymously(auth)).user;
      }
      async function loginWithEmail(email, password) {
        return (await signInWithEmailAndPassword(auth, email, password)).user;
      }
      async function registerWithEmail(email, password, nick) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: nick });
        localStorage.setItem("hh_nick", nick);
        return result.user;
      }
      async function resetPassword(email) {
        await sendPasswordResetEmail(auth, email);
      }
      async function logout() {
        await signOut(auth);
      }

      // ── Profil ────────────────────────────────────────────
      async function savePlayerProfile() {
        if (!currentUser) return;
        try {
          const best = (window.playerHorses||[]).reduce((b,h) => {
            const s = h.stats.speed+h.stats.strength+h.stats.stamina+h.stats.luck;
            const bs= b ? b.stats.speed+b.stats.strength+b.stats.stamina+b.stats.luck : -1;
            return s>bs?h:b;
          }, null);
          await setDoc(doc(db,"players",currentUser.uid), {
            nick: getPlayerNick(),
            level: typeof getPlayerLevel==="function"?getPlayerLevel():1,
            gold: window.gold||0,
            horseCount: (window.playerHorses||[]).length,
            bestHorse: best ? {name:best.name,flag:best.flag||"🐴",rarity:best.rarity,stats:best.stats} : null,
            updatedAt: serverTimestamp(),
          }, {merge:true});
        } catch(e) { console.warn("saveProfile error:", e); }
      }

      // ── Rynek ─────────────────────────────────────────────
      let marketUnsub = null;
      async function listOnGlobalMarket(offer) {
        if (!currentUser) { window.openLoginModal?.(); return null; }
        const ref = await addDoc(collection(db,"market"), {
          ...offer, sellerId:currentUser.uid,
          sellerNick:getPlayerNick(), listedAt:serverTimestamp(), active:true,
        });
        return ref.id;
      }
      async function buyFromGlobalMarket(offerId) {
        if (!currentUser) { window.openLoginModal?.(); return; }
        const ref  = doc(db,"market",offerId);
        const snap = await getDoc(ref);
        if (!snap.exists()||!snap.data().active) { window.log?.("⚠️ Oferta niedostępna!"); return; }
        const offer = snap.data();
        if (offer.sellerId===currentUser.uid) { window.log?.("⚠️ To Twoja oferta!"); return; }
        if ((window.gold||0) < offer.price) { window.log?.("⚠️ Za mało złota!"); return; }
        window.gold -= offer.price;
        await updateDoc(ref,{active:false,buyerId:currentUser.uid});
        if (offer.type==="horse") {
          if ((window.playerHorses||[]).length >= (window.STABLE_LIMIT||8)) {
            window.inventory?.push({name:"Transporter Konia",obtained:Date.now(),horse:offer.horse});
          } else { window.playerHorses?.push(offer.horse); }
        } else { window.inventory?.push(offer.item); }
        window.saveGame?.(); window.renderAll?.();
      }
      async function cancelGlobalListing(offerId) {
        if (!currentUser) return;
        const snap = await getDoc(doc(db,"market",offerId));
        if (!snap.exists()) return;
        const offer = snap.data();
        if (offer.sellerId!==currentUser.uid) return;
        if (offer.type==="horse") window.playerHorses?.push(offer.horse);
        else window.inventory?.push(offer.item);
        await updateDoc(doc(db,"market",offerId),{active:false});
        window.saveGame?.(); window.renderAll?.();
      }
      function subscribeGlobalMarket(callback) {
        if (marketUnsub) marketUnsub();
        const q = query(collection(db,"market"),where("active","==",true),orderBy("listedAt","desc"),limit(100));
        marketUnsub = onSnapshot(q, snap => callback(snap.docs.map(d=>({id:d.id,...d.data()}))));
        return marketUnsub;
      }

      // ── Turnieje ──────────────────────────────────────────
      const TOURNAMENT_SCHEDULE = [
        {hour:12,minute:0,type:"sprint",   name:"Południowy Sprint"},
        {hour:18,minute:0,type:"endurance",name:"Wieczorny Maraton"},
        {hour:20,minute:0,type:"strength", name:"Nocna Próba Siły"},
        {hour:22,minute:0,type:"grand_prix",name:"Nocne Grand Prix"},
      ];
      function getNextTournament() {
        const now=new Date(); let best=null, bestDiff=Infinity;
        TOURNAMENT_SCHEDULE.forEach(t=>{
          const next=new Date(now); next.setHours(t.hour,t.minute,0,0);
          if(next<=now) next.setDate(next.getDate()+1);
          const diff=next-now;
          if(diff<bestDiff){bestDiff=diff;best={...t,nextTime:next,msLeft:diff};}
        });
        return best;
      }
      async function registerForTournament(horse, tournamentId) {
        if (!currentUser) return;
        await setDoc(doc(db,"tournaments",tournamentId,"entries",currentUser.uid),{
          playerId:currentUser.uid, playerNick:getPlayerNick(),
          horse:{name:horse.name,flag:horse.flag||"🐴",rarity:horse.rarity,stats:horse.stats,breedKey:horse.breedKey||horse.name},
          registeredAt:serverTimestamp(),
        });
      }
      async function unregisterFromTournament(tournamentId) {
        if (!currentUser) return;
        await deleteDoc(doc(db,"tournaments",tournamentId,"entries",currentUser.uid));
      }
      function subscribeTournamentEntries(tournamentId, callback) {
        return onSnapshot(collection(db,"tournaments",tournamentId,"entries"),
          snap => callback(snap.docs.map(d=>({id:d.id,...d.data()}))));
      }
      async function fetchGlobalRanking() {
        const snap = await getDocs(query(collection(db,"players"),orderBy("level","desc"),limit(20)));
        return snap.docs.map(d=>({id:d.id,...d.data()}));
      }

      // ── onAuthStateChanged ────────────────────────────────
      onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
          try {
            const snap = await getDoc(doc(db,"players",user.uid));
            if (snap.exists() && snap.data().nick) localStorage.setItem("hh_nick", snap.data().nick);
          } catch(e) {}
          if (!user.isAnonymous && user.displayName && !localStorage.getItem("hh_nick")) {
            localStorage.setItem("hh_nick", user.displayName.split(" ")[0]);
          }
          savePlayerProfile();
          // Powiadom grę
          window.dispatchEvent(new CustomEvent("hh_logged_in"));
        } else {
          window.dispatchEvent(new CustomEvent("hh_logged_out"));
        }
      });

      // ── Eksport do window.FB ──────────────────────────────
      window.FB = {
        getPlayerId, getPlayerNick, isLoggedIn, savePlayerProfile,
        loginWithGoogle, loginAnonymous, loginWithEmail, registerWithEmail, resetPassword, logout,
        listOnGlobalMarket, buyFromGlobalMarket, cancelGlobalListing, subscribeGlobalMarket,
        registerForTournament, unregisterFromTournament, subscribeTournamentEntries,
        getNextTournament, fetchGlobalRanking, db,
      };

      console.log("✅ Firebase załadowany");

      // Auto-sync co 60s
      setInterval(() => { if(currentUser) savePlayerProfile(); }, 60000);

    } catch(err) {
      console.error("Firebase init error:", err);
    }
  }

  // Odpal inicjalizację
  initFirebase();
})();
