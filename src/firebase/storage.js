/**
 * Firebase Storage image upload
 * Replaces Cloudinary — uses Firebase Storage directly
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";
import { compressImage, generateThumbnail } from "../utils/helpers";

/**
 * Upload an image to Firebase Storage
 * @param {File} file - Image file
 * @param {string} folder - Storage folder (e.g., "items", "claims/profiles")
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {{ url: string, path: string }}
 */
export const uploadImage = (file, folder = "items", onProgress) => {
  return new Promise((resolve, reject) => {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        if (onProgress) onProgress(progress);
      },
      (error) => {
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url,
            path: uploadTask.snapshot.ref.fullPath,
          });
        } catch (err) {
          reject(new Error(`Failed to get download URL: ${err.message}`));
        }
      }
    );
  });
};

/**
 * Upload an image with a thumbnail variant
 * @param {File} file - Image file
 * @param {string} folder - Storage folder
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {{ url: string, path: string, thumbnailUrl: string, thumbnailPath: string }}
 */
export const uploadImageWithThumbnail = async (file, folder = "items", onProgress) => {
  const [compressed, thumbnail] = await Promise.all([
    compressImage(file, 1200, 0.8),
    generateThumbnail(file, 400, 0.75),
  ]);

  const [fullResult, thumbResult] = await Promise.all([
    uploadImage(compressed, folder, onProgress),
    uploadImage(thumbnail, `${folder}/thumbnails`),
  ]);

  return {
    url: fullResult.url,
    path: fullResult.path,
    thumbnailUrl: thumbResult.url,
    thumbnailPath: thumbResult.path,
  };
};

/**
 * Delete an image from Firebase Storage
 * @param {string} path - Storage path or full URL
 */
export const deleteImage = async (path) => {
  try {
    let storageRef;
    if (path.startsWith("gs://") || path.startsWith("https://")) {
      // It's a URL, we need the path
      const urlPath = path.split("/o/")[1]?.split("?")[0];
      if (urlPath) {
        storageRef = ref(storage, decodeURIComponent(urlPath));
      }
    } else {
      storageRef = ref(storage, path);
    }
    if (storageRef) {
      await deleteObject(storageRef);
    }
  } catch (error) {
    // Image may not exist or already deleted
    console.warn("Image deletion skipped:", error.message);
  }
};

/**
 * Get download URL for a storage path
 * @param {string} path - Storage path
 * @returns {Promise<string>}
 */
export const getImageUrl = async (path) => {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
};
