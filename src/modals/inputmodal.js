import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; // Dropdown for metric and category

export default function InputModal({ isOpen, onClose, onSave, itemData }) {
  const initialFormState = {
    name: '',
    quantity: '',
    metric: '',
    expiration: '',
    category: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  // Metric Dropdown State
  const [metricOpen, setMetricOpen] = useState(false);
  const [metric, setMetric] = useState(null);
  const [metricItems, setMetricItems] = useState([
    { label: 'pcs', value: 'pcs' },
    { label: 'lbs', value: 'lbs' },
    { label: 'oz', value: 'oz' },
    { label: 'kg', value: 'kg' },
    { label: 'g', value: 'g' },
    { label: 'liters', value: 'liters' },
    { label: 'ml', value: 'ml' },
  ]);

  // Category Dropdown State
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState(null);
  const [categoryItems, setCategoryItems] = useState([
    { label: 'Fruit', value: 'fruit', style: styles.fruitHighlight },
    { label: 'Vegetable', value: 'vegetable', style: styles.vegetableHighlight },
    { label: 'Dairy', value: 'dairy', style: styles.dairyHighlight },
    { label: 'Meat', value: 'meat', style: styles.meatHighlight },
    { label: 'Grain', value: 'grain', style: styles.grainHighlight },
    { label: 'Other', value: 'other', style: styles.otherHighlight },
  ]);

  // Handle field changes
  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  // Expiration date formatting (MM-DD-YYYY)
  const formatExpirationDate = (text) => {
    let formattedText = text.replace(/\D/g, ''); // Remove non-digit characters
    if (formattedText.length > 2) {
      formattedText = `${formattedText.slice(0, 2)}-${formattedText.slice(2)}`;
    }
    if (formattedText.length > 5) {
      formattedText = `${formattedText.slice(0, 5)}-${formattedText.slice(5, 9)}`;
    }
    setFormData({ ...formData, expiration: formattedText });
  };

  // Pre-fill form when itemData is provided (for editing)
  useEffect(() => {
    if (itemData) {
      setFormData({
        name: itemData.name,
        quantity: itemData.quantity,
        metric: itemData.metric,
        expiration: itemData.expiration,
        category: itemData.category,
      });
      setMetric(itemData.metric);  // Pre-fill metric
      setCategory(itemData.category);  // Pre-fill category
    }
  }, [itemData]);

  const handleSave = () => {
    onSave({ ...formData, metric, category });
    setFormData(initialFormState); // Reset form after save
    setMetric(null); // Reset metric dropdown
    setCategory(null); // Reset category dropdown
    onClose();
  };

  const handleClose = () => {
    setFormData(initialFormState); // Reset form when modal is closed
    setMetric(null); // Reset metric dropdown
    setCategory(null); // Reset category dropdown
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Pantry Item</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Item name"
              placeholderTextColor="#666"
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              placeholderTextColor="#666"
              value={formData.quantity}
              keyboardType="numeric"
              onChangeText={(text) => handleChange('quantity', text)}
            />
          </View>

          <View style={[styles.inputContainer, { zIndex: 10 }]}>
            <Text style={styles.label}>Metric</Text>
            <DropDownPicker
              open={metricOpen}
              value={metric}
              items={metricItems}
              setOpen={setMetricOpen}
              setValue={setMetric}
              setItems={setMetricItems}
              placeholder="Select metric"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Expiration Date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM-DD-YYYY"
              placeholderTextColor="#666"
              value={formData.expiration}
              keyboardType="numeric"
              maxLength={10} // Limit input to 10 characters
              onChangeText={formatExpirationDate} // Apply formatting
            />
          </View>

          <View style={[styles.inputContainer, { zIndex: 9 }]}>
            <Text style={styles.label}>Category</Text>
            <DropDownPicker
              open={categoryOpen}
              value={category}
              items={categoryItems}
              setOpen={setCategoryOpen}
              setValue={setCategory}
              setItems={setCategoryItems}
              placeholder="Select category"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              labelStyle={{ fontWeight: 'bold' }} // Make category labels bold
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonOutline} onPress={handleClose}>
              <Text style={styles.buttonTextOutline}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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
    maxWidth: 400,
    alignSelf: 'center', // Center the modal horizontally
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontSize: 14,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#34D399',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  buttonOutline: {
    backgroundColor: '#FFF',
    borderColor: '#34D399',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonTextOutline: {
    color: '#34D399',
    fontSize: 16,
  },
  // Category colors from the UserPantry page
  fruitHighlight: {
    backgroundColor: '#EF4444',
  },
  vegetableHighlight: {
    backgroundColor: '#34D399',
  },
  dairyHighlight: {
    backgroundColor: '#3B82F6',
  },
  meatHighlight: {
    backgroundColor: '#F472B6',
  },
  grainHighlight: {
    backgroundColor: '#FBBF24',
  },
  otherHighlight: {
    backgroundColor: '#A855F7',
  },
});