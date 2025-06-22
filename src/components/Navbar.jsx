import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";
import PropTypes from "prop-types";
import { Home, Building2, HelpCircle } from "lucide-react";
import { FaWarehouse } from 'react-icons/fa';
import PanelFontController from "./common/PanelFontController";
import ThemeColorPicker from "./common/ThemeColorPicker";
import IconSelectorModal from "./common/IconSelectorModal";
import PanelImagesController from "./common/PanelImagesController";

/**
 * Navbar Component with Configurable Animations
 * All sizing, styling, and content should be driven by the `config` prop.
 */

const getDisplayUrl = (imageValue) => {
  // Handles new image object structure `{ url, file, name, originalUrl }`
  // and legacy string paths.
  if (!imageValue) return null;

  if (typeof imageValue === 'object') {
    // This could be an object from the images array or a direct file upload object.
    if (imageValue.url) {
      return imageValue.url; // Blob URL or regular URL
    }
    if (imageValue instanceof File) {
      return URL.createObjectURL(imageValue); // Convert File to blob URL
    }
    return null;
  }
  
  // Handle string structure (direct URL path)
  if (typeof imageValue === 'string') {
    return imageValue;
  }
  
  return null;
};

const Navbar = ({ 
  config, 
  forceScrolledState = null, 
  isPreview = false,
  onTitleChange, // New prop for live editing
  onSubtitleChange, // New prop for live editing
  isEditingPreview, // Make sure this is destructured
  onIconSelect,
  // The following props are now driven by the `config.animation` and `config.styling` objects
  // naturalOffsetVh = 11,
  // slideUpDistanceVh = 0,
  // logoSizeUnscrolled = { width: '18vh', height: '18vh' },
  // logoSizeScrolled = { width: '14vh', height: '14vh' },
  // textSizes = { ... },
  // logoTextDistance = { ... },
  // navbarHeight = { ... },
  // invertLogoColor = false,
  // mainTitleTextSettings,
  // subTitleTextSettings,
}) => {
  // Early return if config is not available
  if (!config) {
    return (
      <nav className="w-full h-[16vh] flex items-center justify-center bg-gray-200">
        <div className="text-gray-500">Loading navbar...</div>
      </nav>
    );
  }
  const [isOpen, setIsOpen] = useState(false);
  const [internalHasScrolled, setInternalHasScrolled] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);

  // Consolidate all settings from the config prop
  const {
    title,
    subtitle,
    navLinks = [],
    images, // main logo array
    whiteImages, // white logo array
    whiteLogoIcon,
    hamburgerColor,
    useWhiteHamburger,
    scrolledBackgroundColor,
    unscrolledBackgroundColor,
    dropdownBackgroundColor,
    dropdownTextColor,
    mainTitleTextSettings,
    subTitleTextSettings,
    animation: animationSettings = {},
    styling: stylingSettings = {},
    textSizes = {}, // Add textSizes back
    logoTextDistance = {}, // Add logoTextDistance back
    navbarHeight = {}, // Add navbarHeight back
  } = config || {};
  
  // Destructure animation and styling properties with defaults
  const {
    naturalOffsetVh = 11,
    slideUpDistanceVh = 0,
    slideLeftDistance = 0,
  } = animationSettings;

  const {
    logoDesktopSize = { unscrolled: 18, scrolled: 14 }, // in vh
    logoMobileSize = { unscrolled: 18, scrolled: 14 }, // in vw
    invertLogoColor = false,
  } = stylingSettings;

  // Create proper logo size objects like the working version
  const logoSizeUnscrolled = { width: '18vh', height: '18vh' };
  const logoSizeScrolled = { width: '14vh', height: '14vh' };

  const hasScrolled = typeof forceScrolledState === 'boolean' ? forceScrolledState : internalHasScrolled;

  const topBarRef = useRef(null);
  const middleBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const timelineRef = useRef(null);

  const desktopTopBarRef = useRef(null);
  const desktopMiddleBarRef = useRef(null);
  const desktopBottomBarRef = useRef(null);
  const desktopTimelineRef = useRef(null);

  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subTitleRef = useRef(null);
  const navbarRef = useRef(null);
  const titleContainerRef = useRef(null);

  const navigate = useNavigate();

  // Dynamic Icon Renderer (copied from IconSelectorModal or a shared util if preferred)
  // For simplicity, defined here. Consider moving to a shared utils file if used elsewhere.
  const FaIcons = { Warehouse: FaWarehouse };
  const iconPacks = {
    lucide: { Home, Building2, HelpCircle },
    fa: FaIcons,
  };

  const generateResponsiveTextStyles = () => {
    let styles = '';
    const createStyleRule = (selector, desktopSettings, mobileSettings) => {
      let desktopCss = '';
      if (desktopSettings) {
        desktopCss = `
          ${selector} {
            font-family: ${desktopSettings.fontFamily || 'inherit'};
            font-size: ${desktopSettings.fontSize ? `${desktopSettings.fontSize}px` : 'inherit'};
            font-weight: ${desktopSettings.fontWeight || 'inherit'};
            line-height: ${desktopSettings.lineHeight || 'inherit'};
            letter-spacing: ${desktopSettings.letterSpacing ? `${desktopSettings.letterSpacing}px` : 'inherit'};
            color: ${desktopSettings.color || 'inherit'};
          }
        `;
      }
      
      let mobileCss = '';
      if (mobileSettings) {
        mobileCss = `
          @media (max-width: 767px) {
            ${selector} {
              font-family: ${mobileSettings.fontFamily || 'inherit'};
              font-size: ${mobileSettings.fontSize ? `${mobileSettings.fontSize}px` : 'inherit'};
              font-weight: ${mobileSettings.fontWeight || 'inherit'};
              line-height: ${mobileSettings.lineHeight || 'inherit'};
              letter-spacing: ${mobileSettings.letterSpacing ? `${mobileSettings.letterSpacing}px` : 'inherit'};
              color: ${mobileSettings.color || 'inherit'};
            }
          }
        `;
      }
      
      return desktopCss + mobileCss;
    };

    if (mainTitleTextSettings) {
      styles += createStyleRule(
        '.navbar-main-title',
        mainTitleTextSettings.desktop,
        mainTitleTextSettings.mobile
      );
    }
    
    if (subTitleTextSettings) {
      styles += createStyleRule(
        '.navbar-sub-title',
        subTitleTextSettings.desktop,
        subTitleTextSettings.mobile
      );
    }
    
    return styles;
  };

  const renderDynamicIcon = (packName, iconName, defaultIconComponent, props = { className: "w-full h-full" }) => {
    const pack = iconPacks[packName?.toLowerCase()];
    if (pack) {
      const IconComponent = pack[iconName];
      if (IconComponent && typeof IconComponent === 'function') {
        return <IconComponent {...props} />;
      }
    }
    const DefaultIcon = defaultIconComponent || iconPacks.lucide.HelpCircle;
    return <DefaultIcon {...props} />;
  };

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    tl.to(topBarRef.current, { y: 10, rotate: -45, duration: 0.3 })
      .to(middleBarRef.current, { opacity: 0, duration: 0.3 }, "<")
      .to(bottomBarRef.current, { y: -10, rotate: 45, duration: 0.3 }, "<");
    timelineRef.current = tl;

    const desktopTl = gsap.timeline({ paused: true });
    desktopTl
      .to(desktopTopBarRef.current, { y: 13, rotate: -45, duration: 0.3 })
      .to(desktopMiddleBarRef.current, { opacity: 0, duration: 0.3 }, "<")
      .to(
        desktopBottomBarRef.current,
        { y: -13, rotate: 45, duration: 0.3 },
        "<"
      );
    desktopTimelineRef.current = desktopTl;
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate("/");
  };

  const toggleMobileMenu = () => setIsOpen(!isOpen);
  const toggleDesktopMenu = () => setIsDesktopMenuOpen(!isDesktopMenuOpen);

  useEffect(() => {
    if (isOpen) timelineRef.current.play();
    else timelineRef.current.reverse();
  }, [isOpen]);

  useEffect(() => {
    if (isDesktopMenuOpen) desktopTimelineRef.current.play();
    else desktopTimelineRef.current.reverse();
  }, [isDesktopMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setInternalHasScrolled(window.scrollY > 1);
    };
    if (forceScrolledState === null) {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setInternalHasScrolled(forceScrolledState);
    }
  }, [forceScrolledState]);

  useEffect(() => {
    const tl = gsap.timeline();
    const titleElement = titleRef.current;
    const logoElement = logoRef.current;
    const subTitleElement = subTitleRef.current;
    const titleContainerElement = titleContainerRef.current;

    if (!titleElement || !logoElement || !subTitleElement || !titleContainerElement) {
        return;
    }

    gsap.killTweensOf([
      titleElement,
      logoElement,
      subTitleElement,
      titleContainerElement,
    ]);

    if (hasScrolled) {
      // Step 1: Both logo and text slide up by configurable distance while subtitle fades
      tl.to([titleElement, logoElement], { y: `-${slideUpDistanceVh}vh`, duration: 0.4, ease: "power2.out" })
        .to(subTitleElement, { opacity: 0, duration: 0.4, onComplete: () => { if (subTitleElement) subTitleElement.style.display = 'none'; } }, "<");
      
      // Step 2: After 0.2s, logo shrinks for 0.3s
      tl.to(logoElement, { scale: 0.6, duration: 0.3, ease: "power2.out" }, "+=0.2");
      
      // Step 3: Logo and main title slide left by 30vw
      tl.to([logoElement, titleElement], { x: "-30vw", duration: 0.5, ease: "power2.out" })
        .to(titleContainerElement, { alignItems: "center", duration: 0.2 }, "<");
      
    } else {
      // Reset to initial state
      if (subTitleElement) {
        subTitleElement.style.display = '';
        gsap.set(subTitleElement, { opacity: 0, y: "2vh" });
      }
      
      // Step 1: ONLY title slides to the right (logo stays in place)
      tl.to(titleElement, { x: "0", duration: 0.3, ease: "power2.out" });
      
      // Step 2: Logo fades to 0 opacity as main text grows back to original position
      tl.to(logoElement, { opacity: 0, x: "0", duration: 0.2, ease: "power2.out" }, "<")
        .to([titleElement, logoElement], { y: "0", duration: 0.4, ease: "power2.out" }, "<");
      
      // Step 3: Subtitle slides up to its position
      tl.to(subTitleElement, { opacity: 1, y: "0", duration: 0.3, ease: "power2.out" })
        .to(titleContainerElement, { alignItems: "flex-start", duration: 0.3, ease: "power2.out" }, "<");
      
      // Step 4: Larger logo fades into place
      tl.to(logoElement, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
    }
  }, [hasScrolled, slideUpDistanceVh, slideLeftDistance]);

  const navLinksFromConfig = navLinks || [];
  
  // Get logo URLs from the arrays
  const logoUrl = getDisplayUrl(images?.[0]);
  const whiteLogoUrl = getDisplayUrl(whiteImages?.[0]);

  const mainTitle = title || "";
  const mainSubtitle = subtitle || "";
  
  // Color and Style handling
  const scrolledBgSetting = scrolledBackgroundColor || "bg-banner";
  const unscrolledBgSetting = unscrolledBackgroundColor || "bg-transparent"; // Default to transparent for unscrolled live nav
  const dropdownBgSetting = dropdownBackgroundColor || (hasScrolled ? scrolledBgSetting : "bg-white");
  
  const applyStyling = (colorString) => {
    if (typeof colorString === 'string' && colorString.startsWith('#')) {
      return { style: { backgroundColor: colorString }, className: '' };
    }
    return { className: colorString, style: {} };
  };

  const navBaseClasses = "w-full flex items-center justify-center transition-all duration-300";
  let navDynamicClasses = hasScrolled ? 'scrolled' : 'unscrolled';
  let navStyle = {};

  // Build responsive navbar height classes
  const heightClasses = hasScrolled 
    ? `${navbarHeight?.scrolled?.base || 'h-[10vh]'} ${navbarHeight?.scrolled?.md || 'md:h-[10vh]'}`
    : `${navbarHeight?.unscrolled?.base || 'h-[16vh]'} ${navbarHeight?.unscrolled?.md || 'md:h-[20vh]'}`;

  if (isPreview) {
    navDynamicClasses += ` relative ${heightClasses}`;
    const bgProps = applyStyling(hasScrolled ? scrolledBgSetting : unscrolledBgSetting);
    navDynamicClasses += ` ${bgProps.className}`;
    navStyle = {...navStyle, ...bgProps.style};
  } else {
    // Live Navbar: restore original behavior carefully
    navDynamicClasses = `fixed top-0 z-[9999] ${heightClasses}`;
    // Apply default Tailwind classes for live view if not overridden by specific hex codes
    const liveBgSetting = hasScrolled ? scrolledBgSetting : unscrolledBgSetting;
    const bgProps = applyStyling(liveBgSetting);
    navDynamicClasses += ` ${bgProps.className}`; // e.g., bg-banner or bg-transparent
    navStyle = {...navStyle, ...bgProps.style};
  }
  
  const dropdownStyling = applyStyling(dropdownBgSetting);
  const dropdownTextStyle = { color: dropdownTextColor || (isColorDark(dropdownStyling.style.backgroundColor) ? '#FFFFFF' : '#000000') };

  // Determine if conditions are met to show a white version of the logo (icon or image)
  const showWhiteVersion = (!hasScrolled && 
      (unscrolledBackgroundColor === 'bg-transparent' || 
       (typeof unscrolledBackgroundColor === 'string' && unscrolledBackgroundColor.startsWith('#') && isColorDark(unscrolledBackgroundColor)) ||
       unscrolledBackgroundColor === 'bg-black' ||
       unscrolledBackgroundColor === 'bg-gray-800' ||
       unscrolledBackgroundColor === 'bg-gray-900'
      )) || invertLogoColor;

  // Build responsive logo margin classes
  const logoMarginClasses = hasScrolled
    ? `${logoTextDistance?.scrolled?.base || 'mr-0'} md:${logoTextDistance?.scrolled?.md || 'md:mr-0'}`
    : `${logoTextDistance?.unscrolled?.base || 'mr-0'} md:${logoTextDistance?.unscrolled?.md || 'md:mr-0'}`;

  // Build responsive text size classes
  const titleSizeClasses = hasScrolled
    ? `${textSizes?.scrolled?.base || ''} md:${textSizes?.scrolled?.md || ''}`
    : `${textSizes?.unscrolled?.base || ''} md:${textSizes?.unscrolled?.md || ''} ${textSizes?.unscrolled?.lg ? `lg:${textSizes.unscrolled.lg}` : ''}`;


  let logoToDisplay;
  // Prioritize whiteLogoIcon if it's set and conditions are met
  if (whiteLogoIcon?.pack && whiteLogoIcon?.name && showWhiteVersion) {
      logoToDisplay = 'icon';
  // Fallback to whiteLogo image if it's set (has a URL) and conditions are met
  } else if (whiteLogoUrl && showWhiteVersion) {
      logoToDisplay = 'whiteImage';
  // Otherwise, use the default logo
  } else {
      logoToDisplay = 'defaultImage';
  }

  const [currentSelection, setCurrentSelection] = useState(null);

  const handleOpen = (selection) => {
    setCurrentSelection(selection);
    setIsOpen(true);
  };

  const handleSelect = (pack, iconName) => {
    if (onIconSelect) {
      onIconSelect(currentSelection, pack, iconName);
    }
  };

  const onClose = () => {
    setIsOpen(false);
    setCurrentSelection(null);
  };

  return (
    <>
      <style>{generateResponsiveTextStyles()}</style>
      <nav
        ref={navbarRef}
        className={`${navBaseClasses} ${navDynamicClasses}`}
        style={navStyle}
      >
        <div className="w-full max-w-6xl flex items-center justify-center">
          {/* Conditional rendering for whiteLogoIcon or whiteLogo image */}
          {logoToDisplay === 'icon' ? (
             <div 
               ref={logoRef}
               className={`cursor-pointer transform-gpu ${logoMarginClasses}`}
               onClick={handleLogoClick}
               style={{ 
                 marginTop: (hasScrolled || isPreview) ? "0" : `${naturalOffsetVh}vh`,
                 width: hasScrolled ? `${logoDesktopSize.scrolled}vh` : `${logoDesktopSize.unscrolled}vh`,
                 height: hasScrolled ? `${logoDesktopSize.scrolled}vh` : `${logoDesktopSize.unscrolled}vh`,
               }}
             >
              {renderDynamicIcon(whiteLogoIcon.pack, whiteLogoIcon.name, null, { className: "w-full h-full text-white" })}
            </div>
          ) : logoToDisplay === 'whiteImage' ? (
            <img
              ref={logoRef}
              src={whiteLogoUrl}
              alt="Logo White"
              className={`cursor-pointer logo-fixed-size transform-gpu ${logoMarginClasses}`}
              onClick={handleLogoClick}
              style={{ 
                marginTop: (hasScrolled || isPreview) ? "0" : `${naturalOffsetVh}vh`,
                width: hasScrolled ? `${logoDesktopSize.scrolled}vh` : `${logoDesktopSize.unscrolled}vh`,
                height: hasScrolled ? `${logoDesktopSize.scrolled}vh` : `${logoDesktopSize.unscrolled}vh`,
              }}
            />
          ) : ( // 'defaultImage'
            <img
              ref={logoRef}
              src={logoUrl} 
              alt="Logo"
              className={`cursor-pointer logo-fixed-size transform-gpu ${logoMarginClasses}`}
              onClick={handleLogoClick}
              style={{ 
                marginTop: (hasScrolled || isPreview) ? "0" : `${naturalOffsetVh}vh`,
                width: hasScrolled ? `${logoDesktopSize.scrolled}vh` : `${logoDesktopSize.unscrolled}vh`,
                height: hasScrolled ? `${logoDesktopSize.scrolled}vh` : `${logoDesktopSize.unscrolled}vh`,
              }}
            />
          )}
          <div
            ref={titleContainerRef}
            className="flex flex-col h-[10vh] transition-all duration-300"
            style={{
              alignItems: hasScrolled ? "center" : "flex-start",
              justifyContent: "center",
              marginTop: (hasScrolled || isPreview) ? "0" : `${naturalOffsetVh}vh`,
            }}
          >
            {isPreview && isEditingPreview && onTitleChange ? (
              <input
                type="text"
                ref={titleRef}
                value={mainTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className={`navbar-main-title whitespace-nowrap text-white text-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:6px_black ] font-rye font-ultra-condensed origin-left bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-300 p-1 rounded-sm z-10 relative ${titleSizeClasses}`}
                onClick={(e) => e.stopPropagation()} 
              />
            ) : (
              <h1
                ref={titleRef}
                className={`navbar-main-title whitespace-nowrap text-white text-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:6px_black ] font-rye font-ultra-condensed origin-left ${titleSizeClasses}`}
              >
                {mainTitle}
              </h1>
            )}
            {isPreview && isEditingPreview && onSubtitleChange ? (
              <input
                type="text"
                ref={subTitleRef}
                value={mainSubtitle}
                onChange={(e) => onSubtitleChange(e.target.value)}
                className={`navbar-sub-title text-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:1px_black ] text-gray-500 font-serif bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-300 p-1 rounded-sm z-10 relative text-[2vw] md:text-[6vh]`}
                onClick={(e) => e.stopPropagation()} 
                style={{ opacity: hasScrolled ? 0 : 1, marginTop: "-2vh" }}
              />
            ) : (
              <span
                ref={subTitleRef}
                className={`navbar-sub-title -mt-[1vh] text-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:1px_black ] text-gray-500 font-serif text-[3.8vw] md:text-3xl`}
                style={{ opacity: hasScrolled ? 0 : 1 }}
              >
                {mainSubtitle}
              </span>
            )}
          </div>
        </div>

        {/* Desktop Hamburger Menu */}
        <div className={`hidden md:block absolute right-10 top-1/2 transform -translate-y-1/2 ${isPreview ? 'z-10' : ''}`}>
          <button
            onClick={!isPreview ? toggleDesktopMenu : (e) => e.preventDefault()}
            className="focus:outline-none relative z-30"
            aria-label="Toggle Desktop Menu"
            disabled={isPreview}
          >
            <div className="relative w-8 h-8">
              <span ref={desktopTopBarRef} className={`absolute top-0 left-0 w-full h-1 transition-colors duration-300`} style={{ backgroundColor: hasScrolled ? hamburgerColor?.scrolled : hamburgerColor?.unscrolled }} />
              <span ref={desktopMiddleBarRef} className={`absolute top-3 left-0 w-full h-1 transition-colors duration-300`} style={{ backgroundColor: hasScrolled ? hamburgerColor?.scrolled : hamburgerColor?.unscrolled }} />
              <span ref={desktopBottomBarRef} className={`absolute top-6 left-0 w-full h-1 transition-colors duration-300`} style={{ backgroundColor: hasScrolled ? hamburgerColor?.scrolled : hamburgerColor?.unscrolled }} />
            </div>
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className={`md:hidden absolute right-0 top-8 transform -translate-y-1/2 ${isPreview ? 'z-10' : ''}`}>
          <button
            onClick={!isPreview ? toggleMobileMenu : (e) => e.preventDefault()}
            className="focus:outline-none"
            aria-label="Toggle Mobile Menu"
            disabled={isPreview}
          >
            <div className="relative w-8 h-8">
              <span ref={topBarRef} className={`absolute top-0 left-0 w-2/3 h-0.5 transition-colors duration-300`} style={{ backgroundColor: hasScrolled ? hamburgerColor?.scrolled : hamburgerColor?.unscrolled }} />
              <span ref={middleBarRef} className={`absolute top-2 left-0 w-2/3 h-0.5 transition-colors duration-300`} style={{ backgroundColor: hasScrolled ? hamburgerColor?.scrolled : hamburgerColor?.unscrolled }} />
              <span ref={bottomBarRef} className={`absolute top-4 left-0 w-2/3 h-0.5 transition-colors duration-300`} style={{ backgroundColor: hasScrolled ? hamburgerColor?.scrolled : hamburgerColor?.unscrolled }} />
            </div>
          </button>
        </div>
      </nav>

      {!isPreview && (
        <div className={`w-full ${heightClasses} transition-all duration-300`}></div>
      )}

      {isOpen && !isPreview && (
        <div
          className={`md:hidden flex flex-col items-center justify-center w-full fixed top-[${navbarHeight?.scrolled?.base || '10vh'}] left-0 z-[9998] shadow-lg transition-colors duration-300 ${dropdownStyling.className}`}
          style={dropdownStyling.style}
        >
          {navLinksFromConfig.map((nav) => (
            <HashLink key={nav.name} smooth to={nav.href} onClick={() => setIsOpen(false)} style={dropdownTextStyle} className={`px-5 py-2 text-xs hover:text-gray-300 transition-all`}>
              {nav.name}
            </HashLink>
          ))}
        </div>
      )}

      {isDesktopMenuOpen && !isPreview && (
        <div
        
          style={dropdownStyling.style}
        >
          {navLinksFromConfig.map((nav) => (
            <HashLink key={nav.name} smooth to={nav.href} onClick={() => setIsDesktopMenuOpen(false)} style={dropdownTextStyle} className={`px-5 py-3 text-sm hover:text-gray-300 w-full text-right`}>
              {nav.name}
            </HashLink>
          ))}
        </div>
      )}

      <IconSelectorModal
        isOpen={isOpen}
        onClose={onClose}
        onIconSelect={handleSelect}
        currentIconPack={currentSelection?.pack}
        currentIconName={currentSelection?.name}
      />
    </>
  );
};

// Helper function to determine if a color is dark (for text contrast)
const isColorDark = (hexColor) => {
  if (!hexColor || typeof hexColor !== 'string' || hexColor.length < 4) return true; // Default to dark for safety
  let color = hexColor.charAt(0) === '#' ? hexColor.substring(1, 7) : hexColor;
  if (color.length === 3) {
    color = color.split('').map(char => char + char).join('');
  }
  if (color.length !== 6) return true;

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return true;

  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );
  return hsp < 127.5;
};

Navbar.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    navLinks: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, href: PropTypes.string })),
    images: PropTypes.arrayOf(PropTypes.object),
    whiteImages: PropTypes.arrayOf(PropTypes.object),
    whiteLogoIcon: PropTypes.shape({
      pack: PropTypes.string,
      name: PropTypes.string,
    }),
    hamburgerColor: PropTypes.shape({
      unscrolled: PropTypes.string,
      scrolled: PropTypes.string,
    }),
    useWhiteHamburger: PropTypes.bool,
    scrolledBackgroundColor: PropTypes.string,
    unscrolledBackgroundColor: PropTypes.string,
    dropdownBackgroundColor: PropTypes.string,
    dropdownTextColor: PropTypes.string,
    mainTitleTextSettings: PropTypes.object,
    subTitleTextSettings: PropTypes.object,
    animation: PropTypes.object,
    styling: PropTypes.object,
    textSizes: PropTypes.object,
    logoTextDistance: PropTypes.object,
    navbarHeight: PropTypes.object,
  }),
  onTitleChange: PropTypes.func,
  onSubtitleChange: PropTypes.func,
  forceScrolledState: PropTypes.bool,
  isPreview: PropTypes.bool,
  onTitleChange: PropTypes.func,
  onSubtitleChange: PropTypes.func,
  isEditingPreview: PropTypes.bool,
  onIconSelect: PropTypes.func,
};

// Expose tabsConfig for BottomStickyEditPanel
Navbar.tabsConfig = (blockCurrentData, onControlsChange, themeColors) => ({
  general: (props) => (
    <NavbarGeneralControls
      {...props}
      currentData={blockCurrentData}
      onControlsChange={onControlsChange}
    />
  ),
  images: (props) => (
    <NavbarImagesControls
      {...props}
      currentData={blockCurrentData}
      onControlsChange={onControlsChange}
    />
  ),
  colors: (props) => (
    <NavbarColorControls
      {...props}
      currentData={blockCurrentData}
      onControlsChange={onControlsChange}
      themeColors={themeColors}
    />
  ),
  fonts: (props) => (
    <NavbarFontsControls
      {...props}
      currentData={blockCurrentData}
      onControlsChange={onControlsChange}
      themeColors={themeColors}
    />
  ),
});

/* ==============================================
   NAVBAR CONTROL COMPONENTS
   ----------------------------------------------
   Following the standard pattern from HeroBlock
=============================================== */

// Navbar General Controls - Navigation Links and Basic Text
const NavbarGeneralControls = ({ currentData, onControlsChange }) => {
  const handleNavLinkChange = (index, field, value) => {
    const updatedNavLinks = [...(currentData.navLinks || [])];
    updatedNavLinks[index] = { ...updatedNavLinks[index], [field]: value };
    onControlsChange({ navLinks: updatedNavLinks });
  };

  const addNavLink = () => {
    const navLinks = currentData.navLinks || [];
    onControlsChange({
      navLinks: [...navLinks, { name: "New Link", href: "/" }],
    });
  };

  const removeNavLink = (index) => {
    const updatedNavLinks = (currentData.navLinks || []).filter(
      (_, i) => i !== index
    );
    onControlsChange({ navLinks: updatedNavLinks });
  };

  const handleTextChange = (field, value) => {
    onControlsChange({ [field]: value });
  };

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">General Settings</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title:
          </label>
          <input
            type="text"
            value={currentData.title || ""}
            onChange={(e) => handleTextChange("title", e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle:
          </label>
          <input
            type="text"
            value={currentData.subtitle || ""}
            onChange={(e) => handleTextChange("subtitle", e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter subtitle"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Navigation Links:
            </label>
            <button
              onClick={addNavLink}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Link
            </button>
          </div>
          <div className="space-y-2">
            {(currentData.navLinks || []).map((link, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={link.name || ""}
                  onChange={(e) =>
                    handleNavLinkChange(index, "name", e.target.value)
                  }
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Link name"
                />
                <input
                  type="text"
                  value={link.href || ""}
                  onChange={(e) =>
                    handleNavLinkChange(index, "href", e.target.value)
                  }
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Link URL"
                />
                <button
                  onClick={() => removeNavLink(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Navbar Images Controls - Logo and White Logo
const NavbarImagesControls = ({ currentData, onControlsChange }) => {
  return (
    <div className="p-3 grid grid-cols-1 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Main Logo:
        </label>
        <PanelImagesController
          currentData={currentData}
          onControlsChange={onControlsChange}
          imageArrayFieldName="images"
          maxImages={1}
          imageLabels={["Main Logo"]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          White Logo (for dark backgrounds):
        </label>
        <PanelImagesController
          currentData={currentData}
          onControlsChange={onControlsChange}
          imageArrayFieldName="whiteImages"
          maxImages={1}
          imageLabels={["White Logo"]}
        />
      </div>
    </div>
  );
};

// Navbar Color Controls
const NavbarColorControls = ({ currentData, onControlsChange, themeColors }) => {
  const handleColorChange = (fieldName, value) => {
    onControlsChange({ [fieldName]: value });
  };

  const handleHamburgerColorChange = (state, value) => {
    const hamburgerColor = currentData.hamburgerColor || {};
    onControlsChange({ 
      hamburgerColor: { 
        ...hamburgerColor, 
        [state]: value 
      } 
    });
  };

  return (
    <div className="p-3 space-y-6 bg-gray-800 text-white rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-center border-b border-gray-600 pb-2 text-gray-100">Navbar Colors</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThemeColorPicker
          label="Scrolled Background:"
          currentColorValue={currentData.scrolledBackgroundColor || "#1e293b"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorChange("scrolledBackgroundColor", value)}
          fieldName="scrolledBackgroundColor"
        />
        <ThemeColorPicker
          label="Unscrolled Background:"
          currentColorValue={currentData.unscrolledBackgroundColor || "bg-transparent"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorChange("unscrolledBackgroundColor", value)}
          fieldName="unscrolledBackgroundColor"
        />
        <ThemeColorPicker
          label="Dropdown Background:"
          currentColorValue={currentData.dropdownBackgroundColor || "#FFFFFF"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorChange("dropdownBackgroundColor", value)}
          fieldName="dropdownBackgroundColor"
        />
        <ThemeColorPicker
          label="Dropdown Text:"
          currentColorValue={currentData.dropdownTextColor || "#000000"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorChange("dropdownTextColor", value)}
          fieldName="dropdownTextColor"
        />
        <ThemeColorPicker
          label="Hamburger (Unscrolled):"
          currentColorValue={currentData.hamburgerColor?.unscrolled || "#000000"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleHamburgerColorChange("unscrolled", value)}
          fieldName="hamburgerColor.unscrolled"
        />
        <ThemeColorPicker
          label="Hamburger (Scrolled):"
          currentColorValue={currentData.hamburgerColor?.scrolled || "#FFFFFF"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleHamburgerColorChange("scrolled", value)}
          fieldName="hamburgerColor.scrolled"
        />
      </div>
    </div>
  );
};

// Navbar Font Controls
const NavbarFontsControls = ({ currentData, onControlsChange, themeColors }) => {
  const [viewport, setViewport] = useState('desktop');
  const [scrollState, setScrollState] = useState('unscrolled');
  
  const handleSettingsChange = (settingsType, newSettings) => {
    onControlsChange({ 
      [settingsType]: {
        ...currentData[settingsType],
        [scrollState]: {
          ...currentData[settingsType]?.[scrollState],
          [viewport]: {
            ...currentData[settingsType]?.[scrollState]?.[viewport],
            ...newSettings[viewport]
          }
        }
      }
    });
  };

  return (
    <div className="space-y-6 p-4 bg-gray-800 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-white">Font Settings</h3>
        <p className="mt-1 text-sm text-gray-400">
          Select viewport and scroll state to edit font styles.
        </p>
        {/* Viewport Toggle */}
        <div className="mt-4 flex justify-center bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setViewport('desktop')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${viewport === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'} transition-all duration-200`}
          >
            Desktop
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${viewport === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'} transition-all duration-200`}
          >
            Mobile
          </button>
        </div>
        {/* Scroll State Toggle */}
        <div className="mt-2 flex justify-center bg-gray-900 rounded-lg p-1">
          <button
            onClick={() => setScrollState('unscrolled')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${scrollState === 'unscrolled' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'} transition-all duration-200`}
          >
            Unscrolled
          </button>
          <button
            onClick={() => setScrollState('scrolled')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${scrollState === 'scrolled' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'} transition-all duration-200`}
          >
            Scrolled
          </button>
        </div>
      </div>

      <PanelFontController
          label="Main Title Font"
          currentData={currentData.mainTitleTextSettings?.[scrollState]}
          onControlsChange={(newSettings) => handleSettingsChange('mainTitleTextSettings', newSettings)}
          themeColors={themeColors}
          fieldPrefix={viewport}
      />
      <PanelFontController
          label="Subtitle Font"
          currentData={currentData.subTitleTextSettings?.[scrollState]}
          onControlsChange={(newSettings) => handleSettingsChange('subTitleTextSettings', newSettings)}
          themeColors={themeColors}
          fieldPrefix={viewport}
      />
    </div>
  );
};

export default Navbar;
