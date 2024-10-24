// src/PostDetails.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  Image,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  PanResponder,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import { VideoPlayer, Trimmer } from 'react-native-video-processing';
import ImagePicker from 'react-native-image-crop-picker';
import {
  Grayscale,
  Sepia,
  Invert,
  Brightness,
  Contrast,
} from 'react-native-image-filter-kit';
import ViewShot, { captureRef } from 'react-native-view-shot';

// Import your custom icons
const CloseIcon = require('../assets/close.png'); // Replace with your actual path
const TextIcon = require('../assets/title.png'); // Ensure correct icon paths
const FilterIcon = require('../assets/filter.png');
const StickerIcon = require('../assets/star2.png');
const EditIcon = require('../assets/edit.png');
const NextIcon = require('../assets/next.png');

// Predefined text colors
const TEXT_COLORS = ['#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500'];

const PostDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mediaUris = [], mediaTypes = [] } = route.params || {};

  const [editedMedia, setEditedMedia] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTrimmerVisible, setIsTrimmerVisible] = useState(false);
  const [isImageEditorVisible, setIsImageEditorVisible] = useState(false);
  const [isTextModalVisible, setIsTextModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [filterType, setFilterType] = useState(null);
  const [overlayText, setOverlayText] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textFontSize, setTextFontSize] = useState(24);

  const viewShotRef = useRef();

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  // Animated values for draggable and resizable text
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Array.isArray(mediaUris) && mediaUris.length > 0) {
      setEditedMedia(mediaUris.map(uri => ({ uri })));
    } else {
      console.warn('mediaUris is empty or not an array');
    }
  }, [mediaUris]);

  // PanResponder for dragging and pinching the text
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => overlayText !== '',
      onMoveShouldSetPanResponder: () => overlayText !== '',
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.numberActiveTouches === 2) {
          // Handle pinch for scaling
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];

          const dx = touch1.pageX - touch2.pageX;
          const dy = touch1.pageY - touch2.pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const initialDistance = 200; // Initial distance for scaling
          const newScale = distance / initialDistance;
          scale.setValue(newScale);
        } else {
          // Handle drag
          pan.x.setValue(gestureState.dx);
          pan.y.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  const openTrimmer = () => {
    const currentMedia = editedMedia[currentIndex];
    const type = mediaTypes[currentIndex];

    if (!currentMedia || !type || !type.startsWith('video')) {
      Alert.alert(
        'Error',
        'No video selected for trimming.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
      return;
    }

    setIsTrimmerVisible(true);
  };

  const trimVideo = async (trimStart, trimEnd) => {
    const currentMedia = editedMedia[currentIndex];

    const options = {
      startTime: trimStart,
      endTime: trimEnd,
      quality: VideoPlayer.Constants.quality.QUALITY_1280x720, // iOS only
      saveToCameraRoll: false, // default is false // iOS only
      saveWithCurrentDate: true, // default is false // iOS only
    };

    try {
      const newSource = await VideoPlayer.trim(currentMedia.uri, options);
      // Update the edited media
      const updatedMedia = [...editedMedia];
      updatedMedia[currentIndex] = { uri: newSource };
      setEditedMedia(updatedMedia);
      setIsTrimmerVisible(false);
    } catch (error) {
      console.error('Trim error:', error);
      Alert.alert(
        'Error',
        'Failed to trim video. Please try again.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }
  };

  const handleNextPress = () => {
    // Navigate to sharing or another screen as needed
    Alert.alert(
      'Post Ready',
      'Proceed to share your post.',
      [{ text: 'OK' }],
      { cancelable: false }
    );
  };

  const renderMedia = () => {
    const currentMedia = editedMedia[currentIndex];
    const type = mediaTypes[currentIndex];

    if (!currentMedia || !type) {
      console.warn('currentMedia or type is undefined');
      return null;
    }

    if (type.startsWith('video')) {
      return (
        <Video
          source={{ uri: currentMedia.uri }}
          style={styles.media}
          controls
          resizeMode="cover" // Changed to cover to fill the space
        />
      );
    } else {
      return (
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'jpg', quality: 0.9 }}
          style={styles.viewShot}
        >
          {/* Apply Filters */}
          {filterType === 'grayscale' && (
            <Grayscale>
              <Image source={{ uri: currentMedia.uri }} style={styles.media} />
            </Grayscale>
          )}
          {filterType === 'sepia' && (
            <Sepia>
              <Image source={{ uri: currentMedia.uri }} style={styles.media} />
            </Sepia>
          )}
          {filterType === 'invert' && (
            <Invert>
              <Image source={{ uri: currentMedia.uri }} style={styles.media} />
            </Invert>
          )}
          {filterType === 'brightness' && (
            <Brightness amount={2}>
              <Image source={{ uri: currentMedia.uri }} style={styles.media} />
            </Brightness>
          )}
          {filterType === 'contrast' && (
            <Contrast amount={2}>
              <Image source={{ uri: currentMedia.uri }} style={styles.media} />
            </Contrast>
          )}
          {!filterType && (
            <Image source={{ uri: currentMedia.uri }} style={styles.media} />
          )}
        </ViewShot>
      );
    }
  };

  const handleEditPress = () => {
    const type = mediaTypes[currentIndex];
    if (type.startsWith('video')) {
      openTrimmer();
    } else if (type.startsWith('image')) {
      // Directly enter crop mode by opening ImagePicker's cropper
      openCropper();
    } else {
      Alert.alert(
        'Edit',
        'Unsupported media type.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }
  };

  const openCropper = () => {
    const currentMedia = editedMedia[currentIndex];
    if (!currentMedia) {
      Alert.alert(
        'Error',
        'No image selected for editing.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
      return;
    }

    ImagePicker.openCropper({
      path: currentMedia.uri,
      width: 300,
      height: 400,
      cropping: true,
      mediaType: 'photo',
    })
      .then(image => {
        handleImageEdited(image.path);
      })
      .catch(error => {
        if (error.code !== 'E_PICKER_CANCELLED') {
          console.error('Image cropping error:', error);
          Alert.alert(
            'Error',
            'Failed to crop image. Please try again.',
            [{ text: 'OK' }],
            { cancelable: false }
          );
        }
      });
  };

  const handleImageEdited = async (editedUri) => {
    try {
      // If editedUri is provided (from cropper), use it directly
      // Else, capture the viewShot
      let uriToSave = editedUri;
      if (!editedUri) {
        uriToSave = await captureRef(viewShotRef, {
          format: 'jpg',
          quality: 0.9,
        });
      }

      if (uriToSave) {
        const updatedMedia = [...editedMedia];
        updatedMedia[currentIndex] = { uri: uriToSave };
        setEditedMedia(updatedMedia);
        // Reset editing states
        setFilterType(null);
        setOverlayText('');
        setTextColor('#FFFFFF');
        setTextFontSize(24);
        setIsImageEditorVisible(false);
      } else {
        throw new Error('No URI to save');
      }
    } catch (error) {
      console.error('Image editing error:', error);
      Alert.alert(
        'Error',
        'Failed to save edited image. Please try again.',
        [{ text: 'OK' }],
        { cancelable: false }
      );
    }
  };

  const handleAddText = () => {
    setOverlayText('');
    setTextColor('#FFFFFF');
    setTextFontSize(24);
    setIsTextModalVisible(true);
  };

  const handleApplyFilter = (type) => {
    setFilterType(type);
    setIsFilterModalVisible(false);
  };

  const handleTextDone = () => {
    if (overlayText.trim() === '') {
      Alert.alert('Error', 'Text cannot be empty.', [{ text: 'OK' }], { cancelable: false });
      return;
    }
    setIsTextModalVisible(false);
    // Center the text by resetting pan and scale
    pan.setValue({ x: 0, y: 0 });
    scale.setValue(1);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        {/* Optional: Add other elements to the top header if needed */}
        {/* Removed the Close Button from the Top Header */}
      </View>

      {/* Media Container */}
      <View style={styles.mediaContainer}>
        {renderMedia()}

        {/* Icons Overlay */}
        <View style={styles.iconsOverlay}>
          {/* Close Button on the Far Left */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
          >
            <Image source={CloseIcon} style={styles.icon} />
          </TouchableOpacity>

          {/* Right Side Icons */}
          <View style={styles.rightIcons}>
            {/* Text Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleAddText}
            >
              <Image source={TextIcon} style={styles.icon} />
            </TouchableOpacity>
            {/* Filter Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsFilterModalVisible(true)}
            >
              <Image source={FilterIcon} style={styles.icon} />
            </TouchableOpacity>
            {/* Sticker Button */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                Alert.alert(
                  'Sticker',
                  'Sticker functionality coming soon.',
                  [{ text: 'OK' }],
                  { cancelable: false }
                );
              }}
            >
              <Image source={StickerIcon} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Overlay Text */}
        {overlayText !== '' && (
          <Animated.View
            style={[
              styles.textOverlay,
              {
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { scale: scale },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <Text style={[styles.overlayText, { fontSize: textFontSize, color: textColor }]}>
              {overlayText}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Bottom Header */}
      <View style={styles.bottomHeader}>
        {/* Edit Button */}
        <TouchableOpacity
          onPress={handleEditPress}
          style={styles.editButton}
        >
          <Text style={styles.bottomButtonText}>Edit</Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity
          onPress={handleNextPress}
          style={styles.nextButton}
        >
          <Text style={[styles.bottomButtonText, { color: '#fff' }]}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Video Trimmer Modal */}
      {isTrimmerVisible && (
        <Modal visible={isTrimmerVisible} animationType="slide">
          <View style={styles.trimmerContainer}>
            <Trimmer
              source={{ uri: editedMedia[currentIndex].uri }}
              height={100}
              width={windowWidth}
              onHandleChange={(startTime, endTime) => {
                // Handle trim time changes if needed
              }}
              onTrackerMove={(currentTime) => {
                // Handle tracker movement if needed
              }}
            />
            <View style={styles.trimmerButtons}>
              <TouchableOpacity
                onPress={() => setIsTrimmerVisible(false)}
                style={styles.trimmerButton}
              >
                <Text style={styles.trimmerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  // You can get the trim times from the Trimmer component
                  // For simplicity, we'll use fixed values here
                  trimVideo(0, 10); // Trim from 0 to 10 seconds
                }}
                style={styles.trimmerButton}
              >
                <Text style={styles.trimmerButtonText}>Trim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Image Editor Modal */}
      {isImageEditorVisible && (
        <Modal visible={isImageEditorVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.imageEditorContainer}>
            {/* Edited Image Preview */}
            {renderMedia()}

            {/* Editing Options */}
            <View style={styles.editingOptions}>
              {/* Add Text Button */}
              <TouchableOpacity
                onPress={handleAddText}
                style={styles.optionButton}
              >
                <Text style={styles.optionButtonText}>Add Text</Text>
              </TouchableOpacity>

              {/* Apply Filter Button */}
              <TouchableOpacity
                onPress={() => setIsFilterModalVisible(true)}
                style={styles.optionButton}
              >
                <Text style={styles.optionButtonText}>Apply Filter</Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleImageEdited}
                style={styles.optionButton}
              >
                <Text style={styles.optionButtonText}>Save</Text>
              </TouchableOpacity>
            </View>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setIsImageEditorVisible(false)}
              style={styles.cancelEditButton}
            >
              <Text style={styles.cancelEditButtonText}>Cancel Editing</Text>
            </TouchableOpacity>
          </ScrollView>
        </Modal>
      )}

      {/* Text Overlay Modal */}
      {isTextModalVisible && (
        <Modal visible={isTextModalVisible} animationType="fade" transparent>
          <TouchableWithoutFeedback onPress={handleTextDone}>
            <View style={styles.textModalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.textModalContent}>
                  <Text style={styles.modalTitle}>Add Text</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your text"
                    placeholderTextColor="#888"
                    value={overlayText}
                    onChangeText={setOverlayText}
                    multiline
                    autoFocus
                    onSubmitEditing={handleTextDone}
                  />
                  {/* Text Color Selection */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                    {TEXT_COLORS.map(color => (
                      <TouchableOpacity
                        key={color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color, borderWidth: textColor === color ? 2 : 0 },
                        ]}
                        onPress={() => setTextColor(color)}
                      />
                    ))}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Filter Selection Modal */}
      {isFilterModalVisible && (
        <Modal visible={isFilterModalVisible} animationType="slide" transparent>
          <TouchableWithoutFeedback onPress={() => setIsFilterModalVisible(false)}>
            <View style={styles.filterModalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.filterModalContent}>
                  <Text style={styles.modalTitle}>Select Filter</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                      style={styles.filterOption}
                      onPress={() => handleApplyFilter('grayscale')}
                    >
                      <Text style={styles.filterOptionText}>Grayscale</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.filterOption}
                      onPress={() => handleApplyFilter('sepia')}
                    >
                      <Text style={styles.filterOptionText}>Sepia</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.filterOption}
                      onPress={() => handleApplyFilter('invert')}
                    >
                      <Text style={styles.filterOptionText}>Invert</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.filterOption}
                      onPress={() => handleApplyFilter('brightness')}
                    >
                      <Text style={styles.filterOptionText}>Brightness</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.filterOption}
                      onPress={() => handleApplyFilter('contrast')}
                    >
                      <Text style={styles.filterOptionText}>Contrast</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.filterOption}
                      onPress={() => handleApplyFilter(null)}
                    >
                      <Text style={styles.filterOptionText}>None</Text>
                    </TouchableOpacity>
                  </ScrollView>
                  <TouchableOpacity
                    onPress={() => setIsFilterModalVisible(false)}
                    style={styles.closeFilterButton}
                  >
                    <Text style={styles.closeFilterButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark gray background
  },
  topHeader: {
    height: Platform.OS === 'ios' ? 60 : 50, // Adjust height based on platform
    backgroundColor: '#121212', // Dark gray background
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'ios' ? 20 : 0, // Adjust for notch/status bar
  },
  // Removed closeButton from topHeader

  icon: {
    width: 24,
    height: 24,
    tintColor: '#ffffff', // White icons
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Needed for absolutely positioned icons overlay
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  viewShot: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  iconsOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1, // Ensure icons are above the media
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    borderRadius: 20,
    padding: 5,
  },
  rightIcons: {
    flexDirection: 'row',
  },
  textOverlay: {
    position: 'absolute',
    // Optional: Centering can be managed by setting initial pan values
  },
  overlayText: {
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomHeader: {
    height: Platform.OS === 'ios' ? 60 : 50, // Adjust height based on platform
    backgroundColor: '#121212', // Dark gray background
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Adjust for home indicator
  },
  editButton: {
    padding: 10,
    backgroundColor: '#4d4d4d',
    borderRadius: 10,
  },
  nextButton: {
    padding: 10,
    backgroundColor: '#007AFF', // Blue color
    borderRadius: 10,
  },
  bottomButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  trimmerContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  trimmerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    width: '100%',
  },
  trimmerButton: {
    padding: 10,
    backgroundColor: '#4d4d4d',
    borderRadius: 5,
    width: 100,
    alignItems: 'center',
  },
  trimmerButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  imageEditorContainer: {
    flexGrow: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  editingOptions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  optionButton: {
    marginHorizontal: 10,
    padding: 15,
    backgroundColor: '#4d4d4d',
    borderRadius: 10,
  },
  optionButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  cancelEditButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ff4d4d',
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelEditButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  textModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  textModalContent: {
    width: '85%',
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  textInput: {
    height: 80,
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 5,
    color: '#fff',
    paddingHorizontal: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#444',
  },
  colorScroll: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  filterModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)', // Semi-transparent background
  },
  filterModalContent: {
    width: '100%',
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterOption: {
    padding: 10,
    backgroundColor: '#4d4d4d',
    borderRadius: 5,
    marginHorizontal: 5,
    marginVertical: 5,
  },
  filterOptionText: {
    color: '#fff',
    fontSize: 16,
  },
  closeFilterButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ff4d4d',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeFilterButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PostDetails;