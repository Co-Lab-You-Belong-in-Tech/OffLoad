import { useState, useEffect, useMemo } from "react";
import LoginScreen from "./screens/loginScreen";
// import LoadingScreen from "./screens/loadingScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/homeScreen";

// imports for integration with firebase
import "expo-dev-client";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

// redux imports
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ScrollView } from "react-native-web";
import tw from "tailwind-react-native-classnames";
// import TestRecord from "./screens/TestRecord";

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  GoogleSignin.configure({
    webClientId:
      "846127441207-ilopm6jioq4cn3vderftfs3fsmonbfmv.apps.googleusercontent.com",
  });

  const onAuthStateChanged = (user) => {
    setUser(user);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

    return subscriber;
  }, []);

  const Stack = createNativeStackNavigator();

  return (
    <Provider store={store}>
      <>
        {!user ? (
          <LoginScreen />
        ) : (
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="home"
                component={HomeScreen}
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
