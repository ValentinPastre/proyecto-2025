/**
* Wrapper minimo para el endpoint /caption. Lanzo errores legibles al llamador
*/
export default class CaptionApi {
  /**
  * @param {string} baseUrl - URL base del API
  */
  constructor(baseUrl){ this.base = baseUrl; }

  /**
  * Envia una imagen (FormData) al endpoint de caption
  * @param {FormData} formData
  * @returns {Promise<Object>} Respuesta JSON del servidor
  * @throws {Error} Si la respuesta HTTP no es OK
  */
  async uploadImage(formData){
    const res = await fetch(`${this.base}/caption`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(data.error || 'Error al procesar imagen');
    return data;
  }
}