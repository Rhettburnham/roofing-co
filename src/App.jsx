
// App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation, // NEW: Import useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import About from "./components/About";

// --- Main Page Blocks ---
import HeroBlock from "./components/MainPageBlocks/HeroBlock";
import RichTextBlock from "./components/MainPageBlocks/RichTextBlock";
import ButtonBlock from "./components/MainPageBlocks/ButtonBlock";
import BasicMapBlock from "./components/MainPageBlocks/BasicMapBlock";
import BookingBlock from "./components/MainPageBlocks/BookingBlock";
import CombinedPageBlock from "./components/MainPageBlocks/CombinedPageBlock";
import BeforeAfterBlock from "./components/MainPageBlocks/BeforeAfterBlock";
import EmployeesBlock from "./components/MainPageBlocks/EmployeesBlock";

import ServicePage from "./components/ServicePage";



// --- Forms & Editors ---
import OneForm from "./components/OneForm";
import ServiceEditPage from "./components/ServiceEditPage"; // Import the new one-page editor




// import LoadingScreen from "./components/LoadingScreen";
import useScrollRestoration from "./components/usescrollrestoration";

function ScrollRestoration() {
  useScrollRestoration();
  return null;
}

// NEW: Create AppRoutes to wrap Routes with loader logic
const AppRoutes = ({
  heroConfig,
  richTextConfig,
  buttonconfig,
  mapConfig,
  bookingConfig,
  combinedPageCfg,
  beforeAfterConfig,
  employeesConfig,
}) => {
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    setShowLoader(true);
    const timer = setTimeout(() => setShowLoader(false), 600); // Adjust duration as needed
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <>
      {/* {showLoader && <LoadingScreen />} */}
      <Routes location={location} key={location.pathname}>
        {/* Home page (read-only blocks) */}
        <Route
          path="/"
          element={
            <>
              <section id="hero">
                <HeroBlock heroconfig={heroConfig} readOnly />
              </section>
              <section>
                <RichTextBlock richTextData={richTextConfig} readOnly />
              </section>
              <section>
                <ButtonBlock buttonconfig={buttonconfig} readOnly/>
              </section>
              <section id="map">
                <BasicMapBlock mapData={mapConfig} readOnly />
              </section>
              <section id="booking">
                <BookingBlock bookingData={bookingConfig} readOnly />
              </section>
              <section id="services">
                <CombinedPageBlock config={combinedPageCfg} readOnly />
              </section>
              <section>
                <BeforeAfterBlock beforeAfterData={beforeAfterConfig} readOnly />
              </section>
              <section>
                <EmployeesBlock employeesData={employeesConfig} readOnly />
              </section>
            </>
          }
        />

        {/* Other routes */}
        <Route path="/about" element={<About />} />
        <Route path="/oneform" element={<OneForm />} />
        <Route path="/service/:category/:id" element={<ServicePage />} />
        <Route path="/admin/service/edit" element={<ServiceEditPage />} />
      </Routes>
    </>
  );
};

const App = () => {
  // We now only fetch from combined_data.json
  const dataUrl = "/data/combined_data.json";

  const [pageData, setPageData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch the JSON on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(dataUrl);
        if (!res.ok) {
          throw new Error(`Failed to load ${dataUrl}`);
        }
        const data = await res.json();
        setPageData(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    fetchData();
  }, [dataUrl]);

  if (!pageData && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading main page data...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  // Extract blocks from pageData
  const heroConfig        = pageData.hero         || {};
  const richTextConfig    = pageData.richText     || {};
  const buttonconfig      = pageData.button       || {};
  const mapConfig         = pageData.map          || {};
  const bookingConfig     = pageData.booking      || {};
  const combinedPageCfg   = pageData.combinedPage || {};
  const beforeAfterConfig = pageData.beforeAfter  || {};
  const employeesConfig   = pageData.employees    || {};

  return (
    <Router>
      <ScrollRestoration />
      <Navbar />
      <main className="bg-white">
        {/* Replace your inline Routes with AppRoutes */}
        <AppRoutes
          heroConfig={heroConfig}
          richTextConfig={richTextConfig}
          buttonconfig={buttonconfig}
          mapConfig={mapConfig}
          bookingConfig={bookingConfig}
          combinedPageCfg={combinedPageCfg}
          beforeAfterConfig={beforeAfterConfig}
          employeesConfig={employeesConfig}
        />
      </main>
      <section id="footer">
        <Footer />
      </section>
    </Router>
  );
};

export default App;
