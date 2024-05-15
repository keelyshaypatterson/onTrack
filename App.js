import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
} from "react-native";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from "@env";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";

// Firebase configuration (from environment)
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Main Application
export default function App() {
  const [courses, setCourses] = useState([]);
  const [newCourseName, setNewCourseName] = useState("");
  const [assignmentInput, setAssignmentInput] = useState("");
  const [dueDateInput, setDueDateInput] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userCourses, setUserCourses] = useState([]);
  const [userAssignments, setUserAssignments] = useState([]);
  const [assignmentInputs, setAssignmentInputs] = useState({});
  const [dueDateInputs, setDueDateInputs] = useState({});
  const [error, setError] = useState(null);

  // Handle Sign-In
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
      const userDocRef = doc(db, "users", user.uid);

      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Update state with user data
        setUserCourses(userData.courses || []);
        setUserAssignments(userData.assignments || []);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Handle new user Sign-Up
  const handleSignUp = (authenticatedUser) => {
    setUser(authenticatedUser);
    console.log("handleSignUp called");
    console.log("authenticatedUser:", authenticatedUser);
    const userDocRef = doc(db, "users", authenticatedUser.uid);

    // Define the user data you want to save
    const userData = {
      displayName: authenticatedUser.displayName,
      email: authenticatedUser.email,
      courses: courses,
      assignments: assignments,
    };

    // Set the user data in Firestore
    setDoc(userDocRef, userData)
      .then(() => {
        console.log("User data added to Firestore.");
      })
      .catch((error) => {
        console.error("Error adding user data to Firestore:", error);
      });
  };

  // Add a new Course
  const addCourse = () => {
    if (newCourseName.trim() !== "") {
      const newCourse = { id: courses.length + 1, name: newCourseName };
      setCourses([...courses, newCourse]);
      setNewCourseName("");
    }
  };

  // Add a new assignment
  const addAssignment = (courseId) => {
    const assignmentText = assignmentInputs[courseId];
    const dueDateText = dueDateInputs[courseId];

    if (assignmentText?.trim() !== "" && dueDateText?.trim() !== "") {
      const newAssignment = {
        id: assignments.length + 1,
        courseId,
        name: assignmentText,
        completed: false,
        dueDate: dueDateText,
      };
      setAssignments([...assignments, newAssignment]);

      // Clear the input fields for this courseId
      setAssignmentInputs({
        ...assignmentInputs,
        [courseId]: "",
      });
      setDueDateInputs({
        ...dueDateInputs,
        [courseId]: "",
      });
    }
  };

  // Mark the assignment
  const markAssignmentComplete = (assignmentId) => {
    setAssignments(
      assignments.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, completed: true }
          : assignment
      )
    );
  };

  // Handle Sign-Out
  const handleSignOut = () => {
    setNewCourseName("");
    setAssignmentInput("");
    setDueDateInput("");

    // Sign out the user
    signOut(auth)
      .then(() => {
        // Clear user data and reset the state
        setUser(null);
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  // Handle user authentication state
  useEffect(() => {
    // Set up an observer for the authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setUser(user);
      } else {
        // User is signed out
        setUser(null);
      }
    });

    // Clean up the observer when the component unmounts
    return () => unsubscribe();
  }, []);

  // Handle Sign-In State
  useEffect(() => {
    if (user) {
      handleSignIn(user);
    }
  }, [user]);

  // Web App UI
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to On Track</Text>

      {user ? (
        // User is signed in, display the welcome message and sign-out button
        <View>
          <Text>Welcome Back!</Text>
          <Button title="Sign Out" onPress={handleSignOut} color="#00b3b3" />

          {/* Enter Course section */}
          <TextInput
            style={styles.input}
            placeholder="Enter course name"
            value={newCourseName}
            onChangeText={(text) => setNewCourseName(text)}
          />
          <Button title="Add Course" onPress={addCourse} color="#00b300" />

          {/* Display existing courses */}
          <FlatList
            data={courses}
            renderItem={({ item }) => (
              <View>
                <Text>{item.name}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter assignment name"
                  value={assignmentInputs[item.id] || ""}
                  onChangeText={(text) => {
                    setAssignmentInputs({
                      ...assignmentInputs,
                      [item.id]: text,
                    });
                  }}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Due Date (e.g., 2023-08-31)"
                  value={dueDateInputs[item.id] || ""}
                  onChangeText={(text) => {
                    setDueDateInputs({
                      ...dueDateInputs,
                      [item.id]: text,
                    });
                  }}
                />
                <Button
                  title="Add Assignment"
                  onPress={() => addAssignment(item.id)}
                  color="#5900b3"
                />

                {/* Display assignments for this course */}
                <FlatList
                  data={assignments.filter(
                    (assignment) => assignment.courseId === item.id
                  )}
                  renderItem={({ item: assignment }) => (
                    <View>
                      <Text>Assignment: {assignment.name}</Text>
                      <Text>Due Date: {assignment.dueDate}</Text>
                      {assignment.completed ? (
                        <Text>Completed!</Text>
                      ) : (
                        <Button
                          title="Mark as Complete"
                          onPress={() => markAssignmentComplete(assignment.id)}
                          color="#b300b3"
                        />
                      )}
                    </View>
                  )}
                  keyExtractor={(assignment) => assignment.id.toString()}
                />
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      ) : (
        // User is not signed in, display sign-in and sign-up components
        <>
          <SignIn onSignIn={handleSignIn} />
          <SignUp onSignUp={handleSignUp} />
        </>
      )}
    </View>
  );
}

// Web App UI Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
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
});
