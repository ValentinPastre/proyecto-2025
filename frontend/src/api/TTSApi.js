/**
 * Cliente minimo para el servicio TTS del backend
 *
 * el endpoint del backend esperado es POST `${base}/tts`
 * que reciba JSON: { text: string, voice?: string, format?: 'base64'|'url' }
 * y responda JSON con al menos uno de estos campos:
 * - { audio_base64: string } -> audio en base64
 * - { audio_url: string } -> URL pública al fichero de audio
 *
 * 
 */
export default class TTSApi {
  /**
   * @param {string} baseUrl - URL base del API (http://127.0.0.1:3000/api)
   */
  constructor(baseUrl){
    this.base = baseUrl;
  }

  /**
   * Pide al backend sintetizar texto a audio
   * @param {string} text - Texto a convertir a voz
   * @param {{voice?: string, format?: 'base64'|'url'}} [opts]
   * @returns {Promise<{audio_base64?: string, audio_url?: string}>}
   * @throws {Error} Si la respuesta HTTP no es OK
   */
  async synthesize(text, opts = {}){
    const body = { text };
    if (opts.voice) body.voice = opts.voice;
    if (opts.format) body.format = opts.format;

    const res = await fetch(`${this.base}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Error en TTS');
    return data;
  }

  /**
   * Conversion helper: si el backend soporta 'format=url' se obtiene directamente la URL
   * @param {string} text
   * @param {{voice?: string}} [opts]
   * @returns {Promise<string>} URL del audio generado
   */
  async synthesizeToUrl(text, opts = {}){
    const data = await this.synthesize(text, { ...opts, format: 'url' });
    return data.audio_url || data.audioUrl || '';
  }

  /**
   * Conversion helper: solicita audio en base64
   * @param {string} text
   * @param {{voice?: string}} [opts]
   * @returns {Promise<string>} audio_base64
   */
  async synthesizeToBase64(text, opts = {}){
    const data = await this.synthesize(text, { ...opts, format: 'base64' });
    return data.audio_base64 || data.audioBase64 || '';
  }
}
