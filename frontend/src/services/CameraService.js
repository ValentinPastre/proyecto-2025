export default class CameraService {
  constructor(videoEl, canvasEl, cameraLoadingEl, cameraContainerEl){
    this.video = videoEl;
    this.canvas = canvasEl;
    this.cameraLoadingEl = cameraLoadingEl;
    this.cameraContainerEl = cameraContainerEl;
  }

  async init(){
    if (!this.video) return;
    if (this.video.srcObject) return; // ya iniciado
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.cameraLoadingEl) this.cameraLoadingEl.classList.add('hidden');
      if (this.cameraContainerEl) this.cameraContainerEl.classList.remove('hidden');
      this.video.srcObject = stream;
    } catch (err) {
      if (this.cameraLoadingEl) this.cameraLoadingEl.textContent = 'No se pudo acceder a la cámara.';
      throw err;
    }
  }

  stop(){
    if (this.video && this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(t => t.stop());
      this.video.srcObject = null;
    }
  }

  captureToBlob(type = 'image/jpeg', quality = 0.92){
    if (!this.video || !this.canvas) return null;
    const ctx = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth || 640;
    this.canvas.height = this.video.videoHeight || 480;
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    return new Promise(resolve => this.canvas.toBlob(blob => resolve(blob), type, quality));
  }
}
