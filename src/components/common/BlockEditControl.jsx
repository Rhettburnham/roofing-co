import React from 'react';
import PropTypes from 'prop-types';

const PencilIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-12 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487a2.032 2.032 0 112.872 2.872L7.5 21.613H4v-3.5L16.862 4.487z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-12 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

const UndoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);

const BlockEditControl = ({ isEditing, onToggleEdit, onUndo, showUndo, zIndex = 'z-50' }) => {
  return (
    <div className={`absolute -top-2 left-4 ${zIndex} flex gap-2`}>
      {isEditing && showUndo && (
        <button
          type="button"
          onClick={onUndo}
          className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 shadow-lg transition-colors"
          title="Undo changes"
        >
          <UndoIcon />
        </button>
      )}
      <button
        type="button"
        onClick={onToggleEdit}
        className={`${isEditing ? 'bg-green-500 hover:bg-white text-black' : 'bg-banner'} text-white rounded-full p-2 shadow-lg transition-colors`}
        title={isEditing ? "Finish Editing" : "Edit Block"}
      >
        {isEditing ? <CheckIcon /> : <PencilIcon />}
      </button>
    </div>
  );
};

BlockEditControl.propTypes = {
  isEditing: PropTypes.bool.isRequired,
  onToggleEdit: PropTypes.func.isRequired,
  onUndo: PropTypes.func,
  showUndo: PropTypes.bool,
  zIndex: PropTypes.string,
};

export default BlockEditControl; 