var selected_nodes = [];
var node_selection_frames = [];
var node_resize_frame = null;

////////////////////////////////////////////////////////////
//
// operations for selected nodes
//
function getSelectedNodes() {
	return selected_nodes;
}

function setSelectedNodes(n) {
	console.log("setNodeSelection()");
	clearSelectedNodes();
	appendSelectedNodes(n);
}

function appendSelectedNodes(n) {
	if (n == null) return;
	console.log("appendNodeSelection()");

	clearSelectedEdge();

	n.select(true);
	selected_nodes.push(n);

	// append node selection frame
	var f = new NodeSelectionFrame(svg_selection_layer, n);
	node_selection_frames.push(f);
	if (node_selection_frames.length == 2) {
		node_selection_frames[0].setStrokeColor("#ff0000");
		node_selection_frames[1].setStrokeColor("#4400ff");
	}
	else {
		node_selection_frames.forEach(function (n) {
			n.setStrokeColor("#ff0000");
		});
	}

	// for resize frame
	if (selected_nodes.length == 1) {
		createNodeResizeFrame(n, f);
	}
	else {
		deleteNodeResizeFrame();
	}

	// for inspector
	if (selected_nodes.length == 1) {
		inspector.setObject(n);
	}
	else {
		inspector.clearSelection();
	}
}

function clearSelectedNodes() {
	console.log("clearSelectedNodes()");
	nodes.forEach(function(n) {
		n.select(false);
	});

	selected_nodes = [];

	node_selection_frames.forEach(function(n) {
		n.dispose();
	});

	deleteNodeResizeFrame();

	cleanupObjests();

	// for inspector
	inspector.clearSelection();
}

function moveSelectedNodes(dx, dy) {
	setModifiedFlag();

	selected_nodes.forEach(function(n) {
		n.move(dx, dy);
	});

	node_selection_frames.forEach(function(n) {
		n.move(dx, dy);
	});

	if (node_resize_frame != null) {
		node_resize_frame.move(dx, dy);
	}

	// for edges
	updateEdges();
}

function quantizeSelectedNodes() {
	selected_nodes.forEach(function(n) {
		n.quantize();
	});
	node_selection_frames.forEach(function(n) {
		n.quantize();
	});
	if (node_resize_frame != null) {
		node_resize_frame.quantize();
	}

	// for edges
	updateEdges();
}

function deleteSelectedNodes() {
	setModifiedFlag();

	selected_nodes.forEach(function(n) {
		deleteNode(n);
	});

	clearSelectedNodes();

	// cleanup
	cleanupObjests();
}

//////////////////////////////////////////////////
//
// operations for resize frame
//
function createNodeResizeFrame(node, frame) {
	node_resize_frame = new NodeResizeFrame(svg_selection_layer, node, frame);
}

function deleteNodeResizeFrame() {
	if (node_resize_frame != null) {
		node_resize_frame.dispose();
		node_resize_frame = null;
	}
}

//////////////////////////////////////////////////
//
//  NodeSelectionFrame class
//
function NodeSelectionFrame(svg, node) {
	this.node = node;
	this.w = node.w;
	this.h = node.h;
	SVGObject.call(this, svg, node.x, node.y);
}
NodeSelectionFrame.prototype = Object.create(SVGObject.prototype);
NodeSelectionFrame.constructor = NodeSelectionFrame;

NodeSelectionFrame.prototype.createSVGObject = function(svg) {
	console.log("NodeSelectionFrame.createSVGObject()");

	// create rect object
	var obj = svg.append("rect")
	   .attr("id", this.id)
	   .attr("rx", 0)
	   .attr("ry", 0)
	   .style("stroke", "#ff0000")
	   .style("stroke-width", 3)
	   .style("fill", "none")

	return obj;
}

NodeSelectionFrame.prototype.update = function() {
	this.obj.attr("x", this.x)
	   .attr("y", this.y)
	   .attr("width", this.w)
	   .attr("height", this.h);
}

NodeSelectionFrame.prototype.quantize = function() {
	this.x = quantize(this.x);
	this.y = quantize(this.y);
	this.w = quantize(this.w);
	this.h = quantize(this.h);
	this.update();
}

NodeSelectionFrame.prototype.setStrokeColor = function(color) {
	this.obj.style("stroke", color);
}

//////////////////////////////////////////////////
//
//  NodeResizeFrame class
//
function NodeResizeFrame(svg, node, node_selection) {
	this.node = node;
	this.node_selection = node_selection;
	this.w = node.w;
	this.h = node.h;
	SVGObject.call(this, svg, node.x, node.y);
}
NodeResizeFrame.prototype = Object.create(SVGObject.prototype);
NodeResizeFrame.constructor = NodeResizeFrame;

NodeResizeFrame.prototype.createSVGObject = function(svg) {
	console.log("NodeResizeFrame.createSVGObject()");

	// create rect object
	var obj = svg.append("g").attr("id", this.id);

	this.c0 = obj.append("circle")
  	   .attr("cx", this.x)
	   .attr("cy", this.y)
	   .attr("r", 10)
	   .style("stroke", "none")
	   .style("fill", "#ff00ff")

	this.c1 = obj.append("circle")
  	   .attr("cx", this.x + this.w)
	   .attr("cy", this.y)
	   .attr("r", 10)
	   .style("stroke", "none")
	   .style("fill", "#ff00ff")

	this.c2 = obj.append("circle")
  	   .attr("cx", this.x)
	   .attr("cy", this.y + this.h)
	   .attr("r", 10)
	   .style("stroke", "none")
	   .style("fill", "#ff00ff")

	this.c3 = obj.append("circle")
  	   .attr("cx", this.x + this.w)
	   .attr("cy", this.y + this.h)
	   .attr("r", 10)
	   .style("stroke", "none")
	   .style("fill", "#ff00ff")

	// 下側のオブジェクトにクリックイベントを通知しないようにする
	var stopPropagation = function() {
		console.log("NodeResizeFrame.stopPropagation()");
		d3.event.stopPropagation();
	};
	this.c0.on('click', stopPropagation);
	this.c1.on('click', stopPropagation);
	this.c2.on('click', stopPropagation);
	this.c3.on('click', stopPropagation);

	// drag operation
	var that = this;
	var drag0 = d3.behavior.drag()
	    .on("dragstart", function() {that.onDragStarted()})
	    .on("drag", function() {that.onDragged0()})
	    .on("dragend", function() {that.onDragEnded()});
	this.c0.call(drag0);

	var drag1 = d3.behavior.drag()
	    .on("dragstart", function() {that.onDragStarted()})
	    .on("drag", function() {that.onDragged1()})
	    .on("dragend", function() {that.onDragEnded()});
	this.c1.call(drag1);

	var drag2 = d3.behavior.drag()
	    .on("dragstart", function() {that.onDragStarted()})
	    .on("drag", function() {that.onDragged2()})
	    .on("dragend", function() {that.onDragEnded()});
	this.c2.call(drag2);

	var drag3 = d3.behavior.drag()
	    .on("dragstart", function() {that.onDragStarted()})
	    .on("drag", function() {that.onDragged3()})
	    .on("dragend", function() {that.onDragEnded()});
	this.c3.call(drag3);

	return obj;
}

NodeResizeFrame.prototype.dispose = function() {
	this.obj.remove();
	this.obj = null;

	this.node = null;
	this.node_selection = null;
}

NodeResizeFrame.prototype.quantize = function() {
	this.x = quantize(this.x);
	this.y = quantize(this.y);
	this.w = quantize(this.w);
	this.h = quantize(this.h);
	this.update();
}

NodeResizeFrame.prototype.update = function() {
	this.c0.attr("cx", this.x         ).attr("cy", this.y);
	this.c1.attr("cx", this.x + this.w).attr("cy", this.y);
	this.c2.attr("cx", this.x         ).attr("cy", this.y + this.h);
	this.c3.attr("cx", this.x + this.w).attr("cy", this.y + this.h);

	this.node_selection.x = this.x;
	this.node_selection.y = this.y;
	this.node_selection.w = this.w;
	this.node_selection.h = this.h;
	this.node_selection.update();

	this.node.x = this.x;
	this.node.y = this.y;
	this.node.w = this.w;
	this.node.h = this.h;
	this.node.update();
}

NodeResizeFrame.prototype.onDragStarted = function() {
	console.log("DraggableObject.onDragStarted:n=" + this);
	d3.event.sourceEvent.stopPropagation();
}

NodeResizeFrame.prototype.onDragged0 = function() {
	setModifiedFlag();

	this.x += d3.event.dx;
	this.y += d3.event.dy;
	this.w -= d3.event.dx;
	this.h -= d3.event.dy;

	this.update();
}

NodeResizeFrame.prototype.onDragged1 = function() {
	setModifiedFlag();

	this.x += 0;
	this.y += d3.event.dy;
	this.w += d3.event.dx;
	this.h -= d3.event.dy;

	this.update();
}

NodeResizeFrame.prototype.onDragged2 = function() {
	setModifiedFlag();

	this.x += d3.event.dx;
	this.y += 0;
	this.w -= d3.event.dx;
	this.h += d3.event.dy;

	this.update();
}

NodeResizeFrame.prototype.onDragged3 = function() {
	setModifiedFlag();

	this.x += 0;
	this.y += 0;
	this.w += d3.event.dx;
	this.h += d3.event.dy;

	this.update();
}

NodeResizeFrame.prototype.onDragEnded = function() {
	console.log("DraggableObject.onDragEnded:n=" + this);

	setModifiedFlag();

	d3.event.sourceEvent.stopPropagation();

	this.quantize();
}

