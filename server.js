var express = require('express'),
    app = express.createServer();

app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.session({ secret: "chunky bacon" }));
	app.use(express.static(__dirname + '/public'));
	app.set('view engine', 'ejs');	
});

app.get('/', function (req, res) {
	res.render('index');
});

app.listen(3000);

console.log('Server running at http://127.0.0.1:3000/');
