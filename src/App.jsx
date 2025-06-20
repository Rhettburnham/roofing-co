// App.jsx - Main application component
// This application loads data from JSON files and allows for local editing
// of content. The edited content can be downloaded as JSON files and sent
// to the developer for permanent integration into the site.
import { useState, useEffect, lazy, Suspense, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Link,
} from "react-router-dom";
import PropTypes from "prop-types";
import { ConfigProvider, useConfig } from "./context/ConfigContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingScreen from "./components/loadingScreen";

import ServicePage from "./components/ServicePage";
import LoginPage from "./components/auth/LoginPage";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import PrivacyPolicy from "./components/legal/PrivacyPolicy";
import TermsOfService from "./components/legal/TermsOfService";
import AdminPage from "./pages/AdminPage";
import WorkerPage from "./components/WorkerPage";
import InitialPayment from "./pages/InitialPayment";
import PaymentSuccess from "./pages/PaymentSuccess";
import ViewPlan from "./pages/ViewPlan";

// Removed direct import of ServicePage, ServicePageCreator will be used.
// import ServicePage from "./components/ServicePage";

// Import the new ServicePageCreator and MainPageCreator components
const ServicePageCreator = lazy(
  () => import("./components/ServicePageCreator")
);
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
 * NOTE: This might need an update if ServicePageCreator is the sole consumer of service data.
 * For now, keeping its logic as it uses a different JSON source.
 */
const AllServiceBlocksPage = (props) => {
  const [showcaseData, setShowcaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShowcaseData = async () => {
      try {
        const response = await fetch(
          "/personal/old/jsons/all_blocks_showcase.json"
        );
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
  // If AllServiceBlocksPage is meant to use the new ServicePageCreator logic,
  // it would need to be adapted or this component might be deprecated.
  // For now, assuming it shows blocks in a generic way, not tied to services.json pages.
  // If it does need to render actual *service pages* from showcaseData, it will need adjustment.
  // Let's assume it just displays blocks directly for now.
  // If ServicePage expects certain URL params, this might break.
  // It might be better to have AllServiceBlocksPage render blocks directly
  // without using ServicePage or ServicePageCreator for this showcase.
  // For simplicity, and if it's just a raw block viewer, it might not need `ServicePage` wrapper.
  // We will render ServicePageCreator directly to show its capabilities if forcedServiceData is provided.
  return (
    <Suspense fallback={<LoadingScreen />}>
      {/* This is a placeholder. How showcaseData is structured and consumed by ServicePageCreator would need review. 
          If showcaseData is a single service page structure, it might work. 
          If it's a list of blocks directly, ServicePageCreator won't work without adaptation. 
          Let's assume for now it can handle a direct data structure for a single page for the showcase.*/}
      <ServicePageCreator
        forcedServiceDataForShowcase={showcaseData}
        {...props}
      />
    </Suspense>
  );
  // Original implementation for reference if the above is problematic:
  // return <ServicePage forcedServiceData={showcaseData} {...props} />;
};

/**
 * NavbarWrapper Component
 *
 * Conditionally renders the Navbar based on the current route
 * Hides the navbar on edit routes and OneForm
 */
const NavbarWrapper = ({ navbarConfig }) => {
  const location = useLocation();
  const isEditRoute =
    location.pathname.includes("/edit/") || location.pathname === "/oneform";

  // Don't render navbar on edit routes
  if (isEditRoute) return null;

  // Extract the new configuration options from navbarConfig
  const navbarProps = {
    config: navbarConfig,
    // Animation settings
    naturalOffsetVh: navbarConfig?.animation?.naturalOffsetVh,
    slideUpDistanceVh: navbarConfig?.animation?.slideUpDistanceVh,
    logoSizeUnscrolled: navbarConfig?.animation?.logoSizeUnscrolled,
    logoSizeScrolled: navbarConfig?.animation?.logoSizeScrolled,
    // Text and layout settings
    textSizes: navbarConfig?.textSizes,
    logoTextDistance: navbarConfig?.logoTextDistance,
    navbarHeight: navbarConfig?.navbarHeight,
    invertLogoColor: navbarConfig?.invertLogoColor,
  };

  return <Navbar {...navbarProps} />;
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
  dedicatedAboutPageData,
  // heroConfig, // No longer passed directly, MainPageCreator handles its data
  // richTextConfig,
  // buttonconfig,
  // mapConfig,
  // bookingConfig,
  // serviceSliderConfig,
  // testimonialsConfig,
  // beforeAfterConfig,
  // employeesConfig,
}) => {
  return (
    <Routes>
      {/* Login route */}
      <Route
        path="/login"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <LoginPage />
          </Suspense>
        }
      />

      {/* Password reset routes */}
      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ForgotPassword />
          </Suspense>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ResetPassword />
          </Suspense>
        }
      />

      {/* Main page route */}

      <Route
        path="/"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <MainPageCreator />
          </Suspense>
        }
      />

      <Route
        path="/about"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <AboutBlock readOnly aboutData={dedicatedAboutPageData} />
          </Suspense>
        }
      />

      <Route path="/all-service-blocks" element={<AllServiceBlocksPage />} />

      {/* Updated route for displaying individual service pages using ServicePageCreator */}
      <Route
        path="/services/:serviceType/:serviceName"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ServicePageCreator />
          </Suspense>
        }
      />

      {/* Legal Pages */}
      <Route
        path="/privacy-policy"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <PrivacyPolicy />
          </Suspense>
        }
      />
      <Route
        path="/terms-of-service"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <TermsOfService />
          </Suspense>
        }
      />
      <Route
        path="/legal/:agreementType"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <LegalAgreement />
          </Suspense>
        }
      />

      {/* Main OneForm editor route (for entire main page config) */}
      <Route
        path="/oneform"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm />
          </Suspense>
        }
      />

      {/* Editor route for service pages */}
      <Route
        path="/edit/services"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ServiceEditPage />
          </Suspense>
        }
      />

      {/* Individual Block Editors - These might be deprecated if OneForm handles all main page editing */}
      {/* If these are still needed, ensure they receive correct props or fetch their own data */}
      <Route
        path="/edit/hero"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm blockKeyToEdit="hero" title="Hero Block Editor" />
          </Suspense>
        }
      />
      <Route
        path="/edit/about"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm blockKeyToEdit="aboutPage" title="About Page Editor" />
          </Suspense>
        }
      />
      <Route
        path="/edit/richtext"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm blockKeyToEdit="richText" title="Rich Text Block Editor" />
          </Suspense>
        }
      />
      <Route
        path="/edit/button"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm blockKeyToEdit="button" title="Button Block Editor" />
          </Suspense>
        }
      />
      <Route
        path="/edit/map"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm blockKeyToEdit="map" title="Map Block Editor" />
          </Suspense>
        }
      />
      <Route
        path="/edit/booking"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm blockKeyToEdit="booking" title="Booking Block Editor" />
          </Suspense>
        }
      />
      <Route
        path="/edit/serviceslider"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              blockKeyToEdit="serviceSlider"
              title="Service Slider Editor"
            />
          </Suspense>
        }
      />
      <Route
        path="/edit/testimonials"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              blockKeyToEdit="testimonials"
              title="Testimonials Editor"
            />
          </Suspense>
        }
      />
      <Route
        path="/edit/beforeafter"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              blockKeyToEdit="beforeAfter"
              title="Before & After Editor"
            />
          </Suspense>
        }
      />
      <Route
        path="/edit/employees"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <OneForm
              blockKeyToEdit="employees"
              title="Employees Block Editor"
            />
          </Suspense>
        }
      />

      {/* Admin route */}
      <Route path="/admin" element={<AdminPage />} />

      {/* Worker Page route */}
      <Route path="/worker" element={<WorkerPage />} />

      {/* Initial Payment route */}
      <Route
        path="/initial-payment"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <InitialPayment />
          </Suspense>
        }
      />

      {/* Payment Success route */}
      <Route
        path="/payment-success"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <PaymentSuccess />
          </Suspense>
        }
      />

      {/* View Plan route */}
      <Route
        path="/view-plan"
        element={
          <Suspense fallback={<LoadingScreen />}>
            <ViewPlan />
          </Suspense>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

// Define PropTypes for AppRoutes if any props are still expected
AppRoutes.propTypes = {
  dedicatedAboutPageData: PropTypes.object,
  // Other configs removed as MainPageCreator should handle them
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
  const [navbarConfig, setNavbarConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { config } = useConfig();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use config from ConfigContext for navbar
        if (config && config.navbar) {
          setNavbarConfig(config.navbar);
        } else {
          console.warn("Navbar configuration not found in config, proceeding with no navbar config.");
          setNavbarConfig(null);
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (config) {
      fetchData();
    }
  }, [config]);

  // Moved useMemo to be called unconditionally before conditional returns
  const memoizedRoutes = useMemo(() => {
    // Ensure config exists before trying to pass it down
    if (!config) return null;
    return <AppRoutes dedicatedAboutPageData={config.about_page} />;
  }, [config]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error loading application data: {error}
      </div>
    );
  }

  // Check for config after loading and error handling, but before using memoizedRoutes
  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Configuration data is missing or failed to load correctly.
      </div>
    );
  }

  if (!memoizedRoutes) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Routes could not be prepared. Configuration might be incomplete.
      </div>
    );
  }

  return (
    <ConfigProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ScrollRestoration />
        <NavbarWrapper navbarConfig={navbarConfig} />
        <div className="pt-0">
          <Suspense fallback={<LoadingScreen />}>{memoizedRoutes}</Suspense>
        </div>
        <Footer />
      </Router>
    </ConfigProvider>
  );
};

// Fallback component for routes not found
const NotFoundPage = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Sorry, the page you are looking for (<code>{location.pathname}</code>)
        does not exist.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue text-white rounded-md text-lg hover:bg-blue-700 transition"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default App;
