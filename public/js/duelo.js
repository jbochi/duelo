/*jslint white: true, browser: true, onevar: true, undef: true, nomen: true, 
         eqeqeq: true, plusplus: true, bitwise: true, regexp: true, 
         newcap: true, immed: true */
/*global $, Math, Raphael, document, console */

var Signals, DUELO;

/* Taken from http://www.nicollet.net/2009/10/js-signals/ */
Signals = (function () {
    var s = function () {
        this.uc = s; 
    };
    s.prototype.channel = function (c) {
        var h = [], s;
        s = function () {
            for (var k in h) {
                if (h[k]) {
                    h[k].apply(this, arguments);
                }
            }
        };
        s.bind = function (f) {
            h.push(f); 
            return h.length - 1; 
        };
        s.unbind = function (f) {
            h[f] = null;
        };
        return this.set(c, s);
    };
    s.prototype.set = function (n, v) {
        var I = function () {
            this.uc = I; 
        };
        I.prototype = new this.uc();
        I.prototype[n] = v;
        return new I();
    };
    return s;
}());

DUELO = {};

DUELO.signals = new Signals();
DUELO.signals = DUELO.signals.channel('onHexagonClick');
DUELO.signals = DUELO.signals.channel('onHexagonMouseOver');
DUELO.signals = DUELO.signals.channel('onPlayerMouseOver');

DUELO.arc = function (start, end) {
    var that = {}, ranges;
    
    if (start >= 0 && end <= 2 * Math.PI) {
        ranges = [[start, end]];
    } else if (start < 0 && end === 0) {
    	ranges = [[start + 2 * Math.PI, 2 * Math.PI]];
    } else if (start < 0 && end > 0) {
        ranges = [[start + 2 * Math.PI, 2 * Math.PI], [0, end]];
    } else if (end > 2 * Math.PI) {
        ranges = [[start, 2 * Math.PI], [0, end - 2 * Math.PI]];
    }
    
    that.ranges = function () {
        return ranges;
    };
    
    that.overlaps = function (arc) {
        var arc_ranges = arc.ranges(), i;        
        
        for (i = 0; i < arc_ranges.length; i += 1) {
            if (that.overlaps_range(arc_ranges[i])) {
                return true;
            }
        }
        return false;
    };

    that.overlaps_range = function (range) {
        var start = range[0], end = range[1], i;
        
        for (i = 0; i < ranges.length; i += 1) {
            if ((start >= ranges[i][0])  && (start <= ranges[i][1]) ||
                (end >= ranges[i][0])  && (end <= ranges[i][1]) ||
                (start <= ranges[i][0]) && (end >= ranges[i][1]))  {
                return true;
            }
        }
        return false;
    };
    
    
    return that;
};

// Angle of view is a list of ranges of angles that can be seen by a player 
// This is a helper class for the FOV algorithm
DUELO.angle_of_view = function (arc) {
    var ranges = arc.ranges(), that = {};    
    
    // contains tests if any arc has intersection with another one
    that.overlaps = function (arc) {
        var i;
        
        for (i = 0; i < ranges.length; i += 1) {
            if (arc.overlaps_range(ranges[i]))  {
                return true;
            }
        }
        return false;
    };

    
    // remove a arc (hexagon) from the list of visible angles
    that.remove = function (arc) {
        var i = 0, arc_ranges = arc.ranges();
        for (i = 0; i < arc_ranges.length; i += 1) {
            that.remove_range(arc_ranges[i]);
        }
    };
    
    // remove a range from the list of visible angles
    that.remove_range = function (range) {
        var i = 0, 
            remove_start = range[0], 
            remove_end = range[1], 
            start, 
            end,
            new_ranges = [];
                
        // Calculates the new ranges
        for (i = 0; i < ranges.length; i += 1) {
            start = ranges[i][0];
            end = ranges[i][1];
            
            if (remove_start > end || remove_end < start)  {
                new_ranges.push([start, end]);
            } else if (remove_start <= start && remove_end >= end) {
                continue;
            } else if (remove_start <= start && remove_end < end) {
                new_ranges.push([remove_end, end]);
            } else if (remove_start > start && remove_end >= end) {
                new_ranges.push([start, remove_start]);
            } else if (remove_start > start && remove_end < end) {
                new_ranges.push([start, remove_start]);
                new_ranges.push([remove_end, end]);
            }
        }
        
        // Remove ranges that are too small ( < 1 degree)
        new_ranges = new_ranges.filter(function (range) {
            return (range[1] - range[0]) > Raphael.rad(1);
        });
        
        ranges = new_ranges;
    };

    return that;
};

DUELO.board = (function () {
    var that = {}, canvas_width, canvas_height, dimensions,
        directions = {
            SE: 0,
            S: 1,
            SW: 2,
            NW: 3,
            N: 4,
            NE: 5
        };
    
    dimensions = [15, 15];
    that.height = 20;
    that.radius = that.height / Math.sqrt(3) * 2;
    
    canvas_width = 1.5 * that.radius * (dimensions[0] + 0.5);
    canvas_height = 2.0 * that.height * (dimensions[1] + 0.5) + 2;
    
    // angle between center of hexagons
    that.angle = function (h1, h2) {
        return that.angleTwoPoints(
            that.hexagonCenterFromIndex([h1[0], h1[1]]),
            that.hexagonCenterFromIndex([h2[0], h2[1]])
        );
    };

    // angle between p1 and p2
    that.angleTwoPoints = function (p1, p2) {
        var angle = 0, delta;
        
        delta = [p2[0] - p1[0], p2[1] - p1[1]];
                       
        if (delta === [0, 0]) {
            angle = undefined;
        } else if (delta[0] === 0) {
            angle = Math.PI / 2.0 * (delta[1] > 0 ? 1 : -1);
        } else {
            angle = Math.atan(delta[1] / delta[0]);
            if (delta[0] < 0) {
                angle += Math.PI;
            }
        }
        
        if (angle < 0) {
            angle += 2.0 * Math.PI;
        }
        
        return angle;
    };
    
    // angle between center of h1 and h2 vertices
    that.angleHexagons = function (h1, h2) {
        var angles,
            h1_center = that.hexagonCenterFromIndex(h1),
            h2_center = that.hexagonCenterFromIndex(h2),
            h2_vertices = that.hexagonVertices(h2_center),
            minimum, maximum;
                
        
        angles = h2_vertices.map(function (vertice) {
            return that.angleTwoPoints(h1_center, vertice);
        });
        
        minimum = Math.min.apply(this, angles);
        maximum = Math.max.apply(this, angles);
        
        if (maximum - minimum > Math.PI) {
            angles = angles.map(function (angle) {
                if (angle > Math.PI) {
                    angle -= 2 * Math.PI;
                }
                return angle;
            });
            minimum = Math.min.apply(this, angles);
            maximum = Math.max.apply(this, angles);            
        }
        
        return [minimum, maximum];
    };

    // distance between p1 and p2
    that.distance = function (p1, p2) {
        var x2, y2, d;
        x2 = Math.pow(p1[0] - p2[0], 2);
        y2 = Math.pow(p1[1] - p2[1], 2);
        d = Math.sqrt(x2 + y2);
        return d;
    };    
    
    // draw board
    that.draw = function () {
        var i, j;
        
        DUELO.paper = new Raphael("canvas", canvas_width, canvas_height);
                        
        for (i = 0; i < dimensions[0]; i += 1) {
            for (j = 0; j < dimensions[1]; j += 1) {
                that.drawHexagonFromIndex([i, j]);
            }
        }
    };
    
    // draw hexagon from coords [x, y]
    that.drawHexagon = function (p) {
        var h, coords, points;
        
        coords = that.hexagonVertices(p);
        points = coords.map(function (point) {
            return point.join(', ');
        });
        
        h = DUELO.paper.path('M' + points.join('L') + 'z');
        
        h.attr('fill', 'rgba(255, 255, 255, 255)');        
        
        return h;
    };
    
    // draw hexagon from index [i, j]
    that.drawHexagonFromIndex = function (h) {                
        var coords = that.hexagonCenterFromIndex(h),
            hex,
            i = h[0],
            j = h[1],
            x = coords[0],
            y = coords[1];
            
        hex = that.drawHexagon([x, y]);        
        hex.i = i;
        hex.j = j;
        
        // Set id and class attributes
        // Raphael does not give direct access to them
        hex.node.setAttribute("id", "hex_" + i + '_' + j);
        hex.node.setAttribute("class", "hex");
                
        $(hex.node).mouseover(function (event) {            
            hex.toFront();
            hex.attr({stroke: "red"});
            DUELO.signals.onHexagonMouseOver(hex, event);
        }).mouseout(function (event) {
            hex.attr({stroke: "black"});
        }).click(function (event) {
            DUELO.signals.onHexagonClick(hex, event);
        });
    };
    
    // coords of hexagon center
    that.hexagonCenterFromIndex = function (h) {
        var x, y;
        x = 1 + that.radius + 1.5 * that.radius * h[0];
        y = 1 + that.height + 2 * that.height * h[1];
        
        if (h[0] % 2) {
            y += that.height;
        }            
        return [x, y];
    };

    // coords of hexagon vertices
    that.hexagonVertices = function (p) {
        var angle, edgeLength, rads, points,
            x = p[0], y = p[1];
        
        angle = 360;
        edgeLength = 2 * that.radius * Math.sin(Math.PI / 6);
        
        x += edgeLength / 2;
        y += that.radius * Math.cos(Math.PI / 6);        
        points = [[x, y]];
        
        for (angle = 360 - 60; angle > 0; angle -= 60) {
            rads = Raphael.rad(angle);
            x = x + edgeLength * Math.cos(rads);
            y = y + edgeLength * Math.sin(rads);
            points.push([x, y]);
        }
        return points;
    };
    
    // neighbour of h in a given direction
    that.neighbour = function (h, direction) {                
        if (direction === directions.N) {
            return [h[0], h[1] - 1];
        } else if (direction === directions.S) {
            return [h[0], h[1] + 1];
        } else if (direction === directions.NE) {
            return [h[0] + 1, h[1] - Math.abs((h[0] + 1) % 2)];
        } else if (direction === directions.NW) {
            return [h[0] - 1, h[1] - Math.abs((h[0] + 1) % 2)];
        } else if (direction === directions.SE) {
            return [h[0] + 1, h[1] + Math.abs(h[0] % 2)];
        } else if (direction === directions.SW) {
            return [h[0] - 1, h[1] + Math.abs(h[0] % 2)];
        }    
    };
    
    // next Hexagon between h1 and h2
    that.nextHexagon = function (h1, h2) {
        var angle = that.angle(h1, h2),
            direction = Math.round((Raphael.deg(angle) - 30) / 60) % 6;
        return that.neighbour(h1, direction);
    };
    
    // returns all hexagons in a given distance
    that.hexagonsInDistance = function (h, d) {
        var i, direction, list;
        
        // walk d steps to north
        for (i = 0; i < d; i += 1) {
            h = that.neighbour(h, directions.N);
        }
        list = [h];
        
        // for each direction, starting SE, walk d steps
        for (direction = 0; direction < 6; direction += 1) {
            for (i = 0; i < d; i += 1) {
                h = that.neighbour(h, ((directions.SE + direction) % 6));
                list.push(h);
            }
        }
                
        // filter out hexagons that are out of the board
        return list.filter(function l(h) {
            return (h[0] >= 0 && h[0] <= dimensions[0] &&
                    h[1] >= 0 && h[1] <= dimensions[1]);
        });
    };
    
    
    /*
     *  Return all hexagons that are in current field of view.
     * 
     *  Tests if hexagons inside a growing centered on player are visible.
     *  If one hexagon blocks the view, removes a arc from the list
     *  of angles that can be seen. (angle of view class)
     *  
     *  Inspired by: http://www.sable.mcgill.ca/~clump/Hex/HGAT.html
     * 
     */
    that.FOV = function (h, arc) {        
        
        var i, j,
            h2,
            fov = [],
            in_radius,
            radius = 0,            
            arc_corners,
            angle_corners,
            angle_of_view = DUELO.angle_of_view(arc);
            
        do {
            radius += 1;
            in_radius = that.hexagonsInDistance(h, radius);
            for (i = 0; i < in_radius.length; i += 1) {
                h2 = in_radius[i];

                angle_corners = that.angleHexagons(h, h2);
                arc_corners = DUELO.arc(angle_corners[0], angle_corners[1]);

                if (angle_of_view.overlaps(arc_corners)) {
                    fov.push(h2);
                    for (j = 0; j < that.obstacles.length; j += 1) {                        
                        if ((h2[0] === that.obstacles[j][0]) && 
                            (h2[1] === that.obstacles[j][1])) {
                            angle_of_view.remove(arc_corners);
                        }
                    }
                }
            }
        } while (in_radius.length > 0);
        return fov;
    };
    
    that.obstacles = [];
    
    return that;
}());

DUELO.player = function () {
    var that = {},
        direction = 0,
        pos = [0, 0], 
        sprite,
        moving = false; 

    // angle player if facing
    that.angle = function () {
        return that.angleFromDirection(direction);
    };
    
    // angle from a given direction
    that.angleFromDirection = function (d) {
        return d * 30;
    };
    
    
    // array of tuples with angle of view (120 degrees total)
    that.angleOfView = function () {
        var dir = Raphael.rad(that.angle()),
            aof_min = dir - Raphael.rad(45),
            aof_max = dir + Raphael.rad(45);
        
        return DUELO.arc(aof_min, aof_max);
    };
    
    // convert from direction to angle
    that.directionFromAngle = function (a) {
        return Math.round(Raphael.deg(a) / 30) % 12;
    };
    
    
    // draw player
    that.draw = function () {        
        var coords = that.getCoords(), point, points, radius;
        
        radius = 0.7 * DUELO.board.height;
        point = function (angle) {
            return [coords[0] + radius * Math.cos(angle), 
                    coords[1] + radius * Math.sin(angle)];
        };
        points = [point(0), point(Raphael.rad(140)), point(Raphael.rad(-140))];
        
        sprite = DUELO.paper.path('M' + points.join('L') + 'z');
        sprite.attr('fill', 'green');
        sprite.toFront();
    };


    // get player coords
    that.getCoords = function () {
        return DUELO.board.hexagonCenterFromIndex(pos);
    };
    
    // get player position
    that.getPos = function () {
        return pos;
    };
    
    // move to a given hexagon
    that.move = function (h, callback) {
        var i = h[0], j = h[1], next;
        moving = true;
        
        if (pos[0] !== i || pos[1] !== j) {
            next = DUELO.board.nextHexagon(pos, h);
            
            that.turnToHexagon(next, function () {                
                that.translate(next, function () {                
                    that.move(h, callback);                    
                });
            });
        } else {
            moving = false;
        }
        callback();
    };

    that.moving = function () {
        return moving;
    }

    // translate player sprite
    that.translate = function (h, callback) {
        var i = h[0], j = h[1],
            coords = that.getCoords(),
            delta_coords,
            new_coords, 
            speed,
            time;
            
        new_coords = DUELO.board.hexagonCenterFromIndex(h);
        delta_coords = [new_coords[0] - coords[0], new_coords[1] - coords[1]];
        
        speed = 100 / DUELO.board.radius;
        time = DUELO.board.distance(coords, new_coords) * speed;        
        
        sprite.animate({translation: delta_coords.join(',')}, time, callback);
        
        pos = [i, j];
    };
    
    // turn player to a new direction
    that.turn = function (new_direction, callback) {
        var current_angle, delta, new_angle, time, transform_angle;
        current_angle = that.angle();

        new_angle = that.angleFromDirection(new_direction);
        delta = new_angle - that.angle();       
        
        sprite.rotate(current_angle, true);
        transform_angle = (Math.abs(delta) > 180) ? 
                          (new_angle - 360 * delta / Math.abs(delta))
                          : new_angle;
        time = Math.abs(transform_angle - current_angle) * 2;
        sprite.animate({'rotation': transform_angle}, time, callback);
        direction = new_direction;
    };
    
    
    // turn player to a hexagon
    that.turnToHexagon = function (h, callback) {
        var i = h[0], j = h[1], new_direction;
        
        if (pos[0] !== i || pos[1] !== j) {
            new_direction = that.directionFromAngle(DUELO.board.angle(
                [pos[0], pos[1]], 
                [i, j]
            ));
            that.turn(new_direction, callback);
        }
    };
    
    // put sprite in the front
    that.toFront = function () {
        sprite.toFront();
    };

    // listen to hexagon mouse over on player current hexagon
    DUELO.signals.onHexagonMouseOver.bind(function (h, event) {
        if (h.i === pos[0] && h.j === pos[1]) {
            DUELO.signals.onPlayerMouseOver(that);
        }
    });        
        
    return that;
};

// a game!
function game() {
    var myPlayer = DUELO.player();
    
    function createObstacles() {
        var n = 40;
        
        for (; n > 0; n -= 1) {
            DUELO.board.obstacles.push([Math.floor(Math.random() * 16),
                                        Math.floor(Math.random() * 16)]);
        }
    }    
    
    function step() {
        var i, fov;
        
        // testing fov
        $('.hex').attr({'fill': '#fff'});        
        fov = DUELO.board.FOV(myPlayer.getPos(), myPlayer.angleOfView());
        for (i = 0; i < fov.length; i += 1) {
            $('#hex_' + fov[i][0] + '_' + fov[i][1]).attr({'fill': '#ccc'});
        }
        
        for (i = 0; i < DUELO.board.obstacles.length; i += 1) {
            $('#hex_' + DUELO.board.obstacles[i][0] + '_' + DUELO.board.obstacles[i][1]).attr({'fill': '#000'});
        }
    }
    
    DUELO.signals.onHexagonClick.bind(function (h, event) {
        if (!myPlayer.moving()) {
            if (event.shiftKey) {
                myPlayer.turnToHexagon([h.i, h.j], step);
            } else {
               myPlayer.move([h.i, h.j], step);
            }        
        }
    });
    
    DUELO.signals.onHexagonMouseOver.bind(function (h, event) {
        var angles, center;
        center = DUELO.board.hexagonCenterFromIndex(myPlayer.getPos());
        myPlayer.toFront();        
        angles = DUELO.board.angleHexagons(myPlayer.getPos(), [h.i, h.j]);
    });
            
    DUELO.board.draw();
    myPlayer.draw();
    createObstacles();
    step();
}

$(document).ready(game);
