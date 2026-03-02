package com.example.restaurant.backend.config;

import com.example.restaurant.backend.Entity.MenuItem;
import com.example.restaurant.backend.Entity.Restaurant;
import com.example.restaurant.backend.Repository.MenuItemRepository;
import com.example.restaurant.backend.Repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    /** Canonical category values (match frontend tabs exactly). */
    private static final Set<String> CANONICAL_CATEGORY_VALUES = Set.of(
            "Appetizer", "Soup", "Salad", "Kebab", "Rice", "Stew", "Drink", "Dessert", "Pizza", "Other");

    /** Map common wrong/plural category strings to canonical. */
    private static final Map<String, String> CATEGORY_ALIASES = Map.ofEntries(
            Map.entry("Kebabs", "Kebab"), Map.entry("Drinks", "Drink"), Map.entry("Appetizers", "Appetizer"),
            Map.entry("Soups", "Soup"), Map.entry("Salads", "Salad"), Map.entry("Stews", "Stew"),
            Map.entry("Desserts", "Dessert"), Map.entry("Pizzas", "Pizza"),
            Map.entry("Mains", "Kebab"), Map.entry("Main", "Kebab"),
            Map.entry("Main Course", "Kebab"), Map.entry("Beverages", "Drink"), Map.entry("Beverage", "Drink"));

    /** Canonical category per menu item name. Used to fix wrong categories in DB (backfill). Matches frontend tabs. */
    private static final Map<String, String> CANONICAL_CATEGORY = Map.ofEntries(
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
            Map.entry("Sekanjebin", "Drink"), Map.entry("Chai (Persian Black Tea)", "Drink"), Map.entry("Sharbat-e Golab", "Drink"),
            Map.entry("Hummus", "Appetizer"), Map.entry("Kashk-e-Bademjan", "Appetizer"), Map.entry("Mirza Ghasemi", "Appetizer"),
            Map.entry("Dolmeh", "Appetizer"), Map.entry("Nan-e Barbari", "Appetizer"), Map.entry("Zeytoon Parvardeh", "Appetizer"),
            Map.entry("Sabzi Khordan", "Appetizer"), Map.entry("Panir o Sabzi", "Appetizer"), Map.entry("Nan-e Sangak", "Appetizer"), Map.entry("Torshi", "Appetizer"),
            Map.entry("Bastani", "Dessert"), Map.entry("Faloodeh", "Dessert"), Map.entry("Zoolbia & Bamieh", "Dessert"),
            Map.entry("Sholeh Zard", "Dessert"), Map.entry("Baghlava", "Dessert"), Map.entry("Bamieh", "Dessert"), Map.entry("Halva", "Dessert"),
            Map.entry("Margherita Pizza", "Pizza"), Map.entry("Pepperoni Pizza", "Pizza")
    );

    /** Descriptions for all menu items (seed + backfill). Matches frontend mock. */
    private static final Map<String, String> DESCRIPTIONS = Map.ofEntries(
            Map.entry("Joojeh Kebab", "Marinated chicken kebab with saffron and lemon. Served hot."),
            Map.entry("Barg (Lamb Kebab)", "Tender lamb fillet marinated in saffron and onion. Served hot."),
            Map.entry("Koobideh", "Minced lamb or beef kebab with onion and spices. Served hot."),
            Map.entry("Soltani", "One skewer Barg + one Koobideh — the classic combo. Served hot."),
            Map.entry("Mahi Kebab", "Grilled fish kebab with herbs and lime. Served hot."),
            Map.entry("Chenjeh", "Lamb chop kebab, grilled with saffron. Served hot."),
            Map.entry("Kabab Torsh", "Northern Iranian kebab with walnut & pomegranate marinade. Served hot."),
            Map.entry("Shishlik", "Lamb rib kebab with saffron and lemon. Served hot."),
            Map.entry("Joojeh Barg", "Chicken fillet kebab, tender and saffron-marinated. Served hot."),
            Map.entry("Zereshk Polo", "Saffron rice with barberries, often served with chicken. Served hot."),
            Map.entry("Tahchin", "Baked saffron rice with crispy tahdig and chicken. Served hot."),
            Map.entry("Baghali Polo", "Dill and fava bean rice with lamb. Served hot."),
            Map.entry("Sabzi Polo", "Herb rice with parsley, dill, coriander — often with fish. Served hot."),
            Map.entry("Tahdig", "Crispy golden rice crust — side or add-on. Served hot."),
            Map.entry("Lubia Polo", "Green bean rice with minced meat and tomato. Served hot."),
            Map.entry("Albaloo Polo", "Sour cherry rice with chicken or lamb. Served hot."),
            Map.entry("Morasa Polo", "Jeweled rice with nuts, barberries, and saffron. Served hot."),
            Map.entry("Adasi Polo", "Lentil rice with dates and raisins. Served hot."),
            Map.entry("Kateh", "Simple buttery Persian rice — soft and fragrant. Served hot."),
            Map.entry("Ghormeh Sabzi", "Herb stew with kidney beans, dried lime, and lamb. Served hot."),
            Map.entry("Fesenjan", "Pomegranate and walnut stew with chicken. Served hot."),
            Map.entry("Gheimeh", "Yellow split pea stew with beef and dried lime. Served hot."),
            Map.entry("Bademjan", "Eggplant and tomato stew with lamb. Served hot."),
            Map.entry("Karafs", "Celery stew with lamb and herbs. Served hot."),
            Map.entry("Aloo Esfenaj", "Spinach and prune stew with beef. Served hot."),
            Map.entry("Khoresht-e Beh", "Quince stew with lamb and saffron. Served hot."),
            Map.entry("Khoresht-e Portoghāl", "Sweet and sour quince and split pea stew. Served hot."),
            Map.entry("Khoresht-e Gheimeh Bademjan", "Yellow split pea and eggplant stew with beef. Served hot."),
            Map.entry("Ash Reshteh", "Persian noodle soup with beans, herbs, and kashk. Served hot."),
            Map.entry("Ash-e Jo", "Barley soup with herbs and legumes. Served hot."),
            Map.entry("Soup-e Adasi", "Lentil soup with onion and spices. Served hot."),
            Map.entry("Halim Bademjan", "Eggplant and meat paste with cinnamon and saffron. Served hot."),
            Map.entry("Ash-e Anar", "Pomegranate soup with herbs and meatballs. Served hot."),
            Map.entry("Eshkeneh", "Persian egg-drop soup with turmeric and fenugreek. Served hot."),
            Map.entry("Ash-e Sholeh Ghalamkar", "Hearty noodle and bean soup with mint and garlic. Served hot."),
            Map.entry("Salad Shirazi", "Fresh cucumber, tomato, onion, and herb salad. Served cold."),
            Map.entry("Mast-o-Khiar", "Cool yogurt with cucumber, mint, and rose. Served cold."),
            Map.entry("Borani Esfenaj", "Spinach with garlic yogurt. Served cold."),
            Map.entry("Borani Bademjan", "Eggplant with garlic yogurt. Served cold."),
            Map.entry("Salad-e Olivieh", "Persian chicken and potato salad with peas and pickles. Served cold."),
            Map.entry("Kuku Sabzi", "Herb frittata with parsley, dill, and barberries. Served warm or at room temperature."),
            Map.entry("Mast-o-Musir", "Yogurt with wild shallots — tangy and fresh. Served cold."),
            Map.entry("Doogh", "Persian yogurt drink with mint and salt. Served cold."),
            Map.entry("Saffron Tea", "Black tea with saffron — traditional finish. Served hot."),
            Map.entry("Pomegranate Juice", "Fresh pomegranate juice. Served cold."),
            Map.entry("Sekanjebin", "Mint vinegar syrup — sweet & tangy. Served cold."),
            Map.entry("Iranian Doogh (large)", "Large Persian yogurt drink with mint. Served cold."),
            Map.entry("Sharbat-e Khakshir", "Basil seed drink — cooling and refreshing. Served cold."),
            Map.entry("Ab Havij", "Fresh carrot juice — sweet and healthy. Served cold."),
            Map.entry("Chai (Persian Black Tea)", "Strong black tea with cardamom. Served hot."),
            Map.entry("Sharbat-e Golab", "Rosewater syrup drink — floral and light. Served cold over ice."),
            Map.entry("Hummus", "Chickpea dip with tahini and lemon. Served at room temperature with bread."),
            Map.entry("Kashk-e-Bademjan", "Eggplant with whey, garlic, and mint. Served warm."),
            Map.entry("Mirza Ghasemi", "Smoked eggplant with tomato, garlic, and egg. Served warm."),
            Map.entry("Dolmeh", "Stuffed grape leaves with rice and herbs. Served at room temperature or chilled."),
            Map.entry("Zeytoon Parvardeh", "Marinated olives with pomegranate and walnuts. Served cold or at room temperature."),
            Map.entry("Nan-e Barbari", "Persian flatbread — warm and fluffy. Served warm."),
            Map.entry("Sabzi Khordan", "Fresh herb platter with radish, walnut, and cheese. Served cold or at room temperature."),
            Map.entry("Panir o Sabzi", "Persian feta with fresh herbs and bread. Served at room temperature."),
            Map.entry("Nan-e Sangak", "Stone-baked whole wheat flatbread. Served warm."),
            Map.entry("Torshi", "Persian pickled vegetables — tangy and crunchy. Served cold or at room temperature."),
            Map.entry("Bastani", "Persian saffron & rosewater ice cream with pistachio. Served cold."),
            Map.entry("Faloodeh", "Chilled rosewater noodle dessert with lime and cherry. Served cold."),
            Map.entry("Zoolbia & Bamieh", "Saffron syrup-soaked pastries — crispy and sweet. Served at room temperature."),
            Map.entry("Sholeh Zard", "Saffron rice pudding with cinnamon and rose. Served warm or chilled."),
            Map.entry("Baghlava", "Layered nut and honey pastry. Served at room temperature."),
            Map.entry("Bamieh", "Fried dough in saffron syrup — small portion. Served at room temperature."),
            Map.entry("Halva", "Sweet sesame or flour halva with saffron. Served warm or at room temperature."),
            Map.entry("Margherita Pizza", "Classic tomato, mozzarella, and fresh basil. Served hot."),
            Map.entry("Pepperoni Pizza", "Spicy pepperoni with tomato and mozzarella. Served hot."),
            Map.entry("Ranginak", "Date and walnut stuffed with cinnamon and cardamom. Served at room temperature."),
            Map.entry("Sohan", "Saffron brittle with pistachio — crunchy and fragrant. Served at room temperature."),
            Map.entry("Pashmak", "Persian cotton candy — light and sweet. Served at room temperature."),
            Map.entry("Noghl", "Sugar-coated almond or pistachio — traditional sweet. Served at room temperature.")
    );

    /** Seed default restaurant (tenant) with branding. Runs first. */
    @Bean
    @Order(1)
    public CommandLineRunner seedRestaurant(RestaurantRepository restaurantRepository) {
        return args -> {
            if (restaurantRepository.count() > 0) return;
            Restaurant r = new Restaurant("Saffron House", "123 Saffron Lane, Food District, NY 10001");
            r.setPrimaryColor("#E63946");
            r.setSupportEmail("support@saffronhouse.com");
            r.setTimezone("America/New_York");
            restaurantRepository.save(r);
        };
    }

    /**
     * Seed 47 Persian menu items for default tenant (matches frontend).
     * Only when there are no menu items; sets restaurantId from first restaurant.
     */
    @Bean
    @Order(2)
    public CommandLineRunner seedMenuItems(MenuItemRepository menuItemRepository,
                                          RestaurantRepository restaurantRepository) {
        return args -> {
            if (menuItemRepository.count() > 0) return;

            Long restaurantId = restaurantRepository.findAll().stream()
                    .findFirst()
                    .map(Restaurant::getId)
                    .orElse(1L);

            List<MenuItem> items = List.of(
                    // Kebabs (6)
                    new MenuItem("Joojeh Kebab", 15.00, "Kebab", true),
                    new MenuItem("Barg (Lamb Kebab)", 17.00, "Kebab", true),
                    new MenuItem("Koobideh", 14.00, "Kebab", true),
                    new MenuItem("Chenjeh", 18.00, "Kebab", true),
                    new MenuItem("Soltani", 19.00, "Kebab", true),
                    new MenuItem("Mahi Kebab", 16.00, "Kebab", true),
                    // Rice (6)
                    new MenuItem("Zereshk Polo", 13.00, "Rice", true),
                    new MenuItem("Tahchin", 15.00, "Rice", true),
                    new MenuItem("Baghali Polo", 12.00, "Rice", true),
                    new MenuItem("Sabzi Polo", 11.00, "Rice", true),
                    new MenuItem("Tahdig", 5.00, "Rice", true),
                    new MenuItem("Lubia Polo", 13.00, "Rice", true),
                    // Stews (6)
                    new MenuItem("Ghormeh Sabzi", 14.00, "Stew", true),
                    new MenuItem("Fesenjan", 16.00, "Stew", true),
                    new MenuItem("Gheimeh", 13.00, "Stew", true),
                    new MenuItem("Bademjan", 13.00, "Stew", true),
                    new MenuItem("Karafs", 14.00, "Stew", true),
                    new MenuItem("Aloo Esfenaj", 12.00, "Stew", true),
                    // Soups (7)
                    new MenuItem("Ash Reshteh", 9.00, "Soup", true),
                    new MenuItem("Ash-e Jo", 8.00, "Soup", true),
                    new MenuItem("Soup-e Adasi", 7.00, "Soup", true),
                    new MenuItem("Halim Bademjan", 8.00, "Soup", true),
                    new MenuItem("Ash-e Anar", 9.00, "Soup", true),
                    new MenuItem("Eshkeneh", 7.50, "Soup", true),
                    new MenuItem("Ash-e Sholeh Ghalamkar", 8.50, "Soup", true),
                    // Salads (5)
                    new MenuItem("Salad Shirazi", 7.00, "Salad", true),
                    new MenuItem("Mast-o-Khiar", 6.00, "Salad", true),
                    new MenuItem("Borani Esfenaj", 7.00, "Salad", true),
                    new MenuItem("Borani Bademjan", 7.00, "Salad", true),
                    new MenuItem("Salad-e Olivieh", 8.00, "Salad", true),
                    // Drinks (7)
                    new MenuItem("Doogh", 4.00, "Drink", true),
                    new MenuItem("Saffron Tea", 3.00, "Drink", true),
                    new MenuItem("Pomegranate Juice", 5.00, "Drink", true),
                    new MenuItem("Sekanjebin", 5.00, "Drink", true),
                    new MenuItem("Chai (Persian Black Tea)", 3.00, "Drink", true),
                    new MenuItem("Sharbat-e Golab", 5.00, "Drink", true),
                    // Appetizers (6)
                    new MenuItem("Hummus", 6.00, "Appetizer", true),
                    new MenuItem("Kashk-e-Bademjan", 8.00, "Appetizer", true),
                    new MenuItem("Mirza Ghasemi", 8.00, "Appetizer", true),
                    new MenuItem("Dolmeh", 9.00, "Appetizer", true),
                    new MenuItem("Nan-e Barbari", 3.00, "Appetizer", true),
                    new MenuItem("Zeytoon Parvardeh", 7.00, "Appetizer", true),
                    new MenuItem("Sabzi Khordan", 5.00, "Appetizer", true),
                    new MenuItem("Panir o Sabzi", 6.00, "Appetizer", true),
                    new MenuItem("Nan-e Sangak", 2.50, "Appetizer", true),
                    new MenuItem("Torshi", 3.50, "Appetizer", true),
                    // Desserts (7)
                    new MenuItem("Bastani", 6.00, "Dessert", true),
                    new MenuItem("Faloodeh", 6.00, "Dessert", true),
                    new MenuItem("Zoolbia & Bamieh", 7.00, "Dessert", true),
                    new MenuItem("Sholeh Zard", 6.00, "Dessert", true),
                    new MenuItem("Baghlava", 7.00, "Dessert", true),
                    new MenuItem("Bamieh", 5.00, "Dessert", true),
                    new MenuItem("Halva", 6.00, "Dessert", true),
                    // Pizza
                    new MenuItem("Margherita Pizza", 12.00, "Pizza", true),
                    new MenuItem("Pepperoni Pizza", 14.00, "Pizza", true)
            );
            // Image paths and descriptions (each item has accurate description — hot/cold/served as appropriate)
            String menuImg = "/images/menu/";
            for (MenuItem m : items) {
                m.setRestaurantId(restaurantId);
                switch (m.getName()) {
                    case "Joojeh Kebab" -> { m.setImage(menuImg + "Joojeh Kebab.png"); m.setDescription("Marinated chicken kebab with saffron and lemon. Served hot."); }
                    case "Barg (Lamb Kebab)" -> { m.setImage(menuImg + "Barg (Lamb Kebab).png"); m.setDescription("Tender lamb fillet marinated in saffron and onion. Served hot."); }
                    case "Koobideh" -> { m.setImage(menuImg + "Koobideh.png"); m.setDescription("Minced lamb or beef kebab with onion and spices. Served hot."); }
                    case "Chenjeh" -> { m.setImage(menuImg + "Chenjeh.png"); m.setDescription("Lamb chop kebab, grilled with saffron. Served hot."); }
                    case "Soltani" -> { m.setImage(menuImg + "Soltani.png"); m.setDescription("One skewer Barg + one Koobideh — the classic combo. Served hot."); }
                    case "Mahi Kebab" -> { m.setImage(menuImg + "Mahi Kebab.png"); m.setDescription("Grilled fish kebab with herbs and lime. Served hot."); }
                    case "Zereshk Polo" -> { m.setImage(menuImg + "Zereshk Polo.png"); m.setDescription("Saffron rice with barberries, often served with chicken. Served hot."); }
                    case "Tahchin" -> { m.setImage(menuImg + "Tahchin.png"); m.setDescription("Baked saffron rice with crispy tahdig and chicken. Served hot."); }
                    case "Baghali Polo" -> { m.setImage(menuImg + "Baghali Polo.png"); m.setDescription("Dill and fava bean rice with lamb. Served hot."); }
                    case "Sabzi Polo" -> { m.setImage(menuImg + "Sabzi Polo.png"); m.setDescription("Herb rice with parsley, dill, coriander — often with fish. Served hot."); }
                    case "Tahdig" -> { m.setImage(menuImg + "Tahdig.png"); m.setDescription("Crispy golden rice crust — side or add-on. Served hot."); }
                    case "Ghormeh Sabzi" -> { m.setImage(menuImg + "Ghormeh Sabzi.png"); m.setDescription("Herb stew with kidney beans, dried lime, and lamb. Served hot."); }
                    case "Fesenjan" -> { m.setImage(menuImg + "Fesenjan.png"); m.setDescription("Pomegranate and walnut stew with chicken. Served hot."); }
                    case "Gheimeh" -> { m.setImage(menuImg + "Gheimeh.png"); m.setDescription("Yellow split pea stew with beef and dried lime. Served hot."); }
                    case "Bademjan" -> { m.setImage(menuImg + "Bademjan.png"); m.setDescription("Eggplant and tomato stew with lamb. Served hot."); }
                    case "Karafs" -> { m.setImage(menuImg + "Karafs.png"); m.setDescription("Celery stew with lamb and herbs. Served hot."); }
                    case "Ash Reshteh" -> { m.setImage(menuImg + "Ash Reshteh.png"); m.setDescription("Persian noodle soup with beans, herbs, and kashk. Served hot."); }
                    case "Ash-e Jo" -> { m.setImage(menuImg + "Ash-e Jo.png"); m.setDescription("Barley soup with herbs and legumes. Served hot."); }
                    case "Soup-e Adasi" -> { m.setImage(menuImg + "Soup-e Adasi.png"); m.setDescription("Lentil soup with onion and spices. Served hot."); }
                    case "Salad Shirazi" -> { m.setImage(menuImg + "Shirazi Salad.png"); m.setDescription("Fresh cucumber, tomato, onion, and herb salad. Served cold."); }
                    case "Mast-o-Khiar" -> { m.setImage(menuImg + "Mast-o-Khiar.png"); m.setDescription("Cool yogurt with cucumber, mint, and rose. Served cold."); }
                    case "Borani Esfenaj" -> { m.setImage(menuImg + "Borani Esfenaj.png"); m.setDescription("Spinach with garlic yogurt. Served cold."); }
                    case "Doogh" -> { m.setImage(menuImg + "Doogh.png"); m.setDescription("Persian yogurt drink with mint and salt. Served cold."); }
                    case "Saffron Tea" -> { m.setImage(menuImg + "Saffron Tea.png"); m.setDescription("Black tea with saffron — traditional finish. Served hot."); }
                    case "Pomegranate Juice" -> { m.setImage(menuImg + "Pomegranate Juice.png"); m.setDescription("Fresh pomegranate juice. Served cold."); }
                    case "Hummus" -> { m.setImage(menuImg + "Hummus.png"); m.setDescription("Chickpea dip with tahini and lemon. Served at room temperature with bread."); }
                    case "Kashk-e-Bademjan" -> { m.setImage(menuImg + "Kashk-e-Bademjan.png"); m.setDescription("Eggplant with whey, garlic, and mint. Served warm."); }
                    case "Mirza Ghasemi" -> { m.setImage(menuImg + "Mirza Ghasemi.png"); m.setDescription("Smoked eggplant with tomato, garlic, and egg. Served warm."); }
                    case "Bastani" -> { m.setImage(menuImg + "Bastani (Persian Saffron Ice Cream).png"); m.setDescription("Persian saffron & rosewater ice cream with pistachio. Served cold."); }
                    case "Faloodeh" -> { m.setImage(menuImg + "Faloodeh.png"); m.setDescription("Chilled rosewater noodle dessert with lime and cherry. Served cold."); }
                    case "Zoolbia & Bamieh" -> { m.setImage(menuImg + "Zoolbia & Bamieh.png"); m.setDescription("Saffron syrup-soaked pastries — crispy and sweet. Served at room temperature."); }
                    case "Sholeh Zard" -> { m.setImage(menuImg + "Sholeh Zard.png"); m.setDescription("Saffron rice pudding with cinnamon and rose. Served warm or chilled."); }
                    case "Baghlava" -> { m.setImage(menuImg + "Baghlava.png"); m.setDescription("Layered nut and honey pastry. Served at room temperature."); }
                    case "Bamieh" -> { m.setImage(menuImg + "Bamieh.png"); m.setDescription("Fried dough in saffron syrup — small portion. Served at room temperature."); }
                    case "Halva" -> { m.setImage(menuImg + "Halva.png"); m.setDescription("Sweet sesame or flour halva with saffron. Served warm or at room temperature."); }
                    case "Sekanjebin" -> { m.setImage(menuImg + "Sekanjebin.png"); m.setDescription("Mint vinegar syrup — sweet & tangy. Served cold."); }
                    case "Chai (Persian Black Tea)" -> { m.setImage(menuImg + "Chai (Persian Black Tea).png"); m.setDescription("Strong black tea with cardamom. Served hot."); }
                    case "Sharbat-e Golab" -> { m.setImage(menuImg + "Sharbat-e Golab.png"); m.setDescription("Rosewater syrup drink — floral and light. Served cold over ice."); }
                    case "Borani Bademjan" -> { m.setImage(menuImg + "Borani Bademjan.png"); m.setDescription("Eggplant with garlic yogurt. Served cold."); }
                    case "Salad-e Olivieh" -> { m.setImage(menuImg + "Salad-e Olivieh.png"); m.setDescription("Persian chicken and potato salad with peas and pickles. Served cold."); }
                    case "Halim Bademjan" -> { m.setImage(menuImg + "Halim Bademjan.png"); m.setDescription("Eggplant and meat paste with cinnamon and saffron. Served hot."); }
                    case "Ash-e Anar" -> { m.setImage(menuImg + "Ash-e Anar.png"); m.setDescription("Pomegranate soup with herbs and meatballs. Served hot."); }
                    case "Eshkeneh" -> { m.setImage(menuImg + "Eshkeneh.png"); m.setDescription("Persian egg-drop soup with turmeric and fenugreek. Served hot."); }
                    case "Ash-e Sholeh Ghalamkar" -> { m.setImage(menuImg + "Ash-e Sholeh Ghalamkar.png"); m.setDescription("Hearty noodle and bean soup with mint and garlic. Served hot."); }
                    case "Dolmeh" -> { m.setImage(menuImg + "Dolmeh.png"); m.setDescription("Stuffed grape leaves with rice and herbs. Served at room temperature or chilled."); }
                    case "Nan-e Barbari" -> { m.setImage(menuImg + "Nan-e Barbari.png"); m.setDescription("Persian flatbread — warm and fluffy. Served warm."); }
                    case "Zeytoon Parvardeh" -> { m.setImage(menuImg + "Zeytoon Parvardeh.png"); m.setDescription("Marinated olives with pomegranate and walnuts. Served cold or at room temperature."); }
                    case "Sabzi Khordan" -> { m.setImage(menuImg + "Sabzi Khordan.png"); m.setDescription("Fresh herb platter with radish, walnut, and cheese. Served cold or at room temperature."); }
                    case "Panir o Sabzi" -> { m.setImage(menuImg + "Panir o Sabzi.png"); m.setDescription("Persian feta with fresh herbs and bread. Served at room temperature."); }
                    case "Nan-e Sangak" -> { m.setImage(menuImg + "Nan-e Sangak.png"); m.setDescription("Stone-baked whole wheat flatbread. Served warm."); }
                    case "Torshi" -> { m.setImage(menuImg + "Torshi.png"); m.setDescription("Persian pickled vegetables — tangy and crunchy. Served cold or at room temperature."); }
                    case "Margherita Pizza" -> { m.setImage(menuImg + "Margherita Pizza.png"); m.setDescription("Classic tomato, mozzarella, and fresh basil. Served hot."); }
                    case "Pepperoni Pizza" -> { m.setImage(menuImg + "Pepperoni Pizza.png"); m.setDescription("Spicy pepperoni with tomato and mozzarella. Served hot."); }
                    default -> {
                        String desc = DESCRIPTIONS.get(m.getName());
                        if (desc != null) m.setDescription(desc);
                    }
                }
                menuItemRepository.save(m);
            }
        };
    }

    /** Backfill description for any existing menu item that has null description. */
    @Bean
    @Order(3)
    public CommandLineRunner backfillDescriptions(MenuItemRepository menuItemRepository) {
        return args -> {
            List<MenuItem> all = menuItemRepository.findAll();
            boolean changed = false;
            for (MenuItem m : all) {
                if (m.getDescription() == null || m.getDescription().isBlank()) {
                    String desc = DESCRIPTIONS.get(m.getName());
                    if (desc != null) {
                        m.setDescription(desc);
                        menuItemRepository.save(m);
                        changed = true;
                    }
                }
            }
            if (changed) {
                log.info("Backfilled descriptions for menu items.");
            }
        };
    }

    /** Fix menu item categories so they match frontend tabs (Appetizer, Soup, Salad, Kebab, Rice, Stew, Drink, Dessert). */
    @Bean
    @Order(4)
    public CommandLineRunner backfillCategories(MenuItemRepository menuItemRepository) {
        return args -> {
            List<MenuItem> all = menuItemRepository.findAll();
            int fixed = 0;
            for (MenuItem m : all) {
                String name = m.getName();
                String current = m.getCategory();
                if (current == null) current = "";
                String target = null;
                if (name != null) target = CANONICAL_CATEGORY.get(name);
                if (target == null && !CANONICAL_CATEGORY_VALUES.contains(current)) {
                    String trimmed = current.trim();
                    target = CATEGORY_ALIASES.get(trimmed);
                    if (target == null && !trimmed.isEmpty())
                        target = CATEGORY_ALIASES.get(trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1).toLowerCase());
                }
                if (target != null && !target.equals(current)) {
                    m.setCategory(target);
                    menuItemRepository.save(m);
                    fixed++;
                }
            }
            if (fixed > 0) {
                log.info("Fixed category for {} menu items.", fixed);
            }
        };
    }

    /** Ensure missing appetizers exist (Sabzi Khordan, Panir o Sabzi, Nan-e Sangak, Torshi). */
    @Bean
    @Order(5)
    public CommandLineRunner ensureAppetizersComplete(MenuItemRepository menuItemRepository, RestaurantRepository restaurantRepository) {
        return args -> {
            List<MenuItem> all = menuItemRepository.findAll();
            java.util.Map<String, java.util.function.Supplier<MenuItem>> toAdd = new java.util.LinkedHashMap<>();
            toAdd.put("Sabzi Khordan", () -> {
                MenuItem m = new MenuItem("Sabzi Khordan", 5.00, "Appetizer", true);
                m.setDescription("Fresh herb platter with radish, walnut, and cheese. Served cold or at room temperature.");
                m.setImage("/images/menu/Sabzi Khordan.png");
                return m;
            });
            toAdd.put("Panir o Sabzi", () -> {
                MenuItem m = new MenuItem("Panir o Sabzi", 6.00, "Appetizer", true);
                m.setDescription("Persian feta with fresh herbs and bread. Served at room temperature.");
                m.setImage("/images/menu/Panir o Sabzi.png");
                return m;
            });
            toAdd.put("Nan-e Sangak", () -> {
                MenuItem m = new MenuItem("Nan-e Sangak", 2.50, "Appetizer", true);
                m.setDescription("Stone-baked whole wheat flatbread. Served warm.");
                m.setImage("/images/menu/Nan-e Sangak.png");
                return m;
            });
            toAdd.put("Torshi", () -> {
                MenuItem m = new MenuItem("Torshi", 3.50, "Appetizer", true);
                m.setDescription("Persian pickled vegetables — tangy and crunchy. Served cold or at room temperature.");
                m.setImage("/images/menu/Torshi.png");
                return m;
            });
            java.util.Set<String> existing = all.stream().map(MenuItem::getName).collect(java.util.stream.Collectors.toSet());
            if (existing.containsAll(toAdd.keySet())) return;
            Long restaurantId = restaurantRepository.findAll().stream().findFirst().map(Restaurant::getId).orElse(1L);
            int added = 0;
            for (java.util.Map.Entry<String, java.util.function.Supplier<MenuItem>> e : toAdd.entrySet()) {
                if (existing.contains(e.getKey())) continue;
                MenuItem m = e.getValue().get();
                m.setRestaurantId(restaurantId);
                menuItemRepository.save(m);
                added++;
            }
            if (added > 0) log.info("Added {} appetizer(s) to menu.", added);
        };
    }

    /** Ensure missing soups exist (Eshkeneh, Ash-e Sholeh Ghalamkar). */
    @Bean
    @Order(6)
    public CommandLineRunner ensureSoupsComplete(MenuItemRepository menuItemRepository, RestaurantRepository restaurantRepository) {
        return args -> {
            List<MenuItem> all = menuItemRepository.findAll();
            java.util.Set<String> existing = all.stream().map(MenuItem::getName).collect(java.util.stream.Collectors.toSet());
            java.util.Map<String, java.util.function.Supplier<MenuItem>> toAdd = new java.util.LinkedHashMap<>();
            toAdd.put("Eshkeneh", () -> {
                MenuItem m = new MenuItem("Eshkeneh", 7.50, "Soup", true);
                m.setDescription("Persian egg-drop soup with turmeric and fenugreek. Served hot.");
                m.setImage("/images/menu/Eshkeneh.png");
                return m;
            });
            toAdd.put("Ash-e Sholeh Ghalamkar", () -> {
                MenuItem m = new MenuItem("Ash-e Sholeh Ghalamkar", 8.50, "Soup", true);
                m.setDescription("Hearty noodle and bean soup with mint and garlic. Served hot.");
                m.setImage("/images/menu/Ash-e Sholeh Ghalamkar.png");
                return m;
            });
            if (existing.containsAll(toAdd.keySet())) return;
            Long restaurantId = restaurantRepository.findAll().stream().findFirst().map(Restaurant::getId).orElse(1L);
            for (java.util.Map.Entry<String, java.util.function.Supplier<MenuItem>> e : toAdd.entrySet()) {
                if (existing.contains(e.getKey())) continue;
                MenuItem m = e.getValue().get();
                m.setRestaurantId(restaurantId);
                menuItemRepository.save(m);
            }
        };
    }

    /** Ensure Pizza items exist (for DBs that already had menu before Pizza was added). */
    @Bean
    @Order(7)
    public CommandLineRunner ensurePizzaExists(MenuItemRepository menuItemRepository, RestaurantRepository restaurantRepository) {
        return args -> {
            List<MenuItem> all = menuItemRepository.findAll();
            boolean hasMargherita = all.stream().anyMatch(m -> "Margherita Pizza".equals(m.getName()));
            boolean hasPepperoni = all.stream().anyMatch(m -> "Pepperoni Pizza".equals(m.getName()));
            if (hasMargherita && hasPepperoni) return;
            Long restaurantId = restaurantRepository.findAll().stream().findFirst().map(Restaurant::getId).orElse(1L);
            if (!hasMargherita) {
                MenuItem m = new MenuItem("Margherita Pizza", 12.00, "Pizza", true);
                m.setRestaurantId(restaurantId);
                m.setDescription("Classic tomato, mozzarella, and fresh basil. Served hot.");
                m.setImage("/images/menu/Margherita Pizza.png");
                menuItemRepository.save(m);
                log.info("Added Margherita Pizza to menu.");
            }
            if (!hasPepperoni) {
                MenuItem m = new MenuItem("Pepperoni Pizza", 14.00, "Pizza", true);
                m.setRestaurantId(restaurantId);
                m.setDescription("Spicy pepperoni with tomato and mozzarella. Served hot.");
                m.setImage("/images/menu/Pepperoni Pizza.png");
                menuItemRepository.save(m);
                log.info("Added Pepperoni Pizza to menu.");
            }
        };
    }

    /** Remove Wine from menu (per user request). */
    @Bean
    @Order(8)
    public CommandLineRunner removeWine(MenuItemRepository menuItemRepository) {
        return args -> {
            List<MenuItem> wines = menuItemRepository.findAll().stream()
                    .filter(m -> "Wine".equals(m.getName()))
                    .toList();
            for (MenuItem m : wines) {
                menuItemRepository.delete(m);
            }
            if (!wines.isEmpty()) {
                log.info("Removed {} Wine item(s) from menu.", wines.size());
            }
        };
    }
}

