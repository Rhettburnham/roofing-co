// App.jsx - Main application component
// This application loads data from JSON files and allows for local editing
// of content. The edited content can be downloaded as JSON files and sent
// to the developer for permanent integration into the site.
import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingScreen from "./components/loadingScreen";
import ServicePage from "./components/ServicePage";

// Import the new ServicePageCreator and MainPageCreator components
const ServicePageCreator = lazy(() => import("./components/ServicePageCreator"));
const MainPageCreator = lazy(() => import("./components/MainPageCreator"));

// Lazy load components to improve initial load time
const OneForm = lazy(() => import("./components/OneForm"));
const ServiceEditPage = lazy(() => import("./components/ServiceEditPage"));
const LegalAgreement = lazy(() => import("./components/LegalAgreement"));

// --- Main Page Blocks (Imports might be removable if MainPageCreator handles them all) ---
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
const ServiceSliderBlock = lazy(
  () => import("./components/MainPageBlocks/ServiceSliderBlock")
);
const TestimonialBlock = lazy(
  () => import("./components/MainPageBlocks/TestimonialBlock")
);
const BeforeAfterBlock = lazy(
  () => import("./components/MainPageBlocks/BeforeAfterBlock")
);
const EmployeesBlock = lazy(
  () => import("./components/MainPageBlocks/EmployeesBlock")
);
const AboutBlock = lazy(() => import("./components/MainPageBlocks/AboutBlock"));

// Utility for restoring scroll position when navigating
import useScrollRestoration from "./components/usescrollrestoration";

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
 * AllServiceBlocksPage Component
 *
 * Special component that loads all service blocks from all_blocks_showcase.json
 * This is used for easy editing and previewing of all blocks in one place
 */
const AllServiceBlocksPage = (props) => {
  const [showcaseData, setShowcaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const response = await fetch("/data/all_blocks_showcase.json");
        if (!response.ok) throw new Error("Failed to fetch showcase data");

        const data = await response.json();
        setShowcaseData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading showcase data:", error);
        setLoading(false);
      }
    };

    fetchShowcaseData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return <ServicePage forcedServiceData={showcaseData} {...props} />;
};

/**
 * NavbarWrapper Component
 *
 * Conditionally renders the Navbar based on the current route
 * Hides the navbar on edit routes and OneForm
 */
const NavbarWrapper = ({ navbarConfig }) => {
  const location = useLocation();
  const isEditRoute = location.pathname.includes('/edit/') || location.pathname === '/oneform';
  
  // Don't render navbar on edit routes
  if (isEditRoute) return null;
  
  return <Navbar config={navbarConfig} />;
};

NavbarWrapper.propTypes = {
  navbarConfig: PropTypes.object,
};

/**
 * AppRoutes Component
 *
 * Defines the routing structure for the application
 * Receives configuration data for all main page blocks
 * and passes it to the appropriate components
 *
 * This component is responsible for rendering:
 * - The main page with all its blocks (now handled by MainPageCreator)
 * - Individual service pages
 * - The service editor page
 * - The OneForm editor for individual blocks
 */
const AppRoutes = ({ 
  aboutPageConfig,
  heroConfig,
  richTextConfig,
  buttonconfig,
  mapConfig,
  bookingConfig,
  serviceSliderConfig,
  testimonialsConfig,
  beforeAfterConfig,
  employeesConfig,
}) => {
  return (
    <Routes>
      {/* Main page route - now uses MainPageCreator */}
      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <MainPageCreator />
          </Suspense>
        }
      />

      {/* About Page */}
      <Route
        path="/about"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <AboutBlock readOnly aboutData={aboutPageConfig} />
          </Suspense>
        }
      />

      {/* All Service Blocks Page route */}
      <Route
        path="/all-service-blocks"
        element={<AllServiceBlocksPage />}
      />

      {/* Route for displaying individual service pages */}
      <Route
        path="/service/:serviceType/:slug"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ServicePage />
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
        path="/edit/about"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              initialData={aboutPageConfig}
              blockName="aboutPage"
              title="About Page Editor"
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
        path="/edit/serviceSlider"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              initialData={serviceSliderConfig}
              blockName="serviceSlider"
              title="Service Slider Block Editor"
            />
          </Suspense>
        }
      />
      <Route
        path="/edit/testimonials"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              initialData={testimonialsConfig}
              blockName="testimonials"
              title="Testimonial Block Editor"
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

      {/* Route for the service page editor/creator (ServicePageCreator fetches its own data) */}
      <Route
        path="/service-editor"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ServicePageCreator />
          </Suspense>
        }
      />
      
      {/* New route for editing service pages by ID, if needed */}
      <Route 
        path="/edit/service/:serviceType/:serviceId"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <div>Service Page Specific Editor (Placeholder)</div>
          </Suspense>
        }
      />
    </Routes>
  );
};

AppRoutes.propTypes = {
  aboutPageConfig: PropTypes.object,
  heroConfig: PropTypes.object,
  richTextConfig: PropTypes.object,
  buttonconfig: PropTypes.object,
  mapConfig: PropTypes.object,
  bookingConfig: PropTypes.object,
  serviceSliderConfig: PropTypes.object,
  testimonialsConfig: PropTypes.object,
  beforeAfterConfig: PropTypes.object,
  employeesConfig: PropTypes.object,
};

/**
 * App Component - Main application entry point
 *
 * This component:
 * 1. Fetches the combined_data.json file containing configuration for all main page blocks and navbar
 * 2. Extracts configuration for navbar and about page (if needed separately)
 * 3. Sets up the router with all application routes
 *
 * The application uses three main JSON files:
 * - combined_data.json: Configuration for the main page blocks and navbar
 * - services.json: Configuration for all service pages
 * - about_page.json: Configuration for the about page (loaded separately or part of combined_data)
 *
 * The application allows for local editing of these JSON files through
 * dedicated editor interfaces. The edited content can be downloaded and
 * sent to the developer for permanent integration into the site.
 */
const App = () => {
  const [loading, setLoading] = useState(true);
  const [siteData, setSiteData] = useState(null);
  const [aboutPageData, setAboutPageData] = useState(null);
  const dataUrl = "/data/raw_data/step_4/combined_data.json";
  const aboutDataUrl = "/data/raw_data/step_3/about_page.json";

  // Fetch the combined_data.json (for navbar, and potentially About page if not separate)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch site-wide content (combined_data.json)");
        }
        const data = await response.json();
        setSiteData(data);
        console.log("App.jsx fetched combined_data:", data);

        // Fetch and parse the about_page.json file (optional, could be part of combined_data)
        // If you decide to manage about page content within combined_data.json, this can be simplified.
        try {
          const aboutResponse = await fetch(aboutDataUrl);
          if (aboutResponse.ok) {
            const aboutData = await aboutResponse.json();
            setAboutPageData(aboutData);
          } else {
            // Fallback: if about_page.json doesn't exist, look for aboutPage in combined_data
            // Or, if AboutBlock is now just another block in mainPageBlocks, this separate fetch might not be needed.
            setAboutPageData(data.aboutPage || {});
            console.warn("About page data (about_page.json) not found, using fallback from combined_data or default.");
          }
        } catch (aboutError) {
          console.error("Error loading separate about page data:", aboutError);
          setAboutPageData(data.aboutPage || {});
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading site data in App.jsx:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [dataUrl, aboutDataUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading site configuration...</p>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Site data not available. Please check configuration.</p>
      </div>
    );
  }

  // Extract navbarConfig from siteData
  const navbarConfig = siteData.navbar;
  
  // Extract configs for OneForm. These might still be needed if OneForm doesn't fetch its own initial data.
  // This part needs review based on how OneForm gets its `initialData`.
  // If OneForm fetches based on `blockName`, these might not be needed here.
  const heroConfig = siteData.mainPageBlocks?.find(b => b.blockName === 'HeroBlock')?.config;
  const richTextConfig = siteData.mainPageBlocks?.find(b => b.blockName === 'RichTextBlock')?.config;
  const buttonconfig = siteData.mainPageBlocks?.find(b => b.blockName === 'ButtonBlock')?.config;
  const mapConfig = siteData.mainPageBlocks?.find(b => b.blockName === 'BasicMapBlock')?.config;
  const bookingConfig = siteData.mainPageBlocks?.find(b => b.blockName === 'BookingBlock')?.config;
  const serviceSliderConfig = siteData.mainPageBlocks?.find(b => b.blockName === 'ServiceSliderBlock')?.config;
  const testimonialsConfig = siteData.mainPageBlocks?.find(b => b.blockName === 'TestimonialBlock')?.config;
  const beforeAfterConfig = siteData.mainPageBlocks?.find(b => b.blockName === 'BeforeAfterBlock')?.config;
  const employeesConfig = siteData.mainPageBlocks?.find(b => b.blockName === 'EmployeesBlock')?.config;
  
  // Use separately loaded about page data or a config from siteData if available
  const aboutPageConfigForRoutes = aboutPageData || siteData.mainPageBlocks?.find(b => b.blockName === 'AboutBlock')?.config || {};

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ScrollRestoration />
      <NavbarWrapper navbarConfig={navbarConfig} />
      <main className="bg-white">
        <AppRoutes
          aboutPageConfig={aboutPageConfigForRoutes}
          heroConfig={heroConfig}
          richTextConfig={richTextConfig}
          buttonconfig={buttonconfig}
          mapConfig={mapConfig}
          bookingConfig={bookingConfig}
          serviceSliderConfig={serviceSliderConfig}
          testimonialsConfig={testimonialsConfig}
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
