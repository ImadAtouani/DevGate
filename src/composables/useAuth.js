"use client"
/* eslint-disable */
import { ref, computed, onMounted } from "vue"
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/config"

// Create reactive state that can be used across components
const user = ref(null)
const isInitialized = ref(false)
const authError = ref(null)
const isPending = ref(false)

// Create and export the composable
export function useAuth() {
  const auth = getAuth()

  // Computed property to check if user is authenticated
  const isAuthenticated = computed(() => !!user.value)

  // Check authentication status
  const checkAuth = () => {
    return new Promise((resolve) => {
      // If already initialized, resolve immediately
      if (isInitialized.value) {
        resolve(user.value)
        return
      }

      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, (userData) => {
        user.value = userData
        isInitialized.value = true
        unsubscribe()
        resolve(userData)
      })
    })
  }

  // Initialize auth state on component mount
  const initAuth = () => {
    if (!isInitialized.value) {
      // Set up persistent auth state listener
      const unsubscribe = onAuthStateChanged(auth, (userData) => {
        user.value = userData
        isInitialized.value = true
      })

      // We don't unsubscribe here to keep listening for auth state changes
    }
  }

  // Login function
  const login = async (email, password) => {
    authError.value = null
    isPending.value = true

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user

      // Update last login timestamp
      const userRef = doc(db, "users", userCredential.user.uid)
      await setDoc(
        userRef,
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true },
      )

      isPending.value = false
      return userCredential.user
    } catch (error) {
      console.error("Login error:", error)
      authError.value = error.message
      isPending.value = false
      throw error
    }
  }

  // Register function
  const register = async (email, password, displayName) => {
    authError.value = null
    isPending.value = true

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName,
      })

      // Create user document in Firestore
      const userRef = doc(db, "users", userCredential.user.uid)
      await setDoc(userRef, {
        email,
        displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      })

      user.value = userCredential.user
      isPending.value = false
      return userCredential.user
    } catch (error) {
      console.error("Registration error:", error)
      authError.value = error.message
      isPending.value = false
      throw error
    }
  }

  // Login with Google function
  const loginWithGoogle = async () => {
    authError.value = null
    isPending.value = true

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const userCredential = result.user

      // Vérifie si le document utilisateur existe déjà
      const userRef = doc(db, "users", userCredential.uid)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: userCredential.email,
          displayName: userCredential.displayName,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        })
      } else {
        await setDoc(
          userRef,
          {
            lastLogin: serverTimestamp(),
          },
          { merge: true },
        )
      }

      user.value = userCredential
      isPending.value = false
      return userCredential
    } catch (error) {
      // 👉 Ici on gère proprement l'erreur de fermeture popup
      if (error.code === "auth/popup-closed-by-user") {
        console.warn("Connexion annulée par l'utilisateur.")
      } else {
        console.error("Erreur Google login:", error)
        authError.value = error.message
      }
      isPending.value = false
      // ⚡ Si tu veux éviter de throw l'erreur pour "popup-closed", tu peux ne rien faire ici
    }
  }

  // Logout function
  const logout = async () => {
    authError.value = null

    try {
      await signOut(auth)
      user.value = null
    } catch (error) {
      console.error("Logout error:", error)
      authError.value = error.message
      throw error
    }
  }

  // Reset password function
  const resetPassword = async (email) => {
    authError.value = null
    isPending.value = true

    try {
      await sendPasswordResetEmail(auth, email)
      isPending.value = false
    } catch (error) {
      console.error("Password reset error:", error)
      authError.value = error.message
      isPending.value = false
      throw error
    }
  }

  // Get user profile data
  const getUserProfile = async () => {
    if (!user.value) return null

    try {
      const userRef = doc(db, "users", user.value.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        return userDoc.data()
      }

      return null
    } catch (error) {
      console.error("Get user profile error:", error)
      throw error
    }
  }

  // Initialize auth state on component mount
  onMounted(() => {
    initAuth()
  })

  return {
    auth,
    user,
    isAuthenticated,
    isInitialized,
    authError,
    isPending,
    checkAuth,
    login,
    register,
    logout,
    resetPassword,
    getUserProfile,
    loginWithGoogle,
    initAuth,
  }
}
