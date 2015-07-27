//
// see also... http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
//
function uuid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function isElectron() {
	if (typeof(require) == 'undefined') return false;
	return true;
}

function nfs(n, digit){
	var zero_str = "";
	for (var i = 0; i < digit; ++i) {
		zero_str += "0";
	}
	var num_str = zero_str + n;

	return num_str.substring(num_str.length - digit);
};

function getDateStr() {
	var d = new Date();

	str = "";
	str += d.getFullYear();
	str += "/";
	str += nfs(d.getMonth(), 2);
	str += "/";
	str += nfs(d.getDate(), 2);
	str += "-";
	str += nfs(d.getHours(), 2);
	str += ":";
	str += nfs(d.getMinutes(), 2);
	str += ":";
	str += nfs(d.getSeconds(), 2);

	return str;
}