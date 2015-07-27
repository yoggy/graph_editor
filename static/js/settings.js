var settings_table;

function showSettingsDialog() {
	console.log("showSettingsDialog()")
	d3.select("#dialogs_overlay").style("display", "inline");
	d3.select("#settings_dialog_container").style("display", "inline");

	settings_table.loadSettings();
}

function hideSettingsDialog() {
	console.log("hideSettingsDialog()")
	d3.select("#dialogs_overlay").style("display", "none");
	d3.select("#settings_dialog_container").style("display", "none");
}

function onSettingButtonOK() {
	console.log("onSettingButtonOK()");
	settings_table.saveSettings();
	hideSettingsDialog();
}

function onSettingButtonCancel() {
	console.log("onSettingButtonCancel()");
	hideSettingsDialog();
}

function setupSettingsDialog() {
	settings = [];
	settings.description = "file-" + getDateStr();

	settings_table = new SettingsTable("#settings_table", settings);

	d3.select("#settins_button_ok").on("click", function(d) {
		console.log("click:" + "div#settins_button_ok");
		onSettingButtonOK();
	});
	d3.select("#settins_button_cancel").on("click", function(d) {
		console.log("click:" + "div#settins_button_cancel");
		onSettingButtonCancel();
	});
}

/////////////////////////////////////////////////////////////////////
//
//
//
function SettingsTable(table_id, settings) {
	this.tbody = d3.select(table_id).select("tbody");
	this.settings = settings;
}

SettingsTable.prototype.clear = function() {
	this.tbody.selectAll("tr").remove();
}

SettingsTable.prototype.loadSettings = function() {
	console.log("SetttingsTable.loadSettings()");

	this.clear();
	var that = this;

	var tr_row = this.tbody
		.selectAll("tr")
		.data(Object.keys(this.settings))
		.enter()
		.append("tr");

	tr_row.append("td")
		.attr('class', 'settings_key')
		.text(function(d) { return d;});

	tr_row.append("td")
		.attr('class', 'settings_value')
		.attr('contenteditable', true)
		.text(function(d) { return that.settings[d]; });
}

SettingsTable.prototype.saveSettings = function() {
	console.log("SetttingsTable.saveSettings()");

	var that = this;

	var tds = this.tbody.selectAll("td")[0];
	for (var i = 0; i < tds.length; i += 2) {
		var k = tds[i].innerText;
		var v = tds[i+1].innerText;
		that.settings[k] = v;
	}

	console.log(that.settings);
}
