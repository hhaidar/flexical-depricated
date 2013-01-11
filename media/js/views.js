window.BoardView = Backbone.View.extend({
    el: 'body',
    initialize: function() {
        this.$header = this.$('header');
        this.$status = this.$header.find('.status');
        this.$status.find('[data-indicator]').hide();
    },
    status: function(status) {
        this.$status.find('[data-indicator]').hide();
        this.$status.find('[data-indicator=' + status + ']').show();
    }
});

window.ServersView = Backbone.View.extend({
    initialize: function() {
        var self = this;
        this.color = this.$el.data('color') || '';
        this.template = Handlebars.compile(this.$('[data-template]').html());
    },
    animateCount: function($element, value) {
        var current = parseInt($element.text());
        current = isNaN(current) ? 0 : current;
        jQuery({
            value: current
        }).animate({
            value: value
        }, {
            duration: 1000,
            easing:'swing',
            step: function() {
                $element.text(Math.ceil(this.value));
            }
        });
    },
    update: function(data) {
        var self = this;
        var up = _.where(data.servers, {
            status: 'up'
        });
        var down = _.where(data.servers, {
            status: 'down'
        });
        var total = _.size(up) + _.size(down);
        var percentage = Math.ceil(_.size(up) / total * 100);
        // Set percentage
	this.$('.percentage .value').html(_.size(down) > 0 ? '<i class="icon-warning-sign"></i> ERR' : '<i class="icon-ok"></i> OK');
        // Set stats
        this.$('.up').toggle(_.size(up) > 0)
            .find('.value').text(_.size(up));
        this.$('.down').toggle(_.size(down) > 0)
            .find('.value').text(_.size(down));
        this.$('.separator').toggle(_.size(up) > 0 && _.size(down) > 0);
        // List offline servers
        this.$('.servers').empty();
        _.each(down, function(server) {
            self.$('.servers').append(self.template({
                id: server.id,
                name: server.name || server.id
            }));
        });
        // Widget Color
        this.$el.attr('data-color', _.size(down) > 0 ? 'red' : this.color);
    },
});
