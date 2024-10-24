import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

const ConfirmationModal = ({ showModal, receiptItems, onCancel, onConfirm, onEditItem, onDeleteItem }) => {
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
      case 'Meat':
        return styles.proteinsHighlight;
      case 'Fruits':
        return styles.fruitHighlight;
      case 'Grain':
        return styles.grainHighlight;
      case 'Spices':
        return styles.spicesHighlight;
      case 'Condiment':
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
    <Modal visible={showModal} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Receipt Items</Text>
            <TouchableOpacity onPress={onCancel}>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/x.png')}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>Please confirm the items detected from your receipt:</Text>
          <ScrollView style={styles.receiptItemsContainer}>
            {items.map((item, index) => (
              <View key={index} style={styles.receiptItem}>
                <View>
                  <Text style={styles.receiptItemName}>{item.name}</Text>
                  <Text style={styles.receiptItemDetail}>Quantity: {item.quantity}</Text>
                  <Text style={styles.receiptItemDetail}>Expires: {item.expiration_date}</Text>
                </View>
                <View style={[styles.receiptItemTag, getItemTagStyle(item.type)]}>
                  <Text style={styles.receiptItemTagText}>{item.type}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => handleEditItem(item, index)}>
                    <Image
                      source={require('/Users/jadenbro1/FreshTemp/assets/edit.png')}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteItem(index)}>
                    <Image
                      source={require('/Users/jadenbro1/FreshTemp/assets/trash.png')}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/x.png')}
                style={styles.cancelIcon}
              />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.darkGrayConfirmButton} onPress={() => onConfirm(items)}>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/check2.png')}
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
  },
  closeIcon: {
    width: 20,
    height: 20,
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
  receiptItemName: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  receiptItemTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fruitHighlight: {
    backgroundColor: "#EF4444",
  },
  vegetableHighlight: {
    backgroundColor: "#38a169",
  },
  proteinsHighlight: {
    backgroundColor: "#F472B6",
  },
  dairyHighlight: {
    backgroundColor: "#3B82F6",
  },
  grainHighlight: {
    backgroundColor: "#FBBF24",
  },
  spicesHighlight: {
    backgroundColor: "#E53E3E",
  },
  condimentsHighlight: {
    backgroundColor: "#ED8936",
  },
  bakingHighlight: {
    backgroundColor: "#ECC94B",
  },
  frozenHighlight: {
    backgroundColor: "#4FD1C5",
  },
  cannedHighlight: {
    backgroundColor: "#718096",
  },
  otherHighlight: {
    backgroundColor: "#A855F7",
  },
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
  whiteConfirmIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFF', // White icon color for confirm button
  },
});

export default ConfirmationModal;