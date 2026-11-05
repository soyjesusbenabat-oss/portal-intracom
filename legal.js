/**
 * Enlaces legales en el pie de la web. Lo genera scripts/webs-legales del repositorio de la
 * plataforma: no editar a mano.
 *
 * Hace dos cosas. Si el pie ya trae rótulos como «Aviso legal» o «Política de cookies», les pone
 * el enlace que les falta (en varias webs apuntaban a «#», que es peor que no tener nada). Y si
 * falta alguno de los tres, añade una barra discreta al final de la página.
 *
 * Estas webs se montan con JavaScript y el diseño reconstruye el pie al cargar, así que todo se
 * vuelve a aplicar cuando el documento cambia.
 */
(function () {
  "use strict";

  var CFG = {
  "idiomas": [
    "es"
  ],
  "etiquetas": {
    "es": {
      "aviso-legal": "Aviso legal",
      "privacidad": "Política de privacidad",
      "cookies": "Política de cookies",
      "preferencias": "Preferencias de cookies"
    }
  },
  "titular": "Portal Intracom",
  "banner": true
};

  var DOCS = ["aviso-legal", "privacidad", "cookies"];
  var BARRA_ID = "intracom-legal";

  /** Rótulos que puede llevar un enlace ya existente, en los cuatro idiomas. */
  var ROTULOS = {
    "aviso-legal": ["aviso legal", "legal notice", "note legali", "aviso legal"],
    privacidad: [
      "politica de privacidad",
      "politica de privacidade",
      "privacy policy",
      "informativa sulla privacy",
      "privacidad",
      "privacidade",
      "privacy",
    ],
    cookies: [
      "politica de cookies",
      "cookie policy",
      "informativa sui cookie",
      "cookies",
      "cookie",
    ],
  };

  function limpio(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Idioma en el que se está leyendo la web: lo que diga la URL, el html o el idioma principal. */
  function idioma() {
    var q = /[?&]lang=([a-z]{2})/.exec(location.search);
    if (q && CFG.idiomas.indexOf(q[1]) >= 0) return q[1];
    var h = (document.documentElement.getAttribute("lang") || "").slice(0, 2).toLowerCase();
    if (CFG.idiomas.indexOf(h) >= 0) return h;
    return CFG.idiomas[0];
  }

  function url(doc, lang) {
    return "/legal/" + doc + (lang === CFG.idiomas[0] ? "" : "." + lang) + ".html";
  }

  function rotulo(doc, lang) {
    return (CFG.etiquetas[lang] || CFG.etiquetas[CFG.idiomas[0]])[doc];
  }

  /**
   * Enlaces legales ajenos que sí hay que reapuntar a los de esta web: los que no llevaban a
   * ninguna parte y los que apuntaban a la plataforma o al WordPress antiguo (donde daban 404).
   */
  var AJENOS = [
    { re: /\/legal\/aviso-legal/, doc: "aviso-legal" },
    { re: /\/legal\/privacidad/, doc: "privacidad" },
    { re: /\/legal\/cookies/, doc: "cookies" },
    { re: /portalintracom\.com\/aviso-legal/, doc: "aviso-legal" },
    { re: /portalintracom\.com\/politica-de-privacidad/, doc: "privacidad" },
    { re: /portalintracom\.com\/politica-de-cookies/, doc: "cookies" },
  ];

  /** Qué documento le toca a un enlace que ya existe, por su destino o por su rótulo. */
  function cual(a) {
    var href = a.getAttribute("href") || "";
    for (var i = 0; i < AJENOS.length; i++) if (AJENOS[i].re.test(href)) return AJENOS[i].doc;
    var txt = limpio(a.textContent);
    if (!txt || txt.length > 40) return null;
    // Por el rótulo solo si el enlace no lleva a ninguna parte: no pisamos destinos buenos
    if (href && href !== "#" && href.indexOf("javascript:") !== 0) return null;
    for (var j = 0; j < DOCS.length; j++) if (ROTULOS[DOCS[j]].indexOf(txt) >= 0) return DOCS[j];
    return null;
  }

  /**
   * Lo que ponemos nosotros: la barra del pie y lo que añade el aviso de cookies (el recuadro del
   * contenido bloqueado y el propio aviso). Esos enlaces no cuentan: si contaran, la barra creería
   * que el pie ya trae el documento y se quitaría a sí misma en el siguiente repaso.
   */
  function nuestro(a) {
    if (a.getAttribute("data-cookies-abrir")) return true;
    for (var n = a; n && n.nodeType === 1; n = n.parentNode) {
      if (n.id === BARRA_ID || n.id === "intracom-cookies") return true;
      var c = n.className;
      if (c && String(c).indexOf("ic-hueco") >= 0) return true;
    }
    return false;
  }

  /** Pone el enlace en los rótulos que ya existen. Devuelve los documentos que ha encontrado. */
  function arreglarExistentes(lang) {
    var vistos = {};
    var anclas = document.querySelectorAll("a");
    for (var i = 0; i < anclas.length; i++) {
      var a = anclas[i];
      if (nuestro(a)) continue;
      var ya = a.getAttribute("data-legal");
      if (ya) {
        vistos[ya] = true;
        continue;
      }
      var doc = cual(a);
      if (!doc) continue;
      a.setAttribute("href", url(doc, lang));
      a.setAttribute("data-legal", doc);
      a.removeAttribute("target");
      vistos[doc] = true;
    }
    return vistos;
  }

  var ESTILO_ID = "intracom-legal-css";
  var CSS =
    "#" + BARRA_ID + "{position:relative;z-index:5;padding:18px 20px;display:flex;flex-wrap:wrap;" +
    "gap:6px 18px;align-items:center;justify-content:center;background:#0A2150;color:#C9D4E6;" +
    "font:400 13.5px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;text-align:center}" +
    "#" + BARRA_ID + " a{color:#fff;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.35);padding-bottom:1px}" +
    "#" + BARRA_ID + " a:hover{border-bottom-color:#fff}" +
    "#" + BARRA_ID + " span.sep{opacity:.45}";

  function estilo() {
    if (document.getElementById(ESTILO_ID)) return;
    var s = document.createElement("style");
    s.id = ESTILO_ID;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  /** Barra al final de la página con los documentos que el pie no traía. */
  function barra(faltan, lang) {
    var vieja = document.getElementById(BARRA_ID);
    var firma = lang + ":" + faltan.join(",");
    var pies = document.querySelectorAll("footer");
    var pie = pies.length ? pies[pies.length - 1] : null;
    // Rehacerla sin motivo volvería a disparar el observador y el enlace no llegaría a poder pulsarse
    if (vieja && vieja.getAttribute("data-firma") === firma && (!pie || vieja.previousElementSibling === pie)) return;
    if (vieja) vieja.parentNode.removeChild(vieja);
    if (!faltan.length) return;
    estilo();
    var div = document.createElement("div");
    div.id = BARRA_ID;
    div.setAttribute("data-firma", firma);
    var partes = [];
    partes.push("<span>© " + new Date().getFullYear() + " " + CFG.titular + "</span>");
    for (var i = 0; i < faltan.length; i++) {
      partes.push('<a href="' + url(faltan[i], lang) + '" data-legal="' + faltan[i] + '">' + rotulo(faltan[i], lang) + "</a>");
    }
    if (CFG.banner && faltan.indexOf("cookies") >= 0) partes.push('<a href="#" data-cookies-abrir="1">' + preferencias(lang) + "</a>");
    div.innerHTML = partes.join('<span class="sep">·</span>');
    // Detrás del pie, no al final del <body>: con el <body> de altura fija caería encima del contenido
    if (pie) pie.parentNode.insertBefore(div, pie.nextSibling);
    else document.body.appendChild(div);
  }

  function preferencias(lang) {
    return (CFG.etiquetas[lang] || CFG.etiquetas[CFG.idiomas[0]]).preferencias;
  }

  /**
   * Si el pie ya trae «Cookies», al lado va el enlace para cambiar la decisión, con su mismo aspecto:
   * retirar el permiso tiene que poder hacerse desde cualquier web.
   */
  function enlacePreferencias(lang) {
    if (!CFG.banner) return;
    var cookies = document.querySelector('a[data-legal="cookies"]');
    if (!cookies || nuestro(cookies)) return;
    var a = cookies.nextElementSibling;
    if (!a || !a.getAttribute("data-cookies-abrir")) {
      a = document.createElement("a");
      a.className = cookies.className;
      a.style.cssText = cookies.style.cssText;
      a.setAttribute("href", "#");
      a.setAttribute("data-cookies-abrir", "1");
      cookies.parentNode.insertBefore(a, cookies.nextSibling);
    }
    if (a.textContent !== preferencias(lang)) a.textContent = preferencias(lang);
  }

  function aplicar() {
    if (!document.body) return;
    var lang = idioma();
    var vistos = arreglarExistentes(lang);
    var faltan = [];
    for (var i = 0; i < DOCS.length; i++) if (!vistos[DOCS[i]]) faltan.push(DOCS[i]);
    barra(faltan, lang);
    enlacePreferencias(lang);
  }

  var pendiente = null;
  function reaplicar() {
    if (pendiente) return;
    pendiente = setTimeout(function () {
      pendiente = null;
      aplicar();
    }, 120);
  }

  function arrancar() {
    aplicar();
    if (window.MutationObserver) {
      new MutationObserver(function (cambios) {
        for (var i = 0; i < cambios.length; i++) {
          var t = cambios[i].target;
          // Lo que añadimos nosotros no cuenta, o no pararíamos nunca
          if (t && t.id === BARRA_ID) return;
        }
        reaplicar();
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
    window.addEventListener("load", reaplicar);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
