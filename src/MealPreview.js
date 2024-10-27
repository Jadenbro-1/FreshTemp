// MealPreview.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import moment from 'moment';
import Navbar from './Navbar';

// Import icons
const EditIcon = require('../assets/edit2.png'); // Edit icon
const TrashIcon = require('../assets/trash2.png'); // Trash icon (Add this line)
const ClockIcon = require('../assets/clock.png'); // Clock icon
const StarIcon = require('../assets/star.png'); // Empty star icon
const StarFilledIcon = require('../assets/favorite.png'); // Filled star icon
const SnowflakeIcon = require('../assets/close.png'); // Snowflake icon
const Loading = require ('../assets/loading3.gif')

const MealPreview = () => {
  const navigation = useNavigation();
  const [mealType, setMealType] = useState('Dinner'); // Default meal type
  const [meal, setMeal] = useState(null); // Meal data
  const [mealTypes] = useState(['Breakfast', 'Lunch', 'Dinner']);
  const [isLoading, setIsLoading] = useState(true);
  const [isMealLoading, setIsMealLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment()); // Initialize with today's date
  const [showDatePicker, setShowDatePicker] = useState(false); // For date picker modal
  const [weekMeals, setWeekMeals] = useState({});
  const [isDeleting, setIsDeleting] = useState(false); // New state for deletion loading

  const userId = 1; // Replace with actual user ID from authentication

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  useEffect(() => {
    // Fetch the meal plan for the selected week
    const fetchWeekMeals = async () => {
      setIsLoading(true);
      try {
        const planName = getWeekIdentifier(selectedDate);
        const response = await axios.get(
          `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/getMealPlan/${userId}/${encodeURIComponent(
            planName
          )}`
        );
        const fetchedMealPlan = response.data;

        processMealPlanData(fetchedMealPlan);
      } catch (error) {
        console.error(
          'Error fetching week meals:',
          error.response?.data || error.message || error
        );
        Alert.alert(
          'Error',
          error.response?.data?.error || 'Failed to fetch meal plan.'
        );
        setWeekMeals({});
        setMeal(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeekMeals();
  }, [selectedDate]);

  useEffect(() => {
    if (weekMeals && Object.keys(weekMeals).length > 0) {
      updateCurrentMeal(weekMeals);
    } else {
      setMeal(null);
    }
  }, [mealType, selectedDate, weekMeals]);

  const getWeekIdentifier = (date) => {
    const weekNumber = date.isoWeek();
    const year = date.year();
    return `${year}-W${weekNumber}`;
  };

  const processMealPlanData = (fetchedMealPlan) => {
    if (fetchedMealPlan && Object.keys(fetchedMealPlan).length > 0) {
      setWeekMeals(fetchedMealPlan);
      updateCurrentMeal(fetchedMealPlan);
    } else {
      Alert.alert('Error', 'No meal plan found for the selected week.');
      setWeekMeals({});
      setMeal(null);
    }
  };

  const updateCurrentMeal = (fetchedMealPlan) => {
    const dayName = selectedDate.format('dddd'); // e.g., 'Monday'
    const mealsForDay = fetchedMealPlan[dayName] || {};
    const selectedMeal = mealsForDay[mealType] || null;

    if (selectedMeal) {
      setMeal({
        id: selectedMeal.id,
        name: selectedMeal.title,
        image: selectedMeal.image || null,
        rating: selectedMeal.ratings || 0,
        needsDefrosting: selectedMeal.needsDefrosting || false,
        type: mealType,
        description: '', // Initialize description as empty
        prepTime: '',
        cookTime: '',
      });
    } else {
      setMeal(null);
    }
  };

  // Fetch recipe details when meal is updated and description is not loaded
  useEffect(() => {
    if (meal && meal.id && !meal.description) {
      fetchRecipeDetails(meal.id);
    }
  }, [meal]);

  const fetchRecipeDetails = async (recipeId) => {
    setIsMealLoading(true);
    try {
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipe/${recipeId}?userId=${userId}`
      );
      const { recipe } = response.data;

      setMeal((prevMeal) => ({
        ...prevMeal,
        description: recipe.description || '',
        prepTime: recipe.prep_time || '0 mins',
        cookTime: recipe.cook_time || '0 mins',
        rating: recipe.ratings || 0,
        needsDefrosting: recipe.needs_defrosting || false,
      }));
    } catch (error) {
      console.error(
        'Error fetching recipe details:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to fetch recipe details.'
      );
    } finally {
      setIsMealLoading(false);
    }
  };

  const handleMealTypeChange = (type) => {
    setMealType(type);
  };

  const handleDateChange = (days) => {
    const newDate = moment(selectedDate).add(days, 'days');
    setSelectedDate(newDate);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(moment(date));
    setShowDatePicker(false);
  };

  const formatSelectedDate = () => {
    return selectedDate.format('dddd, MMMM D');
  };

  const renderSkeletonLoader = () => {
    return (
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonText} />
        <View style={styles.skeletonTextShort} />
      </View>
    );
  };

  const handleDeleteMealPlan = async () => {
    Alert.alert(
      'Delete Meal Plan',
      'Are you sure you want to delete your meal plan for the current week?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteMealPlan,
        },
      ]
    );
  };

  const deleteMealPlan = async () => {
    try {
      setIsDeleting(true);
      const planName = getWeekIdentifier(selectedDate);
      await axios.delete(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/deleteMealPlan/${userId}/${encodeURIComponent(
          planName
        )}`
      );
      Alert.alert('Success', 'Your meal plan has been deleted.');
      navigation.navigate('WeeklyMealPlan');
    } catch (error) {
      console.error(
        'Error deleting meal plan:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to delete meal plan.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || isDeleting) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={Loading}
          style={styles.loadingGif}
          resizeMode="contain"
          accessibilityLabel="Loading animation"
        />
        <Text style={styles.loadingText}>
          {isDeleting ? 'Deleting your meal plan...' : 'Loading your meal...'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Header Top with Logo, Edit, and Delete Buttons */}
        <View style={styles.headerTop}>
          <Text style={styles.logoText}>Meal Preview</Text>
          <View style={styles.headerIconsContainer}>
            <TouchableOpacity
              onPress={handleDeleteMealPlan}
              accessibilityLabel="Delete Meal Plan"
              accessibilityHint="Delete your meal plan for the current week"
              style={styles.headerIconButton}
            >
              <Image source={TrashIcon} style={styles.headerIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('WeeklyMealPlan', { isEditing: true })
              }
              accessibilityLabel="Edit Meal Plan"
              accessibilityHint="Navigate to edit your meal plan"
              style={styles.headerIconButton}
            >
              <Image source={EditIcon} style={styles.headerIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.navigationTabs}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MealPreview')}
            style={[styles.tabButton, styles.activeTabButton]}
            accessibilityLabel="Meal Plan Tab"
            accessibilityHint="Navigate to Meal Plan"
          >
            <Text style={[styles.tabText, styles.activeTabText]}>
              Meal Plan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('GroceryPlanner')}
            style={styles.tabButton}
            accessibilityLabel="Grocery Tab"
            accessibilityHint="Navigate to Grocery Planner"
          >
            <Text style={styles.tabText}>Grocery</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Pantry')}
            style={styles.tabButton}
            accessibilityLabel="Pantry Tab"
            accessibilityHint="Navigate to Pantry"
          >
            <Text style={styles.tabText}>Pantry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Nutritionist')}
            style={styles.tabButton}
            accessibilityLabel="Nutrition Tab"
            accessibilityHint="Navigate to Nutritionist"
          >
            <Text style={styles.tabText}>Nutrition</Text>
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSelectorContainer}>
          <TouchableOpacity
            onPress={() => handleDateChange(-1)}
            style={styles.dateArrowButton}
            accessibilityLabel="Previous Day"
            accessibilityHint="Show meals for the previous day"
          >
            <Text style={styles.dateArrowText}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openDatePicker}
            style={styles.dateDisplay}
            accessibilityLabel="Select Date"
            accessibilityHint="Open date picker to select a date"
          >
            <Text style={styles.dateText}>{formatSelectedDate()}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDateChange(1)}
            style={styles.dateArrowButton}
            accessibilityLabel="Next Day"
            accessibilityHint="Show meals for the next day"
          >
            <Text style={styles.dateArrowText}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Meal Type Selector */}
      <View style={styles.mealTypeSelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mealTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.mealTypeButton,
                mealType === type && styles.activeMealTypeButton,
              ]}
              onPress={() => handleMealTypeChange(type)}
              accessibilityLabel={`Select ${type}`}
              accessibilityHint={`View details for ${type}`}
            >
              <Text
                style={[
                  styles.mealTypeButtonText,
                  mealType === type && styles.activeMealTypeButtonText,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Meal Image */}
        <View style={styles.mealImageContainer}>
          {meal && meal.image ? (
            <Image source={{ uri: meal.image }} style={styles.mealImage} />
          ) : (
            <View style={styles.mealImagePlaceholder}>
              <Text style={styles.mealImagePlaceholderText}>No Image</Text>
            </View>
          )}
        </View>

        {/* Meal Name */}
        <Text style={styles.mealName}>
          {meal ? meal.name : 'No Meal Selected'}
        </Text>

        {/* Rating */}
        {meal && (
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, i) => (
              <Image
                key={i}
                source={i < Math.round(meal.rating) ? StarFilledIcon : StarIcon}
                style={styles.starIcon}
              />
            ))}
            <Text style={styles.ratingText}>
              {meal.rating ? meal.rating.toFixed(1) : '0.0'}
            </Text>
          </View>
        )}

        {/* Prep and Cook Time */}
        {meal && meal.prepTime && meal.cookTime && (
          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <Image source={ClockIcon} style={styles.timeIcon} />
              <Text style={styles.timeText}>Prep: {meal.prepTime} minutes</Text>
            </View>
            <View style={styles.timeItem}>
              <Image source={ClockIcon} style={styles.timeIcon} />
              <Text style={styles.timeText}>Cook: {meal.cookTime} minutes</Text>
            </View>
          </View>
        )}

        {/* Meal Description or Skeleton Loader */}
        {meal ? (
          isMealLoading ? (
            renderSkeletonLoader()
          ) : (
            <Text style={styles.mealDescription}>
              {meal.description || 'No description available.'}
            </Text>
          )
        ) : (
          <View style={styles.noMealContainer}>
            <Text style={styles.noMealText}>No Meal Selected</Text>
          </View>
        )}

        {/* Defrost Reminder */}
        {meal && meal.needsDefrosting && (
          <View style={styles.defrostReminder}>
            <Image source={SnowflakeIcon} style={styles.snowflakeIcon} />
            <Text style={styles.defrostReminderText}>
              <Text style={styles.defrostReminderBold}>Reminder:</Text> Please
              remember to defrost the meat for this recipe in advance.
            </Text>
          </View>
        )}

        {/* Start Cooking Button */}
        {meal && (
          <TouchableOpacity
            style={styles.startCookingButton}
            onPress={() =>
              navigation.navigate('RecipeDetails', {
                recipeId: meal.id,
              })
            }
            accessibilityLabel="Start Cooking"
            accessibilityHint="Navigate to the recipe details to start cooking"
          >
            <Text style={styles.startCookingButtonText}>Start Cooking</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ScrollView>
                {Array.from({ length: 14 }).map((_, index) => {
                  const dateOption = moment().add(index, 'days');
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleDateSelect(dateOption)}
                      style={styles.dateOption}
                    >
                      <Text style={styles.dateOptionText}>
                        {dateOption.format('dddd, MMMM D')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.closeModalButton}
              >
                <Text style={styles.closeModalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Navbar */}
      <Navbar currentScreen="MealPlanner" />
    </SafeAreaView>
  );
};

export default MealPreview;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
    paddingTop: 42, // To match the header positioning
  },
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    marginLeft: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5FC6FF', // Match the default color
    fontFamily: 'Cochin',
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: '#5FC6FF', // Match the theme color
  },
  // Navigation Tabs Styles
  navigationTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#5FC6FF',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  dateArrowButton: {
    padding: 8,
  },
  dateArrowText: {
    fontSize: 24,
    color: '#5FC6FF',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
    marginRight: 8,
  },
  mealTypeSelectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  mealTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6', // bg-gray-100
    marginRight: 8,
  },
  activeMealTypeButton: {
    backgroundColor: '#DBEAFE', // bg-sky-100
  },
  mealTypeButtonText: {
    fontSize: 14,
    color: '#6B7280', // text-gray-600
  },
  activeMealTypeButtonText: {
    color: '#1D4ED8', // text-blue-600
    fontWeight: '600',
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // To avoid overlap with navbar
  },
  mealImageContainer: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  mealImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  mealImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB', // bg-gray-200
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealImagePlaceholderText: {
    color: '#9CA3AF', // text-gray-400
    fontSize: 16,
  },
  mealName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937', // text-gray-800
    marginTop: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  starIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
    tintColor: '#FBBF24', // text-yellow-400
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280', // text-gray-600
  },
  timeContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  timeIcon: {
    width: 16,
    height: 16,
    tintColor: '#1D4ED8', // text-blue-600
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#4B5563', // text-gray-600
  },
  mealDescription: {
    fontSize: 16,
    color: '#4B5563', // text-gray-600
    marginTop: 16,
    lineHeight: 22,
  },
  noMealContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  noMealText: {
    fontSize: 16,
    color: '#6B7280',
  },
  defrostReminder: {
    backgroundColor: '#DBEAFE', // bg-sky-100
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  snowflakeIcon: {
    width: 24,
    height: 24,
    tintColor: '#1D4ED8', // text-blue-600
    marginRight: 8,
  },
  defrostReminderText: {
    color: '#1E3A8A', // text-blue-800
    fontSize: 14,
    flex: 1,
  },
  defrostReminderBold: {
    fontWeight: '600',
  },
  startCookingButton: {
    backgroundColor: '#5FC6FF', // Match the theme color
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  startCookingButtonText: {
    color: '#FFFFFF', // text-white
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#AED6F1',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '50%',
  },
  dateOption: {
    paddingVertical: 12,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  dateOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  closeModalButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeModalButtonText: {
    fontSize: 16,
    color: '#5FC6FF',
  },
  skeletonContainer: {
    marginTop: 16,
  },
  skeletonText: {
    width: '80%',
    height: 20,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
    borderRadius: 4,
  },
  skeletonTextShort: {
    width: '60%',
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  loadingGif: {
    width: 150, // Adjust the width as needed
    height: 150, // Adjust the height as needed
    marginBottom: 16, // Adds space below the GIF
  },
});