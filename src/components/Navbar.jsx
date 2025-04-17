import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [forceBannerColor, setForceBannerColor] = useState(false);

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
  
  const navbarRef = useRef(null);

  // Refs for logos
  const logoRef = useRef(null); // Cowboy logo (home page only)
  const houseLogoRef = useRef(null); // Main logo (all other pages)

  const location = useLocation();

  // 1) Set up the GSAP timelines for the hamburger menus
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
      .to(desktopTopBarRef.current, {
        y: 8,
        rotate: -45,
        duration: 0.3,
      })
      .to(
        desktopMiddleBarRef.current,
        {
          opacity: 0,
          duration: 0.3,
        },
        "<"
      )
      .to(
        desktopBottomBarRef.current,
        {
          y: -8,
          rotate: 45,
          duration: 0.3,
        },
        "<"
      );
    desktopTimelineRef.current = desktopTl;
  }, []);

  // Toggle menu and force banner color when menu opens
  const toggleMobileMenu = () => {
    if (!isOpen && !hasScrolled) {
      // First change background color
      setForceBannerColor(true);
      // Then open menu after a short delay
      setTimeout(() => {
        setIsOpen(true);
      }, 150);
    } else {
      setIsOpen(!isOpen);
      if (!hasScrolled) {
        setTimeout(() => {
          setForceBannerColor(false);
        }, 300);
      }
    }
  };

  // Toggle desktop menu and force banner color when menu opens
  const toggleDesktopMenu = () => {
    if (!isDesktopMenuOpen && !hasScrolled) {
      // First change background color
      setForceBannerColor(true);
      // Then open menu after a short delay
      setTimeout(() => {
        setIsDesktopMenuOpen(true);
      }, 150);
    } else {
      setIsDesktopMenuOpen(!isDesktopMenuOpen);
      if (!hasScrolled) {
        setTimeout(() => {
          setForceBannerColor(false);
        }, 300);
      }
    }
  };

  // 2) Play / reverse the GSAP timeline based on menu state
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
      if (logoRef.current) {
        gsap.to(logoRef.current, {
          opacity: hasScrolled || forceBannerColor ? 1 : 0,
          duration: 0.5,
        });
      }
      if (houseLogoRef.current) {
        gsap.to(houseLogoRef.current, { opacity: 0, duration: 0.5 });
      }
    } else {
      // Other pages
      if (logoRef.current) {
        gsap.to(logoRef.current, { opacity: 0, duration: 0.5 });
      }
      if (houseLogoRef.current) {
        gsap.to(houseLogoRef.current, {
          opacity: hasScrolled || forceBannerColor ? 1 : 0,
          duration: 0.5,
        });
      }
    }
  }, [location, hasScrolled, forceBannerColor]);

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

  // Determine navbar height for proper dropdown positioning
  const getNavHeight = () => {
    return hasScrolled || forceBannerColor ? "10vh" : "16vh";
  };

  return (
    <>
      <nav
        ref={navbarRef}
        className={`fixed top-0 z-50 w-full flex items-center justify-between 
        ${
          hasScrolled || forceBannerColor
            ? "bg-banner transition-all h-[10vh] duration-300 "
            : "bg-transparent transition-all h-[16vh] duration-300 "
        } 
        px-5 md:px-10`}
      >
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            {location.pathname === "/" ? (
              <img
                ref={logoRef}
                src="/assets/images/hero/clipped.png"
                alt="Cowboy Logo"
                className="h-7 md:h-10 opacity-0 transition-opacity duration-500"
                style={{ filter: "invert(1)" }}
              />
            ) : (
              <img
                ref={houseLogoRef}
                src="/assets/images/logo.svg"
                alt="Paramount Roofing Logo"
                className="h-7 md:h-10 opacity-0 transition-opacity duration-500"
                style={{ filter: (hasScrolled || forceBannerColor) ? "invert(0)" : "invert(1)" }}
              />
            )}
          </Link>
        </div>

        {/* Desktop Hamburger Menu (Right) */}
        <div className="hidden md:flex md:items-center mr-5">
          <button
            onClick={toggleDesktopMenu}
            className="focus:outline-none relative z-30"
            aria-label="Toggle Desktop Menu"
          >
            <div className="relative w-5 h-5">
              <span
                ref={desktopTopBarRef}
                className={`absolute top-0 left-0 w-full h-0.5 ${
                  (hasScrolled || forceBannerColor) ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
              <span
                ref={desktopMiddleBarRef}
                className={`absolute top-2 left-0 w-full h-0.5 ${
                  (hasScrolled || forceBannerColor) ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
              <span
                ref={desktopBottomBarRef}
                className={`absolute top-4 left-0 w-full h-0.5 ${
                  (hasScrolled || forceBannerColor) ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="flex items-center md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="focus:outline-none"
            aria-label="Toggle Mobile Menu"
          >
            <div
              className={`relative ${(hasScrolled || forceBannerColor) ? "w-5 h-5" : "w-4 h-4"} transition-all duration-300`}
            >
              <span
                ref={topBarRef}
                className={`absolute top-0 left-0 w-full h-0.5 ${
                  (hasScrolled || forceBannerColor) ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
              <span
                ref={middleBarRef}
                className={`absolute ${(hasScrolled || forceBannerColor) ? "top-2" : "top-1.5"} left-0 w-full h-0.5 ${
                  (hasScrolled || forceBannerColor) ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
              <span
                ref={bottomBarRef}
                className={`absolute ${(hasScrolled || forceBannerColor) ? "top-4" : "top-3"} left-0 w-full h-0.5 ${
                  (hasScrolled || forceBannerColor) ? "bg-white" : "bg-black"
                } transition-colors duration-300`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          style={{ top: getNavHeight() }}
          className={`md:hidden flex flex-col items-center justify-center w-full fixed left-0 z-50 ${
            hasScrolled || forceBannerColor ? "bg-banner" : "bg-black bg-opacity-80"
          } shadow-lg transition-colors duration-300`}
        >
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              onClick={() => {
                setIsOpen(false);
                if (!hasScrolled) {
                  setTimeout(() => {
                    setForceBannerColor(false);
                  }, 300);
                }
              }}
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
          style={{ top: getNavHeight() }}
          className={`hidden md:flex md:flex-col md:items-end w-48 fixed right-10 z-50 ${
            hasScrolled || forceBannerColor ? "bg-banner" : "bg-black bg-opacity-80"
          } shadow-lg rounded-b-lg transition-colors duration-300`}
        >
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              onClick={() => {
                setIsDesktopMenuOpen(false);
                if (!hasScrolled) {
                  setTimeout(() => {
                    setForceBannerColor(false);
                  }, 300);
                }
              }}
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
