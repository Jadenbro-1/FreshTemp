// CustomizeMealPlan.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Slider } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import Navbar from './Navbar'; // Ensure Navbar is correctly imported

const CustomizeMealPlan = () => {
  const navigation = useNavigation();

  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(200);
  const [fat, setFat] = useState(65);
  const [selectedPreset, setSelectedPreset] = useState('Default');
  const [modalVisible, setModalVisible] = useState(false);
  const [customizationName, setCustomizationName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Flag to track which slider is currently being adjusted
  const [currentAdjusting, setCurrentAdjusting] = useState(null);

  const presets = {
    Default: {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 65,
    },
    Bulk: {
      calories: 2500,
      protein: 200,
      carbs: 300,
      fat: 70,
    },
    Shred: {
      calories: 1500,
      protein: 180,
      carbs: 100,
      fat: 50,
    },
  };

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    const newPreset = presets[preset];
    setCalories(newPreset.calories);
    setProtein(newPreset.protein);
    setCarbs(newPreset.carbs);
    setFat(newPreset.fat);
  };

  // Calculate total calories based on macros
  const calculateTotalCalories = (prot, carb, f) => {
    return prot * 4 + carb * 4 + f * 9;
  };

  // Calculate macro percentages for visualization (optional)
  const totalCalories = calculateTotalCalories(protein, carbs, fat);
  const proteinPercentage = ((protein * 4) / totalCalories) * 100;
  const carbsPercentage = ((carbs * 4) / totalCalories) * 100;
  const fatPercentage = ((fat * 9) / totalCalories) * 100;

  // Handle Calories Slider Change
  const handleCaloriesChange = (newCalories) => {
    if (currentAdjusting !== 'calories') {
      setCurrentAdjusting('calories');
      const scaleFactor = newCalories / calories;
      setProtein(Math.round(protein * scaleFactor));
      setCarbs(Math.round(carbs * scaleFactor));
      setFat(Math.round(fat * scaleFactor));
      setCalories(newCalories);
      setCurrentAdjusting(null);
    }
  };

  // Handle Protein Slider Change
  const handleProteinChange = (newProtein) => {
    if (currentAdjusting !== 'protein') {
      setCurrentAdjusting('protein');
      setProtein(newProtein);
      const newTotalCalories = calculateTotalCalories(newProtein, carbs, fat);
      setCalories(newTotalCalories);
      setCurrentAdjusting(null);
    }
  };

  // Handle Carbs Slider Change
  const handleCarbsChange = (newCarbs) => {
    if (currentAdjusting !== 'carbs') {
      setCurrentAdjusting('carbs');
      setCarbs(newCarbs);
      const newTotalCalories = calculateTotalCalories(protein, newCarbs, fat);
      setCalories(newTotalCalories);
      setCurrentAdjusting(null);
    }
  };

  // Handle Fat Slider Change
  const handleFatChange = (newFat) => {
    if (currentAdjusting !== 'fat') {
      setCurrentAdjusting('fat');
      setFat(newFat);
      const newTotalCalories = calculateTotalCalories(protein, carbs, newFat);
      setCalories(newTotalCalories);
      setCurrentAdjusting(null);
    }
  };

  const handleSaveCustomization = async () => {
    if (!customizationName.trim()) {
      Alert.alert('Error', 'Please enter a customization name.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/customizations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 1, // Replace with actual user ID
            name: customizationName,
            calories,
            protein,
            carbs,
            fats: fat,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Customization saved successfully:', data);

      setIsSaving(false);
      setModalVisible(false);
      Alert.alert('Success', 'Customization saved successfully!');
      setCustomizationName('');
    } catch (error) {
      console.error('Error saving customization:', error);
      setIsSaving(false);
      Alert.alert('Error', 'An error occurred while saving the customization.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1F2937" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go Back"
            accessibilityHint="Navigates to the previous screen"
          >
            <Image
              source={require('../assets/back.png')} // Ensure you have a back_arrow.png in your assets
              style={styles.backIcon}
              accessibilityLabel="Back Arrow Icon"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customize Meal Plan</Text>
        </View>

        {/* Preset Diet Selection */}
        <View style={styles.presetContainer}>
          <Text style={styles.sectionHeader}>
            <Image
              source={require('../assets/trending.png')}
              style={[styles.icon, { tintColor: 'orange' }]}
              accessibilityLabel="Trending Icon"
            />
            Select Preset Diet
          </Text>
          <View style={styles.presetSelector}>
            {Object.keys(presets).map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetOption,
                  selectedPreset === preset && styles.selectedPreset,
                ]}
                onPress={() => handlePresetChange(preset)}
                accessibilityLabel={`${preset} Preset`}
                accessibilityHint={`Select the ${preset} diet preset`}
              >
                <Text style={styles.presetText}>{preset}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Adjust Macros */}
        <View style={styles.macroContainer}>
          <Text style={styles.sectionHeader}>
            <Image
              source={require('../assets/chart.png')}
              style={[styles.icon, { tintColor: 'blue' }]}
              accessibilityLabel="Chart Icon"
            />
            Adjust Macros
          </Text>

          <MetricSlider
            label="Calories"
            value={calories}
            setValue={handleCaloriesChange}
            min={500}
            max={4000}
            icon={require('../assets/calorie.png')}
            color="#5FC6FF"
            accessibilityLabel="Calories Slider"
            accessibilityHint="Adjust your daily calorie intake"
          />

          <MetricSlider
            label="Protein (g)"
            value={protein}
            setValue={handleProteinChange}
            min={50}
            max={300}
            icon={require('../assets/Proteins.png')}
            color="#ef4444"
            accessibilityLabel="Protein Slider"
            accessibilityHint="Adjust your daily protein intake in grams"
          />

          <MetricSlider
            label="Carbs (g)"
            value={carbs}
            setValue={handleCarbsChange}
            min={50}
            max={400}
            icon={require('../assets/carbs.png')}
            color="#10b981"
            accessibilityLabel="Carbohydrates Slider"
            accessibilityHint="Adjust your daily carbohydrate intake in grams"
          />

          <MetricSlider
            label="Fat (g)"
            value={fat}
            setValue={handleFatChange}
            min={20}
            max={130}
            icon={require('../assets/fats.png')}
            color="#f59e0b"
            accessibilityLabel="Fat Slider"
            accessibilityHint="Adjust your daily fat intake in grams"
          />
        </View>

        {/* Nutrition Overview */}
        <View style={styles.nutritionContainer}>
          <Text style={styles.sectionHeader}>
            <Image
              source={require('../assets/heart.png')}
              style={[styles.icon, { tintColor: 'purple' }]}
              accessibilityLabel="Heart Icon"
            />
            Nutrition Overview
          </Text>
          <View style={styles.barChartContainer}>
            <View style={styles.bar}>
              <View
                style={[
                  styles.barSegment,
                  { width: `${proteinPercentage.toFixed(1)}%`, backgroundColor: '#ef4444' },
                ]}
                accessibilityLabel={`Protein: ${proteinPercentage.toFixed(1)}%`}
              />
              <View
                style={[
                  styles.barSegment,
                  { width: `${carbsPercentage.toFixed(1)}%`, backgroundColor: '#10b981' },
                ]}
                accessibilityLabel={`Carbohydrates: ${carbsPercentage.toFixed(1)}%`}
              />
              <View
                style={[
                  styles.barSegment,
                  { width: `${fatPercentage.toFixed(1)}%`, backgroundColor: '#f59e0b' },
                ]}
                accessibilityLabel={`Fat: ${fatPercentage.toFixed(1)}%`}
              />
            </View>
            <View style={styles.caloriesTextContainer}>
              <Text style={styles.caloriesText}>{calories} kcal</Text>
            </View>
          </View>
          <View style={styles.percentagesContainer}>
            <View style={styles.percentageItem}>
              <View style={[styles.colorBox, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.percentageText}>Protein</Text>
            </View>
            <View style={styles.percentageItem}>
              <View style={[styles.colorBox, { backgroundColor: '#10b981' }]} />
              <Text style={styles.percentageText}>Carbs</Text>
            </View>
            <View style={styles.percentageItem}>
              <View style={[styles.colorBox, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.percentageText}>Fat</Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => setModalVisible(true)}
          accessibilityLabel="Save Meal Plan"
          accessibilityHint="Open modal to save your meal plan customization"
        >
          <Text style={styles.saveButtonText}>Save Meal Plan</Text>
        </TouchableOpacity>

        {/* Modal for Customization Name */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
          accessibilityViewIsModal={true}
          accessibilityLabel="Save Customization Modal"
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackground}
              activeOpacity={1}
              onPressOut={() => setModalVisible(false)}
              accessible={false}
            />
          </View>
          <View style={styles.modalView}>
            {isSaving ? (
              <View style={styles.loadingContainer}>
                <Image
                  source={require('../assets/loading3.gif')}
                  style={styles.loadingGif}
                  resizeMode="contain"
                  accessibilityLabel="Saving customization, please wait"
                />
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>Save Customization</Text>

                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  onChangeText={setCustomizationName}
                  value={customizationName}
                  placeholder="Enter name"
                  placeholderTextColor="#4B5563"
                  accessibilityLabel="Customization Name Input"
                  accessibilityHint="Enter the name for your meal plan customization"
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={() => setModalVisible(false)}
                    accessibilityLabel="Cancel"
                    accessibilityHint="Cancel saving the customization"
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonAdd}
                    onPress={handleSaveCustomization}
                    accessibilityLabel="Save Customization"
                    accessibilityHint="Save your meal plan customization"
                  >
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Modal>
      </ScrollView>

      {/* Navbar */}
      <Navbar currentScreen="CustomizeMealPlan" />
    </SafeAreaView>
  );
};

// MetricSlider Component
const MetricSlider = ({
  label,
  value,
  setValue,
  min,
  max,
  icon,
  color = '#00adb5',
  thumbSize = 20,
  accessibilityLabel,
  accessibilityHint,
}) => (
  <View style={styles.metricContainer}>
    <Text style={styles.metricLabel}>
      <Image
        source={icon}
        style={[styles.icon, { tintColor: color, width: 24, height: 24, resizeMode: 'contain' }]}
        accessibilityLabel={`${label} Icon`}
      />
      {label}: {value}
    </Text>
    <Slider
      value={value}
      onValueChange={setValue}
      minimumValue={min}
      maximumValue={max}
      step={1}
      thumbTintColor={color}
      minimumTrackTintColor={color}
      maximumTrackTintColor="#D1D5DB"
      thumbStyle={{ height: thumbSize, width: thumbSize }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light background for consistency
  },
  scrollView: {
    paddingHorizontal: 20,
    paddingBottom: 100, // To accommodate Navbar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#1F2937',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  presetContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    color: '#1F2937',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  presetSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  selectedPreset: {
    backgroundColor: '#E5E7EB',
    borderColor: '#5FC6FF',
  },
  presetText: {
    fontSize: 16,
    color: '#1F2937',
  },
  macroContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  metricContainer: {
    marginBottom: 20,
  },
  metricLabel: {
    fontSize: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    color: '#1F2937',
  },
  nutritionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  barChartContainer: {
    width: '100%',
    marginTop: 10,
  },
  bar: {
    flexDirection: 'row',
    height: 30,
    backgroundColor: '#e5e7eb',
    borderRadius: 15,
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  caloriesTextContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  caloriesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  percentagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
  },
  percentageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  percentageText: {
    fontSize: 14,
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#5FC6FF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 14,
    color: '#1F2937',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButtonCancel: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
    marginRight: 10,
  },
  modalButtonAdd: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#5FC6FF',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  loadingGif: {
    width: 100,
    height: 100,
  },
});

export default CustomizeMealPlan;