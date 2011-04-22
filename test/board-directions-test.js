var assert = require('assert'),
	vows = require('vows');

var board = require('../lib/board');
var Board = board.Board;
var dimensions = [20, 20, 2];
var b = new Board(dimensions);

function assertDirection(key, expected_delta) {
	var f = function (topic) {
		expected_cell = [topic[0] + expected_delta[0], 
		                 topic[1] + expected_delta[1], 
						 topic[2] + expected_delta[2]];
		
		assert.deepEqual(b.getNeighbour(topic, b.directions[key]), 
		                 expected_cell);
	};
	
	return f;
};

function testDirections(topic, expected_deltas) {
    var context = {
        topic: topic
    };

	for (key in expected_deltas) {		
          context['should know its ' + key + ' neighbour'] = 
				 assertDirection(key, expected_deltas[key])
    }
    return context;
};

exports.directions_vows = vows.describe('directions').addBatch({
	'A cell on an even column': testDirections([10, 10, 0], {
									'SE': [1, 0, 0],
									'S': [0, 1, 0],
									'SW': [-1, 0, 0],
									'NW': [-1, -1, 0],
									'N': [0, -1, 0],
									'NE': [1, -1, 0],
								}),
	'A cell on an odd column': testDirections([5, 5, 0], {
									'SE': [1, 1, 0],
									'S': [0, 1, 0],
									'SW': [-1, 1, 0],
									'NW': [-1, 0, 0],
									'N': [0, -1, 0],
									'NE': [1, 0, 0],
								}),
});
