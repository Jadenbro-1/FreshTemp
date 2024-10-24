import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

const AddItemModal = ({ showModal, closeModal, openManualInput, openReceiptConfirmation }) => {
  const methods = [
    {
      title: "Manual",
      description: "Add items to your pantry one by one",
      icon: require("/Users/jadenbro1/FreshTemp/assets/plus.png"),
      action: () => {
        closeModal();
        openManualInput(); // This will open the manual input form in UserPantry
      },
    },
    {
      title: "Receipt",
      description: "Scan or upload a receipt to add multiple items",
      icon: require("/Users/jadenbro1/FreshTemp/assets/receipt.png"),
      action: () => {
        closeModal();
        openReceiptConfirmation();  // Trigger the confirmation modal for receipt
      },
    },
    {
      title: "Barcode",
      description: "Scan product barcodes to quickly add items",
      icon: require("/Users/jadenbro1/FreshTemp/assets/barcode.png"),
      action: () => {
        closeModal();
        openReceiptConfirmation();  // Trigger the confirmation modal for receipt
      },
    },
    {
      title: "Photo",
      description: "Upload a photo or video of your pantry items",
      icon: require("/Users/jadenbro1/FreshTemp/assets/upload2.png"),
      action: () => {
        closeModal();
        openReceiptConfirmation();  // Trigger the confirmation modal for receipt
      },
    },
  ];

  return (
    <Modal visible={showModal} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Choose a Method to Add Items</Text>
          <View style={styles.grid}>
            {methods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={method.action}
              >
                <View style={styles.cardHeader}>
                  <Image source={method.icon} style={styles.icon} />
                  <Text style={styles.cardTitle}>{method.title}</Text>
                </View>
                <Text style={styles.cardDescription}>{method.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "45%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: "black", // Set icon color to black
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardDescription: {
    textAlign: "center",
    fontSize: 12,
    color: "#666",
  },
  closeButton: {
    backgroundColor: "#38a169",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default AddItemModal;