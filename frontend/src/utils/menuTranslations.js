/** Convert menu item name to translation key (slug). */
export const toMenuKey = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/&/g, 'and')
    .replace(/-/g, '_')
    .trim();
};
