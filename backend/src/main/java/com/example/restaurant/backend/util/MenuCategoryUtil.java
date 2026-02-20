package com.example.restaurant.backend.util;

import java.util.Map;
import java.util.Set;

/** Canonical menu categories. Used by API and DataInitializer to ensure consistency. */
public final class MenuCategoryUtil {

    public static final Set<String> CANONICAL = Set.of(
            "Appetizer", "Soup", "Salad", "Kebab", "Rice", "Stew", "Drink", "Dessert", "Pizza", "Other");

    private static final Map<String, String> BY_NAME = Map.ofEntries(
            Map.entry("Joojeh Kebab", "Kebab"), Map.entry("Barg (Lamb Kebab)", "Kebab"), Map.entry("Koobideh", "Kebab"),
            Map.entry("Chenjeh", "Kebab"), Map.entry("Soltani", "Kebab"), Map.entry("Mahi Kebab", "Kebab"),
            Map.entry("Zereshk Polo", "Rice"), Map.entry("Tahchin", "Rice"), Map.entry("Baghali Polo", "Rice"),
            Map.entry("Sabzi Polo", "Rice"), Map.entry("Tahdig", "Rice"), Map.entry("Lubia Polo", "Rice"),
            Map.entry("Ghormeh Sabzi", "Stew"), Map.entry("Fesenjan", "Stew"), Map.entry("Gheimeh", "Stew"),
            Map.entry("Bademjan", "Stew"), Map.entry("Karafs", "Stew"), Map.entry("Aloo Esfenaj", "Stew"),
            Map.entry("Ash Reshteh", "Soup"), Map.entry("Ash-e Jo", "Soup"), Map.entry("Soup-e Adasi", "Soup"),
            Map.entry("Halim Bademjan", "Soup"), Map.entry("Ash-e Anar", "Soup"),
            Map.entry("Eshkeneh", "Soup"), Map.entry("Ash-e Sholeh Ghalamkar", "Soup"),
            Map.entry("Salad Shirazi", "Salad"), Map.entry("Mast-o-Khiar", "Salad"), Map.entry("Borani Esfenaj", "Salad"),
            Map.entry("Borani Bademjan", "Salad"), Map.entry("Salad-e Olivieh", "Salad"),
            Map.entry("Doogh", "Drink"), Map.entry("Saffron Tea", "Drink"), Map.entry("Pomegranate Juice", "Drink"),
            Map.entry("Sekanjebin", "Drink"), Map.entry("Chai (Persian Black Tea)", "Drink"),
            Map.entry("Sharbat-e Golab", "Drink"),
            Map.entry("Hummus", "Appetizer"), Map.entry("Kashk-e-Bademjan", "Appetizer"), Map.entry("Mirza Ghasemi", "Appetizer"),
            Map.entry("Dolmeh", "Appetizer"), Map.entry("Nan-e Barbari", "Appetizer"), Map.entry("Zeytoon Parvardeh", "Appetizer"),
            Map.entry("Sabzi Khordan", "Appetizer"), Map.entry("Panir o Sabzi", "Appetizer"), Map.entry("Nan-e Sangak", "Appetizer"), Map.entry("Torshi", "Appetizer"),
            Map.entry("Bastani", "Dessert"), Map.entry("Faloodeh", "Dessert"), Map.entry("Zoolbia & Bamieh", "Dessert"),
            Map.entry("Sholeh Zard", "Dessert"), Map.entry("Baghlava", "Dessert"), Map.entry("Bamieh", "Dessert"),
            Map.entry("Halva", "Dessert"),
            Map.entry("Margherita Pizza", "Pizza"), Map.entry("Pepperoni Pizza", "Pizza")
    );

    /** Normalize category for API response. Uses item name if available, else checks if current is canonical. */
    public static String normalize(String itemName, String currentCategory) {
        if (itemName != null) {
            String byName = BY_NAME.get(itemName);
            if (byName != null) return byName;
        }
        if (currentCategory != null) {
            String c = currentCategory.trim();
            for (String k : CANONICAL) if (k.equalsIgnoreCase(c)) return k;
        }
        return "Other";
    }
}
