import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import * as SQLite from 'expo-sqlite';

const { width: screenWidth } = Dimensions.get('window');
const db = SQLite.openDatabase('allrecipes.db');

const AllRecipes = ({ navigation }) => {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM recipes',
        [],
        (_, { rows: { _array } }) => setRecipes(_array),
        (_, error) => console.error('Error fetching recipes:', error)
      );
    });
  }, []);

  const renderDish = (dish) => (
    <TouchableOpacity key={dish.id} style={styles.dishContainer} onPress={() => handleDishPress(dish)}>
      <Image style={styles.dishImage} source={{ uri: dish.image }} />
      <View style={styles.dishDetails}>
        <Text style={styles.dishName}>{dish.title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeAreaTop} />
      <ScrollView style={styles.background}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>All Recipes</Text>
        </View>
        <View style={styles.dishesContainer}>
          {recipes.map(renderDish)}
        </View>
      </ScrollView>
      <SafeAreaView style={styles.safeAreaBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaTop: {
    backgroundColor: '#00796b',
  },
  safeAreaBottom: {
    backgroundColor: '#e0f7fa',
  },
  background: {
    flex: 1,
    backgroundColor: '#e0f7fa',
  },
  header: {
    width: screenWidth,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#00796b',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dishesContainer: {
    padding: 20,
  },
  dishContainer: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dishImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  dishDetails: {
    padding: 10,
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00796b',
    marginBottom: 5,
  },
});

export default FullMenu;
