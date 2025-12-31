## Mind Map Visualizer

An interactive single-page web application for visualizing hierarchical data as a mind map.
Users can explore nodes, edit summaries, toggle light/dark themes, and export the updated structure back to JSON.

The application is fully client-side, data-driven, and designed with clean UI/UX principles.

### Tech Stack
- HTML5, CSS3
- JavaScript (ES6+)
- SVG
- D3.js (v7)

### Features
- Hierarchical visualization using d3.hierarchy and d3.tree
- Node interaction and summary editing
- Light and dark theme support (CSS variables)
- Zoom and pan interactions
- Export updated mind map to JSON
- Drill-down navigation was intentionally omitted to prioritize clarity, stability, and high-quality core interactions within the project scope.

### Architecture
- JSON-based data model as the single source of truth
- Data-driven rendering using D3.js
- Clear separation of structure (HTML), styling (CSS), logic (JS), and data (JSON)
- Fully client-side for fast and portable deployment

### How to Run
Open `index.html` in a browser or use Live Server.
