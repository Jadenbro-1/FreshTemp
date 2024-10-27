// PantryScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import Navbar from './Navbar'; // Ensure Navbar is correctly imported

// Replace with actual user id after authentication system integration
const userId = 1;

// Category Colors Mapping
const categoryColors = {
  Fruits: { main: '#FAD7A0', secondary: '#FDEBD0' }, // Light Peach
  Vegetables: { main: '#A3E4D7', secondary: '#D5F5E3' }, // Soft Mint Green
  Proteins: { main: '#D7BDE2', secondary: '#F4ECF7' }, // Light Lavender
  Dairy: { main: '#FDEBD0', secondary: '#FEF9E7' }, // Light Cream
  Grains: { main: '#F9E79F', secondary: '#FCF3CF' }, // Soft Wheat Color
  Spices: { main: '#F5CBA7', secondary: '#FAE5D3' }, // Soft Orange
  Condiments: { main: '#AED6F1', secondary: '#D6EAF8' }, // Light Sky Blue (using other.png)
  Baking: { main: '#F8C471', secondary: '#FDEBD0' }, // Warm Beige
  Frozen: { main: '#A9CCE3', secondary: '#D4E6F1' }, // Icy Light Blue
  'Canned Goods': { main: '#E59866', secondary: '#FAD7A0' }, // Light Terracotta
  Other: { main: '#D5D8DC', secondary: '#EAEDED' }, // Light Grey
};

const PantryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [pantryItems, setPantryItems] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for Receipt Items Confirmation Modal
  const [receiptItems, setReceiptItems] = useState([]);
  const [isReceiptModalVisible, setIsReceiptModalVisible] = useState(false);

  const categories = [
    'Fruits',
    'Vegetables',
    'Proteins',
    'Dairy',
    'Grains',
    'Spices',
    'Condiments',
    'Baking',
    'Frozen',
    'Canned Goods',
    'Other',
  ];

  // Define mapBackendCategoryToFrontend before using it
  const mapBackendCategoryToFrontend = (category) => {
    switch (category) {
      case 'Fruits':
        return 'Fruits';
      case 'Vegetables':
        return 'Vegetables';
      case 'Proteins':
        return 'Proteins';
      case 'Dairy':
        return 'Dairy';
      case 'Grains':
        return 'Grains';
      case 'Spices':
        return 'Spices';
      case 'Condiments':
        return 'Condiments';
      case 'Baking':
        return 'Baking';
      case 'Frozen':
        return 'Frozen';
      case 'Canned Goods':
        return 'Canned Goods';
      default:
        return 'Other';
    }
  };

  // Define getItemTagStyle before using it
  const getItemTagStyle = (category) => {
    const colors = categoryColors[category];
    if (colors) {
      return { backgroundColor: colors.secondary };
    }
    return styles.tagGray; // Fallback color
  };

  // Fetch pantry data from backend
  useEffect(() => {
    fetchPantryData();
  }, []);

  useEffect(() => {
    // Check if there are receiptItems passed via navigation
    if (route.params && route.params.receiptItems) {
      setReceiptItems(route.params.receiptItems);
      setIsReceiptModalVisible(true);
      // Clear the receiptItems from navigation params to prevent reopening the modal
      navigation.setParams({ receiptItems: null });
    }
  }, [route.params]);

  const fetchPantryData = async () => {
    const apiUrl = 'https://fresh-ios-c3a9e8c545dd.herokuapp.com';
    try {
      const response = await axios.get(`${apiUrl}/api/pantry/${userId}`);
      setPantryItems(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching pantry data:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load pantry items.');
    }
  };

  const removeItem = async (id) => {
    const apiUrl = 'https://fresh-ios-c3a9e8c545dd.herokuapp.com';
    try {
      await axios.delete(`${apiUrl}/api/pantry/${id}`);
      fetchPantryData();
    } catch (error) {
      console.error('Error deleting pantry item:', error);
      Alert.alert('Error', 'Failed to delete item.');
    }
  };

  const toggleFilter = (category) => {
    if (activeFilters.includes(category)) {
      setActiveFilters((prevFilters) => prevFilters.filter((c) => c !== category));
    } else {
      setActiveFilters((prevFilters) => [...prevFilters, category]);
    }
  };

  const filteredIngredients = pantryItems.filter((item) => {
    const matchesCategory =
      activeFilters.length === 0 || activeFilters.includes(item.type);
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    return moment(dateString).format('MMM D, YYYY');
  };

  // Group items by category
  const groupedPantryItems = filteredIngredients.reduce((acc, item) => {
    const category = mapBackendCategoryToFrontend(item.type);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Fruits':
        return require('../assets/fruit.png');
      case 'Vegetables':
        return require('../assets/carrot.png');
      case 'Proteins':
        return require('../assets/meat.png');
      case 'Dairy':
        return require('../assets/dairy.png');
      case 'Grains':
        return require('../assets/grain.png');
      case 'Spices':
        return require('../assets/spice.png');
      case 'Condiments':
        return require('../assets/other.png'); // Use other.png for Condiments
      case 'Baking':
        return require('../assets/bake.png');
      case 'Frozen':
        return require('../assets/frozen.png');
      case 'Canned Goods':
        return require('../assets/can.png');
      default:
        return require('../assets/other.png');
    }
  };

  // Get category highlight style
  const getCategoryHighlightStyle = (category) => {
    const colors = categoryColors[category];
    if (colors) {
      return { backgroundColor: colors.main };
    }
    return styles.defaultHighlight; // Fallback color
  };

  // Get expiration text
  const getExpirationText = (expirationDate) => {
    const today = moment();
    const expDate = moment(expirationDate);
    const diffDays = expDate.diff(today, 'days');

    if (diffDays < 0) {
      return 'EXPIRED';
    } else if (diffDays === 0) {
      return 'Expiring Today';
    } else if (diffDays === 1) {
      return 'Expiring Tomorrow';
    } else if (diffDays <= 3) {
      return `Expiring in ${diffDays} Days`;
    } else {
      return `Expires in ${diffDays} Days`;
    }
  };

  // Get expiration color
  const getExpirationColor = (expirationDate) => {
    const today = moment();
    const expDate = moment(expirationDate);
    const diffDays = expDate.diff(today, 'days');
    return diffDays < 0 ? styles.expiredText : styles.itemDetail;
  };

  // Handle adding item (opens modal with options)
  const handleAddItem = () => {
    setShowAddModal(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  // Editing item state (if needed for future expansion)
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    metric: '',
    expires: '',
    category: '',
  });
  const [editingItem, setEditingItem] = useState(null);

  // Handle saving item (if manual entry is needed)
  const handleSaveItem = async (formData) => {
    // Basic validation
    if (
      !formData.name ||
      !formData.quantity ||
      !formData.metric ||
      !formData.expires ||
      !formData.category
    ) {
      Alert.alert('Validation Error', 'Please fill out all fields.');
      return;
    }

    const apiUrl = 'https://fresh-ios-c3a9e8c545dd.herokuapp.com';
    const itemToSave = {
      name: formData.name,
      quantity: `${formData.quantity} ${formData.metric}`,
      expiration_date: formData.expires,
      type: formData.category,
      user_id: userId, // Use actual user ID
    };

    try {
      if (editingItem) {
        await axios.put(`${apiUrl}/api/pantry/${editingItem.id}`, itemToSave);
      } else {
        await axios.post(`${apiUrl}/api/pantry`, itemToSave);
      }
      fetchPantryData();
    } catch (error) {
      console.error('Error saving pantry item:', error);
      Alert.alert('Error', 'Failed to save pantry item.');
    }
    handleCloseModal();
  };

  // Handle editing item
  const handleEditItem = (item) => {
    const [quantity, metric] = item.quantity.split(' ');
    setNewItem({
      name: item.name,
      quantity,
      metric,
      expires: item.expiration_date,
      category: item.type,
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  // Handle confirming receipt items
  const handleConfirmReceiptItems = async () => {
    if (receiptItems.length === 0) {
      setIsReceiptModalVisible(false);
      return;
    }

    const apiUrl = 'https://fresh-ios-c3a9e8c545dd.herokuapp.com';
    const itemsToAdd = receiptItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      expiration_date: item.expiration_date !== 'No Expiration Date' ? item.expiration_date : null,
      type: item.type, // Ensure 'type' is provided; adjust based on your backend
      user_id: userId,
    }));

    try {
      await axios.post(`${apiUrl}/api/pantry/bulk`, { items: itemsToAdd });
      Alert.alert('Success', 'Items added to your pantry successfully.');
      setIsReceiptModalVisible(false);
      fetchPantryData();
    } catch (error) {
      console.error('Error adding receipt items to pantry:', error);
      Alert.alert('Error', 'Failed to add receipt items to pantry.');
      setIsReceiptModalVisible(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/loading3.gif')} // Updated to loading3.gif
          style={styles.loadingGif}
          resizeMode="contain"
          accessibilityLabel="Loading pantry items, please wait"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Header Top with Logo and (Removed) Header Icons */}
        <View style={styles.headerTop}>
          <Text style={styles.logoText}>Pantry</Text>
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
            style={[
              styles.tabButton,
              styles.activeTabButton, // Active tab
            ]}
            accessibilityLabel="Pantry Tab"
            accessibilityHint="Navigate to Pantry"
          >
            <Text style={[styles.tabText, styles.activeTabText]}>Pantry</Text>
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

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Image
            source={require('../assets/search.png')}
            style={styles.searchIcon}
            accessibilityLabel="Search Icon"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pantry items..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={setSearchTerm}
            accessibilityLabel="Search Pantry Items"
            accessibilityHint="Search for specific pantry items"
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setIsFilterOpen(!isFilterOpen)}
            accessibilityLabel="Filter Button"
            accessibilityHint="Open filter options for pantry items"
          >
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {isFilterOpen && (
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterItem,
                    activeFilters.includes(category) ? styles.activeFilterItem : null,
                  ]}
                  onPress={() => toggleFilter(category)}
                  accessibilityLabel={`${category} Filter`}
                  accessibilityHint={`Filter pantry items by ${category}`}
                >
                  <Text
                    style={[
                      styles.filterItemText,
                      activeFilters.includes(category)
                        ? styles.activeFilterItemText
                        : null,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Main content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        {Object.entries(groupedPantryItems).map(([category, items]) => (
          <View key={category}>
            {/* Category Tag */}
            <View style={[styles.categoryTag, getCategoryHighlightStyle(category)]}>
              <Image
                source={getCategoryIcon(category)}
                style={styles.iconSmallWhite}
                accessibilityLabel={`${category} Icon`}
              />
              <Text style={styles.categoryTextWhite}>{category}</Text>
            </View>

            {/* Items in Category */}
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text
                    style={[styles.itemExpiry, getExpirationColor(item.expiration_date)]}
                  >
                    {getExpirationText(item.expiration_date)}
                  </Text>
                  {/* Category Tag Next to Item */}
                  <View style={[styles.itemTag, getItemTagStyle(category)]}>
                    <Text style={styles.itemTagText}>{category}</Text>
                  </View>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemQuantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => handleEditItem(item)}
                    accessibilityLabel={`Edit ${item.name}`}
                    accessibilityHint="Edit this pantry item"
                  >
                    <Image
                      source={require('../assets/edit3.png')}
                      style={styles.actionIcon}
                      accessibilityLabel="Edit Icon"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    accessibilityLabel={`Remove ${item.name}`}
                    accessibilityHint="Remove this pantry item"
                  >
                    <Image
                      source={require('../assets/trash2.png')}
                      style={styles.actionIcon}
                      accessibilityLabel="Delete Icon"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* No Items Found */}
        {filteredIngredients.length === 0 && (
          <View style={styles.noItemsContainer}>
            <Text style={styles.noItemsText}>No pantry items found.</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => setShowAddModal(true)}
        accessibilityLabel="Add New Ingredient"
        accessibilityHint="Open options to add a new pantry item"
      >
        <Image
          source={require('../assets/plus.png')}
          style={styles.floatingAddIcon}
          accessibilityLabel="Plus Icon"
        />
      </TouchableOpacity>

      {/* Modal for adding new ingredient with options */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
        accessibilityViewIsModal={true}
        accessibilityLabel="Add Ingredient Modal"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Ingredient</Text>
            <View style={styles.modalOptions}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowAddModal(false);
                  // Navigate to barcode scanner screen
                  navigation.navigate('BarcodeScanner');
                }}
                accessibilityLabel="Scan Barcode Option"
                accessibilityHint="Open barcode scanner to add ingredient"
              >
                <Image
                  source={require('../assets/barcode.png')}
                  style={styles.modalOptionIcon}
                  accessibilityLabel="Barcode Icon"
                />
                <Text style={styles.modalOptionText}>Scan Barcode</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowAddModal(false);
                  // Navigate to receipt scanner screen
                  navigation.navigate('ReceiptCameraScreen');
                }}
                accessibilityLabel="Scan Receipt Option"
                accessibilityHint="Open receipt scanner to add ingredient"
              >
                <Image
                  source={require('../assets/receipt.png')}
                  style={styles.modalOptionIcon}
                  accessibilityLabel="Receipt Icon"
                />
                <Text style={styles.modalOptionText}>Scan Receipt</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowAddModal(false);
                  // Navigate to manual entry screen
                  navigation.navigate('ManualEntry');
                }}
                accessibilityLabel="Manual Entry Option"
                accessibilityHint="Open manual entry to add ingredient"
              >
                <Image
                  source={require('../assets/edit3.png')}
                  style={styles.modalOptionIcon}
                  accessibilityLabel="Edit Icon"
                />
                <Text style={styles.modalOptionText}>Manual Entry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setShowAddModal(false);
                  // Navigate to camera screen
                  navigation.navigate('CameraScreen');
                }}
                accessibilityLabel="Take Picture Option"
                accessibilityHint="Open camera to take picture of ingredient"
              >
                <Image
                  source={require('../assets/camera.png')}
                  style={styles.modalOptionIcon}
                  accessibilityLabel="Camera Icon"
                />
                <Text style={styles.modalOptionText}>Take Picture</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowAddModal(false)}
              accessibilityLabel="Cancel Adding Ingredient"
              accessibilityHint="Close the add ingredient modal without adding"
            >
              <Text style={styles.closeModalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Confirming Receipt Items */}
      <Modal
        visible={isReceiptModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsReceiptModalVisible(false)}
        accessibilityViewIsModal={true}
        accessibilityLabel="Confirm Receipt Items Modal"
      >
        <View style={styles.modalContainer}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.modalTitle}>Confirm Receipt Items</Text>
            <FlatList
              data={receiptItems}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.confirmItemContainer}>
                  <Text style={styles.confirmItemName}>{item.name}</Text>
                  <Text style={styles.confirmItemDetails}>
                    {item.quantity}
                    {item.expiration_date && ` | Expires: ${formatDate(item.expiration_date)}`}
                  </Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.noItemsText}>No items to confirm.</Text>
              }
              accessibilityLabel="Receipt Items List"
              accessibilityHint="List of items extracted from the receipt"
            />
            <View style={styles.confirmButtonsContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmReceiptItems}
                accessibilityLabel="Confirm Adding Items"
                accessibilityHint="Add the confirmed items to your pantry"
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsReceiptModalVisible(false)}
                accessibilityLabel="Cancel Adding Items"
                accessibilityHint="Dismiss the confirmation modal without adding items"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
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

export default PantryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 42, // Added to match GroceryPlanner header positioning
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
    color: '#5FC6FF', // Changed to match the default color
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
  // Search bar styles
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
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#5FC6FF',
    borderRadius: 9999,
    marginLeft: 8,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  // Filters styles
  filterContainer: {
    marginTop: 8,
  },
  filterItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  activeFilterItem: {
    backgroundColor: '#5FC6FF',
    borderColor: '#5FC6FF',
  },
  filterItemText: {
    color: '#6B7280',
    fontSize: 14,
  },
  activeFilterItemText: {
    color: '#FFFFFF',
  },
  // Main Content Styles
  mainContent: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Adjusted to match GroceryPlanner and prevent navbar overlap
  },
  // Category Tag Styles (Big Tags)
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: 200,
  },
  categoryTextWhite: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  iconSmallWhite: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  // Default Highlight (Fallback)
  defaultHighlight: {
    backgroundColor: '#5FC6FF', // Default Blue
  },
  // Item Card Styles
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
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14, // Reduced font size
    color: '#1F2937',
    marginBottom: 4,
    fontWeight: '600',
  },
  itemExpiry: {
    fontSize: 12, // Smaller font size
    color: '#6B7280',
  },
  // Category Tag Next to Item (Small Tags)
  itemTag: {
    marginTop: 4,
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  itemTagText: {
    color: '#6B7280', // Dark Gray
    fontSize: 10,
  },
  // Tag Styles
  tagGray: {
    backgroundColor: '#F3F4F6', // Light Gray similar to search bar
  },
  // Item Details
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14, // Smaller font size
    color: '#6B7280',
    marginRight: 8,
  },
  actionIcon: {
    width: 18,
    height: 18,
    tintColor: '#9CA3AF',
    marginLeft: 8,
  },
  // Floating Add Button
  floatingAddButton: {
    position: 'absolute',
    right: 24,
    bottom: 90, // Adjusted to be above the Navbar (assuming Navbar height ~60)
    width: 60,
    height: 60,
    backgroundColor: '#5FC6FF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  floatingAddIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
  // Modal Styles for Adding with Options
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalOption: {
    width: '48%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  modalOptionIcon: {
    width: 40,
    height: 40,
    tintColor: '#5FC6FF',
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'center',
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
  // Modal Styles for Confirming Receipt Items
  confirmModalContent: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  confirmItemContainer: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  confirmItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  confirmItemDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  confirmButton: {
    backgroundColor: '#5FC6FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
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
  // No Items Styles
  noItemsContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  noItemsText: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Expiration Text Styles
  expiredText: {
    color: 'red',
  },
  itemDetail: {
    color: '#6B7280',
  },
});