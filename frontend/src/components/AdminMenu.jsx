import React, { useMemo, useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiCoffee, FiSearch, FiRefreshCw, FiX } from 'react-icons/fi';
import { menuAPI, adminAPI } from '../services/api';
import { resolveMenuImage } from '../data/menuImageMap';

const CATEGORIES = ['Appetizer', 'Soup', 'Salad', 'Kebab', 'Rice', 'Stew', 'Drink', 'Dessert', 'Pizza', 'Other'];

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Appetizer',
    available: true,
    tags: '',
    image: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const itemsData = await menuAPI.getMenuItems();
      setMenuItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err?.message || 'Failed to fetch menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return menuItems.filter((item) => {
      const okCategory = categoryFilter === 'all' ? true : item.category === categoryFilter;
      const okSearch =
        !term ||
        (item.name || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term);
      return okCategory && okSearch;
    });
  }, [menuItems, searchTerm, categoryFilter]);

  const openEdit = (item) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name || '',
      price: item.price ?? '',
      category: item.category || 'Appetizer',
      available: item.available !== false,
      tags: item.tags || '',
      image: item.image || '',
      description: item.description || '',
    });
  };

  const closeForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setNewItem({ name: '', price: '', category: 'Appetizer', available: true, tags: '', image: '', description: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: newItem.name.trim(),
        price: Number(newItem.price),
        category: newItem.category,
        available: !!newItem.available,
        tags: newItem.tags?.trim() || null,
        image: newItem.image?.trim() || null,
        description: newItem.description?.trim() || null,
      };

      if (!payload.name) throw new Error('Name is required');
      if (Number.isNaN(payload.price)) throw new Error('Price must be a number');

      if (editingId) {
        await menuAPI.updateMenuItem(editingId, payload);
      } else {
        await menuAPI.createMenuItem(payload);
      }

      closeForm();
      await fetchMenuItems();
    } catch (err) {
      console.error(editingId ? 'Update failed:' : 'Create menu item failed:', err);
      setError(err?.message || (editingId ? 'Failed to update item' : 'Failed to create menu item'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      setError(null);
      await menuAPI.deleteMenuItem(id);
      await fetchMenuItems();
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err?.message || 'Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FiRefreshCw className="animate-spin text-4xl text-primary-500" />
        <span className="ml-3 text-lg">Loading menu items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-gray-600">Manage your restaurant menu items</p>
          <p className="text-sm text-green-600">✅ {menuItems.length} menu items loaded</p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button
          onClick={fetchMenuItems}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
        <button
          onClick={() => adminAPI.downloadMenuExport().catch((e) => setError(e?.message || 'Export failed'))}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
        >
          Export menu CSV
        </button>
      </div>

      {/* Items */}
      <div className="grid gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                {(() => {
                  const imgSrc = resolveMenuImage(item) || item.image;
                  const showImg = imgSrc && (imgSrc.startsWith('/') || imgSrc.startsWith('http'));
                  return showImg ? (
                    <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <FiCoffee className="text-gray-400" size={24} />
                  );
                })()}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    ${Number(item.price ?? 0).toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">{item.category}</span>
                </div>
                {item.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.split(',').map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => openEdit(item)}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center"
              >
                <FiEdit2 className="mr-2" />
                Edit
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
              >
                <FiTrash2 className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <FiCoffee className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No menu items found</h3>
          <p className="text-gray-600">Try changing filters or add a new item.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {(showAdd || editingId) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
              <button onClick={closeForm} className="p-2 rounded hover:bg-gray-100">
                <FiX />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <input
                className="w-full border rounded-lg p-3"
                placeholder="Name"
                value={newItem.name}
                onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                required
              />

              <input
                className="w-full border rounded-lg p-3"
                placeholder="Price (e.g. 9.99)"
                value={newItem.price}
                onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full border rounded-lg p-3"
                  value={newItem.category}
                  onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Order: Appetizer → Soup → Salad → Kebab → Rice → Stew → Drink → Dessert → Other
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  className="w-full border rounded-lg p-3 min-h-[80px]"
                  placeholder="e.g. Marinated chicken kebab with saffron. Served hot."
                  value={newItem.description}
                  onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Say how it’s served (hot, cold, room temp) so customers see the right info.
                </p>
              </div>

              <input
                className="w-full border rounded-lg p-3"
                placeholder="Tags (e.g. Vegetarian, Spicy)"
                value={newItem.tags}
                onChange={(e) => setNewItem((p) => ({ ...p, tags: e.target.value }))}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                <input
                  className="w-full border rounded-lg p-3"
                  placeholder="/images/menu/dish-name.jpg or full URL"
                  value={newItem.image}
                  onChange={(e) => setNewItem((p) => ({ ...p, image: e.target.value }))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Put photos in frontend/public/images/menu/ then use path like /images/menu/joojeh-kebab.jpg
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={newItem.available}
                  onChange={(e) => setNewItem((p) => ({ ...p, available: e.target.checked }))}
                />
                Available
              </label>

              <button
                disabled={saving}
                className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
                type="submit"
              >
                {saving ? 'Saving…' : editingId ? 'Update Item' : 'Create Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
