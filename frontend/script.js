/* --- Variables Globales y Selectores --- */
const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toast");

// Selectores de Páginas
const pages = document.querySelectorAll(".page-container");
const pageLogin = document.getElementById("page-login");
const pageRegister = document.getElementById("page-register");
const pageCamera = document.getElementById("page-camera");

// Selectores de Login
const loginMessage = document.getElementById("loginMessage");
const loginEmailEl = document.getElementById("loginEmail");
const loginPassEl = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");

// Selectores de Registro
const registerMessage = document.getElementById("registerMessage");
const regEmailEl = document.getElementById("regEmail");
const regPassEl = document.getElementById("regPassword");
const regPass2El = document.getElementById("regPassword2");
const registerBtn = document.getElementById("registerBtn");

// Selectores de Cámara
const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const captureBtn = document.getElementById("captureBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const captionText = document.getElementById("captionText");
const audioPlayer = document.getElementById("audioPlayer");
const cameraLoading = document.getElementById("cameraLoading");
const cameraContainer = document.getElementById("cameraContainer");

/* --- Lógica de Ruteo (Vistas) --- */

function getCurrentUser() {
  const userString = sessionStorage.getItem('currentUser');
  return userString ? JSON.parse(userString) : null;
}

/**
 * Maneja el cambio de ruta, muestra la página correcta y protege las rutas.
 */
function handleRouteChange() {
  const hash = window.location.hash || '#login'; // Default a #login
  const user = getCurrentUser();

  let targetPage = hash;

  // Lógica de protección de rutas
  if (hash === '#camera' && !user) {
    targetPage = '#login'; // No está logueado, no puede ver la cámara
    showToast("Debes iniciar sesión primero");
  } else if ((hash === '#login' || hash === '#register') && user) {
    targetPage = '#camera'; // Ya está logueado, no debe ver login/register
  } else if (hash === '#logout') {
    targetPage = '#login'; // Se está deslogueando
  }

  // Actualizar la URL si fue redirigido
  if (window.location.hash !== targetPage) {
    window.location.hash = targetPage;
    // No continuamos, el cambio de hash disparará esta función de nuevo
    return;
  }

  // Mostrar la página correcta
  let pageFound = false;
  pages.forEach(page => {
    if (page.dataset.page === targetPage.substring(1)) {
      page.classList.add('active');
      pageFound = true;
    } else {
      page.classList.remove('active');
    }
  });

  // Página por defecto si el hash es inválido
  if (!pageFound) {
    pageLogin.classList.add('active');
    window.location.hash = '#login';
  }

  // Lógica de UI dependiente de la autenticación
  if (user) {
    logoutBtn.classList.remove('hidden');
    // Si la página es la cámara, la iniciamos
    if (targetPage === '#camera') {
      initCamera();
    }
  } else {
    logoutBtn.classList.add('hidden');
  }
}

// Escuchadores de eventos para el ruteo
window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('DOMContentLoaded', handleRouteChange);


/* --- Lógica de Autenticación --- */

if (registerBtn) {
  registerBtn.onclick = () => {
    clearFormMessages();
    const email = regEmailEl.value.trim();
    const pass = regPassEl.value;
    const pass2 = regPass2El.value;

    [regEmailEl, regPassEl, regPass2El].forEach(i => markInputError(i, false));

    if (!email || !pass || !pass2) {
      if (!email) markInputError(regEmailEl);
      if (!pass) markInputError(regPassEl);
      if (!pass2) markInputError(regPass2El);
      return showFormMessage(registerMessage, "Complete todos los campos", "error");
    }
    if (!validateEmail(email)) {
      markInputError(regEmailEl);
      return showFormMessage(registerMessage, "Ingrese un email válido", "error");
    }
    if (pass.length < 6) {
      markInputError(regPassEl);
      return showFormMessage(registerMessage, "La contraseña debe tener al menos 6 caracteres", "error");
    }
    if (pass !== pass2) {
      markInputError(regPassEl, true);
      markInputError(regPass2El, true);
      return showFormMessage(registerMessage, "Las contraseñas no coinciden", "error");
    }

    // Simulación de DB
    localStorage.setItem(`user_${email}`, pass);

    showFormMessage(registerMessage, "Registro exitoso ✔", "success", 1800);
    showToast("Usuario creado");

    setTimeout(() => {
      [regEmailEl, regPassEl, regPass2El].forEach(i => { i.value = ""; markInputError(i, false); });
      window.location.hash = '#login'; // Navegar a login
    }, 900);
  };
}

if (loginBtn) {
  loginBtn.onclick = () => {
    clearFormMessages();
    const email = loginEmailEl.value.trim();
    const pass = loginPassEl.value;

    [loginEmailEl, loginPassEl].forEach(i => markInputError(i, false));

    if (!email || !pass) {
      if (!email) markInputError(loginEmailEl);
      if (!pass) markInputError(loginPassEl);
      return showFormMessage(loginMessage, "Complete email y contraseña", "error");
    }

    const savedPass = localStorage.getItem(`user_${email}`);

    if (pass === savedPass) {
      const MOCK_USER = {
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        email: email
      };
      sessionStorage.setItem('currentUser', JSON.stringify(MOCK_USER));

      showFormMessage(loginMessage, "Accediendo...", "success", 800);
      showToast(`Bienvenido, ${email}`);

      setTimeout(() => {
        window.location.hash = '#camera'; // Navegar a la cámara
        clearFormMessages();
      }, 600);

    } else {
      markInputError(loginEmailEl);
      markInputError(loginPassEl);
      return showFormMessage(loginMessage, "Credenciales incorrectas", "error");
    }
  };
}

if (logoutBtn) {
  logoutBtn.onclick = () => {
    sessionStorage.removeItem('currentUser');
    showToast("Sesión cerrada");
    window.location.hash = '#login'; // Navegar a login
    
    // Limpiar inputs
    if(loginEmailEl) loginEmailEl.value = "";
    if(loginPassEl) loginPassEl.value = "";
    
    // Detener la cámara si está activa
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  };
}


/* ==== Lógica de Cámara ==== */

async function initCamera() {
  // Evitar reiniciar la cámara si ya está activa
  if (!video || video.srcObject) return; 
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if(cameraLoading) cameraLoading.classList.add("hidden");
    if(cameraContainer) cameraContainer.classList.remove("hidden");
    video.srcObject = stream;
  } catch (err) {
    showToast("No se pudo acceder a la cámara");
    if(captionText) captionText.textContent = "No se pudo acceder a la cámara.";
  }
}

function captureImage() {
  if (!video || !canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  canvas.toBlob(sendImageToBackend, "image/jpeg");
}

async function sendImageToBackend(imageBlob) {
  if(captionText) captionText.textContent = "Procesando...";

  const formData = new FormData();
  formData.append("file", imageBlob, "image.jpg");

  // --- AYUDA PARA TU AMIGO (BASE DE DATOS) ---
  const user = getCurrentUser();
  if (user) {
    formData.append('userId', user.id);
    console.log(`Enviando imagen para el usuario: ${user.id}`);
  } else {
    console.warn("No se encontró usuario en la sesión.");
    window.location.hash = '#login'; // Si se pierde la sesión, volver a login
    return;
  }
  // ------------------------------------------

  try {
    const response = await fetch("http://127.0.0.1:3000/api/caption", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      let errorMsg = "Error del servidor";
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) { /* No hacer nada */ }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    if(captionText) captionText.textContent = data.objects || "Sin descripción.";

    if (data.audioUrl && audioPlayer) {
      audioPlayer.src = data.audioUrl;
      audioPlayer.play();
    }

  } catch (err) {
    if(captionText) captionText.textContent = "Error: " + err.message;
  }
}

// Eventos de Cámara
if(captureBtn) captureBtn.addEventListener("click", captureImage);
if(uploadBtn) uploadBtn.addEventListener("click", () => fileInput.click());
if(fileInput) fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) sendImageToBackend(file);
});


/* --- Funciones Helpers de UI --- */

function showFormMessage(containerEl, text, type = "error", timeout = 4000) {
  if (!containerEl) return;
  containerEl.textContent = text;
  containerEl.classList.remove("error", "success");
  containerEl.classList.add(type, "visible");

  if (timeout) {
    setTimeout(() => {
      containerEl.classList.remove("visible");
    }, timeout);
  }
}

function clearFormMessages() {
  [loginMessage, registerMessage].forEach(m => {
    if (m) {
      m.className = "form-message";
      m.textContent = "";
    }
  });
}

function showToast(text, timeout = 2200) {
  if (!toast) return;
  toast.textContent = text;
  toast.classList.add("visible");
  setTimeout(() => {
    toast.classList.remove("visible");
  }, timeout);
}

function markInputError(inputEl, flag = true) {
  if (!inputEl) return;
  if (flag) {
    inputEl.classList.add("input-error");
    inputEl.setAttribute("aria-invalid", "true");
  } else {
    inputEl.classList.remove("input-error");
    inputEl.removeAttribute("aria-invalid");
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.getElementById("registerBtn").onclick = async () => {
  clearFormMessages();

  const emailEl = document.getElementById("regEmail");
  const passEl = document.getElementById("regPassword");
  const pass2El = document.getElementById("regPassword2");

  const email = emailEl.value.trim();
  const pass = passEl.value;
  const pass2 = pass2El.value;

  // reset marks
  [emailEl, passEl, pass2El].forEach(i => markInputError(i, false));

  if (!email || !pass || !pass2) {
    if (!email) markInputError(emailEl);
    if (!pass) markInputError(passEl);
    if (!pass2) markInputError(pass2El);
    return showFormMessage(registerMessage, "Complete todos los campos", "error");
  }

  if (!validateEmail(email)) {
    markInputError(emailEl);
    return showFormMessage(registerMessage, "Ingrese un email válido", "error");
  }

  if (pass.length < 6) {
    markInputError(passEl);
    return showFormMessage(registerMessage, "La contraseña debe tener al menos 6 caracteres", "error");
  }

  if (pass !== pass2) {
    markInputError(passEl, true);
    markInputError(pass2El, true);
    return showFormMessage(registerMessage, "Las contraseñas no coinciden", "error");
  }

  try {
    const res = await fetch("http://127.0.0.1:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Error en registro");

    showFormMessage(registerMessage, "Registro exitoso ✔", "success", 1800);
    showToast("Usuario creado");

    setTimeout(() => {
	[emailEl, passEl, pass2El].forEach(i => { i.value = ""; markInputError(i, false); });
	registerContainer.classList.add("hidden");
	loginContainer.classList.remove("hidden");
	clearFormMessages();
    }, 900);
  } catch (err) {
    showFormMessage(registerMessage, err.message, "error");
  }
};

// Comienzo de la parte login
document.getElementById("loginBtn").onclick = async () => {
  clearFormMessages();

  const emailEl = document.getElementById("loginEmail");
  const passEl = document.getElementById("loginPassword");

  const email = emailEl.value.trim();
  const pass = passEl.value;

  [emailEl, passEl].forEach(i => markInputError(i, false));

  if (!email || !pass) {
    if (!email) markInputError(emailEl);
    if (!pass) markInputError(passEl);
    return showFormMessage(loginMessage, "Complete email y contraseña", "error");
  }

  try {
    const res = await fetch("http://127.0.0.1:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Error en login");

    const savedEmail = localStorage.getItem("user_email");
    const savedPass = localStorage.getItem("user_pass");

    showFormMessage(loginMessage, "Accediendo...", "success", 800);
    showToast("Bienvenido");

    setTimeout(() => {
      loginContainer.classList.add("hidden");
      registerContainer.classList.add("hidden");
      cameraPage.classList.remove("hidden");
      clearFormMessages();
      initCamera();
    }, 600);

  } catch (err) {
    markInputError(emailEl);
    markInputError(passEl);
    return showFormMessage(loginMessage, err.message, "error");
  }
};

// Principio de parte de camara

const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const captureBtn = document.getElementById("captureBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const captionText = document.getElementById("captionText");
const audioPlayer = document.getElementById("audioPlayer");

const cameraLoading = document.getElementById("cameraLoading");
const cameraContainer = document.getElementById("cameraContainer");



async function initCamera() {
try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    // Mostrar camara cuando está lista
    cameraLoading.classList.add("hidden");
    cameraContainer.classList.remove("hidden");

    video.srcObject = stream;
  } catch (err) {
    showToast("No se pudo acceder a la cámara");
    captionText.textContent = "No se pudo acceder a la cámara.";
  }
}

function captureImage() {
const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  canvas.toBlob(sendImageToBackend, "image/jpeg");
}

async function sendImageToBackend(imageBlob) {
  captionText.textContent = "Procesando...";

  const formData = new FormData();
  formData.append("file", imageBlob, "image.jpg");

  try {
    // URL apunta al backend (puerto 3000) y ruta correcta 
    const response = await fetch("http://127.0.0.1:3000/api/caption", {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Error del servidor");

    const data = await response.json();

    //  Actualizado para usar 'objects' (según tu server.js) 
    captionText.textContent = data.objects || "Sin descripción.";

    if (data.audioUrl) { // ⬅️ 'audioUrl' (según tu server.js)
      audioPlayer.src = data.audioUrl;
      audioPlayer.play();
    }

  } catch (err) {
    captionText.textContent = "Error: " + err.message;
  }
}

captureBtn.addEventListener("click", captureImage);
uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) sendImageToBackend(file);
});
