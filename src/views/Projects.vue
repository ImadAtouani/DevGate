<template>
    <div class="projects">
      <div class="container-fluid py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="page-title">Mes projets</h1>
          <div class="d-flex">
            <div class="btn-group me-2">
              <button
                class="btn"
                :class="
                  viewMode === 'gallery' ? 'btn-primary' : 'btn-outline-primary'
                "
                @click="viewMode = 'gallery'"
              >
                <font-awesome-icon icon="th" />
              </button>
              <button
                class="btn"
                :class="
                  viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'
                "
                @click="viewMode = 'list'"
              >
                <font-awesome-icon icon="list" />
              </button>
            </div>
            <button class="btn btn-primary" @click="openAddModal">
              <font-awesome-icon icon="plus" class="me-2" />
              Ajouter un projet
            </button>
          </div>
        </div>
  
        <!-- Loading State -->
        <div v-if="isPending && !projects.length" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Chargement des projets...</p>
        </div>
  
        <!-- Empty State -->
        <div v-else-if="!projects.length" class="card">
          <div class="card-body text-center py-5">
            <font-awesome-icon
              icon="project-diagram"
              class="empty-icon text-muted mb-3"
            />
            <h3>Aucun projet</h3>
            <p class="text-muted">
              Commencez à ajouter vos projets pour suivre votre progression.
            </p>
            <button class="btn btn-primary" @click="openAddModal">
              <font-awesome-icon icon="plus" class="me-2" />
              Ajouter un projet
            </button>
          </div>
        </div>
  
        <!-- Gallery View -->
        <div v-else-if="viewMode === 'gallery'" class="row">
          <div
            v-for="project in projects"
            :key="project.id"
            class="col-md-6 col-lg-4 mb-4"
          >
            <div class="card project-card h-100">
              <div class="project-image-container">
                <img
                  v-if="project.imageUrl"
                  :src="project.imageUrl"
                  :alt="project.title"
                  class="project-image"
                />
                <div v-else class="project-image-placeholder">
                  <font-awesome-icon icon="code" />
                </div>
                <div class="project-actions">
                  <button
                    class="btn btn-sm btn-light me-1"
                    @click="openEditModal(project)"
                  >
                    <font-awesome-icon icon="edit" />
                  </button>
                  <button
                    class="btn btn-sm btn-light"
                    @click="confirmDelete(project)"
                  >
                    <font-awesome-icon icon="trash" />
                  </button>
                </div>
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ project.title }}</h5>
                <p class="card-text">
                  {{ truncateDescription(project.description) }}
                </p>
                <div class="tech-stack">
                  <span
                    v-for="(tech, index) in project.stack"
                    :key="index"
                    class="badge bg-light text-dark me-1 mb-1"
                  >
                    {{ tech }}
                  </span>
                </div>
              </div>
              <div class="card-footer bg-white">
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">{{
                    formatDate(project.createdAt)
                  }}</small>
                  <div>
                    <a
                      v-if="project.githubUrl"
                      :href="project.githubUrl"
                      target="_blank"
                      class="btn btn-sm btn-outline-dark me-1"
                    >
                      <font-awesome-icon :icon="['fab', 'github']" />
                    </a>
                    <a
                      v-if="project.liveUrl"
                      :href="project.liveUrl"
                      target="_blank"
                      class="btn btn-sm btn-outline-primary"
                    >
                      <font-awesome-icon icon="link" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- List View -->
        <div v-else class="card">
          <div class="list-group list-group-flush">
            <div
              v-for="project in projects"
              :key="project.id"
              class="list-group-item"
            >
              <div class="row align-items-center">
                <div class="col-md-2 col-lg-1">
                  <div class="project-thumbnail">
                    <img
                      v-if="project.imageUrl"
                      :src="project.imageUrl"
                      :alt="project.title"
                      class="project-thumbnail-image"
                    />
                    <div v-else class="project-thumbnail-placeholder">
                      <font-awesome-icon icon="code" />
                    </div>
                  </div>
                </div>
                <div class="col-md-7 col-lg-8">
                  <h5 class="mb-1">{{ project.title }}</h5>
                  <p class="mb-1 text-muted">
                    {{ truncateDescription(project.description, 150) }}
                  </p>
                  <div class="tech-stack">
                    <span
                      v-for="(tech, index) in project.stack"
                      :key="index"
                      class="badge bg-light text-dark me-1 mb-1"
                    >
                      {{ tech }}
                    </span>
                  </div>
                  <small class="text-muted">{{
                    formatDate(project.createdAt)
                  }}</small>
                </div>
                <div class="col-md-3 col-lg-3 text-end">
                  <div class="mb-2">
                    <a
                      v-if="project.githubUrl"
                      :href="project.githubUrl"
                      target="_blank"
                      class="btn btn-sm btn-outline-dark me-1"
                    >
                      <font-awesome-icon :icon="['fab', 'github']" /> GitHub
                    </a>
                    <a
                      v-if="project.liveUrl"
                      :href="project.liveUrl"
                      target="_blank"
                      class="btn btn-sm btn-outline-primary"
                    >
                      <font-awesome-icon icon="link" /> Demo
                    </a>
                  </div>
                  <div>
                    <button
                      class="btn btn-sm btn-outline-secondary me-1"
                      @click="openEditModal(project)"
                    >
                      <font-awesome-icon icon="edit" /> Modifier
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(project)"
                    >
                      <font-awesome-icon icon="trash" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Add/Edit Project Modal -->
        <div
          class="modal fade"
          id="projectModal"
          tabindex="-1"
          aria-labelledby="projectModalLabel"
          aria-hidden="true"
          ref="modal"
        >
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="projectModalLabel">
                  {{ isEditing ? "Modifier le projet" : "Ajouter un projet" }}
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="handleSubmit">
                  <div class="row">
                    <div class="col-md-8">
                      <div class="mb-3">
                        <label for="projectTitle" class="form-label"
                          >Titre du projet</label
                        >
                        <input
                          type="text"
                          class="form-control"
                          id="projectTitle"
                          v-model="projectForm.title"
                          required
                        />
                      </div>
                      <div class="mb-3">
                        <label for="projectDescription" class="form-label"
                          >Description</label
                        >
                        <textarea
                          class="form-control"
                          id="projectDescription"
                          rows="4"
                          v-model="projectForm.description"
                          required
                        ></textarea>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Stack technique</label>
                        <div class="input-group mb-2">
                          <input
                            type="text"
                            class="form-control"
                            placeholder="Ajouter une technologie"
                            v-model="techInput"
                            @keyup.enter.prevent="addTech"
                          />
                          <button
                            class="btn btn-outline-primary"
                            type="button"
                            @click="addTech"
                          >
                            Ajouter
                          </button>
                        </div>
                        <div class="tech-stack-preview">
                          <span
                            v-for="(tech, index) in projectForm.stack"
                            :key="index"
                            class="badge bg-light text-dark me-1 mb-1"
                          >
                            {{ tech }}
                            <button
                              type="button"
                              class="btn-close btn-close-sm ms-1"
                              @click="removeTech(index)"
                            ></button>
                          </span>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label for="githubUrl" class="form-label"
                            >Lien GitHub</label
                          >
                          <input
                            type="url"
                            class="form-control"
                            id="githubUrl"
                            placeholder="https://github.com/username/repo"
                            v-model="projectForm.githubUrl"
                          />
                        </div>
                        <div class="col-md-6 mb-3">
                          <label for="liveUrl" class="form-label"
                            >Lien Demo</label
                          >
                          <input
                            type="url"
                            class="form-control"
                            id="liveUrl"
                            placeholder="https://example.com"
                            v-model="projectForm.liveUrl"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="mb-3">
                        <label for="projectImage" class="form-label"
                          >Image du projet</label
                        >
                        <div
                          class="image-upload-container"
                          @click="$refs.fileInput.click()"
                        >
                          <div
                            v-if="
                              imagePreview ||
                              (isEditing &&
                                projectToEdit &&
                                projectToEdit.imageUrl)
                            "
                            class="image-preview"
                          >
                            <img
                              :src="
                                imagePreview ||
                                (projectToEdit ? projectToEdit.imageUrl : '')
                              "
                              alt="Preview"
                              class="img-fluid rounded"
                            />
                            <button
                              type="button"
                              class="btn btn-sm btn-light image-remove-btn"
                              @click.stop="
                                () => {
                                  imagePreview = null;
                                  selectedFile = null;
                                }
                              "
                            >
                              <font-awesome-icon icon="times" />
                            </button>
                          </div>
                          <div v-else class="image-upload-placeholder">
                            <font-awesome-icon
                              icon="plus"
                              class="upload-icon"
                            />
                            <p class="mb-0">
                              Cliquez pour sélectionner une image
                            </p>
                          </div>
                          <input
                            type="file"
                            class="form-control visually-hidden"
                            id="projectImage"
                            ref="fileInput"
                            accept="image/*"
                            @change="handleFileChange"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex justify-content-end">
                    <button
                      type="button"
                      class="btn btn-secondary me-2"
                      data-bs-dismiss="modal"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="isSubmitting"
                    >
                      <span
                        v-if="isSubmitting"
                        class="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      {{ isEditing ? "Mettre à jour" : "Ajouter" }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Delete Confirmation Modal -->
        <div
          class="modal fade"
          id="deleteModal"
          tabindex="-1"
          aria-labelledby="deleteModalLabel"
          aria-hidden="true"
          ref="deleteModal"
        >
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="deleteModalLabel">
                  Confirmer la suppression
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <p>
                  Êtes-vous sûr de vouloir supprimer le projet
                  <strong>{{ projectToDelete?.title }}</strong> ?
                </p>
                <p class="text-danger">Cette action est irréversible.</p>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  class="btn btn-danger"
                  @click="handleDelete"
                  :disabled="isDeleting"
                >
                  <span
                    v-if="isDeleting"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onUnmounted } from "vue"
  import { useProjects } from "../composables/useProjects"
  import { Modal } from "bootstrap"
  import { useAuth } from "../composables/useAuth"
  import { useTimeline } from "../composables/useTimeline"
  import { useStorage } from "../composables/useStorage"
  import { collection, addDoc, serverTimestamp } from "firebase/firestore"
  import { db } from "../firebase/config"
  
  export default {
    name: "Projects",
    setup() {
      const { projects, viewMode, error, isPending, getProjects, updateProject, deleteProject, toggleViewMode } =
        useProjects()
      
      const { user } = useAuth()
      const { uploadFile } = useStorage()
      const { addTimelineEvent } = useTimeline()
  
      // Form state
      const showModal = ref(false)
      const isEditing = ref(false)
      const projectForm = ref({
        title: "",
        description: "",
        stack: [],
        githubUrl: "",
        liveUrl: "",
      })
      const techInput = ref("")
      const selectedFile = ref(null)
      const imagePreview = ref(null)
      const isSubmitting = ref(false)
      const projectToEdit = ref(null)
  
      // Delete state
      const showDeleteModal = ref(false)
      const projectToDelete = ref(null)
      const isDeleting = ref(false)
  
      // Modal references
      const modal = ref(null)
      const deleteModal = ref(null)
      let modalInstance = null
      let deleteModalInstance = null
  
      // Unsubscribe function
      let unsubProjects
  
      // Format date
      const formatDate = (timestamp) => {
        if (!timestamp) return ""
  
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        return new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(date)
      }
  
      // Truncate description
      const truncateDescription = (text, length = 100) => {
        if (!text) return ""
        if (text.length <= length) return text
  
        return text.substring(0, length) + "..."
      }
  
      // Add tech to stack
      const addTech = () => {
        if (!techInput.value.trim()) return
  
        if (!projectForm.value.stack.includes(techInput.value.trim())) {
          projectForm.value.stack.push(techInput.value.trim())
        }
  
        techInput.value = ""
      }
  
      // Remove tech from stack
      const removeTech = (index) => {
        projectForm.value.stack.splice(index, 1)
      }
  
      // Handle file change
      const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (!file) return
  
        selectedFile.value = file
  
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
  
      // Open add modal
      const openAddModal = () => {
        isEditing.value = false
        projectForm.value = {
          title: "",
          description: "",
          stack: [],
          githubUrl: "",
          liveUrl: "",
        }
        selectedFile.value = null
        imagePreview.value = null
        modalInstance.show()
      }
  
      // Open edit modal
      const openEditModal = (project) => {
        isEditing.value = true
        projectToEdit.value = project
        projectForm.value = {
          title: project.title,
          description: project.description || "",
          stack: [...project.stack],
          githubUrl: project.githubUrl || "",
          liveUrl: project.liveUrl || "",
        }
        selectedFile.value = null
        imagePreview.value = null
        modalInstance.show()
      }
  
      // Confirm delete
      const confirmDelete = (project) => {
        projectToDelete.value = project
        deleteModalInstance.show()
      }
  
      // Add a new project
      const addProject = async (project, imageFile) => {
        if (!user.value) return
  
        error.value = null
        isPending.value = true
  
        try {
          let imageUrl = null
          let imagePath = null
  
          // Upload image if provided
          if (imageFile) {
            const path = `projects/${user.value.uid}`
            const result = await uploadFile(imageFile, path)
            imageUrl = result.url
            imagePath = result.path
          }
  
          // Add project to Firestore
          const projectData = {
            ...project,
            userId: user.value.uid,
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
  
      // Handle form submit
      const handleSubmit = async () => {
        isSubmitting.value = true
  
        try {
          if (isEditing.value) {
            await updateProject(projectToEdit.value.id, projectForm.value, selectedFile.value)
          } else {
            await addProject(projectForm.value, selectedFile.value)
          }
  
          modalInstance.hide()
        } catch (err) {
          console.error(err)
        } finally {
          isSubmitting.value = false
        }
      }
  
      // Handle delete
      const handleDelete = async () => {
        if (!projectToDelete.value) return
  
        isDeleting.value = true
  
        try {
          await deleteProject(projectToDelete.value.id)
          deleteModalInstance.hide()
        } catch (err) {
          console.error(err)
        } finally {
          isDeleting.value = false
        }
      }
  
      onMounted(() => {
        unsubProjects = getProjects()
  
        // Initialize Bootstrap modals
        modalInstance = new Modal(modal.value)
        deleteModalInstance = new Modal(deleteModal.value)
      })
  
      onUnmounted(() => {
        if (unsubProjects) unsubProjects()
      })
  
      return {
        projects,
        viewMode,
        error,
        isPending,
        showModal,
        isEditing,
        projectForm,
        techInput,
        imagePreview,
        isSubmitting,
        projectToEdit,
        showDeleteModal,
        projectToDelete,
        isDeleting,
        modal,
        deleteModal,
        formatDate,
        truncateDescription,
        addTech,
        removeTech,
        handleFileChange,
        openAddModal,
        openEditModal,
        confirmDelete,
        handleSubmit,
        handleDelete,
        toggleViewMode,
        addProject,
      }
    },
  }
  
  </script>
  
  <style scoped>
  .page-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--dark-color);
  }
  
  .empty-icon {
    font-size: 3rem;
  }
  
  .project-card {
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: none;
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
  
  .project-image-container {
    position: relative;
    height: 180px;
    overflow: hidden;
  }
  
  .project-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .project-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    color: #6c757d;
    font-size: 2rem;
  }
  
  .project-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .project-image-container:hover .project-actions {
    opacity: 1;
  }
  
  .tech-stack {
    margin-top: 10px;
  }
  
  .card-footer {
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    padding: 0.75rem 1rem;
  }
  
  .project-thumbnail {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .project-thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .project-thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8f9fa;
    color: #6c757d;
    font-size: 1.25rem;
  }
  
  .image-upload-container {
    position: relative;
    width: 100%;
    height: 200px;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
  }
  
  .image-upload-container:hover {
    border-color: var(--primary-color);
  }
  
  .image-upload-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #6c757d;
  }
  
  .upload-icon {
    font-size: 2rem;
    margin-bottom: 10px;
  }
  
  .image-preview {
    width: 100%;
    height: 100%;
    position: relative;
  }
  
  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-remove-btn {
    position: absolute;
    top: 5px;
    right: 5px;
    opacity: 0.8;
  }
  
  .tech-stack-preview {
    min-height: 40px;
    padding: 5px 0;
  }
  
  .btn-close-sm {
    font-size: 0.5rem;
  }
  </style>