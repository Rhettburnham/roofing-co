import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);

  // Refs for GSAP burger-menu animation
  const topBarRef = useRef(null);
  const middleBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const timelineRef = useRef(null);
  
  // Refs for desktop burger-menu animation
  const desktopTopBarRef = useRef(null);
  const desktopMiddleBarRef = useRef(null);
  const desktopBottomBarRef = useRef(null);
  const desktopTimelineRef = useRef(null);

  // Refs for logos
  const cowboyRef = useRef(null); // Cowboy logo (home page only)
  const logoRef = useRef(null); // Main logo (all other pages)

  const location = useLocation();

  // 1) Set up the GSAP timeline for the hamburger menu
  useEffect(() => {
    // Mobile menu animation
    const tl = gsap.timeline({ paused: true });
    tl.to(topBarRef.current, { y: 10, rotate: -45, duration: 0.3 })
      .to(middleBarRef.current, { opacity: 0, duration: 0.3 }, "<")
      .to(bottomBarRef.current, { y: -10, rotate: 45, duration: 0.3 }, "<");
    timelineRef.current = tl;
    
    // Desktop menu animation - using same approach as mobile menu
    const desktopTl = gsap.timeline({ paused: true });
    desktopTl.to(desktopTopBarRef.current, { 
        y: 8, 
        rotate: -45, 
        duration: 0.3 
      })
      .to(desktopMiddleBarRef.current, { 
        opacity: 0, 
        duration: 0.3 
      }, "<")
      .to(desktopBottomBarRef.current, { 
        y: -8, 
        rotate: 45, 
        duration: 0.3 
      }, "<");
    desktopTimelineRef.current = desktopTl;
  }, []);

  // 2) Play / reverse the GSAP timeline based on `isOpen`
  useEffect(() => {
    if (isOpen) {
      timelineRef.current.play();
    } else {
      timelineRef.current.reverse();
    }
  }, [isOpen]);
  
  // 2b) Play / reverse the desktop GSAP timeline
  useEffect(() => {
    if (isDesktopMenuOpen) {
      desktopTimelineRef.current.play();
    } else {
      desktopTimelineRef.current.reverse();
    }
  }, [isDesktopMenuOpen]);

  // 3) Logo visibility and animation
  useEffect(() => {
    if (location.pathname === "/") {
      // Home Page - Cowboy logo starts invisible, fades to black on scroll
      if (cowboyRef.current) {
        gsap.to(cowboyRef.current, {
          opacity: hasScrolled ? 1 : 0,
          duration: 0.5,
        });
      }
      if (logoRef.current) {
        gsap.to(logoRef.current, { opacity: 0, duration: 0.5 });
      }
    } else {
      // Other pages
      if (cowboyRef.current) {
        gsap.to(cowboyRef.current, { opacity: 0, duration: 0.5 });
      }
      if (logoRef.current) {
        gsap.to(logoRef.current, {
          opacity: hasScrolled ? 1 : 0,
          duration: 0.5,
        });
      }
    }
  }, [location, hasScrolled]);

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

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Booking", href: "/#book" },
    { name: "Packages", href: "/#packages" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full flex items-center justify-between 
        ${
          hasScrolled
            ? "bg-banner transition-all duration-300 h-14"
            : "bg-transparent transition-all duration-300 h-14 "
        } 
        px-5 md:px-10`}
      >
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            {location.pathname === "/" ? (
              <img
                ref={cowboyRef}
                src="/assets/images/hero/clipped.png"
                alt="Cowboy Logo"
                className="h-7 md:h-10 opacity-0 transition-opacity duration-500"
                style={{ filter: "invert(1)" }}
              />
            ) : (
              <img
                ref={logoRef}
                src="/assets/images/logo.svg"
                alt="Paramount Roofing Logo"
                className="h-7 md:h-10 opacity-0 transition-opacity duration-500"
                style={{ filter: hasScrolled ? "invert(0)" : "invert(1)" }}
              />
            )}
          </Link>
        </div>

        {/* Desktop Hamburger Menu (Right) */}
        <div className="hidden md:flex md:items-center mr-5">
          <button
            onClick={() => setIsDesktopMenuOpen(!isDesktopMenuOpen)}
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
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            <div
              className={`relative ${hasScrolled ? "w-5 h-5" : "w-4 h-4"} transition-all duration-300`}
            >
              <span
                ref={topBarRef}
                className={`absolute top-0 left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-white"
                } transition-colors duration-300`}
              />
              <span
                ref={middleBarRef}
                className={`absolute ${hasScrolled ? "top-2" : "top-1.5"} left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-white"
                } transition-colors duration-300`}
              />
              <span
                ref={bottomBarRef}
                className={`absolute ${hasScrolled ? "top-4" : "top-3"} left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-white" : "bg-white"
                } transition-colors duration-300`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className={`md:hidden flex flex-col items-center justify-center w-full fixed top-14 left-0 z-50 ${
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
          className={`hidden md:flex md:flex-col md:items-end w-48 fixed top-14 right-10 z-50 ${
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
