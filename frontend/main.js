/**
* Punto de entrada del frontend
* - Espera a que el DOM este cargado
* - Crea una instancia del AppController
* - Inicializa toda la aplicacion (router, camara, eventos, APIs, etc)
*/
import AppController from './src/controllers/AppController.js';

window.addEventListener('DOMContentLoaded', () => {
  /**
  * Instancia principal de la app
  * @type {AppController}
  */
  const app = new AppController({ apiUrl: 'http://127.0.0.1:3000/api' });
  // Inicializa logica, eventos, router y servicios
  app.init();
});