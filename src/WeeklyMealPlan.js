// WeeklyMealPlan.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import { useNavigation, useRoute } from '@react-navigation/native';
import Navbar from './Navbar';
import Checkbox from '@react-native-community/checkbox'; // Import Checkbox

const { width } = Dimensions.get('window');

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

const dietaryPreferences = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
];

const WeeklyMealPlan = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [meals, setMeals] = useState({});

  // State variables for modals and plan options
  const [showFilters, setShowFilters] = useState(false);
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [filters, setFilters] = useState([]);
  const [planName, setPlanName] = useState('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addIngredients, setAddIngredients] = useState(true);
  const [favoriteName, setFavoriteName] = useState('');
  const [favoriteTags, setFavoriteTags] = useState('');
  const [showCustomizationsModal, setShowCustomizationsModal] = useState(false);
  const [customizations, setCustomizations] = useState([]);

  useEffect(() => {
    if (
      route.params?.selectedMeal &&
      route.params?.day &&
      route.params?.mealType
    ) {
      const { selectedMeal, day, mealType } = route.params;
      addMeal(day, mealType, selectedMeal);
    }
  }, [route.params?.selectedMeal]);

  useEffect(() => {
    if (showCustomizationsModal) {
      fetchCustomizations();
    }
  }, [showCustomizationsModal]);

  const fetchCustomizations = async () => {
    try {
      const userId = 1; // Replace with actual user ID
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/customizations/${userId}`
      );
      setCustomizations(response.data);
    } catch (error) {
      console.error('Error fetching customizations:', error);
      Alert.alert('Error', 'Failed to fetch customizations.');
    }
  };

  const addMeal = async (day, mealType, meal) => {
    try {
      // Fetch full meal data including nutritional facts
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipe/${meal.id}?userId=1` // Replace with actual user ID and server URL
      );
      const { recipe } = response.data;

      setMeals((prevMeals) => ({
        ...prevMeals,
        [day]: {
          ...(prevMeals[day] || {}),
          [mealType]: recipe,
        },
      }));
    } catch (error) {
      console.error('Error fetching meal data:', error);
      Alert.alert('Error', 'Failed to fetch meal data.');
    }
  };

  const removeMeal = (day, mealType) => {
    setMeals((prevMeals) => {
      const updatedMeals = { ...prevMeals };
      if (updatedMeals[day]) {
        updatedMeals[day][mealType] = null;
      }
      return updatedMeals;
    });
  };

  const clearAllMeals = () => {
    setMeals({});
    setShowFilters(false);
  };

  const formatDate = (date) => {
    return moment(date).format('MMM D');
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = moment(currentWeek).startOf('week').add(1, 'day'); // Start from Monday
    for (let i = 0; i < 7; i++) {
      dates.push(moment(startOfWeek).add(i, 'days').toDate());
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const changeWeek = (direction) => {
    setCurrentWeek((prevDate) => {
      return moment(prevDate)
        .add(direction === 'next' ? 7 : -7, 'days')
        .toDate();
    });
  };

  const saveMealPlan = async () => {
    const userId = 1; // Replace with actual user ID
    const dataToSave = {
      userId,
      week: `${formatDate(weekDates[0])} - ${formatDate(weekDates[6])}`,
      meals,
      filters,
      planName: isFavorite ? favoriteName : planName,
      addIngredients,
      favoriteTags,
      isFavorite,
    };

    try {
      await axios.post(
        'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/saveMealPlan',
        dataToSave
      );
      setIsSuccessModalVisible(true);
      setShowSavePanel(false);
      setPlanName('');
    } catch (error) {
      console.error('Error saving meal plan:', error.message);
      Alert.alert('Error', 'Failed to save meal plan.');
    }
  };

  const handleGenerateAIPlan = async () => {
    try {
      const response = await axios.get(
        'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/ai-menu' // Replace with your server URL
      );
      const aiMenuRecipes = response.data;

      if (aiMenuRecipes.length === 0) {
        Alert.alert('Error', 'No recipes found for the selected option.');
        return;
      }

      const newMeals = {};

      daysOfWeek.forEach((day) => {
        const breakfastRecipes = aiMenuRecipes.filter(
          (recipe) => recipe.category === 'Breakfast'
        );
        const lunchRecipes = aiMenuRecipes.filter(
          (recipe) => recipe.category === 'Lunch'
        );
        const dinnerRecipes = aiMenuRecipes.filter(
          (recipe) => recipe.category === 'Dinner'
        );

        const selectedMeals = {
          Breakfast: breakfastRecipes.length
            ? breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)]
            : null,
          Lunch: lunchRecipes.length
            ? lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)]
            : null,
          Dinner: dinnerRecipes.length
            ? dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)]
            : null,
        };

        newMeals[day] = {};

        mealTypes.forEach((mealType) => {
          if (selectedMeals[mealType]) {
            newMeals[day][mealType] = selectedMeals[mealType];
          } else {
            newMeals[day][mealType] = null;
          }
        });
      });

      setMeals(newMeals);
      setShowFilters(false);
    } catch (error) {
      console.error('Error generating AI meal plan:', error);
      Alert.alert('Error', 'Failed to generate AI meal plan.');
    }
  };

  const handleCreateCustomization = () => {
    setShowFilters(false); // Close the modal
    navigation.navigate('CustomizeMealPlan');
  };

  const handleApplyCustomization = async (customization) => {
    try {
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipes/customization/${customization.id}`
      );
      const recipes = response.data;

      if (recipes.length === 0) {
        Alert.alert('Error', 'No recipes found for the selected customization.');
        return;
      }

      const newMeals = {};

      daysOfWeek.forEach((day) => {
        const breakfastRecipes = recipes.filter(
          (recipe) => recipe.category === 'Breakfast'
        );
        const lunchRecipes = recipes.filter(
          (recipe) => recipe.category === 'Lunch'
        );
        const dinnerRecipes = recipes.filter(
          (recipe) => recipe.category === 'Dinner'
        );

        const selectedMeals = {
          Breakfast: breakfastRecipes.length
            ? breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)]
            : null,
          Lunch: lunchRecipes.length
            ? lunchRecipes[Math.floor(Math.random() * lunchRecipes.length)]
            : null,
          Dinner: dinnerRecipes.length
            ? dinnerRecipes[Math.floor(Math.random() * dinnerRecipes.length)]
            : null,
        };

        newMeals[day] = {};

        mealTypes.forEach((mealType) => {
          if (selectedMeals[mealType]) {
            newMeals[day][mealType] = selectedMeals[mealType];
          } else {
            newMeals[day][mealType] = null;
          }
        });
      });

      setMeals(newMeals);
      setShowCustomizationsModal(false);
    } catch (error) {
      console.error('Error applying customization:', error);
      Alert.alert('Error', 'Failed to apply customization.');
    }
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalVisible(false);
  };

  const toggleFilter = (preference) => {
    if (filters.includes(preference)) {
      setFilters(filters.filter((f) => f !== preference));
    } else {
      setFilters([...filters, preference]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logoText}>Planner</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('WeeklyMealPlan')}
            >
              <Image
                source={require('../assets/schedule.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('GroceryPlanner')}
            >
              <Image
                source={require('../assets/cart2.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Pantry')}
            >
              <Image
                source={require('../assets/carrot2.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Nutritionist')}
            >
              <Image
                source={require('../assets/nutrition2.png')}
                style={styles.iconImage}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* Week navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => changeWeek('prev')}
          >
            <Image
              source={require('../assets/left.png')}
              style={styles.weekNavIcon}
            />
          </TouchableOpacity>
          <Text style={styles.weekDates}>
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </Text>
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => changeWeek('next')}
          >
            <Image
              source={require('../assets/arrow.png')}
              style={styles.weekNavIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {daysOfWeek.map((day, index) => (
          <View key={day} style={styles.dayCard}>
            <Text style={styles.dayTitle}>
              {day}{' '}
              <Text style={styles.dayDate}>
                ({formatDate(weekDates[index])})
              </Text>
            </Text>
            <View style={styles.mealList}>
              {mealTypes.map((mealType) => (
                <View key={mealType} style={styles.mealItem}>
                  <Text style={styles.mealType}>{mealType}</Text>
                  {meals[day]?.[mealType] ? (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('RecipeDetails', {
                          recipeId: meals[day][mealType].id,
                        })
                      }
                      style={styles.mealContent}
                    >
                      {meals[day][mealType].image ? (
                        <Image
                          source={{ uri: meals[day][mealType].image }}
                          style={styles.mealImage}
                        />
                      ) : (
                        <View style={styles.mealImagePlaceholder}>
                          <Text style={styles.mealImagePlaceholderText}>
                            No Image
                          </Text>
                        </View>
                      )}
                      <Text style={styles.mealName}>
                        {meals[day][mealType].title}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeMeal(day, mealType)}
                        style={styles.removeMealButton}
                      >
                        <Image
                          source={require('../assets/trash2.png')}
                          style={styles.removeMealIcon}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('MealPlanner', {
                          day,
                          mealType,
                          weekStart: currentWeek,
                        })
                      }
                      style={styles.addMealButton}
                    >
                      <Image
                        source={require('../assets/plus.png')}
                        style={styles.addMealIcon}
                      />
                      <Text style={styles.addMealText}>Add Meal</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating buttons */}
      <View style={styles.floatingButtonLeft}>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={styles.generateButton}
        >
          <Image
            source={require('../assets/bot.png')}
            style={styles.generateIcon}
          />
          <Text style={styles.generateButtonText}>Generate Plan</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.floatingButtonRight}>
        <TouchableOpacity
          onPress={() => setShowSavePanel(true)}
          style={styles.saveButton}
        >
          <Image
            source={require('../assets/save.png')}
            style={styles.saveIcon}
          />
          <Text style={styles.saveButtonText}>Save Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Generate Plan Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Meal Plan Options</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={styles.closeModalButton}
              >
                <Image
                  source={require('../assets/close.png')}
                  style={styles.closeModalIcon}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.sectionTitle}>Dietary Preferences</Text>
              <View style={styles.checkboxContainer}>
                {dietaryPreferences.map((preference) => (
                  <View key={preference} style={styles.checkboxRow}>
                    <Checkbox
                      value={filters.includes(preference)}
                      onValueChange={() => toggleFilter(preference)}
                      tintColors={{ true: '#0EA5E9', false: '#6B7280' }}
                      style={styles.checkbox}
                      boxType="square" // For iOS; remove or adjust for Android
                      onCheckColor="#FFFFFF"
                      onFillColor="#0EA5E9"
                      onTintColor="#0EA5E9"
                    />
                    <Text style={styles.checkboxLabel}>{preference}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                onPress={handleGenerateAIPlan}
                style={styles.applyButtonAI}
              >
                <Image
                  source={require('../assets/bot.png')}
                  style={styles.botIcon}
                />
                <Text style={styles.applyButtonTextAI}>
                  Generate AI Meal Plan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowCustomizationsModal(true)}
                style={styles.customizationButton}
              >
                <Image
                  source={require('../assets/heart.png')}
                  style={styles.customizationIcon}
                />
                <Text style={styles.customizationButtonText}>
                  Apply Customization
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateCustomization}
                style={styles.createCustomizationButton}
              >
                <Image
                  source={require('../assets/plus.png')}
                  style={styles.createCustomizationIcon}
                />
                <Text style={styles.createCustomizationButtonText}>
                  Create Customization
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={clearAllMeals}
                style={styles.clearButton}
              >
                <Image
                  source={require('../assets/trash2.png')}
                  style={styles.clearIcon}
                />
                <Text style={styles.clearButtonText}>Clear All Meals</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Save Plan Modal */}
      <Modal visible={showSavePanel} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.saveModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Meal Plan</Text>
              <TouchableOpacity
                onPress={() => setShowSavePanel(false)}
                style={styles.closeModalButton}
              >
                <Image
                  source={require('../assets/close.png')}
                  style={styles.closeModalIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Add to Favorites</Text>
                <Switch value={isFavorite} onValueChange={setIsFavorite} />
              </View>
              {isFavorite && (
                <>
                  <Text style={styles.inputLabel}>
                    Name your favorite meal plan
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={favoriteName}
                    onChangeText={setFavoriteName}
                    placeholder="e.g., My Healthy Week"
                    placeholderTextColor="#6B7280"
                  />
                  <Text style={styles.inputLabel}>
                    Add tags (comma-separated)
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={favoriteTags}
                    onChangeText={setFavoriteTags}
                    placeholder="e.g., low-carb, high-protein"
                    placeholderTextColor="#6B7280"
                  />
                </>
              )}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  Add Missing Ingredients to Shopping List
                </Text>
                <Switch
                  value={addIngredients}
                  onValueChange={setAddIngredients}
                />
              </View>
              <Text style={styles.modalNote}>
                Only ingredients that are not in stock will be added to your
                shopping list.
              </Text>
              <TouchableOpacity
                onPress={saveMealPlan}
                style={styles.savePlanButton}
              >
                <Text style={styles.savePlanButtonText}>Save Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSavePanel(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={isSuccessModalVisible}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>You're All Set!</Text>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.successText}>
                Your meal plan has been saved successfully.
              </Text>
              {isFavorite && (
                <Text style={styles.successText}>
                  Your meal plan "{favoriteName}" has been added to favorites.
                </Text>
              )}
              {addIngredients && (
                <Text style={styles.successText}>
                  Missing ingredients have been added to your shopping list.
                </Text>
              )}
              <TouchableOpacity
                style={styles.closeSuccessButton}
                onPress={handleSuccessModalClose}
              >
                <Text style={styles.closeSuccessButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Customizations Modal */}
      <Modal
        visible={showCustomizationsModal}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customizationsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Customizations</Text>
              <TouchableOpacity
                onPress={() => setShowCustomizationsModal(false)}
                style={styles.closeModalButton}
              >
                <Image
                  source={require('../assets/close.png')}
                  style={styles.closeModalIcon}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {customizations.length > 0 ? (
                customizations.map((customization) => (
                  <TouchableOpacity
                    key={customization.id}
                    style={styles.customizationItem}
                    onPress={() => handleApplyCustomization(customization)}
                  >
                    <Text style={styles.customizationName}>
                      {customization.name}
                    </Text>
                    <Text style={styles.customizationDetails}>
                      Calories: {customization.calories}, Protein:{' '}
                      {customization.protein}, Carbs: {customization.carbs},
                      Fat: {customization.fats}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noCustomizationsText}>
                  No customizations found.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Navbar */}
      <Navbar currentScreen="MealPlanner" />
    </View>
  );
};

export default WeeklyMealPlan;

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 42, // Adjust as needed
  },
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5FC6FF',
    fontFamily: 'Cochin',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  iconImage: {
    width: 20,
    height: 20,
    tintColor: '#5FC6FF',
  },
  // Week Navigation Styles
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  weekNavButton: {
    padding: 4,
  },
  weekNavIcon: {
    width: 16,
    height: 16,
    tintColor: '#9ca3af',
  },
  weekDates: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  // Main Content Styles
  mainContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  // Day Card Styles
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  dayDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  mealList: {},
  mealItem: {
    marginBottom: 8,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  mealContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  mealImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  mealImagePlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealImagePlaceholderText: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  mealName: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  removeMealButton: {
    padding: 4,
  },
  removeMealIcon: {
    width: 16,
    height: 16,
    tintColor: '#6B7280',
  },
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addMealIcon: {
    width: 16,
    height: 16,
    tintColor: '#0EA5E9',
    marginRight: 4,
  },
  addMealText: {
    fontSize: 14,
    color: '#0EA5E9',
  },
  // Floating Button Styles
  floatingButtonLeft: {
    position: 'absolute',
    bottom: 80,
    left: 16,
  },
  floatingButtonRight: {
    position: 'absolute',
    bottom: 80,
    right: 16,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  generateIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    marginRight: 8,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  saveIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    marginRight: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  filterModal: {
    marginTop: 'auto',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '80%',
  },
  saveModal: {
    marginTop: 'auto',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '80%',
  },
  successModal: {
    marginTop: 'auto',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    alignItems: 'center',
  },
  customizationsModal: {
    marginTop: 'auto',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeModalButton: {
    padding: 8,
  },
  closeModalIcon: {
    width: 24,
    height: 24,
    tintColor: '#6B7280',
  },
  modalContent: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    width: '30%', // Three checkboxes per row with spacing
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20, // Smaller size
    height: 20,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
    flexShrink: 1, // Allows text to wrap if it's too long
  },
  applyButtonAI: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  botIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    marginRight: 8,
  },
  applyButtonTextAI: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  customizationButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'center',
  },
  customizationIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    marginRight: 8,
  },
  customizationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  createCustomizationButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'center',
  },
  createCustomizationIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    marginRight: 8,
  },
  createCustomizationButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'center',
  },
  clearIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F2937',
    marginRight: 8,
  },
  clearButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  inputLabel: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  modalNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  savePlanButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  savePlanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  closeSuccessButton: {
    marginTop: 24,
    backgroundColor: '#0EA5E9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  closeSuccessButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  successText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
  },
  customizationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  customizationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  customizationDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  noCustomizationsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 20,
  },
});