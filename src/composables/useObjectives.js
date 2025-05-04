import { ref } from "vue";
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
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./useAuth";

export function useObjectives() {
  const { user } = useAuth();
  const objectives = ref([]);
  const error = ref(null);
  const isPending = ref(false);

  // Get objectives
  const getObjectives = () => {
    if (!user.value) {
      console.error("No authenticated user found");
      return () => {};
    }

    isPending.value = true;
    error.value = null;

    // Query objectives for current user
    const objectivesRef = collection(db, "objectives");
    const objectivesQuery = query(
      objectivesRef,
      where("userId", "==", user.value.uid),
      orderBy("createdAt", "desc")
    );

    // Subscribe to changes
    const unsubscribe = onSnapshot(
      objectivesQuery,
      (snapshot) => {
        objectives.value = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        isPending.value = false;
      },
      (err) => {
        console.error("Error getting objectives:", err);
        error.value = err.message;
        isPending.value = false;
      }
    );

    return unsubscribe;
  };

  // Add objective
  const addObjective = async (objective) => {
    if (!user.value) {
      console.error("No authenticated user found");
      throw new Error("User not authenticated");
    }

    error.value = null;
    isPending.value = true;

    try {
      const objectiveData = {
        ...objective,
        userId: user.value.uid,
        completed: false,
        completedAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "objectives"), objectiveData);

      // Add to timeline
      await addDoc(collection(db, "timeline"), {
        userId: user.value.uid,
        type: "objective_added",
        title: `Nouvel objectif: ${objective.title}`,
        description: `Vous avez créé un nouvel objectif: ${objective.title}`,
        createdAt: serverTimestamp(),
        relatedId: docRef.id,
      });

      isPending.value = false;
      return docRef;
    } catch (err) {
      console.error("Error adding objective:", err);
      error.value = err.message;
      isPending.value = false;
      throw err;
    }
  };

  // Update objective
  const updateObjective = async (id, updates) => {
    if (!user.value) {
      console.error("No authenticated user found");
      throw new Error("User not authenticated");
    }

    error.value = null;
    isPending.value = true;

    try {
      const objectiveRef = doc(db, "objectives", id);

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(objectiveRef, updateData);
      isPending.value = false;
    } catch (err) {
      console.error("Error updating objective:", err);
      error.value = err.message;
      isPending.value = false;
      throw err;
    }
  };

  // Complete objective
  const completeObjective = async (id) => {
    if (!user.value) {
      console.error("No authenticated user found");
      throw new Error("User not authenticated");
    }

    error.value = null;
    isPending.value = true;

    try {
      const objectiveRef = doc(db, "objectives", id);

      // Get the objective to add to timeline
      const objective = objectives.value.find((obj) => obj.id === id);
      if (!objective) {
        throw new Error("Objective not found");
      }

      // Update the objective
      await updateDoc(objectiveRef, {
        completed: true,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Add to timeline
      await addDoc(collection(db, "timeline"), {
        userId: user.value.uid,
        type: "objective_completed",
        title: `Objectif atteint: ${objective.title}`,
        description: `Vous avez atteint l'objectif: ${objective.title}`,
        createdAt: serverTimestamp(),
        relatedId: id,
      });

      isPending.value = false;
    } catch (err) {
      console.error("Error completing objective:", err);
      error.value = err.message;
      isPending.value = false;
      throw err;
    }
  };

  // Uncomplete objective
  const uncompleteObjective = async (id) => {
    if (!user.value) {
      console.error("No authenticated user found");
      throw new Error("User not authenticated");
    }

    error.value = null;
    isPending.value = true;

    try {
      const objectiveRef = doc(db, "objectives", id);

      await updateDoc(objectiveRef, {
        completed: false,
        completedAt: null,
        updatedAt: serverTimestamp(),
      });

      isPending.value = false;
    } catch (err) {
      console.error("Error uncompleting objective:", err);
      error.value = err.message;
      isPending.value = false;
      throw err;
    }
  };

  // Delete objective
  const deleteObjective = async (id) => {
    if (!user.value) {
      console.error("No authenticated user found");
      throw new Error("User not authenticated");
    }

    error.value = null;
    isPending.value = true;

    try {
      const objectiveRef = doc(db, "objectives", id);
      await deleteDoc(objectiveRef);
      isPending.value = false;
    } catch (err) {
      console.error("Error deleting objective:", err);
      error.value = err.message;
      isPending.value = false;
      throw err;
    }
  };

  return {
    objectives,
    error,
    isPending,
    getObjectives,
    addObjective,
    updateObjective,
    completeObjective,
    uncompleteObjective,
    deleteObjective,
  };
}
