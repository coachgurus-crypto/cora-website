/* ============================================================
   Cora — marketing site behavior + vanilla Tweaks
   Theme persists across pages via localStorage.
   ============================================================ */
(function () {
  'use strict';

  // ---- Theme state (shared across pages) ----------------------
  var DEFAULTS = { palette: 'clay', type: 'modern', layout: 'split' };
  var KEY = 'cora_site_tweaks';

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return Object.assign({}, DEFAULTS);
      return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function save(t) { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {} }

  var state = load();

  function apply(t) {
    var el = document.documentElement;
    el.setAttribute('data-palette', t.palette);
    el.setAttribute('data-type', t.type);
    el.setAttribute('data-layout', t.layout);
  }
  apply(state); // applied early via inline head script too; harmless repeat

  // ---- Icons (inline svg) -------------------------------------
  var ICONS = {
    leaf: '<path d="M5 19c0-8 5.5-13 14-13 0 8.5-5 14-13 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19c2.5-4.5 6-7.5 10.5-9.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    close: '<path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    chevronDown: '<path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  // ---- Nav: scroll shadow + mobile menu -----------------------
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.innerHTML = '<svg viewBox="0 0 24 24">' + (open ? ICONS.close : ICONS.menu) + '</svg>';
    });
  }

  // ---- FAQ accordion ------------------------------------------
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    });
  });

  // ---- Pricing toggle (monthly / annual) ----------------------
  var priceToggle = document.querySelector('.price-toggle');
  if (priceToggle) {
    priceToggle.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var mode = btn.getAttribute('data-mode');
      priceToggle.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b === btn); });
      document.querySelectorAll('[data-price]').forEach(function (el) {
        el.textContent = el.getAttribute('data-price-' + mode);
      });
      document.querySelectorAll('[data-per]').forEach(function (el) {
        el.textContent = el.getAttribute('data-per-' + mode);
      });
      document.querySelectorAll('[data-note]').forEach(function (el) {
        el.textContent = el.getAttribute('data-note-' + mode) || '';
      });
    });
  }

  // ---- Reveal on scroll ---------------------------------------
  var revs = document.querySelectorAll('.reveal');
  if (revs.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      revs.forEach(function (r) { io.observe(r); });
    } else { revs.forEach(function (r) { r.classList.add('in'); }); }
  }

  // ---- Legal TOC scrollspy ------------------------------------
  var tocLinks = document.querySelectorAll('.legal-toc a');
  if (tocLinks.length) {
    var sections = [];
    tocLinks.forEach(function (l) {
      var id = l.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) sections.push({ link: l, sec: sec });
    });
    var spy = function () {
      var y = window.scrollY + 120;
      var current = sections[0];
      sections.forEach(function (s) { if (s.sec.offsetTop <= y) current = s; });
      tocLinks.forEach(function (l) { l.classList.remove('active'); });
      if (current) current.link.classList.add('active');
    };
    spy();
    window.addEventListener('scroll', spy, { passive: true });
  }

  // ---- Contact form (front-end only) --------------------------
  var cform = document.querySelector('#contact-form');
  if (cform) {
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = cform.querySelector('.form-ok');
      cform.querySelectorAll('input,textarea,select,button').forEach(function (el) { el.disabled = true; });
      if (ok) ok.style.display = 'flex';
    });
  }

  // ============================================================
  //  Vanilla Tweaks panel (host protocol)
  // ============================================================
  var PANEL_CSS =
    '.ctwk{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:260px;' +
    'background:rgba(255,252,249,.82);color:#3A2C2A;-webkit-backdrop-filter:blur(22px) saturate(150%);' +
    'backdrop-filter:blur(22px) saturate(150%);border:.5px solid rgba(255,255,255,.6);border-radius:16px;' +
    'box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 14px 44px rgba(58,44,42,.22);' +
    "font:12px/1.4 'Hanken Grotesk',system-ui,sans-serif;overflow:hidden;display:none}" +
    '.ctwk.show{display:block}' +
    '.ctwk-hd{display:flex;align-items:center;justify-content:space-between;padding:12px 10px 12px 16px;cursor:move;user-select:none}' +
    ".ctwk-hd b{font-family:'Bricolage Grotesque',system-ui,sans-serif;font-size:13.5px;font-weight:800;letter-spacing:-.01em}" +
    '.ctwk-x{border:0;background:transparent;color:rgba(58,44,42,.5);width:24px;height:24px;border-radius:7px;cursor:pointer;font-size:14px}' +
    '.ctwk-x:hover{background:rgba(0,0,0,.06);color:#3A2C2A}' +
    '.ctwk-bd{padding:2px 16px 16px;display:flex;flex-direction:column;gap:14px}' +
    '.ctwk-sect{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(58,44,42,.45)}' +
    '.ctwk-row{display:flex;flex-direction:column;gap:7px}' +
    '.ctwk-seg{display:flex;padding:3px;border-radius:10px;background:rgba(58,44,42,.07);gap:3px}' +
    '.ctwk-seg button{flex:1;border:0;background:transparent;color:rgba(58,44,42,.62);font:inherit;font-weight:700;' +
    'padding:7px 4px;border-radius:8px;cursor:pointer;transition:all .15s}' +
    '.ctwk-seg button.on{background:#FFFCF9;color:#3A2C2A;box-shadow:0 2px 6px -3px rgba(58,44,42,.4)}' +
    '.ctwk-chips{display:flex;gap:8px}' +
    '.ctwk-chip{flex:1;height:44px;border-radius:11px;border:2px solid transparent;cursor:pointer;position:relative;' +
    'overflow:hidden;padding:0;box-shadow:0 0 0 1px rgba(0,0,0,.06)}' +
    '.ctwk-chip.on{border-color:#3A2C2A}' +
    '.ctwk-chip span{position:absolute;left:0;right:0;bottom:0;font-size:9.5px;font-weight:800;letter-spacing:.04em;' +
    'text-transform:uppercase;color:#fff;background:rgba(0,0,0,.22);padding:2px 0;text-align:center}';

  var PALETTE_SWATCH = {
    clay: ['#C75D4F', '#F4EBE1', '#6E8C68'],
    blush: ['#C25A6E', '#F7ECEC', '#7E977E'],
    honey: ['#C57A43', '#F3EEE0', '#7C854F']
  };

  function buildPanel() {
    var style = document.createElement('style');
    style.textContent = PANEL_CSS;
    document.head.appendChild(style);

    var panel = document.createElement('div');
    panel.className = 'ctwk';
    panel.setAttribute('data-omelette-chrome', '');

    var paletteChips = Object.keys(PALETTE_SWATCH).map(function (p) {
      var c = PALETTE_SWATCH[p];
      var grad = 'linear-gradient(135deg,' + c[0] + ' 0 60%,' + c[2] + ' 60%)';
      var label = p === 'clay' ? 'Clay' : p === 'blush' ? 'Rose' : 'Honey';
      return '<button class="ctwk-chip" data-tw="palette" data-val="' + p + '" style="background:' + grad + '">' +
        '<span>' + label + '</span></button>';
    }).join('');

    panel.innerHTML =
      '<div class="ctwk-hd"><b>Tweaks</b><button class="ctwk-x" aria-label="Close">&#10005;</button></div>' +
      '<div class="ctwk-bd">' +
        '<div class="ctwk-sect">Palette</div>' +
        '<div class="ctwk-chips" data-group="palette">' + paletteChips + '</div>' +
        '<div class="ctwk-sect">Typeface</div>' +
        '<div class="ctwk-row"><div class="ctwk-seg" data-group="type">' +
          '<button data-tw="type" data-val="modern">Modern</button>' +
          '<button data-tw="type" data-val="editorial">Editorial</button>' +
        '</div></div>' +
        '<div class="ctwk-sect">Hero layout</div>' +
        '<div class="ctwk-row"><div class="ctwk-seg" data-group="layout">' +
          '<button data-tw="layout" data-val="split">Split</button>' +
          '<button data-tw="layout" data-val="centered">Centered</button>' +
        '</div></div>' +
      '</div>';
    document.body.appendChild(panel);

    function sync() {
      panel.querySelectorAll('[data-tw]').forEach(function (b) {
        b.classList.toggle('on', state[b.getAttribute('data-tw')] === b.getAttribute('data-val'));
      });
    }
    sync();

    panel.addEventListener('click', function (e) {
      var x = e.target.closest('.ctwk-x');
      if (x) { dismiss(); return; }
      var b = e.target.closest('[data-tw]');
      if (!b) return;
      var key = b.getAttribute('data-tw'), val = b.getAttribute('data-val');
      state[key] = val;
      save(state); apply(state); sync();
      try {
        var edits = {}; edits[key] = val;
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: edits }, '*');
      } catch (err) {}
    });

    // drag
    var hd = panel.querySelector('.ctwk-hd');
    hd.addEventListener('mousedown', function (e) {
      if (e.target.closest('.ctwk-x')) return;
      var r = panel.getBoundingClientRect();
      var sx = e.clientX, sy = e.clientY;
      var sr = window.innerWidth - r.right, sb = window.innerHeight - r.bottom;
      function mv(ev) {
        panel.style.right = Math.max(8, sr - (ev.clientX - sx)) + 'px';
        panel.style.bottom = Math.max(8, sb - (ev.clientY - sy)) + 'px';
      }
      function up() { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); }
      window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    });

    function open() { panel.classList.add('show'); }
    function close() { panel.classList.remove('show'); }
    function dismiss() { close(); try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {} }

    window.addEventListener('message', function (e) {
      var t = e && e.data && e.data.type;
      if (t === '__activate_edit_mode') open();
      else if (t === '__deactivate_edit_mode') close();
    });
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPanel);
  } else { buildPanel(); }
})();
