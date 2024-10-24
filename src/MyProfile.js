// MyProfile.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Navbar from './Navbar'; // Ensure Navbar is correctly imported

const { width } = Dimensions.get('window');

const MyProfile = () => {
  const navigation = useNavigation();
  const userId = 1; // Hardcoded userId

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [isFollowing, setIsFollowing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/user/${userId}/profile`
      );
      const profileData = response.data;
      setProfile(profileData);

      setUser({
        first_name: profileData.name.split(' ')[0],
        last_name: profileData.name.split(' ')[1] || '',
        profile_pic_url: profileData.profile_pic_url,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  // Function to fetch media data
  const fetchMediaData = async () => {
    try {
      const response = await axios.get(
        'https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/media'
      );
      const data = response.data.map((video) => ({
        ...video,
        url: video.url.startsWith('http')
          ? video.url.replace('http://', 'https://')
          : video.url,
      }));
      setVideos(data);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data when the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [userId])
  );

  // Fetch media data on component mount
  useEffect(() => {
    fetchMediaData();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    await fetchMediaData();
    setRefreshing(false);
  };

  // Helper function to chunk videos into rows of 3
  const chunkVideos = (videosList, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < videosList.length; i += chunkSize) {
      chunks.push(videosList.slice(i, i + chunkSize));
    }
    return chunks;
  };

  // Show loading indicator while fetching data
  if (loading || !user || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  // Header Component
  const Header = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerUsername}>
            {user.first_name} {user.last_name}
          </Text>
          <Image source={require('../assets/dropdown.png')} style={styles.headerIcon} />
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('AddContent')}
          >
            <Image source={require('../assets/plus.png')} style={styles.enlargedHeaderIcon} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Image source={require('../assets/settings.png')} style={styles.enlargedHeaderIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfoContainer}>
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <Image
            source={
              user.profile_pic_url
                ? { uri: user.profile_pic_url }
                : require('../assets/profilepic.jpg')
            }
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.first_name} {user.last_name}
            </Text>
            <Text style={styles.userHandle}>@{profile.username}</Text>
            <View style={styles.userStats}>
              <Text style={styles.userStatText}>Master Chef</Text>
              <Text style={styles.dotSeparator}>·</Text>
              <Text style={styles.followersText}>0 followers</Text>
            </View>
          </View>
        </View>
        <Text style={styles.bioText}>{profile.bio}</Text>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.subscribeButton]}>
            <Text style={styles.subscribeButtonText}>Subscribe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.followButton]}
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <Text style={styles.followButtonText}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.messageButton]}>
            <Text style={styles.messageButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('videos')}
          style={styles.tabItem}
        >
          <Image
            source={require('../assets/videos2.png')} // Updated icon path
            style={[styles.tabIcon, activeTab === 'videos' && styles.activeTabIcon]}
          />
          {activeTab === 'videos' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('posts')}
          style={styles.tabItem}
        >
          <Image
            source={require('../assets/book.png')} // Updated icon path
            style={[styles.tabIcon, activeTab === 'posts' && styles.activeTabIcon]}
          />
          {activeTab === 'posts' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('about')}
          style={styles.tabItem}
        >
          <Image
            source={require('../assets/login2.png')} // Updated icon path
            style={[styles.tabIcon, activeTab === 'about' && styles.activeTabIcon]}
          />
          {activeTab === 'about' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* iOS-style status bar */}
      <View style={styles.statusBar} />

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Header />

        {/* Conditional Rendering Based on Active Tab */}
        {activeTab === 'videos' && (
          <View style={styles.videosContainer}>
            {chunkVideos(videos, 3).map((row, rowIndex) => (
              <View key={rowIndex} style={styles.videoRow}>
                {row.map((video) => (
                  <TouchableOpacity
                    key={video.media_id}
                    style={styles.videoContainer}
                    onPress={() =>
                      navigation.navigate('VideoPlayer', {
                        videoUrl: video.url,
                        username: `${user.first_name}-${user.last_name}`,
                        profilePic: user.profile_pic_url,
                        description: video.description || 'No description available',
                        comments: video.comments || [],
                        isFavorite: video.isFavorite || false,
                        isSubscribed: video.isSubscribed || false,
                      })
                    }
                  >
                    {video.url ? (
                      <>
                        <Image
                          source={{ uri: video.thumbnail_url || video.url }}
                          style={styles.videoThumbnail}
                        />
                        <View style={styles.overlay}>
                          <Image
                            source={require('../assets/play.png')}
                            style={styles.playButton}
                          />
                          <Text style={styles.viewsText}>0</Text>
                        </View>
                      </>
                    ) : (
                      <Text style={styles.invalidVideoText}>Invalid video URL</Text>
                    )}
                  </TouchableOpacity>
                ))}
                {/* If the last row has less than 3 videos, fill the space */}
                {row.length < 3 &&
                  Array.from({ length: 3 - row.length }).map((_, index) => (
                    <View key={`empty-${index}`} style={styles.videoContainer} />
                  ))}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'posts' && (
          <View style={styles.postsContainer}>
            {/* Implement posts grid here */}
            <Text style={styles.placeholderText}>{user.first_name}'s Recipe Book will appear here.</Text>
          </View>
        )}

        {activeTab === 'about' && (
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitle}>About {user.first_name}</Text>
            <Text style={styles.aboutParagraph}>{profile.bio}</Text>
            <Text style={styles.aboutSubtitle}>Specialties:</Text>
            <View style={styles.specialtiesContainer}>
              {profile.specialties && profile.specialties.length > 0 ? (
                profile.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyBadge}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.placeholderText}>No specialties listed.</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navbar */}
      <Navbar currentScreen="MyProfile" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // bg-gray-50
  },
  statusBar: {
    backgroundColor: '#FFFFFF', // bg-white
    height: 44, // Approximate height of iOS status bar
    width: '100%',
  },
  scrollContent: {
    paddingBottom: 60, // To ensure content is above the Navbar
  },
  header: {
    backgroundColor: '#FFFFFF', // bg-white
    paddingHorizontal: 16, // px-4
    paddingVertical: 8, // py-2
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Shadow styles
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerUsername: {
    fontSize: 18, // text-lg
    fontWeight: '600', // font-semibold
    marginRight: 4, // mr-1
    color: '#38BDF8', // text-sky-500
    fontFamily: 'Cochin'
  },
  headerIcon: {
    width: 16, // h-4
    height: 16, // w-4
    tintColor: '#38BDF8', // text-sky-500
  },
  enlargedHeaderIcon: {
    width: 24, // Increased size
    height: 24,
    tintColor: '#38BDF8',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    marginLeft: 16,
  },
  profileInfoContainer: {
    backgroundColor: '#FFFFFF', // bg-white
    paddingHorizontal: 16, // px-4
    paddingVertical: 24, // py-6
    // Removed marginTop to connect header and profile info seamlessly
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // mb-4
  },
  avatar: {
    width: 80, // h-20
    height: 80, // w-20
    borderRadius: 40,
    marginRight: 16, // mr-4
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20, // text-xl
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-800
  },
  userHandle: {
    color: '#4B5563', // text-gray-600
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4, // mt-1
  },
  userStatText: {
    fontSize: 14, // text-sm
    color: '#38BDF8', // text-sky-500
    fontWeight: '500', // font-medium
            fontFamily: 'Cochin'
  },
  dotSeparator: {
    marginHorizontal: 8, // mx-2
    color: '#9CA3AF', // text-gray-400
  },
  followersText: {
    fontSize: 14, // text-sm
    color: '#4B5563', // text-gray-600
  },
  bioText: {
    fontSize: 14, // text-sm
    color: '#374151', // text-gray-700
    marginBottom: 16, // mb-4
    textAlign: 'center',
    
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8, // Reduced padding for smaller buttons
    borderRadius: 8,
    alignItems: 'center',
  },
  subscribeButton: {
    backgroundColor: '#38BDF8', // bg-sky-500
    
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16, // Reduced font size
        fontFamily: 'Cochin'
  },
  followButton: {
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  followButtonText: {
    color: '#38BDF8',
    fontWeight: '600',
    fontSize: 16, // Reduced font size
        fontFamily: 'Cochin'
  },
  messageButton: {
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  messageButtonText: {
    color: '#38BDF8',
    fontWeight: '600',
    fontSize: 16, // Reduced font size
        fontFamily: 'Cochin'
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabItem: {
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabIcon: {
    width: 24,
    height: 24,
    tintColor: '#38BDF8',
  },
  activeTabIcon: {
    tintColor: '#0369A1', // text-sky-700
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 2,
    backgroundColor: '#0369A1',
    borderRadius: 1,
  },
  videosContainer: {
    paddingHorizontal: 0, // To compensate for videoContainer margins
    marginTop: 4,
    marginBottom: 12,
  },
  videoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  videoContainer: {
    width: (width - 12) / 3, // 3 columns with total horizontal margin of 12 (4 per video: 2 left + 2 right)
    height: ((width - 12) / 3) * (16 / 9), // Maintain 16:9 aspect ratio
    margin: 2,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
    marginRight: 4,
  },
  viewsText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  invalidVideoText: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
  },
  postsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24, // Adjusted to ensure content is directly under buttons
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center', // Centered text
    marginTop: 20,
  },
  aboutContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24, // Adjusted to ensure content is directly under buttons
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  aboutParagraph: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 16,
  },
  aboutSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    color: '#1F2937',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyProfile;