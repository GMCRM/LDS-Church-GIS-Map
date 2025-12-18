// UTILITY FUNCTIONS
// Helper functions for data processing

// Determine the type of church building
function getBuildingType(tags) {
  // Check if it's a temple based on name or specific tags
  const name = (tags.name || "").toLowerCase();
  const denomination = (tags.denomination || "").toLowerCase();
  const building = (tags.building || "").toLowerCase();

  // Temple indicators
  if (
    name.includes("temple") ||
    denomination.includes("temple") ||
    building === "temple" ||
    (tags.amenity === "place_of_worship" && name.includes("temple"))
  ) {
    return "temple";
  }

  return "meetinghouse";
}

// Format an address from OSM tags
function formatAddress(tags) {
  const parts = [];

  if (tags["addr:housenumber"] && tags["addr:street"]) {
    parts.push(`${tags["addr:housenumber"]} ${tags["addr:street"]}`);
  } else if (tags["addr:street"]) {
    parts.push(tags["addr:street"]);
  }

  if (tags["addr:city"]) {
    parts.push(tags["addr:city"]);
  }

  if (tags["addr:state"]) {
    parts.push(tags["addr:state"]);
  }

  if (tags["addr:postcode"]) {
    parts.push(tags["addr:postcode"]);
  }

  return parts.length > 0 ? parts.join(", ") : "Address not available";
}

// Create popup content HTML for a building
function createPopupContent(properties) {
  return `
        <div class="popup-content">
            <div class="popup-row">
                <span class="popup-label">Type:</span>
                <span class="popup-value">${
                  properties.type === "temple" ? "🏛️ Temple" : "⛪ Meetinghouse"
                }</span>
            </div>
            ${
              properties.address !== "Address not available"
                ? `
            <div class="popup-row">
                <span class="popup-label">Address:</span>
                <span class="popup-value">${properties.address}</span>
            </div>
            `
                : ""
            }
            ${
              properties.denomination
                ? `
            <div class="popup-row">
                <span class="popup-label">Denomination:</span>
                <span class="popup-value">${properties.denomination}</span>
            </div>
            `
                : ""
            }
            <div class="popup-row">
                <span class="popup-label">Coordinates:</span>
                <span class="popup-value">${properties.lat.toFixed(
                  4
                )}, ${properties.lon.toFixed(4)}</span>
            </div>
        </div>
    `;
}

// Show/hide the loading spinner
function toggleSpinner(show) {
  const spinner = document.getElementById("loading-spinner");
  if (spinner) {
    if (show) {
      spinner.classList.remove("hidden");
    } else {
      spinner.classList.add("hidden");
    }
  }
}

// Show/hide the error message
function toggleError(show) {
  const error = document.getElementById("error-message");
  if (error) {
    if (show) {
      error.classList.remove("hidden");
    } else {
      error.classList.add("hidden");
    }
  }
}

// Update the statistics display
function updateStats(total, visible, temples, meetinghouses) {
  const statsText = document.getElementById("stats-text");
  if (statsText) {
    statsText.textContent = `Showing ${visible} of ${total} buildings (${temples} temples, ${meetinghouses} meetinghouses)`;
  }
}

// Debounce helper to limit rapid function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Log information to console with a timestamp
function logInfo(message, data = null) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`, data || "");
}
