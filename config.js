module.exports = {
    'board': {
        'title': 'Flexical'
    },
    'iteration': {
        'version': '1.0',
        'description': 'Workin\' on stuffs'
    },
    'events': {
        'event-1': {
            date: 'Jan 22, 2020',
            name: 'Big Huge Meeting'
        },
        'event-2': {
            date: 'April 27, 2025',
            name: 'Epic Dance Off'
        },
        'event-3': {
            date: 'March 4, 2040',
            name: 'Alien Invasion'
        }
    },
    'support': {
        'houssam': {
            name: 'Houssam Haidar',
            gravatar: 'bcea6b8c06220e389093f36a8895fab4',
            tier: 'I'
        },
        'ramanan': {
            name: 'Ramanan Sivaranjan',
            gravatar: '92cd9a233c83fdd1aed9fe833b11d1ea',
            tier: 'II'
        }
    },
    'production-servers': {
        'google': {
            name: 'Google',
            url: 'http://google.com/'
        },
        'github': {
            name: 'Github',
            url: 'http://github.com/',
            test: function(res, body) {
                return body.match(/somethingbogus/i) ? true : false;
            }
        },
        'demiba': {
            name: 'Demiba',
            url: 'http://demiba.com/'
        }
    },
    'internal-servers': {
        'google': {
            name: 'Google Canada',
            url: 'http://google.ca/',
            test: function(res, body) {
                return body.match(/Feeling Lucky/i) ? true : false;
            }
        },
        'example': {
            url: 'http://example.com/'
        }
    },
    'web-servers': {
        'local': {
            name: 'Local Web Server',
            url: 'http://127.0.0.1'
        },
    }
}