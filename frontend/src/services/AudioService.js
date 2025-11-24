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

  /**
 * Reproduce un audio base64 devuelto por el backend (TTS)
 * @param {{ audio_base64: string }} param0 
 */
playTTSResponse(apiUrl, { audio_base64 }) {
  if (!audio_base64) return;

  try {
    // Construir la URL en formato data:audio/wav;base64,...
    const audioUrl = `${apiUrl},${audio_base64}`;

    // Crear el objeto Audio y reproducir
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
      console.error("Error reproduciendo TTS:", err);
    });

  } catch (err) {
    console.error("Error en playTTSResponse:", err);
  }
}

}
