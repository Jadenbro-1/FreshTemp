// App.js
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// Import necessary packages
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { getDBConnection, createTables } from './src/db';
import { MealPlanProvider } from './src/MealPlanContext';
import { UserProvider } from './src/UserContext';

// Import your existing screens/components
import Login from './src/Login';
import Register from './src/Register';
import Home from './src/Home';
import Nutritionist from './src/Nutritionist';
import Pantry from './src/Pantry';
import MealPlanner from './src/MealPlanner';
import MyProfile from './src/MyProfile';
import GroceryPlanner from './src/GroceryPlanner';
import ExpiringSoon from './src/ExpiringSoon';
import WeeklyMealPlan from './src/WeeklyMealPlan';
import RecipeDetails from './src/RecipeDetails';
import StartCooking from './src/StartCooking';
import VideoPlayerScreen from './src/VideoPlayerScreen';
import CustomizeMealPlan from './src/CustomizeMealPlan';
import UserDashboard from './src/UserDashboard';
import Upload from './src/Upload';
import MealPreview from './src/MealPreview';
import ReceiptCameraScreen from './src/ReceiptCameraScreen';
import PostDetails from './src/PostDetails';
import Messenger from './src/Messenger'; // Adjust the path if necessary
import ChatScreen from './src/ChatScreen';

// Import the Settings and EditProfile screens
import Settings from './src/Settings';
import EditProfile from './src/EditProfile';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    const initDB = async () => {
      try {
        const db = await getDBConnection();
        await createTables(db);
      } catch (error) {
        console.error('Error initializing database:', error.message);
      }
    };
    initDB();
  }, []);

  return (
    <UserProvider>
      <MealPlanProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{
                headerShown: false,
                animationEnabled: false, // Disabled animations globally
              }}
            >
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Register" component={Register} />
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Nutritionist" component={Nutritionist} />
              <Stack.Screen name="Pantry" component={Pantry} />
              <Stack.Screen name="MealPlanner" component={MealPlanner} />
              <Stack.Screen name="MyProfile" component={MyProfile} />
              <Stack.Screen name="GroceryPlanner" component={GroceryPlanner} />
              <Stack.Screen name="ExpiringSoon" component={ExpiringSoon} />
              <Stack.Screen name="RecipeDetails" component={RecipeDetails} />
              <Stack.Screen name="WeeklyMealPlan" component={WeeklyMealPlan} />
              <Stack.Screen name="CustomizeMealPlan" component={CustomizeMealPlan} />
              <Stack.Screen name="UserDashboard" component={UserDashboard} />
              <Stack.Screen name="StartCooking" component={StartCooking} />
              <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
              <Stack.Screen name="Upload" component={Upload} />
              <Stack.Screen name="MealPreview" component={MealPreview} />
              <Stack.Screen name="ReceiptCameraScreen" component={ReceiptCameraScreen} />
              <Stack.Screen name="PostDetails" component={PostDetails} />
              <Stack.Screen name="Messenger" component={Messenger} />
              <Stack.Screen name="ChatScreen" component={ChatScreen} />
              {/* Add the Settings and EditProfile screens */} 
              <Stack.Screen name="Settings" component={Settings} />
              <Stack.Screen name="EditProfile" component={EditProfile} />
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </MealPlanProvider>
    </UserProvider>
  );
};

export default App;