import { ref } from "vue";
import { storage } from "../firebase/config";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

export function useStorage() {
  const error = ref(null);
  const url = ref(null);
  const filePath = ref(null);
  const progress = ref(0);
  const isPending = ref(false);

  // Upload file to Firebase Storage
  const uploadFile = async (file, path) => {
    error.value = null;
    isPending.value = true;

    // Create a unique filename
    const fileName = `${uuidv4()}-${file.name}`;
    filePath.value = `${path}/${fileName}`;

    const fileRef = storageRef(storage, filePath.value);
    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Track upload progress
          progress.value =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (err) => {
          // Handle errors
          error.value = err.message;
          isPending.value = false;
          reject(err);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          url.value = downloadURL;
          isPending.value = false;
          resolve({ url: downloadURL, path: filePath.value });
        }
      );
    });
  };

  // Delete file from Firebase Storage
  const deleteFile = async (path) => {
    error.value = null;
    isPending.value = true;

    try {
      const fileRef = storageRef(storage, path);
      await deleteObject(fileRef);
      isPending.value = false;
      return true;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
      return false;
    }
  };

  return { error, url, filePath, progress, isPending, uploadFile, deleteFile };
}
