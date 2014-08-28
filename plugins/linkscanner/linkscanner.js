module.exports = function(bot, configuration) {
    var request = require('request'),
        mime = require('mime-magic'),
        fs = require('fs');

    var client = bot.client,
        plugins = bot.plugins,
        config = bot.config,
        name = bot.name;

    var _linkRegExp = configuration.linkRegExp || /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g,
        _titleRegExp = configuration.titleRegExp || /<title>(.*?)<\/title>/i,
        _limitTitleLength = configuration.limitTitleLength || 128,
        _limitMultipleRequests = configuration.limitMultipleRequests || 3,
        _maxFileSize = configuration.fileSize || 1024 * 1024 * 8,
        _downloadTimeout = configuration.downloadTimeout || 8000,
        _tmpStorage = configuration.tmpStorage || '/tmp';


    function _humanReadableFileSize(bytes, power) {
        var i = Math.floor(Math.log(bytes) / Math.log(power));
        return (bytes / Math.pow(power, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][i];
    };

    function _downloadFile(url, fileName, maxSize, callback) {
        // First check the header
        request({url: url, method: 'HEAD'}, function(err, data) {
            if(err) {
                callback(false, 'No network');
                return;
            }

            if(data.headers && data.headers['content-length'] && data.headers['content-length'] > maxSize) {
                callback(false, 'Resource size exceeds limit (' + _humanReadableFileSize(data.headers['content-length'], 1024) + ')');
            } else {
                var file = fs.createWriteStream(fileName),
                    res = request({url: url}),
                    size = 0;

                res.on('data', function(data) {
                    size += data.length;

                    if(size > maxSize) {
                        callback(false, 'Resource size exceeds limit (' + _humanReadableFileSize(size, 1024) + ')');
                        res.abort();
                        fs.unlink(fileName);
                        return;
                    }
                }).pipe(file);

                res.on('end', function() {
                    callback(true, fileName);
                    return;
                });
            }
        });
    };

    function _getFileInformation(file, callback) {
        mime(file, function(err, mime) {
            if(err) {
                console.log('[ERROR::PLUGIN-LINKSCANNER]', err.message);
            } else {
                fs.readFile(file, function(err, data) {
                    if(mime === 'text/html') {
                        var match = _titleRegExp.exec(data);
                        if(match && match[1]) {
                            callback(false, 'Title: ' + match[1].substr(0, _limitTitleLength));
                        } else {
                            callback(false, 'ERROR');
                        }
                    } else {
                        callback(false, 'File type: ' + mime + ', size: ' + _humanReadableFileSize(data.length, 1024));
                    }

                    fs.unlink(file);
                });
            }
        });
    };

    function _detectLinks(from, to, message) {
        // Only send to channels, ignore private messages.
        if(to.substr(0, 1) === '#') {
            var counter = 0;
            while(match = _linkRegExp.exec(message)) {
                var url = match[0],
                    file = _tmpStorage + '/nodebot-linkinspector' + Math.round(Math.random() * 99999);

                counter++;
                if(counter > _limitMultipleRequests) {
                    return;
                }

                _downloadFile(url, file, _maxFileSize, function(status, data) {
                    if(status === true) {
                        _getFileInformation(data, function(err, message) {
                            client.say(to, message);
                        });
                    } else {
                        client.say(to, status);
                    }
                });
            }
        }
    };

    /**
     * Register all those given events which calls back the onEvent()
     * @return {array} All events we need here
     */
    function events() {
        // 'registered', 'motd','names','names#channel','topic',
        // 'join','join#channel','part','part#channel','quit',
        // 'kick','kick#channel','kill','message','message#',
        // 'message#channel','notice','ping','pm','ctcp','ctcp-notice',
        // 'ctcp-version','nick','invite','+mode','-mode','whois',
        // 'channellist_start','channellist_item','channellist','raw',
        // 'error'
        return ['message'];
    };

    /**
     * This function is called when all plugins are ready to start.
     */
    function initialize() {
        
    };

    /**
     * Called event, defined in events();
     * @param  {string} eventName The event name (see events();)
     * @param  {array}  arguments All event arguments
     */
    function onEvent(eventName, arguments) {
        if(eventName === 'message') {
            _detectLinks(arguments[0], arguments[1], arguments[2]);
        }
    }

    /**
     * Call a plugin
     * @param  {string} name The plugin name
     * @return {plugin}      The requested plugin
     */
    function plugin(name) {
        for(var i = 0; i < plugins.length; i++) {
            if(plugins[i].name === name) {
                return plugins[i].plugin;
            }
        }
        return null;
    };

    return {
        events: events,
        initialize: initialize,
        onEvent: onEvent
    }
};