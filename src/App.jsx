import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import useScrollRestoration from './components/usescrollrestoration'; // Import the custom hook
import Testimonials from './components/Testimonials';
import BasicMap from './components/BasicMap'; // Import the Map component
import Booking from './components/Booking';
import Footer from './components/Footer';
import Employees from './components/Employees';
import About from './components/About'; // Import your new About component
import Diagnose from './components/Diagnose';
import RoofRepair from './components/RoofRepair';
import Inspection from './components/Inspection';
import RoofMaintenance from './components/RoofMaintenance';
import AsphaltShingleInstallation from './components/AsphaltShingleInstallation';
import RoofCoating from './components/RoofCoating';
import SaggingRoofLine from './components/SaggingRoofLine';
import LeaksWaterDamage from './components/LeaksWaterDamage';
import RoofingMaterialDeterioration from './components/RoofingMaterialDeterioration';
import MoldAlgaeGrowth from './components/MoldAlgaeGrowth';
import GutterRelated from './components/GutterRelated';
import PoorInstallation from './components/PoorInstallation';
import Guttering from './components/Guttering';
import ShingleInstallation from './components/ShingleInstallation';
import RoofVentilationInstallation from './components/RoofVentilationInstallation';
import CombinedComponent from './components/CombinedComponent';
import ServiceIssue from './components/ServiceIssue';
import Services from './components/Services';
import Packages from './components/Packages';
import Aboutbutton from './components/About_button';
import Process from "./components/Process"; 
import MainImg from './components/MainImg';
import BeforeAfter from "./components/BeforeAfter";

const App = () => {
  return (
    <Router>
      <ScrollRestoration /> {/* Use the custom hook inside a component */}
      <main className="bg-white">
        <Navbar /> {/* Navbar stays visible on all pages */}
        <Routes>
          {/* Main home page route */}
          <Route
            path="/"
            element={
              <>
                <section id="model">
                  <CombinedComponent />
                </section>
                <section id="map">
                  <BasicMap />
                </section>
                <section id="process">
                  <Process />
                </section>
                <section id="about">
                  <Aboutbutton />
                </section>
                <section id="book">
                  <Booking />
                </section>
                <section id="packages">
                  <Packages />
                </section>
                <section id="main-image">
                  <MainImg />
                </section>
                <section id="">
                  <BeforeAfter />
                </section>
                <section id="testimonials">
                  <Testimonials />
                </section>
                <section id="employees">
                  <Employees />
                </section>
                {/* <section id ="">
                  <ServiceIssue />
                </section> */}
              </>
            }
          />
          {/* Other routes */}
          <Route path="/about" element={<About />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/diagnose" element={<Diagnose />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/roofmaintenance" element={<RoofMaintenance />} />
          <Route path="/roofrepair" element={<RoofRepair />} />
          <Route
            path="/asphaltshingleinstallation"
            element={<AsphaltShingleInstallation />}
          />
          <Route path="/roofcoating" element={<RoofCoating />} />
          <Route path="/saggingroofline" element={<SaggingRoofLine />} />
          <Route path="/leakswaterdamage" element={<LeaksWaterDamage />} />
          <Route
            path="/roofingmaterialdeterioration"
            element={<RoofingMaterialDeterioration />}
          />
          <Route path="/moldalgaegrowth" element={<MoldAlgaeGrowth />} />
          <Route path="/gutterrelated" element={<GutterRelated />} />
          <Route path="/poorinstallation" element={<PoorInstallation />} />
          <Route path="/guttering" element={<Guttering />} />
          <Route path="/shingleinstallation" element={<ShingleInstallation />} />
          <Route path="/ventilation" element={<RoofVentilationInstallation />} />
          <Route path="/services" element={<Services />} />
          <Route path="/packages" element={<ServiceIssue />} />
        </Routes>
      </main>
      <section id="footer">
        <Footer />
      </section>
    </Router>
  );
};

export default App;

// Create a component to use the custom hook inside Router
function ScrollRestoration() {
  // useScrollRestoration();
  // return null; // This component doesn't render anything
}
