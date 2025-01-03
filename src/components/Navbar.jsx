import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import { HashLink } from "react-router-hash-link";
import gsap from "gsap";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const topBarRef = useRef(null);
  const middleBarRef = useRef(null);
  const bottomBarRef = useRef(null);
  const logoRef = useRef(null); // Create ref for the logo
  const timelineRef = useRef(null);

  const location = useLocation(); // Hook to get current location

  useEffect(() => {
    const tl = gsap.timeline({ paused: true });
    tl.to(topBarRef.current, { y: 10, rotate: -45, duration: 0.3 })
      .to(middleBarRef.current, { opacity: 0, duration: 0.3 }, "-=0.3")
      .to(bottomBarRef.current, { y: -10, rotate: 45, duration: 0.3 }, "-=0.3");
    timelineRef.current = tl;
  }, []);

  useEffect(() => {
    if (isOpen) {
      timelineRef.current.play();
    } else {
      timelineRef.current.reverse();
    }
  }, [isOpen]);

  // Effect to handle logo rotation on route change
  useEffect(() => {
    if (location.pathname === "/") {
      // Rotate logo back to original position when on home page
      gsap.to(logoRef.current, { rotation: 0, duration: 1 });
    } else {
      // Rotate logo 90 degrees counterclockwise on other pages
      gsap.to(logoRef.current, { rotation: -90, duration: 1 });
    }
  }, [location]);

  const navLinks = [
    { name: "About", href: "/about" },
    // { name: "Roof Repair", href: "/roofrepair" },
    { name: "Booking", href: "/#book" },
    { name: "Packages", href: "/#packages" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full h-16 flex items-center justify-center bg-white px-5 md:px-10 ">
        
        <div className="flex items-center absolute left-5">
          <Link to="/" className="flex items-center">
            <img
              ref={logoRef} // Attach ref to the logo image
              src="/assets/images/logo.svg"
              alt="Paramount Roofing & Construction Logo"
              className="h-12"
            />
          </Link>
        </div>
        {/* space between */}
        <div className="hidden md:flex space-x-[6vw]  z-10">
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              className="text-lg cursor-pointer text-black hover:text-gray-300 font-bold transition-all "
            >
              {nav.name}
            </HashLink>
          ))}
        </div>
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
      {isOpen && (
        <div className="md:hidden flex flex-col items-center dark-below-header w-full fixed top-16 left-0 z-50 shadow-lg">
          {navLinks.map((nav) => (
            <HashLink
              key={nav.name}
              smooth
              to={nav.href}
              className="px-5 py-3 text-sm cursor-pointer text-white hover:text-dark-below-header transition-all"
              onClick={() => setIsOpen(false)}
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
