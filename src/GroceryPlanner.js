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
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Navbar from './Navbar'; // Ensure Navbar is correctly imported
import GroceryConfirmationModal from './modals/GroceryConfirmationModal';

const userId = 1; // Replace with actual user ID after authentication integration

const GroceryPlanner = () => {
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'shop'
  const [groceryItems, setGroceryItems] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add Item Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemMetric, setNewItemMetric] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');

  // Edit Item Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editedItemName, setEditedItemName] = useState('');
  const [editedItemQuantity, setEditedItemQuantity] = useState('');
  const [editedItemMetric, setEditedItemMetric] = useState('');
  const [editedItemCategory, setEditedItemCategory] = useState('');

  // Confirmation Modal State
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('pickup'); // default option

  // Delivery Modal State
  const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);

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
          completed: item.status === 'completed' ? true : false,
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

  // Function to add a new item
  const addNewItem = async () => {
    if (!newItemName.trim()) {
      Alert.alert('Validation Error', 'Item name is required.');
      return;
    }

    const newItem = {
      user_id: userId,
      item_name: newItemName,
      quantity: parseInt(newItemQuantity) || 1,
      metric: newItemMetric || 'pcs',
      category: newItemCategory || 'Other',
      status: 'incomplete',
    };

    try {
      const response = await axios.post(
        'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/grocery-list',
        { groceryListItems: [newItem] }
      );

      if (response.data.success) {
        setGroceryItems((prevItems) => [
          ...prevItems,
          { ...newItem, id: response.data.insertedIds[0], completed: false },
        ]);
        setAddModalVisible(false);
        // Reset modal fields
        setNewItemName('');
        setNewItemQuantity('');
        setNewItemMetric('');
        setNewItemCategory('');
      } else {
        Alert.alert('Error', 'Failed to add new item.');
      }
    } catch (error) {
      console.error('Error adding new item:', error);
      Alert.alert('Error', 'Failed to add new item.');
    }
  };

  // Function to generate shopping list
  const generateShoppingList = () => {
    const incompleteItems = groceryItems.filter((item) => !item.completed);
    if (incompleteItems.length === 0) {
      Alert.alert('Shopping List', 'All items are completed!');
      return;
    }

    setIsConfirmationModalVisible(true);
  };

  // Confirmation functions
  const confirmShoppingList = () => {
    // Implement the logic to handle the confirmed shopping list
    setIsConfirmationModalVisible(false);

    if (deliveryOption === 'delivery') {
      // Show delivery modal
      setIsDeliveryModalVisible(true);

      // Automatically hide the delivery modal after a few seconds
      setTimeout(() => {
        setIsDeliveryModalVisible(false);
      }, 3000); // Adjust the duration as needed
    } else {
      Alert.alert('Success', 'Your shopping list has been confirmed for pickup!');
    }
  };

  const removeItemFromShoppingList = (id) => {
    setGroceryItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // Function to open Edit Modal with selected item
  const openEditModal = (item) => {
    setCurrentItem(item);
    setEditedItemName(item.item_name);
    setEditedItemQuantity(item.quantity.toString());
    setEditedItemMetric(item.metric);
    setEditedItemCategory(item.category);
    setEditModalVisible(true);
  };

  // Function to save edited item
  const saveEditedItem = async () => {
    if (!editedItemName.trim()) {
      Alert.alert('Validation Error', 'Item name is required.');
      return;
    }

    const updatedItem = {
      ...currentItem,
      item_name: editedItemName,
      quantity: parseInt(editedItemQuantity) || 0,
      metric: editedItemMetric || 'pcs',
      category: editedItemCategory || 'Other',
    };

    try {
      const response = await axios.put(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/grocery-list/${currentItem.id}`,
        updatedItem
      );

      if (response.data.success) {
        setGroceryItems((prevItems) =>
          prevItems.map((item) =>
            item.id === currentItem.id ? updatedItem : item
          )
        );
        setEditModalVisible(false);
        setCurrentItem(null);
      } else {
        Alert.alert('Error', 'Failed to update item.');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  // Function to clear the entire grocery list
  const clearGroceryList = () => {
    if (groceryItems.length === 0) {
      Alert.alert('Empty List', 'Your grocery list is already empty.');
      return;
    }

    Alert.alert(
      'Confirm Clear',
      'Are you sure you want to clear the entire grocery list? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(
                `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/grocery-list/${userId}`
              );

              if (
                response.data.success ||
                response.data.message === 'Grocery list cleared successfully.'
              ) {
                setGroceryItems([]);
                Alert.alert('Success', 'All grocery items have been cleared.');
              } else {
                Alert.alert('Error', 'Failed to clear grocery list.');
              }
            } catch (error) {
              console.error('Error clearing grocery list:', error);
              Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to clear grocery list.'
              );
            }
          },
        },
      ]
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

  // Render loading state with loading3.gif
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/loading3.gif')} // Ensure loading3.gif is in the correct path
          style={styles.loadingGif}
          resizeMode="contain"
          accessibilityLabel="Loading grocery items, please wait"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Header Top with Logo and Trash Icon */}
        <View style={styles.headerTop}>
          <Text style={styles.logoText}>Groceries</Text>
          <TouchableOpacity
            onPress={clearGroceryList}
            style={styles.clearListButton}
            accessibilityLabel="Clear Grocery List"
            accessibilityHint="Clears all items from the grocery list"
          >
            <Image
              source={require('../assets/trash2.png')}
              style={styles.clearListIcon}
              accessibilityLabel="Trash Icon"
            />
          </TouchableOpacity>
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
            style={[styles.tabButton, styles.activeTabButton]} // Set Grocery as active
            accessibilityLabel="Grocery Tab"
            accessibilityHint="Navigate to Grocery Planner"
          >
            <Text style={[styles.tabText, styles.activeTabText]}>Grocery</Text>
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

        {/* Internal Tabs: Grocery List and Shop */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.internalTab,
              activeTab === 'list' ? styles.activeInternalTab : null,
            ]}
            onPress={() => setActiveTab('list')}
            accessibilityLabel="Grocery List Tab"
            accessibilityHint="Show grocery list items"
          >
            <Text
              style={[
                styles.internalTabText,
                activeTab === 'list' ? styles.activeInternalTabText : null,
              ]}
            >
              Grocery List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.internalTab,
              activeTab === 'shop' ? styles.activeInternalTab : null,
            ]}
            onPress={() => setActiveTab('shop')}
            accessibilityLabel="Shop Tab"
            accessibilityHint="Show shop items"
          >
            <Text
              style={[
                styles.internalTabText,
                activeTab === 'shop' ? styles.activeInternalTabText : null,
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
                accessibilityLabel="Search Icon"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search grocery items..."
                placeholderTextColor="#4B5563" // Darker placeholder text
                value={searchText}
                onChangeText={setSearchText}
                accessibilityLabel="Search Grocery Items"
                accessibilityHint="Search for specific grocery items"
              />
            </View>

            {/* Grocery list items */}
            <View style={styles.itemsContainer}>
              {filteredItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  {/* Touchable area for toggling completion */}
                  <TouchableOpacity
                    style={styles.toggleCompletionArea}
                    onPress={() => toggleItemCompletion(item.id)}
                    accessibilityLabel={`Mark ${item.item_name} as ${
                      item.completed ? 'incomplete' : 'complete'
                    }`}
                    accessibilityHint={`Toggle completion status for ${item.item_name}`}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        item.completed ? styles.checkboxCompleted : null,
                      ]}
                    >
                      {item.completed && (
                        <Image
                          source={require('../assets/check.png')}
                          style={styles.checkIcon}
                          accessibilityLabel="Check Icon"
                        />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Touchable area for editing the item */}
                  <TouchableOpacity
                    style={styles.itemInfoTouchable}
                    onPress={() => openEditModal(item)}
                    accessibilityLabel={`Edit ${item.item_name}`}
                    accessibilityHint={`Open edit modal for ${item.item_name}`}
                  >
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
                  </TouchableOpacity>

                  {/* Item Details and Remove Button */}
                  <View style={styles.itemDetails}>
                    <Text style={styles.unitText}>{item.metric}</Text>
                    <TextInput
                      style={styles.quantityInput}
                      value={item.quantity.toString()}
                      keyboardType="numeric"
                      onChangeText={(text) => updateItemQuantity(item.id, text)}
                      accessibilityLabel={`Quantity for ${item.item_name}`}
                      accessibilityHint="Update the quantity for this grocery item"
                    />
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      accessibilityLabel={`Remove ${item.item_name}`}
                      accessibilityHint="Remove this grocery item from the list"
                    >
                      <Image
                        source={require('../assets/trash2.png')}
                        style={styles.trashIcon}
                        accessibilityLabel="Trash Icon"
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
                accessibilityLabel="Search Icon"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search shop items..."
                placeholderTextColor="#4B5563" // Darker placeholder text
                value={searchText}
                onChangeText={setSearchText}
                accessibilityLabel="Search Shop Items"
                accessibilityHint="Search for specific shop items"
              />
            </View>

            {/* Placeholder content */}
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Shop items will appear here.</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => setAddModalVisible(true)}
        accessibilityLabel="Add New Grocery Item"
        accessibilityHint="Opens a modal to add a new grocery item"
      >
        <Image
          source={require('../assets/plus.png')}
          style={styles.addIcon}
          accessibilityLabel="Plus Icon"
        />
      </TouchableOpacity>

      {/* Generate Shopping List Button */}
      <TouchableOpacity
        style={styles.generateButton}
        onPress={generateShoppingList}
        accessibilityLabel="Generate Shopping List"
        accessibilityHint="Generates your shopping list based on current grocery items"
      >
        <Text style={styles.generateButtonText}>Generate List</Text>
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
        accessibilityViewIsModal={true}
        accessibilityLabel="Add Item Modal"
      >
        <TouchableWithoutFeedback onPress={() => setAddModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.addModalContainer}>
          <Text style={styles.modalTitle}>Add New Grocery Item</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Item Name"
            placeholderTextColor="#4B5563" // Darker placeholder text
            value={newItemName}
            onChangeText={setNewItemName}
            accessibilityLabel="Item Name"
            accessibilityHint="Enter the name of the grocery item"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Quantity"
            placeholderTextColor="#4B5563" // Darker placeholder text
            value={newItemQuantity}
            onChangeText={setNewItemQuantity}
            keyboardType="numeric"
            accessibilityLabel="Quantity"
            accessibilityHint="Enter the quantity of the grocery item"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Metric (e.g., pcs, kg)"
            placeholderTextColor="#4B5563" // Darker placeholder text
            value={newItemMetric}
            onChangeText={setNewItemMetric}
            accessibilityLabel="Metric"
            accessibilityHint="Enter the metric unit for the grocery item"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Category"
            placeholderTextColor="#4B5563" // Darker placeholder text
            value={newItemCategory}
            onChangeText={setNewItemCategory}
            accessibilityLabel="Category"
            accessibilityHint="Enter the category of the grocery item"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setAddModalVisible(false)}
              accessibilityLabel="Cancel"
              accessibilityHint="Cancel adding a new grocery item"
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonAdd}
              onPress={addNewItem}
              accessibilityLabel="Add Item"
              accessibilityHint="Add the new grocery item to the list"
            >
              <Text style={styles.modalButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
        accessibilityViewIsModal={true}
        accessibilityLabel="Edit Item Modal"
      >
        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.editModalContainer}>
          <Text style={styles.modalTitle}>Edit Grocery Item</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Item Name"
            placeholderTextColor="#4B5563" // Darker placeholder text
            value={editedItemName}
            onChangeText={setEditedItemName}
            accessibilityLabel="Item Name"
            accessibilityHint="Edit the name of the grocery item"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Quantity"
            placeholderTextColor="#4B5563" // Darker placeholder text
            value={editedItemQuantity}
            onChangeText={setEditedItemQuantity}
            keyboardType="numeric"
            accessibilityLabel="Quantity"
            accessibilityHint="Edit the quantity of the grocery item"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Metric (e.g., pcs, kg)"
            placeholderTextColor="#4B5563" // Darker placeholder text
            value={editedItemMetric}
            onChangeText={setEditedItemMetric}
            accessibilityLabel="Metric"
            accessibilityHint="Edit the metric unit for the grocery item"
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Category"
            placeholderTextColor="#4B5563" // Darker placeholder text
            value={editedItemCategory}
            onChangeText={setEditedItemCategory}
            accessibilityLabel="Category"
            accessibilityHint="Edit the category of the grocery item"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setEditModalVisible(false)}
              accessibilityLabel="Cancel"
              accessibilityHint="Cancel editing the grocery item"
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonAdd}
              onPress={saveEditedItem}
              accessibilityLabel="Save Changes"
              accessibilityHint="Save the changes made to the grocery item"
            >
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Grocery Confirmation Modal */}
      <GroceryConfirmationModal
        isVisible={isConfirmationModalVisible}
        onClose={() => setIsConfirmationModalVisible(false)}
        onConfirm={confirmShoppingList}
        groceryItems={groceryItems.filter((item) => !item.completed)}
        deliveryOption={deliveryOption}
        setDeliveryOption={setDeliveryOption}
        onRemoveItem={removeItemFromShoppingList}
      />

      {/* Delivery Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeliveryModalVisible}
        onRequestClose={() => setIsDeliveryModalVisible(false)}
        accessibilityViewIsModal={true}
        accessibilityLabel="Delivery Modal"
      >
        <TouchableWithoutFeedback onPress={() => setIsDeliveryModalVisible(false)}>
          <View style={styles.deliveryModalOverlay}>
            <View style={styles.deliveryModalContainer}>
              <Image
                source={require('../assets/delivery.gif')} // Ensure delivery.gif is in the correct path
                style={styles.deliveryGif}
                resizeMode="contain"
                accessibilityLabel="Order Out for Delivery"
              />
              <Text style={styles.deliveryModalText}>Order out for delivery!</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Navbar */}
      <Navbar currentScreen="MealPlanner" />
    </View>
  );
};

export default GroceryPlanner;

const styles = StyleSheet.create({
  // ... (existing styles remain unchanged)
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 42, // Adjust as needed
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
    fontFamily: 'Cochin', // Ensure 'Cochin' is available or replace with a fancy font of your choice
  },
  clearListButton: {
    padding: 8,
  },
  clearListIcon: {
    width: 24,
    height: 24,
    tintColor: '#EF4444', // Red color for delete icon
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
  // Internal Tabs (Grocery List and Shop) Styles
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
    paddingBottom: 120, // Adjusted to accommodate Navbar and buttons
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
  toggleCompletionArea: {
    padding: 5, // Increase touchable area without increasing checkbox size
  },
  checkbox: {
    width: 20, // Same size
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
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
  itemInfoTouchable: {
    flex: 1,
    marginLeft: 8,
  },
  itemInfo: {
    // flex: 1,
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
    marginLeft: 'auto',
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
    backgroundColor: '#FFFFFF', // Optional: set background to white for better visibility
  },
  loadingGif: {
    width: 200,
    height: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#AED6F1',
  },
  // Floating Add Button Styles
  floatingAddButton: {
    position: 'absolute',
    bottom: 80, // Adjust above Navbar
    right: 30,
    backgroundColor: '#5FC6FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  addIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  // Generate Shopping List Button Styles
  generateButton: {
    position: 'absolute',
    bottom: 80, // Adjust above Navbar
    left: 30,
    backgroundColor: '#5FC6FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Add Item Modal Styles
  addModalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
    fontFamily: 'Cochin', // Apply fancy font
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButtonCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
    marginRight: 10,
  },
  modalButtonAdd: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#5FC6FF',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Edit Item Modal Styles
  editModalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  // Delivery Modal Styles
  deliveryModalOverlay: {
    flex: 1,
    backgroundColor: '#DAD4E0', // Fill entire screen with desired color
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryModalContainer: {
    // No background color needed as the overlay already has #DAD4E0
    // Optionally, add padding or other styling if necessary
    alignItems: 'center',
  },
  deliveryGif: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  deliveryModalText: {
    fontSize: 24, // Increased font size for better visibility
    fontWeight: '600',
    color: '#FFFFFF', // White text
    textAlign: 'center',
    fontFamily: 'Cochin', // Apply a fancy font
  },
});