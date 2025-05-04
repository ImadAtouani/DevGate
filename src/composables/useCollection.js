import { ref } from "vue";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

export function useCollection(collectionName) {
  const error = ref(null);
  const isPending = ref(false);

  // Add a document to collection
  const addDocument = async (data) => {
    error.value = null;
    isPending.value = true;

    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
      });

      isPending.value = false;
      return docRef;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
    }
  };

  // Update a document
  const updateDocument = async (id, data) => {
    error.value = null;
    isPending.value = true;

    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      isPending.value = false;
      return true;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
      return false;
    }
  };

  // Delete a document
  const deleteDocument = async (id) => {
    error.value = null;
    isPending.value = true;

    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);

      isPending.value = false;
      return true;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
      return false;
    }
  };

  return { error, isPending, addDocument, updateDocument, deleteDocument };
}
