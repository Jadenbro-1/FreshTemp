import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';

const foodImages = {
  "Apple": require('/Users/jadenbro1/FreshTemp/assets/apple.png'),
  "Banana": require('/Users/jadenbro1/FreshTemp/assets/banana.png'),
  "Carrot": require('/Users/jadenbro1/FreshTemp/assets/carrot.png'),
  "Strawberry": require('/Users/jadenbro1/FreshTemp/assets/strawberry.png'),
  "White Rice": require('/Users/jadenbro1/FreshTemp/assets/white-rice.png'),
  "Sourdough Bread": require('/Users/jadenbro1/FreshTemp/assets/sourdough-bread.png'),
  "Beef": require('/Users/jadenbro1/FreshTemp/assets/beef.png'),
  "Egg": require('/Users/jadenbro1/FreshTemp/assets/egg.png'),
  "Milk": require('/Users/jadenbro1/FreshTemp/assets/milk.png'),
  "Cheese": require('/Users/jadenbro1/FreshTemp/assets/cheese.png'),
};

const FoodDetails = ({ route }) => {
  const { item, expirationDate } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image style={styles.image} source={foodImages[item]} resizeMode="contain" />
      <Text style={styles.title}>{item}</Text>
      <Text style={styles.expirationDate}>Expiration Date: {expirationDate}</Text>
      <Text style={styles.sectionTitle}>Nutritional Facts:</Text>
      {/* Add nutritional facts details here */}
      <Text style={styles.sectionTitle}>Allergens:</Text>
      {/* Add allergens details here */}
      <Text style={styles.sectionTitle}>Other Information:</Text>
      {/* Add other relevant information here */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e0f7fa',
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00796b',
    textAlign: 'center',
    marginBottom: 10,
  },
  expirationDate: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 10,
  },
});

export default FoodDetails;
