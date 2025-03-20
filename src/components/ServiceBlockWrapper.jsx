import React from "react";

/**
 * ServiceBlockWrapper
 *
 * This component wraps all block components rendered in the service pages
 * to ensure consistent spacing and styling.
 *
 * Props:
 * - children: The block component to render
 * - isFirst: Whether this is the first block (removes top margin)
 * - isLast: Whether this is the last block (removes bottom margin)
 */
const ServiceBlockWrapper = ({ children, isFirst = false, isLast = false }) => {
  return (
    <div
      className={`
        service-block-wrapper 
        ${isFirst ? "mt-0" : ""} 
        ${isLast ? "mb-0" : ""}
      `}
    >
      {children}
    </div>
  );
};

export default ServiceBlockWrapper;
