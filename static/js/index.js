/* CovHiS project page scripts: text-to-video carousel and BibTeX copy button. */

(function () {
  'use strict';

  /* ---------------- Text-to-video carousel ---------------- */
  function setupCarousel(root) {
    var track = root.querySelector('.t2v-track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.t2v-slide'));
    var prevButton = root.querySelector('.t2v-arrow.is-prev');
    var nextButton = root.querySelector('.t2v-arrow.is-next');
    var dotsWrap = root.querySelector('.t2v-dots');
    var status = root.querySelector('.t2v-status');
    var viewport = root.querySelector('.t2v-viewport');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0;
    var inView = false;
    var dots = [];

    if (!track || slides.length === 0) { return; }

    if (slides.length < 2) {
      prevButton.hidden = true;
      nextButton.hidden = true;
    }

    // One dot per slide
    slides.forEach(function (slide, i) {
      slide.setAttribute('aria-label', (i + 1) + ' of ' + slides.length);
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 't2v-dot';
      dot.setAttribute('aria-label', 'Show video ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    });

    function playActive() {
      slides.forEach(function (slide, i) {
        var video = slide.querySelector('video');
        if (!video) { return; }
        if (i === current && inView) {
          video.muted = true; // browsers only allow automatic playback for muted videos
          var p = video.play();
          if (p && p.catch) { p.catch(function () { /* autoplay blocked: controls stay available */ }); }
        } else {
          video.pause();
        }
      });
    }

    function goTo(index, announce) {
      var n = slides.length;
      current = ((index % n) + n) % n;
      track.style.transform = 'translateX(' + (-100 * current) + '%)';
      slides.forEach(function (slide, i) {
        var active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
        if ('inert' in slide) { slide.inert = !active; }
      });
      dots.forEach(function (dot, i) {
        var active = i === current;
        dot.classList.toggle('is-active', active);
        if (active) { dot.setAttribute('aria-current', 'true'); } else { dot.removeAttribute('aria-current'); }
      });
      if (announce !== false && status) {
        status.textContent = 'Video ' + (current + 1) + ' of ' + n;
      }
      playActive();
    }

    prevButton.addEventListener('click', function () { goTo(current - 1); });
    nextButton.addEventListener('click', function () { goTo(current + 1); });

    // Arrow keys while focus is inside the carousel (but not on the video's own controls)
    root.addEventListener('keydown', function (e) {
      if (e.target && e.target.tagName === 'VIDEO') { return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    // Swipe on touch screens
    var startX = null;
    var startY = null;
    viewport.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { return; }
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    viewport.addEventListener('touchend', function (e) {
      if (startX === null) { return; }
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        goTo(dx < 0 ? current + 1 : current - 1);
      }
      startX = null;
    });

    // Play only while the carousel is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        playActive();
      }, { threshold: 0.35 }).observe(root);
    } else {
      inView = true;
    }

    if (reduceMotion) { track.style.transition = 'none'; }
    goTo(0, false);
  }

  /* ---------------- BibTeX copy button ---------------- */
  function setupCopyButton() {
    var button = document.getElementById('copy-bibtex');
    var label = document.getElementById('copy-bibtex-label');
    var text = document.getElementById('bibtex-text');
    if (!button) { return; }
    if (!navigator.clipboard) { button.style.display = 'none'; return; }
    button.addEventListener('click', function () {
      navigator.clipboard.writeText(text.textContent).then(function () {
        label.textContent = 'Copied';
        setTimeout(function () { label.textContent = 'Copy'; }, 2000);
      }, function () {
        label.textContent = 'Select and copy manually';
      });
    });
  }

  function init() {
    var carousels = document.querySelectorAll('.t2v-carousel');
    for (var i = 0; i < carousels.length; i++) { setupCarousel(carousels[i]); }
    setupCopyButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
