import React, { useRef } from "react";
import { View } from "react-native";
import { Video } from "expo-av";
import backgroundVideo from "../assets/test-video.mp4";
import { loadingStyles } from "../styles/loading";

export default function LoadingScreen() {
  const video = useRef(null);
  return (
    <View style={loadingStyles.container}>
      <Video
        ref={video}
        style={loadingStyles.backgroundVideo}
        source={backgroundVideo}
        useNativeControls={false}
        resizeMode="cover"
        isLooping={false}
        shouldPlay={true}
      />
    </View>
  );
}
