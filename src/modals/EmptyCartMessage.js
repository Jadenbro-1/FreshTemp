import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const EmptyCartMessage = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('GroceryPlanner')}>
      <Image
        source={require('/Users/jadenbro1/FreshTemp/assets/shop.png')}
        style={styles.cartIcon}
      />
      <Text style={styles.title}>Your cart is empty!</Text>
      <Text style={styles.subtitle}>
        Click here to add items to your cart.
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Center the content horizontally
    justifyContent: 'center',
    paddingVertical: 10, // Padding for visual spacing
  },
  cartIcon: {
    width: 30, // Icon size
    height: 30, // Icon size
    tintColor: '#32CD32', // Orange color for the cart icon
    marginBottom: 5, // Spacing between icon and title
  },
  title: {
    fontSize: 16, // Title font size
    fontWeight: 'bold',
    color: '#333', // Darker text color for the title
    marginBottom: 3, // Spacing between title and subtitle
  },
  subtitle: {
    fontSize: 12, // Subtitle font size
    color: '#666', // Subtle text color for the subtitle
    textAlign: 'center', // Center align the subtitle
    paddingHorizontal: 15, // Padding for subtitle compactness
  },
});

export default EmptyCartMessage;