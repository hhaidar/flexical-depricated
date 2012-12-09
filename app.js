var express = require('express');
var cons = require('consolidate');
var swig = require('swig');

var app = express();

app.engine('.html', cons.swig);

app.set('view engine', 'html');

swig.init({
    root: 'templates',
    allowErrors: true
});

app.set('views', 'templates');

app.use('/media', express.static(__dirname + '/media'));

app.get('/', function (req, res) {
    res.render('board.html', {
        media_url: '/media'
    });
});

app.listen(3000);