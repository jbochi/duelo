var assert = require('assert'),
    vows = require('vows');

var board = require('../lib/board');
var Board = board.Board;
var wall = {};

var dimensions = [20, 20, 2];

assert.almostEqual = function (a, b, precision) {
    return assert.equal(a.toPrecision(precision), b.toPrecision(precision));
}

var precision = 6;

exports.board_vows = vows.describe('board').addBatch({
    'A Board when created': {
        topic: function () { return new Board(dimensions); },
        'is a Board instance': function(topic) {
            assert.instanceOf(topic, Board);
        },
        'has six directions': function (topic) {
            assert.length(Object.keys(topic.directions), 6);
        },
        'has dimension attribute': function(topic) {
            assert.equal(topic.dimensions, dimensions);
        },
        'has no contents': function(topic) {
            assert.isEmpty(topic.getContents([0, 0, 0]));
        },
        'has no contents on corner': function(topic) {
            assert.isEmpty(topic.getContents([dimensions[0] - 1,
                                              dimensions[1] - 1,
                                              dimensions[2] - 1]));
        },
        'raises error for contents on invalid position': function(topic) {
            assert.throws(function () {
                topic.getContents([dimensions[0], 0, 0]);
            }, board.InvalidPosition);
        },
        'can have content added to position': function (topic) {
            assert.doesNotThrow(function () {
                topic.addContents([0, 0, 0], wall);
            }, board.InvalidPosition);
        },
        'cannot have contents added to invalid position': function (topic) {
             assert.throws(function () {
                topic.addContents([-1, 0, 0]);
            }, board.InvalidPosition);
        },
    },
    'A content-aware Board': {
        topic: function () {
            var b = new Board(dimensions);
            b.addContents([0, 0, 0], wall);
            return b;
        },
        'should have contents': function (topic) {
            assert.length(topic.getContents([0, 0, 0]), 1);
        },
        'can have more content added': function (topic) {
            topic.addContents([0, 0, 0], wall);
            assert.length(topic.getContents([0, 0, 0]), 2);
        },
    },
    'An euclidean Board': {
        topic: function () { return new Board(dimensions) },
        'has a side/radius ratio of 2/3 * sqrt(3)': function (topic) {
            assert.almostEqual(topic.side/topic.radius, 
                               2.0 / Math.sqrt(3.0), precision);
        },
        'knows the center of (0, 0, 0)': function (topic) {
            assert.deepEqual(topic.center([0, 0, 0]),
                             [topic.side, topic.radius, 0.0]);
        },
        'knows the center of (1, 0, 0)': function (topic) {
            assert.deepEqual(topic.center([1, 0, 0]),
                             [2.5 * topic.side, 2.0 * topic.radius, 0.0]);
        },
        'knows the center of (0, 1, 0)': function (topic) {
            assert.deepEqual(topic.center([0, 1, 0]),
                             [topic.side, 3.0 * topic.radius, 0.0]);
        },
        'knows the center of (2, 0, 0)': function (topic) {
            assert.deepEqual(topic.center([2, 0, 0]),
                             [4.0 * topic.side, topic.radius, 0.0]);
        },
        'neighbour cells are two radius apart': function (topic) {
            assert.equal(topic.distance([0, 0, 0], [1, 0, 0]),
                         2.0 * topic.radius);
            assert.equal(topic.distance([0, 0, 0], [0, 1, 0]),
                         2.0 * topic.radius);
            assert.equal(topic.distance([0, 0, 0], [2, 1, 0]),
                         4.0 * topic.radius);
        },
        'knows some angles': function (topic) {
            assert.almostEqual(topic.angle([0, 0, 0], [1, 0, 0]),
                               -Math.PI/6, precision);
            assert.almostEqual(topic.angle([0, 0, 0], [2, 1, 0]), 
                               -Math.PI/6, precision);
            assert.almostEqual(topic.angle([2, 1, 0], [0, 0, 0]), 
                               5*Math.PI/6, precision);
            assert.almostEqual(topic.angle([0, 0, 0], [2, 0, 0]), 
                               0, precision);
            assert.almostEqual(topic.angle([2, 0, 0], [0, 0, 0]), 
                               Math.PI, precision);
            assert.almostEqual(topic.angle([0, 0, 0], [0, 1, 0]), 
                               -Math.PI/2, precision);
            assert.almostEqual(topic.angle([0, 1, 0], [0, 0, 0]), 
                               Math.PI/2, precision);
        },
    },
    'Cell vertices': {
        topic: function () {
            return new Board(dimensions); 
        },
        'are six': function (topic) {
            assert.length(topic.vertices([0, 0, 0]), 6);
        },
        'distance to center is equal to radius': function (topic) {
            var center = topic.center([0, 0, 0]);
            var vertices = topic.vertices([0, 0, 0]);
            for (var i  = 0; i < 6; i++) {
                assert.equal(topic.distance_points(vertices[i], center), 
                             topic.radius);
            }
        },
    },
	'Circles on the Board': {
		topic: function () { return new Board(dimensions); },
		'should be the center for radius zero': function (topic) {
			assert.deepEqual(topic.circle([0, 0, 0], 0),
			                 [[0, 0, 0]]);
		},
		'should be the six neighbours for radius one': function (topic) {
			assert.deepEqual(topic.circle([1, 1, 0], 1),
			                 [[1, 0, 0],
							  [2, 1, 0],
							  [2, 2, 0],
							  [1, 2, 0],
							  [0, 2, 0],
							  [0, 1, 0]]);
		},
	},
});
