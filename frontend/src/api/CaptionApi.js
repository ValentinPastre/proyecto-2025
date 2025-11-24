/**
* Wrapper para el endpoint /caption del backend.
* Normaliza la respuesta para que el cliente siempre reciba
* { objects: string, audioUrl: string } cuando sea posible.
*/
export default class CaptionApi {
  /**
  * @param {string} baseUrl - URL base del API (ej. http://127.0.0.1:3000/api)
  */
  constructor(baseUrl){ this.base = baseUrl; }

  /**
  * Envía una imagen (FormData) al endpoint de caption.
  * Espera que el backend procese la imagen y, de ser posible,
  * devuelva la descripción y una URL de audio (audioUrl).
  *
  * @param {FormData} formData
  * @returns {Promise<{objects?: string, caption?: string, audioUrl?: string}>}
  * @throws {Error} Si la respuesta HTTP no es OK.
  */
  async uploadImage(formData){
    const res = await fetch(`${this.base}/caption`, {
      method: 'POST',
      body: formData
    });

    // Intentar parsear JSON seguro
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
    // Tratar de extraer un mensaje de error legible
    const msg = data.error || data.message || 'Error al procesar imagen';
    throw new Error(msg);
    }
    // Normalizar nombres de campo para uso en frontend
    const objects = data.objects || data.caption || data.description || null;
    const audioUrl = data.audioUrl || data.audio_url || data.audio || null;


    return { ...data, objects, audioUrl };
  }
}