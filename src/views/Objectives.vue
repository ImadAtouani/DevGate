<template>
  <div class="objectives-page">
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="page-title">Objectifs</h1>
        <button class="btn btn-primary" @click="showAddModal = true">
          <font-awesome-icon icon="plus" class="me-2" />
          Ajouter un objectif
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isPending" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-3">Chargement des objectifs...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-danger" role="alert">
        <font-awesome-icon icon="exclamation-triangle" class="me-2" />
        {{ error }}
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!objectives || objectives.length === 0"
        class="text-center py-5"
      >
        <div class="empty-icon">
          <font-awesome-icon icon="bullseye" />
        </div>
        <h3 class="mt-3">Aucun objectif</h3>
        <p class="text-muted">Vous n'avez pas encore ajouté d'objectifs.</p>
        <button class="btn btn-primary mt-3" @click="showAddModal = true">
          <font-awesome-icon icon="plus" class="me-2" />
          Ajouter un objectif
        </button>
      </div>

      <!-- Objectives List -->
      <div v-else class="row">
        <!-- Active Objectives -->
        <div class="col-md-6 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Objectifs en cours</h5>

              <div
                v-if="!activeObjectives || activeObjectives.length === 0"
                class="text-center py-4"
              >
                <p class="text-muted">Aucun objectif en cours</p>
              </div>

              <ul v-else class="objectives-list">
                <li
                  v-for="objective in activeObjectives"
                  :key="objective.id"
                  class="objective-item"
                >
                  <div class="objective-content">
                    <h6 class="objective-title">{{ objective.title }}</h6>
                    <p
                      v-if="objective.description"
                      class="objective-description"
                    >
                      {{ objective.description }}
                    </p>
                    <p class="objective-date">
                      Créé le {{ formatDate(objective.createdAt) }}
                    </p>
                  </div>
                  <div class="objective-actions">
                    <button
                      class="btn btn-sm btn-outline-success me-2"
                      @click="completeObjective(objective.id)"
                      title="Marquer comme terminé"
                    >
                      <font-awesome-icon icon="check" />
                    </button>
                    <button
                      class="btn btn-sm btn-outline-primary me-2"
                      @click="editObjective(objective)"
                      title="Modifier"
                    >
                      <font-awesome-icon icon="edit" />
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(objective)"
                      title="Supprimer"
                    >
                      <font-awesome-icon icon="trash" />
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Completed Objectives -->
        <div class="col-md-6 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Objectifs terminés</h5>

              <div
                v-if="!completedObjectives || completedObjectives.length === 0"
                class="text-center py-4"
              >
                <p class="text-muted">Aucun objectif terminé</p>
              </div>

              <ul v-else class="objectives-list">
                <li
                  v-for="objective in completedObjectives"
                  :key="objective.id"
                  class="objective-item completed"
                >
                  <div class="objective-content">
                    <h6 class="objective-title">{{ objective.title }}</h6>
                    <p
                      v-if="objective.description"
                      class="objective-description"
                    >
                      {{ objective.description }}
                    </p>
                    <p class="objective-completed-date">
                      Terminé le {{ formatDate(objective.completedAt) }}
                    </p>
                  </div>
                  <div class="objective-actions">
                    <button
                      class="modern-button"
                      @click="uncompleteObjective(objective.id)"
                      title="Marquer comme non terminé"
                    >
                      Marquer comme non terminé
                    </button>

                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="confirmDelete(objective)"
                      title="Supprimer"
                    >
                      <font-awesome-icon icon="trash" />
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Objective Modal -->
    <div
      class="modal fade"
      :class="{ 'show d-block': showAddModal }"
      tabindex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editMode ? "Modifier l'objectif" : "Ajouter un objectif" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitObjective">
              <div class="mb-3">
                <label for="objectiveTitle" class="form-label">Titre</label>
                <input
                  type="text"
                  class="form-control"
                  id="objectiveTitle"
                  v-model="objectiveForm.title"
                  required
                  placeholder="Titre de l'objectif"
                />
              </div>
              <div class="mb-3">
                <label for="objectiveDescription" class="form-label"
                  >Description</label
                >
                <textarea
                  class="form-control"
                  id="objectiveDescription"
                  v-model="objectiveForm.description"
                  rows="3"
                  placeholder="Description de l'objectif (optionnel)"
                ></textarea>
              </div>
              <div class="d-flex justify-content-end">
                <button
                  type="button"
                  class="btn btn-secondary me-2"
                  @click="closeModal"
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
                    aria-hidden="true"
                  ></span>
                  {{ editMode ? "Mettre à jour" : "Ajouter" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showAddModal" class="modal-backdrop fade show"></div>

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      :class="{ 'show d-block': showDeleteModal }"
      tabindex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirmer la suppression</h5>
            <button
              type="button"
              class="btn-close"
              @click="showDeleteModal = false"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p>Êtes-vous sûr de vouloir supprimer cet objectif ?</p>
            <p>
              <strong>{{ objectiveToDelete?.title }}</strong>
            </p>
            <p class="text-danger">Cette action est irréversible.</p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showDeleteModal = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteObjective"
              :disabled="isDeleting"
            >
              <span
                v-if="isDeleting"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useObjectives } from "../composables/useObjectives";

export default {
  name: "Objectives",
  setup() {
    // Initialize objectives composable
    const {
      objectives,
      error,
      isPending,
      getObjectives,
      addObjective,
      updateObjective,
      completeObjective: markAsCompleted,
      uncompleteObjective: markAsActive,
      deleteObjective: removeObjective,
    } = useObjectives();

    // Local state
    const showAddModal = ref(false);
    const showDeleteModal = ref(false);
    const editMode = ref(false);
    const isSubmitting = ref(false);
    const isDeleting = ref(false);
    const objectiveToDelete = ref(null);
    const objectiveForm = ref({
      id: null,
      title: "",
      description: "",
    });

    // Computed properties
    const activeObjectives = computed(() => {
      if (!objectives.value) return [];
      return objectives.value.filter((obj) => !obj.completed);
    });

    const completedObjectives = computed(() => {
      if (!objectives.value) return [];
      return objectives.value.filter((obj) => obj.completed);
    });

    // Format date
    const formatDate = (timestamp) => {
      if (!timestamp) return "";

      try {
        const date = timestamp.toDate
          ? timestamp.toDate()
          : new Date(timestamp);
        return new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(date);
      } catch (error) {
        console.error("Error formatting date:", error);
        return "";
      }
    };

    // Edit objective
    const editObjective = (objective) => {
      objectiveForm.value = {
        id: objective.id,
        title: objective.title,
        description: objective.description || "",
      };
      editMode.value = true;
      showAddModal.value = true;
    };

    // Confirm delete
    const confirmDelete = (objective) => {
      objectiveToDelete.value = objective;
      showDeleteModal.value = true;
    };

    // Delete objective
    const deleteObjective = async () => {
      if (!objectiveToDelete.value) return;

      isDeleting.value = true;

      try {
        await removeObjective(objectiveToDelete.value.id);
        showDeleteModal.value = false;
      } catch (err) {
        console.error("Error deleting objective:", err);
      } finally {
        isDeleting.value = false;
        objectiveToDelete.value = null;
      }
    };

    // Submit objective form
    const submitObjective = async () => {
      isSubmitting.value = true;

      try {
        if (editMode.value) {
          await updateObjective(objectiveForm.value.id, {
            title: objectiveForm.value.title,
            description: objectiveForm.value.description,
          });
        } else {
          await addObjective({
            title: objectiveForm.value.title,
            description: objectiveForm.value.description,
          });
        }

        closeModal();
      } catch (err) {
        console.error("Error submitting objective:", err);
      } finally {
        isSubmitting.value = false;
      }
    };

    // Close modal and reset form
    const closeModal = () => {
      showAddModal.value = false;
      editMode.value = false;
      objectiveForm.value = {
        id: null,
        title: "",
        description: "",
      };
    };

    // Complete objective
    const completeObjective = async (id) => {
      try {
        await markAsCompleted(id);
      } catch (err) {
        console.error("Error completing objective:", err);
      }
    };

    // Uncomplete objective
    const uncompleteObjective = async (id) => {
      try {
        await markAsActive(id);
      } catch (err) {
        console.error("Error uncompleting objective:", err);
      }
    };

    // Lifecycle hooks
    let unsubscribe = null;

    onMounted(() => {
      unsubscribe = getObjectives();
    });

    onUnmounted(() => {
      if (unsubscribe) unsubscribe();
    });

    return {
      objectives,
      activeObjectives,
      completedObjectives,
      error,
      isPending,
      showAddModal,
      showDeleteModal,
      editMode,
      isSubmitting,
      isDeleting,
      objectiveForm,
      objectiveToDelete,
      formatDate,
      editObjective,
      confirmDelete,
      deleteObjective,
      submitObjective,
      closeModal,
      completeObjective,
      uncompleteObjective,
    };
  },
};
</script>

<style scoped>
.objectives-page {
  min-height: calc(100vh - var(--header-height));
}

.empty-icon {
  font-size: 3rem;
  color: #6c757d;
  opacity: 0.5;
}

.objectives-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.objective-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  background-color: #f8f9fa;
  border-left: 3px solid var(--warning-color);
  transition: transform 0.2s, box-shadow 0.2s;
}

.objective-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.objective-item.completed {
  border-left: 3px solid var(--success-color);
  background-color: rgba(46, 204, 113, 0.05);
}

.objective-content {
  flex: 1;
  padding-right: 1rem;
}

.objective-title {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.objective-description {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.objective-date {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0;
}

.objective-completed-date {
  font-size: 0.75rem;
  color: var(--success-color);
  margin-bottom: 0;
}

.objective-actions {
  display: flex;
  align-items: center;
}

/* Modal backdrop */
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .objective-item {
    flex-direction: column;
  }

  .objective-actions {
    margin-top: 1rem;
    width: 100%;
    justify-content: flex-end;
  }
}
.modern-button {
  width: 280px;
  height: 34px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 8px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.modern-button:hover {
  background-color: #e9ecef;
  border-color: #bbb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.modern-button:active {
  transform: scale(0.98);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
</style>
