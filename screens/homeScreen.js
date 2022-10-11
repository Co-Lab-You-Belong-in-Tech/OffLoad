import { View, Text, TouchableOpacity, Image, Button } from "react-native";
import React, { useEffect, useState } from "react";
import tw from "tailwind-react-native-classnames";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import firebase from "@react-native-firebase/app";
import firestore from "@react-native-firebase/firestore";
import Nav from "../shared/Nav";
import {
  Octicons,
  Feather,
  Entypo,
  FontAwesome5,
  Ionicons,
  Fontisto,
} from "@expo/vector-icons";
import { Audio } from "expo-av";
import { ScrollView } from "react-native";
import HeaderHome from "../shared/HeaderHome";

const HomeScreen = () => {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState();
  const [firebaseSound, setFirebaseSound] = useState();
  const [message, setMessage] = useState("");
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    return recordings
      ? () => {
          console.log("Unloading Sound");
          recordings.sound.unloadAsync();
        }
      : undefined;
  }, [recordings]);

  const signOutHandler = async () => {
    console.log("pressed");
    await GoogleSignin.revokeAccess();
    auth()
      .signOut()
      .then(() => console.log("logged out"))
      .catch((err) => console.log(err));
  };

  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        console.log("Starting recording..");
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        console.log("Recording started", recording);
      } else {
        setMessage("Please grant permission to access microphone!");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    try {
      setRecording(undefined);
      await recording.stopAndUnloadAsync();

      const { sound, status } = await recording.createNewLoadedSoundAsync();
      console.log("sound ----", sound);
      console.log("status", status);
      let updatedRecordings = {
        sound: sound,
        duration: getDurationFormatted(status.durationMillis),
        file: recording.getURI(),
      };

      setRecordings(updatedRecordings);
      if (recordings) {
        console.log(recordings);
      }

      console.log("recording stopped");
    } catch (err) {
      console.log("error ocuured", err);
    }
  };

  const getDurationFormatted = (millis) => {
    const minutes = millis / 1000 / 60;
    const minutesDisplay = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesDisplay) * 60);
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;

    return `${minutesDisplay} : ${secondsDisplay}`;
  };

  return (
    <View style={tw`flex-1`}>
      <ScrollView style={tw` flex-1 bg-blue-100 p-3 px-4`}>
        {/* header image and text container */}
        <HeaderHome signOut={signOutHandler} />

        <View style={tw` w-1/2 mt-10`}>
          <Text style={tw`py-2 text-lg font-bold text-left text-gray-500`}>
            Hi {auth()._user.displayName.split(" ")[0]}!
          </Text>

          <Text style={tw`text-gray-500 font-semibold text-base`}>
            How was your shift
          </Text>
        </View>

        <Fontisto
          style={tw` mt-6 text-center`}
          name="smiley"
          size={80}
          color="black"
        />

        {/* mic container */}
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={tw` w-16 self-center mt-10`}
        >
          <View
            style={tw` rounded-full bg-gray-500 w-16 h-16 flex-row justify-center items-center`}
          >
            {!recording ? (
              <Feather name="mic" size={30} color="white" />
            ) : (
              <FontAwesome5 name="stop" size={30} color="white" />
            )}
          </View>
        </TouchableOpacity>

        {/* recording timer */}
        <View style={tw`flex-row  justify-center mt-4`}>
          <Text style={tw`font-bold text-xl`}>00:</Text>
          <Text style={tw`font-bold text-xl`}>00:</Text>
          <Text style={tw`font-bold text-xl`}>00</Text>
        </View>

        {/* display recorded audio */}
        {recordings && (
          <View style={tw`flex-row  mt-6 w-1/2 self-center justify-around`}>
            <TouchableOpacity style={tw`rounded-full p-3 bg-gray-400`}>
              <Entypo name="save" size={30} color="white" />
            </TouchableOpacity>
            {/* 
            <TouchableOpacity style={tw`rounded-full p-3 bg-gray-400`}>
              <Entypo
                onPress={() => recordings.sound.playAsync()}
                name="controller-play"
                size={30}
                color="white"
              />
              <Ionicons
                onPress={() => recordings.sound.pauseAsync()}
                name="pause-sharp"
                size={30}
                color="white"
              />
            </TouchableOpacity> */}
            <TouchableOpacity style={tw`rounded-full p-3 bg-gray-400`}>
              <Entypo
                onPress={() => recordings.sound.playAsync()}
                name="controller-play"
                size={30}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => recordings.sound.pauseAsync()}
              style={tw`rounded-full p-3 bg-gray-400`}
            >
              <Ionicons name="pause-sharp" size={30} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* end */}
      </ScrollView>
      <Nav />
    </View>
  );
};

export default HomeScreen;
