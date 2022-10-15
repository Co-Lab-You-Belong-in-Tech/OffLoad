import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { Octicons } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";
import Record from "../assets/nav/Record.svg";
import Calendar from "../assets/nav/Calendar.svg";
import Profile from "../assets/nav/Profile.svg";

const Nav = ({ navigation }) => {
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
        "px-3",
        "justify-between",
        {
          backgroundColor: "#3131C9",
          alignItems: "center",
          paddingHorizntal: 10,
        }
      )}
    >
      <TouchableOpacity onPress={() => navigation.navigate("home")}>
        <View style={tw` items-center  rounded-sm`}>
          <Record width={30} height={30} />
        </View>
      </TouchableOpacity>

      {/* <TouchableOpacity onPress={() => navigation.navigate("logs")}>
        <View style={tw` items-center rounded-sm`}>
          <AntDesign
            name="profile"
            size={20}
            color="black"
            style={tw`pb-2 font-light text-gray-500`}
          />
        </View>
      </TouchableOpacity> */}

      <TouchableOpacity onPress={() => navigation.navigate("calendar")}>
        <View style={tw`items-center rounded-sm`}>
          <Calendar width={30} height={30} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("profile")}>
        <View style={tw` items-center  rounded-sm`}>
          <Profile width={30} height={30} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Nav;
