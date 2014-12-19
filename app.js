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

var entityBuildMethodMap = {
    'candidate': candidateHelpers.buildCandidateContext,
    'committee': committeeHelpers.buildCommitteeContext
}

var loadResultsView = function(entityType, req, res, next) {
    // TODO: make relative urls work
    var URL = 'http://localhost/rest/' + entityType + '?';
    if (typeof req.query !== 'undefined') {
        for (param in req.query) {
            URL += param + '=' + req.query[param] + '&';
        }
    }
    else {
        URL += 'fields=*';
    }

    request(URL, function(err, response, body) {
        if (!err && response.statusCode == 200) {
            var data,
                results,
                context = {
                    navShown: true,
                    section: entityType + 's'
                };

            data = JSON.parse(body);            
            results = entityBuildMethodMap[entityType](data.results);
            context[entityType + 's'] = results;

            res.render(entityType + 's', context);
        }
    });
};

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
        res.redirect('/candidates?fields=*&q=' + req.query.search);
    }
});

app.get('/candidates', function(req, res, next) {
    loadResultsView('candidate', req, res, next);
});

app.get('/committees', function(req, res, next) {
    loadResultsView('committee', req, res, next);  
});

app.listen(3000);
