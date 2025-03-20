// App.jsx - Main application component
// This application loads data from JSON files and allows for local editing
// of content. The edited content can be downloaded as JSON files and sent
// to the developer for permanent integration into the site.
import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Process from "./components/Process";

// Lazy load components to improve initial load time
const About = lazy(() => import("./components/About"));
const OneForm = lazy(() => import("./components/OneForm"));
const ServiceEditPage = lazy(() => import("./components/ServiceEditPage"));
const ServicePage = lazy(() => import("./components/ServicePage"));

// --- Main Page Blocks ---
// These components render different sections of the main page
// Each loads data from the combined_data.json file
const HeroBlock = lazy(() => import("./components/MainPageBlocks/HeroBlock"));
const RichTextBlock = lazy(
  () => import("./components/MainPageBlocks/RichTextBlock")
);
const ButtonBlock = lazy(
  () => import("./components/MainPageBlocks/ButtonBlock")
);
const BasicMapBlock = lazy(
  () => import("./components/MainPageBlocks/BasicMapBlock")
);
const BookingBlock = lazy(
  () => import("./components/MainPageBlocks/BookingBlock")
);
const CombinedPageBlock = lazy(
  () => import("./components/MainPageBlocks/CombinedPageBlock")
);
const BeforeAfterBlock = lazy(
  () => import("./components/MainPageBlocks/BeforeAfterBlock")
);
const EmployeesBlock = lazy(
  () => import("./components/MainPageBlocks/EmployeesBlock")
);

// Import the loading screen component
import LoadingScreen from "./components/loadingScreen";

// Utility for restoring scroll position when navigating
import useScrollRestoration from "./components/usescrollrestoration";

import LegalAgreement from "./components/LegalAgreement";

/**
 * ScrollRestoration Component
 *
 * Restores scroll position when navigating between pages
 * This improves user experience by maintaining context when moving
 * between different sections of the site
 */
function ScrollRestoration() {
  useScrollRestoration();
  return null;
}

/**
 * AppRoutes Component
 *
 * Defines the routing structure for the application
 * Receives configuration data for all main page blocks
 * and passes it to the appropriate components
 *
 * This component is responsible for rendering:
 * - The main page with all its blocks
 * - Individual service pages
 * - The service editor page
 * - The OneForm editor for individual blocks
 */
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

  return (
    <Routes>
      {/* Main page route */}
      <Route
        path="/"
        element={
          <>
            <section id="hero">
              <Suspense fallback={<LoadingScreen />}>
                <HeroBlock readOnly heroconfig={heroConfig} />
              </Suspense>
            </section>
            <section id="process">
              <Process />
            </section>
            <section id="richtext">
              <Suspense fallback={<LoadingScreen />}>
                <RichTextBlock readOnly richTextData={richTextConfig} />
              </Suspense>
            </section>
            <section id="button">
              <Suspense fallback={<LoadingScreen />}>
                <ButtonBlock readOnly buttonconfig={buttonconfig} />
              </Suspense>
            </section>
            <section id="map">
              <Suspense fallback={<LoadingScreen />}>
                <BasicMapBlock readOnly mapData={mapConfig} />
              </Suspense>
            </section>
            <section id="booking">
              <Suspense fallback={<LoadingScreen />}>
                <BookingBlock readOnly bookingData={bookingConfig} />
              </Suspense>
            </section>
            <section id="combinedPage">
              <Suspense fallback={<LoadingScreen />}>
                <CombinedPageBlock readOnly config={combinedPageCfg} />
              </Suspense>
            </section>
            <section id="beforeAfter">
              <Suspense fallback={<LoadingScreen />}>
                <BeforeAfterBlock
                  readOnly
                  beforeAfterData={beforeAfterConfig}
                />
              </Suspense>
            </section>
            <section id="employees">
              <Suspense fallback={<LoadingScreen />}>
                <EmployeesBlock readOnly employeesData={employeesConfig} />
              </Suspense>
            </section>
          </>
        }
      />

      {/* Service page routes */}
      <Route
        path="/services/:serviceSlug"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ServicePage />
          </Suspense>
        }
      />

      {/* Fallback for older service paths */}
      <Route
        path="/service/:category/:id"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ServicePage />
          </Suspense>
        }
      />

      {/* Fallback for Residential_service_X old format */}
      <Route
        path="/Residential_service_:id"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ServicePage />
          </Suspense>
        }
      />

      {/* Fallback for Commercial_service_X old format */}
      <Route
        path="/Commercial_service_:id"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ServicePage />
          </Suspense>
        }
      />

      {/* About page route */}
      <Route
        path="/about"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <About />
          </Suspense>
        }
      />

      {/* Main OneForm editor route */}
      <Route
        path="/oneform"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm />
          </Suspense>
        }
      />

      {/* Editor routes */}
      <Route
        path="/edit/services"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ServiceEditPage />
          </Suspense>
        }
      />

      {/* Rest of editor routes with Suspense */}
      <Route
        path="/edit/hero"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              initialData={heroConfig}
              blockName="hero"
              title="Hero Block Editor"
            />
          </Suspense>
        }
      />
      <Route
        path="/edit/richtext"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              initialData={richTextConfig}
              blockName="richText"
              title="Rich Text Block Editor"
            />
          </Suspense>
        }
      />
      <Route
        path="/edit/button"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              initialData={buttonconfig}
              blockName="button"
              title="Button Block Editor"
            />
          </Suspense>
        }
      />
      <Route
        path="/edit/map"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              initialData={mapConfig}
              blockName="map"
              title="Map Block Editor"
            />
          </Suspense>
        }
      />
      <Route
        path="/edit/booking"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              initialData={bookingConfig}
              blockName="booking"
              title="Booking Block Editor"
            />
          </Suspense>
        }
      />
      <Route
        path="/edit/combinedPage"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              initialData={combinedPageCfg}
              blockName="combinedPage"
              title="Combined Page Block Editor"
            />
          </Suspense>
        }
      />
      <Route
        path="/edit/beforeAfter"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              initialData={beforeAfterConfig}
              blockName="beforeAfter"
              title="Before/After Block Editor"
            />
          </Suspense>
        }
      />
      <Route
        path="/edit/employees"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              initialData={employeesConfig}
              blockName="employees"
              title="Employees Block Editor"
            />
          </Suspense>
        }
      />

      {/* Legal Agreement route */}
      <Route path="/legal" element={<LegalAgreement />} />
    </Routes>
  );
};

/**
 * App Component - Main application entry point
 *
 * This component:
 * 1. Fetches the combined_data.json file containing configuration for all main page blocks
 * 2. Extracts configuration for each block
 * 3. Sets up the router with all application routes
 *
 * The application uses two main JSON files:
 * - combined_data.json: Configuration for the main page blocks
 * - services.json: Configuration for all service pages
 *
 * The application allows for local editing of these JSON files through
 * dedicated editor interfaces. The edited content can be downloaded and
 * sent to the developer for permanent integration into the site.
 */
const App = () => {
  const [pageData, setPageData] = useState(null);
  const dataUrl = "/data/combined_data.json";

  // Fetch the combined_data.json file on component mount
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(dataUrl);
      const data = await res.json();
      setPageData(data);
    };
    fetchData();
  }, [dataUrl]);

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading main page data...</p>
      </div>
    );
  }

  // Extract blocks from pageData
  const heroConfig = pageData.hero;
  const richTextConfig = pageData.richText;
  const buttonconfig = pageData.button;
  const mapConfig = pageData.map;
  const bookingConfig = pageData.booking;
  const combinedPageCfg = pageData.combinedPage;
  const beforeAfterConfig = pageData.beforeAfter;
  const employeesConfig = pageData.employees;

  return (
    <Router>
      <ScrollRestoration />
      <Navbar />
      <main className="bg-white">
        {/* Pass all block configurations to AppRoutes */}
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
