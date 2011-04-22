var assert = require('assert'),
	vows = require('vows');

var board = require('../lib/board');
var Board = board.Board;
var wall = {};

var dimensions = [20, 20, 2];

assert.almostEqual = function (a, b, precision) {
	return assert.equal(a.toPrecision(precision), b.toPrecision(precision));
}

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
			assert.isEmpty(topic.getContents(0, 0, 0));
		},
		'has no contents on corner': function(topic) {
			assert.isEmpty(topic.getContents(dimensions[0] - 1,
			                                 dimensions[1] - 1,
							   			     dimensions[2] - 1));
		},
		'raises error for contents on invalid position': function(topic) {
			assert.throws(function () {
				topic.getContents(dimensions[0], 0, 0);
			}, board.InvalidPosition);
		},
		'can have content added to position': function (topic) {
			assert.doesNotThrow(function () {
				topic.addContents(0, 0, 0, wall);
			}, board.InvalidPosition);
		},
		'cannot have contents added to invalid position': function (topic) {
     		assert.throws(function () {
				topic.addContents(-1, 0, 0);
			}, board.InvalidPosition);
		},
    },
	'A content-aware Board': {
		topic: function () {
			var b = new Board(dimensions);
			b.addContents(0, 0, 0, wall);
			return b;
		},
		'should have contents': function (topic) {
			assert.length(topic.getContents(0, 0, 0), 1);
		},
		'can have more content added': function (topic) {
			topic.addContents(0, 0, 0, wall);
			assert.length(topic.getContents(0, 0, 0), 2);
		},
	},
	'An euclidean Board': {
		topic: function () { return new Board(dimensions) },
		'has a side/radius ratio of 2/3 * sqrt(3)': function (topic) {
			assert.almostEqual(topic.side/topic.radius, 
			                   2.0 / Math.sqrt(3.0),
							   6);
		},
	},
});
