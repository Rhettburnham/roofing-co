// src/utils/scrollWithCenter.js
export const scrollWithCenter = (element) => {
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  