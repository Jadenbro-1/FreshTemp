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
  onRemoveItem,
}) => {
  return (
    <Modal visible={isVisible} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Shopping List</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
              style={[
                styles.deliveryOption,
                deliveryOption === "pickup" && styles.selectedDeliveryOption,
              ]}
              onPress={() => setDeliveryOption("pickup")}
              accessibilityLabel="Select In-store Pickup"
              accessibilityHint="Choose in-store pickup as your delivery option"
            >
              <Text
                style={[
                  styles.deliveryOptionText,
                  deliveryOption === "pickup" && styles.selectedDeliveryOptionText,
                ]}
              >
                In-store Pickup
              </Text>
              {deliveryOption === "pickup" && (
                <Image
                  source={require("/Users/jadenbro1/FreshTemp/assets/check2.png")}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryOption === "delivery" && styles.selectedDeliveryOption,
              ]}
              onPress={() => setDeliveryOption("delivery")}
              accessibilityLabel="Select Home Delivery"
              accessibilityHint="Choose home delivery as your delivery option"
            >
              <Text
                style={[
                  styles.deliveryOptionText,
                  deliveryOption === "delivery" &&
                    styles.selectedDeliveryOptionText,
                ]}
              >
                Home Delivery
              </Text>
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
                  <TouchableOpacity
                    onPress={() => onRemoveItem(item.id)}
                    accessibilityLabel={`Remove ${item.item_name}`}
                    accessibilityHint={`Remove ${item.item_name} from the shopping list`}
                  >
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
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              accessibilityLabel="Cancel Confirmation"
              accessibilityHint="Cancel and close the confirmation modal"
            >
              <Image
                source={require("/Users/jadenbro1/FreshTemp/assets/x.png")}
                style={styles.cancelIcon}
              />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              accessibilityLabel="Confirm Shopping List"
              accessibilityHint="Confirm and proceed with the shopping list"
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
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  // Modal Header
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#5FC6FF", // Primary color
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: "#5FC6FF", // Primary color
  },
  // Modal Subtitle
  modalSubtitle: {
    fontSize: 16,
    color: "#4B5563", // Dark gray for better readability
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#F3F4F6", // Light gray background
  },
  selectedDeliveryOption: {
    backgroundColor: "#5FC6FF", // Primary color background for selected option
    borderColor: "#5FC6FF", // Matching border color
  },
  deliveryOptionText: {
    fontSize: 16,
    color: "#4B5563", // Dark gray
  },
  selectedDeliveryOptionText: {
    color: "#FFFFFF", // White text for selected option
    fontWeight: "600",
  },
  checkIcon: {
    width: 20,
    height: 20,
    tintColor: "#FFFFFF", // White checkmark
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
    borderBottomColor: "#E5E7EB",
    paddingBottom: 10,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  receiptItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flexWrap: "wrap",
  },
  // Removed tagText as tags are no longer needed
  itemDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemDetails: {
    fontSize: 14,
    color: "#4B5563",
    marginRight: 10,
  },
  iconSmall: {
    width: 18,
    height: 18,
    tintColor: "#EF4444", // Red color for delete icon
  },
  // Modal Actions
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#5FC6FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 5,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 5,
  },
  cancelIcon: {
    width: 20,
    height: 20,
    tintColor: "#1F2937",
  },
  whiteConfirmIcon: {
    width: 16,
    height: 16,
    tintColor: "#FFFFFF",
  },
});

export default GroceryConfirmationModal;