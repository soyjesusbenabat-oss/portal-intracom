/**
 * Consentimiento de cookies con bloqueo previo. Lo genera scripts/webs-legales del repositorio de
 * la plataforma: no editar a mano.
 *
 * Nada de terceros se carga antes de que la persona decida. Los mapas, los vídeos y los
 * formularios externos se sustituyen por un recuadro con su propio botón, y las etiquetas de Google
 * Analytics y Google Ads no se inyectan hasta que se acepta. Quien rechaza sigue teniendo la web
 * completa: solo ve el recuadro en lugar del mapa, con el enlace para abrirlo en su sitio original.
 *
 * La decisión se guarda en el navegador de quien visita (localStorage), que es almacenamiento
 * técnico exento de consentimiento: sin él habría que volver a preguntar en cada página.
 */
(function () {
  "use strict";

  var CFG = {
  "idiomaPorDefecto": "es",
  "textos": {
    "es": {
      "titulo": "Cookies",
      "aceptar": "Aceptar",
      "rechazar": "Rechazar",
      "masInfo": "Política de cookies",
      "bloqueado": "Este contenido es de un tercero y puede instalar cookies en su navegador. No se carga hasta que usted lo autoriza.",
      "cargar": "Cargar este contenido",
      "abrirFuera": "Abrirlo en su web",
      "aviso": "Esta web utiliza Google Analytics para saber cuántas personas la visitan y qué páginas consultan. Todo ello puede instalar cookies. No cargamos nada de eso hasta que usted lo decida."
    }
  },
  "patrones": [],
  "ads": null,
  "ga": "G-5V5BHY2R2Q",
  "plataforma": "conferences.portalintracom.com",
  "politica": null
};

  // Analytics es una finalidad nueva: quien aceptó antes no aceptó esto y hay que volver a preguntar
  var CLAVE = "intracom_cookies_" + (CFG.ga ? "v2" : "v1");
  var ID_BANNER = "intracom-cookies";
  var ID_CSS = "intracom-cookies-css";

  function lang() {
    var q = /[?&]lang=([a-z]{2})/.exec(location.search);
    if (q && CFG.textos[q[1]]) return q[1];
    var h = (document.documentElement.getAttribute("lang") || "").slice(0, 2).toLowerCase();
    if (CFG.textos[h]) return h;
    return CFG.idiomaPorDefecto;
  }
  function T() {
    return CFG.textos[lang()] || CFG.textos[CFG.idiomaPorDefecto];
  }
  function enlacePolitica() {
    if (CFG.politica) return CFG.politica;
    var l = lang();
    return "/legal/cookies" + (l === CFG.idiomaPorDefecto ? "" : "." + l) + ".html";
  }

  function decision() {
    try {
      return localStorage.getItem(CLAVE);
    } catch (e) {
      return null;
    }
  }
  function guardar(v) {
    try {
      localStorage.setItem(CLAVE, v);
    } catch (e) {
      /* navegación privada: se preguntará otra vez */
    }
  }

  // ---------- Bloqueo de lo incrustado ----------

  function esDeTerceros(src) {
    if (!src) return false;
    for (var i = 0; i < CFG.patrones.length; i++) if (src.indexOf(CFG.patrones[i]) >= 0) return true;
    return false;
  }

  /** Cambia un iframe por un recuadro con el motivo y un botón para cargarlo solo él. */
  function tapar(marco) {
    var src = marco.getAttribute("src");
    if (!esDeTerceros(src) || marco.getAttribute("data-bloqueado")) return;
    var hueco = document.createElement("div");
    hueco.className = "ic-hueco";
    hueco.setAttribute("data-src", src);
    // Que ocupe lo mismo que ocupaba el iframe, para no descuadrar el diseño
    var alto = marco.getAttribute("height") || (marco.style && marco.style.height) || "";
    if (alto) hueco.style.minHeight = /\d$/.test(String(alto)) ? alto + "px" : alto;
    hueco.innerHTML =
      '<p class="ic-hueco-t">' +
      T().bloqueado +
      "</p>" +
      '<p class="ic-hueco-d"><button type="button" class="ic-b ic-b-si" data-cargar="1">' +
      T().cargar +
      '</button> <a class="ic-b ic-b-no" href="' +
      src +
      '" target="_blank" rel="noopener noreferrer">' +
      T().abrirFuera +
      "</a></p>" +
      '<p class="ic-hueco-p"><a href="' + enlacePolitica() + '">' + T().masInfo + "</a></p>";
    marco.setAttribute("data-bloqueado", "1");
    marco.parentNode.insertBefore(hueco, marco);
    marco.parentNode.removeChild(marco);
    hueco.appendChild(marco);
    marco.style.display = "none";
    marco.removeAttribute("src");
  }

  function destapar(hueco) {
    var marco = hueco.querySelector("iframe");
    var src = hueco.getAttribute("data-src");
    if (marco && src) {
      marco.setAttribute("src", src);
      marco.style.display = "";
      marco.removeAttribute("data-bloqueado");
      hueco.parentNode.insertBefore(marco, hueco);
    }
    hueco.parentNode.removeChild(hueco);
  }

  function taparTodo() {
    var marcos = document.querySelectorAll("iframe[src]");
    for (var i = 0; i < marcos.length; i++) tapar(marcos[i]);
  }
  function destaparTodo() {
    var huecos = document.querySelectorAll(".ic-hueco");
    for (var i = 0; i < huecos.length; i++) destapar(huecos[i]);
  }

  // ---------- Etiquetas de medición ----------

  var medicionPuesta = false;
  function medicion() {
    if (CFG.ga) window["ga-disable-" + CFG.ga] = false;
    if (medicionPuesta) {
      permisos("granted");
      return;
    }
    if (!CFG.ads && !CFG.ga) return;
    medicionPuesta = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    if (CFG.ga) {
      // Solo estadística. «none» pide que las cookies se queden en este subdominio, pero Google no siempre
      // lo respeta: probado en congresos.portalintracom.com, _ga acaba a menudo en el dominio principal.
      // Por eso retirarMedicion() borra en los dos sitios y la política de cookies menciona ambos
      window.gtag("set", { cookie_domain: "none" });
      window.gtag("config", CFG.ga, {
        cookie_domain: "none",
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
    }
    if (CFG.ads) window.gtag("config", CFG.ads, CFG.ga ? { cookie_domain: "none" } : {});
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + (CFG.ga || CFG.ads);
    document.head.appendChild(s);
  }

  function permisos(valor) {
    if (!window.gtag) return;
    window.gtag("consent", "update", {
      analytics_storage: valor,
      ad_storage: valor,
      ad_user_data: valor,
      ad_personalization: valor,
    });
  }

  /** Retirar el permiso tiene que surtir efecto: se apagan las etiquetas y se borran sus cookies. */
  function retirarMedicion() {
    if (CFG.ga) window["ga-disable-" + CFG.ga] = true;
    permisos("denied");
    var partes = location.hostname.split(".");
    var dominios = [""];
    for (var i = 0; i < partes.length - 1; i++) dominios.push("; domain=." + partes.slice(i).join("."));
    document.cookie.split(";").forEach(function (c) {
      var nombre = c.split("=")[0].trim();
      if (!/^(_ga|_gcl_|_gid)/.test(nombre)) return;
      dominios.forEach(function (d) {
        document.cookie = nombre + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + d;
      });
    });
  }

  /** Clics en un correo o hacia la inscripción de la plataforma. No se envía la dirección de correo. */
  function contarClic(e) {
    if (!CFG.ga || !window.gtag || decision() !== "si") return;
    var t = e.target;
    while (t && t !== document.body) {
      if (t.getAttribute && t.getAttribute("href")) {
        if (/^mailto:/i.test(t.getAttribute("href"))) {
          window.gtag("event", "clic_correo", { send_to: CFG.ga });
        } else if (t.hostname === CFG.plataforma && /\/c\//.test(t.pathname)) {
          window.gtag("event", "clic_inscripcion", { send_to: CFG.ga, destino: t.pathname });
        }
        return;
      }
      t = t.parentNode;
    }
  }

  // ---------- Aviso ----------

  // El diseño de cada web inyecta sus propios estilos después, así que el recuadro se impone:
  // si pierde el fondo claro, queda texto oscuro sobre una sección oscura y no se lee.
  var CSS =
    ".ic-hueco{display:flex !important;flex-direction:column !important;align-items:center !important;" +
    "justify-content:center !important;gap:4px;min-height:220px;padding:26px 22px !important;" +
    "text-align:center !important;background:#EEF1F6 !important;border:1px dashed #AEBACD !important;" +
    "border-radius:14px !important;color:#2A3545 !important;" +
    "font:400 14.5px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif !important}" +
    ".ic-hueco p{margin:0 !important;color:#2A3545 !important;font:inherit !important;letter-spacing:normal !important;" +
    "text-transform:none !important}" +
    ".ic-hueco-t{max-width:46ch}" +
    ".ic-hueco-d{margin-top:14px !important;display:flex !important;flex-wrap:wrap;gap:10px;justify-content:center}" +
    ".ic-hueco-p{margin-top:10px !important;font-size:13px !important}" +
    ".ic-hueco-p a{color:#003871 !important;text-decoration:underline !important}" +
    ".ic-b{display:inline-block !important;padding:10px 20px !important;border-radius:999px !important;" +
    "border:1px solid #0A2150 !important;cursor:pointer;font:600 13.5px/1 inherit !important;" +
    "text-decoration:none !important;letter-spacing:normal !important;text-transform:none !important}" +
    ".ic-b-si{background:#0A2150 !important;color:#fff !important}" +
    ".ic-b-no{background:transparent !important;color:#0A2150 !important}" +
    "#" + ID_BANNER + "{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;padding:20px;" +
    "background:#0A2150;color:#E6ECF6;box-shadow:0 -14px 40px rgba(6,16,36,.35);" +
    "font:400 14.5px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif}" +
    "#" + ID_BANNER + " .ic-caja{width:min(1040px,100%);margin-inline:auto;display:flex;flex-wrap:wrap;" +
    "gap:14px 26px;align-items:center;justify-content:space-between}" +
    "#" + ID_BANNER + " p{margin:0 !important;max-width:62ch;color:#E6ECF6 !important;font:inherit !important;" +
    "letter-spacing:normal !important;text-transform:none !important}" +
    "#" + ID_BANNER + " a{color:#fff}" +
    "#" + ID_BANNER + " .ic-botones{display:flex;flex-wrap:wrap;gap:10px}" +
    "#" + ID_BANNER + " button{padding:12px 22px;border-radius:999px;border:1px solid #fff;cursor:pointer;" +
    "font:600 14px/1 inherit}" +
    "#" + ID_BANNER + " .si{background:#fff;color:#0A2150}" +
    "#" + ID_BANNER + " .no{background:transparent;color:#fff}";

  function css() {
    if (document.getElementById(ID_CSS)) return;
    var s = document.createElement("style");
    s.id = ID_CSS;
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function quitarBanner() {
    var b = document.getElementById(ID_BANNER);
    if (b) b.parentNode.removeChild(b);
  }

  function preguntar() {
    if (document.getElementById(ID_BANNER)) return;
    css();
    var t = T();
    var div = document.createElement("div");
    div.id = ID_BANNER;
    div.setAttribute("role", "region");
    div.setAttribute("aria-label", t.titulo);
    div.innerHTML =
      '<div class="ic-caja"><p>' +
      t.aviso +
      ' <a href="' + enlacePolitica() + '">' + t.masInfo + "</a></p>" +
      '<div class="ic-botones"><button type="button" class="no" data-no="1">' +
      t.rechazar +
      '</button><button type="button" class="si" data-si="1">' +
      t.aceptar +
      "</button></div></div>";
    document.body.appendChild(div);
  }

  function aceptar() {
    guardar("si");
    quitarBanner();
    destaparTodo();
    medicion();
  }
  function rechazar() {
    guardar("no");
    quitarBanner();
    taparTodo();
    retirarMedicion();
  }

  function abrir() {
    quitarBanner();
    preguntar();
  }
  window.intracomCookies = abrir;

  // ---------- Arranque ----------

  function aplicar() {
    if (!document.body) return;
    // Los estilos van siempre, no solo al enseñar el aviso: quien ya ha rechazado sigue viendo
    // el recuadro del contenido bloqueado y tiene que leerse
    css();
    var d = decision();
    if (d === "si") {
      destaparTodo();
      medicion();
      return;
    }
    taparTodo();
    if (d !== "no") preguntar();
  }

  document.addEventListener("click", contarClic);

  document.addEventListener("click", function (e) {
    var t = e.target;
    while (t && t !== document.body) {
      if (t.getAttribute) {
        if (t.getAttribute("data-si")) return aceptar();
        if (t.getAttribute("data-no")) return rechazar();
        if (t.getAttribute("data-cookies-abrir")) {
          e.preventDefault();
          return abrir();
        }
        if (t.getAttribute("data-cargar")) {
          e.preventDefault();
          var hueco = t;
          while (hueco && !(hueco.className && String(hueco.className).indexOf("ic-hueco") >= 0)) hueco = hueco.parentNode;
          if (hueco) destapar(hueco);
          return;
        }
      }
      t = t.parentNode;
    }
  });

  var pendiente = null;
  function reaplicar() {
    if (pendiente) return;
    pendiente = setTimeout(function () {
      pendiente = null;
      if (decision() === "si") return;
      // El diseño reconstruye la página y se lleva por delante la hoja de estilos y el aviso
      css();
      taparTodo();
      if (decision() === null) preguntar();
    }, 100);
  }

  function arrancar() {
    aplicar();
    if (window.MutationObserver) {
      new MutationObserver(reaplicar).observe(document.documentElement, { childList: true, subtree: true });
    }
    window.addEventListener("load", reaplicar);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", arrancar);
  else arrancar();
})();
