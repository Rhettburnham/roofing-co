import React, { useState, useEffect } from 'react';
import ServiceButton from './ServiceButton';

// Import images (adjust paths based on your project structure)
import rooferImage from '/assets/images/roofer.png';
import estimatorImage from '/assets/images/estimator.png';
import foremanImage from '/assets/images/foreman.png';
import salesrepImage from '/assets/images/salesrep.png';
import managerImage from '/assets/images/manager.png';
import inspectorImage from '/assets/images/inspector.png';

const employees = [
  { name: "Rob", role: "Roofer", image: rooferImage },
  { name: "Alice", role: "Roofing Foreman", image: estimatorImage },
  { name: "Frank", role: "Roofing Estimator", image: foremanImage },
  { name: "Diana", role: "Sales Representative", image: salesrepImage },
  { name: "Garret", role: "Project Manager", image: managerImage },
  { name: "Drew", role: "Roof Inspector", image: inspectorImage },
];

const useItemsToShow = () => {
  const [itemsToShow, setItemsToShow] = useState(4);

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth >= 700) {
        setItemsToShow(7);
      } else {
        setItemsToShow(4);
      }
    };

    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);

    return () => {
      window.removeEventListener('resize', updateItemsToShow);
    };
  }, []);

  return itemsToShow;
};

const Employees = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionDurationState, setTransitionDuration] = useState(0.5);
  const itemsToShow = useItemsToShow();
  const slideInterval = 2500;
  const transitionDuration = 0.5;

  const extendedEmployees = React.useMemo(() => {
    return employees.concat(employees.slice(0, itemsToShow));
  }, [itemsToShow]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [slideInterval]);

  useEffect(() => {
    if (currentIndex >= employees.length) {
      setTimeout(() => {
        setTransitionDuration(0);
        setCurrentIndex(0);
        setTimeout(() => {
          setTransitionDuration(transitionDuration);
        }, 50);
      }, transitionDuration * 1000);
    }
  }, [currentIndex, employees.length, transitionDuration]);

  return (
    <div className="relative employee-section flex flex-col items-center justify-center gap-2 px-6 mb-6 bg-gradient-to-b from-faint-color to-white overflow-hidden">

      <div className="w-full max-w-screen-lg mt-2">
        <div
          className="flex transition-transform"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
            transitionDuration: `${transitionDurationState}s`,
            transitionTimingFunction: 'cubic-bezier(0.65, 0, 0.35, 1)',
            width: `${(extendedEmployees.length * 100) / itemsToShow}%`,
          }}
        >
          {extendedEmployees.map((employee, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col items-center justify-start"
              style={{ width: `${100 / itemsToShow}%` }}
            >
              <div className="relative mb-4">
                <div className="bg-white  w-32 h-32 md:w-46 md:h-46 rounded-full overflow-hidden flex items-center justify-center custom-circle-shadow">
                  <img
                    src={employee.image}
                    alt={employee.name}
                    className=" h-auto object-cover"
                  />
                </div>
                <div className="flex flex-col items-center mt-2">
                  <p className="text-lg text-black font-semibold">{employee.name}</p>
                  <p className="text-sm font-semibold text-black">{employee.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full flex z-30 justify-center ">
        <ServiceButton />
        </div>
      </div>
    </div>
  );
};

export default Employees;
