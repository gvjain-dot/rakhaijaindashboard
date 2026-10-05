/* Grey-box lander film engine, shared by concept A and B.
   Pattern borrowed from incep2t: one timed schedule, the film is the first section
   (never a gate), a progress line then hands off to the hero, and any deliberate
   input cancels the hand-off. ?speed=0.5 slows it for review, ?final shows the end frame. */
(function () {
  var qs = new URLSearchParams(location.search);
  var speed = parseFloat(qs.get('speed')) || 1;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  var MARK =
    '<svg viewBox="0 0 200 240" aria-hidden="true">' +
    '<path pathLength="1" style="--d:0ms" d="M14 222 H186"/>' +
    '<path pathLength="1" style="--d:120ms" d="M93 222 C95 192 93 166 87 140"/>' +
    '<path pathLength="1" style="--d:120ms" d="M107 222 C105 192 107 166 113 140"/>' +
    '<path pathLength="1" style="--d:60ms" d="M93 222 C85 229 71 231 58 233"/>' +
    '<path pathLength="1" style="--d:60ms" d="M107 222 C115 229 129 231 142 233"/>' +
    '<path pathLength="1" style="--d:60ms" d="M100 222 C100 227 99 231 100 236"/>' +
    '<path pathLength="1" style="--d:380ms" d="M87 140 C72 126 56 118 42 104"/>' +
    '<path pathLength="1" style="--d:420ms" d="M91 150 C81 128 79 110 83 88"/>' +
    '<path pathLength="1" style="--d:460ms" d="M100 152 C100 122 100 96 100 70"/>' +
    '<path pathLength="1" style="--d:420ms" d="M109 150 C119 128 121 110 117 88"/>' +
    '<path pathLength="1" style="--d:380ms" d="M113 140 C128 126 144 118 158 104"/>' +
    '<path pathLength="1" style="--d:700ms" d="M42 104 C22 96 22 70 42 64 C40 44 62 32 78 40 C84 22 116 22 122 40 C138 32 160 44 158 64 C178 70 178 96 158 104 C150 116 130 117 120 108 C110 119 90 119 80 108 C70 117 50 116 42 104"/>' +
    '</svg>';

  window.Film = function (cfg) {
    var lander = document.querySelector('.lander');
    var $ = function (s) { return lander.querySelector(s); };
    var $$ = function (s) { return [].slice.call(lander.querySelectorAll(s)); };
    $$('[data-mark]').forEach(function (el) { el.innerHTML = MARK; });

    var caps = $$('.cap>span');
    var api = {
      $: $, $$: $$,
      cap: function (i) {
        caps.forEach(function (el, k) {
          if (k === i) { el.classList.remove('off'); el.classList.add('on'); }
          else if (el.classList.contains('on')) { el.classList.remove('on'); el.classList.add('off'); }
        });
      }
    };

    var timers = [], done = false;
    function at(ms, fn) { timers.push(setTimeout(function () { if (!done) fn(); }, ms / speed)); }
    function finish(instant) {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      if (instant) lander.classList.add('instant');
      cfg.final(api);
      if (instant) requestAnimationFrame(function () { requestAnimationFrame(function () { lander.classList.remove('instant'); }); });
    }

    var rm = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || qs.has('final');
    var hold = $('.hold'), hero = document.getElementById('hero');

    $('[data-skip]').addEventListener('click', function () { finish(true); });
    $('[data-replay]').addEventListener('click', function () { location.reload(); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(true); });

    if (rm) { finish(true); return; }

    cfg.script(at, api);
    at(cfg.end, function () { done = true; });

    // hand-off: progress line fills, then glide to the hero; any input cancels it
    var HOLD = cfg.handoff / speed, evts = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    var fill = hold.querySelector('i');
    fill.style.transitionDuration = HOLD + 'ms';
    requestAnimationFrame(function () { requestAnimationFrame(function () { hold.classList.add('run'); }); });
    var t = setTimeout(function () { cancel(); hero.scrollIntoView({ behavior: 'smooth' }); }, HOLD);
    function cancel() {
      clearTimeout(t);
      hold.classList.remove('run'); hold.classList.add('done');
      evts.forEach(function (e) { removeEventListener(e, cancel); });
    }
    evts.forEach(function (e) { addEventListener(e, cancel, { passive: true }); });
  };
})();
