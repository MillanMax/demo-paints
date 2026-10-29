/* ==========================================================================
   DEMO PAINTS — main.js
   Core: config, helpers, can mock-ups, header/footer injection, modals,
   drawer, toasts, search, sliders, reveal animations, shared quote form.
   Page-specific rendering lives in pages.js (PAGES registry).
   ========================================================================== */

/* ---- CONFIG (edit these) -------------------------------------------------- */
const QUOTE_ENDPOINT  = "";               // e.g. "https://formspree.io/f/xxxxxxx" — leave empty for mailto + WhatsApp fallback
const WHATSAPP_NUMBER = "256700000000";   // international format, no "+" or spaces
const CONFIG = {
  vatEnabled: true, vatRate: 0.18,
  deliveryFlat: 25000, freeDeliveryOver: 500000,
  promoCodes: { DEMO10: 0.10 },
  email: "sales@demopaints.example", phone: "+256 700 000 000",
  address: "Plot 00, Industrial Area, Kampala, Uganda"
};

/* ---- Helpers --------------------------------------------------------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const fmt = n => "UGX " + Math.round(n).toLocaleString("en-US");
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const findProduct = id => PRODUCTS.find(p => p.id === id);
const catName = id => (CATEGORIES.find(c => c.id === id) || {}).name || id;
const fromPrice = p => Math.min(...p.sizes.map(s => s.price));
const PAGES = {};                         // pages.js registers renderers here
const page = () => document.body.dataset.page || "";
function lum(hex){ const n = parseInt(hex.slice(1), 16); return (0.299*(n>>16) + 0.587*((n>>8)&255) + 0.114*(n&255)) / 255; }
function hexToRgb(hex){ const n = parseInt(hex.slice(1), 16); return [n>>16, (n>>8)&255, n&255]; }
function stars(r, num = true){
  const f = Math.round(r), s = on => `<svg class="st${on ? "" : " off"}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l3 6.3 6.9.9-5 4.8 1.3 6.9L12 18.1l-6.2 3.3 1.3-6.9-5-4.8 6.9-.9z"/></svg>`;
  return `<span class="stars" role="img" aria-label="Rated ${r} out of 5">${s(1).repeat(f)}${s(0).repeat(5 - f)}${num ? `<small>${r.toFixed(1)}</small>` : ""}</span>`;
}
const safeGet = (k, d = "") => { try { return localStorage.getItem(k) ?? d; } catch(e){ return d; } };
const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch(e){} };

/* ---- Colour helpers ---------------------------------------------------------- */
function colourObj(hex){ return COLOURS.find(c => c.hex.toLowerCase() === String(hex).toLowerCase()) || { name: hex, hex }; }
function colourOptions(p){
  if (Array.isArray(p.colours)) return p.colours.map(colourObj);
  if (/^tintable/i.test(p.colours)) return ["#FFFFFF","#F3E9D2","#E8EEEA","#F7A9A0","#E4312B","#F6B21A","#7BAE4B","#1FA19A","#2B6CB0","#C9B8E6","#A87843","#6E7378","#2E3238"].map(colourObj);
  return [{ name: p.colours, hex: p.canColour }];
}
const defaultColour = p => colourOptions(p)[0];

/* ---- SVG: logo, can mock-up, icons ------------------------------------------ */
function logoSVG(white){
  const text = white ? "#fff" : "currentColor";
  return `<svg viewBox="0 0 225 50" role="img" aria-label="Demo Paints — Colour That Lasts"><title>Demo Paints</title>
  <path d="M22 3C22 3 5 22 5 32a17 17 0 0 0 34 0C39 22 22 3 22 3z" fill="#E4312B"/>
  <path d="M22 3c0 0 17 19 17 29a17 17 0 0 1-17 17z" fill="#1B3A6B"/>
  <path d="M12 33a10 10 0 0 0 10 10V27z" fill="#F6B21A"/>
  <text x="49" y="31" font-family="Outfit,system-ui,sans-serif" font-size="25" fill="${text}"><tspan font-weight="800">DEMO</tspan><tspan font-weight="300" dx="5">PAINTS</tspan></text>
  <text x="50" y="44" font-family="Inter,system-ui,sans-serif" font-size="8" letter-spacing="2.6" fill="${white ? "#F6B21A" : "#E4312B"}" font-weight="600">COLOUR THAT LASTS</text></svg>`;
}
function canSVG(color = "#E4312B", label = "DEMO"){
  const txt = lum(color) > .62 ? "#16181D" : "#FFFFFF";
  return `<svg class="can" viewBox="0 0 120 140" aria-hidden="true" focusable="false">
  <ellipse cx="60" cy="130" rx="46" ry="7" fill="rgba(0,0,0,.16)"/>
  <path d="M16 36h88v88c0 6-20 9-44 9s-44-3-44-9z" fill="#D5D9DF"/>
  <path d="M16 36h22v97c-14-1-22-4-22-9z" fill="#fff" opacity=".35"/>
  <path d="M16 56h88v56c0 6-20 9-44 9s-44-3-44-9z" fill="${color}" stroke="rgba(0,0,0,.12)"/>
  <ellipse cx="60" cy="36" rx="44" ry="10" fill="#EEF0F3"/><ellipse cx="60" cy="36" rx="36" ry="7" fill="${color}"/>
  <path d="M20 40C24 8 96 8 100 40" fill="none" stroke="#9AA1AB" stroke-width="3" stroke-linecap="round"/>
  <path d="M60 66c-7 8-11 13-11 18a11 11 0 0 0 22 0c0-5-4-10-11-18z" fill="${txt}" opacity=".92"/>
  <text x="60" y="108" text-anchor="middle" font-family="Outfit,system-ui,sans-serif" font-weight="800" font-size="12" letter-spacing="1" fill="${txt}">${esc(label)}</text></svg>`;
}
const ICON = {
  search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.500-3.500"/></svg>`,
  cart:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2l2.500 11h11l2-8H6.200"/><circle cx="9" cy="20" r="1.500"/><circle cx="17" cy="20" r="1.500"/></svg>`,
  menu:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
  wa:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.500 3.500A11 11 0 0 0 3.300 17.200L2 22l4.900-1.300A11 11 0 1 0 20.500 3.500zM12 20.200a9 9 0 0 1-4.600-1.300l-.3-.2-2.900.8.8-2.800-.2-.3a9 9 0 1 1 7.200 3.800zm5-6.700c-.3-.1-1.600-.8-1.900-.9s-.4-.1-.6.100-.7.900-.9 1.100-.3.200-.6.100a7.400 7.400 0 0 1-3.700-3.200c-.3-.5.300-.5.800-1.500.1-.2 0-.3 0-.5l-.9-2c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.300 3 3 0 0 0-.9 2.200 5.100 5.100 0 0 0 1.100 2.800 11.700 11.700 0 0 0 4.500 3.900c1.700.7 2.300.8 3.200.7a2.700 2.700 0 0 0 1.800-1.300 2.200 2.200 0 0 0 .2-1.300c-.1-.1-.2-.2-.5-.3z"/></svg>`,
  emptyCart:`<svg viewBox="0 0 160 130" aria-hidden="true"><ellipse cx="80" cy="118" rx="55" ry="8" fill="rgba(0,0,0,.08)"/><path d="M28 36h104l-12 56H44z" fill="#F6B21A"/><path d="M14 18h16l6 18" fill="none" stroke="#1B3A6B" stroke-width="6" stroke-linecap="round"/><circle cx="56" cy="104" r="9" fill="#1B3A6B"/><circle cx="108" cy="104" r="9" fill="#1B3A6B"/><path d="M60 62c-8 10-12 15-12 21a12 12 0 0 0 24 0c0-6-4-11-12-21z" fill="#E4312B"/></svg>`
};
/* ---- Icon set (Lucide-style 24px strokes, inline so they inherit colour) ---- */
const ICON_PATHS = {
  sofa:"M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3M3 14a2 2 0 0 1 4 0v1h10v-1a2 2 0 0 1 4 0v4H3zM6 18v2M18 18v2",
  building:"M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M3 21h18M8 8h2M8 12h2M8 16h2",
  tree:"M12 22v-5M12 17H7l5-6H8l4-6 4 6h-4l5 6z",
  roof:"M3 13 12 5l9 8M3 18l9-8 9 8M2 21h20",
  layers:"M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  car:"M5 17h14M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v4H3zM7 17v2M17 17v2M7 13h.01M17 13h.01",
  factory:"M2 21h20M4 21V10l6 4v-4l6 4V4h4v17M8 17h2M14 17h2",
  sparkles:"M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 3v4M17 5h4M5 17v4M3 19h4",
  phone:"M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
  mail:"M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-10 6L2 7",
  pin:"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  clock:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  palette:"M12 22a10 10 0 1 1 10-10c0 3-2 4-4 4h-2a2 2 0 0 0-1 3.7c.7.6.3 2.3-3 2.3zM7.5 11.5h.01M10.5 7.5h.01M15.5 8h.01",
  calculator:"M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01M16 18h.01",
  droplets:"M12 2.7S5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.7 12 2.7z",
  shield:"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4",
  leaf:"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10zM2 21c0-3 1.9-5.5 6-8",
  sun:"M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  users:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  target:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  eye:"M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  medal:"M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 14l-1.7 8 5.5-3 5.5 3-1.7-8",
  recycle:"M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M3 21v-5h5",
  badge:"M3.9 12a4 4 0 0 1 2.3-3.6 4 4 0 0 1 4.8-4.8 4 4 0 0 1 6 0 4 4 0 0 1 4.8 4.8 4 4 0 0 1 0 7.2 4 4 0 0 1-4.8 4.8 4 4 0 0 1-6 0 4 4 0 0 1-4.8-4.8A4 4 0 0 1 3.9 12zM9 12l2 2 4-4",
  check:"M20 6 9 17l-5-5",
  alert:"M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01",
  "arrow-right":"M5 12h14M12 5l7 7-7 7", "arrow-left":"M19 12H5M12 19l-7-7 7-7", "arrow-up":"M12 19V5M5 12l7-7 7 7",
  "chevron-down":"m6 9 6 6 6-6", "chevron-left":"m15 18-6-6 6-6", "chevron-right":"m9 18 6-6-6-6", x:"M18 6 6 18M6 6l12 12",
  grid:"M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z", list:"M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  download:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  truck:"M1 3h15v13H1zM16 8h4l3 3v5h-7zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  card:"M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM1 10h22",
  smartphone:"M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01"
};
const ico = (n, cls = "") => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${ICON_PATHS[n] || ""}"/></svg>`;
function hydrateIcons(root = document){ $$("i[data-ic]", root).forEach(i => { i.outerHTML = ico(i.dataset.ic); }); }

const waLink = text => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

/* ---- Product card ------------------------------------------------------------- */
function cardHTML(p){
  return `<article class="pcard reveal">
    ${p.badge ? `<span class="badge ${esc(p.badge.replace(/\s/g,""))}">${esc(p.badge)}</span>` : ""}
    <a class="pimg" href="product.html?id=${p.id}" aria-label="${esc(p.name)}">${canSVG(p.canColour)}</a>
    <button class="quickbtn" data-quick="${p.id}" type="button" aria-label="Quick view ${esc(p.name)}">Quick view</button>
    <div class="pbody">
      <span class="meta">${esc(p.subcategory)} · ${esc(p.finish)}</span>
      <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
      ${stars(p.rating)}
      <div class="price">from ${fmt(fromPrice(p))}</div>
      <div class="acts">
        <button class="btn btn-primary btn-sm" data-add="${p.id}" type="button">Add to Cart</button>
        <button class="btn btn-outline btn-sm" data-quote="${p.id}" type="button">Get Quote</button>
      </div>
    </div></article>`;
}

/* ---- Toasts ----------------------------------------------------------------------- */
function toast(msg, link){
  let box = $(".toasts"); if (!box){ box = document.createElement("div"); box.className = "toasts"; box.setAttribute("role","status"); box.setAttribute("aria-live","polite"); document.body.appendChild(box); }
  const t = document.createElement("div"); t.className = "toast";
  t.innerHTML = `<span class="t-ic">${ico(/invalid|please/i.test(msg) ? "alert" : "check")}</span><span>${esc(msg)}</span>${link ? `<a href="${link.href}"${link.act ? ` data-act="${link.act}"` : ""}>${esc(link.text)}</a>` : ""}`;
  box.appendChild(t); setTimeout(() => t.remove(), 3600);
}

/* ---- Modal manager (focus trap, Esc, overlay click) ---------------------------- */
const modalStack = [];
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function trapFocus(container, e){
  const f = $$(FOCUSABLE, container).filter(x => x.offsetParent !== null);
  if (!f.length){ e.preventDefault(); return; }
  const first = f[0], last = f[f.length-1];
  if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
}
function openModal(html, { cls = "", label = "Dialog" } = {}){
  const prev = document.activeElement;
  const ov = document.createElement("div"); ov.className = "modal-overlay";
  ov.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1"><button class="modal-close" type="button" aria-label="Close dialog">${ico("x")}</button>${html}</div>`;
  document.body.appendChild(ov); document.body.style.overflow = "hidden";
  const modal = $(".modal", ov);
  const api = { el: modal, close(){
    ov.remove(); modalStack.splice(modalStack.indexOf(api), 1);
    if (!modalStack.length) document.body.style.overflow = "";
    if (prev && prev.focus) prev.focus();
  }};
  $(".modal-close", ov).addEventListener("click", api.close);
  ov.addEventListener("mousedown", e => { if (e.target === ov) api.close(); });
  modalStack.push(api); modal.focus();
  return api;
}

/* ---- Drawer (mini cart), mobile menu, search overlay ------------------------- */
function setOpen(el, on){ el.classList.toggle("open", on); el.setAttribute("aria-hidden", on ? "false" : "true"); }
function openDrawer(){ renderMiniCart(); setOpen($(".drawer"), true); setOpen($(".drawer-overlay"), true); document.body.style.overflow = "hidden"; $(".drawer .modal-close, .drawer button").focus(); }
function closeDrawer(){ setOpen($(".drawer"), false); setOpen($(".drawer-overlay"), false); if (!modalStack.length) document.body.style.overflow = ""; }
function openMobile(){ setOpen($(".mobile-menu"), true); document.body.style.overflow = "hidden"; $(".mobile-menu .mm-close").focus(); }
function closeMobile(){ setOpen($(".mobile-menu"), false); if (!modalStack.length) document.body.style.overflow = ""; }
function openSearch(){ setOpen($(".search-overlay"), true); const i = $("#site-search"); i.value = ""; $(".search-results").innerHTML = ""; i.focus(); }
function closeSearch(){ setOpen($(".search-overlay"), false); }

function renderMiniCart(){
  const items = Cart.getItems(), body = $(".drawer .d-body"), foot = $(".drawer footer");
  if (!items.length){
    body.innerHTML = `<div class="empty">${ICON.emptyCart}<p>Your cart is empty.</p><a class="btn btn-primary" href="products.html">Shop Products</a></div>`;
    foot.hidden = true; return;
  }
  foot.hidden = false;
  body.innerHTML = items.map(i => `<div class="mini-line"><div class="thumb">${canSVG(i.colour.hex)}</div>
    <div><strong>${esc(i.name)}</strong><small>${esc(i.size)} · ${esc(i.colour.name)}</small>
    <div class="stepper" style="margin-top:6px"><button type="button" data-qty="${esc(i.key)}" data-d="-1" aria-label="Decrease quantity">−</button><input value="${i.qty}" readonly aria-label="Quantity"><button type="button" data-qty="${esc(i.key)}" data-d="1" aria-label="Increase quantity">+</button></div></div>
    <div style="text-align:right"><strong>${fmt(i.price*i.qty)}</strong><br><button class="rm" type="button" data-rm="${esc(i.key)}">Remove</button></div></div>`).join("");
  $(".mc-sub").textContent = fmt(Cart.getTotals().subtotal);
}

/* ---- Header / footer ------------------------------------------------------------------ */
function megaHTML(){
  return CATEGORIES.map(c => {
    const subs = [...new Set(PRODUCTS.filter(p => p.category === c.id).map(p => p.subcategory))].slice(0,4);
    return `<div><h4><span class="m-ic">${ico(c.icon)}</span><a href="products.html?cat=${c.id}">${esc(c.name)}</a></h4><ul>
      ${subs.map(s => `<li><a href="products.html?cat=${c.id}&q=${encodeURIComponent(s)}">${esc(s)}</a></li>`).join("")}
      <li><a href="products.html?cat=${c.id}"><strong>View all</strong></a></li></ul></div>`;
  }).join("");
}
function buildHeader(){
  const file = location.pathname.split("/").pop() || "index.html";
  const cur = f => file === f ? ' aria-current="page"' : "";
  const curP = (file === "products.html" || file === "product.html") ? ' aria-current="page"' : "";
  return `<a class="skip" href="#main">Skip to content</a>
  <div class="topbar"><div class="container"><div><a href="tel:${CONFIG.phone.replace(/\s/g,"")}">${ico("phone")}${CONFIG.phone}</a><a href="mailto:${CONFIG.email}">${ico("mail")}${CONFIG.email}</a></div>
    <div class="tb-right"><a href="stores.html">Find a Store</a><a href="contact.html?subject=dealer">Become a Dealer</a></div></div></div>
  <header class="site-header"><div class="container">
    <a class="logo" href="index.html" aria-label="Demo Paints home">${logoSVG(false)}</a>
    <nav class="nav" aria-label="Main">
      <div class="has-mega"><div class="nav-products"><a href="products.html"${curP}>Products</a><button type="button" class="mega-toggle" aria-haspopup="true" aria-expanded="false" aria-label="Show product categories">${ico("chevron-down")}</button></div>
        <div class="mega"><div class="container"><div class="mega-grid">${megaHTML()}</div><div class="mega-foot"><span>${PRODUCTS.length} products across ${CATEGORIES.length} categories</span><a href="products.html">Browse all products ${ico("arrow-right")}</a></div></div></div></div>
      <a href="colours.html"${cur("colours.html")}>Colours</a><a href="visualizer.html"${cur("visualizer.html")}>Visualizer</a>
      <a href="calculator.html"${cur("calculator.html")}>Calculator</a><a href="stores.html"${cur("stores.html")}>Stores</a>
      <a href="about.html"${cur("about.html")}>About</a><a href="contact.html"${cur("contact.html")}>Contact</a></nav>
    <div class="head-actions">
      <button class="icon-btn" type="button" data-open-search aria-label="Search products">${ICON.search}</button>
      <button class="icon-btn" type="button" data-open-cart aria-label="Open cart">${ICON.cart}<span class="cart-badge" data-n="0" aria-live="polite"></span></button>
      <button class="btn btn-accent btn-sm btn-quote" type="button" data-open-quote>Get a Quote</button>
      <button class="icon-btn burger" type="button" data-open-menu aria-label="Open menu">${ICON.menu}</button></div>
  </div></header>
  <div class="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true">
    <div class="mm-top"><a class="logo" href="index.html" style="padding:0;border:0">${logoSVG(false)}</a><button class="icon-btn mm-close" type="button" aria-label="Close menu">${ico("x")}</button></div>
    <a href="products.html">All Products</a><details><summary>Shop by category</summary>${CATEGORIES.map(c => `<a href="products.html?cat=${c.id}">${esc(c.name)}</a>`).join("")}</details>
    <a href="colours.html">Colours</a><a href="visualizer.html">Visualizer</a><a href="calculator.html">Calculator</a><a href="stores.html">Stores</a><a href="about.html">About</a><a href="contact.html">Contact</a>
    <p class="mt"><button class="btn btn-accent btn-block" type="button" data-open-quote>Get a Quote</button></p></div>
  <div class="search-overlay" role="dialog" aria-modal="true" aria-label="Search products" aria-hidden="true"><div class="search-box">
    <label class="sr-only" for="site-search">Search products</label>
    <input id="site-search" class="input" type="search" placeholder="Search products, e.g. “roof”, “varnish”, “silk”…" autocomplete="off">
    <ul class="search-results"></ul><p class="hint" style="margin:10px 0 0">Press Esc to close.</p></div></div>
  <div class="drawer-overlay" aria-hidden="true"></div>
  <aside class="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" aria-hidden="true">
    <header><h2>Your Cart</h2><button class="icon-btn" type="button" data-close-drawer aria-label="Close cart">${ico("x")}</button></header>
    <div class="d-body"></div>
    <footer><div style="display:flex;justify-content:space-between;margin-bottom:12px"><span>Subtotal</span><strong class="mc-sub"></strong></div>
      <a class="btn btn-primary btn-block" href="cart.html">View Cart &amp; Checkout</a></footer></aside>
  <div class="floaters"><button class="to-top" type="button" aria-label="Back to top">${ico("arrow-up")}</button>
    <a class="wa-btn" href="${waLink("Hello Demo Paints, I would like to enquire about your products.")}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ICON.wa}</a></div>`;
}
function buildFooter(){
  return `<div class="newsletter"><div class="container"><div><h2>Colour news, straight to your inbox</h2><p style="margin:0;opacity:.85">Trends, tips and offers — twice a month. (Demo form)</p></div>
    <form class="nl-form" novalidate><label class="sr-only" for="nl-email">Email address</label><input id="nl-email" type="email" placeholder="you@example.com" required><button class="btn btn-accent" type="submit">Subscribe</button></form></div></div>
  <footer class="site-footer"><div class="container"><div class="foot-grid">
    <div><a class="logo" href="index.html" aria-label="Demo Paints home">${logoSVG(true)}</a>
      <p style="margin-top:14px;max-width:34ch">Quality paints and coatings for homes, builders and industry across East Africa. Colour That Lasts.</p>
      <div class="socials"><a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.600 9.900v-7H7.900V12h2.500V9.800c0-2.500 1.500-3.900 3.800-3.900 1.100 0 2.200.2 2.200.2v2.500h-1.300c-1.200 0-1.600.8-1.600 1.600V12h2.800l-.4 2.900h-2.300v7A10 10 0 0 0 22 12z"/></svg></a>
      <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.500" cy="6.500" r="1.200"/></svg></a>
      <a href="#" aria-label="X"><svg viewBox="0 0 24 24"><path d="M18.200 2H21l-6.500 7.400L22 22h-6l-4.700-6.100L5.800 22H3l7-8L2 2h6.100l4.300 5.600L18.200 2z"/></svg></a>
      <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24"><path d="M23 7.500a3 3 0 0 0-2.100-2.100C19 5 12 5 12 5s-7 0-8.900.4A3 3 0 0 0 1 7.500 31 31 0 0 0 .6 12a31 31 0 0 0 .4 4.500 3 3 0 0 0 2.100 2.100C5 19 12 19 12 19s7 0 8.900-.4a3 3 0 0 0 2.100-2.100 31 31 0 0 0 .4-4.500 31 31 0 0 0-.4-4.500zM9.800 15V9l5.200 3z"/></svg></a></div></div>
    <div><h4>Quick links</h4><ul><li><a href="products.html">All products</a></li><li><a href="colours.html">Colours</a></li><li><a href="visualizer.html">Visualizer</a></li><li><a href="calculator.html">Calculator</a></li><li><a href="stores.html">Store locator</a></li><li><a href="quote.html">Request a quote</a></li></ul></div>
    <div><h4>Categories</h4><ul>${CATEGORIES.map(c => `<li><a href="products.html?cat=${c.id}">${esc(c.name)}</a></li>`).join("")}</ul></div>
    <div><h4>Contact</h4><ul><li>${ico("pin")}${CONFIG.address}</li><li>${ico("phone")}<a href="tel:${CONFIG.phone.replace(/\s/g,"")}">${CONFIG.phone}</a></li><li>${ico("mail")}<a href="mailto:${CONFIG.email}">${CONFIG.email}</a></li><li>${ico("clock")}Mon–Sat 8:00–18:00</li><li><a href="about.html">About us</a> · <a href="contact.html">Contact</a></li></ul></div>
  </div><div class="foot-bottom"><span>© ${new Date().getFullYear()} Demo Paints Ltd. All rights reserved.</span><span>Demo website — fictional brand for demonstration purposes only.</span></div></div></footer>`;
}

function updateBadge(){
  const n = Cart.count(), b = $(".cart-badge"); if (!b) return;
  b.textContent = n || ""; b.dataset.n = n;
}

function initChrome(){
  $("#site-header").innerHTML = buildHeader();
  $("#site-footer").innerHTML = buildFooter();
  document.head.insertAdjacentHTML("beforeend", `<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
  <script type="application/ld+json">${JSON.stringify({ "@context":"https://schema.org","@type":"Organization",name:"Demo Paints Ltd",url:location.origin,telephone:CONFIG.phone,email:CONFIG.email,address:{ "@type":"PostalAddress",streetAddress:"Plot 00, Industrial Area",addressLocality:"Kampala",addressCountry:"UG" },description:"Fictional demo paint manufacturer." })}<\/script>`);
  updateBadge(); initDrawerSwipe();
  document.addEventListener("cart:updated", () => { updateBadge(); if ($(".drawer.open")) renderMiniCart(); });

  // Mega menu: keyboard / touch toggle
  const mb = $(".mega-toggle"), hm = $(".has-mega");
  mb.addEventListener("click", () => { const o = hm.classList.toggle("open"); mb.setAttribute("aria-expanded", o); });
  hm.addEventListener("mouseleave", () => { hm.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); });

  // Scroll effects
  const hdr = $(".site-header"), top = $(".to-top");
  addEventListener("scroll", () => { hdr.classList.toggle("scrolled", scrollY > 8); top.classList.toggle("show", scrollY > 600); }, { passive: true });
  top.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  // Newsletter (demo)
  $(".nl-form").addEventListener("submit", e => {
    e.preventDefault(); const i = $("#nl-email");
    if (!/^\S+@\S+\.\S+$/.test(i.value)) { toast("Please enter a valid email"); i.focus(); return; }
    i.value = ""; toast("Thanks for subscribing! (demo)");
  });

  // Live search
  $("#site-search").addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase(), out = $(".search-results");
    if (q.length < 2) { out.innerHTML = ""; return; }
    const hits = PRODUCTS.filter(p => [p.name, catName(p.category), p.subcategory, p.finish].join(" ").toLowerCase().includes(q)).slice(0, 8);
    out.innerHTML = hits.length ? hits.map(p => `<li><a href="product.html?id=${p.id}"><span style="width:34px">${canSVG(p.canColour)}</span><span><strong>${esc(p.name)}</strong><br><small>${esc(catName(p.category))} · from ${fmt(fromPrice(p))}</small></span></a></li>`).join("")
      : `<li class="hint" style="padding:12px">No products match “${esc(q)}”.</li>`;
  });
}

/* ---- Global click delegation ---------------------------------------------------------- */
function addToCart(p, { size, colour, qty = 1 } = {}){
  const sz = p.sizes.find(s => s.size === size) || p.sizes[0], col = colour || defaultColour(p);
  Cart.add({ id: p.id, name: p.name, size: sz.size, price: sz.price, colour: col, qty });
  toast("Added to cart", { text: "View Cart", href: "cart.html", act: "cart" });
}
function addToQuote(p, { size, colour, qty = 1 } = {}){
  const sz = p.sizes.find(s => s.size === size) || p.sizes[0], col = colour || defaultColour(p);
  QuoteList.add({ id: p.id, name: p.name, size: sz.size, price: sz.price, colour: col, qty });
}
function quickView(id){
  const p = findProduct(id); if (!p) return;
  const m = openModal(`<div class="grid g2" style="align-items:center"><div class="pd-visual" style="position:static;padding:24px">${canSVG(p.canColour)}</div>
    <div><span class="muted">${esc(catName(p.category))} · ${esc(p.finish)}</span><h2 style="padding:0">${esc(p.name)}</h2>${stars(p.rating)}
    <p style="margin-top:10px">${esc(p.shortDesc)}</p><ul class="ticks" style="grid-template-columns:1fr">${p.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>
    <div class="price-big">from ${fmt(fromPrice(p))}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" data-add="${p.id}" type="button">Add to Cart</button><button class="btn btn-outline" data-quote="${p.id}" type="button">Get Quote</button><a class="btn btn-ghost" href="product.html?id=${p.id}">Details</a></div></div></div>`, { label: p.name + " quick view" });
  return m;
}
function openQuoteModal(){
  if (page() === "quote") { $("#quote-form-mount").scrollIntoView({ behavior: "smooth" }); return; }
  const m = openModal(`<h2>Request a Quote</h2><p class="muted">We reply within one business day.</p><div id="quote-modal-mount"></div>`, { cls: "wide", label: "Request a quote" });
  renderQuoteForm($("#quote-modal-mount", m.el), m);
}

document.addEventListener("click", e => {
  const t = e.target.closest("[data-add],[data-quote],[data-quick],[data-open-quote],[data-open-cart],[data-open-search],[data-open-menu],[data-close-drawer],[data-qty],[data-rm],.mm-close,.drawer-overlay,.search-overlay,[data-act=cart]");
  if (!t) return;
  if (t.dataset.add) return addToCart(findProduct(t.dataset.add));
  if (t.dataset.quote){ addToQuote(findProduct(t.dataset.quote)); toast("Added to quote list"); return openQuoteModal(); }
  if (t.dataset.quick) return quickView(t.dataset.quick);
  if (t.matches("[data-open-quote]")){ closeMobile(); return openQuoteModal(); }
  if (t.matches("[data-open-cart],[data-act=cart]") && page() !== "cart"){ e.preventDefault(); return openDrawer(); }
  if (t.matches("[data-open-search]")) return openSearch();
  if (t.matches("[data-open-menu]")) return openMobile();
  if (t.matches("[data-close-drawer],.drawer-overlay")) return closeDrawer();
  if (t.matches(".mm-close")) return closeMobile();
  if (t.matches(".search-overlay") && e.target === t) return closeSearch();
  if (t.dataset.qty){ const it = Cart.getItems().find(i => i.key === t.dataset.qty); if (it) Cart.updateQty(it.key, it.qty + parseInt(t.dataset.d, 10)); return; }
  if (t.dataset.rm) return Cart.remove(t.dataset.rm);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape"){
    if (modalStack.length) return modalStack[modalStack.length-1].close();
    if ($(".search-overlay.open")) return closeSearch();
    if ($(".drawer.open")) return closeDrawer();
    if ($(".mobile-menu.open")) return closeMobile();
    const hm = $(".has-mega.open"); if (hm) hm.classList.remove("open");
  }
  if (e.key === "Tab"){
    const top = modalStack[modalStack.length-1];
    const layer = top ? top.el : $(".search-overlay.open") || $(".drawer.open") || $(".mobile-menu.open");
    if (layer) trapFocus(layer, e);
  }
});
document.addEventListener("error", e => { if (e.target.tagName === "IMG") e.target.classList.add("img-fail"); }, true);

/* ---- Sliders, carousels, reveal ----------------------------------------------------------- */
/* ---- Motion primitives (Apple "fluid interface" model) ----------------------
   springTo: critically-damped spring (response in seconds, damping 1 = no bounce)
   that starts from the CURRENT value and inherits release velocity, so it can be
   grabbed and redirected at any moment. project(): where a flick will come to rest.
   rubber(): progressive resistance past a boundary. */
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function springTo({ from, to, velocity = 0, response = .45, damping = 1, onUpdate, onDone }){
  if (reducedMotion()){ onUpdate(to); if (onDone) onDone(); return { value: to, cancel(){} }; }
  const w = 2 * Math.PI / response, k = w * w, c = 2 * damping * w;
  let x = from, v = velocity, last = performance.now(), raf, dead = false;
  const h = { value: from, cancel(){ dead = true; cancelAnimationFrame(raf); } };
  (function tick(now){
    if (dead) return;
    const dt = Math.min((now - last) / 1000, .032); last = now;
    const n = Math.ceil(dt / .004) || 1, step = dt / n;
    for (let i = 0; i < n; i++){ v += (-k * (x - to) - c * v) * step; x += v * step; }
    h.value = x; onUpdate(x);
    if (Math.abs(x - to) < .25 && Math.abs(v) < 2){ h.value = to; onUpdate(to); if (onDone) onDone(); return; }
    raf = requestAnimationFrame(tick);
  })(last);
  return h;
}
const project = (v, d = .998) => (v / 1000) * d / (1 - d);
const rubber = (o, dim, c = .55) => (o * dim * c) / (dim + c * Math.abs(o));
function releaseVelocity(hist){            // px/s over the last few pointer samples
  const a = hist[0], b = hist[hist.length - 1], dt = (b[1] - a[1]) / 1000;
  return dt > 0 ? (b[0] - a[0]) / dt : 0;
}

/* ---- Slider: 1:1 drag, velocity projection, spring settle, rubber-band ends ---- */
function initSlider(root, { auto = 0 } = {}){
  const track = $(".slides", root), slides = $$(".slide, .slide-item", track); if (!slides.length) return;
  let i = 0, x = 0, timer = null, sp = null, drag = null, moved = false;
  const W = () => root.clientWidth;
  const setX = v => { x = v; track.style.transform = `translate3d(${v}px,0,0)`; };
  const ctrl = document.createElement("div"); ctrl.className = "slider-ctrl";
  slides.forEach((_, n) => { const d = document.createElement("button"); d.type = "button"; d.className = "dot"; d.setAttribute("aria-label", `Go to slide ${n+1}`); d.addEventListener("click", () => { go(n); restart(); }); ctrl.appendChild(d); });
  root.appendChild(ctrl);
  if (slides.length > 1 && root.dataset.arrows !== "off"){
    ["prev","next"].forEach(dir => { const b = document.createElement("button"); b.type = "button"; b.className = "arrow " + dir; b.setAttribute("aria-label", dir === "prev" ? "Previous slide" : "Next slide"); b.innerHTML = ico(dir === "prev" ? "chevron-left" : "chevron-right"); b.addEventListener("click", () => { go(i + (dir === "prev" ? -1 : 1)); restart(); }); root.appendChild(b); });
  }
  function go(n, velocity = 0){
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => s.setAttribute("aria-hidden", k !== i));
    $$(".dot", ctrl).forEach((d, k) => d.setAttribute("aria-current", k === i));
    if (sp) sp.cancel();
    sp = springTo({ from: x, to: -i * W(), velocity, response: .5, onUpdate: setX });
  }
  const stop = () => { clearInterval(timer); timer = null; };
  const restart = () => { stop(); if (auto && !reducedMotion()) timer = setInterval(() => go(i + 1), auto); };

  // Pointer tracking: respond on down, commit to horizontal after ~10px, then follow 1:1
  root.addEventListener("pointerdown", e => {
    if (e.button || e.target.closest(".arrow,.dot,a,button,input")) return;
    if (sp) sp.cancel();                                   // grab a moving slide mid-flight
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, base: x, hist: [[e.clientX, e.timeStamp]], on: false };
  });
  root.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.on){
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dy) > Math.abs(dx)){ drag = null; go(i); return; }
      drag.on = true; drag.x0 = e.clientX; root.setPointerCapture(e.pointerId); root.classList.add("dragging"); stop();
    }
    drag.hist.push([e.clientX, e.timeStamp]); if (drag.hist.length > 6) drag.hist.shift();
    let nx = drag.base + (e.clientX - drag.x0), min = -(slides.length - 1) * W();
    if (nx > 0) nx = rubber(nx, W()); else if (nx < min) nx = min - rubber(min - nx, W());
    setX(nx);
  });
  const end = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null; root.classList.remove("dragging");
    if (!d.on){ return; }
    moved = true;
    const v = releaseVelocity(d.hist), target = Math.round(-(x + project(v)) / W());   // land where the flick is heading
    go(Math.max(i - 1, Math.min(i + 1, Math.max(0, Math.min(slides.length - 1, target)))), v);
    restart();
  };
  root.addEventListener("pointerup", end); root.addEventListener("pointercancel", end);
  root.addEventListener("click", e => { if (moved){ e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  addEventListener("resize", () => setX(-i * W()));
  root.addEventListener("mouseenter", stop); root.addEventListener("mouseleave", restart);
  root.addEventListener("focusin", stop); root.addEventListener("focusout", restart);
  go(0); restart();
}

/* ---- Cart drawer: drag the header to the right to dismiss (1:1, momentum) ---- */
function initDrawerSwipe(){
  const dr = $(".drawer"), hd = $("header", dr); let d = null;
  hd.style.touchAction = "pan-y";
  hd.addEventListener("pointerdown", e => { if (e.target.closest("button") || !dr.classList.contains("open")) return; d = { id: e.pointerId, x0: e.clientX, hist: [[e.clientX, e.timeStamp]], dx: 0 }; hd.setPointerCapture(e.pointerId); dr.style.transition = "none"; });
  hd.addEventListener("pointermove", e => {
    if (!d || e.pointerId !== d.id) return;
    d.hist.push([e.clientX, e.timeStamp]); if (d.hist.length > 6) d.hist.shift();
    const dx = e.clientX - d.x0; d.dx = dx > 0 ? dx : -rubber(-dx, dr.offsetWidth);
    dr.style.transform = `translateX(${d.dx}px)`;
  });
  const end = e => {
    if (!d || e.pointerId !== d.id) return;
    const s = d, v = releaseVelocity(s.hist); d = null;
    const close = s.dx + project(v) > dr.offsetWidth * .4;
    springTo({ from: s.dx, to: close ? dr.offsetWidth : 0, velocity: v, response: .35, onUpdate: n => { dr.style.transform = `translateX(${n}px)`; },
      onDone: () => { dr.style.transition = "none"; if (close) closeDrawer(); dr.getBoundingClientRect(); dr.style.transition = ""; dr.style.transform = ""; } });
  };
  hd.addEventListener("pointerup", end); hd.addEventListener("pointercancel", end);
}
function initCarousel(root){
  const tr = $(".carousel-track", root);
  ["prev","next"].forEach(dir => { const b = document.createElement("button"); b.type = "button"; b.className = "arrow " + dir; b.setAttribute("aria-label", dir === "prev" ? "Scroll left" : "Scroll right"); b.innerHTML = ico(dir === "prev" ? "chevron-left" : "chevron-right"); b.addEventListener("click", () => tr.scrollBy({ left: (dir === "prev" ? -1 : 1) * tr.clientWidth * .8, behavior: "smooth" })); root.appendChild(b); });
}
let revealIO = null;
function observeReveals(){
  const els = $$(".reveal:not(.in)");
  if (!("IntersectionObserver" in window)) return els.forEach(e => e.classList.add("in"));
  revealIO = revealIO || new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ en.target.classList.add("in"); revealIO.unobserve(en.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
  els.forEach(e => { e.style.setProperty("--i", [...e.parentNode.children].indexOf(e) % 6); revealIO.observe(e); });
}

/* ---- Shared Quote form (page + modal) --------------------------------------------------------- */
const QUOTE_TYPES = ["Home","Contractor","Dealer","Corporate"];
const PROJECT_TYPES = ["Interior painting","Exterior painting","Roofing","Wood finishing","Automotive refinish","Industrial / protective","Bulk supply","Other"];
function nextQuoteRef(){
  const n = (parseInt(safeGet("demoPaints_qref", "0"), 10) || 0) + 1; safeSet("demoPaints_qref", n);
  return `DQ-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}
function quoteItemsHTML(){
  const items = QuoteList.getItems();
  const rows = items.length ? items.map(i => {
    const p = findProduct(i.id);
    return `<tr><td><strong>${esc(i.name)}</strong></td>
      <td><select data-qi-size="${esc(i.key)}" aria-label="Size for ${esc(i.name)}" class="input" style="min-height:34px;padding:4px 8px;width:auto">${p ? p.sizes.map(s => `<option ${s.size === i.size ? "selected" : ""}>${s.size}</option>`).join("") : `<option>${esc(i.size)}</option>`}</select></td>
      <td>${esc(i.colour.name)}</td><td><input type="number" min="1" max="999" value="${i.qty}" data-qi-qty="${esc(i.key)}" aria-label="Quantity for ${esc(i.name)}"></td>
      <td><button type="button" class="rm" data-qi-rm="${esc(i.key)}" aria-label="Remove ${esc(i.name)}">Remove</button></td></tr>`;
  }).join("") : `<tr><td colspan="5" class="hint">No items yet — add products below, or just describe your project in the message.</td></tr>`;
  return `<table class="qt-table"><thead><tr><th>Product</th><th>Size</th><th>Colour</th><th>Qty</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="sr-only" for="qi-add">Add a product</label>
    <select id="qi-add" class="input" style="flex:1;min-width:200px;width:auto"><option value="">+ Add a product…</option>${PRODUCTS.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div>`;
}
function renderQuoteForm(mount, modal){
  const note = safeGet("demoPaints_quote_note");
  mount.innerHTML = `<form class="quote-form" novalidate>
    <div class="form-row"><div class="field"><label>Full name *</label><input name="name" autocomplete="name" required><span class="err"></span></div>
      <div class="field"><label>Company (optional)</label><input name="company" autocomplete="organization"></div></div>
    <div class="form-row"><div class="field"><label>Phone *</label><input name="phone" type="tel" autocomplete="tel" required><span class="err"></span></div>
      <div class="field"><label>Email *</label><input name="email" type="email" autocomplete="email" required><span class="err"></span></div></div>
    <div class="form-row"><div class="field"><label>Customer type *</label><select name="type">${QUOTE_TYPES.map(t => `<option>${t}</option>`).join("")}</select></div>
      <div class="field"><label>Project type *</label><select name="project">${PROJECT_TYPES.map(t => `<option>${t}</option>`).join("")}</select></div></div>
    <div class="form-row"><div class="field"><label>Location *</label><input name="location" placeholder="Town / area" required><span class="err"></span></div>
      <div class="field"><label>Required date</label><input name="date" type="date" min="${new Date().toISOString().slice(0,10)}"></div></div>
    <div class="field"><label>Items</label><div class="qi-mount">${quoteItemsHTML()}</div></div>
    <div class="field"><label>Message</label><textarea name="message" placeholder="Surface area, finish, delivery needs…">${esc(note)}</textarea><span class="err"></span></div>
    <div class="field"><label>Drawings / BOQ (demo — file names only are included)</label><input name="files" type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.xlsx,.dwg"></div>
    <div class="field"><label class="check"><input type="checkbox" name="consent"><span>I agree to be contacted about this quote and accept the privacy policy. *</span></label><span class="err"></span></div>
    <button class="btn btn-primary btn-block" type="submit">Submit quote request</button></form>`;
  const form = $("form", mount);

  const refreshItems = () => { $(".qi-mount", mount).innerHTML = quoteItemsHTML(); };
  const onQuote = () => { if (document.body.contains(mount)) refreshItems(); else document.removeEventListener("quote:updated", onQuote); };
  document.addEventListener("quote:updated", onQuote);

  mount.addEventListener("change", e => {
    const t = e.target;
    if (t.dataset.qiQty) QuoteList.updateQty(t.dataset.qiQty, t.value);
    else if (t.dataset.qiSize){
      const it = QuoteList.getItems().find(i => i.key === t.dataset.qiSize), p = it && findProduct(it.id);
      if (it && p){ const s = p.sizes.find(x => x.size === t.value); QuoteList.remove(it.key); QuoteList.add(Object.assign({}, it, { size: s.size, price: s.price })); }
    } else if (t.id === "qi-add" && t.value){ addToQuote(findProduct(t.value)); }
  });
  mount.addEventListener("click", e => { const b = e.target.closest("[data-qi-rm]"); if (b) QuoteList.remove(b.dataset.qiRm); });

  const setErr = (name, msg) => { const f = form.elements[name].closest(".field"); f.classList.toggle("invalid", !!msg); $(".err", f).textContent = msg || ""; return !msg; };
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const v = n => form.elements[n].value.trim();
    let ok = true;
    ok = setErr("name", v("name") ? "" : "Please enter your name.") && ok;
    ok = setErr("phone", v("phone").replace(/\D/g, "").length >= 7 ? "" : "Enter a valid phone number.") && ok;
    ok = setErr("email", /^\S+@\S+\.\S+$/.test(v("email")) ? "" : "Enter a valid email address.") && ok;
    ok = setErr("location", v("location") ? "" : "Please tell us where the project is.") && ok;
    ok = setErr("message", (QuoteList.count() || v("message")) ? "" : "Add at least one item or describe your project.") && ok;
    ok = setErr("consent", form.elements.consent.checked ? "" : "Please accept to continue.") && ok;
    if (!ok){ const bad = $(".invalid input, .invalid select, .invalid textarea", form); if (bad) bad.focus(); return; }
    const btn = $("button[type=submit]", form); btn.disabled = true; btn.textContent = "Sending…";
    const data = { name: v("name"), company: v("company"), phone: v("phone"), email: v("email"), customerType: v("type"), projectType: v("project"), location: v("location"), requiredDate: v("date"), message: v("message"), files: Array.from(form.elements.files.files).map(f => f.name), items: QuoteList.getItems() };
    const res = await submitQuote(data);
    showQuoteSuccess(mount, res);
  });
}
function quoteText(d){
  const lines = d.items.map((i, n) => `${n+1}. ${i.name} — ${i.size}, ${i.colour.name}, qty ${i.qty}`);
  return [`QUOTE REQUEST ${d.ref}`, "", `Name: ${d.name}`, d.company ? `Company: ${d.company}` : null, `Phone: ${d.phone}`, `Email: ${d.email}`,
    `Customer type: ${d.customerType}`, `Project: ${d.projectType}`, `Location: ${d.location}`, d.requiredDate ? `Required by: ${d.requiredDate}` : null,
    "", "ITEMS:", ...(lines.length ? lines : ["(none listed)"]), "", d.message ? `Message: ${d.message}` : null,
    d.files.length ? `Attachments (send separately): ${d.files.join(", ")}` : null].filter(x => x !== null).join("\n");
}
async function submitQuote(data){
  data.ref = nextQuoteRef();
  const text = quoteText(data);
  if (QUOTE_ENDPOINT){
    try {
      const r = await fetch(QUOTE_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(Object.assign({}, data, { summary: text })) });
      if (r.ok) return { ref: data.ref, sent: true };
    } catch(e){ /* fall through to mailto / WhatsApp */ }
  }
  return { ref: data.ref, sent: false,
    mailto: `mailto:${CONFIG.email}?subject=${encodeURIComponent("Quote request " + data.ref)}&body=${encodeURIComponent(text)}`,
    wa: waLink(text) };
}
function showQuoteSuccess(mount, res){
  QuoteList.clear(); try { localStorage.removeItem("demoPaints_quote_note"); } catch(e){}
  mount.innerHTML = `<div class="success"><div class="tick" aria-hidden="true">${ico("check")}</div><h2 style="padding:0">${res.sent ? "Quote request sent!" : "Your quote is ready to send"}</h2>
    <p>Your reference number</p><p class="ref">${res.ref}</p>
    ${res.sent ? `<p class="muted">Our team will contact you within one business day.</p>`
      : `<p class="muted">No form endpoint is configured (demo), so please send your request using one of the options below.</p>
         <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn btn-primary" href="${res.mailto}">Send by email</a><a class="btn btn-accent" href="${res.wa}" target="_blank" rel="noopener">Send on WhatsApp</a></div>`}
    <p class="mt"><a href="products.html" class="btn btn-outline">Continue shopping</a></p></div>`;
}

/* ---- Boot ------------------------------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  initChrome(); hydrateIcons();
  if (PAGES[page()]) PAGES[page()]();
  $$(".slider-auto").forEach(r => initSlider(r, { auto: +r.dataset.auto || 0 }));
  $$(".carousel").forEach(initCarousel);
  observeReveals();
});
