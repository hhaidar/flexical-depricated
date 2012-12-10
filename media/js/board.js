
var Flexical = function() {

    var self = this;

    this.widgets = {
        'servers': new window.ServersView
    }

    this.socket = io.connect();

    this.socket.on('connect', function(data) {
        console.log('connected');
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
 
}

$(function() {
    window.board = new Flexical();
});