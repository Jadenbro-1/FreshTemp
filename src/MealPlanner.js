// MealPlanner.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  TextInput,
  Image,
  Modal,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

const MealPlanner = () => {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [visibleDishes, setVisibleDishes] = useState(5);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigation = useNavigation();
  const route = useRoute();
  const userId = 1; // Replace with actual user ID

  const quickFilters = ['Breakfast', 'Lunch', 'Dinner', 'Under 30 Minutes', 'In Stock'];

  const filterCategories = [
    { name: 'Menu Type', options: ['full menu', 'ai menu', 'favorites'] },
    { name: 'Cook Time', options: ['Under 30 Minutes', 'Under 60 Minutes', '90+ Minutes'] },
    {
      name: 'Dish Type',
      options: [
        'Breakfast',
        'Lunch',
        'Dinner',
        'Appetizer',
        'Main Course',
        'Dessert',
        'Beverage',
      ],
    },
    { name: 'Cuisine', options: ['Italian', 'Mexican', 'Japanese', 'Indian', 'American'] },
    { name: 'Diet', options: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo'] },
  ];

  useEffect(() => {
    fetchRecipes();
  }, [selectedFilters, searchQuery]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/favorites/${userId}`
      );
      setFavorites(response.data.map((fav) => fav.recipe_id || fav.id));
    } catch (error) {
      console.error('Error fetching favorites:', error.message);
    }
  };

  const fetchRecipes = async () => {
    setIsLoading(true);
    let isAIMenu = false;
    try {
      let url = 'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipes';
      let recipesData = [];

      if (selectedFilters.includes('ai menu') || selectedFilters.includes('In Stock')) {
        url = 'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/ai-menu';
        isAIMenu = true;
      } else if (selectedFilters.includes('favorites')) {
        url = `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/favorites/${userId}`;
      }

      const response = await axios.get(url);
      recipesData = response.data;

      // Apply search filter
      if (searchQuery) {
        recipesData = recipesData.filter((recipe) =>
          recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Map recipes to required format
      const mappedRecipes = recipesData.map((recipe) => ({
        id: recipe.id,
        name: recipe.title,
        image: recipe.image || 'https://via.placeholder.com/150', // Adjust as needed
        rating: recipe.ratings || 0,
        category: recipe.category ? recipe.category.split(',').map((cat) => cat.trim()) : [],
        description: recipe.description,
        allergens: [], // Assuming allergens are not available from backend
        prepTime: recipe.prep_time || 0,
        totalTime: recipe.total_time || 0,
        inStock: isAIMenu, // Only AI menu recipes will have inStock as true
        missingIngredients: [], // Implement logic if needed
        dishType: recipe.dish_type || '',
        cuisine: recipe.cuisine || '',
        diet: recipe.diet ? recipe.diet.split(',').map((d) => d.trim()) : [],
      }));

      let filteredRecipes = mappedRecipes;

      // Apply Filters
      if (selectedFilters.length > 0) {
        filteredRecipes = filteredRecipes.filter((recipe) => {
          let cookTimeMatch = false; // OR logic
          let dishTypeMatch = false; // OR logic
          let cuisineMatch = false; // OR logic
          let dietMatch = true; // AND logic

          selectedFilters.forEach((filter) => {
            if (filterCategories[0].options.includes(filter)) {
              // Menu Type - Already handled in URL
            } else if (filterCategories[1].options.includes(filter)) {
              // Cook Time
              if (filter === 'Under 30 Minutes' && recipe.totalTime <= 30) {
                cookTimeMatch = true;
              } else if (filter === 'Under 60 Minutes' && recipe.totalTime <= 60) {
                cookTimeMatch = true;
              } else if (filter === '90+ Minutes' && recipe.totalTime >= 90) {
                cookTimeMatch = true;
              }
            } else if (filterCategories[2].options.includes(filter)) {
              // Dish Type
              if (
                recipe.dishType.toLowerCase().includes(filter.toLowerCase()) ||
                recipe.category.some((cat) => cat.toLowerCase() === filter.toLowerCase())
              ) {
                dishTypeMatch = true;
              }
            } else if (filterCategories[3].options.includes(filter)) {
              // Cuisine
              if (recipe.cuisine.toLowerCase() === filter.toLowerCase()) {
                cuisineMatch = true;
              }
            } else if (filterCategories[4].options.includes(filter)) {
              // Diet (AND logic)
              if (!recipe.diet.map((d) => d.toLowerCase()).includes(filter.toLowerCase())) {
                dietMatch = false;
              }
            } else if (filter === 'In Stock') {
              // In Stock - Already handled in URL and inStock property
            }
          });

          // If no Cook Time filters selected, set to true
          if (!selectedFilters.some((filter) => filterCategories[1].options.includes(filter))) {
            cookTimeMatch = true;
          }
          // If no Dish Type filters selected, set to true
          if (!selectedFilters.some((filter) => filterCategories[2].options.includes(filter))) {
            dishTypeMatch = true;
          }
          // If no Cuisine filters selected, set to true
          if (!selectedFilters.some((filter) => filterCategories[3].options.includes(filter))) {
            cuisineMatch = true;
          }

          return cookTimeMatch && dishTypeMatch && cuisineMatch && dietMatch;
        });
      }

      // Sort recipes by ratings
      filteredRecipes.sort((a, b) => b.rating - a.rating);

      setRecipes(filteredRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreRecipes = () => {
    setVisibleDishes((prev) => Math.min(prev + 5, recipes.length));
  };

  const addToWeeklyMealPlan = (recipe) => {
    const { day, mealType } = route.params; // Ensure day and mealType are passed in route params
    navigation.navigate('WeeklyMealPlan', { selectedMeal: recipe, day, mealType });
  };

  const toggleFavorite = async (recipeId) => {
    try {
      if (favorites.includes(recipeId)) {
        await axios.delete('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/favorites', {
          data: { userId, recipeId },
        });
        setFavorites(favorites.filter((id) => id !== recipeId));
      } else {
        await axios.post('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/favorites', {
          userId,
          recipeId,
        });
        setFavorites([...favorites, recipeId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error.message);
    }
  };

  const toggleFilter = (filter) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const applyFilters = () => {
    return recipes.slice(0, visibleDishes);
  };

  const displayedRecipes = applyFilters();

  const renderRecipeItem = ({ item }) => (
    <View key={item.id} style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('RecipeDetails', { recipeId: item.id })}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item.id)}>
            <Text
              style={[
                styles.favoriteButtonText,
                favorites.includes(item.id) && styles.favoriteButtonActive,
              ]}
            >
              {favorites.includes(item.id) ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
          {item.rating === 5 && (
            <View style={styles.badgePremium}>
              <Text style={styles.badgeText}>Premium</Text>
            </View>
          )}
          {item.inStock && (
            <View style={styles.badgeInStock}>
              <Text style={styles.badgeText}>In Stock</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.cardContent}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <View style={styles.recipeInfo}>
          <Image
            source={require('/Users/jadenbro1/FreshTemp/assets/star.png')}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>{item.rating}</Text>
          <Image
            source={require('/Users/jadenbro1/FreshTemp/assets/clock.png')}
            style={[styles.infoIcon, { marginLeft: 10 }]}
          />
          <Text style={styles.infoText}>{item.totalTime} min</Text>
        </View>
        <Text style={styles.recipeDescription}>{item.description}</Text>
        <View style={styles.recipeFooter}>
          <View style={styles.categoryContainer}>
            {item.category.map((cat, index) => (
              <View key={index} style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{cat}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addToWeeklyMealPlan(item)}
          >
            <Image
              source={require('/Users/jadenbro1/FreshTemp/assets/plus.png')}
              style={styles.addIcon}
            />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
        <Image
          source={require('/Users/jadenbro1/FreshTemp/assets/left.png')}
          style={styles.icon}
        />
        <Text style={styles.headerButtonText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Meal Planner</Text>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.headerButton}>
        <Image
          source={require('/Users/jadenbro1/FreshTemp/assets/filter2.png')}
          style={styles.icon}
        />
        <Text style={styles.headerButtonText}>Filter</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuickFilters = () => (
    <View style={styles.quickFiltersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {quickFilters.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterButton,
              selectedFilters.includes(filter) && styles.filterButtonActive,
            ]}
            onPress={() => toggleFilter(filter)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedFilters.includes(filter) && styles.filterButtonTextActive,
              ]}
            >
              {filter === 'Under 30 Minutes' ? 'Under 30 min' : filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Image
        source={require('/Users/jadenbro1/FreshTemp/assets/search.png')}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search meals..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Refine Your Meals</Text>
          <Text style={styles.modalDescription}>
            Customize your meal plan with these filters.
          </Text>
        </View>
        <ScrollView style={styles.modalContent}>
          {filterCategories.map((category, index) => (
            <View key={index} style={styles.filterCategory}>
              <Text style={styles.filterCategoryTitle}>{category.name}</Text>
              <View style={styles.filterOptions}>
                {category.options.map((filter, filterIndex) => (
                  <TouchableOpacity
                    key={filterIndex}
                    style={[
                      styles.filterButton,
                      selectedFilters.includes(filter) && styles.filterButtonActive,
                    ]}
                    onPress={() => toggleFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        selectedFilters.includes(filter) && styles.filterButtonTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.modalCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );

  const renderSkeletonLoader = () => {
    const skeletonItems = Array.from({ length: 5 }, (_, index) => index);
    return (
      <View style={styles.skeletonContainer}>
        {skeletonItems.map((item) => (
          <View key={item} style={styles.skeletonCard}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonText} />
            <View style={styles.skeletonTextShort} />
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, styles.container]}>
      <StatusBar backgroundColor="#F9FAFB" barStyle="dark-content" />
      {renderHeader()}
      {renderQuickFilters()}
      {renderSearchBar()}
      {isLoading ? (
        renderSkeletonLoader()
      ) : (
        <FlatList
          data={displayedRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.recipeList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recipes found</Text>
            </View>
          }
          ListFooterComponent={
            visibleDishes < recipes.length && (
              <TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreRecipes}>
                <Text style={styles.loadMoreButtonText}>Load More Meals</Text>
              </TouchableOpacity>
            )
          }
        />
      )}
      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({


  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Ensure this matches the rest of the page color
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Ensure consistency with SafeAreaView
  },
  header: {
    backgroundColor: '#F9FAFB', // Changed to match the SafeAreaView background color
    paddingBottom: 10,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#4B5563',
    fontSize: 16,
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#4B5563',
  },
  quickFiltersContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 10,
    marginBottom: 10,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    elevation: 1,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#9CA3AF',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  recipeList: {
    paddingHorizontal: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 5,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  favoriteButtonActive: {
    color: '#EF4444',
  },
  badgePremium: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeInStock: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeMissing: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    width: 15,
    height: 15,
    tintColor: '#DC2626',
    marginRight: 5,
  },
  badgeText: {
    fontSize: 12,
    color: '#1F2937',
  },
  cardContent: {
    padding: 15,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  recipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoIcon: {
    width: 15,
    height: 15,
    tintColor: '#FBBF24',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 5,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  recipeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addIcon: {
    width: 15,
    height: 15,
    tintColor: '#374151',
    marginRight: 5,
  },
  addButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
  },
  loadMoreButton: {
    marginVertical: 20,
    alignSelf: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  loadMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 15 : 15,
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 5,
  },
  modalContent: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  filterCategory: {
    marginBottom: 20,
  },
  filterCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalCloseButton: {
    padding: 15,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  skeletonContainer: {
    paddingHorizontal: 15,
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    padding: 15,
  },
  skeletonImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
    borderRadius: 15,
    marginBottom: 10,
  },
  skeletonText: {
    width: '80%',
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    marginBottom: 10,
  },
  skeletonTextShort: {
    width: '60%',
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    marginBottom: 10,
  },
});

export default MealPlanner;