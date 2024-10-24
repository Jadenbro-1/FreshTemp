// SettingsScreen.js

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from './UserContext'; // Adjust the import path as needed

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);
  const { setCurrentUser } = useContext(UserContext); // Access the UserContext

  return (
    <View style={styles.container}>
      {/* iOS-style status bar */}
      <View style={styles.statusBar} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerLeft}
        >
          <Image
            source={require('/Users/jadenbro1/FreshTemp/assets/left.png')} // Temporary icon
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Main content */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/login.png')} // Temporary icon
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Edit Profile</Text>
              </View>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/arrow.png')} // Temporary chevron icon
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.option}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/lock.png')} // Temporary icon
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Change Password</Text>
              </View>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/arrow.png')} // Temporary chevron icon
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
            <View style={styles.separator} />
            {/* Logout Option */}
            <TouchableOpacity
              style={[styles.option, styles.logoutOption]}
              onPress={async () => {
                try {
                  await AsyncStorage.removeItem('userToken'); // Remove user token
                  setCurrentUser(null); // Reset current user
                  navigation.navigate('Login'); // Navigate to Login screen
                } catch (error) {
                  console.error('Error during logout:', error);
                  Alert.alert('Error', 'Could not log out. Please try again.');
                }
              }}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/log-out.png')} // Temporary logout icon
                  style={[styles.optionIcon, styles.logoutIcon]}
                />
                <Text style={[styles.optionText, styles.logoutText]}>Log Out</Text>
              </View>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/arrow.png')} // Temporary chevron icon
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.sectionContent}>
            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/private.png')} // Temporary icon
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Private Account</Text>
              </View>
              <Switch
                value={privateAccount}
                onValueChange={setPrivateAccount}
              />
            </View>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.option}
              onPress={() => navigation.navigate('AccountPrivacy')}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/share2.png')} // Temporary icon
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Account Privacy</Text>
              </View>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/arrow.png')} // Temporary chevron icon
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <View style={styles.option}>
              <View style={styles.optionLeft}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/alert.png')} // Temporary icon
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Push Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            </View>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.option}
              onPress={() => navigation.navigate('EmailNotifications')}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/email.png')} // Temporary icon
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Email Notifications</Text>
              </View>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/arrow.png')} // Temporary chevron icon
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Preferences</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => navigation.navigate('FavoriteCuisines')}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/star2.png')} // Temporary icon
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Favorite Cuisines</Text>
              </View>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/arrow.png')} // Temporary chevron icon
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.option}
              onPress={() => navigation.navigate('SavedRecipes')}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/bookmark.png')} // Temporary icon
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Saved Recipes</Text>
              </View>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/arrow.png')} // Temporary chevron icon
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support and About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & About</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => navigation.navigate('HelpCenter')}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/help-circle.png')} // Temporary icon
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>Help Center</Text>
              </View>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/arrow.png')} // Temporary chevron icon
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.option}
              onPress={() => navigation.navigate('About')}
            >
              <View style={styles.optionLeft}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/settings2.png')} // Temporary icon
                  style={styles.optionIcon}
                />
                <Text style={styles.optionText}>About</Text>
              </View>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/arrow.png')} // Temporary chevron icon
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  statusBar: {
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 44 : 0,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 }, // For iOS shadow
    shadowOpacity: 0.1, // For iOS shadow
    shadowRadius: 2, // For iOS shadow
    paddingTop: Platform.OS === 'ios' ? 44 : 8, // Adjust padding for status bar
  },
  headerLeft: {
    marginRight: 8,
  },
  headerIcon: {
    width: 18,
    height: 18,
    tintColor: '#0EA5E9',
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#0EA5E9',
    fontFamily: 'Cochin'
  },
  scrollViewContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 1 }, // For iOS shadow
    shadowOpacity: 0.05, // For iOS shadow
    shadowRadius: 1, // For iOS shadow
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    resizeMode: 'contain',
  },
  chevronIcon: {
    width: 20,
    height: 20,
    tintColor: '#9CA3AF',
    resizeMode: 'contain',
  },
  optionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  logoutOption: {
    // You can add custom styles if needed
  },
  logoutIcon: {
    tintColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
  },
});

export default SettingsScreen;
