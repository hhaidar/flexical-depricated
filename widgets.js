var _       = require('underscore'),
    async   = require('async'),
    http    = require('http'),
    request = require('request'),
    rpc     = require('jsonrpc2'),
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


var iterationProgress = function(tracServer, emitter) {
    var statusOrder = ['new', 'assigned', 'accepted', 'reopened', 'code_review', 'in_qa', 'closed'];
    iterationProgress.loadTickets(tracServer, function(milestone, tickets) {
        _.sortBy(tickets, function(x) {
            return statusOrder.indexOf(x[3].status);
        });
        var data = {milestone: milestone, tickets: []};
        _.each(tickets, function(ticket) {
            ticket[3].id = ticket[0];
            data.tickets.push(ticket[3]);
        });
        emitter(data);
    });
};

iterationProgress.loadTickets = function(tracServer, callback) {
    var trac = new rpc.Client(tracServer.port, tracServer.host,
        tracServer.username, tracServer.password);
    var opts = {path: "/login/jsonrpc"};
    trac.call("ticket.milestone.getAll", [], opts, function(err, result) {
        var milestones = _.reject(result, function(x) {return isNaN(parseInt(x[0]))});
        var milestone = _.last(milestones);
        var query = "milestone=" + milestone + "&type=User story";
        trac.call("ticket.query", [query], opts, function(err, ticketIds) {
            var ticketCalls = [];
            _.each(ticketIds, function(ticketId) {
                ticketCalls.push(function(asyncCallback) {
                    trac.call("ticket.get", [ticketId], {path: "/login/jsonrpc"}, asyncCallback);
                });
            });
            async.parallel(ticketCalls, function(err, tickets) {
                callback(milestone, tickets);
            });
        });
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
        // TODO: Filter out closed tickets in the request rather than in JS.
        var open = _.chain(result).filter(function (t) { 
            return t.status !== 'closed' && t.status !== 'solved'
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
    'iteration': {
        interval: 60 * 10000,
        fetch: function(emitter) {
            iterationProgress(config['trac-server'], emitter)
        }
    }
}


// Overwrite connectHttp method with one that sets content-type
rpc.Client.prototype.connectHttp = function connectHttp(method, params, opts, callback)
{
  if ("function" === typeof opts) {
    callback = opts;
    opts = {};
  }
  opts = opts || {};

  var client = http.createClient(this.port, this.host);

  var id = 1;

  // First we encode the request into JSON
  var requestJSON = JSON.stringify({
    'id': id,
    'method': method,
    'params': params,
    'jsonrpc': '2.0'
  });

  // Report errors from the http client. This also prevents crashes since
  // an exception is thrown if we don't handle this event.
  client.on('error', function(err) {
    callback(err);
  });

  var headers = {};

  if (this.user && this.password) {
    var buff = new Buffer(this.user + ":" + this.password).toString('base64');
    var auth = 'Basic ' + buff;
    headers['Authorization'] = auth;
  }

  // Then we build some basic headers.
  headers['Host'] = this.host;
  headers['Content-Length'] = Buffer.byteLength(requestJSON, 'utf8');
  headers['Content-Type'] = 'application/json'

  // Now we'll make a request to the server
  var request = client.request('POST', opts.path || '/', headers);
  request.write(requestJSON);
  request.on('response', callback.bind(this, id, request));
};
