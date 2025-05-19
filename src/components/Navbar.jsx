import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";
import PropTypes from "prop-types";

const Navbar = ({ config, forceScrolledState = null, isPreview = false }) => {
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
    gsap.killTweensOf([
      titleRef.current,
      logoRef.current,
      subTitleRef.current,
      titleContainerRef.current,
    ]);

    if (hasScrolled) {
      tl.to(subTitleRef.current, { opacity: 0, duration: 0.3, onComplete: () => { if (subTitleRef.current) subTitleRef.current.style.display = 'none'; } });
      tl.to(titleRef.current, { fontSize: "4vh", duration: 0.2, ease: "power1.out" }, "<");
      tl.to(titleContainerRef.current, { alignItems: "center", duration: 0.2 }, "<");
      tl.to(logoRef.current, { scale: 1, duration: 0.4, ease: "power1.out" }, "<");
      const slideAndShrinkStartTime = 0.3 + 0.7;
      tl.to([logoRef.current, titleRef.current], { x: "-30vw", duration: 0.4, ease: "power1.out" }, slideAndShrinkStartTime);
      
    } else {
      if (subTitleRef.current) {
        subTitleRef.current.style.display = '';
        gsap.set(subTitleRef.current, { opacity: 0 });
      }
      const slideBackStartTime = 0.1;
      tl.to([logoRef.current, titleRef.current], { x: "0", duration: 0.4, ease: "power1.out" }, slideBackStartTime);
      const textAlignFontStartTime = slideBackStartTime + 0.6 ;
      tl.to(titleRef.current, { fontSize: "7vh", duration: 0.2, ease: "power1.out" }, textAlignFontStartTime);
      tl.to(logoRef.current, { scale: 2, duration: 0.4, ease: "power1.out" }, "<");
      tl.to(titleContainerRef.current, { alignItems: "flex-start", duration: 0.9, ease: "power1.out" }, textAlignFontStartTime);
      tl.to(subTitleRef.current, { opacity: 1, duration: 0.2 }, "<");
    }
  }, [hasScrolled]);

  const navLinksFromConfig = config?.navLinks || [
    { name: "About", href: "/about" },
    { name: "Booking", href: "/#book" },
    { name: "Packages", href: "/#packages" },
  ];
  const logoUrl = config?.logo || "/assets/images/hero/clipped.png";
  
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

  if (isPreview) {
    navDynamicClasses = `relative ${hasScrolled ? 'h-[10vh]' : 'h-[16vh]'}`;
    const bgProps = applyStyling(hasScrolled ? scrolledBgSetting : unscrolledBgSetting);
    navDynamicClasses += ` ${bgProps.className}`;
    navStyle = bgProps.style;
  } else {
    // Live Navbar: restore original behavior carefully
    navDynamicClasses = `fixed top-0 z-[9999] ${hasScrolled ? 'h-[10vh]' : 'h-[16vh]'}`;
    // Apply default Tailwind classes for live view if not overridden by specific hex codes
    const liveBgSetting = hasScrolled ? scrolledBgSetting : unscrolledBgSetting;
    const bgProps = applyStyling(liveBgSetting);
    navDynamicClasses += ` ${bgProps.className}`; // e.g., bg-banner or bg-transparent
    navStyle = bgProps.style;
  }
  
  const dropdownStyling = applyStyling(dropdownBgSetting);

  return (
    <>
      <nav
        ref={navbarRef}
        className={`${navBaseClasses} ${navDynamicClasses}`}
        style={navStyle}
      >
        <div className="w-full max-w-6xl flex items-center justify-center">
          <img
            ref={logoRef}
            src={logoUrl}
            alt="Logo"
            className="w-[12vw] md:w-[4vw] mr-2 cursor-pointer logo-fixed-size transform-gpu"
            onClick={handleLogoClick}
          />
          <div
            ref={titleContainerRef}
            className="flex flex-col h-[10vh] transition-all duration-300" // h-[10vh] is for the title content block
            style={{
              alignItems: hasScrolled ? "center" : "flex-start",
              justifyContent: "center",
            }}
          >
            <h1
              ref={titleRef}
              className="whitespace-nowrap text-[2vw] md:text-[7vh] text-white text-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:6px_black ] font-rye font-ultra-condensed origin-left"
            >
              COWBOYS-VAQUEROS
            </h1>
            <span
              ref={subTitleRef}
              className="text-[4vw] md:text-[4vh] -mt-[2vh] text-center drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:1px_black ] text-gray-500 font-serif"
              style={{ opacity: hasScrolled ? 0 : 1 }}
            >
              CONSTRUCTION
            </span>
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
        <div className={`md:hidden absolute right-5 top-1/2 transform -translate-y-1/2 ${isPreview ? 'z-10' : ''}`}>
          <button
            onClick={!isPreview ? toggleMobileMenu : (e) => e.preventDefault()}
            className="focus:outline-none"
            aria-label="Toggle Mobile Menu"
            disabled={isPreview}
          >
            <div className="relative w-8 h-8">
              <span ref={topBarRef} className={`absolute top-0 left-0 w-full h-1 ${hasScrolled || config?.useWhiteHamburger ? "bg-white" : "bg-black"} transition-colors duration-300`} />
              <span ref={middleBarRef} className={`absolute top-3 left-0 w-full h-1 ${hasScrolled || config?.useWhiteHamburger ? "bg-white" : "bg-black"} transition-colors duration-300`} />
              <span ref={bottomBarRef} className={`absolute top-6 left-0 w-full h-1 ${hasScrolled || config?.useWhiteHamburger ? "bg-white" : "bg-black"} transition-colors duration-300`} />
            </div>
          </button>
        </div>
      </nav>

      {!isPreview && (
        <div className={`w-full ${hasScrolled ? "h-[10vh]" : "h-[16vh]"} transition-all duration-300`}></div>
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
          className={`hidden md:flex md:flex-col md:items-end w-48 fixed top-[10vh] right-10 z-[9998] shadow-lg rounded-b-lg transition-colors duration-300 ${dropdownStyling.className} ${dropdownTextSetting}`}
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
    navLinks: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, href: PropTypes.string })),
    logo: PropTypes.string,
    whiteLogo: PropTypes.string,
    useWhiteHamburger: PropTypes.bool,
    scrolledBackgroundColor: PropTypes.string,
    unscrolledBackgroundColor: PropTypes.string,
    dropdownBackgroundColor: PropTypes.string,
    dropdownTextColor: PropTypes.string,
  }),
  forceScrolledState: PropTypes.bool,
  isPreview: PropTypes.bool,
};

export default Navbar;
