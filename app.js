var express = require('express'),
    handlebars = require('express-handlebars');

var app = express();

var tmpls = handlebars.create({
    defaultLayout: 'main',
    partialsDir: ['views/partials']
});

app.engine('handlebars', tmpls.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/static'));
app.use('/views', express.static(__dirname + '/views'));

app.get('/', function(req, res, next) {
    res.render('search');
});

app.get('/search', function(req, res, next) {
    res.render('search');
});

app.get('/candidates', function(req, res, next) {
    res.render('candidates', {section: 'candidates'});
});

app.listen(3000);
