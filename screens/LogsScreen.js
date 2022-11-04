import React, { useEffect, useCallback, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
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
import { fileSeperator } from "../constants/fileSeperator";
import Play from "../assets/homeScreen/Play.svg";
import Pause from "../assets/homeScreen/Pause.svg";
import { emotions } from "../assets/emoticons/emotions";

const timing = 1000;
let soundObject;
let audioInterval;
let seconds = 0;

const LogsScreen = ({ route, navigation }) => {
  const audioLogDate = JSON.parse(JSON.stringify(route.params.audioLogDate));
  const selectedDate = JSON.parse(JSON.stringify(route.params.selectedDate));
  const filterSelectedDateEmojis = JSON.parse(
    JSON.stringify(route.params.filterSelectedDateEmojis)
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioPlayingID, setCurrentAudioPlayingID] = useState(null);
  const [audioTiming, setAudioTiming] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  const [audioLogs, setAudioLogs] = useState([]);
  const [startTimer, setStartTimer] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const [positionMillis, setPositionMillis] = useState(0);

  // Helper function for logging out user
  const signOutHandler = async () => {
    console.log("pressed");
    await GoogleSignin.revokeAccess();
    auth()
      .signOut()
      .then(() => console.log("logged out"))
      .catch((err) => console.log(err));
  };

  const getEmojiTime = (date) => {
    if (
      new Date(date).getFullYear() === new Date().getFullYear() &&
      new Date(date).getMonth() === new Date().getMonth() &&
      new Date(date).getDate() === new Date().getDate()
    ) {
      return moment(date).fromNow();
    } else {
      return moment(date).format("LT");
    }
  };

  const getAudioLogTime = (date) => {
    if (
      moment(date, "MMMM Do YYYY, h:mm:ss a").year() ===
        new Date().getFullYear() &&
      moment(date, "MMMM Do YYYY, h:mm:ss a").month() ===
        new Date().getMonth() &&
      moment(date, "MMMM Do YYYY, h:mm:ss a").date() === new Date().getDate()
    ) {
      return moment(date, "MMMM Do YYYY, h:mm:ss a").fromNow();
    } else {
      return moment(date, "MMMM Do YYYY, h:mm:ss a").format("LT");
    }
  };

  const summaryText = useCallback(
    (audioLogs, filterSelectedDateEmojis) => {
      if (audioLogs.length && filterSelectedDateEmojis.length) {
        return (
          <Text
            style={{
              fontFamily: "inter",
              fontSize: 14,
            }}
          >
            You logged{" "}
            <Text style={{ color: "#3131C9", fontWeight: "bold" }}>
              {audioLogs.length}{" "}
            </Text>
            {audioLogs.length > 1 ? "voice notes" : "voice note"},
            <Text style={{ color: "#3131C9", fontWeight: "bold" }}>
              {" "}
              {filterSelectedDateEmojis.length}{" "}
            </Text>
            mood {filterSelectedDateEmojis.length > 1 ? "changes." : "change."}
          </Text>
        );
      } else if (!audioLogs.length && filterSelectedDateEmojis.length) {
        return (
          <Text
            style={{
              fontFamily: "inter",
              fontSize: 14,
            }}
          >
            You logged{" "}
            <Text style={{ color: "#3131C9", fontWeight: "bold" }}>
              {audioLogs.length}{" "}
            </Text>
            {audioLogs.length > 1 ? "voice notes" : "voice note"}.
          </Text>
        );
      } else if (audioLogs.length && !filterSelectedDateEmojis.length) {
        return (
          <Text
            style={{
              fontFamily: "inter",
              fontSize: 14,
            }}
          >
            You logged{" "}
            <Text style={{ color: "#3131C9", fontWeight: "bold" }}>
              {filterSelectedDateEmojis.length}{" "}
            </Text>
            mood {filterSelectedDateEmojis.length > 1 ? "changes." : "change."}
          </Text>
        );
      } else {
        return (
          <Text
            style={{
              fontFamily: "inter",
              fontSize: 14,
            }}
          >
            No activity recorded on this day.
          </Text>
        );
      }
    },
    [audioLogs, filterSelectedDateEmojis]
  );

  const fetchAudioLogs = async () => {
    const { exists } = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + "/audio-logs"
    );
    try {
      if (exists) {
        const sample = await FileSystem.readDirectoryAsync(
          FileSystem.documentDirectory + "/audio-logs"
        );
        const filtered = sample.filter((uri) => uri.includes(audioLogDate));
        setAudioLogs(filtered);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Helper function for playback status
  const _onPlaybackStatusUpdate = (playbackStatus) => {
    if (!playbackStatus.isLoaded) {
      // Update your UI for the unloaded state
      audioInterval && clearInterval(audioInterval);
      if (playbackStatus.error) {
        console.log(
          `Encountered a fatal error during playback: ${playbackStatus.error}`
        );
        // Send Expo team the error on Slack or the forums so we can help you debug!
      }
    } else {
      // Update your UI for the loaded state
      setDurationMillis(playbackStatus.durationMillis);
      if (playbackStatus.isPlaying) {
        // Update your UI for the playing state
        // setIsPlaying(true);2
        setPositionMillis(playbackStatus.positionMillis);
      } else {
        // Update your UI for the paused state
        // audioIntervalId && clearInterval(audioIntervalId);
        // setIsPlaying(false);
        audioInterval && clearInterval(audioInterval);
      }

      if (playbackStatus.isBuffering) {
        // Update your UI for the buffering state
      }

      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        // The player has just finished playing and will stop. Maybe you want to play something else?
        // clearInterval(audioIntervalId);
        // setAudioSeek(0);
        setIsPlaying(false);
        setStartTimer(false);
        setAudioTiming(0);
        setPositionMillis(0);
        setCurrentAudioPlayingID(null);
        soundObject = null;
      }
    }
  };

  const playRecording = async (uri, audioId) => {
    // Create a new Audio.Sound instance
    if (soundObject) {
      await soundObject.unloadAsync();
    }
    soundObject = new Audio.Sound();
    try {
      soundObject.setOnPlaybackStatusUpdate(_onPlaybackStatusUpdate);
      console.log("Loading Sound");

      // Get and load user's recorded audio stored in memory cache
      setIsDisabled(true);
      await soundObject.loadAsync({
        uri,
      });

      console.log("Playing Sound");
      setIsPlaying(true);
      soundObject.playAsync().then(() => {
        setStartTimer(true);
      });
      setIsDisabled(false);
      // return audioTimingInterval("sound");
    } catch (error) {
      console.log(error);
    }
  };

  const handlePress = (fileLocation, ID) => {
    if (soundObject && (soundObject !== null || soundObject !== undefined)) {
      // If there is an audio file and it is paused, play it
      if (ID === currentAudioPlayingID && !isPlaying) {
        setIsDisabled(true);
        setIsPlaying(true);
        soundObject.playAsync();
        setIsDisabled(false);
        return setStartTimer(true);
        // return audioTimingInterval("sound");
      }
      // If there is an audio file and it is playing, pause it
      else if (ID === currentAudioPlayingID && isPlaying) {
        setIsDisabled(true);
        setStartTimer(false);
        setIsPlaying(false);
        soundObject.pauseAsync();
        return setIsDisabled(false);
      }
      // if there is a loaded audio file and user plays a different audio file, remove the old audio file from memory and play the new one
      else if (ID !== currentAudioPlayingID) {
        setPositionMillis(0);
        setIsDisabled(true);
        setAudioTiming(0);
        setStartTimer(false);
        setIsPlaying(false);
        soundObject.unloadAsync();
        soundObject = undefined;
        try {
          setCurrentAudioPlayingID(ID);
          playRecording(fileLocation);
        } catch (error) {
          console.log(error);
        }
      }
    }
    // if there is no audio file in memory, load the new one
    else {
      setCurrentAudioPlayingID(ID);
      try {
        playRecording(fileLocation);
      } catch (error) {
        console.log(error);
      }
    }
    setStartTimer(true);
  };

  // fetch audio logs on logs screen mount
  useEffect(() => {
    fetchAudioLogs();
  }, []);

  // Control audio timer based on user's actions
  useEffect(() => {
    if (startTimer) {
      audioInterval = setInterval(() => {
        seconds += 1;
        // setAudioTiming(seconds * timing);
        console.log(seconds * timing);
      }, timing);
    }

    if (!startTimer) {
      audioInterval && clearInterval(audioInterval);
      seconds = 0;
    }

    return () => {
      audioInterval && clearInterval(audioInterval);
      seconds = 0;
    };
  }, [startTimer]);

  return (
    <SafeAreaView style={tw`flex-1`}>
      {/* Logs Screen */}

      {/* Logs screen Content*/}
      <View
        style={{
          flex: 1,
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        {/* Back Button */}
        <NavTop type="Back" times={1} navigation={navigation} />

        {/* Date header */}
        <View
          style={{
            marginTop: 10,
          }}
        >
          <Text
            style={{
              fontFamily: "inter",
              fontWeight: "600",
              fontSize: 20,
              color: "#ffffff",
              backgroundColor: "#3131C9",
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              padding: 10,
              marginHorizontal: 10,
              elevation: 10,
              shadowColor: "#000000",
              shadowOffset: 5,
              shadowRadius: 10,
              shadowOpacity: 0.5,
            }}
          >
            {selectedDate}
          </Text>
        </View>

        {/* Body */}
        <ScrollView
          style={{
            backgroundColor: "#ffffff",
            borderBottomRightRadius: 10,
            borderBottomLeftRadius: 10,
            elevation: 10,
            shadowColor: "#000000",
            shadowOffset: 5,
            shadowRadius: 10,
            shadowOpacity: 0.5,
            marginHorizontal: 10,
            marginBottom: 70,
          }}
        >
          {/* Summary */}
          <View
            style={{
              padding: 10,
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: "inter",
                  fontSize: 17,
                }}
              >
                Summary
              </Text>
            </View>
            {/* Underline */}
            <View
              style={{
                marginBottom: 5,
                backgroundColor: "#3131C9",
                borderRadius: 3,
                fontSize: 15,
                fontWeight: 600,
                width: 90,
                height: 3,
              }}
            ></View>
            {moment(selectedDate, "dddd, MMMM Do YYYY").date() >
              new Date().getDate() &&
            moment(selectedDate, "dddd, MMMM Do YYYY").month() >=
              new Date().getMonth() ? (
              <Text
                style={{
                  fontFamily: "inter",
                  fontSize: 14,
                }}
              >
                Woah, are you trying to peek into the future? because there's
                nothing to see here.
              </Text>
            ) : (
              summaryText(audioLogs, filterSelectedDateEmojis)
            )}
          </View>

          {/* Moods */}
          {filterSelectedDateEmojis.length > 0 && (
            <View>
              <View
                style={{
                  marginTop: 10,
                  padding: 10,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: "inter",
                      fontSize: 17,
                    }}
                  >
                    Moods
                  </Text>
                </View>

                {/* Underline */}
                <View
                  style={{
                    marginBottom: 5,
                    backgroundColor: "#3131C9",
                    borderRadius: 3,
                    fontSize: 15,
                    fontWeight: 600,
                    width: 65,
                    height: 3,
                  }}
                ></View>
              </View>
              <ScrollView
                showsHorizontalScrollIndicator={false}
                horizontal={true}
                style={{
                  width: "100%",
                  minHeight: 150,
                  paddingHorizontal: 10,
                  overflow: "visible",
                }}
              >
                {filterSelectedDateEmojis.map((emoji, index, arr) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      marginRight: 10,
                      overflow: "visible",
                      minHeight: 120,
                      minWidth: 120,
                      paddingLeft: 20,
                      paddingTop: 20,
                    }}
                  >
                    <View
                      style={{
                        minHeight: 90,
                        overflow: "visible",
                      }}
                    >
                      <View
                        style={{
                          width: 90,
                          height: 90,
                          borderRadius: 90,
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "visible",
                          marginHorizontal: 10,
                        }}
                      >
                        <Image
                          source={emotions.assets[emoji.emojiId]}
                          style={{
                            width: 200,
                            height: 200,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          fontFamily: "inter",
                          color: "rgba(0, 0, 0, 0.4)",
                          minHeight: 30,
                          textAlign: "center",
                          width: 110,
                          fontSize: 12,
                        }}
                      >
                        {getEmojiTime(emoji.date)}
                      </Text>
                    </View>
                    {index !== arr.length - 1 && (
                      <View
                        style={{
                          width: 70,
                          borderColor: "#3131C9",
                          borderStyle: "solid",
                          borderWidth: 0.5,
                          borderRadius: 1,
                          transform: [{ translateY: 45 }, { translateX: 15 }],
                        }}
                      ></View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Audio logs */}
          {audioLogs.length > 0 && (
            <View>
              <View
                style={{
                  padding: 10,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: "inter",
                      fontSize: 17,
                    }}
                  >
                    Voice Notes
                  </Text>
                </View>

                {/* Underline */}
                <View
                  style={{
                    marginBottom: 5,
                    backgroundColor: "#3131C9",
                    borderRadius: 3,
                    fontSize: 15,
                    fontWeight: 600,
                    width: 112,
                    height: 3,
                  }}
                ></View>
                <View
                  style={{
                    width: "100%",
                    marginTop: 10,
                  }}
                >
                  {audioLogs
                    .sort(
                      (a, b) =>
                        moment(
                          b.split(fileSeperator)[2],
                          "MMMM Do YYYY, h:mm:ss a"
                        )
                          .toDate()
                          .getTime() -
                        moment(
                          a.split(fileSeperator)[2],
                          "MMMM Do YYYY, h:mm:ss a"
                        )
                          .toDate()
                          .getTime()
                    )
                    .map((log, index) => {
                      return (
                        <View
                          key={index}
                          style={{
                            backgroundColor:
                              index === currentAudioPlayingID
                                ? "aliceblue"
                                : "white",
                            padding: 5,
                            elevation: 15,
                            shadowColor: "rgba(0, 0, 0, 0.7)",
                            shadowOffset: {
                              width: 0,
                              height: 20,
                            },
                            shadowRadius: 20,
                            shadowOpacity: 0.5,
                            borderRadius: 15,
                            marginBottom: 20,
                          }}
                        >
                          <View
                            style={{
                              alignItems: "flex-end",
                            }}
                          >
                            {/* Audio log timestamp */}
                            <Text
                              style={{
                                fontFamily: "inter",
                                color: "rgba(0, 0, 0, 0.4)",
                                fontSize: 12,
                                padding: 5,
                                backgroundColor: "transparent",
                                borderBottomRightRadius: 0,
                                borderBottomLeftRadius: 0,
                              }}
                            >
                              {getAudioLogTime(
                                log.split(fileSeperator)[2].replace(".txt", "")
                              )}
                            </Text>
                          </View>
                          <View
                            key={index}
                            style={{
                              borderTopRightRadius: 0,
                              flexDirection: "row",
                              alignItems: "flex-start",
                              width: "100%",
                              marginBottom: 10,
                            }}
                          >
                            {/* Audio Player */}
                            <View>
                              {/* Play/Pause Button */}
                              <TouchableOpacity
                                disabled={isDisabled}
                                onPress={async () => {
                                  const uri =
                                    FileSystem.documentDirectory +
                                    "/audio-logs/" +
                                    log;
                                  handlePress(uri, index);
                                }}
                                style={{
                                  width: 50,
                                  height: 50,
                                  borderRadius: 50,
                                  overflow: "hidden",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginRight: 5,
                                  backgroundColor: "white",
                                  borderColor: "rgba(0, 0, 0, 0.3)",
                                  borderWidth: 1,
                                  borderStyle: "solid",
                                }}
                              >
                                {isPlaying &&
                                currentAudioPlayingID === index ? (
                                  <Pause width={30} />
                                ) : (
                                  <Play width={30} />
                                )}
                              </TouchableOpacity>
                            </View>
                            <View style={{ flex: 1 }}>
                              {/* Audio Title */}
                              <Text
                                style={{
                                  fontFamily: "inter",
                                  fontSize: 15,
                                  fontWeight: "600",
                                }}
                              >
                                {log.split(fileSeperator)[0]}
                              </Text>

                              {/* Audio Seek */}
                              <View
                                style={{
                                  width: "100%",
                                  height: 2,
                                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                                  borderRadius: 2,
                                  marginVertical: 20,
                                }}
                              >
                                <View
                                  style={{
                                    width:
                                      currentAudioPlayingID === index
                                        ? `${
                                            (positionMillis / durationMillis) *
                                            100
                                          }%`
                                        : 0,
                                    height: 2,
                                    backgroundColor: "#3131C9",
                                    borderRadius: 2,
                                    position: "absolute",
                                    bottom: 0,
                                  }}
                                ></View>
                              </View>

                              {/* Audio Time */}
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "flex-end",
                                  justifyContent: "space-between",
                                }}
                              >
                                {index === currentAudioPlayingID ? (
                                  <Text
                                    style={{
                                      fontFamily: "inter",
                                    }}
                                  >
                                    <Text>
                                      {showTime("min", positionMillis)}
                                    </Text>
                                    <Text>
                                      :{showTime("sec", positionMillis)}
                                    </Text>
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      fontFamily: "inter",
                                    }}
                                  >
                                    <Text>00</Text>
                                    <Text>:00</Text>
                                  </Text>
                                )}
                                <Text
                                  style={{
                                    fontFamily: "inter",
                                  }}
                                >
                                  <Text>
                                    {showTime(
                                      "min",
                                      log.split(fileSeperator)[1]
                                    )}
                                  </Text>
                                  <Text>
                                    :
                                    {showTime(
                                      "sec",
                                      log.split(fileSeperator)[1]
                                    )}
                                  </Text>
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
      <Nav navigation={navigation} />
    </SafeAreaView>
  );
};

export default LogsScreen;
