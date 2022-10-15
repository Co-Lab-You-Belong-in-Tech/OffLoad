import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Button,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
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

let recording;
let soundObject;
let intervalId;
const timing = 1000;

const ProfileScreen = ({ navigation }) => {
  // Helper function for logging out user
  const signOutHandler = async () => {
    console.log("pressed");
    await GoogleSignin.revokeAccess();
    auth()
      .signOut()
      .then(() => console.log("logged out"))
      .catch((err) => console.log(err));
  };

  return (
    <View style={tw`flex-1`}>
      {/* Modal for user's audio title */}
      {/* Profile Screen */}
      <ScrollView style={tw` flex-1 bg-blue-100 p-3 px-4`}>
        {/* header image and text container */}
        <HeaderHome signOut={signOutHandler} />

        <View style={tw` w-1/2 mt-10`}>
          <Text style={tw`py-2 text-lg font-bold text-left text-gray-500`}>
            Hi {auth()._user.displayName.split(" ")[0]}!
          </Text>

          <Text style={tw`text-gray-500 font-semibold text-base`}>Profile</Text>
        </View>
        {/* end */}
      </ScrollView>
      <Nav navigation={navigation} />
    </View>
  );
};

export default ProfileScreen;
