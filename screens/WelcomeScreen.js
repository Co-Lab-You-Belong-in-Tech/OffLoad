import React from "react";
import { View, ImageBackground, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavTop from "../shared/NavTop";
import tw from "tailwind-react-native-classnames";

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require("../assets/nav/background.png")}
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          resizeMode: "contain",
        }}
      >
        <NavTop type="Next" navigation={navigation} location="emoji" />
        <View
          style={{
            padding: 15,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "#3131C9",
              fontFamily: "titan",
              fontSize: 48,
              marginTop: 40,
              width: "100%",
            }}
          >
            Hi!
          </Text>
          <Text
            style={{
              color: "#3131C9",
              fontFamily: "titan",
              fontSize: 48,
              width: "100%",
            }}
          >
            Welcome to OffLoad
          </Text>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "center",
              marginTop: 50,
            }}
          >
            <Image
              source={require("../assets/welcomeScreen/InteriorDesign.png")}
              style={{ width: 300, height: 300 }}
            />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
