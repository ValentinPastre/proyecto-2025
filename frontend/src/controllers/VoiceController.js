import { VoiceCommandService } from '../services/VoiceCommandService.js';

export class VoiceController {
    constructor() {
        this.voiceService = new VoiceCommandService();
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener("voice-command", (event) => {
            this.handleAdvancedCommands(event.detail.text);
        });

        this.setupVoiceFormHandlers();
    }

    handleAdvancedCommands(text) {
        const lowerText = text.toLowerCase();
        
        this.handleFormCommands(lowerText, text);
        
        this.handleAudioCommands(lowerText);
        
        this.handleSystemCommands(lowerText);
    }

    handleFormCommands(lowerText, originalText) {
        // Comando: escribir [EMAIL] en email
        const emailMatch = lowerText.match(/escribir\s+(.+?)\s+en\s+(email|correo|mail)/);
        if (emailMatch) {
            this.fillEmailField(emailMatch[1]);
            return;
        }

        // Comando: escribir [PASSWORD] en contraseña
        const passMatch = lowerText.match(/escribir\s+(.+?)\s+en\s+(contraseña|password|clave)/);
        if (passMatch && !lowerText.includes('repetir')) {
            this.fillPasswordField(passMatch[1]);
            return;
        }

        // Comando: repetir contraseña [PASSWORD]
        const repeatPassMatch = lowerText.match(/repetir\s+(contraseña|password|clave)\s+(.+)/);
        if (repeatPassMatch) {
            this.fillRepeatPasswordField(repeatPassMatch[2]);
            return;
        }

        // Comando: enviar o confirmar
        if (lowerText.match(/^(enviar|confirmar|aceptar|ok|mandar|okey)$/)) {
            this.submitCurrentForm();
            return;
        }

        // Comando: limpiar o borrar
        if (lowerText.match(/(limpiar|borrar|vaciar)/) && !lowerText.includes('sesión')) {
            this.clearCurrentForm();
            return;
        }
    }

    fillEmailField(emailText) {
        const email = emailText
            .replace(/arroba/g, '@')
            .replace(/punto/g, '.')
            .replace(/\s+/g, '');
        
        const emailInputs = [
            document.getElementById('loginEmail'),
            document.getElementById('regEmail')
        ];
        
        emailInputs.forEach(input => {
            if (input && this.isElementVisible(input)) {
                input.value = email;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                this.showToast(`Email: ${email}`);
            }
        });
    }

    fillPasswordField(passwordText) {
        const password = passwordText.replace(/\s+/g, '');
        
        const passInputs = [
            document.getElementById('loginPassword'),
            document.getElementById('regPassword')
        ];
        
        passInputs.forEach(input => {
            if (input && this.isElementVisible(input)) {
                input.value = password;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                this.showToast('Contraseña ingresada');
            }
        });
    }

    fillRepeatPasswordField(passwordText) {
        const password = passwordText.replace(/\s+/g, '');
        const repeatInput = document.getElementById('regPassword2');
        
        if (repeatInput && this.isElementVisible(repeatInput)) {
            repeatInput.value = password;
            repeatInput.dispatchEvent(new Event('input', { bubbles: true }));
            this.showToast('Contraseña confirmada');
        }
    }

    submitCurrentForm() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginBtn && this.isElementVisible(loginBtn)) {
            loginBtn.click();
            return;
        }
        
        if (registerBtn && this.isElementVisible(registerBtn)) {
            registerBtn.click();
            return;
        }
    }

    clearCurrentForm() {
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
        inputs.forEach(input => {
            if (this.isElementVisible(input)) {
                input.value = '';
            }
        });
        this.showToast('Formulario limpiado');
    }

    handleAudioCommands(lowerText) {
        const audioPlayer = document.getElementById('audioPlayer');
        if (!audioPlayer) return;

        if (lowerText.match(/(reproducir|repetir|escuchar)/) && !lowerText.includes('contraseña')) {
            if (audioPlayer.src) {
                audioPlayer.currentTime = 0;
                audioPlayer.play().catch(console.error);
                this.showToast('Reproduciendo audio');
            }
        }
        else if (lowerText.match(/(pausar|detener|parar|stop)/)) {
            if (!audioPlayer.paused) {
                audioPlayer.pause();
                this.showToast('Audio pausado');
            }
        }
    }

    handleSystemCommands(lowerText) {
        if (lowerText.includes('cerrar sesión') || lowerText.includes('logout')) {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.click();
        }
    }

    isElementVisible(element) {
        const container = element.closest('.page-container');
        return container && !container.classList.contains('hidden');
    }

    showToast(message, duration = 3000) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('visible');
            setTimeout(() => toast.classList.remove('visible'), duration);
        }
    }
}
