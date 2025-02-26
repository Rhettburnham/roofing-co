
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
import Inspection from "./components/Inspection";
import RoofCoating from "./components/RoofCoating";
import GutterRelated from "./components/GutterRelated";
import ShingleInstallation from "./components/ShingleInstallation";
import RoofVentilationInstallation from "./components/RoofVentilationInstallation";
import MergedRoofingInfoPage from "./components/MergedRoofingInfoPage";

// --- Main Page Blocks ---
import HeroBlock from "./components/MainPageBlocks/HeroBlock";
import RichTextBlock from "./components/MainPageBlocks/RichTextBlock";
import ButtonBlock from "./components/MainPageBlocks/ButtonBlock";
import BasicMapBlock from "./components/MainPageBlocks/BasicMapBlock";
import BookingBlock from "./components/MainPageBlocks/BookingBlock";
import CombinedPageBlock from "./components/MainPageBlocks/CombinedPageBlock";
import BeforeAfterBlock from "./components/MainPageBlocks/BeforeAfterBlock";
import EmployeesBlock from "./components/MainPageBlocks/EmployeesBlock";

import ChimneyCapsService from "./components/ChimneyCapsService";
import ConcreteWorkService from "./components/ConcreteWorkService";
import DecksService from "./components/DecksService";
import UnderDeckWaterproofService from "./components/UnderDeckWaterproofService";
import ExteriorPaintService from "./components/ExteriorPaintService";

import ServicePage from "./components/ServicePage";
import OneForm from "./components/OneForm";

// --- Forms & Editors ---
import ParentForm from "./components/ParentForm";
import ServiceEditPage from "./components/ServiceEditPage"; // Import the new one-page editor

import Residential_service_1 from "./components/Services/residential/residential_service_1";
import Residential_service_2 from "./components/Services/residential/Residential_service_2";
import Residential_service_3 from "./components/Services/residential/Residential_service_3";
import Residential_service_4 from "./components/Services/residential/Residential_service_4";
import CommercialService1 from "./components/Services/commercial/commercial_service_1";
import CommercialService2 from "./components/Services/commercial/commercial_service_2";
import CommercialService3 from "./components/Services/commercial/commercial_service_3";
import CommercialService4 from "./components/Services/commercial/commercial_service_4";

import Hero from "./components/Test";
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
        <Route
          path="/Residential_service_1"
          element={<Residential_service_1 />}
        />
        <Route
          path="/Residential_service_2"
          element={<Residential_service_2 />}
        />
        <Route
          path="/Residential_service_3"
          element={<Residential_service_3 />}
        />
        <Route
          path="/Residential_service_4"
          element={<Residential_service_4 />}
        />
        <Route path="/CommercialService1" element={<CommercialService1 />} />
        <Route path="/CommercialService2" element={<CommercialService2 />} />
        <Route path="/CommercialService3" element={<CommercialService3 />} />
        <Route path="/CommercialService4" element={<CommercialService4 />} />
        <Route path="/inspection" element={<Inspection />} />
        <Route path="/roofcoating" element={<RoofCoating />} />
        <Route path="/oneform" element={<OneForm />} />
        <Route path="/gutterrelated" element={<GutterRelated />} />
        <Route path="/shingleinstallation" element={<ShingleInstallation />} />
        <Route
          path="/ventilation"
          element={<RoofVentilationInstallation />}
        />
        <Route
          path="/mergedroofinginfopage"
          element={<MergedRoofingInfoPage />}
        />
        <Route path="/chimney-caps" element={<ChimneyCapsService />} />
        <Route path="/concrete-work" element={<ConcreteWorkService />} />
        <Route path="/decks" element={<DecksService />} />
        <Route
          path="/underdeck"
          element={<UnderDeckWaterproofService />}
        />
        <Route path="/exterior-paint" element={<ExteriorPaintService />} />
        <Route path="/service/:category/:id" element={<ServicePage />} />
        <Route path="/update-form" element={<ParentForm />} />
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
