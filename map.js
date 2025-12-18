// MAP MANAGEMENT
// ArcGIS Map initialization and control

// Global variables for map components
let map = null;
let view = null;
let graphicsLayer = null;
let allBuildings = [];
let currentFilter = "all";

// Initialize the ArcGIS map view
function initializeMap(centerLat = 39.0997, centerLon = -94.5786) {
  return new Promise((resolve, reject) => {
    require([
      "esri/Map",
      "esri/views/MapView",
      "esri/layers/GraphicsLayer",
      "esri/Graphic",
      "esri/geometry/Point",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/symbols/TextSymbol",
    ], function (
      Map,
      MapView,
      GraphicsLayer,
      Graphic,
      Point,
      SimpleMarkerSymbol,
      TextSymbol
    ) {
      // Store classes globally for use in other functions
      window.ArcGISModules = {
        Map,
        MapView,
        GraphicsLayer,
        Graphic,
        Point,
        SimpleMarkerSymbol,
        TextSymbol,
      };

      try {
        // Create graphics layer for markers
        graphicsLayer = new GraphicsLayer();

        // Create the map
        map = new Map({
          basemap: "streets-navigation-vector",
          layers: [graphicsLayer],
        });

        // Create the map view
        view = new MapView({
          container: "viewDiv",
          map: map,
          center: [centerLon, centerLat],
          zoom: 8,
          popup: {
            dockEnabled: true,
            dockOptions: {
              buttonEnabled: false,
              breakpoint: false,
            },
          },
        });

        // Wait for view to load
        view
          .when(() => {
            logInfo("Map view loaded successfully");
            resolve({ map, view, graphicsLayer });
          })
          .catch((error) => {
            console.error("❌ Error loading map view:", error);
            reject(error);
          });
      } catch (error) {
        console.error("❌ Error initializing map:", error);
        reject(error);
      }
    }, (error) => {
      console.error("❌ Error loading ArcGIS modules:", error);
      reject(error);
    });
  });
}

// Create a marker symbol for a building
function createMarkerSymbol(type) {
  const { SimpleMarkerSymbol } = window.ArcGISModules;

  const isTemple = type === "temple";

  return new SimpleMarkerSymbol({
    style: isTemple ? "diamond" : "circle",
    color: isTemple ? [255, 215, 0, 0.8] : [65, 105, 225, 0.8], // Gold for temples, Royal blue for meetinghouses
    size: isTemple ? 16 : 12,
    outline: {
      color: [255, 255, 255, 0.9],
      width: 2,
    },
  });
}

// Add a building marker to the map
function addBuildingMarker(building) {
  const { Graphic, Point } = window.ArcGISModules;

  // Create point geometry
  const point = new Point({
    longitude: building.lon,
    latitude: building.lat,
  });

  // Create symbol
  const symbol = createMarkerSymbol(building.type);

  // Create popup template
  const popupTemplate = {
    title: building.name,
    content: createPopupContent(building),
  };

  // Create graphic
  const graphic = new Graphic({
    geometry: point,
    symbol: symbol,
    attributes: building,
    popupTemplate: popupTemplate,
  });

  // Add to graphics layer
  graphicsLayer.add(graphic);

  return graphic;
}

// Load all buildings onto the map
function loadBuildingsOnMap(buildings) {
  console.log("loadBuildingsOnMap called with:", buildings.length, "buildings");
  logInfo("Loading buildings on map", { count: buildings.length });

  // Store buildings globally
  allBuildings = buildings;
  console.log("Buildings stored globally");

  // Clear existing graphics
  console.log("Clearing existing graphics...");
  graphicsLayer.removeAll();

  // Add each building as a marker
  console.log("Adding buildings as markers...");
  buildings.forEach((building, index) => {
    console.log(
      `Adding building ${index + 1}/${buildings.length}:`,
      building.name
    );
    addBuildingMarker(building);
  });
  console.log("✅ All buildings added to map");

  // Zoom to show all markers if buildings exist
  if (buildings.length > 0) {
    zoomToBuildings(buildings);
  }

  logInfo("Buildings loaded successfully");
}

// Zoom map to fit all buildings
function zoomToBuildings(buildings) {
  if (!buildings || buildings.length === 0) return;

  // Calculate bounds
  const lats = buildings.map((b) => b.lat);
  const lons = buildings.map((b) => b.lon);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;

  // Calculate appropriate zoom level based on spread
  const latSpread = maxLat - minLat;
  const lonSpread = maxLon - minLon;
  const maxSpread = Math.max(latSpread, lonSpread);

  let zoom = 10;
  if (maxSpread > 10) zoom = 4;
  else if (maxSpread > 5) zoom = 5;
  else if (maxSpread > 2) zoom = 6;
  else if (maxSpread > 1) zoom = 7;
  else if (maxSpread > 0.5) zoom = 8;
  else if (maxSpread > 0.1) zoom = 10;

  // Animate to new view
  view.goTo({
    center: [centerLon, centerLat],
    zoom: zoom,
  });
}

// Filter buildings by type
function filterBuildings(filterType) {
  currentFilter = filterType;
  logInfo("Filtering buildings", { filter: filterType });

  // Clear current graphics
  graphicsLayer.removeAll();

  // Filter buildings
  let filteredBuildings = allBuildings;
  if (filterType === "temple") {
    filteredBuildings = allBuildings.filter((b) => b.type === "temple");
  } else if (filterType === "meetinghouse") {
    filteredBuildings = allBuildings.filter((b) => b.type === "meetinghouse");
  }

  // Re-add filtered markers
  filteredBuildings.forEach((building) => {
    addBuildingMarker(building);
  });

  // Update statistics
  const templeCount = allBuildings.filter((b) => b.type === "temple").length;
  const meetinghouseCount = allBuildings.filter(
    (b) => b.type === "meetinghouse"
  ).length;
  updateStats(
    allBuildings.length,
    filteredBuildings.length,
    templeCount,
    meetinghouseCount
  );

  logInfo("Filter applied", { showing: filteredBuildings.length });
}

// Get counts of buildings by type
function getBuildingCounts() {
  const temples = allBuildings.filter((b) => b.type === "temple").length;
  const meetinghouses = allBuildings.filter(
    (b) => b.type === "meetinghouse"
  ).length;

  return {
    total: allBuildings.length,
    temples: temples,
    meetinghouses: meetinghouses,
  };
}
