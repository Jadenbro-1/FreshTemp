// NutritionDashboard.js

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { ProgressBar } from 'react-native-paper'; // For progress bars
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import Navbar from './Navbar'; // Ensure Navbar is correctly imported

// Mock data for the dashboard
const initialMacros = [
  { name: 'Protein', current: 75, goal: 150, unit: 'g' },
  { name: 'Carbs', current: 180, goal: 200, unit: 'g' },
  { name: 'Fat', current: 40, goal: 65, unit: 'g' },
];

const initialMicroNutrients = [
  { name: 'Fiber', current: 15, goal: 30, unit: 'g' },
  { name: 'Vitamin C', current: 45, goal: 90, unit: 'mg' },
  { name: 'Calcium', current: 600, goal: 1000, unit: 'mg' },
  { name: 'Iron', current: 10, goal: 18, unit: 'mg' },
];

export default function NutritionDashboard() {
  const navigation = useNavigation();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [macros, setMacros] = useState(initialMacros);
  const [microNutrients, setMicroNutrients] = useState(initialMicroNutrients);
  const [showAddMacroModal, setShowAddMacroModal] = useState(false);
  const [selectedMacro, setSelectedMacro] = useState(null);
  const [addAmount, setAddAmount] = useState('');

  const formatDate = (date) => {
    return moment(date).format('MMM D, YYYY');
  };

  const changeDate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const addMacro = (macroName, amount) => {
    setMacros((prevMacros) =>
      prevMacros.map((macro) =>
        macro.name === macroName
          ? { ...macro, current: Math.min(macro.current + amount, macro.goal) }
          : macro
      )
    );
  };

  const analyzeMacros = () => {
    // You can implement your analysis logic here
    Alert.alert('Macros Analyzed', `Your macros for ${formatDate(currentDate)} have been analyzed.`);
  };

  const calculateTotalCalories = () => {
    return macros.reduce((total, macro) => {
      const caloriesPerGram = macro.name === 'Protein' || macro.name === 'Carbs' ? 4 : 9;
      return total + macro.current * caloriesPerGram;
    }, 0);
  };

  const openAddMacroModal = (macro) => {
    setSelectedMacro(macro);
    setAddAmount('');
    setShowAddMacroModal(true);
  };

  const handleAddMacro = () => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      addMacro(selectedMacro.name, amount);
      setShowAddMacroModal(false);
    } else {
      Alert.alert('Invalid Input', 'Please enter a valid amount.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Header Top with Logo and (Removed) Header Icons */}
        <View style={styles.headerTop}>
          <Text style={styles.logoText}>Nutrition</Text>
          {/* Removed headerIcons */}
        </View>

        {/* Navigation Tabs */}
        <View style={styles.navigationTabs}>
          <TouchableOpacity
            onPress={() => navigation.navigate('WeeklyMealPlan')}
            style={styles.tabButton}
            accessibilityLabel="Meal Plan Tab"
            accessibilityHint="Navigate to Meal Plan"
          >
            <Text style={styles.tabText}>Meal Plan</Text>
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
            onPress={() => navigation.navigate('NutritionDashboard')}
            style={[styles.tabButton, styles.activeTabButton]} // Set Nutrition as active
            accessibilityLabel="Nutrition Tab"
            accessibilityHint="Navigate to Nutrition Dashboard"
          >
            <Text style={[styles.tabText, styles.activeTabText]}>Nutrition</Text>
          </TouchableOpacity>
        </View>

        {/* Internal Tabs: Macro and Micro Tracking */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.internalTab, styles.activeInternalTab]} // Set Macro as active by default
            onPress={() => {}}
            accessibilityLabel="Macro Tracking Tab"
            accessibilityHint="Show macro tracking"
          >
            <Text style={[styles.internalTabText, styles.activeInternalTabText]}>Macros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.internalTab}
            onPress={() => {}}
            accessibilityLabel="Micronutrient Tracking Tab"
            accessibilityHint="Show micronutrient tracking"
          >
            <Text style={styles.internalTabText}>Micronutrients</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {/* Total Calories */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Calories</Text>
          <Text style={styles.caloriesText}>{calculateTotalCalories()} kcal</Text>
        </View>

        {/* Macro Tracking */}
        {macros.map((macro) => (
          <View key={macro.name} style={styles.card}>
            <View style={styles.macroHeader}>
              <Text style={styles.macroTitle}>{macro.name}</Text>
              <Text style={styles.macroValue}>
                {macro.current}
                {macro.unit} / {macro.goal}
                {macro.unit}
              </Text>
            </View>
            <ProgressBar
              progress={macro.current / macro.goal}
              color="#5FC6FF"
              style={styles.progressBar}
            />
            <View style={styles.macroFooter}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => openAddMacroModal(macro)}
                accessibilityLabel={`Add ${macro.name}`}
                accessibilityHint={`Add ${macro.name} to your daily intake`}
              >
                <Image source={require('../assets/plus.png')} style={styles.addIcon} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              <Text style={styles.macroPercentage}>
                {Math.round((macro.current / macro.goal) * 100)}% of goal
              </Text>
            </View>
          </View>
        ))}

        {/* Micronutrients */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Micronutrients</Text>
          {microNutrients.map((nutrient) => (
            <View key={nutrient.name} style={styles.microRow}>
              <View style={styles.microInfo}>
                <View style={styles.microDot} />
                <Text style={styles.microName}>{nutrient.name}</Text>
              </View>
              <Text style={styles.microValue}>
                {nutrient.current}/{nutrient.goal}
                {nutrient.unit}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Analyze Button */}
      <TouchableOpacity style={styles.analyzeButton} onPress={analyzeMacros}>
        <Image source={require('../assets/chart.png')} style={styles.analyzeIcon} />
        <Text style={styles.analyzeButtonText}>Analyze Macros</Text>
      </TouchableOpacity>

      {/* Add Macro Modal */}
      {showAddMacroModal && (
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add {selectedMacro.name}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder={`Enter ${selectedMacro.name.toLowerCase()} in ${selectedMacro.unit}`}
              keyboardType="numeric"
              value={addAmount}
              onChangeText={setAddAmount}
              accessibilityLabel={`Enter amount for ${selectedMacro.name}`}
              accessibilityHint={`Input the amount of ${selectedMacro.name} you consumed`}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleAddMacro}>
              <Text style={styles.modalButtonText}>Add {selectedMacro.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowAddMacroModal(false)}
              accessibilityLabel="Cancel Adding Macro"
              accessibilityHint="Close the add macro modal without adding"
            >
              <Text style={styles.modalCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Navbar */}
      <Navbar currentScreen="MealPlanner" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 42, // Consistent with PantryScreen and GroceryPlanner
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24, // Adjusted to match PantryScreen and GroceryPlanner
    paddingHorizontal: 16,
    marginBottom: 16,
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
    marginBottom: 12, // Consistent with PantryScreen and GroceryPlanner
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#5FC6FF', // Consistent theme color
    fontFamily: 'Cochin',
  },
  // Removed headerIcons styles since headerIcons are removed

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
  // Internal Tabs (Macros and Micronutrients) Styles
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    padding: 4,
    alignSelf: 'center',
    width: '90%',
    marginTop: 8,
  },
  internalTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 9999,
  },
  activeInternalTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  internalTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeInternalTabText: {
    color: '#5FC6FF',
    fontWeight: '600',
  },
  // Main Content Styles
  mainContent: {
    paddingHorizontal: 16,
    paddingBottom: 120, // Adjusted to accommodate Navbar
  },
  contentContainer: {
    paddingVertical: 16,
  },
  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  caloriesText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5FC6FF',
  },
  // Macro Tracking Styles
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  macroValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  macroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#5FC6FF',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addIcon: {
    width: 16,
    height: 16,
    tintColor: '#5FC6FF',
    marginRight: 4,
  },
  addButtonText: {
    fontSize: 12,
    color: '#5FC6FF',
  },
  macroPercentage: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Micronutrient Tracking Styles
  microRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  microInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  microDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5FC6FF',
    marginRight: 8,
  },
  microName: {
    fontSize: 14,
    color: '#1F2937',
  },
  microValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Analyze Button Styles
  analyzeButton: {
    position: 'absolute',
    bottom: 90, // Adjusted to be above the Navbar (assuming Navbar height ~60)
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5FC6FF',
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  analyzeIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    marginRight: 8,
  },
  analyzeButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    color: '#1F2937',
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#5FC6FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalCancelButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#5FC6FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#5FC6FF',
    fontWeight: '600',
  },
});