import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Sign-In Component
export default function SignIn({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [userAssignments, setUserAssignments] = useState([]);

  // Sign-In Function
  const handleSignIn = async () => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user-specific data from the database
      const userDocRef = doc(firestore, "users", user.uid); // Assumes 'users' is your Firestore collection

      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Update state with user data
        setUserCourses(userData.courses || []);
        setUserAssignments(userData.assignments || []);
      }

      // Successful sign-in
      onSignIn(user); // Notify the parent component that the user is signed in
    } catch (error) {
      setError(error.message); // Handle sign-in errors
    }
  };

  // Web UI - Sign-In
  return (
    <View style={styles.container}>
      <Text style={styles.signInText}>Sign In</Text>
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
      <Button title="Sign In" onPress={handleSignIn} color="#00b3b3" />
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
  signInText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: "100%",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
});
