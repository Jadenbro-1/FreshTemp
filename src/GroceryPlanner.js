// GroceryPlanner.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Navbar from './Navbar'; // Ensure Navbar is correctly imported

// Replace with actual user id after authentication system integration
const userId = 1;

const GroceryPlanner = () => {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'shop'
  const [groceryItems, setGroceryItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch grocery items from backend
  useEffect(() => {
    const fetchGroceryList = async () => {
      try {
        const response = await axios.get(
          `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/grocery-list/${userId}`
        );
        // Initialize 'completed' property for each item
        const itemsWithCompletion = response.data.map((item) => ({
          ...item,
          completed: false,
        }));
        setGroceryItems(itemsWithCompletion);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching grocery list:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Failed to load grocery list.');
      }
    };

    fetchGroceryList();
  }, []);

  // Functions to handle item actions
  const toggleItemCompletion = (id) => {
    setGroceryItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (id) => {
    setGroceryItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateItemQuantity = (id, newQuantity) => {
    setGroceryItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: parseInt(newQuantity) || 0 }
          : item
      )
    );
  };

  // Sort items, completed items at the bottom
  const sortedGroceryItems = [...groceryItems].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  // Filter items based on search text
  const filteredItems = sortedGroceryItems.filter((item) =>
    item.item_name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5FC6FF" />
        <Text>Loading your grocery list...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logoText}>Groceries</Text>
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

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'list' ? styles.activeTab : null]}
            onPress={() => setActiveTab('list')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'list' ? styles.activeTabText : null,
              ]}
            >
              Grocery List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shop' ? styles.activeTab : null]}
            onPress={() => setActiveTab('shop')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'shop' ? styles.activeTabText : null,
              ]}
            >
              Shop
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {activeTab === 'list' && (
          <View style={styles.contentContainer}>
            {/* Search bar */}
            <View style={styles.searchContainer}>
              <Image
                source={require('../assets/search.png')}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search grocery items..."
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* Grocery list items */}
            <View style={styles.itemsContainer}>
              {filteredItems.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    item.completed ? styles.itemCompleted : null,
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      item.completed ? styles.checkboxCompleted : null,
                    ]}
                    onPress={() => toggleItemCompletion(item.id)}
                  >
                    {item.completed && (
                      <Image
                        source={require('../assets/check.png')}
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <Text
                      style={[
                        styles.itemName,
                        item.completed ? styles.itemNameCompleted : null,
                      ]}
                    >
                      {item.item_name}
                    </Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.category}</Text>
                    </View>
                  </View>
                  <View style={styles.itemDetails}>
                    <TextInput
                      style={styles.quantityInput}
                      value={item.quantity.toString()}
                      keyboardType="numeric"
                      onChangeText={(text) => updateItemQuantity(item.id, text)}
                    />
                    <Text style={styles.unitText}>{item.metric}</Text>
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                      <Image
                        source={require('../assets/trash2.png')}
                        style={styles.trashIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'shop' && (
          <View style={styles.contentContainer}>
            {/* Search bar */}
            <View style={styles.searchContainer}>
              <Image
                source={require('../assets/search.png')}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search shop items..."
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* Placeholder content */}
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Shop items will appear here.</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navbar */}
      <Navbar currentScreen="MealPlanner" />
    </View>
  );
};

export default GroceryPlanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 42,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
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
  // Tabs Styles
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    padding: 4,
    alignSelf: 'center',
    width: '90%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 9999,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#5FC6FF',
    fontWeight: '600',
  },
  // Main Content Styles
  mainContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Adjusted to accommodate Navbar
  },
  contentContainer: {
    paddingVertical: 16,
  },
  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchIcon: {
    width: 16,
    height: 16,
    tintColor: '#9CA3AF',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  // Grocery List Items Styles
  itemsContainer: {},
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10, // Reduced padding for smaller items
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  itemCompleted: {
    opacity: 0.5,
  },
  checkbox: {
    width: 20, // Smaller size
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxCompleted: {
    backgroundColor: '#5FC6FF',
    borderColor: '#5FC6FF',
  },
  checkIcon: {
    width: 12,
    height: 12,
    tintColor: '#FFFFFF',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14, // Reduced font size
    color: '#1F2937',
    marginBottom: 4,
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10, // Smaller font size
    color: '#0369A1',
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    width: 35, // Reduced width
    height: 28, // Reduced height
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    textAlign: 'center',
    marginRight: 6,
    fontSize: 12, // Smaller font size
    color: '#1F2937',
  },
  unitText: {
    fontSize: 12, // Smaller font size
    color: '#6B7280',
    marginRight: 6,
  },
  trashIcon: {
    width: 18, // Reduced size
    height: 18,
    tintColor: '#9CA3AF', // Gray color
  },
  // Placeholder for Shop Tab
  placeholderContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});