import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link'; // Import HashLink for in-page anchors
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  // Quick Links array
  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/packages', label: 'Services' },
    { href: '/#book', label: 'Contact Us' },
  ];

  return (
    <footer className="bg-gray-800 py-2 md:py-8">
      <div className="container mx-auto px-4">
        {/* Top Section: Company Info, Quick Links, Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8">
          {/* Company Information */}
          <div>
            <h5 className="text-base md:text-xl font-semibold text-white mb-1 md:mb-2">Cowboys Construction</h5>
            <p className="text-gray-400 text-xs md:text-base">
              Committed to providing quality roofing services.
              We specialize in residential and commercial roofing solutions.
            </p>
          </div>

          {/* Quick Links */}

            <div>
              <h5 className="text-base md:text-xl font-semibold text-white ">Quick Links</h5>
              <ul className="text-gray-400  md:space-y-1">
                {quickLinks.map((link, index) => {
                  // Determine if the link is an in-page anchor
                  const isHashLink = link.href.startsWith('/#');
                  // Choose the appropriate Link component
                  const LinkComponent = isHashLink ? HashLink : Link;

                  return (
                    <li key={index}>
                      <LinkComponent
                        to={link.href}
                        className="hover:text-white transition duration-300 text-xs md:text-base"
                      >
                        {link.label}
                      </LinkComponent>
                    </li>
                  );
                })}
              </ul>
            </div>

          {/* Contact Information */}
          <div>
            <h5 className="text-base md:text-xl font-semibold text-white ">Contact Us</h5>
            <p className="text-xs md:text-base text-gray-400">
              1575 Clairmont Rd<br />
              Decatur, GA 30033
            </p>
            <div className="text-gray-400 text-xs md:text-base">
              <a href="tel:4422363783">Phone: (442)236-3783</a>
            </div>
            <div className="text-xs md:text-base text-gray-400">
              <a href="email:Rhett.Burnham@emory.edu">Email: Rhett.Burnham@emory.edu</a>
            </div>
          </div>
        </div>

        {/* Bottom Section: Social Media Buttons and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-2 md:mt-4">
          <div className="text-gray-400 text-xs md:text-base text-center md:text-left">
            <p>&copy; 2024 Rhett's Roofing. All Rights Reserved.</p>
          </div>

          {/* Social Media Buttons */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            {/* Facebook Icon */}
            <a
              href="https://www.facebook.com/ParamountRoofingAndConstruction/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
              aria-label="Facebook"
            >
              <Facebook size={24} />
            </a>

            {/* Instagram Icon */}
            <a
              href="https://www.instagram.com/rhettsroofing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>

            {/* LinkedIn Icon */}
            <a
              href="https://www.linkedin.com/company/rhetts-roofing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
              aria-label="LinkedIn"
            >
              <Linkedin size={24} />
            </a>

            {/* Twitter Icon */}
            <a
              href="https://twitter.com/rhettsroofing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
              aria-label="X (formerly Twitter)"
            >
              <Twitter size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;