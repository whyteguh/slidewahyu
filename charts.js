/* slidewahyu — charts from data attributes. No build step, no dependency.
   <div class="chart" data-chart="bars" data-values="12,18,15,24" data-labels="Q1,Q2,Q3,Q4"></div>
   Types: bars · line · donut · meter
   Colours come from the theme (--accent, --accent-2, --line). Nothing here sets a colour. */
(function () {
  var NS = "http://www.w3.org/2000/svg";

  function svgEl(n, a) {
    var e = document.createElementNS(NS, n);
    for (var k in a) e.setAttribute(k, a[k]);
    return e;
  }
  function nums(s) {
    return (s || "").split(",").map(function (x) { return parseFloat(x.trim()); })
      .filter(function (n) { return !isNaN(n); });
  }
  function words(s) {
    return (s || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean);
  }
  function labelRow(host, labs, vals) {
    /* a series with too many points reads as noise under the chart; data-nolabels
       keeps the shape and drops the row. */
    if (host.hasAttribute("data-nolabels")) return;
    if (!labs.length && !vals) return;
    var row = document.createElement("div");
    row.className = "ch-labels";
    var n = Math.max(labs.length, vals ? vals.length : 0);
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      if (vals && vals[i] !== undefined) {
        var b = document.createElement("b");
        b.textContent = vals[i];
        s.appendChild(b);
      }
      if (labs[i]) {
        var t = document.createElement("i");
        t.textContent = labs[i];
        s.appendChild(t);
      }
      row.appendChild(s);
    }
    host.appendChild(row);
  }

  function bars(host, vals, labs) {
    var max = Math.max.apply(null, vals) || 1;
    var n = vals.length;
    var svg = svgEl("svg", {
      viewBox: "0 0 100 100", preserveAspectRatio: "none", class: "ch-svg ch-bars"
    });
    var slot = 100 / n;
    var bw = slot * 0.56;
    vals.forEach(function (v, i) {
      var h = Math.max(1.5, (v / max) * 100);
      var r = svgEl("rect", {
        x: (i * slot + (slot - bw) / 2).toFixed(2),
        y: (100 - h).toFixed(2),
        width: bw.toFixed(2),
        height: h.toFixed(2),
        class: "ch-bar",
        style: "animation-delay:" + (i * 90) + "ms"
      });
      svg.appendChild(r);
    });
    svg.appendChild(svgEl("line", {
      x1: 0, y1: 100, x2: 100, y2: 100, class: "ch-base", "vector-effect": "non-scaling-stroke"
    }));
    host.appendChild(svg);
    labelRow(host, labs, vals);
  }

  function line(host, vals, labs) {
    var max = Math.max.apply(null, vals) || 1;
    var n = vals.length;
    /* A stretched viewBox keeps the path honest but turns every dot into an oval.
       Measure the host instead and match the viewBox to its aspect, so x and y share
       one scale. Endpoints are inset so the first and last dot are never clipped. */
    var W = 1000;
    var bw = host.clientWidth || 1000;
    var bh = host.clientHeight || 380;
    var H = Math.max(140, Math.round(W * bh / bw));
    var padX = 16, padY = 10;
    var innerW = W - padX * 2, innerH = H - padY * 2;
    var pts = vals.map(function (v, i) {
      var x = n === 1 ? W / 2 : padX + (i * innerW) / (n - 1);
      var y = H - padY - (v / max) * (innerH * 0.94);
      return [x, y];
    });
    var svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", class: "ch-svg ch-line"
    });
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
    svg.appendChild(svgEl("path", {
      d: d + " L" + (W - padX) + " " + H + " L" + padX + " " + H + " Z", class: "ch-area"
    }));
    svg.appendChild(svgEl("path", {
      d: d, class: "ch-stroke", pathLength: "1", "vector-effect": "non-scaling-stroke"
    }));
    pts.forEach(function (p, i) {
      svg.appendChild(svgEl("circle", {
        cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: "7",
        class: "ch-dot", style: "animation-delay:" + (400 + i * 80) + "ms"
      }));
    });
    host.appendChild(svg);
    labelRow(host, labs, vals);
  }

  function donut(host, vals, labs) {
    var total = vals.reduce(function (a, b) { return a + b; }, 0) || 1;
    var svg = svgEl("svg", { viewBox: "0 0 100 100", class: "ch-svg ch-donut" });
    svg.appendChild(svgEl("circle", {
      cx: 50, cy: 50, r: 40, class: "ch-ring-bg", "stroke-width": 13, fill: "none"
    }));
    var offset = 0;
    vals.forEach(function (v, i) {
      var frac = v / total;
      var c = svgEl("circle", {
        cx: 50, cy: 50, r: 40, fill: "none", "stroke-width": 13,
        class: "ch-ring" + (i ? " alt" : ""),
        pathLength: "1",
        "stroke-dashoffset": (-offset).toFixed(4),
        transform: "rotate(-90 50 50)",
        style: "--f:" + frac.toFixed(4) + ";animation-delay:" + (i * 160) + "ms"
      });
      svg.appendChild(c);
      offset += frac;
    });
    host.appendChild(svg);
    var pct = vals.map(function (v) { return Math.round((v / total) * 100) + "%"; });
    labelRow(host, labs, pct);
  }

  function meter(host, vals, labs) {
    var max = Math.max.apply(null, vals) || 1;
    var wrap = document.createElement("div");
    wrap.className = "ch-meters";
    vals.forEach(function (v, i) {
      var row = document.createElement("div");
      row.className = "ch-meter";
      var track = document.createElement("div");
      track.className = "ch-track";
      var fill = document.createElement("div");
      fill.className = "ch-fill";
      fill.style.width = ((v / max) * 100).toFixed(1) + "%";
      fill.style.animationDelay = (i * 110) + "ms";
      track.appendChild(fill);
      var lab = document.createElement("span");
      lab.className = "ch-mlabel";
      lab.textContent = labs[i] || "";
      var val = document.createElement("span");
      val.className = "ch-mval";
      val.textContent = v;
      row.appendChild(lab); row.appendChild(track); row.appendChild(val);
      wrap.appendChild(row);
    });
    host.appendChild(wrap);
  }

  var render = { bars: bars, line: line, donut: donut, meter: meter };

  function build() {
    document.querySelectorAll("[data-chart]").forEach(function (host) {
      if (host.dataset.done) return;
      var fn = render[host.dataset.chart];
      if (!fn) return;
      var vals = nums(host.dataset.values);
      if (!vals.length) return;
      fn(host, vals, words(host.dataset.labels));
      host.dataset.done = "1";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
