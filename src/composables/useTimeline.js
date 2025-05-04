"use client"

import { ref } from "vue"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore"
import { db } from "../firebase/config"
import { useAuth } from "./useAuth"

export function useTimeline() {
  const { user } = useAuth()
  const activities = ref([])
  const error = ref(null)
  const isPending = ref(false)

  // Get all activities
  const getActivities = (onSuccess, onError) => {
    if (!user.value) {
      console.error("No authenticated user found")
      if (onError) onError(new Error("User not authenticated"))
      return () => {}
    }

    isPending.value = true
    error.value = null

    // Query activities for current user
    const activitiesRef = collection(db, "timeline")
    const activitiesQuery = query(activitiesRef, where("userId", "==", user.value.uid), orderBy("createdAt", "desc"))

    // Subscribe to changes
    const unsubscribe = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        activities.value = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() }
        })
        isPending.value = false
        if (onSuccess) onSuccess(activities.value)
      },
      (err) => {
        console.error("Error getting activities:", err)
        error.value = err.message
        isPending.value = false
        if (onError) onError(err)
      },
    )

    return unsubscribe
  }

  // Get recent activities (limited)
  const getRecentActivities = (limitCount = 10) => {
    if (!user.value) {
      console.error("No authenticated user found")
      return () => {}
    }

    isPending.value = true
    error.value = null

    // Query recent activities for current user
    const activitiesRef = collection(db, "timeline")
    const activitiesQuery = query(
      activitiesRef,
      where("userId", "==", user.value.uid),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    )

    // Subscribe to changes
    const unsubscribe = onSnapshot(
      activitiesQuery,
      (snapshot) => {
        activities.value = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() }
        })
        isPending.value = false
      },
      (err) => {
        console.error("Error getting recent activities:", err)
        error.value = err.message
        isPending.value = false
      },
    )

    return unsubscribe
  }

  // Add activity
  const addActivity = async (activity) => {
    if (!user.value) {
      console.error("No authenticated user found")
      throw new Error("User not authenticated")
    }

    error.value = null
    isPending.value = true

    try {
      const activityData = {
        ...activity,
        userId: user.value.uid,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "timeline"), activityData)
      isPending.value = false
      return docRef
    } catch (err) {
      console.error("Error adding activity:", err)
      error.value = err.message
      isPending.value = false
      throw err
    }
  }

  // Add timeline event (helper function for other composables)
  const addTimelineEvent = async (eventData) => {
    if (!user.value) {
      console.error("No authenticated user found")
      throw new Error("User not authenticated")
    }

    error.value = null
    isPending.value = true

    try {
      const activityData = {
        ...eventData,
        userId: user.value.uid,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "timeline"), activityData)
      isPending.value = false
      return docRef
    } catch (err) {
      console.error("Error adding timeline event:", err)
      error.value = err.message
      isPending.value = false
      throw err
    }
  }

  // Get activities by type
  const getActivitiesByType = async (type) => {
    if (!user.value) {
      console.error("No authenticated user found")
      throw new Error("User not authenticated")
    }

    error.value = null
    isPending.value = true

    try {
      const activitiesRef = collection(db, "timeline")
      const activitiesQuery = query(
        activitiesRef,
        where("userId", "==", user.value.uid),
        where("type", "==", type),
        orderBy("createdAt", "desc"),
      )

      const snapshot = await getDocs(activitiesQuery)
      const result = snapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() }
      })

      isPending.value = false
      return result
    } catch (err) {
      console.error("Error getting activities by type:", err)
      error.value = err.message
      isPending.value = false
      throw err
    }
  }

  return {
    activities,
    error,
    isPending,
    getActivities,
    getRecentActivities,
    addActivity,
    addTimelineEvent,
    getActivitiesByType,
  }
}
