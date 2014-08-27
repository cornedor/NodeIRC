var path        = require('path'),
    fs          = require('fs'),

    botHandler  = require('./bothandler.js');

// Startup the bot framework and load all enabled bots.
var configuration = {},
    botCounter = 0;

fs.readdirSync(path.join(__dirname, 'bots')).forEach(function(file) {
    if(file.substr(-5) === '.json') {
        configuration = require(path.join(__dirname, 'bots', file));
        if(configuration.enabled === true) {
            botCounter++;
            botHandler.add('test', configuration);
        }
    }
});
