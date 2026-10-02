/* Sulayman Abu-Bakr — site interactions */
(function () {
  "use strict";

  // Set this to the office email to make the contact form open a pre-filled email.
  var CONTACT_EMAIL = "sulaymanbakr@gmail.com";

  document.documentElement.classList.remove("no-js");

  /* ---------- Nav: shrink on scroll ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  function setMenu(open) {
    links.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () {
    setMenu(!links.classList.contains("is-open"));
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    reveals.forEach(function (el) {
      // Stagger siblings for a composed, sequential entrance
      var siblings = el.parentElement.querySelectorAll(":scope > .reveal");
      var index = Array.prototype.indexOf.call(siblings, el);
      el.style.transitionDelay = Math.min(index, 6) * 90 + "ms";
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Count-up for impact figures ---------- */
  var counters = document.querySelectorAll("[data-count]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function formatCount(el, value) {
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var text = value.toFixed(decimals);
    if (el.hasAttribute("data-separator")) text = Number(text).toLocaleString("en-US");
    return text;
  }

  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var duration = 1800;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 4);
      el.textContent = formatCount(el, target * eased);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) {
      el.textContent = formatCount(el, 0);
      countObserver.observe(el);
    });
  }

  /* ---------- Highlight current section in nav ---------- */
  var navAnchors = links.querySelectorAll('a[href^="#"]:not(.nav__cta)');
  var sections = Array.prototype.map.call(navAnchors, function (a) {
    return document.querySelector(a.getAttribute("href"));
  }).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;

    form.querySelectorAll("[required]").forEach(function (input) {
      var ok = input.value.trim() !== "" &&
        (input.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
      input.parentElement.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      status.textContent = "Please complete your name, a valid email address and your message.";
      return;
    }

    var data = new FormData(form);
    if (CONTACT_EMAIL) {
      var subject = data.get("subject") || "Message from website";
      var body = data.get("message") + "\n\n— " + data.get("name") + " (" + data.get("email") + ")";
      window.location.href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      status.textContent = "Opening your email app…";
    } else {
      status.textContent = "Online messaging is not yet available. Please use the contact details shown.";
    }
  });

  /* ---------- Highlights filter (media page) ---------- */
  var filterButtons = document.querySelectorAll(".filter");
  var entryEls = document.querySelectorAll(".entry");
  var emptyNote = document.getElementById("entriesEmpty");

  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      var shown = 0;
      filterButtons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      entryEls.forEach(function (el) {
        var match = cat === "all" || el.getAttribute("data-cat") === cat;
        el.hidden = !match;
        if (match) {
          el.classList.add("is-visible");
          shown++;
        }
      });
      if (emptyNote) emptyNote.hidden = shown > 0;
    });
  });

  /* ---------- Newsletter PDFs: show "coming soon" until the file is uploaded ---------- */
  var pdfLinks = document.querySelectorAll(".js-pdf");
  var pdfChecks = {};

  function markPending(el) {
    if (el.hasAttribute("data-pending-hide")) {
      el.hidden = true;
      return;
    }
    el.removeAttribute("href");
    el.removeAttribute("download");
    el.setAttribute("aria-disabled", "true");
    el.classList.add("is-pending");
    el.textContent = el.getAttribute("data-pending-label") || "Coming soon";
  }

  pdfLinks.forEach(function (el) {
    var url = el.getAttribute("href");
    if (!pdfChecks[url]) {
      pdfChecks[url] = window.fetch
        ? fetch(url, { method: "HEAD" }).then(function (r) { return r.ok; }, function () { return false; })
        : Promise.resolve(true);
    }
    pdfChecks[url].then(function (ok) { if (!ok) markPending(el); });
  });

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var galleryButtons = Array.prototype.slice.call(document.querySelectorAll(".gallery__open"));

  if (lightbox && galleryButtons.length) {
    var lbImg = lightbox.querySelector(".lightbox__img");
    var lbCaption = lightbox.querySelector(".lightbox__caption span");
    var lbCredit = lightbox.querySelector(".lightbox__caption small");
    var current = 0;
    var lastFocus = null;

    function show(i) {
      current = (i + galleryButtons.length) % galleryButtons.length;
      var btn = galleryButtons[current];
      lbImg.src = btn.getAttribute("data-full");
      lbImg.alt = btn.querySelector("img").alt;
      lbCaption.textContent = btn.getAttribute("data-caption");
      lbCredit.textContent = btn.getAttribute("data-credit");
    }
    function openLightbox(i) {
      lastFocus = document.activeElement;
      show(i);
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      lightbox.querySelector(".lightbox__close").focus();
    }
    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    galleryButtons.forEach(function (btn, i) {
      btn.addEventListener("click", function () { openLightbox(i); });
    });
    lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
    lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", function () { show(current - 1); });
    lightbox.querySelector(".lightbox__nav--next").addEventListener("click", function () { show(current + 1); });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });

    // Swipe between photos on touch screens
    var touchX = null;
    lightbox.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ---------- Media story: light the node of the moment in view ---------- */
  var moments = document.querySelectorAll(".moment");
  if (moments.length && "IntersectionObserver" in window) {
    var momentObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("is-active");
      });
    }, { rootMargin: "-40% 0px -50% 0px" });
    moments.forEach(function (m) { momentObserver.observe(m); });
  } else {
    moments.forEach(function (m) { m.classList.add("is-active"); });
  }

  /* ---------- Floating back-to-top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    toTop.hidden = false;
    var toggleTop = function () { toTop.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.8); };
    window.addEventListener("scroll", toggleTop, { passive: true });
    toggleTop();
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      var skip = document.querySelector(".nav__brand");
      if (skip) skip.focus({ preventScroll: true });
    });
  }

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
