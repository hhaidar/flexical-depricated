
var Flexical = function() {

    var self = this;

    this.view = new window.BoardView;

    this.widgets = {
        'production-servers': new window.ServersView({
            el: '[data-id="production-servers"]'
        }),
        'internal-servers': new window.ServersView({
            el: '[data-id="internal-servers"]'
        }),
        'web-servers': new window.ServersView({
            el: '[data-id="web-servers"]'
        }),
        'iteration': new window.IterationView({
            el: '[data-id="iteration"]'
        }),
        'zendesk': new window.ZendeskView({
            el: '[data-id="support"]'
        })
    }

    this.socket = io.connect();

    this.socket.on('connecting', function() {
        self.view.status('connecting');
    });

    this.socket.on('connect', function() {
        self.view.status('connected');
    });

    this.socket.on('disconnect', function() {
        self.view.status('disconnected');
    });

    // Ghetto states until I make it better
    this.socket.on('board:id', function(id) {
        if (!self.id) {
            self.id = id;
            return;
        }
        if (self.id != id) {
            self.refresh();
        }
    });

    this.socket.on('widgets:init', function(widgets) {
        _.each(widgets, function(widget) {
            if (widget.data) {
                var data = widget.data;
                if (self.widgets[data.id]) {
                    var view = self.widgets[data.id];
                    if (view) {
                        view.update(data);
                    }
                }
            }
        });
    });

    this.socket.on('widget:update', function(data) {
        if (self.widgets[data.id]) {
            var view = self.widgets[data.id];
            if (view) {
                view.update(data);
            }
        }
    });

    this.refresh = function() {
        clearTimeout(this.reloadTimer);
        this.reloadTimer = setTimeout(function() {
            location.reload();
        }, 5 * 1000);
    }
}

$(function() {
    window.board = new Flexical();
});
