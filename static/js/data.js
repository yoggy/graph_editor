var nodes = [];
var edges = [];
var settings = {};

var header_infos = {
	filetype: "graph_editor",
	version: 1
};

///////////////////////////////////////////////////////////
//
// operations for any objects
//
function setupInitialData() {
	deleteAllObjects();
	clearModifiedFlag();
}

function clearSelectedObjects() {
	clearSelectedEdge();
	clearSelectedNodes();
}

function deleteSelectedObjects() {
	// for inspector
	inspector.clearSelection();

	deleteSelectedEdge();
	deleteSelectedNodes();
}

function cleanupObjests() {
	cleanupNodes();
	cleanupEdges();
}

function deleteAllObjects() {
	deleteAllEdges();
	deleteAllNodes();
}

function deserializeData(content) {
	console.log("deserializeData()");

	deleteAllObjects();

	var json = JSON.parse(content);

	settings = json.settings;

	json.nodes.forEach(function(h) {
		Node.fromJSON(h);
	});

	json.edges.forEach(function(h) {
		Edge.fromJSON(h);
	});

	normalizeAllObjectsPosition();
	clearModifiedFlag();

	return true;
}

function serializeData() {
	console.log("serializeData()");

	var json = {};

	json._header = header_infos;
	json.settings = settings;

	var ns = [];

	nodes.forEach(function (n) {
		ns.push(n.toJSON());
	});
	json.nodes = ns;

	var es = [];
	edges.forEach(function (e) {
		console.log(e);
		es.push(e.toJSON());
	});
	json.edges = es;

	var content = JSON.stringify(json);

	console.log(content);

	return content;
}

function normalizeAllObjectsPosition() {

	var rect = getAllObjectsRect();

	min_x = quantize(rect.x) - 40;
	min_y = quantize(rect.y) - 40;

	for (var i = 0; i < nodes.length; ++i) {
		nodes[i].move(-min_x, -min_y);
	}
}

function getAllObjectsRect() {
	var rect = {};
	rect.x = 0;
	rect.y = 0;
	rect.w = 0;
	rect.h = 0;

	if (nodes.length == 0) return rect;

	var min_x = Number.MAX_VALUE;
	var min_y = Number.MAX_VALUE;

	var max_x = Number.MIN_VALUE;
	var max_y = Number.MIN_VALUE;

	for (var i = 0; i < nodes.length; ++i) {
		if (nodes[i].x < min_x) {
			min_x = nodes[i].x;
		}
		if (nodes[i].y < min_y) {
			min_y = nodes[i].y;
		}
		if (nodes[i].x + nodes[i].w > max_x) {
			max_x = nodes[i].x + nodes[i].w;
		}
		if (nodes[i].y + nodes[i].h > max_y) {
			max_y = nodes[i].y + nodes[i].h;
		}
	}

	rect.x = min_x;
	rect.y = min_y;
	rect.w = max_x - min_x;
	rect.h = max_y - min_y;

	return rect;
}
