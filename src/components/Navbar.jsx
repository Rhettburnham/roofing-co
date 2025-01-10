import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Refs for GSAP burger-menu animation
  const topBarRef = useRef(null);
  const middleBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const timelineRef = useRef(null); // Make sure to define this

  // Refs for logos
  const cowboyRef = useRef(null); // Cowboy logo (home page only)
  const logoRef = useRef(null); // Main logo (all other pages)

  const location = useLocation();

  // 1) Set up the GSAP timeline for the hamburger menu
  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    tl.to(topBarRef.current, { y: 10, rotate: -45, duration: 0.3 })
      .to(middleBarRef.current, { opacity: 0, duration: 0.3 }, "<") // "<" means start at same time as previous
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

  // 3) Show cowboyRef on home page, show logoRef on other pages
  useEffect(() => {
    if (location.pathname === "/") {
      // Home Page
      gsap.to(cowboyRef.current, { opacity: 1, duration: .5, delay: .5 });
      gsap.to(logoRef.current, { opacity: 0, duration: 0.5 });
    } else {
      // Other Pages
      gsap.to(cowboyRef.current, { opacity: 0, duration: 0.5 });
      gsap.to(logoRef.current, { opacity: 1, duration: 0.5,  delay: .5 });
    }
  }, [location]);

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Booking", href: "/#book" },
    { name: "Packages", href: "/#packages" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full h-16 flex items-center justify-center bg-dark-below-header px-5 md:px-10 ">
        {/* Cowboy Logo (Home page only) */}
        <div className="absolute left-4 md:left-8 flex items-center">
          <Link to="/" className="flex items-center">
            <img
              ref={cowboyRef}
              src="/assets/images/clipped-cowboy.png"
              alt="Cowboy Logo"
              className="h-12 opacity-0 transition-opacity duration-500"
              style={{ filter: "invert(0)" }}
            />
          </Link>
        </div>

        {/* Main Logo (Other pages) */}
        <div className="absolute left-4 md:left-8 flex items-center">
          <Link to="/" className="flex items-center">
            <img
              ref={logoRef}
              src="/assets/images/logo.svg"
              alt="Paramount Roofing Logo"
              className="h-12 opacity-0 transition-opacity duration-500"
            />
          </Link>
        </div>

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex space-x-[6vw] z-10">
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              className="text-2xl text-white font-normal font-ultra-condensed font-serif hover:text-gray-300"
            >
              {nav.name}
            </HashLink>
          ))}
        </div>

        {/* Hamburger Menu (Mobile) */}
        <div className="flex items-center md:hidden absolute right-5">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
          >
            <div className="relative w-6 h-6">
              <span
                ref={topBarRef}
                className="absolute top-0 left-0 w-full h-0.5 bg-black"
              />
              <span
                ref={middleBarRef}
                className="absolute top-2.5 left-0 w-full h-0.5 bg-black"
              />
              <span
                ref={bottomBarRef}
                className="absolute top-5 left-0 w-full h-0.5 bg-black"
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center w-full fixed top-16 left-0 z-50 bg-dark-below-header shadow-lg">
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              onClick={() => setIsOpen(false)}
              className="px-5 py-3 text-sm text-white hover:text-dark-below-header transition-all"
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
