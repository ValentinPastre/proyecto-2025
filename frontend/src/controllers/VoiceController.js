import { VoiceCommandService } from '../services/VoiceCommandService.js';

export class VoiceController {
    constructor() {
        this.voiceService = new VoiceCommandService();
        this.createPushToTalkButton();
        this.setupEventListeners();
        this.isSpacePressed = false; 
    }

    setupEventListeners() {
        window.addEventListener("voice-command", (event) => {
            console.log("Controlador recibido:", event.detail.text);
            this.handleAdvancedCommands(event.detail.text);
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpacePressed && !this.isTypingInInput(e)) {
                e.preventDefault(); // Evitar scroll
                this.isSpacePressed = true;
                
                const btn = document.getElementById('ptt-btn');
                this.startPTT(e, btn);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.isSpacePressed) {
                e.preventDefault();
                this.isSpacePressed = false;
                
                const btn = document.getElementById('ptt-btn');
                this.stopPTT(e, btn);
            }
        });
    }


    isTypingInInput(e) {
        const tag = e.target.tagName.toLowerCase();
        const isInput = (tag === 'input' || tag === 'textarea');
        return isInput && !e.target.readOnly; 
    }


    createPushToTalkButton() {
        if(document.getElementById('ptt-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'ptt-btn';
        btn.innerHTML = '🎤';
        btn.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; width: 70px; height: 70px; 
            border-radius: 50%; background: #2196F3; color: white; border: none; 
            font-size: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 9999; 
            cursor: pointer; transition: transform 0.1s, background 0.2s; user-select: none;
            touch-action: manipulation;
        `;

        btn.addEventListener('mousedown', (e) => this.startPTT(e, btn));
        window.addEventListener('mouseup', (e) => this.stopPTT(e, btn)); 
        btn.addEventListener('touchstart', (e) => this.startPTT(e, btn));
        btn.addEventListener('touchend', (e) => this.stopPTT(e, btn));

        document.body.appendChild(btn);
    }

    startPTT(e, btn) {
        if(e && e.cancelable) e.preventDefault();
        if (this.isTalking) return;
        this.isTalking = true;

        if(btn) {
            btn.style.background = '#F44336'; // Rojo
            btn.style.transform = 'scale(1.1)';
        }
        this.voiceService.startRecording();
    }

    stopPTT(e, btn) {
        if (!this.isTalking) return;
        this.isTalking = false;

        if(btn) {
            btn.style.background = '#2196F3'; // Azul
            btn.style.transform = 'scale(1)';
        }
        this.voiceService.stopRecording();
    }


    handleAdvancedCommands(text) {
        const cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        console.log(` Procesando: "${cleanText}"`);

        let commandFound = false;


        if (this.handleFormCommands(cleanText, text)) {
            commandFound = true;
        }


        if (!commandFound && this.handleAudioCommands(cleanText)) {
            commandFound = true;
        }


        if (!commandFound && this.handleSystemCommands(cleanText)) {
            commandFound = true;
        }


        if (!commandFound) {
            if (cleanText.match(/(login|entrar|inicio|acceder)/)) {
                window.location.hash = '#login';
                this.voiceService.showToast("Navegando a Login");
                commandFound = true;
            }
            else if (cleanText.match(/(registro|registrar|crear|alta)/)) {
                window.location.hash = '#register';
                this.voiceService.showToast("Navegando a Registro");
                commandFound = true;
            }

            else if (cleanText.match(/ir a (camara|foto|vision)/) || cleanText === 'camara') {
                window.location.hash = '#camera';
                this.voiceService.showToast("Abriendo Cámara");
                commandFound = true;
            }
            else if (cleanText.match(/(capturar|tomar|sacar|foto|imagen|imaje|vision)/)) {
                this.handleCameraCapture();
                commandFound = true;
            }
        }

        if (!commandFound) {
            console.warn(" Comando no reconocido:", cleanText);
        }
    }


    handleFormCommands(lowerText, originalText) {
        let executed = false;


        const emailMatch = lowerText.match(/escribir\s+(.+?)\s+en\s+(email|correo|mail)/);
        if (emailMatch) {
            this.fillEmailField(emailMatch[1]);
            executed = true;
        }
        const passMatch = lowerText.match(/escribir\s+(.+?)\s+en\s+(contrase?na|password|clave)/);
        if (passMatch && !lowerText.includes('repetir')) {
            this.fillPasswordField(passMatch[1]);
            executed = true;
        }


        const repeatPassMatch = lowerText.match(/repetir\s+(contrase?na|password|clave)\s+(.+)/);
        if (repeatPassMatch) {
            this.fillRepeatPasswordField(repeatPassMatch[2]);
            executed = true;
        }

        if (lowerText.match(/^(enviar|confirmar|aceptar|ok|ingresar|entrar)$/)) {
            this.submitCurrentForm();
            executed = true;
        }

        if (lowerText.match(/(limpiar|borrar|vaciar)/) && !lowerText.includes('sesion')) {
            this.clearCurrentForm();
            executed = true;
        }

        return executed;
    }

    handleAudioCommands(lowerText) {
        const audioPlayer = document.getElementById('audioPlayer');
        if (!audioPlayer) return false;

        if (lowerText.match(/(reproducir|repetir|escuchar|play)/) && !lowerText.includes('contraseña')) {
            if (audioPlayer.src) {
                audioPlayer.currentTime = 0;
                audioPlayer.play().catch(console.error);
                this.voiceService.showToast('Reproduciendo audio');
                return true;
            }
        }
        else if (lowerText.match(/(pausar|detener|parar|stop)/)) {
            if (!audioPlayer.paused) {
                audioPlayer.pause();
                this.voiceService.showToast('Audio pausado');
                return true;
            }
        }
        return false;
    }

    handleSystemCommands(lowerText) {
        if (lowerText.includes('cerrar sesion') || lowerText.includes('logout') || lowerText.includes('salir')) {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.click();
                return true;
            }
        }
        return false;
    }

    handleCameraCapture() {
        if (window.location.hash !== '#camera') {
            window.location.hash = '#camera';
            this.voiceService.showToast("Abriendo cámara...");
            setTimeout(() => this.clickCaptureButton(), 1500);
        } else {
            this.clickCaptureButton();
        }
    }

    clickCaptureButton() {
        const captureBtn = document.getElementById('captureBtn');
        if (captureBtn && this.isElementVisible(captureBtn)) {
            captureBtn.click();
            this.voiceService.showToast("¡Foto tomada!");
        } else {
            console.log(" No encontré el botón 'captureBtn'");
        }
    }


    fillEmailField(emailText) {
        const email = emailText
            .replace(/\s+/g, '')
            .replace(/arroba/g, '@')
            .replace(/punto/g, '.')
            .toLowerCase();
        
        const inputs = [document.getElementById('loginEmail'), document.getElementById('regEmail')];
        inputs.forEach(input => {
            if (this.isElementVisible(input)) {
                input.value = email;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                this.voiceService.showToast(` Email: ${email}`);
            }
        });
    }

    fillPasswordField(passwordText) {
        const password = passwordText.replace(/\s+/g, '');
        const inputs = [document.getElementById('loginPassword'), document.getElementById('regPassword')];
        inputs.forEach(input => {
            if (this.isElementVisible(input)) {
                input.value = password;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                this.voiceService.showToast('Contraseña escrita');
            }
        });
    }

    fillRepeatPasswordField(passwordText) {
        const password = passwordText.replace(/\s+/g, '');
        const repeatInput = document.getElementById('regPassword2');
        if (this.isElementVisible(repeatInput)) {
            repeatInput.value = password;
            repeatInput.dispatchEvent(new Event('input', { bubbles: true }));
            this.voiceService.showToast(' Contraseña confirmada');
        }
    }

    submitCurrentForm() {
        const loginBtn = document.getElementById('loginBtn');
        const regBtn = document.getElementById('registerBtn');
        
        if (this.isElementVisible(loginBtn)) {
            loginBtn.click();
        } else if (this.isElementVisible(regBtn)) {
            regBtn.click();
        }
    }

    clearCurrentForm() {
        document.querySelectorAll('input').forEach(input => {
            if(this.isElementVisible(input)) input.value = '';
        });
        this.voiceService.showToast('Formulario limpio');
    }

    isElementVisible(element) {
        if (!element) return false;
        return element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0;
    }
}