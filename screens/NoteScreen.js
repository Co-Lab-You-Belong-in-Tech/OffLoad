import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import tw from "tailwind-react-native-classnames";
import moment from "moment";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import * as FileSystem from "expo-file-system";
import firebase from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";
import Nav from "../shared/Nav";
import NavTop from "../shared/NavTop";
import { Audio } from "expo-av";
import showTime from "../helpers/showTime";
import HeaderHome from "../shared/HeaderHome";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { fileSeperator } from "../constants/fileSeperator";
import { useDispatch, useSelector } from "react-redux";
import { resetScreen, setScreen } from "../store/appSlice";
import { TextInput } from "react-native-gesture-handler";

const NoteScreen = ({ route, navigation }) => {
  const title = JSON.parse(JSON.stringify(route.params.title));
  const date = JSON.parse(JSON.stringify(route.params.date));
  const note = JSON.parse(JSON.stringify(route.params.note));

  const handleDate = useMemo(() => {
    let str = moment(date).format("MMMM Do YYYY, h:mm:ss a");
    if (
      moment(date).format("MMMM Do YYYY") ===
      moment(new Date()).format("MMMM Do YYYY")
    ) {
      return moment(date).fromNow();
    } else {
      if (str.includes("pm")) {
        return str.replace("pm", "PM");
      } else {
        return str.replace("am", "AM");
      }
    }
  }, [date]);

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
        {/* Note Screen */}

        {/* Back Button */}
        <NavTop type="Back" times={1} navigation={navigation} />

        {/* Note screen Content*/}
        <View style={{ flex: 1, padding: 10 }}>
          <Text style={{ color: "#3131C9", fontFamily: "titan", fontSize: 24 }}>
            {title}
          </Text>
          <Text
            style={{
              fontFamily: "inter",
              fontSize: 16,
              marginTop: 10,
              color: "rgba(0, 0, 0, 0.5)",
            }}
          >
            {handleDate}
          </Text>
          <Text
            style={{
              flex: 1,
              borderRadius: 10,
              overflow: "visible",
              marginTop: 10,
              fontFamily: "inter",
              fontSize: 16,
              marginTop: 10,
            }}
          >
            {note}
          </Text>
        </View>
        <Nav navigation={navigation} />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default NoteScreen;
