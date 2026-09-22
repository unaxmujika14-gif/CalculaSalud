(function () {
  "use strict";

  var data = window.__BRAND__ || {};
  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  var escHTML = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  function safe(fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  var fmtNum1 = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  var fmtInt = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });
  var fmtDateLong = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" });

  function parseNum(str) {
    if (str == null) return NaN;
    var cleaned = String(str).trim().replace(/\./g, "").replace(",", ".");
    return parseFloat(cleaned);
  }

  // ============================================================
  // MOTORES DE CÁLCULO — verificados contra valores de referencia,
  // no tocar sin re-verificar (ver comentarios de cada uno)
  // ============================================================

  // ---------- IMC ----------
  // Verified case: 70 kg, 175 cm -> 22.86 (fórmula OMS estándar)
  function calcularIMC(pesoKg, alturaCm) {
    var m = alturaCm / 100;
    var imc = pesoKg / (m * m);
    var categoria, colorKey;
    if (imc < 18.5) { categoria = "Bajo peso"; colorKey = "low"; }
    else if (imc < 25) { categoria = "Peso normal"; colorKey = "normal"; }
    else if (imc < 30) { categoria = "Sobrepeso"; colorKey = "over"; }
    else { categoria = "Obesidad"; colorKey = "obese"; }
    return { imc: imc, categoria: categoria, colorKey: colorKey };
  }

  // ---------- % de grasa corporal estimado (fórmula de Deurenberg, 1991) ----------
  // Verified cases: hombre 25a IMC22 -> 15.9%; mujer 25a IMC22 -> 26.8%
  // (rangos de referencia sanos para adultos jóvenes; ver comentario en FAQ)
  function calcularGrasaCorporal(imc, edad, sexo) {
    var s = sexo === "hombre" ? 1 : 0;
    return 1.20 * imc + 0.23 * edad - 10.8 * s - 5.4;
  }

  // ---------- TMB / TDEE (Mifflin-St Jeor) ----------
  // Verified case: hombre, 80kg, 180cm, 30a -> TMB 1780; sedentario (x1.2) -> 2136
  var ACTIVITY_FACTORS = [
    { key: "sedentario", label: "Sedentario (poco o ningún ejercicio)", factor: 1.2 },
    { key: "ligero", label: "Actividad ligera (1-3 días/semana)", factor: 1.375 },
    { key: "moderado", label: "Actividad moderada (3-5 días/semana)", factor: 1.55 },
    { key: "intenso", label: "Actividad intensa (6-7 días/semana)", factor: 1.725 },
    { key: "muy-intenso", label: "Muy intenso (ejercicio a diario + trabajo físico)", factor: 1.9 }
  ];
  function calcularTMB(sexo, pesoKg, alturaCm, edad) {
    var base = 10 * pesoKg + 6.25 * alturaCm - 5 * edad;
    return sexo === "hombre" ? base + 5 : base - 161;
  }

  // ---------- Embarazo (regla de Naegele) ----------
  // Verified case: FUM 2026-01-01 -> FPP 2026-10-08 (FUM + 280 días exactos)
  function calcularEmbarazo(fumStr, hoyStr) {
    var fum = new Date(fumStr + "T00:00:00");
    var hoy = new Date((hoyStr || new Date().toISOString().slice(0, 10)) + "T00:00:00");
    var fpp = new Date(fum.getTime() + 280 * 24 * 60 * 60 * 1000);
    var diasTranscurridos = Math.floor((hoy - fum) / (24 * 60 * 60 * 1000));
    var diasRestantes = Math.floor((fpp - hoy) / (24 * 60 * 60 * 1000));
    var semanas = Math.floor(diasTranscurridos / 7);
    var diasSueltos = diasTranscurridos - semanas * 7;
    var trimestre = semanas < 13 ? 1 : (semanas < 27 ? 2 : 3);
    return {
      fpp: fpp,
      diasTranscurridos: diasTranscurridos,
      diasRestantes: diasRestantes,
      semanas: semanas,
      diasSueltos: diasSueltos,
      trimestre: trimestre
    };
  }

  // ============================================================
  // ICONOS
  // ============================================================
  var ICONS = {
    scale: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 3h6"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.5-2-1-2 .5 2-1 3-2 2 1-2-1-3-1-5-1 1-2 2-2 4-1-1-1-3 0-6Z"/><path d="M7 15a5 5 0 0 0 10 0c0-2-1-3-1-3"/></svg>',
    baby: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M8 12c-3 1-4 4-3 8h14c1-4 0-7-3-8"/><path d="M9 16h.01M15 16h.01"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 9 17 20 6"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
    chevron: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    menu: '<svg class="icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',
    close: '<svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
  };

  // ============================================================
  // MENÚ MÓVIL
  // ============================================================
  function initMobileMenu() {
    var toggle = $("#nav-toggle");
    var panel = $("#mobile-nav-panel");
    var scrim = $("#nav-scrim");
    if (!toggle || !panel) return;
    function open() {
      panel.classList.add("is-open");
      if (scrim) scrim.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.documentElement.style.overflow = "hidden";
    }
    function close() {
      panel.classList.remove("is-open");
      if (scrim) scrim.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.documentElement.style.overflow = "";
    }
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) close(); else open();
    });
    if (scrim) scrim.addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) close(); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 960) close(); });
  }

  // ============================================================
  // MOUNTS
  // ============================================================
  function mountNav() {
    if (!data.nav) return;
    var here = (location.pathname.split("/").pop() || "index.html");
    $$("[data-nav]").forEach(function (nav) {
      if (nav.children.length) return;
      nav.innerHTML = data.nav.map(function (n) {
        var current = n.href === here ? " aria-current=\"page\"" : "";
        return "<a href=\"" + n.href + "\"" + current + ">" + escHTML(n.label) + "</a>";
      }).join("");
    });
  }

  var TOOL_ICON_BY_ID = { imc: ICONS.scale, calorias: ICONS.flame, embarazo: ICONS.baby };

  function mountToolsGrid() {
    if (!data.tools) return;
    var here = (location.pathname.split("/").pop() || "index.html");
    $$("[data-tools-grid]").forEach(function (grid) {
      if (grid.children.length) return;
      var others = data.tools.filter(function (t) { return t.href !== here; });
      grid.innerHTML = others.map(function (t) {
        var icon = TOOL_ICON_BY_ID[t.id] || ICONS.scale;
        var featured = t.id === "imc" ? " tool-tile--featured" : "";
        return "<a class=\"tool-tile" + featured + "\" href=\"" + t.href + "\">" +
          "<span class=\"tool-tile__icon\">" + icon + "</span>" +
          "<span class=\"tool-tile__body\"><h3>" + escHTML(t.title) + "</h3><p>" + escHTML(t.desc) + "</p>" +
          "<span class=\"tool-tile__cta\">Empezar a calcular <svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/><polyline points=\"12 5 19 12 12 19\"/></svg></span></span></a>";
      }).join("");
    });
  }

  function mountToolSwitcher() {
    if (!data.tools) return;
    var here = (location.pathname.split("/").pop() || "index.html");
    $$("[data-tool-switcher]").forEach(function (nav) {
      if (nav.children.length) return;
      nav.innerHTML = data.tools.map(function (t) {
        var icon = TOOL_ICON_BY_ID[t.id] || ICONS.scale;
        var current = t.href === here ? " aria-current=\"page\"" : "";
        return "<a class=\"switcher-pill\" href=\"" + t.href + "\"" + current + ">" + icon + "<span>" + escHTML(t.title.replace("Calculadora de ", "")) + "</span></a>";
      }).join("");
    });
  }

  function mountFaq(selector, list) {
    var el = $(selector);
    if (!el || el.children.length || !list) return;
    el.innerHTML = list.map(function (f) {
      return "<details><summary>" + escHTML(f.q) + ICONS.chevron + "</summary><div class=\"faq-a\">" + escHTML(f.a) + "</div></details>";
    }).join("");
  }

  function mountYear() {
    $$("[data-year]").forEach(function (el) { el.textContent = String(data.year || new Date().getFullYear()); });
  }

  function initReveals() {
    var els = $$(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
    setTimeout(function () { els.forEach(function (e) { e.classList.add("is-in"); }); }, 4000);
  }

  // ============================================================
  // VALIDACIÓN POR CAMPO
  // ============================================================
  function validateFields(rules) {
    var firstInvalidInput = null;
    var allValid = true;
    rules.forEach(function (rule) {
      var input = $("#" + rule.id);
      if (!input) return;
      var field = input.closest(".field");
      var errorEl = field ? $(".field-error", field) : null;
      var valid;
      if (rule.type === "date") {
        valid = !!input.value && !isNaN(new Date(input.value + "T00:00:00").getTime());
        if (valid && rule.maxToday) {
          valid = new Date(input.value + "T00:00:00") <= new Date();
        }
      } else {
        var val = parseNum(input.value);
        valid = isFinite(val) && val >= rule.min && val <= rule.max;
      }
      if (field) field.classList.toggle("has-error", !valid);
      input.setAttribute("aria-invalid", valid ? "false" : "true");
      if (errorEl) errorEl.textContent = valid ? "" : rule.msg;
      if (!valid) { allValid = false; if (!firstInvalidInput) firstInvalidInput = input; }
    });
    if (!allValid && firstInvalidInput) firstInvalidInput.focus({ preventScroll: false });
    return allValid;
  }
  function clearFieldErrors(rules) {
    rules.forEach(function (rule) {
      var input = $("#" + rule.id);
      if (!input) return;
      var field = input.closest(".field");
      if (field) field.classList.remove("has-error");
      input.setAttribute("aria-invalid", "false");
    });
  }
  function withLoadingState(btn, workFn) {
    if (!btn) { workFn(); return; }
    btn.classList.add("is-loading");
    btn.disabled = true;
    setTimeout(function () {
      safe(workFn, "withLoadingState:work");
      btn.classList.remove("is-loading");
      btn.disabled = false;
    }, 150);
  }

  // ============================================================
  // CALCULADORA IMC
  // ============================================================
  function initImc() {
    var form = $("#form-imc");
    if (!form) return;
    var resultZone = $("#resultado-imc");
    var errorMsg = $("#error-imc");
    var submitBtn = $("button[type=submit]", form);
    var resetBtn = $("#reset-imc");

    var RULES = [
      { id: "peso-imc", min: 20, max: 300, msg: "Introduce un peso entre 20 y 300 kg." },
      { id: "altura-imc", min: 100, max: 250, msg: "Introduce una altura entre 100 y 250 cm." },
      { id: "edad-imc", min: 15, max: 100, msg: "Introduce una edad entre 15 y 100 años." }
    ];

    function ejecutar() {
      if (!validateFields(RULES)) {
        errorMsg.textContent = "Revisa los campos marcados en rojo antes de calcular.";
        errorMsg.classList.add("is-visible");
        resultZone.classList.remove("is-visible");
        return;
      }
      errorMsg.classList.remove("is-visible");
      var peso = parseNum($("#peso-imc").value);
      var altura = parseNum($("#altura-imc").value);
      var edad = parseNum($("#edad-imc").value);
      var sexo = $("#sexo-imc").value;
      var r = calcularIMC(peso, altura);
      var grasa = calcularGrasaCorporal(r.imc, edad, sexo);

      $("#out-imc").textContent = fmtNum1.format(r.imc).replace(".", ",");
      $("#out-categoria").textContent = r.categoria;
      $("#out-categoria").className = "value pill-" + r.colorKey;
      var subtitleEl = $("#out-subtitle-imc");
      if (subtitleEl) subtitleEl.textContent = "Con " + peso.toString().replace(".", ",") + " kg y " + altura.toString().replace(".", ",") + " cm, tu categoría es: " + r.categoria.toLowerCase() + ".";

      var outGrasa = $("#out-grasa");
      if (outGrasa) outGrasa.textContent = fmtNum1.format(Math.max(0, grasa)).replace(".", ",") + " %";

      // Barra de rango 15-40 con marcador de posición
      var min = 15, max = 40;
      var pct = Math.max(0, Math.min(100, ((r.imc - min) / (max - min)) * 100));
      var marker = $("#imc-marker");
      if (marker) marker.style.left = pct + "%";
      var markerLabel = $("#imc-marker-label");
      if (markerLabel) markerLabel.textContent = fmtNum1.format(r.imc).replace(".", ",");

      resultZone.classList.add("is-visible");
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); withLoadingState(submitBtn, ejecutar); });
    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field && field.classList.contains("has-error")) safe(function () { validateFields(RULES); }, "revalidate-imc");
    });
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.reset(); clearFieldErrors(RULES); errorMsg.classList.remove("is-visible");
        resultZone.classList.remove("is-visible");
        var first = $("#peso-imc"); if (first) first.focus();
      });
    }
    safe(ejecutar, "imc-inicial");
  }

  // ============================================================
  // CALCULADORA CALORÍAS DIARIAS
  // ============================================================
  function initCalorias() {
    var form = $("#form-calorias");
    if (!form) return;
    var resultZone = $("#resultado-calorias");
    var errorMsg = $("#error-calorias");
    var submitBtn = $("button[type=submit]", form);
    var resetBtn = $("#reset-calorias");

    var RULES = [
      { id: "peso-calorias", min: 20, max: 300, msg: "Introduce un peso entre 20 y 300 kg." },
      { id: "altura-calorias", min: 100, max: 250, msg: "Introduce una altura entre 100 y 250 cm." },
      { id: "edad-calorias", min: 10, max: 100, msg: "Introduce una edad entre 10 y 100 años." }
    ];

    function ejecutar() {
      if (!validateFields(RULES)) {
        errorMsg.textContent = "Revisa los campos marcados en rojo antes de calcular.";
        errorMsg.classList.add("is-visible");
        resultZone.classList.remove("is-visible");
        return;
      }
      errorMsg.classList.remove("is-visible");
      var sexo = $("#sexo-calorias").value;
      var peso = parseNum($("#peso-calorias").value);
      var altura = parseNum($("#altura-calorias").value);
      var edad = parseNum($("#edad-calorias").value);
      var actividadKey = $("#actividad-calorias").value;

      var tmb = calcularTMB(sexo, peso, altura, edad);
      var activo = ACTIVITY_FACTORS.filter(function (a) { return a.key === actividadKey; })[0] || ACTIVITY_FACTORS[0];
      var tdee = tmb * activo.factor;

      $("#out-tdee").textContent = fmtInt.format(tdee);
      $("#out-tmb").textContent = fmtInt.format(tmb);
      var subtitleEl = $("#out-subtitle-calorias");
      if (subtitleEl) subtitleEl.textContent = "Con actividad \"" + activo.label.split(" (")[0].toLowerCase() + "\", estas son las calorías estimadas para mantener tu peso actual.";

      var tbody = $("#tabla-actividad tbody");
      if (tbody) {
        tbody.innerHTML = ACTIVITY_FACTORS.map(function (a) {
          var isActive = a.key === actividadKey ? " class=\"is-active-row\"" : "";
          return "<tr" + isActive + "><td>" + a.label + "</td><td>" + fmtInt.format(tmb * a.factor) + " kcal</td></tr>";
        }).join("");
      }

      resultZone.classList.add("is-visible");
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); withLoadingState(submitBtn, ejecutar); });
    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field && field.classList.contains("has-error")) safe(function () { validateFields(RULES); }, "revalidate-calorias");
    });
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.reset(); clearFieldErrors(RULES); errorMsg.classList.remove("is-visible");
        resultZone.classList.remove("is-visible");
        var first = $("#peso-calorias"); if (first) first.focus();
      });
    }
    safe(ejecutar, "calorias-inicial");
  }

  // ============================================================
  // CALCULADORA SEMANAS DE EMBARAZO
  // ============================================================
  function initEmbarazo() {
    var form = $("#form-embarazo");
    if (!form) return;
    var resultZone = $("#resultado-embarazo");
    var errorMsg = $("#error-embarazo");
    var submitBtn = $("button[type=submit]", form);
    var resetBtn = $("#reset-embarazo");

    var RULES = [
      { id: "fum-embarazo", type: "date", maxToday: true, msg: "Introduce una fecha válida, no posterior a hoy." }
    ];

    function ejecutar() {
      if (!validateFields(RULES)) {
        errorMsg.textContent = "Revisa la fecha marcada en rojo antes de calcular.";
        errorMsg.classList.add("is-visible");
        resultZone.classList.remove("is-visible");
        return;
      }
      var fumVal = $("#fum-embarazo").value;
      var r = calcularEmbarazo(fumVal);

      if (r.semanas > 45 || r.semanas < 0) {
        errorMsg.textContent = "Esa fecha da un resultado fuera de lo habitual para un embarazo. Revísala.";
        errorMsg.classList.add("is-visible");
        resultZone.classList.remove("is-visible");
        return;
      }
      errorMsg.classList.remove("is-visible");

      $("#out-semanas").textContent = r.semanas + "";
      $("#out-semanas-dias").textContent = r.diasSueltos + "";
      $("#out-fpp").textContent = fmtDateLong.format(r.fpp);
      $("#out-trimestre").textContent = r.trimestre + "º trimestre";
      $("#out-dias-restantes").textContent = r.diasRestantes > 0 ? (r.diasRestantes + " días") : "Ya en fecha";
      var subtitleEl = $("#out-subtitle-embarazo");
      if (subtitleEl) subtitleEl.textContent = "Estimado a partir del primer día de tu última regla, según la regla de Naegele.";

      var pct = Math.max(0, Math.min(100, (r.semanas / 40) * 100));
      var marker = $("#embarazo-bar-fill");
      if (marker) marker.style.width = pct + "%";

      resultZone.classList.add("is-visible");
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); withLoadingState(submitBtn, ejecutar); });
    form.addEventListener("input", function (e) {
      var field = e.target.closest(".field");
      if (field && field.classList.contains("has-error")) safe(function () { validateFields(RULES); }, "revalidate-embarazo");
    });
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        form.reset(); clearFieldErrors(RULES); errorMsg.classList.remove("is-visible");
        resultZone.classList.remove("is-visible");
        var first = $("#fum-embarazo"); if (first) first.focus();
      });
    }
    safe(ejecutar, "embarazo-inicial");
  }

  // ============================================================
  // BOOT
  // ============================================================
  function boot() {
    document.documentElement.classList.remove("no-js");
    safe(mountNav, "mountNav");
    safe(mountToolSwitcher, "mountToolSwitcher");
    safe(mountToolsGrid, "mountToolsGrid");
    safe(function () { mountFaq("[data-faq-imc]", data.faqsImc); }, "mountFaqImc");
    safe(function () { mountFaq("[data-faq-calorias]", data.faqsCalorias); }, "mountFaqCalorias");
    safe(function () { mountFaq("[data-faq-embarazo]", data.faqsEmbarazo); }, "mountFaqEmbarazo");
    safe(mountYear, "mountYear");
    safe(initMobileMenu, "initMobileMenu");
    safe(initReveals, "initReveals");
    safe(initImc, "initImc");
    safe(initCalorias, "initCalorias");
    safe(initEmbarazo, "initEmbarazo");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
