// file.js
var file_operation_adaptor = null;

var modified_flag = false;

function setModifiedFlag() {
	modified_flag = true;
}

function getModifiedFlag() {
	return modified_flag;
}

function clearModifiedFlag() {
	modified_flag = false;
}

function newFile() {
	file_operation_adaptor.newFile()
}

function saveFile() {
	var content = serializeData();

	var rv = file_operation_adaptor.saveFile(content);
	if (rv == true) {
		clearModifiedFlag();
	}

	return rv;
}

function loadFile() {
	clearSelectedObjects();
	console.log("loadFile()");
	file_operation_adaptor.loadFile();
}

function setupFile() {
	if (isElectron() == true) {
		console.log("using FileOperationForElectron class")
		file_operation_adaptor = new FileOperationForElectron();
	}
	else {
		console.log("using FileOperationForBrowser class")
		file_operation_adaptor = new FileOperationForBrowser();
	}
}

//////////////////////////////////////////////////////////////

function FileOperationBase() {
}

FileOperationBase.prototype.newFile = function() {
	throw new Error().message = arguments.callee.name + " : not implemented...";
}

FileOperationBase.prototype.loadFile = function() {
	throw new Error().message = arguments.callee.name + " : not implemented...";
}

FileOperationBase.prototype.saveFile = function(content) {
	throw new Error().message = arguments.callee.name + " : not implemented...";
}

//////////////////////////////////////////////////////////////

function FileOperationForBrowser() {
	this.content = ""
	FileOperationBase.call(this);
}
FileOperationForBrowser.prototype = Object.create(FileOperationBase.prototype);
FileOperationForBrowser.constructor = FileOperationForBrowser;

FileOperationForBrowser.prototype.newFile = function() {
	setupInitialData();
	resetCanvasZoomTranslate();
}

FileOperationForBrowser.prototype.loadFile = function() {
	deserializeData(this.content);
	resetCanvasZoomTranslate();
}

FileOperationForBrowser.prototype.saveFile = function(content) {
	this.content = content;
}

//////////////////////////////////////////////////////////////

var ipc;
function FileOperationForElectron() {
	ipc = require('ipc');
	FileOperationBase.call(this);

	ipc.on('load-content', function(arg) {
		deserializeData(arg);
	});

	ipc.on('close-window-event', function(arg) {
		console.log("close-window-event");

		if (getModifiedFlag() == true) {
			var rv = ipc.sendSync('show-dialog');
			// 0: yes, 1: no, 2: cancel
			if (rv == 0) {
				var rv = saveFile();
				if (rv == false) return;
			}
			else if (rv == 2) {
				return;
			}
		}

		ipc.send('close-window');
	});
}
FileOperationForElectron.prototype = Object.create(FileOperationBase.prototype);
FileOperationForElectron.constructor = FileOperationForElectron;

FileOperationForElectron.prototype.newFile = function() {
	ipc.send('new');
}

FileOperationForElectron.prototype.loadFile = function() {
	ipc.send('load');
}

FileOperationForElectron.prototype.saveFile = function(content) {
	return ipc.sendSync('save', content);
}

