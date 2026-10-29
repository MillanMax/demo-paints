/* ==========================================================================
   DEMO PAINTS — Product & colour data (edit this file to change the catalogue)
   Every product row below is expanded by mk() into the full product object
   described in the README. Prices are UGX per 1 litre / 1 kg (ppl) and the
   other pack sizes are derived from it. Edit `ppl` to re-price a product.
   ========================================================================== */

/* ---- Categories (used by mega menu, tiles, filters, application guides) -- */
const CATEGORIES = [
  { id:"interior",   name:"Interior",              icon:"sofa", blurb:"Emulsions and finishes for walls and ceilings.", img:"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=640&q=70",
    guide:["Fill cracks and sand smooth, then remove dust.","Apply one coat of Plaster Sealer or Primer.","Apply first coat with roller; allow to dry.","Lightly sand and apply the second coat."] },
  { id:"exterior",   name:"Exterior",              icon:"building", blurb:"Weather-tough coatings for tropical sun and rain.", img:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=640&q=70",
    guide:["Pressure-wash and remove loose paint or algae.","Repair cracks with filler; prime bare masonry.","Apply the first coat by brush or roller.","Apply a second coat after the recoat time."] },
  { id:"wood",       name:"Wood Finishes",         icon:"tree", blurb:"Stains, oils and varnishes that protect timber.", img:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&q=70",
    guide:["Sand with 120–180 grit along the grain.","Remove dust with a damp cloth.","Apply thin, even coats along the grain.","Sand lightly between coats for a smooth finish."] },
  { id:"roof",       name:"Roof",                  icon:"roof", blurb:"Coatings that protect and cool iron-sheet and tile roofs.", img:"https://images.unsplash.com/photo-1632759145351-1d592919f522?w=640&q=70",
    guide:["Wire-brush rust and wash the roof; allow to dry.","Spot-prime any bare or rusty metal.","Apply the first coat with a roller or airless sprayer.","Apply a second coat for full protection."] },
  { id:"primers",    name:"Primers & Undercoats",  icon:"layers", blurb:"The foundation of every long-lasting finish.", img:"https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=640&q=70",
    guide:["Ensure the surface is clean, dry and sound.","Stir well; do not thin unless stated.","Apply an even coat and let it dry fully.","Topcoat within the stated window."] },
  { id:"automotive", name:"Automotive",            icon:"car", blurb:"Refinish systems for body shops and garages.", img:"https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=640&q=70",
    guide:["Degrease and sand the panel to the correct grit.","Apply filler and primer-surfacer where needed.","Spray topcoat in 2 even coats with flash-off.","Finish with clear coat and polish after curing."] },
  { id:"industrial", name:"Industrial & Protective",icon:"factory", blurb:"Heavy-duty coatings for floors, steel and roads.", img:"https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=640&q=70",
    guide:["Blast or grind to a clean, profiled surface.","Apply primer to specification.","Apply topcoat in the stated film thickness.","Allow full cure before heavy traffic or service."] },
  { id:"specialty",  name:"Specialty & Textured",  icon:"sparkles", blurb:"Decorative textures, metallics and waterproofing.", img:"https://images.unsplash.com/photo-1615529182904-14819c35db37?w=640&q=70",
    guide:["Prepare and prime the surface.","Mix thoroughly before use.","Apply with the recommended tool for the effect.","Seal where specified and allow to cure."] }
];

/* ---- Colour library (~80 named swatches in 9 families) ------------------ */
const COLOUR_FAMILIES = ["Whites & Neutrals","Reds & Pinks","Oranges","Yellows","Greens","Blues","Purples","Browns & Earth","Greys & Blacks"];
const COLOURS = [
  ["Whites & Neutrals","Pure Cotton","#FFFFFF"],["Whites & Neutrals","Snow Peak","#FAFAFA"],["Whites & Neutrals","Magnolia Cream","#F3E9D2"],
  ["Whites & Neutrals","Nile Mist","#E8EEEA"],["Whites & Neutrals","Soft Linen","#EFE6D8"],["Whites & Neutrals","Ivory Dune","#F5EFDC"],
  ["Whites & Neutrals","Pearl Shell","#EDE8E0"],["Whites & Neutrals","Warm Sand","#E3D5BC"],["Whites & Neutrals","Oat Milk","#E9DFC9"],["Whites & Neutrals","Chalk Hill","#F2F0EA"],
  ["Reds & Pinks","Kampala Sunset","#E4312B"],["Reds & Pinks","Hibiscus","#C8283B"],["Reds & Pinks","Rose Petal","#F4B6C2"],["Reds & Pinks","Flamingo Blush","#F7A9A0"],
  ["Reds & Pinks","Brick Lane","#B5432F"],["Reds & Pinks","Cherry Pop","#D7263D"],["Reds & Pinks","Coral Reef","#F26B5B"],["Reds & Pinks","Dusty Rose","#D9A5A0"],["Reds & Pinks","Wine Gum","#8E1B3A"],
  ["Oranges","Mango Fire","#F58A1F"],["Oranges","Terracotta","#C9643B"],["Oranges","Papaya","#FFA45B"],["Oranges","Burnt Amber","#CC5500"],
  ["Oranges","Peach Fuzz","#FFC9A0"],["Oranges","Pumpkin Patch","#E8731A"],["Oranges","Copper Kettle","#B8652E"],["Oranges","Apricot Dawn","#FBC08A"],
  ["Yellows","Savannah Gold","#F6B21A"],["Yellows","Sunflower","#FFC72C"],["Yellows","Lemon Zest","#F7E35A"],["Yellows","Banana Cream","#FBE9A0"],
  ["Yellows","Honey Pot","#E5A82B"],["Yellows","Mustard Seed","#D9A521"],["Yellows","Butter Cup","#FFE08A"],["Yellows","Straw Hat","#EBD58B"],
  ["Greens","Rwenzori Moss","#5B7A3A"],["Greens","Banana Leaf","#7BAE4B"],["Greens","Tea Estate","#3E7C45"],["Greens","Mint Breeze","#B6E2C6"],
  ["Greens","Sage Whisper","#A9BBA0"],["Greens","Forest Canopy","#1F4D36"],["Greens","Lime Splash","#B5D334"],["Greens","Papyrus","#8FA66B"],["Greens","Teal Lagoon","#1FA19A"],
  ["Blues","Lake Victoria","#2B6CB0"],["Blues","Deep Navy","#1B3A6B"],["Blues","Sky Morning","#A8D0F0"],["Blues","Ice Blue","#D6E8F5"],
  ["Blues","Cobalt Dream","#2F5DA8"],["Blues","Peacock","#0E7C86"],["Blues","Powder Haze","#BCD4E6"],["Blues","Midnight Ink","#14284B"],["Blues","Turquoise Tide","#3FC1C0"],
  ["Purples","Jacaranda","#8E6BBF"],["Purples","Lavender Fields","#C9B8E6"],["Purples","Plum Velvet","#5C2A5E"],["Purples","Orchid Bloom","#B565A7"],
  ["Purples","Violet Dusk","#6A4C93"],["Purples","Lilac Whisper","#DCD0EE"],["Purples","Grape Soda","#7B3F9E"],["Purples","Heather","#A593C4"],["Purples","Mauve Mist","#BFA2C8"],
  ["Browns & Earth","Rich Mahogany","#6B3A2A"],["Browns & Earth","Red Earth","#A0522D"],["Browns & Earth","Coffee Bean","#4B2E22"],["Browns & Earth","Clay Pot","#B77A56"],
  ["Browns & Earth","Teak Gold","#A87843"],["Browns & Earth","Caramel Drizzle","#C68E52"],["Browns & Earth","Mud Hut","#8B6B4E"],["Browns & Earth","Cocoa Dust","#7A5C48"],["Browns & Earth","Walnut Shell","#5E4332"],
  ["Greys & Blacks","Rhino Grey","#6E7378"],["Greys & Blacks","Cloud Nine","#D9DCDF"],["Greys & Blacks","Slate Roof","#4A5058"],["Greys & Blacks","Charcoal","#2E3238"],
  ["Greys & Blacks","Jet Black","#121316"],["Greys & Blacks","Silver Lining","#B8BDC2"],["Greys & Blacks","Ash Wood","#9CA0A4"],["Greys & Blacks","Smoke Signal","#8A8F94"],["Greys & Blacks","Storm Front","#3C4147"]
].map(([family,name,hex]) => ({ family, name, hex }));

const COLOUR_OF_THE_YEAR = { name:"Teal Lagoon", hex:"#1FA19A", blurb:"A calm, confident blue-green inspired by Uganda's crater lakes — fresh in living rooms, striking on front doors." };

/* ---- Product builder ----------------------------------------------------- */
const TINT = "Tintable – 1,000+ colours";
const C_ENAMEL = ["#FFFFFF","#121316","#E4312B","#1B3A6B","#F6B21A","#5B7A3A","#6E7378","#6B3A2A"];
const C_WOOD   = ["#A87843","#6B3A2A","#C68E52","#4B2E22","#8B6B4E","#5E4332"];
const C_ROOF   = ["#E4312B","#1F4D36","#4A5058","#6B3A2A","#1B3A6B","#B5432F"];
const C_AUTO   = ["#FFFFFF","#121316","#B8BDC2","#E4312B","#1B3A6B","#2E3238"];
const C_FLOOR  = ["#6E7378","#B8BDC2","#1F4D36","#B5432F","#1B3A6B","#F6B21A"];
const C_POOL   = ["#2B6CB0","#3FC1C0","#FFFFFF","#A8D0F0"];

const SIZE_SETS = {            // [label, price multiplier vs ppl]
  std: [["1L",1],["4L",3.6],["20L",16.5]],
  kg:  [["1kg",1],["5kg",4.6],["25kg",21]],
  sm:  [["0.5L",0.6],["1L",1],["4L",3.6]],
  aut: [["1L",1],["4L",3.7]]
};
const round500 = n => Math.round(n / 500) * 500;
const slug = s => s.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
const AREA = { interior:["interior"], exterior:["exterior"], roof:["exterior"], wood:["interior","exterior"], primers:["interior","exterior"], specialty:["interior","exterior"], automotive:[], industrial:[] };

/* row: [name, cat, subcategory, finish, shortDesc, features, surfaces, coverage, dryingTime, coats, thinner, ppl, sizeSet, canColour, badge, rating, colours] */
function mk(r){
  const [name,cat,sub,finish,shortDesc,features,surfaces,coverage,dryingTime,coats,thinner,ppl,set,canColour,badge,rating,colours] = r;
  return {
    id: "demo-" + slug(name.replace(/^Demo /,"")), name, category: cat, subcategory: sub, finish, shortDesc,
    description: shortDesc + " Formulated by the Demo Paints lab for East African conditions — intense sun, heavy rain and humidity — and batch-tested for consistency before it leaves the factory. (Fictional demo product.)",
    features, surfaces, coverage, dryingTime, coats, thinner,
    sizes: SIZE_SETS[set].map(([size,m]) => ({ size, price: round500(ppl*m) })),
    colours: colours || TINT, canColour, badge: badge || "", rating, area: AREA[cat]
  };
}

const PRODUCTS = [
/* ---------- Interior ---------- */
["Demo Vinyl Matt","interior","Emulsion","Matt","Smooth, velvety matt emulsion that hides small wall imperfections.",["Washable","Low odour","Great hiding power"],["Plaster","Concrete","Board"],"10–12 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Clean water",26000,"std","#F3E9D2","Best Seller",4.6],
["Demo Vinyl Silk","interior","Emulsion","Silk","A soft sheen for living rooms and bedrooms that wipes clean easily.",["Washable","Low odour","Mould resistant"],["Plaster","Concrete","Board"],"10–12 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Clean water",28000,"std","#1FA19A","Best Seller",4.7],
["Demo Supersoft Sheen","interior","Emulsion","Sheen","Premium low-sheen finish with a silky, luxurious feel.",["Ultra smooth","Stain resistant","Low VOC"],["Plaster","Concrete","Board"],"11–13 m²/L per coat","Touch dry 45 min, recoat 3 hrs",2,"Clean water",34000,"std","#C9B8E6","New",4.8],
["Demo Kitchen & Bath","interior","Emulsion","Mid-sheen","Anti-mould formula built for steamy kitchens and bathrooms.",["Anti-mould","Moisture resistant","Wipeable"],["Plaster","Concrete","Tiles (primed)"],"10–12 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Clean water",32000,"std","#3FC1C0","Pro",4.5],
["Demo Kids Wash & Wipe","interior","Emulsion","Silk","Scrubbable paint that shrugs off crayon, sticky fingers and spills.",["Scrub resistant","Low VOC","Stain release"],["Plaster","Board"],"10–12 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Clean water",33000,"std","#F7A9A0","Eco",4.6],
["Demo Economy Matt","interior","Emulsion","Matt","Budget-friendly matt for large projects and rental units.",["Value pack","Easy to apply","Good opacity"],["Plaster","Concrete"],"8–10 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Clean water",16000,"std","#E3D5BC","",4.1],
["Demo Ceiling White","interior","Emulsion","Ultra-matt","Brilliant white ultra-matt made for ceilings — no spatter, no shine.",["Non-drip","Bright white","Fast drying"],["Plaster","Board"],"12–14 m²/L per coat","Touch dry 30 min, recoat 2 hrs",2,"Clean water",21000,"std","#FFFFFF","",4.4,"Brilliant White"],
["Demo Eggshell Satin","interior","Water-based Satin","Eggshell","Water-based satin for doors, trim and feature walls.",["Quick drying","Non-yellowing","Low odour"],["Wood","Metal (primed)","Plaster"],"12–14 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Clean water",38000,"std","#EFE6D8","",4.5],
/* ---------- Exterior ---------- */
["Demo WeatherGuard Exterior","exterior","Masonry Paint","Matt","All-round exterior masonry paint with strong UV and rain resistance.",["5-year protection","UV resistant","Water repellent"],["Plaster","Concrete","Brick"],"9–11 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Clean water",36000,"std","#E4312B","Best Seller",4.7],
["Demo WeatherGuard Plus","exterior","Masonry Paint","Silk","Our 10-year premium exterior system with advanced fade-lock pigments.",["10-year warranty","Fade-lock colour","Dirt pick-up resistant"],["Plaster","Concrete","Brick"],"9–11 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Clean water",48000,"std","#1B3A6B","Pro",4.9],
["Demo Pure Acrylic Masonry","exterior","Masonry Paint","Matt","100% acrylic binder for superb adhesion and flexibility.",["100% acrylic","Breathable","Flexible film"],["Plaster","Concrete","Fibre cement"],"9–11 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Clean water",42000,"std","#F6B21A","",4.6],
["Demo Anti-Algae Shield","exterior","Masonry Paint","Matt","Fights green and black algae on humid, shaded walls.",["Anti-algae","Anti-fungal","Self-cleaning effect"],["Plaster","Concrete","Brick"],"9–11 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Clean water",44000,"std","#7BAE4B","New",4.5],
["Demo Smooth Exterior Silk","exterior","Masonry Paint","Silk","A smooth silk sheen that sheds dust and washes clean in the rain.",["Easy clean","Colour retention","Mould resistant"],["Plaster","Concrete"],"10–12 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Clean water",40000,"std","#A8D0F0","",4.4],
["Demo Elastomeric Crack Bridge","exterior","Elastomeric Coating","Smooth","Stretchy coating that bridges hairline cracks and keeps water out.",["Bridges 1 mm cracks","Waterproof","Elastic"],["Plaster","Concrete"],"4–5 m²/L per coat","Touch dry 2 hrs, recoat 6 hrs",2,"Clean water",54000,"std","#8A8F94","Pro",4.7],
/* ---------- Enamels & Gloss ---------- */
["Demo Super Gloss Enamel","exterior","Enamel","Gloss","Mirror-like high gloss enamel for wood and metal, indoors and out.",["High gloss","Weather resistant","Hard wearing"],["Wood","Metal","Primed surfaces"],"12–14 m²/L per coat","Touch dry 4 hrs, recoat 16 hrs",2,"Mineral turpentine",46000,"sm","#E4312B","Best Seller",4.7,C_ENAMEL],
["Demo Satin Enamel","interior","Enamel","Satin","Smooth satin enamel with a refined, low-glare finish.",["Soft sheen","Durable","Easy brush-out"],["Wood","Metal","Primed surfaces"],"12–14 m²/L per coat","Touch dry 4 hrs, recoat 16 hrs",2,"Mineral turpentine",44000,"sm","#1B3A6B","",4.5,C_ENAMEL],
["Demo Quick-Dry Enamel","industrial","Enamel","Gloss","Fast-curing enamel for workshops, gates and railings.",["Dries in 2 hrs","Rust inhibiting","Tough film"],["Metal","Wood"],"12–14 m²/L per coat","Touch dry 1 hr, recoat 4 hrs",2,"Mineral turpentine",47000,"sm","#F6B21A","New",4.4,C_ENAMEL],
["Demo Metal Hammertone","industrial","Enamel","Hammered","Hammered-effect finish that hides welds and surface flaws on metal.",["Hides imperfections","Rust protection","Direct to metal"],["Metal","Steel gates","Machinery"],"8–10 m²/L per coat","Touch dry 2 hrs, recoat 8 hrs",2,"Mineral turpentine",52000,"sm","#6E7378","",4.5,["#6E7378","#2E3238","#1B3A6B","#1F4D36","#B8BDC2"]],
/* ---------- Wood ---------- */
["Demo Wood Stain Classic","wood","Wood Stain","Satin","Rich, transparent stain that lets the grain shine through.",["Enhances grain","UV filters","Fade resistant"],["Interior wood","Exterior wood","Doors"],"12–14 m²/L per coat","Touch dry 2 hrs, recoat 6 hrs",2,"Mineral turpentine",42000,"sm","#A87843","Best Seller",4.6,C_WOOD],
["Demo Deck Oil","wood","Wood Oil","Natural","Penetrating oil that nourishes and waterproofs decks and garden furniture.",["Water repellent","UV protection","Easy re-coat"],["Decking","Garden furniture","Fences"],"10–12 m²/L per coat","Touch dry 4 hrs, recoat 8 hrs",2,"Mineral turpentine",48000,"sm","#C68E52","Eco",4.7,C_WOOD],
["Demo PU Varnish Clear","wood","Varnish","Gloss / Matt","Crystal-clear polyurethane varnish in gloss or matt.",["Scratch resistant","Non-yellowing","Heat resistant"],["Furniture","Doors","Panelling"],"12–14 m²/L per coat","Touch dry 3 hrs, recoat 8 hrs",3,"Mineral turpentine",45000,"sm","#F3E9D2","Best Seller",4.6,"Clear (gloss or matt)"],
["Demo Floor Varnish","wood","Varnish","Satin","Heavy-duty varnish for timber floors and stairs.",["Abrasion resistant","Water resistant","Long lasting"],["Timber floors","Stairs","Parquet"],"10–12 m²/L per coat","Touch dry 4 hrs, recoat 10 hrs",3,"Mineral turpentine",56000,"sm","#C68E52","Pro",4.5,"Clear"],
["Demo Yacht Varnish","wood","Varnish","Gloss","Marine-grade gloss varnish for boats, jetties and exposed timber.",["Marine grade","Flexible","UV stable"],["Boats","Jetties","Exterior timber"],"12–14 m²/L per coat","Touch dry 5 hrs, recoat 16 hrs",3,"Mineral turpentine",62000,"sm","#A87843","Pro",4.8,"Clear"],
["Demo Wood Preserver","wood","Preservative","Natural","Protects timber against termites, rot and fungal decay.",["Anti-termite","Anti-rot","Deep penetration"],["Roof timbers","Fences","Poles"],"6–8 m²/L per coat","Touch dry 2 hrs, recoat 6 hrs",2,"Not required",32000,"std","#8B6B4E","",4.4,["#8B6B4E","#5E4332"]],
["Demo Sanding Sealer","wood","Sealer","Matt","Fast-sanding sealer that gives a flawless base under varnish or lacquer.",["Sands to powder","Seals grain","Fast drying"],["Bare wood","Furniture"],"12–14 m²/L per coat","Touch dry 30 min, recoat 1 hr",1,"Mineral turpentine",36000,"sm","#EBD58B","",4.3,"Clear"],
["Demo Wood Filler","wood","Filler","Matt","Ready-mixed filler for holes, dents and cracks in timber.",["Sandable","Paintable","Doesn't shrink"],["Wood","Board"],"Approx. 10 m²/kg (filling)","Sandable in 2 hrs",1,"Not required",24000,"kg","#C68E52","",4.2,["#F3E9D2","#C68E52","#6B3A2A"]],
/* ---------- Roof ---------- */
["Demo Roof Guard","roof","Roof Paint","Satin","Tough rust-blocking coating for iron-sheet roofs.",["Rust inhibiting","Waterproof","Heat reflective"],["Iron sheets","Galvanised steel"],"8–10 m²/L per coat","Touch dry 2 hrs, recoat 6 hrs",2,"Clean water",39000,"std","#B5432F","Best Seller",4.7,C_ROOF],
["Demo Tile Roof Paint","roof","Roof Paint","Gloss","Vibrant, fade-resistant paint for concrete and clay roof tiles.",["Fade resistant","Algae resistant","Flexible"],["Concrete tiles","Clay tiles"],"7–9 m²/L per coat","Touch dry 2 hrs, recoat 6 hrs",2,"Clean water",43000,"std","#1F4D36","",4.5,C_ROOF],
["Demo Cool-Roof Reflective","roof","Roof Paint","Matt","Solar-reflective white coating that cuts heat gain by up to 20%.",["Heat reflective","Energy saving","Waterproof"],["Iron sheets","Concrete","Tiles"],"6–8 m²/L per coat","Touch dry 2 hrs, recoat 6 hrs",2,"Clean water",52000,"std","#FFFFFF","Eco",4.8,["#FFFFFF","#EDE8E0","#D9DCDF"]],
["Demo Galvanised Primer","roof","Primer","Matt","Etch primer that bonds paint to new galvanised iron sheets.",["Etching action","Adhesion promoter","Rust barrier"],["New iron sheets","Galvanised steel"],"10–12 m²/L","Touch dry 30 min, recoat 2 hrs",1,"Mineral turpentine",35000,"std","#8A8F94","",4.4,"Grey"],
/* ---------- Primers ---------- */
["Demo Alkali-Resistant Primer","primers","Primer","Matt","Seals fresh plaster and resists alkali attack on new walls.",["Alkali resistant","Excellent adhesion","Low odour"],["New plaster","Concrete","Brick"],"10–12 m²/L","Touch dry 1 hr, recoat 4 hrs",1,"Clean water",25000,"std","#FFFFFF","Pro",4.5,"White"],
["Demo Universal Undercoat","primers","Undercoat","Matt","Opaque undercoat that builds depth and hides previous colours.",["High opacity","Easy to sand","Fast drying"],["Wood","Metal (primed)"],"12–14 m²/L","Touch dry 2 hrs, recoat 6 hrs",1,"Mineral turpentine",34000,"sm","#E9DFC9","",4.3,["#FFFFFF","#6E7378"]],
["Demo Red Oxide Primer","primers","Metal Primer","Matt","Classic rust-inhibiting primer for steel and ironwork.",["Anti-rust","Strong adhesion","Fast drying"],["Steel","Iron","Gates"],"10–12 m²/L","Touch dry 1 hr, recoat 6 hrs",1,"Mineral turpentine",33000,"sm","#A0522D","Best Seller",4.5,"Red oxide"],
["Demo Plaster Sealer","primers","Sealer","Matt","Water-based sealer that reduces porosity and saves topcoat.",["Reduces absorption","Binds chalky surfaces","Low VOC"],["Plaster","Board","Concrete"],"10–14 m²/L","Touch dry 1 hr, recoat 3 hrs",1,"Clean water",22000,"std","#F2F0EA","Eco",4.4,"White"],
["Demo Wall Putty / Skim Coat","primers","Filler","Smooth","Polymer-modified putty for a glass-smooth wall surface.",["Ultra smooth","Strong adhesion","Crack resistant"],["Plaster","Concrete"],"1.2–1.5 m²/kg (2 coats)","Sandable in 6 hrs",2,"Clean water",3800,"kg","#FFFFFF","Pro",4.6,"White"],
/* ---------- Automotive ---------- */
["Demo AutoCoat 2K Topcoat","automotive","Topcoat","Gloss","Two-pack polyurethane topcoat with showroom depth and durability.",["Showroom gloss","Chip resistant","Fast cure"],["Car panels","Trucks","Motorbikes"],"6–8 m²/L (2 coats)","Dust free 30 min, hard 8 hrs",2,"Demo Auto Thinner",95000,"aut","#E4312B","Pro",4.8,C_AUTO],
["Demo AutoCoat Clear Coat","automotive","Clear Coat","Gloss","High-solids clear that locks in colour and resists UV and fuel.",["UV stable","Polishable","Fuel resistant"],["Basecoat","Car panels"],"6–8 m²/L (2 coats)","Dust free 30 min, hard 8 hrs",2,"Demo Auto Thinner",88000,"aut","#F3E9D2","Best Seller",4.7,"Clear"],
["Demo Primer Surfacer","automotive","Primer","Matt","High-build primer that fills sanding scratches and levels panels.",["High build","Easy sanding","Corrosion barrier"],["Steel","Filler","Old paint"],"5–7 m²/L (2 coats)","Sandable in 1 hr",2,"Demo Auto Thinner",72000,"aut","#8A8F94","",4.5,["#8A8F94","#FFFFFF","#2E3238"]],
["Demo Body Filler","automotive","Filler","Matt","Lightweight polyester filler for dents and body repairs.",["Easy spread","Sands smooth","No pinholes"],["Steel","Aluminium","Fibreglass"],"Approx. 2 m²/kg (3 mm)","Sandable in 20 min",1,"Not required",18000,"kg","#B5432F","",4.4,"Grey (with hardener)"],
["Demo Auto Thinner","automotive","Thinner","—","Fast, clean-flashing thinner for 2K and cellulose paint systems.",["Fast flash","Clean cut","Consistent"],["Spray equipment","Paint reduction"],"As per mix ratio","Flash-off 5–10 min",0,"—",22000,"aut","#B8BDC2","",4.3,"Clear"],
/* ---------- Industrial ---------- */
["Demo Epoxy Floor Coat","industrial","Floor Coating","Gloss","Two-pack epoxy that makes factory and garage floors tough and easy to clean.",["Chemical resistant","Abrasion resistant","Seamless finish"],["Concrete floors","Garages","Warehouses"],"6–8 m²/L per coat","Touch dry 6 hrs, light traffic 24 hrs",2,"Epoxy thinner",78000,"std","#6E7378","Pro",4.7,C_FLOOR],
["Demo Road Marking Paint","industrial","Road Paint","Matt","Fast-drying, reflective-ready road and car-park line paint.",["Fast drying","Reflective-ready","Abrasion resistant"],["Asphalt","Concrete"],"4–6 m²/L","Touch dry 20 min, traffic 1 hr",1,"Mineral turpentine",36000,"std","#F6B21A","",4.4,["#FFFFFF","#F6B21A","#E4312B"]],
["Demo Zinc-Rich Primer","industrial","Primer","Matt","90% zinc-rich primer for long-term steel corrosion protection.",["Galvanic protection","Heavy duty","Marine suitable"],["Structural steel","Pipes","Tanks"],"5–7 m²/L","Touch dry 1 hr, recoat 6 hrs",1,"Epoxy thinner",85000,"std","#B8BDC2","Pro",4.8,"Grey"],
["Demo Anti-Corrosion Enamel","industrial","Enamel","Gloss","Durable topcoat that guards steelwork against rust in harsh conditions.",["Anti-rust","Weatherproof","High gloss"],["Steel","Machinery","Pipes"],"10–12 m²/L","Touch dry 3 hrs, recoat 12 hrs",2,"Mineral turpentine",49000,"sm","#1B3A6B","",4.5,C_ENAMEL],
["Demo Heat-Resistant Silver","industrial","Specialty Enamel","Metallic","Silicone aluminium paint for chimneys, boilers and exhausts up to 600°C.",["Resists 600°C","Rust inhibiting","Metallic finish"],["Boilers","Chimneys","Exhausts"],"8–10 m²/L","Touch dry 1 hr, recoat 4 hrs",2,"Mineral turpentine",65000,"sm","#B8BDC2","",4.6,["#B8BDC2","#121316"]],
/* ---------- Specialty ---------- */
["Demo Texture Coat","specialty","Textured","Fine / Coarse","Decorative textured coating — choose fine or coarse grain.",["Hides wall flaws","Weatherproof","Colourfast"],["Plaster","Concrete","Brick"],"1.5–2.5 m²/kg","Touch dry 3 hrs, cure 24 hrs",1,"Clean water",9500,"kg","#C68E52","Best Seller",4.6,TINT],
["Demo Marble Effect","specialty","Decorative","Polished","Create a polished marble look on feature walls with a simple two-step kit.",["Luxury look","Easy to apply","Washable"],["Plaster","Board"],"6–8 m²/L","Touch dry 2 hrs, polish after 24 hrs",2,"Clean water",78000,"sm","#EDE8E0","New",4.5,["#FFFFFF","#EDE8E0","#B8BDC2","#2E3238"]],
["Demo Metallic Gold","specialty","Decorative","Metallic","Brilliant metallic gold for accents, mouldings and signage.",["Metallic shimmer","Interior/exterior","Great coverage"],["Wood","Metal","Plaster"],"10–12 m²/L","Touch dry 1 hr, recoat 4 hrs",2,"Mineral turpentine",72000,"sm","#F6B21A","",4.4,["#F6B21A","#B8BDC2","#B8652E"]],
["Demo Waterproofing Coat","specialty","Waterproofing","Smooth","Flexible cementitious coating that stops leaks on roofs, tanks and basements.",["Waterproof","Flexible","Crack bridging"],["Roof slabs","Tanks","Basements"],"3–4 m²/L per coat","Touch dry 3 hrs, recoat 6 hrs",2,"Clean water",58000,"std","#1FA19A","Pro",4.7,["#FFFFFF","#8A8F94","#1FA19A"]],
["Demo Swimming Pool Paint","specialty","Pool Paint","Gloss","Chlorinated-rubber pool paint that resists chlorine, algae and UV.",["Chlorine resistant","Anti-algae","Gloss finish"],["Concrete pools","Plaster pools"],"6–8 m²/L per coat","Touch dry 3 hrs, immerse after 7 days",2,"Pool thinner",88000,"std","#3FC1C0","",4.5,C_POOL]
].map(mk);

/* ---- Fictional dealers (stores.html) ------------------------------------- */
const STORES = [
  { name:"Demo Paints Kampala Central", town:"Kampala", addr:"Plot 00, Industrial Area", phone:"+256 700 000 001", hours:"Mon–Sat 8:00–18:00", lat:0.3136, lon:32.5811 },
  { name:"Demo Colour Centre Entebbe",  town:"Entebbe", addr:"Kampala Rd, Entebbe",      phone:"+256 700 000 002", hours:"Mon–Sat 8:30–17:30", lat:0.0512, lon:32.4637 },
  { name:"Demo Paints Mukono",          town:"Mukono",  addr:"Jinja Rd, Mukono Town",    phone:"+256 700 000 003", hours:"Mon–Sat 8:00–18:00", lat:0.3533, lon:32.7553 },
  { name:"Demo Paints Jinja",           town:"Jinja",   addr:"Main St, Jinja",           phone:"+256 700 000 004", hours:"Mon–Sat 8:00–17:30", lat:0.4244, lon:33.2041 },
  { name:"Demo Paints Mbarara",         town:"Mbarara", addr:"High St, Mbarara",         phone:"+256 700 000 005", hours:"Mon–Sat 8:00–18:00", lat:-0.6072, lon:30.6545 },
  { name:"Demo Paints Gulu",            town:"Gulu",    addr:"Olya Rd, Gulu",            phone:"+256 700 000 006", hours:"Mon–Sat 8:00–17:30", lat:2.7746, lon:32.2990 },
  { name:"Demo Paints Mbale",           town:"Mbale",   addr:"Republic St, Mbale",       phone:"+256 700 000 007", hours:"Mon–Sat 8:00–17:30", lat:1.0821, lon:34.1751 },
  { name:"Demo Paints Fort Portal",     town:"Fort Portal", addr:"Kyebambe Rd, Fort Portal", phone:"+256 700 000 008", hours:"Mon–Sat 8:30–17:30", lat:0.6710, lon:30.2748 },
  { name:"Demo Paints Masaka",          town:"Masaka",  addr:"Kampala Rd, Masaka",       phone:"+256 700 000 009", hours:"Mon–Sat 8:00–17:30", lat:-0.3310, lon:31.7341 },
  { name:"Demo Paints Arua",            town:"Arua",    addr:"Avenue Rd, Arua",          phone:"+256 700 000 010", hours:"Mon–Sat 8:30–17:00", lat:3.0201, lon:30.9110 }
];
