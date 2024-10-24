import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

const AddMissingModal = ({
  isVisible,
  onClose,
  missingIngredients,
  userId,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/process-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          missingIngredients,
          userId,  // Pass the user ID to the backend
        }),
      });

      const data = await response.json();

      if (data.error) {
        // Alert the user if something went wrong
        Alert.alert('Error', data.error || 'Some items were unreadable.');
      } else {
        // Notify the user of success and close the modal
        Alert.alert('Success', 'Items have been added to your grocery list.');
        onClose(); // Close the modal after success
      }
    } catch (error) {
      console.error('Error processing ingredients:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Missing Ingredients</Text>
            <TouchableOpacity onPress={onClose}>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/x.png')}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Modal Subtitle */}
          <Text style={styles.modalSubtitle}>
            Please confirm the ingredients you want to add to your shopping list:
          </Text>

          {/* Ingredients List */}
          <ScrollView style={styles.ingredientsContainer}>
            {missingIngredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientAmount}>
                  {ingredient.amount} {ingredient.metric}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/x.png')}
                style={styles.cancelIcon}
              />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              disabled={isProcessing}
            >
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/check2.png')}
                style={styles.confirmIcon}
              />
              <Text style={styles.confirmButtonText}>
                {isProcessing ? 'Processing...' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // Modal Container
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  // Modal Header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  // Modal Subtitle
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  // Ingredients Container
  ingredientsContainer: {
    marginBottom: 20,
    maxHeight: 200,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientAmount: {
    fontSize: 16,
    color: '#333',
  },
  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#2E2E2E', // Black background for the confirm button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  confirmButtonText: {
    color: '#FFF', // White text for the confirm button
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 5,
  },
  cancelIcon: {
    width: 20,
    height: 20,
  },
  confirmIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFF', // White icon color for confirm button
  },
});

export default AddMissingModal;