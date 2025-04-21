import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
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
      .to(
        desktopBottomBarRef.current,
        { y: -8, rotate: 45, duration: 0.3 },
        "<"
      );
    desktopTimelineRef.current = desktopTl;
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
          behavior: "smooth",
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

  // GSAP: background switch, logo scale/slide, title slide, subtitle fade
  useEffect(() => {
    const effective = hasScrolled || !isHomePage;
    const tl = gsap.timeline();
    // background change first
    tl.set(navbarRef.current, {
      backgroundColor: effective ? "#F5A623" : "#ffffff",
    });
    // logo scale & slide
    tl.to(
      cowboyLogoRef.current,
      {
        x: effective ? "-25vw" : "0",
        scale: effective ? 0.8 : 1,
        duration: 0.3,
        ease: "power2.out",
      },
      0
    );
    // title container slide (no scale)
    tl.to(
      titleContainerRef.current,
      {
        x: effective ? "-25vw" : "0",
        duration: 0.3,
        ease: "power2.out",
      },
      0
    );
    // subtitle fade only
    tl.to(
      subTitleRef.current,
      {
        opacity: effective ? 0 : 1,
        duration: 0.3,
        ease: "power2.out",
      },
      0
    );
  }, [hasScrolled, isHomePage]);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Booking", href: "/#book" },
    { name: "Packages", href: "/#packages" },
  ];

  return (
    <>
      <nav
        ref={navbarRef}
        className={`fixed top-0 z-50 w-full flex items-center justify-center ${hasScrolled ? "h-[10vh]" : "h-[16vh]"}`}
      >
        {/* Center container for logo and title */}
        <div className="w-full flex items-center justify-center">
          {/* Logo container with both logos */}
          <div
            className="relative flex items-center justify-center w-[15vw] md:w-[14vh] mr-5 md:mr-10 z-50 cursor-pointer"
            onClick={handleLogoClick}
          >
            {/* Cowboy Logo (For home page) */}
            <img
              ref={cowboyLogoRef}
              src="/assets/images/hero/clipped.png"
              alt="Cowboy Logo"
              className="w-full object-contain absolute top-1/2 left-0 transform -translate-y-1/2"
              style={{
                filter: hasScrolled ? "invert(1)" : "invert(0)",
                opacity: isHomePage ? 1 : 0,
              }}
            />

            {/* Roofing Logo (For other pages) */}
            <img
              ref={roofingLogoRef}
              src="/assets/images/logo.svg"
              alt="Roofing Logo"
              className="w-full object-contain absolute top-1/2 left-0 transform -translate-y-1/2"
              style={{
                filter: hasScrolled ? "invert(1)" : "invert(0)",
                opacity: !isHomePage ? 1 : 0,
              }}
            />
          </div>

          {/* Title container */}
          <div
            ref={titleContainerRef}
            className="relative flex flex-col items-center justify-center z-50 -space-y-[1vh] md:-space-y-[5vh]"
          >
            <span
              ref={mainTitleRef}
              className="whitespace-nowrap text-[6vw] md:text-[7vh] text-white text-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:6px_black ] font-rye font-normal font-ultra-condensed"
            >
              COWBOYS-VAQUEROS
            </span>
            <span
              ref={subTitleRef}
              className="text-[4vw] md:text-[4vh] md:pt-[2.5vh] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:1px_black ] text-gray-500 font-serif"
            >
              CONSTRUCTION
            </span>
          </div>
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
      <div
        className={`w-full ${hasScrolled ? "h-[10vh]" : "h-[16vh]"} transition-all duration-300`}
      ></div>

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
