# Satellite Visualization
A tool to visualize and explore all satellites from the [Celestrak](https://celestrak.org/) NORAD GP element sets. View all satellites simultaneously at a targeted 60 fps in browser, search for satellites of interest, and view individual satellites in orbit.

![main screenshot](https://github.com/Jeff0Brewer/readme-img/blob/main/sat-vis/sat-vis-overview.jpg?raw=true)

Visit the current version at [sat-vis.app](https://www.sat-vis.app/)

---

## Features
View full catalog of satellites by default, use mouse dragging and scrolling to rotate and zoom camera position. Interactions are provided to accelerate orbit propagation or view satellites in their current position.
<p align="center">
    <img src="https://github.com/Jeff0Brewer/readme-img/blob/main/sat-vis/epoch-controls.jpg?raw=true" alt="epoch controls" width="300"/>
</p>

Search for satellites by name, NORAD id, or satellite type. Click satellites in the visualization to view their information in the catalog.

![catalog](https://github.com/Jeff0Brewer/readme-img/blob/main/sat-vis/catalog-starlink.jpg?raw=true)

Adjust camera reference frame to view satellites from a distance or follow individual satellites through their orbit.

![follow](https://github.com/Jeff0Brewer/readme-img/blob/main/sat-vis/follow-iss.jpg?raw=true)

---

## Implementation
Orbital elements for position calculation are obtained from TLE (Two-Line Element set) data, a standardized format containing values used in the SGP4 orbital model. TLEs provide the required information for orbital propagation, but propagating over large time scales accumulates error, so TLEs are updated daily from the [Celestrak](https://celestrak.org/) api.

The orbital calculation is handled by [satellite.js](https://github.com/shashwatak/satellite-js), a javascript implementation of the SGP4 orbital model. Since the SGP4 model is quite complex and computationally expensive for large sets of satellites, propagation is done in web worker threads to utilize multi-core cpus.

Visualization is done in WebGL, with Earth textures from [NASA blue marble](https://visibleearth.nasa.gov/images/73909/december-blue-marble-next-generation-w-topography-and-bathymetry) and Milky Way textures from [Gaia star map](https://sci.esa.int/s/ApPJaGA).
