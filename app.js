var _ = require('underscore');
var express = require('express');
var cons = require('consolidate');
var swig = require('swig');
var http = require('http');

var Flexical = function() {

    var self = this;
    
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
            media_url: '/media'
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
        this.emit('widgets:init', self.widgets);
    });
    
    //
    // Widgets
    //
    this.widgets = require('./widgets.js');
    this.timers = {};
    _.each(this.widgets, function(widget, id) {
        self.timers[id] = setInterval(function() {
            widget.fetch(function(data) {
                data = _.extend({
                    id: id
                }, data);
                self.widgets[id].data = data;
                self.io.sockets.emit('widget:update', data);
            });
        }, widget.interval || 5000);
    })
    
    //
    // Listen
    //
    this.server.listen(3000);

}

var board = new Flexical();

