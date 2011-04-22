/*
    A board with hexagon tiles.
    
    Coord system:
        
       x: 0 1 2 3 4
    y:    _   _   _
    0    / \_/ \_/ \_
      0  \_/ \_/ \_/
    1    / \_/ \_/ \_
      1  \_/ \_/ \_/  
    2    / \_/ \_/ \_
      2  \_/ \_/ \_/
    3    / \_/ \_/ \_
*/    

exports.Board = function (dimensions) {	
	this.contents = {};
	this.dimensions = dimensions;
};

exports.InvalidPosition = function () {
	this.name = "InvalidPosition",
	this.message = "Trying to access invalid position on board";
};

exports.Board.prototype = {	
	directions: {
		'SE': 0,
		'S': 1,
		'SW': 2,
		'NW': 3,
		'N': 4,
		'NE': 5,
	},
	radius: 1.0,
	side: 2.0 / 3.0 * Math.sqrt(3.0),	
	validPosition: function(x, y, z) {
		return ((x >= 0) && (x < this.dimensions[0]) &&
				(y >= 0) && (y < this.dimensions[1]) &&
				(z >= 0) && (z < this.dimensions[2]));
	},
	getContents: function(x, y, z) {
		if (!this.validPosition(x, y, z)) {
			throw new exports.InvalidPosition();
		} else if (this.contents[(x, y, z)]) {
			return this.contents[(x, y, z)];
		} else {
			return [];
		};
	},
	addContents: function(x, y, z, content) {
		if (!this.validPosition(x, y, z))
			throw new exports.InvalidPosition();

		var key = (x, y, z);
		if (this.contents[key]) {
			this.contents[key].push(content);
		} else {
			this.contents[key] = [content];
		};
	},
	getNeighbour: function(coords, direction) {
		var i = coords[0],
		    j = coords[1],
		    k = coords[2];

        switch (direction) {
			case this.directions.N:
				n = [i, j - 1, k];
				break;
        	case this.directions.S:
				n = [i, j + 1, k];
				break;
        	case this.directions.NE:
	            n = [i + 1, j - Math.abs((i + 1) % 2), k];
				break;
			case this.directions.NW:
				n = [i - 1, j - Math.abs((i + 1) % 2), k];
				break;
			case this.directions.SE:
				n = [i + 1, j + Math.abs(i % 2), k];
				break;
			case this.directions.SW:
				n = [i - 1, j + Math.abs(i % 2), k];
				break;
	        default:
    	        throw new exports.InvalidPosition;
		};
        return n;
	},
};
