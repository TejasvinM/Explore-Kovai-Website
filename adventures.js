(function () {
  /* menu */
  var nav = document.getElementById('navbar'), t = nav.querySelector('.nav-toggle'), l = document.getElementById('nav-links');
  function setMenu(o) { l.classList.toggle('open', o); t.setAttribute('aria-expanded', o); t.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); }
  t.addEventListener('click', function () { setMenu(t.getAttribute('aria-expanded') !== 'true'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && l.classList.contains('open')) { setMenu(false); t.focus(); } });
  function navState() { nav.classList.toggle('scrolled', scrollY > 40); }
  nav.classList.remove('scrolled'); navState();

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var list = document.getElementById('trail-list'), stops = [].slice.call(list.querySelectorAll('.stop'));
  var base = document.getElementById('trail-base'), walk = document.getElementById('trail-walk'), svg = document.getElementById('trail-svg');
  var ridges = [].slice.call(document.querySelectorAll('.ridge')), hero = document.querySelector('.ad-hero');
  var len = 0;

  /* draw a winding trail through the visible stop markers */
  function buildTrail() {
    var box = list.getBoundingClientRect(), pts = [];
    svg.setAttribute('viewBox', '0 0 ' + box.width + ' ' + list.offsetHeight);
    stops.forEach(function (s) {
      if (s.classList.contains('hide')) return;
      var m = s.querySelector('.stop-mark').getBoundingClientRect();
      pts.push([m.left - box.left + m.width / 2, m.top - box.top + m.height / 2]);
    });
    if (!pts.length) { base.setAttribute('d', ''); walk.setAttribute('d', ''); len = 0; return; }
    var narrow = innerWidth <= 860, swing = narrow ? 14 : Math.min(160, box.width * 0.12);
    var d = 'M' + pts[0][0] + ' ' + Math.max(0, pts[0][1] - 120);
    d += ' L' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], dir = i % 2 ? 1 : -1, my = (b[1] - a[1]);
      d += ' C' + (a[0] + dir * swing) + ' ' + (a[1] + my * 0.35) + ',' + (b[0] - dir * swing) + ' ' + (b[1] - my * 0.35) + ',' + b[0] + ' ' + b[1];
    }
    var last = pts[pts.length - 1]; d += ' L' + last[0] + ' ' + (last[1] + 90);
    base.setAttribute('d', d); walk.setAttribute('d', d);
    len = walk.getTotalLength();
    walk.style.strokeDasharray = len; progress();
  }
  /* the gold trail fills in as you scroll down */
  function progress() {
    if (!len) return;
    if (reduce) { walk.style.strokeDashoffset = 0; return; }
    var r = list.getBoundingClientRect(), vh = innerHeight;
    var p = Math.min(1, Math.max(0, (vh * 0.65 - r.top) / r.height));
    walk.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
  }
  /* hills part as you scroll the hero */
  function parallax() {
    if (reduce) return;
    var y = Math.min(scrollY, hero.offsetHeight);
    ridges.forEach(function (r, i) { r.style.transform = 'translateY(' + (y * (0.12 + i * 0.12)).toFixed(1) + 'px)'; });
  }
  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; navState(); progress(); parallax(); });
  }, { passive: true });
  var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(buildTrail, 150); });
  addEventListener('load', buildTrail);
  [].forEach.call(document.querySelectorAll('.stop img'), function (im) { if (!im.complete) im.addEventListener('load', buildTrail, { once: true }); });

  /* difficulty filter */
  [].forEach.call(document.querySelectorAll('.chip'), function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.f;
      [].forEach.call(document.querySelectorAll('.chip'), function (x) { x.setAttribute('aria-pressed', x === c); });
      stops.forEach(function (s) { s.classList.toggle('hide', f !== 'all' && s.dataset.band !== f); if (f !== 'all') s.classList.add('in'); });
      buildTrail();
    });
  });

  /* reveal each stop as it scrolls in (content stays visible without JS or with reduced motion) */
  if (!reduce && 'IntersectionObserver' in window) {
    var target = location.hash && document.querySelector(location.hash);
    document.documentElement.classList.add('fx');
    if (target && target.classList.contains('stop')) target.classList.add('in');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    stops.forEach(function (s) { if (!s.classList.contains('in')) io.observe(s); });
  }
  buildTrail();
})();
