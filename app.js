var express = require('express'),
    handlebars = require('express-handlebars'),
    request = require('request'),
    candidateHelpers = require('./shared/candidate-helpers.js'),
    committeeHelpers = require('./shared/committee-helpers.js');

var app = express();

var tmpls = handlebars.create({
    defaultLayout: 'main',
    partialsDir: ['views/partials']
});

app.engine('handlebars', tmpls.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/static'));
app.use('/views', express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/node_modules'));

app.get('/', function(req, res, next) {
    res.render('search');
});

app.get('/search', function(req, res, next) {
    if (Object.keys(req.query).length === 0) {
        res.render('search');
    }
    else {
        res.redirect('/candidates?name=' + req.query.search);
    }
});

app.get('/candidates', function(req, res, next) {
    // TODO: make relative urls work
    var URL = 'http://localhost/rest/candidate';
    if (typeof req.query.name !== 'undefined') {
        URL += '?name=' + req.query.name;
    }

    request(URL, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var data,
                candidates;

            data = JSON.parse(body);            
            candidates = candidateHelpers.buildCandidateContext(data.results);

            res.render('candidates', {
                section: 'candidates', 
                candidates: candidates
            });
        }
    });
});

app.get('/committees', function(req, res, next) {
     // TODO: make relative urls work
    var URL = 'http://localhost/rest/committee';
    if (typeof req.query.name !== 'undefined') {
        URL += '?name=' + req.query.name;
    }

    request(URL, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var data,
                committees;

            data = JSON.parse(body);            
            committees = committeeHelpers.buildCommitteeContext(data.results);

            res.render('committees', {
                section: 'committees', 
                committees: committees
            });
        }
    });
   
});

app.listen(3000);
