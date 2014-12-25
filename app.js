var express = require('express'),
    handlebars = require('express-handlebars'),
    request = require('request'),
    _ = require('underscore'),
    helpers = require('./shared/helpers.js');
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

var loadSingleEntity = function(entityType, id, res) {
    var URL = 'http://localhost:5000/' + entityType + '?' + entityType + '_id=' + id + '&fields=*';

    request(URL, function(err, response, body) {
        var data,
            context = {};

        data = JSON.parse(body);
        _.extend(context, entityBuildMethodMap[entityType](data.results));
        context[0].navShown = true;
        res.render(entityType + 's-single', context[0]);
    });
}

var loadResultsView = function(entityType, req, res, next) {
    // TODO: make relative urls work
    var URL = 'http://localhost:5000/' + entityType + '?',
        filters = {};
    if (typeof req.query !== 'undefined') {
        for (param in req.query) {
            URL += param + '=' + req.query[param] + '&';
            // assemble filters obj for context in templating
            filters[param] = req.query[param];
        }
    }
    else {
        URL += 'fields=*';
    }

    filters.fields = '*';

    (function(filters) {
        request(URL, function(err, response, body) {
            if (!err && response.statusCode == 200) {
                var data,
                    results,
                    context = {
                        navShown: true,
                        section: entityType + 's',
                        filters: filters,
                        category: entityType + 's'
                    };

                data = JSON.parse(body);            
                context.data = data;
                results = entityBuildMethodMap[entityType](data.results);
                context[entityType + 's'] = results;
                _.extend(context, helpers.getPaginationValues(context));

                res.render(entityType + 's', context);
            }
        });
    })();
};

app.engine('handlebars', tmpls.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/static'));
app.use('/views', express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/node_modules'));
app.use('/tests', express.static(__dirname + '/tests'));

app.get('/', function(req, res, next) {
    if (req.query.test == 'true') {
        // for selenium tests
        res.render('search', {'mockjax': true});
    }
    else {
        res.render('search');
    }
});

app.get('/search', function(req, res, next) {
    res.render('search');
});

app.get('/candidates', function(req, res, next) {
    loadResultsView('candidate', req, res, next);
});

app.get('/committees', function(req, res, next) {
    loadResultsView('committee', req, res, next);  
});

app.get('/candidates/:id', function(req, res, next) {
    loadSingleEntity('candidate', req.params.id, res);
});

app.get('/committees/:id', function(req, res, next) {
    loadSingleEntity('committee', req.params.id, res);
});


app.listen(3000);
