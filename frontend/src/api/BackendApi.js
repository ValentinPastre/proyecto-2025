export default class ApiClient {
  constructor(baseUrl){
    this.base = baseUrl;
  }

  register(email, password){
    return this._post('/auth/register', { email, password });
  }

  login(email, password){
    return this._post('/auth/login', { email, password });
  }

  uploadImage(formData){
    return this._postForm('/caption', formData);
  }

  synthesize(text){
    return this._post('/tts', { text });
  }

  async _post(path, body){
    const res = await fetch(this.base + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Error en la API');
    return data;
  }

  async _postForm(path, formData){
    const res = await fetch(this.base + path, {
      method: 'POST',
      body: formData
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Error en la API');
    return data;
  }
}
