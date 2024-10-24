// Upload.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';

// Import your assets here
const CloseIcon = require('../assets/close.png');
const FlashOffIcon = require('../assets/flash-off.png'); // Flash Off Icon
const FlashOnIcon = require('../assets/flash-on.png'); // Flash On Icon
const SettingsIcon = require('../assets/settings.png');
const CameraIcon = require('../assets/camera.png');
const RecentsIcon = require('../assets/dropdown.png');
const SelectMultipleIcon = require('../assets/multiple.png');
const PlayIcon = require('../assets/play.png');

const Upload = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState('Recipe'); // 'Recipe', 'Story', 'Meal'
  const [selectedMedia, setSelectedMedia] = useState([]); // Array for multi-select
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
  const [photos, setPhotos] = useState([]);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasCameraRollPermission, setHasCameraRollPermission] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [flashMode, setFlashMode] = useState(RNCamera.Constants.FlashMode.off);
  const [cameraType, setCameraType] = useState(RNCamera.Constants.Type.back);
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [photoLoadingError, setPhotoLoadingError] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false); // Multi-select mode

  const windowWidth = Dimensions.get('window').width;
  const imageContainerHeight = Dimensions.get('window').height * 0.4;

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        // Request camera permission
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos/videos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        setHasCameraPermission(cameraGranted === PermissionsAndroid.RESULTS.GRANTED);

        // Request external storage permission
        const storageGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your photo library to select images/videos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        setHasCameraRollPermission(storageGranted === PermissionsAndroid.RESULTS.GRANTED);

        if (storageGranted === PermissionsAndroid.RESULTS.GRANTED) {
          loadPhotos();
        }
      } else {
        // iOS Permissions
        setHasCameraPermission(true);
        setHasCameraRollPermission(true);
        loadPhotos();
      }
    })();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const photosData = await CameraRoll.getPhotos({
        first: 50,
        assetType: 'All',
      });
      setPhotos(photosData.edges);
      if (photosData.edges.length > 0) {
        const firstMedia = photosData.edges[0];
        handleMediaSelect(firstMedia.node.image.uri, firstMedia.node.type);
      }
      setLoadingPhotos(false);
    } catch (error) {
      console.error('Error loading photos:', JSON.stringify(error, null, 2));
      setPhotoLoadingError(true);
      setLoadingPhotos(false);
      Alert.alert(
        'Error',
        'Failed to load photos from your library. Please try again.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }
  };

  const getMediaFilePath = async (uri, type) => {
    if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
      const assetID = uri.substring(5, 41);
      const ext = type.startsWith('video') ? '.MOV' : '.JPG'; // Adjust extension as needed
      const destPath = `${RNFS.TemporaryDirectoryPath}/${assetID}${ext}`;

      try {
        if (type.startsWith('video')) {
          await RNFS.copyAssetsVideoIOS(uri, destPath);
        } else {
          await RNFS.copyAssetsFileIOS(uri, destPath, 0, 0);
        }
        return 'file://' + destPath;
      } catch (error) {
        console.error('Error copying media:', error);
        return null;
      }
    }
    return uri;
  };

  const handleMediaSelect = async (uri, type) => {
    const filePath = await getMediaFilePath(uri, type);
    if (filePath) {
      if (isMultiSelectMode) {
        if (selectedMedia.some(item => item.uri === uri)) {
          // If already selected, remove it
          setSelectedMedia(prev => prev.filter(item => item.uri !== uri));
        } else {
          // Add to selection
          setSelectedMedia(prev => [...prev, { uri: filePath, type }]);
        }
      } else {
        // Single selection mode
        setSelectedMedia([{ uri: filePath, type }]);
        setMediaType(type.startsWith('video') ? 'video' : 'image');
      }
    } else {
      Alert.alert('Error', 'Failed to load the media. Please try again.');
    }
  };

  const handleOptionPress = (option) => {
    if (option === 'Select Multiple') {
      setIsMultiSelectMode(prev => !prev);
      if (isMultiSelectMode) {
        // Exiting multi-select mode, clear selections
        setSelectedMedia([]);
      }
      return;
    }

    setSelectedOption(option);
    if (option === 'Story' || option === 'Meal') {
      if (!hasCameraPermission) {
        Alert.alert(
          'Permission required',
          'Camera permission is required to use this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
          { cancelable: false }
        );
        return;
      }
      setShowCamera(true);
    } else {
      setShowCamera(false);
    }
  };

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 0.7, base64: false };
        const data = await cameraRef.current.takePictureAsync(options);
        handleMediaSelect(data.uri, 'image/jpeg');
        setShowCamera(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.', [{ text: 'OK' }], { cancelable: false });
      }
    }
  };

  const handleStartRecording = async () => {
    if (cameraRef.current) {
      try {
        setIsRecording(true);
        const options = { quality: RNCamera.Constants.VideoQuality['480p'] };
        const data = await cameraRef.current.recordAsync(options);
        handleMediaSelect(data.uri, 'video/mp4');
        setShowCamera(false);
        setIsRecording(false);
      } catch (error) {
        console.error('Error recording video:', error);
        Alert.alert('Error', 'Failed to record video. Please try again.', [{ text: 'OK' }], { cancelable: false });
        setIsRecording(false);
      }
    }
  };

  const handleStopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const renderItem = ({ item }) => {
    const uri = item.node.image.uri;
    const type = item.node.type;
    const isSelected = selectedMedia.some(selected => selected.uri === uri);

    // Determine the selection number
    let selectionNumber = null;
    if (isSelected && isMultiSelectMode) {
      const selectedIndex = selectedMedia.findIndex(selected => selected.uri === uri);
      selectionNumber = selectedIndex + 1;
    }

    return (
      <TouchableOpacity
        style={styles.photoThumbnailContainer}
        onPress={() => handleMediaSelect(uri, type)}
        activeOpacity={0.7}
      >
        <Image source={{ uri }} style={styles.photoThumbnail} />
        {type.startsWith('video') && (
          <View style={styles.videoIconContainer}>
            <Image source={PlayIcon} style={styles.playIcon} />
          </View>
        )}
        {isSelected && isMultiSelectMode && (
          <>
            <View style={styles.selectedOverlay} />
            <View style={styles.selectionNumberContainer}>
              <Text style={styles.selectionNumberText}>{selectionNumber}</Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderCamera = () => {
    if (selectedOption === 'Story' || selectedOption === 'Meal') {
      return (
        <Modal visible={showCamera} transparent={false} animationType="slide">
          <View style={styles.cameraContainer}>
            <RNCamera
              ref={cameraRef}
              style={styles.camera}
              type={cameraType}
              flashMode={flashMode}
              captureAudio={selectedOption === 'Story'}
            >
              {/* Floating Icons */}
              <View style={styles.cameraHeader}>
                <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.cameraIconButton}>
                  <Image source={CloseIcon} style={styles.cameraIcon} />
                </TouchableOpacity>
                {(selectedOption === 'Story' || selectedOption === 'Meal') && (
                  <TouchableOpacity
                    onPress={() =>
                      setFlashMode(
                        flashMode === RNCamera.Constants.FlashMode.off
                          ? RNCamera.Constants.FlashMode.on
                          : RNCamera.Constants.FlashMode.off
                      )
                    }
                    style={styles.cameraIconButton}
                  >
                    <Image
                      source={flashMode === RNCamera.Constants.FlashMode.off ? FlashOffIcon : FlashOnIcon}
                      style={styles.cameraIcon}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => {/* Implement Settings Action */}} style={styles.cameraIconButton}>
                  <Image source={SettingsIcon} style={styles.cameraIcon} />
                </TouchableOpacity>
              </View>
              {selectedOption === 'Meal' && (
                <View style={styles.mealOverlay}>
                  <View style={styles.mealCircle} />
                  <Text style={styles.mealText}>Capture food within circle</Text>
                </View>
              )}
              <View style={styles.cameraFooter}>
                {/* Options at bottom */}
                <View style={styles.cameraOptions}>
                  {['Recipe', 'Story', 'Meal'].map((option) => (
                    <TouchableOpacity key={option} onPress={() => handleOptionPress(option)} style={styles.cameraOptionButton}>
                      <Text style={[styles.cameraOptionText, selectedOption === option && styles.cameraOptionTextActive]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Capture Button */}
                {selectedOption === 'Story' ? (
                  <TouchableOpacity
                    onPressIn={handleStartRecording}
                    onPressOut={handleStopRecording}
                    style={[styles.captureButton, isRecording && styles.captureButtonRecording]}
                  />
                ) : (
                  <TouchableOpacity onPress={handleTakePicture} style={styles.captureButton} />
                )}
              </View>
            </RNCamera>
          </View>
        </Modal>
      );
    }
    return null;
  };

  const handleNextPress = () => {
    // Navigate to PostDetails screen with selected media
    if (selectedMedia.length > 0) {
      navigation.navigate('PostDetails', {
        mediaUris: selectedMedia.map(item => item.uri),
        mediaTypes: selectedMedia.map(item => item.type),
      });
    } else {
      Alert.alert('No media selected', 'Please select an image or video.', [{ text: 'OK' }], { cancelable: false });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Image source={CloseIcon} style={styles.headerIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity onPress={handleNextPress} style={styles.headerButton}>
          <Text style={styles.headerNextText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Image/Video */}
      <View style={[styles.imageContainer, { height: imageContainerHeight }]}>
        {selectedMedia.length > 0 ? (
          selectedMedia.length === 1 && mediaType === 'image' ? (
            <Image source={{ uri: selectedMedia[0].uri }} style={styles.selectedMedia} />
          ) : selectedMedia.length === 1 && mediaType === 'video' ? (
            <Video
              source={{ uri: selectedMedia[0].uri }}
              style={styles.selectedMedia}
              controls
              resizeMode="cover"
              onError={(error) => {
                console.error('Error loading video:', error);
                Alert.alert(
                  'Error',
                  'Failed to load the video. Please check the file path or your permissions.',
                  [{ text: 'OK' }],
                  { cancelable: false }
                );
              }}
            />
          ) : (
            // If multiple media are selected, display them in a horizontal FlatList
            <FlatList
              data={selectedMedia}
              horizontal
              keyExtractor={(item, index) => `${item.uri}-${index}`}
              renderItem={({ item }) => (
                item.type.startsWith('image') ? (
                  <Image source={{ uri: item.uri }} style={styles.selectedMediaMultiple} />
                ) : (
                  <Video
                    source={{ uri: item.uri }}
                    style={styles.selectedMediaMultiple}
                    controls
                    resizeMode="cover"
                    onError={(error) => {
                      console.error('Error loading video:', error);
                      Alert.alert(
                        'Error',
                        'Failed to load the video. Please check the file path or your permissions.',
                        [{ text: 'OK' }],
                        { cancelable: false }
                      );
                    }}
                  />
                )
              )}
            />
          )
        ) : (
          <View style={styles.noMediaSelected}>
            <Text style={styles.noMediaText}>No media selected</Text>
          </View>
        )}
      </View>

      {/* Recents and Select Multiple Buttons */}
      <View style={styles.topButtonsContainer}>
        <TouchableOpacity style={styles.topButton}>
          <Image source={RecentsIcon} style={styles.topButtonIcon} />
          <Text style={styles.topButtonText}>Recents</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleOptionPress('Select Multiple')} style={styles.topButton}>
          <Image source={SelectMultipleIcon} style={styles.topButtonIcon} />
          <Text style={styles.topButtonText}>
            {isMultiSelectMode ? 'Cancel' : 'Select'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Photo Grid */}
      {loadingPhotos ? (
        <ActivityIndicator size="large" color="#0EA5E9" style={styles.loader} />
      ) : photoLoadingError ? (
        <View style={styles.photoErrorContainer}>
          <Text style={styles.photoErrorText}>Error loading photos</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item) => item.node.image.uri}
          numColumns={4}
          style={styles.photoGrid}
        />
      )}

      {/* Bottom Options */}
      <View style={styles.bottomOptionsContainer}>
        {['Recipe', 'Story', 'Meal'].map((option) => (
          <TouchableOpacity key={option} onPress={() => handleOptionPress(option)} style={styles.bottomOptionButton}>
            <Text style={[styles.bottomOptionText, selectedOption === option && styles.bottomOptionTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show Camera if needed */}
      {renderCamera()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background for the entire screen
    paddingTop: Platform.OS === 'ios' ? 40 : 20, // Increased paddingTop for iOS to prevent notch overlap
    paddingBottom: Platform.OS === 'ios' ? 0 : 0, // Removed paddingBottom to connect bottom container
  },
  header: {
    height: 60, // Increased height to accommodate padding
    backgroundColor: '#121212', // Dark gray background for the header
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 4,
  },
  headerButton: {
    padding: 5,
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: '#ffffff', // White icons for visibility
  },
  headerTitle: {
    fontSize: 20, // Increased font size for better visibility
    fontWeight: 'bold',
    color: '#ffffff', // White text for the title
  },
  headerNextText: {
    fontSize: 16,
    color: '#0EA5E9', // Blue color remains for the "Next" button
    fontWeight: 'bold',
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#000000', // Black background for the selected media area
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedMedia: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  selectedMediaMultiple: {
    width: Dimensions.get('window').width * 0.8,
    height: '100%',
    resizeMode: 'cover',
    marginHorizontal: 10,
  },
  noMediaSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMediaText: {
    color: '#ffffff', // White text when no media is selected
    fontSize: 16,
  },
  topButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#1e1e1e', // Dark gray background
  },
  topButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topButtonIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 5,
    tintColor: '#ffffff', // White icons
  },
  topButtonText: {
    fontSize: 14,
    color: '#ffffff', // White text
  },
  photoGrid: {
    flex: 1,
    backgroundColor: '#121212', // Dark background for the photo grid
  },
  photoThumbnailContainer: {
    flex: 1 / 4,
    margin: 1,
  },
  photoThumbnail: {
    width: '100%',
    height: 100,
    backgroundColor: '#121212', // Dark background for each thumbnail
  },
  videoIconContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  playIcon: {
    width: 20,
    height: 20,
    tintColor: '#ffffff', // White play icon
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 122, 255, 0.6)', // More opaque blue overlay
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  selectionNumberContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#007AFF', // Blue background for the number
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionNumberText: {
    color: '#ffffff', // White number
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#121212', // Dark gray background
  },
  bottomOptionButton: {
    marginHorizontal: 20, // Increased spacing between options
    marginVertical: 10,
  },
  bottomOptionText: {
    fontSize: 16,
    color: '#b3b3b3', // Light gray text
  },
  bottomOptionTextActive: {
    color: '#ffffff', // White text for the active option
    fontWeight: 'bold',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000', // Black background for the camera
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    position: 'absolute',
    top: 52, // Further lowered to prevent notch overlap
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  cameraIconButton: {
    padding: 10,
  },
  cameraIcon: {
    width: 30,
    height: 30,
    tintColor: '#ffffff', // White icons
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ffffff', // White capture button
    borderWidth: 5,
    borderColor: '#000000', // Black border
  },
  captureButtonRecording: {
    backgroundColor: 'red', // Red color when recording
  },
  cameraOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  cameraOptionButton: {
    paddingHorizontal: 10,
  },
  cameraOptionText: {
    fontSize: 16,
    color: '#b3b3b3', // Light gray text
  },
  cameraOptionTextActive: {
    color: '#ffffff', // White text for the active option
    fontWeight: 'bold',
  },
  mealOverlay: {
    position: 'absolute',
    top: '20%', // Brought up from '30%' to '20%'
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mealCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#ffffff', // White border for the circle
  },
  mealText: {
    marginTop: 10, // Adjust as needed
    color: '#ffffff', // White text
    fontSize: 16,
  },
  photoErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212', // Dark background for error
  },
  photoErrorText: {
    color: '#ffffff', // White error text
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
});

export default Upload;