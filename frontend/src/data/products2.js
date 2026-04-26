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

// Static fallback — only used if backend API is completely offline
export const INITIAL_PRODUCTS = []
