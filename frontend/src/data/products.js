// Pexels image helper — stable CDN, images never deleted
const img = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1`

export const CATEGORIES = [
  { id: 'all',        label: 'All Products',       icon: '🛒',  color: 'from-forest-400 to-forest-600',  desc: 'Everything fresh' },
  { id: 'vegetables', label: 'Vegetables',          icon: '🥦',  color: 'from-green-400 to-green-600',    desc: 'Farm-fresh picks' },
  { id: 'fruits',     label: 'Fruits',              icon: '🍎',  color: 'from-orange-400 to-red-500',     desc: 'Seasonal goodness' },
  { id: 'oils',       label: 'Wood-Pressed Oils',   icon: '🫙',  color: 'from-amber-500 to-yellow-600',   desc: 'Cold-pressed purity' },
  { id: 'microgreens',label: 'Microgreens',         icon: '🌱',  color: 'from-lime-400 to-green-500',     desc: 'Subscribe & save' },
  { id: 'mushrooms',  label: 'Mushrooms',           icon: '🍄',  color: 'from-stone-400 to-stone-600',    desc: 'Gourmet varieties' },
  { id: 'grains',     label: 'Whole Grains',        icon: '🌾',  color: 'from-yellow-500 to-amber-600',   desc: 'Ancient superfoods' },
  { id: 'millets',    label: 'Millets',             icon: '🌿',  color: 'from-teal-400 to-teal-600',      desc: 'Gluten-free grains' },
  { id: 'eggs',       label: 'Eggs & Meat',         icon: '🥚',  color: 'from-rose-400 to-rose-600',      desc: 'Farm-raised protein' },
  { id: 'flours',     label: 'Stone-Ground Flours', icon: '🫙',  color: 'from-orange-300 to-amber-500',   desc: 'Traditional milling' },
]

export const INITIAL_PRODUCTS = [
  // ── VEGETABLES ──────────────────────────────────────────────────────────
  {
    id: 'v1', name: 'Farm Tomatoes', category: 'vegetables',
    price: 45, unit: '500g', stock: 50, featured: true,
    image: img(1327838),
    description: 'Vine-ripened juicy red tomatoes, hand-picked at peak freshness from our farms every morning.',
    variants: [{ label: '500g', price: 45 }, { label: '1kg', price: 85 }],
  },
  {
    id: 'v2', name: 'Organic Carrots', category: 'vegetables',
    price: 40, unit: '500g', stock: 30,
    image: img(143133),
    description: 'Crunchy sweet carrots grown without pesticides. Rich in beta-carotene and antioxidants.',
    variants: [{ label: '500g', price: 40 }, { label: '1kg', price: 75 }],
  },
  {
    id: 'v3', name: 'Fresh Broccoli', category: 'vegetables',
    price: 60, unit: '500g', stock: 15, featured: true,
    image: img(1300972),
    description: 'Tight green florets, rich in fibre and vitamins. Delivered within hours of harvest.',
    variants: [{ label: '500g', price: 60 }, { label: '1kg', price: 115 }],
  },
  {
    id: 'v4', name: 'Baby Spinach', category: 'vegetables',
    price: 35, unit: '250g', stock: 40,
    image: img(2325843),
    description: 'Tender baby spinach leaves, triple-washed and ready to eat. Perfect for salads and smoothies.',
    variants: [{ label: '250g', price: 35 }, { label: '500g', price: 65 }],
  },
  {
    id: 'v5', name: 'Bell Peppers (Mixed)', category: 'vegetables',
    price: 75, unit: '500g', stock: 20,
    image: img(594137),
    description: 'Colourful trio of red, green and yellow bell peppers — sweet, crunchy, versatile.',
    variants: [{ label: '500g', price: 75 }, { label: '1kg', price: 145 }],
  },
  {
    id: 'v6', name: 'Red Onions', category: 'vegetables',
    price: 35, unit: '1kg', stock: 60,
    image: img(533360),
    description: 'Sharp flavourful red onions, kitchen essential for every Indian household.',
    variants: [{ label: '1kg', price: 35 }, { label: '3kg', price: 100 }],
  },
  {
    id: 'v7', name: 'Farm Potatoes', category: 'vegetables',
    price: 30, unit: '1kg', stock: 80,
    image: img(2286776),
    description: 'Starchy, firm potatoes ideal for curries, fries and everyday cooking.',
    variants: [{ label: '1kg', price: 30 }, { label: '3kg', price: 85 }, { label: '5kg', price: 135 }],
  },
  {
    id: 'v8', name: 'Cucumber', category: 'vegetables',
    price: 30, unit: '500g', stock: 35,
    image: img(3735166),
    description: 'Cool, crisp cucumbers straight from the vine. Hydrating and refreshing.',
    variants: [{ label: '500g', price: 30 }, { label: '1kg', price: 55 }],
  },
  {
    id: 'v9', name: 'Green Peas', category: 'vegetables',
    price: 80, unit: '500g', stock: 0,
    image: '/images/green-peas.jpg',
    description: 'Sweet tender green peas, farm-shelled fresh. In season only.',
    variants: [{ label: '500g', price: 80 }, { label: '1kg', price: 155 }],
    notifyOnRestock: true,
  },

  // ── FRUITS ──────────────────────────────────────────────────────────────
  {
    id: 'f1', name: 'Alphonso Mangoes', category: 'fruits',
    price: 350, unit: 'kg', stock: 25, featured: true,
    image: img(2253819),
    description: 'King of fruits — authentic Alphonso mangoes from Ratnagiri. GI-tagged, unmatched sweetness.',
    variants: [{ label: '1kg (4–6 pcs)', price: 350 }, { label: '2kg (8–12 pcs)', price: 680 }],
  },
  {
    id: 'f2', name: 'Kerala Bananas', category: 'fruits',
    price: 60, unit: 'dozen', stock: 50,
    image: img(1093038),
    description: 'Naturally ripened sweet Robusta bananas from Kerala. Energy-packed, fibre-rich.',
  },
  {
    id: 'f3', name: 'Kashmir Red Apples', category: 'fruits',
    price: 180, unit: 'kg', stock: 20, featured: true,
    image: img(1510392),
    description: 'Crispy, fragrant Kashmiri apples from the valley orchards — no wax coating.',
    variants: [{ label: '1kg', price: 180 }, { label: '2kg', price: 350 }],
  },
  {
    id: 'f4', name: 'Seedless Green Grapes', category: 'fruits',
    price: 100, unit: 'kg', stock: 15,
    image: img(708777),
    description: 'Plump, sweet green seedless grapes. Chilled best, great for juicing.',
    variants: [{ label: '500g', price: 55 }, { label: '1kg', price: 100 }],
  },
  {
    id: 'f5', name: 'Watermelon', category: 'fruits',
    price: 25, unit: 'kg', stock: 10,
    image: img(1414110),
    description: 'Refreshing summer watermelon — sweet red flesh, seedless variety available.',
    variants: [{ label: 'Half (~3kg)', price: 75 }, { label: 'Whole (~6kg)', price: 145 }],
  },
  {
    id: 'f6', name: 'Nagpur Oranges', category: 'fruits',
    price: 80, unit: 'kg', stock: 30,
    image: img(207085),
    description: 'GI-tagged Nagpur oranges — sweet, tangy and bursting with vitamin C.',
    variants: [{ label: '1kg', price: 80 }, { label: '2kg', price: 155 }],
  },
  {
    id: 'f7', name: 'Strawberries', category: 'fruits',
    price: 120, unit: '250g', stock: 8, featured: true,
    image: img(934077),
    description: 'Fresh plump strawberries from Mahabaleshwar — sweet, aromatic, pesticide-free.',
    variants: [{ label: '250g', price: 120 }, { label: '500g', price: 230 }],
  },

  // ── WOOD-PRESSED OILS ────────────────────────────────────────────────────
  {
    id: 'o1', name: 'Ground Nut Oil', category: 'oils',
    price: 280, unit: 'litre', stock: 30, featured: true,
    image: img(1458671),
    description: 'Cold-extracted on traditional wooden ghani. Retains all natural nutrients, rich flavour. No refining, no bleaching.',
    variants: [{ label: '500ml', price: 145 }, { label: '1L', price: 280 }, { label: '2L (save ₹30)', price: 530 }],
  },
  {
    id: 'o2', name: 'Sesame Oil', category: 'oils',
    price: 350, unit: 'litre', stock: 20,
    image: img(1640777),
    description: 'Gingelly oil pressed from black sesame seeds. Traditional South Indian recipe, rich in antioxidants.',
    variants: [{ label: '500ml', price: 180 }, { label: '1L', price: 350 }],
  },
  {
    id: 'o3', name: 'Virgin Coconut Oil', category: 'oils',
    price: 320, unit: 'litre', stock: 25,
    image: img(725997),
    description: 'Cold-pressed from fresh coconut kernels. Unrefined, odourless, suitable for cooking and hair care.',
    variants: [{ label: '500ml', price: 165 }, { label: '1L', price: 320 }],
  },
  {
    id: 'o4', name: 'Mustard Oil', category: 'oils',
    price: 200, unit: 'litre', stock: 35,
    image: img(1437267),
    description: 'Pungent, flavourful mustard oil from yellow mustard seeds. Traditional taste of Indian cooking.',
    variants: [{ label: '500ml', price: 105 }, { label: '1L', price: 200 }, { label: '5L (bulk)', price: 950 }],
  },

  // ── MICROGREENS ──────────────────────────────────────────────────────────
  {
    id: 'mg1', name: 'Mixed Microgreens Tray', category: 'microgreens',
    price: 149, unit: 'tray', stock: 20, featured: true,
    subscriptionAvailable: true,
    image: img(1132043),
    description: 'Nutrient-dense mix of sunflower, radish, and pea shoots. Grown hydroponically, harvested to order.',
    variants: [{ label: 'Small tray (100g)', price: 149 }, { label: 'Large tray (200g)', price: 279 }],
  },
  {
    id: 'mg2', name: 'Sunflower Microgreens', category: 'microgreens',
    price: 129, unit: 'tray', stock: 15, subscriptionAvailable: true,
    image: img(4750270),
    description: 'Crunchy sunflower shoots — nutty flavour, high in protein and healthy fats.',
    variants: [{ label: '100g', price: 129 }, { label: '200g', price: 239 }],
  },
  {
    id: 'mg3', name: 'Radish Microgreens', category: 'microgreens',
    price: 99, unit: 'tray', stock: 18, subscriptionAvailable: true,
    image: img(7512913),
    description: 'Peppery radish sprouts, rich in vitamin C and detoxifying compounds.',
    variants: [{ label: '100g', price: 99 }, { label: '200g', price: 189 }],
  },

  // ── MUSHROOMS ───────────────────────────────────────────────────────────
  {
    id: 'mu1', name: 'Button Mushrooms', category: 'mushrooms',
    price: 80, unit: '200g', stock: 22,
    image: img(1435904),
    description: 'Fresh button mushrooms, mild flavour, perfect for soups, pizzas and stir-fries.',
    variants: [{ label: '200g', price: 80 }, { label: '500g', price: 180 }],
  },
  {
    id: 'mu2', name: 'Oyster Mushrooms', category: 'mushrooms',
    price: 120, unit: '200g', stock: 12, featured: true,
    image: img(5946656),
    description: 'Velvety oyster mushrooms with meaty texture. Excellent source of B vitamins and iron.',
    variants: [{ label: '200g', price: 120 }, { label: '500g', price: 280 }],
  },
  {
    id: 'mu3', name: 'Shiitake Mushrooms', category: 'mushrooms',
    price: 180, unit: '200g', stock: 8,
    image: img(4198016),
    description: 'Premium shiitake with rich umami flavour. Immune-boosting, anti-inflammatory properties.',
    variants: [{ label: '200g', price: 180 }, { label: '500g', price: 420 }],
  },

  // ── WHOLE GRAINS ─────────────────────────────────────────────────────────
  {
    id: 'gr1', name: 'Aged Basmati Rice', category: 'grains',
    price: 120, unit: 'kg', stock: 100, featured: true,
    image: img(1638281),
    description: '2-year aged long-grain basmati. Fluffy, aromatic, non-sticky. Direct from Punjab farms.',
    variants: [{ label: '1kg', price: 120 }, { label: '5kg', price: 575 }, { label: '10kg (bulk)', price: 1100 }],
  },
  {
    id: 'gr2', name: 'Brown Rice', category: 'grains',
    price: 90, unit: 'kg', stock: 60,
    image: img(4386140),
    description: 'Unpolished brown rice, retains bran and germ. High fibre, diabetic-friendly.',
    variants: [{ label: '1kg', price: 90 }, { label: '5kg', price: 430 }],
  },
  {
    id: 'gr3', name: 'Black Wheat', category: 'grains',
    price: 110, unit: 'kg', stock: 35,
    image: img(1435707),
    description: 'Rare anthocyanin-rich black wheat. 3x more antioxidants than regular wheat.',
    variants: [{ label: '1kg', price: 110 }, { label: '3kg', price: 315 }],
  },

  // ── MILLETS ──────────────────────────────────────────────────────────────
  {
    id: 'mi1', name: 'Pearl Millet (Bajra)', category: 'millets',
    price: 65, unit: 'kg', stock: 80, featured: true,
    image: img(5945755),
    description: 'Nutrient-dense bajra — rich in iron, magnesium. Great for rotis and porridge.',
    variants: [{ label: '1kg', price: 65 }, { label: '5kg', price: 305 }],
  },
  {
    id: 'mi2', name: 'Finger Millet (Ragi)', category: 'millets',
    price: 80, unit: 'kg', stock: 65,
    image: img(4099544),
    description: 'Highest calcium content of any grain. Ideal for diabetics, lactating mothers.',
    variants: [{ label: '1kg', price: 80 }, { label: '5kg', price: 380 }],
  },
  {
    id: 'mi3', name: 'Foxtail Millet (Kangni)', category: 'millets',
    price: 90, unit: 'kg', stock: 40,
    image: img(4099544),
    description: 'Lowest glycaemic index among millets. Gluten-free, easy to digest.',
    variants: [{ label: '500g', price: 48 }, { label: '1kg', price: 90 }],
  },
  {
    id: 'mi4', name: 'Little Millet (Samai)', category: 'millets',
    price: 95, unit: 'kg', stock: 30,
    image: img(2457432),
    description: 'Ancient grain, high in fibre. Cooks like rice, great for weight management.',
    variants: [{ label: '500g', price: 50 }, { label: '1kg', price: 95 }],
  },

  // ── EGGS & MEAT ──────────────────────────────────────────────────────────
  {
    id: 'e1', name: 'Country Eggs (Desi)', category: 'eggs',
    price: 120, unit: 'dozen', stock: 45, featured: true,
    image: '/images/country-eggs-desi.jpg',
    description: 'Free-range desi eggs from cage-free hens. Larger yolk, richer taste, no hormones.',
    variants: [{ label: '6 eggs', price: 65 }, { label: '12 eggs', price: 120 }, { label: '30 eggs', price: 290 }],
  },
  {
    id: 'e2', name: 'Farm Fresh Chicken', category: 'eggs',
    price: 220, unit: 'kg', stock: 20,
    image: img(616354),
    description: 'Country chicken raised on natural feed. Tastier than broiler, leaner meat.',
    variants: [{ label: '500g', price: 115 }, { label: '1kg', price: 220 }],
  },
  {
    id: 'e3', name: 'Quail Eggs', category: 'eggs',
    price: 80, unit: '18 pcs', stock: 25,
    image: img(3735220),
    description: 'Protein-packed quail eggs — 5x more nutrients than chicken eggs.',
    variants: [{ label: '18 pcs', price: 80 }, { label: '36 pcs', price: 150 }],
  },

  // ── STONE-GROUND FLOURS ──────────────────────────────────────────────────
  {
    id: 'fl1', name: 'Whole Wheat Flour (Atta)', category: 'flours',
    price: 65, unit: 'kg', stock: 90, featured: true,
    image: img(5608221),
    description: 'Stone-ground whole wheat atta. Retains natural bran, germ and nutrients. No maida added.',
    variants: [{ label: '1kg', price: 65 }, { label: '5kg', price: 305 }, { label: '10kg', price: 595 }],
  },
  {
    id: 'fl2', name: 'Chickpea Flour (Besan)', category: 'flours',
    price: 110, unit: 'kg', stock: 50,
    image: img(4110257),
    description: 'Stone-ground Bengal gram flour. High protein, gluten-free, ideal for pakodas and kadhi.',
    variants: [{ label: '500g', price: 58 }, { label: '1kg', price: 110 }],
  },
  {
    id: 'fl3', name: 'Ragi Flour', category: 'flours',
    price: 95, unit: 'kg', stock: 40,
    image: img(4099544),
    description: 'Stone-milled finger millet flour. Rich in calcium, ideal for healthy rotis and dosas.',
    variants: [{ label: '500g', price: 50 }, { label: '1kg', price: 95 }],
  },
  {
    id: 'fl4', name: 'Rice Flour', category: 'flours',
    price: 55, unit: 'kg', stock: 60,
    image: img(4252137),
    description: 'Fine-ground rice flour, perfect for idli, dosa and traditional Indian sweets.',
    variants: [{ label: '500g', price: 30 }, { label: '1kg', price: 55 }],
  },
  {
    id: 'fl5', name: 'Jowar Flour', category: 'flours',
    price: 70, unit: 'kg', stock: 45,
    image: '/images/jowar-flour.jpg',
    description: 'Sorghum flour — gluten-free, low glycaemic. Traditional bhakri and roti staple.',
    variants: [{ label: '500g', price: 37 }, { label: '1kg', price: 70 }],
  },
]

// Serviceable pincodes (Hyderabad + surrounding areas)
export const SERVICEABLE_PINCODES = new Set([
  '500001','500002','500003','500004','500005','500006','500007','500008',
  '500009','500010','500011','500012','500013','500014','500015','500016',
  '500017','500018','500019','500020','500021','500022','500023','500024',
  '500025','500026','500027','500028','500029','500030','500031','500032',
  '500033','500034','500035','500036','500037','500038','500039','500040',
  '500041','500042','500043','500044','500045','500046','500047','500048',
  '500049','500050','500051','500052','500053','500054','500055','500056',
  '500057','500058','500059','500060','500061','500062','500063','500064',
  '500065','500066','500067','500068','500069','500070','500071','500072',
  '500073','500074','500075','500076','500077','500078','500079','500080',
  '500081','500082','500083','500084','500085','500086','500087','500088',
  '500089','500090','500091','500092','500093','500094','500095','500096',
  '500097','500098','501301','501302','501401','501501','501503','501505',
  '502032','502110','502251','502280','502285','502290','502295','502300',
  '502305','502310','502315','502319','502320','502321','502325','502329',
  '502330','502331','502335',
])
