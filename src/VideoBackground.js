import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Video from 'react-native-video';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const videoUrls = [
  'https://res.cloudinary.com/dsogljpr4/video/upload/v1720396597/Login/Video1.mp4',
  'https://res.cloudinary.com/dsogljpr4/video/upload/v1720396597/Login/Video2.mp4',
  'https://res.cloudinary.com/dsogljpr4/video/upload/v1720396597/Login/Video3.mp4',
  'https://res.cloudinary.com/dsogljpr4/video/upload/v1720396597/Login/Video4.mp4',
];

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const VideoBackground = ({ children }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(getRandomInt(0, videoUrls.length - 1));
  const videoRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextVideoIndex = getRandomInt(0, videoUrls.length - 1);
      setCurrentVideoIndex(nextVideoIndex);
    }, 10000); // Switch video every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const onEnd = () => {
    const nextVideoIndex = getRandomInt(0, videoUrls.length - 1);
    setCurrentVideoIndex(nextVideoIndex);
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrls[currentVideoIndex] }}
        style={styles.backgroundVideo}
        resizeMode="cover"
        repeat={true}
        onEnd={onEnd}
        playInBackground={false}
        playWhenInactive={false}
      />
      <View style={styles.overlay}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: screenHeight,
    width: screenWidth,
  },
  backgroundVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add overlay if needed
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoBackground;
