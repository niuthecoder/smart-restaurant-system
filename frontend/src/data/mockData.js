import { adminAPI } from '/src/services/api.js';

export const testConnection = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/menuitems');
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

export const fetchMenuItems = async () => {
  try {
    console.log('🔄 Fetching menu items from /api/menuitems...');
    
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to backend server');
    }
    
    // Fetch from correct endpoint
    const data = await menuAPI.getMenuItems();
    console.log('✅ Menu items fetched successfully from /api/menuitems');
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch menu items from backend:', error);
    console.log('🔄 Falling back to mock data...');
    return getMockMenuItems();
  }
};

// Mock data as fallback
export const getMockMenuItems = () => {
  console.log('📋 Using mock menu data');
  return [
    {
      id: 1,
      name: "Classic Beef Burger",
      description: "Juicy beef patty with lettuce, tomato, and our special sauce",
      price: 12.99,
      category: "burgers",
      image: "🍔",
      featured: true,
      calories: 650
    },
    {
      id: 2,
      name: "Crispy Chicken Burger",
      description: "Buttermilk fried chicken with spicy mayo",
      price: 11.99,
      category: "chicken", 
      image: "🍗",
      calories: 620
    },
    {
      id: 3,
      name: "Golden Fries",
      description: "Crispy fries with sea salt",
      price: 4.99,
      category: "fries",
      image: "🍟",
      calories: 365
    },
    {
      id: 4,
      name: "Chocolate Shake",
      description: "Creamy chocolate milkshake",
      price: 5.99,
      category: "drinks",
      image: "🥤",
      calories: 420
    },
    {
      id: 5,
      name: "Chocolate Brownie",
      description: "Warm fudge brownie",
      price: 6.99,
      category: "desserts",
      image: "🍫",
      calories: 480
    }
  ];
};

export const categories = ["burgers", "chicken", "fries", "drinks", "desserts"];
export const specialOffers = [
  {
    title: "Combo Deal",
    description: "Burger + Fries + Drink",
    price: 19.99,
    originalPrice: 24.99,
    image: "🎯",
    popular: true
  }
];