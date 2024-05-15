import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button } from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Sign-Up Component
export default function SignUp({ onSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Sign-Up Function
  const handleSignUp = async () => {
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // Successful sign-up
      onSignUp(user);
    } catch (error) {
      setError(error.message);
    }
  };

  // Web UI - Sign-Up
  return (
    <View style={styles.container}>
      <Text style={styles.signUpText}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <Button title="Sign Up" onPress={handleSignUp} color="#00b359" />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// Web UI Style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 5,
    marginVertical: 10,
    width: "100%",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
