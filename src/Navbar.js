// Navbar.js

import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Navbar({ currentScreen, theme = 'light' }) {
  const navigation = useNavigation();

  const isDarkMode = theme === 'dark';

  return (
    <View style={[styles.navbar, isDarkMode && styles.navbarDark]}>
      {/* Home Tab */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Image
          source={require('../assets/home.png')}
          style={[
            styles.navIcon,
            currentScreen === 'Home' && styles.navIconActive,
            isDarkMode && styles.navIconDark,
          ]}
        />
        <Text
          style={[
            styles.navText,
            currentScreen === 'Home' && styles.navTextActive,
            isDarkMode && styles.navTextDark,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Search Tab */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('UserDashboard')}
      >
        <Image
          source={require('../assets/search.png')}
          style={[
            styles.navIcon,
            currentScreen === 'Search' && styles.navIconActive,
            isDarkMode && styles.navIconDark,
          ]}
        />
        <Text
          style={[
            styles.navText,
            currentScreen === 'Search' && styles.navTextActive,
            isDarkMode && styles.navTextDark,
          ]}
        >
          Search
        </Text>
      </TouchableOpacity>

      {/* Upload Tab */}
      <TouchableOpacity
        style={styles.navButton} // Reuse the same style as others
        onPress={() => navigation.navigate('Upload')}
      >
        <Image
          source={require('../assets/add2.png')}
          style={[
            styles.navIcon,
            currentScreen === 'Upload' && styles.navIconActive,
            isDarkMode && styles.navIconDark,
          ]}
        />
        <Text
          style={[
            styles.navText,
            currentScreen === 'Upload' && styles.navTextActive,
            isDarkMode && styles.navTextDark,
          ]}
        >
          Upload
        </Text>
      </TouchableOpacity>

      {/* Meal Planner Tab */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('WeeklyMealPlan')}
      >
        <Image
          source={require('../assets/soup-dark.png')}
          style={[
            styles.navIcon,
            currentScreen === 'MealPlanner' && styles.navIconActive,
            isDarkMode && styles.navIconDark,
          ]}
        />
        <Text
          style={[
            styles.navText,
            currentScreen === 'MealPlanner' && styles.navTextActive,
            isDarkMode && styles.navTextDark,
          ]}
        >
        Plan
        </Text>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('MyProfile')}
      >
        <Image
          source={require('../assets/user2.png')}
          style={[
            styles.navIcon,
            currentScreen === 'MyProfile' && styles.navIconActive,
            isDarkMode && styles.navIconDark,
          ]}
        />
        <Text
          style={[
            styles.navText,
            currentScreen === 'MyProfile' && styles.navTextActive,
            isDarkMode && styles.navTextDark,
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff', // Default light background
    borderTopColor: '#e5e7eb',
    borderTopWidth: 1,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navbarDark: {
    backgroundColor: '#000000', // Dark mode background
    borderTopColor: '#333',
  },
  navButton: {
    alignItems: 'center',
    flex: 1, // Ensure all buttons have equal space
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#6b7280', // Default icon color
  },
  navIconDark: {
    tintColor: '#ffffff', // Icon color in dark mode
  },
  navIconActive: {
    tintColor: '#5FC6FF', // Active icon color
  },
  navText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  navTextDark: {
    color: '#ffffff', // Text color in dark mode
  },
  navTextActive: {
    fontSize: 12,
    color: '#5FC6FF', // Active text color
    marginTop: 2,
  },
});