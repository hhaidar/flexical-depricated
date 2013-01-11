module.exports = {
    'servers': {
        'web': {
            url: 'http://sdelements.com/'
        },
        'google': {
            url: 'http://google.com/',
            test: function(res, body) {
                return body.match(/Feeling Lucky/i) ? true : false;
            }
        },
        'demiba': {
            url: 'http://demiba.com/',
            test: function(res, body) {
                return body.match(/1 Billion/i) ? true : false;
            }
        }
    }
}