// src/components/AdminMenu.jsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiCoffee, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { adminAPI } from '../services/api';

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const itemsData = await adminAPI.getMenuItems();
      setMenuItems(itemsData);
    } catch (err) {
      setError('Failed to fetch menu items.');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const categories = ['all', 'burgers', 'sides', 'drinks', 'desserts'];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <FiRefreshCw className="animate-spin text-4xl text-primary-500" />
        <span className="ml-3 text-lg">Loading menu items...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
        <button 
          onClick={fetchMenuItems}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-gray-600">Manage your restaurant menu items</p>
          <p className="text-sm text-green-600">✅ {menuItems.length} menu items loaded</p>
        </div>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center mt-4 md:mt-0">
          <FiPlus className="mr-2" />
          Add New Item
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={fetchMenuItems}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Menu Items Grid */}
      <div className="grid gap-6">
        {menuItems.map(item => (
          <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <FiCoffee className="text-gray-400" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">${item.price?.toFixed(2)}</span>
                  <span className="text-sm text-gray-500 capitalize">{item.category}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
                <FiEdit className="mr-2" />
                Edit
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center">
                <FiTrash2 className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {menuItems.length === 0 && (
        <div className="text-center py-12">
          <FiCoffee className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No menu items found</h3>
          <p className="text-gray-600">Add some menu items to get started.</p>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;