// inspector.js

var inspector;

function setupInspector() {
	inspector = new Inspector("#properties_table");
	inspector.clearSelection();

	d3.select("#properties_table_button_apply").on("click", function(d) {
		console.log("#properties_table_button_apply:click");
		inspector.applyProperties();
	});

	d3.select("#properties_table_button_cancel").on("click", function(d) {
		console.log("#properties_table_button_cancel:click");
		inspector.reloadProperties();
	});
}

function Inspector(table_id) {
	this.tbody = d3.select(table_id).select("tbody");
	this.properties = null;
}

Inspector.prototype._clear = function() {
	this.tbody.selectAll("tr").remove();
}

Inspector.prototype.setObject = function(obj) {
	this.clearSelection();

	this.obj = obj;
	this.reloadProperties();
}

Inspector.prototype.reloadProperties = function() {
	this._clear();

	var properties = this.obj.properties;

	var tr_row = this.tbody
		.selectAll("tr")
		.data(Object.keys(properties))
		.enter()
		.append("tr");

	tr_row.append("td")
		.attr('class', 'properties_key')
		.text(function(d) { return d;});

	tr_row.append("td")
		.attr('class', 'properties_value')
		.attr('contenteditable', true)
		.text(function(d) { return properties[d]});

	// enable selection, if exists "name"
	var tds = this.tbody.selectAll("td")[0];
	for (var i = 0; i < tds.length; i += 2) {
		var k = tds[i].innerText;
		var v = tds[i+1].innerText;

		if (k == "name") {
			var selection = window.getSelection();
			selection.removeAllRanges();

			var range = document.createRange();
			range.selectNodeContents(tds[i+1]);
			selection.addRange(range);
		}
	}
}

Inspector.prototype.applyProperties = function() {
	if (this.obj == null) return;

	var tds = this.tbody.selectAll("td")[0];
	for (var i = 0; i < tds.length; i += 2) {
		var k = tds[i].innerText;
		var v = tds[i+1].innerText;
		this.obj.properties[k] = v;
	}

	try {
		this.obj.update();
		if (edge_selection_frame != null) edge_selection_frame.update();
	}
	catch(e) {
		console.log(e, "color:red;");
	}
}

Inspector.prototype.clearSelection = function() {
	if (this.obj != null) {
		this.applyProperties();
	}

	this.obj = null;
	this._clear();
}
