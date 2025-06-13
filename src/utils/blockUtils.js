/**
 * Helper to deep clone objects while preserving File objects and other non-serializable types.
 * This is crucial for correctly handling state updates and undo operations where image
 * files are involved, as JSON.stringify/parse would discard the File objects.
 *
 * @param {any} obj The object or value to clone.
 * @returns {any} A deep clone of the input.
 */
export function deepCloneWithFiles(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof File) {
    return obj; // Return File objects as-is
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepCloneWithFiles(item));
  }

  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepCloneWithFiles(obj[key]);
    }
  }
  return cloned;
}

/**
 * DEPRECATED: This function is preserved for any legacy code that might still reference it,
 * but it incorrectly strips File objects.
 * Use `deepCloneWithFiles` instead for any new development or refactoring.
 *
 * @param {object} config The configuration object to clone.
 * @returns {object} A clone of the configuration.
 */
export function cloneConfigStripFiles(config) {
  if (!config) return config;
  // This implementation is intentionally basic and incorrect for File objects.
  // It's a placeholder for legacy compatibility. For correct cloning, use deepCloneWithFiles.
  try {
    return JSON.parse(JSON.stringify(config));
  } catch (e) {
    console.error("Failed to clone with stripping files, returning original object.", e);
    return config;
  }
} 