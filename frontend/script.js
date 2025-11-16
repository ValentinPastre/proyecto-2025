const video = document.getElementById('camera');
const canvas = document.getElementById('snapshot');
const captureBtn = document.getElementById('captureBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const captionText = document.getElementById('captionText');
const audioPlayer = document.getElementById('audioPlayer');

const CAPTIONING_URL = "http://localhost:3000/caption";
const TTS_URL = "http://localhost:8002/tts";

let ttsController = null;

// Inicializa cámara
async function initCamera() {
    try {
        console.log("Intentando acceder a la cámara...");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("Stream recibido:", stream);
        video.srcObject = stream;
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        captionText.textContent = "Cannot access the camera";
    }
}

// Captura imagen del video
function captureImage() {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        captionText.textContent = "Video not ready yet";
        return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
        if (!blob) {
            captionText.textContent = "Failed to capture image";
            return;
        }
        sendImageToBackend(blob);
    }, "image/jpeg", 0.9);
}

// Enviar imagen al backend
async function sendImageToBackend(imageBlob) {
    try {
        // Resetear audio antes de enviar la nueva imagen
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = "";

        // Cancelar cualquier TTS pendiente
        if (ttsController) {
            ttsController.abort();
        }
        ttsController = new AbortController();
        const signal = ttsController.signal;

        const formData = new FormData();
        formData.append("file", imageBlob, "snapshot.jpg");

        // Enviar al captioning
        const response = await fetch(CAPTIONING_URL, { method: "POST", body: formData });
        console.log("Captioning status:", response.status);

        const text = await response.text();
        console.log("Captioning response:", text);

        if (!response.ok) {
            captionText.textContent = `Image processing failed (status ${response.status})`;
            return;
        }

        const data = JSON.parse(text);
        captionText.textContent = data.caption || "No caption returned";

        // Si hay caption, llamar TTS
        if (data.caption) {
            try {
                const ttsResp = await fetch(`${TTS_URL}?text=${encodeURIComponent(data.caption)}`);
                console.log("TTS status:", ttsResp.status);

                const ttsText = await ttsResp.text();
                console.log("TTS response:", ttsText);

                if (!ttsResp.ok) {
                    console.error("TTS request failed");
                    return;
                }

                const ttsData = JSON.parse(ttsText);

                if (ttsData.audio_url) {
                    
                    audioPlayer.src = ttsData.audio_url;
                    audioPlayer.style.display = "block";

                    audioPlayer.play().catch(err => {
                        console.warn("Autoplay blocked, user must play manually:", err);
                    });
                }

            } catch (ttsErr) {
                console.error("Error fetching TTS:", ttsErr);
            }
        }

    } catch (err) {
        console.error("Error sending image:", err);
        captionText.textContent = "Error while sending the image to the backend";
    }
}

// Eventos
captureBtn.addEventListener("click", () => {
    captureImage();
    audioPlayer.play().catch(err => console.warn("Audio play blocked:", err));
});
uploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) sendImageToBackend(file);
});

// Iniciar cámara al cargar la página
window.addEventListener("DOMContentLoaded", initCamera);
