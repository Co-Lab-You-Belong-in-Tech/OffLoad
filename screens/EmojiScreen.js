import React, { useCallback, useState, useId, Fragment } from "react";
import {
  View,
  ImageBackground,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavTop from "../shared/NavTop";
import tw from "tailwind-react-native-classnames";
import * as Animatable from "react-native-animatable";
import { emotions } from "../assets/emoticons/emotions";
import { resetEmojiId, storeEmojiId } from "../store/appSlice";
import { useDispatch } from "react-redux";

const slideUpAndDown = {
  from: {
    transform: [{ translateY: 0 }],
  },
  to: {
    transform: [{ translateY: 10 }],
  },
};

export default function EmojiScreen({ navigation }) {
  const dispatch = useDispatch();
  const handleEmojiPress = (id) => {
    setEmojiId(id);
  };

  const [emojiId, setEmojiId] = useState(null);
  const [delay, _] = useState(100);
  const [emojiPositionX, setEmojiPositionX] = useState(null);
  const [emojiPositionY, setEmojiPositionY] = useState(null);

  const { width, height } = useWindowDimensions();

  // const slideIn = {
  //   from: {
  //     position: "absolute",
  //     transform: [
  //       { translateX: emojiPositionX },
  //       { translateY: emojiPositionY },
  //     ],
  //   },
  //   to: {
  //     position: "absolute",
  //     transform: [{ translateX: 0 }, { translateY: 0 }],
  //   },
  // };
  // const [fadeIn, setFadeIn] = useState({});

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
          <View
            style={{
              width: "100%",
              padding: 15,
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {"How are you feeling today?".split(" ").map((word, i) => {
              return (
                <Fragment key={i}>
                  <View
                    key={i}
                    style={{
                      color: "#3131C9",
                      fontFamily: "titan",
                      fontSize: 40,
                      flexDirection: "row",
                    }}
                  >
                    {word.split("").map((char, ind) => {
                      return (
                        <Animatable.Text
                          key={useId()}
                          animation="fadeInDown"
                          duration={100}
                          delay={i * delay + (ind + 1) * (delay / word.length)}
                          style={{
                            color: "#3131C9",
                            fontFamily: "titan",
                            fontSize: 40,
                          }}
                        >
                          {char}
                        </Animatable.Text>
                      );
                    })}
                  </View>
                  <Text>{"  "}</Text>
                </Fragment>
              );
            })}
            <Animatable.Text
              animation="fadeIn"
              duration={300}
              delay={delay}
              style={{
                color: "#rgba(0, 0, 0, 0.5)",
                fontSize: 16,
                fontFamily: "inter",
                paddingVertical: 5,
              }}
            >
              Choose the emoji that best represent your mood today.
            </Animatable.Text>
          </View>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "center",
              //   marginTop: 50,
              transform: [{ translateX: 0 }, { translateY: 0 }],
            }}
          ></View>
          <ScrollView
            showsVerticalScrollIndicator={true}
            style={{ width: "100%", flex: 1 }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-around",
                alignItems: "center",
                flex: 1,
              }}
            >
              {emojiId === null &&
                Object.keys(emotions.assets).map((emoji, index) => {
                  return (
                    <Animatable.View
                      key={emoji}
                      animation="fadeInUp"
                      delay={(index + 1) * 100}
                      duration={300}
                      style={{ borderRadius: 200 }}
                    >
                      <TouchableOpacity
                        style={{
                          borderRadius: 20,
                          backgroundColor: "white",
                          marginBottom: 20,
                          borderColor: "#dadbdf",
                          borderWidth: 1,
                          borderStyle: "solid",
                          width: width / 2 - 30,
                          height: width / 2 - 30,
                          maxWidth: 250,
                          maxHeight: 250,
                        }}
                        onPress={(event) => {
                          handleEmojiPress(emoji);
                        }}
                      >
                        <Image
                          style={{
                            width: width / 2 - 30,
                            height: width / 2 - 30,
                            maxWidth: 250,
                            maxHeight: 250,
                          }}
                          source={emotions.assets[emoji]}
                        />
                      </TouchableOpacity>
                    </Animatable.View>
                  );
                })}
              {emojiId !== null && (
                <Animatable.View
                  animation="zoomIn"
                  style={{
                    borderRadius: 20,
                    backgroundColor: "white",
                    marginBottom: 20,
                    borderColor: "#dadbdf",
                    borderWidth: 1,
                    borderStyle: "solid",
                    alignItems: "center",
                    marginTop: height / 6,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      borderRadius: 200,
                    }}
                  >
                    <Image
                      style={{
                        width: width / 2 - 30,
                        height: width / 2 - 30,
                        maxWidth: 250,
                        maxHeight: 250,
                      }}
                      source={emotions.assets[emojiId]}
                    />
                  </TouchableOpacity>
                </Animatable.View>
              )}
            </View>
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
              <TouchableOpacity
                onPress={() => {
                  setEmojiPositionX(null);
                  setEmojiPositionY(null);
                  setEmojiId(null);
                  dispatch(resetEmojiId());
                }}
              >
                <Text
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    fontFamily: "inter",
                    backgroundColor: "transparent",
                    borderColor: "#dadbdf",
                    borderWidth: 1,
                    fontSize: 15,
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
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    fontFamily: "inter",
                    backgroundColor: "#3131C9",
                    fontSize: 15,
                    color: "rgba(255, 255, 255, 0.8)",
                  }}
                >
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
