import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "tailwind-react-native-classnames";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-community/async-storage";
import Nav from "../shared/Nav";
import { ScrollView } from "react-native";

import { useDispatch, useSelector } from "react-redux";
import { setScreen, resetScreen } from "../store/appSlice";
import NavTop from "../shared/NavTop";
import { StatusBar } from "expo-status-bar";

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const { currentScreen } = useSelector((state) => state.app);
  const { width } = useWindowDimensions();

  // Helper function for logging out user
  const signOutHandler = async () => {
    console.log("pressed");
    await GoogleSignin.revokeAccess();
    auth()
      .signOut()
      .then(() => console.log("logged out"))
      .catch((err) => console.log(err));
  };

  const resetOnboardingScreen = async () => {
    try {
      const value = await AsyncStorage.removeItem("@viewedOnboarding");
    } catch (error) {
      console.log("can't remove item");
    }
  };

  // Set current screen on screen load
  useEffect(() => {
    dispatch(setScreen("profile"));

    return () => {
      dispatch(resetScreen());
    };
  }, [currentScreen]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/nav/background.png")}
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          resizeMode: "contain",
        }}
      >
        <View style={tw`flex-1`}>
          {/* Modal for user's audio title */}
          <StatusBar style="light" translucent={false} />
          <NavTop
            type="Back"
            navigation={navigation}
            location="emoji"
            times={1}
          />

          {/* Home Screen */}
          {/* header image and text container */}
          {/* {<HeaderHome signOut={signOutHandler} />} */}
          <Text onPress={resetOnboardingScreen} style={styles.header}>
            Settings
          </Text>
          <View
            style={[
              styles.avatarContainer,
              { width: width / 2, height: width / 2 },
            ]}
          >
            {auth()._user?.photoURL ? (
              <Image
                style={styles.avatar}
                source={{ uri: auth()._user?.photoURL }}
              />
            ) : (
              <Text>
                {auth()
                  ._user.displayName.split(" ")
                  .map((name, i, names) => {
                    return (
                      <Text
                        style={[
                          styles.placeholder,
                          { fontSize: 200 / (names.length + 0.5) },
                        ]}
                        key={i}
                      >
                        {name[0]}
                      </Text>
                    );
                  })}
              </Text>
            )}
          </View>
          <ScrollView style={tw` flex-1`}>
            <View style={styles.details}>
              <Text style={styles.title}>Name</Text>
              <Text style={styles.value}>{auth()._user.displayName}</Text>
            </View>
            <View style={styles.details}>
              <Text style={styles.title}>Email</Text>
              <Text style={styles.value}>{auth()._user.email}</Text>
            </View>
            <View style={styles.details}>
              <Text style={styles.title}>Languages</Text>
              <Text style={styles.value}>English</Text>
            </View>
            <TouchableOpacity onPress={signOutHandler}>
              <View style={[styles.details, { marginTop: 30 }]}>
                <Text style={styles.value}>Sign Out</Text>
              </View>
            </TouchableOpacity>

            {/* end */}
          </ScrollView>
          <Nav navigation={navigation} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    fontFamily: "inter",
    fontSize: 20,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
  },
  avatarContainer: {
    maxHeight: 200,
    maxWidth: 200,
    minHeight: 150,
    minWidth: 150,
    backgroundColor: "#3131C9",
    borderRadius: 100,
    alignSelf: "center",
    marginVertical: 30,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    color: "white",
    fontFamily: "inter",
  },
  details: {
    alignItems: "flex-start",
    padding: 10,
  },
  title: {
    fontFamily: "inter",
    fontSize: 12,
    fontWeight: "300",
    color: "rgba(0, 0, 0, 0.5)",
    textAlign: "center",
  },
  value: {
    fontFamily: "inter",
    fontSize: 16,
    fontWeight: "500",
    color: "black",
    textAlign: "center",
  },
});

export default ProfileScreen;
