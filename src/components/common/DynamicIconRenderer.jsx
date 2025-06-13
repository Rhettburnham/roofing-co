import React, { Suspense, lazy } from 'react';
import PropTypes from 'prop-types';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { HelpCircle } from 'lucide-react';

// Helper to convert PascalCase to kebab-case for lucide icon names
const toKebabCase = (str) => {
  if (!str) return '';
  return str
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2') // Handles PascalCase
    .replace(/([A-Za-z])(\d)/g, '$1-$2') // Handles transitions from letters to numbers e.g. Building2 -> building-2
    .toLowerCase()
    .replace(/^-/, '');
};

const FaQuestionCircle = lazy(() => import('react-icons/fa').then(module => ({ default: module.FaQuestionCircle })));

const iconLoaders = {
  lucide: (name, props) => {
    let iconKey = toKebabCase(name);
    // If the icon is not found, try removing a potential "Icon" suffix
    if (!dynamicIconImports[iconKey] && name.endsWith('Icon')) {
      iconKey = toKebabCase(name.slice(0, -4));
    }

    if (!dynamicIconImports[iconKey]) {
      console.warn(`Lucide icon "${name}" (-> "${iconKey}") not found.`);
      return <HelpCircle {...props} />;
    }
    const LucideIcon = lazy(dynamicIconImports[iconKey]);
    return <LucideIcon {...props} />;
  },
  fa: (name, props) => {
    const LazyIcon = lazy(() =>
      import('react-icons/fa')
        .then(module => {
          const variants = new Set();
          
          // Add original name
          variants.add(name);
          
          // Handle "Fa" prefix
          if (name.startsWith('Fa')) {
            variants.add(name.substring(2));
          } else {
            variants.add(`Fa${name.charAt(0).toUpperCase() + name.slice(1)}`);
          }

          // Handle "Icon" suffix
          if (name.endsWith('Icon')) {
            const base = name.slice(0, -4);
            variants.add(base);
            if (base.startsWith('Fa')) {
              variants.add(base.substring(2));
            } else {
              variants.add(`Fa${base.charAt(0).toUpperCase() + base.slice(1)}`);
            }
          }
          
          for (const variant of variants) {
              if (module[variant]) {
                  return { default: module[variant] };
              }
          }

          console.warn(`FontAwesome icon "${name}" not found.`);
          return { default: module.FaQuestionCircle };
        })
        .catch(err => {
          console.error(`Error loading FontAwesome icon "${name}":`, err);
          return { default: FaQuestionCircle };
        })
    );
    return <LazyIcon {...props} />;
  },
};

const DynamicIconRenderer = ({ pack, name, fallback: FallbackComponent, ...props }) => {
  const packId = pack?.toLowerCase();
  
  if (!packId || !name || !iconLoaders[packId]) {
    const Fallback = FallbackComponent || HelpCircle;
    return <Fallback {...props} />;
  }

  const loader = iconLoaders[packId];

  // Set default size if not provided
  const componentProps = { size: 24, ...props };

  return (
    <Suspense fallback={<div style={{ width: componentProps.size, height: componentProps.size }} className="bg-gray-700 rounded animate-pulse" />}>
      {loader(name, componentProps)}
    </Suspense>
  );
};

DynamicIconRenderer.propTypes = {
  pack: PropTypes.string, // 'lucide' or 'fa'
  name: PropTypes.string, // PascalCase name of the icon
  fallback: PropTypes.elementType,
};

export default DynamicIconRenderer; 