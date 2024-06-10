document.addEventListener('DOMContentLoaded', () => {
    fetch('DigitalProductPassport.json')
        .then(response => response.json())
        .then(jsonData => {
            if (jsonData) {
                updateGraph(jsonData);
            }
        });

    function updateGraph(data) {
        d3.select("#graph").selectAll("*").remove();

        const svg = d3.select("#graph").append("svg")
            .attr("width", "100%")
            .attr("height", "500px")
            .call(d3.zoom().on("zoom", function (event) {
                svg.attr("transform", event.transform);
            }))
            .append("g");

        const width = document.getElementById('graph').clientWidth;
        const height = 500;

        const nodes = [];
        const links = [];

        function createNode(id, name, group) {
            nodes.push({ id, name, group });
        }

        function createLink(source, target) {
            links.push({ source, target });
        }

        function traverse(obj, parentId = null) {
            for (const key in obj) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    const nodeId = `${parentId}-${key}`;
                    createNode(nodeId, key, 1);

                    if (parentId) {
                        createLink(parentId, nodeId);
                    }

                    traverse(obj[key], nodeId);
                } else {
                    const nodeId = `${parentId}-${key}`;
                    createNode(nodeId, `${key}: ${obj[key]}`, 2);
                    if (parentId) {
                        createLink(parentId, nodeId);
                    }
                }
            }
        }

        createNode(data.metadata.passportIdentifier, 'DPP', 0);
        traverse(data, data.metadata.passportIdentifier);

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("stroke-width", 1)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6);

        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("r", 5)
            .attr("fill", d => d3.schemeCategory10[d.group % 10])
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        const label = svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(nodes)
            .enter().append("text")
            .attr("dx", 10)
            .attr("dy", ".35em")
            .text(d => d.name);

        simulation
            .nodes(nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(links);

        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            label
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        }

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    }
});
