import { useState, useEffect, useMemo } from "react";
import LoginScreen from "./screens/loginScreen";
// import LoadingScreen from "./screens/loadingScreen";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "./screens/WelcomeScreen";
import EmojiScreen from "./screens/EmojiScreen";
import HomeScreen from "./screens/homeScreen";
import LogsScreen from "./screens/LogsScreen";
import CalendarScreen from "./screens/CalendarScreen";
import JournalScreen from "./screens/JournalScreen";
import NoteScreen from "./screens/NoteScreen";
import SearchResultsScreen from "./screens/SearchResultsScreen";
import ProfileScreen from "./screens/ProfileScreen";

import * as FileSystem from "expo-file-system";

// imports for integration with firebase
import "expo-dev-client";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

// redux imports
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ScrollView } from "react-native-web";
import tw from "tailwind-react-native-classnames";
import { useFonts } from "expo-font";
// import TestRecord from "./screens/TestRecord";

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const checkStorage = async () => {
    const file = FileSystem.readDirectoryAsync();
  };

  GoogleSignin.configure({
    webClientId:
      "985628169597-hvqtufhr1or0f71b2udo27ontcv8s130.apps.googleusercontent.com",
  });

  const onAuthStateChanged = (user) => {
    setUser(user);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

    return subscriber;
  }, []);

  const Stack = createNativeStackNavigator();
  const navigationRef = useNavigationContainerRef();

  const [isLoaded] = useFonts({
    inter: require("./assets/fonts/Inter-VariableFont.ttf"),
    titan: require("./assets/fonts/TitanOne-Regular.ttf"),
  });

  return (
    <Provider store={store}>
      <>
        {!user ? (
          <LoginScreen />
        ) : (
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator>
              <Stack.Screen
                name="welcome"
                component={WelcomeScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="emoji"
                component={EmojiScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="home"
                component={HomeScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="logs"
                component={LogsScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="calendar"
                component={CalendarScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="journal"
                component={JournalScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="note"
                component={NoteScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="search"
                component={SearchResultsScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="profile"
                component={ProfileScreen}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        )}
      </>
    </Provider>
  );
}
