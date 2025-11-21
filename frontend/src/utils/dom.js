export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => Array.from(document.querySelectorAll(sel));

export function show(el) { if (!el) return; el.classList.remove('hidden'); }
export function hide(el) { if (!el) return; el.classList.add('hidden'); }
export function addClass(el, cls) { if (!el) return; el.classList.add(cls); }
export function removeClass(el, cls) { if (!el) return; el.classList.remove(cls); }

export function showToast(el, text, timeout = 2200) {
  if (!el) return;
  el.textContent = text;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), timeout);
}

export function showFormMessage(containerEl, text, type = 'error', timeout = 4000) {
  if (!containerEl) return;
  containerEl.textContent = text;
  containerEl.classList.remove('error', 'success');
  containerEl.classList.add(type, 'visible');
  if (timeout) setTimeout(() => containerEl.classList.remove('visible'), timeout);
}

export function clearFormMessages(list = []) {
  list.forEach(m => { if (m) { m.className = 'form-message'; m.textContent = ''; } });
}

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

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}