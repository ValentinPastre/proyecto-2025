export class VoiceCommandService {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        
        // Apunta a tu backend Node (puerto 3000)
        this.whisperApiUrl = "http://127.0.0.1:3000/api/voice";
        
        // Inicializamos silenciosamente
        this.initVoiceRecognition();
    }

    async initVoiceRecognition() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm'
            });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                if (this.audioChunks.length === 0) return;

                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.audioChunks = [];

                if (audioBlob.size > 1000) { 
                    this.showToast(" Procesando...", 1000);
                    await this.transcribeAudio(audioBlob);
                }
            };

            console.log("🎤 Servicio de Voz listo para Push-to-Talk");

        } catch (error) {
            console.error("Error al acceder al micrófono:", error);
            this.showToast(" Error: No se detectó micrófono");
        }
    }


    startRecording() {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'recording') return;
        
        this.audioChunks = [];
        this.mediaRecorder.start();
        this.isRecording = true;
        console.log(" Grabando.");
    }

    stopRecording() {
        if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') return;
        
        this.mediaRecorder.stop();
        this.isRecording = false;
        console.log("Fin grabación, enviando...");
    }


    async transcribeAudio(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');

            const response = await fetch(`${this.whisperApiUrl}/transcribe`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Error en transcripción');

            const data = await response.json();
            const text = data.text ? data.text.trim() : "";

            if (text && text.length > 0) {
                this.processVoiceCommand(text);
            }

        } catch (error) {
            console.error("Error Transcripción:", error);
            this.showToast(" Error al procesar voz");
        }
    }

    processVoiceCommand(text) {
        console.log(" Comando reconocido:", text);
        
        window.dispatchEvent(new CustomEvent("voice-command", { 
            detail: { text: text, timestamp: new Date().toISOString() }
        }));

        // Notificación visual rápida
        this.showToast(` "${text}"`);
    }

    showToast(message, duration = 3000) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('visible');
            setTimeout(() => toast.classList.remove('visible'), duration);
        } else {
            console.log("Toast:", message);
        }
    }
}