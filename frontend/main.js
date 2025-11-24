//inicializa toda la aplicacion
import AppController from './src/controllers/AppController.js';
import {VoiceController} from './src/controllers/VoiceController.js';

document.addEventListener('DOMContentLoaded', () => {
  window.voiceController = new VoiceController();
});

window.addEventListener('DOMContentLoaded', () => {
  // @type {AppController}
  const app = new AppController({ apiUrl: 'http://127.0.0.1:3000/api' });
  app.init();
});
