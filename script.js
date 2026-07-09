particlesJS("particles-js", {
  particles: {
    number: { value: 80 },
    color: { value: "#0033cc" },
    shape: { type: "circle" },
    opacity: { value: 0.5 },
    size: { value: 3 },
    line_linked: { enable: true, distance: 150, color: "#0033cc", opacity: 0.4, width: 1 },
    move: { enable: true, speed: 2 }
  }
});

function showSection(name) {
  var sections = document.querySelectorAll(".section-content");
  var items = document.querySelectorAll(".sidebar-item");
  for (var i = 0; i < sections.length; i++) sections[i].classList.remove("active");
  for (var i = 0; i < items.length; i++) items[i].classList.remove("active");
  document.getElementById("section" + name.charAt(0).toUpperCase() + name.slice(1)).classList.add("active");
  if (name === "users") refreshUsersInner();
  var idx = { converter: 0, users: 1, about: 2, help: 3 }[name];
  if (idx !== undefined && items[idx]) items[idx].classList.add("active");
}

function refreshUsersInner() {
  var list = document.getElementById("usersListInner");
  if (!list) return;
  db.collection("users").get().then(function(snapshot) {
    if (snapshot.empty) { list.innerHTML = "<div style='text-align:center;color:#666;padding:20px;'>No hay usuarios registrados</div>"; return; }
    var html = "<div style='border-bottom:1px solid var(--accent);padding:8px 0;color:var(--accent);font-size:14px;'>USUARIO</div>";
    snapshot.forEach(function(doc) {
      var u = doc.data();
      html += "<div style='padding:8px 0;border-bottom:1px solid rgba(0,51,204,0.2);display:flex;justify-content:space-between;'><span>" + u.username + "</span></div>";
    });
    list.innerHTML = html;
  });
}

function showScreen(name) {
  document.getElementById("authScreen").classList.remove("active");
  document.getElementById("converterScreen").classList.remove("active");
  document.getElementById(name === "auth" ? "authScreen" : "converterScreen").classList.add("active");
}

function clearAllData() {
  if (confirm("¿Borrar TODO (usuarios y sesión)? Esto no se puede deshacer.")) {
    var user = auth.currentUser;
    if (user) {
      user.delete().then(function() { location.reload(); }).catch(function() { location.reload(); });
    } else { location.reload(); }
  }
}

function downloadUsers() {
  db.collection("users").get().then(function(snapshot) {
    if (snapshot.empty) { alert("No hay usuarios registrados"); return; }
    var text = "=== HYDRA CLIENT - USUARIOS REGISTRADOS ===\r\n";
    text += "Fecha: " + new Date().toLocaleString() + "\r\n";
    text += "Total: " + snapshot.size + " usuarios\r\n";
    text += "========================================\r\n\r\n";
    snapshot.forEach(function(doc) {
      var u = doc.data();
      text += u.username + "\r\n";
    });
    var blob = new Blob([text], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "usuarios_hydra.txt";
    a.click();
  });
}

function refreshUsersInner() {
  var list = document.getElementById("usersListInner");
  if (!list) return;
  db.collection("users").get().then(function(snapshot) {
    if (snapshot.empty) { list.innerHTML = "<div style='text-align:center;color:#666;padding:20px;'>No hay usuarios registrados</div>"; return; }
    var html = "<div style='border-bottom:1px solid var(--accent);padding:8px 0;color:var(--accent);font-size:14px;'>USUARIO</div>";
    snapshot.forEach(function(doc) {
      var u = doc.data();
      html += "<div style='padding:8px 0;border-bottom:1px solid rgba(0,51,204,0.2);display:flex;justify-content:space-between;'><span>" + u.username + "</span></div>";
    });
    list.innerHTML = html;
  });
}

function showScreen(name) {
  document.getElementById("authScreen").classList.remove("active");
  document.getElementById("converterScreen").classList.remove("active");
  document.getElementById(name === "auth" ? "authScreen" : "converterScreen").classList.add("active");
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

function downloadUsers() {
  db.collection("users").get().then(function(snapshot) {
    if (snapshot.empty) { alert("No hay usuarios registrados"); return; }
    var text = "=== HYDRA CLIENT CODE - USUARIOS REGISTRADOS ===\r\n";
    text += "Fecha: " + new Date().toLocaleString() + "\r\n";
    text += "Total: " + snapshot.size + " usuarios\r\n";
    text += "========================================\r\n\r\n";
    snapshot.forEach(function(doc) {
      var u = doc.data();
      text += u.username + "\r\n";
    });
    var blob = new Blob([text], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "usuarios_hydra.txt";
    a.click();
  });
}

function msg(text, isError) {
  var el = document.getElementById("msg");
  el.textContent = text;
  el.className = isError ? "error" : "success";
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

function register() {
  var username = document.getElementById("regUsername").value.trim();
  var password = document.getElementById("regPassword").value;
  var confirm = document.getElementById("regConfirm").value;

  if (!username || !password || !confirm) { msg("Todos los campos son obligatorios", true); return; }
  if (password.length < 6) { msg("La contraseña debe tener al menos 6 caracteres", true); return; }
  if (password !== confirm) { msg("Las contraseñas no coinciden", true); return; }

  var email = username + "@hydra.local";
  auth.createUserWithEmailAndPassword(email, password)
    .then(function(cred) {
      cred.user.updateProfile({ displayName: username });
      return db.collection("users").doc(cred.user.uid).set({ username: username, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    })
    .then(function() {
      msg("Registro exitoso. Iniciando sesión...", false);
      setTimeout(function() { showScreen("converter"); }, 1000);
    })
    .catch(function(err) {
      if (err.code === "auth/email-already-in-use") msg("Este usuario ya existe", true);
      else msg("Error: " + err.message, true);
    });
}

function login() {
  var username = document.getElementById("loginUser").value.trim();
  var password = document.getElementById("loginPassword").value;

  if (!username || !password) { msg("Todos los campos son obligatorios", true); return; }

  var email = username + "@hydra.local";
  auth.signInWithEmailAndPassword(email, password)
    .then(function() {
      showScreen("converter");
    })
    .catch(function(err) {
      msg("Usuario o contraseña incorrectos", true);
    });
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

function downloadUsers() {
  db.collection("users").get().then(function(snapshot) {
    if (snapshot.empty) { alert("No hay usuarios registrados"); return; }
    var text = "=== HYDRA CLIENT CODE - USUARIOS REGISTRADOS ===\r\n";
    text += "Fecha: " + new Date().toLocaleString() + "\r\n";
    text += "Total: " + snapshot.size + " usuarios\r\n";
    text += "========================================\r\n\r\n";
    snapshot.forEach(function(doc) {
      var u = doc.data();
      text += u.username + "\r\n";
    });
    var blob = new Blob([text], { type: "text/plain" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "usuarios_hydra.txt";
    a.click();
  });
}

auth.onAuthStateChanged(function(user) {
  var ud = document.getElementById("userDisplay");
  if (user) {
    showScreen("converter");
    if (ud) ud.textContent = "Bienvenido, " + user.displayName;
    refreshUsersInner();
  } else {
    showScreen("auth");
  }
});

var aobInput = document.getElementById("aobInput");
var cppOutput = document.getElementById("cppOutput");
var byteCount = document.getElementById("byteCount");

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

document.getElementById("copyBtn").addEventListener("click", function() {
  var code = cppOutput.textContent;
  navigator.clipboard.writeText(code).then(function() {
    var btn = document.getElementById("copyBtn");
    btn.textContent = "✔️ Copied!";
    setTimeout(function() { btn.textContent = "📋 Copy Code"; }, 1500);
  });
});

var hoverCard = document.getElementById("hover-card");
document.addEventListener("mousemove", function(e) {
  var rect = hoverCard.getBoundingClientRect();
  var centerX = rect.left + rect.width / 2;
  var centerY = rect.top + rect.height / 2;
  var deltaX = e.clientX - centerX;
  var deltaY = e.clientY - centerY;
  var rotateX = (deltaY / rect.height) * -10;
  var rotateY = (deltaX / rect.width) * 10;
  hoverCard.style.transform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
});
document.addEventListener("mouseleave", function() {
  hoverCard.style.transform = "rotateX(0deg) rotateY(0deg)";
});