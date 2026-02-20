/**
 * Maps menu item names to image paths in public/images/menu/.
 *
 * To add a new dish image:
 * 1. Drop the image in frontend/public/images/menu/ (e.g. "My Dish.png").
 * 2. Add one line below: 'Exact Menu Item Name': `${MENU_IMAGE_BASE}/My Dish.png`,
 *    (name must match the menu item name in the app/API).
 * If the filename doesn’t match the menu name (e.g. "Shirazi Salad.png" for "Salad Shirazi"),
 * add that mapping here; the app will use it everywhere (menu, cart, admin).
 */
const MENU_IMAGE_BASE = '/images/menu';

const MENU_IMAGE_MAP = {
  // Kebabs
  'Joojeh Kebab': `${MENU_IMAGE_BASE}/Joojeh Kebab.png`,
  'Barg (Lamb Kebab)': `${MENU_IMAGE_BASE}/Barg (Lamb Kebab).png`,
  'Koobideh': `${MENU_IMAGE_BASE}/Koobideh.png`,
  'Chenjeh': `${MENU_IMAGE_BASE}/Joojeh Kebab.png`,
  'Soltani': `${MENU_IMAGE_BASE}/Soltani.png`,
  'Mahi Kebab': `${MENU_IMAGE_BASE}/Mahi Kebab.png`,
  // Rice
  'Zereshk Polo': `${MENU_IMAGE_BASE}/Zereshk Polo.png`,
  'Tahchin': `${MENU_IMAGE_BASE}/Tahchin.png`,
  'Baghali Polo': `${MENU_IMAGE_BASE}/Baghali Polo.png`,
  'Sabzi Polo': `${MENU_IMAGE_BASE}/Sabzi Polo.png`,
  'Tahdig': `${MENU_IMAGE_BASE}/Tahdig.png`,
  'Lubia Polo': `${MENU_IMAGE_BASE}/Lubia Polo.png`,
  // Stews
  'Ghormeh Sabzi': `${MENU_IMAGE_BASE}/Ghormeh Sabzi.png`,
  'Fesenjan': `${MENU_IMAGE_BASE}/Fesenjan.png`,
  'Gheimeh': `${MENU_IMAGE_BASE}/Gheimeh.png`,
  'Bademjan': `${MENU_IMAGE_BASE}/Bademjan.png`,
  'Karafs': `${MENU_IMAGE_BASE}/Karafs.png`,
  'Aloo Esfenaj': `${MENU_IMAGE_BASE}/Aloo Esfenaj.png`,
  // Soups
  'Ash Reshteh': `${MENU_IMAGE_BASE}/Ash Reshteh.png`,
  'Ash-e Jo': `${MENU_IMAGE_BASE}/Ash-e Jo.png`,
  'Soup-e Adasi': `${MENU_IMAGE_BASE}/Soup-e Adasi.png`,
  'Halim Bademjan': `${MENU_IMAGE_BASE}/Halim Bademjan.png`,
  'Ash-e Anar': `${MENU_IMAGE_BASE}/Ash-e Anar.png`,
  'Eshkeneh': `${MENU_IMAGE_BASE}/Eshkeneh.png`,
  'Ash-e Sholeh Ghalamkar': `${MENU_IMAGE_BASE}/Ash-e Sholeh Ghalamkar.png`,
  // Salads (filename is "Shirazi Salad", menu name is "Salad Shirazi")
  'Salad Shirazi': `${MENU_IMAGE_BASE}/Shirazi Salad.png`,
  'Mast-o-Khiar': `${MENU_IMAGE_BASE}/Mast-o-Khiar.png`,
  'Borani Esfenaj': `${MENU_IMAGE_BASE}/Borani Esfenaj.png`,
  'Borani Bademjan': `${MENU_IMAGE_BASE}/Borani Bademjan.png`,
  'Salad-e Olivieh': `${MENU_IMAGE_BASE}/Salad-e Olivieh.png`,
  // Drinks
  'Doogh': `${MENU_IMAGE_BASE}/Doogh.png`,
  'Saffron Tea': `${MENU_IMAGE_BASE}/Saffron Tea.png`,
  'Pomegranate Juice': `${MENU_IMAGE_BASE}/Pomegranate Juice.png`,
  'Sekanjebin': `${MENU_IMAGE_BASE}/Sekanjebin.png`,
  'Chai (Persian Black Tea)': `${MENU_IMAGE_BASE}/Chai (Persian Black Tea).png`,
  'Sharbat-e Golab': `${MENU_IMAGE_BASE}/Sharbat-e Golab.png`,
  // Appetizers
  'Hummus': `${MENU_IMAGE_BASE}/Hummus.png`,
  'Kashk-e-Bademjan': `${MENU_IMAGE_BASE}/Kashk-e-Bademjan.png`,
  'Mirza Ghasemi': `${MENU_IMAGE_BASE}/Mirza Ghasemi.png`,
  'Dolmeh': `${MENU_IMAGE_BASE}/Dolmeh.png`,
  'Nan-e Barbari': `${MENU_IMAGE_BASE}/Nan-e Barbari.png`,
  'Zeytoon Parvardeh': `${MENU_IMAGE_BASE}/Zeytoon Parvardeh.png`,
  'Sabzi Khordan': `${MENU_IMAGE_BASE}/Sabzi Khordan.png`,
  'Panir o Sabzi': `${MENU_IMAGE_BASE}/Panir o Sabzi.png`,
  'Nan-e Sangak': `${MENU_IMAGE_BASE}/Nan-e Sangak.png`,
  'Torshi': `${MENU_IMAGE_BASE}/Torshi.png`,
  // Desserts (filename has extra text)
  'Bastani': `${MENU_IMAGE_BASE}/Bastani (Persian Saffron Ice Cream).png`,
  'Faloodeh': `${MENU_IMAGE_BASE}/Faloodeh.png`,
  'Zoolbia & Bamieh': `${MENU_IMAGE_BASE}/Zoolbia & Bamieh.png`,
  'Bamieh': `${MENU_IMAGE_BASE}/Bamieh.png`,
  'Halva': `${MENU_IMAGE_BASE}/Halva.png`,
  'Sholeh Zard': `${MENU_IMAGE_BASE}/Sholeh Zard.png`,
  'Baghlava': `${MENU_IMAGE_BASE}/Baghlava.png`,
  // Pizza
  'Margherita Pizza': `${MENU_IMAGE_BASE}/Margherita Pizza.png`,
  'Pepperoni Pizza': `${MENU_IMAGE_BASE}/Pepperoni Pizza.png`,
};

/** All known menu image paths — used as fallback pool when an item has no pic. */
const ALL_MENU_IMAGE_PATHS = Object.values(MENU_IMAGE_MAP).filter(Boolean);

/** Simple string hash to pick a stable fallback index (same item name → same image). */
function hashToIndex(str) {
  if (!str || typeof str !== 'string') return 0;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Resolve image for a menu item: use item.image if it's a path/URL, else
 * look up by item.name in MENU_IMAGE_MAP. If missing, return a random (but stable per name)
 * image from other menu items so every dish shows a photo.
 */
export function resolveMenuImage(item) {
  if (!item) return null;
  const raw = item.image?.trim();
  if (raw && (raw.startsWith('/') || raw.startsWith('http'))) return raw;
  const mapped = MENU_IMAGE_MAP[item.name];
  if (mapped) return mapped;
  if (ALL_MENU_IMAGE_PATHS.length === 0) return null;
  const idx = hashToIndex(item.name) % ALL_MENU_IMAGE_PATHS.length;
  return ALL_MENU_IMAGE_PATHS[idx];
}

export { MENU_IMAGE_MAP };
