///////////////////////////////////////////////////////////
//
// operations for Edge objects
//
function connectEdge(n0, n1) {
	setModifiedFlag();
	console.log("connectEdge()");

	var selection_nodes = [n0, n1];

	// operation from selection
	if (n0 == null || n1 == null) {
		selection_nodes = getSelectedNodes();
		if (selection_nodes.length != 2) {
			throw new Error().message = arguments.callee.name + " : selection_nodes.length != 2...";
		}
	}

	if (findEdgeByNodeDirection(selection_nodes[0], selection_nodes[1]).length > 0) {
		clearSelectedObjects();
		throw new Error().message = arguments.callee.name + " : already exists edge...";
	}

	var e = new Edge(svg_edge_layer, selection_nodes[0], selection_nodes[1]);
	edges.push(e);

	clearSelectedObjects();

	return e;
}

function findEdgeByNode(node) {
	var result = [];

	if (node == null) return result;

	edges.forEach(function (e) {
		if (e.src_node.id == node.id) {
			result.push(e);
		}
		else if (e.dst_node.id == node.id) {
			result.push(e);
		}
	});

	return result;
}

function findEdgeByNodeDirection(node_src, node_dst) {
	var result = [];

	if (node_src == null || node_dst == null) return result;

	edges.forEach(function (e) {
		if (e.src_node.id == node_src.id
			&& e.dst_node.id == node_dst.id) {
			result.push(e);
		}
	});

	return result;
}

function cleanupEdges() {
	edges = edges.filter(function(e, idx, arr) {
		return e.obj != null;
	});
}

function deleteEdge(e) {
	setModifiedFlag();
	if (e == null) return;
	e.dispose();
}

function deleteAllEdges() {
	setModifiedFlag();
	edges.forEach(function (e) {
		e.dispose();
	});
}

function deleteEdgeByNode(node) {
	setModifiedFlag();

	var edges = findEdgeByNode(node);

	edges.forEach(function (e) {
		deleteEdge(e);
	});
}

function updateEdgesByNode(node)
{
	setModifiedFlag();

	var edges = findEdgeByNode(node);

	edges.forEach(function (e) {
		e.update();
	});
}

function updateEdges() {
	setModifiedFlag();

	edges.forEach(function (e) {
		e.update();
	});
}

//////////////////////////////////////////////////////////////////
//
// Edge object
//
function Edge(svg, src_node, dst_node) {
	this.src_node = src_node;
	this.dst_node = dst_node;

	this.is_selected = false;

	this.properties = {};
	this.properties.stroke_color = "#000000";
	this.properties.stroke_width = "2";

	ClickableObject.call(this, svg, 0, 0);
}
Edge.prototype = Object.create(ClickableObject.prototype);
Edge.constructor = Edge;

Edge.prototype.createSVGObject = function(svg) {
	// create rect object
	var obj = svg.append("g")
	   .attr("id", this.id);

	this.line_invisible = obj.append("line");
	this.line = obj.append("line");

	this.arrow0 = obj.append("line");
	this.arrow1 = obj.append("line");

	return obj;
}

Edge.prototype.toJSON = function(h) {
	var h = {};

	h.src_node = this.src_node.id;
	h.dst_node = this.dst_node.id;
	h.properties = this.properties;

	return h;
}

Edge.fromJSON = function(h) {
	var src_node = getNodeById(h.src_node);
	var dst_node = getNodeById(h.dst_node);

	var e = new Edge(svg_edge_layer, src_node, dst_node);

	e.properties = h.properties;

	edges.push(e);

	e.update();
}

Edge.prototype.update = function() {
	var p1 = this.getSrcPos();
	var p2 = this.getDstPos();

	this.line_invisible
		.attr("x1", p1[0])
		.attr("y1", p1[1])
		.attr("x2", p2[0])
		.attr("y2", p2[1])
		.style("opacity", 0.0)
		.style("stroke", "#ffffff")
		.style("stroke-width", +this.properties.stroke_width+20);

	this.line
		.attr("x1", p1[0])
		.attr("y1", p1[1])
		.attr("x2", p2[0])
		.attr("y2", p2[1])
		.style("stroke", this.properties.stroke_color)
		.style("stroke-width", this.properties.stroke_width);

	var center_x = (p1[0] + p2[0]) / 2;
	var center_y = (p1[1] + p2[1]) / 2;

	var dx = p2[0] - p1[0];
	var dy = p2[1] - p1[1];

	if (dx == 0 && dy == 0) {
		this.arrow0
			.attr("x1", p1[0])
			.attr("y1", p1[1])
			.attr("x2", p2[0])
			.attr("y2", p2[1])
		this.arrow1
			.attr("x1", p1[0])
			.attr("y1", p1[1])
			.attr("x2", p2[0])
			.attr("y2", p2[1])
		return;
	}

	var th = Math.atan2(dy, dx);

	this.arrow0
		.attr("x1", center_x)
		.attr("y1", center_y)
		.attr("x2", center_x + Math.cos(th + 2.5) * 10)
		.attr("y2", center_y + Math.sin(th + 2.5) * 10)
		.style("opacity", 1.0)
		.style("stroke", this.properties.stroke_color)
		.style("stroke-width", this.properties.stroke_width);

	this.arrow1
		.attr("x1", center_x)
		.attr("y1", center_y)
		.attr("x2", center_x + Math.cos(th - 2.5) * 10)
		.attr("y2", center_y + Math.sin(th - 2.5) * 10)
		.style("opacity", 1.0)
		.style("stroke", this.properties.stroke_color)
		.style("stroke-width", this.properties.stroke_width);
}

Edge.prototype.select = function(flag) {
	this.is_selected = flag;
}

Edge.prototype.getSrcPos = function() {
	return this.src_node.getCenterPos();
}

Edge.prototype.getDstPos = function() {
	return this.dst_node.getCenterPos();
}

Edge.prototype.onClick = function() {
	console.log("Edge.onClick()");
	setSelectedEdge(this);
}

