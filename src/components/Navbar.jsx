import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";
import PropTypes from "prop-types";
import { Home, Building2, HelpCircle } from "lucide-react";
import { FaWarehouse } from 'react-icons/fa';

/**
 * Navbar Component with Configurable Animations
 * 
 * Animation Configuration Props:
 * - naturalOffsetVh: Controls how low the logo and text sit naturally (default: 7vh)
 * - slideUpDistanceVh: Controls how much the logo and text slide up during scroll animation (default: 7vh)
 * - logoSizeUnscrolled: Logo size when page is unscrolled (default: { width: '10vh', height: '10vh' })
 * - logoSizeScrolled: Logo size when page is scrolled (default: { width: '6vh', height: '6vh' })
 * 
 * Example usage:
 * <Navbar 
 *   naturalOffsetVh={10}        // Components sit 10vh lower
 *   slideUpDistanceVh={5}       // Components slide up 5vh on scroll
 *   logoSizeUnscrolled={{ width: '12vh', height: '12vh' }}  // Larger unscrolled logo
 *   logoSizeScrolled={{ width: '4vh', height: '4vh' }}      // Smaller scrolled logo
 * />
 */

const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (!imageValue) return defaultPath;
  if (typeof imageValue === 'string') return imageValue;
  if (imageValue.url) return imageValue.url;
  return defaultPath;
};

const Navbar = ({ 
  config, 
  forceScrolledState = null, 
  isPreview = false,
  onTitleChange, // New prop for live editing
  onSubtitleChange, // New prop for live editing
  isEditingPreview, // Make sure this is destructured
  // Animation and sizing configuration props
  naturalOffsetVh = 11, // How low components sit naturally (in vh)
  slideUpDistanceVh = 0, // How much components slide up during animation (in vh)
  logoSizeUnscrolled = { width: '18vh', height: '18vh' }, // Logo size when unscrolled
  logoSizeScrolled = { width: '14vh', height: '14vh' }, // Logo size when scrolled
  // New configurable variables
  textSizes = {
    unscrolled: { base: 'text-[7vw]', md: 'text-[8vh]', lg: 'text-[5vh]' },
    scrolled: { base: 'text-[3vw]', md: 'text-[5vh]' }
  },
  logoTextDistance = {
    unscrolled: { base: 'mr-0', md: 'mr-0' },
    scrolled: { base: 'mr-0', md: 'mr-0' }
  },
  navbarHeight = {
    unscrolled: { base: 'h-[16vh]', md: 'h-[20vh]' },
    scrolled: { base: 'h-[10vh]', md: 'h-[10vh]' }
  },
  invertLogoColor = false, // Whether to invert logo colors
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalHasScrolled, setInternalHasScrolled] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);

  const hasScrolled = forceScrolledState !== null ? forceScrolledState : internalHasScrolled;

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
    // Ensure refs are current and elements exist before animating
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
      // Reset subtitle display and set initial states
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
  }, [hasScrolled, slideUpDistanceVh]);

  const navLinksFromConfig = config?.navLinks || [
    { name: "About", href: "/about" },
    { name: "Booking", href: "/#book" },
    { name: "Packages", href: "/#packages" },
  ];
  
  const logoUrl = getDisplayUrl(config?.logo, "/assets/images/hero/clipped.png");
  const mainTitle = config?.title || "COWBOYS-VAQUEROS";
  const mainSubtitle = config?.subtitle || "CONSTRUCTION";
  
  // Color and Style handling
  const scrolledBgSetting = config?.scrolledBackgroundColor || "bg-banner";
  const unscrolledBgSetting = config?.unscrolledBackgroundColor || "bg-transparent"; // Default to transparent for unscrolled live nav
  const dropdownBgSetting = config?.dropdownBackgroundColor || (hasScrolled ? scrolledBgSetting : "bg-white");
  const dropdownTextSetting = config?.dropdownTextColor || (hasScrolled && (scrolledBgSetting.includes("banner") || scrolledBgSetting.includes("dark")) ? "text-white" : "text-black");

  const applyStyling = (colorString) => {
    if (typeof colorString === 'string' && colorString.startsWith('#')) {
      return { style: { backgroundColor: colorString }, className: '' };
    }
    return { className: colorString, style: {} };
  };

  const navBaseClasses = "w-full flex items-center justify-center transition-all duration-300";
  let navDynamicClasses = "";
  let navStyle = {};

  // Build responsive navbar height classes
  const heightClasses = hasScrolled 
    ? `${navbarHeight.scrolled.base} ${navbarHeight.scrolled.md}`
    : `${navbarHeight.unscrolled.base} ${navbarHeight.unscrolled.md}`;

  if (isPreview) {
    navDynamicClasses = `relative ${heightClasses}`;
    const bgProps = applyStyling(hasScrolled ? scrolledBgSetting : unscrolledBgSetting);
    navDynamicClasses += ` ${bgProps.className}`;
    navStyle = bgProps.style;
  } else {
    // Live Navbar: restore original behavior carefully
    navDynamicClasses = `fixed top-0 z-[9999] ${heightClasses}`;
    // Apply default Tailwind classes for live view if not overridden by specific hex codes
    const liveBgSetting = hasScrolled ? scrolledBgSetting : unscrolledBgSetting;
    const bgProps = applyStyling(liveBgSetting);
    navDynamicClasses += ` ${bgProps.className}`; // e.g., bg-banner or bg-transparent
    navStyle = bgProps.style;
  }
  
  const dropdownStyling = applyStyling(dropdownBgSetting);

  // Determine if conditions are met to show a white version of the logo (icon or image)
  const showWhiteVersion = (!hasScrolled && 
      (config?.unscrolledBackgroundColor === 'bg-transparent' || 
       (typeof config?.unscrolledBackgroundColor === 'string' && config.unscrolledBackgroundColor.startsWith('#') && parseInt(config.unscrolledBackgroundColor.substring(1, 3), 16) < 128) ||
       config?.unscrolledBackgroundColor === 'bg-black' ||
       config?.unscrolledBackgroundColor === 'bg-gray-800' ||
       config?.unscrolledBackgroundColor === 'bg-gray-900'
      )) || invertLogoColor;

  // Build responsive logo margin classes
  const logoMarginClasses = hasScrolled
    ? `${logoTextDistance.scrolled.base} md:${logoTextDistance.scrolled.md}`
    : `${logoTextDistance.unscrolled.base} md:${logoTextDistance.unscrolled.md}`;

  // Build responsive text size classes
  const titleSizeClasses = hasScrolled
    ? `${textSizes.scrolled.base} md:${textSizes.scrolled.md}`
    : `${textSizes.unscrolled.base} md:${textSizes.unscrolled.md} ${textSizes.unscrolled.lg ? `lg:${textSizes.unscrolled.lg}` : ''}`;

  let logoToDisplay;
  // Prioritize whiteLogoIcon if it's set and conditions are met
  if (config?.whiteLogoIcon?.pack && config?.whiteLogoIcon?.name && showWhiteVersion) {
      logoToDisplay = 'icon';
  // Fallback to whiteLogo image if it's set (has a URL) and conditions are met
  } else if (config?.whiteLogo?.url && showWhiteVersion) {
      logoToDisplay = 'whiteImage';
  // Otherwise, use the default logo
  } else {
      logoToDisplay = 'defaultImage';
  }

  return (
    <>
      <nav
        ref={navbarRef}
        className={`${navBaseClasses} ${navDynamicClasses}`}
        style={navStyle}
      >
        <div className="w-full max-w-6xl flex items-center justify-center">
          {/* Conditional rendering for whiteLogoIcon or whiteLogo image */}
          {logoToDisplay === 'icon' ? (
             <div 
               className={`cursor-pointer transform-gpu ${logoMarginClasses}`}
               onClick={handleLogoClick}
               style={{ 
                 marginTop: (hasScrolled || isPreview) ? "0" : `${naturalOffsetVh}vh`,
                 width: hasScrolled ? logoSizeScrolled.width : logoSizeUnscrolled.width,
                 height: hasScrolled ? logoSizeScrolled.height : logoSizeUnscrolled.height,
               }}
             >
              {renderDynamicIcon(config.whiteLogoIcon.pack, config.whiteLogoIcon.name, null, { className: "w-full h-full text-white" })}
            </div>
          ) : logoToDisplay === 'whiteImage' ? (
            <img
              src={getDisplayUrl(config.whiteLogo)} // Use the white logo URL
              alt="Logo White"
              className={`cursor-pointer logo-fixed-size transform-gpu ${logoMarginClasses}`}
              onClick={handleLogoClick}
              style={{ 
                marginTop: (hasScrolled || isPreview) ? "0" : `${naturalOffsetVh}vh`,
                width: hasScrolled ? logoSizeScrolled.width : logoSizeUnscrolled.width,
                height: hasScrolled ? logoSizeScrolled.height : logoSizeUnscrolled.height,
              }}
            />
          ) : ( // 'defaultImage'
            <img
              ref={logoRef} // Default logo ref - only attach ref to the element that might be animated by GSAP
              src={getDisplayUrl(config?.logo, "/assets/images/hero/clipped.png")} 
              alt="Logo"
              className={`cursor-pointer logo-fixed-size transform-gpu ${logoMarginClasses}`}
              onClick={handleLogoClick}
              style={{ 
                marginTop: (hasScrolled || isPreview) ? "0" : `${naturalOffsetVh}vh`,
                width: hasScrolled ? logoSizeScrolled.width : logoSizeUnscrolled.width,
                height: hasScrolled ? logoSizeScrolled.height : logoSizeUnscrolled.height,
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
                className={`whitespace-nowrap text-white text-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:6px_black ] font-rye font-ultra-condensed origin-left bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-300 p-1 rounded-sm z-10 relative ${titleSizeClasses}`}
                onClick={(e) => e.stopPropagation()} 
              />
            ) : (
              <h1
                ref={titleRef}
                className={`whitespace-nowrap text-white text-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:6px_black ] font-rye font-ultra-condensed origin-left ${titleSizeClasses}`}
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
                className={`text-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:1px_black ] text-gray-500 font-serif bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-300 p-1 rounded-sm z-10 relative text-[2vw] md:text-[6vh]`}
                onClick={(e) => e.stopPropagation()} 
                style={{ opacity: hasScrolled ? 0 : 1, marginTop: "-2vh" }}
              />
            ) : (
              <span
                ref={subTitleRef}
                className={`-mt-[1vh] text-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:1px_black ] text-gray-500 font-serif text-[3.8vw] md:text-3xl`}
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
              <span ref={desktopTopBarRef} className={`absolute top-0 left-0 w-full h-1 ${hasScrolled || config?.useWhiteHamburger ? "bg-white" : "bg-black"} transition-colors duration-300`} />
              <span ref={desktopMiddleBarRef} className={`absolute top-3 left-0 w-full h-1 ${hasScrolled || config?.useWhiteHamburger ? "bg-white" : "bg-black"} transition-colors duration-300`} />
              <span ref={desktopBottomBarRef} className={`absolute top-6 left-0 w-full h-1 ${hasScrolled || config?.useWhiteHamburger ? "bg-white" : "bg-black"} transition-colors duration-300`} />
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
              <span ref={topBarRef} className={`absolute top-0 left-0 w-2/3 h-0.5 ${hasScrolled || config?.useWhiteHamburger ? "bg-white" : "bg-black"} transition-colors duration-300`} />
              <span ref={middleBarRef} className={`absolute top-2 left-0 w-2/3 h-0.5 ${hasScrolled || config?.useWhiteHamburger ? "bg-white" : "bg-black"} transition-colors duration-300`} />
              <span ref={bottomBarRef} className={`absolute top-4 left-0 w-2/3 h-0.5 ${hasScrolled || config?.useWhiteHamburger ? "bg-white" : "bg-black"} transition-colors duration-300`} />
            </div>
          </button>
        </div>
      </nav>

      {!isPreview && (
        <div className={`w-full ${heightClasses} transition-all duration-300`}></div>
      )}

      {isOpen && !isPreview && (
        <div
          className={`md:hidden flex flex-col items-center justify-center w-full fixed top-[10vh] left-0 z-[9998] shadow-lg transition-colors duration-300 ${dropdownStyling.className} ${dropdownTextSetting}`}
          style={dropdownStyling.style}
        >
          {navLinksFromConfig.map((nav) => (
            <HashLink key={nav.name} smooth to={nav.href} onClick={() => setIsOpen(false)} className={`px-5 py-2 text-xs hover:text-gray-300 transition-all ${dropdownTextSetting}`}>
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
            <HashLink key={nav.name} smooth to={nav.href} onClick={() => setIsDesktopMenuOpen(false)} className={`px-5 py-3 text-sm hover:text-gray-300 w-full text-right ${dropdownTextSetting}`}>
              {nav.name}
            </HashLink>
          ))}
        </div>
      )}
    </>
  );
};

Navbar.propTypes = {
  config: PropTypes.shape({
    title: PropTypes.string, // New prop type
    subtitle: PropTypes.string, // New prop type
    navLinks: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, href: PropTypes.string })),
    logo: PropTypes.oneOfType([ // Updated prop type for logo
      PropTypes.string,
      PropTypes.shape({
        url: PropTypes.string,
        file: PropTypes.object, // File object
        name: PropTypes.string
      })
    ]),
    whiteLogo: PropTypes.oneOfType([ // Updated prop type for whiteLogo
      PropTypes.string,
      PropTypes.shape({
        url: PropTypes.string,
        file: PropTypes.object,
        name: PropTypes.string
      })
    ]),
    whiteLogoIcon: PropTypes.shape({ // New prop type for white logo icon
      pack: PropTypes.string,
      name: PropTypes.string,
    }),
    useWhiteHamburger: PropTypes.bool,
    scrolledBackgroundColor: PropTypes.string,
    unscrolledBackgroundColor: PropTypes.string,
    dropdownBackgroundColor: PropTypes.string,
    dropdownTextColor: PropTypes.string,
  }),
  forceScrolledState: PropTypes.bool,
  isPreview: PropTypes.bool,
  onTitleChange: PropTypes.func, // New prop type
  onSubtitleChange: PropTypes.func, // New prop type
  isEditingPreview: PropTypes.bool, // New prop type
  naturalOffsetVh: PropTypes.number,
  slideUpDistanceVh: PropTypes.number,
  logoSizeUnscrolled: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string,
  }),
  logoSizeScrolled: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string,
  }),
  textSizes: PropTypes.shape({
    unscrolled: PropTypes.shape({
      base: PropTypes.string,
      md: PropTypes.string,
      lg: PropTypes.string,
    }),
    scrolled: PropTypes.shape({
      base: PropTypes.string,
      md: PropTypes.string,
    }),
  }),
  logoTextDistance: PropTypes.shape({
    unscrolled: PropTypes.shape({
      base: PropTypes.string,
      md: PropTypes.string,
    }),
    scrolled: PropTypes.shape({
      base: PropTypes.string,
      md: PropTypes.string,
    }),
  }),
  navbarHeight: PropTypes.shape({
    unscrolled: PropTypes.shape({
      base: PropTypes.string,
      md: PropTypes.string,
    }),
    scrolled: PropTypes.shape({
      base: PropTypes.string,
      md: PropTypes.string,
    }),
  }),
  invertLogoColor: PropTypes.bool,
};

export default Navbar;
