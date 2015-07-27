function setupToolbox() {
	d3.select("img#toolbox_connect").on("click", function(d, i) {
		onClickConnect();
	});
	d3.select("img#toolbox_zoom_in").on("click", function(d, i) {
		console.log("img#toolbox_zoom_in");
		onClickZoomIn();
	});
	d3.select("img#toolbox_zoom_out").on("click", function(d, i) {
		console.log("img#toolbox_zoom_out");
		onClickZoomOut();
	});
	d3.select("img#toolbox_trash").on("click", function(d, i) {
		onClickTrash();
	});
	d3.select("img#toolbox_file_new").on("click", function(d, i) {
		onClickFileNew();
	});
	d3.select("img#toolbox_file_save").on("click", function(d, i) {
		onClickFileSave();
	});
	d3.select("img#toolbox_file_load").on("click", function(d, i) {
		onClickFileLoad();
	});
	d3.select("img#toolbox_settings").on("click", function(d, i) {
		onClickSettings();
	});
}

function onClickConnect() {
	console.log("onClickConnect()");
	connectEdge();
}

function onClickZoomIn() {
	console.log("onClickZoomIn()");
	zoomInCanvas();
};

function onClickZoomOut() {
	console.log("onClickZoomOut()");
	zoomOutCanvas();
};

function onClickTrash() {
	console.log("onClickTrash()");
	deleteSelectedObjects();
}

function onClickFileNew() {
	newFile();
}

function onClickFileSave() {
	saveFile();
}

function onClickFileLoad() {
	loadFile();
}

function onClickSettings() {
	console.log("onClickSettings()");
	showSettingsDialog();
};

function resizeWindow(){
	console.log("resizeWindow()");

	var size = getCanvasContainerSize();

	// resize svg
    d3.select("#svg")
    	.attr("width", size[0])
    	.attr("height", size[1]);
}

function setupResizeWindow() {
	d3.select(window).on('resize', resizeWindow);
	resizeWindow();
}

function init() {
	setupCanvas();
	setupToolbox();
	setupResizeWindow();
	setupInspector();
	setupFile();
	setupSettingsDialog();

	setupInitialData();
}
