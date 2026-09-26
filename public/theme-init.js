// Aplica el tema e idioma guardados antes del primer pintado (evita el parpadeo). Se carga
// como fichero externo en <head> para que la CSP no necesite hashes de scripts inline.
(function () {
  try {
    var t = localStorage.getItem('xeye_theme');
    var d = t ? t === 'dark' : (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches);
    if (d) document.documentElement.classList.add('dark');
    var l = localStorage.getItem('xeye_locale');
    if (l === 'es' || l === 'en') document.documentElement.setAttribute('lang', l);
  } catch (e) {}
})();
