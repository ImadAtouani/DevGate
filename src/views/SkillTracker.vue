<template>
  <div class="skill-tracker">
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="page-title">Mes compétences</h1>
        <button class="btn btn-primary" @click="openAddModal">
          <font-awesome-icon icon="plus" class="me-2" />
          Ajouter une compétence
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isPending && !skills.length" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Chargement des compétences...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="!skills.length" class="card">
        <div class="card-body text-center py-5">
          <font-awesome-icon
            icon="laptop-code"
            class="empty-icon text-muted mb-3"
          />
          <h3>Aucune compétence</h3>
          <p class="text-muted">
            Commencez à ajouter vos compétences techniques pour suivre votre
            progression.
          </p>
          <button class="btn btn-primary" @click="openAddModal">
            <font-awesome-icon icon="plus" class="me-2" />
            Ajouter une compétence
          </button>
        </div>
      </div>

      <!-- Skills by Level -->
      <div v-else class="row">
        <div v-for="level in skillLevels" :key="level" class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">
                {{ level }}
                <span class="badge bg-secondary ms-2">{{
                  skillsByLevel[level].length
                }}</span>
              </h5>
            </div>
            <div class="card-body p-0">
              <ul class="list-group list-group-flush">
                <li
                  v-for="skill in skillsByLevel[level]"
                  :key="skill.id"
                  class="list-group-item"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 class="mb-1">{{ skill.name }}</h6>
                      <p v-if="skill.description" class="mb-1 small text-muted">
                        {{ skill.description }}
                      </p>
                      <small v-if="skill.acquisitionDate" class="text-muted">
                        Acquis le: {{ formatDate(skill.acquisitionDate) }}
                      </small>
                    </div>
                    <div class="dropdown">
    <button
      class="btn btn-sm btn-light"
      type="button"
      @click.stop="toggleDropdown(skill.id)"
      aria-expanded="false"
    >
      <font-awesome-icon icon="ellipsis-v" />
    </button>
    <transition name="dropdown">
      <ul
        v-show="activeDropdown === skill.id"
        class="dropdown-menu dropdown-menu-end show"
        @click.stop
      >
        <li>
          <a
            class="dropdown-item"
            href="#"
            @click.prevent="openEditModal(skill)"
          >
            <font-awesome-icon icon="edit" class="me-2" />
            Modifier
          </a>
        </li>
        <li>
          <a
            class="dropdown-item text-danger"
            href="#"
            @click.prevent="confirmDelete(skill)"
          >
            <font-awesome-icon icon="trash" class="me-2" />
            Supprimer
          </a>
        </li>
      </ul>
    </transition>
  </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Skill Modal -->
      <div
        class="modal fade"
        id="skillModal"
        tabindex="-1"
        aria-labelledby="skillModalLabel"
        aria-hidden="true"
        ref="modal"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="skillModalLabel">
                {{
                  isEditing
                    ? "Modifier la compétence"
                    : "Ajouter une compétence"
                }}
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
                <div class="mb-3">
                  <label for="skillName" class="form-label"
                    >Nom de la compétence</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="skillName"
                    v-model="skillForm.name"
                    required
                  />
                </div>
                <div class="mb-3">
                  <label for="skillDescription" class="form-label"
                    >Description (optionnel)</label
                  >
                  <textarea
                    class="form-control"
                    id="skillDescription"
                    rows="3"
                    v-model="skillForm.description"
                  ></textarea>
                </div>
                <div class="mb-3">
                  <label for="skillLevel" class="form-label">Niveau</label>
                  <select
                    class="form-select"
                    id="skillLevel"
                    v-model="skillForm.level"
                    required
                  >
                    <option
                      v-for="level in skillLevels"
                      :key="level"
                      :value="level"
                    >
                      {{ level }}
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="acquisitionDate" class="form-label"
                    >Date d'acquisition (optionnel)</label
                  >
                  <input
                    type="date"
                    class="form-control"
                    id="acquisitionDate"
                    v-model="skillForm.acquisitionDate"
                  />
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
                Êtes-vous sûr de vouloir supprimer la compétence
                <strong>{{ skillToDelete?.name }}</strong> ?
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
import { useSkills } from "../composables/useSkills"
import { Modal } from "bootstrap"
import { useTimeline } from "../composables/useTimeline"

export default {
  name: "SkillTracker",
  setup() {
    const { skills, skillLevels, skillsByLevel, error, isPending, getSkills, addSkill, updateSkill, deleteSkill } =
      useSkills()

    // Form state
    const isEditing = ref(false)
    const skillForm = ref({
      name: "",
      description: "",
      level: "Débutant",
      acquisitionDate: "",
    })
    const isSubmitting = ref(false)

    // Delete state
    const skillToDelete = ref(null)
    const isDeleting = ref(false)

    // Dropdown state
    const activeDropdown = ref(null)

    // Modal references
    const modal = ref(null)
    const deleteModal = ref(null)
    let modalInstance = null
    let deleteModalInstance = null

    // Unsubscribe function
    let unsubSkills

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

    // Dropdown controls
    const toggleDropdown = (skillId) => {
      activeDropdown.value = activeDropdown.value === skillId ? null : skillId
    }

    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        activeDropdown.value = null
      }
    }

    // Modal controls
    const openAddModal = () => {
      isEditing.value = false
      skillForm.value = {
        name: "",
        description: "",
        level: "Débutant",
        acquisitionDate: "",
      }
      if (modalInstance) modalInstance.show()
    }

    const openEditModal = (skill) => {
      isEditing.value = true
      skillForm.value = {
        name: skill.name,
        description: skill.description || "",
        level: skill.level,
        acquisitionDate: skill.acquisitionDate || "",
      }
      skillToDelete.value = skill
      if (modalInstance) modalInstance.show()
    }

    const closeModal = () => {
      if (modalInstance) modalInstance.hide()
    }

    const confirmDelete = (skill) => {
      activeDropdown.value = null
      skillToDelete.value = skill
      if (deleteModalInstance) deleteModalInstance.show()
    }

    const handleSubmit = async () => {
      isSubmitting.value = true
      try {
        if (isEditing.value) {
          await updateSkill(skillToDelete.value.id, skillForm.value)

          // Add timeline event for skill update if level changed
          if (skillToDelete.value.level !== skillForm.value.level) {
            const { addTimelineEvent } = useTimeline()
            await addTimelineEvent({
              type: "skill_updated",
              title: `Progression: ${skillForm.value.name}`,
              description: `Nouveau niveau: ${skillForm.value.level}`,
              relatedId: skillToDelete.value.id,
              relatedCollection: "skills",
            })
          }
        } else {
          const result = await addSkill(skillForm.value)

          // Add timeline event for new skill
          const { addTimelineEvent } = useTimeline()
          await addTimelineEvent({
            type: "skill_added",
            title: `Nouvelle compétence: ${skillForm.value.name}`,
            description: `Niveau: ${skillForm.value.level}`,
            relatedId: result.id,
            relatedCollection: "skills",
          })
        }
        closeModal()
      } catch (err) {
        console.error(err)
      } finally {
        isSubmitting.value = false
      }
    }

    const handleDelete = async () => {
      if (!skillToDelete.value) return
      isDeleting.value = true
      try {
        await deleteSkill(skillToDelete.value.id)
        if (deleteModalInstance) deleteModalInstance.hide()
      } catch (err) {
        console.error(err)
      } finally {
        isDeleting.value = false
      }
    }

    onMounted(() => {
      unsubSkills = getSkills()
      document.addEventListener("click", handleClickOutside)

      // Initialize modals after DOM mount
      setTimeout(() => {
        if (modal.value) {
          modalInstance = new Modal(modal.value)
        }
        if (deleteModal.value) {
          deleteModalInstance = new Modal(deleteModal.value)
        }
      }, 50)
    })

    onUnmounted(() => {
      if (unsubSkills) unsubSkills()
      document.removeEventListener("click", handleClickOutside)

      // Cleanup modal instances
      if (modalInstance) {
        modalInstance.dispose()
        modalInstance = null
      }
      if (deleteModalInstance) {
        deleteModalInstance.dispose()
        deleteModalInstance = null
      }

      // Clear reactive references
      activeDropdown.value = null
      skillToDelete.value = null
    })

    return {
      skills,
      skillLevels,
      skillsByLevel,
      error,
      isPending,
      isEditing,
      skillForm,
      isSubmitting,
      skillToDelete,
      isDeleting,
      modal,
      deleteModal,
      activeDropdown,
      formatDate,
      toggleDropdown,
      openAddModal,
      openEditModal,
      confirmDelete,
      handleSubmit,
      handleDelete,
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

.card {
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: none;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1rem;
}

.list-group-item {
  padding: 1rem;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.list-group-item:last-child {
  border-bottom: none;
}

.btn-light {
  background-color: #f8f9fa;
  border-color: #f8f9fa;
}

.btn-light:hover {
  background-color: #e9ecef;
  border-color: #e9ecef;
}

/* Dropdown styles */
.dropdown-menu {
  display: none;
  position: absolute;
  right: 0;
  left: auto;
  margin-top: 0.5rem;
  z-index: 1000;
}

.dropdown-menu.show {
  display: block;
  opacity: 1;
  visibility: visible;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.dropdown {
  position: relative;
}

.dropdown-menu {
  display: block;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  position: absolute;
  right: 0;
  left: auto;
  z-index: 1000;
  margin-top: 0.5rem;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>