/* global process */

var url = require('url');
var _ = require('lodash');
var env = require('cfenv').getAppEnv();

_.each(env.getServices(), function(service) {
  _.extend(process.env, service.credentials);
});

var redis = env.getService(/redis/);
process.env.REDIS_URL = url.format({
  protocol: 'redis:',
  auth: ':' + redis.credentials.password,
  hostname: redis.credentials.hostname,
  port: redis.credentials.port,
  slashes: true
});

require('feedback/server');
