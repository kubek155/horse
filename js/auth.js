let currentUser = localStorage.getItem("currentUser");

function register() {
  let u = regUser.value;
  let p = regPass.value;

  if (localStorage.getItem("user_" + u)) {
    alert("Istnieje!");
    return;
  }

  localStorage.setItem("user_" + u, p);
  alert("OK");
}

function login() {
  let u = loginUser.value;
  let p = loginPass.value;

  if (localStorage.getItem("user_" + u) === p) {
    currentUser = u;
    localStorage.setItem("currentUser", u);
    startGame();
  } else {
    alert("Błąd");
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

function startGame() {
  auth.style.display = "none";
  game.style.display = "block";
  loadUserData();
}