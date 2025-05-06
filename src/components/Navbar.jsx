import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);

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

  // Refs for logo and text
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subTitleRef = useRef(null);
  const navbarRef = useRef(null);
  const titleContainerRef = useRef(null);

  const navigate = useNavigate();

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

  // Handle logo click to navigate home
  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate("/");
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  // Toggle desktop menu
  const toggleDesktopMenu = () => {
    setIsDesktopMenuOpen(!isDesktopMenuOpen);
  };

  // Play/reverse hamburger animations based on menu state
  useEffect(() => {
    if (isOpen) {
      timelineRef.current.play();
    } else {
      timelineRef.current.reverse();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isDesktopMenuOpen) {
      desktopTimelineRef.current.play();
    } else {
      desktopTimelineRef.current.reverse();
    }
  }, [isDesktopMenuOpen]);

  // Add scroll event listener to check if we're at the top of the page
  useEffect(() => {
    const handleScroll = () => {
      // Only use a simple check - are we at the top (or very close to it)?
      if (window.scrollY > 1) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Modified animation sequence per new requirements
  useEffect(() => {
    // Use a single timeline for better performance
    const tl = gsap.timeline();

    if (hasScrolled) {
      // Clear any in-progress animations
      gsap.killTweensOf([
        titleRef.current,
        logoRef.current,
        subTitleRef.current,
      ]);

      // NEW ORDER:
      // 1. Subtitle fades out (bg-banner appears via CSS classes in the render)
      tl.to(subTitleRef.current, {
        opacity: 0,
        duration: 0.2,
      });

      // 2. Logo and title slide together
      tl.to(
        [logoRef.current, titleRef.current],
        {
          x: "-30vw", // Both move the same amount
          duration: 0.2,
          ease: "power1.out",
        },
        "+=0.1"
      );

      // 3. Title font size shrinks last
      tl.to(
        titleRef.current,
        {
          fontSize: "4vh",
          duration: 0.2,
          ease: "power1.out",
        },
        "+=0.1"
      );

      // Ensure title is vertically centered
      tl.to(
        titleContainerRef.current,
        {
          alignItems: "center",
          duration: 0.1,
        },
        "<"
      ); // At the same time as the font size change
    } else {
      // Clear any in-progress animations
      gsap.killTweensOf([
        titleRef.current,
        logoRef.current,
        subTitleRef.current,
        titleContainerRef.current,
      ]);

      // CORRECTED REVERSE SEQUENCE:
      // 1. Title font size grows first
      tl.to(titleRef.current, {
        fontSize: "7vh",
        duration: 0.2,
        ease: "power1.out",
      });

      // Reset vertical alignment to top
      tl.to(
        titleContainerRef.current,
        {
          alignItems: "flex-start",
          duration: 0.1,
        },
        "<"
      ); // At the same time as the font size change

      // 2. Logo and title slide back together
      tl.to(
        [logoRef.current, titleRef.current],
        {
          x: "0",
          duration: 0.2,
          ease: "power1.out",
        },
        "+=0.1"
      );

      // 3. Subtitle fades in last (after the slide)
      // This should happen after the slide, as bg change is CSS-based and will happen at this time
      tl.to(
        subTitleRef.current,
        {
          opacity: 1,
          duration: 0.2,
        },
        "+=0.1"
      );
    }
  }, [hasScrolled]);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Booking", href: "/#book" },
    { name: "Packages", href: "/#packages" },
  ];

  return (
    <>
      <nav
        ref={navbarRef}
        className={`fixed top-0 z-[9999] w-full flex items-center justify-center transition-all duration-300 ${hasScrolled ? "bg-banner h-[10vh]" : "h-[16vh]"}`}
      >
        <div className="w-full max-w-6xl flex items-center justify-center">
          {/* Logo */}
          <img
            ref={logoRef}
            src="/assets/images/hero/clipped.png"
            alt="Logo"
            className="w-[12vw] md:w-[8vw] mr-2 cursor-pointer logo-fixed-size transform-gpu"
            onClick={handleLogoClick}
          />

          {/* Title Container - Using ref to control alignment in GSAP */}
          <div
            ref={titleContainerRef}
            className={`flex flex-col h-[10vh] transition-all duration-300`}
            style={{
              alignItems: hasScrolled ? "center" : "flex-start",
              justifyContent: "center",
            }}
          >
            <h1
              ref={titleRef}
              className="whitespace-nowrap text-[6vw] md:text-[7vh] text-white text-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] [ -webkit-text-stroke:6px_black ] font-rye font-normal font-ultra-condensed origin-left transform-gpu"
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

        {/* Desktop Hamburger Menu (Right) */}
        <div className="hidden md:block absolute right-10 top-1/2 transform -translate-y-1/2">
          <button
            onClick={toggleDesktopMenu}
            className="focus:outline-none relative z-30"
            aria-label="Toggle Desktop Menu"
          >
            <div className="relative w-5 h-5">
              <span
                ref={desktopTopBarRef}
                className={`absolute top-0 left-0 w-full h-0.5 ${hasScrolled ? "bg-white" : "bg-black"} transition-colors duration-300`}
              />
              <span
                ref={desktopMiddleBarRef}
                className={`absolute top-2 left-0 w-full h-0.5 ${hasScrolled ? "bg-white" : "bg-black"} transition-colors duration-300`}
              />
              <span
                ref={desktopBottomBarRef}
                className={`absolute top-4 left-0 w-full h-0.5 ${hasScrolled ? "bg-white" : "bg-black"} transition-colors duration-300`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden absolute right-5 top-1/2 transform -translate-y-1/2">
          <button
            onClick={toggleMobileMenu}
            className="focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            <div className="relative w-5 h-5">
              <span
                ref={topBarRef}
                className={`absolute top-0 left-0 w-full h-0.5 ${hasScrolled ? "bg-white" : "bg-black"} transition-colors duration-300`}
              />
              <span
                ref={middleBarRef}
                className={`absolute top-2 left-0 w-full h-0.5 ${hasScrolled ? "bg-white" : "bg-black"} transition-colors duration-300`}
              />
              <span
                ref={bottomBarRef}
                className={`absolute top-4 left-0 w-full h-0.5 ${hasScrolled ? "bg-white" : "bg-black"} transition-colors duration-300`}
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
          className={`md:hidden flex flex-col items-center justify-center w-full fixed top-[10vh] left-0 z-[9998] shadow-lg transition-colors duration-300 ${hasScrolled ? "bg-banner" : "bg-black bg-opacity-80"}`}
        >
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              onClick={() => setIsOpen(false)}
              className="px-5 py-2 text-xs text-white hover:text-gray-300 transition-all"
            >
              {nav.name}
            </HashLink>
          ))}
        </div>
      )}

      {/* Desktop Menu Dropdown */}
      {isDesktopMenuOpen && (
        <div
          className={`hidden md:flex md:flex-col md:items-end w-48 fixed top-[10vh] right-10 z-[9998] shadow-lg rounded-b-lg transition-colors duration-300 ${hasScrolled ? "bg-banner" : "bg-black bg-opacity-80"}`}
        >
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              onClick={() => setIsDesktopMenuOpen(false)}
              className="px-5 py-3 text-sm text-white hover:text-gray-300 w-full text-right"
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
