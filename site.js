/* ============================================================
   Cora marketing site — shared behavior
   - Injects nav + footer (kept consistent across all pages)
   - Cross-page Tweaks (palette / typeface / hero layout) via
     localStorage + the editor host protocol
   - Nav scroll state, mobile menu, FAQ accordion, scroll reveal
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Tweaks: state + persistence ---------- */
  var TWEAK_DEFAULTS = { palette: 'clay', type: 'modern', layout: 'split' };
  var LS_KEY = 'cora_site_tweaks';

  function loadTweaks() {
    var t = {};
    try { t = JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) {}
    return Object.assign({}, TWEAK_DEFAULTS, t);
  }
  var tweaks = loadTweaks();

  function applyTweaks() {
    var r = document.documentElement;
    r.setAttribute('data-palette', tweaks.palette);
    r.setAttribute('data-type', tweaks.type);
    r.setAttribute('data-layout', tweaks.layout);
  }
  applyTweaks(); // apply ASAP (script is in <head> with defer)

  function setTweak(key, val) {
    tweaks[key] = val;
    try { localStorage.setItem(LS_KEY, JSON.stringify(tweaks)); } catch (e) {}
    applyTweaks();
    var edits = {}; edits[key] = val;
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: edits }, '*'); } catch (e) {}
    syncPanel();
  }

  /* ---------- Icons (inline SVG, matched to the app) ---------- */
  var I = {
    leaf: '<path d="M5 19c0-8 5.5-13 14-13 0 8.5-5 14-13 14M5 19c2.5-4.5 6-7.5 10.5-9.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    chevronDown: '<path d="M5 9l7 7 7-7"/>',
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1" fill="currentColor" stroke="none"/>',
    tiktok: '<path d="M14 4c.4 2.6 2 4.2 4.6 4.6v3c-1.7 0-3.3-.5-4.6-1.4V15a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v3.1a2.5 2.5 0 1 0 1.6 2.3V4Z"/>'
  };
  function svg(path, size, stroke) {
    return '<svg width="' + (size || 24) + '" height="' + (size || 24) + '" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="' + (stroke || 2) + '" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }

  /* ---------- Nav + footer markup ---------- */
  var NAV_LINKS = [
    { label: 'Features', href: 'index.html#features' },
    { label: 'How it works', href: 'index.html#how' },
    { label: 'Pricing', href: 'pricing.html' },
    { label: 'About', href: 'about.html' },
    { label: 'FAQ', href: 'faq.html' }
  ];
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  function navHTML() {
    var links = NAV_LINKS.map(function (l) {
      var file = l.href.split('#')[0];
      var active = file === here ? ' class="active"' : '';
      return '<a href="' + l.href + '"' + active + '>' + l.label + '</a>';
    }).join('');
    var mlinks = NAV_LINKS.concat([{ label: 'Contact', href: 'contact.html' }]).map(function (l) {
      return '<a href="' + l.href + '">' + l.label + '</a>';
    }).join('');
    return '' +
      '<nav class="nav" id="siteNav"><div class="wrap nav-inner">' +
        '<a class="brand" href="index.html" aria-label="Cora home">' +
          '<img class="brand-mark" src="assets/icon-180.png" alt="Cora">' +
          '<span class="brand-name">Cora</span>' +
        '</a>' +
        '<div class="nav-links">' + links + '</div>' +
        '<div class="nav-right">' +
          '<a class="appstore" href="#download" aria-label="Download on the App Store">' +
            appleGlyph(20) +
            '<span><span class="as-sub">Download on the</span><br><span class="as-main">App Store</span></span>' +
          '</a>' +
        '</div>' +
        '<button class="nav-toggle" id="navToggle" aria-label="Menu">' + svg(I.menu, 26, 2.2) + '</button>' +
      '</div>' +
      '<div class="wrap"><div class="mobile-menu" id="mobileMenu">' + mlinks +
        '<a class="btn btn-primary" href="#download">Get the app</a>' +
      '</div></div></nav>';
  }

  function appleGlyph(size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M16.4 12.7c0-2.2 1.8-3.2 1.9-3.3-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.5 0-2.8.8-3.6 2.2-1.5 2.7-.4 6.6 1.1 8.8.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7 1.3 0 1.6.7 2.8.7 1.2 0 1.9-1.1 2.6-2.1.8-1.2 1.2-2.3 1.2-2.4-.1 0-2.2-.9-2.9-3.7Z"/>' +
      '<path d="M14.5 6.3c.6-.7 1-1.7.9-2.8-.9 0-1.9.6-2.5 1.3-.6.6-1.1 1.6-1 2.6 1 .1 2-.5 2.6-1.1Z"/></svg>';
  }

  function footerHTML() {
    return '' +
    '<footer class="footer"><div class="wrap">' +
      '<div class="footer-grid">' +
        '<div class="footer-brand-col">' +
          '<a class="brand" href="index.html" aria-label="Cora home">' +
            '<img class="brand-mark" src="assets/icon-180.png" alt="Cora">' +
            '<span class="brand-name">Cora</span></a>' +
          '<p class="footer-brand-copy">The all-in-one PCOS companion — track your cycle, move with your hormones, eat for steadier energy, and see what helps. Built for your body, not for ads.</p>' +
          '<div style="display:flex;gap:10px;margin-top:18px">' +
            '<a href="#" aria-label="Instagram" class="footer-social">' + svg(I.instagram, 20, 1.8) + '</a>' +
            '<a href="#" aria-label="TikTok" class="footer-social">' + svg(I.tiktok, 20, 1.8) + '</a>' +
          '</div>' +
        '</div>' +
        '<div><h4>Product</h4><div class="footer-links">' +
          '<a href="index.html#features">Features</a>' +
          '<a href="index.html#how">How it works</a>' +
          '<a href="pricing.html">Pricing</a>' +
          '<a href="#download">Download</a>' +
        '</div></div>' +
        '<div><h4>Company</h4><div class="footer-links">' +
          '<a href="about.html">About</a>' +
          '<a href="faq.html">FAQ &amp; Support</a>' +
          '<a href="contact.html">Contact</a>' +
        '</div></div>' +
        '<div><h4>Legal</h4><div class="footer-links">' +
          '<a href="privacy.html">Privacy Policy</a>' +
          '<a href="terms.html">Terms &amp; Conditions</a>' +
          '<a href="contact.html">Data requests</a>' +
        '</div></div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<span>© ' + new Date().getFullYear() + ' FunnelStrategist LLC. All rights reserved.</span>' +
        '<span class="disclaimer">Cora is a wellness and tracking tool, not a medical device. It does not provide medical advice, diagnosis or treatment. Always consult a qualified clinician.</span>' +
      '</div>' +
    '</div></footer>';
  }

  /* ---------- Tweaks panel (vanilla, reuses .twk styles) ---------- */
  var TWK_CSS = '' +
    '.twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:264px;' +
      'background:rgba(250,249,247,.82);color:#29261b;-webkit-backdrop-filter:blur(24px) saturate(160%);' +
      'backdrop-filter:blur(24px) saturate(160%);border:.5px solid rgba(255,255,255,.6);border-radius:14px;' +
      'box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);' +
      "font:11.5px/1.4 ui-sans-serif,system-ui,sans-serif;overflow:hidden}" +
    '.twk-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 8px 10px 14px;cursor:move;user-select:none}' +
    '.twk-hd b{font-size:12px;font-weight:600}' +
    '.twk-x{border:0;background:transparent;color:rgba(41,38,27,.55);width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:13px}' +
    '.twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}' +
    '.twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:12px}' +
    '.twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:rgba(41,38,27,.45);padding:8px 0 0}' +
    '.twk-sect:first-child{padding-top:0}' +
    '.twk-lbl{font-weight:500;color:rgba(41,38,27,.72);margin-bottom:6px}' +
    '.twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;background:rgba(0,0,0,.06);user-select:none}' +
    '.twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;background:rgba(255,255,255,.92);' +
      'box-shadow:0 1px 2px rgba(0,0,0,.12);transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}' +
    '.twk-seg button{position:relative;z-index:1;flex:1;border:0;background:transparent;color:inherit;font:inherit;' +
      'font-weight:500;min-height:24px;border-radius:6px;cursor:pointer;padding:4px 6px;text-transform:capitalize}' +
    '.twk-chips{display:flex;gap:6px}' +
    '.twk-chip{position:relative;flex:1;height:44px;border:0;border-radius:8px;overflow:hidden;cursor:pointer;' +
      'box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);transition:transform .12s,box-shadow .12s}' +
    '.twk-chip:hover{transform:translateY(-1px)}' +
    '.twk-chip[data-on="1"]{box-shadow:0 0 0 2px #29261b,0 2px 6px rgba(0,0,0,.15)}' +
    '.twk-chip span{position:absolute;inset:0;display:flex}' +
    '.twk-chip span i{flex:1}' +
    '.twk-chip svg{position:absolute;top:6px;left:50%;transform:translateX(-50%);width:14px;height:14px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}';

  var PALETTE_SWATCHES = {
    clay:  ['#C75D4F', '#6E8C68', '#F4EBE1'],
    blush: ['#C25A6E', '#7E977E', '#F7ECEC'],
    honey: ['#C57A43', '#7C854F', '#F3EEE0']
  };

  var panelEl = null;
  function buildPanel() {
    var style = document.createElement('style'); style.textContent = TWK_CSS;
    document.head.appendChild(style);

    panelEl = document.createElement('div');
    panelEl.className = 'twk-panel'; panelEl.setAttribute('data-omelette-chrome', '');
    panelEl.style.display = 'none';
    panelEl.innerHTML =
      '<div class="twk-hd" id="twkDrag"><b>Tweaks</b><button class="twk-x" id="twkClose" aria-label="Close">✕</button></div>' +
      '<div class="twk-body">' +
        '<div class="twk-sect">Palette</div>' +
        '<div class="twk-chips" id="twkPalette">' +
          paletteChip('clay') + paletteChip('blush') + paletteChip('honey') +
        '</div>' +
        '<div class="twk-sect">Typeface</div>' +
        '<div class="twk-lbl" style="display:none"></div>' +
        seg('twkType', 'type', [['modern', 'Modern'], ['editorial', 'Editorial']]) +
        '<div class="twk-sect">Hero layout</div>' +
        seg('twkLayout', 'layout', [['split', 'Split'], ['centered', 'Centered']]) +
      '</div>';
    document.body.appendChild(panelEl);

    panelEl.querySelector('#twkClose').addEventListener('click', dismiss);
    bindChips();
    bindSeg('twkType', 'type');
    bindSeg('twkLayout', 'layout');
    enableDrag(panelEl.querySelector('#twkDrag'), panelEl);
    syncPanel();
  }

  function paletteChip(name) {
    var c = PALETTE_SWATCHES[name];
    var check = '<svg viewBox="0 0 14 14"><path d="M3 7.2 5.8 10 11 4.2" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return '<button class="twk-chip" data-pal="' + name + '" title="' + name + '">' +
      '<span><i style="background:' + c[0] + '"></i><i style="background:' + c[1] + '"></i><i style="background:' + c[2] + '"></i></span>' +
      check + '</button>';
  }
  function seg(id, key, opts) {
    var btns = opts.map(function (o) { return '<button data-val="' + o[0] + '">' + o[1] + '</button>'; }).join('');
    return '<div class="twk-seg" id="' + id + '" data-key="' + key + '"><div class="twk-seg-thumb"></div>' + btns + '</div>';
  }

  function bindChips() {
    panelEl.querySelectorAll('#twkPalette .twk-chip').forEach(function (b) {
      b.addEventListener('click', function () { setTweak('palette', b.getAttribute('data-pal')); });
    });
  }
  function bindSeg(id, key) {
    var seg = panelEl.querySelector('#' + id);
    seg.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () { setTweak(key, b.getAttribute('data-val')); });
    });
  }

  function syncPanel() {
    if (!panelEl) return;
    panelEl.querySelectorAll('#twkPalette .twk-chip').forEach(function (b) {
      b.setAttribute('data-on', b.getAttribute('data-pal') === tweaks.palette ? '1' : '0');
    });
    ['twkType:type', 'twkLayout:layout'].forEach(function (pair) {
      var p = pair.split(':'), seg = panelEl.querySelector('#' + p[0]);
      if (!seg) return;
      var btns = [].slice.call(seg.querySelectorAll('button'));
      var idx = btns.findIndex(function (b) { return b.getAttribute('data-val') === tweaks[p[1]]; });
      if (idx < 0) idx = 0;
      var thumb = seg.querySelector('.twk-seg-thumb');
      var n = btns.length;
      thumb.style.left = 'calc(2px + ' + idx + ' * (100% - 4px) / ' + n + ')';
      thumb.style.width = 'calc((100% - 4px) / ' + n + ')';
    });
  }

  function enableDrag(handle, panel) {
    handle.addEventListener('mousedown', function (e) {
      if (e.target.closest('.twk-x')) return;
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
  }

  /* ---------- Host protocol ---------- */
  function dismiss() {
    if (panelEl) panelEl.style.display = 'none';
    try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
  }
  window.addEventListener('message', function (e) {
    var t = e && e.data && e.data.type;
    if (t === '__activate_edit_mode') { if (!panelEl) buildPanel(); panelEl.style.display = ''; syncPanel(); }
    else if (t === '__deactivate_edit_mode') { if (panelEl) panelEl.style.display = 'none'; }
  });

  /* ---------- Init on DOM ready ---------- */
  function init() {
    // Inject nav
    var navMount = document.getElementById('nav-mount');
    if (navMount) navMount.innerHTML = navHTML();
    var footMount = document.getElementById('footer-mount');
    if (footMount) footMount.innerHTML = footerHTML();

    // social icon style
    var s = document.createElement('style');
    s.textContent = '.footer-social{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;' +
      'background:var(--surface);border:1px solid var(--line);color:var(--ink-soft);transition:color .15s,border-color .15s}' +
      '.footer-social:hover{color:var(--primary-deep);border-color:var(--primary)}';
    document.head.appendChild(s);

    // Nav scroll state
    var nav = document.getElementById('siteNav');
    function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile menu
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('mobileMenu');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        toggle.innerHTML = svg(open ? I.close : I.menu, 26, 2.2);
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { menu.classList.remove('open'); toggle.innerHTML = svg(I.menu, 26, 2.2); });
      });
    }

    // FAQ accordions
    document.querySelectorAll('.faq-q').forEach(function (q) {
      q.insertAdjacentHTML('beforeend', '<span class="chev">' + svg(I.chevronDown, 22, 2.4) + '</span>');
      q.addEventListener('click', function () {
        var item = q.closest('.faq-item');
        var a = item.querySelector('.faq-a');
        var open = item.classList.toggle('open');
        a.style.maxHeight = open ? a.scrollHeight + 'px' : '0';
      });
    });

    // Scroll reveal
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else { reveals.forEach(function (el) { el.classList.add('in'); }); }

    // Announce tweak availability to host
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Expose icon helper for pages that want it
  window.CoraIcon = svg;
  window.CoraIcons = I;
})();
