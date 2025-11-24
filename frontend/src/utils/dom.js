 /**
 * Selector simple: devuelve el primer elemento que coincide o null
 * @param {string} sel - Selector CSS
 * @returns {Element|null}
 */
export const $ = (sel) => document.querySelector(sel);

/**
 * Selector multiple: devuelve un array de elementos
 * @param {string} sel - Selector CSS
 * @returns {Element[]}
 */
export const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/**
* Quita la clase 'hidden' de un elemento si existe
* @param {Element|null} el
* @returns {void}
*/
export function show(el) { if (!el) return; el.classList.remove('hidden'); }

/**
* Añade la clase 'hidden' a un elemento si existe
* @param {Element|null} el
* @returns {void}
*/
export function hide(el) { if (!el) return; el.classList.add('hidden'); }

/**
* Añade una clase a un elemento
* @param {Element|null} el
* @param {string} cls
* @returns {void}
*/
export function addClass(el, cls) { if (!el) return; el.classList.add(cls); }

/**
* Quita una clase de un elemento
* @param {Element|null} el
* @param {string} cls
* @returns {void}
*/
export function removeClass(el, cls) { if (!el) return; el.classList.remove(cls); }

/**
* Muestra un toast temporal con texto
* @param {Element|null} el - Contenedor del toast
* @param {string} text - Texto a mostrar
* @param {number} [timeout=2200] - Tiempo en ms antes de ocultar
* @returns {void}
*/
export function showToast(el, text, timeout = 2200) {
  if (!el) return;
  el.textContent = text;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), timeout);
}

/**
* Muestra un mensaje dentro de un contenedor de formulario con tipo (error/success)
* @param {Element|null} containerEl
* @param {string} text
* @param {'error'|'success'} [type='error']
* @param {number} [timeout=4000]
* @returns {void}
*/
export function showFormMessage(containerEl, text, type = 'error', timeout = 4000) {
  if (!containerEl) return;
  containerEl.textContent = text;
  containerEl.classList.remove('error', 'success');
  containerEl.classList.add(type, 'visible');
  if (timeout) setTimeout(() => containerEl.classList.remove('visible'), timeout);
}

/**
* Limpia una lista de mensajes de formulario devolviendolos a estado base
* @param {Element[]} [list=[]]
* @returns {void}
*/
export function clearFormMessages(list = []) {
  list.forEach(m => { if (m) { m.className = 'form-message'; m.textContent = ''; } });
}

/**
* Marca/desmarca un input como invalido para accesibilidad y estilo
* @param {HTMLElement|null} inputEl
* @param {boolean} [flag=true]
* @returns {void}
*/
export function markInputError(inputEl, flag = true) {
  if (!inputEl) return;
  if (flag) {
    inputEl.classList.add('input-error');
    inputEl.setAttribute('aria-invalid', 'true');
  } else {
    inputEl.classList.remove('input-error');
    inputEl.removeAttribute('aria-invalid');
  }
}

/**
* Valida formato basico de email
* @param {string} email
* @returns {boolean}
*/
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}