// RecipeDetails.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ProgressView } from '@react-native-community/progress-view';
import AddMissingModal from './modals/AddMissingModal';

const { width: screenWidth } = Dimensions.get('window');

const parseInstructions = (instructionsStr) => {
  return instructionsStr.split('\n').map((instruction, index) => ({
    step: index + 1,
    description: instruction.trim(), // Clean up whitespace
  }));
};

const RecipeDetails = () => {
  const route = useRoute();
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [ingredientStatus, setIngredientStatus] = useState([]);
  const navigation = useNavigation();
  const [isFavorite, setIsFavorite] = useState(false);
  const userId = 1; // Replace with actual userId

  const [servings, setServings] = useState(1);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCooking, setIsCooking] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [adjustedNutritionFacts, setAdjustedNutritionFacts] = useState([]);

  const fetchRecipeDetails = async () => {
    try {
      const recipeResponse = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/recipe/${recipeId}?userId=${userId}`
      );
      const { recipe, ingredientStatus: fetchedIngredientStatus, nutrition, instructions } = recipeResponse.data;
  
      // Set the recipe, ingredients, and favorite status
      setRecipe(recipe);
      setIngredientStatus(fetchedIngredientStatus);
  
      // Set nutrition data directly from the API response
      setNutrition(nutrition);
  
      // Parse instructions to ensure it's an array
      const parsedInstructions = parseInstructions(instructions);
      setInstructions(parsedInstructions); // Set the parsed instructions
  
      // Handle servings and ingredients
      const initialServings = recipe.servings || 1;
      setServings(initialServings);
  
      const parsedIngredients = parseIngredients(recipe.ingredients, fetchedIngredientStatus);
      setIngredients(parsedIngredients);
  
      adjustNutritionFacts(nutrition, initialServings, initialServings);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  };

  // Function to calculate Jaccard similarity between two strings
const getJaccardSimilarity = (str1, str2) => {
  const set1 = new Set(str1.split(' '));
  const set2 = new Set(str2.split(' '));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
};

// Normalize ingredient names (remove numbers, special characters, and spaces)
const normalizeIngredientName = (name) => {
  return name
    .toLowerCase()
    .replace(/[\d\/\-\.]+/g, '')  // Remove digits, fractions, dashes, and periods
    .trim();  // Trim any extra spaces
};

// Parse ingredients with a similarity threshold
const parseIngredients = (ingredientsStr, ingredientStatusData, similarityThreshold = 0.6) => {

  return ingredientsStr.split('\n').map((ingredientLine, index) => {
    const normalizedIngredient = normalizeIngredientName(ingredientLine);
    

    
    // Check for a match in the backend data
    const statusItem = ingredientStatusData.find((status) => {
      const normalizedStatus = normalizeIngredientName(status.name);
      
      const jaccardSimilarity = getJaccardSimilarity(normalizedIngredient, normalizedStatus);
      const match = normalizedIngredient.includes(normalizedStatus) || normalizedStatus.includes(normalizedIngredient) || jaccardSimilarity >= similarityThreshold;
      

      return match;
    });

    // Set inStock based on backend result
    const inStock = statusItem ? statusItem.inStock : false;


    return {
      id: index,
      name: ingredientLine, // Keep the original name for display
      inStock,
    };
  });
};
  const adjustServings = (increment) => {
    const newServings = Math.max(1, servings + (increment ? 1 : -1));
    adjustNutritionFacts(nutrition, servings, newServings);
    setServings(newServings);
  };

  const adjustNutritionFacts = (nutritionData, oldServings, newServings) => {
    const factor = newServings / oldServings;
    const selectedNutritionKeys = [
      'calories',
      'carbohydrateContent',
      'proteinContent',
      'fatContent',
      'saturatedFatContent',
      'cholesterolContent',
      'sodiumContent',
      'fiberContent',
      'sugarContent',
    ];

    const adjustedFacts = Object.entries(nutritionData)
      .filter(([key]) => selectedNutritionKeys.includes(key))
      .map(([key, value]) => {
        const numericValue = parseFloat(value);
        return {
          name: formatNutritionName(key),
          amount: numericValue * factor,
          unit: '',
        };
      });
    setAdjustedNutritionFacts(adjustedFacts);
  };

  const formatNutritionName = (key) => {
    switch (key) {
      case 'calories':
        return 'Calories';
      case 'carbohydrateContent':
        return 'Carbs';
      case 'proteinContent':
        return 'Protein';
      case 'fatContent':
        return 'Fat';
      case 'saturatedFatContent':
        return 'Saturated Fat';
      case 'cholesterolContent':
        return 'Cholesterol';
      case 'sodiumContent':
        return 'Sodium';
      case 'fiberContent':
        return 'Fiber';
      case 'sugarContent':
        return 'Sugar';
      default:
        return key;
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await axios.delete('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/favorites', {
          data: { userId, recipeId },
        });
      } else {
        await axios.post('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/favorites', {
          userId,
          recipeId,
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error.message);
    }
  };

  // Refresh the page when it comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRecipeDetails();
    }, [recipeId])
  );

  const startCooking = () => {
    setIsCooking(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishCooking = () => {
    setIsCooking(false);
    setCurrentStep(0);
  };

  const openConfirmDialog = () => {
    setIsConfirmDialogOpen(true);
  };

  const closeConfirmDialog = () => {
    setIsConfirmDialogOpen(false);
  };

  const confirmAddIngredients = async () => {
    try {
      const missingIngredients = ingredients.filter(
        (ingredient) => !ingredient.inStock && !ingredient.isPending
      );
      const ingredientNames = missingIngredients.map((ingredient) => ingredient.name);

      await axios.post('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/cart', {
        userId,
        ingredients: ingredientNames,
      });

      const updatedIngredients = ingredients.map((ingredient) =>
        ingredient.inStock
          ? ingredient
          : {
              ...ingredient,
              isPending: true,
            }
      );
      setIngredients(updatedIngredients);
      closeConfirmDialog();
      Alert.alert('Success', 'Ingredients added to shopping list.');
    } catch (error) {
      console.error('Error adding ingredients to cart:', error.message);
      Alert.alert('Error', 'Failed to add ingredients to cart.');
    }
  };

  const missingIngredients = ingredients.filter(
    (ingredient) => !ingredient.inStock && !ingredient.isPending
  );

  const renderStockStatus = (ingredient) => {
    const { inStock, isPending } = ingredient;
  
    let iconSource;
    let tintColor;
  
    if (inStock) {
      iconSource = require('/Users/jadenbro1/FreshTemp/assets/check2.png');
      tintColor = 'green';
    } else if (isPending) {
      iconSource = require('/Users/jadenbro1/FreshTemp/assets/pending.png');
      tintColor = 'orange';
    } else {
      iconSource = require('/Users/jadenbro1/FreshTemp/assets/x.png');
      tintColor = 'red';
    }
  
    return (
      <View style={styles.stockContainer}>
        <Image source={iconSource} style={[styles.stockIcon, { tintColor }]} />
      </View>
    );
  };

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image and Favorite Button */}
        <View style={styles.imageContainer}>
          {recipe && recipe.image ? (
            <Image style={styles.image} source={{ uri: recipe.image }} />
          ) : (
            <Text>No Image Available</Text>
          )}
          <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
            <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonActive]}>
              {isFavorite ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <View style={styles.backButtonBox}>
            <Image
              source={require('/Users/jadenbro1/FreshTemp/assets/chevron-left.png')}
              style={styles.backIcon}
            />
            <Text style={styles.backButtonText}>Go Back</Text>
          </View>
        </TouchableOpacity>

        {/* Title and Description */}
        <Text style={styles.headerTitle}>{recipe.title}</Text>
        <Text style={styles.description}>{recipe.description}</Text>

        {/* Separator Line */}
        <View style={styles.separator} />

        {/* Recipe Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Image
              source={require('/Users/jadenbro1/FreshTemp/assets/clock.png')}
              style={styles.infoIcon}
            />
            <Text style={styles.infoLabel}>Prep Time</Text>
            <Text style={styles.infoValue}>{recipe.prep_time} mins</Text>
          </View>
          <View style={styles.infoItem}>
            <Image
              source={require('/Users/jadenbro1/FreshTemp/assets/clock.png')}
              style={styles.infoIcon}
            />
            <Text style={styles.infoLabel}>Cook Time</Text>
            <Text style={styles.infoValue}>{recipe.cook_time} mins</Text>
          </View>
          <View style={styles.infoItem}>
            <Image
              source={require('/Users/jadenbro1/FreshTemp/assets/servings.png')}
              style={styles.infoIcon}
            />
            <Text style={styles.infoLabel}>Servings</Text>
            <View style={styles.servingsContainer}>
              <TouchableOpacity style={styles.servingsButton} onPress={() => adjustServings(false)}>
                <Text style={styles.servingsButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.servingsValue}>{servings}</Text>
              <TouchableOpacity style={styles.servingsButton} onPress={() => adjustServings(true)}>
                <Text style={styles.servingsButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.infoItem}>
            <Image
              source={require('/Users/jadenbro1/FreshTemp/assets/star.png')}
              style={[styles.infoIcon, { tintColor: '#FFD700' }]}
            />
            <Text style={styles.infoLabel}>Rating</Text>
            <Text style={styles.infoValue}>{recipe.ratings || 'N/A'}/5</Text>
          </View>
        </View>

        {/* Ingredients Section */}
        {!isCooking && (
          <>
            <View style={styles.separator} />
            <View style={styles.section}>
              <Text style={styles.subTitle}>Ingredients</Text>
              {ingredients.map((ingredient, index) => (
  <View key={index} style={styles.ingredientItem}>
    <Text style={styles.ingredientText}>• {ingredient.name}</Text>
    {renderStockStatus(ingredient)}
  </View>
))}
            </View>

            {/* Add Missing Ingredients Button */}
            <TouchableOpacity
              style={[styles.addButton, missingIngredients.length === 0 && styles.buttonDisabled]}
              onPress={openConfirmDialog}
              disabled={missingIngredients.length === 0}
            >
              <Text style={styles.addButtonText}>Add Missing Ingredients</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Nutrition Facts */}
            <View style={styles.section}>
              <Text style={styles.subTitle}>Nutrition Facts</Text>
              <ScrollView style={styles.nutritionContainer}>
                {adjustedNutritionFacts.map((fact, index) => (
                  <View key={index} style={styles.nutritionRow}>
                    <Text style={styles.nutritionTitle}>{fact.name}</Text>
                    <Text style={styles.nutritionValue}>
                      {fact.amount.toFixed(1)} {fact.unit}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.cookButton} onPress={startCooking}>
              <Text style={styles.cookButtonText}>Start Cooking</Text>
            </TouchableOpacity>
          </>
        )}

        {isCooking && (
          <View style={styles.cookingContainer}>
            <Text style={styles.subTitle}>Cooking Instructions</Text>
            <ProgressView
              progress={(currentStep + 1) / instructions.length}
              progressTintColor="#38a169"
              trackTintColor="#D3D3D3"
              style={styles.progressBar}
            />
            <View style={styles.instructionStep}>
              <Text style={styles.instructionTitle}>Step {instructions[currentStep].step}</Text>
              <Text style={styles.instructionDescription}>
                {instructions[currentStep].description}
              </Text>
            </View>
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[styles.navButton, currentStep === 0 && styles.buttonDisabled]}
                onPress={prevStep}
                disabled={currentStep === 0}
              >
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
              {currentStep < instructions.length - 1 ? (
                <TouchableOpacity style={styles.navButton} onPress={nextStep}>
                  <Text style={styles.navButtonText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.navButton} onPress={finishCooking}>
                  <Text style={styles.navButtonText}>Finish Cooking</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Missing Ingredients Modal */}
      <AddMissingModal
        isVisible={isConfirmDialogOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmAddIngredients}
        missingIngredients={missingIngredients}
        userId={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingBottom: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: screenWidth,
    height: 250,
  },
  favoriteButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#FFFFFFAA',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonText: {
    fontSize: 24,
    color: '#FF0000',
  },
  favoriteButtonActive: {
    color: '#FF0000',
  },
  backButton: {
    marginTop: 10,
    marginLeft: 10,
    alignSelf: 'flex-start',
  },
  backButtonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEEE',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 5,
    width: 'auto',
  },
  backIcon: {
    width: 16,
    height: 16,
    tintColor: '#000',
    marginRight: 5,
  },
  backButtonText: {
    fontSize: 14,
    color: '#000',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: 10,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#CCCCCC',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  infoItem: {
    alignItems: 'center',
    width: '22%',
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginBottom: 5,
    tintColor: '#888888',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  servingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servingsButton: {
    backgroundColor: '#DDDDDD',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  servingsValue: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  section: {
    marginHorizontal: 10,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  ingredientIcon: {
    width: 20,
    height: 20,
  },
  addButton: {
    backgroundColor: '#000000',
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nutritionContainer: {
    maxHeight: 150,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  nutritionTitle: {
    fontSize: 16,
    color: '#333333',
  },
  nutritionValue: {
    fontSize: 16,
    color: '#333333',
  },
  cookButton: {
    backgroundColor: '#38a169',
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  cookingContainer: {
    marginHorizontal: 10,
    marginBottom: 20,
  },
  progressBar: {
    height: 10,
    marginVertical: 10,
  },
  instructionStep: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionDescription: {
    fontSize: 16,
    color: '#333333',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#38a169',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.48,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockIcon: {
    width: 20,
    height: 20,
  },
});

export default RecipeDetails;