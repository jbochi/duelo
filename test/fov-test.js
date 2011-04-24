var assert = require('assert'),
    vows = require('vows'),
    Arc = require('../fov').Arc;

vows.describe('Arc').addBatch({
	'An arc': {
		topic: function () {
			return new Arc(0, Math.PI); 
		},
		'should have a start property': function (topic) {
			assert.equal(topic.start, 0);
		},
		'should have an end property': function (topic) {
			assert.equal(topic.end, Math.PI);
		},
	},
}).export(module);
