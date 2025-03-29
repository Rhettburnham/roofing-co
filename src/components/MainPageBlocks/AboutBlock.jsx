import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaUsers, FaHistory, FaAward, FaHandshake } from "react-icons/fa";

/* ======================================================
   READ-ONLY VIEW: AboutPreview
   ------------------------------------------------------
   This component shows the About section as a preview.
   It displays the content from aboutData with sections for
   company history, mission, values, and team.
========================================================= */
function AboutPreview({ aboutData }) {
  if (!aboutData) {
    return <p>No About data found.</p>;
  }

  const { title, subtitle, history, mission, values, team, heroImage, stats } =
    aboutData;

  // Format image path
  const formattedImage = heroImage
    ? typeof heroImage === "object"
      ? heroImage.url
      : `/assets/images/${heroImage.split("/").pop()}`
    : "/assets/images/about/about-hero.jpg";

  return (
    <div className="bg-white py-12">
      {/* Hero Section */}
      <div className="relative mb-16">
        <div
          className="w-full h-[40vh] bg-center bg-cover"
          style={{
            backgroundImage: `url(${formattedImage})`,
            backgroundPosition: "center 25%",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {title || "About Us"}
            </h1>
            <p className="text-xl md:text-2xl">
              {subtitle || "Our Story & Mission"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Display */}
      {stats && stats.length > 0 && (
        <div className="container mx-auto px-4 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg shadow-md text-center"
              >
                <div className="text-4xl text-accent mb-2">
                  {stat.icon === "FaUsers" && <FaUsers className="mx-auto" />}
                  {stat.icon === "FaHistory" && (
                    <FaHistory className="mx-auto" />
                  )}
                  {stat.icon === "FaAward" && <FaAward className="mx-auto" />}
                  {stat.icon === "FaHandshake" && (
                    <FaHandshake className="mx-auto" />
                  )}
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Sections */}
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* History Section */}
        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-accent">Our History</h2>
          <p className="mb-4">{history}</p>
        </div>

        {/* Mission Section */}
        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-accent">Our Mission</h2>
          <p className="mb-4">{mission}</p>
        </div>
      </div>

      {/* Values Section */}
      {values && values.length > 0 && (
        <div className="container mx-auto px-4 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-2 text-accent">
                  {value.title}
                </h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Section */}
      {team && team.length > 0 && (
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Our Leadership Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg shadow-md text-center"
              >
                <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                  <img
                    src={
                      member.photo
                        ? typeof member.photo === "object"
                          ? member.photo.url
                          : member.photo
                        : "/assets/images/team/default.png"
                    }
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1 text-accent">
                  {member.name}
                </h3>
                <p className="text-gray-600">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

AboutPreview.propTypes = {
  aboutData: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    history: PropTypes.string,
    mission: PropTypes.string,
    values: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
      })
    ),
    team: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        position: PropTypes.string,
        photo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      })
    ),
    heroImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    stats: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        icon: PropTypes.string,
      })
    ),
  }),
};

/* ======================================================
   EDITOR VIEW: AboutEditorPanel
   ------------------------------------------------------
   This component lets the admin edit all aspects of the
   about page including title, content, images, and team members.
========================================================= */
function AboutEditorPanel({ localData, setLocalData, onSave }) {
  const [activeTab, setActiveTab] = useState("general");

  const handleInputChange = (field, value) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleValueChange = (index, field, value) => {
    const updatedValues = [...localData.values];
    updatedValues[index] = {
      ...updatedValues[index],
      [field]: value,
    };
    setLocalData((prev) => ({
      ...prev,
      values: updatedValues,
    }));
  };

  const handleTeamMemberChange = (index, field, value) => {
    const updatedTeam = [...localData.team];
    updatedTeam[index] = {
      ...updatedTeam[index],
      [field]: value,
    };
    setLocalData((prev) => ({
      ...prev,
      team: updatedTeam,
    }));
  };

  const handleStatChange = (index, field, value) => {
    const updatedStats = [...localData.stats];
    updatedStats[index] = {
      ...updatedStats[index],
      [field]: field === "value" && !isNaN(value) ? Number(value) : value,
    };
    setLocalData((prev) => ({
      ...prev,
      stats: updatedStats,
    }));
  };

  const handleAddValue = () => {
    setLocalData((prev) => ({
      ...prev,
      values: [
        ...(prev.values || []),
        { title: "New Value", description: "Description of this value" },
      ],
    }));
  };

  const handleRemoveValue = (index) => {
    const updatedValues = [...localData.values];
    updatedValues.splice(index, 1);
    setLocalData((prev) => ({
      ...prev,
      values: updatedValues,
    }));
  };

  const handleAddTeamMember = () => {
    setLocalData((prev) => ({
      ...prev,
      team: [
        ...(prev.team || []),
        { name: "New Team Member", position: "Position" },
      ],
    }));
  };

  const handleRemoveTeamMember = (index) => {
    const updatedTeam = [...localData.team];
    updatedTeam.splice(index, 1);
    setLocalData((prev) => ({
      ...prev,
      team: updatedTeam,
    }));
  };

  const handleAddStat = () => {
    setLocalData((prev) => ({
      ...prev,
      stats: [
        ...(prev.stats || []),
        { title: "New Stat", value: 0, icon: "FaAward" },
      ],
    }));
  };

  const handleRemoveStat = (index) => {
    const updatedStats = [...localData.stats];
    updatedStats.splice(index, 1);
    setLocalData((prev) => ({
      ...prev,
      stats: updatedStats,
    }));
  };

  const handleHeroImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    setLocalData((prev) => ({
      ...prev,
      heroImage: {
        file: file,
        url: fileURL,
        name: file.name,
      },
    }));
  };

  const handleTeamPhotoUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    const updatedTeam = [...localData.team];
    updatedTeam[index] = {
      ...updatedTeam[index],
      photo: {
        file: file,
        url: fileURL,
        name: file.name,
      },
    };
    setLocalData((prev) => ({
      ...prev,
      team: updatedTeam,
    }));
  };

  const iconOptions = [
    { value: "FaUsers", label: "Users" },
    { value: "FaHistory", label: "History" },
    { value: "FaAward", label: "Award" },
    { value: "FaHandshake", label: "Handshake" },
  ];

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg max-h-[75vh] overflow-auto">
      {/* Top bar with tabs and save button */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-800 py-2 z-10">
        <div className="flex">
          <button
            className={`px-4 py-2 mr-2 ${
              activeTab === "general" ? "bg-gray-600" : "bg-gray-700"
            } rounded-md`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`px-4 py-2 mr-2 ${
              activeTab === "values" ? "bg-gray-600" : "bg-gray-700"
            } rounded-md`}
            onClick={() => setActiveTab("values")}
          >
            Values
          </button>
          <button
            className={`px-4 py-2 mr-2 ${
              activeTab === "team" ? "bg-gray-600" : "bg-gray-700"
            } rounded-md`}
            onClick={() => setActiveTab("team")}
          >
            Team
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "stats" ? "bg-gray-600" : "bg-gray-700"
            } rounded-md`}
            onClick={() => setActiveTab("stats")}
          >
            Stats
          </button>
        </div>
        <button
          type="button"
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-medium"
        >
          Save
        </button>
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="mb-4">
            <label className="block text-sm mb-1">Page Title:</label>
            <input
              type="text"
              value={localData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full bg-gray-700 px-3 py-2 rounded text-white"
              placeholder="About Us"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Subtitle:</label>
            <input
              type="text"
              value={localData.subtitle || ""}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              className="w-full bg-gray-700 px-3 py-2 rounded text-white"
              placeholder="Our Story & Mission"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Hero Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleHeroImageUpload}
              className="w-full bg-gray-700 px-3 py-2 rounded text-white"
            />
            {localData.heroImage && (
              <div className="mt-2 h-32 w-full overflow-hidden rounded border border-gray-600">
                <img
                  src={
                    typeof localData.heroImage === "object"
                      ? localData.heroImage.url
                      : localData.heroImage
                  }
                  alt="Hero preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">History:</label>
            <textarea
              value={localData.history || ""}
              onChange={(e) => handleInputChange("history", e.target.value)}
              className="w-full bg-gray-700 px-3 py-2 rounded text-white h-32"
              placeholder="Write about your company's history..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Mission:</label>
            <textarea
              value={localData.mission || ""}
              onChange={(e) => handleInputChange("mission", e.target.value)}
              className="w-full bg-gray-700 px-3 py-2 rounded text-white h-32"
              placeholder="Write about your company's mission..."
            />
          </div>
        </div>
      )}

      {/* Values Tab */}
      {activeTab === "values" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Our Values</h2>
            <button
              onClick={handleAddValue}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
            >
              + Add Value
            </button>
          </div>

          {(localData.values || []).map((value, index) => (
            <div
              key={index}
              className="bg-gray-700 p-4 rounded border border-gray-600"
            >
              <div className="flex justify-between mb-3">
                <h3 className="text-lg font-medium">Value {index + 1}</h3>
                <button
                  onClick={() => handleRemoveValue(index)}
                  className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="mb-3">
                <label className="block text-sm mb-1">Title:</label>
                <input
                  type="text"
                  value={value.title || ""}
                  onChange={(e) =>
                    handleValueChange(index, "title", e.target.value)
                  }
                  className="w-full bg-gray-600 px-3 py-2 rounded text-white"
                />
              </div>

              <div className="mb-1">
                <label className="block text-sm mb-1">Description:</label>
                <textarea
                  value={value.description || ""}
                  onChange={(e) =>
                    handleValueChange(index, "description", e.target.value)
                  }
                  className="w-full bg-gray-600 px-3 py-2 rounded text-white h-24"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Team Members</h2>
            <button
              onClick={handleAddTeamMember}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
            >
              + Add Team Member
            </button>
          </div>

          {(localData.team || []).map((member, index) => (
            <div
              key={index}
              className="bg-gray-700 p-4 rounded border border-gray-600"
            >
              <div className="flex justify-between mb-3">
                <h3 className="text-lg font-medium">Team Member {index + 1}</h3>
                <button
                  onClick={() => handleRemoveTeamMember(index)}
                  className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="mb-3">
                <label className="block text-sm mb-1">Name:</label>
                <input
                  type="text"
                  value={member.name || ""}
                  onChange={(e) =>
                    handleTeamMemberChange(index, "name", e.target.value)
                  }
                  className="w-full bg-gray-600 px-3 py-2 rounded text-white"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm mb-1">Position:</label>
                <input
                  type="text"
                  value={member.position || ""}
                  onChange={(e) =>
                    handleTeamMemberChange(index, "position", e.target.value)
                  }
                  className="w-full bg-gray-600 px-3 py-2 rounded text-white"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm mb-1">Photo:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleTeamPhotoUpload(index, e)}
                  className="w-full bg-gray-600 px-3 py-2 rounded text-white"
                />
                {member.photo && (
                  <div className="mt-2 h-20 w-20 overflow-hidden rounded-full">
                    <img
                      src={
                        typeof member.photo === "object"
                          ? member.photo.url
                          : member.photo
                      }
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Stats</h2>
            <button
              onClick={handleAddStat}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
            >
              + Add Stat
            </button>
          </div>

          {(localData.stats || []).map((stat, index) => (
            <div
              key={index}
              className="bg-gray-700 p-4 rounded border border-gray-600"
            >
              <div className="flex justify-between mb-3">
                <h3 className="text-lg font-medium">Stat {index + 1}</h3>
                <button
                  onClick={() => handleRemoveStat(index)}
                  className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="mb-3">
                <label className="block text-sm mb-1">Title:</label>
                <input
                  type="text"
                  value={stat.title || ""}
                  onChange={(e) =>
                    handleStatChange(index, "title", e.target.value)
                  }
                  className="w-full bg-gray-600 px-3 py-2 rounded text-white"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm mb-1">Value:</label>
                <input
                  type="text"
                  value={stat.value || ""}
                  onChange={(e) =>
                    handleStatChange(index, "value", e.target.value)
                  }
                  className="w-full bg-gray-600 px-3 py-2 rounded text-white"
                />
              </div>

              <div className="mb-1">
                <label className="block text-sm mb-1">Icon:</label>
                <select
                  value={stat.icon || "FaAward"}
                  onChange={(e) =>
                    handleStatChange(index, "icon", e.target.value)
                  }
                  className="w-full bg-gray-600 px-3 py-2 rounded text-white"
                >
                  {iconOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

AboutEditorPanel.propTypes = {
  localData: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    history: PropTypes.string,
    mission: PropTypes.string,
    values: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
      })
    ),
    team: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        position: PropTypes.string,
        photo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      })
    ),
    heroImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    stats: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        icon: PropTypes.string,
      })
    ),
  }),
  setLocalData: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

/* ======================================================
   MAIN COMPONENT: AboutBlock
   ------------------------------------------------------
   Main component that handles the state and switching between
   read-only preview and editable modes.
========================================================= */
export default function AboutBlock({
  readOnly = false,
  aboutData,
  onConfigChange,
}) {
  // Initialize with default data if none provided
  const [localData, setLocalData] = useState(() => {
    if (!aboutData) {
      return {
        title: "About Cowboys-Vaqueros Construction",
        subtitle: "Building Trust Since 2012",
        history:
          "Founded in 2012, Cowboys-Vaqueros Construction has grown from a small family business to one of the most trusted roofing companies in the region. With a focus on quality craftsmanship and customer satisfaction, we've built a reputation for excellence in both residential and commercial roofing.",
        mission:
          "Our mission is to provide the highest quality roofing services with integrity, exceptional customer service, and a commitment to excellence. We strive to build lasting relationships with our clients based on trust, reliability, and outstanding results.",
        values: [
          {
            title: "Quality",
            description:
              "We never compromise on quality, using only the best materials and techniques in every project.",
          },
          {
            title: "Integrity",
            description:
              "We believe in honest communication, fair pricing, and standing behind our work.",
          },
          {
            title: "Community",
            description:
              "We're proud to serve our local community and contribute to making homes safer and more beautiful.",
          },
        ],
        team: [
          {
            name: "Luis Aguilar-Lopez",
            position: "Owner",
            photo: "/assets/images/team/roofer.png",
          },
          {
            name: "Erika Salinas",
            position: "Manager",
            photo: "/assets/images/team/foreman.png",
          },
        ],
        stats: [
          {
            title: "Years in Business",
            value: 11,
            icon: "FaHistory",
          },
          {
            title: "Completed Projects",
            value: 550,
            icon: "FaAward",
          },
          {
            title: "Happy Clients",
            value: 500,
            icon: "FaUsers",
          },
          {
            title: "Team Members",
            value: 15,
            icon: "FaHandshake",
          },
        ],
        heroImage: "/assets/images/about/about-hero.jpg",
      };
    }
    return { ...aboutData };
  });

  const handleSave = () => {
    if (onConfigChange) {
      onConfigChange(localData);
    }
  };

  // If read-only mode, just show the preview
  if (readOnly) {
    return <AboutPreview aboutData={aboutData || localData} />;
  }

  // Otherwise show both editor and preview
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="md:w-1/2 order-2 md:order-1">
        <h3 className="text-sm text-gray-400 mb-2">Preview:</h3>
        <div className="border border-gray-300 rounded overflow-hidden bg-white">
          <AboutPreview aboutData={localData} />
        </div>
      </div>
      <div className="md:w-1/2 order-1 md:order-2">
        <AboutEditorPanel
          localData={localData}
          setLocalData={setLocalData}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

AboutBlock.propTypes = {
  readOnly: PropTypes.bool,
  aboutData: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    history: PropTypes.string,
    mission: PropTypes.string,
    values: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
      })
    ),
    team: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        position: PropTypes.string,
        photo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      })
    ),
    heroImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    stats: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        icon: PropTypes.string,
      })
    ),
  }),
  onConfigChange: PropTypes.func,
};

AboutBlock.defaultProps = {
  readOnly: false,
  aboutData: null,
  onConfigChange: null,
};
