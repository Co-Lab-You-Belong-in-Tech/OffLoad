import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import * as Animatable from "react-native-animatable";
import tw from "tailwind-react-native-classnames";
import auth from "@react-native-firebase/auth";
import greetings from "../helpers/greeting";

const HeaderHome = ({ navigation }) => {
  const [delay, _] = useState(200);

  return (
    <View style={tw`w-full flex-row justify-between items-center  mt-1 px-4`}>
      <Animatable.Text
        animation="fadeInDown"
        duration={500}
        delay={delay}
        style={{
          fontFamily: "inter",
          fontSize: 18,
          width: "auto",
          color: "rgba(0, 0, 0, 0.7)",
        }}
      >
        {greetings()}, {auth()._user.displayName.split(" ")[0]}!
      </Animatable.Text>

      <Animatable.View animation="zoomIn" duration={500} delay={delay}>
        <TouchableOpacity
          onPress={() => navigation.navigate("profile")}
          style={tw`mr-2`}
        >
          <Image
            source={{ uri: auth()._user?.photoURL }}
            resizeMode="contain"
            style={tw`h-10 rounded-full w-10`}
          />
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

export default HeaderHome;
