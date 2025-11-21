import AppController from './src/controllers/AppController.js';

window.addEventListener('DOMContentLoaded', () => {
  const app = new AppController({ apiUrl: 'http://127.0.0.1:3000/api' });
  app.init();
});