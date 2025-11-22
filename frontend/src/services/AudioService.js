/**
 * Servicio simple para precargar y reproducir sonidos cortos con cooldown
 */
export default class AudioService {
  constructor(){
    this.sounds = {};    
    this.playCooldown = false;
  }

  /**
   * Pre-carga un sonido para uso posterior
   * @param {string} name - Clave del sonido
   * @param {string} src - URL del archivo de audio
   * @returns {void}
   */
  preload(name, src){ this.sounds[name] = new Audio(src); }

  /**
   * Reproduce un sonido si existe y no hay cooldown
   * @param {string} name
   * @returns {void}
   */
  play(name){
    if (this.playCooldown) return;
    const a = this.sounds[name];
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(()=>{});
    this.playCooldown = true;
    setTimeout(()=> this.playCooldown = false, 180);
  }

  /**
   * Actualiza src de un elemento <audio> y lo reproduce
   * @param {HTMLAudioElement|null} audioEl
   * @param {string} url
   * @returns {void}
   */
  setPlayerSrc(audioEl, url){
    if (!audioEl || !url) return;
    audioEl.src = `${url}?t=${Date.now()}`;
    audioEl.play().catch(()=>{});
  }
}
