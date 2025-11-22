/**
* Servicio encargado de iniciar/detener la camara y capturar frames como Blob
*/
export default class CameraService {
  /**
  * @param {HTMLVideoElement} videoEl - Elemento <video> donde se mostrara el stream
  * @param {HTMLCanvasElement} canvasEl - Canvas para capturar frames
  * @param {HTMLElement|null} cameraLoadingEl - Elemento que muestra estado de carga/errores
  * @param {HTMLElement|null} cameraContainerEl - Contenedor de la vista de camara
  */
  constructor(videoEl, canvasEl, cameraLoadingEl, cameraContainerEl){
    this.video = videoEl;
    this.canvas = canvasEl;
    this.cameraLoadingEl = cameraLoadingEl;
    this.cameraContainerEl = cameraContainerEl;
    this.stream = null;
  }

  /**
  * Inicializa la camara (pide permisos y asigna stream al video)
  * - oculta el texto de carga y muestra el contenedor cuando arranca
  * - lanza excepción si falla (para que el controller lo maneje)
  * @returns {Promise<void>}
  */
  async init(){
    if (!this.video) return;
    if (this.video.srcObject) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.stream = stream;
      if (this.cameraLoadingEl) this.cameraLoadingEl.classList.add('hidden');
      if (this.cameraContainerEl) this.cameraContainerEl.classList.remove('hidden');
      this.video.srcObject = stream;
    } catch (err) {
      if (this.cameraLoadingEl) this.cameraLoadingEl.textContent = 'Error: No se detecta camara.';
      throw err;
    }
  }

  /**
  * Detiene la camara y limpia el srcObject
  * @returns {void}
  */
  stop(){
    if (this.video && this.video.srcObject) {
      try {
        const tracks = this.video.srcObject.getTracks();
        tracks.forEach(t => t.stop());
      } catch(e) {
        console.warn('Error al detener cámara', e);
      }
      this.video.srcObject = null;
      this.stream = null;
      if (this.cameraContainerEl) this.cameraContainerEl.classList.add('hidden');
      if (this.cameraLoadingEl) this.cameraLoadingEl.classList.remove('hidden');
      this.cameraLoadingEl && (this.cameraLoadingEl.textContent = 'Cargando cámara...');
    }
  }

  /**
  * Captura el frame actual y devuelve un Blob (image/jpeg)
  * @param {string} [type='image/jpeg'] - Tipo MIME deseado
  * @param {number} [quality=0.92] - Calidad (si el formato lo soporta)
  * @returns {Promise<Blob|null>} Blob con la imagen o null si no es posible
  */
  captureToBlob(type = 'image/jpeg', quality = 0.92){
    if (!this.video || !this.canvas) return Promise.resolve(null);
    const ctx = this.canvas.getContext('2d');
    // Evita 0 width/height si la camara aun no reporto dimensiones
    const w = this.video.videoWidth || 640;
    const h = this.video.videoHeight || 480;
    this.canvas.width = w;
    this.canvas.height = h;
    ctx.drawImage(this.video, 0, 0, w, h);
    return new Promise(resolve => this.canvas.toBlob(blob => resolve(blob), type, quality));
  }
}
