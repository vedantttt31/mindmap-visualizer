/* =====
   GLOBAL HELPERS
==== */

/**
 * Sync the D3 hierarchy back to raw JSON data.
 * This is required before exporting or saving changes.
 */
function updateRawDataFromRoot() {
    rawData = originalRoot.data;
}


/* =========================================================
   APP ENTRY POINT – LOAD DATA
========================================================= */

/**
 * Load mindmap data from JSON
 * This is the single source of truth for the app
 */
fetch("data/mindmap.json")
    .then(res => res.json())
    .then(data => {
        rawData = data;     // store original JSON
        initMindMap(data);  // start app
    });


/* =========================================================
   GLOBAL STATE (shared across functions)
========================================================= */

let selectedNode = null;   // currently selected SVG node
let originalRoot = null;   // full tree (never changes)
let currentRoot = null;    // currently rendered tree
let rootStack = [];        // (reserved for drill-down later)
let rawData = null;        // editable JSON data


/* =========================================================
   MAIN APPLICATION FUNCTION
========================================================= */

function initMindMap(data) {

    /* =====================================================
       BASIC SVG SETUP
    ===================================================== */

    const width = document.getElementById("mindmap").clientWidth;
    const height = document.getElementById("mindmap").clientHeight;

    const svg = d3
        .select("#mindmap")
        .attr("width", width)
        .attr("height", height);

    // Background rectangle (theme aware)
    svg.append("rect")
        .attr("class", "svg-bg")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "var(--canvas-bg)");

    const margin = { top: 40, right: 40, bottom: 40, left: 80 };
    const g = svg.append("g");


    /* =====================================================
       ZOOM & PAN BEHAVIOR
    ===================================================== */

    const initialTransform = d3.zoomIdentity
        .translate(margin.left, height / 2);

    const zoom = d3.zoom()
        .scaleExtent([0.4, 2])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });

    svg.call(zoom);
    svg.call(zoom.transform, initialTransform);

    // Reset zoom button
    document.getElementById("reset-view").addEventListener("click", () => {
        svg.transition()
            .duration(500)
            .call(zoom.transform, initialTransform);
    });

    // Click on empty canvas → deselect node
    svg.on("click", () => {
        if (selectedNode) {
            d3.select(selectedNode).classed("selected", false);
            selectedNode = null;
        }

        document.getElementById("side-panel-content").innerHTML = `
            <h2>Select a node</h2>
            <p>Click any node to see details.</p>
        `;
    });


    /* =====================================================
       THEME TOGGLE (LIGHT / DARK)
    ===================================================== */

    const toggleBtn = document.getElementById("theme-toggle");

    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    toggleBtn.textContent = savedTheme === "dark" ? "☀️ Light" : "🌙 Dark";

    toggleBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        toggleBtn.textContent = next === "dark" ? "☀️ Light" : "🌙 Dark";
    });


    /* =====================================================
       TOOLTIP (NODE HOVER)
    ===================================================== */

    const tooltip = d3.select("#tooltip");

    function showTooltip(event, d) {
        tooltip
            .style("opacity", 1)
            .html(`
            <strong>${d.data.label}</strong><br/>
            ${d.data.shortSummary || "No summary"}
        `);
        moveTooltip(event);
    }


    function moveTooltip(event) {
        tooltip
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY + 12 + "px");
    }

    function hideTooltip() {
        tooltip.style("opacity", 0);
    }


    /* =====================================================
       SIDE PANEL – NODE DETAILS & EDITING
    ===================================================== */

    function handleNodeClick(d, element) {

        // Highlight selected node
        if (selectedNode) {
            d3.select(selectedNode).classed("selected", false);
        }
        d3.select(element).classed("selected", true);
        selectedNode = element;

        // Render side panel
        document.getElementById("side-panel-content").innerHTML = `
    <h2>${d.data.label}</h2>

    <div id="summary-view" class="summary-card">
        <div class="summary-text">
            ${d.data.longSummary || "No detailed summary available."}
        </div>
        <div class="summary-actions">
            <button id="edit-btn">✏️ Edit Summary</button>
        </div>
    </div>

    <div id="summary-edit" style="display:none;">
        <textarea id="summary-input">${d.data.longSummary || ""}</textarea>
        <div class="actions">
            <button id="save-btn">💾 Save</button>
            <button id="delete-btn">🗑 Delete</button>
            <button id="cancel-btn">❌ Cancel</button>
        </div>
    </div>
`;


        // Edit summary
        document.getElementById("edit-btn").onclick = () => {
            document.getElementById("summary-view").style.display = "none";
            document.getElementById("summary-edit").style.display = "block";
        };

        // Cancel edit
        document.getElementById("cancel-btn").onclick = () => {
            document.getElementById("summary-edit").style.display = "none";
            document.getElementById("summary-view").style.display = "block";
        };

        // Save summary
        document.getElementById("save-btn").onclick = () => {
            const newSummary = document.getElementById("summary-input").value.trim();

            d.data.longSummary = newSummary;

            updateRawDataFromRoot();
            update();

            document.getElementById("summary-edit").style.display = "none";
            document.getElementById("summary-view").style.display = "block";
        };


        // Delete node
        document.getElementById("delete-btn").onclick = () => {

            if (!d.parent) {
                alert("Root node cannot be deleted.");
                return;
            }

            if (!confirm("Are you sure you want to delete this node?")) return;

            d.parent.children = d.parent.children.filter(child => child !== d);
            selectedNode = null;

            document.getElementById("side-panel-content").innerHTML = `
                <h2>Select a node</h2>
                <p>Click any node to see details.</p>
            `;

            update();
        };
    }


    /* =====================================================
       TREE HIERARCHY SETUP
    ===================================================== */

    const root = d3.hierarchy(data);
    originalRoot = root;
    currentRoot = root;

    root.children?.forEach(collapse);

    function collapse(node) {
        if (node.children) {
            node._children = node.children;
            node._children.forEach(collapse);
            node.children = null;
        }
    }

    function collapseAll(node) {
        if (node.children) {
            node.children.forEach(collapseAll);
            node._children = node.children;
            node.children = null;
        }
    }

    function expandAll(node) {
        if (node._children) {
            node.children = node._children;
            node._children = null;
        }
        node.children?.forEach(expandAll);
    }

    document.getElementById("collapse-all").addEventListener("click", () => {
        root.children?.forEach(collapseAll);
        update();
    });

    document.getElementById("expand-all").addEventListener("click", () => {
        expandAll(root);
        update();
    });


    /* =====================================================
       D3 TREE RENDERING
    ===================================================== */

    const treeLayout = d3.tree().nodeSize([70, 180]);

    function update() {

        treeLayout(root);

        g.selectAll(".link").remove();
        g.selectAll(".node").remove();

        // Links
        g.selectAll(".link")
            .data(root.links())
            .enter()
            .append("line")
            .attr("class", "link")
            .attr("x1", d => d.source.y)
            .attr("y1", d => d.source.x)
            .attr("x2", d => d.target.y)
            .attr("y2", d => d.target.x);

        // Nodes
        const node = g.selectAll(".node")
            .data(root.descendants(), d => d.data.id)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.y}, ${d.x})`)
            .on("click", (event, d) => {
                event.stopPropagation();
                toggleNode(d);
                handleNodeClick(d, event.currentTarget);
            })
            .on("mouseenter", (event, d) => showTooltip(event, d))
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip);

        node.append("circle")
            .attr("r", 18)
            .attr("fill", d => d._children ? "#16a34a" : "#4f46e5");

        node.append("text")
            .attr("x", 25)
            .attr("dy", 4)
            .style("font-size", "12px")
            .text(d => d.data.label);
    }

    function toggleNode(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update();
    }


    /* =====================================================
       EXPORT JSON
    ===================================================== */

    document.getElementById("export-json").addEventListener("click", () => {
        updateRawDataFromRoot();

        const blob = new Blob(
            [JSON.stringify(rawData, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = "mindmap.json";
        a.click();

        URL.revokeObjectURL(url);
    });

    update();
}
