// import React, { Component } from "react";
// import { View, StyleSheet, Text } from "react-native";

// import { WaveformContianer, Wave, PlayButton } from "./Waveform.styled";

// class Waveform extends Component {
//   state = {
//     playing: false,
//   };

//   componentDidMount() {
//     const track = document.querySelector("#track");

//     this.waveform = WaveSurfer.create({
//       barWidth: 3,
//       barRadius: 3,
//       cursorWidth: 1,
//       container: "#waveform",
//       backend: "WebAudio",
//       height: 80,
//       progressColor: "#2D5BFF",
//       responsive: true,
//       waveColor: "#EFEFEF",
//       cursorColor: "transparent",
//     });

//     this.waveform.load(track);
//   }

//   handlePlay = () => {
//     this.setState({ playing: !this.state.playing });
//     this.waveform.playPause();
//   };

//   render() {
//     return (
//       <View style={styles.WaveformContianer}>
//         <View style={styles.PlayButton}>
//           <Text>Play</Text>
//         </View>
//         <View style={styles.Wave} />
//         <audio id="track" />
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   WaveformContianer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     height: 100,
//     width: "100%",
//     background: "transparent",
//   },
//   Wave: {
//     width: "100%",
//     height: 90,
//   },
//   PlayButton: {
//     display: flex,
//     justifyContent: "center",
//     alignItems: "center",
//     width: 60,
//     height: 60,
//     backgroundColor: "#EFEFEF",
//     borderRadius: "50%",
//     paddingBottom: 3,
//     //   border: "none",
//     //   outline: none,
//     //   cursor: pointer,
//     //   &:hover {
//     //     background: #DDD,
//   },
// });

// export default Waveform;
