// WeeklyMealPlan.js

import React, { useEffect, useState, useCallback } from 'react';
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
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import Navbar from './Navbar';
import Checkbox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import trashIcon from '../assets/trash.png'; // Ensure the path is correct

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
  const [customizations, setCustomizations] = useState([]);

  // Define the AsyncStorage key based on userId
  const userId = 1; // Replace with actual user ID from authentication
  const STORAGE_KEY = `@WeeklyMealPlan:${userId}:currentMeals`;

  // State variables for Customizations and Saved Meal Plans
  const [savedMealPlans, setSavedMealPlans] = useState([]);
  const [selectedCustomizations, setSelectedCustomizations] = useState([]);
  const [selectedSavedMealPlan, setSelectedSavedMealPlan] = useState(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // State variables for refresh functionality
  const [lastCustomizationPlans, setLastCustomizationPlans] = useState([]);
  const [dayPlanIndices, setDayPlanIndices] = useState({});

  // Function to handle deletion of a customization
  const handleDeleteCustomization = (customizationId) => {
    Alert.alert(
      'Delete Customization',
      'Are you sure you want to delete this customization?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCustomization(customizationId),
        },
      ]
    );
  };

  // Function to perform the deletion of a customization
  const deleteCustomization = async (customizationId) => {
    try {
      setIsLoading(true);
      await axios.delete(`https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/customizations/${customizationId}`);
      // Update the customizations state by removing the deleted one
      setCustomizations((prevCustomizations) =>
        prevCustomizations.filter((c) => c.id !== customizationId)
      );
      Alert.alert('Success', 'Customization deleted successfully.');
    } catch (error) {
      console.error('Error deleting customization:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to delete customization.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle deletion of a saved meal plan
  const handleDeleteMealPlan = (planName) => {
    Alert.alert(
      'Delete Meal Plan',
      'Are you sure you want to delete this meal plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMealPlan(planName),
        },
      ]
    );
  };

  // Function to perform the deletion of a meal plan
  const deleteMealPlan = async (planName) => {
    try {
      setIsLoading(true);
      await axios.delete(`https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/deleteMealPlan/${userId}/${encodeURIComponent(planName)}`);
      // Update the savedMealPlans state by removing the deleted one
      setSavedMealPlans((prevMealPlans) =>
        prevMealPlans.filter((plan) => plan.name !== planName)
      );
      Alert.alert('Success', 'Meal plan deleted successfully.');
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to delete meal plan.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load in-progress meal plan from AsyncStorage
  const loadInProgressMealPlan = async () => {
    try {
      const storedMeals = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedMeals !== null) {
        setMeals(JSON.parse(storedMeals));
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error('Error loading in-progress meal plan:', error);
    }
  };

  // Function to save meal plan to AsyncStorage
  const saveMealPlanToStorage = async (mealsToSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mealsToSave));
    } catch (error) {
      console.error('Error saving meal plan to storage:', error);
    }
  };

  // Function to clear meal plan from AsyncStorage
  const clearMealPlanFromStorage = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing meal plan from storage:', error);
    }
  };

  // useFocusEffect to handle navigation events and unsaved changes
  useFocusEffect(
    useCallback(() => {
      const onBeforeRemove = (e) => {
        if (!hasUnsavedChanges) {
          return;
        }

        e.preventDefault();

        Alert.alert(
          'Discard changes?',
          'You have unsaved changes. Are you sure you want to discard them and leave the screen?',
          [
            { text: "Don't leave", style: 'cancel', onPress: () => {} },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => {
                setHasUnsavedChanges(false);
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      };

      navigation.addListener('beforeRemove', onBeforeRemove);

      return () => {
        navigation.removeListener('beforeRemove', onBeforeRemove);
      };
    }, [navigation, hasUnsavedChanges])
  );

  // Use useFocusEffect to check for meal plan every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      const initializeMealPlan = async () => {
        await loadInProgressMealPlan();
        if (route.params?.isEditing) {
          // Load the saved meal plan for editing
          loadSavedMealPlanForEditing();
        } else {
          // Check if the user has a saved meal plan for the current week only if there's no in-progress plan
          try {
            const storedMeals = await AsyncStorage.getItem(STORAGE_KEY);
            if (!storedMeals) {
              checkSavedMealPlan();
            }
          } catch (error) {
            console.error('Error initializing meal plan:', error);
          }
        }
      };

      initializeMealPlan();
    }, [route.params?.isEditing])
  );

  // Set hasUnsavedChanges to true when meals change
  useEffect(() => {
    if (Object.keys(meals).length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [meals]);

  // Save meals to AsyncStorage whenever they change
  useEffect(() => {
    if (hasUnsavedChanges) {
      saveMealPlanToStorage(meals);
    }
  }, [meals, hasUnsavedChanges]);

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
    if (showFilters) {
      fetchCustomizations();
      fetchSavedMealPlans();
    }
  }, [showFilters]);

  // Function to get the current week's identifier
  const getCurrentWeekIdentifier = () => {
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();
    return `${year}-W${weekNumber}`;
  };

  const getWeekNumber = (d) => {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    // Get first day of year
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
  };

  // Fetch Customizations for the user
  const fetchCustomizations = async () => {
    try {
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/customizations/${userId}`
      );
      setCustomizations(response.data);
    } catch (error) {
      console.error(
        'Error fetching customizations:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to fetch customizations.'
      );
    }
  };

  // Fetch Saved Meal Plans for the user
  const fetchSavedMealPlans = async () => {
    try {
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/savedMealPlans/${userId}`
      );
      setSavedMealPlans(response.data);
    } catch (error) {
      console.error(
        'Error fetching saved meal plans:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to fetch saved meal plans.'
      );
    }
  };

  // Check and navigate if a saved meal plan exists
  const checkSavedMealPlan = async () => {
    try {
      setIsLoading(true);
      const weekIdentifier = getCurrentWeekIdentifier();
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/getMealPlan/${userId}/${encodeURIComponent(
          weekIdentifier
        )}`
      );
      const fetchedMealPlan = response.data;
      if (fetchedMealPlan && Object.keys(fetchedMealPlan).length > 0) {
        // Navigate to MealPreview
        navigation.navigate('MealPreview');
      } else {
        // No meal plan exists, clear any existing meals
        setMeals({});
      }
    } catch (error) {
      console.error(
        'Error checking saved meal plan:',
        error.response?.data || error.message || error
      );
      // Handle the error or let the user proceed to the planner
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved meal plan for editing
  const loadSavedMealPlanForEditing = async () => {
    try {
      setIsLoading(true);
      const weekIdentifier = getCurrentWeekIdentifier();
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/getMealPlan/${userId}/${encodeURIComponent(
          weekIdentifier
        )}`
      );
      const fetchedMealPlan = response.data;

      if (fetchedMealPlan && Object.keys(fetchedMealPlan).length > 0) {
        // Load the saved meal plan into meals state
        await loadSavedMealPlan(fetchedMealPlan);
        setHasUnsavedChanges(false);
      } else {
        // If no saved meal plan, initialize meals to empty
        setMeals({});
      }
    } catch (error) {
      console.error(
        'Error loading saved meal plan for editing:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to load saved meal plan.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load saved meal plan into meals state
  const loadSavedMealPlan = async (fetchedMealPlan) => {
    try {
      const newMeals = {};

      // Iterate through each day and meal type to set the meals
      for (const day of daysOfWeek) {
        newMeals[day] = {};
        for (const mealType of mealTypes) {
          const meal = fetchedMealPlan[day]?.[mealType];
          if (meal) {
            // Fetch full recipe details if necessary
            const recipeResponse = await axios.get(
              `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipe/${meal.id}?userId=${userId}`
            );
            const { recipe } = recipeResponse.data;

            newMeals[day][mealType] = recipe;
          } else {
            newMeals[day][mealType] = null;
          }
        }
      }

      setMeals(newMeals);
    } catch (error) {
      console.error(
        'Error loading saved meal plan:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to load saved meal plan.'
      );
    }
  };

  // Add a meal to the meal plan
  const addMeal = async (day, mealType, meal) => {
    try {
      // Fetch full meal data including nutritional facts
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipe/${meal.id}?userId=${userId}`
      );
      const { recipe } = response.data;

      setMeals((prevMeals) => ({
        ...prevMeals,
        [day]: {
          ...(prevMeals[day] || {}),
          [mealType]: recipe,
        },
      }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error(
        'Error fetching meal data:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to fetch meal data.'
      );
    }
  };

  // Remove a meal from the meal plan
  const removeMeal = (day, mealType) => {
    setMeals((prevMeals) => {
      const updatedMeals = { ...prevMeals };
      if (updatedMeals[day]) {
        updatedMeals[day][mealType] = null;
      }
      return updatedMeals;
    });
    setHasUnsavedChanges(true);
  };

  // Clear all meals from the meal plan
  const clearAllMeals = async () => {
    setMeals({});
    setShowFilters(false);
    setSelectedCustomizations([]);
    setSelectedSavedMealPlan(null);
    setFilters([]);
    setLastCustomizationPlans([]);
    setDayPlanIndices({});
    setHasUnsavedChanges(true);
    // Clear the AsyncStorage
    await clearMealPlanFromStorage();
  };

  // Format date for display
  const formatDate = (date) => {
    return moment(date).format('MMM D');
  };

  // Get dates for the current week
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = moment(currentWeek).startOf('week').add(1, 'day'); // Start from Monday
    for (let i = 0; i < 7; i++) {
      dates.push(moment(startOfWeek).add(i, 'days').toDate());
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Change the current week (next or previous)
  const changeWeek = (direction) => {
    setCurrentWeek((prevDate) => {
      return moment(prevDate)
        .add(direction === 'next' ? 7 : -7, 'days')
        .toDate();
    });
  };

  // Save the current meal plan
  const saveMealPlan = async () => {
    const dataToSave = {
      userId,
      weeklyPlan: meals,
      isFavorited: isFavorite,
      savedPlanName: isFavorite ? favoriteName : getCurrentWeekIdentifier(),
      tags: isFavorite ? favoriteTags : null,
      addToShoppingList: addIngredients,
    };

    try {
      setIsLoading(true);
      await axios.post(
        'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/saveMealPlan',
        dataToSave
      );
      setIsSuccessModalVisible(true);
      setShowSavePanel(false);
      setPlanName('');
      setFavoriteName('');
      setFavoriteTags('');
      setHasUnsavedChanges(false);
      // Clear the AsyncStorage
      await clearMealPlanFromStorage();
    } catch (error) {
      console.error(
        'Error saving meal plan:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to save meal plan.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Generate AI-based meal plan
  const handleGenerateAIPlan = async () => {
    try {
      setIsApplying(true);
      const response = await axios.get(
        'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/ai-menu'
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
            ? breakfastRecipes[
                Math.floor(Math.random() * breakfastRecipes.length)
              ]
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
      // Reset selections
      setSelectedCustomizations([]);
      setSelectedSavedMealPlan(null);
      setFilters([]);
      setLastCustomizationPlans([]);
      setDayPlanIndices({});
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error(
        'Error generating AI meal plan:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to generate AI meal plan.'
      );
    } finally {
      setIsApplying(false);
    }
  };

  // Navigate to create a new customization
  const handleCreateCustomization = () => {
    setShowFilters(false); // Close the modal
    navigation.navigate('CustomizeMealPlan');
  };

  // Apply selected customizations to the meal plan
  const handleApplyCustomizations = async () => {
    if (selectedCustomizations.length === 0) {
      Alert.alert(
        'No Customizations Selected',
        'Please select at least one customization to apply.'
      );
      return;
    }

    try {
      setIsApplying(true);
      const newMeals = {};
      const initialDayPlanIndices = {};
      let dailyPlans = [];

      // Fetch daily plans for the first selected customization
      const customization = selectedCustomizations[0];
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipes/customization/${customization.id}`
      );
      dailyPlans = response.data;

      if (dailyPlans.length === 0) {
        Alert.alert(
          'Error',
          `No recipes found for the customization: ${customization.name}`
        );
        return;
      }

      // For the first 7 days
      for (let index = 0; index < 7; index++) {
        const dayPlan = dailyPlans[index % dailyPlans.length];
        const day = daysOfWeek[index];

        initialDayPlanIndices[day] = index; // Initialize day plan indices

        newMeals[day] = {};

        for (const mealType of mealTypes) {
          const mealIdKey = `${mealType.toLowerCase()}_id`;
          const mealId = dayPlan[mealIdKey];

          if (mealId) {
            // Fetch the recipe data
            const recipeResponse = await axios.get(
              `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipe/${mealId}?userId=${userId}`
            );
            const { recipe } = recipeResponse.data;

            newMeals[day][mealType] = recipe;
          } else {
            newMeals[day][mealType] = null;
          }
        }
      }

      setMeals(newMeals);
      setLastCustomizationPlans(dailyPlans);
      setDayPlanIndices(initialDayPlanIndices);
      setShowFilters(false);
      // Reset selections
      setSelectedCustomizations([]);
      setSelectedSavedMealPlan(null);
      setFilters([]);
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error(
        'Error applying customizations:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to apply customizations.'
      );
    } finally {
      setIsApplying(false);
    }
  };

  // Refresh meals for a specific day
  const refreshDayMeals = async (day) => {
    if (!lastCustomizationPlans || lastCustomizationPlans.length === 0) {
      Alert.alert(
        'No customization data available',
        'Please apply a customization first.'
      );
      return;
    }

    try {
      setIsApplying(true);

      const currentPlanIndex = dayPlanIndices[day] || 0;
      let newPlanIndex = currentPlanIndex + 1;

      if (newPlanIndex >= lastCustomizationPlans.length) {
        newPlanIndex = 0; // Wrap around to the beginning
      }

      const dayPlan = lastCustomizationPlans[newPlanIndex];

      const newDayMeals = {};

      for (const mealType of mealTypes) {
        const mealIdKey = `${mealType.toLowerCase()}_id`;
        const mealId = dayPlan[mealIdKey];

        if (mealId) {
          // Fetch the recipe data
          const recipeResponse = await axios.get(
            `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipe/${mealId}?userId=${userId}`
          );
          const { recipe } = recipeResponse.data;
          newDayMeals[mealType] = recipe;
        } else {
          newDayMeals[mealType] = null;
        }
      }

      // Update the meals state for that day
      setMeals((prevMeals) => ({
        ...prevMeals,
        [day]: newDayMeals,
      }));

      // Update the dayPlanIndices
      setDayPlanIndices((prevIndices) => ({
        ...prevIndices,
        [day]: newPlanIndex,
      }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error(
        'Error refreshing day meals:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to refresh meals for the day.'
      );
    } finally {
      setIsApplying(false);
    }
  };

  // Apply a saved meal plan
  const handleApplySavedMealPlan = async () => {
    if (!selectedSavedMealPlan) {
      Alert.alert(
        'No Saved Meal Plan Selected',
        'Please select a saved meal plan to apply.'
      );
      return;
    }

    try {
      setIsApplying(true);
      const planName = selectedSavedMealPlan.name;
      console.log('Selected Plan Name:', planName);

      const apiUrl = `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/getMealPlanByName/${userId}/${encodeURIComponent(
        planName
      )}`;
      console.log('API URL:', apiUrl);

      const response = await axios.get(apiUrl);
      console.log('API Response:', response.data);

      const fetchedMealPlan = response.data;

      if (!fetchedMealPlan || Object.keys(fetchedMealPlan).length === 0) {
        Alert.alert('Error', `No meal plan found with the name: ${planName}`);
        return;
      }

      // Load the saved meal plan into the meals state
      await loadSavedMealPlan(fetchedMealPlan);
      setShowFilters(false);
      // Reset selections
      setSelectedCustomizations([]);
      setSelectedSavedMealPlan(null);
      setFilters([]);
      setLastCustomizationPlans([]);
      setDayPlanIndices({});
      setHasUnsavedChanges(true);
      // Clear the in-progress meal plan from AsyncStorage
      await clearMealPlanFromStorage();
    } catch (error) {
      console.error(
        'Error applying saved meal plan:',
        error.response?.data || error.message || error
      );
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to apply saved meal plan.'
      );
    } finally {
      setIsApplying(false);
    }
  };

  // Close the success modal
  const handleSuccessModalClose = () => {
    setIsSuccessModalVisible(false);
    // Navigate to MealPreview after saving the meal plan
    navigation.navigate('MealPreview');
  };

  // Toggle dietary preferences
  const toggleFilter = (preference) => {
    if (filters.includes(preference)) {
      setFilters(filters.filter((f) => f !== preference));
    } else {
      setFilters([...filters, preference]);
    }
  };

  // Toggle customization selection
  const toggleCustomizationSelection = (customization) => {
    if (selectedCustomizations.some((c) => c.id === customization.id)) {
      setSelectedCustomizations(
        selectedCustomizations.filter((c) => c.id !== customization.id)
      );
    } else {
      setSelectedCustomizations([...selectedCustomizations, customization]);
    }
  };

  // Toggle saved meal plan selection (single selection)
  const toggleSavedMealPlanSelection = (mealPlan) => {
    if (selectedSavedMealPlan && selectedSavedMealPlan.name === mealPlan.name) {
      setSelectedSavedMealPlan(null);
    } else {
      setSelectedSavedMealPlan(mealPlan);
    }
  };

  if (isLoading || isApplying) {
    return (
      <View style={styles.loadingOverlay}>
        <Image
          source={require('../assets/loading5.gif')}
          style={styles.loadingGif}
        />
      </View>
    );
  }

  // Get the navigation state to determine the current route
  const currentRoute = navigation.getState().routes[navigation.getState().index];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logoText}>Planner</Text>
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
        {/* Week navigation */}
        <View style={styles.weekNavigation}>
          <TouchableOpacity
            style={styles.weekNavButton}
            onPress={() => changeWeek('prev')}
            accessibilityLabel="Previous Week"
            accessibilityHint="Navigate to the previous week"
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
            accessibilityLabel="Next Week"
            accessibilityHint="Navigate to the next week"
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
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>
                {day}{' '}
                <Text style={styles.dayDate}>
                  ({formatDate(weekDates[index])})
                </Text>
              </Text>
              <TouchableOpacity
                onPress={() => refreshDayMeals(day)}
                style={styles.refreshButton}
                accessibilityLabel={`Refresh meals for ${day}`}
                accessibilityHint={`Get new meals for ${day}`}
              >
                <Image
                  source={require('../assets/refresh.png')}
                  style={styles.refreshIcon}
                />
              </TouchableOpacity>
            </View>
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
                      accessibilityLabel={`${mealType} - ${meals[day][mealType].title}`}
                      accessibilityHint="Navigate to recipe details"
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
                        accessibilityLabel={`Remove ${mealType} - ${meals[day][mealType].title}`}
                        accessibilityHint="Remove this meal from the plan"
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
                      accessibilityLabel={`Add ${mealType} for ${day}`}
                      accessibilityHint={`Navigate to add a ${mealType} for ${day}`}
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
          accessibilityLabel="Generate Meal Plan"
          accessibilityHint="Open options to generate a new meal plan"
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
          accessibilityLabel="Save Meal Plan"
          accessibilityHint="Open options to save the current meal plan"
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
                accessibilityLabel="Close Filters"
                accessibilityHint="Close the filter options modal"
              >
                <Image
                  source={require('../assets/close.png')}
                  style={styles.closeModalIcon}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {/* Dietary Preferences Section */}
              <Text style={styles.sectionTitle}>Dietary Preferences</Text>
              <View style={styles.checkboxContainer}>
                {dietaryPreferences.map((preference) => (
                  <View key={preference} style={styles.checkboxRow}>
                    <Checkbox
                      value={filters.includes(preference)}
                      onValueChange={() => toggleFilter(preference)}
                      tintColors={{ true: '#0EA5E9', false: '#6B7280' }}
                      style={styles.checkbox}
                      boxType="square"
                      onCheckColor="#FFFFFF"
                      onFillColor="#0EA5E9"
                      onTintColor="#0EA5E9"
                    />
                    <Text style={styles.checkboxLabel}>{preference}</Text>
                  </View>
                ))}
              </View>

              {/* Customizations Section */}
              <Text style={styles.sectionTitle}>Customizations</Text>
              <View style={styles.checkboxContainer}>
                {customizations.map((customization) => (
                  <View key={customization.id} style={styles.checkboxRow}>
                    <Checkbox
                      value={selectedCustomizations.some((c) => c.id === customization.id)}
                      onValueChange={() => toggleCustomizationSelection(customization)}
                      tintColors={{ true: '#0EA5E9', false: '#6B7280' }}
                      style={styles.checkbox}
                      boxType="square"
                      onCheckColor="#FFFFFF"
                      onFillColor="#0EA5E9"
                      onTintColor="#0EA5E9"
                    />
                    <Text style={styles.checkboxLabel}>{customization.name}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteCustomization(customization.id)}
                      style={styles.deleteButton}
                      accessibilityLabel={`Delete customization ${customization.name}`}
                      accessibilityHint="Deletes this customization from your list"
                    >
                      <Image
                        source={trashIcon}
                        style={styles.deleteIcon}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Saved Meal Plans Section */}
              <Text style={styles.sectionTitle}>Saved Meal Plans</Text>
              <View style={styles.checkboxContainer}>
                {savedMealPlans.map((mealPlan) => (
                  <View key={mealPlan.name} style={styles.checkboxRow}>
                    <Checkbox
                      value={selectedSavedMealPlan?.name === mealPlan.name}
                      onValueChange={() => toggleSavedMealPlanSelection(mealPlan)}
                      tintColors={{ true: '#0EA5E9', false: '#6B7280' }}
                      style={styles.checkbox}
                      boxType="square"
                      onCheckColor="#FFFFFF"
                      onFillColor="#0EA5E9"
                      onTintColor="#0EA5E9"
                    />
                    <Text style={styles.checkboxLabel}>{mealPlan.name}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteMealPlan(mealPlan.name)}
                      style={styles.deleteButton}
                      accessibilityLabel={`Delete meal plan ${mealPlan.name}`}
                      accessibilityHint="Deletes this meal plan from your list"
                    >
                      <Image
                        source={trashIcon}
                        style={styles.deleteIcon}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Apply Customizations Button */}
              <TouchableOpacity
                onPress={handleApplyCustomizations}
                style={styles.applyCustomizationsButton}
                accessibilityLabel="Apply Customizations"
                accessibilityHint="Apply the selected customizations to your meal plan"
                disabled={isApplying}
              >
                <Text style={styles.applyButtonTextAI}>
                  {isApplying ? 'Applying...' : 'Apply Customizations'}
                </Text>
              </TouchableOpacity>

              {/* Apply Saved Meal Plan Button */}
              <TouchableOpacity
                onPress={handleApplySavedMealPlan}
                style={styles.applySavedMealPlansButton}
                accessibilityLabel="Apply Saved Meal Plan"
                accessibilityHint="Apply the selected saved meal plan to your meal plan"
                disabled={isApplying}
              >
                <Text style={styles.applyButtonTextAI}>
                  {isApplying ? 'Applying...' : 'Apply Saved Meal Plan'}
                </Text>
              </TouchableOpacity>

              {/* Generate AI Meal Plan Button */}
              <TouchableOpacity
                onPress={handleGenerateAIPlan}
                style={styles.applyButtonAI}
                accessibilityLabel="Generate AI Meal Plan"
                accessibilityHint="Automatically generate a meal plan based on selected preferences"
                disabled={isApplying}
              >
                <Image
                  source={require('../assets/bot.png')}
                  style={styles.botIcon}
                />
                <Text style={styles.applyButtonTextAI}>
                  Generate AI Meal Plan
                </Text>
              </TouchableOpacity>

              {/* Create Customization Button */}
              <TouchableOpacity
                onPress={handleCreateCustomization}
                style={styles.createCustomizationButton}
                accessibilityLabel="Create Customization"
                accessibilityHint="Create a new customization for your meal plan"
                disabled={isApplying}
              >
                <Image
                  source={require('../assets/plus.png')}
                  style={styles.createCustomizationIcon}
                />
                <Text style={styles.createCustomizationButtonText}>
                  Create Customization
                </Text>
              </TouchableOpacity>

              {/* Clear All Meals Button */}
              <TouchableOpacity
                onPress={clearAllMeals}
                style={styles.clearButton}
                accessibilityLabel="Clear All Meals"
                accessibilityHint="Remove all meals from the current meal plan"
                disabled={isApplying}
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
                accessibilityLabel="Close Save Panel"
                accessibilityHint="Close the save meal plan modal"
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
                <Switch
                  value={isFavorite}
                  onValueChange={setIsFavorite}
                  accessibilityLabel="Toggle Add to Favorites"
                  accessibilityHint="Add this meal plan to your favorites"
                />
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
                    accessibilityLabel="Favorite Meal Plan Name"
                    accessibilityHint="Enter a name for your favorite meal plan"
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
                    accessibilityLabel="Favorite Meal Plan Tags"
                    accessibilityHint="Enter tags for your favorite meal plan, separated by commas"
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
                  accessibilityLabel="Toggle Add Ingredients"
                  accessibilityHint="Add missing ingredients to your shopping list"
                />
              </View>
              <Text style={styles.modalNote}>
                Only ingredients that are not in stock will be added to your
                shopping list.
              </Text>
              <TouchableOpacity
                onPress={saveMealPlan}
                style={styles.savePlanButton}
                accessibilityLabel="Save Meal Plan"
                accessibilityHint="Save the current meal plan with the selected options"
                disabled={isLoading}
              >
                <Text style={styles.savePlanButtonText}>
                  {isLoading ? 'Saving...' : 'Save Plan'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowSavePanel(false)}
                accessibilityLabel="Cancel Save Plan"
                accessibilityHint="Cancel saving the meal plan"
                disabled={isLoading}
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
        onRequestClose={handleSuccessModalClose}
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
                accessibilityLabel="Close Success Modal"
                accessibilityHint="Close the success message modal"
              >
                <Text style={styles.closeSuccessButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 42,
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
  // Navigation Tabs Styles
  navigationTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
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
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  dayDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  refreshButton: {
    padding: 4,
  },
  refreshIcon: {
    width: 24,
    height: 24,
    tintColor: '#6B7280',
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
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
    flexShrink: 1,
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
    paddingHorizontal: 32, // Added to give the button some horizontal padding
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center', // This centers the button horizontally
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
  applyCustomizationsButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  applySavedMealPlansButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  // Loading Overlay Styles
  loadingOverlay: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Set background to white
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGif: {
    width: 200,
    height: 200,
  },
  deleteButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  deleteIcon: {
    width: 16,
    height: 16,
    tintColor: '#EF4444', // Red color for delete action
  },
});