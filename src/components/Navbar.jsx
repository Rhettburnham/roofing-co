import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";
import { motion } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [isHomePage, setIsHomePage] = useState(true);

  // Refs for mobile burger-menu animation
  const topBarRef = useRef(null);
  const middleBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const timelineRef = useRef(null);
  
  // Refs for desktop burger-menu animation
  const desktopTopBarRef = useRef(null);
  const desktopMiddleBarRef = useRef(null);
  const desktopBottomBarRef = useRef(null);
  const desktopTimelineRef = useRef(null);

  // Refs for logo and text animations
  const cowboyLogoRef = useRef(null);
  const roofingLogoRef = useRef(null);
  const titleContainerRef = useRef(null);
  const mainTitleRef = useRef(null);
  const subTitleRef = useRef(null);
  const navbarRef = useRef(null);
//homosexual 
  const location = useLocation();
  const navigate = useNavigate();

  // Track if we're on the home page
  useEffect(() => {
    setIsHomePage(location.pathname === "/");
    
    // When route changes, save current scroll position if leaving home page
    if (location.pathname === "/") {
      setLastScrollPosition(0);
    } else if (isHomePage) {
      // Only save position when navigating away from home
      setLastScrollPosition(window.scrollY);
    }
  }, [location, isHomePage]);

  // Set up GSAP timelines for hamburger menus
  useEffect(() => {
    // Mobile menu animation
    const tl = gsap.timeline({ paused: true });
    tl.to(topBarRef.current, { y: 6, rotate: -45, duration: 0.3 })
      .to(middleBarRef.current, { opacity: 0, duration: 0.3 }, "<")
      .to(bottomBarRef.current, { y: -6, rotate: 45, duration: 0.3 }, "<");
    timelineRef.current = tl;
    
    // Desktop menu animation
    const desktopTl = gsap.timeline({ paused: true });
    desktopTl
      .to(desktopTopBarRef.current, { y: 8, rotate: -45, duration: 0.3 })
      .to(desktopMiddleBarRef.current, { opacity: 0, duration: 0.3 }, "<")
      .to(desktopBottomBarRef.current, { y: -8, rotate: 45, duration: 0.3 }, "<");
    desktopTimelineRef.current = desktopTl;
    
    // Set animation flag to true after component mounts
    setHasAnimated(true);
  }, []);

  // Handle logo click to navigate home and restore scroll position
  const handleLogoClick = (e) => {
    e.preventDefault();
    
    // Navigate to home first
    navigate("/");
    
    // If we have a saved scroll position, restore it after navigation
    if (lastScrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo({
          top: lastScrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  // Toggle desktop menu
  const toggleDesktopMenu = () => {
    setIsDesktopMenuOpen(!isDesktopMenuOpen);
  };

  // Play/reverse hamburger animation based on menu state
  useEffect(() => {
    if (isOpen) {
      timelineRef.current.play();
    } else {
      timelineRef.current.reverse();
    }
  }, [isOpen]);

  // Play/reverse desktop hamburger animation
  useEffect(() => {
    if (isDesktopMenuOpen) {
      desktopTimelineRef.current.play();
    } else {
      desktopTimelineRef.current.reverse();
    }
  }, [isDesktopMenuOpen]);

  // Add scroll event listener to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
      
      // Update last scroll position if on home page
      if (isHomePage) {
        setLastScrollPosition(window.scrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  // Setup logo and text animations when scrolling or changing routes
  useEffect(() => {
    // Check if we're on home page
    const isOnHomePage = location.pathname === "/";
    
    // Cowboy logo (for home page)
    if (cowboyLogoRef.current) {
      gsap.to(cowboyLogoRef.current, { 
        opacity: isOnHomePage ? 1 : 0,
        duration: 0.5 
      });
    }
    
    // Roofing logo (for other pages)
    if (roofingLogoRef.current) {
      gsap.to(roofingLogoRef.current, { 
        opacity: isOnHomePage ? 0 : 1,
        duration: 0.5 
      });
    }
    
    // Title container animations
    if (isOnHomePage) {
      if (!hasScrolled) {
        // Home page at top - centered logo and text
        gsap.to(cowboyLogoRef.current, { 
          x: 0, 
          scale: 1.5,
          duration: 0.5 
        });
        
        gsap.to(titleContainerRef.current, {
          x: 0,
          opacity: 1,
          marginTop: "8vh", // Maintain the top margin when at the top
          duration: 0.5
        });
        
        gsap.to(mainTitleRef.current, {
          fontSize: "7vh", 
          duration: 0.5
        });
        
        gsap.to(subTitleRef.current, {
          fontSize: "4vh",
          opacity: 1,
          duration: 0.5
        });
      } else {
        // Home page but scrolled down - move to left and shrink
        gsap.to(cowboyLogoRef.current, { 
          x: "-25vw", 
          scale: 0.7,
          duration: 0.5 
        });
        
        gsap.to(titleContainerRef.current, {
          x: "-25vw",
          opacity: 1,
          marginTop: 0, // Reduce margin to zero when shrinking
          duration: 0.5
        });
        
        gsap.to(mainTitleRef.current, {
          fontSize: "5vh",
          duration: 0.5
        });
        
        gsap.to(subTitleRef.current, {
          fontSize: "2.5vh",
          opacity: 0, // Make subtitle fade out completely
          duration: 0.5
        });
      }
    } else {
      // Not on home page - hide title text and set margin to zero
      gsap.to(titleContainerRef.current, {
        opacity: 0,
        marginTop: 0,
        duration: 0.3
      });
      
      // Ensure subtitle is completely hidden
      gsap.to(subTitleRef.current, {
        opacity: 0,
        duration: 0.3
      });
    }
  }, [location, hasScrolled]);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Booking", href: "/#book" },
    { name: "Packages", href: "/#packages" },
  ];

  return (
    <>
      <nav
        ref={navbarRef}
        className={`fixed top-0 z-50 w-full flex items-center justify-center 
        ${
          hasScrolled 
            ? "bg-banner transition-all h-[10vh] duration-300" 
            : "bg-white transition-all h-[16vh] duration-300"
        }`}
      >
        {/* Center container for logo and title */}
        <div className="w-full flex items-center justify-center">
          {/* Logo container with both logos */}
          <div className="relative w-[15vw] md:w-[14vh] h-auto mr-5 md:mr-10 z-50 cursor-pointer" onClick={handleLogoClick}>
            {/* Cowboy Logo (For home page) */}
            <motion.img
              ref={cowboyLogoRef}
              initial={{ x: -100, opacity: isHomePage ? 1 : 0 }}
              animate={hasAnimated ? { x: 0 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
              src="/assets/images/hero/clipped.png"
              alt="Cowboy Logo"
              className="w-full h-auto absolute top-0 left-0"
              style={{ filter: hasScrolled ? "invert(1)" : "invert(0)" }}
            />
            
            {/* Roofing Logo (For other pages) */}
            <motion.img
              ref={roofingLogoRef}
              initial={{ opacity: isHomePage ? 0 : 1 }}
              src="/assets/images/logo.svg"
              alt="Roofing Logo"
              className="w-full h-auto absolute top-0 left-0"
              style={{ 
                filter: hasScrolled ? "invert(1)" : "invert(0)",
                maxWidth: "50px",
                maxHeight: "50px"
              }}
            />
          </div>
          
          {/* Title container */}
          <motion.div
            ref={titleContainerRef}
            initial={{ x: 100, opacity: isHomePage ? 1 : 0 }}
            animate={hasAnimated ? { x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative flex flex-col items-center justify-center z-50 -space-y-[1vh] md:-space-y-[5vh] mt-[8vh]"
          >
            <span 
              ref={mainTitleRef}
              className="whitespace-nowrap text-[6vw] md:text-[7vh] text-white text-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:6px_black ] font-rye font-normal font-ultra-condensed"
            >
              COWBOYS-VAQUEROS
            </span>
            <span 
              ref={subTitleRef}
              className="text-[4vw] md:text-[4vh] md:pt-[2.5vh] text- drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:1px_black ] text-gray-500 font-serif"
            >
              CONSTRUCTION
            </span>
          </motion.div>
        </div>

        {/* Desktop Hamburger Menu (Right) */}
        <div className="hidden md:flex md:items-center absolute right-10">
          <button
            onClick={toggleDesktopMenu}
            className="focus:outline-none relative z-30"
            aria-label="Toggle Desktop Menu"
          >
            <div className="relative w-5 h-5">
              <span
                ref={desktopTopBarRef}
                className={`absolute top-0 left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
              <span
                ref={desktopMiddleBarRef}
                className={`absolute top-2 left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
              <span
                ref={desktopBottomBarRef}
                className={`absolute top-4 left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden absolute right-5">
          <button
            onClick={toggleMobileMenu}
            className="focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            <div className="relative w-5 h-5">
              <span
                ref={topBarRef}
                className={`absolute top-0 left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
              <span
                ref={middleBarRef}
                className={`absolute top-2 left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
              <span
                ref={bottomBarRef}
                className={`absolute top-4 left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Spacer div to prevent content from being hidden under navbar */}
      <div className={`w-full ${hasScrolled ? "h-[10vh]" : "h-[16vh]"} transition-all duration-300`}></div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className={`md:hidden flex flex-col items-center justify-center w-full fixed top-[10vh] left-0 z-40 ${
            hasScrolled ? "bg-banner" : "bg-black bg-opacity-80"
          } shadow-lg transition-colors duration-300`}
        >
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              onClick={() => setIsOpen(false)}
              className={`px-5 py-2 text-xs text-white hover:text-gray-300 transition-all`}
            >
              {nav.name}
            </HashLink>
          ))}
        </div>
      )}

      {/* Desktop Menu Dropdown */}
      {isDesktopMenuOpen && (
        <div
          className={`hidden md:flex md:flex-col md:items-end w-48 fixed top-[10vh] right-10 z-40 ${
            hasScrolled ? "bg-banner" : "bg-black bg-opacity-80"
          } shadow-lg rounded-b-lg transition-colors duration-300`}
        >
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              onClick={() => setIsDesktopMenuOpen(false)}
              className={`px-5 py-3 text-sm text-white hover:text-gray-300 w-full text-right`}
            >
              {nav.name}
            </HashLink>
          ))}
        </div>
      )}
    </>
  );
};

export default Navbar;
