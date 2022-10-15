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
import { ScrollView, Modal, ImageBackground } from "react-native";
import { StatusBar } from "expo-status-bar";
import HeaderHome from "../shared/HeaderHome";
import Microphone from "../assets/homeScreen/Microphone.svg";
import Stop from "../assets/homeScreen/Stop.svg";
import Pause from "../assets/homeScreen/Pause.svg";
import Reset from "../assets/homeScreen/Reset.svg";
import Play from "../assets/homeScreen/Play.svg";
import Save from "../assets/homeScreen/Save.svg";
import Delete from "../assets/homeScreen/Remove.svg";

let recording;
let soundObject;
let intervalId;
const timing = 1000;

const HomeScreen = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState();
  const [firebaseSound, setFirebaseSound] = useState();
  const [message, setMessage] = useState("");
  const [counter, setCounter] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const [startTimer, setStartTimer] = useState(false);
  const [filename, setFilename] = useState("");

  // Memoized timingInterval to avoid unnecessary re-renders
  const timingInterval = useCallback(() => {
    intervalId = setInterval(() => {
      setDurationMillis((prev) => prev + timing);
    }, timing);
  }, []);

  // Helper function for rendering countdown timer
  const showTime = (type, mill) => {
    if (type === "sec") {
      let secValue = 0;
      secValue = (mill / 1000) % 60;
      return secValue.toString().length < 2 ? "0" + "" + secValue : secValue;
    }
    if (type === "min") {
      let minValue;
      minValue = parseInt(mill / 60000);
      return minValue.toString().length < 2 ? "0" + "" + minValue : minValue;
    }
  };

  // Helper function for logging out user
  const signOutHandler = async () => {
    console.log("pressed");
    await GoogleSignin.revokeAccess();
    auth()
      .signOut()
      .then(() => console.log("logged out"))
      .catch((err) => console.log(err));
  };

  // Helper function for playback status
  const _onPlaybackStatusUpdate = (playbackStatus) => {
    if (!playbackStatus.isLoaded) {
      // Update your UI for the unloaded state
      if (playbackStatus.error) {
        console.log(
          `Encountered a fatal error during playback: ${playbackStatus.error}`
        );
        // Send Expo team the error on Slack or the forums so we can help you debug!
      }
    } else {
      // Update your UI for the loaded state

      if (playbackStatus.isPlaying) {
        // Update your UI for the playing state
      } else {
        // Update your UI for the paused state
      }

      if (playbackStatus.isBuffering) {
        // Update your UI for the buffering state
      }

      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        // The player has just finished playing and will stop. Maybe you want to play something else?
        soundObject = null;
      }
    }
  };

  const startRecording = async () => {
    recording = new Audio.Recording(); // new instance of Audio.Recording
    durationMillis && setDurationMillis(0); // reset timer if value is greater than 0ms

    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      setStartTimer(true); // start timer
      setIsRecording(true); // update recording status
      console.log("Starting recording..");
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recording.startAsync();
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    console.log("Stopping recording..");
    await recording.stopAndUnloadAsync(); // clear audio record from memory

    setStartTimer(false); // stop timer
    setIsRecording(false); // update recording status

    const uri = recording.getURI(); // get audio file location on user's device
    console.log("Recording stopped and stored at");
    console.log(uri);
  };

  const playRecording = async () => {
    // If there is an audio file and it is paused, play it
    if (soundObject && soundObject !== null) {
      return soundObject.playAsync();
    }

    // Otherwise, create a Audio.Sound instance
    soundObject = new Audio.Sound();
    try {
      soundObject.setOnPlaybackStatusUpdate(_onPlaybackStatusUpdate);
      console.log("Loading Sound");

      // Get and load user's recorded audio stored in memory cache
      await soundObject.loadAsync({
        uri: recording.getURI(),
      });

      console.log("Playing Sound");
      await soundObject.playAsync();
    } catch (error) {
      console.log(error);
    }
  };

  const saveRecording = async () => {
    // Get user's recorded audio stored in memory cache
    const uri = recording.getURI();
    try {
      // Convert to base64 string
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
        length: 1000,
      });
      // Create a directory containing user logs
      const dirStatus = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + "/audio-logs"
      );

      let fileUri =
        FileSystem.documentDirectory +
        "/audio-logs/" +
        `${filename.trim().split(" ").join("-")}_${new Date()}.txt`;
      if (dirStatus.exists) {
        // Write audio string into new file
        const res = await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Confirm file is saved in user's device
        const fileRes = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
          length: 1000,
        });
      } else {
        // Create the directory
        const newDir = await FileSystem.makeDirectoryAsync(
          FileSystem.documentDirectory + "/audio-logs"
        );

        // Write audio string into new file
        const res = await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      // Confirm file is saved in user's device
      const fileRes = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
        length: 1000,
      });
      // View all recorded audio logs
      const dir = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory + "/audio-logs"
      );
      console.log(dir);
      console.log(fileRes);

      if (fileRes) {
        setShowModal(false);
        setFilename("");
        // recording = null;
      }
    } catch (error) {
      console.log(error);
    }
  };

  // UseEffect for timer
  useEffect(() => {
    if (startTimer === true) {
      timingInterval();
    } else {
      intervalId && clearInterval(intervalId);
    }

    // Timer cleanup function
    return () => intervalId && clearInterval(intervalId);
  }, [startTimer]);

  return (
    <ImageBackground
      source={require("../assets/nav/background.png")}
      style={{ width: "100%", height: "100%", flex: 1, resizeMode: "contain" }}
    >
      <View style={tw`flex-1`}>
        {/* Modal for user's audio title */}
        <StatusBar style="light" translucent={false} />
        <Modal animationType="slide" visible={showModal} transparent>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  maxWidth: 300,
                  backgroundColor: "white",
                  borderRadius: 10,
                  shadowColor: "rgba(0, 0, 0, 0.7)",
                  shadowOffset: 10,
                  elevation: 10,
                  shadowRadius: 10,
                  padding: 10,
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: 20 }}>
                  Let's Name It
                </Text>
                <Text>What would you like to name this audio log?</Text>
                <TextInput
                  placeholder="What a day"
                  value={filename}
                  onChangeText={(value) => setFilename(value)}
                  style={{
                    height: 50,
                    borderColor: "#bababa",
                    borderStyle: "solid",
                    borderWidth: 1,
                    marginTop: 10,
                    borderRadius: 5,
                    padding: 10,
                  }}
                ></TextInput>
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Text
                      style={{
                        padding: 10,
                        borderRadius: 5,
                        marginTop: 10,
                        backgroundColor: "transparent",
                        width: 80,
                        textAlign: "center",
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={filename.length < 5 ? true : false}
                    onPress={() => saveRecording()}
                  >
                    <Text
                      style={{
                        padding: 10,
                        borderRadius: 5,
                        marginTop: 10,
                        backgroundColor: "lightblue",
                        width: 70,
                        textAlign: "center",
                      }}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Home Screen */}
        <ScrollView style={tw` flex-1  p-3 px-4`}>
          {/* header image and text container */}
          <HeaderHome signOut={signOutHandler} />

          <View style={tw` w-full mt-10`}>
            <Text
              style={{
                fontFamily: "inter",
                fontSize: 20,
                marginBottom: 5,
              }}
            >
              Hi {auth()._user.displayName.split(" ")[0]}!
            </Text>

            {/* <Text style={tw`text-gray-500 font-semibold text-base`}> */}
            <Text
              style={{
                fontFamily: "titan",
                fontSize: 40,
                width: "100%",
                color: "#3131C9",
              }}
            >
              What's on your mind today?
            </Text>
          </View>

          {/* <Fontisto
            style={tw` mt-6 text-center`}
            name="smiley"
            size={80}
            color="black"
          /> */}

          {/* recording timer */}
          {isRecording && (
            <View style={tw`flex-row  justify-center mt-4`}>
              <Text
                style={{
                  fontFamily: "inter",
                  fontSize: 32,
                }}
              >
                {showTime("min", durationMillis)}:
              </Text>
              <Text
                style={{
                  fontFamily: "inter",
                  fontSize: 32,
                }}
              >
                {showTime("sec", durationMillis)}
              </Text>
            </View>
          )}

          {/* mic container */}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
            }}
          >
            <TouchableOpacity style={tw` self-center mt-10`}>
              <View
                style={tw.style(
                  "rounded-full",
                  "flex-row",
                  "justify-center",
                  "items-center",
                  {
                    width: 100,
                    height: 100,
                    borderColor: "rgba(0, 0, 0, 0.25)",
                    borderWidth: isRecording ? 2 : 0,
                    borderStyle: "solid",
                    marginTop: 20,
                  }
                )}
              >
                {isRecording && <Pause />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={tw` self-center mt-10`}
            >
              <View
                style={tw.style(
                  "rounded-full",
                  "flex-row",
                  "justify-center",
                  "items-center",
                  {
                    width: 100,
                    height: 100,
                    borderColor: "rgba(0, 0, 0, 0.25)",
                    borderWidth: 2,
                    borderStyle: "solid",
                    marginTop: 20,
                    marginHorizontal: 10,
                  }
                )}
              >
                {!isRecording ? <Microphone /> : <Stop />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={tw` self-center mt-10`}>
              <View
                style={tw.style(
                  "rounded-full",
                  "flex-row",
                  "justify-center",
                  "items-center",
                  {
                    width: 100,
                    height: 100,
                    borderColor: "rgba(0, 0, 0, 0.25)",
                    borderWidth: isRecording ? 2 : 0,
                    borderStyle: "solid",
                    marginTop: 20,
                  }
                )}
              >
                {isRecording && <Reset />}
              </View>
            </TouchableOpacity>
          </View>

          {/* display recorded audio */}
          {recording && recording._uri && !isRecording && (
            <View
              style={tw`flex-row mt-6 self-center justify-around max-w-xs items-center justify-between m-3`}
            >
              <TouchableOpacity
                onPress={async () => {
                  setShowModal(true);
                }}
              >
                <View
                  style={tw.style(
                    "rounded-full",
                    "flex-row",
                    "justify-center",
                    "items-center",
                    {
                      width: 60,
                      height: 60,
                      borderColor: "rgba(0, 0, 0, 0.25)",
                      borderWidth: 1,
                      marginHorizontal: 20,
                      borderStyle: "solid",
                      marginTop: 20,
                    }
                  )}
                >
                  <Delete />
                </View>
              </TouchableOpacity>
              {/* 
            <TouchableOpacity style={tw`rounded-full p-3 bg-gray-400`}>
              <Entypo
                onPress={() => recordings.sound.playAsync()}
                name="controller-play"
                size={30}
                color="white"
              />
              <Ionicons
                onPress={() => recordings.sound.pauseAsync()}
                name="pause-sharp"
                size={30}
                color="white"
              />
            </TouchableOpacity> */}
              <TouchableOpacity onPress={() => playRecording()}>
                <View
                  style={tw.style(
                    "rounded-full",
                    "flex-row",
                    "justify-center",
                    "items-center",
                    {
                      width: 60,
                      height: 60,
                      borderColor: "rgba(0, 0, 0, 0.25)",
                      borderWidth: 1,
                      marginHorizontal: 20,
                      borderStyle: "solid",
                      marginTop: 20,
                    }
                  )}
                >
                  <Play />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => soundObject && soundObject.pauseAsync()}
              >
                <View
                  style={tw.style(
                    "rounded-full",
                    "flex-row",
                    "justify-center",
                    "items-center",
                    {
                      width: 60,
                      height: 60,
                      borderColor: "rgba(0, 0, 0, 0.25)",
                      borderWidth: 1,
                      marginHorizontal: 20,
                      borderStyle: "solid",
                      marginTop: 20,
                    }
                  )}
                >
                  <Save />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* end */}
        </ScrollView>
        <Nav navigation={navigation} />
      </View>
    </ImageBackground>
  );
};

export default HomeScreen;
