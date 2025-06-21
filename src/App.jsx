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
  if (isEditRoute || !navbarConfig) return null;

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
 * AppContent Component - Renders the main application layout and routes
 *
 * This component handles fetching the primary configuration data and manages
 * the main layout, including the navbar and footer. It applies dynamic padding
 * to the content area to account for the fixed navbar height on public-facing
 * pages, ensuring content is not obscured.
 */
const AppContent = () => {
  const location = useLocation();
  const { config } = useConfig();
  const [navbarConfig, setNavbarConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let navConfig = null;
        // Prioritize navbar data from the global config context
        if (config && config.navbar) {
          navConfig = config.navbar;
        } else {
          // Fallback to fetching nav.json directly if not in global config
          console.debug("Navbar config not found in global context, fetching from nav.json");
          try {
            const navResponse = await fetch("/personal/old/jsons/nav.json");
            if (navResponse.ok) {
              navConfig = await navResponse.json();
            } else {
              console.error("Failed to fetch nav.json, status:", navResponse.status);
            }
          } catch (e) {
            console.error("Error fetching nav.json fallback:", e);
          }
        }
        setNavbarConfig(navConfig);

        // About page data is handled through ConfigContext, no separate fetch needed
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config]);

  const isEditRoute = useMemo(() => 
    location.pathname.includes("/edit/") || location.pathname === "/oneform",
    [location.pathname]
  );
  
  const contentStyle = useMemo(() => {
    if (isEditRoute || !navbarConfig?.navbarHeight?.unscrolled?.base) {
      return { paddingTop: '0' };
    }
    // On public pages, the hero block should have a negative margin to sit
    // behind the navbar. This padding pushes all content down, and the
    // hero's negative margin pulls it back up into the correct place.
    return { paddingTop: navbarConfig.navbarHeight.unscrolled.base };
  }, [isEditRoute, navbarConfig]);

  const memoizedRoutes = useMemo(() => {
    // Ensure config exists before trying to pass it down
    if (!config) return null;
    return <AppRoutes dedicatedAboutPageData={config.about_page} />;
  }, [config]);
  //   if (!config || !aboutPageData) return null; //from feature/development possible bug
  //   return <AppRoutes dedicatedAboutPageData={aboutPageData} />;
  // }, [config, aboutPageData]);

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
    <>
      <NavbarWrapper navbarConfig={navbarConfig} />
      <div style={contentStyle}>
        <Suspense fallback={<LoadingScreen />}>{memoizedRoutes}</Suspense>
      </div>
      <Footer />
    </>
  );
};

/**
 * App Component - Main application entry point
 *
 * This component sets up the application's core providers and routing.
 * It uses a ConfigProvider to supply configuration data throughout the app
 * and a Router to handle navigation.
 */
const App = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollRestoration />
      <AppContent />
    </Router>
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
