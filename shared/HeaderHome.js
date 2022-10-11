import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import tw from "tailwind-react-native-classnames";
import auth from "@react-native-firebase/auth";

const HeaderHome = ({ signOut }) => {
  return (
    <View style={tw`w-full flex-row justify-between items-center  mt-3 `}>
      <Text style={tw`font-bold text-xl`}>Good morning</Text>

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
