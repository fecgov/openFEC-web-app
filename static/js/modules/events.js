var EventEmitter2 = require('eventemitter2').EventEmitter2;
this.cache = this.cache || new EventEmitter2();

module.exports = this.cache;
