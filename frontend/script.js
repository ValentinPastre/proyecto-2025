/* --- Variables Globales y Selectores --- */
const logoutBtn = document.getElementById("logoutBtn");
const toast = document.getElementById("toast");
const audioCapturarImagen = new Audio("audios-botones/CapturarImagen.wav");
const audioCerrarSesion = new Audio("audios-botones/CerrarSesion.wav");
const audioPassword = new Audio("audios-botones/Password.wav");
const audioEmail = new Audio("audios-botones/Email.wav");
const audioEntrar = new Audio("audios-botones/Entrar.wav");
const audioIniciarSesion = new Audio("audios-botones/IniciarSesion.wav");
const audioRegistrarse = new Audio("audios-botones/Registrarse.wav");
const audioRepetirPassword = new Audio("audios-botones/RepetirPassword.wav");
const audioSubirImagen = new Audio("audios-botones/SubirImagen.wav");
const audioUsuarioNoEncontrado = new Audio("audios-botones/UsuarioNoEncontrado.wav");
const audioUsuarioYaExiste = new Audio("audios-botones/UsuarioYaExiste.wav");
const audioCrearCuenta = new Audio("audios-botones/CrearCuenta.wav");
const audioLogin = new Audio("audios-botones/Login.wav");

// URLs del Backend (Configurables)
const API_URL = "http://127.0.0.1:3000/api";

// Selectores de Páginas (Contenedores)
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

// Obtiene el usuario guardado en la sesión del navegador
function getCurrentUser() {
  const userString = sessionStorage.getItem('currentUser');
  return userString ? JSON.parse(userString) : null;
}

/**
 * Maneja el cambio de ruta, muestra la página correcta y protege las rutas.
 */
function handleRouteChange() {
  const hash = window.location.hash || '#login'; // Por defecto a login
  const user = getCurrentUser();

  let targetPage = hash;

  // Protección de rutas: Si no hay usuario, forzar login
  if (hash === '#camera' && !user) {
    targetPage = '#login';
    showToast("Debes iniciar sesión primero");
  } else if ((hash === '#login' || hash === '#register') && user) {
    targetPage = '#camera'; // Si ya está logueado, ir directo a cámara
  } else if (hash === '#logout') {
    targetPage = '#login';
  }

  // Actualizar hash si hubo redirección
  if (window.location.hash !== targetPage) {
    window.location.hash = targetPage;
    return;
  }

  // Activar la página correspondiente
  let pageFound = false;
  pages.forEach(page => {
    if (page.dataset.page === targetPage.substring(1)) {
      page.classList.add('active');
      pageFound = true;
    } else {
      page.classList.remove('active');
    }
  });

  if (targetPage == '#login') {
		playSound(audioIniciarSesion);
	} else if (targetPage == '#register') {
		playSound(audioRegistrarse);
	}

  // Fallback si la página no existe
  if (!pageFound) {
    pageLogin.classList.add('active');
    window.location.hash = '#login';
  }

  // UI dependiente de sesión
  if (user) {
    if(logoutBtn) logoutBtn.classList.remove('hidden');
    if (targetPage === '#camera') {
      initCamera();
    }
  } else {
    if(logoutBtn) logoutBtn.classList.add('hidden');
  }
}

// Escuchadores para navegación
window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('DOMContentLoaded', handleRouteChange);


/* --- Lógica de Autenticación (CONECTADA A BASE DE DATOS) --- */

// REGISTRO
if (registerBtn) {
  registerBtn.addEventListener("mouseenter", () => {
    playSound(audioCrearCuenta);
  });

  registerBtn.onclick = async () => {
    clearFormMessages();
    const email = regEmailEl.value.trim();
    const pass = regPassEl.value;
    const pass2 = regPass2El.value;

    [regEmailEl, regPassEl, regPass2El].forEach(i => markInputError(i, false));

    // Validaciones Frontend
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

    // --- FETCH AL BACKEND (Registro) ---
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error en el registro");

      showFormMessage(registerMessage, "Registro exitoso ✔", "success", 1800);
      showToast("Usuario creado correctamente");

      // Redirigir al login después de 1 segundo
      setTimeout(() => {
        [regEmailEl, regPassEl, regPass2El].forEach(i => { i.value = ""; markInputError(i, false); });
        window.location.hash = '#login'; 
      }, 1000);

    } catch (err) {
      showFormMessage(registerMessage, err.message, "error");

      if (err.message.toLowerCase().includes("ya existe")) {
	playSound(audioUsuarioYaExiste);
      }
    }
  };
}

// LOGIN
if (loginBtn) {
   loginBtn.addEventListener("mouseenter", () => {
    playSound(audioLogin);
  })
  loginBtn.onclick = async () => {
    clearFormMessages();
    const email = loginEmailEl.value.trim();
    const pass = loginPassEl.value;

    [loginEmailEl, loginPassEl].forEach(i => markInputError(i, false));

    if (!email || !pass) {
      if (!email) markInputError(loginEmailEl);
      if (!pass) markInputError(loginPassEl);
      return showFormMessage(loginMessage, "Complete email y contraseña", "error");
    }

    // --- FETCH AL BACKEND (Login) ---
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Credenciales incorrectas");

      // GUARDAR SESIÓN
      // Asumimos que el backend devuelve algo como { message: "ok", user: { id: 1, email: "..." } }
      // Si el backend solo devuelve éxito, creamos un objeto usuario básico con lo que tenemos.
      const userToSave = data.user || { email: email, id: data.userId || 'unknown' };
      sessionStorage.setItem('currentUser', JSON.stringify(userToSave));

      showFormMessage(loginMessage, "Accediendo...", "success", 800);
      showToast(`Bienvenido, ${userToSave.email}`);

      setTimeout(() => {
        window.location.hash = '#camera'; // Navegar a la cámara
        clearFormMessages();
      }, 600);

    } catch (err) {
      markInputError(loginEmailEl);
      markInputError(loginPassEl);
      showFormMessage(loginMessage, err.message, "error");

      if (err.message.toLowerCase().includes("usuario no encontrado") || err.message.toLowerCase().includes("credenciales incorrectas")) {
	playSound(audioUsuarioNoEncontrado);
      }
    }
  };
}

// LOGOUT
if (logoutBtn) {
  logoutBtn.addEventListener("mouseenter", () => {
    playSound(audioCerrarSesion);
  });


  logoutBtn.onclick = () => {
    sessionStorage.removeItem('currentUser');
    showToast("Sesión cerrada");
    
    // Detener cámara
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    
    // Limpiar campos
    if(loginEmailEl) loginEmailEl.value = "";
    if(loginPassEl) loginPassEl.value = "";

    window.location.hash = '#login'; 
  };
}


/* ==== Lógica de Cámara (CONECTADA A BASE DE DATOS) ==== */

async function initCamera() {
  if (!video || video.srcObject) return; 
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if(cameraLoading) cameraLoading.classList.add("hidden");
    if(cameraContainer) cameraContainer.classList.remove("hidden");
    video.srcObject = stream;
  } catch (err) {
    showToast("No se pudo acceder a la cámara");
    if(captionText) captionText.textContent = "Error: No se detecta cámara.";
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

  // Agregar ID de usuario si existe en sesión
  const user = getCurrentUser();
  if (user && user.id) {
    formData.append('userId', user.id);
  } else {
    // Si por alguna razón se perdió la sesión
    console.warn("Usuario no autenticado al enviar imagen");
  }

  try {
    const response = await fetch(`${API_URL}/caption`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      let errorMsg = "Error del servidor";
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    const data = await response.json();
    
    // Mostrar descripción (soporta campo 'objects' o 'caption')
    captionText.textContent = data.objects || data.caption || "Descripción generada.";

    // Reproducir audio
    if (data.audioUrl && audioPlayer) {
      // Añadir timestamp para evitar caché del navegador si el nombre es igual
      audioPlayer.src = `${data.audioUrl}?t=${new Date().getTime()}`;
      audioPlayer.play().catch(e => console.log("Error al reproducir audio:", e));
    }

  } catch (err) {
    if(captionText) captionText.textContent = "Error: " + err.message;
    console.error(err);
  }
}

// Eventos de Cámara
if(captureBtn) {
	captureBtn.addEventListener("mouseenter", () => {playSound(audioCapturarImagen);});
	captureBtn.addEventListener("click", captureImage);
}
if(uploadBtn) {
	uploadBtn.addEventListener("mouseenter", () => {playSound(audioSubirImagen);});
	uploadBtn.addEventListener("click", () => fileInput.click());
}
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


let playCooldown = false;
function playSound(audio) {
  if (playCooldown) return;
  playCooldown = true;

  audio.currentTime = 0;
  audio.play().catch(() => {});

  setTimeout(() => playCooldown = false, 180);
}


const linkRegistrate = document.querySelector('a[href="#register"]');
if (linkRegistrate) {
  linkRegistrate.addEventListener("mouseenter", () => {
    playSound(audioRegistrarse);
  });
}


const linkIniciarSesion = document.querySelector('a[href="#login"]');
if (linkIniciarSesion) {
  linkIniciarSesion.addEventListener("mouseenter", () => {
    playSound(audioIniciarSesion);
  });
}

if (loginEmailEl) {
  loginEmailEl.addEventListener("focus", () => {
    playSound(audioEmail);
  });
}

if (loginPassEl) {
  loginPassEl.addEventListener("focus", () => {
    playSound(audioPassword);
  });
}

if (regEmailEl) {
  regEmailEl.addEventListener("focus", () => {
    playSound(audioEmail);
  });
}

if (regPassEl) {
  regPassEl.addEventListener("focus", () => {
    playSound(audioPassword);
  });
}

if (regPass2El) {
  regPass2El.addEventListener("focus", () => {
    playSound(audioRepetirPassword);
  });
}

