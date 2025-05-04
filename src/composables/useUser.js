"use client";

import { ref } from "vue";
import { auth, db } from "../firebase/config";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export function useUser() {
  const user = ref(auth.currentUser);
  const userProfile = ref(null);
  const error = ref(null);
  const isPending = ref(false);

  // Get current user profile from Firestore
  const getUserProfile = async () => {
    if (!user.value) return null;

    error.value = null;
    isPending.value = true;

    try {
      const docRef = doc(db, "users", user.value.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        userProfile.value = { id: docSnap.id, ...docSnap.data() };
      } else {
        error.value = "User profile does not exist";
      }

      isPending.value = false;
      return userProfile.value;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
      return null;
    }
  };

  // Update user profile
  const updateUserProfile = async (data) => {
    if (!user.value) return false;

    error.value = null;
    isPending.value = true;

    try {
      const docRef = doc(db, "users", user.value.uid);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      // Update local userProfile
      userProfile.value = { ...userProfile.value, ...data };

      isPending.value = false;
      return true;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
      return false;
    }
  };

  return {
    user,
    userProfile,
    error,
    isPending,
    getUserProfile,
    updateUserProfile,
  };
}
