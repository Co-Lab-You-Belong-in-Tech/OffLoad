import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ImageBackground,
  Image,
  ScrollView,
} from "react-native";
import moment from "moment";
import * as FileSystem from "expo-file-system";
import { SafeAreaView } from "react-native-safe-area-context";
import showTime from "../helpers/showTime";
import { Entypo } from "@expo/vector-icons";
import NavTop from "../shared/NavTop";
import Nav from "../shared/Nav";
import { useDispatch, useSelector } from "react-redux";
import { resetScreen, setScreen } from "../store/appSlice";
import { emotions } from "../assets/emoticons/emotions";
import { AntDesign } from "@expo/vector-icons";
import { fileSeperator } from "../constants/fileSeperator";
import { Audio } from "expo-av";
import Play from "../assets/homeScreen/Play.svg";
import Pause from "../assets/homeScreen/Pause.svg";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const memoizedMatrices = [];

let soundObject;
let audioInterval;
let timing = 1000;

const CalendarScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const { currentScreen } = useSelector((state) => state.app);

  const [activeDate, setActiveDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [dummyData, setDummyData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [emojiDate, setEmojiDate] = useState(null);
  const [audioLogDate, setAudioLogDate] = useState(null);
  const [audioLogs, setAudioLogs] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudioPlayingID, setCurrentAudioPlayingID] = useState(null);
  const [audioTiming, setAudioTiming] = useState(0);
  const [startTimer, setStartTimer] = useState(false);

  const filterSelectedDateEmojis = useMemo(() => {
    return dummyData
      .filter((data) => {
        if (Array.isArray(data)) {
          return (
            new Date(data[0].date).getFullYear() ===
              new Date(emojiDate).getFullYear() &&
            new Date(data[0].date).getMonth() ===
              new Date(emojiDate).getMonth() &&
            new Date(data[0].date).getDate() === new Date(emojiDate).getDate()
          );
        }
        return (
          new Date(data.date).getFullYear() ===
            new Date(emojiDate).getFullYear() &&
          new Date(data.date).getMonth() === new Date(emojiDate).getMonth() &&
          new Date(data.date).getDate() === new Date(emojiDate).getDate()
        );
      })
      .flatMap((x) => x);
  }, [selectedDate]);

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
            On this day, you offloaded your thoughts and feelings{" "}
            <Text style={{ color: "#3131C9", fontWeight: "bold" }}>
              {audioLogs.length > 1 ? audioLogs.length : "once"}
            </Text>
            {audioLogs.length > 1 ? " times" : ""} and changed your mood{" "}
            <Text style={{ color: "#3131C9", fontWeight: "bold" }}>
              {filterSelectedDateEmojis.length > 1
                ? filterSelectedDateEmojis.length
                : "once"}
            </Text>
            {filterSelectedDateEmojis.length > 1 ? " times" : ""}
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
            On this day, you did not offload your thoughts and feelings but you
            changed your mood{" "}
            <Text style={{ color: "#3131C9", fontWeight: "bold" }}>
              {filterSelectedDateEmojis.length > 1
                ? filterSelectedDateEmojis.length
                : "once"}
            </Text>
            {filterSelectedDateEmojis.length > 1 ? " times" : ""}
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
            On this day, you offloaded your thoughts and feelings{" "}
            <Text style={{ color: "#3131C9", fontWeight: "bold" }}>
              {audioLogs.length > 1 ? audioLogs.length : "once"}
            </Text>
            {audioLogs.length > 1 ? " times" : ""} but didn't add your mood
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

  const _onPress = useCallback(
    (item) => {
      // Do nothing if user clicks on date header or empty space
      if (item === -1 || isNaN(item)) return;

      // Proceed to update active date
      setActiveDate(() => {
        if (!item.match && item != -1) {
          let newDate = activeDate.setDate(item);
          return new Date(newDate);
        }
      });
    },
    [activeDate]
  );

  const changeMonth = useCallback(
    (n) => {
      setActiveDate(() => {
        return new Date(activeDate.setMonth(activeDate.getMonth() + n));
      });
    },
    [activeDate]
  );

  const setColor = useCallback(
    (rowIndex, colIndex, item = null) => {
      if ((colIndex == 0 && rowIndex == 0) || rowIndex == 0) {
        return "#fff";
      } else if (
        item === new Date().getDate() &&
        activeDate.getMonth() === new Date().getMonth()
      ) {
        return "#fff";
      } else {
        return "#A4A4A4";
      }
    },
    [activeDate]
  );

  const setBorderRadius = useCallback((rowIndex) => {
    if (rowIndex == 0) {
      return 20;
    } else {
      return 0;
    }
  }, []);

  const setFontWeight = useCallback(
    (item) => {
      if (
        item ===
          (activeDate.getDate() &&
            activeDate.getMonth() === new Date().getMonth()) ||
        (item === new Date().getDate() &&
          activeDate.getMonth() === new Date().getMonth())
      ) {
        return "bold";
      } else if (isNaN(item)) {
        return "bold";
      } else {
        return "";
      }
    },
    [activeDate]
  );

  const _findEmoji = useCallback(
    (n) => {
      for (let mood of dummyData) {
        if (
          Array.isArray(mood) &&
          activeDate.getFullYear() === new Date(mood[0].date).getFullYear() &&
          activeDate.getMonth() === new Date(mood[0].date).getMonth() &&
          new Date(mood[0].date).getDate() === n
        ) {
          return (
            <Image
              source={emotions.assets[mood[0].emojiId]}
              style={{
                width: 70,
                height: 70,
                transform: [{ translateY: -17 }],
              }}
            />
          );
        }
        if (
          activeDate.getFullYear() === new Date(mood.date).getFullYear() &&
          activeDate.getMonth() === new Date(mood.date).getMonth() &&
          new Date(mood.date).getDate() === n
        ) {
          return (
            <Image
              source={emotions.assets[mood.emojiId]}
              style={{
                width: 70,
                height: 70,
                transform: [{ translateY: -17 }],
              }}
            />
          );
        }
      }
    },
    [activeDate, dummyData]
  );

  const generateMatrix = useCallback(() => {
    let matrix = [];

    // Create header
    matrix[0] = weekDays;

    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();

    let maxDays = nDays[month];
    if (month == 1) {
      // February
      if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        maxDays += 1;
      }
    }

    var counter = 1;

    // if not continue
    for (var row = 1; row < 7; row++) {
      matrix[row] = [];
      for (var col = 0; col < 7; col++) {
        matrix[row][col] = -1;
        if (row == 1 && col >= firstDay) {
          // Fill in rows only after the first day of the month
          matrix[row][col] = counter++;
        } else if (row > 1 && counter <= maxDays) {
          // Fill in rows only if the counter's not greater than
          // the number of days in the month
          matrix[row][col] = counter++;
        }
      }
    }
    memoizedMatrices.push({ year, month, matrix });
    return matrix;
  }, [activeDate]);

  const getEmojiData = useCallback(async () => {
    const fileStatus = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + "/emojis"
    );

    try {
      if (fileStatus.exists) {
        const userMoods = await FileSystem.readAsStringAsync(
          FileSystem.documentDirectory + "/emojis/moods.json"
        );
        setDummyData(JSON.parse(userMoods));
      }
    } catch (errors) {
      console.log(errors);
    }
  }, []);

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

  // Reset emojis file || TO BE USED
  const resetEmojis = async () => {
    const { exists } = await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + "/emojis"
    );
    try {
      if (exists) {
        await FileSystem.deleteAsync(FileSystem.documentDirectory + "/emojis");
      }
      const checkAgain = await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + "/emojis"
      );
    } catch (error) {
      console.log(error);
    }
  };

  const matrix = generateMatrix();

  let rows = [];
  rows = matrix.map((row, rowIndex) => {
    const rowItems = row.map((item, colIndex) => {
      return (
        <TouchableWithoutFeedback
          key={colIndex}
          disabled={item === -1 || isNaN(item) ? true : false}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              backgroundColor: item === -1 ? "transparent" : "#3131C9",
              borderRadius: rowIndex === 0 ? 0 : 10,
              marginHorizontal: rowIndex === 0 ? 0 : 3,
              shadowColor: item !== -1 ? "#7e7e7e" : "transparent",
              shadowOffset: 1,
              shadowRadius: 3,
              elevation: 10,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                height: rowIndex == 0 ? 30 : 60,
                width: 20,
                textAlign: "center",
                flexDirection: "column",
                justifyContent: rowIndex === 0 ? "center" : undefined,
                // Highlight header
                backgroundColor:
                  rowIndex === 0 || item === -1 ? "transparent" : "#fff",
                borderRadius: 10,
              }}
              activeOpacity={item === -1 || isNaN(item) ? 1 : 0.7}
              onPress={() => {
                _onPress(item);
                setSelectedDate(
                  moment(
                    `${
                      activeDate.getMonth() + 1
                    }-${item}-${activeDate.getFullYear()}`,
                    "MM-DD-YYYY"
                  ).format("dddd, MMMM Do YYYY")
                );
                setAudioLogDate(
                  moment(
                    `${
                      activeDate.getMonth() + 1
                    }-${item}-${activeDate.getFullYear()}`,
                    "MM-DD-YYYY"
                  ).format("MMMM Do YYYY")
                );
                setEmojiDate(
                  new Date(
                    activeDate.getFullYear(),
                    activeDate.getMonth(),
                    item
                  )
                );
                item !== -1 && !isNaN(item) && setShowModal(true);
              }}
            >
              <Text
                style={{
                  // Highlight Sundays
                  color: setColor(rowIndex, colIndex, item),
                  // Highlight current date
                  fontWeight: setFontWeight(item),
                  textAlign: "center",
                  backgroundColor:
                    item === new Date().getDate() &&
                    activeDate.getMonth() === new Date().getMonth()
                      ? "#3131C9"
                      : "transparent",
                  borderRadius: 10,
                  justifyContent: "center",
                  marginBottom: 3,
                  fontFamily: "inter",
                  fontSize: rowIndex !== 0 ? 10 : 12,
                  fontWeight: "bold",
                }}
              >
                {item != -1 ? item : ""}
              </Text>
              {item != -1 && rowIndex !== 0 && (
                <View
                  style={{
                    justifyContent: "flex-start",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  {item != -1 ? _findEmoji(item) : ""}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      );
    });

    return (
      <View
        key={rowIndex}
        style={{
          flexDirection: "row",
          marginHorizontal: 15,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: setBorderRadius(rowIndex),
          overflow: rowIndex === 0 ? "hidden" : "visible",
          marginVertical: 5,
        }}
      >
        {rowItems}
      </View>
    );
  });

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
      // setLengthOfAudio(playbackStatus.durationMillis);
      if (playbackStatus.isPlaying) {
        // Update your UI for the playing state
        setIsPlaying(true);
      } else {
        // Update your UI for the paused state
        // audioIntervalId && clearInterval(audioIntervalId);
        setIsPlaying(false);
        clearInterval(audioInterval);
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
        setCurrentAudioPlayingID(null);
        soundObject = null;
      }
    }
  };

  const playRecording = async (uri, audioId) => {
    // Create a new Audio.Sound instance
    soundObject = new Audio.Sound();
    try {
      soundObject.setOnPlaybackStatusUpdate(_onPlaybackStatusUpdate);
      console.log("Loading Sound");

      // Get and load user's recorded audio stored in memory cache
      await soundObject.loadAsync({
        uri,
      });

      console.log("Playing Sound");
      await soundObject.playAsync();
      setStartTimer(true);
      // return audioTimingInterval("sound");
    } catch (error) {
      console.log(error);
    }
  };

  const handlePress = (fileLocation, ID) => {
    if (soundObject && (soundObject !== null || soundObject !== undefined)) {
      // If there is an audio file and it is paused, play it
      if (ID === currentAudioPlayingID && !isPlaying) {
        soundObject.playAsync();
        return setStartTimer(true);
        // return audioTimingInterval("sound");
      }
      // If there is an audio file and it is playing, pause it
      else if (ID === currentAudioPlayingID && isPlaying) {
        setStartTimer(false);
        return soundObject.pauseAsync();
      }
      // if there is a loaded audio file and user plays a different audio file, remove the old audio file from memory and play the new one
      else if (ID !== currentAudioPlayingID) {
        setAudioTiming(0);
        setStartTimer(false);
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
  };

  // Set current screen on screen load
  useEffect(() => {
    dispatch(setScreen("calendar"));
    // resetEmojis();

    return () => {
      dispatch(resetScreen());
    };
  }, [currentScreen]);

  // fetch audio logs if any after user clicks on a date in the calendar
  useEffect(() => {
    audioLogDate !== null && fetchAudioLogs();
  }, [audioLogDate]);

  // Control audio timer based on user's actions
  useEffect(() => {
    if (startTimer) {
      audioInterval = setInterval(() => {
        setAudioTiming((prev) => prev + timing);
      }, timing);
    }
    if (!startTimer) {
      clearInterval(audioInterval);
    }
  }, [startTimer]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/nav/background.png")}
        style={{ flex: 1 }}
      >
        <NavTop type="Back" times={1} navigation={navigation} />
        <View style={{ flex: 1 }} onLayout={getEmojiData}>
          {/* Modal Content*/}
          <Modal visible={showModal} animationType="slide" transparent>
            <View
              style={{
                flex: 1,
                width: "100%",
                padding: 10,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {/* Close Modal Button */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <TouchableOpacity
                  style={{
                    textAlign: "right",
                    width: "100%",
                  }}
                  onPress={() => {
                    setShowModal(false);
                    setAudioLogDate(null);
                  }}
                >
                  <Text
                    style={{
                      textAlign: "right",
                      width: "100%",
                      color: "white",
                    }}
                  >
                    <AntDesign name="close" size={24} color="#3131C9" />
                  </Text>
                </TouchableOpacity>
              </View>

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
                    borderRadius: 10,
                    padding: 10,
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
                  borderRadius: 10,
                  elevation: 10,
                  shadowColor: "#000000",
                  shadowOffset: 5,
                  shadowRadius: 10,
                  shadowOpacity: 0.5,
                  marginTop: 10,
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
                      width: 50,
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
                      Woah, are you trying to peek into the future? because
                      there's nothing to see here.
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
                          width: 50,
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
                                transform: [
                                  { translateY: 45 },
                                  { translateX: 15 },
                                ],
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
                          Offloads
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
                          width: 50,
                          height: 3,
                        }}
                      ></View>
                      <View
                        style={{
                          width: "100%",
                          marginTop: 10,
                        }}
                      >
                        {audioLogs.map((log, index) => {
                          return (
                            <View key={index}>
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
                                    elevation: 5,
                                    backgroundColor: "white",
                                    shadowOffset: {
                                      width: 0,
                                      height: 20,
                                    },
                                    shadowColor: "rgba(0, 0, 0, 0.4)",
                                    shadowOpacity: 1,
                                    shadowRadius: 20,
                                    borderRadius: 5,
                                    borderBottomRightRadius: 0,
                                    borderBottomLeftRadius: 0,
                                  }}
                                >
                                  {getAudioLogTime(
                                    log
                                      .split(fileSeperator)[2]
                                      .replace(".txt", "")
                                  )}
                                </Text>
                              </View>
                              <View
                                key={index}
                                style={{
                                  borderRadius: 10,
                                  borderTopRightRadius: 0,
                                  flexDirection: "row",
                                  alignItems: "flex-start",
                                  backgroundColor:
                                    index === currentAudioPlayingID
                                      ? "aliceblue"
                                      : "white",
                                  padding: 5,
                                  elevation: 5,
                                  shadowColor: "rgba(0, 0, 0, 0.4)",
                                  shadowOffset: {
                                    width: 0,
                                    height: 20,
                                  },
                                  shadowRadius: 20,
                                  shadowOpacity: 0.5,
                                  width: "100%",
                                  marginBottom: 10,
                                }}
                              >
                                {/* Audio Player */}
                                <View>
                                  {/* Play/Pause Button */}
                                  <TouchableOpacity
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
                                      backgroundColor: "#white",
                                      borderColor: "rgba(0, 0, 0, 0.3)",
                                      borderWidth: 1,
                                      borderStyle: "solid",
                                    }}
                                  >
                                    {isPlaying &&
                                    currentAudioPlayingID === index ? (
                                      <Pause width={50} />
                                    ) : (
                                      <Play width={50} />
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
                                      backgroundColor:
                                        "rgba(0, 0, 0, 0.2), borderRadius: 1",
                                      marginVertical: 20,
                                    }}
                                  ></View>

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
                                          {showTime("min", audioTiming)}
                                        </Text>
                                        <Text>
                                          :{showTime("sec", audioTiming)}
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
          </Modal>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              maxHeight: 40,
            }}
          >
            <Text
              style={{
                flexDirection: "row",
                minHeight: 40,
                padding: 0,
                paddingLeft: 15,
                textAlignVertical: "bottom",
                fontFamily: "inter",
              }}
            >
              <Text
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-end",
                  fontSize: 15,
                  textAlign: "center",
                  textAlignVertical: "bottom",
                  textTransform: "uppercase",
                }}
              >
                {months[activeDate.getMonth()]}
                &nbsp;
              </Text>
              <Text
                style={{
                  display: "flex",
                  fontWeight: "bold",
                  fontSize: 25,
                  textAlign: "left",
                  marginLeft: 15,
                  padding: 0,
                }}
              >
                {activeDate.getFullYear()} &nbsp;
              </Text>
            </Text>

            {/* Buttons */}
            <View
              style={{
                paddingRight: 15,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {/* Previous Button */}
              <TouchableOpacity
                style={{
                  padding: 5,
                  borderRadius: 5,
                  justifyContent: "center",
                  color: "#fff",
                  marginRight: 15,
                }}
                onPress={() => changeMonth(-1)}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: "#000",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    backgroundColor: "transparent",
                  }}
                >
                  <Entypo name="chevron-thin-left" size={20} color="#3131C9" />
                </Text>
              </TouchableOpacity>

              {/* Next Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: "transparent",
                  padding: 5,
                  borderRadius: 5,
                  justifyContent: "center",
                  color: "#fff",
                }}
                onPress={() => changeMonth(+1)}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: "#000",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                >
                  <Entypo name="chevron-thin-right" size={20} color="#3131C9" />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ justifyContent: "space-around", marginVertical: 20 }}>
            {rows}
          </View>
        </View>
      </ImageBackground>
      <Nav navigation={navigation} />
    </SafeAreaView>
  );
};

export default CalendarScreen;
