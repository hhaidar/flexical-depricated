window.ServersView = Backbone.View.extend({
    el: '[data-id="servers"]',
    initialize: function() {
        var self = this;
        this.template = Handlebars.compile(this.$('[data-template]').html());
        this.$servers = this.$('[data-list="servers"]');
    },
    update: function(data) {
        var self = this;
        _.each(data.servers, function(server) {
            var html = self.template(server);
            var $server = self.$servers.find('[data-id=' + server.id + ']');
            if ($server.length > 0) {
                $server.replaceWith(html);
            } else {
                self.$servers.append(html);
            }
        });
    },
});

window.InternalServersView = window.ServersView.extend({
    el: '[data-id="internal-servers"]',
});

window.ScotchView = Backbone.View.extend({
    el: '[data-id="tts"]',
    initialize: function() {
        var self = this;
        self.dueDate = new Date();
        self.dueDate.setHours(16);
        self.dueDate.setMinutes(0);
        setInterval(function() {
            var timeLeft = self.dueDate - (new Date());
            var time = "It's Time";
            if (timeLeft > 0) {
                var hours = Math.floor(timeLeft/3600000);
                var minutes = Math.floor(timeLeft/60000) % 60;
                if (minutes < 10) minutes = "0" + minutes;
                var seconds = Math.floor(timeLeft/1000) % 60;
                if (seconds < 10) seconds = "0" + seconds;
                time = hours + ":" + minutes + ":" + seconds;
            }
            self.$('[data-field="time"]').html(time);
        }, 1000);
    }
});
