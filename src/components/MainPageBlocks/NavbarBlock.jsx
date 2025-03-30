import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";

/* 
====================================================
 1) NAVBAR PREVIEW (READ-ONLY)
----------------------------------------------------
Uses a `navconfig` prop with:
{
  navLinks: [{ name: string, href: string }, ...],
  logo: string,              // URL for logo image when scrolled
  whiteLogo: string          // URL for white logo before scroll (optional)
}
====================================================
*/
function NavbarPreview({ navconfig }) {
  if (!navconfig) {
    return <p>No navbar data found.</p>;
  }

  console.log("NavbarBlock config:", navconfig);

  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Refs for GSAP burger-menu animation
  const topBarRef = useRef(null);
  const middleBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const timelineRef = useRef(null);

  // Logo refs
  const logoRef = useRef(null);
  const whiteLogoRef = useRef(null);

  const location = useLocation();

  // Extract data from config
  const {
    navLinks = [
      { name: "About", href: "/about" },
      { name: "Booking", href: "/#book" },
      { name: "Packages", href: "/#packages" }
    ],
    logo = "/assets/images/hero/clipped-cowboy.png",
    whiteLogo = "/assets/images/hero/logo.svg"
  } = navconfig;

  // 1) Set up the GSAP timeline for the hamburger menu
  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    tl.to(topBarRef.current, { y: 10, rotate: -45, duration: 0.3 })
      .to(middleBarRef.current, { opacity: 0, duration: 0.3 }, "<")
      .to(bottomBarRef.current, { y: -10, rotate: 45, duration: 0.3 }, "<");
    timelineRef.current = tl;
  }, []);

  // 2) Play / reverse the GSAP timeline based on `isOpen`
  useEffect(() => {
    if (isOpen) {
      timelineRef.current.play();
    } else {
      timelineRef.current.reverse();
    }
  }, [isOpen]);

  // 3) Logo visibility based on scroll
  useEffect(() => {
    if (logoRef.current && whiteLogoRef.current) {
      gsap.to(logoRef.current, {
        opacity: hasScrolled ? 1 : 0,
        duration: 0.3,
      });
      gsap.to(whiteLogoRef.current, {
        opacity: hasScrolled ? 0 : 1,
        duration: 0.3,
      });
    }
  }, [hasScrolled]);

  // 4) Add scroll event listener to change navbar color on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 w-full flex items-center justify-between 
        ${
          hasScrolled
            ? "bg-banner transition-all duration-300 h-14"
            : "bg-transparent transition-all duration-300 h-10 md:h-12"
        } 
        px-5 md:px-10`}
      >
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            {/* White logo (visible before scroll) */}
            <img
              ref={whiteLogoRef}
              src={whiteLogo}
              alt="Logo Light"
              className="h-6 md:h-8 transition-opacity duration-300"
              style={{ filter: "invert(1)" }}
            />
            {/* Regular logo (visible after scroll) */}
            <img
              ref={logoRef}
              src={logo}
              alt="Logo Dark"
              className="h-6 md:h-8 absolute top-0 left-5 opacity-0 transition-opacity duration-300"
              style={{ marginTop: "10px" }}
            />
          </Link>
        </div>

        {/* Right side: Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center justify-end space-x-5 pr-0">
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              className={`text-sm font-normal ${
                hasScrolled
                  ? "text-white hover:text-gray-200"
                  : "text-white hover:text-gray-200"
              } transition-colors duration-300`}
            >
              {nav.name}
            </HashLink>
          ))}
        </div>

        {/* Right: Hamburger Menu (Mobile) - Always at top right */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <div className="relative w-5 h-5">
              <span
                ref={topBarRef}
                className={`absolute top-0 left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-white"
                } transition-colors duration-300`}
              />
              <span
                ref={middleBarRef}
                className={`absolute top-2 left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-white"
                } transition-colors duration-300`}
              />
              <span
                ref={bottomBarRef}
                className={`absolute top-4 left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-white"
                } transition-colors duration-300`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu - Smaller and to the right */}
      {isOpen && (
        <div
          className="md:hidden flex flex-col items-end justify-start w-[200px] fixed top-14 right-0 z-50 bg-banner shadow-lg transition-colors duration-300 rounded-bl-lg"
        >
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              onClick={() => setIsOpen(false)}
              className="px-5 py-3 text-sm text-white hover:text-gray-200 w-full text-right"
            >
              {nav.name}
            </HashLink>
          ))}
        </div>
      )}
    </>
  );
}

/* 
====================================================
 2) NAVBAR EDITOR PANEL (EDIT MODE)
----------------------------------------------------
Allows editing nav links and logo images
====================================================
*/
function NavbarEditorPanel({ localData, setLocalData, onSave }) {
  const {
    navLinks = [],
    logo = "",
    whiteLogo = "",
  } = localData;

  // Handle adding a new nav link
  const handleAddNavLink = () => {
    setLocalData({
      ...localData,
      navLinks: [...navLinks, { name: "New Link", href: "/" }],
    });
  };

  // Handle removing a nav link
  const handleRemoveNavLink = (index) => {
    const updatedLinks = [...navLinks];
    updatedLinks.splice(index, 1);
    setLocalData({
      ...localData,
      navLinks: updatedLinks,
    });
  };

  // Handle updating a nav link
  const handleNavLinkChange = (index, field, value) => {
    const updatedLinks = [...navLinks];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value,
    };
    setLocalData({
      ...localData,
      navLinks: updatedLinks,
    });
  };

  // Handle logo uploads
  const handleLogoChange = (file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setLocalData((prev) => ({ ...prev, logo: fileURL }));
    }
  };

  const handleWhiteLogoChange = (file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setLocalData((prev) => ({ ...prev, whiteLogo: fileURL }));
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-md overflow-hidden">
      {/* Title Bar with Save Button */}
      <div className="flex items-center justify-between bg-banner p-4">
        <h2 className="text-xl font-semibold">Navbar Editor</h2>
        <button
          onClick={onSave}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Save Changes
        </button>
      </div>

      {/* Navigation Links Section */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h3 className="text-lg font-semibold mb-3">Navigation Links</h3>
        
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {navLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-700 p-3 rounded-md">
              <div className="flex-grow space-y-2">
                <div>
                  <label className="text-sm text-gray-300 block">Link Text:</label>
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => handleNavLinkChange(idx, "name", e.target.value)}
                    className="w-full bg-gray-600 text-white rounded-md border border-gray-500 p-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block">Link URL:</label>
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => handleNavLinkChange(idx, "href", e.target.value)}
                    className="w-full bg-gray-600 text-white rounded-md border border-gray-500 p-1"
                  />
                </div>
              </div>
              <button
                onClick={() => handleRemoveNavLink(idx)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors h-fit"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        
        <button
          onClick={handleAddNavLink}
          className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add Link
        </button>
      </div>

      {/* Logo Section */}
      <div className="p-4 bg-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">Main Logo (After Scroll)</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleLogoChange(e.target.files?.[0])}
            className="w-full bg-gray-700 text-sm rounded-md border border-gray-600 p-2"
          />
          {logo && (
            <img
              src={logo}
              alt="Logo Preview"
              className="mt-2 h-16 object-contain bg-banner p-1 rounded-md"
            />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-3">White Logo (Before Scroll)</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleWhiteLogoChange(e.target.files?.[0])}
            className="w-full bg-gray-700 text-sm rounded-md border border-gray-600 p-2"
          />
          {whiteLogo && (
            <img
              src={whiteLogo}
              alt="White Logo Preview"
              className="mt-2 h-16 object-contain bg-gray-700 p-1 rounded-md"
              style={{ filter: "invert(1)" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* 
====================================================
 3) MAIN EXPORT: NAVBAR BLOCK
----------------------------------------------------
If readOnly=true, renders NavbarPreview.
If false, renders NavbarEditorPanel.
====================================================
*/
export default function NavbarBlock({
  navconfig,
  readOnly = false,
  onConfigChange,
}) {
  // Helper function to ensure proper image paths
  const ensureProperImagePaths = (config) => {
    const updatedConfig = { ...config };
    
    if (updatedConfig.logo && !updatedConfig.logo.startsWith('/assets/images/')) {
      console.log("Logo path might need server-side processing:", updatedConfig.logo);
    }
    
    if (updatedConfig.whiteLogo && !updatedConfig.whiteLogo.startsWith('/assets/images/')) {
      console.log("White logo path might need server-side processing:", updatedConfig.whiteLogo);
    }
    
    return updatedConfig;
  };

  const [localNav, setLocalNav] = useState(() => {
    // Use provided nav config or create a default one
    if (!navconfig) {
      return {
        navLinks: [
          { name: "About", href: "/about" },
          { name: "Booking", href: "/#book" },
          { name: "Packages", href: "/#packages" }
        ],
        logo: "/assets/images/hero/clipped-cowboy.png",
        whiteLogo: "/assets/images/hero/logo.svg"
      };
    }
    return { ...navconfig };
  });

  const handleSave = () => {
    if (onConfigChange) {
      // Process paths before saving
      const processedConfig = ensureProperImagePaths(localNav);
      onConfigChange(processedConfig);
    }
  };

  // If read-only mode, just show the preview
  if (readOnly) {
    return <NavbarPreview navconfig={navconfig} />;
  }

  // Otherwise show both editor and preview with a clearer organization
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Preview panel */}
      <div className="md:w-1/2 order-2 md:order-1 z-10">
        <h3 className="text-sm text-gray-400 mb-2">Preview:</h3>
        <div className="border border-gray-300 rounded overflow-hidden relative z-40 bg-gray-800 h-40">
          <NavbarPreview navconfig={localNav} />
        </div>
      </div>
      
      {/* Editor panel */}
      <div className="md:w-1/2 order-1 md:order-2">
        <NavbarEditorPanel
          localData={localNav}
          setLocalData={setLocalNav}
          onSave={handleSave}
        />
      </div>
    </div>
  );
} 