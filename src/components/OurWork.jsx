import React from 'react';
import { Link } from 'react-router-dom';
import { FaTint, FaTools, FaLeaf, FaWater, FaHome, FaExclamationTriangle } from 'react-icons/fa';

const Ourwork = () => {
  const buttons = [
    {
      to: '/saggingroofline',
      image: '/assets/images/Issues_button_img/sagging.jpg',
      text: 'Sagging Roofline',
      icon: <FaHome className="text-4xl text-blue-500" />,
    },
    {
      to: '/leakswaterdamage',
      image: '/assets/images/Issues_button_img/water_damage.jpg',
      text: 'Leaks, Water Damage',
      icon: <FaTint className="text-4xl text-blue-500" />,
    },
    {
      to: '/roofingmaterialdeterioration',
      image: '/assets/images/Issues_button_img/deteroration.jpg',
      text: 'Roofing Deterioration',
      icon: <FaTools className="text-4xl text-blue-500" />,
    },
    {
      to: '/moldalgaegrowth',
      image: '/assets/images/Issues_button_img/mold.jpg',
      text: 'Mold and Algae Growth',
      icon: <FaLeaf className="text-4xl text-blue-500" />,
    },
    {
      to: '/guttering',
      image: '/assets/images/Issues_button_img/clogged_gutters.jpg',
      text: 'Gutter Related',
      icon: <FaWater className="text-4xl text-blue-500" />,
    },
    {
      to: '/poorinstallation',
      image: '/assets/images/Issues_button_img/poor_installation.webp',
      text: 'Poor Installation',
      icon: <FaExclamationTriangle className="text-4xl text-blue-500" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {buttons.map((button, index) => (
        <Link to={button.to} key={index} className="w-full">
          <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105">
            <img
              src={button.image}
              alt={button.text}
              className="w-full h-40 object-cover"
            />
            <div className="p-4 flex items-center">
              {button.icon}
              <span className="ml-4 text-xl font-semibold text-gray-800">
                {button.text}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Ourwork;
