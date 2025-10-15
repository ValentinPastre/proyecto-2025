/*                       LÓGICA PRINCIPAL                       */
/*  Contiene la lógica para manejar la cámara, capturar imágenes,
    enviar datos al backend y actualizar la interfaz de usuario. 
    Se usan los IDs definidos en index.html para manipular 
    los elementos                                               */


const video = document.getElementById('camera');
const canvas = document.getElementById('snapshot');
const captureBtn = document.getElementById('captureBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const captionText = document.getElementById('captionText');
const audioPlayer = document.getElementById('audioPlayer');

// Iniciar cámara
async function initCamera() {
  
}

// Capturar imagen actual del video
function captureImage() {
  
}

// Enviar imagen al backend
async function sendImageToBackend(imageBlob) {
  
}

// Eventos
captureBtn.addEventListener('click', captureImage);
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) sendImageToBackend(file);
});

// Iniciar
initCamera();