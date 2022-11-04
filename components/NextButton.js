import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Svg, { G, Circle } from "react-native-svg";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-community/async-storage";
import * as Animatable from "react-native-animatable";

const NextButton = ({
  percentage,
  scrollTo,
  currentIndex,
  slidesLength,
  navigation,
}) => {
  const size = 100;
  const strokeWidth = 3;
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const progressRef = useRef(null);

  const animation = (toValue) => {
    return Animated.timing(progressAnimation, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    animation(percentage);
  }, [percentage]);

  useEffect(() => {
    progressAnimation.addListener((value) => {
      const strokeDashoffset =
        circumference - (circumference * value.value) / 100;

      if (progressRef?.current) {
        progressRef.current.setNativeProps({
          strokeDashoffset,
        });
      }
    });

    return () => {
      progressAnimation.removeAllListeners();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* <Svg width={size} height={size}>
        <G rotation="-90" origin={center}>
          <Circle
            stroke="#E6E7E8"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            ref={progressRef}
            stroke="#3131C9"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </G>
      </Svg> */}
      <TouchableOpacity
        onPress={async () => {
          if (currentIndex === slidesLength - 1) {
            try {
              console.log("settingItem");
              await AsyncStorage.setItem("@viewedOnboarding", "true");
            } catch (error) {
              console.log("Error @setItem:", error);
            }
            navigation.navigate("emoji");
          } else {
            scrollTo();
          }
        }}
      >
        <Animatable.View
          animation={
            currentIndex === slidesLength - 1 ? "rubberBand" : "bounceIn"
          }
          style={[
            styles.button,
            currentIndex !== slidesLength - 1 && {
              backgroundColor: "transparent",
            },
          ]}
        >
          <Text
            style={[
              styles.text,
              currentIndex !== slidesLength - 1 && {
                color: "#3131C9",
                marginRight: 10,
              },
            ]}
          >
            {currentIndex !== slidesLength - 1 ? "Swipe Next" : "Continue"}
          </Text>
          {currentIndex !== slidesLength - 1 && (
            <AntDesign name="arrowright" size={12} color="#3131C9" />
          )}
        </Animatable.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  button: {
    backgroundColor: "#3131C9",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
    justifyContent: "center",
  },
  text: {
    fontFamily: "inter",
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

export default NextButton;
