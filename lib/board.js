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
	validPosition: function(pos) {
		return ((pos[0] >= 0) && (pos[0] < this.dimensions[0]) &&
				(pos[1] >= 0) && (pos[1] < this.dimensions[1]) &&
				(pos[2] >= 0) && (pos[2] < this.dimensions[2]));
	},
	getContents: function(pos) {
		if (!this.validPosition(pos)) {
			throw new exports.InvalidPosition();
		} else if (this.contents[pos]) {
			return this.contents[pos];
		} else {
			return [];
		};
	},
	addContents: function(pos, content) {
		if (!this.validPosition(pos))
			throw new exports.InvalidPosition();

		if (this.contents[pos]) {
			this.contents[pos].push(content);
		} else {
			this.contents[pos] = [content];
		};
	},
	getNeighbour: function(pos, direction) {
		var i = pos[0], j = pos[1], k = pos[2];

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
	center: function (pos) {
        var i = pos[0], j = pos[1], k = pos[2];
        x = (1.5 * this.side * i) + this.side;
        y = (2.0 * this.radius * j) + this.radius;
        z = k;
        
        if (i % 2) {
            y += this.radius;
		}
            
        return [x, y, z];
	},
	angle: function (pos1, pos2) {
		var coords1 = this.center(pos1);
		var coords2 = this.center(pos2);

        var scalar_product = coords2[0] - coords1[0];
		var distance = this.distance_points(coords1, coords2);
        var cos_theta = scalar_product/distance;
        var angle = Math.acos(cos_theta);
		return (coords2[1] > coords1[1]) ? -angle : angle;
	},	
	distance: function (pos1, pos2) {
		return this.distance_points(this.center(pos1), this.center(pos2));
	},
	distance_points: function (coords1, coords2) {
		return Math.sqrt(Math.pow(coords1[0] - coords2[0], 2) +
                         Math.pow(coords1[1] - coords2[1], 2) +
						 Math.pow(coords1[2] - coords2[2], 2));
	},
	vertices: function (pos) {
        var vs = [];
        var center = this.center(pos);
        for (var i = 0; i < 6; i++) {
            vs.push([center[0] + this.radius * Math.cos(i * Math.PI/3),
                     center[1] + this.radius * Math.sin(i * Math.PI/3),
                     center[2]]);
        }
        return vs;
	},
};
