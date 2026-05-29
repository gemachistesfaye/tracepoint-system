/**
 * Cloudinary image upload (no server needed — unsigned upload preset)
 * Free plan: 25GB storage, 25GB bandwidth/month
 */

const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload an image to Cloudinary
 * @param {File} file - Image file
 * @param {string} folder - Cloudinary folder name
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {{ url, publicId }}
 */
export const uploadImage = (file, folder = "tracepoint/items", onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          // Keep 'path' alias so existing code stays compatible
          path: data.public_id,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload error")));

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    );
    xhr.send(formData);
  });
};

/**
 * Delete an image from Cloudinary
 * Note: Deletion from the frontend requires a signed request or a backend.
 * For simplicity we just log a warning — images can be managed in Cloudinary dashboard.
 */
export const deleteImage = async (publicId) => {
  // To enable deletion, set up a small backend endpoint or a Firebase Cloud Function
  // that calls the Cloudinary Admin API with your API secret.
  console.warn(
    "Image deletion skipped (requires backend). Manage at cloudinary.com/console →",
    publicId
  );
};
