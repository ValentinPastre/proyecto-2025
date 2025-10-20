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
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        video.srcObject = stream;
    }  catch (err) {
        console.error('Error while accessing the camera', err);
        captionText.textContent = "Cannot access the camera";
    }
}

// Capturar imagen actual del video
function captureImage() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => sendImageToBackend(blob), 'image/jpeg', 0.9)
}

// Enviar imagen al backend
async function sendImageToBackend(imageBlob) {
    try {
        const formData = new FormData();
        formData.append('video', imageBlob, 'snapshot.jpg');

        const response = await fetch('http://localhost:3000/api/detect', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            captionText.textContent = "Image processing failed";
            return;
        }

        const data = await response.json();
        console.log('Backend response:', data);

        captionText.textContent = JSON.stringify(data.objects, null, 2);
    }   catch (err) {
        console.error('Error while sending image:', err);
        captionText.textContent = 'Error while sending the image to the backend';
    }
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