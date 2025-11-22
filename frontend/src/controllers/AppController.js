import { $, $$, showToast, showFormMessage, clearFormMessages, markInputError, validateEmail } from '../utils/dom.js';
import AuthApi from '../api/AuthApi.js';
import CaptionApi from '../api/CaptionApi.js';
import CameraService from '../services/CameraService.js';
import AudioService from '../services/AudioService.js';
import { blobToFile } from '../utils/fileUtils.js';

/**
* Controlador principal que conecta DOM, servicios y APIs
*/
export default class AppController {
  /**
  * @param {{apiUrl: string}} options
  */
  constructor({ apiUrl }){
    this.API_URL = apiUrl;

    // DOM
    this.toast = $('#toast');
    this.logoutBtn = $('#logoutBtn');

    // pages
    this.pages = $$('.page-container');
    this.pageLogin = $('#page-login');
    this.pageRegister = $('#page-register');
    this.pageCamera = $('#page-camera');

    // login
    this.loginMessage = $('#loginMessage');
    this.loginEmailEl = $('#loginEmail');
    this.loginPassEl = $('#loginPassword');
    this.loginBtn = $('#loginBtn');

    // register
    this.registerMessage = $('#registerMessage');
    this.regEmailEl = $('#regEmail');
    this.regPassEl = $('#regPassword');
    this.regPass2El = $('#regPassword2');
    this.registerBtn = $('#registerBtn');

    // camera
    this.video = $('#camera');
    this.canvas = $('#snapshot');
    this.captureBtn = $('#captureBtn');
    this.uploadBtn = $('#uploadBtn');
    this.fileInput = $('#fileInput');
    this.captionText = $('#captionText');
    this.audioPlayer = $('#audioPlayer');
    this.cameraLoading = $('#cameraLoading');
    this.cameraContainer = $('#cameraContainer');

    // services & apis
    this.authApi = new AuthApi(this.API_URL);
    this.captionApi = new CaptionApi(this.API_URL);
    this.cameraService = new CameraService(this.video, this.canvas, this.cameraLoading, this.cameraContainer);
    this.audioService = new AudioService();

    // preload audios
    this.audioService.preload('capture','audios-botones/CapturarImagen.wav');
    this.audioService.preload('logout','audios-botones/CerrarSesion.wav');
    this.audioService.preload('password','audios-botones/Password.wav');
    this.audioService.preload('email','audios-botones/Email.wav');
    this.audioService.preload('enter','audios-botones/Entrar.wav');
    this.audioService.preload('login','audios-botones/IniciarSesion.wav');
    this.audioService.preload('register','audios-botones/Registrarse.wav');
    this.audioService.preload('repeatPassword','audios-botones/RepetirPassword.wav');
    this.audioService.preload('upload','audios-botones/SubirImagen.wav');
    this.audioService.preload('userNotFound','audios-botones/UsuarioNoEncontrado.wav');
    this.audioService.preload('userExists','audios-botones/UsuarioYaExiste.wav');
    this.audioService.preload('createAccount','audios-botones/CrearCuenta.wav');
    this.audioService.preload('loginBtn','audios-botones/Login.wav');

    // small cooldown guard for manual plays
    this.playCooldown = false;
  }

  /**
  * Inicializa bindings y ruteo
  * @returns {void}
  */
  init(){
    this.bindEvents();
    this.handleRouteChange();
    window.addEventListener('hashchange', () => this.handleRouteChange());
  }

  /**
  * Recupera usuario actual desde sessionStorage (si existe)
  * @returns {Object|null}
  */
  getCurrentUser(){
    const s = sessionStorage.getItem('currentUser');
    return s ? JSON.parse(s) : null;
  }

  /**
  * Vincula eventos DOM a handlers y reproduce audios en hover/click
  * @returns {void}
  */
  bindEvents(){
    if (this.loginBtn) {
      this.loginBtn.addEventListener('mouseenter', () => this.audioService.play('loginBtn'));
      this.loginBtn.addEventListener('click', () => this.handleLogin());
    }

    if (this.registerBtn) {
      this.registerBtn.addEventListener('mouseenter', () => this.audioService.play('createAccount'));
      this.registerBtn.addEventListener('click', () => this.handleRegister());
    }

    if (this.captureBtn) {
      this.captureBtn.addEventListener('mouseenter', () => this.audioService.play('capture'));
      this.captureBtn.addEventListener('click', () => this.handleCapture());
    }

    if (this.uploadBtn) {
      this.uploadBtn.addEventListener('mouseenter', () => this.audioService.play('upload'));
      this.uploadBtn.addEventListener('click', () => this.fileInput.click());
    }

    if (this.fileInput) this.fileInput.addEventListener('change', () => this.handleFileUpload());

    if (this.logoutBtn) {
      this.logoutBtn.addEventListener('mouseenter', () => this.audioService.play('logout'));
      this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    
    const linkRegistrate = document.querySelector('a[href="#register"]');
    if (linkRegistrate) linkRegistrate.addEventListener('mouseenter', () => this.audioService.play('register'));
    const linkIniciarSesion = document.querySelector('a[href="#login"]');
    if (linkIniciarSesion) linkIniciarSesion.addEventListener('mouseenter', () => this.audioService.play('login'));

    
    if (this.loginEmailEl) this.loginEmailEl.addEventListener('focus', () => this.audioService.play('email'));
    if (this.loginPassEl) this.loginPassEl.addEventListener('focus', () => this.audioService.play('password'));
    if (this.regEmailEl) this.regEmailEl.addEventListener('focus', () => this.audioService.play('email'));
    if (this.regPassEl) this.regPassEl.addEventListener('focus', () => this.audioService.play('password'));
    if (this.regPass2El) this.regPass2El.addEventListener('focus', () => this.audioService.play('repeatPassword'));
  }

  /**
  * Maneja rutas y visibilidad de paginas
  * @returns {void}
  */
  handleRouteChange(){
    const hash = window.location.hash || '#login';
    const user = this.getCurrentUser();
    let target = hash;

    if (hash === '#camera' && !user) { target = '#login'; showToast(this.toast, 'Debes iniciar sesión primero'); }
    else if ((hash === '#login' || hash === '#register') && user) { target = '#camera'; }
    else if (hash === '#logout') { target = '#login'; }

    if (window.location.hash !== target) { window.location.hash = target; return; }

    let found = false;
    this.pages.forEach(p => {
      if (p.dataset.page === target.substring(1)) { p.classList.add('active'); found = true; }
      else p.classList.remove('active');
    });

    if (target === '#login') this.audioService.play('login');
    if (target === '#register') this.audioService.play('register');

    if (!found) { this.pageLogin.classList.add('active'); window.location.hash = '#login'; }

    if (user) {
      if (this.logoutBtn) this.logoutBtn.classList.remove('hidden');
      if (target === '#camera') this.cameraService.init().catch(() => showToast(this.toast, 'No se pudo acceder a la cámara'));
    } else {
      if (this.logoutBtn) this.logoutBtn.classList.add('hidden');
    }
  }

  /**
  * Maneja registro de usuario (validaciones locales + llamada a API)
  * @returns {Promise<void>}
  */
  async handleRegister(){
    clearFormMessages([this.registerMessage]);
    const email = this.regEmailEl.value.trim();
    const pass = this.regPassEl.value;
    const pass2 = this.regPass2El.value;
    [this.regEmailEl, this.regPassEl, this.regPass2El].forEach(i => markInputError(i, false));

    if (!email || !pass || !pass2) {
      if (!email) markInputError(this.regEmailEl);
      if (!pass) markInputError(this.regPassEl);
      if (!pass2) markInputError(this.regPass2El);
      this.audioService.readText('Complete todos los campos');
      return showFormMessage(this.registerMessage, 'Complete todos los campos', 'error');
    }
    if (!validateEmail(email)) { markInputError(this.regEmailEl); this.audioService.readText('Ingrese un email válido'); return showFormMessage(this.registerMessage, 'Ingrese un email válido', 'error'); }
    if (pass.length < 6) { markInputError(this.regPassEl); this.audioService.readText('La contraseña debe tener al menos 6 caracteres'); return showFormMessage(this.registerMessage, 'La contraseña debe tener al menos 6 caracteres', 'error'); }
    if (pass !== pass2) { markInputError(this.regPassEl, true); markInputError(this.regPass2El, true); this.audioService.readText('Las contraseñas no coinciden'); return showFormMessage(this.registerMessage, 'Las contraseñas no coinciden', 'error'); }

    try {
      await this.authApi.register(email, pass);
      showFormMessage(this.registerMessage, 'Registro exitoso ✔', 'success', 1800);
      showToast(this.toast, 'Usuario creado correctamente');
      this.audioService.play('createAccount');
      setTimeout(() => {
        [this.regEmailEl, this.regPassEl, this.regPass2El].forEach(i => { i.value = ''; markInputError(i, false); });
        window.location.hash = '#login';
      }, 1000);
    } catch (err) {
      showFormMessage(this.registerMessage, err.message, 'error');
      // reproducir sonidos segun mensaje
      if (err.message.toLowerCase().includes('ya existe')) this.audioService.play('userExists');
      this.audioService.readText(err.message);
    }
  }

  /**
  * Maneja login de usuario (validaciones locales + llamada a API)
  * @returns {Promise<void>}
  */
  async handleLogin(){
    clearFormMessages([this.loginMessage]);
    const email = this.loginEmailEl.value.trim();
    const pass = this.loginPassEl.value;
    [this.loginEmailEl, this.loginPassEl].forEach(i => markInputError(i, false));

    if (!email || !pass) {
      if (!email) markInputError(this.loginEmailEl);
      if (!pass) markInputError(this.loginPassEl);
      this.audioService.readText('Complete email y contraseña');
      return showFormMessage(this.loginMessage, 'Complete email y contraseña', 'error');
    }

    try {
      const data = await this.authApi.login(email, pass);
      const userToSave = data.user || { email, id: data.userId || 'unknown' };
      sessionStorage.setItem('currentUser', JSON.stringify(userToSave));
      showFormMessage(this.loginMessage, 'Accediendo...', 'success', 800);
      showToast(this.toast, `Bienvenido, ${userToSave.email}`);
      this.audioService.readText(`Bienvenido ${userToSave.email}`);
      setTimeout(() => {
        window.location.hash = '#camera';
        clearFormMessages([this.loginMessage]);
      }, 600);
    } catch (err) {
      markInputError(this.loginEmailEl);
      markInputError(this.loginPassEl);
      showFormMessage(this.loginMessage, err.message, 'error');
      if (err.message.toLowerCase().includes('usuario no encontrado') || err.message.toLowerCase().includes('credenciales incorrectas')) {
        this.audioService.play('userNotFound');
      }
      this.audioService.readText(err.message);
    }
  }

  /**
  * Cerrar sesion: limpia sessionStorage y actualiza UI.
  * @returns {void}
  */
  handleLogout(){
    sessionStorage.removeItem('currentUser');
    showToast(this.toast, 'Sesión cerrada');
    this.audioService.play('logout');
    this.cameraService.stop();
    if (this.loginEmailEl) this.loginEmailEl.value = '';
    if (this.loginPassEl) this.loginPassEl.value = '';
    window.location.hash = '#login';
  }

  /**
  * Captura desde la camara y envia la imagen al servicio de captions
  * @returns {Promise<void>}
  */
  async handleCapture(){
    try {
      const blob = await this.cameraService.captureToBlob();
      if (!blob) return;
      this.audioService.play('capture');
      await this.sendBlobToCaption(blob);
    } catch (err) {
      console.error(err);
      showToast(this.toast, 'Error al capturar');
      this.audioService.readText('Error al capturar');
    }
  }

  /**
  * Maneja carga de archivo por input y lo envia a captions
  * @returns {Promise<void>}
  */
  async handleFileUpload(){
    const file = this.fileInput.files[0];
    if (!file) return;
    this.audioService.play('upload');
    await this.sendBlobToCaption(file);
    this.fileInput.value = '';
  }

  /**
  * Envia un Blob/File al API de captions y gestiona la respuesta (texto/audio)
  * @param {Blob|File} blob
  * @returns {Promise<void>}
  */
  async sendBlobToCaption(blob){
    if (this.captionText) this.captionText.textContent = 'Procesando...';
    const formData = new FormData();
    const user = this.getCurrentUser();
    const file = blob instanceof File ? blob : blobToFile(blob, 'image.jpg');
    formData.append('file', file);
    if (user && user.id) formData.append('userId', user.id);

    try {
      const data = await this.captionApi.uploadImage(formData);
      this.captionText.textContent = data.objects || data.caption || 'Descripción generada.';
      
      if (data.audioUrl || data.audio_url) {
        this.audioService.setPlayerSrc(this.audioPlayer, data.audioUrl || data.audio_url);
      } else if (data.audio_base64) {
        this.audioService.playTTSResponse({ audio_base64: data.audio_base64 });
      }
    } catch (err) {
      console.error(err);
      this.captionText.textContent = 'Error: ' + err.message;
      this.audioService.readText(err.message);
    }
  }
}
