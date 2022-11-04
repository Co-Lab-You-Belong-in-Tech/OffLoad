import React, { useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "tailwind-react-native-classnames";
import GoogleLogo from "../assets/loginScreen/google-logo.svg";
import Kite from "../assets/homeScreen/Kite.svg";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

export default function LoginScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const onGoogleButtonPress = async () => {
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const userSignedIn = auth().signInWithCredential(googleCredential);

    userSignedIn
      .then((user) => {
        if (user) return console.log("signed in");
        throw new Error("No user found.");
      })
      .catch((err) => console.log(err));
  };

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
        <View style={tw`p-4`}>
          <View style={tw`mt-20`}>
            <Text
              style={{
                fontFamily: "titan",
                fontSize: 48,
                color: "#3131C9",
                width: "100%",
                textAlign: "center",
              }}
            >
              Offload
            </Text>

            <View
              style={{
                marginTop: 100,
                justifyContent: "center",
              }}
            >
              <TouchableOpacity
                onPress={onGoogleButtonPress}
                style={{
                  width: "100%",
                  maxWidth: 360,
                  borderRadius: 10,
                  alignSelf: "center",
                  backgroundColor: "white",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                  shadowOffset: 5,
                  shadowOpacity: 1,
                  shadowRadius: 10,
                  elevation: 10,
                }}
              >
                <GoogleLogo width={30} height={30} />
                <Text
                  style={{
                    fontFamily: "inter",
                    color: "rgba(0, 0, 0, 0.7)",
                    paddingVertical: 20,
                    fontSize: 20,
                    fontWeight: "600",
                    marginLeft: 20,
                  }}
                >
                  Sign in with Google
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  textAlign: "center",
                  fontFamily: "inter",
                  color: "rgba(0, 0, 0, 0.7)",
                  marginTop: 20,
                }}
              >
                Sign in to continue with OffLoad.
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, marginLeft: width / 20 }}>
          <Kite />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
