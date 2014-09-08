module.exports = function(bot, configuration) {
    var fs = require('fs');

    var client = bot.client,
        plugins = bot.plugins,
        config = bot.config,
        name = bot.name;

    var _stopwatch = {
        stopwatches: {},
        timers: {}
    };

    var _stopwatchFile = configuration.stopwatcheFile || 'data/stopwatch.js',
        _autoSaveTimer = configuration.autoSaveTimer || 1000 * 120,
        _commandTrigger = configuration.commandTrigger || '!';

    function _save() {
        fs.writeFile(
            _stopwatchFile,
            JSON.stringify(_stopwatch),
            function(err) {
                if(err) {
                    console.log('[PLUGIN::STOPWATCH::ERROR]', err);
                }
            });
    };

    function _load() {
        if(fs.existsSync(_stopwatchFile)) {
            var data = fs.readFileSync(_stopwatchFile).toString();

            try {
                _stopwatch = JSON.parse(data);
            } catch(e) {
                fs.writeFileSync(_stopwatchFile + '.broken_' + new Date().getTime(), data);
                console.log('PLUGIN::STOPWATCH:ERROR');
                console.log('Detected a broken file, save old file and create a new file!');
            }
        }
    };

    function _mktime(seconds) {
        function pad(num, size) {
            var s = String(num);
            if(typeof(size) !== 'number') { size = 2; }
            while(s.length < size) { s = '0' + s; }
            return s;
        }

        var h = pad(Math.floor((seconds / 36e5))),
            m = pad(Math.floor((seconds % 36e5) / 6e4)),
            s = pad(Math.floor((seconds % 6e4) / 1000));

        return h + ':' + m + ':' + s;
    }

    function _checkCommand(from, to, message) {
        if(message.substr(0, 1) === _commandTrigger) {
            var cmd = message.substr(1).match(/[^\s"]+|"([^"]*)"/gi),
                tok = to + '|' + from,
                msg = '';

            if(cmd[0] === 'stopwatch' || cmd[0] === 'sw') {
                switch(cmd[1]) {
                    case 'start':
                        if(_stopwatch.stopwatches.hasOwnProperty(tok) === false) {
                            _stopwatch.stopwatches[tok] = {start: new Date().getTime()};
                            msg = 'Your stopwatch has started!';
                        } else {
                            msg = 'Your stopwatch is already running!';
                        }
                        break;

                    case 'stop':
                        if(_stopwatch.stopwatches.hasOwnProperty(tok) === false) {
                            msg = 'You need to start your stopwatch first!';
                        } else {
                            var time = _stopwatch.stopwatches[tok].start;
                            msg = 'Your stopwatch stopped at: ' + _mktime(new Date().getTime() - time);
                            delete _stopwatch.stopwatches[tok];
                        }
                        break;

                    case 'status':
                        if(_stopwatch.stopwatches.hasOwnProperty(tok) === false) {
                            msg = 'You dont have a stopwatch running!';
                        } else {
                            var time = _stopwatch.stopwatches[tok].start;
                            msg = 'Your stopwatch stopped at: ' + _mktime(new Date().getTime() - time); 
                        }
                        break;

                    default:
                        break;
                }
            } else if(cmd[0] === 'timer') {
                msg = 'This feature is unfinished.';
                switch(cmd[1]) {
                    case 'set':
                        break;

                    case 'stop':
                        break;

                    case 'list':
                        break;
                }
            }

            if(msg.length > 0) {
                client.say(to, from + ': ' + msg);
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
        _load();

        setInterval(function() {
            _save();
        }, _autoSaveTimer);
    };

    /**
     * Called event, defined in events();
     * @param  {string} eventName The event name (see events();)
     * @param  {array}  arguments All event arguments
     */
    function onEvent(eventName, arguments) {
        if(eventName === 'message') {
            _checkCommand(arguments[0], arguments[1], arguments[2]);
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
