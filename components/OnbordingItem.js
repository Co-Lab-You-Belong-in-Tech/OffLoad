import React from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  useWindowDimensions,
} from "react-native";

const OnbordingItem = ({ item }) => {
  const { width } = useWindowDimensions();
  return (
    <View style={[styles.container, { width }]}>
      {item.id !== 1 ? (
        <View style={{ width: "100%", paddingHorizontal: 20 }}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
      ) : (
        <View style={{ width: "100%", paddingHorizontal: 20 }}>
          <Text style={styles.title}>Hi!</Text>
          <Text style={styles.title}>Welcome to OffLoad</Text>
        </View>
      )}
      <View
        style={{
          width,
          flex: 1,
          overflow: "hidden",
        }}
      >
        <Image
          source={item.image}
          style={[
            styles.image,
            {
              width,
              flex: 1,
              resizeMode: "cover",
              scaleX: item.id !== 1 ? 1.8 : 1,
              scaleY: item.id !== 1 ? 1.8 : 1,
            },
          ]}
        />
      </View>
      {item.id !== 1 && (
        <View>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    flex: 0.7,
    justifyContent: "center",
  },
  title: {
    width: "100%",
    fontSize: 40,
    color: "#3131C9",
    textAlign: "left",
    fontFamily: "titan",
  },
  description: {
    fontWeight: "300",
    color: "#62656b",
    textAlign: "center",
    paddingHorizontal: 32,
    fontFamily: "inter",
  },
});

export default OnbordingItem;
