/* ShineUP – banner de consimtamant cookies (cod propriu, fara platforme externe).
   - alegerea se salveaza in localStorage, cheia "shineup_consent", valabila 6 luni;
   - Google: Consent Mode v2 (valorile implicite "denied" sunt setate inline, in <head>);
   - Meta Pixel: fbevents.js + fbq('init') se incarca DOAR dupa acordul pentru Marketing. */
(function () {
  'use strict';

  var KEY = 'shineup_consent';
  var PIXEL_ID = window.SHINEUP_META_PIXEL || '968970295763841';
  var POLICY_URL = '/politica-cookies';

  function gtag() { (window.dataLayer = window.dataLayer || []).push(arguments); }

  /* ---------- citire / salvare ---------- */
  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!c || !c.date) return null;
      var exp = new Date(c.date);
      exp.setMonth(exp.getMonth() + 6);
      if (isNaN(exp.getTime()) || Date.now() > exp.getTime()) {
        localStorage.removeItem(KEY);
        return null;
      }
      return { analytics: !!c.analytics, marketing: !!c.marketing, date: c.date };
    } catch (e) { return null; }
  }

  function save(analytics, marketing) {
    var c = { analytics: !!analytics, marketing: !!marketing, date: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    return c;
  }

  /* ---------- cookies: stergere la retragerea acordului ---------- */
  function deleteCookies(pattern) {
    var host = location.hostname;
    var parts = host.split('.');
    var domains = ['', host, '.' + host];
    if (parts.length > 2) domains.push('.' + parts.slice(-2).join('.'));
    document.cookie.split(';').forEach(function (pair) {
      var name = pair.split('=')[0].trim();
      if (!name || !pattern.test(name)) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  /* ---------- Meta Pixel ---------- */
  var pixelStarted = false;
  function loadPixel() {
    if (pixelStarted) { try { window.fbq('consent', 'grant'); } catch (e) {} return; }
    pixelStarted = true;
    var n = window.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
    var inject = function () {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(s);
    };
    if (typeof window.shineupWhenIdle === 'function') window.shineupWhenIdle(inject); else inject();
  }
  function revokePixel() {
    if (pixelStarted) { try { window.fbq('consent', 'revoke'); } catch (e) {} }
  }

  /* ---------- aplicarea alegerii ---------- */
  function apply(c, isChange) {
    if (isChange) {
      gtag('consent', 'update', {
        analytics_storage: c.analytics ? 'granted' : 'denied',
        ad_storage: c.marketing ? 'granted' : 'denied',
        ad_user_data: c.marketing ? 'granted' : 'denied',
        ad_personalization: c.marketing ? 'granted' : 'denied'
      });
      if (!c.analytics) deleteCookies(/^_ga/);
      if (!c.marketing) deleteCookies(/^(_gcl_|_fbp$|_fbc$)/);
    }
    if (c.marketing) loadPixel(); else revokePixel();
  }

  /* ---------- interfata ---------- */
  var CSS = '' +
    '.ck{position:fixed;left:0;right:0;bottom:var(--mbar-h,0px);z-index:130;background:#0F172A;color:#fff;' +
      'border-top:1px solid rgba(255,255,255,.16);box-shadow:0 -12px 32px rgba(15,23,42,.28);' +
      'font-family:Manrope,-apple-system,BlinkMacSystemFont,sans-serif;font-size:15px;line-height:1.5}' +
    '.ck[hidden]{display:none}' +
    '.ck-in{max-width:1280px;margin:0 auto;padding:16px clamp(16px,4vw,56px);display:flex;align-items:center;gap:16px 28px;flex-wrap:wrap}' +
    '.ck-main{flex:1 1 420px;min-width:0}' +
    '.ck-text{margin:0;color:rgba(255,255,255,.92)}' +
    '.ck-text a{color:#67E8F9;font-weight:700;text-decoration:underline;text-underline-offset:3px}' +
    '.ck-opts{margin:12px 0 0;display:grid;gap:8px;max-width:520px}' +
    '.ck-opts[hidden]{display:none}' +
    '.ck-opt{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:48px;padding:6px 14px;' +
      'border:1px solid rgba(255,255,255,.2);border-radius:12px;font-weight:700;cursor:pointer}' +
    '.ck-opt.ck-fixed{cursor:default}' +
    '.ck-always{font-weight:600;font-size:14px;color:#A5F3FC}' +
    '.ck-opt input{position:absolute;opacity:0;width:1px;height:1px}' +
    '.ck-sw{flex-shrink:0;position:relative;width:48px;height:28px;border-radius:999px;background:#64748B;transition:background .2s}' +
    '.ck-sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:transform .2s}' +
    '.ck-opt input:checked+.ck-sw{background:#06B6D4}' +
    '.ck-opt input:checked+.ck-sw::after{transform:translateX(20px)}' +
    '.ck-opt input:focus-visible+.ck-sw{outline:2px solid #67E8F9;outline-offset:2px}' +
    '.ck-btns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;flex:0 1 440px;min-width:min(100%,300px)}' +
    '.ck-btn{min-height:48px;padding:10px 12px;border-radius:12px;border:2px solid #fff;background:#fff;color:#0F172A;' +
      'font:inherit;font-weight:800;font-size:15px;line-height:1.15;cursor:pointer;transition:background .15s,border-color .15s}' +
    '.ck-btn:hover{background:#CFFAFE;border-color:#CFFAFE}' +
    '.ck-btn:focus-visible{outline:2px solid #67E8F9;outline-offset:2px}' +
    '.ck-btn[hidden]{display:none}' +
    '@media (max-width:767px){.ck{font-size:14px}.ck-in{padding:12px 16px;gap:10px}.ck-main{flex-basis:100%}' +
      '.ck-btns{flex-basis:100%}.ck-btn{font-size:14px;padding:8px 2px;white-space:nowrap}}' +
    '@media (prefers-reduced-motion:reduce){.ck-sw,.ck-sw::after,.ck-btn{transition:none}}';

  var root, optsEl, chkA, chkM, btnSettings, btnSave;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k]; else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (ch) { node.appendChild(ch); });
    return node;
  }

  function toggleRow(label, id) {
    var input = el('input', { type: 'checkbox', id: id, role: 'switch' });
    var row = el('label', { 'class': 'ck-opt', 'for': id }, [
      el('span', { text: label }), input, el('span', { 'class': 'ck-sw', 'aria-hidden': 'true' })
    ]);
    return { row: row, input: input };
  }

  function build() {
    if (root) return;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var text = el('p', { 'class': 'ck-text' });
    text.appendChild(document.createTextNode('Folosim cookies necesare pentru funcționarea site-ului și, doar cu acordul tău, cookies pentru statistici (Google Analytics) și marketing (Google Ads, Meta). Detalii în '));
    text.appendChild(el('a', { href: POLICY_URL, text: 'Politica de cookies' }));
    text.appendChild(document.createTextNode('.'));

    var a = toggleRow('Statistici', 'ck-analytics');
    var m = toggleRow('Marketing', 'ck-marketing');
    chkA = a.input; chkM = m.input;
    optsEl = el('div', { 'class': 'ck-opts', hidden: '' }, [
      el('div', { 'class': 'ck-opt ck-fixed' }, [
        el('span', { text: 'Necesare' }), el('span', { 'class': 'ck-always', text: 'mereu active' })
      ]),
      a.row, m.row
    ]);

    var btnAccept = el('button', { type: 'button', 'class': 'ck-btn', text: 'Accept toate' });
    var btnReject = el('button', { type: 'button', 'class': 'ck-btn', text: 'Refuz' });
    btnSettings = el('button', { type: 'button', 'class': 'ck-btn', text: 'Setări', 'aria-expanded': 'false' });
    btnSave = el('button', { type: 'button', 'class': 'ck-btn', text: 'Salvează', hidden: '' });

    btnAccept.addEventListener('click', function () { choose(true, true); });
    btnReject.addEventListener('click', function () { choose(false, false); });
    btnSettings.addEventListener('click', function () { showSettings(true); });
    btnSave.addEventListener('click', function () { choose(chkA.checked, chkM.checked); });

    root = el('div', { 'class': 'ck', role: 'region', 'aria-label': 'Cookies', hidden: '' }, [
      el('div', { 'class': 'ck-in' }, [
        el('div', { 'class': 'ck-main' }, [text, optsEl]),
        el('div', { 'class': 'ck-btns' }, [btnAccept, btnReject, btnSettings, btnSave])
      ])
    ]);
    document.body.appendChild(root);
  }

  function showSettings(on) {
    optsEl.hidden = !on;
    btnSettings.hidden = on;
    btnSave.hidden = !on;
    btnSettings.setAttribute('aria-expanded', on ? 'true' : 'false');
  }

  function open(withSettings) {
    build();
    var c = read();
    chkA.checked = !!(c && c.analytics);   // implicit OPRIT
    chkM.checked = !!(c && c.marketing);   // implicit OPRIT
    showSettings(!!withSettings);
    root.hidden = false;
  }

  function close() { if (root) root.hidden = true; }

  function choose(analytics, marketing) {
    apply(save(analytics, marketing), true);
    close();
  }

  /* ---------- pornire ---------- */
  function start() {
    var c = read();
    // Cookie-urile ramase de la vizite mai vechi (dinainte de banner) se sterg daca nu exista acord pentru ele.
    if (!c || !c.analytics) deleteCookies(/^_ga/);
    if (!c || !c.marketing) deleteCookies(/^(_gcl_|_fbp$|_fbc$)/);
    if (c) apply(c, false);   // Consent Mode a fost deja actualizat inline, in <head>
    else open(false);

    // „Setări cookies” din subsol redeschide panoul.
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
      if (!t) return;
      e.preventDefault();
      open(true);
    });
  }

  window.shineupCookieSettings = function () { open(true); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
