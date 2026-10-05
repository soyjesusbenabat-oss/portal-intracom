/**
 * Iconos del sitio.
 *
 * El diseño reconstruye la cabecera de la página al cargar y se lleva por delante los iconos,
 * así que aquí se vuelven a poner y se vigila que sigan estando.
 */
(function () {
  "use strict";

  var ICONOS = [
    ["icon", "favicon-32.png", "32x32"],
    ["icon", "favicon-512.png", "512x512"],
    ["apple-touch-icon", "favicon-180.png", "180x180"],
  ];

  function poner() {
    if (!document.head || document.querySelector('link[rel="icon"]')) return;
    ICONOS.forEach(function (i) {
      var l = document.createElement("link");
      l.rel = i[0];
      l.type = "image/png";
      l.href = i[1];
      l.sizes = i[2];
      document.head.appendChild(l);
    });
  }

  poner();
  document.addEventListener("DOMContentLoaded", poner);
  new MutationObserver(poner).observe(document.documentElement, { childList: true, subtree: true });
  [300, 1000, 2500].forEach(function (ms) { setTimeout(poner, ms); });
})();
