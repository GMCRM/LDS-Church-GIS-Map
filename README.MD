# Overview

I built this project to push my skills as a software engineer who wants to learn more about web GIS, data pipelines, and mapping user experiences.

The application is a browser-based map that plots LDS (Latter-day Saints) temples and meetinghouses using ArcGIS JS for rendering and live OpenStreetMap data retrieved through the Overpass API. Open the page, wait for the data to load, and click markers to read building details; filter controls let you switch between all sites, temples, or meetinghouses. The data comes directly from OpenStreetMap via Overpass queries, so results reflect what is currently mapped by the community.

My purpose was to practice building a lightweight mapping workflow end-to-end: from querying live geospatial data, to shaping it for display, to presenting it in a clear, simple UI.

Here is the link to the 4–5 minute walkthrough of the app running and the code structure:

[Software Demo Video](https://youtu.be/qB473Wks-M4)

# Development Environment

I used VS Code with Live Server for quick reloads, Git for version control, and a modern browser for testing.

The project is written in HTML, CSS, and JavaScript (ES6). It relies on the ArcGIS JavaScript API 4.28 for map rendering and uses the Overpass API (OpenStreetMap) for live data; the Fetch API handles requests and plain DOM APIs drive the UI.

# Useful Websites

* [ArcGIS JS API Guide](https://developers.arcgis.com/javascript/latest/)
* [Overpass Turbo Wizard](https://overpass-turbo.eu/)
* [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

# Future Work

* Add client-side clustering to keep dense areas readable.
* Implement a search box for jumping to a city or address.
* Improve Overpass rate-limit handling with smarter backoff and caching.
