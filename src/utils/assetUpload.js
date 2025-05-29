/**
 * Uploads an asset to the server and returns the new path
 * @param {File|Blob} file - The file to upload
 * @param {string} path - The desired path for the file
 * @returns {Promise<string>} - The new path of the uploaded file
 */
export async function uploadAsset(file, path) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    formData.append('contentType', file.type);

    const response = await fetch('/api/config/save-asset', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to upload asset');
    }

    return result.path;
  } catch (error) {
    console.error('Error uploading asset:', error);
    throw error;
  }
}

/**
 * Converts a blob URL to a File object
 * @param {string} blobUrl - The blob URL to convert
 * @param {string} fileName - The desired file name
 * @returns {Promise<File>} - The File object
 */
export async function blobUrlToFile(blobUrl, fileName) {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  } catch (error) {
    console.error('Error converting blob URL to file:', error);
    throw error;
  }
}

/**
 * Handles a file change event and uploads the file
 * @param {File|string} fileOrUrl - The file or URL to handle
 * @param {string} originalPath - The original path if replacing an existing file
 * @returns {Promise<string>} - The new path of the uploaded file
 */
export async function handleFileChange(fileOrUrl, originalPath = null) {
  try {
    let file;
    let path;

    if (fileOrUrl instanceof File) {
      file = fileOrUrl;
      // If we have an original path, use its directory structure
      if (originalPath) {
        const dir = originalPath.substring(0, originalPath.lastIndexOf('/'));
        path = `${dir}/${file.name}`;
      } else {
        path = `uploads/${Date.now()}_${file.name}`;
      }
    } else if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('blob:')) {
      // Convert blob URL to file
      const fileName = originalPath ? originalPath.split('/').pop() : `upload_${Date.now()}.png`;
      file = await blobUrlToFile(fileOrUrl, fileName);
      path = originalPath || `uploads/${fileName}`;
    } else {
      // If it's a regular URL, return it as is
      return fileOrUrl;
    }

    // Upload the file
    return await uploadAsset(file, path);
  } catch (error) {
    console.error('Error handling file change:', error);
    throw error;
  }
} 