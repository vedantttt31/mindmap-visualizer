
Overview
This project is an interactive Mind Map Visualizer built as a single-page web application. It allows users to visually explore hierarchical data, interact with nodes, edit summaries, toggle light and dark themes, and export the updated structure back to JSON. The application is fully client-side, data-driven, and designed with scalability and clean UI/UX principles.

Technologies Used
The application uses HTML5 for structure, including the SVG canvas, controls, and side panel. CSS3 is used for responsive layout, theming, typography, and micro-interactions, with light and dark themes implemented using CSS variables. JavaScript (ES6+) handles state management, user interactions, data updates, and rendering logic. SVG is used to ensure scalable and high-performance visualization.

Libraries Used
The visualization is powered by D3.js (v7), which renders hierarchical data using d3.hierarchy and d3.tree, and manages node positioning, links, zooming, panning, and efficient updates. D3.js was chosen for its precise control over data-driven SVG visualizations. html2canvas is included to support future features such as exporting the mind map as an image, enabling extensibility without architectural changes.

Architecture and Data Flow
The application follows a data-driven architecture where mindmap.json acts as the single source of truth. UI rendering is entirely derived from the data model, with a clear separation of concerns between structure (HTML), styling (CSS), logic (JavaScript), and data (JSON). Global state variables ensure predictable updates and safe export.
At runtime, JSON data is loaded using fetch(), converted into a D3 hierarchy, and rendered as SVG nodes and links. User interactions update the hierarchy in real time, and before export, the updated structure is synchronized back to JSON and downloaded locally.

Key Design Decisions
The project is fully client-side with no backend to ensure fast, portable deployment. A single source of truth guarantees consistent data state, while the D3 hierarchy model allows scalability for larger trees. CSS variables enable maintainable theming, and modular JavaScript supports easy feature expansion. Drill-down navigation was intentionally omitted to prioritize clarity, stability, and high-quality core interactions within the project scope.
