Arc = function (start, end) {
	this.start = start;
	this.end = end;
};

Arc.prototype.contains = function (angle) {
	return ((this.start < angle) && (angle < this.end));
};

Arc.prototype.equal = function (arc) {
	return ((this.start === arc.start) && (this.end === arc.end));
};

Arc.prototype.sub = function (remove) {
	if ((remove.start > this.start) && (remove.end < this.end)) {
	    //Arc is split in two
	    return [new exports.Arc(this.start, remove.start), 
		        new exports.Arc(remove.end, this.end)];
	} else if ((remove.start <= this.start) && (remove.end >= this.end)) {
		//Nothing left
        return;
    } else {
		var a;
		if ((remove.start > this.end) || (remove.end < this.start)) {
    		//Nothing changes
		    a = this;
		} else if ((remove.start > this.start) && 
		           (remove.end >= this.end)) {
	        // Upper part is removed
	        a = new Arc(this.start, remove.start);
        } else if ((remove.start <= this.start) &&
		           (remove.end < this.end)) {
	        //Lower part is removed
	        a = new Arc(remove.end, this.end);
		}

	    if ((remove.start < 0) && (this.start > 0)) {
			remove.start += 2 * Math.PI;
			remove.end += 2 * math.PI;
			a = a.sub(remove);
		} else if ((remove.start > 0) && (this.start < 0)) {
			remove.start -= 2 * Math.PI;
			remove.end -= 2 * Math.PI;
			a = a.sub(remove);
		}

	    return a;
	}
};

exports.Arc = Arc;
