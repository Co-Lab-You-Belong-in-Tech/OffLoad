import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign, Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-community/async-storage";
import React from "react";
import tw from "tailwind-react-native-classnames";
import { useSelector } from "react-redux";

const NavTop = ({
  navigation,
  type,
  times,
  location,
  setShowMic,
  setShowModal,
  skipWelcome,
}) => {
  const { currentScreen } = useSelector((state) => state.app);
  const figureTextOut = () => {
    if (type === "Next") return "Next";
    if (type === "Skip") return "Skip";
    if (type === "Back") return "Back";
    if (type === "Close") return "Close";
  };
  const showButton = () => {
    if (type === "Next" || type === "Skip") {
      return (
        <Text>
          <Text
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              fontFamily: "inter",
              color: "#3131C9",
              fontSize: 14,
            }}
          >
            {figureTextOut()}
          </Text>
          <Entypo name="chevron-thin-right" size={15} color="#3131C9" />
        </Text>
      );
    } else if (type === "Close") {
      return (
        <View
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Text
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              fontFamily: "inter",
              color: "#3131C9",
              fontSize: 14,
              marginRight: 3,
            }}
          >
            {figureTextOut()}
          </Text>
          <AntDesign name="close" size={20} color="#3131C9" />
        </View>
      );
    } else {
      return (
        <Text>
          <Entypo name="chevron-thin-left" size={15} color="#3131C9" />
          <Text
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              fontFamily: "inter",
              color: "#3131C9",
              fontSize: 14,
            }}
          >
            {figureTextOut()}
          </Text>
        </Text>
      );
    }
  };

  return (
    <View
      style={tw.style({
        color: "#3131C9",
        fontFamily: "inter",
        alignItems: "center",
        flexDirection: "row",
        justifyContent:
          type === "Next" || type === "Skip" || type === "Close"
            ? "flex-end"
            : "flex-start",
        width: "100%",
        padding: 10,
      })}
    >
      <TouchableOpacity
        onPress={async () => {
          if (type === "Close") {
            return setShowModal(false);
          }
          if (type === "Skip" && skipWelcome) {
            try {
              console.log("settingItem");
              await AsyncStorage.setItem("@viewedOnboarding", "true");
              return navigation.navigate("emoji");
            } catch (error) {
              return console.log("Error @setItem:", error);
            }
          }
          currentScreen === "home" && setShowMic(false);
          times ? navigation.goBack() : navigation.navigate(location);
        }}
      >
        {showButton()}
      </TouchableOpacity>
    </View>
  );
};

export default NavTop;
