// Dante OS — le site : ciel étoilé, menu, recherche dans l'encyclopédie. Rien n'est envoyé nulle part.
(function () {
  "use strict";
  var root = document.documentElement.getAttribute("data-root") || "";

  // Dans le Guide de l'appli Dante OS (hors ligne) : pas de barre « Télécharger », et chaque fiche de module a un bouton
  // qui ouvre ce module dans Dante (lien dante://open/…, compris seulement par l'appli).
  if (/DanteOSGuide/.test(navigator.userAgent)) {
    document.documentElement.classList.add("in-app");
    var fiche = document.querySelector("article.fiche[data-route]");
    var route = fiche && fiche.getAttribute("data-route");
    var h1 = fiche && fiche.querySelector("h1");
    if (route && route !== "guide" && /^[a-z][a-z0-9_]{1,40}$/.test(route) && h1) {
      var en = document.documentElement.lang === "en";
      var b = document.createElement("a");
      b.className = "btn main app-open";
      b.href = "dante://open/" + route;
      b.textContent = en ? "Open in Dante" : "Ouvrir dans Dante";
      h1.insertAdjacentElement("afterend", b);
    }
  }

  // Ciel : quelques centaines d'étoiles qui scintillent doucement, 20 images par seconde au plus, arrêté si l'onglet
  // est caché, immobile si le visiteur a demandé moins d'animations.
  var c = document.getElementById("stars");
  if (c && c.getContext) {
    var ctx = c.getContext("2d"), stars = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var size = function () {
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(w * h / 5200); stars = [];
      for (var i = 0; i < n; i++) stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.1 + 0.2, p: Math.random() * 6.28, s: 0.4 + Math.random() * 1.4, warm: Math.random() < 0.12 });
      draw(0);
    };
    var draw = function (t) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i], a = still ? 0.7 : 0.45 + 0.4 * Math.sin(s.p + t * 0.001 * s.s);
        ctx.fillStyle = s.warm ? "rgba(255,205,150," + a + ")" : "rgba(225,228,255," + a + ")";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
    };
    var last = 0;
    var loop = function (t) {
      if (!document.hidden && t - last > 50) { last = t; draw(t); }
      requestAnimationFrame(loop);
    };
    size();
    window.addEventListener("resize", size);
    if (!still) requestAnimationFrame(loop);
  }

  // Les vidéos muettes jouent seulement quand elles sont à l'écran (la batterie et la carte graphique du visiteur aussi comptent).
  var autos = document.querySelectorAll("video[data-auto]");
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Mode « économie de données » du téléphone, ou connexion lente : les vidéos ne partent pas toutes seules, un toucher suffit.
  var conn = navigator.connection || {};
  if (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "")) calm = true;
  if (autos.length && "IntersectionObserver" in window && !calm) {
    // Les images d'attente arrivent un peu avant que la vidéo n'entre à l'écran (rien n'est chargé pour ce qu'on ne regarde pas).
    var near = new IntersectionObserver(function (list) {
      list.forEach(function (en) {
        if (!en.isIntersecting) return;
        var v = en.target, p = v.getAttribute("data-poster");
        if (p) { v.poster = p; v.removeAttribute("data-poster"); }
        near.unobserve(v);
      });
    }, { rootMargin: "800px 0px" });
    document.querySelectorAll("video[data-poster]").forEach(function (v) { near.observe(v); });
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { if (v.preload === "none") v.preload = "auto"; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.35 });
    autos.forEach(function (v) { io.observe(v); });
  } else autos.forEach(function (v) { v.controls = true; var p = v.getAttribute("data-poster"); if (p) v.poster = p; });

  // Sur téléphone, une fois l'accueil dépassé, un bouton « Télécharger » reste en bas de l'écran.
  var bar = document.querySelector(".dl-bar"), hero = document.querySelector(".hero2, .hero");
  if (bar && hero && "IntersectionObserver" in window) {
    bar.hidden = false;
    new IntersectionObserver(function (l) { bar.classList.toggle("show", !l[0].isIntersecting); }).observe(hero);
  }

  // Générique : la galaxie se met à tourner une fois la page prête (jamais en économie de données ni si moins d'animations).
  var hv = document.querySelector("video[data-hero]");
  if (hv && !calm) {
    var startHero = function () {
      hv.src = window.matchMedia("(max-width: 860px)").matches ? hv.getAttribute("data-mob") : hv.getAttribute("data-desk");
      hv.addEventListener("playing", function () { hv.classList.add("on"); }, { once: true });
      var p = hv.play(); if (p && p.catch) p.catch(function () {});
    };
    if (document.readyState === "complete") setTimeout(startHero, 300); else window.addEventListener("load", function () { setTimeout(startHero, 300); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) hv.pause(); else if (hv.src) hv.play().catch(function () {}); });
  }

  // Menu du téléphone
  var mb = document.querySelector(".menu-btn"), nav = document.querySelector(".nav");
  if (mb && nav) mb.addEventListener("click", function () { nav.classList.toggle("open"); mb.setAttribute("aria-expanded", nav.classList.contains("open")); });
  var tb = document.querySelector(".tree-btn"), side = document.querySelector(".side");
  if (tb && side) tb.addEventListener("click", function () { side.classList.toggle("open"); });

  // Recherche : même logique que le Guide de l'appli (sans accents, sans majuscules, tous les mots).
  var input = document.getElementById("q"), out = document.getElementById("results");
  if (!input || !out) return;
  var fold = function (s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); };
  var index = null, hl = -1;
  var load = function () {
    if (index) return Promise.resolve(index);
    return fetch(root + "index.json").then(function (r) { return r.json(); }).then(function (d) {
      index = d.map(function (e) { e.hay = fold(e.t + " " + e.s + " " + e.k + " " + e.x); e.ht = fold(e.t); e.hs = fold(e.s + " " + e.k); return e; });
      return index;
    });
  };
  var render = function () {
    var q = fold(input.value.trim());
    if (!q) { out.innerHTML = ""; return; }
    var words = q.split(/\s+/);
    load().then(function (idx) {
      var hits = idx.filter(function (e) { return words.every(function (w) { return e.hay.indexOf(w) >= 0; }); });
      // Le titre compte plus que le résumé et les mots-clés, qui comptent plus que le texte.
      var score = function (e) { return words.reduce(function (n, w) { return n + (e.ht.indexOf(w) >= 0 ? 4 : e.hs.indexOf(w) >= 0 ? 2 : 1); }, 0); };
      hits.sort(function (a, b) { return score(b) - score(a); });
      hl = -1;
      if (!hits.length) { out.innerHTML = '<div class="none">' + input.getAttribute("data-none") + "</div>"; return; }
      out.innerHTML = hits.slice(0, 12).map(function (e) {
        return '<a href="' + root + e.u + '">' + e.t.replace(/</g, "&lt;") + "<small>" + e.sec.replace(/</g, "&lt;") + "</small></a>";
      }).join("");
    });
  };
  input.addEventListener("input", render);
  input.addEventListener("focus", load);
  input.addEventListener("keydown", function (ev) {
    var links = out.querySelectorAll("a");
    if (!links.length) return;
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      hl = (hl + (ev.key === "ArrowDown" ? 1 : -1) + links.length) % links.length;
      links.forEach(function (a, i) { a.classList.toggle("hl", i === hl); });
    } else if (ev.key === "Enter") {
      ev.preventDefault();
      window.location.href = links[Math.max(hl, 0)].href;
    }
  });
  if (window.location.hash === "#chercher") input.focus();
})();
