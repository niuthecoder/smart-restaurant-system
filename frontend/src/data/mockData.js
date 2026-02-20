import { menuAPI } from '/src/services/api.js';

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080';

export const testConnection = async () => {
  try {
    const response = await fetch(`${API_ORIGIN}/api/menuitems`);
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
    const list = Array.isArray(data) ? data : (data?.content ?? []);
    console.log('✅ Menu items fetched successfully from /api/menuitems');
    return list;
  } catch (error) {
    console.error('❌ Failed to fetch menu items from backend:', error);
    console.log('🔄 Falling back to mock data...');
    return getMockMenuItems();
  }
};

// Mock data as fallback — 55 items (includes Pizza, 10 appetizers, 7 soups).
export const getMockMenuItems = () => {
  console.log('📋 Using mock menu data (55 items)');
  return [
    // Kebabs (6)
    { id: 1, name: "Joojeh Kebab", description: "Marinated chicken kebab with saffron and lemon. Grilled and served hot.", price: 15.00, category: "Kebab", image: "🍢", featured: true, calories: 520 },
    { id: 2, name: "Barg (Lamb Kebab)", description: "Tender lamb fillet marinated in saffron and onion. Grilled and served hot.", price: 17.00, category: "Kebab", image: "🍢", calories: 580 },
    { id: 3, name: "Koobideh", description: "Minced lamb or beef kebab with onion and spices. Grilled and served hot.", price: 14.00, category: "Kebab", image: "🍢", calories: 550 },
    { id: 4, name: "Chenjeh", description: "Lamb chop kebab, grilled with saffron. Served hot.", price: 18.00, category: "Kebab", image: "🍢", calories: 620 },
    { id: 5, name: "Soltani", description: "One skewer Barg + one Koobideh — the classic combo. Grilled and served hot.", price: 19.00, category: "Kebab", image: "🍢", calories: 700 },
    { id: 6, name: "Mahi Kebab", description: "Grilled fish kebab with herbs and lime. Served hot.", price: 16.00, category: "Kebab", image: "🍢", calories: 380 },
    // Rice (6)
    { id: 7, name: "Zereshk Polo", description: "Saffron rice with barberries, often with chicken. Served hot.", price: 13.00, category: "Rice", image: "🍚", calories: 480 },
    { id: 8, name: "Tahchin", description: "Baked saffron rice with crispy tahdig and chicken. Served hot.", price: 15.00, category: "Rice", image: "🍚", calories: 600 },
    { id: 9, name: "Baghali Polo", description: "Dill and fava bean rice with lamb. Served hot.", price: 12.00, category: "Rice", image: "🍚", calories: 520 },
    { id: 10, name: "Sabzi Polo", description: "Herb rice with parsley, dill, coriander — often with fish. Served hot.", price: 11.00, category: "Rice", image: "🍚", calories: 450 },
    { id: 11, name: "Tahdig", description: "Crispy golden rice crust — side or add-on. Served hot.", price: 5.00, category: "Rice", image: "🍚", calories: 220 },
    { id: 12, name: "Lubia Polo", description: "Green bean rice with minced meat and tomato. Served hot.", price: 13.00, category: "Rice", image: "🍚", calories: 490 },
    // Stews (6)
    { id: 13, name: "Ghormeh Sabzi", description: "Herb stew with kidney beans, dried lime, and lamb. Served hot.", price: 14.00, category: "Stew", image: "🍲", calories: 380 },
    { id: 14, name: "Fesenjan", description: "Pomegranate and walnut stew with chicken. Served hot.", price: 16.00, category: "Stew", image: "🍲", calories: 520 },
    { id: 15, name: "Gheimeh", description: "Yellow split pea stew with beef and dried lime. Served hot.", price: 13.00, category: "Stew", image: "🍲", calories: 360 },
    { id: 16, name: "Bademjan", description: "Eggplant and tomato stew with lamb. Served hot.", price: 13.00, category: "Stew", image: "🍲", calories: 340 },
    { id: 17, name: "Karafs", description: "Celery stew with lamb and herbs. Served hot.", price: 14.00, category: "Stew", image: "🍲", calories: 320 },
    { id: 18, name: "Aloo Esfenaj", description: "Spinach and prune stew with beef. Served hot.", price: 12.00, category: "Stew", image: "🍲", calories: 300 },
    // Soups (7)
    { id: 19, name: "Ash Reshteh", description: "Persian noodle soup with beans, herbs, and kashk. Served hot.", price: 9.00, category: "Soup", image: "🍵", calories: 280 },
    { id: 20, name: "Ash-e Jo", description: "Barley soup with herbs and legumes. Served hot.", price: 8.00, category: "Soup", image: "🍵", calories: 220 },
    { id: 21, name: "Soup-e Adasi", description: "Lentil soup with onion and spices. Served hot.", price: 7.00, category: "Soup", image: "🍵", calories: 200 },
    { id: 22, name: "Halim Bademjan", description: "Eggplant and meat paste with cinnamon and saffron. Served hot.", price: 8.00, category: "Soup", image: "🍵", calories: 260 },
    { id: 23, name: "Ash-e Anar", description: "Pomegranate soup with herbs and meatballs. Served hot.", price: 9.00, category: "Soup", image: "🍵", calories: 240 },
    { id: 55, name: "Eshkeneh", description: "Persian egg-drop soup with turmeric and fenugreek. Served hot.", price: 7.50, category: "Soup", image: "🍵", calories: 180 },
    { id: 56, name: "Ash-e Sholeh Ghalamkar", description: "Hearty noodle and bean soup with mint and garlic. Served hot.", price: 8.50, category: "Soup", image: "🍵", calories: 250 },
    // Salads (5)
    { id: 24, name: "Salad Shirazi", description: "Fresh cucumber, tomato, onion, and herb salad. Served cold.", price: 7.00, category: "Salad", image: "🥗", calories: 60 },
    { id: 25, name: "Mast-o-Khiar", description: "Cool yogurt with cucumber, mint, and rose. Served cold.", price: 6.00, category: "Salad", image: "🥗", calories: 90 },
    { id: 26, name: "Borani Esfenaj", description: "Spinach with garlic yogurt. Served cold.", price: 7.00, category: "Salad", image: "🥗", calories: 100 },
    { id: 27, name: "Borani Bademjan", description: "Eggplant with garlic yogurt. Served cold.", price: 7.00, category: "Salad", image: "🥗", calories: 120 },
    { id: 28, name: "Salad-e Olivieh", description: "Persian chicken and potato salad with peas and pickles. Served cold.", price: 8.00, category: "Salad", image: "🥗", calories: 220 },
    // Drinks (7)
    { id: 29, name: "Doogh", description: "Persian yogurt drink with mint and salt. Served cold.", price: 4.00, category: "Drink", image: "🥤", calories: 80 },
    { id: 30, name: "Saffron Tea", description: "Black tea with saffron — traditional finish. Served hot.", price: 3.00, category: "Drink", image: "🥤", calories: 5 },
    { id: 31, name: "Pomegranate Juice", description: "Fresh pomegranate juice. Served cold.", price: 5.00, category: "Drink", image: "🥤", calories: 120 },
    { id: 32, name: "Sekanjebin", description: "Mint vinegar syrup — sweet & tangy. Served cold.", price: 5.00, category: "Drink", image: "🥤", calories: 100 },
    { id: 33, name: "Chai (Persian Black Tea)", description: "Strong black tea with cardamom. Served hot.", price: 3.00, category: "Drink", image: "🥤", calories: 5 },
    { id: 34, name: "Sharbat-e Golab", description: "Rosewater syrup drink — floral and light. Served cold over ice.", price: 5.00, category: "Drink", image: "🥤", calories: 110 },
    // Appetizers (6)
    { id: 35, name: "Hummus", description: "Chickpea dip with tahini and lemon. Served at room temperature with bread.", price: 6.00, category: "Appetizer", image: "🧆", calories: 180 },
    { id: 36, name: "Kashk-e-Bademjan", description: "Eggplant with whey, garlic, and mint. Served warm.", price: 8.00, category: "Appetizer", image: "🧆", calories: 200 },
    { id: 37, name: "Mirza Ghasemi", description: "Smoked eggplant with tomato, garlic, and egg. Served warm.", price: 8.00, category: "Appetizer", image: "🧆", calories: 220 },
    { id: 38, name: "Dolmeh", description: "Stuffed grape leaves with rice and herbs. Served at room temperature or chilled.", price: 9.00, category: "Appetizer", image: "🧆", calories: 150 },
    { id: 39, name: "Nan-e Barbari", description: "Persian flatbread — warm and fluffy. Served warm.", price: 3.00, category: "Appetizer", image: "🧆", calories: 200 },
    { id: 40, name: "Zeytoon Parvardeh", description: "Marinated olives with pomegranate and walnuts. Served cold or at room temperature.", price: 7.00, category: "Appetizer", image: "🧆", calories: 140 },
    { id: 51, name: "Sabzi Khordan", description: "Fresh herb platter with radish, walnut, and cheese. Served cold or at room temperature.", price: 5.00, category: "Appetizer", image: "🧆", calories: 80 },
    { id: 52, name: "Panir o Sabzi", description: "Persian feta with fresh herbs and bread. Served at room temperature.", price: 6.00, category: "Appetizer", image: "🧆", calories: 150 },
    { id: 53, name: "Nan-e Sangak", description: "Stone-baked whole wheat flatbread. Served warm.", price: 2.50, category: "Appetizer", image: "🧆", calories: 180 },
    { id: 54, name: "Torshi", description: "Persian pickled vegetables — tangy and crunchy. Served cold or at room temperature.", price: 3.50, category: "Appetizer", image: "🧆", calories: 30 },
    // Desserts (7)
    { id: 41, name: "Bastani", description: "Persian saffron & rosewater ice cream with pistachio. Served cold.", price: 6.00, category: "Dessert", image: "🍯", calories: 320 },
    { id: 42, name: "Faloodeh", description: "Chilled rosewater noodle dessert with lime and cherry. Served cold.", price: 6.00, category: "Dessert", image: "🍯", calories: 180 },
    { id: 43, name: "Zoolbia & Bamieh", description: "Saffron syrup-soaked pastries — crispy and sweet. Served at room temperature.", price: 7.00, category: "Dessert", image: "🍯", calories: 250 },
    { id: 44, name: "Sholeh Zard", description: "Saffron rice pudding with cinnamon and rose. Served warm or chilled.", price: 6.00, category: "Dessert", image: "🍯", calories: 280 },
    { id: 45, name: "Baghlava", description: "Layered nut and honey pastry. Served at room temperature.", price: 7.00, category: "Dessert", image: "🍯", calories: 350 },
    { id: 46, name: "Bamieh", description: "Fried dough in saffron syrup — small portion. Served at room temperature.", price: 5.00, category: "Dessert", image: "🍯", calories: 200 },
    { id: 47, name: "Halva", description: "Sweet sesame or flour halva with saffron. Served warm or at room temperature.", price: 6.00, category: "Dessert", image: "🍯", calories: 300 },
    // Pizza
    { id: 49, name: "Margherita Pizza", description: "Classic tomato, mozzarella, and fresh basil. Served hot.", price: 12.00, category: "Pizza", image: "🍕", calories: 280 },
    { id: 50, name: "Pepperoni Pizza", description: "Spicy pepperoni with tomato and mozzarella. Served hot.", price: 14.00, category: "Pizza", image: "🍕", calories: 350 }
  ];
};

export const categories = ["Appetizer", "Soup", "Salad", "Kebab", "Rice", "Stew", "Drink", "Dessert"];
export const specialOffers = [
  {
    title: "Kebab & Rice Combo",
    description: "Joojeh Kebab + Zereshk Polo + Doogh",
    price: 24.99,
    originalPrice: 29.99,
    image: "🎯",
    popular: true
  }
];
