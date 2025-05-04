/* eslint-disable */
import { ref } from "vue"
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
import { useStorage } from "./useStorage"
import { useTimeline } from "./useTimeline"

export function useProjects() {
  const projects = ref([])
  const error = ref(null)
  const isPending = ref(false)
  const { uploadFile, deleteFile } = useStorage()
  const { addTimelineEvent } = useTimeline()

  // View mode (gallery or list)
  const viewMode = ref("gallery") // 'gallery' or 'list'

  // Toggle view mode
  const toggleViewMode = () => {
    viewMode.value = viewMode.value === "gallery" ? "list" : "gallery"
  }

  // Get user projects
  const getProjects = () => {
    if (!auth.currentUser) return

    error.value = null
    isPending.value = true

    const q = query(
      collection(db, "projects"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        projects.value = snapshot.docs.map((doc) => {
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

  // Add a new project
  const addProject = async (project, imageFile) => {
    if (!auth.currentUser) return

    error.value = null
    isPending.value = true

    try {
      let imageUrl = null
      let imagePath = null

      // Upload image if provided
      if (imageFile) {
        const path = `projects/${auth.currentUser.uid}`
        const result = await uploadFile(imageFile, path)
        imageUrl = result.url
        imagePath = result.path
      }

      // Add project to Firestore
      const projectData = {
        ...project,
        userId: auth.currentUser.uid,
        imageUrl,
        imagePath,
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, "projects"), projectData)

      // Add timeline event
      await addTimelineEvent({
        type: "project_added",
        title: `Nouveau projet: ${project.title}`,
        description: project.description.substring(0, 100) + (project.description.length > 100 ? "..." : ""),
        relatedId: docRef.id,
        relatedCollection: "projects",
      })

      isPending.value = false
      return docRef
    } catch (err) {
      console.error(err.message)
      error.value = err.message
      isPending.value = false
      return null
    }
  }

  // Update a project
  const updateProject = async (id, updatedProject, newImageFile) => {
    if (!auth.currentUser) return false

    error.value = null
    isPending.value = true

    try {
      const projectRef = doc(db, "projects", id)
      const currentProject = projects.value.find((p) => p.id === id)

      let imageUrl = currentProject.imageUrl
      let imagePath = currentProject.imagePath

      // If new image is provided, upload it and delete the old one
      if (newImageFile) {
        // Delete old image if exists
        if (imagePath) {
          await deleteFile(imagePath)
        }

        // Upload new image
        const path = `projects/${auth.currentUser.uid}`
        const result = await uploadFile(newImageFile, path)
        imageUrl = result.url
        imagePath = result.path
      }

      // Update project
      await updateDoc(projectRef, {
        ...updatedProject,
        imageUrl,
        imagePath,
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

  // Delete a project
  const deleteProject = async (id) => {
    if (!auth.currentUser) return false

    error.value = null
    isPending.value = true

    try {
      const project = projects.value.find((p) => p.id === id)

      // Delete image if exists
      if (project.imagePath) {
        await deleteFile(project.imagePath)
      }

      // Delete project document
      await deleteDoc(doc(db, "projects", id))

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
    projects,
    viewMode,
    error,
    isPending,
    getProjects,
    addProject,
    updateProject,
    deleteProject,
    toggleViewMode,
  }
}