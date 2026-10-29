/* ==========================================================================
   DEMO PAINTS — pages.js
   One renderer per page, registered on PAGES and called by main.js
   according to <body data-page="...">.
   ========================================================================== */

/* ---- Shared helpers --------------------------------------------------------- */
const qs = new URLSearchParams(location.search);
function coverageNum(p){ const m = /([\d.]+)/.exec(p.coverage || ""); return m ? parseFloat(m[1]) : 10; }
/* Cheapest tin combination covering the required litres/kg: greedy on the larger
   sizes, then finish the remainder with whole tins of whichever size costs least */
function calcTins(need, p){
  const sizes = p.sizes.map(s => ({ size: s.size, vol: parseFloat(s.size), price: s.price })).sort((a, b) => b.vol - a.vol);
  let best = null;
  sizes.forEach((fin, k) => {
    let rem = need; const parts = [];
    sizes.slice(0, k).forEach(s => { const n = Math.floor(rem / s.vol + 1e-9); if (n){ parts.push({ ...s, n }); rem -= n * s.vol; } });
    if (rem > 0.01) parts.push({ ...fin, n: Math.ceil(rem / fin.vol - 1e-9) });
    const cost = parts.reduce((t, x) => t + x.n * x.price, 0), tins = parts.reduce((t, x) => t + x.n, 0);
    if (!best || cost < best.cost || (cost === best.cost && tins < best.tins)) best = { parts, cost, tins, volume: parts.reduce((t, x) => t + x.n * x.vol, 0) };
  });
  return best;
}
const tinsText = t => t.parts.map(x => `${x.n} × ${x.size}`).join(" + ");
function complementHex(hex){
  let [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  let h = 0, s = 0;
  if (d){ s = d / (1 - Math.abs(2*l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  h = (h + 180) % 360;
  const c = (1 - Math.abs(2*l - 1)) * s, x = c * (1 - Math.abs((h/60) % 2 - 1)), m = l - c/2;
  const [R, G, B] = h < 60 ? [c,x,0] : h < 120 ? [x,c,0] : h < 180 ? [0,c,x] : h < 240 ? [0,x,c] : h < 300 ? [x,0,c] : [c,0,x];
  return "#" + [R, G, B].map(v => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}
const swatchBtn = (c, extra = "") => `<button class="sw" type="button" style="background:${c.hex}" title="${esc(c.name)}" aria-label="${esc(c.name)} ${c.hex}" aria-pressed="false" ${extra}></button>`;

/* ==========================================================================
   HOME
   ========================================================================== */
PAGES.home = function(){
  $("#cat-tiles").innerHTML = CATEGORIES.map(c => `<a class="cat-tile reveal" href="products.html?cat=${c.id}"><img src="${c.img}" alt="" loading="lazy" width="640" height="440"><span class="ico" aria-hidden="true">${ico(c.icon)}</span><h3>${esc(c.name)}</h3><span class="more">Explore →</span></a>`).join("");
  const best = PRODUCTS.filter(p => p.badge === "Best Seller").concat(PRODUCTS.filter(p => p.rating >= 4.7 && p.badge !== "Best Seller")).slice(0, 12);
  $("#best-track").innerHTML = best.map(cardHTML).join("");
  const coy = COLOUR_OF_THE_YEAR;
  $("#coy").innerHTML = `<div class="swatch" style="background:${coy.hex}"><div><span style="opacity:.85">Colour of the Year ${new Date().getFullYear()}</span><b>${esc(coy.name)}</b><span>${coy.hex}</span></div></div>
    <div class="txt"><span class="eyebrow">Colour of the Year</span><h2>${esc(coy.name)}</h2><p>${esc(coy.blurb)}</p><a class="btn btn-primary" href="colours.html">Explore Colours</a></div>`;
  const gal = [["photo-1600585154340-be6161a56a0c","Modern exterior","4/5"],["photo-1560448204-e02f11c3d0e2","Warm living room","1/1"],["photo-1564013799919-ab600027ffc6","Weatherproof walls","4/3"],["photo-1505691938895-1758d7feb511","Calm bedroom","3/4"],["photo-1556228453-efd6c1ff04f6","Bright kitchen","4/3"],["photo-1512917774080-9991f1c4c750","Villa facade","1/1"],["photo-1493809842364-78817add7ffb","Open-plan living","4/5"],["photo-1600607687939-ce8a6c25118c","Feature wall","4/3"]];
  $("#gallery").innerHTML = gal.map(([id, cap, ar]) => `<figure class="reveal" style="aspect-ratio:${ar}"><img src="https://images.unsplash.com/${id}?w=640&q=70" alt="${cap}" loading="lazy" style="height:100%;object-fit:cover"><figcaption>${cap}</figcaption></figure>`).join("");
  const t = [["We repainted a 24-unit block with WeatherGuard Plus. Two rainy seasons later it still looks freshly painted.","Grace N., Property developer, Kampala"],["The roof coating cut the heat in our workshop noticeably. Delivery was fast and the team was helpful.","Samuel O., Workshop owner, Jinja"],["The visualizer helped me pick the right colours before I bought a single tin. Saved me a lot of doubt.","Amina K., Homeowner, Mbarara"],["Reliable supply, consistent colour and great technical advice for our bulk orders.","Peter M., Site contractor, Gulu"]];
  $("#testi-slides").innerHTML = t.map(([q, a]) => `<div class="slide-item"><div class="testi">${stars(5, false)}<p>“${q}”</p><small>${a}</small></div></div>`).join("");
  $$(".splash").forEach(el => { el.innerHTML = canSVG(el.dataset.c); });
  initSlider($("#testi-slider"), { auto: 6500 });
  initCarousel($("#best-carousel"));
};

/* ==========================================================================
   PRODUCTS (catalogue with filters)
   ========================================================================== */
PAGES.products = function(){
  const st = { cats: new Set(qs.get("cat") ? [qs.get("cat")] : []), finish: new Set(), surface: new Set(), badge: new Set(), area: "", max: Infinity, q: qs.get("q") || "", sort: "pop", view: "grid" };
  const count = (arr, f) => { const m = {}; arr.forEach(p => [].concat(f(p)).forEach(v => m[v] = (m[v] || 0) + 1)); return m; };
  const finishes = count(PRODUCTS, p => p.finish), surfaces = count(PRODUCTS, p => p.surfaces);
  const topSurf = Object.entries(surfaces).sort((a, b) => b[1] - a[1]).slice(0, 12).map(e => e[0]).sort();
  const maxP = Math.ceil(Math.max(...PRODUCTS.map(fromPrice)) / 5000) * 5000;
  st.max = maxP;
  const chk = (g, v, n, on) => `<label><input type="checkbox" data-g="${g}" data-v="${esc(v)}" ${on ? "checked" : ""}> ${esc(g === "cats" ? catName(v) : v)} <span class="n">${n}</span></label>`;
  const side = $("#filters");
  side.innerHTML = `<button class="icon-btn close-f" type="button" aria-label="Close filters">${ico("x")}</button>
    <details open><summary>Category</summary>${CATEGORIES.map(c => chk("cats", c.id, PRODUCTS.filter(p => p.category === c.id).length, st.cats.has(c.id))).join("")}</details>
    <details open><summary>Interior / Exterior</summary>${[["", "All"], ["interior", "Interior"], ["exterior", "Exterior"]].map(([v, l]) => `<label><input type="radio" name="area" data-g="area" data-v="${v}" ${v === "" ? "checked" : ""}> ${l}</label>`).join("")}</details>
    <details><summary>Finish</summary>${Object.keys(finishes).sort().map(f => chk("finish", f, finishes[f])).join("")}</details>
    <details><summary>Surface</summary>${topSurf.map(s => chk("surface", s, surfaces[s])).join("")}</details>
    <details open><summary>Max price (from)</summary><input type="range" id="f-price" min="10000" max="${maxP}" step="5000" value="${maxP}" style="width:100%" aria-label="Maximum price"><div class="hint" id="f-price-out">Up to ${fmt(maxP)}</div></details>
    <details><summary>Badge</summary>${["New", "Best Seller", "Eco", "Pro"].map(b => chk("badge", b, PRODUCTS.filter(p => p.badge === b).length)).join("")}</details>
    <p style="padding:10px 0"><button class="btn btn-ghost btn-sm" id="f-clear" type="button" style="color:var(--ink)">Clear all filters</button></p>`;
  $("#shop-q").value = st.q;

  const sorters = { pop: (a, b) => (b.rating + (b.badge === "Best Seller" ? 2 : 0)) - (a.rating + (a.badge === "Best Seller" ? 2 : 0)), lo: (a, b) => fromPrice(a) - fromPrice(b), hi: (a, b) => fromPrice(b) - fromPrice(a), az: (a, b) => a.name.localeCompare(b.name) };
  function render(){
    const q = st.q.toLowerCase();
    const list = PRODUCTS.filter(p =>
      (!st.cats.size || st.cats.has(p.category)) && (!st.finish.size || st.finish.has(p.finish)) &&
      (!st.surface.size || p.surfaces.some(s => st.surface.has(s))) && (!st.badge.size || st.badge.has(p.badge)) &&
      (!st.area || p.area.includes(st.area)) && fromPrice(p) <= st.max &&
      (!q || [p.name, catName(p.category), p.subcategory, p.finish, p.shortDesc].join(" ").toLowerCase().includes(q))).sort(sorters[st.sort]);
    $("#result-count").textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
    const g = $("#pgrid"); g.className = "pgrid" + (st.view === "list" ? " list" : "");
    g.innerHTML = list.length ? list.map(cardHTML).join("") : `<div class="empty" style="grid-column:1/-1">${ICON.emptyCart}<h3>No products match</h3><p>Try removing a filter.</p></div>`;
    observeReveals();
  }
  side.addEventListener("change", e => {
    const t = e.target; if (t.dataset.g === "area") st.area = t.dataset.v;
    else if (t.dataset.g){ t.checked ? st[t.dataset.g].add(t.dataset.v) : st[t.dataset.g].delete(t.dataset.v); }
    render();
  });
  $("#f-price").addEventListener("input", e => { st.max = +e.target.value; $("#f-price-out").textContent = "Up to " + fmt(st.max); render(); });
  $("#f-clear").addEventListener("click", () => { st.cats.clear(); st.finish.clear(); st.surface.clear(); st.badge.clear(); st.area = ""; st.max = maxP; st.q = ""; $("#shop-q").value = ""; $("#f-price").value = maxP; $("#f-price-out").textContent = "Up to " + fmt(maxP); $$("input", side).forEach(i => { if (i.type === "checkbox") i.checked = false; if (i.type === "radio") i.checked = i.dataset.v === ""; }); render(); });
  $("#shop-q").addEventListener("input", e => { st.q = e.target.value.trim(); render(); });
  $("#shop-sort").addEventListener("change", e => { st.sort = e.target.value; render(); });
  $$("#view-toggle button").forEach(b => b.addEventListener("click", () => { st.view = b.dataset.view; $$("#view-toggle button").forEach(x => x.setAttribute("aria-pressed", x === b)); render(); }));
  $("#filter-open").addEventListener("click", () => side.classList.add("open"));
  $(".close-f", side).addEventListener("click", () => side.classList.remove("open"));
  if (st.cats.size === 1){ const c = CATEGORIES.find(x => st.cats.has(x.id)); if (c) { $("#shop-title").textContent = c.name; $("#shop-sub").textContent = c.blurb; document.title = `${c.name} Paints | Demo Paints`; } }
  render();
};

/* ==========================================================================
   PRODUCT DETAIL
   ========================================================================== */
PAGES.product = function(){
  const p = findProduct(qs.get("id")), root = $("#pd-root");
  if (!p){ root.innerHTML = `<div class="empty container">${ICON.emptyCart}<h2>Product not found</h2><a class="btn btn-primary" href="products.html">Browse all products</a></div>`; return; }
  document.title = `${p.name} | Demo Paints`;
  const desc = `${p.name} — ${p.shortDesc} From ${fmt(fromPrice(p))}.`;
  $('meta[name="description"]').setAttribute("content", desc);
  $('meta[property="og:title"]').setAttribute("content", p.name + " | Demo Paints");
  $('meta[property="og:description"]').setAttribute("content", desc);
  document.head.insertAdjacentHTML("beforeend", `<script type="application/ld+json">${JSON.stringify({ "@context":"https://schema.org","@type":"Product",name:p.name,description:p.description,category:catName(p.category),brand:{ "@type":"Brand",name:"Demo Paints" },aggregateRating:{ "@type":"AggregateRating",ratingValue:p.rating,reviewCount:20 + Math.round(p.rating * 7) },offers:{ "@type":"AggregateOffer",priceCurrency:"UGX",lowPrice:fromPrice(p),highPrice:Math.max(...p.sizes.map(s => s.price)),offerCount:p.sizes.length,availability:"https://schema.org/InStock" } })}<\/script>`);

  const cols = colourOptions(p), cat = CATEGORIES.find(c => c.id === p.category);
  const sel = { s: 0, c: 0, q: 1 };
  const tintable = /^tintable/i.test(p.colours);
  root.innerHTML = `<div class="page-hero"><div class="container"><div class="crumbs"><a href="index.html">Home</a> ${ico("chevron-right")} <a href="products.html">Products</a> ${ico("chevron-right")} <a href="products.html?cat=${p.category}">${esc(catName(p.category))}</a> ${ico("chevron-right")} ${esc(p.name)}</div><h1>${esc(p.name)}</h1></div></div>
  <section class="section"><div class="container"><div class="pd-grid">
    <div class="pd-visual">${p.badge ? `<span class="badge ${esc(p.badge.replace(/\s/g, ""))}">${esc(p.badge)}</span>` : ""}<div id="pd-can">${canSVG(cols[0].hex)}</div><div class="tints" id="pd-tints" role="group" aria-label="Colour tints">${cols.map((c, i) => swatchBtn(c, `data-ci="${i}"`)).join("")}</div><p class="hint" style="margin-top:12px" id="pd-colname"></p></div>
    <div><span class="muted">${esc(p.subcategory)} · ${esc(p.finish)}</span><div>${stars(p.rating)}</div><p style="margin-top:10px;font-size:1.1rem">${esc(p.shortDesc)}</p>
      <div class="price-big" id="pd-price"></div><p class="stock-note">${ico("check")} In stock · ${tintable ? "Tintable in 1,000+ colours at store" : "Ready to ship"}</p>
      <span class="opt-label">Size</span><div id="pd-sizes" style="display:flex;gap:8px;flex-wrap:wrap">${p.sizes.map((s, i) => `<button class="chip" type="button" data-si="${i}" aria-pressed="false">${s.size}</button>`).join("")}</div>
      <span class="opt-label">Colour${tintable ? " (popular picks)" : ""}</span><div class="tints" id="pd-sw" style="justify-content:flex-start">${cols.map((c, i) => swatchBtn(c, `data-ci="${i}"`)).join("")}</div>
      <span class="opt-label">Quantity</span><div class="stepper"><button type="button" id="q-dec" aria-label="Decrease quantity">−</button><input id="q-in" type="number" min="1" max="999" value="1" aria-label="Quantity"><button type="button" id="q-inc" aria-label="Increase quantity">+</button></div>
      <div class="buy-row"><button class="btn btn-primary" id="pd-add" type="button">Add to Cart</button><button class="btn btn-outline" id="pd-quote" type="button">Get a Quote</button><a class="btn btn-ghost" id="pd-wa" target="_blank" rel="noopener" style="color:#128C7E">WhatsApp enquiry</a></div>
      <div class="mini-calc"><strong>Quick coverage calculator</strong><div class="row" style="margin-top:8px"><label for="mc-area">Area to paint (m²)</label><input class="input" id="mc-area" type="number" min="1" value="30"><span id="mc-out" class="hint"></span></div></div>
    </div></div>
    <div class="tabs"><div class="tab-list" role="tablist">${["Description", "Features", "Technical Data", "Application Guide", "Downloads"].map((t, i) => `<button role="tab" type="button" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}">${t}</button>`).join("")}</div>
      <div class="tab-panel" role="tabpanel" id="panel-0"><p>${esc(p.description)}</p><p><strong>Suitable for:</strong> ${p.surfaces.map(esc).join(", ")}.</p></div>
      <div class="tab-panel hidden" role="tabpanel" id="panel-1"><ul class="ticks">${p.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul></div>
      <div class="tab-panel hidden" role="tabpanel" id="panel-2"><table class="data"><tr><th>Finish</th><td>${esc(p.finish)}</td></tr><tr><th>Coverage</th><td>${esc(p.coverage)}</td></tr><tr><th>Drying time</th><td>${esc(p.dryingTime)}</td></tr><tr><th>Recommended coats</th><td>${p.coats || "—"}</td></tr><tr><th>Thinner / cleaning</th><td>${esc(p.thinner)}</td></tr><tr><th>Pack sizes</th><td>${p.sizes.map(s => s.size).join(", ")}</td></tr></table></div>
      <div class="tab-panel hidden" role="tabpanel" id="panel-3"><ol>${cat.guide.map(g => `<li>${esc(g)}</li>`).join("")}</ol><p class="hint">Thin with: ${esc(p.thinner)}. Always follow the full technical data sheet.</p></div>
      <div class="tab-panel hidden" role="tabpanel" id="panel-4"><p>Technical and safety documents (demo buttons — no real files).</p><button class="btn btn-outline btn-sm" data-demo type="button">${ico("download")} Technical Data Sheet (TDS)</button> <button class="btn btn-outline btn-sm" data-demo type="button">${ico("download")} Safety Data Sheet (SDS)</button></div></div>
    <div style="margin-top:56px"><div class="section-head"><h2>Related products</h2></div><div class="carousel"><div class="carousel-track" id="related"></div></div></div></div></section>`;

  const update = () => {
    const s = p.sizes[sel.s], c = cols[sel.c];
    $("#pd-price").textContent = fmt(s.price * sel.q) + (sel.q > 1 ? ` (${fmt(s.price)} each)` : "");
    $("#pd-can").innerHTML = canSVG(c.hex); $("#pd-colname").textContent = "Colour: " + c.name + (tintable ? " (sample shade)" : "");
    $$("#pd-sizes .chip").forEach((b, i) => b.setAttribute("aria-pressed", i === sel.s));
    $$("#pd-sw .sw, #pd-tints .sw").forEach(b => b.setAttribute("aria-pressed", +b.dataset.ci === sel.c));
    $("#q-in").value = sel.q;
    $("#pd-wa").href = waLink(`Hello Demo Paints, I'd like to enquire about ${p.name} (${s.size}, ${c.name}) × ${sel.q}.`);
    const need = ($("#mc-area").value || 0) * (p.coats || 2) / coverageNum(p), t = calcTins(need, p);
    $("#mc-out").textContent = need > 0 ? `≈ ${need.toFixed(1)} ${p.sizes[0].size.replace(/[\d.]/g, "")} for ${p.coats || 2} coats: ${tinsText(t)} (${fmt(t.cost)})` : "";
  };
  root.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.si) sel.s = +b.dataset.si; else if (b.dataset.ci) sel.c = +b.dataset.ci;
    else if (b.id === "q-dec") sel.q = Math.max(1, sel.q - 1); else if (b.id === "q-inc") sel.q = Math.min(999, sel.q + 1);
    else if (b.id === "pd-add") return addToCart(p, { size: p.sizes[sel.s].size, colour: cols[sel.c], qty: sel.q });
    else if (b.id === "pd-quote"){ addToQuote(p, { size: p.sizes[sel.s].size, colour: cols[sel.c], qty: sel.q }); toast("Added to quote list"); return openQuoteModal(); }
    else if (b.dataset.demo) return toast("Demo only — no real document attached");
    else if (b.getAttribute("role") === "tab"){ $$("[role=tab]", root).forEach((t, i) => { const on = t === b; t.setAttribute("aria-selected", on); $("#panel-" + i).classList.toggle("hidden", !on); }); return; }
    update();
  });
  $("#q-in").addEventListener("change", e => { sel.q = Math.max(1, Math.min(999, parseInt(e.target.value, 10) || 1)); update(); });
  $("#mc-area").addEventListener("input", update);
  const rel = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).concat(PRODUCTS.filter(x => x.category !== p.category)).slice(0, 8);
  $("#related").innerHTML = rel.map(cardHTML).join("");
  initCarousel($(".carousel", root)); update(); observeReveals();
};

/* ==========================================================================
   COLOURS
   ========================================================================== */
PAGES.colours = function(){
  let fam = "All";
  $("#fam-tabs").innerHTML = ["All", ...COLOUR_FAMILIES].map(f => `<button class="chip" type="button" data-f="${esc(f)}" aria-pressed="${f === "All"}">${esc(f)}</button>`).join("");
  const grid = $("#swatch-grid");
  const render = () => {
    const list = COLOURS.filter(c => fam === "All" || c.family === fam);
    grid.innerHTML = list.map(c => `<button class="swatch-card reveal" type="button" data-hex="${c.hex}"><span class="c" style="background:${c.hex}"></span><span class="t"><strong>${esc(c.name)}</strong><small>${c.hex}</small></span></button>`).join("");
    observeReveals();
  };
  $("#fam-tabs").addEventListener("click", e => { const b = e.target.closest("[data-f]"); if (!b) return; fam = b.dataset.f; $$("#fam-tabs .chip").forEach(x => x.setAttribute("aria-pressed", x === b)); render(); });
  grid.addEventListener("click", e => { const b = e.target.closest("[data-hex]"); if (b) colourModal(colourObj(b.dataset.hex)); });
  render();
};
function colourModal(c){
  const [r, g, b] = hexToRgb(c.hex), comp = [complementHex(c.hex)].map(colourObj);
  const sugg = PRODUCTS.filter(p => /^tintable/i.test(p.colours) && ["interior", "exterior"].includes(p.category)).slice(0, 4);
  const m = openModal(`<div class="big-swatch" style="background:${c.hex}"></div><h2>${esc(c.name)}</h2>
    <p><strong>HEX</strong> ${c.hex} &nbsp; <strong>RGB</strong> ${r}, ${g}, ${b} &nbsp; <span class="muted">${esc(c.family || "")}</span></p>
    <h3>Complementary</h3><div class="comp"><span class="sw" style="background:${comp[0].hex}" title="${comp[0].hex}"></span><span class="hint" style="align-self:center">${comp[0].hex}</span></div>
    <h3 class="mt">Suggested products</h3><ul class="ticks" style="grid-template-columns:1fr">${sugg.map(p => `<li><a href="product.html?id=${p.id}">${esc(p.name)}</a> <span class="muted">— from ${fmt(fromPrice(p))}</span></li>`).join("")}</ul>
    <p class="mt"><button class="btn btn-primary" id="add-tester" type="button">Add 250ml sample (${fmt(12000)})</button></p>`, { label: c.name });
  $("#add-tester", m.el).addEventListener("click", () => {
    Cart.add({ id: "demo-tester-" + c.hex.slice(1).toLowerCase(), name: `Colour Tester – ${c.name}`, size: "250ml", price: 12000, colour: c, qty: 1 });
    toast("Sample added to cart", { text: "View Cart", href: "cart.html", act: "cart" });
  });
}

/* ==========================================================================
   VISUALIZER
   ========================================================================== */
PAGES.visualizer = function(){
  const start = { walls: "#E8EEEA", ceiling: "#FFFFFF", trim: "#FFFFFF", door: "#1B3A6B" };
  let cols = { ...start }, cur = "walls";
  const labels = { walls: "Walls", ceiling: "Ceiling", trim: "Trim", door: "Door" };
  $("#viz-stage").innerHTML = `<svg id="room" viewBox="0 0 800 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Room illustration. Click walls, ceiling, trim or door to select, then pick a colour.">
    <polygon data-surface="ceiling" points="0,0 800,0 680,90 120,90"/>
    <rect data-surface="walls" x="120" y="90" width="560" height="310"/>
    <polygon data-surface="walls" points="0,0 120,90 120,400 0,520"/>
    <polygon data-surface="walls" points="800,0 680,90 680,400 800,520"/>
    <polygon points="0,0 120,90 120,400 0,520" fill="#000" opacity=".1" pointer-events="none"/>
    <polygon points="800,0 680,90 680,400 800,520" fill="#000" opacity=".16" pointer-events="none"/>
    <polygon points="0,520 120,400 680,400 800,520" fill="#C9A77C"/><polygon points="0,520 120,400 680,400 800,520" fill="url(#fl)" opacity=".5"/>
    <defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity=".15"/></linearGradient></defs>
    <rect data-surface="trim" x="120" y="383" width="560" height="17"/>
    <polygon data-surface="trim" points="0,500 120,383 120,400 0,520"/><polygon data-surface="trim" points="800,500 680,383 680,400 800,520"/>
    <rect data-surface="trim" x="196" y="136" width="178" height="148" rx="3"/><rect x="208" y="148" width="154" height="124" fill="#BFE3F5"/><path d="M208 272l60-124h26l-60 124z" fill="#fff" opacity=".35"/><rect data-surface="trim" x="282" y="148" width="6" height="124"/><rect data-surface="trim" x="208" y="205" width="154" height="6"/>
    <rect data-surface="trim" x="462" y="156" width="136" height="244" rx="3"/><rect data-surface="door" x="474" y="168" width="112" height="232" rx="2"/><rect x="490" y="186" width="80" height="84" fill="#000" opacity=".08" pointer-events="none"/><rect x="490" y="290" width="80" height="90" fill="#000" opacity=".08" pointer-events="none"/><circle cx="568" cy="292" r="6" fill="#F6B21A" pointer-events="none"/>
    <ellipse cx="360" cy="470" rx="190" ry="30" fill="#E4312B" opacity=".85" pointer-events="none"/><ellipse cx="360" cy="470" rx="150" ry="22" fill="#F6B21A" opacity=".85" pointer-events="none"/>
    <rect x="215" y="332" width="270" height="62" rx="14" fill="#1B3A6B" pointer-events="none"/><rect x="215" y="300" width="270" height="48" rx="14" fill="#2B5499" pointer-events="none"/><rect x="200" y="320" width="34" height="74" rx="12" fill="#1B3A6B" pointer-events="none"/><rect x="466" y="320" width="34" height="74" rx="12" fill="#1B3A6B" pointer-events="none"/>
    <rect x="618" y="332" width="6" height="58" fill="#4A5058" pointer-events="none"/><path d="M600 332l40 0-10-34h-20z" fill="#F6B21A" pointer-events="none"/>
    <rect x="360" y="118" width="70" height="52" fill="#F6B21A" opacity=".0" pointer-events="none"/></svg>`;
  const svg = $("#room");
  const apply = () => {
    $$("[data-surface]", svg).forEach(el => { const s = el.dataset.surface; el.setAttribute("fill", cols[s]); el.classList.toggle("sel", s === cur); el.setAttribute("stroke", s === "trim" ? "rgba(0,0,0,.12)" : "none"); });
    $$("#surf-btns .chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.s === cur));
    $("#viz-summary").innerHTML = Object.keys(labels).map(k => `<li><span class="sw" style="background:${cols[k]};width:18px;height:18px;display:inline-block;vertical-align:middle;border-radius:50%;margin-right:8px"></span>${labels[k]}: <strong>${esc(colourObj(cols[k]).name)}</strong> <span class="muted">${cols[k]}</span></li>`).join("");
  };
  $("#surf-btns").innerHTML = Object.keys(labels).map(k => `<button class="chip" type="button" data-s="${k}" aria-pressed="false">${labels[k]}</button>`).join("");
  $("#surf-btns").addEventListener("click", e => { const b = e.target.closest("[data-s]"); if (b){ cur = b.dataset.s; apply(); } });
  svg.addEventListener("click", e => { const s = e.target.dataset && e.target.dataset.surface; if (s){ cur = s; apply(); } });
  $("#viz-swatches").innerHTML = COLOURS.map(c => swatchBtn(c, `data-hex="${c.hex}"`)).join("");
  $("#viz-swatches").addEventListener("click", e => { const b = e.target.closest("[data-hex]"); if (b){ cols[cur] = b.dataset.hex; apply(); } });
  $("#viz-reset").addEventListener("click", () => { cols = { ...start }; cur = "walls"; apply(); });
  $("#viz-quote").addEventListener("click", () => {
    safeSet("demoPaints_quote_note", "Colour scheme from the visualizer — " + Object.keys(labels).map(k => `${labels[k]}: ${colourObj(cols[k]).name} (${cols[k]})`).join("; ") + ". Please advise on suitable products and quantities.");
    openQuoteModal();
  });
  $("#viz-download").addEventListener("click", () => {
    const xml = new XMLSerializer().serializeToString(svg), img = new Image();
    img.onload = () => {
      const cv = document.createElement("canvas"); cv.width = 1600; cv.height = 1040;
      const cx = cv.getContext("2d"); cx.drawImage(img, 0, 0, 1600, 1040);
      cv.toBlob(b => { const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "demo-paints-room-scheme.png"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); });
    };
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
  });
  apply();
};

/* ==========================================================================
   CALCULATOR
   ========================================================================== */
PAGES.calculator = function(){
  const calcProducts = PRODUCTS.filter(p => /m²\/L/.test(p.coverage) && !["automotive"].includes(p.category));
  const form = $("#calc-form");
  $("#c-product", form).innerHTML = ["interior", "exterior", "roof", "wood", "primers", "industrial", "specialty"].map(cid => `<optgroup label="${esc(catName(cid))}">${calcProducts.filter(p => p.category === cid).map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join("")}</optgroup>`).join("");
  if (qs.get("id")) $("#c-product").value = qs.get("id");
  let last = null;
  const num = n => Math.max(0, parseFloat(form.elements[n].value) || 0);
  function calc(){
    const p = findProduct(form.elements.product.value); if (!p) return;
    const coats = Math.max(1, num("coats") || p.coats || 2);
    let area = 2 * (num("length") + num("width")) * num("height") - num("doors") * 1.9 - num("windows") * 1.5;
    if (form.elements.ceiling.checked) area += num("length") * num("width");
    area = Math.max(0, area);
    const litres = area * coats / coverageNum(p) * 1.05;           // 5% wastage allowance
    const tins = calcTins(litres, p);
    last = { p, area, litres, tins, coats };
    $("#r-area").textContent = area.toFixed(1) + " m²";
    $("#r-litres").textContent = litres.toFixed(1) + " " + p.sizes[0].size.replace(/[\d.]/g, "");
    $("#r-tins").textContent = area > 0 ? tinsText(tins) : "—";
    $("#r-cost").textContent = area > 0 ? fmt(tins.cost) : "—";
    $("#r-note").textContent = `${coats} coat${coats > 1 ? "s" : ""} at ${p.coverage}, incl. 5% wastage.`;
    $$("#r-actions button").forEach(b => b.disabled = area <= 0);
  }
  form.addEventListener("input", calc); form.addEventListener("submit", e => { e.preventDefault(); calc(); });
  form.elements.product.addEventListener("change", () => { const p = findProduct(form.elements.product.value); form.elements.coats.value = p.coats || 2; calc(); });
  $("#r-cart").addEventListener("click", () => { if (!last) return; last.tins.parts.forEach(x => addToCartQuiet(last.p, x)); toast("Added to cart", { text: "View Cart", href: "cart.html", act: "cart" }); });
  $("#r-quote").addEventListener("click", () => {
    if (!last) return; last.tins.parts.forEach(x => { const s = last.p.sizes.find(z => z.size === x.size); QuoteList.add({ id: last.p.id, name: last.p.name, size: s.size, price: s.price, colour: defaultColour(last.p), qty: x.n }); });
    safeSet("demoPaints_quote_note", `Calculator result: ${last.area.toFixed(1)} m², ${last.coats} coats, about ${last.litres.toFixed(1)} L needed (room ${num("length")}m × ${num("width")}m × ${num("height")}m).`);
    openQuoteModal();
  });
  function addToCartQuiet(p, x){ const s = p.sizes.find(z => z.size === x.size); Cart.add({ id: p.id, name: p.name, size: s.size, price: s.price, colour: defaultColour(p), qty: x.n }); }
  form.elements.coats.value = findProduct(form.elements.product.value).coats || 2;
  calc();
};

/* ==========================================================================
   CART
   ========================================================================== */
PAGES.cart = function(){
  const lines = $("#cart-lines"), sum = $("#cart-summary");
  function render(){
    const items = Cart.getItems(), t = Cart.getTotals();
    if (!items.length){
      lines.innerHTML = `<div class="empty">${ICON.emptyCart}<h2>Your cart is empty</h2><p>Add some colour to your project.</p><a class="btn btn-primary" href="products.html">Shop Products</a></div>`;
      sum.hidden = true; return;
    }
    sum.hidden = false;
    lines.innerHTML = items.map(i => `<div class="cart-line"><div class="thumb">${canSVG(i.colour.hex)}</div>
      <div><h3>${findProduct(i.id) ? `<a href="product.html?id=${i.id}" style="text-decoration:none">${esc(i.name)}</a>` : esc(i.name)}</h3><small>${esc(i.size)} · <span class="sw" style="background:${i.colour.hex};width:12px;height:12px;display:inline-block;border-radius:50%;vertical-align:-1px;box-shadow:0 0 0 1px var(--border)"></span> ${esc(i.colour.name)}</small><br><small>${fmt(i.price)} each</small></div>
      <div class="right"><div class="stepper"><button type="button" data-qty="${esc(i.key)}" data-d="-1" aria-label="Decrease quantity of ${esc(i.name)}">−</button><input type="number" min="1" value="${i.qty}" data-qin="${esc(i.key)}" aria-label="Quantity of ${esc(i.name)}"><button type="button" data-qty="${esc(i.key)}" data-d="1" aria-label="Increase quantity of ${esc(i.name)}">+</button></div>
      <strong>${fmt(i.price * i.qty)}</strong><button class="rm" type="button" data-rm="${esc(i.key)}">Remove</button></div></div>`).join("");
    $("#s-sub").textContent = fmt(t.subtotal);
    $("#s-disc-row").hidden = !t.discount; $("#s-disc").textContent = "− " + fmt(t.discount);
    $("#s-vat-row").hidden = !CONFIG.vatEnabled; $("#s-vat").textContent = fmt(t.vat);
    $("#s-del").textContent = t.delivery ? fmt(t.delivery) : "Free";
    $("#s-total").textContent = fmt(t.total);
    $("#s-free").textContent = t.delivery ? `Add ${fmt(CONFIG.freeDeliveryOver - t.subtotal)} more for free delivery.` : "You qualify for free delivery.";
    $("#promo-in").value = t.promo;
  }
  lines.addEventListener("change", e => { if (e.target.dataset.qin) Cart.updateQty(e.target.dataset.qin, e.target.value); });
  $("#promo-form").addEventListener("submit", e => {
    e.preventDefault(); const v = $("#promo-in").value;
    if (Cart.setPromo(v)) toast(v.trim() ? "Promo code applied" : "Promo code removed"); else toast("Invalid promo code");
  });
  $("#btn-clear").addEventListener("click", () => { if (confirm("Remove all items from your cart?")) Cart.clear(); });
  $("#btn-to-quote").addEventListener("click", () => { Cart.getItems().forEach(i => QuoteList.add(i)); location.href = "quote.html"; });
  $("#btn-checkout").addEventListener("click", checkout);
  document.addEventListener("cart:updated", render); render();
};
function checkout(){
  const t = Cart.getTotals();
  const m = openModal(`<h2>Checkout <small class="muted" style="font-size:.6em">(demo)</small></h2><form id="co-form" novalidate>
    <div class="field"><label>Full name *</label><input name="name" autocomplete="name"><span class="err"></span></div>
    <div class="field"><label>Phone *</label><input name="phone" type="tel" autocomplete="tel"><span class="err"></span></div>
    <div class="field"><label>Delivery address *</label><textarea name="address" style="min-height:80px"></textarea><span class="err"></span></div>
    <fieldset style="border:0;padding:0;margin:0 0 16px"><legend style="font-weight:600;margin-bottom:8px">Payment method</legend><div class="pay-opts">
      <label><input type="radio" name="pay" value="Mobile Money" checked> ${ico("smartphone")} Mobile Money</label><label><input type="radio" name="pay" value="Card"> ${ico("card")} Card</label><label><input type="radio" name="pay" value="Pay on Delivery"> ${ico("truck")} Pay on Delivery</label></div></fieldset>
    <p><strong>Total to pay: ${fmt(t.total)}</strong></p><button class="btn btn-primary btn-block" type="submit">Place demo order</button>
    <p class="hint center mt">No real payment is taken on this demo site.</p></form>`, { cls: "narrow", label: "Checkout" });
  const f = $("#co-form", m.el);
  const bad = (n, msg) => { const fl = f.elements[n].closest(".field"); fl.classList.toggle("invalid", !!msg); $(".err", fl).textContent = msg || ""; return !msg; };
  f.addEventListener("submit", e => {
    e.preventDefault(); let ok = true;
    ok = bad("name", f.elements.name.value.trim() ? "" : "Enter your name.") && ok;
    ok = bad("phone", f.elements.phone.value.replace(/\D/g, "").length >= 7 ? "" : "Enter a valid phone number.") && ok;
    ok = bad("address", f.elements.address.value.trim() ? "" : "Enter a delivery address.") && ok;
    if (!ok) return;
    const d = new Date(), no = `DO-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const pay = f.elements.pay.value;
    m.el.innerHTML = `<button class="modal-close" type="button" aria-label="Close dialog">${ico("x")}</button><div class="success"><div class="tick" aria-hidden="true">${ico("check")}</div><h2 style="padding:0">Demo order placed</h2><p>Order number</p><p class="ref">${no}</p><p class="muted">Payment: ${esc(pay)} · Total ${fmt(t.total)}<br>This is a demonstration — no order or payment was processed.</p><a class="btn btn-primary" href="products.html">Continue shopping</a></div>`;
    $(".modal-close", m.el).addEventListener("click", m.close);
    Cart.clear(); Cart.setPromo("");
  });
}

/* ==========================================================================
   QUOTE PAGE
   ========================================================================== */
PAGES.quote = function(){ renderQuoteForm($("#quote-form-mount")); };

/* ==========================================================================
   STORES
   ========================================================================== */
PAGES.stores = function(){
  const list = $("#store-list"), map = $("#store-map");
  const osm = (lat, lon) => `https://www.openstreetmap.org/export/embed.html?bbox=${lon - .06}%2C${lat - .04}%2C${lon + .06}%2C${lat + .04}&layer=mapnik&marker=${lat}%2C${lon}`;
  map.src = "https://www.openstreetmap.org/export/embed.html?bbox=29.4%2C-1.6%2C35.1%2C4.3&layer=mapnik";
  const render = q => {
    const rows = STORES.filter(s => !q || [s.name, s.town, s.addr].join(" ").toLowerCase().includes(q));
    list.innerHTML = rows.length ? rows.map(s => `<div class="store reveal in"><div><h3>${esc(s.name)}</h3><p>${esc(s.addr)}, ${esc(s.town)}</p><p>${ico("phone")}<a href="tel:${s.phone.replace(/\s/g, "")}">${s.phone}</a> &nbsp; ${ico("clock")}${esc(s.hours)}</p></div>
      <div class="acts"><button class="btn btn-outline btn-sm" type="button" data-map="${s.lat},${s.lon}">Show on map</button><a class="btn btn-primary btn-sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}">Get Directions</a></div></div>`).join("") : `<p class="empty">No stores match “${esc(q)}”.</p>`;
  };
  $("#store-q").addEventListener("input", e => render(e.target.value.trim().toLowerCase()));
  list.addEventListener("click", e => { const b = e.target.closest("[data-map]"); if (b){ const [a, o] = b.dataset.map.split(",").map(Number); map.src = osm(a, o); } });
  render("");
};

/* ==========================================================================
   CONTACT
   ========================================================================== */
PAGES.contact = function(){
  const f = $("#contact-form");
  if (qs.get("subject") === "dealer") f.elements.subject.value = "Become a dealer";
  const bad = (n, msg) => { const fl = f.elements[n].closest(".field"); fl.classList.toggle("invalid", !!msg); $(".err", fl).textContent = msg || ""; return !msg; };
  f.addEventListener("submit", async e => {
    e.preventDefault(); const v = n => f.elements[n].value.trim(); let ok = true;
    ok = bad("name", v("name") ? "" : "Please enter your name.") && ok;
    ok = bad("email", /^\S+@\S+\.\S+$/.test(v("email")) ? "" : "Enter a valid email address.") && ok;
    ok = bad("message", v("message").length >= 5 ? "" : "Please write a short message.") && ok;
    if (!ok) return;
    const text = `Contact form — ${v("subject")}\nName: ${v("name")}\nEmail: ${v("email")}\nPhone: ${v("phone")}\n\n${v("message")}`;
    let sent = false;
    if (QUOTE_ENDPOINT){ try { sent = (await fetch(QUOTE_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ form: "contact", name: v("name"), email: v("email"), phone: v("phone"), subject: v("subject"), message: v("message") }) })).ok; } catch(err){} }
    $("#contact-result").innerHTML = sent ? `<div class="success"><div class="tick">${ico("check")}</div><h3>Message sent</h3><p>Thank you — we'll reply shortly.</p></div>`
      : `<div class="success"><h3>Almost done</h3><p class="muted">No form endpoint is configured (demo). Send your message with:</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn btn-primary" href="mailto:${CONFIG.email}?subject=${encodeURIComponent(v("subject"))}&body=${encodeURIComponent(text)}">Email</a><a class="btn btn-accent" target="_blank" rel="noopener" href="${waLink(text)}">WhatsApp</a></div></div>`;
    f.reset();
  });
};
