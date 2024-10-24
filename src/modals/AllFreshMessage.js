import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const AllFreshMessage = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('/Users/jadenbro1/FreshTemp/assets/check2.png')}
        style={styles.checkIcon}
      />
      <Text style={styles.title}>All Fresh!</Text>
      <Text style={styles.subtitle}>
        Everything is fresh and no expiration dates are approaching.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Center the content horizontally
    justifyContent: 'center',
    paddingVertical: 10, // Reduced padding for a more compact appearance
  },
  checkIcon: {
    width: 30, // Smaller icon size
    height: 30, // Smaller icon size
    tintColor: '#32CD32', // Green color for the checkmark
    marginBottom: 5, // Reduced spacing between icon and title
  },
  title: {
    fontSize: 16, // Slightly smaller font size for title
    fontWeight: 'bold',
    color: '#333', // Darker text color
    marginBottom: 3, // Reduced spacing between title and subtitle
  },
  subtitle: {
    fontSize: 12, // Smaller font size for subtitle
    color: '#666', // Subtle text color
    textAlign: 'center',
    paddingHorizontal: 15, // Reduced padding for better text compactness
  },
});

export default AllFreshMessage;