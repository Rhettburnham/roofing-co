import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useRef,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import BasicMapBlock from "./MainPageBlocks/BasicMapBlock";
import RichTextBlock from "./MainPageBlocks/RichTextBlock";
import HeroBlock from "./MainPageBlocks/HeroBlock";
import BeforeAfterBlock from "./MainPageBlocks/BeforeAfterBlock";
import EmployeesBlock from "./MainPageBlocks/EmployeesBlock";
import ButtonBlock from "./MainPageBlocks/ButtonBlock";
import BookingBlock from "./MainPageBlocks/BookingBlock";
import CombinedPageBlock from "./MainPageBlocks/CombinedPageBlock";
import ServiceSliderBlock from "./MainPageBlocks/ServiceSliderBlock";
import TestimonialBlock from "./MainPageBlocks/TestimonialBlock";
import TopStickyEditPanel from "./TopStickyEditPanel";
import ThemeColorPicker from "./common/ThemeColorPicker";
import PanelStylingController from "./common/PanelStylingController";
import PanelImagesController from "./common/PanelImagesController";
import Navbar from "./Navbar";
import IconSelectorModal from "./common/IconSelectorModal";

// Lazy load components to avoid circular dependencies if any, and for consistency
const BasicMapBlockLazy = lazy(() => import("./MainPageBlocks/BasicMapBlock"));
const RichTextBlockLazy = lazy(() => import("./MainPageBlocks/RichTextBlock"));
const HeroBlockLazy = lazy(() => import("./MainPageBlocks/HeroBlock"));
const BeforeAfterBlockLazy = lazy(
  () => import("./MainPageBlocks/BeforeAfterBlock")
);
const EmployeesBlockLazy = lazy(
  () => import("./MainPageBlocks/EmployeesBlock")
);
const ButtonBlockLazy = lazy(() => import("./MainPageBlocks/ButtonBlock"));
const BookingBlockLazy = lazy(() => import("./MainPageBlocks/BookingBlock"));
const ServiceSliderBlockLazy = lazy(
  () => import("./MainPageBlocks/ServiceSliderBlock")
);
const TestimonialBlockLazy = lazy(
  () => import("./MainPageBlocks/TestimonialBlock")
);
const NavbarLazy = lazy(() => import("./Navbar")); // For Navbar preview

// Mapping block names to components for dynamic rendering
const blockComponentMap = {
  HeroBlock: HeroBlockLazy,
  ButtonBlock,
  RichTextBlock,
  EmployeesBlock,
  BasicMapBlock,
  ServiceSliderBlock,
  TestimonialBlock,
  BeforeAfterBlock,
  BookingBlock,
  // Add other main page blocks here if any
};

// Helper for safe deep cloning
function safeDeepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  try {
    // Ensure undefined is not stringified to "undefined" which breaks JSON.parse
    const stringified = JSON.stringify(obj, (key, value) => {
      return typeof value === "undefined" ? null : value;
    });
    return JSON.parse(stringified);
  } catch (e) {
    console.error("Error in safeDeepClone:", e, "Object was:", obj);
    return Array.isArray(obj) ? [] : {}; // Fallback to empty object/array
  }
}

/**
 * MainPageForm is a presentational component for editing the main page.
 * It displays the UI and passes changes upward via setFormData.
 */
const MainPageForm = ({
  formData: formDataProp,
  setFormData: setFormDataProp,
  navbarData: navbarDataProp,
  onNavbarChange,
  singleBlockMode = null,
  themeColors,
  sitePalette,
}) => {
  const [formData, setFormData] = useState({ mainPageBlocks: [] });
  const [navbarConfig, setNavbarConfig] = useState(null);
  const [initialNavbarConfig, setInitialNavbarConfig] = useState(null);
  const [internalFormData, setInternalFormData] = useState(
    () => safeDeepClone(formDataProp) || {}
  );
  const [activeEditBlock, setActiveEditBlock] = useState(null);
  const [activeBlockDataForPanel, setActiveBlockDataForPanel] = useState(null);
  const [previewNavbarAsScrolled, setPreviewNavbarAsScrolled] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [iconModalTargetField, setIconModalTargetField] = useState(null);
  const [currentIconForModal, setCurrentIconForModal] = useState(null);
  const prevActiveEditBlockRef = useRef(null);

  const handleOpenIconModal = useCallback(
    (
      fieldId,
      currentIcon,
      source = "block",
      blockKeyForCardIcon = null,
      cardIndexForIcon = null
    ) => {
      setIconModalTargetField({
        id: fieldId,
        source,
        blockKey: blockKeyForCardIcon,
        cardIndex: cardIndexForIcon,
      });
      setCurrentIconForModal(currentIcon);
      setIsIconModalOpen(true);
    },
    [setIconModalTargetField, setCurrentIconForModal, setIsIconModalOpen]
  );

  const handleIconSelection = useCallback(
    (pack, iconName) => {
      if (iconModalTargetField) {
        const { id, source, blockKey, cardIndex } = iconModalTargetField;
        if (source === "navbar" && id === "whiteLogoIcon") {
          setInternalFormData((prev) => ({
            ...prev,
            navbar: {
              ...(prev.navbar || {}),
              whiteLogoIcon: { pack, name: iconName },
              whiteLogo: { url: "", file: null, name: "" },
            },
          }));
        } else if (
          source === "block" &&
          blockKey &&
          cardIndex !== null &&
          id.startsWith("card-")
        ) {
          setInternalFormData((prev) => {
            const newBlocks = (prev.mainPageBlocks || []).map((b) => {
              if (b.uniqueKey === blockKey) {
                const newCards = (b.config.cards || []).map((card, idx) => {
                  if (idx === cardIndex) {
                    return { ...card, icon: iconName, iconPack: pack };
                  }
                  return card;
                });
                return { ...b, config: { ...b.config, cards: newCards } };
              }
              return b;
            });
            if (typeof setFormDataProp === "function") {
              if (activeEditBlock === blockKey) {
                const blockToUpdate = newBlocks.find(
                  (b) => b.uniqueKey === blockKey
                );
                if (blockToUpdate) {
                  const panelData = activeBlockDataForPanel;
                  if (
                    panelData &&
                    panelData.onPanelChange &&
                    panelData.blockName === "RichTextBlock"
                  ) {
                    panelData.onPanelChange(blockToUpdate.config);
                  } else {
                    setFormDataProp({ ...prev, mainPageBlocks: newBlocks });
                  }
                }
              }
            }
            return { ...prev, mainPageBlocks: newBlocks };
          });
        }
      }
      setIsIconModalOpen(false);
      setIconModalTargetField(null);
      setCurrentIconForModal(null);
    },
    [
      iconModalTargetField,
      setInternalFormData,
      setIsIconModalOpen,
      setIconModalTargetField,
      setCurrentIconForModal,
      setFormDataProp,
      activeEditBlock,
      activeBlockDataForPanel,
    ]
  );

  // Effect 1: When an edit session ends, propagate internalFormData up to OneForm.
  useEffect(() => {
    if (prevActiveEditBlockRef.current !== null && activeEditBlock === null) {
      console.log(
        "MainPageForm: Edit session ended. Propagating internal changes to OneForm."
      );
      const heroBlockData = internalFormData.mainPageBlocks?.find(
        (b) => b.blockName === "HeroBlock"
      );
      if (heroBlockData && heroBlockData.config) {
        console.log(
          "MainPageForm HeroBlock config BEFORE propagation to OneForm (File check):",
          heroBlockData.config.heroImageFile instanceof File
            ? `[File: ${heroBlockData.config.heroImageFile.name}]`
            : "No File",
          "Original URL:",
          heroBlockData.config.originalUrl
        );
      }
      if (typeof setFormDataProp === "function") {
        setFormDataProp(internalFormData);
      }
    }
    prevActiveEditBlockRef.current = activeEditBlock;
  }, [activeEditBlock, internalFormData, setFormDataProp]);

  // Effect 2: Synchronize from formDataProp down to internalFormData ONLY when not actively editing.
  useEffect(() => {
    if (activeEditBlock === null) {
      const clonedFormDataProp = safeDeepClone(formDataProp);
      if (clonedFormDataProp && typeof clonedFormDataProp === "object") {
        if (
          clonedFormDataProp.mainPageBlocks &&
          Array.isArray(clonedFormDataProp.mainPageBlocks)
        ) {
          clonedFormDataProp.mainPageBlocks =
            clonedFormDataProp.mainPageBlocks.map((block, index) => ({
              ...block,
              uniqueKey:
                block.uniqueKey ||
                `${block.blockName}_${Date.now()}_${index}_propSync`,
            }));
        }

        if (
          JSON.stringify(internalFormData) !==
          JSON.stringify(clonedFormDataProp)
        ) {
          console.log(
            "MainPageForm: Syncing from formData prop to internalFormData (no active edit).",
            clonedFormDataProp
          );
          setInternalFormData(clonedFormDataProp);
        }
      } else if (JSON.stringify(internalFormData) !== "{}") {
        console.log(
          "MainPageForm: formData prop is null/undefined. Resetting internalFormData if not already empty."
        );
        setInternalFormData({});
      }
    }
  }, [formDataProp, activeEditBlock]);

  const handleBlockConfigChange = useCallback(
    (blockUniqueKey, newConfigFromBlock) => {
      console.log(
        `MainPageForm: Block ${blockUniqueKey} is committing changes to internalFormData.`,
        newConfigFromBlock
      );
      setInternalFormData((prev) => {
        const blockBeingChanged = (prev.mainPageBlocks || []).find(
          (b) => b.uniqueKey === blockUniqueKey
        );
        let newMainPageBlocks = (prev.mainPageBlocks || []).map((block) =>
          block.uniqueKey === blockUniqueKey
            ? { ...block, config: newConfigFromBlock }
            : block
        );

        // Special handling for HeroBlock to ensure image structure consistency
        if (
          blockBeingChanged &&
          blockBeingChanged.blockName === "HeroBlock" &&
          newConfigFromBlock
        ) {
          console.log(
            "[MainPageForm] HeroBlock config update - ensuring image structure consistency:",
            newConfigFromBlock
          );

          // Ensure the heroImage property is properly structured for compatibility
          if (
            newConfigFromBlock.images &&
            newConfigFromBlock.images.length > 0
          ) {
            const primaryImage = newConfigFromBlock.images[0];
            if (
              !newConfigFromBlock.heroImage ||
              typeof newConfigFromBlock.heroImage === "string"
            ) {
              newConfigFromBlock.heroImage = {
                url: primaryImage.url,
                file: primaryImage.file,
                name: primaryImage.name,
                originalUrl: primaryImage.originalUrl,
                id: primaryImage.id,
              };
            }
          }

          const oldHeroConfig = blockBeingChanged.config;
          const serviceSliderBlockIndex = newMainPageBlocks.findIndex(
            (b) => b.blockName === "ServiceSliderBlock"
          );

          if (serviceSliderBlockIndex !== -1) {
            const serviceSliderConfig = {
              ...newMainPageBlocks[serviceSliderBlockIndex].config,
            };
            let sliderResidentialServices = [
              ...(serviceSliderConfig.residentialServices || []),
            ];
            let sliderCommercialServices = [
              ...(serviceSliderConfig.commercialServices || []),
            ];
            let changed = false;

            (newConfigFromBlock.residential?.subServices || []).forEach(
              (heroService) => {
                const oldHeroService =
                  oldHeroConfig.residential?.subServices?.find(
                    (s) => s.id === heroService.id
                  );
                if (
                  oldHeroService &&
                  oldHeroService.title !== heroService.title
                ) {
                  const sliderServiceIndex =
                    sliderResidentialServices.findIndex(
                      (sliderService) =>
                        sliderService.title === oldHeroService.originalTitle ||
                        sliderService.title === oldHeroService.title
                    );
                  if (sliderServiceIndex !== -1) {
                    sliderResidentialServices[sliderServiceIndex] = {
                      ...sliderResidentialServices[sliderServiceIndex],
                      title: heroService.title,
                    };
                    changed = true;
                    console.log(
                      `Linked Resi Service Title: '${oldHeroService.title}' to '${heroService.title}' in ServiceSlider`
                    );
                  }
                }
              }
            );

            (newConfigFromBlock.commercial?.subServices || []).forEach(
              (heroService) => {
                const oldHeroService =
                  oldHeroConfig.commercial?.subServices?.find(
                    (s) => s.id === heroService.id
                  );
                if (
                  oldHeroService &&
                  oldHeroService.title !== heroService.title
                ) {
                  const sliderServiceIndex = sliderCommercialServices.findIndex(
                    (sliderService) =>
                      sliderService.title === oldHeroService.originalTitle ||
                      sliderService.title === oldHeroService.title
                  );
                  if (sliderServiceIndex !== -1) {
                    sliderCommercialServices[sliderServiceIndex] = {
                      ...sliderCommercialServices[sliderServiceIndex],
                      title: heroService.title,
                    };
                    changed = true;
                    console.log(
                      `Linked Comm Service Title: '${oldHeroService.title}' to '${heroService.title}' in ServiceSlider`
                    );
                  }
                }
              }
            );

            if (changed) {
              newMainPageBlocks[serviceSliderBlockIndex] = {
                ...newMainPageBlocks[serviceSliderBlockIndex],
                config: {
                  ...serviceSliderConfig,
                  residentialServices: sliderResidentialServices,
                  commercialServices: sliderCommercialServices,
                },
              };
            }
          }
        }

        const heroBlockInNewState = newMainPageBlocks.find(
          (b) => b.blockName === "HeroBlock"
        );
        if (heroBlockInNewState && heroBlockInNewState.config) {
          console.log(
            "MainPageForm: HeroBlock config after update in newMainPageBlocks (File check):",
            heroBlockInNewState.config.heroImageFile instanceof File
              ? `[File: ${heroBlockInNewState.config.heroImageFile.name}]`
              : "No File",
            "Images array:",
            heroBlockInNewState.config.images?.length || 0,
            "images"
          );
        }
        return { ...prev, mainPageBlocks: newMainPageBlocks };
      });
    },
    [setInternalFormData]
  );

  // Helper function to prepare navbar data for parent component
  const prepareNavbarDataForParent = useCallback((currentNavbarData) => {
    if (!currentNavbarData) return null;

    const dataToSave = { ...currentNavbarData };

    // Handle images array - preserve original names for processing
    if (dataToSave.images && dataToSave.images.length > 0) {
      const logoImage = dataToSave.images[0];
      let fileName = logoImage.name;
      if (logoImage.file instanceof File) {
        fileName = logoImage.file.name;
      } else if (
        logoImage.originalUrl &&
        !logoImage.originalUrl.startsWith("blob:")
      ) {
        fileName = logoImage.originalUrl.split("/").pop();
      }

      if (!fileName || fileName === "Logo") {
        fileName = "logo.png";
      }

      dataToSave.logo = {
        url: logoImage.url,
        file: logoImage.file,
        originalUrl: logoImage.originalUrl,
        name: fileName,
        id: logoImage.id,
      };
    }

    // Handle whiteImages array
    if (dataToSave.whiteImages && dataToSave.whiteImages.length > 0) {
      const whiteLogoImage = dataToSave.whiteImages[0];
      let fileName = whiteLogoImage.name;
      if (whiteLogoImage.file instanceof File) {
        fileName = whiteLogoImage.file.name;
      } else if (
        whiteLogoImage.originalUrl &&
        !whiteLogoImage.originalUrl.startsWith("blob:")
      ) {
        fileName = whiteLogoImage.originalUrl.split("/").pop();
      }

      if (!fileName || fileName === "White Logo") {
        fileName = "logo_white.png";
      }

      dataToSave.whiteLogo = {
        url: whiteLogoImage.url,
        file: whiteLogoImage.file,
        originalUrl: whiteLogoImage.originalUrl,
        name: fileName,
        id: whiteLogoImage.id,
      };
    }

    return dataToSave;
  }, []);

  // Handle navbar configuration changes
  const handleNavbarConfigChange = useCallback(
    (changedFields) => {
      console.log("[MainPageForm] Navbar config changed:", changedFields);
      setNavbarConfig((prevConfig) => {
        const newConfig = { ...prevConfig, ...changedFields };

        // Use prop callback if available, otherwise use setFormDataProp
        if (onNavbarChange && typeof onNavbarChange === "function") {
          onNavbarChange(newConfig);
        } else if (setFormDataProp && typeof setFormDataProp === "function") {
          // Fallback to old behavior
          const dataForParent = prepareNavbarDataForParent(newConfig);
          setFormDataProp((prevFormData) => ({
            ...prevFormData,
            navbar: dataForParent,
          }));
        }

        return newConfig;
      });
    },
    [onNavbarChange, prepareNavbarDataForParent, setFormDataProp]
  );

  const handleRichTextConfigChange = useCallback(
    (newRichTextConfig) => {
      console.log(
        "MainPageForm: RichText committing changes to internalFormData.",
        newRichTextConfig
      );
      setInternalFormData((prev) => {
        const updatedMainPageBlocks = (prev.mainPageBlocks || []).map(
          (block) =>
            block.blockName === "RichTextBlock"
              ? { ...block, config: newRichTextConfig }
              : block
        );
        let newInternalState = {
          ...prev,
          mainPageBlocks: updatedMainPageBlocks,
        };
        // Note: Background color synchronization with HeroBlock removed since
        // RichTextBlock now uses its own independent backgroundColor
        return newInternalState;
      });
    },
    [setInternalFormData]
  );

  const PencilIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487a2.032 2.032 0 112.872 2.872L7.5 21.613H4v-3.5L16.862 4.487z"
      />
    </svg>
  );
  const CheckIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );

  const handleToggleEditState = useCallback(
    (key) => {
      const currentlyEditing = activeEditBlock === key;
      if (currentlyEditing) {
        setActiveEditBlock(null);
      } else {
        setActiveEditBlock(key);
      }
    },
    [activeEditBlock]
  );

  // Effect 3: Manage activeBlockDataForPanel based on activeEditBlock and internalFormData
  useEffect(() => {
    if (!activeEditBlock) {
      if (activeBlockDataForPanel !== null) {
        setActiveBlockDataForPanel(null);
      }
      return;
    }

    let newPanelData = null;

    if (activeEditBlock === "navbar") {
      // Handle navbar editing with proper panel data
      if (navbarConfig) {
        newPanelData = {
          blockName: "Navbar",
          EditorPanelComponent: null, // Use tabs instead
          config: navbarConfig,
          onPanelChange: handleNavbarConfigChange,
          tabsConfig: navbarTabsConfig,
          themeColors,
          sitePalette,
        };
      }
    } else {
      const blockToEdit = internalFormData.mainPageBlocks?.find(
        (b) => b.uniqueKey === activeEditBlock
      );
      if (blockToEdit) {
        const BlockComponent = blockComponentMap[blockToEdit.blockName];
        const blockConfig = blockToEdit.config || {};

        const panelSpecificOnControlsChange = (changedFieldsOrUpdater) => {
          if (typeof changedFieldsOrUpdater === "function") {
            const newConfig = changedFieldsOrUpdater(blockConfig);
            handleBlockConfigChange(blockToEdit.uniqueKey, newConfig);
          } else {
            handleBlockConfigChange(blockToEdit.uniqueKey, {
              ...blockConfig,
              ...changedFieldsOrUpdater,
            });
          }
        };

        let panelTabsConfig = null;
        if (BlockComponent) {
          console.log(
            `[MainPageForm] Setting up panel for ${blockToEdit.blockName}. BlockComponent:`,
            BlockComponent
          );

          // Special handling for HeroBlock due to React.lazy and static properties
          if (blockToEdit.blockName === "HeroBlock") {
            if (typeof HeroBlock.tabsConfig === "function") {
              // Accessing the directly imported HeroBlock
              panelTabsConfig = HeroBlock.tabsConfig(
                blockConfig,
                panelSpecificOnControlsChange,
                themeColors,
                sitePalette
              );
              console.log(
                `[MainPageForm] Retrieved tabsConfig for HeroBlock directly:`,
                panelTabsConfig
              );
            } else {
              console.warn(
                `[MainPageForm] HeroBlock.tabsConfig is not a function on the direct import.`
              );
            }
          } else if (BlockComponent.type) {
            // For other lazy components
            console.log(
              `[MainPageForm] BlockComponent.type for ${blockToEdit.blockName}:`,
              BlockComponent.type
            );
            console.log(
              `[MainPageForm] BlockComponent.type.tabsConfig for ${blockToEdit.blockName} is function?`,
              typeof BlockComponent.type.tabsConfig === "function"
            );
            if (typeof BlockComponent.type.tabsConfig === "function") {
              panelTabsConfig = BlockComponent.type.tabsConfig(
                blockConfig,
                panelSpecificOnControlsChange,
                themeColors,
                sitePalette
              );
              console.log(
                `[MainPageForm] Retrieved tabsConfig for ${blockToEdit.blockName} via BlockComponent.type.tabsConfig:`,
                panelTabsConfig
              );
            }
          } else if (typeof BlockComponent.tabsConfig === "function") {
            // For non-lazy components
            panelTabsConfig = BlockComponent.tabsConfig(
              blockConfig,
              panelSpecificOnControlsChange,
              themeColors,
              sitePalette
            );
            console.log(
              `[MainPageForm] Retrieved tabsConfig for ${blockToEdit.blockName} via BlockComponent.tabsConfig:`,
              panelTabsConfig
            );
          }

          if (!panelTabsConfig) {
            // Fallback log if still not found
            console.warn(
              `[MainPageForm] Could not retrieve tabsConfig for ${blockToEdit.blockName} through any method.`
            );
          }

          // The openIconModalFnForBlock was defined earlier but might not be needed for all blocks/tabs
          // It's passed to tabsConfig functions which can choose to use it or not.
        }

        newPanelData = {
          blockName: blockToEdit.blockName,
          EditorPanelComponent: BlockComponent?.EditorPanel,
          config: blockConfig,
          onPanelChange: panelSpecificOnControlsChange,
          tabsConfig: panelTabsConfig,
          themeColors,
          sitePalette,
        };
      }
    }

    if (
      newPanelData &&
      JSON.stringify(newPanelData.config) !==
        JSON.stringify(activeBlockDataForPanel?.config)
    ) {
      console.log(
        "[MainPageForm] Updating activeBlockDataForPanel for:",
        activeEditBlock,
        newPanelData.config
      );
      setActiveBlockDataForPanel(newPanelData);
    } else if (newPanelData && !activeBlockDataForPanel) {
      console.log(
        "[MainPageForm] Initializing activeBlockDataForPanel for:",
        activeEditBlock,
        newPanelData.config
      );
      setActiveBlockDataForPanel(newPanelData);
    } else if (!newPanelData && activeBlockDataForPanel !== null) {
      setActiveBlockDataForPanel(null);
    }
  }, [
    activeEditBlock,
    internalFormData,
    themeColors,
    sitePalette,
    handleBlockConfigChange,
    handleNavbarConfigChange,
    activeBlockDataForPanel,
    previewNavbarAsScrolled,
    handleOpenIconModal,
    navbarConfig,
  ]);

  const activeBlockForPanel = activeEditBlock
    ? internalFormData.mainPageBlocks?.find(
        (b) => b.uniqueKey === activeEditBlock
      )
    : null;

  // Load navbar configuration from nav.json or props
  useEffect(() => {
    const loadNavbarConfig = async () => {
      // Use prop data if available
      if (navbarDataProp) {
        console.log(
          "[MainPageForm] Using navbar data from props:",
          navbarDataProp
        );
        setNavbarConfig(navbarDataProp);
        setInitialNavbarConfig(JSON.parse(JSON.stringify(navbarDataProp)));
        return;
      }

      // Fallback to loading from nav.json
      try {
        const response = await fetch("/personal/old/jsons/nav.json");
        if (response.ok) {
          const navData = await response.json();
          console.log("[MainPageForm] Loaded nav.json:", navData);

          // Initialize images array structure if it doesn't exist
          let processedNavData = { ...navData };

          // Handle legacy logo structure - convert to images array
          if (!processedNavData.images && processedNavData.logo) {
            processedNavData.images = [
              {
                id: "navbar_logo_main",
                url:
                  typeof processedNavData.logo === "string"
                    ? processedNavData.logo
                    : processedNavData.logo.url,
                name:
                  typeof processedNavData.logo === "string"
                    ? processedNavData.logo.split("/").pop()
                    : processedNavData.logo.name,
                originalUrl:
                  typeof processedNavData.logo === "string"
                    ? processedNavData.logo
                    : processedNavData.logo.originalUrl,
                file: null,
              },
            ];
            delete processedNavData.logo;
          }

          // Handle legacy whiteLogo structure - convert to whiteImages array
          if (!processedNavData.whiteImages && processedNavData.whiteLogo) {
            processedNavData.whiteImages = [
              {
                id: "navbar_logo_white",
                url:
                  typeof processedNavData.whiteLogo === "string"
                    ? processedNavData.whiteLogo
                    : processedNavData.whiteLogo.url,
                name:
                  typeof processedNavData.whiteLogo === "string"
                    ? processedNavData.whiteLogo.split("/").pop()
                    : processedNavData.whiteLogo.name,
                originalUrl:
                  typeof processedNavData.whiteLogo === "string"
                    ? processedNavData.whiteLogo
                    : processedNavData.whiteLogo.originalUrl,
                file: null,
              },
            ];
            delete processedNavData.whiteLogo;
          }

          setNavbarConfig(processedNavData);
          setInitialNavbarConfig(JSON.parse(JSON.stringify(processedNavData)));
        } else {
          console.warn(
            "[MainPageForm] Failed to load nav.json, using fallback"
          );
          const fallbackNavbar = {
            title: "COWBOYS-VAQUEROS",
            subtitle: "CONSTRUCTION",
            navLinks: [],
            images: [],
            whiteImages: [],
          };
          setNavbarConfig(fallbackNavbar);
          setInitialNavbarConfig(JSON.parse(JSON.stringify(fallbackNavbar)));
        }
      } catch (error) {
        console.error("[MainPageForm] Error loading nav.json:", error);
        const fallbackNavbar = {
          title: "COWBOYS-VAQUEROS",
          subtitle: "CONSTRUCTION",
          navLinks: [],
          images: [],
          whiteImages: [],
        };
        setNavbarConfig(fallbackNavbar);
        setInitialNavbarConfig(JSON.parse(JSON.stringify(fallbackNavbar)));
      }
    };

    loadNavbarConfig();
  }, [navbarDataProp]);

  // Define tabsConfig for navbar
  const navbarTabsConfig = navbarConfig
    ? {
        general: (props) => (
          <NavbarGeneralControls
            {...props}
            currentData={navbarConfig}
            onControlsChange={handleNavbarConfigChange}
            onPreviewStateChange={setPreviewNavbarAsScrolled}
            previewNavbarAsScrolled={previewNavbarAsScrolled}
          />
        ),
        images: (props) => (
          <NavbarImagesControls
            {...props}
            currentData={navbarConfig}
            onControlsChange={handleNavbarConfigChange}
            themeColors={themeColors}
          />
        ),
        colors: (props) => (
          <NavbarColorControls
            {...props}
            currentData={navbarConfig}
            onControlsChange={handleNavbarConfigChange}
            themeColors={themeColors}
          />
        ),
        styling: (props) => (
          <NavbarStylingControls
            {...props}
            currentData={navbarConfig}
            onControlsChange={handleNavbarConfigChange}
            previewNavbarAsScrolled={previewNavbarAsScrolled}
            setPreviewNavbarAsScrolled={setPreviewNavbarAsScrolled}
          />
        ),
      }
    : null;

  if (singleBlockMode) {
    const blockDataContainer = internalFormData || {};
    const blockConfig = blockDataContainer[singleBlockMode];
    const Component = blockComponentMap[singleBlockMode];

    if (singleBlockMode === "navbar") {
      return (
        <div className="relative p-4 bg-gray-200">
          <h2 className="text-xl font-semibold mb-3">Navbar Editor</h2>
          <div className="bg-white border rounded-lg shadow-sm overflow-visible mb-4">
            <div className="relative">
              <Navbar
                config={navbarConfig || blockDataContainer.navbar || {}}
                animationConfig={{
                  ...(navbarConfig?.animation || {}),
                  isScrolled: previewNavbarAsScrolled,
                }}
                isPreview={true}
              />
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Preview:</span>
                <button
                  onClick={() => setPreviewNavbarAsScrolled(false)}
                  className={`px-2 py-1 text-xs rounded ${
                    !previewNavbarAsScrolled
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Unscrolled
                </button>
                <button
                  onClick={() => setPreviewNavbarAsScrolled(true)}
                  className={`px-2 py-1 text-xs rounded ${
                    previewNavbarAsScrolled
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Scrolled
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (Component && blockConfig) {
      const propName =
        Object.keys(propsForBlocks[singleBlockMode] || { config: null })[0] ||
        "config";
      let props = {
        readOnly: false,
        [propName]: blockConfig,
        onConfigChange: (newConfig) => {
          console.log(
            `Single block mode: ${singleBlockMode} committing changes to internalFormData.`
          );
          setInternalFormData((prev) => {
            const newBlockData = { ...prev, [singleBlockMode]: newConfig };
            if (
              (prev.mainPageBlocks || []).some(
                (b) => b.blockName === singleBlockMode
              )
            ) {
              newBlockData.mainPageBlocks = (prev.mainPageBlocks || []).map(
                (b) =>
                  b.blockName === singleBlockMode
                    ? { ...b, config: newConfig }
                    : b
              );
            }
            return newBlockData;
          });
        },
        themeColors: themeColors,
        sitePalette: sitePalette,
      };
      if (singleBlockMode === "RichTextBlock") props.showControls = true;

      return (
        <div className="relative">
          <Suspense fallback={<div>Loading {singleBlockMode}...</div>}>
            <Component {...props} />
          </Suspense>
        </div>
      );
    } else {
      return (
        <div>
          Unknown block type or missing config for single block:{" "}
          {singleBlockMode} (Data: {JSON.stringify(blockConfig || "undefined")})
        </div>
      );
    }
  }

  const currentInternalData = internalFormData || {};
  const currentNavbarData = currentInternalData.navbar || {};
  const currentMainPageBlocks = currentInternalData.mainPageBlocks || [];

  if (Object.keys(currentInternalData).length === 0 && !singleBlockMode) {
    return (
      <div className="p-4 text-center">Loading form data... (Main Form)</div>
    );
  }

  return (
    <div className="bg-gray-100 relative">
      {!singleBlockMode && (
        <TopStickyEditPanel
          isOpen={activeEditBlock !== null}
          onClose={() => handleToggleEditState(activeEditBlock)}
          activeBlockData={activeBlockDataForPanel}
        />
      )}

      {/* Navbar Section - Now integrated with TopStickyEditPanel */}
      {!singleBlockMode && navbarConfig && (
        <div className="relative bg-white border mb-4">
          {/* Navbar Preview */}
          <div className="relative">
            <Navbar
              config={navbarConfig}
              forceScrolledState={previewNavbarAsScrolled}
              isPreview={true}
            />
          </div>

          {/* Edit Button */}
          <div className="absolute top-4 right-4 z-50">
            <button
              type="button"
              onClick={() => handleToggleEditState("navbar")}
              className={`${activeEditBlock === "navbar" ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-600"} text-white rounded-full p-2 shadow-lg transition-colors`}
            >
              {activeEditBlock === "navbar" ? CheckIcon : PencilIcon}
            </button>
          </div>
        </div>
      )}

      {/* TopStickyEditPanel for Navbar */}
      {!singleBlockMode && activeEditBlock === "navbar" && (
        <TopStickyEditPanel
          isOpen={activeEditBlock === "navbar"}
          onClose={() => handleToggleEditState("navbar")}
          activeBlockData={{
            blockName: "Navbar",
            config: navbarConfig,
            onPanelChange: handleNavbarConfigChange,
            tabsConfig: {
              general: (props) => (
                <NavbarGeneralControls
                  {...props}
                  currentData={navbarConfig}
                  onControlsChange={handleNavbarConfigChange}
                  onPreviewStateChange={setPreviewNavbarAsScrolled}
                  previewNavbarAsScrolled={previewNavbarAsScrolled}
                />
              ),
              images: (props) => (
                <NavbarImagesControls
                  {...props}
                  currentData={navbarConfig}
                  onControlsChange={handleNavbarConfigChange}
                  themeColors={themeColors}
                />
              ),
              colors: (props) => (
                <NavbarColorControls
                  {...props}
                  currentData={navbarConfig}
                  onControlsChange={handleNavbarConfigChange}
                  themeColors={themeColors}
                />
              ),
              styling: (props) => (
                <NavbarStylingControls
                  {...props}
                  currentData={navbarConfig}
                  onControlsChange={handleNavbarConfigChange}
                  previewNavbarAsScrolled={previewNavbarAsScrolled}
                  setPreviewNavbarAsScrolled={setPreviewNavbarAsScrolled}
                />
              ),
            },
            themeColors,
            sitePalette,
          }}
        />
      )}

      {currentMainPageBlocks.map((block) => {
        const blockKey =
          block.uniqueKey || `${block.blockName}_fallbackKey_${Math.random()}`;
        const ComponentToRender = blockComponentMap[block.blockName];
        const isEditingThisBlock = activeEditBlock === blockKey;

        if (!ComponentToRender)
          return (
            <div key={blockKey} className="p-4 text-red-500">
              Unknown block type: {block.blockName}
            </div>
          );

        const blockSpecificPropName =
          {
            HeroBlock: "heroconfig",
            RichTextBlock: "richTextData",
            ButtonBlock: "buttonconfig",
            BasicMapBlock: "mapData",
            BookingBlock: "bookingData",
            ServiceSliderBlock: "config",
            TestimonialBlock: "config",
            BeforeAfterBlock: "beforeAfterData",
            EmployeesBlock: "employeesData",
            AboutBlock: "aboutData",
            CombinedPageBlock: "config",
          }[block.blockName] || "config";

        let componentProps = {
          readOnly: !isEditingThisBlock,
          [blockSpecificPropName]: block.config || {},
          themeColors: themeColors,
          sitePalette: sitePalette,
        };

        if (block.blockName === "HeroBlock") {
          componentProps.onConfigChange = (newConf) =>
            handleBlockConfigChange(blockKey, newConf);
        } else if (block.blockName === "RichTextBlock") {
          componentProps.showControls = isEditingThisBlock;
          componentProps.onConfigChange = (newConf) =>
            handleBlockConfigChange(blockKey, newConf);
        } else {
          componentProps.onConfigChange = (newConf) =>
            handleBlockConfigChange(blockKey, newConf);
        }

        return (
          <div
            key={blockKey}
            className="relative bg-white overflow-hidden border"
          >
            <div className="absolute top-4 right-4 z-50">
              <button
                type="button"
                onClick={() => handleToggleEditState(blockKey)}
                className={`${isEditingThisBlock ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-600"} text-white rounded-full p-2 shadow-lg transition-colors`}
              >
                {isEditingThisBlock ? CheckIcon : PencilIcon}
              </button>
            </div>
            <Suspense fallback={<div>Loading {block.blockName}...</div>}>
              <ComponentToRender {...componentProps} />
            </Suspense>
          </div>
        );
      })}
      {isIconModalOpen && (
        <IconSelectorModal
          isOpen={isIconModalOpen}
          onClose={() => setIsIconModalOpen(false)}
          onSelectIcon={handleIconSelection}
          currentIconPack={currentIconForModal?.pack || "lucide"}
          currentIconName={currentIconForModal?.name}
        />
      )}
    </div>
  );
};

MainPageForm.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func.isRequired,
  navbarData: PropTypes.object,
  onNavbarChange: PropTypes.func,
  singleBlockMode: PropTypes.string,
  themeColors: PropTypes.object,
  sitePalette: PropTypes.array,
};

const propsForBlocks = {
  HeroBlock: { heroconfig: null },
  RichTextBlock: { richTextData: null },
  ButtonBlock: { buttonconfig: null },
  BasicMapBlock: { mapData: null },
  BookingBlock: { bookingData: null },
  ServiceSliderBlock: { config: null },
  TestimonialBlock: { config: null },
  BeforeAfterBlock: { beforeAfterData: null },
  EmployeesBlock: { employeesData: null },
  AboutBlock: { aboutData: null },
  CombinedPageBlock: { config: null },
};

export default MainPageForm;

/* ==============================================
   NAVBAR TAB CONTROL COMPONENTS
   ----------------------------------------------
   Following the standard pattern from BeforeAfterBlock
=============================================== */

// Navbar General Controls - Navigation Links and Basic Text
const NavbarGeneralControls = ({
  currentData,
  onControlsChange,
  onPreviewStateChange,
  previewNavbarAsScrolled,
}) => {
  const handleNavLinkChange = (index, field, value) => {
    const updatedNavLinks = [...(currentData.navLinks || [])];
    updatedNavLinks[index] = { ...updatedNavLinks[index], [field]: value };
    onControlsChange({ ...currentData, navLinks: updatedNavLinks });
  };

  const addNavLink = () => {
    const navLinks = currentData.navLinks || [];
    onControlsChange({
      ...currentData,
      navLinks: [...navLinks, { name: "New Link", href: "/" }],
    });
  };

  const removeNavLink = (index) => {
    const updatedNavLinks = (currentData.navLinks || []).filter(
      (_, i) => i !== index
    );
    onControlsChange({ ...currentData, navLinks: updatedNavLinks });
  };

  const handleTextChange = (field, value) => {
    onControlsChange({ ...currentData, [field]: value });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        {/* Preview Controls */}
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <span className="text-xs text-gray-600">Preview:</span>
          <button
            onClick={() => onPreviewStateChange(false)}
            className={`px-2 py-1 text-xs rounded ${
              !previewNavbarAsScrolled
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Unscrolled
          </button>
          <button
            onClick={() => onPreviewStateChange(true)}
            className={`px-2 py-1 text-xs rounded ${
              previewNavbarAsScrolled
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Scrolled
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title:
          </label>
          <input
            type="text"
            value={currentData.title || ""}
            onChange={(e) => handleTextChange("title", e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subtitle:
          </label>
          <input
            type="text"
            value={currentData.subtitle || ""}
            onChange={(e) => handleTextChange("subtitle", e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter subtitle"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Navigation Links:
            </label>
            <button
              onClick={addNavLink}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Link
            </button>
          </div>
          <div className="space-y-2">
            {(currentData.navLinks || []).map((link, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={link.name || ""}
                  onChange={(e) =>
                    handleNavLinkChange(index, "name", e.target.value)
                  }
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Link name"
                />
                <input
                  type="text"
                  value={link.href || ""}
                  onChange={(e) =>
                    handleNavLinkChange(index, "href", e.target.value)
                  }
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Link URL"
                />
                <button
                  onClick={() => removeNavLink(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Navbar Images Controls - Logo and White Logo
const NavbarImagesControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const handleControlsChange = (changedFields) => {
    onControlsChange(changedFields);
  };

  return (
    <div className="p-3 grid grid-cols-1 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Main Logo:
        </label>
        <PanelImagesController
          currentData={currentData}
          onControlsChange={handleControlsChange}
          imageArrayFieldName="images"
          maxImages={1}
          imageLabels={["Main Logo"]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          White Logo (for dark backgrounds):
        </label>
        <PanelImagesController
          currentData={currentData}
          onControlsChange={handleControlsChange}
          imageArrayFieldName="whiteImages"
          maxImages={1}
          imageLabels={["White Logo"]}
        />
      </div>
    </div>
  );
};

NavbarImagesControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  themeColors: PropTypes.array.isRequired,
};

// Navbar Color Controls
const NavbarColorControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const handleColorChange = (fieldName, value) => {
    onControlsChange({ ...currentData, [fieldName]: value });
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-md">
      <h3 className="text-sm font-semibold mb-3">Navbar Color Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThemeColorPicker
          label="Unscrolled Background:"
          currentColorValue={
            currentData.unscrolledBackgroundColor || "bg-transparent"
          }
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorChange("unscrolledBackgroundColor", value)
          }
          fieldName="unscrolledBackgroundColor"
        />
        <ThemeColorPicker
          label="Scrolled Background:"
          currentColorValue={currentData.scrolledBackgroundColor || "bg-banner"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorChange("scrolledBackgroundColor", value)
          }
          fieldName="scrolledBackgroundColor"
        />
        <ThemeColorPicker
          label="Dropdown Background:"
          currentColorValue={currentData.dropdownBackgroundColor || "bg-white"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorChange("dropdownBackgroundColor", value)
          }
          fieldName="dropdownBackgroundColor"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dropdown Text Color:
          </label>
          <input
            type="text"
            value={currentData.dropdownTextColor || ""}
            onChange={(e) =>
              handleColorChange("dropdownTextColor", e.target.value)
            }
            placeholder="e.g., text-black"
            className="mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>
        <div className="md:col-span-2 flex items-center mt-1">
          <input
            type="checkbox"
            checked={currentData.useWhiteHamburger || false}
            onChange={(e) =>
              handleColorChange("useWhiteHamburger", e.target.checked)
            }
            className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label className="text-sm font-medium text-gray-700">
            Use White Hamburger Icon
          </label>
        </div>
      </div>
    </div>
  );
};

// Navbar Styling Controls
const NavbarStylingControls = ({
  currentData,
  onControlsChange,
  previewNavbarAsScrolled,
  setPreviewNavbarAsScrolled,
}) => {
  const handleAnimationChange = (field, value) => {
    const updatedAnimation = { ...currentData.animation, [field]: value };
    onControlsChange({ ...currentData, animation: updatedAnimation });
  };

  const handleTextSizeChange = (sizeType, breakpoint, property, value) => {
    const currentSizes = currentData.textSizes || {};
    const currentBreakpoint = currentSizes[breakpoint] || {};
    const updatedSizes = {
      ...currentSizes,
      [breakpoint]: { ...currentBreakpoint, [property]: value },
    };
    onControlsChange({ ...currentData, textSizes: updatedSizes });
  };

  const handleNavbarHeightChange = (
    heightType,
    breakpoint,
    property,
    value
  ) => {
    const currentHeights = currentData.navbarHeight || {};
    const currentBreakpoint = currentHeights[breakpoint] || {};
    const updatedHeights = {
      ...currentHeights,
      [breakpoint]: { ...currentBreakpoint, [property]: value },
    };
    onControlsChange({ ...currentData, navbarHeight: updatedHeights });
  };

  const animation = currentData.animation || {};

  // Text size options for different screen sizes
  const textSizeOptions = {
    unscrolled: {
      base: [
        { value: "text-[4vw]", label: "Extra Small (4vw)" },
        { value: "text-[5vw]", label: "Small (5vw)" },
        { value: "text-[6vw]", label: "Medium (6vw)" },
        { value: "text-[7vw]", label: "Large (7vw)" },
        { value: "text-[8vw]", label: "Extra Large (8vw)" },
        { value: "text-[9vw]", label: "Huge (9vw)" },
      ],
      md: [
        { value: "text-[4vh]", label: "Extra Small (4vh)" },
        { value: "text-[5vh]", label: "Small (5vh)" },
        { value: "text-[6vh]", label: "Medium (6vh)" },
        { value: "text-[7vh]", label: "Large (7vh)" },
        { value: "text-[8vh]", label: "Extra Large (8vh)" },
        { value: "text-[9vh]", label: "Huge (9vh)" },
      ],
      lg: [
        { value: "text-[3vh]", label: "Extra Small (3vh)" },
        { value: "text-[4vh]", label: "Small (4vh)" },
        { value: "text-[5vh]", label: "Medium (5vh)" },
        { value: "text-[6vh]", label: "Large (6vh)" },
        { value: "text-[7vh]", label: "Extra Large (7vh)" },
      ],
    },
    scrolled: {
      base: [
        { value: "text-[2vw]", label: "Extra Small (2vw)" },
        { value: "text-[2.5vw]", label: "Small (2.5vw)" },
        { value: "text-[3vw]", label: "Medium (3vw)" },
        { value: "text-[3.5vw]", label: "Large (3.5vw)" },
        { value: "text-[4vw]", label: "Extra Large (4vw)" },
      ],
      md: [
        { value: "text-[3vh]", label: "Extra Small (3vh)" },
        { value: "text-[4vh]", label: "Small (4vh)" },
        { value: "text-[5vh]", label: "Medium (5vh)" },
        { value: "text-[6vh]", label: "Large (6vh)" },
        { value: "text-[7vh]", label: "Extra Large (7vh)" },
      ],
    },
  };

  // Navbar height options
  const navbarHeightOptions = {
    unscrolled: {
      base: [
        { value: "h-[12vh]", label: "Small (12vh)" },
        { value: "h-[14vh]", label: "Medium (14vh)" },
        { value: "h-[16vh]", label: "Large (16vh)" },
        { value: "h-[18vh]", label: "Extra Large (18vh)" },
        { value: "h-[20vh]", label: "Huge (20vh)" },
      ],
      md: [
        { value: "h-[14vh]", label: "Small (14vh)" },
        { value: "h-[16vh]", label: "Medium (16vh)" },
        { value: "h-[18vh]", label: "Large (18vh)" },
        { value: "h-[20vh]", label: "Extra Large (20vh)" },
        { value: "h-[22vh]", label: "Huge (22vh)" },
      ],
    },
    scrolled: {
      base: [
        { value: "h-[8vh]", label: "Small (8vh)" },
        { value: "h-[10vh]", label: "Medium (10vh)" },
        { value: "h-[12vh]", label: "Large (12vh)" },
      ],
      md: [
        { value: "h-[8vh]", label: "Small (8vh)" },
        { value: "h-[10vh]", label: "Medium (10vh)" },
        { value: "h-[12vh]", label: "Large (12vh)" },
      ],
    },
  };

  return (
    <div className="p-4 space-y-6 bg-white rounded-md">
      {/* Preview Mode Toggle */}
      <div className="flex space-x-2 mb-3 border-b pb-3">
        <p className="text-sm font-medium text-gray-700 self-center mr-2">
          Preview Mode:
        </p>
        <button
          type="button"
          onClick={() => setPreviewNavbarAsScrolled(false)}
          className={`px-3 py-1.5 text-xs rounded-md ${!previewNavbarAsScrolled ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          Unscrolled
        </button>
        <button
          type="button"
          onClick={() => setPreviewNavbarAsScrolled(true)}
          className={`px-3 py-1.5 text-xs rounded-md ${previewNavbarAsScrolled ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          Scrolled
        </button>
      </div>

      {/* Animation Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">
          Animation Settings:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Natural Offset (vh):
            </label>
            <input
              type="number"
              value={animation.naturalOffsetVh || 11}
              onChange={(e) =>
                handleAnimationChange(
                  "naturalOffsetVh",
                  parseFloat(e.target.value)
                )
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Slide Up Distance (vh):
            </label>
            <input
              type="number"
              value={animation.slideUpDistanceVh || 0}
              onChange={(e) =>
                handleAnimationChange(
                  "slideUpDistanceVh",
                  parseFloat(e.target.value)
                )
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Logo Size Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">
          Logo Size Settings:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Unscrolled Width:
            </label>
            <input
              type="text"
              value={animation.logoSizeUnscrolled?.width || "18vh"}
              onChange={(e) =>
                handleAnimationChange("logoSizeUnscrolled", {
                  ...animation.logoSizeUnscrolled,
                  width: e.target.value,
                })
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Unscrolled Height:
            </label>
            <input
              type="text"
              value={animation.logoSizeUnscrolled?.height || "18vh"}
              onChange={(e) =>
                handleAnimationChange("logoSizeUnscrolled", {
                  ...animation.logoSizeUnscrolled,
                  height: e.target.value,
                })
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Scrolled Width:
            </label>
            <input
              type="text"
              value={animation.logoSizeScrolled?.width || "14vh"}
              onChange={(e) =>
                handleAnimationChange("logoSizeScrolled", {
                  ...animation.logoSizeScrolled,
                  width: e.target.value,
                })
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Scrolled Height:
            </label>
            <input
              type="text"
              value={animation.logoSizeScrolled?.height || "14vh"}
              onChange={(e) =>
                handleAnimationChange("logoSizeScrolled", {
                  ...animation.logoSizeScrolled,
                  height: e.target.value,
                })
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Text Size Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">
          Text Size Settings:
        </h4>

        <div className="border p-3 rounded-md bg-gray-50">
          <h5 className="text-xs font-semibold text-gray-600 mb-2">
            Unscrolled Text Sizes:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Mobile (base):
              </label>
              <select
                value={currentData.textSizes?.unscrolled?.base || "text-[7vw]"}
                onChange={(e) =>
                  handleTextSizeChange(
                    "unscrolled",
                    "base",
                    "base",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {textSizeOptions.unscrolled.base.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Tablet (md):
              </label>
              <select
                value={currentData.textSizes?.unscrolled?.md || "text-[8vh]"}
                onChange={(e) =>
                  handleTextSizeChange("unscrolled", "md", "md", e.target.value)
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {textSizeOptions.unscrolled.md.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Desktop (lg):
              </label>
              <select
                value={currentData.textSizes?.unscrolled?.lg || "text-[5vh]"}
                onChange={(e) =>
                  handleTextSizeChange("unscrolled", "lg", "lg", e.target.value)
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {textSizeOptions.unscrolled.lg.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border p-3 rounded-md bg-gray-50">
          <h5 className="text-xs font-semibold text-gray-600 mb-2">
            Scrolled Text Sizes:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Mobile (base):
              </label>
              <select
                value={currentData.textSizes?.scrolled?.base || "text-[3vw]"}
                onChange={(e) =>
                  handleTextSizeChange(
                    "scrolled",
                    "base",
                    "base",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {textSizeOptions.scrolled.base.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Desktop (md):
              </label>
              <select
                value={currentData.textSizes?.scrolled?.md || "text-[5vh]"}
                onChange={(e) =>
                  handleTextSizeChange("scrolled", "md", "md", e.target.value)
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {textSizeOptions.scrolled.md.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar Height Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">
          Navbar Height Settings:
        </h4>

        <div className="border p-3 rounded-md bg-gray-50">
          <h5 className="text-xs font-semibold text-gray-600 mb-2">
            Unscrolled Heights:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Mobile (base):
              </label>
              <select
                value={currentData.navbarHeight?.unscrolled?.base || "h-[16vh]"}
                onChange={(e) =>
                  handleNavbarHeightChange(
                    "unscrolled",
                    "base",
                    "base",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {navbarHeightOptions.unscrolled.base.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Desktop (md):
              </label>
              <select
                value={currentData.navbarHeight?.unscrolled?.md || "h-[16vh]"}
                onChange={(e) =>
                  handleNavbarHeightChange(
                    "unscrolled",
                    "md",
                    "md",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {navbarHeightOptions.unscrolled.md.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border p-3 rounded-md bg-gray-50">
          <h5 className="text-xs font-semibold text-gray-600 mb-2">
            Scrolled Heights:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Mobile (base):
              </label>
              <select
                value={currentData.navbarHeight?.scrolled?.base || "h-[10vh]"}
                onChange={(e) =>
                  handleNavbarHeightChange(
                    "scrolled",
                    "base",
                    "base",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {navbarHeightOptions.scrolled.base.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Desktop (md):
              </label>
              <select
                value={currentData.navbarHeight?.scrolled?.md || "h-[10vh]"}
                onChange={(e) =>
                  handleNavbarHeightChange(
                    "scrolled",
                    "md",
                    "md",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {navbarHeightOptions.scrolled.md.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Other Settings */}
      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          checked={currentData.invertLogoColor || false}
          onChange={(e) =>
            onControlsChange({
              ...currentData,
              invertLogoColor: e.target.checked,
            })
          }
          className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label className="text-sm font-medium text-gray-700">
          Invert Logo Color
        </label>
      </div>
    </div>
  );
};
