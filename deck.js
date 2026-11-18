/* slidewahyu — navigation. Load after the slides exist.
   ← → space PgUp/PgDn Home End navigate · F fullscreen · ? help · URL hash keeps the slide. */
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  if (!slides.length) return;

  var i = 0;

  /* fixed 1920×1080 stage, scaled as a whole and centred. Never reflows. */
  var stage = document.querySelector(".deck-stage");
  function fit() {
    if (!stage) return;
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var x = (window.innerWidth - 1920 * s) / 2;
    var y = (window.innerHeight - 1080 * s) / 2;
    stage.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")";
  }
  window.addEventListener("resize", fit);
  fit();

  var bar = document.createElement("div");
  bar.id = "progress";
  document.body.appendChild(bar);

  var counter = document.createElement("div");
  counter.id = "counter";
  document.body.appendChild(counter);

  var dir = 1;

  function show(n) {
    var prevIndex = i;
    i = Math.max(0, Math.min(slides.length - 1, n));
    if (i !== prevIndex) dir = i > prevIndex ? 1 : -1;
    slides.forEach(function (s, k) {
      var active = k === i;
      s.style.setProperty("--dir", (dir > 0 ? 56 : -56) + "px");
      s.classList.toggle("on", active);
      s.setAttribute("aria-hidden", active ? "false" : "true");
      /* stagger: each .a element in the active slide arrives 70ms after the one before.
         Cleared on the way out so leaving never lags behind the transition. */
      var anims = s.querySelectorAll(".a");
      for (var j = 0; j < anims.length; j++) {
        anims[j].style.transitionDelay = active ? (j * 70) + "ms" : "0ms";
      }
    });
    countUp(slides[i]);
    bar.style.width = ((i + 1) / slides.length) * 100 + "%";
    counter.textContent = (i + 1) + " / " + slides.length;
    history.replaceState(null, "", "#" + (i + 1));
  }

  /* numbers that count to their value. <span data-count="1098265">0</span>
     Optional: data-prefix, data-suffix, data-decimals. */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fmt(v, dec) {
    var s = dec ? v.toFixed(dec) : Math.round(v).toString();
    var parts = s.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
  }

  function countUp(slide) {
    if (!slide) return;
    var els = slide.querySelectorAll("[data-count]");
    for (var k = 0; k < els.length; k++) {
      (function (el) {
        var target = parseFloat(el.dataset.count);
        if (isNaN(target)) return;
        var dec = parseInt(el.dataset.decimals || "0", 10);
        var pre = el.dataset.prefix || "";
        var suf = el.dataset.suffix || "";
        if (reduce) { el.textContent = pre + fmt(target, dec) + suf; return; }
        var start = null, dur = 1100, done = false;
        function step(ts) {
          if (done) return;
          if (start === null) start = ts;
          var t = Math.min(1, (ts - start) / dur);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = pre + fmt(target * eased, dec) + suf;
          if (t < 1) requestAnimationFrame(step);
        }
        el.textContent = pre + fmt(0, dec) + suf;
        requestAnimationFrame(step);
        /* rAF is throttled in a background tab, so the loop can outlive the duration
           and keep overwriting the value. The guard stops the loop and pins the final
           number — a slide must never sit on a wrong figure. */
        setTimeout(function () {
          done = true;
          el.textContent = pre + fmt(target, dec) + suf;
        }, dur + 250);
      })(els[k]);
    }
  }

  function next() { show(i + 1); }
  function prev() { show(i - 1); }

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case "ArrowRight": case "ArrowDown": case " ": case "PageDown": case "Enter":
        e.preventDefault(); next(); break;
      case "ArrowLeft": case "ArrowUp": case "PageUp": case "Backspace":
        e.preventDefault(); prev(); break;
      case "Home": e.preventDefault(); show(0); break;
      case "End": e.preventDefault(); show(slides.length - 1); break;
      case "f": case "F":
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
        break;
    }
  });

  /* click right half = next, left half = prev (presenter remotes send arrows anyway).
     Anything interactive inside a slide must swallow its own click, so the deck
     never advances under a button the audience just pressed. */
  document.addEventListener("click", function (e) {
    if (e.target.closest("a, button, input, select, textarea, label, [role=\"button\"], [data-no-nav]")) return;
    if (e.clientX > window.innerWidth * 0.5) next(); else prev();
  });

  /* touch swipe */
  var x0 = null;
  document.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    x0 = null;
  }, { passive: true });

  var fromHash = parseInt((location.hash || "").replace("#", ""), 10);
  show(isNaN(fromHash) ? 0 : fromHash - 1);
})();
