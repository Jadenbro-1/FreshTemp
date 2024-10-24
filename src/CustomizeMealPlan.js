import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal, TextInput, Alert, StatusBar, FlatList } from 'react-native';
import { Slider } from '@rneui/themed';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

const CustomizeMealPlan = () => {
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(150);
  const [carbs, setCarbs] = useState(200);
  const [fat, setFat] = useState(65);
  const [selectedPreset, setSelectedPreset] = useState("Default");
  const [modalVisible, setModalVisible] = useState(false);
  const [customizationName, setCustomizationName] = useState('');
  const [selectedColor, setSelectedColor] = useState('Red');
  const [selectedIcon, setSelectedIcon] = useState('/Users/jadenbro1/FreshTemp/assets/carrot.png');
  const [showIconDropdown, setShowIconDropdown] = useState(false);

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

  const icons = [
    { name: 'Carrot', path: '/Users/jadenbro1/FreshTemp/assets/carrot.png' },
    { name: 'Fruit', path: '/Users/jadenbro1/FreshTemp/assets/fruit.png' },
    { name: 'Grain', path: '/Users/jadenbro1/FreshTemp/assets/grain.png' },
    { name: 'Protein', path: '/Users/jadenbro1/FreshTemp/assets/protein.png' },
  ];

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    setCalories(presets[preset].calories);
    setProtein(presets[preset].protein);
    setCarbs(presets[preset].carbs);
    setFat(presets[preset].fat);
  };

  const totalCalories = protein * 4 + carbs * 4 + fat * 9;
  const proteinPercentage = ((protein * 4) / totalCalories) * 100;
  const carbsPercentage = ((carbs * 4) / totalCalories) * 100;
  const fatPercentage = ((fat * 9) / totalCalories) * 100;

  const handleSaveCustomization = async () => {
    if (!customizationName.trim()) {
      Alert.alert('Error', 'Please enter a customization name.');
      return;
    }

    try {
      const response = await fetch('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/customizations', {
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
          color: selectedColor,
          icon: selectedIcon,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Customization saved successfully:', data);

      setModalVisible(false);
      Alert.alert('Success', 'Customization saved successfully!');
    } catch (error) {
      console.error('Error saving customization:', error);
      Alert.alert('Error', 'An error occurred while saving the customization.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#222831" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollView}>

        {/* Header */}
        <View style={styles.header}>
          <Image source={require('/Users/jadenbro1/FreshTemp/assets/heart.png')} style={[styles.headerIcon, { tintColor: 'purple' }]} />
          <Text style={styles.headerText}>Customize Meal Plan</Text>
          <Text style={styles.subText}>Adjust your daily macro intake or select a preset diet plan.</Text>
        </View>

        {/* Preset Diet Selection */}
        <View style={styles.presetContainer}>
          <Text style={styles.sectionHeader}>
            <Image source={require('/Users/jadenbro1/FreshTemp/assets/trending.png')} style={[styles.icon, { tintColor: 'orange' }]} />
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
              >
                <Text>{preset}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Adjust Macros */}
        <View style={styles.macroContainer}>
          <Text style={styles.sectionHeader}>
            <Image source={require('/Users/jadenbro1/FreshTemp/assets/chart.png')} style={[styles.icon, { tintColor: 'blue' }]} />
            Adjust Macros
          </Text>

          <MetricSlider
            label="Calories"
            value={calories}
            setValue={setCalories}
            min={0}
            max={4000}
            icon={require('/Users/jadenbro1/FreshTemp/assets/calorie.png')}
            thumbSize={15}
            color="blue"
          />

          <MetricSlider
            label="Protein"
            value={protein}
            setValue={setProtein}
            min={0}
            max={300}
            icon={require('/Users/jadenbro1/FreshTemp/assets/Proteins.png')}
            thumbSize={15}
            color="red"
          />

          <MetricSlider
            label="Carbs"
            value={carbs}
            setValue={setCarbs}
            min={0}
            max={400}
            icon={require('/Users/jadenbro1/FreshTemp/assets/carbs.png')}
            thumbSize={15}
            color="green"
          />

          <MetricSlider
            label="Fat"
            value={fat}
            setValue={setFat}
            min={0}
            max={130}
            icon={require('/Users/jadenbro1/FreshTemp/assets/fats.png')}
            thumbSize={15}
            color="orange"
          />
        </View>

        {/* Nutrition Overview */}
        <View style={styles.nutritionContainer}>
          <Text style={styles.sectionHeader}>
            <Image source={require('/Users/jadenbro1/FreshTemp/assets/heart.png')} style={[styles.icon, { tintColor: 'purple' }]} />
            Nutrition Overview
          </Text>
          <View style={styles.circleChart}>
            <Svg height="200" width="200">
              <Circle cx="100" cy="100" r="80" stroke="#e5e7eb" strokeWidth="20" fill="none" />
              <Circle
                cx="100" cy="100" r="80"
                stroke="#f59e0b" // Fat color
                strokeWidth="20"
                strokeDasharray={`${(fatPercentage / 100) * 500}, 500`}
                fill="none"
              />
              <Circle
                cx="100" cy="100" r="80"
                stroke="#10b981" // Carbs color
                strokeWidth="20"
                strokeDasharray={`${(carbsPercentage / 100) * 500}, 500`}
                strokeDashoffset={-(fatPercentage / 100) * 500}
                fill="none"
              />
              <Circle
                cx="100" cy="100" r="80"
                stroke="#ef4444" // Protein color
                strokeWidth="20"
                strokeDasharray={`${(proteinPercentage / 100) * 500}, 500`}
                strokeDashoffset={-((fatPercentage + carbsPercentage) / 100) * 500}
                fill="none"
              />
              {/* Main calories text */}
              <SvgText
                x="100"           // Center horizontally in SVG
                y="90"            // Positioned slightly above the center
                fontSize="34"
                fontWeight="bold"
                fill="black"
                textAnchor="middle"  // Center the text horizontally
                alignmentBaseline="middle"  // Center the text vertically
              >
                {calories}
              </SvgText>
              {/* Smaller 'kcal' text */}
              <SvgText
                x="100"           // Same horizontal center as the main number
                y="120"           // Positioned slightly below the main calorie number
                fontSize="18"     // Smaller font size for 'kcal'
                fill="grey"       // Lighter font color for 'kcal'
                textAnchor="middle"
              >
                kcal
              </SvgText>
            </Svg>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.saveButtonText}>Save Meal Plan</Text>
        </TouchableOpacity>

        {/* Modal for Customization Name */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Save Customization</Text>
            
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={setCustomizationName}
              value={customizationName}
              placeholder="Enter name"
            />

            <Text style={styles.label}>Color</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text>{selectedColor}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Icon</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowIconDropdown(!showIconDropdown)}
            >
              <Image source={{ uri: selectedIcon }} style={styles.iconPreview} />
              <Text> {icons.find(icon => icon.path === selectedIcon)?.name} </Text>
            </TouchableOpacity>

            {/* Icon Dropdown */}
            {showIconDropdown && (
              <FlatList
                data={icons}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.iconOption}
                    onPress={() => {
                      setSelectedIcon(item.path);
                      setShowIconDropdown(false);
                    }}
                  >
                    <Image source={{ uri: item.path }} style={styles.iconPreview} />
                    <Text>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveCustomization}>
              <Text style={styles.saveButtonText}>Save Customization</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.saveButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const MetricSlider = ({ label, value, setValue, min, max, icon, color = "#00adb5", thumbSize = 20 }) => (
  <View style={styles.metricContainer}>
    <Text style={styles.metricLabel}>
      <Image source={icon} style={[styles.icon, { tintColor: color, width: 24, height: 24, resizeMode: 'contain' }]} />
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
      maximumTrackTintColor="#393e46"
      thumbStyle={{ height: thumbSize, width: thumbSize }}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
    textAlign: 'center',
  },
  presetContainer: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
  },
  selectedPreset: {
    backgroundColor: '#e5e7eb',
  },
  macroContainer: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  metricContainer: {
    marginBottom: 20,
  },
  metricLabel: {
    fontSize: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionContainer: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  circleChart: {
    position: 'relative',
  },
  saveButton: {
    backgroundColor: '#6d28d9',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconPreview: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  iconOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButton: {
    backgroundColor: '#ff5252',
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  icon: {
    width: 24,
    height: 24, // Adjusted icon size
    marginRight: 10,
  },
});

export default CustomizeMealPlan;