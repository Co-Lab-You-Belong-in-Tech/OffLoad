import React from "react";
import { View, StyleSheet, Animated, useWindowDimensions } from "react-native";

const Paginator = ({ data, scrollX }) => {
  const { width } = useWindowDimensions();
  return (
    <View style={styles.container}>
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [7, 14, 7],
          extrapolate: "clamp",
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });
        return (
          <Animated.View
            style={[styles.dot, { width: dotWidth, opacity }]}
            key={i.toString()}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 10,
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 7,
    borderRadius: 5,
    backgroundColor: "#3131C9",
    marginHorizontal: 8,
  },
});

export default Paginator;
