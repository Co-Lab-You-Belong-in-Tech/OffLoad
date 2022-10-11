import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { loginStyles } from "../styles/login";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import tw from "tailwind-react-native-classnames";

import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

export default function LoginScreen({ navigation }) {
  const onGoogleButtonPress = async () => {
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const userSignedIn = auth().signInWithCredential(googleCredential);

    userSignedIn
      .then((user) => {
        console.log("signed in");
      })
      .catch((err) => console.log(err));
  };

  const image = {
    uri: "https://images.unsplash.com/photo-1495422964407-28c01bf82b0d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8Ymx1cnJ5JTIwYmFja2dyb3VuZHxlbnwwfHwwfHw%3D&w=1000&q=80",
  };

  return (
    <SafeAreaView>
      <ImageBackground source={image} resizeMode="cover" style={tw`h-full`}>
        <View style={tw`p-4 my-auto`}>
          <View style={tw`mt-10`}>
            <Text style={tw`font-bold text-white text-4xl`}>
              Welcome to HeadiesBox
            </Text>
            <Text style={tw`text-gray-200 font-semibold`}>
              Create an account or login to start your journey.
            </Text>

            <View style={tw` mt-5`}>
              <GoogleSigninButton
                // style={{ width: 192, height: 48 }}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Light}
                style={tw`w-full py-6 rounded-md shadow h-16 text-xl`}
                onPress={onGoogleButtonPress}
              />

              {/* <TouchableOpacity onPress={() => {}}>
                <View
                  style={tw`rounded-md flex-row items-center justify-center p-4 my-4 bg-white `}
                >
                  <FontAwesome5 name="facebook" size={24} color="blue" />
                  <Text style={tw`font-semibold text-base ml-3`}>
                    Continue with Facebook
                  </Text>
                </View>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
