import React, { useState } from "react";
import {
  View,
  ImageBackground,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavTop from "../shared/NavTop";
import tw from "tailwind-react-native-classnames";
import { emotions } from "../assets/emoticons/emotions";
import { storeEmojiId } from "../store/appSlice";
import { useDispatch } from "react-redux";

export default function EmojiScreen({ navigation }) {
  const dispatch = useDispatch();
  const handleEmojiPress = (id) => {
    setEmojiId(id);
  };

  const [emojiId, setEmojiId] = useState(null);

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
        <NavTop type="Skip" navigation={navigation} location="home" />
        <View
          style={{
            alignItems: "center",
            position: "relative",
            flex: 1,
          }}
        >
          <Text
            style={{
              color: "#3131C9",
              fontFamily: "titan",
              fontSize: 40,
              marginTop: 70,
              width: "100%",
              padding: 15,
            }}
          >
            How are you feeling today?
          </Text>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "center",
              //   marginTop: 50,
            }}
          ></View>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal={emojiId === null}
            style={{ width: "100%", height: "30%" }}
          >
            {emojiId === null &&
              Object.keys(emotions.assets).map((emoji) => {
                return (
                  <View key={emoji} style={{ borderRadius: 200 }}>
                    <TouchableOpacity
                      style={{
                        borderRadius: 200,
                      }}
                      onPress={() => handleEmojiPress(emoji)}
                    >
                      <Image
                        style={{
                          width: 200,
                          height: 200,
                        }}
                        source={emotions.assets[emoji]}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })}
            {emojiId !== null && (
              <View
                style={{
                  borderRadius: 200,
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={{
                    borderRadius: 200,
                  }}
                >
                  <Image
                    style={{
                      width: 200,
                      height: 200,
                    }}
                    source={emotions.assets[emojiId]}
                  />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          {emojiId && (
            <View
              style={{
                width: "100%",
                minHeight: 70,
                alignSelf: "flex-end",
                position: "absolute",
                bottom: 0,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10,
              }}
            >
              <TouchableOpacity onPress={() => setEmojiId(null)}>
                <Text
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    fontFamily: "inter",
                    backgroundColor: "transparent",
                    fontSize: 18,
                    color: "rgba(0, 0, 0, 0.8)",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  dispatch(storeEmojiId(emojiId));
                  navigation.navigate("home");
                }}
              >
                <Text
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    fontFamily: "inter",
                    backgroundColor: "#3131C9",
                    fontSize: 18,
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  Let's Go
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
