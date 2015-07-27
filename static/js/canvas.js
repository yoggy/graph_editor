var svg;
var svg_g;
var svg_grid_layer;
var svg_node_layer;
var svg_edge_layer;
var svg_selection_layer;

var zoom;
var zoom_x = 0;
var zoom_y = 0;
var zoom_scale = 1.0;
var zoom_scale_min = 0.2;
var zoom_scale_max = 1.0;

var drag;

function convertScreen2Canvas(sp) {
	var sx = sp[0];
	var sy = sp[1];
	var cx = (sx - zoom_x) / zoom_scale;
	var cy = (sy - zoom_y) / zoom_scale;
	return [cx, cy];
}

function getCanvasContainerSize() {
	var canvas_container = d3.select("div#canvas_container");

    var w = canvas_container.style("width");
    var h = canvas_container.style("height")

	return [w, h];
}

function setCanvasZoomTranslate(x, y, scale) {
 	svg_g.attr("transform",
 		"translate(" + x +"," + y + ")scale(" + scale + ")"
 	);
 	zoom_x = x;
 	zoom_y = y;
 	zoom_scale = scale;
}

function zoomInCanvas() {
	console.log("zoomInCanvas()");

	var new_zoom_scale = zoom_scale + 0.2;
	if (new_zoom_scale >= zoom_scale_max) new_zoom_scale = zoom_scale_max;

	var new_zoom_x = zoom_x;
	var new_zoom_y = zoom_y;

	zoom.scale(new_zoom_scale);
	setCanvasZoomTranslate(new_zoom_x, new_zoom_y, new_zoom_scale);
}

function zoomOutCanvas() {
	console.log("zoomOutCanvas()");

	var new_zoom_scale = zoom_scale - 0.2;
	if (new_zoom_scale <= zoom_scale_min) new_zoom_scale = zoom_scale_min;

	var new_zoom_x = zoom_x;
	var new_zoom_y = zoom_y;

	zoom.scale(new_zoom_scale);
	setCanvasZoomTranslate(new_zoom_x, new_zoom_y, new_zoom_scale);
}

function onCanvasClick() {
	var mousePos = convertScreen2Canvas(d3.mouse(this));
	console.log("onCanvasClick() : mousePos=(" + mousePos[0] + ", " + mousePos[1] + ")");

	clearSelectedObjects();
}

function onCanvasDblClick() {
	var mousePos = convertScreen2Canvas(d3.mouse(this));

	console.log("onCanvasDblClick() : mousePos=(" + mousePos[0] + ", " + mousePos[1] + ")");
	createNode(mousePos[0], mousePos[1]);
}

function onCanvasZoomHandler() {
	console.log(d3.event);

	setCanvasZoomTranslate(
		d3.event.translate[0],
		d3.event.translate[1],
		d3.event.scale);
}

function setupCanvas() {
	svg = d3.select("#svg");
	svg_g = d3.select("#svg_g");
	svg_grid_layer = d3.select("#svg_grid_layer");
	svg_edge_layer = d3.select("#svg_edge_layer");
	svg_node_layer = d3.select("#svg_node_layer");
	svg_selection_layer = d3.select("#svg_selection_layer");

	// setup grid
	svg_grid_layer.append("g")
		.selectAll("line")
		.data(d3.range(-4000, 4000, 20))
		.enter()
		.append("line")
		.attr("class", "grid_lines")
		.attr("x1", function(d) { return d; })
		.attr("y1", -4000)
		.attr("x2", function(d) { return d; })
		.attr("y2", 4000)

	svg_grid_layer.append("g")
		.selectAll("line")
		.data(d3.range(-4000, 4000, 20))
		.enter()
		.append("line")
		.attr("class", "grid_lines")
		.attr("x1", -4000)
		.attr("y1", function(d) { return d; })
		.attr("x2", 4000)
		.attr("y2", function(d) { return d; })

	// zoom operation
	zoom = d3.behavior.zoom()
    	        .scaleExtent([zoom_scale_min, zoom_scale_max])
        	    .on("zoom", onCanvasZoomHandler)
	svg.call(zoom);

	// setup click event
	svg.on("mousedown",onCanvasClick);
	svg.on("dblclick",onCanvasDblClick);

	// prevent dblclick zoom operation...
	svg.on("dblclick.zoom", null);
}
