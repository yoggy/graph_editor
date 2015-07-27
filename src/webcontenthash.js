function WebContentHash() {
  this.webcontents = [];
  this.windows     = [];
}

WebContentHash.prototype.push = function(window) {
  var webcontent = window.webContents;
  this.webcontents.push(webcontent);
  this.windows.push(window);
}

WebContentHash.prototype.getWindow = function(webcontent) {
  var idx = this.webcontents.indexOf(webcontent);
  if (idx < 0) return null;
  return this.windows[idx];
}

WebContentHash.prototype.delete = function(obj) {
  var idx = -1;

  idx = this.webcontents.indexOf(obj);
  if (idx < 0) {
    idx = this.windows.indexOf(obj);
    if (idx < 0) return;
  }

  this.webcontents.splice(idx, 1);
  this.windows.splice(idx, 1);
}

WebContentHash.prototype.length = function() {
  return this.webcontents.length;
}

module.exports = WebContentHash;