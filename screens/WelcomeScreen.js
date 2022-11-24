import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ImageBackground,
  Text,
  Image,
  FlatList,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavTop from "../shared/NavTop";
import tw from "tailwind-react-native-classnames";
import AsyncStorage from "@react-native-community/async-storage";
import slides from "../constants/slides";
import OnbordingItem from "../components/OnbordingItem";
import Paginator from "../components/Paginator";
import NextButton from "../components/NextButton";

export default function WelcomeScreen({ navigation }) {
  let tm;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTimedScreen, setShowTimedScreen] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      console.log("Last Item");
    }
  };

  const checkOnboarding = async () => {
    try {
      const value = await AsyncStorage.getItem("@viewedOnboarding");
      console.log(value);
      if (value !== null) {
        console.log(value);
        setShowTimedScreen(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (showTimedScreen) {
      tm = setTimeout(() => navigation.navigate("emoji"), 3000);
    }

    return () => {
      if (tm) clearTimeout(tm);
    };
  }, [showTimedScreen]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!showTimedScreen ? (
        <ImageBackground
          source={require("../assets/nav/background.png")}
          style={{
            width: "100%",
            height: "100%",
            flex: 1,
            resizeMode: "contain",
            alignItems: "center",
          }}
        >
          <NavTop
            type="Skip"
            navigation={navigation}
            location="emoji"
            skipWelcome={true}
          />
          <View
            style={{
              flex: 6,
              alignItems: "center",
            }}
          >
            {/* <Text
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
          </View> */}
            <FlatList
              data={slides}
              renderItem={({ item }) => <OnbordingItem item={item} />}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              bounces={false}
              keyExtractor={(item) => item.id}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              onViewableItemsChanged={viewableItemsChanged}
              viewabilityConfig={viewConfig}
              scrollEventThrottle={32}
              ref={slidesRef}
            />
          </View>
          <Paginator data={slides} scrollX={scrollX} />
          <NextButton
            scrollTo={scrollTo}
            percentage={(currentIndex + 1) * (100 / slides.length)}
            currentIndex={currentIndex}
            slidesLength={slides.length}
            navigation={navigation}
          />
        </ImageBackground>
      ) : (
        <ImageBackground
          source={require("../assets/nav/background.png")}
          style={{
            width: "100%",
            height: "100%",
            flex: 1,
            resizeMode: "contain",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flex: 6,
              alignItems: "flex-start",
              paddingTop: 10,
            }}
          >
            <View style={{ width: "100%", padding: 10 }}>
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
                }}
              >
                Welcome Back...
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                width: "100%",
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "center",
                marginTop: 50,
              }}
            >
              <Image
                source={require("../assets/welcomeScreen/InteriorDesign.png")}
                style={{ width: "80%" }}
              />
            </View>
          </View>
        </ImageBackground>
      )}
    </SafeAreaView>
  );
}
