import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Button,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useCallback, useState } from "react";
import tw from "tailwind-react-native-classnames";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import * as FileSystem from "expo-file-system";
import firebase from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";
import Nav from "../shared/Nav";
import {
  Octicons,
  Feather,
  Entypo,
  FontAwesome5,
  Ionicons,
  Fontisto,
} from "@expo/vector-icons";
import { Audio } from "expo-av";
import { ScrollView, Modal } from "react-native";
import HeaderHome from "../shared/HeaderHome";

import { useDispatch, useSelector } from "react-redux";
import { setScreen, resetScreen } from "../store/appSlice";
import NavTop from "../shared/NavTop";
import { StatusBar } from "expo-status-bar";

let recording;
let soundObject;
let intervalId;
const timing = 1000;

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const { currentScreen } = useSelector((state) => state.app);

  // Helper function for logging out user
  const signOutHandler = async () => {
    console.log("pressed");
    await GoogleSignin.revokeAccess();
    auth()
      .signOut()
      .then(() => console.log("logged out"))
      .catch((err) => console.log(err));
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
          <ScrollView style={tw` flex-1`}>
            {/* header image and text container */}
            {<HeaderHome signOut={signOutHandler} />}
            <View style={tw` w-1/2 mt-2 px-4`}>
              <Text
                style={tw.style("py-2", "text-lg", "text-left", {
                  fontFamily: "inter",
                })}
              >
                Hi {auth()._user.displayName.split(" ")[0]}!
              </Text>

              <Text
                style={tw.style("font-semibold", "text-base", {
                  fontFamily: "inter",
                })}
              >
                Profile
              </Text>
            </View>

            {/* end */}
          </ScrollView>
          <Nav navigation={navigation} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ProfileScreen;
