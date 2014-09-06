module.exports = function(bot, configuration) {
    var request = require('request'),
        x2j = require('xml2json');

    var client = bot.client,
        plugins = bot.plugins,
        config = bot.config,
        name = bot.name;

    var _pandoraBotId = configuration.pandoraBotId || null;

    function _parseMessage(from, to, message) {
        if(to.substr(0, 1) === '#' && message.substr(0, config.nickName.length) === config.nickName) {
            var input = encodeURIComponent(message.substr(config.nickName.length + 1).trim()),
                nick = encodeURIComponent(from),
                botApi = 'http://www.pandorabots.com/pandora/talk-xml?botid=' + _pandoraBotId + '&input=' + input + '&custid=' + nick;

            request(botApi, function(err, response, body) {
                if(!err && response.statusCode === 200) {
                    var json = JSON.parse(x2j.toJson(body, {sanitize: false}));

                    if(json.result.status > 0) {
                        var response = '[ERROR] Input status: ' + json.result.status;
                    } else {
                        var response = json.result.that.replace(/<(?:.|\n)*?>/gm, ' ');
                    }
                    client.say(to, from + ': ' + response);
                }
            });
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
            _parseMessage(arguments[0], arguments[1], arguments[2]);
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
