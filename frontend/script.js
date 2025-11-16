/*                       LÓGICA PRINCIPAL                       */
/*  Contiene la lógica para manejar la cámara, capturar imágenes,
    enviar datos al backend y actualizar la interfaz de usuario. 
    Se usan los IDs definidos en index.html para manipular 
    los elementos                                               */
    
/* ==== LOGIN Y REGISTRO CON MENSAJES EN PANTALLA ==== */

const loginContainer = document.getElementById("loginContainer");
const registerContainer = document.getElementById("registerContainer");
const cameraPage = document.getElementById("cameraPage");

const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");
const toast = document.getElementById("toast");

document.getElementById("goRegister").onclick = () => {
  clearFormMessages();
  loginContainer.classList.add("hidden");
  registerContainer.classList.remove("hidden");
};

document.getElementById("goLogin").onclick = () => {
  clearFormMessages();
  registerContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");
};

/* helpers de UI y validación */
function showFormMessage(containerEl, text, type = "error", timeout = 4000) {
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
  // regex sencillo y común para validación de email
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Registrar usuario */
document.getElementById("registerBtn").onclick = () => {
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

  // Guardado local (temporal)
  localStorage.setItem("user_email", email);
  localStorage.setItem("user_pass", pass);

  showFormMessage(registerMessage, "Registro exitoso ✔", "success", 1800);
  showToast("Usuario creado");

  // limpiar inputs y volver a login después de un pequeño delay visual
  setTimeout(() => {
    [emailEl, passEl, pass2El].forEach(i => { i.value = ""; markInputError(i, false); });
    registerContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
    clearFormMessages();
  }, 900);
};

/* Login */
document.getElementById("loginBtn").onclick = () => {
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

  const savedEmail = localStorage.getItem("user_email");
  const savedPass = localStorage.getItem("user_pass");

  if (email === savedEmail && pass === savedPass) {
    showFormMessage(loginMessage, "Accediendo...", "success", 800);
    showToast("Bienvenido");

    // limpiar y navegar a cámara
    setTimeout(() => {
      loginContainer.classList.add("hidden");
      registerContainer.classList.add("hidden");
      cameraPage.classList.remove("hidden");
      clearFormMessages();
      initCamera();
    }, 600);

  } else {
    markInputError(emailEl);
    markInputError(passEl);
    return showFormMessage(loginMessage, "Credenciales incorrectas", "error");
  }
};

/* ==== CÁMARA ==== */

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

    // Mostrar cámara cuando está lista
    cameraLoading.classList.add("hidden");
    cameraContainer.classList.remove("hidden");

    video.srcObject = stream;
  } catch (err) {
    // en vez de alert: mostramos en la página
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

/* ==== EVENTOS ==== */

captureBtn.addEventListener("click", captureImage);
uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) sendImageToBackend(file);
});