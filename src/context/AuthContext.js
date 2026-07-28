import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const register = async ({ name, email, password, studentId, phone, department, college, role }) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      studentId: studentId || "",
      phone: phone || "",
      department: department || "",
      college: college || "",
      role: role || "user",
      status: "active",
      profileImage: null,
      createdAt: serverTimestamp(),
    });

    try {
      await sendEmailVerification(user);
    } catch (e) {
      console.warn("Email verification not sent:", e.message);
    }

    return user;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const existingProfile = await getDoc(doc(db, "users", user.uid));
    if (!existingProfile.exists()) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        studentId: "",
        phone: user.phoneNumber || "",
        department: "",
        college: "",
        role: "user",
        status: "active",
        profileImage: user.photoURL || null,
        createdAt: serverTimestamp(),
      });
    }

    return user;
  };

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  const fetchProfile = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() };
      setUserProfile(data);
      return data;
    }
    return null;
  };

  const isAdmin = userProfile?.role === "admin";
  const isStaff = userProfile?.role === "staff" || userProfile?.role === "admin";
  const isSecurityOfficer = userProfile?.role === "security_officer";
  const isEmailVerified = currentUser?.emailVerified || false;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    isStaff,
    isSecurityOfficer,
    isEmailVerified,
    loading,
    register,
    loginWithGoogle,
    login,
    logout,
    resetPassword,
    fetchProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
