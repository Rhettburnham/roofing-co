import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link'; // Import HashLink for in-page anchors
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  // Quick Links array (unchanged)
  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/packages', label: 'Services' },
    { href: '/#book', label: 'Contact Us' },
  ];

  // Info Links array pointing to MergedRoofingInfoPage
  const infoLinks = [
    { href: '/mergedroofinginfopage#asphalt-shingle-installation', label: 'Asphalt Shingle Installation' },
    { href: '/mergedroofinginfopage#diagnose-roof', label: 'Diagnosing Your Roof' },
    { href: '/mergedroofinginfopage#leaks-water-damage', label: 'Water Damage and Leaks' },
    { href: '/mergedroofinginfopage#mold-algae-rot', label: 'Mold, Algae, & Rot' },
    { href: '/mergedroofinginfopage#poor-installation', label: 'Poor Installation' },
    { href: '/mergedroofinginfopage#roof-material-deterioration', label: 'Roof Material Deterioration' },
    { href: '/mergedroofinginfopage#roof-maintenance', label: 'Roof Maintenance' },
    { href: '/mergedroofinginfopage#shingle-damage', label: 'Shingle Damage' },
  ];

  // State to store the BBB data
  const [bbbData, setBbbData] = useState({
    business_email: '',
    telephone: '',
    email: '',
    business_name: '',
    address: '',
  });

  // Fetch bbb_profile_data.json
  useEffect(() => {
    fetch('/data/bbb_profile_data.json')
      .then((res) => res.json())
      .then((data) => {
        setBbbData({
          business_email: data.business_email || '',
          telephone: data.telephone || '',
          email: data.email || '',
          business_name: data.business_name || '',
          address: data.address || '',
        });
      })
      .catch((err) => {
        console.error('Error fetching bbb_profile_data.json:', err);
      });
  }, []);

  return (
    <footer className="bg-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Top Section: Company Info, Quick Links, Contact Info, Info Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Information */}
          <div>
            {/* Display Business Name if available */}
            {bbbData.business_name && (
              <h5 className="text-xl font-semibold text-white mb-2">
                {bbbData.business_name}
              </h5>
            )}

            {/* Tagline or Disclaimer */}
            <p className="text-gray-400 text-sm">
              Committed to providing quality roofing services. We specialize in
              residential and commercial roofing solutions.
            </p>

            {/* Display Address if available */}
            {bbbData.address && (
              <p className="text-gray-400 text-sm mt-2">
                {bbbData.address}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xl font-semibold text-white mb-2">
              Quick Links
            </h5>
            <ul className="text-gray-400 space-y-1">
              {quickLinks.map((link, index) => {
                const isHashLink = link.href.startsWith('/#');
                const LinkComponent = isHashLink ? HashLink : Link;

                return (
                  <li key={index}>
                    <LinkComponent
                      to={link.href}
                      className="hover:text-white transition duration-300 text-sm"
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
            <h5 className="text-xl font-semibold text-white mb-2">
              Contact Us
            </h5>

            {/* Telephone Link */}
            {bbbData.telephone && (
              <div className="text-gray-400 text-sm">
                <a href={`tel:${bbbData.telephone}`} className="hover:text-white transition duration-300">
                  Phone: {bbbData.telephone}
                </a>
              </div>
            )}

            {/* Email Link */}
            {bbbData.business_email && bbbData.email && (
              <div className="text-sm text-gray-400 mt-1">
                <a href={`mailto:${bbbData.business_email}`} className="hover:text-white transition duration-300">
                  Email: {bbbData.email}
                </a>
              </div>
            )}
          </div>

          {/* Info Links */}
          <div>
            <h5 className="text-xl font-semibold text-white mb-2">
              Info
            </h5>
            <ul className="space-y-1">
              {infoLinks.map((link, index) => (
                <li key={index}>
                  <HashLink
                    to={link.href}
                    className="block bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition duration-300"
                  >
                    {link.label}
                  </HashLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section: Social Media Buttons and Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8">
          <div className="text-gray-400 text-sm text-center md:text-left">
            <p>&copy; 2024 Castle Roofing. All Rights Reserved.</p>
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
