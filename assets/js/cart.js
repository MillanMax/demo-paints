/* ==========================================================================
   DEMO PAINTS — Cart & QuoteList (localStorage-backed, event-driven)
   Both stores share the same API: add, remove, updateQty, clear, getItems,
   count. Cart additionally has getTotals(). CONFIG comes from main.js and is
   only read at call time, so script order does not matter.
   ========================================================================== */
function createStore(storageKey, eventName){
  let items = [];
  try { items = JSON.parse(localStorage.getItem(storageKey)) || []; } catch(e){ items = []; }
  if (!Array.isArray(items)) items = [];

  const save = () => {
    try { localStorage.setItem(storageKey, JSON.stringify(items)); } catch(e){ /* private mode: stay in-memory */ }
    document.dispatchEvent(new CustomEvent(eventName, { detail: { count: api.count() } }));
  };
  // Variant key: product + size + colour, so each variant is its own line
  const keyOf = i => [i.id, i.size, i.colour && i.colour.name || i.colour || ""].join("|");

  const api = {
    keyOf,
    add(item){
      const qty = Math.max(1, parseInt(item.qty, 10) || 1);
      const entry = Object.assign({}, item, { qty });
      entry.key = keyOf(entry);
      const found = items.find(i => i.key === entry.key);
      if (found) found.qty += qty; else items.push(entry);
      save();
    },
    remove(key){ items = items.filter(i => i.key !== key); save(); },
    updateQty(key, qty){
      const it = items.find(i => i.key === key); if (!it) return;
      qty = parseInt(qty, 10);
      if (!qty || qty < 1) return api.remove(key);
      it.qty = Math.min(qty, 999); save();
    },
    clear(){ items = []; save(); },
    getItems(){ return items.map(i => Object.assign({}, i)); },
    count(){ return items.reduce((n, i) => n + i.qty, 0); }
  };
  return api;
}

const Cart = createStore("demoPaints_cart", "cart:updated");
const QuoteList = createStore("demoPaints_quote", "quote:updated");

/* ---- Promo handling ------------------------------------------------------ */
Cart.getPromo = function(){ try { return localStorage.getItem("demoPaints_promo") || ""; } catch(e){ return ""; } };
Cart.setPromo = function(code){
  code = (code || "").trim().toUpperCase();
  if (code && !CONFIG.promoCodes[code]) return false;
  try { code ? localStorage.setItem("demoPaints_promo", code) : localStorage.removeItem("demoPaints_promo"); } catch(e){}
  document.dispatchEvent(new CustomEvent("cart:updated", { detail: { count: Cart.count() } }));
  return true;
};

/* ---- Totals: subtotal, discount, VAT (optional), delivery, grand total --- */
Cart.getTotals = function(){
  const subtotal = Cart.getItems().reduce((s, i) => s + i.price * i.qty, 0);
  const promo = Cart.getPromo();
  const discount = promo && CONFIG.promoCodes[promo] ? Math.round(subtotal * CONFIG.promoCodes[promo]) : 0;
  const net = subtotal - discount;
  const vat = CONFIG.vatEnabled ? Math.round(net * CONFIG.vatRate) : 0;
  const delivery = (subtotal === 0 || subtotal >= CONFIG.freeDeliveryOver) ? 0 : CONFIG.deliveryFlat;
  return { subtotal, discount, promo, vat, delivery, total: net + vat + delivery };
};
