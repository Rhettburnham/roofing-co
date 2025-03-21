import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Refs for GSAP burger-menu animation
  const topBarRef = useRef(null);
  const middleBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const timelineRef = useRef(null);

  // Refs for logos
  const cowboyRef = useRef(null); // Cowboy logo (home page only)
  const logoRef = useRef(null); // Main logo (all other pages)

  const location = useLocation();

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

  // 3) Logo visibility and animation
  useEffect(() => {
    if (location.pathname === "/") {
      // Home Page - Cowboy logo starts invisible, fades to black on scroll
      gsap.to(cowboyRef.current, {
        opacity: hasScrolled ? 1 : 0,
        duration: 0.5,
      });
      gsap.to(logoRef.current, { opacity: 0, duration: 0.5 });
    } else {
      // Other pages
      gsap.to(cowboyRef.current, { opacity: 0, duration: 0.5 });
      gsap.to(logoRef.current, {
        opacity: hasScrolled ? 1 : 0,
        duration: 0.5,
      });
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
        className={`sticky top-0 z-50 w-full flex items-center justify-between 
        ${
          hasScrolled
            ? "bg-dark-below-header transition-all duration-300 h-14"
            : "bg-white transition-all duration-300 h-10 md:h-14"
        } 
        px-5 md:px-10`}
      >
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            {location.pathname === "/" ? (
              <img
                ref={cowboyRef}
                src="/assets/images/clipped-cowboy.png"
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

        {/* Center: Navigation Links (Desktop) */}
        <div className="hidden md:flex md:absolute md:left-1/2 md:transform md:-translate-x-1/2 md:top-0 md:h-full items-center justify-center space-x-8">
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              className={`text-base font-normal font-serif ${
                hasScrolled
                  ? "text-white hover:text-gray-200"
                  : "text-gray-600 hover:text-gray-800"
              } transition-colors duration-300`}
            >
              {nav.name}
            </HashLink>
          ))}
        </div>

        {/* Right: Hamburger Menu (Mobile) */}
        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
          >
            <div
              className={`relative ${hasScrolled ? "w-5 h-5" : "w-4 h-4"} transition-all duration-300`}
            >
              <span
                ref={topBarRef}
                className={`absolute top-0 left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-black" : "bg-white"
                } transition-colors duration-300`}
              />
              <span
                ref={middleBarRef}
                className={`absolute ${hasScrolled ? "top-2" : "top-1.5"} left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-black" : "bg-white"
                } transition-colors duration-300`}
              />
              <span
                ref={bottomBarRef}
                className={`absolute ${hasScrolled ? "top-4" : "top-3"} left-0 w-full h-0.5 ${
                  hasScrolled ? "bg-black" : "bg-white"
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
            hasScrolled ? "bg-white" : "bg-dark-below-header"
          } shadow-lg transition-colors duration-300`}
        >
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              onClick={() => setIsOpen(false)}
              className={`px-5 py-2 text-xs ${
                hasScrolled
                  ? "text-black hover:text-gray-700"
                  : "text-white hover:text-gray-100"
              } transition-all`}
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
