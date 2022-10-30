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
  TextInput,
  BackHandler,
  Alert,
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

const SearchResultsScreen = ({ route, navigation }) => {
  const searchResults = JSON.parse(JSON.stringify(route.params.searchResults));

  const dispatch = useDispatch();

  const { currentScreen } = useSelector((state) => state.app);

  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState([]);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [showActivityIndicator, setShowActivityIndicator] = useState(false);
  const [activityText, setActivityText] = useState("");

  const handleResultText = useMemo(() => {
    if (searchResults.length <= 0) {
      return "No results found.";
    } else if (searchResults.length === 1) {
      return "1 result found.";
    } else {
      return `${searchResults.length} results found`;
    }
  }, []);

  useEffect(() => {
    dispatch(setScreen("journal"));
    // resetEmojis();

    return () => {
      dispatch(resetScreen());
    };
  }, [currentScreen]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Activity Indicator*/}
      <ImageBackground
        source={require("../assets/nav/background.png")}
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          resizeMode: "contain",
        }}
      >
        {/* Journal Screen */}

        {/* Journal screen Content*/}
        <View
          style={{
            flex: 1,
            width: "100%",
          }}
        >
          {/* Back Button */}
          <NavTop type="Back" times={1} navigation={navigation} />

          {/* Journal screen header */}
          <View
            style={{
              marginTop: 10,
              marginHorizontal: 10,
            }}
          >
            <Text
              style={{ fontFamily: "titan", fontSize: 32, color: "#3131C9" }}
            >
              Search Results
            </Text>
          </View>

          {/* Body */}
          <Text
            style={{
              fontFamily: "inter",
              fontSize: 16,
              marginTop: 10,
              color: "rgba(0, 0, 0, 0.5)",
              marginHorizontal: 10,
            }}
          >
            {handleResultText}
          </Text>

          {searchResults.length > 0 && (
            <ScrollView
              style={{
                flex: 1,
                borderRadius: 10,
                overflow: "visible",
                marginTop: 10,
              }}
            >
              {searchResults.map((entry, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      navigation.navigate("note", entry);
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "white",
                        padding: 10,
                        borderRadius: 10,
                        marginBottom: 20,
                        elevation: 0,
                        shadowColor: "#bababa",
                        shadowOffset: 5,
                        shadowOpacity: 0.5,
                        shadowRadius: 5,
                        margin: 10,
                        marginTop: 0,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "inter",
                          color: "rgba(0, 0, 0, 0.5)",
                        }}
                      >
                        {moment(entry.date).fromNow()}
                      </Text>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          fontFamily: "titan",
                          fontSize: 16,
                          paddingRight: 5,
                          color: "#3131C9",
                        }}
                      >
                        {entry.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
        <Nav navigation={navigation} />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default SearchResultsScreen;
