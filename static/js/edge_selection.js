var selected_edge = null;
var edge_selection_frame = null;

////////////////////////////////////////////////////////////
//
// operations for selected edge
//

function getSelectedEdge() {
	return selected_edge;
}

function setSelectedEdge(e) {
	if (e == null) return;

	clearSelectedObjects();

	e.bringToFront();

	selected_edge = e;
	selected_edge.select(true);

	inspector.setObject(e);

	// append edge selection frame
	var f = new EdgeSelectionFrame(svg_edge_layer, e);
	edge_selection_frame = f;

	// for inspector
	inspector.setObject(e);

	selected_edge.update();

	return selected_edge;
}

function deleteSelectedEdge() {
	console.log("deleteSelectedEdge()");

	if (edge_selection_frame != null) {
		edge_selection_frame.dispose();
		edge_selection_frame = null;
	}

	deleteEdge(selected_edge);

	inspector.clearSelection();
}

function clearSelectedEdge() {
	console.log("clearSelectedEdge()");
	inspector.clearSelection();

	if (edge_selection_frame != null) {
		edge_selection_frame.dispose();
		edge_selection_frame = null;
	}

	if (selected_edge != null) {
		selected_edge.select(false);
	}
	selected_edge = null;
}

////////////////////////////////////////////////////////////
//
// operations for selected edge
//
function EdgeSelectionFrame(svg, target_edge) {
	this.svg
	this.target_edge = target_edge;
	SVGObject.call(this, svg, 0, 0);
}
EdgeSelectionFrame.prototype = Object.create(SVGObject.prototype);
EdgeSelectionFrame.constructor = EdgeSelectionFrame;

EdgeSelectionFrame.prototype.createSVGObject = function(svg) {
	console.log("EdgeSelectionFrame.createSVGObject()");

	// create rect object
	var obj = svg.append("g")
	   .attr("id", this.id)


	this.line = obj
				.append("line")
				.style("opacity", 0.3)
				.style("stroke-width", +this.target_edge.properties.stroke_width+16);

	return obj;
}

EdgeSelectionFrame.prototype.update = function() {
	var p1 = this.target_edge.getSrcPos();
	var p2 = this.target_edge.getDstPos();

	var stroke_color = this.target_edge.properties.stroke_color;

	this.line
		.attr("x1", p1[0])
		.attr("y1", p1[1])
		.attr("x2", p2[0])
		.attr("y2", p2[1])
		.style("stroke", stroke_color);
}
