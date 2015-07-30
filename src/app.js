var app = require('app');
var BrowserWindow = require('browser-window');
var dialog = require('dialog');
var ipc = require('ipc');
var fs = require('fs');
var path = require('path')

var WebContentHash = require('./webcontenthash');
console.log(WebContentHash);
var webcontenthash = new WebContentHash();

var client;
try {
	client = require('electron-connect').client;
}
catch(e) {
	console.log(e);
}

var default_window_w = 1200;
var default_window_h = 800;

var count = 1;

/////////////////////////////////////////////////////////
// for webcontents-window management
function addWindow(w) {
	webcontenthash.push(w);
}

/////////////////////////////////////////////////////////
// for IPC
ipc.on('new', function(evt, arg) {
  createNewDocument();
});

ipc.on('show-dialog', function(evt, arg) {
  console.log("show-dialog");

  var webcontent = evt.sender;
  var w = webcontenthash.getWindow(webcontent);

  var rv = dialog.showMessageBox(w, {
      type: 'info',
      message: 'save changes?',
      buttons: ['Yes', 'No', 'Cancel']
  });

  evt.returnValue = rv;
});

ipc.on('load', function(evt, arg) {
	var w = webcontenthash.getWindow(evt.sender);
	loadDocument(w);
});

ipc.on('save', function(evt, arg) {
	var w = webcontenthash.getWindow(evt.sender);
	var rv = saveAsDocument(w, arg);
	evt.returnValue = rv;
});

ipc.on('close-window', function(evt, arg) {
	var w = webcontenthash.getWindow(evt.sender);

	webcontenthash.delete(w);

	w.enable_close = true;
	w.close();
});

function createWindow() {
	var w = new BrowserWindow({
		width: default_window_w,
		height: default_window_h,
	});

	w.setMenu(null);
	w.maximize();
	//w.openDevTools();

	if (client  != null) {
		client.create(w);
	}
	addWindow(w);

	w.enable_close = false;
	w.on('close', function(evt) {
		if (w.enable_close == false) {
			evt.preventDefault();
			w.webContents.send('close-window-event');
		}
	});

	return w;
}

function createNewDocumentFilename() {
	var filename = "newdocument" + count + ".json";
	count ++;
	return filename;
}

function createNewDocument() {
	var filename = createNewDocumentFilename();;
	var w = createWindow();

	w.filename = filename;
	w.first_save_flag = true;

	w.loadUrl('file://' + __dirname + '/../static/' + "index.html");

	w.setTitle(path.basename(filename));
}

function loadDocumentImpl(filename, content) {
	var w = createWindow(filename);

	w.filename = filename;
	w.first_save_flag = false;

	w.loadUrl('file://' + __dirname + '/../static/' + "index.html");

	w.setTitle(path.basename(filename));

	w.webContents.on('did-finish-load', function() {
		w.webContents.send('load-content', content);
	});
}

function loadDocument(w) {
	var filenames = dialog.showOpenDialog(w, {
		properties: ['openFile'],
		filters: [{ name: 'json', extensions: ['json'] }]
		});

	if (filenames != null ) {
		console.log(filenames[0]);
		fs.readFile(filenames[0], 'utf8', function (err, content) {
			if (err) {
				console.log(err);
				return;
			}
			loadDocumentImpl(filenames[0], content);
		});
	}
}

function saveDocumentImpl(filename, contnet) {
	fs.writeFile(filename,  contnet, 'utf8', function (err) {
		if (err) {
		    console.log(err);
		}
	});
}

function saveDocument(w, content) {
	if (w.first_save_flag == true) {
		return saveAsDocument(w, content);
	}
	else {
		saveDocumentImpl(w.filename, content);
	}
	return true;
}

function saveAsDocument(w, content) {
	var filename = dialog.showSaveDialog(w, {
		defaultPath: w.filename,
		filters: [{ name: 'json', extensions: ['json'] }]
		});

	if (filename == null) {
		return false;
	}
	console.log(filename);
	saveDocumentImpl(filename, content);

	w.filename = filename;
	w.first_save_flag = false;
	w.setTitle(filename);

	return true;
}

app.on('window-all-closed', function() {
    console.log("window-all-closed");
    app.quit();
});

app.on('ready', function() {
	createNewDocument();
});
