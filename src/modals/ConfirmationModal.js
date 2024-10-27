// ConfirmationModal.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';

const ConfirmationModal = ({
  showModal,
  receiptItems,
  onCancel,
  onConfirm,
  onEditItem,
  onDeleteItem,
}) => {
  const [items, setItems] = useState(receiptItems);

  useEffect(() => {
    setItems(receiptItems);
  }, [receiptItems]);

  const getItemTagStyle = (type) => {
    switch (type) {
      case 'Vegetables':
        return styles.vegetableHighlight;
      case 'Dairy':
        return styles.dairyHighlight;
      case 'Proteins':
        return styles.proteinsHighlight;
      case 'Fruits':
        return styles.fruitHighlight;
      case 'Grains':
        return styles.grainHighlight;
      case 'Spices':
        return styles.spicesHighlight;
      case 'Condiments':
        return styles.condimentsHighlight;
      case 'Baking':
        return styles.bakingHighlight;
      case 'Frozen':
        return styles.frozenHighlight;
      case 'Canned Goods':
        return styles.cannedHighlight;
      default:
        return styles.otherHighlight;
    }
  };

  const handleEditItem = (item, index) => {
    if (onEditItem) {
      onEditItem(item, index); // Trigger the edit callback
    }
  };

  const handleDeleteItem = (index) => {
    if (onDeleteItem) {
      onDeleteItem(index); // Trigger the delete callback
    }
  };

  return (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
      accessibilityViewIsModal={true}
      accessibilityLabel="Confirm Receipt Items Modal"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Receipt Items</Text>
            <TouchableOpacity onPress={onCancel} accessibilityLabel="Close Confirmation Modal">
              <Image
                source={require('../assets/x.png')}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>
          {/* Modal Subtitle */}
          <Text style={styles.modalSubtitle}>
            Please confirm the items detected from your receipt:
          </Text>
          {/* Receipt Items List */}
          <FlatList
            data={items}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.receiptItem}>
                <View style={styles.receiptItemInfo}>
                  <Text style={styles.receiptItemName}>{item.name}</Text>
                  <Text style={styles.receiptItemDetail}>
                    Quantity: {item.quantity}
                  </Text>
                  <Text style={styles.receiptItemDetail}>
                    Expires: {item.expiration_date || 'N/A'}
                  </Text>
                </View>
                <View style={[styles.receiptItemTag, getItemTagStyle(item.type)]}>
                  <Text style={styles.receiptItemTagText}>{item.type}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    onPress={() => handleEditItem(item, index)}
                    accessibilityLabel={`Edit ${item.name}`}
                    accessibilityHint="Edit this item"
                  >
                    <Image
                      source={require('../assets/edit.png')}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(index)}
                    accessibilityLabel={`Delete ${item.name}`}
                    accessibilityHint="Delete this item from the list"
                  >
                    <Image
                      source={require('../assets/trash.png')}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.noItemsText}>No items to confirm.</Text>
            }
            contentContainerStyle={styles.receiptItemsContainer}
          />
          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              accessibilityLabel="Cancel Adding Items"
              accessibilityHint="Dismiss the confirmation modal without adding items"
            >
              <Image
                source={require('../assets/x.png')}
                style={styles.cancelIcon}
              />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => onConfirm(items)}
              accessibilityLabel="Confirm Adding Items"
              accessibilityHint="Add the confirmed items to your pantry"
            >
              <Image
                source={require('../assets/check2.png')}
                style={styles.whiteConfirmIcon}
              />
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  receiptItemsContainer: {
    marginBottom: 20,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  receiptItemInfo: {
    flex: 1,
  },
  receiptItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  receiptItemDetail: {
    fontSize: 14,
    color: '#666',
  },
  receiptItemTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    marginLeft: 10,
  },
  receiptItemTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Category Tag Styles
  fruitHighlight: {
    backgroundColor: '#EF4444',
  },
  vegetableHighlight: {
    backgroundColor: '#38a169',
  },
  proteinsHighlight: {
    backgroundColor: '#F472B6',
  },
  dairyHighlight: {
    backgroundColor: '#3B82F6',
  },
  grainHighlight: {
    backgroundColor: '#FBBF24',
  },
  spicesHighlight: {
    backgroundColor: '#E53E3E',
  },
  condimentsHighlight: {
    backgroundColor: '#ED8936',
  },
  bakingHighlight: {
    backgroundColor: '#ECC94B',
  },
  frozenHighlight: {
    backgroundColor: '#4FD1C5',
  },
  cannedHighlight: {
    backgroundColor: '#718096',
  },
  otherHighlight: {
    backgroundColor: '#A855F7',
  },
  // Item Actions
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: '#A9A9A9',
    marginLeft: 8,
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
  darkGrayConfirmButton: {
    backgroundColor: '#2E2E2E', // Darker gray background for the confirm button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#2E2E2E',
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
    tintColor: '#000',
  },
  whiteConfirmIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFF', // White icon color for confirm button
  },
  // No Items Styles
  noItemsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ConfirmationModal;