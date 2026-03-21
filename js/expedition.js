<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<title>Horse Game</title>

<style>
body {
  margin:0;
  font-family:Arial;
  background:#0f2f2f;
  color:white;
}

/* GRID */
.container {
  display:grid;
  grid-template-columns:220px 1fr 250px;
  grid-template-rows:70px 1fr;
  height:100vh;
}

/* LEWY PANEL */
.sidebar {
  background:#123c3c;
  padding:15px;
}

.menu-item {
  margin:10px 0;
  padding:12px;
  background:#1f5f5f;
  border-radius:10px;
  cursor:pointer;
  transition:0.2s;
}

.menu-item:hover {
  background:#2a7a7a;
}

/* GÓRA */
.topbar {
  grid-column:2/4;
  background:#1f5f5f;
  display:flex;
  align-items:center;
  padding-left:20px;
  font-weight:bold;
  font-size:20px;
}

/* ŚRODEK */
.main {
  background:#e6f2f2;
  color:black;
  padding:20px;
  overflow:auto;
}

/* PRAWA KOLUMNA */
.rightbar {
  background:#123c3c;
  padding:15px;
}

/* KARTY */
.card {
  background:white;
  padding:15px;
  margin:10px 0;
  border-radius:12px;
  box-shadow:0 4px 10px rgba(0,0,0,0.2);
}

/* PRZYCISKI */
button {
  padding:10px;
  margin:5px;
  border:none;
  border-radius:8px;
  cursor:pointer;
  background:#1f5f5f;
  color:white;
}

button:hover {
  background:#2a7a7a;
}
</style>
</head>

<body>

<div class="container">

<!-- LEWY PANEL -->
<div class="sidebar">
<h3>🐎 Gracz</h3>
Konie: <span id="horseCount">0</span>

<div class="menu-item" onclick="showSection('expedition')">🌍 Wyprawa</div>
<div class="menu-item" onclick="showSection('stable')">🐎 Stajnia</div>
<div class="menu-item" onclick="showSection('inventory')">🎒 Ekwipunek</div>
</div>

<!-- TOP -->
<div class="topbar">🐎 HAPPY HORSES</div>

<!-- MAIN -->
<div class="main">

<div id="expeditionSection">
<h2>🌍 Wyprawy</h2>

<div class="card">
<h3>Wybierz krainę</h3>
<div id="locations"></div>
</div>

<div class="card">
<h3>Aktywne wyprawy</h3>
<div id="expeditionsDiv"></div>
</div>

<div class="card">
<div id="log"></div>
</div>

</div>

<div id="stableSection" style="display:none;">
<h2>🐎 Stajnia</h2>
<div id="horses"></div>
</div>

<div id="inventorySection" style="display:none;">
<h2>🎒 Ekwipunek</h2>
<div id="inventory"></div>
</div>

</div>

<!-- PRAWA STRONA -->
<div class="rightbar">
<h3>🏆 Ranking</h3>

<div class="card">
NPC 1<br>
NPC 2
</div>

</div>

</div>

<script>
function showSection(s){
document.getElementById("expeditionSection").style.display="none";
document.getElementById("stableSection").style.display="none";
document.getElementById("inventorySection").style.display="none";

if(s==="expedition") document.getElementById("expeditionSection").style.display="block";
if(s==="stable") document.getElementById("stableSection").style.display="block";
if(s==="inventory") document.getElementById("inventorySection").style.display="block";
}
</script>

<script src="js/database.js"></script>
<script src="js/horses.js"></script>
<script src="js/items.js"></script>
<script src="js/expedition.js"></script>
<script src="js/game.js"></script>
<script src="main.js"></script>

</body>
</html>