/**
 * Sistema de Control por Voz - Visión Asistida
 * Integrado con Web Speech API
 */

class VoiceControl {
    constructor(config = {}) {
        this.lang = config.lang || 'es-AR';
        this.continuous = config.continuous !== false;
        this.interimResults = config.interimResults || false;
        this.comandos = new Map();
        this.recognition = null;
        this.isListening = false;
        this.onStatusChange = config.onStatusChange || (() => {});
        this.onCommandDetected = config.onCommandDetected || (() => {});
        this.backendURL = config.backendURL || '';
        
        this.inicializar();
    }

    inicializar() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.error('El navegador no soporta reconocimiento de voz');
            this.onStatusChange('not-supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = this.lang;
        this.recognition.continuous = this.continuous;
        this.recognition.interimResults = this.interimResults;
        this.recognition.maxAlternatives = 1;

        this.recognition.onstart = () => {
            this.isListening = true;
            this.onStatusChange('listening');
            console.log('🎤 Escuchando...');
        };

        this.recognition.onend = () => {
            const wasListening = this.isListening;
            this.isListening = false;
            this.onStatusChange('stopped');
            console.log('🎤 Detenido');
            
            // Solo reiniciar si continuous está activo y realmente estaba escuchando
            if (this.continuous && wasListening) {
                setTimeout(() => this.iniciar(), 500);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Error de reconocimiento:', event.error);
            this.onStatusChange('error', event.error);
            
            // NO reintentar automáticamente para evitar loops
            if (event.error === 'no-speech') {
                console.log('💡 Tip: Hablá más cerca del micrófono');
            } else if (event.error === 'audio-capture') {
                console.error('❌ No se puede acceder al micrófono. Verificá los permisos.');
            } else if (event.error === 'not-allowed') {
                console.error('❌ Permiso denegado. Habilitá el micrófono en la configuración del navegador.');
                this.onStatusChange('not-allowed');
            } else if (event.error === 'aborted') {
                console.log('⚠️ Reconocimiento abortado');
            }
        };

        this.recognition.onresult = (event) => {
            const resultado = event.results[event.results.length - 1];
            const transcript = resultado[0].transcript.toLowerCase().trim();
            const confidence = resultado[0].confidence;

            console.log(`Texto detectado: "${transcript}" (confianza: ${(confidence * 100).toFixed(1)}%)`);
            
            this.onCommandDetected(transcript, confidence);
            this.procesarComando(transcript);
        };

        console.log('✅ Sistema de voz inicializado');
    }

    registrarComando(patron, accion, opciones = {}) {
        const comando = {
            patron,
            accion,
            descripcion: opciones.descripcion || '',
            prioridad: opciones.prioridad || 0,
            requiereConfirmacion: opciones.requiereConfirmacion || false
        };
        
        this.comandos.set(patron, comando);
        console.log(`Comando registrado: ${patron}`);
    }

    procesarComando(texto) {
        const comandosOrdenados = Array.from(this.comandos.entries())
            .sort((a, b) => b[1].prioridad - a[1].prioridad);

        for (const [patron, comando] of comandosOrdenados) {
            let match = null;

            if (typeof patron === 'string') {
                if (texto.includes(patron)) {
                    match = texto;
                }
            }
            else if (patron instanceof RegExp) {
                const regexMatch = texto.match(patron);
                if (regexMatch) {
                    match = regexMatch;
                }
            }

            if (match) {
                console.log(`✓ Comando ejecutado: ${patron}`);
                
                if (comando.requiereConfirmacion) {
                    if (confirm(`¿Ejecutar comando: ${comando.descripcion}?`)) {
                        comando.accion(match, texto);
                    }
                } else {
                    comando.accion(match, texto);
                }
                return true;
            }
        }

        console.log('No se encontró comando para:', texto);
        return false;
    }

    iniciar() {
        if (!this.recognition) {
            console.error('Sistema de reconocimiento no disponible');
            return;
        }

        // Si ya está escuchando, no hacer nada
        if (this.isListening) {
            console.log('⚠️ Ya está escuchando');
            return;
        }

        try {
            this.recognition.start();
        } catch (e) {
            console.error('Error al iniciar:', e);
        }
    }

    detener() {
        if (this.recognition) {
            this.continuous = false;
            this.recognition.stop();
        }
    }

    obtenerComandos() {
        return Array.from(this.comandos.entries()).map(([patron, comando]) => ({
            patron: patron.toString(),
            descripcion: comando.descripcion,
            prioridad: comando.prioridad
        }));
    }
}

// ============================================
// COMANDOS ESPECÍFICOS PARA VISIÓN ASISTIDA
// ============================================

function inicializarComandosVisionAsistida(voiceControl) {
    
    // ====== COMANDOS DE AUTENTICACIÓN ======
    
    voiceControl.registrarComando(/escribir (.*) en email/, (match) => {
        const texto = match[1].trim();
        const emailInputs = [
            document.getElementById('loginEmail'),
            document.getElementById('regEmail')
        ];
        
        emailInputs.forEach(input => {
            if (input && !input.closest('.page-container').classList.contains('hidden')) {
                input.value = texto;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }, { descripcion: 'Escribir email', prioridad: 10 });

    voiceControl.registrarComando(/escribir (.*) en (contraseña|password)/, (match) => {
        const texto = match[1].trim();
        const passwordInputs = [
            document.getElementById('loginPassword'),
            document.getElementById('regPassword')
        ];
        
        passwordInputs.forEach(input => {
            if (input && !input.closest('.page-container').classList.contains('hidden')) {
                input.value = texto;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }, { descripcion: 'Escribir contraseña', prioridad: 10 });

    voiceControl.registrarComando(/repetir contraseña (.*)/, (match) => {
        const texto = match[1].trim();
        const input = document.getElementById('regPassword2');
        if (input) {
            input.value = texto;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, { descripcion: 'Repetir contraseña en registro' });

    voiceControl.registrarComando('iniciar sesión', () => {
        console.log('🔍 Buscando botón de login...');
        const btn = document.getElementById('loginBtn');
        if (btn && !btn.closest('.page-container').classList.contains('hidden')) {
            console.log('✓ Botón encontrado, haciendo click');
            btn.click();
        } else {
            console.log('❌ Botón no encontrado o página oculta');
        }
    }, { descripcion: 'Hacer clic en Entrar' });

    voiceControl.registrarComando('entrar', () => {
        console.log('🔍 Intentando hacer login...');
        const btn = document.getElementById('loginBtn');
        if (btn && !btn.closest('.page-container').classList.contains('hidden')) {
            console.log('✓ Presionando botón Entrar');
            btn.click();
        } else {
            console.log('❌ No estás en la página de login');
        }
    }, { descripcion: 'Hacer clic en Entrar' });

    voiceControl.registrarComando('registrarse', () => {
        console.log('🔍 Navegando a página de registro...');
        window.location.hash = '#register';
    }, { descripcion: 'Ir a página de registro', prioridad: 8 });

    voiceControl.registrarComando('crear cuenta', () => {
        console.log('🔍 Intentando crear cuenta...');
        const btn = document.getElementById('registerBtn');
        if (btn && !btn.closest('.page-container').classList.contains('hidden')) {
            console.log('✓ Presionando botón Crear Cuenta');
            btn.click();
        } else {
            console.log('❌ No estás en la página de registro');
        }
    }, { descripcion: 'Hacer clic en Crear Cuenta' });

    voiceControl.registrarComando('registro', () => {
        const link = document.querySelector('a[href="#register"]');
        if (link) link.click();
    }, { descripcion: 'Ir a página de registro', prioridad: 5 });

    voiceControl.registrarComando('ir a registro', () => {
        const link = document.querySelector('a[href="#register"]');
        if (link) link.click();
    }, { descripcion: 'Ir a página de registro' });

    voiceControl.registrarComando('login', () => {
        const link = document.querySelector('a[href="#login"]');
        if (link) link.click();
    }, { descripcion: 'Ir a página de login', prioridad: 5 });

    voiceControl.registrarComando('ir a login', () => {
        const link = document.querySelector('a[href="#login"]');
        if (link) link.click();
    }, { descripcion: 'Ir a página de login' });

    voiceControl.registrarComando('inicio', () => {
        const link = document.querySelector('a[href="#login"]');
        if (link) link.click();
    }, { descripcion: 'Ir al inicio (login)' });

    voiceControl.registrarComando('cerrar sesión', () => {
        const btn = document.getElementById('logoutBtn');
        if (btn && !btn.classList.contains('hidden')) {
            btn.click();
        }
    }, { descripcion: 'Cerrar sesión' });

    // ====== COMANDOS DE CÁMARA ======

    voiceControl.registrarComando('captura', () => {
        const btn = document.getElementById('captureBtn');
        if (btn) {
            btn.click();
            console.log('📸 Capturando imagen...');
        }
    }, { descripcion: 'Capturar foto con la cámara', prioridad: 15 });

    voiceControl.registrarComando('capturar', () => {
        const btn = document.getElementById('captureBtn');
        if (btn) {
            btn.click();
            console.log('📸 Capturando imagen...');
        }
    }, { descripcion: 'Capturar foto con la cámara', prioridad: 15 });

    voiceControl.registrarComando('tomar foto', () => {
        const btn = document.getElementById('captureBtn');
        if (btn) btn.click();
    }, { descripcion: 'Capturar foto con la cámara' });

    voiceControl.registrarComando('sacar foto', () => {
        const btn = document.getElementById('captureBtn');
        if (btn) btn.click();
    }, { descripcion: 'Capturar foto con la cámara' });

    voiceControl.registrarComando('foto', () => {
        const btn = document.getElementById('captureBtn');
        if (btn) btn.click();
    }, { descripcion: 'Capturar foto con la cámara' });

    voiceControl.registrarComando('subir imagen', () => {
        const btn = document.getElementById('uploadBtn');
        if (btn) btn.click();
    }, { descripcion: 'Abrir selector de archivo' });

    voiceControl.registrarComando('subir archivo', () => {
        const btn = document.getElementById('uploadBtn');
        if (btn) btn.click();
    }, { descripcion: 'Abrir selector de archivo' });

    voiceControl.registrarComando('cargar imagen', () => {
        const btn = document.getElementById('uploadBtn');
        if (btn) btn.click();
    }, { descripcion: 'Abrir selector de archivo' });

    // ====== COMANDOS GENERALES ======

    voiceControl.registrarComando('limpiar', () => {
        const emailInputs = document.querySelectorAll('input[type="email"]');
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        
        [...emailInputs, ...passwordInputs].forEach(input => {
            if (!input.closest('.page-container').classList.contains('hidden')) {
                input.value = '';
            }
        });
    }, { descripcion: 'Limpiar campos del formulario activo' });

    voiceControl.registrarComando('ayuda', () => {
        mostrarAyudaComandos(voiceControl);
    }, { descripcion: 'Mostrar lista de comandos disponibles' });

    voiceControl.registrarComando('detener escucha', () => {
        voiceControl.detener();
    }, { descripcion: 'Detener el sistema de reconocimiento de voz' });

    voiceControl.registrarComando('activar escucha', () => {
        voiceControl.iniciar();
    }, { descripcion: 'Activar el sistema de reconocimiento de voz' });

    voiceControl.registrarComando('repetir', () => {
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer && audioPlayer.src) {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        }
    }, { descripcion: 'Repetir el último audio' });

    voiceControl.registrarComando('pausar audio', () => {
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer) audioPlayer.pause();
    }, { descripcion: 'Pausar el audio' });

    voiceControl.registrarComando('reproducir audio', () => {
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer) audioPlayer.play();
    }, { descripcion: 'Reproducir el audio' });
}

function mostrarAyudaComandos(voiceControl) {
    const comandos = voiceControl.obtenerComandos();
    let mensaje = '🎤 COMANDOS DE VOZ DISPONIBLES:\n\n';
    
    mensaje += '📝 AUTENTICACIÓN:\n';
    mensaje += '• "escribir [texto] en email"\n';
    mensaje += '• "escribir [texto] en contraseña"\n';
    mensaje += '• "entrar" / "iniciar sesión"\n';
    mensaje += '• "registrarse" / "crear cuenta"\n';
    mensaje += '• "cerrar sesión"\n\n';
    
    mensaje += '📷 CÁMARA:\n';
    mensaje += '• "capturar" / "tomar foto" / "foto"\n';
    mensaje += '• "subir imagen"\n';
    mensaje += '• "repetir" (audio)\n\n';
    
    mensaje += '⚙️ CONTROL:\n';
    mensaje += '• "ayuda" - Mostrar esta ayuda\n';
    mensaje += '• "detener escucha" / "activar escucha"\n';
    mensaje += '• "limpiar" - Borrar campos\n';
    
    alert(mensaje);
}

// ============================================
// INTERFAZ DE USUARIO
// ============================================

function crearInterfazVoz() {
    const container = document.createElement('div');
    container.id = 'voice-control-ui';
    container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        padding: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: Arial, sans-serif;
        min-width: 250px;
    `;

    container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px; color: white;">
            <button id="voice-toggle" style="
                background: white;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                font-size: 24px;
                cursor: pointer;
                transition: transform 0.2s;
                box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            ">🎤</button>
            <div style="flex: 1;">
                <div id="voice-status" style="font-weight: bold; font-size: 14px;">Inactivo</div>
                <div id="voice-transcript" style="font-size: 12px; opacity: 0.9; margin-top: 5px;"></div>
            </div>
            <button id="voice-help" style="
                background: rgba(255,255,255,0.2);
                border: 1px solid white;
                border-radius: 8px;
                color: white;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 12px;
            ">?</button>
        </div>
    `;

    document.body.appendChild(container);

    return {
        container,
        toggleBtn: document.getElementById('voice-toggle'),
        statusDiv: document.getElementById('voice-status'),
        transcriptDiv: document.getElementById('voice-transcript'),
        helpBtn: document.getElementById('voice-help')
    };
}

// ============================================
// INICIALIZACIÓN GLOBAL
// ============================================

let voiceControlInstance = null;

function inicializarSistemaVoz() {
    const ui = crearInterfazVoz();
    
    voiceControlInstance = new VoiceControl({
        lang: 'es-AR',
        continuous: true,
        interimResults: false,
        onStatusChange: (status, error) => {
            switch(status) {
                case 'listening':
                    ui.statusDiv.textContent = '🎤 Escuchando...';
                    ui.toggleBtn.style.background = '#4ade80';
                    break;
                case 'stopped':
                    ui.statusDiv.textContent = 'Inactivo';
                    ui.toggleBtn.style.background = 'white';
                    break;
                case 'error':
                    ui.statusDiv.textContent = `Error: ${error}`;
                    break;
                case 'not-supported':
                    ui.statusDiv.textContent = 'No soportado';
                    ui.toggleBtn.disabled = true;
                    break;
            }
        },
        onCommandDetected: (transcript, confidence) => {
            ui.transcriptDiv.textContent = `"${transcript}" (${(confidence * 100).toFixed(0)}%)`;
            setTimeout(() => {
                ui.transcriptDiv.textContent = '';
            }, 3000);
        }
    });

    inicializarComandosVisionAsistida(voiceControlInstance);

    ui.toggleBtn.addEventListener('click', () => {
        if (voiceControlInstance.isListening) {
            voiceControlInstance.detener();
        } else {
            voiceControlInstance.iniciar();
        }
    });

    ui.helpBtn.addEventListener('click', () => {
        mostrarAyudaComandos(voiceControlInstance);
    });

    console.log('✅ Sistema de voz completamente inicializado para Visión Asistida');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarSistemaVoz);
} else {
    inicializarSistemaVoz();
}

window.VoiceControl = VoiceControl;
window.voiceControl = voiceControlInstance;