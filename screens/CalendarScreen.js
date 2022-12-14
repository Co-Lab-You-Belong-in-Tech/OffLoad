import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ImageBackground,
  Image,
} from "react-native";
import moment from "moment";
import * as FileSystem from "expo-file-system";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Animatable from "react-native-animatable";
import { Entypo } from "@expo/vector-icons";
import NavTop from "../shared/NavTop";
import Nav from "../shared/Nav";
import { useDispatch, useSelector } from "react-redux";
import { resetScreen, setScreen } from "../store/appSlice";
import { emotions } from "../assets/emoticons/emotions";

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

const CalendarScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const { currentScreen } = useSelector((state) => state.app);

  const [activeDate, setActiveDate] = useState(new Date());
  const [dummyData, setDummyData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [emojiDate, setEmojiDate] = useState(null);
  const [audioLogDate, setAudioLogDate] = useState(null);

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
                  () =>
                    new Date(
                      activeDate.getFullYear(),
                      activeDate.getMonth(),
                      item
                    )
                );
                item !== -1 &&
                  !isNaN(item) &&
                  navigation.navigate("logs", {
                    selectedDate: moment(
                      `${
                        activeDate.getMonth() + 1
                      }-${item}-${activeDate.getFullYear()}`,
                      "MM-DD-YYYY"
                    ).format("dddd, MMMM Do YYYY"),
                    audioLogDate: moment(
                      `${
                        activeDate.getMonth() + 1
                      }-${item}-${activeDate.getFullYear()}`,
                      "MM-DD-YYYY"
                    ).format("MMMM Do YYYY"),
                    filterSelectedDateEmojis: dummyData
                      .filter((data) => {
                        if (Array.isArray(data)) {
                          return (
                            new Date(data[0].date).getFullYear() ===
                              new Date(
                                new Date(
                                  activeDate.getFullYear(),
                                  activeDate.getMonth(),
                                  item
                                )
                              ).getFullYear() &&
                            new Date(data[0].date).getMonth() ===
                              new Date(
                                new Date(
                                  activeDate.getFullYear(),
                                  activeDate.getMonth(),
                                  item
                                )
                              ).getMonth() &&
                            new Date(data[0].date).getDate() ===
                              new Date(
                                new Date(
                                  activeDate.getFullYear(),
                                  activeDate.getMonth(),
                                  item
                                )
                              ).getDate()
                          );
                        }
                        return (
                          new Date(data.date).getFullYear() ===
                            new Date(
                              new Date(
                                activeDate.getFullYear(),
                                activeDate.getMonth(),
                                item
                              )
                            ).getFullYear() &&
                          new Date(data.date).getMonth() ===
                            new Date(
                              new Date(
                                activeDate.getFullYear(),
                                activeDate.getMonth(),
                                item
                              )
                            ).getMonth() &&
                          new Date(data.date).getDate() ===
                            new Date(
                              new Date(
                                activeDate.getFullYear(),
                                activeDate.getMonth(),
                                item
                              )
                            ).getDate()
                        );
                      })
                      .flatMap((x) => x),
                  });
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
          marginHorizontal: "auto",
          justifyContent: "center",
          alignSelf: "center",
          alignItems: "center",
          borderRadius: setBorderRadius(rowIndex),
          overflow: rowIndex === 0 ? "hidden" : "visible",
          marginVertical: 5,
          maxWidth: 420,
        }}
      >
        {rowItems}
      </View>
    );
  });

  // Set current screen on screen load
  useEffect(() => {
    dispatch(setScreen("calendar"));
    // resetEmojis();

    return () => {
      dispatch(resetScreen());
    };
  }, [currentScreen]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/nav/background.png")}
        style={{ flex: 1 }}
      >
        <NavTop type="Back" times={1} navigation={navigation} />
        <View style={{ flex: 1 }} onLayout={getEmojiData}>
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
                color: "rgba(0, 0, 0, 0.7)",
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
