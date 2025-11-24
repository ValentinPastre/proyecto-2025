// main.js - Punto de entrada principal
import { AppController } from './src/controllers/JS AppController.js';
import { VoiceController } from './src/controllers/JS VoiceController.js';

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Inicializar controlador principal de la app
        window.appController = new AppController();
        
        // Inicializar controlador de voz
        window.voiceController = new VoiceController();
        
        console.log('✅ Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando la aplicación:', error);
        
        // Mostrar error al usuario
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = 'Error al cargar la aplicación';
            toast.classList.add('visible', 'error');
        }
    }
});

// Manejar errores no capturados
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
});