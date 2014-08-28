module.exports = function(bot, configuration) {
    var fs = require('fs');    

    var client = bot.client,
        plugins = bot.plugins,
        config = bot.config,
        name = bot.name;

    var _webCommandFile = configuration.webCommandFile || 'data/webcommands.json',
        _autoSaveTimer = configuration.autoSaveTimer || 1000 * 120,
        _commandTrigger = configuration.commandTrigger || '!';

    var _commands = {
        'command': [],
        'ttt': [],
        'kevin': []
    };

    function _save() {
        fs.writeFile(
            _webCommandFile,
            JSON.stringify(_commands),
            function(err) {
                if(err) {
                    console.log('[PLUGIN::WEBCOMMANDS::ERROR]', err);
                }
            });
    };

    function _load() {
        if(fs.existsSync(_webCommandFile)) {
            var data = fs.readFileSync(_webCommandFile).toString();

            try {
                _permissions = JSON.parse(data);
            } catch(e) {
                fs.writeFileSync(_webCommandFile + '.broken_' + new Date().getTime(), data);
                console.log('PLUGIN::WEBCOMMANDS:ERROR');
                console.log('Detected a broken file, saving old file. And create a new file!');
            }
        }
    };

    function _checkCommand(from, to, message) {
        // Only send to channels, ignore private messages.
        if(to.substr(0, 1) === '#' && message.substr(0, 1) === _commandTrigger) {
            var cmd = message.substr(1).match(/[^\s"]+|"([^"]*)"/gi),
                index = -1;
            if(cmd[0] === 'webcommand') {
                if(cmd[1] === 'add') {

                } else if(cmd[1] === 'del') {

                } else if(cmd[1] === 'list') {

                }
            } else if(index = _commands.indexOf(cmd[1])) {
                console.log(index);
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