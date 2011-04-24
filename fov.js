exports.Arc = function (start, end) {
	this.start = start;
	this.end = end;
};

exports.Arc.prototype.contains = function (angle) {
	return ((this.start < angle) && (angle < this.end));
};
