import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import tw from "tailwind-react-native-classnames";
import Record from "../assets/nav/Record.svg";
import Calendar from "../assets/nav/Calendar.svg";
import Profile from "../assets/nav/Profile.svg";
import { useDispatch, useSelector } from "react-redux";
import { setScreen } from "../store/appSlice";

import { FontAwesome } from "@expo/vector-icons";

const Nav = ({ navigation }) => {
  const dispatch = useDispatch();
  const { currentScreen } = useSelector((state) => state.app);

  return (
    <View
      style={tw.style(
        "p-2",
        "absolute",
        "bottom-0",
        "left-0",
        "w-full",
        "h-16",
        "rounded-t-2xl",
        "flex-row",
        "items-end",
        "px-7",
        "justify-between",
        {
          backgroundColor: "#3131C9",
          alignItems: "center",
        }
      )}
    >
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("home");
          dispatch(setScreen("home"));
        }}
        style={{
          backgroundColor: currentScreen === "home" ? "#ffffff" : "transparent",
          padding: 10,
          borderRadius: 50,
        }}
      >
        <View style={tw` items-center  rounded-sm`}>
          <Record width={30} height={30} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate("calendar");
          dispatch(setScreen("calendar"));
        }}
        style={{
          backgroundColor:
            currentScreen === "calendar" ? "#ffffff" : "transparent",
          padding: 10,
          borderRadius: 50,
        }}
      >
        <View style={tw`items-center rounded-sm`}>
          <Calendar width={30} height={30} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          dispatch(setScreen("journal"));
          navigation.navigate("journal");
        }}
      >
        <View
          style={{
            backgroundColor:
              currentScreen === "journal" ? "#ffffff" : "transparent",
            padding: 10,
            borderRadius: 50,
          }}
        >
          <FontAwesome name="edit" size={30} color="#2196f3" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate("profile");
          dispatch(setScreen("profile"));
        }}
        style={{
          backgroundColor:
            currentScreen === "profile" ? "#ffffff" : "transparent",
          padding: 10,
          borderRadius: 50,
        }}
      >
        <View style={tw` items-center  rounded-sm`}>
          <Profile width={30} height={30} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Nav;
