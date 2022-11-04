import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  TextInput,
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
import Search from "../assets/journalScreen/Search.svg";
import Pencil from "../assets/journalScreen/Pencil.svg";
import ChevronRight from "../assets/journalScreen/Chevron-Right.svg";

const JournalScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();

  const { currentScreen } = useSelector((state) => state.app);

  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState([]);

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [showActivityIndicator, setShowActivityIndicator] = useState(false);
  const [activityText, setActivityText] = useState("");
  const [searchText, setSearchText] = useState("");
  const handleDate = useMemo(() => {
    let str = moment().format("MMMM Do YYYY, h:mm:ss a");
    if (str.includes("pm")) {
      return str.replace("pm", "PM");
    } else {
      return str.replace("am", "AM");
    }
  }, []);

  // Reset notes file || TO BE USED
  const resetNotes = async () => {
    const { exists } = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + "/notes"
    );
    try {
      if (exists) {
        await FileSystem.deleteAsync(FileSystem.documentDirectory + "/notes");
      }
      const checkAgain = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + "/notes"
      );
      console.log(checkAgain);
    } catch (error) {
      console.log(error);
    }
  };

  const noteDate = useMemo(() => {
    return new Date();
  }, []);

  const placeNote = (originData, data) => {
    let matchFound = false;
    let newArray = [];

    for (let i = 0; i < originData.length; i++) {
      let emojiData = originData[i];

      if (Array.isArray(emojiData)) {
        if (
          new Date(emojiData[0]["date"]).getFullYear() ===
            new Date(data["date"]).getFullYear() &&
          new Date(emojiData[0]["date"]).getDate() ===
            new Date(data["date"]).getDate() &&
          new Date(emojiData[0]["date"]).getMonth() ===
            new Date(data["date"]).getMonth()
        ) {
          newArray.push([data, ...emojiData]);
          matchFound = true;
        } else {
          newArray.push(emojiData);
        }
      } else if (
        new Date(emojiData["date"]).getFullYear() ===
          new Date(data["date"]).getFullYear() &&
        new Date(emojiData["date"]).getDate() ===
          new Date(data["date"]).getDate() &&
        new Date(emojiData["date"]).getMonth() ===
          new Date(data["date"]).getMonth()
      ) {
        newArray.push([data, emojiData]);
        matchFound = true;
      } else {
        newArray.push(emojiData);
      }
    }
    !matchFound && newArray.unshift(data);
    return newArray;
  };

  const saveNote = async () => {
    // Get user's notes
    try {
      // Create a directory containing user's notes
      if (title.trim().length < 1 || note.trim().length < 1) return;
      const dirStatus = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + "/notes/entries.json"
      );

      let fileUri = FileSystem.documentDirectory + "/notes/entries.json";
      if (dirStatus.exists) {
        // Write note into new file
        const existingData = await FileSystem.readAsStringAsync(fileUri);
        let newParsedData = [];
        const parsedData = JSON.parse(existingData);
        const newNote = { date: noteDate, title, note };

        const transformedArray = placeNote(parsedData, newNote);
        // const dataToInsert = parsedData.unshift(newMood);

        const res = await FileSystem.writeAsStringAsync(
          fileUri,
          JSON.stringify(transformedArray)
        );
      } else {
        // Create the notes directory
        const newDir = await FileSystem.makeDirectoryAsync(
          FileSystem.documentDirectory + "/notes"
        );

        // Write note into new file
        const newNote = JSON.stringify([{ date: noteDate, title, note }]);
        const res = await FileSystem.writeAsStringAsync(fileUri, newNote);
      }

      // Confirm file is saved in user's device
      const fileRes = await FileSystem.readAsStringAsync(fileUri);
      // View all emoji objects
      const dir = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory + "/notes"
      );

      if (fileRes) {
        setTitle("");
        setNote("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNotes = async () => {
    const { exists } = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + "/notes/entries.json"
    );
    try {
      if (exists) {
        const sample = await FileSystem.readAsStringAsync(
          FileSystem.documentDirectory + "/notes/entries.json"
        );
        const parsedData = JSON.parse(sample);
        setNotes(parsedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchNotes = () => {
    const regExp = new RegExp(searchText, "gi");
    let searchResults = notes
      .flat(Infinity)
      .filter((entry) => entry.title.match(regExp));
    setSearchText("");
    navigation.navigate("search", { searchResults });
  };

  useEffect(() => {
    dispatch(setScreen("journal"));
    // resetEmojis();

    return () => {
      dispatch(resetScreen());
    };
  }, [currentScreen]);

  // fetch user's notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  // delete user's notes on mount
  //   useEffect(() => {
  //     resetNotes();
  //   }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Activity Indicator*/}
      {showActivityIndicator && (
        <View
          style={{
            position: "absolute",
            flex: 1,
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            height: "100%",
            zIndex: 100000,
            justifyContent: "center",
          }}
        >
          <ActivityIndicator
            animating={showActivityIndicator}
            size="large"
            color="#3131C9"
          />
          <View>
            <Text
              style={{
                width: "100%",
                textAlign: "center",
                fontFamily: "inter",
                fontSize: 15,
                marginTop: 10,
              }}
            >
              {activityText}
            </Text>
          </View>
        </View>
      )}
      {/* Modal */}
      <Modal
        transparent={true}
        visible={showModal}
        animationType={"fade"}
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1, backgroundColor: "rgba(255, 255, 255, 1)" }}>
            {/* Back Button */}
            <NavTop type="Close" setShowModal={setShowModal} />
            <View
              style={{
                flex: 1,
                paddingHorizontal: 10,
                marginBottom: 74,
              }}
            >
              {/* Header */}
              <Text
                style={{ fontSize: 24, color: "#3131C9", fontFamily: "titan" }}
              >
                Create Note
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "white",
                  marginTop: 20,
                  borderRadius: 25,
                  elevation: 10,
                  shadowColor: "#000000",
                  shadowOffset: 5,
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  paddingRight: 5,
                }}
              >
                <TextInput
                  placeholder="Title"
                  value={title}
                  onChangeText={(text) => {
                    setTitle(text);
                  }}
                  style={{
                    flex: 1,
                    fontFamily: "inter",
                    fontSize: 16,
                    padding: 10,
                  }}
                ></TextInput>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {title.length > 0 && (
                    <TouchableOpacity onPress={() => setTitle("")}>
                      <AntDesign
                        name="closecircle"
                        size={24}
                        color="#bababa"
                        style={{ alignSelf: "center" }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  marginTop: 20,
                  backgroundColor: "white",
                  elevation: 10,
                  shadowColor: "#000000",
                  borderRadius: 25,
                  shadowOffset: 5,
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  marginBottom: 74,
                  padding: 10,
                  paddingRight: 5,
                }}
              >
                <View
                  style={{
                    height: 35,
                    width: 35,
                    alignSelf: "flex-end",
                    padding: 5,
                    borderRadius: 35,
                    backgroundColor: "white",
                    position: "absolute",
                    top: 10,
                    right: 5,
                    zIndex: 10,
                  }}
                >
                  {note.length > 0 && (
                    <TouchableOpacity onPress={() => setNote("")}>
                      <AntDesign
                        name="closecircle"
                        size={24}
                        color="#bababa"
                        style={{ alignSelf: "flex-end" }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  multiline={true}
                  spellCheck={false}
                  placeholder="Add your note here..."
                  value={note}
                  onChangeText={(text) => {
                    setNote(text);
                  }}
                  style={{
                    textAlignVertical: "top",
                    flex: 1,
                    fontFamily: "inter",
                    fontSize: 16,
                    backgroundColor: "white",
                    borderRadius: 10,
                    marginRight: 5,
                  }}
                ></TextInput>
              </View>
            </View>
            <View
              style={{
                width: "100%",
                minHeight: 70,
                alignSelf: "flex-end",
                position: "absolute",
                bottom: 0,
                flexDirection: "row-reverse",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10,
                marginBottom: 74,
              }}
            >
              <TouchableOpacity
                disabled={title.trim().length <= 0 || note.trim().length <= 0}
                onPress={() => {
                  Keyboard.dismiss();
                  try {
                    setShowActivityIndicator(true);
                    setShowModal(false);
                    setActivityText("Hang on, we are saving your note.");
                    saveNote().then(() => {
                      navigation.navigate("journal");
                      setShowActivityIndicator(false);
                      fetchNotes();
                    });
                  } catch (error) {
                    setShowActivityIndicator(false);
                    console.log(error);
                  }
                }}
                style={{
                  alignSelf: "flex-end",
                }}
              >
                <Text
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    fontFamily: "inter",
                    backgroundColor:
                      title.trim().length < 1 || note.trim().length < 1
                        ? "rgba(49,49,201, 0.3)"
                        : "#3131C9",
                    fontSize: 15,
                    color:
                      title.trim().length < 1 || note.trim().length < 1
                        ? "rgba(255, 255, 255, 0.8)"
                        : "white",
                  }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
              style={{ fontFamily: "titan", fontSize: 40, color: "#3131C9" }}
            >
              Your Notes
            </Text>
          </View>

          {/* Body */}
          <View
            style={{
              borderBottomRightRadius: 10,
              borderBottomLeftRadius: 10,
              marginBottom: 70,
              flex: 1,
            }}
          >
            {/* Action buttons bar */}
            <View
              style={{
                paddingVertical: 10,
                paddingHorizontal: 10,
                width: "100%",
                maxWidth: 360,
                flexDirection: "row",
                alignItems: "stretch",
                justifyContent: "space-between",
                alignSelf: "flex-end",
                marginTop: 20,
              }}
            >
              {/* Search Box */}
              <View
                style={{
                  justifyContent: "flex-end",
                  borderColor: "#CCC6C6",
                  backgroundColor: "#D9D9D9",
                  borderWidth: 1,
                  flexDirection: "row",
                  alignItems: "flex-end",
                  paddingVertical: 7,
                  borderRadius: 30,
                }}
              >
                <TouchableOpacity
                  style={{
                    borderRadius: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: 5,
                    marginRight: 7,
                  }}
                  onPress={searchNotes}
                >
                  <Search width={30} height={30} />
                </TouchableOpacity>
                <TextInput
                  placeholder="Search for notes"
                  style={{
                    fontFamily: "inter",
                    flexDirection: "row",
                    width: 240,
                    alignSelf: "flex-end",
                    fontSize: 16,
                  }}
                  value={searchText}
                  onChangeText={(val) => setSearchText(val)}
                  onSubmitEditing={searchNotes}
                />
              </View>
              {/* Create note button */}
              <TouchableOpacity
                style={{
                  minHeight: 40,
                  minWidth: 40,
                  borderRadius: 40,
                  borderColor: "#CCC6C6",
                  backgroundColor: "#D9D9D9",
                  borderWidth: 1,
                  shadowRadius: 5,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 10,
                }}
                onPress={() => {
                  setShowModal(true);
                }}
              >
                <Pencil width={25} height={25} style={{}} />
              </TouchableOpacity>
            </View>

            {/* Notes Box */}
            {/* If user has no notes display this */}
            {notes.length <= 0 && (
              <View
                style={{
                  flex: 1,
                  marginHorizontal: 10,
                  borderRadius: 10,
                  padding: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "inter",
                    textAlign: "center",
                    lineHeight: 24,
                    fontSize: 14,
                    textAlignVertical: "center",
                    color: "#6C6565",
                  }}
                >
                  Tap{"  "}
                  <View
                    style={{
                      maxHeight: 30,
                      maxWidth: 30,
                      overflow: "hidden",
                      borderRadius: 50,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "white",
                      alignSelf: "flex-end",
                      padding: 5,
                      borderColor: "#CCC6C6",
                      backgroundColor: "#D9D9D9",
                      transform: [{ translateY: 8 }],
                    }}
                  >
                    <Pencil width={16} height={16} style={{}} />
                  </View>
                  {"  "}
                  to add note.
                </Text>
              </View>
            )}
            {notes.length > 0 && (
              <ScrollView
                style={{
                  flex: 1,
                  borderRadius: 10,
                  overflow: "visible",
                  marginTop: 10,
                }}
              >
                {notes.flat().map((entry, index) => {
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
        </View>
        <Nav navigation={navigation} />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default JournalScreen;
