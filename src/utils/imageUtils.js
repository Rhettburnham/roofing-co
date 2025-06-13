/**
 * Initializes the state for an image, handling both string paths and file objects.
 * @param {string|File|Object} imageConfig - The image configuration, which can be a URL string, a File object, or an object with a `url` property.
 * @param {string} defaultPath - The default path to use if the imageConfig is not valid.
 * @returns {{url: string, file: File|null, originalUrl: string}}
 */
export const initializeImageState = (imageConfig, defaultPath) => {
  let initialUrl = defaultPath;
  let initialFile = null;
  let originalUrl = defaultPath;

  if (typeof imageConfig === 'string') {
    initialUrl = imageConfig;
    originalUrl = imageConfig;
  } else if (imageConfig instanceof File) {
    initialUrl = URL.createObjectURL(imageConfig);
    initialFile = imageConfig;
    // A new file doesn't have a persistent originalUrl yet.
    // The defaultPath might be a fallback image, which is a reasonable originalUrl in this case.
    originalUrl = defaultPath;
  } else if (imageConfig && typeof imageConfig.url === 'string') {
    initialUrl = imageConfig.url;
    initialFile = imageConfig.file instanceof File ? imageConfig.file : null;
    // Preserve the existing originalUrl if it's there, otherwise, use logic to determine it.
    if (imageConfig.originalUrl) {
      originalUrl = imageConfig.originalUrl;
    } else if (typeof imageConfig.url === 'string' && !imageConfig.url.startsWith('blob:')) {
      // If the URL is not a blob, it's the persistent URL.
      originalUrl = imageConfig.url;
    }
    // Otherwise, we stick with the defaultPath.
  }

  return {
    url: initialUrl,
    file: initialFile,
    originalUrl: originalUrl,
  };
}; 