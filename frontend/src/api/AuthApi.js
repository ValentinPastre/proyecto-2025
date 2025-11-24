/**
* API para autenticacion: register & login. Maneja mensajes de error legibles
*/
export default class AuthApi {
  /**
  * @param {string} baseUrl - URL base del API
  */
  constructor(baseUrl){ this.base = baseUrl; }

  /**
  * Registra un usuario
  * @param {string} email
  * @param {string} password
  * @returns {Promise<Object>}
  * @throws {Error} Si la respuesta HTTP no es OK
  */
  async register(email, password){
    const res = await fetch(`${this.base}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(data.message || 'Error en el registro');
    return data;
  }

  /**
  * Login de usuario
  * @param {string} email
  * @param {string} password
  * @returns {Promise<Object>}
  * @throws {Error} Si la respuesta HTTP no es OK
  */
  async login(email, password){
    const res = await fetch(`${this.base}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(data.message || 'Credenciales incorrectas');
    return data;
  }
}