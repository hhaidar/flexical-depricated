var _ = require('underscore');
var async = require('async');
var request = require('request');

var config = require('./config.js');


var checkServers = function(servers, emitter) {
    var requests = [];
    var servers = servers;
    _.each(servers || false, function(server, id) {
        requests.push(function(callback) {
            var current = { 
                id: id,
                name: server.name,
                status: 'up'
            }
            request({
                uri: server.url,
                method: server.method || 'GET'
            }, function (err, res, body) {
                if (err || server.test && !server.test(res, body)) {
                    // Well shit
                    current.status = 'down'
                    callback(null, current);
                    return;
                }
                callback(null, current)
            });
        });
    });
    async.series(requests, function(err, res) {
        var data = {};
        data.servers = res;
        emitter(data);
    });
}

module.exports = {
    'production-servers': {
        interval: 120 * 1000,
        fetch: function(emitter) {
            checkServers(config['production-servers'], emitter)
        }
    },
    'internal-servers': {
        interval: 60 * 1000,
        fetch: checkServers,
        fetch: function(emitter) {
            checkServers(config['internal-servers'], emitter)
        }
    },
    'web-servers': {
        interval: 60 * 1000,
        fetch: checkServers,
        fetch: function(emitter) {
            checkServers(config['web-servers'], emitter)
        }
    },
} 