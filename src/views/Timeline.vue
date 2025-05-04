<template>
  <div class="timeline-page">
    <div class="container-fluid py-4">
      <h1 class="page-title">Chronologie</h1>
      
      <div class="card">
        <div class="card-body">
          <div v-if="isPending" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-3">Chargement de la chronologie...</p>
          </div>
          
          <div v-else-if="error" class="alert alert-danger" role="alert">
            <p>{{ error }}</p>
            <button class="btn btn-outline-danger" @click="loadActivities">Réessayer</button>
          </div>
          
          <div v-else-if="!activities || activities.length === 0" class="text-center py-5">
            <div class="empty-icon">
              <font-awesome-icon icon="history" />
            </div>
            <h3 class="mt-3">Aucune activité</h3>
            <p class="text-muted">Votre chronologie est vide pour le moment.</p>
          </div>
          
          <div v-else>
            <!-- Filter controls -->
            <div class="filter-controls mb-4">
              <div class="row align-items-center">
                <div class="col-md-6 mb-3 mb-md-0">
                  <div class="input-group">
                    <span class="input-group-text">
                      <font-awesome-icon icon="search" />
                    </span>
                    <input 
                      type="text" 
                      class="form-control" 
                      placeholder="Rechercher dans la chronologie..." 
                      v-model="searchQuery"
                    >
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="d-flex justify-content-md-end">
                    <div class="btn-group">
                      <button 
                        v-for="filter in filters" 
                        :key="filter.value" 
                        class="btn" 
                        :class="activeFilter === filter.value ? 'btn-primary' : 'btn-outline-primary'"
                        @click="activeFilter = filter.value"
                      >
                        {{ filter.label }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Timeline -->
            <div class="timeline">
              <div v-for="(group, date) in groupedActivities" :key="date" class="timeline-group">
                <div class="timeline-date">{{ formatDate(date) }}</div>
                <div class="timeline-items">
                  <div 
                    v-for="activity in group" 
                    :key="activity.id" 
                    class="timeline-item"
                  >
                    <div class="timeline-icon" :class="getActivityIconClass(activity.type)">
                      <font-awesome-icon :icon="getActivityIcon(activity.type)" />
                    </div>
                    <div class="timeline-content">
                      <h5 class="timeline-title">{{ activity.title }}</h5>
                      <p class="timeline-description">{{ activity.description }}</p>
                      <div class="timeline-time">{{ formatTime(activity.createdAt) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useTimeline } from "../composables/useTimeline"

export default {
  name: "Timeline",
  setup() {
    // Initialize data
    const activities = ref([])
    const isPending = ref(true)
    const error = ref(null)
    const searchQuery = ref("")
    const activeFilter = ref("all")

    // Filter options
    const filters = [
      { label: "Tout", value: "all" },
      { label: "Compétences", value: "skill" },
      { label: "Projets", value: "project" },
      { label: "Objectifs", value: "objective" },
    ]

    let unsubscribe = null

    // Load activities
    const loadActivities = async () => {
      isPending.value = true
      error.value = null

      try {
        const { getActivities } = useTimeline()
        unsubscribe = getActivities(
          (fetchedActivities) => {
            if (fetchedActivities) {
              activities.value = fetchedActivities
            } else {
              activities.value = []
            }
            isPending.value = false
          },
          (err) => {
            console.error("Error fetching activities:", err)
            error.value = "Impossible de charger la chronologie. Veuillez réessayer."
            isPending.value = false
          },
        )
      } catch (err) {
        console.error("Error in loadActivities:", err)
        error.value = "Impossible de charger la chronologie. Veuillez réessayer."
        isPending.value = false
      }
    }

    // Filter activities
    const filteredActivities = computed(() => {
      if (!activities.value) return []

      let filtered = [...activities.value]

      // Apply type filter
      if (activeFilter.value !== "all") {
        filtered = filtered.filter((activity) => {
          if (activeFilter.value === "skill") return activity.type.includes("skill")
          if (activeFilter.value === "project") return activity.type.includes("project")
          if (activeFilter.value === "objective") return activity.type.includes("objective")
          return true
        })
      }

      // Apply search filter
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(
          (activity) =>
            activity.title?.toLowerCase().includes(query) || activity.description?.toLowerCase().includes(query),
        )
      }

      return filtered
    })

    // Group activities by date
    const groupedActivities = computed(() => {
      if (!filteredActivities.value) return {}

      const groups = {}

      filteredActivities.value.forEach((activity) => {
        if (!activity.createdAt) return

        // Get date string (YYYY-MM-DD)
        const date = activity.createdAt.toDate
          ? activity.createdAt.toDate().toISOString().split("T")[0]
          : new Date(activity.createdAt).toISOString().split("T")[0]

        if (!groups[date]) {
          groups[date] = []
        }

        groups[date].push(activity)
      })

      // Sort dates in descending order
      return Object.keys(groups)
        .sort((a, b) => new Date(b) - new Date(a))
        .reduce((obj, key) => {
          obj[key] = groups[key]
          return obj
        }, {})
    })

    // Format date
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    }

    // Format time
    const formatTime = (timestamp) => {
      if (!timestamp) return ""

      try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        return new Intl.DateTimeFormat("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(date)
      } catch (error) {
        console.error("Error formatting time:", error)
        return ""
      }
    }

    // Get activity icon
    const getActivityIcon = (type) => {
      if (type.includes("skill")) return "laptop-code"
      if (type.includes("project")) return "project-diagram"
      if (type.includes("objective")) return "bullseye"
      return "history"
    }

    // Get activity icon class
    const getActivityIconClass = (type) => {
      if (type.includes("skill")) return "icon-skill"
      if (type.includes("project")) return "icon-project"
      if (type.includes("objective")) return "icon-objective"
      return "icon-default"
    }

    // Load activities on mount
    onMounted(() => {
      loadActivities()
    })

    onUnmounted(() => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe()
      }
    })

    return {
      activities,
      isPending,
      error,
      searchQuery,
      activeFilter,
      filters,
      filteredActivities,
      groupedActivities,
      formatDate,
      formatTime,
      getActivityIcon,
      getActivityIconClass,
      loadActivities,
    }
  },
}

</script>

<style scoped>
.timeline {
  position: relative;
  margin: 2rem 0;
}

.timeline-group {
  margin-bottom: 2rem;
}

.timeline-date {
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: var(--primary-color);
  text-transform: capitalize;
}

.timeline-items {
  position: relative;
}

.timeline-items::before {
  content: '';
  position: absolute;
  left: 18px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: rgba(0, 0, 0, 0.1);
}

.timeline-item {
  position: relative;
  padding-left: 50px;
  padding-bottom: 1.5rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-icon {
  position: absolute;
  left: 0;
  top: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.icon-skill {
  background-color: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.icon-project {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.icon-objective {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.icon-default {
  background-color: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.timeline-content {
  background-color: #fff;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.timeline-title {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.timeline-description {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.timeline-time {
  font-size: 0.8rem;
  color: #adb5bd;
}

.filter-controls .btn-group .btn {
  border-radius: 0;
}

.filter-controls .btn-group .btn:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.filter-controls .btn-group .btn:last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

/* Empty state */
.empty-icon {
  font-size: 3rem;
  color: #adb5bd;
  margin-bottom: 1rem;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .timeline-item {
    padding-left: 40px;
  }
  
  .timeline-items::before {
    left: 13px;
  }
  
  .timeline-icon {
    width: 26px;
    height: 26px;
    font-size: 0.8rem;
  }
}
</style>