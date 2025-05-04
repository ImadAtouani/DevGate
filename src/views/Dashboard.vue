<template>
  <div class="dashboard">
    <div class="container-fluid py-4">
      <!-- Welcome Banner - inchangé -->
      <div class="welcome-banner">
        <div class="avatar-container">
          <div class="avatar">{{ userInitial }}</div>
        </div>
        <div class="welcome-text">
          <h1>Bienvenue, {{ userName }}</h1>
          <p>Voici un aperçu de votre progression technique</p>
        </div>
      </div>

      <!-- Stats Cards - inchangé -->
      <div class="row mt-4">
        <!-- Skills Card -->
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="card stat-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle text-muted">Compétences</h6>
                  <h2 class="card-title mb-0">{{ skillsCount }}</h2>
                </div>
                <div class="stat-icon skills-icon">
                  <font-awesome-icon icon="laptop-code" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Projects Card -->
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="card stat-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle text-muted">Projets</h6>
                  <h2 class="card-title mb-0">{{ projectsCount }}</h2>
                </div>
                <div class="stat-icon projects-icon">
                  <font-awesome-icon icon="project-diagram" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Objectives Card -->
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="card stat-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle text-muted">Objectifs</h6>
                  <h2 class="card-title mb-0">{{ objectivesCount }}</h2>
                </div>
                <div class="stat-icon objectives-icon">
                  <font-awesome-icon icon="bullseye" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Completed Objectives Card -->
        <div class="col-md-6 col-lg-3 mb-4">
          <div class="card stat-card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-subtitle text-muted">Objectifs atteints</h6>
                  <h2 class="card-title mb-0">
                    {{ completedObjectivesPercentage }}%
                  </h2>
                </div>
                <div class="stat-icon completed-icon">
                  <font-awesome-icon icon="check" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Progress Chart - inchangé -->
      <div class="row mt-4">
        <div class="col-lg-8 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Progression mensuelle</h5>
              <div v-if="!hasMonthlyData" class="text-center py-4">
                <p class="text-muted">
                  Aucune donnée disponible pour le moment
                </p>
                <p class="text-muted small">
                  Les données apparaîtront au fur et à mesure que vous ajoutez
                  des compétences et des projets
                </p>
              </div>
              <div v-else class="chart-container">
                <canvas id="monthlyProgressChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity - inchangé -->
        <div class="col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <h5 class="card-title mb-0">Activité récente</h5>
                <router-link
                  to="/timeline"
                  class="btn btn-sm btn-outline-primary"
                >
                  Voir tout
                </router-link>
              </div>

              <div v-if="!recentActivities.length" class="text-center py-4">
                <p class="text-muted">Aucune activité récente</p>
              </div>

              <ul v-else class="activity-list">
                <li
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div
                    class="activity-icon"
                    :class="getActivityIconClass(activity.type)"
                  >
                    <font-awesome-icon :icon="getActivityIcon(activity.type)" />
                  </div>
                  <div class="activity-content">
                    <h6 class="activity-title">{{ activity.title }}</h6>
                    <p class="activity-date">
                      {{ formatDate(activity.createdAt) }}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Skills Distribution and Recent Skills - MODIFIÉ -->
      <div class="row mt-4">
        <!-- Skills Distribution Card - MODIFIÉ -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Répartition des compétences</h5>
              <div v-if="skillsCount === 0" class="text-center py-4">
                <p class="text-muted">Aucune compétence ajoutée</p>
              </div>
              <div v-else class="chart-container">
                <canvas ref="skillsChartCanvas" id="skillsDistributionChart"></canvas>
              </div>
              <div v-if="skillsCount > 0" class="chart-legend mt-3">
                <div class="legend-item d-inline-block mr-3">
                  <span class="legend-color beginner" >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  <span>Débutant</span>
                </div>
                <div class="legend-item d-inline-block mr-3">
                  <span class="legend-color intermediate">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  <span>Intermédiaire</span>
                </div>
                <div class="legend-item d-inline-block mr-3">
                  <span class="legend-color advanced">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  <span>Avancé</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Skills Card - MODIFIÉ -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0">Compétences récentes</h5>
                <router-link to="/skills" class="btn btn-sm btn-outline-primary">
                  Voir plus
                </router-link>
              </div>

              <div v-if="!recentSkills.length" class="text-center py-4">
                <p class="text-muted">Aucune compétence ajoutée</p>
              </div>

              <ul v-else class="skills-list">
                <li
                  v-for="skill in recentSkills"
                  :key="skill.id"
                  class="skill-item"
                >
                  <div class="skill-info">
                    <h6 class="skill-name">
                      {{ skill.name || "Compétence sans nom" }}
                    </h6>
                    <div
                      class="skill-level"
                      :class="getLevelClass(skill.level)"
                    >
                      {{ getLevelName(skill.level) }}
                    </div>
                  </div>
                  <div class="skill-progress">
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="1"
                      :value="getNumericLevel(skill.level)"
                      @input="updateSkillLevel(skill, $event.target.value)"
                      class="level-slider mb-2"
                      :class="getProgressBarClass(getNumericLevel(skill.level))"
                    />
                    <div class="progress">
                      <div
                        class="progress-bar"
                        :class="getProgressBarClass(getNumericLevel(skill.level))"
                        role="progressbar"
                        :style="{
                          width: getSkillLevelPercentage(getNumericLevel(skill.level)) + '%',
                        }"
                        :aria-valuenow="getSkillLevelPercentage(getNumericLevel(skill.level))"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Objectives Section - inchangé -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <h5 class="card-title mb-0">Objectifs</h5>
                <router-link
                  to="/objectives"
                  class="btn btn-sm btn-outline-primary"
                >
                  Gérer les objectifs
                </router-link>
              </div>

              <div v-if="!objectives.length" class="text-center py-4">
                <p class="text-muted">Aucun objectif ajouté</p>
              </div>

              <div v-else>
                <div class="row">
                  <!-- Active Objectives -->
                  <div class="col-md-6">
                    <h6 class="mb-3">Objectifs en cours</h6>
                    <ul class="objectives-list">
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
                        </div>
                      </li>
                    </ul>
                  </div>

                  <!-- Completed Objectives -->
                  <div class="col-md-6">
                    <h6 class="mb-3">Objectifs terminés</h6>
                    <ul class="objectives-list">
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
                      </li>
                    </ul>
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
/* eslint-disable */
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useAuth } from "../composables/useAuth";
import Chart from "chart.js/auto";

export default {
  name: "Dashboard",
  setup() {
    // Auth
    const { user } = useAuth();

    // Data refs
    const skills = ref([]);
    const projects = ref([]);
    const objectives = ref([]);
    const activities = ref([]);

    // Charts
    let monthlyProgressChart = null;
    const skillsChartCanvas = ref(null);
    let skillsChartInstance = null;
    let chartResizeObservers = [];

    // User info
    const userName = ref("Utilisateur");
    const userInitial = ref("U");

    // User watcher
    watch(
      user,
      (newUser) => {
        if (newUser?.displayName) {
          userName.value = newUser.displayName;
        } else if (newUser?.email) {
          userName.value = newUser.email;
        } else {
          userName.value = "Utilisateur";
        }
        userInitial.value = userName.value.charAt(0).toUpperCase() || "U";
      },
      { immediate: true }
    );

    // Computed stats
    const skillsCount = computed(() => skills.value.length);
    const projectsCount = computed(() => projects.value.length);
    const objectivesCount = computed(() => objectives.value.length);

    const completedObjectives = computed(() =>
      objectives.value.filter((obj) => obj.completed)
    );

    const activeObjectives = computed(() =>
      objectives.value.filter((obj) => !obj.completed)
    );

    const completedObjectivesPercentage = computed(() => {
      if (!objectives.value.length) return 0;
      return Math.round(
        (completedObjectives.value.length / objectives.value.length) * 100
      );
    });

    // Recent data
    const recentSkills = computed(() =>
      [...skills.value]
        .sort((a, b) => dateSort(a.createdAt, b.createdAt))
        .slice(0, 5)
    );

    const recentActivities = computed(() =>
      [...activities.value]
        .sort((a, b) => dateSort(a.createdAt, b.createdAt))
        .slice(0, 5)
    );

    // Chart data
    const hasMonthlyData = computed(() =>
      monthlyData.value.some(
        (month) => month.skillsCount > 0 || month.projectsCount > 0
      )
    );

    const monthlyData = computed(() => {
      const result = [];
      const currentDate = new Date();

      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentDate);
        month.setMonth(currentDate.getMonth() - i);

        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(
          month.getFullYear(),
          month.getMonth() + 1,
          0,
          23,
          59,
          59
        );

        result.push({
          month: month.toLocaleString("fr-FR", { month: "short" }),
          year: month.getFullYear(),
          skillsCount: countItemsInPeriod(
            skills.value,
            startOfMonth,
            endOfMonth
          ),
          projectsCount: countItemsInPeriod(
            projects.value,
            startOfMonth,
            endOfMonth
          ),
        });
      }
      return result;
    });

    // Helper functions
    const dateSort = (aDate, bDate) => {
      const getDate = (d) => d?.toDate?.() || new Date(d);
      return getDate(bDate) - getDate(aDate);
    };

    const countItemsInPeriod = (items, start, end) =>
      items.filter((item) => {
        const date = item.createdAt?.toDate?.() || new Date(item.createdAt);
        return date >= start && date <= end;
      }).length;

    const formatDate = (timestamp) => {
      try {
        if (!timestamp) return "";
        const date = timestamp?.toDate?.() || new Date(timestamp);
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

    // Skill level helpers - MODIFIÉS pour correspondre au format de skillTracker.vue
    const getLevelName = (level) => {
      if (level === "Débutant" || level === 1) return "Débutant";
      if (level === "Intermédiaire" || level === 2) return "Intermédiaire";
      if (level === "Avancé" || level === 3) return "Avancé";
      return "Débutant";
    };

    const getNumericLevel = (level) => {
      if (level === "Débutant" || level === 1) return 1;
      if (level === "Intermédiaire" || level === 2) return 2;
      if (level === "Avancé" || level === 3) return 3;
      return 1;
    };

    const getLevelClass = (level) => {
      const numLevel = getNumericLevel(level);
      return `level-${numLevel}`;
    };

    const getSkillLevelPercentage = (level) => {
      const numLevel = getNumericLevel(level);
      return Math.min(100, Math.max(0, (numLevel / 3) * 100));
    };

    const getProgressBarClass = (level) => {
      const numLevel = getNumericLevel(level);
      switch (numLevel) {
        case 1: return 'bg-warning';
        case 2: return 'bg-info';
        case 3: return 'bg-success';
        default: return 'bg-secondary';
      }
    };

    // Activity helpers
    const getActivityIcon = (type) => {
      const icons = {
        skill_added: "laptop-code",
        project_added: "project-diagram",
        project_updated: "edit",
        objective_added: "bullseye",
        objective_completed: "check",
      };
      return icons[type] || "history";
    };

    const getActivityIconClass = (type) => {
      const classes = {
        skill_added: "skills-bg",
        project_added: "projects-bg",
        project_updated: "projects-bg",
        objective_added: "objectives-bg",
        objective_completed: "objectives-bg",
      };
      return classes[type] || "default-bg";
    };

    // Chart functions
    const initMonthlyProgressChart = () => {
      try {
        const chartElement = document.getElementById("monthlyProgressChart");
        if (!chartElement) return;

        if (monthlyProgressChart) {
          monthlyProgressChart.destroy();
          monthlyProgressChart = null;
        }

        if (!hasMonthlyData.value) return;

        const ctx = chartElement.getContext("2d");
        if (!ctx) return;

        const labels = monthlyData.value.map((d) => `${d.month} ${d.year}`);
        const skillsData = monthlyData.value.map((d) => d.skillsCount);
        const projectsData = monthlyData.value.map((d) => d.projectsCount);

        monthlyProgressChart = new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Compétences",
                data: skillsData,
                borderColor: "#4361ee",
                backgroundColor: "rgba(67, 97, 238, 0.1)",
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
              {
                label: "Projets",
                data: projectsData,
                borderColor: "#2ecc71",
                backgroundColor: "rgba(46, 204, 113, 0.1)",
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "top" },
              tooltip: { mode: "index", intersect: false },
            },
            interaction: { mode: "nearest", axis: "x", intersect: false },
            scales: {
              y: { beginAtZero: true, ticks: { precision: 0 } },
              x: { grid: { display: false } },
            },
          },
        });

        // Add resize handling
        const ro = new ResizeObserver(() => monthlyProgressChart?.resize());
        ro.observe(chartElement);
        chartResizeObservers.push(ro);
      } catch (error) {
        console.error("Monthly progress chart error:", error);
      }
    };

    // FONCTION MODIFIÉE pour initSkillsChart
    const initSkillsChart = () => {
      try {
        // Vérifier si l'instance du graphique existe déjà et la détruire
        if (skillsChartInstance) {
          skillsChartInstance.destroy();
          skillsChartInstance = null;
        }

        // Vérifier si nous avons des compétences et si le canvas existe
        if (!skills.value.length || !skillsChartCanvas.value) return;

        // Obtenir le contexte du canvas
        const ctx = skillsChartCanvas.value.getContext('2d');
        if (!ctx) return;

        // Compter les compétences par niveau
        const counts = {
          beginner: skills.value.filter(s => getNumericLevel(s.level) === 1).length,
          intermediate: skills.value.filter(s => getNumericLevel(s.level) === 2).length,
          advanced: skills.value.filter(s => getNumericLevel(s.level) === 3).length
        };

        // Préparer les données pour le graphique
        const labels = [];
        const data = [];
        const colors = [];
        
        if (counts.beginner > 0) {
          labels.push('Débutant');
          data.push(counts.beginner);
          colors.push('rgba(255, 193, 7, 0.8)');
        }
        if (counts.intermediate > 0) {
          labels.push('Intermédiaire');
          data.push(counts.intermediate);
          colors.push('rgba(52, 152, 219, 0.8)');
        }
        if (counts.advanced > 0) {
          labels.push('Avancé');
          data.push(counts.advanced);
          colors.push('rgba(46, 204, 113, 0.8)');
        }

        if (data.length === 0) return;

        // Créer le graphique
        skillsChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: colors,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                    const percent = ((ctx.raw / total) * 100).toFixed(1);
                    return `${ctx.label}: ${ctx.raw} (${percent}%)`;
                  }
                }
              }
            },
            cutout: '70%'
          }
        });

        // Ajouter un observateur de redimensionnement
        const ro = new ResizeObserver(() => {
          if (skillsChartInstance) {
            skillsChartInstance.resize();
          }
        });
        ro.observe(skillsChartCanvas.value);
        chartResizeObservers.push(ro);

      } catch (error) {
        console.error("Skills chart error:", error);
      }
    };

    // Data loading
    const loadData = async () => {
      let skillsComposable, projectsComposable, objectivesComposable, timelineComposable;
      try {
        const [
          skillsModule,
          projectsModule,
          objectivesModule,
          timelineModule,
        ] = await Promise.all([
          import("../composables/useSkills"),
          import("../composables/useProjects"),
          import("../composables/useObjectives"),
          import("../composables/useTimeline"),
        ]);

        skillsComposable = skillsModule.useSkills();
        projectsComposable = projectsModule.useProjects();
        objectivesComposable = objectivesModule.useObjectives();
        timelineComposable = timelineModule.useTimeline();

        await Promise.all([
          skillsComposable.getSkills(),
          projectsComposable.getProjects(),
          objectivesComposable.getObjectives(),
          timelineComposable.getRecentActivities(),
        ]);

      } catch (error) {
        console.error("Data loading error:", error);
        return;
      }

      // Watchers should be defined regardless of the success of data loading
      watch(
        () => skillsComposable.skills.value,
        (v) => {
          skills.value = v;
          initSkillsChart();
        },
        { immediate: true }
      );

      watch(
        () => projectsComposable.projects.value,
        (v) => {
          projects.value = v;
          initMonthlyProgressChart();
        },
        { immediate: true }
      );

      watch(
        () => objectivesComposable.objectives.value,
        (v) => (objectives.value = v),
        { immediate: true }
      );

      watch(
        () => timelineComposable.activities.value,
        (v) => (activities.value = v),
        { immediate: true }
      );
    };

    // FONCTION MODIFIÉE pour mettre à jour le niveau de compétence
    const updateSkillLevel = async (skill, newLevel) => {
      try {
        const numLevel = parseInt(newLevel);
        if (isNaN(numLevel) || numLevel < 1 || numLevel > 3) return;

        // Convertir le niveau numérique en texte pour correspondre au format de skillTracker.vue
        let levelText;
        switch (numLevel) {
          case 1: levelText = "Débutant"; break;
          case 2: levelText = "Intermédiaire"; break;
          case 3: levelText = "Avancé"; break;
          default: levelText = "Débutant";
        }

        // Mettre à jour localement pour un feedback immédiat
        const skillIndex = skills.value.findIndex((s) => s.id === skill.id);
        if (skillIndex !== -1) {
          skills.value[skillIndex].level = levelText;
        }

        // Importer le composable useSkills pour mettre à jour la compétence
        const { useSkills } = await import("../composables/useSkills");
        const skillsComposable = useSkills();

        // Mettre à jour dans la base de données avec le format de niveau attendu par skillTracker.vue
        await skillsComposable.updateSkill(skill.id, { ...skill, level: levelText });

        // Réinitialiser le graphique pour refléter les changements
        initSkillsChart();
      } catch (error) {
        console.error("Error updating skill level:", error);
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      await loadData();
      
      // Utiliser un délai pour s'assurer que le DOM est prêt
      setTimeout(() => {
        initMonthlyProgressChart();
        initSkillsChart();
      }, 500);
    });

    onBeforeUnmount(() => {
      chartResizeObservers.forEach((ro) => ro.disconnect());
      if (monthlyProgressChart) monthlyProgressChart.destroy();
      if (skillsChartInstance) skillsChartInstance.destroy();
    });

    return {
      userName,
      userInitial,
      skillsCount,
      projectsCount,
      objectivesCount,
      completedObjectivesPercentage,
      recentSkills,
      recentActivities,
      objectives,
      skillsChartCanvas,
      activeObjectives,
      completedObjectives,
      hasMonthlyData,
      formatDate,
      getLevelName,
      getNumericLevel,
      getLevelClass,
      getSkillLevelPercentage,
      getProgressBarClass,
      getActivityIcon,
      getActivityIconClass,
      updateSkillLevel,
    };
  },
};
</script>

<style scoped>
/* Welcome Banner */
.welcome-banner {
  background: linear-gradient(135deg, #4361ee 0%, #3a56d4 100%);
  border-radius: 15px;
  padding: 2rem;
  color: white;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 20px rgba(67, 97, 238, 0.15);
}

.avatar-container {
  margin-right: 1.5rem;
}

.avatar {
  width: 70px;
  height: 70px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 600;
}

.welcome-text h1 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.welcome-text p {
  margin-bottom: 0;
  opacity: 0.9;
}

/* Stats Cards */
.stat-card {
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.skills-icon {
  background-color: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.projects-icon {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.objectives-icon {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.completed-icon {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

/* Charts */
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  margin: 0 auto;
}

.chart-legend {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 0.75rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.beginner {
  background-color: rgba(255, 193, 7, 0.8);
  
}

.intermediate {
  background-color: rgba(52, 152, 219, 0.8);
}

.advanced {
  background-color: rgba(46, 204, 113, 0.8);
}

/* Activity List */
.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.skills-bg {
  background-color: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.projects-bg {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.objectives-bg {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.default-bg {
  background-color: rgba(108, 117, 125, 0.1);
  color: #6c757d;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.activity-date {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0;
}

/* Skills List */
.skills-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.skill-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.skill-item:last-child {
  border-bottom: none;
}

.skill-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.skill-name {
  font-size: 0.9rem;
  margin-bottom: 0;
}

.skill-level {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
}

.level-1 {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.level-2 {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.level-3 {
  background-color: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.progress {
  height: 8px;
  border-radius: 10px;
  background-color: #f5f5f5;
}

.progress-bar {
  border-radius: 10px;
}

/* Objectives List */
.objectives-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.objective-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background-color: #f8f9fa;
  border-left: 3px solid #ffc107;
}

.objective-item.completed {
  border-left: 3px solid #2ecc71;
  background-color: rgba(46, 204, 113, 0.05);
}

.objective-content {
  flex: 1;
}

.objective-title {
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.objective-description {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.objective-completed-date {
  font-size: 0.75rem;
  color: #2ecc71;
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chart-container {
    height: 250px;
  }

  .legend-item {
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
}

.chart-container {
  min-height: 300px; /* Ensure minimum height */
}

@media (max-width: 767px) {
  .welcome-banner {
    flex-direction: column;
    text-align: center;
  }

  .avatar-container {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}

.skill-progress {
  width: 100%;
  margin-top: 0.5rem;
}

.progress {
  height: 8px;
  background-color: #f0f0f0;
}

.progress-bar {
  transition: width 0.3s ease;
}

/* Ajout de styles pour le slider */
.level-slider {
  width: 100%;
  height: 5px;
  -webkit-appearance: none;
  appearance: none;
  background: #e9ecef;
  outline: none;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.level-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4361ee;
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #4361ee;
  cursor: pointer;
  transition: all 0.2s ease;
}

.level-slider.bg-warning::-webkit-slider-thumb {
  background: #ffc107;
}

.level-slider.bg-info::-webkit-slider-thumb {
  background: #3498db;
}

.level-slider.bg-success::-webkit-slider-thumb {
  background: #2ecc71;
}

.level-slider.bg-warning::-moz-range-thumb {
  background: #ffc107;
}

.level-slider.bg-info::-moz-range-thumb {
  background: #3498db;
}

.level-slider.bg-success::-moz-range-thumb {
  background: #2ecc71;
}
</style>