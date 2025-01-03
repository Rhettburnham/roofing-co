import React, { useState, useEffect } from 'react';
import { FaUsers, FaCalendarAlt, FaHandshake, FaHome } from 'react-icons/fa'; // Importing icons from Font Awesome

const StatsSection = () => {
  const statsData = [
    {
      title: 'Employees',
      value: 25,
      icon: <FaUsers className="w-full h-full" />,
    },
    {
      title: 'Years of Service',
      value: 10,
      icon: <FaCalendarAlt className="w-full h-full" />,
    },
    {
      title: 'Customers Served',
      value: 500,
      icon: <FaHandshake className="w-full h-full" />,
    },
    {
      title: 'Roofs Repaired',
      value: 300,
      icon: <FaHome className="w-full h-full" />,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
      {statsData.map((item, idx) => (
        <StatItem key={idx} icon={item.icon} title={item.title} value={item.value} />
      ))}
    </div>
  );
};

const StatItem = ({ icon, title, value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startValue = 0;
    let startTime = Date.now();
    const duration = 2000;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(progress * (value - startValue) + startValue);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 text-dark_button flex-shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-semibold">{count}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};

export default StatsSection;
