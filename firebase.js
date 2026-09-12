import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGB18yaPV0mLp_F7IpIF39anH955DltdY",
  authDomain: "ohio-creole-interpreters.firebaseapp.com",
  projectId: "ohio-creole-interpreters",
  storageBucket: "ohio-creole-interpreters.firebasestorage.app",
  messagingSenderId: "327846904070",
  appId: "1:327846904070:web:b1246fa2dec5c39e109e87",
  measurementId: "G-2Z59YW71KX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Authentication Logic
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// Expose to global window so admin.js can use it without being a module
window.firebaseAuth = { auth, loginUser, logoutUser, onAuthStateChanged };
window.firebaseDb = { db, collection, addDoc, getDocs, updateDoc, doc };
