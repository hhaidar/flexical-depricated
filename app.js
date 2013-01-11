var _ = require('underscore');
var express = require('express');
var cons = require('consolidate');
var swig = require('swig');
var hat = require('hat');
var http = require('http');
var fs = require('fs');   

var config = require('./config.js');

var Flexical = function() {

    var self = this;
    
    // Instance id
    this.id = hat();

    this.app = express();
    
    //
    // Setup
    //
    this.app.configure(function() {
        swig.init({
            root: 'templates',
            allowErrors: true,
            cache: false
        });
        self.app.engine('.html', cons.swig);
        self.app.set('view engine', 'html');
        self.app.set('views', 'templates');
        self.app.use('/media', express.static(__dirname + '/media'));
    });

    //
    // Routes
    //
    this.app.get('/', function (req, res) {
        res.render('board.html', {
            media_url: '/media',
            config: config
        });
    });

    //
    // Server
    //
    this.server = http.createServer(this.app);

    //
    // Socket IO
    //
    this.io = require('socket.io').listen(this.server);

    this.io.set('transports', ['websocket'])
    this.io.set('log level', 0);

    this.io.sockets.on('connection', function(client) {
        client.emit('board:id', self.id);
        client.emit('widgets:init', self.widgets);
    });
    
    //
    // Widgets
    //
    this.widgets = require('./widgets.js');
    this.timers = {};
    _.each(this.widgets, function(widget, id) {
        var fetch;
        self.timers[id] = setInterval(fetch = function() {
            widget.fetch(function(data) {
                data = _.extend({
                    id: id
                }, data);
                self.widgets[id].data = data;
                self.io.sockets.emit('widget:update', data);
            });
        }, widget.interval || 5000);
        fetch();
    })
    
    //
    // Listen
    //
    this.server.listen(3000);

}

var board = new Flexical();

