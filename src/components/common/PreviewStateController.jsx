import React from 'react';
import PropTypes from 'prop-types';

const PreviewStateController = ({ label, options, value, onChange, className = '' }) => {
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {label && <span className="text-sm font-medium text-gray-400">{label}:</span>}
      <div className="flex items-center bg-gray-900 rounded-full p-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 ${
              value === option.value
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
            title={option.label}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

PreviewStateController.propTypes = {
  label: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
  })).isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default PreviewStateController; 