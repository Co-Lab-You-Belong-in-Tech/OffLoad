import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import tw from "tailwind-react-native-classnames";
import auth from "@react-native-firebase/auth";
import greetings from "../helpers/greeting";

const HeaderHome = ({ signOut }) => {
  return (
    <View style={tw`w-full flex-row justify-between items-center  mt-3 px-4`}>
      <Text
        style={{
          fontFamily: "inter",
          fontSize: 20,
          width: "auto",
        }}
      >
        {greetings()}
      </Text>

      <TouchableOpacity onPress={signOut} style={tw`mr-2`}>
        <Image
          source={{ uri: auth()._user?.photoURL }}
          resizeMode="contain"
          style={tw`h-10 rounded-full w-10`}
        />
      </TouchableOpacity>
    </View>
  );
};

export default HeaderHome;
