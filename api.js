// OVERPASS API INTEGRATION
// Fetches LDS church building data

// Overpass API endpoints (fallback sequence)
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter"
];

// Small helper to pause between retries
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Builds an Overpass QL query for LDS buildings
function buildOverpassQuery(lat, lon, radius = 100000) {
  // Query for LDS/Mormon churches within radius
  // Searches for various tags that indicate LDS buildings
  return `
        [out:json][timeout:60];
        (
          node["amenity"="place_of_worship"]["denomination"="mormon"](around:${radius},${lat},${lon});
          way["amenity"="place_of_worship"]["denomination"="mormon"](around:${radius},${lat},${lon});
          relation["amenity"="place_of_worship"]["denomination"="mormon"](around:${radius},${lat},${lon});
          
          node["amenity"="place_of_worship"]["denomination"="latter_day_saints"](around:${radius},${lat},${lon});
          way["amenity"="place_of_worship"]["denomination"="latter_day_saints"](around:${radius},${lat},${lon});
          relation["amenity"="place_of_worship"]["denomination"="latter_day_saints"](around:${radius},${lat},${lon});
          
          node["amenity"="place_of_worship"]["religion"="christian"]["denomination"="mormon"](around:${radius},${lat},${lon});
          way["amenity"="place_of_worship"]["religion"="christian"]["denomination"="mormon"](around:${radius},${lat},${lon});
          
          node["building"="temple"]["denomination"="mormon"](around:${radius},${lat},${lon});
          way["building"="temple"]["denomination"="mormon"](around:${radius},${lat},${lon});
        );
        out center;
    `;
}

// Fetch LDS building data from Overpass API
async function fetchLDSBuildings(
  lat = 39.0997,
  lon = -94.5786,
  radius = 100000
) {
  logInfo("Fetching LDS buildings from Overpass API...", { lat, lon, radius });

  try {
    const query = buildOverpassQuery(lat, lon, radius);
    let lastError = null;

    for (let i = 0; i < OVERPASS_ENDPOINTS.length; i++) {
      const endpoint = OVERPASS_ENDPOINTS[i];
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `data=${encodeURIComponent(query)}`,
        });

        if (response.status === 429) {
          lastError = new Error("Rate limited (429)");
          // Brief backoff before trying next endpoint
          await sleep(1200 + Math.random() * 400);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        logInfo("Received response from Overpass API", {
          elements: data.elements.length,
          endpoint,
        });

        const buildings = processOverpassData(data.elements);
        logInfo("Processed buildings", { count: buildings.length });
        return buildings;
      } catch (err) {
        lastError = err;
        // Try next endpoint
      }
    }

    if (lastError) {
      throw lastError;
    }
    throw new Error("Overpass request failed");
  } catch (error) {
    console.error("Error fetching LDS buildings:", error);
    throw error;
  }
}

// Process raw Overpass elements into building objects
function processOverpassData(elements) {
  const buildings = [];
  const seenLocations = new Set(); // Prevent duplicates

  elements.forEach((element) => {
    let lat, lon;

    // Extract coordinates based on element type
    if (element.type === "node") {
      lat = element.lat;
      lon = element.lon;
    } else if (element.center) {
      lat = element.center.lat;
      lon = element.center.lon;
    } else {
      return; // Skip if no coordinates
    }

    // Create unique key to prevent duplicates
    const locationKey = `${lat.toFixed(5)},${lon.toFixed(5)}`;
    if (seenLocations.has(locationKey)) {
      return;
    }
    seenLocations.add(locationKey);

    // Extract tags
    const tags = element.tags || {};

    // Build the building object
    const building = {
      id: element.id,
      lat: lat,
      lon: lon,
      name: tags.name || tags["name:en"] || "LDS Building",
      type: getBuildingType(tags),
      address: formatAddress(tags),
      denomination: tags.denomination || "mormon",
      religion: tags.religion || "christian",
      tags: tags,
    };

    buildings.push(building);
  });

  return buildings;
}
