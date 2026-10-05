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
    if (!document.head) return;
    // El empaquetador reescribe el icono del diseño como un blob: efímero y sin dirección estable.
    // Se sustituye por los archivos del sitio.
    var puestos = document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]');
    var bueno = false;
    Array.prototype.forEach.call(puestos, function (l) {
      if ((l.getAttribute("href") || "").indexOf("blob:") === 0) l.remove();
      else bueno = true;
    });
    if (bueno) return;
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
