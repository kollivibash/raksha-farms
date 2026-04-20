// Category definitions used across the app
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

// Pincodes served by Raksha Farms (Hyderabad area)
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

// Static fallback — only used if backend API is completely offline
export const INITIAL_PRODUCTS = []
