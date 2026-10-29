# Demo Paints — demo paint-manufacturer website

A fictional paint brand ("Colour That Lasts.") built with plain **HTML, CSS and vanilla JavaScript** — no frameworks, no build step.
Brand, product names, prices, dealers and copy are all invented for demonstration. Stock photos load from Unsplash and fall back gracefully if unavailable.

## Run it
Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080   # then visit http://localhost:8080
```

## Structure
```
index.html  products.html  product.html  colours.html  visualizer.html  calculator.html
cart.html   quote.html     stores.html   about.html    contact.html
assets/css/style.css   design system (variables, components, responsive, dark mode)
assets/js/products.js  ALL product, colour, category and dealer data
assets/js/cart.js      Cart + QuoteList (localStorage), totals, promo codes
assets/js/main.js      config, header/footer injection, modals, search, sliders, quote form
assets/js/pages.js     per-page renderers (home, catalogue, product, colours, visualizer, …)
assets/img/            logo.svg, logo-white.svg, favicon.svg
```
The header and footer are injected from `main.js`, so they are identical on every page. Product tin images are generated as inline SVG, coloured per product.

## Add or edit products and prices
Open `assets/js/products.js`. Each product is one row in the `PRODUCTS` array:

```js
["Demo Vinyl Silk", "interior", "Emulsion", "Silk",
 "Short description…", ["Feature 1","Feature 2"], ["Plaster","Concrete"],
 "10–12 m²/L per coat", "Touch dry 1 hr, recoat 4 hrs", 2, "Clean water",
 28000,      // price per 1 L (or per 1 kg for the "kg" size set) in UGX
 "std",      // size set: std (1L/4L/20L) · kg (1/5/25 kg) · sm (0.5/1/4 L) · aut (1/4 L)
 "#1FA19A",  // tin colour
 "Best Seller", // badge: "" | New | Best Seller | Eco | Pro
 4.7,        // rating
 TINT]       // colours: TINT, a list of hex codes, or a text like "Clear"
```
- `category` must be one of: `interior, exterior, wood, roof, primers, automotive, industrial, specialty`.
- To set exact prices per size, edit the generated `sizes` after `mk()` or change `SIZE_SETS` multipliers.
- Colours live in the `COLOURS` array (`[family, name, hex]`); dealers in `STORES`.
- Change the Colour of the Year in `COLOUR_OF_THE_YEAR`.

## Settings (top of `assets/js/main.js`)
| Setting | Purpose |
|---|---|
| `QUOTE_ENDPOINT` | Form endpoint, e.g. `https://formspree.io/f/xxxxxxx`. Quote and contact forms POST JSON there. |
| `WHATSAPP_NUMBER` | International number without `+` (e.g. `256700000000`) — used by the floating button and WhatsApp fallbacks. |
| `CONFIG.vatEnabled` / `vatRate` | Toggle or change VAT (default 18%). |
| `CONFIG.deliveryFlat` / `freeDeliveryOver` | Flat delivery fee and free-delivery threshold (UGX 500,000). |
| `CONFIG.promoCodes` | Promo codes, e.g. `{ DEMO10: 0.10 }`. |
| `CONFIG.email`, `phone`, `address` | Contact details shown site-wide. |

If `QUOTE_ENDPOINT` is empty (the default), submitting a quote shows a reference like `DQ-2026-0001` with **Send by email** (`mailto:`) and **Send on WhatsApp** (`wa.me`) buttons containing the full item list.
File uploads on the quote form are a demo: only file names are included in the message.

## How cart & quote work
- `Cart` and `QuoteList` are stored in `localStorage` (`demoPaints_cart`, `demoPaints_quote`); each variant (product + size + colour) is a separate line.
- Both fire `cart:updated` / `quote:updated` events; the header badge, mini-cart drawer and cart page listen to them.
- Checkout is a demo: it shows an order number and takes no payment. Promo code `DEMO10` gives 10% off.

## Deploy
- **Netlify:** drag the `demo-paints` folder onto app.netlify.com/drop (or connect a repo, build command empty, publish directory `/`).
- **GitHub Pages:** push the folder to a repo → Settings → Pages → deploy from branch.
- **cPanel:** File Manager → `public_html` → upload and extract a zip of the folder so `index.html` sits at the root.

No server code is needed. Use HTTPS so `localStorage`, WhatsApp links and form endpoints work reliably.
