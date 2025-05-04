import { ref } from "vue";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export function useDocument(collectionName, id) {
  const document = ref(null);
  const error = ref(null);
  const isPending = ref(false);

  // Get a document once
  const getDocument = async () => {
    error.value = null;
    isPending.value = true;

    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        document.value = { id: docSnap.id, ...docSnap.data() };
      } else {
        error.value = "Document does not exist";
      }

      isPending.value = false;
      return document.value;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
    }
  };

  // Listen to real-time updates
  let unsubscribe;

  const listenToDocument = () => {
    error.value = null;
    isPending.value = true;

    const docRef = doc(db, collectionName, id);

    unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          document.value = { id: docSnap.id, ...docSnap.data() };
        } else {
          error.value = "Document does not exist";
        }
        isPending.value = false;
      },
      (err) => {
        console.error(err.message);
        error.value = err.message;
        isPending.value = false;
      }
    );
  };

  // Stop listening to updates
  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };

  return {
    document,
    error,
    isPending,
    getDocument,
    listenToDocument,
    stopListening,
  };
}
