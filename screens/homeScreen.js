import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Modal,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useCallback, useState, useMemo } from "react";
import tw from "tailwind-react-native-classnames";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import * as FileSystem from "expo-file-system";
import firebase from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";
import Nav from "../shared/Nav";
import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";
import NavTop from "../shared/NavTop";
import HeaderHome from "../shared/HeaderHome";
import moment from "moment";

import Microphone from "../assets/homeScreen/Microphone.svg";
import Stop from "../assets/homeScreen/Stop.svg";
import Pause from "../assets/homeScreen/Pause.svg";
import Reset from "../assets/homeScreen/Reset.svg";
import Play from "../assets/homeScreen/Play.svg";
import SmallPlay from "../assets/homeScreen/smallPlay.svg";
import SmallPause from "../assets/homeScreen/smallPause.svg";
import Save from "../assets/homeScreen/Save.svg";
import Delete from "../assets/homeScreen/Remove.svg";
import SoundWave from "../assets/homeScreen/soundwave.svg";
import BlueSoundWave from "../assets/homeScreen/soundwave-blue.svg";
import Pencil from "../assets/homeScreen/Pencil.svg";

import { useDispatch, useSelector } from "react-redux";
import {
  resetEmojiId,
  resetScreen,
  setScreen,
  storeEmojiId,
} from "../store/appSlice";
import { emotions } from "../assets/emoticons/emotions";
import { store } from "../store/store";
import { SafeAreaView } from "react-native-safe-area-context";

let recording;
let soundObject;
let intervalId;
let audioIntervalId;
const timing = 1000;

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const { currentScreen } = useSelector((state) => state.app);
  const { emojiId } = useSelector((state) => state.app);

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordings, setRecordings] = useState();
  const [firebaseSound, setFirebaseSound] = useState();
  const [message, setMessage] = useState("");
  const [counter, setCounter] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const [startTimer, setStartTimer] = useState(false);
  const [filename, setFilename] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [recordingIsPaused, setRecordingIsPaused] = useState(false);
  const [showMic, setShowMic] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [lengthOfAudio, setLengthOfAudio] = useState(null);
  const [audioSeek, setAudioSeek] = useState(0);
  const [showActivityIndicator, setShowActivityIndicator] = useState(false);
  const [activityText, setActivityText] = useState("");

  // Reset audio logs file || TO BE USED
  const resetAudioLogs = async () => {
    const { exists } = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + "/audio-logs"
    );
    try {
      if (exists) {
        await FileSystem.deleteAsync(
          FileSystem.documentDirectory + "/audio-logs"
        );
      }
      const checkAgain = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + "/audio-logs"
      );
      console.log("checkAgain", checkAgain);
    } catch (error) {
      console.log(error);
    }
  };

  // Memoized timingInterval to avoid unnecessary re-renders
  const timingInterval = useCallback(() => {
    intervalId = setInterval(() => {
      setDurationMillis((prev) => prev + timing);
    }, timing);
  }, []);

  const audioTimingInterval = useCallback(
    (type) => {
      if (type === "sound") {
        audioIntervalId = setInterval(() => {
          setAudioSeek((prev) => prev + timing);
        }, timing);
      }
    },
    [soundObject]
  );

  const handleDate = useMemo(() => {
    let str = moment().format("MMMM Do YYYY, h:mm:ss a");
    if (str.includes("pm")) {
      return str.replace("pm", "PM");
    } else {
      return str.replace("am", "AM");
    }
  }, [recording]);

  const emojiDate = useMemo(() => {
    return new Date();
  }, [recording]);

  const placeEmoji = (originData, data) => {
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

  // Helper function for rendering countdown timer
  const showTime = (type, mill) => {
    if (type === "sec") {
      let secValue = 0;
      secValue = parseInt((mill / 1000) % 60);
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
      audioIntervalId && clearInterval(audioIntervalId);
      if (playbackStatus.error) {
        console.log(
          `Encountered a fatal error during playback: ${playbackStatus.error}`
        );
        // Send Expo team the error on Slack or the forums so we can help you debug!
      }
    } else {
      // Update your UI for the loaded state
      setLengthOfAudio(playbackStatus.durationMillis);
      if (playbackStatus.isPlaying) {
        // Update your UI for the playing state
        setIsPlaying(true);
      } else {
        // Update your UI for the paused state
        audioIntervalId && clearInterval(audioIntervalId);
        setIsPlaying(false);
      }

      if (playbackStatus.isBuffering) {
        // Update your UI for the buffering state
      }

      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        // The player has just finished playing and will stop. Maybe you want to play something else?
        clearInterval(audioIntervalId);
        soundObject = null;
        setAudioSeek(0);
      }
    }
  };

  const startRecording = async () => {
    recording = new Audio.Recording(); // new instance of Audio.Recording
    durationMillis && setDurationMillis(0); // reset timer if value is greater than 0ms

    try {
      console.log("Requesting permissions..");
      setShowMic(false);
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      setIsRecording(true); // update recording status
      setStartTimer(true); // start timer
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
    recording.getStatusAsync().then((result) => {
      setLengthOfAudio(result.durationMillis);
      setShowEmoji(true);
    });
    console.log("Recording stopped and stored at");
    console.log(uri);
  };

  const playRecording = async () => {
    // If there is an audio file and it is paused, play it
    if (soundObject && soundObject !== null) {
      soundObject.playAsync();
      return audioTimingInterval("sound");
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
      return audioTimingInterval("sound");
    } catch (error) {
      console.log(error);
    }
  };

  const pauseSound = async () => {
    // If user is recording, pause it
    try {
      if (soundObject && (soundObject !== null || soundObject !== undefined)) {
        // setStartTimer(false);
        // setRecordingIsPaused(true);
        return soundObject.pauseAsync();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const pauseRecording = async () => {
    // If user is recording, pause it
    if (recording && (recording !== null || recording !== undefined)) {
      setStartTimer(false);
      setRecordingIsPaused(true);
      return recording.pauseAsync();
    }
  };

  const continueRecording = async () => {
    // If user's recording is paused, continue
    const recordingStatus = await recording.getStatusAsync();
    if (recording && !recordingStatus.isDoneRecording) {
      setStartTimer(true);
      setRecordingIsPaused(false);
      return recording.startAsync();
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

      // Get sound details
      const soundDetails = await recording.getStatusAsync();

      let fileUri =
        FileSystem.documentDirectory +
        "/audio-logs/" +
        `${filename.trim()}⁙※⁂${
          soundDetails.durationMillis
        }⁙※⁂${handleDate}.txt`;
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

      if (fileRes) {
        setShowSaveModal(false);
        setFilename("");
        recording = undefined;
        setIsRecording(false);
        setShowEmoji(false);
        setShowMic(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteRecording = () => {
    setShowDeleteModal(false);
    recording = undefined;
    setIsRecording(false);
    setShowEmoji(false);
    setShowMic(true);
  };

  const resetRecording = async () => {
    // reset users recording
    await stopRecording().then(() => {
      recording = undefined;
      setShowResetModal(false);
      setIsRecording(false);
      startRecording();
    });
  };

  const saveEmoji = async () => {
    // Get user's emojiId
    try {
      // Create a directory containing emojiID's
      if (emojiId === null) return;
      const dirStatus = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + "/emojis/moods.json"
      );

      let fileUri = FileSystem.documentDirectory + "/emojis/moods.json";
      if (dirStatus.exists) {
        // Write emoji object into new file
        const existingData = await FileSystem.readAsStringAsync(fileUri);
        let newParsedData = [];
        const parsedData = JSON.parse(existingData);
        const newMood = { date: emojiDate, emojiId: emojiId };

        const transformedArray = placeEmoji(parsedData, newMood);
        // const dataToInsert = parsedData.unshift(newMood);

        const res = await FileSystem.writeAsStringAsync(
          fileUri,
          JSON.stringify(transformedArray)
        );
      } else {
        // Create the emojis directory
        const newDir = await FileSystem.makeDirectoryAsync(
          FileSystem.documentDirectory + "/emojis"
        );

        // Write emoji object into new file
        const mood = JSON.stringify([{ emojiId: emojiId, date: emojiDate }]);
        const res = await FileSystem.writeAsStringAsync(fileUri, mood);
      }

      // Confirm file is saved in user's device
      const fileRes = await FileSystem.readAsStringAsync(fileUri);
      // View all emoji objects
      const dir = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory + "/emojis"
      );

      if (fileRes) {
        dispatch(resetEmojiId());
        setFilename("");
        recording = undefined;
        setIsRecording(false);
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

  // Set current screen on screen load
  useEffect(() => {
    dispatch(setScreen("home"));

    return () => {
      dispatch(resetScreen());
    };
  }, [currentScreen]);

  // Dynamically display mic
  useEffect(() => {
    recording && setShowMic(false);
    if (recording) {
      setShowEmoji(true);
      recording.getStatusAsync().then((result) => {
        setLengthOfAudio(result.durationMillis);
      });
    }
  }, []);

  // useEffect(() => {
  //   resetAudioLogs();
  // }, []);

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
          {!isRecording && (
            <NavTop
              type="Back"
              navigation={navigation}
              location="emoji"
              setShowMic={setShowMic}
            />
          )}

          {/* Dynamically render different modals */}
          {/* Save Modal */}
          <Modal animationType="slide" visible={showSaveModal} transparent>
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
                  <Text
                    style={{
                      fontSize: 20,
                      marginBottom: 20,
                      fontFamily: "inter",
                    }}
                  >
                    Let's Name It
                  </Text>
                  <Text
                    style={{
                      fontFamily: "inter",
                    }}
                  >
                    What would you like to name this audio log?
                  </Text>
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
                      fontFamily: "inter",
                    }}
                  ></TextInput>
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity onPress={() => setShowSaveModal(false)}>
                      <Text
                        style={{
                          padding: 10,
                          borderRadius: 5,
                          marginTop: 10,
                          backgroundColor: "transparent",
                          width: 80,
                          textAlign: "center",
                          fontFamily: "inter",
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={filename.length < 5 ? true : false}
                      onPress={() => {
                        Keyboard.dismiss();
                        setShowSaveModal(false);
                        try {
                          setShowActivityIndicator(true);
                          setActivityText(
                            "Hold on a bit, while we save your offload."
                          );
                          saveRecording()
                            .then(() => {
                              emojiId && setActivityText("and mood.");
                              saveEmoji();
                            })
                            .then(() => {
                              navigation.navigate("calendar");
                              setShowActivityIndicator(false);
                            });
                        } catch (error) {
                          setShowActivityIndicator(false);
                          console.log(error);
                        }
                      }}
                    >
                      <Text
                        style={{
                          padding: 10,
                          borderRadius: 5,
                          marginTop: 10,
                          backgroundColor: "#3131C9",
                          color: "white",
                          width: 70,
                          textAlign: "center",
                          fontFamily: "inter",
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

          {/* Delete Modal */}
          <Modal animationType="slide" visible={showDeleteModal} transparent>
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
                  <Text
                    style={{
                      fontSize: 20,
                      marginBottom: 20,
                      fontFamily: "inter",
                    }}
                  >
                    Delete log
                  </Text>
                  <Text
                    style={{
                      fontFamily: "inter",
                    }}
                  >
                    Are you sure you want to delete this audio log?
                  </Text>
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity onPress={() => setShowDeleteModal(false)}>
                      <Text
                        style={{
                          padding: 10,
                          borderRadius: 5,
                          marginTop: 10,
                          backgroundColor: "transparent",
                          width: 80,
                          textAlign: "center",
                          fontFamily: "inter",
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteRecording()}>
                      <Text
                        style={{
                          padding: 10,
                          borderRadius: 5,
                          marginTop: 10,
                          backgroundColor: "red",
                          color: "white",
                          width: 70,
                          textAlign: "center",
                          fontFamily: "inter",
                        }}
                      >
                        Yes
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Reset Modal */}
          <Modal animationType="slide" visible={showResetModal} transparent>
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
                  <Text
                    style={{
                      fontSize: 20,
                      marginBottom: 20,
                      fontFamily: "inter",
                    }}
                  >
                    Reset recording
                  </Text>
                  <Text
                    style={{
                      fontFamily: "inter",
                    }}
                  >
                    Are you sure you want to reset this recording?
                  </Text>
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity onPress={() => setShowResetModal(false)}>
                      <Text
                        style={{
                          padding: 10,
                          borderRadius: 5,
                          marginTop: 10,
                          backgroundColor: "transparent",
                          width: 80,
                          textAlign: "center",
                          fontFamily: "inter",
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => resetRecording()}>
                      <Text
                        style={{
                          padding: 10,
                          borderRadius: 5,
                          marginTop: 10,
                          backgroundColor: "#3131C9",
                          color: "white",
                          width: 70,
                          textAlign: "center",
                          fontFamily: "inter",
                        }}
                      >
                        Reset
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          {/* Home Screen */}
          <ScrollView style={tw` flex-1`}>
            {/* header image and text container */}
            {<HeaderHome signOut={signOutHandler} />}

            {!recording && (
              <View style={tw` w-full mt-10 mx-4`}>
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
            )}
            {recording && isRecording && (
              <Image
                source={require("../assets/homeScreen/kite.png")}
                style={{ width: 200, alignSelf: "center" }}
              />
            )}
            {recording && recording._uri && !isRecording && (
              <View
                style={{
                  height: 138,
                  backgroundColor: "#3131C9",
                  marginTop: "10%",
                  borderRadius: 10,
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: "row",
                  paddingHorizontal: 5,
                  marginHorizontal: 16,
                  position: "relative",
                }}
              >
                {/* Play/Pause button */}
                <View
                  style={tw.style(
                    "rounded-full",
                    "flex-row",
                    "justify-center",
                    "items-center",
                    {
                      width: 40,
                      height: 40,
                      marginRight: 5,
                      backgroundColor: "rgba(255, 255, 255, 1)",
                      position: "relative",
                      borderRadius: 20,
                      justifyContent: "center",
                      alignItems: "center",
                    }
                  )}
                >
                  {isPlaying ? (
                    <TouchableOpacity>
                      <SmallPause
                        onPress={() => pauseSound()}
                        style={{
                          width: 30,
                          alignSelf: "center",
                        }}
                      />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => playRecording()}>
                      <SmallPlay
                        style={{
                          width: 30,
                          alignSelf: "center",
                        }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <SoundWave
                  style={{
                    flex: 1,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "absolute",
                    bottom: 10,
                    left: 0,
                    flex: 1,
                    width: "100%",
                    paddingLeft: 45,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "inter",
                      fontSize: 12,
                    }}
                  >
                    {showTime("min", audioSeek)}:{showTime("sec", audioSeek)}
                  </Text>
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "inter",
                      fontSize: 12,
                    }}
                  >
                    {showTime("min", lengthOfAudio)}:
                    {showTime("sec", lengthOfAudio)}
                  </Text>
                </View>
              </View>
            )}
            {recording && recording._uri && !isRecording && (
              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginHorizontal: 16,
                }}
              >
                <Pencil style={{ marginRight: 10 }} />
                <Text
                  style={{
                    fontFamily: "inter",
                    fontWeight: "bold",
                    color: "#3131C9",
                    fontSize: 15,
                    textAlign: "left",
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {handleDate}
                </Text>
              </View>
            )}

            {/* recording timer */}
            {isRecording && (
              <View style={tw`flex-row  justify-center mt-4 mx-4`}>
                <Text
                  style={{
                    fontFamily: "inter",
                    fontSize: 28,
                  }}
                >
                  {showTime("min", durationMillis)}:
                </Text>
                <Text
                  style={{
                    fontFamily: "inter",
                    fontSize: 28,
                  }}
                >
                  {showTime("sec", durationMillis)}
                </Text>
              </View>
            )}

            {isRecording && (
              <BlueSoundWave style={{ width: "100%", alignSelf: "center" }} />
            )}

            {/* mic container */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-around",
                marginBottom: 10,
                marginHorizontal: 16,
              }}
            >
              <TouchableOpacity
                style={tw` self-center mt-10`}
                onPress={() => {
                  recordingIsPaused ? continueRecording() : pauseRecording();
                }}
              >
                <View
                  style={tw.style(
                    "rounded-full",
                    "flex-row",
                    "justify-center",
                    "items-center",
                    {
                      width: 70,
                      height: 70,
                      borderColor: "rgba(0, 0, 0, 0.25)",
                      borderWidth: isRecording ? 2 : 0,
                      borderStyle: "solid",
                      marginTop: 10,
                    }
                  )}
                >
                  {isRecording && recordingIsPaused && <Play />}
                  {isRecording && !recordingIsPaused && <Pause />}
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
                      width: 80,
                      height: 80,
                      borderColor: "rgba(0, 0, 0, 0.25)",
                      borderWidth: !isRecording && recording ? 0 : 2,
                      borderStyle: "solid",
                      marginTop: 10,
                      marginHorizontal: 10,
                    }
                  )}
                >
                  {isRecording && <Stop />}
                  {!isRecording && showMic && <Microphone />}
                  {!isRecording && recording && showEmoji && (
                    <Image
                      source={emotions.assets[emojiId]}
                      style={{
                        width: 200,
                        height: 200,
                      }}
                    />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw` self-center mt-10`}
                onPress={() => setShowResetModal(true)}
              >
                <View
                  style={tw.style(
                    "rounded-full",
                    "flex-row",
                    "justify-center",
                    "items-center",
                    {
                      width: 70,
                      height: 70,
                      borderColor: "rgba(0, 0, 0, 0.25)",
                      borderWidth: isRecording ? 2 : 0,
                      borderStyle: "solid",
                      marginTop: 10,
                    }
                  )}
                >
                  {isRecording && <Reset width={50} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* display recorded audio */}
            {recording && recording._uri && !isRecording && (
              <View
                style={tw`flex-row mt-6 self-center justify-around max-w-xs items-center justify-between m-3 mx-4`}
              >
                {/* Delete Icon */}
                <TouchableOpacity onPress={() => setShowDeleteModal(true)}>
                  <View
                    style={tw.style(
                      "rounded-full",
                      "flex-row",
                      "justify-center",
                      "items-center",
                      {
                        width: 70,
                        height: 70,
                        borderColor: "rgba(0, 0, 0, 0.25)",
                        borderWidth: 2,
                        marginHorizontal: 20,
                        borderStyle: "solid",
                        marginTop: 20,
                      }
                    )}
                  >
                    <Delete />
                  </View>
                </TouchableOpacity>

                {/* Save Icon */}
                <TouchableOpacity
                  // onPress={() => soundObject && soundObject.pauseAsync()}
                  onPress={async () => {
                    setShowSaveModal(true);
                  }}
                >
                  <View
                    style={tw.style(
                      "rounded-full",
                      "flex-row",
                      "justify-center",
                      "items-center",
                      {
                        width: 70,
                        height: 70,
                        borderColor: "rgba(0, 0, 0, 0.25)",
                        borderWidth: 2,
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
    </SafeAreaView>
  );
};

export default HomeScreen;
