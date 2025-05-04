/* eslint-disable */
import { ref, computed } from "vue"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore"
import { auth, db } from "../firebase/config"
import { useTimeline } from "./useTimeline"

export function useSkills() {
  const skills = ref([])
  const error = ref(null)
  const isPending = ref(false)
  const { addTimelineEvent } = useTimeline()

  // Skill levels
  const skillLevels = ["Débutant", "Intermédiaire", "Avancé"]

  // Get skills by level
  const skillsByLevel = computed(() => {
    const result = {
      Débutant: [],
      Intermédiaire: [],
      Avancé: [],
    }

    skills.value.forEach((skill) => {
      if (result[skill.level]) {
        result[skill.level].push(skill)
      }
    })

    return result
  })

  // Get user skills
  const getSkills = () => {
    if (!auth.currentUser) return

    error.value = null
    isPending.value = true

    const q = query(collection(db, "skills"), where("userId", "==", auth.currentUser.uid), orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        skills.value = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() }
        })
        isPending.value = false
      },
      (err) => {
        console.error(err.message)
        error.value = err.message
        isPending.value = false
      },
    )

    return unsubscribe
  }

  // Add a new skill
  const addSkill = async (skill) => {
    if (!auth.currentUser) return null

    error.value = null
    isPending.value = true

    try {
      // Add skill to Firestore
      const skillData = {
        ...skill,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "skills"), skillData)

      isPending.value = false
      return docRef
    } catch (err) {
      console.error(err.message)
      error.value = err.message
      isPending.value = false
      return null
    }
  }

  // Update a skill
  const updateSkill = async (id, updatedSkill) => {
    if (!auth.currentUser) return false

    error.value = null
    isPending.value = true

    try {
      const skillRef = doc(db, "skills", id)

      // Get the current skill to compare
      const currentSkill = skills.value.find((s) => s.id === id)
      const levelChanged = currentSkill && currentSkill.level !== updatedSkill.level

      // Update skill
      await updateDoc(skillRef, {
        ...updatedSkill,
        updatedAt: serverTimestamp(),
      })

      isPending.value = false
      return true
    } catch (err) {
      console.error(err.message)
      error.value = err.message
      isPending.value = false
      return false
    }
  }

  // Delete a skill
  const deleteSkill = async (id) => {
    if (!auth.currentUser) return false

    error.value = null
    isPending.value = true

    try {
      await deleteDoc(doc(db, "skills", id))
      isPending.value = false
      return true
    } catch (err) {
      console.error(err.message)
      error.value = err.message
      isPending.value = false
      return false
    }
  }

  return {
    skills,
    skillLevels,
    skillsByLevel,
    error,
    isPending,
    getSkills,
    addSkill,
    updateSkill,
    deleteSkill,
  }
}
