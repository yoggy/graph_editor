function quantize(v) {
	var q = 20;

	var q_min = Math.floor(v / q) * q;
	var q_max = q_min + q;

	var diff = v - q_min;

	if (diff < q/2.0) return q_min;

	return q_max;
}

//////////////////////////////////////////////////
//
//  base class
//
//////////////////////////////////////////////////

function SVGObject(svg, x, y) {
	this.svg = svg;
	this.x = x;
	this.y = y;

	this.createObjectId();
	this.obj = this.createSVGObject(svg);
	this.update();
	this.quantize();
}

SVGObject.prototype.createObjectId = function() {
	this.id = "obj-" + uuid();
}

SVGObject.prototype.createSVGObject = function(svg) {
	// create rect object
	var obj = svg.append("g")
	   .attr("id", this.id);

	obj.append("circle")
	   .attr("r", 10)
	   .style("stroke", "#ff0000")
	   .style("fill", "#ffffff")

	return obj;
}

SVGObject.prototype.bringToFront = function () {
	if (this.obj != null) {
		var svg_obj = this.obj[0][0];
		var p = svg_obj.parentNode;
		p.appendChild(svg_obj);
	}
}

SVGObject.prototype.bringToBack = function () {
	if (this.obj != null) {
		var svg_obj = this.obj[0][0];
		var p = svg_obj.parentNode;

		var firstChild = p.firstChild;
        if (firstChild) {
            p.insertBefore(svg_obj, firstChild);
        }
	}
}

SVGObject.prototype.update = function() {
	this.obj.attr("transform", "translate(" + this.x + "," + this.y + ")");
}

SVGObject.prototype.dispose = function() {
	if (this.obj != null) {
		this.obj.remove();
		this.obj = null;
	}
}

SVGObject.prototype.is_dispose = function() {
	if (this.obj == null) return true;
	return false;
}

SVGObject.prototype.quantize = function() {
	this.x = quantize(this.x);
	this.y = quantize(this.y);
	this.update();
}

SVGObject.prototype.move = function(dx, dy) {
	this.x += dx;
	this.y += dy;
	this.update();
}

//////////////////////////////////////////////////
//
//  ClickableObject class
//
//////////////////////////////////////////////////
function ClickableObject(svg, x, y) {
	// call parent constructor
	SVGObject.call(this, svg, x, y);

	this.setupClickableObject();
}
ClickableObject.prototype = Object.create(SVGObject.prototype);
ClickableObject.constructor = ClickableObject;

ClickableObject.prototype.setupClickableObject = function() {
	var that = this;

	// append onClick event handler
	this.obj.on("mousedown", function(d,i) {
    	d3.event.stopPropagation();
		that.onClick();
	})

	this.obj.on("dblclick", function(d, i) {
    	d3.event.stopPropagation();
		that.onDblClick();
	});
}

//
//  events
//
ClickableObject.prototype.onClick = function() {
	console.log("ClickableObject.onClick()");
}

ClickableObject.prototype.onDblClick = function() {
	if (d3.event.defaultPrevented) return;

	console.log("ClickableObject.onDblClick()");
	d3.event.stopPropagation();
}

//////////////////////////////////////////////////
//
//  DraggableObject class
//
//////////////////////////////////////////////////
function DraggableObject(svg, x, y) {
	// call parent constructor
	ClickableObject.call(this, svg, x, y);

	this.setupDraggableObject();
}
DraggableObject.prototype = Object.create(ClickableObject.prototype);
DraggableObject.constructor = DraggableObject;

DraggableObject.prototype.setupDraggableObject = function() {
	var that = this;

	// append onClick event handler
	this.obj.on("click", function(d,i) {
    	d3.event.stopPropagation();
		that.onClick();
	})

	this.obj.on("dblclick", function(d, i) {
    	d3.event.stopPropagation();
		that.onDblClick();
	});

	// drag operation
	var drag = d3.behavior.drag()
	    .on("dragstart", function() {
			d3.event.sourceEvent.stopPropagation();
	    	that.onDragStarted();
	    })
	    .on("drag", function() {
	    	d3.event.sourceEvent.stopPropagation();
			that.onDragged();
		})
	    .on("dragend", function() {
	    	d3.event.sourceEvent.stopPropagation();
	    	that.onDragEnded()
	    });

	this.obj.call(drag);
}

//
//  events
//
DraggableObject.prototype.onClick = function() {
	console.log("DraggableObject.onClick()");
}

DraggableObject.prototype.onDblClick = function() {
	console.log("DraggableObject.onDblClick()");
}

DraggableObject.prototype.onDragStarted = function() {
//	console.log("DraggableObject.onDragStarted:n=" + this);
	this.bringToFront();
}

DraggableObject.prototype.onDragged = function() {
	move(d3.event.dx, d3.event.dy);
}

DraggableObject.prototype.onDragEnded = function() {
}
