// EditProfileScreen.js

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  Image,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';
// No vector icons used as per your request

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const userId = 1; // Replace with dynamic user ID as needed

  // Initialize state with all relevant fields
  const [profile, setProfile] = useState({
    username: '',
    name: '',
    bio: '',
    specialties: [],
    is_private_profile: false,
    profileImage: '', // For profile image URL
  });

  const [newSpecialty, setNewSpecialty] = useState('');

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/user/${userId}/profile`
        );
        const data = response.data;
        setProfile({
          username: data.username || '',
          name: data.name || '',
          bio: data.bio || '',
          specialties: data.specialties || [],
          is_private_profile: data.is_private_profile || false,
          profileImage: data.profile_image_url || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error.message);
        Alert.alert('Error', 'Failed to load profile data.');
      }
    };
    fetchProfile();
  }, [userId]);

  // Handle changes in editable fields
  const handleChange = (name, value) => {
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile submission
  const handleSubmit = async () => {
    // Include only editable fields and username to retain its value
    const profileData = {
      username: profile.username, // Retain username
      name: profile.name,
      bio: profile.bio,
      specialties: profile.specialties,
      profile_image_url: profile.profileImage, // Assuming backend expects this field
    };

    try {
      await axios.put(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/user/${userId}/profile`,
        profileData
      );
      Alert.alert('Success', 'Profile updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving profile:', error.message);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  // Handle profile photo change
  const handleChangeProfilePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick the image.');
      } else {
        const uri = response.assets[0].uri;
        setProfile((prev) => ({ ...prev, profileImage: uri }));
      }
    });
  };

  // Handle adding a new specialty
  const handleAddSpecialty = () => {
    if (newSpecialty && !profile.specialties.includes(newSpecialty)) {
      setProfile((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty],
      }));
      setNewSpecialty('');
    }
  };

  // Handle removing a specialty
  const handleRemoveSpecialty = (specialty) => {
    setProfile((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((s) => s !== specialty),
    }));
  };

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
            source={require('/Users/jadenbro1/FreshTemp/assets/left.png')} // Adjust the path as needed
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <Image
            source={
              profile.profileImage
                ? { uri: profile.profileImage }
                : require('/Users/jadenbro1/FreshTemp/assets/profilepic.jpg') // Use specified profile picture
            }
            style={styles.avatar}
          />
          <TouchableOpacity
            onPress={handleChangeProfilePhoto}
            style={styles.changePhotoButton}
          >
            <Image
              source={require('/Users/jadenbro1/FreshTemp/assets/login.png')} // Using login.png for now
              style={[styles.iconSmall, { tintColor: '#0EA5E9', marginRight: 4 }]}
            />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={{ marginTop: 16 }}>
          {/* Name (Editable) */}
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(text) => handleChange('name', text)}
                placeholder="Enter your name"
                placeholderTextColor="#6B7280"
              />
            </View>
          </View>

          {/* Username (Read-only) */}
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={profile.username}
                editable={false}
                placeholder="Username"
                placeholderTextColor="#6B7280"
              />
              {/* Optional: Lock icon to indicate read-only */}
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/lock.png')}
                style={styles.lockIcon}
              />
            </View>
            <Text style={styles.infoText}>
              Username cannot be changed once set.
            </Text>
          </View>

          {/* Bio */}
          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              value={profile.bio}
              onChangeText={(text) => handleChange('bio', text)}
              multiline
              placeholder="Tell us about yourself"
              placeholderTextColor="#6B7280"
            />
          </View>

          {/* Specialties */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialties</Text>
            <View style={styles.specialtiesContainer}>
              {profile.specialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyBadge}>
                  <Text style={styles.specialtyText}>{specialty}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSpecialty(specialty)}>
                    <Image
                      source={require('/Users/jadenbro1/FreshTemp/assets/trash.png')} // Using lock.png for now
                      style={[styles.iconSmall, { tintColor: '#6B7280' }]}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addSpecialtyContainer}>
              <TextInput
                style={styles.specialtyInput}
                value={newSpecialty}
                onChangeText={setNewSpecialty}
                placeholder="Add a specialty"
                placeholderTextColor="#6B7280"
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddSpecialty}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  statusBar: {
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 44 : 0,
  },
  // Header styles
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
    fontFamily: 'Cochin',
  },

  // Profile picture
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#D1D5DB',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#0EA5E9',
    fontWeight: '500',
  },
  iconSmall: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },

  // ScrollView content
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Space to prevent content from being hidden by bottom elements
  },

  // Sections
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 8,
  },

  // Form fields
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2937', // Dark gray text
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#1F2937',
  },
  lockIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 20,
    height: 20,
    tintColor: '#9CA3AF',
    resizeMode: 'contain',
  },
  infoText: {
    marginTop: 4,
    color: '#9CA3AF',
    fontSize: 14,
  },

  // Specialties
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 14,
    color: '#1F2937',
    marginRight: 4,
  },
  addSpecialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  specialtyInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1F2937', // Dark gray text
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: '#0EA5E9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Save Button
  saveButton: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default EditProfileScreen;