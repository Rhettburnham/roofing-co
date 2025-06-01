import React, { useImperativeHandle, forwardRef, useState, useEffect } from 'react';

const NavbarEditForm = React.forwardRef(({ 
  navbarConfig, 
  onConfigChange, 
  previewNavbarAsScrolled, 
  setPreviewNavbarAsScrolled,
  onOpenIconModal
}, ref) => {
  const [localNavConfig, setLocalNavConfig] = useState(() => {
    const initial = navbarConfig || {};
    const initialLogo = initial.logo || { url: '/assets/images/hero/clipped.png', file: null, name: 'clipped.png', originalUrl: '/assets/images/hero/clipped.png' };
    const initialWhiteLogo = initial.whiteLogo || { url: '', file: null, name: '', originalUrl: '' };

    return {
      navLinks: initial.navLinks || [{ name: "Home", href: "/" }],
      logo: { 
        ...initialLogo, 
        originalUrl: typeof initialLogo.url === 'string' && !initialLogo.url.startsWith('blob:') ? initialLogo.url : (initialLogo.originalUrl || '/assets/images/hero/clipped.png')
      },
      whiteLogo: { 
        ...initialWhiteLogo, 
        originalUrl: typeof initialWhiteLogo.url === 'string' && !initialWhiteLogo.url.startsWith('blob:') ? initialWhiteLogo.url : (initialWhiteLogo.originalUrl || '')
      },
      whiteLogoIcon: initial.whiteLogoIcon || null,
      unscrolledBackgroundColor: initial.unscrolledBackgroundColor || 'bg-transparent',
      scrolledBackgroundColor: initial.scrolledBackgroundColor || 'bg-banner',
      dropdownBackgroundColor: initial.dropdownBackgroundColor || 'bg-white',
      dropdownTextColor: initial.dropdownTextColor || 'text-black',
      useWhiteHamburger: initial.useWhiteHamburger || false,
    };
  });

  useEffect(() => {
    setLocalNavConfig(prevConfig => {
      const newBase = navbarConfig || {};
      const defaultLogoUrl = '/assets/images/hero/clipped.png';
      const defaultWhiteLogoUrl = '';

      const resolveField = (fieldName, defaultValue, isObject = false) => {
        if (isObject) {
          const prevField = prevConfig[fieldName];
          const newBaseField = newBase[fieldName];
          if (JSON.stringify(prevField) !== JSON.stringify(newBaseField) && 
              JSON.stringify(prevField) !== JSON.stringify(defaultValue)) {
            return prevField;
          }
          return newBaseField || defaultValue;
        } else {
          const prevValue = prevConfig[fieldName];
          const newValue = newBase[fieldName];
          if (prevValue !== undefined && prevValue !== newValue && prevValue !== defaultValue) {
            return prevValue;
          }
          return newValue !== undefined ? newValue : defaultValue;
        }
      };

      const resolvedNavLinks = resolveField('navLinks', [{ name: "Home", href: "/" }], true);
      
      const resolvedLogo = {
        file: newBase.logo?.file !== undefined ? newBase.logo.file : prevConfig.logo?.file,
        url: newBase.logo?.url !== undefined ? newBase.logo.url : prevConfig.logo?.url,
        name: newBase.logo?.name !== undefined ? newBase.logo.name : prevConfig.logo?.name,
        originalUrl: newBase.logo?.originalUrl || 
                     (typeof newBase.logo?.url === 'string' && !newBase.logo.url.startsWith('blob:') ? newBase.logo.url : prevConfig.logo?.originalUrl || defaultLogoUrl)
      };
      if (prevConfig.logo?.file && prevConfig.logo?.url?.startsWith('blob:')) {
          if (resolvedLogo.url !== prevConfig.logo.url) {
            // URL.revokeObjectURL(prevConfig.logo.url); // Handled in handleImageInputChange
          } else {
            resolvedLogo.file = prevConfig.logo.file;
            resolvedLogo.url = prevConfig.logo.url;
            resolvedLogo.name = prevConfig.logo.name;
          }
      }

      const resolvedWhiteLogo = {
        file: newBase.whiteLogo?.file !== undefined ? newBase.whiteLogo.file : prevConfig.whiteLogo?.file,
        url: newBase.whiteLogo?.url !== undefined ? newBase.whiteLogo.url : prevConfig.whiteLogo?.url,
        name: newBase.whiteLogo?.name !== undefined ? newBase.whiteLogo.name : prevConfig.whiteLogo?.name,
        originalUrl: newBase.whiteLogo?.originalUrl || 
                     (typeof newBase.whiteLogo?.url === 'string' && !newBase.whiteLogo.url.startsWith('blob:') ? newBase.whiteLogo.url : prevConfig.whiteLogo?.originalUrl || defaultWhiteLogoUrl)
      };
      if (prevConfig.whiteLogo?.file && prevConfig.whiteLogo?.url?.startsWith('blob:')) {
        if (resolvedWhiteLogo.url !== prevConfig.whiteLogo.url) {
            // Handled in handleImageInputChange
        } else {
            resolvedWhiteLogo.file = prevConfig.whiteLogo.file;
            resolvedWhiteLogo.url = prevConfig.whiteLogo.url;
            resolvedWhiteLogo.name = prevConfig.whiteLogo.name;
        }
      }

      return {
        ...prevConfig,
        navLinks: resolvedNavLinks,
        logo: resolvedLogo,
        whiteLogo: resolvedWhiteLogo,
        whiteLogoIcon: resolveField('whiteLogoIcon', null, true),
        unscrolledBackgroundColor: resolveField('unscrolledBackgroundColor', 'bg-transparent'),
        scrolledBackgroundColor: resolveField('scrolledBackgroundColor', 'bg-banner'),
        dropdownBackgroundColor: resolveField('dropdownBackgroundColor', 'bg-white'),
        dropdownTextColor: resolveField('dropdownTextColor', 'text-black'),
        useWhiteHamburger: resolveField('useWhiteHamburger', false),
      };
    });
  }, [navbarConfig]);

  useImperativeHandle(ref, () => ({
    commitChanges: () => {
      const configToCommit = { ...localNavConfig };

      // Logic for logo
      if (localNavConfig.logo?.file instanceof File) {
        configToCommit.logo = {
          ...localNavConfig.logo,
          originalUrl: localNavConfig.logo.originalUrl
        };
      } else if (localNavConfig.logo?.url) {
        configToCommit.logo = {
          file: null,
          url: localNavConfig.logo.url,
          name: localNavConfig.logo.name,
          originalUrl: localNavConfig.logo.originalUrl || (!localNavConfig.logo.url.startsWith('blob:') ? localNavConfig.logo.url : '')
        };
      } else {
        configToCommit.logo = { url: '', name: '', file: null, originalUrl: '' };
      }

      // Logic for whiteLogo
      if (localNavConfig.whiteLogo?.file instanceof File) {
        configToCommit.whiteLogo = {
          ...localNavConfig.whiteLogo,
          originalUrl: localNavConfig.whiteLogo.originalUrl
        };
      } else if (localNavConfig.whiteLogo?.url) {
        configToCommit.whiteLogo = {
          file: null,
          url: localNavConfig.whiteLogo.url,
          name: localNavConfig.whiteLogo.name,
          originalUrl: localNavConfig.whiteLogo.originalUrl || (!localNavConfig.whiteLogo.url.startsWith('blob:') ? localNavConfig.whiteLogo.url : '')
        };
      } else {
        configToCommit.whiteLogo = { url: '', name: '', file: null, originalUrl: '' };
      }
      
      onConfigChange(configToCommit);
      console.log("NavbarEditForm: Committed changes via ref", JSON.parse(JSON.stringify(configToCommit, (k,v) => v instanceof File ? ({name:v.name, size:v.size, type:v.type}) : v)));
    }
  }));

  const handleInputChange = (field, value) => {
    setLocalNavConfig(prevConf => ({ ...prevConf, [field]: value }));
  };

  const handleImageInputChange = (field, type, value) => {
    setLocalNavConfig(prevConf => {
      const currentImageState = prevConf[field] || { url: '', file: null, name: '', originalUrl: '' };
      let newImageState;

      if (type === 'file' && value instanceof File) {
        if (currentImageState.url && currentImageState.url.startsWith('blob:')) {
          URL.revokeObjectURL(currentImageState.url);
        }
        newImageState = {
            originalUrl: currentImageState.originalUrl, 
            file: value, 
            url: URL.createObjectURL(value), 
            name: value.name
        };
      } else if (type === 'url') {
        if (currentImageState.url && currentImageState.url.startsWith('blob:')) {
          URL.revokeObjectURL(currentImageState.url);
        }
        newImageState = { 
            file: null, 
            url: value, 
            name: value.split('/').pop(),
            originalUrl: value 
        };
      }
      const updates = { [field]: newImageState };
      if (field === 'whiteLogo' && (newImageState.file || newImageState.url)) {
        updates.whiteLogoIcon = null;
      }
      return { ...prevConf, ...updates };
    });
  };
  
  const getDisplayUrl = (imageState) => {
    if (!imageState) return '';
    if (imageState.file && imageState.url && imageState.url.startsWith('blob:')) return imageState.url;
    return imageState.url || imageState.originalUrl || ''; 
  };

  const handleNavLinkChange = (index, field, value) => {
    const updatedNavLinks = localNavConfig.navLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    handleInputChange('navLinks', updatedNavLinks);
  };

  const addNavLink = () => {
    handleInputChange('navLinks', [...(localNavConfig.navLinks || []), { name: 'New Link', href: '/' }]);
  };

  const removeNavLink = (index) => {
    const updatedNavLinks = (localNavConfig.navLinks || []).filter((_, i) => i !== index);
    handleInputChange('navLinks', updatedNavLinks);
  };

  const predefinedRoutes = [
    { label: "Home Page", value: "/" },
    { label: "About Page", value: "/about" },
    { label: "Booking Anchor", value: "/#book" },
    { label: "Packages Anchor", value: "/#packages" },
    { label: "Services Anchor", value: "/#services" }, 
    { label: "Contact Anchor", value: "/#contact" },   
    { label: "Legal Page", value: "/legal" },
    { label: "All Service Blocks Page", value: "/all-service-blocks" },
    { label: "Custom URL...", value: "CUSTOM" }
  ];
  
  if (!localNavConfig) return <p>Loading navbar configuration...</p>;

  return (
    <div className="p-4 space-y-4 bg-gray-50 rounded-md">
      <div className="flex space-x-2 mb-3 border-b pb-3">
        <p className="text-sm font-medium text-gray-700 self-center mr-2">Preview Mode:</p>
        <button 
          type="button" 
          onClick={() => setPreviewNavbarAsScrolled(false)}
          className={`px-3 py-1.5 text-xs rounded-md ${!previewNavbarAsScrolled ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Unscrolled
        </button>
        <button 
          type="button" 
          onClick={() => setPreviewNavbarAsScrolled(true)}
          className={`px-3 py-1.5 text-xs rounded-md ${previewNavbarAsScrolled ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Scrolled
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="border p-3 rounded-md bg-white shadow-sm">
            <label className="block text-sm font-medium text-gray-700">Logo:</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageInputChange('logo', 'file', e.target.files?.[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
            <input type="text" placeholder="Or paste image URL" value={getDisplayUrl(localNavConfig.logo) === localNavConfig.logo?.file?.name ? '' : getDisplayUrl(localNavConfig.logo)} onChange={(e) => handleImageInputChange('logo', 'url', e.target.value)} className="mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
            {getDisplayUrl(localNavConfig.logo) && <img src={getDisplayUrl(localNavConfig.logo)} alt="Logo Preview" className="mt-2 h-12 w-auto object-contain border p-1 bg-gray-100 rounded" />}
        </div>
        <div className="border p-3 rounded-md bg-white shadow-sm">
            <label className="block text-sm font-medium text-gray-700">White Logo (for dark unscrolled backgrounds):</label>
            <div className="flex items-center space-x-2 mt-1">
                <button 
                    type="button"
                    onClick={() => onOpenIconModal('whiteLogoIcon', localNavConfig.whiteLogoIcon)}
                    className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                    Select Icon
                </button>
                {!localNavConfig.whiteLogoIcon && <span className="text-sm text-gray-600">OR Upload Image:</span>}
            </div>

            {localNavConfig.whiteLogoIcon ? (
                <div className="mt-2 p-2 bg-gray-100 rounded-md">
                    <p className="text-sm text-gray-700">
                        Selected Icon: <strong>{localNavConfig.whiteLogoIcon.pack} - {localNavConfig.whiteLogoIcon.name}</strong>
                        <button 
                            type="button" 
                            onClick={() => handleInputChange('whiteLogoIcon', null)} 
                            className="text-red-500 hover:text-red-700 text-xs ml-2 font-semibold"
                        >
                            (Clear Icon & Use Image Instead)
                        </button>
                    </p>
                </div>
            ) : (
                <>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageInputChange('whiteLogo', 'file', e.target.files?.[0])} 
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
                    <input 
                        type="text" 
                        placeholder="Or paste image URL" 
                        value={getDisplayUrl(localNavConfig.whiteLogo) === localNavConfig.whiteLogo?.file?.name ? '' : getDisplayUrl(localNavConfig.whiteLogo)} 
                        onChange={(e) => handleImageInputChange('whiteLogo', 'url', e.target.value)} 
                        className="mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                    {getDisplayUrl(localNavConfig.whiteLogo) && <img src={getDisplayUrl(localNavConfig.whiteLogo)} alt="White Logo Preview" className="mt-2 h-12 w-auto object-contain border p-1 bg-gray-700 rounded" />}
                </>
            )}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 mb-2">Navigation Links:</h3>
        {(localNavConfig.navLinks || []).map((link, index) => (
          <div key={index} className="p-2 border border-gray-200 rounded-md mb-2 bg-white shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <label className="block text-xs font-medium text-gray-600">Display Name:</label>
                <input type="text" value={link.name} onChange={(e) => handleNavLinkChange(index, 'name', e.target.value)} className="mt-0.5 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
              </div>
              <div className="flex-grow">
                <label className="block text-xs font-medium text-gray-600">Target Route:</label>
                <select value={predefinedRoutes.find(r => r.value === link.href) ? link.href : 'CUSTOM'} onChange={(e) => {
                    const val = e.target.value;
                    handleNavLinkChange(index, 'href', val === 'CUSTOM' ? '' : val);
                }} className="mt-0.5 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm">
                    {predefinedRoutes.map(route => <option key={route.value} value={route.value}>{route.label}</option>)} سلي
                </select>
                {(link.href === 'CUSTOM' || !predefinedRoutes.find(r => r.value === link.href)) && (
                     <input type="text" value={link.href === 'CUSTOM' ? '' : link.href} onChange={(e) => handleNavLinkChange(index, 'href', e.target.value)} placeholder="Enter custom URL (e.g., /#contact)" className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                )}
              </div>
              <button type="button" onClick={() => removeNavLink(index)} className="text-red-500 hover:text-red-700 text-xs font-semibold self-end pb-1">Remove</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addNavLink} className="mt-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">Add Nav Link</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 pt-4 mt-3 border-t border-gray-200">
        {[
          { label: 'Unscrolled Background:', field: 'unscrolledBackgroundColor' },
          { label: 'Scrolled Background:', field: 'scrolledBackgroundColor' },
          { label: 'Dropdown Background:', field: 'dropdownBackgroundColor' }
        ].map(({label, field}) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center space-x-2">
              <input 
                type="color" 
                value={localNavConfig[field]?.startsWith('#') ? localNavConfig[field] : (localNavConfig[field]?.includes('transparent') ? '#ffffff' : '#000000')}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="h-9 w-10 p-0.5 border border-gray-300 rounded-md cursor-pointer"
              />
              <input 
                type="text" 
                value={localNavConfig[field] || ''} 
                onChange={(e) => handleInputChange(field, e.target.value)} 
                placeholder="Hex or Tailwind class" 
                className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700">Dropdown Text Color:</label>
          <input 
            type="text" 
            value={localNavConfig.dropdownTextColor || ''} 
            onChange={(e) => handleInputChange('dropdownTextColor', e.target.value)} 
            placeholder="e.g., text-black" 
            className="mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>
        <div className="md:col-span-2 flex items-center mt-1">
            <input 
                type="checkbox" 
                checked={localNavConfig.useWhiteHamburger || false} 
                onChange={(e) => handleInputChange('useWhiteHamburger', e.target.checked)} 
                className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">Use White Hamburger Icon</label>
        </div>
      </div>
    </div>
  );
});

export default NavbarEditForm; 