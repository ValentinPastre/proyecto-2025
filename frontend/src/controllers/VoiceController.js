import { VoiceCommandService } from '../services/VoiceCommandService.js';

export class VoiceController {
    constructor() {
        this.voiceService = new VoiceCommandService();
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener("voice-command", (event) => {
            console.log("Comando recibido en Controller:", event.detail.text); 
            this.handleAdvancedCommands(event.detail.text);
        });

    }

    handleAdvancedCommands(text) {
        const lowerText = text.toLowerCase();
        

        this.handleFormCommands(lowerText, text);
        

        this.handleAudioCommands(lowerText);
        

        this.handleSystemCommands(lowerText);
    }

    handleFormCommands(lowerText, originalText) {

        const cleanText = lowerText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const emailMatch = cleanText.match(/escribir\s+(.+?)\s+en\s+(email|correo|mail)/);
        if (emailMatch) {
            this.fillEmailField(emailMatch[1]);
            return;
        }

        // Comando: "escribir [PASSWORD] en contraseña"
        const passMatch = cleanText.match(/escribir\s+(.+?)\s+en\s+(contrase?na|password|clave)/); // contrase?na acepta con o sin ñ
        if (passMatch && !cleanText.includes('repetir')) {
            this.fillPasswordField(passMatch[1]);
            return;
        }

        // Comando: "repetir contraseña [PASSWORD]"
        const repeatPassMatch = cleanText.match(/repetir\s+(contrase?na|password|clave)\s+(.+)/);
        if (repeatPassMatch) {
            this.fillRepeatPasswordField(repeatPassMatch[2]);
            return;
        }

        // Comando: "enviar" o "confirmar"
        if (cleanText.match(/^(enviar|confirmar|aceptar|ok|ingresar)$/)) {
            this.submitCurrentForm();
            return;
        }

        // Comando: "limpiar" o "borrar"
        if (cleanText.match(/(limpiar|borrar|vaciar)/) && !cleanText.includes('sesion')) {
            this.clearCurrentForm();
            return;
        }
    }

    fillEmailField(emailText) {
        const email = emailText
            .replace(/\s+/g, '')       
            .replace(/arroba/g, '@')   
            .replace(/punto/g, '.')    
            .toLowerCase();            
        
        const emailInputs = [
            document.getElementById('loginEmail'),
            document.getElementById('regEmail')
        ];
        
        let found = false;
        emailInputs.forEach(input => {
            if (input && this.isElementVisible(input)) {
                input.value = email;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                this.showToast(`Email: ${email}`);
                found = true;
            }
        });
        if(!found) console.log("No se encontró campo de email visible");
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
            console.log("Click en Login");
            loginBtn.click();
            return;
        }
        
        if (registerBtn && this.isElementVisible(registerBtn)) {
            console.log("Click en Registro");
            registerBtn.click();
            return;
        }
    }

    clearCurrentForm() {
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
        inputs.forEach(input => {
            if (this.isElementVisible(input)) {
                input.value = '';
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        this.showToast('Formulario limpiado');
    }

    handleAudioCommands(lowerText) {
        const audioPlayer = document.getElementById('audioPlayer');
        if (!audioPlayer) return;

        if (lowerText.match(/(reproducir|repetir|escuchar|play)/) && !lowerText.includes('contraseña')) {
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
        if (lowerText.includes('cerrar sesion') || lowerText.includes('logout') || lowerText.includes('salir')) {
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) logoutBtn.click();
        }
    }

    isElementVisible(element) {
        return element.offsetWidth > 0 && element.offsetHeight > 0;
    }

    showToast(message, duration = 3000) {
        console.log("TOAST:", message); // Backup por si no tienes UI de toast
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('visible');
            setTimeout(() => toast.classList.remove('visible'), duration);
        }
    }
}