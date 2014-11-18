'use strict';

var events = require('./events.js');

var mappedCategories = ['party', 'type', 'designation'];

var filterMap = {
    'party': {
        "AIC": "American Independent Conservative",
        "AIP": "American Independent Party",
        "AMP": "American Party",
        "APF": "American People's Freedom Party",
        "CIT": "Citizens' Party",
        "CMP": "Commonealth Party of the U.S.",
        "COM": "Communist Party",
        "CRV": "Conservative Party",
        "CST": "Constitutional",
        "D/C": "Democratic/Conservative",
        "DEM": "Democratic Party",
        "DFL": "Democratic-Farm-Labor",
        "FLP": "Freedom Labor Party",
        "GRE": "Green Party",
        "GWP": "George Wallace Party",
        "HRP": "Human Rights Party",
        "IAP": "Independent American Party",
        "ICD": "Independent Conserv. Democratic",
        "IGD": "Industrial Government Party",
        "IND": "Independent",
        "LAB": "U.S. Labor Party",
        "LBL": "Liberal Party",
        "LBR": "Labor Party",
        "LBU": "Liberty Union Party",
        "LFT": "Less Federal Taxes",
        "LIB": "Libertarian",
        "LRU": "La Raza Unida",
        "NAP": "Prohibition Party",
        "NDP": "National Democratic Party",
        "NLP": "Natural La Party",
        "PAF": "Peace and Freedom",
        "PFD": "Peace Freedom Party",
        "POP": "People Over Politics",
        "PPD": "Protest, Progress, Dignity",
        "PPY": "People's Party",
        "REF": "Reform Party",
        "REP": "Republican Party",
        "RTL": "Right to Life",
        "SLP": "Socialist Labor Party",
        "SUS": "Socialist Party U.S.A.",
        "SWP": "Socialist Workers Party",
        "THD": "Theo-Dem",
        "TX": "Taxpayers",
        "USP": "U.S. People's Party"
    },

    'type': {
        'P': 'Presidential',
        'H': 'House',
        'S': 'Senate',
        'C': 'Communication Cost',
        'D': 'Delegate Committee',
        'E': 'Electioneering Communication',
        'I': 'Independent Expenditor (Person or Group)',
        'N': 'PAC - Nonqualified',
        'O': 'Independent Expenditure-Only (Super PACs)',
        'Q': 'PAC - Qualified',
        'U': 'Single Candidate Independent Expenditure',
        'V': 'PAC with Non-Contribution Account - Nonqualified',
        'W': 'PAC with Non-Contribution Account - Qualified',
        'X': 'Party - Nonqualified',
        'Y': 'Party - Qualified',
        'Z': 'National Party Nonfederal Account'
    },

    'designation': {
        'A': 'Authorized by a candidate',
        'J': 'Joint fundraising committee',
        'P': 'Principal campaign committee',
        'U': 'Unauthorized',
        'B': 'Lobbyist/Registrant PAC',
        'D': 'Leadership PAC'
    }
};

// http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript/196991#196991
var toTitleCase = function(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var activateFilter = function() {
    selectedFilters[this.name] = this.value;

    events.emit('selected:filter', {
        field: this.name,
        value: this.value,
        category: $('#main').data('section'),
        filters: selectedFilters
    });

    addActiveStyle(this);
};

var deactivateFilter = function() {
    delete selectedFilters[this.name];

    events.emit('deselected:filter', {
        category: $('#main').data('section'),
        filters: selectedFilters
    });

    removeActiveStyle(this);
};

var bindFilters = function(e) {
    $('#category-filters select').chosen({
        width: "100%",
        allow_single_deselect: true
    });


    if (typeof e !== 'undefined' && typeof e.query !== 'undefined') {
        $('#category-filters').find('input[name=name]').val(e.query).parent().addClass('active');

        selectedFilters['name'] = e.query;
    }

    // make select boxes work
    $('#category-filters select').chosen().change(function(e, selected) {
        // if there is no selected object, the user deselected the field
        if (typeof selected === 'undefined') {
            deactivateFilter.call(this);
        }
        else {
            activateFilter.call(this);
        }
    });

    // make name filter work
    $('#category-filters input').on('input', function() {
        if ($('.add-filter').length === 0) {
            $(this).parent().append('<a class="add-filter">+</a>');
        }
    });

    // apply name filter
    $('#category-filters').on('click', '.add-filter', function() {
        activateFilter.call($(this).prev()[0]);
    });
};

var selectedFilters = {};

var addActiveStyle = function(field) {
    $(field).parent().addClass('active');
};

var removeActiveStyle = function(field) {
    $(field).parent().removeClass('active');
};

module.exports = {
    init: function() {
        events.on('bind:filters', bindFilters);

        // toggle filter drawer open/shut
        $('#main').on('click', '.filter-header-bar', function() {
            $('.filter-field-container').slideToggle();
        });

        // if loaded on a page with filters, init chosen
        bindFilters();
    }
};
