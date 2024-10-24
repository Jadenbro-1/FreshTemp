import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ImageBackground } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StartCooking = ({ route, navigation }) => {
  const { recipe } = route.params;
  const [step, setStep] = useState(1);

  const nextStep = () => {
    if (step < recipe.instructions.split('\n').length + 3) {
      setStep(step + 1);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <View style={styles.content}>
          <Text style={styles.description}>Here are the ingredients you need:</Text>
          {recipe.ingredients.split('\n').map((ingredient, index) => (
            <Text key={index} style={styles.ingredientText}>• {ingredient}</Text>
          ))}
        </View>
      );
    } else if (step > 1 && step <= recipe.instructions.split('\n').length + 1) {
      const instructionIndex = step - 2;
      return (
        <View style={styles.content}>
          <Text style={styles.description}>{recipe.instructions.split('\n')[instructionIndex]}</Text>
        </View>
      );
    } else if (step === recipe.instructions.split('\n').length + 2) {
      return (
        <View style={styles.content}>
          <Text style={styles.description}>Enjoy your meal!</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.content}>
          <Text style={styles.description}>Please leave a review</Text>
        </View>
      );
    }
  };

  const renderImage = () => {
    if (step === 1) {
      return <Image source={require('/Users/jadenbro1/FreshTemp/assets/gatheringredients.png')} style={styles.stepImage} />;
    } else if (step > 1 && step <= recipe.instructions.split('\n').length + 1) {
      return <Image source={require('/Users/jadenbro1/FreshTemp/assets/begincooking.png')} style={styles.stepImage} />;
    } else if (step === recipe.instructions.split('\n').length + 2) {
      return <Image source={require('/Users/jadenbro1/FreshTemp/assets/enjoy.png')} style={styles.stepImage} />;
    } else {
      return <Image source={require('/Users/jadenbro1/FreshTemp/assets/review.png')} style={styles.stepImage} />;
    }
  };

  return (
    <ImageBackground source={require('/Users/jadenbro1/FreshTemp/assets/cookbackground.jpg')} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.stepTitle}>{`0${step}.`}</Text>
          <View style={styles.underlineContainer}>
            <Text style={styles.underline}>━━━━━━━━━━━━━━━</Text>
          </View>
          <Text style={styles.stepSubTitle}>
            {step === 1
              ? 'Gather Ingredients'
              : step > 1 && step <= recipe.instructions.split('\n').length + 1
              ? 'Begin Cooking'
              : step === recipe.instructions.split('\n').length + 2
              ? 'Enjoy!'
              : 'Review'}
          </Text>
        </View>
        <View style={styles.imageContainer}>{renderImage()}</View>
        <View style={styles.contentContainer}>{renderStep()}</View>
        <TouchableOpacity
          onPress={step <= recipe.instructions.split('\n').length + 2 ? nextStep : () => navigation.goBack()}
          style={styles.nextButton}
        >
          <Image
            source={
              step <= recipe.instructions.split('\n').length + 2
                ? require('/Users/jadenbro1/FreshTemp/assets/goforward.png')
                : require('/Users/jadenbro1/FreshTemp/assets/gobackw.png')
            }
            style={styles.nextIcon}
          />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    marginTop: 60, // Adjusted to lower the number
  },
  underlineContainer: {
    width: '100%', // Line goes to the center of the screen
    alignItems: 'flex-start', // Aligns the line to the start of the container
    fontWeight: 'bold',
  },
  underline: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stepSubTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  imageContainer: {
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 40,
    marginBottom: 120,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  ingredientText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'left',
    width: '100%',
  },
  stepImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    borderRadius: 50,
    padding: 10,
  },
  nextIcon: {
    width: 64,
    height: 64,
  },
});

export default StartCooking;
