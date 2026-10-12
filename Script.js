document.addEventListener('DOMContentLoaded', function () {

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Mobile nav toggle ---- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Scroll reveal animation ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---- Back-to-top button ---- */
  var toTop = document.getElementById('toTop');
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    var scrolled = window.scrollY > 480;
    if (toTop) toTop.classList.toggle('visible', scrolled);
    if (navbar) navbar.classList.toggle('glass', true);
  });
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Copy email button ---- */
  var copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = 'pudeasih@gmail.com';
      var done = function () {
        var original = copyBtn.textContent;
        copyBtn.textContent = 'Email Copied!';
        setTimeout(function () { copyBtn.textContent = original; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () {
          window.location.href = 'mailto:' + email;
        });
      } else {
        window.location.href = 'mailto:' + email;
      }
    });
  }

  /* ---- Scrollspy: highlight active nav link ---- */
  var sections = document.querySelectorAll('main section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a');
  if ('IntersectionObserver' in window && sections.length && navAnchors.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navAnchors.forEach(function (a) {
            a.classList.toggle('nav-active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- Scroll-driven background color transition ----
     Each content section carries a data-tint color from the ReGrowth
     palette. Rather than snapping to a color when a section enters
     view, the background is recalculated on every scroll frame: a
     reference point (a little above viewport centre) travels down the
     page, and the background is linearly interpolated between the
     tints of whichever two sections that point currently sits
     between. The result is a continuous crossfade that tracks scroll
     position itself, not just section boundaries. The dark hero and
     footer keep their own fixed background, so this only drives the
     lighter sections in between. */
  var tintEls = Array.prototype.slice.call(document.querySelectorAll('main section[data-tint]'));
  if (tintEls.length) {
    var hexToRgb = function (hex) {
      var h = hex.replace('#', '');
      return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16)
      ];
    };
    var stops = tintEls.map(function (el) {
      return { el: el, rgb: hexToRgb(el.getAttribute('data-tint')) };
    });
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ticking = false;

    var applyTint = function () {
      ticking = false;
      var refPoint = window.scrollY + window.innerHeight * 0.4;

      var positions = stops.map(function (s) {
        var rect = s.el.getBoundingClientRect();
        return rect.top + window.scrollY + rect.height / 2;
      });

      var rgb;
      if (refPoint <= positions[0]) {
        rgb = stops[0].rgb;
      } else if (refPoint >= positions[positions.length - 1]) {
        rgb = stops[stops.length - 1].rgb;
      } else {
        var i = 0;
        while (i < positions.length - 1 && refPoint > positions[i + 1]) i++;
        var p0 = positions[i], p1 = positions[i + 1];
        var t = p1 > p0 ? (refPoint - p0) / (p1 - p0) : 0;
        var a = stops[i].rgb, b = stops[i + 1].rgb;
        rgb = [
          Math.round(a[0] + (b[0] - a[0]) * t),
          Math.round(a[1] + (b[1] - a[1]) * t),
          Math.round(a[2] + (b[2] - a[2]) * t)
        ];
      }
      document.body.style.backgroundColor = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
    };

    var onScroll = function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(applyTint);
      }
    };

    if (reduceMotion) {
      // Still set an initial tint, just skip the continuous recompute.
      applyTint();
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      applyTint();
    }
  }

  /* ---- Document modals (fullscreen viewer) ---- */
  document.querySelectorAll('.doc-thumb').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-target');
      if (target) window.location.hash = target;
    });
  });
  document.querySelectorAll('.modal').forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) window.location.hash = '';
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') window.location.hash = '';
  });

});