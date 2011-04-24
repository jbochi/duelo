var assert = require('assert'),
    app = require('../app'),
	tobi = require('tobi'),
    vows = require('vows');

vows.describe('server').addBatch({
	'GET /': {
		topic: function () {
	        var browser = tobi.createBrowser(app);
			browser.get('/', this.callback);
		},
		'should respond with a 200 OK': function (res, $) {
			//res.should.have.status(200);
			assert.equal(res.statusCode, 200);
		},
	},
}).export(module);
