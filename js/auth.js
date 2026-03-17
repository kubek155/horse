let currentUser = localStorage.getItem("currentUser");

function showLogin() {
  loginPage.style.display = "block";
  registerPage.style.display = "none";
}

function showRegister() {
  loginPage.style.display = "none";
  registerPage.style.display = "block";
}

function isValidPassword(password) {
  return (
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password)
  );
}

function register() {
  let u = regUser.value;
  let p = regPass.value;

  if (!isValidPassword(p)) {
    alert("Hasło musi mieć dużą literę, cyfrę i znak specjalny!");
    return;
  }

  if (localStorage.getItem("user_" + u)) {
    alert("Użytkownik istnieje!");
    return;
  }

  localStorage.setItem("user_" + u, p);
  alert("Konto utworzone!");
}

function login() {
  let u = loginUser.value;
  let p = loginPass.value;

  if (localStorage.getItem("user_" + u) === p) {
    currentUser = u;
    localStorage.setItem("currentUser", u);
    startGame();
  } else {
    alert("Błędne dane!");
  }
}

function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

function startGame() {
  loginPage.style.display = "none";
  registerPage.style.display = "none";
  menu.style.display = "none";
  game.style.display = "block";
  loadUserData();
}