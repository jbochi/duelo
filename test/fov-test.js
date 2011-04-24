var assert = require('assert'),
    vows = require('vows'),
    Arc = require('../fov').Arc;

vows.describe('Arc').addBatch({
	'Arc (0 - PI)': {
		topic: function () {
			return new Arc(0, Math.PI); 
		},
		'should start on 0': function (topic) {
			assert.equal(topic.start, 0);
		},
		'should end on PI': function (topic) {
			assert.equal(topic.end, Math.PI);
		},
		'should contain PI/2': function (topic) {
			assert.isTrue(topic.contains(Math.PI/2));
		},
	},
}).export(module);
