/*                       LÓGICA PRINCIPAL                       */
/*  Contiene la lógica para manejar la cámara, capturar imágenes,
    enviar datos al backend y actualizar la interfaz de usuario. 
    Se usan los IDs definidos en index.html para manipular 
    los elementos                                               */

const loginContainer = document.getElementById("loginContainer");
const registerContainer = document.getElementById("registerContainer");
const cameraPage = document.getElementById("cameraPage");

document.getElementById("goRegister").onclick = () => {
  loginContainer.classList.add("hidden");
  registerContainer.classList.remove("hidden");
};

document.getElementById("goLogin").onclick = () => {
  registerContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");
};

// Register
document.getElementById("registerBtn").onclick = () => {
  const email = document.getElementById("regEmail").value;
  const pass = document.getElementById("regPassword").value;
  const pass2 = document.getElementById("regPassword2").value;

  if (!email || !pass || !pass2) return alert("Complete todos los campos");
  if (pass !== pass2) return alert("Las contraseñas no coinciden");

  // Ahora se guarda localmente, luego pasar a base de datos
  localStorage.setItem("user_email", email);
  localStorage.setItem("user_pass", pass);

  alert("Registro exitoso ✔");
  registerContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");
};

// Login
document.getElementById("loginBtn").onclick = () => {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;

  const savedEmail = localStorage.getItem("user_email");
  const savedPass = localStorage.getItem("user_pass");

  if (email === savedEmail && pass === savedPass) {
    loginContainer.classList.add("hidden");
    registerContainer.classList.add("hidden");
    cameraPage.classList.remove("hidden");

    initCamera();
  } else {
    alert("Credenciales incorrectas");
  }
};

// Camara
const video = document.getElementById("camera");
const canvas = document.getElementById("snapshot");
const captureBtn = document.getElementById("captureBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const captionText = document.getElementById("captionText");
const audioPlayer = document.getElementById("audioPlayer");

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    alert("No se pudo acceder a la cámara: " + err.message);
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
    const response = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Error del servidor");

    const data = await response.json();

    captionText.textContent = data.caption || "Sin descripción.";

    if (data.audio_url) {
      audioPlayer.src = data.audio_url;
      audioPlayer.play();
    }
  } catch (err) {
    captionText.textContent = "Error: " + err.message;
  }
}

// Eventos
captureBtn.addEventListener("click", captureImage);
uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) sendImageToBackend(file);
});
