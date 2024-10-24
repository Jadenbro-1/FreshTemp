// GroceryConfirmationModal.js

import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

const GroceryConfirmationModal = ({
  isVisible,
  onClose,
  onConfirm,
  groceryItems,
  deliveryOption,
  setDeliveryOption,
}) => {
  const getItemTagStyle = (category) => {
    switch (category) {
      case "Produce":
        return styles.produceTag;
      case "Dairy":
        return styles.dairyTag;
      case "Meat":
        return styles.meatTag;
      case "Bakery":
        return styles.bakeryTag;
      case "Pantry":
        return styles.pantryTag;
      case "Frozen":
        return styles.frozenTag;
      case "Other":
        return styles.otherTag;
      default:
        return styles.defaultTag;
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Shopping List</Text>
            <TouchableOpacity onPress={onClose}>
              <Image
                source={require("/Users/jadenbro1/FreshTemp/assets/x.png")}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Modal Subtitle */}
          <Text style={styles.modalSubtitle}>
            Please confirm the items in your shopping list:
          </Text>

          {/* Delivery Options */}
          <View style={styles.deliveryOptionsContainer}>
            <TouchableOpacity
              style={styles.deliveryOption}
              onPress={() => setDeliveryOption("pickup")}
            >
              <Text style={styles.deliveryOptionText}>In-store Pickup</Text>
              {deliveryOption === "pickup" && (
                <Image
                  source={require("/Users/jadenbro1/FreshTemp/assets/check2.png")}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deliveryOption}
              onPress={() => setDeliveryOption("delivery")}
            >
              <Text style={styles.deliveryOptionText}>Home Delivery</Text>
              {deliveryOption === "delivery" && (
                <Image
                  source={require("/Users/jadenbro1/FreshTemp/assets/check2.png")}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Items List */}
          <ScrollView style={styles.receiptItemsContainer}>
            {groceryItems.map((item) => (
              <View key={item.id} style={styles.receiptItem}>
                {/* Item Information */}
                <View style={styles.itemInfo}>
                  <Text style={styles.receiptItemName} numberOfLines={2}>
                    {item.item_name}
                  </Text>
                </View>
                {/* Item Details and Remove Button */}
                <View style={styles.itemDetailsContainer}>
                  <Text style={styles.itemDetails}>
                    {item.metric} | {item.quantity}
                  </Text>
                  <TouchableOpacity onPress={() => onConfirm(item.id)}>
                    <Image
                      source={require("/Users/jadenbro1/FreshTemp/assets/trash2.png")}
                      style={styles.iconSmall}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Modal Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Image
                source={require("/Users/jadenbro1/FreshTemp/assets/x.png")}
                style={styles.cancelIcon}
              />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.darkGrayConfirmButton}
              onPress={onConfirm}
            >
              <Image
                source={require("/Users/jadenbro1/FreshTemp/assets/check2.png")}
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
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  // Modal Container
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  // Modal Header
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  // Modal Subtitle
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  // Delivery Options
  deliveryOptionsContainer: {
    marginBottom: 20,
  },
  deliveryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  deliveryOptionText: {
    fontSize: 16,
    color: "#333",
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
  // Items Container
  receiptItemsContainer: {
    marginBottom: 20,
  },
  receiptItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  receiptItemName: {
    fontSize: 16,
    fontWeight: "bold",
    flexWrap: "wrap",
  },
  itemDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemDetails: {
    fontSize: 14,
    color: "#333",
    marginRight: 10,
  },
  iconSmall: {
    width: 20,
    height: 20,
    tintColor: "#FF0000",
  },
  // Category Tag Styles (if needed in the modal)
  produceTag: {
    backgroundColor: "#34D399",
  },
  dairyTag: {
    backgroundColor: "#3B82F6",
  },
  meatTag: {
    backgroundColor: "#F472B6",
  },
  bakeryTag: {
    backgroundColor: "#FBBF24",
  },
  pantryTag: {
    backgroundColor: "#A78BFA",
  },
  frozenTag: {
    backgroundColor: "#60A5FA",
  },
  otherTag: {
    backgroundColor: "#A855F7",
  },
  defaultTag: {
    backgroundColor: "#A855F7",
  },
  // Modal Actions
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  darkGrayConfirmButton: {
    backgroundColor: "#2E2E2E", // Darker gray background for the confirm button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 5,
  },
  confirmButtonText: {
    color: "#FFF", // White text for the confirm button
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 5,
  },
  cancelIcon: {
    width: 20,
    height: 20,
  },
  whiteConfirmIcon: {
    width: 16,
    height: 16,
    tintColor: "#FFF", // White icon color for confirm button
  },
});

export default GroceryConfirmationModal;