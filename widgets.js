var _ = require('underscore');
var async = require('async');
var request = require('request');

var config = require('./config.js');

module.exports = {
    'servers': {
        title: 'Server Status',
        interval: 30 * 1000,
        fetch: function(emitter) {
            var requests = [];
            var servers = config.servers;
            _.each(servers, function(server, id) {
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
    },
    'internal-servers': {
        title: 'Internal Server Status',
        interval: 30 * 1000,
        fetch: function(emitter) {
            var requests = [];
            var servers = config.internal_servers;
            _.each(servers, function(server, id) {
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
    }
}
