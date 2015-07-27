var nodes_hash_by_id = {};

var node_init_w = 120;
var node_init_h = 40;

////////////////////////////////////////////////////////////
//
// operations for Node object
//
function createNode(center_x, center_y) {
	setModifiedFlag();

	var x = center_x - node_init_w / 2;
	var y = center_y - node_init_h / 2;
	var w = node_init_w;
	var h = node_init_h;

	var n = new Node(svg_node_layer, x, y, w, h);
	nodes.push(n);
	nodes_hash_by_id[n.id] = n;

	clearSelectedNodes();

	return n;
}

function cleanupNodes() {
	nodes = nodes.filter(function(e, idx, arr) {
		return e.obj != null;
	});

	node_selection_frames = node_selection_frames.filter(function(e, idx, arr) {
		return e.obj != null;
	});
}

function deleteNode(n) {
	setModifiedFlag();

	if (n == null) return;

	// delete related edges
	deleteEdgeByNode(n);

	delete nodes_hash_by_id[n.id];
	n.dispose();

	cleanupNodes();
}

function deleteAllNodes() {
	for(var i = 0; i < nodes.length; ++i) {
		var n = nodes[i];

		// delete related edges
		deleteEdgeByNode(n);

		delete nodes_hash_by_id[n.id];
		n.dispose();
	}
	cleanupNodes();
}

function getNodeById(id) {
	if (id in nodes_hash_by_id) {
		return nodes_hash_by_id[id];
	}
	else {
		return null;
	}
}

/////////////////////////////////////////////////
//
// node class
//
function Node(svg, x, y, w, h) {
	console.log("Node constructor() svg=" + svg);

	this.w = w;
	this.h = h;

	this.is_selected = false;

	this.properties = {};
	this.properties.name = "node";
	this.properties.fill_color = "#ffffff";
	this.properties.stroke_color = "#000000";
	this.properties.stroke_width = "2";

	// call parent constructor
	DraggableObject.call(this, svg, x, y);
};
Node.prototype = Object.create(DraggableObject.prototype);
Node.constructor = Node;

Node.prototype.createObjectId = function() {
	console.log("Node.createObjectId()");
	this.id = "node-" + uuid();
}

Node.prototype.toJSON = function(xml_node) {
	var h = {};

	h.id = this.id;
	h.x = this.x;
	h.y = this.y;
	h.w = this.w;
	h.h = this.h;

	h.properties = this.properties;

	return h;
}

Node.fromJSON = function(h) {
	var n = new Node(svg_node_layer, h.x, h.y, h.w, h.h);

	n.id = h.id;
	n.properties = h.properties;

	nodes.push(n);
	nodes_hash_by_id[n.id] = n;

	n.update();
}

Node.prototype.createSVGObject = function(svg) {
	console.log("Node.createSVGObject()");

	// create rect object
	var obj = svg.append("g")
	.attr("id", this.id);

	this.rect = obj.append("rect")
	.attr("rx", 16)
	.attr("ry", 16);

	this.text = obj.append("text")
	.attr("dy", ".3em")
	.style("text-anchor", "middle");

	return obj;
}

Node.prototype.update = function() {
	this.obj
	.attr("transform", "translate(" + this.x + "," + this.y + ")");

	this.rect
	.attr("width", this.w)
	.attr("height", this.h)
	.style("stroke", d3.rgb(this.properties.stroke_color))
	.style("stroke-width", this.properties.stroke_width)
	.style("fill", d3.rgb(this.properties.fill_color));

	this.text
	.attr("transform", "translate(" + (this.w/2) + "," + (this.h/2) + ")")
	.text(this.properties.name);

	updateEdgesByNode(this);
}

Node.prototype.select = function(flag) {
	this.is_selected = flag;
}

Node.prototype.getCenterPos = function () {
	var center_x = this.x + this.w / 2;
	var center_y = this.y + this.h / 2;
	return [center_x, center_y];
}

Node.prototype.quantize = function() {
	this.x = quantize(this.x);
	this.y = quantize(this.y);
	this.w = quantize(this.w);
	this.h = quantize(this.h);
	this.update();
}

Node.prototype.onClick = function() {
	console.log("Node.onClick()");

	if (this.is_selected) return;

	if (d3.event.shiftKey) {
		appendSelectedNodes(this);
	}
	else {
		setSelectedNodes(this);
	}
}

Node.prototype.onDragged = function() {
	moveSelectedNodes(d3.event.dx, d3.event.dy);
}

DraggableObject.prototype.onDragEnded = function() {
	quantizeSelectedNodes();
}

