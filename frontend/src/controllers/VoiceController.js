import { VoiceCommandService } from '../services/VoiceCommandService.js';

export class VoiceController {
    constructor() {
        this.voiceService = new VoiceCommandService();
        this.createPushToTalkButton();
        this.setupEventListeners();
        this.isSpacePressed = false; // Para evitar repeticiones de tecla
    }

    setupEventListeners() {

        window.addEventListener("voice-command", (event) => {
            console.log("El controlador recibio:", event.detail.text);
            this.handleAdvancedCommands(event.detail.text);
        });

        // implemente push to talk pq toma el ruido de fondo
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpacePressed && !this.isTypingInInput(e)) {
                e.preventDefault(); 
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
        `;

        // Eventos Mouse/Touch para el botón visual
        btn.addEventListener('mousedown', (e) => this.startPTT(e, btn));
        window.addEventListener('mouseup', (e) => this.stopPTT(e, btn)); 
        btn.addEventListener('touchstart', (e) => this.startPTT(e, btn));
        btn.addEventListener('touchend', (e) => this.stopPTT(e, btn));

        document.body.appendChild(btn);
    }

    startPTT(e, btn) {
        if (this.isTalking) return; 
        this.isTalking = true;

        if(btn) {
            btn.style.background = '#F44336'; // Rojo = Grabando
            btn.style.transform = 'scale(1.1)';
        }
        
        console.log("Iniciando grabacion");
        this.voiceService.startRecording();
    }

    stopPTT(e, btn) {
        if (!this.isTalking) return;
        this.isTalking = false;

        if(btn) {
            btn.style.background = '#2196F3'; // Azul = Esperando
            btn.style.transform = 'scale(1)';
        }
        
        console.log("Deteniendo y enviando");
        this.voiceService.stopRecording();
    }


    handleAdvancedCommands(text) {
        const cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        console.log("Texto normalizado:", cleanText);

        let commandFound = false;


        if (cleanText.match(/(login|entrar|inicio|acceder)/)) {
             console.log("Comando login detectado");
             window.location.hash = '#login';
             this.voiceService.showToast("Navegando a Login");
             commandFound = true;
        }
        else if (cleanText.match(/(registro|crear cuenta|registrarse|alta)/)) {
             console.log("Comando registro detectado");
             window.location.hash = '#register';
             this.voiceService.showToast("Navegando a Registro");
             commandFound = true;
        }
        else if (cleanText.match(/(camara|foto|vision)/)) {
             console.log("Comando camara detectado");
             window.location.hash = '#camera';
             this.voiceService.showToast("Navegando a Cámara");
             commandFound = true;
        }

        if (this.handleFormCommands(cleanText)) {
            commandFound = true;
        }

        if (!commandFound) {
            console.warn("No se encontro comando para", cleanText);
            this.voiceService.showToast(`No entendí: "${text}"`);
        }
    }

    handleFormCommands(cleanText) {
        let executed = false;

        // "Escribir juan@gmail.com en email"
        const emailMatch = cleanText.match(/escribir\s+(.+?)\s+en\s+(email|correo)/);
        if (emailMatch) {
            console.log("Intento escribir email:", emailMatch[1]);
            this.fillEmailField(emailMatch[1]);
            executed = true;
        }
        
        // "Escribir 1234 en contraseña"
        const passMatch = cleanText.match(/escribir\s+(.+?)\s+en\s+(contrase?na|clave)/);
        if (passMatch) {
            console.log("Intento escribir password:", passMatch[1]);
            this.fillPasswordField(passMatch[1]);
            executed = true;
        }

        // Botones de acción
        if (cleanText.match(/^(enviar|ingresar|entrar|confirmar)$/)) {
            console.log("Intento enviar click");
            this.submitCurrentForm();
            executed = true;
        }
        
        if (cleanText.match(/(borrar|limpiar|vaciar)/)) {
            console.log("Intento limpiar formulario");
            this.clearCurrentForm();
            executed = true;
        }

        return executed;
    }

    fillEmailField(emailText) {
        const email = emailText
            .replace(/\s+/g, '')
            .replace(/arroba/g, '@')
            .replace(/punto/g, '.')
            .toLowerCase();
            
        const inputs = [document.getElementById('loginEmail'), document.getElementById('regEmail')];
        let found = false;
        inputs.forEach(input => {
            if (input && this.isElementVisible(input)) {
                input.value = email;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                this.voiceService.showToast(`Email: ${email}`);
                found = true;
            }
        });
        if(!found) console.log("No encontré ningún input de email visible en pantalla");
    }

    fillPasswordField(passText) {
        const pass = passText.replace(/\s+/g, '');
        const inputs = [document.getElementById('loginPassword'), document.getElementById('regPassword')];
        let found = false;
        inputs.forEach(input => {
            if (input && this.isElementVisible(input)) {
                input.value = pass;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                this.voiceService.showToast(' Contraseña escrita');
                found = true;
            }
        });
        if(!found) console.log(" No encontré input de contraseña visible");
    }

    submitCurrentForm() {
        const loginBtn = document.getElementById('loginBtn');
        const regBtn = document.getElementById('registerBtn'); // Asegúrate que este ID es correcto en tu HTML

        if (loginBtn && this.isElementVisible(loginBtn)) {
            loginBtn.click();
        } else if (regBtn && this.isElementVisible(regBtn)) {
            regBtn.click();
        } else {
            console.log(" No encontré botón de login/registro visible");
        }
    }

    clearCurrentForm() {
        document.querySelectorAll('input').forEach(i => i.value = '');
        this.voiceService.showToast(" Formulario limpio");
    }

    isElementVisible(el) {
        // Verifica si el elemento existe y tiene tamaño (es visible)
        return el && (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0);
    }
}