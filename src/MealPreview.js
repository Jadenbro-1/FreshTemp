import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

// Import the icons from your assets
import ChevronLeftIcon from '/Users/jadenbro1/FreshTemp/assets/chevron-left.png'; // Back icon
import EditIcon from '/Users/jadenbro1/FreshTemp/assets/edit.png'; // Edit icon
import ArrowLeftIcon from '/Users/jadenbro1/FreshTemp/assets/arrow.png'; // Arrow icon facing left
import ArrowRightIcon from '/Users/jadenbro1/FreshTemp/assets/arrow.png'; // Arrow icon facing right
import TrendingIcon from '/Users/jadenbro1/FreshTemp/assets/trending.png'; // Calorie icon
import ClockIcon from '/Users/jadenbro1/FreshTemp/assets/clock.png'; // Prep time icon
import ForkIcon from '/Users/jadenbro1/FreshTemp/assets/fork.png'; // Start cooking icon
import WarningIcon from '/Users/jadenbro1/FreshTemp/assets/warning.png'; // Warning icon
import ReminderIcon from '/Users/jadenbro1/FreshTemp/assets/reminder.png'; // Reminder icon
import CameraIcon from '/Users/jadenbro1/FreshTemp/assets/plus.png'; // Camera icon
import PlusIcon from '/Users/jadenbro1/FreshTemp/assets/plus.png'; // Plus icon



// Placeholder image (ensure you have this image in your assets)
const placeholderImage = require('/Users/jadenbro1/FreshTemp/assets/plus.png');

// Mock data for the week's meals
const weekMeals = [
  {
    day: 'Monday',
    date: '2023-07-10',
    meals: [
      {
        id: 1,
        name: 'Avocado Toast',
        image: placeholderImage,
        category: 'Breakfast',
        calories: 350,
        protein: 15,
        carbs: 30,
        fat: 22,
        prepTime: 10,
        instructions: 'Toast bread and mash avocado.',
        earlyPrep: false,
      },
      {
        id: 2,
        name: 'Grilled Chicken Salad',
        image: placeholderImage,
        category: 'Lunch',
        calories: 450,
        protein: 40,
        carbs: 15,
        fat: 25,
        prepTime: 20,
        instructions: 'Grill chicken and chop vegetables.',
        earlyPrep: false,
      },
      {
        id: 3,
        name: 'Salmon with Roasted Vegetables',
        image: placeholderImage,
        category: 'Dinner',
        calories: 550,
        protein: 35,
        carbs: 25,
        fat: 30,
        prepTime: 30,
        instructions: 'Defrost salmon in the morning. Preheat oven to 400°F.',
        earlyPrep: true,
      },
    ],
    reminders: ['Eggs go bad this week', 'Defrost chicken for Wednesday'],
  },
  // Include data for other days similarly
  // ...
];

const categoryColors = {
  Breakfast: { backgroundColor: '#FEF3C7', textColor: '#92400E' }, // bg-yellow-100 text-yellow-800
  Lunch: { backgroundColor: '#D1FAE5', textColor: '#065F46' }, // bg-green-100 text-green-800
  Dinner: { backgroundColor: '#EDE9FE', textColor: '#5B21B6' }, // bg-purple-100 text-purple-800
};

const macroBadgeStyles = {
  protein: { backgroundColor: '#FEE2E2', textColor: '#B91C1C' }, // bg-red-100 text-red-800
  carbs: { backgroundColor: '#D1FAE5', textColor: '#065F46' }, // bg-green-100 text-green-800
  fat: { backgroundColor: '#FEF3C7', textColor: '#92400E' }, // bg-yellow-100 text-yellow-800
};

const MealPreview = () => {
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const currentDay = weekMeals[currentDayIndex];

  const goToPreviousDay = () => {
    setCurrentDayIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : weekMeals.length - 1
    );
  };

  const goToNextDay = () => {
    setCurrentDayIndex((prevIndex) =>
      prevIndex < weekMeals.length - 1 ? prevIndex + 1 : 0
    );
  };

  const calculateDailyMacros = () => {
    return currentDay.meals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fat += meal.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Image source={ChevronLeftIcon} style={styles.headerIcon} />
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Meal Preview</Text>
          <Text style={styles.headerDate}>{formatDate(currentDay.date)}</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Image source={EditIcon} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Day Navigation */}
        <View style={styles.dayNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousDay}>
            <Image source={ArrowLeftIcon} style={styles.navIcon} />
          </TouchableOpacity>
          <Text style={styles.dayTitle}>{currentDay.day}</Text>
          <TouchableOpacity style={styles.navButton} onPress={goToNextDay}>
            <Image source={ArrowRightIcon} style={styles.navIcon} />
          </TouchableOpacity>
        </View>

        {/* Meals */}
        {currentDay.meals.map((meal) => (
          <View key={meal.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={meal.image} style={styles.mealImage} />
              <View style={styles.cardHeaderText}>
                <View style={styles.mealTitleContainer}>
                  <Text style={styles.mealTitle}>{meal.name}</Text>
                  {meal.earlyPrep && (
                    <Image source={WarningIcon} style={styles.warningIcon} />
                  )}
                </View>
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor:
                        categoryColors[meal.category].backgroundColor,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: categoryColors[meal.category].textColor,
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    {meal.category}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.mealInfo}>
                <View style={styles.mealInfoItem}>
                  <Image source={TrendingIcon} style={styles.infoIcon} />
                  <Text style={styles.infoText}>{meal.calories} cal</Text>
                </View>
                <View style={styles.mealInfoItem}>
                  <Image source={ClockIcon} style={styles.infoIcon} />
                  <Text style={styles.infoText}>{meal.prepTime} min</Text>
                </View>
              </View>
              <Text style={styles.instructions}>{meal.instructions}</Text>
              <View style={styles.macrosAndButton}>
                <View style={styles.macros}>
                  <View
                    style={[
                      styles.macroBadge,
                      {
                        backgroundColor: macroBadgeStyles.protein.backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: macroBadgeStyles.protein.textColor,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      P: {meal.protein}g
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.macroBadge,
                      {
                        backgroundColor: macroBadgeStyles.carbs.backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: macroBadgeStyles.carbs.textColor,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      C: {meal.carbs}g
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.macroBadge,
                      {
                        backgroundColor: macroBadgeStyles.fat.backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: macroBadgeStyles.fat.textColor,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      F: {meal.fat}g
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.startCookingButton}>
                  <Image source={ForkIcon} style={styles.startCookingIcon} />
                  <Text style={styles.startCookingText}>Start Cooking</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Daily Summary */}
        <View style={styles.dailySummary}>
          <Text style={styles.sectionTitle}>Daily Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryContent}>
              {Object.entries(calculateDailyMacros()).map(([macro, value]) => (
                <View key={macro} style={styles.summaryItem}>
                  <View style={styles.summaryIconContainer}>
                    {macro === 'calories' ? (
                      <Image source={TrendingIcon} style={styles.summaryIcon} />
                    ) : (
                      <View
                        style={[
                          styles.macroBadge,
                          macroBadgeStyles[macro],
                          { padding: 4, borderRadius: 4 },
                        ]}
                      >
                        <Text
                          style={{
                            color: macroBadgeStyles[macro].textColor,
                            fontSize: 12,
                            fontWeight: '600',
                          }}
                        >
                          {macro.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View>
                    <Text style={styles.summaryMacroTitle}>
                      {macro.charAt(0).toUpperCase() + macro.slice(1)}
                    </Text>
                    <Text style={styles.summaryMacroValue}>
                      {macro === 'calories' ? value : `${value}g`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Reminders */}
        <View style={styles.remindersSection}>
          <View style={styles.remindersHeader}>
            <Image source={ReminderIcon} style={styles.reminderIcon} />
            <Text style={styles.sectionTitle}>Reminders</Text>
          </View>
          <View style={styles.remindersCard}>
            {currentDay.reminders.map((reminder, index) => (
              <View key={index} style={styles.reminderItem}>
                <Image source={WarningIcon} style={styles.reminderItemIcon} />
                <Text style={styles.reminderText}>{reminder}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Quick Add Meal Button */}
      <View style={styles.quickAddContainer}>
        <TouchableOpacity style={styles.quickAddButton}>
          <Image source={CameraIcon} style={styles.quickAddIcon} />
          <Image source={PlusIcon} style={styles.quickAddIcon} />
          <Text style={styles.quickAddText}>Quick Add Meal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#FFFFFF', // bg-white
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButtonText: {
    color: '#374151', // text-gray-600
    fontSize: 16,
    marginLeft: 4,
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: '#374151', // text-gray-600
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937', // text-gray-800
  },
  headerDate: {
    fontSize: 14,
    color: '#6B7280', // text-gray-600
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 120,
    paddingBottom: 100,
  },
  dayNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  navButton: {
    padding: 8,
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937', // text-gray-800
  },
  card: {
    backgroundColor: '#FFFFFF', // bg-white
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E5E7EB', // bg-gray-200
    marginRight: 16,
  },
  cardHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937', // text-gray-800
    flexShrink: 1,
  },
  warningIcon: {
    width: 20,
    height: 20,
    tintColor: '#FBBF24', // text-yellow-500
  },
  categoryBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mealInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  mealInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
    tintColor: '#3B82F6', // text-blue-500
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563', // text-gray-600
  },
  instructions: {
    fontSize: 14,
    color: '#4B5563', // text-gray-600
    marginBottom: 8,
  },
  macrosAndButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macros: {
    flexDirection: 'row',
  },
  macroBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  macroText: {
    fontSize: 12,
    fontWeight: '600',
  },
  startCookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // bg-white
    borderColor: '#D1D5DB', // border-gray-300
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  startCookingIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#1F2937', // text-gray-800
  },
  startCookingText: {
    fontSize: 14,
    color: '#1F2937', // text-gray-800
  },
  dailySummary: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937', // text-gray-800
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF', // bg-white
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  summaryIconContainer: {
    marginRight: 8,
  },
  summaryIcon: {
    width: 24,
    height: 24,
    tintColor: '#F97316', // text-orange-500
  },
  summaryMacroTitle: {
    fontSize: 14,
    color: '#4B5563', // text-gray-600
  },
  summaryMacroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937', // text-gray-800
  },
  remindersSection: {
    marginTop: 32,
  },
  remindersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: '#F59E0B', // text-yellow-500
  },
  remindersCard: {
    backgroundColor: '#FFFFFF', // bg-white
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reminderItemIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#3B82F6', // text-blue-500
  },
  reminderText: {
    fontSize: 14,
    color: '#374151', // text-gray-700
    flex: 1,
  },
  quickAddContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF', // bg-white
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    padding: 16,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D4ED8', // bg-blue-600
    borderRadius: 8,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  quickAddIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#FFFFFF', // text-white
  },
  quickAddText: {
    fontSize: 16,
    color: '#FFFFFF', // text-white
    fontWeight: '600',
  },
});

export default MealPreview;
