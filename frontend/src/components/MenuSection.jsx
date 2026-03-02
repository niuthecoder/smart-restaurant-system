import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { menuAPI } from '../services/api';
import { getMockMenuItems } from '../data/mockData';
import { resolveMenuImage } from '../data/menuImageMap';
import { toMenuKey } from '../utils/menuTranslations';

// Menu order: Appetizers → Soups → Salads → Mains (Kebab, Rice, Stew) → Drinks → Desserts → Other
const CATEGORY_LABELS = [
  { key: 'Appetizer', label: 'Appetizers 🧆' },
  { key: 'Soup', label: 'Soups & Ash 🍵' },
  { key: 'Salad', label: 'Salads 🥗' },
  { key: 'Kebab', label: 'Kebabs 🍢' },
  { key: 'Rice', label: 'Rice 🍚' },
  { key: 'Stew', label: 'Stews 🍲' },
  { key: 'Drink', label: 'Drinks 🥤' },
  { key: 'Dessert', label: 'Desserts 🍯' },
  { key: 'Pizza', label: 'Pizza 🍕' },
  { key: 'Other', label: 'Other 🍽️' },
];

const CATEGORY_KEYS = ['Appetizer', 'Soup', 'Salad', 'Kebab', 'Rice', 'Stew', 'Drink', 'Dessert', 'Pizza', 'Other'];

/** Normalize backend category to match our keys (case-insensitive). Only exact matches; unknown → Other. */
const normalizeCategory = (cat) => {
  if (!cat || typeof cat !== 'string') return 'Other';
  const c = cat.trim();
  const found = CATEGORY_KEYS.find((k) => k.toLowerCase() === c.toLowerCase());
  return found || 'Other';
}

const emojiForCategory = (cat) => {
  switch (cat) {
    case 'Kebab': return '🍢';
    case 'Rice': return '🍚';
    case 'Stew': return '🍲';
    case 'Soup': return '🍵';
    case 'Salad': return '🥗';
    case 'Drink': return '🥤';
    case 'Appetizer': return '🧆';
    case 'Dessert': return '🍯';
    case 'Pizza': return '🍕';
    case 'Other': return '🍽️';
    default: return '🍽️';
  }
};

const MenuCard = memo(({ item, slug, displayName, displayDesc, categoryLabel, imgSrc, showImg, isSearching, onAddToCart, addToCartLabel }) => (
  <div
    className="persian-card bg-mono-50 rounded-sm border border-mono-200 overflow-hidden hover:border-mono-400 hover:shadow-soft-lg transition-all duration-300 hover:-translate-y-1"
  >
    <div className="bg-mono-200 h-48 sm:h-52 flex items-center justify-center text-5xl overflow-hidden group">
      {showImg ? (
        <img src={imgSrc} alt={displayName} loading="lazy" decoding="async" width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <span>{item.image || emojiForCategory(item.category)}</span>
      )}
    </div>
    <div className="p-5">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-mono-900">{displayName}</h3>
        <span className="text-xl font-bold text-mono-800">${Number(item.price).toFixed(2)}</span>
      </div>
      {isSearching && (
        <span className="inline-block text-xs px-2 py-0.5 rounded-sm bg-mono-200 text-mono-600 mb-2">
          {emojiForCategory(item.category)} {categoryLabel}
        </span>
      )}
      <p className="text-mono-600 text-sm mb-3 leading-relaxed">{displayDesc}</p>
      {item.tags && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.split(',').map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-sm bg-mono-200 text-mono-700">{tag.trim()}</span>
          ))}
        </div>
      )}
      <button
        id={`add-${item.id}`}
        onClick={() => onAddToCart(item)}
        className="w-full bg-mono-800 text-mono-50 py-2.5 rounded-sm font-medium hover:bg-mono-700 active:scale-[0.98] transition-all duration-200 text-sm"
      >
        {addToCartLabel}
      </button>
    </div>
  </div>
));

const MenuSection = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('Appetizer');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoading(true);
        setBackendStatus('checking');

        const items = await menuAPI.getMenuItems();
        const list = Array.isArray(items) ? items : (items?.content ?? []);
        const mockDescriptions = Object.fromEntries(
          getMockMenuItems().map((m) => [m.name, m.description])
        );
        const normalized = (list || []).map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          category: normalizeCategory(i.category),
          available: i.available !== false,
          description: i.description || mockDescriptions[i.name] || 'Freshly prepared.',
          tags: i.tags,
          image: i.image,
        }));
        if (normalized.length > 0) {
          setMenuItems(normalized);
          setBackendStatus('connected');
        } else {
          setBackendStatus('disconnected');
          setMenuItems(getMockMenuItems().map((i) => ({ ...i, category: normalizeCategory(i.category) })));
        }
      } catch (error) {
        console.warn('Menu API unavailable, using local menu:', error?.message);
        setBackendStatus('disconnected');
        setMenuItems(getMockMenuItems().map((i) => ({ ...i, category: normalizeCategory(i.category) })));
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, []);

  const isSearching = Boolean((searchTerm || '').trim());
  const filteredItems = useMemo(() => {
    const term = (searchTerm || '').trim().toLowerCase();
    const available = menuItems.filter((i) => i.available !== false);
    // When searching: show matches from all categories, not just the active tab
    if (term) {
      return available.filter(
        (i) =>
          (i.name || '').toLowerCase().includes(term) ||
          (i.description || '').toLowerCase().includes(term) ||
          (normalizeCategory(i.category) || '').toLowerCase().includes(term)
      );
    }
    return available.filter((i) => normalizeCategory(i.category) === activeCategory);
  }, [menuItems, activeCategory, searchTerm]);

  const counts = useMemo(() => {
    const c = {};
    for (const { key } of CATEGORY_LABELS) c[key] = 0;
    for (const item of menuItems) {
      if (item.available === false) continue;
      const k = normalizeCategory(item.category);
      if (c[k] !== undefined) c[k] += 1;
    }
    return c;
  }, [menuItems]);

  const firstNonEmptyCategory = useMemo(() => {
    for (const { key } of CATEGORY_LABELS) {
      if ((counts[key] || 0) > 0) return key;
    }
    return CATEGORY_LABELS[0]?.key || 'Kebab';
  }, [counts]);

  // When current category has no items (and not searching), switch to first non-empty category
  useEffect(() => {
    if (isSearching) return;
    if (filteredItems.length === 0 && menuItems.filter((i) => i.available !== false).length > 0 && activeCategory !== firstNonEmptyCategory) {
      setActiveCategory(firstNonEmptyCategory);
    }
  }, [isSearching, filteredItems.length, menuItems, activeCategory, firstNonEmptyCategory]);

  const handleAddToCart = useCallback((item) => {
    addToCart({
      ...item,
      image: resolveMenuImage(item) || item.image || emojiForCategory(item.category),
      price: Number(item.price ?? 0),
    });

    const button = document.getElementById(`add-${item.id}`);
    if (button) {
      button.classList.add('animate-ping');
      setTimeout(() => button.classList.remove('animate-ping'), 300);
    }
  }, [addToCart]);

  if (loading) {
    return (
      <section id="menu" className="py-20 persian-pattern-bg">
        <div className="persian-corners max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-mono-200 rounded animate-pulse mx-auto mb-6" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-mono-50 rounded-sm border border-mono-200 overflow-hidden">
                <div className="bg-mono-200 h-48 animate-pulse" />
                <div className="p-5">
                  <div className="h-5 w-3/4 bg-mono-200 rounded animate-pulse mb-3" />
                  <div className="h-4 w-full bg-mono-100 rounded animate-pulse mb-2" />
                  <div className="h-4 w-2/3 bg-mono-100 rounded animate-pulse mb-4" />
                  <div className="h-10 bg-mono-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="relative py-20 persian-pattern-bg">
      <div className="persian-corners max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="persian-corner-bl" aria-hidden />
        <div className="persian-corner-br" aria-hidden />
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-mono-900 mb-4 persian-section-title">
            {t('menu.ourMenu')}
          </h2>
          <span className="persian-title-band" aria-hidden />
          <p className="text-mono-600 mt-6">
            {t('menu.loadedItems', { count: menuItems.filter(i => i.available !== false).length })}
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="menu-search" className="sr-only">{t('menu.searchPlaceholder')}</label>
          <input
            id="menu-search"
            type="search"
            placeholder={t('menu.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md mx-auto block px-4 py-2 border border-mono-200 rounded-sm focus:ring-2 focus:ring-mono-500 focus:border-mono-500"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORY_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors border ${
                activeCategory === key
                  ? 'bg-mono-800 text-mono-50 border-mono-800'
                  : 'bg-mono-50 text-mono-700 border-mono-200 hover:border-mono-400 hover:bg-mono-100'
              }`}
            >
              {t(`menuCategories.${key}`, { defaultValue: label })}
              <span className="ml-1 opacity-75">({counts[key] || 0})</span>
            </button>
          ))}
        </div>

        {isSearching && (
          <p className="text-center text-mono-600 text-sm mb-6">
            {t('menu.showingResults', { count: filteredItems.length })}
          </p>
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const slug = toMenuKey(item.name);
            const displayName = t(`menuItems.${slug}.name`, { defaultValue: item.name });
            const displayDesc = t(`menuItems.${slug}.description`, { defaultValue: item.description || 'Freshly prepared.' });
            const categoryLabel = t(`menuCategories.${item.category}`, { defaultValue: item.category });
            const imgSrc = resolveMenuImage(item) || item.image;
            const showImg = imgSrc && (imgSrc.startsWith('/') || imgSrc.startsWith('http'));
            return (
              <MenuCard
                key={item.id}
                item={item}
                slug={slug}
                displayName={displayName}
                displayDesc={displayDesc}
                categoryLabel={categoryLabel}
                imgSrc={imgSrc}
                showImg={showImg}
                isSearching={isSearching}
                onAddToCart={handleAddToCart}
                addToCartLabel={t('menu.addToCart')}
              />
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center mt-10 text-mono-600">
            {isSearching
              ? t('menu.noMatch', { term: searchTerm.trim() })
              : t('menu.noItems')}
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuSection;
