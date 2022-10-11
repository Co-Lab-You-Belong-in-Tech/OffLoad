import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Entypo, Feather } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";

const Nav = () => {
  return (
    <View
      style={tw` p-2  absolute bottom-0 left-0 w-full h-16  rounded-t-3xl bg-gray-200 flex-row items-end px-3 justify-between`}
    >
      <TouchableOpacity>
        <View style={tw` items-center  rounded-sm`}>
          <Entypo
            style={tw`pb-2  font-light text-gray-500`}
            name="home"
            size={20}
            color="black"
          />
          <Text style={tw`font-light text-xs text-gray-500`}>Home</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity>
        <View style={tw` items-center rounded-sm`}>
          <Feather
            name="log-out"
            style={tw`pb-2  font-light text-gray-500`}
            size={20}
            color="black"
          />
          <Text style={tw`font-light text-xs text-gray-500`}>Logs</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity>
        <View style={tw`items-center rounded-sm`}>
          <Feather
            style={tw`pb-2 font-light text-gray-500`}
            name="log-out"
            size={20}
            color="black"
          />
          <Text style={tw`font-light text-xs text-gray-500`}>Calendar</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity>
        <View style={tw` items-center  rounded-sm`}>
          <Feather
            style={tw`pb-2 font-light text-gray-500`}
            name="log-out"
            size={20}
            color="black"
          />
          <Text style={tw`font-light text-xs text-gray-500`}>Profile</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Nav;
