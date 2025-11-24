export class VoiceCommandService {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        

        this.whisperApiUrl = "http://127.0.0.1:3000/api/voice";
        
        this.init();
    }

    async init() {
        try {
            await this.initVoiceRecognition();
            this.createVoiceIndicator();
        } catch (error) {
            console.log('VoiceCommandService: Servicio no disponible', error);
        }
    }

    async initVoiceRecognition() {
        try {
            const healthCheck = await fetch(`${this.whisperApiUrl}/health`);
            if (!healthCheck.ok) throw new Error("API de Voz no responde");

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

                await this.transcribeAudio(audioBlob);
                setTimeout(() => this.startRecordingCycle(), 100);
            };

            this.startRecordingCycle();
            console.log("VoiceCommandService: Reconocimiento de voz activado");

        } catch (error) {
            console.error("VoiceCommandService Error:", error);
        }
    }

    startRecordingCycle() {
        if (!this.mediaRecorder || this.mediaRecorder.state !== 'inactive') return;
        
        this.audioChunks = [];
        this.mediaRecorder.start();
        this.isRecording = true;


        setTimeout(() => {
            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.stop();
                this.isRecording = false;
            }
        }, 3000);
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
            console.error("Error en transcripción:", error);
        }
    }

    processVoiceCommand(text) {
        console.log("Procesando comando:", text);
        
        window.dispatchEvent(new CustomEvent("voice-command", { 
            detail: { 
                text: text,
                timestamp: new Date().toISOString()
            }
        }));

        this.executeBasicCommands(text);
    }

    executeBasicCommands(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('login') || lowerText.includes('iniciar sesión')) {
            window.location.hash = '#login';
            this.showToast("Navegando a Login");
        }
        else if (lowerText.includes('registro') || lowerText.includes('registrar')) {
            window.location.hash = '#register';
            this.showToast("Navegando a Registro");
        }
        else if (lowerText.includes('cámara') || lowerText.includes('camara')) {
            const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
            if (user) {
                window.location.hash = '#camera';
                this.showToast("Navegando a Cámara");
            } else {
                this.showToast("Debes iniciar sesión primero");
            }
        }
        else if (lowerText.includes('capturar') || lowerText.includes('foto')) {
            if (window.location.hash === '#camera') {
                const captureBtn = document.getElementById('captureBtn');
                if (captureBtn) captureBtn.click();
            }
        }
        else if (lowerText.includes('ayuda')) {
            this.showHelp();
        }
    }

    showHelp() {
        const currentPage = window.location.hash.substring(1) || 'login';
        let helpMessage = 'Comandos disponibles...';
        this.showToast(helpMessage, 3000);
    }

    createVoiceIndicator() {
        if(document.getElementById('voice-indicator')) return;
        const indicator = document.createElement('div');
        indicator.id = 'voice-indicator';
        indicator.innerHTML = '🎤';
        indicator.style.cssText = "position: fixed; bottom: 20px; right: 20px; background: red; color: white; padding: 10px; border-radius: 50%; z-index: 9999;";
        document.body.appendChild(indicator);
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

    stop() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        this.isRecording = false;
    }
}