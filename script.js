particlesJS("particles-js", {
  particles: {
    number: { value: 60 },
    color: { value: "#0066ff" },
    shape: { type: "circle" },
    opacity: { value: 0.4 },
    size: { value: 2.5 },
    line_linked: { enable: true, distance: 140, color: "#0066ff", opacity: 0.25, width: 1 },
    move: { enable: true, speed: 1.5 }
  }
});

function togglePassword(id) {
  var input = document.getElementById(id);
  var btn = input.nextElementSibling;
  if (input.type === "password") { input.type = "text"; btn.textContent = "🙈"; }
  else { input.type = "password"; btn.textContent = "👁"; }
}

function showScreen(name) {
  document.getElementById("authScreen").classList.remove("active");
  document.getElementById("converterScreen").classList.remove("active");
  document.getElementById(name === "auth" ? "authScreen" : "converterScreen").classList.add("active");
}

function msg(text, isError) {
  var el = document.getElementById("msg");
  el.textContent = text;
  el.className = "msg " + (isError ? "error" : "success");
}

function showForm(form) {
  document.getElementById("formLogin").classList.remove("active");
  document.getElementById("formRegister").classList.remove("active");
  document.getElementById("tabLogin").classList.remove("active");
  document.getElementById("tabRegister").classList.remove("active");
  document.getElementById("form" + (form === "login" ? "Login" : "Register")).classList.add("active");
  document.getElementById("tab" + (form === "login" ? "Login" : "Register")).classList.add("active");
  msg("");
}

document.getElementById("tabLogin").addEventListener("click", function() { showForm("login"); });
document.getElementById("tabRegister").addEventListener("click", function() { showForm("register"); });
document.getElementById("goRegister").addEventListener("click", function(e) { e.preventDefault(); showForm("register"); });
document.getElementById("goLogin").addEventListener("click", function(e) { e.preventDefault(); showForm("login"); });

// Form submit handlers
document.getElementById("formLogin").addEventListener("submit", function(e) {
  e.preventDefault();
  login();
});
document.getElementById("formRegister").addEventListener("submit", function(e) {
  e.preventDefault();
  register();
});

function setBtnLoading(btn, loading) {
  if (loading) btn.classList.add("loading");
  else btn.classList.remove("loading");
}

function register() {
  var username = document.getElementById("regUsername").value.trim();
  var password = document.getElementById("regPassword").value;
  var confirm = document.getElementById("regConfirm").value;
  var btn = document.querySelector("#formRegister .btn-primary");

  if (!username || !password || !confirm) { msg("Todos los campos son obligatorios", true); return; }
  if (password.length < 6) { msg("La contraseña debe tener al menos 6 caracteres", true); return; }
  if (password !== confirm) { msg("Las contraseñas no coinciden", true); return; }

  setBtnLoading(btn, true);
  var email = username + "@hydra.local";
  auth.createUserWithEmailAndPassword(email, password)
    .then(function(cred) {
      cred.user.updateProfile({ displayName: username });
      return db.collection("users").doc(cred.user.uid).set({ username: username, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    })
    .then(function() {
      msg("Registro exitoso. Iniciando sesión...", false);
      setTimeout(function() { showScreen("converter"); }, 800);
    })
    .catch(function(err) {
      if (err.code === "auth/email-already-in-use") msg("Este usuario ya existe", true);
      else if (err.code === "auth/weak-password") msg("Contraseña muy débil (mín 6 chars)", true);
      else msg("Error: " + err.message, true);
    })
    .finally(function() { setBtnLoading(btn, false); });
}

function login() {
  var username = document.getElementById("loginUser").value.trim();
  var password = document.getElementById("loginPassword").value;
  var btn = document.querySelector("#formLogin .btn-primary");

  if (!username || !password) { msg("Todos los campos son obligatorios", true); return; }

  setBtnLoading(btn, true);
  var email = username + "@hydra.local";
  auth.signInWithEmailAndPassword(email, password)
    .then(function() {
      showScreen("converter");
    })
    .catch(function(err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") msg("Usuario o contraseña incorrectos", true);
      else msg("Error: " + err.message, true);
    })
    .finally(function() { setBtnLoading(btn, false); });
}

function logout() {
  auth.signOut().then(function() { showScreen("auth"); });
}

function clearAllData() {
  if (confirm("¿Borrar TODO (usuarios y sesión)? Esto no se puede deshacer.")) {
    var user = auth.currentUser;
    if (user) {
      user.delete().then(function() { location.reload(); }).catch(function() { location.reload(); });
    } else { location.reload(); }
  }
}

function copyCode() {
  var code = document.getElementById("cppOutput").textContent;
  var btn = document.getElementById("copyBtn");
  navigator.clipboard.writeText(code).then(function() {
    var original = btn.querySelector(".btn-text").textContent;
    btn.querySelector(".btn-text").textContent = "✔️ Copied!";
    btn.classList.add("loading");
    setTimeout(function() {
      btn.querySelector(".btn-text").textContent = original;
      btn.classList.remove("loading");
    }, 1500);
  });
}
  var code = document.getElementById("cppOutput").textContent;
  var btn = document.getElementById("copyBtn");
  navigator.clipboard.writeText(code).then(function() {
    var original = btn.querySelector(".btn-text").textContent;
    btn.querySelector(".btn-text").textContent = "✔️ Copied!";
    btn.classList.add("loading");
    setTimeout(function() {
      btn.querySelector(".btn-text").textContent = original;
      btn.classList.remove("loading");
    }, 1500);
  });
}

}
  });
}

auth.onAuthStateChanged(function(user) {
  var ud = document.getElementById("userDisplay");
  var ud2 = document.getElementById("userDisplay2");
  if (user) {
    showScreen("converter");
    if (ud) ud.textContent = "Bienvenido, " + user.displayName;
    if (ud2) ud2.textContent = user.displayName;
  } else {
    showScreen("auth");
  }
});

var aobInput = document.getElementById("aobInput");
var cppOutput = document.getElementById("cppOutput");
var byteCount = document.getElementById("byteCount");

if (aobInput) {
  aobInput.addEventListener("input", function() {
    var parts = aobInput.value.trim().split(/\s+/);
    var bytes = [];
    var count = 0;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === "??") { bytes.push("/* ? */"); }
      else if (/^[A-Fa-f0-9]{2}$/.test(parts[i])) { bytes.push("0x" + parts[i].toUpperCase()); count++; }
    }
    byteCount.textContent = "BYTE COUNT: " + count;
    cppOutput.textContent = "unsigned char aob[] = { " + bytes.join(", ") + " };";
  });
}

var hoverCard = document.getElementById("hover-card");
if (hoverCard) {
  document.addEventListener("mousemove", function(e) {
    var rect = hoverCard.getBoundingClientRect();
    var centerX = rect.left + rect.width / 2;
    var centerY = rect.top + rect.height / 2;
    var deltaX = e.clientX - centerX;
    var deltaY = e.clientY - centerY;
    var rotateX = (deltaY / rect.height) * -8;
    var rotateY = (deltaX / rect.width) * 8;
    hoverCard.style.transform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
  });
  document.addEventListener("mouseleave", function() {
    hoverCard.style.transform = "rotateX(0deg) rotateY(0deg)";
  });
}