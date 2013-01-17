var _       = require('underscore'),
    async   = require('async'),
    request = require('request'),
    zendesk = require('node-zendesk')

var config  = require('./config.js');


var checkServers = function (servers, emitter) {
    var requests = [];
    var servers = servers;
    _.each(servers || false, function (server, id) {
        requests.push(function (callback) {
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
    async.series(requests, function (err, res) {
        var data = {};
        data.servers = res;
        emitter(data);
    });
}


var checkZendesk = function (client, emitter) {
    // Checks the number of open tickets (here open means not closed, not just
    // open in zendesk) and outputs that number. If we can't connect to 
    // zendesk we output an error.

    client.tickets.list(function (err, req, result) {
        if (err) {
            emitter({'error': "Can not connect to Zendesk"})
            return;
        }
        // TODO: Filter out closed tickets in the request, rather than in JS.
        var open = _.chain(result).filter(function (t) { 
            return t.status !== 'closed'
        }).sortBy(function (t) {
            return t.updated_at
        }).value();
        var oldest = open[0];
        emitter({
            'count': _(open).size(),
            'oldest': oldest.updated_at
        });
    });
}


module.exports = {
    'zendesk': {
        interval: 15 * 60 * 1000, // check every 15 minutes
        fetch: function(emitter) {
            checkZendesk(zendesk.createClient(config['zendesk']), emitter)
        }
    },
    'production-servers': {
        interval: 120 * 1000,
        fetch: function(emitter) {
            checkServers(config['production-servers'], emitter)
        }
    },
    'internal-servers': {
        interval: 60 * 1000,
        fetch: function(emitter) {
            checkServers(config['internal-servers'], emitter)
        }
    },
    'web-servers': {
        interval: 60 * 1000,
        fetch: function(emitter) {
            checkServers(config['web-servers'], emitter)
        }
    },
} 