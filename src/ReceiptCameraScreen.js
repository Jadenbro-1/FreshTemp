// ReceiptCameraScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { useNavigation } from '@react-navigation/native';

const ReceiptCameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = React.useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to scan receipts.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        // iOS automatically grants camera permissions upon installation
        setHasPermission(true);
      }
    })();
  }, []);

  const handleCapturePhoto = async () => {
    if (cameraRef.current) {
      setIsProcessing(true);
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);

      // Send the photo to the backend
      const formData = new FormData();
      formData.append('receiptImage', {
        uri: data.uri,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      });

      try {
        const response = await fetch('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/process-receipt', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();

        if (result.error) {
          if (result.unreadableItems && result.unreadableItems.length > 0) {
            // Alert the user to retake the picture due to unreadable items
            Alert.alert(
              'Unreadable Items',
              'Some items were unreadable. Please retake a picture of the receipt.',
              [
                { text: 'Retake', onPress: () => setIsProcessing(false) },
              ],
            );
          } else {
            console.error('Error from backend:', result.error);
            setIsProcessing(false);
          }
        } else {
          // Ask if the user wants to add another receipt or proceed
          Alert.alert(
            'Receipt Captured',
            'Would you like to capture another receipt or proceed?',
            [
              {
                text: 'Capture Another',
                onPress: () => setIsProcessing(false), // Allow user to take another picture
              },
              {
                text: 'Proceed',
                onPress: () => navigation.navigate('Pantry', { receiptItems: result.receiptItems }), // Navigate back with the data
              },
            ],
          );
        }
      } catch (error) {
        console.error('Error sending image to backend:', error);
        setIsProcessing(false);
      }
    }
  };

  // Function to handle closing the camera screen
  const handleClose = () => {
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No access to camera.</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isProcessing) {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Processing the receipt...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Close Button */}
      <TouchableOpacity style={styles.topLeftButton} onPress={handleClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
      >
        {/* Wireframe overlay */}
        <View style={styles.overlay}>
          <View style={styles.wireframe} />
        </View>
        <TouchableOpacity style={styles.captureButton} onPress={handleCapturePhoto}>
          <Text style={styles.captureButtonText}>Capture Receipt</Text>
        </TouchableOpacity>
      </RNCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wireframe: {
    width: '60%',
    height: '70%',
    borderWidth: 2,
    borderColor: '#fff',
  },
  captureButton: {
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
  },
  captureButtonText: {
    color: '#000',
    fontSize: 16,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#0EA5E9',
    padding: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  topLeftButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
  },
});

export default ReceiptCameraScreen;