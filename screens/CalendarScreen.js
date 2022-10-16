// import React, { useEffect, useCallback, useState } from "react";
// import tw from "tailwind-react-native-classnames";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";
// import auth from "@react-native-firebase/auth";
// import * as FileSystem from "expo-file-system";
// import firebase from "@react-native-firebase/app";
// import firestore from "@react-native-firebase/firestore";
// import Nav from "../shared/Nav";
// import {
//   Octicons,
//   Feather,
//   Entypo,
//   FontAwesome5,
//   Ionicons,
//   Fontisto,
// } from "@expo/vector-icons";
// import { Audio } from "expo-av";
// import { ScrollView, Modal } from "react-native";
// import HeaderHome from "../shared/HeaderHome";

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ImageBackground,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo } from "@expo/vector-icons";
import NavTop from "../shared/NavTop";
import Nav from "../shared/Nav";
import { useDispatch, useSelector } from "react-redux";
import { resetScreen, setScreen } from "../store/appSlice";

const emojiData = async () => {
  const fileStatus = await FileSystem.getInfoAsync(
    FileSystem.documentDirectory + "/emojis"
  );

  try {
    if (fileStatus.exists) {
      const emojisMemoryLocations = await FileSystem.readDirectoryAsync(
        FileSystem.documentDirectory + "/emojis"
      );
      const newData = emojisMemoryLocations.map((location) => {
        return FileSystem.documentDirectory + /emojis/ + `${location}`;
      });

      console.log(newData);
      // let usableData = newData.map((data) =>
      //   Promise.all(
      //     FileSystem.readAsStringAsync(data, {
      //       encoding: FileSystem.EncodingType.UTF8,
      //     })
      //   )
      // );
      let usableData = newData.map((data) =>
        Promise.all(
          FileSystem.readAsStringAsync(data, {
            encoding: FileSystem.EncodingType.UTF8,
          })
        )
      );
      console.log(usableData);
    }
  } catch (errors) {
    console.log(errors);
  }
};

// const dummyData = [
//   { id: 1, mood: "☺️", date: new Date(2022, 8, 2) },
//   { id: 2, mood: "☺️", date: new Date(2022, 11, 2) },
//   { id: 3, mood: "☺️", date: new Date(2022, 9, 2) },
//   { id: 4, mood: "😂", date: new Date(2022, 9, 4) },
//   { id: 5, mood: "😔", date: new Date(2022, 9, 5) },
//   { id: 6, mood: "😡", date: new Date(2022, 9, 6) },
//   { id: 7, mood: "😁", date: new Date(2022, 9, 7) },
//   { id: 8, mood: "😁", date: new Date(2022, 9, 18) },
//   { id: 9, mood: "🥶", date: new Date(2022, 3, 19) },
//   { id: 10, mood: "😤", date: new Date(2022, 6, 24) },
//   { id: 11, mood: "😤", date: new Date(2022, 9, 9) },
// ];

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
  const [showModal, setShowModal] = useState(false);

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
          activeDate.getFullYear() === mood.date.getFullYear() &&
          activeDate.getMonth() === mood.date.getMonth() &&
          mood.date.getDate() === n
        )
          return mood.mood;
      }
    },
    [activeDate]
  );

  const generateMatrix = useCallback(() => {
    let matrix = [];

    // check if matrix is memoized
    // for (var i = 0; i < memoizedMatrices.length; i++) {
    //   const { year: memoYear, month: memoMonth } = memoizedMatrices[i];
    //   if (
    //     JSON.stringify({ year: memoYear, month: memoMonth }) ===
    //     JSON.stringify({ year: year, month: month })
    //   ) {
    //     console.log(memoizedMatrices[i].matrix);
    //     matrix = [...memoizedMatrices[i].matrix];
    //     return matrix;
    //   }
    // }

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
              shadowColor: item !== -1 ? "#7e7e7e" : "#fff",
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
                setShowModal(true);
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
                      ? "#3131C19"
                      : "transparent",
                  borderRadius: 10,
                  justifyContent: "center",
                  marginVertical: 3,
                  fontFamily: "inter",
                  fontSize: 15,
                  fontWeight: "bold",
                }}
              >
                {item != -1 ? item : ""}
              </Text>
              {item != -1 && rowIndex !== 0 && (
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: "center",
                    fontFamily: "inter",
                  }}
                >
                  {item != -1 ? _findEmoji(item) : ""}
                </Text>
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

  // Set current screen on screen load
  useEffect(() => {
    dispatch(setScreen("calendar"));
    emojiData();

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
        <NavTop
          type="Back"
          times={1}
          navigation={navigation}
          location="emoji"
        />
        <View style={{ flex: 1 }}>
          {/* Modal Content*/}
          <Modal visible={showModal} animationType="slide" transparent>
            <View
              style={{
                flex: 1,
                width: "100%",
                padding: 20,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
              }}
            >
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
                  onPress={() => setShowModal(false)}
                >
                  <Text
                    style={{
                      textAlign: "right",
                      width: "100%",
                      color: "white",
                    }}
                  >
                    {"❌"}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text>This is the modal.</Text>
            </View>
          </Modal>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                flexDirection: "row",
                minHeight: 80,
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

// Export for now to get rid of error and see preview:
export default CalendarScreen;
