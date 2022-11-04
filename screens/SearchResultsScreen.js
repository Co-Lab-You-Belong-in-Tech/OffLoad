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
  useWindowDimensions,
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
import ChevronRight from "../assets/journalScreen/Chevron-Right.svg";

const SearchResultsScreen = ({ route, navigation }) => {
  const searchResults = JSON.parse(JSON.stringify(route.params.searchResults));
  const { width } = useWindowDimensions();

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
                        backgroundColor: "#EBEBEB",
                        borderWidth: 1,
                        borderColor: "#B7B7B7",
                        padding: 10,
                        borderRadius: 10,
                        marginBottom: 20,
                        margin: 10,
                        marginTop: 0,
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          fontFamily: "titan",
                          fontSize: width / 20 >= 20 ? 20 : width / 20,
                          paddingRight: 15,
                          color: "#3131C9",
                        }}
                      >
                        {entry.title}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "inter",
                          color: "#A49B9C",
                          fontSize: 12,
                          marginTop: 7,
                        }}
                      >
                        {moment(entry.date).fromNow()}
                      </Text>
                      {/* <Text>{entry.note}</Text> */}
                    </View>
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: 15,
                        transform: [{ translateY: -22 }],
                      }}
                    >
                      <ChevronRight width={25} height={25} />
                    </TouchableOpacity>
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
