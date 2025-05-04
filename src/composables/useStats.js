import { ref, computed } from "vue";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export function useStats() {
  const error = ref(null);
  const isPending = ref(false);

  // Stats data
  const skillsCount = ref(0);
  const projectsCount = ref(0);
  const objectivesCount = ref(0);
  const completedObjectivesCount = ref(0);
  const skillsByLevel = ref({
    Débutant: 0,
    Intermédiaire: 0,
    Avancé: 0,
  });
  const monthlySkillsData = ref([]);
  const monthlyProjectsData = ref([]);

  // Computed properties
  const objectivesCompletionRate = computed(() => {
    if (objectivesCount.value === 0) return 0;
    return Math.round(
      (completedObjectivesCount.value / objectivesCount.value) * 100
    );
  });

  // Load all stats
  const loadAllStats = async () => {
    if (!auth.currentUser) return;

    error.value = null;
    isPending.value = true;

    try {
      await Promise.all([
        loadSkillsStats(),
        loadProjectsStats(),
        loadObjectivesStats(),
        loadMonthlyData(),
      ]);

      isPending.value = false;
      return true;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
      return false;
    }
  };

  // Load skills stats
  const loadSkillsStats = async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, "skills"),
        where("userId", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      skillsCount.value = snapshot.size;

      // Reset skill levels count
      skillsByLevel.value = {
        Débutant: 0,
        Intermédiaire: 0,
        Avancé: 0,
      };

      // Count skills by level
      snapshot.forEach((doc) => {
        const skill = doc.data();
        if (skillsByLevel.value[skill.level] !== undefined) {
          skillsByLevel.value[skill.level]++;
        }
      });

      return true;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      return false;
    }
  };

  // Load projects stats
  const loadProjectsStats = async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, "projects"),
        where("userId", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      projectsCount.value = snapshot.size;

      return true;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      return false;
    }
  };

  // Load objectives stats
  const loadObjectivesStats = async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, "objectives"),
        where("userId", "==", auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      objectivesCount.value = snapshot.size;

      // Count completed objectives
      completedObjectivesCount.value = 0;
      snapshot.forEach((doc) => {
        const objective = doc.data();
        if (objective.status === "Terminé") {
          completedObjectivesCount.value++;
        }
      });

      return true;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      return false;
    }
  };

  // Load monthly data for charts
  const loadMonthlyData = async () => {
    if (!auth.currentUser) return;

    try {
      // Get skills and projects with timestamps
      const skillsQuery = query(
        collection(db, "skills"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "asc")
      );

      const projectsQuery = query(
        collection(db, "projects"),
        where("userId", "==", auth.currentUser.uid),
        orderBy("createdAt", "asc")
      );

      const [skillsSnapshot, projectsSnapshot] = await Promise.all([
        getDocs(skillsQuery),
        getDocs(projectsQuery),
      ]);

      // Process skills data by month
      const skillsData = {};
      skillsSnapshot.forEach((doc) => {
        const skill = doc.data();
        if (skill.createdAt) {
          const date = skill.createdAt.toDate();
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

          if (!skillsData[monthYear]) {
            skillsData[monthYear] = 0;
          }
          skillsData[monthYear]++;
        }
      });

      // Process projects data by month
      const projectsData = {};
      projectsSnapshot.forEach((doc) => {
        const project = doc.data();
        if (project.createdAt) {
          const date = project.createdAt.toDate();
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

          if (!projectsData[monthYear]) {
            projectsData[monthYear] = 0;
          }
          projectsData[monthYear]++;
        }
      });

      // Convert to arrays for charts
      monthlySkillsData.value = Object.entries(skillsData).map(
        ([month, count]) => [month, count]
      );
      monthlyProjectsData.value = Object.entries(projectsData).map(
        ([month, count]) => [month, count]
      );

      return true;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      return false;
    }
  };

  return {
    error,
    isPending,
    skillsCount,
    projectsCount,
    objectivesCount,
    completedObjectivesCount,
    skillsByLevel,
    objectivesCompletionRate,
    monthlySkillsData,
    monthlyProjectsData,
    loadAllStats,
  };
}
