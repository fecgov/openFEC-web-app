'use strict';

var events = require('./events.js');

module.exports = {
    init: function() {
        window.onpopstate = function() {
            switch (document.location.pathname) {
                case '/candidates':
                    debugger;
                    break;
                case '/':
                    events.emit('render:landingView');
                    break;
            }
        }
   }
};
