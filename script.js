// MAIN APPLICATION SCRIPT
// LDS Church Buildings Map
// Entry point and event handlers

// Configuration
const CONFIG = {
  // Default center: Kansas City, Missouri (local)
  defaultCenter: {
    lat: 39.0997,
    lon: -94.5786,
  },
  // Search radius in meters (100km = ~62 miles)
  searchRadius: 100000,
};

// Main initialization function
async function init() {
  logInfo("LDS Church Buildings Map starting...");

  try {
    // Show loading spinner
    toggleSpinner(true);
    toggleError(false);

    // Initialize the map
    logInfo("Initializing map...");
    await initializeMap(CONFIG.defaultCenter.lat, CONFIG.defaultCenter.lon);

    // Fetch building data
    logInfo("Fetching building data...");
    const buildings = await fetchLDSBuildings(
      CONFIG.defaultCenter.lat,
      CONFIG.defaultCenter.lon,
      CONFIG.searchRadius
    );

    // Check if we got any data
    if (!buildings || buildings.length === 0) {
      throw new Error("No buildings found in the specified area");
    }

    // Load buildings onto the map
    loadBuildingsOnMap(buildings);

    // Update statistics
    const counts = getBuildingCounts();
    updateStats(
      counts.total,
      counts.total,
      counts.temples,
      counts.meetinghouses
    );

    // Hide loading spinner
    toggleSpinner(false);

    logInfo("=== Map loaded successfully ===", counts);
  } catch (error) {
    console.error("❌ ERROR initializing application:", error);
    console.error("Error details:", error.message);
    console.error("Stack trace:", error.stack);
    toggleSpinner(false);
    toggleError(true);
  }
}

// Set up event listeners for UI controls
function setupEventListeners() {
  // Filter buttons
  const btnAll = document.getElementById("btn-all");
  const btnTemples = document.getElementById("btn-temples");
  const btnMeetinghouses = document.getElementById("btn-meetinghouses");

  // Button click handlers
  btnAll?.addEventListener("click", () => {
    setActiveButton("btn-all");
    filterBuildings("all");
  });

  btnTemples?.addEventListener("click", () => {
    setActiveButton("btn-temples");
    filterBuildings("temple");
  });

  btnMeetinghouses?.addEventListener("click", () => {
    setActiveButton("btn-meetinghouses");
    filterBuildings("meetinghouse");
  });

  logInfo("Event listeners set up");
}

// Set the active state for filter buttons
function setActiveButton(activeButtonId) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    if (btn.id === activeButtonId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Toggle between data sources
function toggleDataSource() {
  CONFIG.useSampleData = !CONFIG.useSampleData;
  logInfo(
    `Data source switched to: ${CONFIG.useSampleData ? "Sample" : "Live API"}`
  );
  init(); // Re-initialize with new data source
}

// Update search radius (km) and reload data
function updateSearchRadius(radiusKm) {
  CONFIG.searchRadius = radiusKm * 1000; // Convert to meters
  logInfo(`Search radius updated to ${radiusKm}km`);
  init(); // Re-initialize with new radius
}

// ====================================
// Application Start
// ====================================

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    init();
  });
} else {
  // DOM already loaded
  setupEventListeners();
  init();
}

// Log app info
console.log(
  "%c LDS Church Buildings Map ",
  "background: #3b82f6; color: white; font-size: 16px; padding: 5px;"
);
console.log("Created with ArcGIS JavaScript API and Overpass API");
console.log(
  "For development: Use toggleDataSource() to switch between sample and live data"
);
console.log(
  "For development: Use updateSearchRadius(km) to change search area"
);
