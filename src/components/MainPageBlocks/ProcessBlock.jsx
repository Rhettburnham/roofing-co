import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

/* ======================================================
   READ-ONLY VIEW: ProcessPreview
   ------------------------------------------------------
   This component shows the process section as a preview.
   It uses the same animation and layout as the main Process component.
========================================================= */
function ProcessPreview({ processData }) {
  const videoRefs = useRef([]);
  const [activeVideo, setActiveVideo] = useState(0);
  const [initialOrder, setInitialOrder] = useState([]);

  // Use processData if provided, or empty array to be loaded later
  const processSteps = processData?.steps || [];

  useEffect(() => {
    if (processSteps.length === 0) return;
    
    // Generate random initial animation order
    const indices = [...Array(processSteps.length).keys()];
    const shuffled = indices.sort(() => Math.random() - 0.5);
    setInitialOrder(shuffled);

    // Reset all videos
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        video.currentTime = 0;
        video.pause();
      }
    });

    let timeouts = [];

    const playVideosSequentially = () => {
      processSteps.forEach((_, idx) => {
        const startDelay = idx * 4000;
        const timeout1 = setTimeout(() => {
          if (videoRefs.current[idx]) {
            videoRefs.current[idx].currentTime = 0;
            videoRefs.current[idx].play().catch((error) => {
              console.error(`Video ${idx} autoplay failed:`, error);
            });
            setActiveVideo(idx);
          }
        }, startDelay);

        timeouts.push(timeout1);
      });

      const totalDuration = processSteps.length * 4000;
      const restartTimeout = setTimeout(() => {
        playVideosSequentially();
      }, totalDuration);

      timeouts.push(restartTimeout);
    };

    // Start the sequence
    playVideosSequentially();

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      videoRefs.current.forEach((video) => {
        if (video) {
          video.pause();
        }
      });
    };
  }, [processSteps]);

  // If no process steps provided, return placeholder or empty fragment
  if (processSteps.length === 0) {
    return <div className="h-[20vh]"></div>;
  }

  return (
    <>
      <div className="h-[20vh] bg-gradient-to-b from-banner from-0% to-transparent" />
      <section className="md:px-8 -mt-[28vh] md:-mt-[32vh] relative z-40 overflow-visible">
        <div className="flex justify-center items-center flex-wrap md:gap-4 translate-y-[5vh] mb-[8vh] md:mb-[12vh]">
          {processSteps.map((step, index) => {
            const isHashLink = step.href?.startsWith("/#");
            const LinkComponent = isHashLink ? HashLink : Link;
            const animationDelay = initialOrder.indexOf(index) * 0.2;

            return (
              <div key={index} className="flex items-center pt-1 md:pt-2">
                <LinkComponent to={step.href || "#"}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: animationDelay
                    }}
                    className={`flex flex-col items-center cursor-pointer transform transition-all duration-500 ${
                      activeVideo === index ? "scale-110" : "scale-100 opacity-70"
                    }`}
                  >
                    <div
                      className={`rounded-full overflow-hidden flex items-center justify-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] md:w-[14.4vh] md:h-[14.4vh] w-[6.8vh] h-[6.8vh] bg-white ${
                        activeVideo === index ? "ring-2 ring-accent" : ""
                      }`}
                    >
                      <video
                        ref={(el) => (videoRefs.current[index] = el)}
                        src={step.videoSrc}
                        className="object-cover"
                        muted
                        playsInline
                        style={{
                          pointerEvents: "none",
                          width: `${80 * (step.scale || 1)}%`,
                          height: `${80 * (step.scale || 1)}%`,
                        }}
                        tabIndex={-1}
                      />
                    </div>
                    <AnimatePresence>
                      {activeVideo === index && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="text-center text-[3vw] md:text-lg font-semibold text-accent"
                        >
                          {step.title}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </LinkComponent>

                {index < processSteps.length - 1 && (
                  <div className="flex items-center mx-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`relative w-4 h-4 md:w-10 md:h-10 md:mx-2 transition-all duration-300 ${
                        activeVideo === index ? "text-accent" : "text-gray-500"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

ProcessPreview.propTypes = {
  processData: PropTypes.shape({
    steps: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        videoSrc: PropTypes.string,
        href: PropTypes.string,
        scale: PropTypes.number,
      })
    ),
  }),
};

/* ======================================================
   EDITOR VIEW: ProcessEditorPanel
   ------------------------------------------------------
   This component lets the admin change the process steps,
   upload new MP4 videos, and adjust their properties.
========================================================= */
function ProcessEditorPanel({ localData, setLocalData, onSave }) {
  const [validationError, setValidationError] = useState("");
  const [previewVideos, setPreviewVideos] = useState([]);

  useEffect(() => {
    // Create object URLs for video previews
    const newPreviews = [];
    if (localData.steps) {
      localData.steps.forEach((step) => {
        if (step.videoFile) {
          newPreviews.push(URL.createObjectURL(step.videoFile));
        } else {
          newPreviews.push(step.videoSrc);
        }
      });
    }
    setPreviewVideos(newPreviews);

    // Clean up URLs on unmount
    return () => {
      previewVideos.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [localData.steps]);

  const handleSaveClick = () => {
    // Validate data before saving
    if (!localData.steps || localData.steps.length === 0) {
      setValidationError("At least one process step is required");
      return;
    }

    for (const step of localData.steps) {
      if (!step.title) {
        setValidationError("All steps must have a title");
        return;
      }

      if (!step.videoSrc && !step.videoFile) {
        setValidationError("All steps must have a video");
        return;
      }
    }

    setValidationError("");
    onSave();
  };

  const handleAddStep = () => {
    setLocalData((prev) => ({
      ...prev,
      steps: [
        ...(prev.steps || []),
        {
          title: "New Step",
          videoSrc: "/assets/videos/our_process_videos/booking.mp4",
          href: "#",
          scale: 1.0,
        },
      ],
    }));
  };

  const handleRemoveStep = (index) => {
    const updatedSteps = [...localData.steps];
    updatedSteps.splice(index, 1);
    setLocalData((prev) => ({
      ...prev,
      steps: updatedSteps,
    }));
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...localData.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value,
    };
    setLocalData((prev) => ({
      ...prev,
      steps: updatedSteps,
    }));
  };

  const handleVideoUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate that it's an MP4 file
    if (!file.type.includes("video/mp4")) {
      setValidationError("Only MP4 videos are supported");
      return;
    }

    const updatedSteps = [...localData.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      videoFile: file,
      // Store the file name for the saved file path
      fileName: file.name,
    };

    setLocalData((prev) => ({
      ...prev,
      steps: updatedSteps,
    }));
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg max-h-[75vh] overflow-auto">
      {/* Top bar with "Save" button */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-800 py-2 z-10">
        <h1 className="text-lg md:text-xl font-medium">Process Editor</h1>
        <button
          type="button"
          onClick={handleSaveClick}
          className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white font-medium"
        >
          Save
        </button>
      </div>

      {/* Validation error message */}
      {validationError && (
        <div className="bg-red-500 text-white p-2 mb-4 rounded">
          {validationError}
        </div>
      )}

      {/* Process Steps Editor */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Process Steps</h2>
          <button
            onClick={handleAddStep}
            className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
          >
            + Add Step
          </button>
        </div>

        {/* Steps List */}
        {localData.steps?.map((step, index) => (
          <div
            key={index}
            className="bg-gray-700 p-4 rounded border border-gray-600"
          >
            <div className="flex justify-between mb-3">
              <h3 className="text-lg font-medium">Step {index + 1}</h3>
              <button
                onClick={() => handleRemoveStep(index)}
                className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white text-sm"
                disabled={localData.steps.length <= 1}
              >
                Remove
              </button>
            </div>

            {/* Step Title */}
            <div className="mb-3">
              <label className="block text-sm mb-1">Title:</label>
              <input
                type="text"
                value={step.title || ""}
                onChange={(e) =>
                  handleStepChange(index, "title", e.target.value)
                }
                className="w-full bg-gray-600 px-3 py-2 rounded text-white"
              />
            </div>

            {/* Video Upload */}
            <div className="mb-3">
              <label className="block text-sm mb-1">Video:</label>
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => handleVideoUpload(index, e)}
                className="w-full bg-gray-600 px-3 py-2 rounded text-white"
              />
              {(step.videoSrc || previewVideos[index]) && (
                <div className="mt-2 border border-gray-500 rounded p-2">
                  <p className="text-sm text-gray-300 mb-2">
                    Current video: {step.fileName || step.videoSrc}
                  </p>
                  <video
                    src={previewVideos[index] || step.videoSrc}
                    className="w-full max-h-48 object-contain mt-2"
                    controls
                    muted
                  />
                </div>
              )}
            </div>

            {/* Link URL */}
            <div className="mb-3">
              <label className="block text-sm mb-1">
                Link URL: (use /# prefix for page anchors)
              </label>
              <input
                type="text"
                value={step.href || ""}
                onChange={(e) =>
                  handleStepChange(index, "href", e.target.value)
                }
                className="w-full bg-gray-600 px-3 py-2 rounded text-white"
                placeholder="e.g., /#booking or /about"
              />
            </div>

            {/* Scale Factor */}
            <div className="mb-3">
              <label className="block text-sm mb-1">
                Scale Factor: {step.scale || 1.0}
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={step.scale || 1.0}
                onChange={(e) =>
                  handleStepChange(index, "scale", parseFloat(e.target.value))
                }
                className="w-full bg-gray-600 rounded"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ProcessEditorPanel.propTypes = {
  localData: PropTypes.shape({
    steps: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        videoSrc: PropTypes.string,
        videoFile: PropTypes.object,
        fileName: PropTypes.string,
        href: PropTypes.string,
        scale: PropTypes.number,
      })
    ),
  }),
  setLocalData: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

/* ======================================================
   MAIN COMPONENT: ProcessBlock
   ------------------------------------------------------
   Main component that handles the state and switching between
   read-only preview and editable modes.
========================================================= */
export default function ProcessBlock({
  readOnly = false,
  processData = null,
  onConfigChange = () => {}
}) {
  const [localData, setLocalData] = useState(() => {
    // If no data provided, use empty object to be populated from fetch
    return processData || { steps: [] };
  });
  const [loading, setLoading] = useState(true);

  // Fetch combined_data.json when component mounts (if in read-only mode and no data is provided)
  useEffect(() => {
    if (readOnly && !processData) {
      console.log('ProcessBlock: Fetching data from combined_data.json');
      
      // Fetch directly from data directory
      fetch('/data/combined_data.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('ProcessBlock: Data fetched successfully', data.process);
          if (data.process) {
            setLocalData(data.process);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('ProcessBlock: Error fetching data:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [readOnly, processData]);

  const handleSave = () => {
    // Prepare data for saving - convert any file references to final paths
    const dataToSave = { ...localData };

    // For any step with a file upload, update the videoSrc path
    if (dataToSave.steps) {
      dataToSave.steps = dataToSave.steps.map((step) => {
        if (step.videoFile && step.fileName) {
          // Create a proper asset path for the video
          return {
            ...step,
            videoSrc: `/assets/videos/our_process_videos/${step.fileName}`,
            // Remove videoFile from the saved data
            videoFile: undefined,
            fileName: undefined,
          };
        }
        return step;
      });
    }

    if (onConfigChange) {
      onConfigChange(dataToSave);
    }
  };

  // Show loading indicator while fetching data
  if (loading) {
    return <div className="h-[20vh] flex items-center justify-center">Loading process data...</div>;
  }

  // If read-only mode, just show the preview with combined data if available
  if (readOnly) {
    return <ProcessPreview processData={localData} />;
  }

  // Otherwise show both editor and preview
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="md:w-1/2 order-2 md:order-1">
        <h3 className="text-sm text-gray-400 mb-2">Preview:</h3>
        <div className="border border-gray-300 rounded overflow-hidden bg-white">
          <ProcessPreview processData={localData} />
        </div>
      </div>
      <div className="md:w-1/2 order-1 md:order-2">
        <ProcessEditorPanel
          localData={localData}
          setLocalData={setLocalData}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

ProcessBlock.propTypes = {
  readOnly: PropTypes.bool,
  processData: PropTypes.shape({
    steps: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        videoSrc: PropTypes.string,
        href: PropTypes.string,
        scale: PropTypes.number,
      })
    ),
  }),
  onConfigChange: PropTypes.func,
};
