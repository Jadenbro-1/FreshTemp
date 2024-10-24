import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import axios from 'axios';
import { UserContext } from './UserContext';  // Import UserContext
import AsyncStorage from '@react-native-async-storage/async-storage';  // Import AsyncStorage
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';  // Import biometrics

const rnBiometrics = new ReactNativeBiometrics();
const screenWidth = Dimensions.get('window').width;

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const { setCurrentUser } = useContext(UserContext);  // Destructure setCurrentUser from UserContext

  // Check for user token when component mounts
  useEffect(() => {
    const checkUserToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          // Optionally, validate the token with your server here
          navigation.navigate('Home');
        }
      } catch (e) {
        console.error('Failed to fetch the user token', e);
      }
    };

    checkUserToken();
  }, []);

  // Function to handle Face ID Authentication
  const handleFaceIDAuth = async () => {
    try {
      const { available, biometryType, error } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        Alert.alert('Error', `Biometrics not available: ${error || 'Not available'}`);
        return;
      }

      if (biometryType === BiometryTypes.FaceID) {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: 'Confirm Face ID authentication',
        });

        if (success) {
          Alert.alert('Success', 'Face ID authentication successful');
          handleLogin(); // Proceed with login after Face ID authentication
        } else {
          Alert.alert('Error', 'Face ID authentication failed');
        }
      } else if (biometryType === BiometryTypes.TouchID) {
        Alert.alert('Error', 'Touch ID detected. Please use Face ID to log in.');
      } else {
        Alert.alert('Error', 'Biometrics type not supported for Face ID.');
      }
    } catch (error) {
      Alert.alert('Error', `Face ID authentication error: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
  
    try {
      console.log('Attempting login with email:', email);
      const response = await axios.post('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/login', { email, password });
      console.log('Login response:', response.data);
  
      // Check if the response contains the necessary user information (id, email, etc.)
      if (response.data && response.data.id) {
        console.log('User data:', response.data);
  
        // Assuming you want to save the entire user object, you can store the user data in AsyncStorage
        setCurrentUser(response.data);  // Set the user data in context
        await AsyncStorage.setItem('userToken', JSON.stringify(response.data)); // Store the user object in AsyncStorage
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      Alert.alert('Error', 'Invalid username or password.');
    }
  };

  // Function to handle Sign Up (if applicable)
  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await axios.post('https://fresh-ios-c3a9e8c545dd.herokuapp.com/api/signup', { name, email, password });
      if (response.data && response.data.token) {
        setCurrentUser(response.data);
        await AsyncStorage.setItem('userToken', response.data.token); // Store the token
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Sign up failed. Please try again.');
      }
    } catch (error) {
      console.error('Error during sign up:', error.message);
      Alert.alert('Error', 'Could not sign up. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Login'}</Text>

          {isSignUp && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name</Text>
              <View style={styles.inputWrapper}>
                <Image
                  source={require('/Users/jadenbro1/FreshTemp/assets/login.png')}
                  style={[styles.icon, { tintColor: '#333' }]}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={(text) => setName(text)}
                />
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/mail.png')}
                style={[styles.icon, { tintColor: '#333' }]}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/lock.png')}
                style={[styles.icon, { tintColor: '#333' }]}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity onPress={isSignUp ? handleSignUp : handleLogin} style={styles.button}>
            <Text style={styles.buttonText}>
              {isSignUp ? 'Sign Up' : 'Log In'}
            </Text>
          </TouchableOpacity>

          {/* Updated Face ID button with icon */}
          {!isSignUp && (
            <TouchableOpacity onPress={handleFaceIDAuth} style={styles.faceIDButton}>
              <Image
                source={require('/Users/jadenbro1/FreshTemp/assets/faceid.png')}
                style={styles.faceIDIcon}
              />
              <Text style={styles.faceIDButtonText}>Face ID</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.switchText}>
            {isSignUp
              ? 'Already have an account? '
              : "Don't have an account? "}
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.linkText}>
                {isSignUp ? 'Log in' : 'Sign up'}
              </Text>
            </TouchableOpacity>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  faceIDButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
    marginBottom: 10,
  },
  faceIDIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#fff',
  },
  faceIDButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  linkText: {
    color: '#28a745',
    fontWeight: 'bold',
  },
});

export default Login;