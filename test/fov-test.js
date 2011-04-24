var assert = require('assert'),
    vows = require('vows'),
    Arc = require('../fov').Arc;

vows.describe('Arc').addBatch({
	'Arc(0, PI)': {
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
		'should not contain 1.5 PI': function (topic) {
			assert.isFalse(topic.contains(1.5 * Math.PI));
		},
		'should be equal to self': function (topic) {
			assert.isTrue(topic.equal(topic));
		},
		'minus (PI/2, PI) is (0, PI/2) ': function (topic) {
			var sub = new Arc(Math.PI / 2, Math.PI);
			assert.isTrue(topic.sub(sub).equal(new Arc(0, Math.PI/2)));
		},
	},
}).export(module);
