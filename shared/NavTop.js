import { View, Text, TouchableOpacity } from "react-native";
import { Entypo } from "@expo/vector-icons";
import React from "react";
import tw from "tailwind-react-native-classnames";

const NavTop = ({ navigation, type, times, location }) => {
  const figureTextOut = () => {
    if (type === "Next") return "Next";
    if (type === "Skip") return "Skip";
    if (type === "Back") return "Back";
  };

  return (
    <View
      style={tw.style({
        color: "#3131C9",
        fontFamily: "inter",
        alignItems: "center",
        flexDirection: "row",
        justifyContent:
          type === "Next" || type === "Skip" ? "flex-end" : "flex-start",
        width: "100%",
        padding: 10,
      })}
    >
      <TouchableOpacity
        onPress={() =>
          times ? navigation.goBack() : navigation.navigate(location)
        }
      >
        {type === "Next" || type === "Skip" ? (
          <Text>
            <Text
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                fontFamily: "inter",
                color: "#3131C9",
                fontSize: 20,
              }}
            >
              {figureTextOut()}
            </Text>
            <Entypo name="chevron-thin-right" size={20} color="#3131C9" />
          </Text>
        ) : (
          <Text>
            <Entypo name="chevron-thin-left" size={20} color="#3131C9" />
            <Text
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                fontFamily: "inter",
                color: "#3131C9",
                fontSize: 20,
              }}
            >
              {figureTextOut()}
            </Text>
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default NavTop;
