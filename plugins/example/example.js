module.exports = function(bot, configuration) {
    var client = bot.client,
        plugins = bot.plugins,
        config = bot.config,
        name = bot.name;

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
        //plugin('permissions').set('USERNAME', 'GROUP', 1337);
        //plugin('permissions').save();
        //var p = plugin('permissions');
        //console.log('P', p);
    };

    /**
     * Called event, defined in events();
     * @param  {string} eventName The event name (see events();)
     * @param  {array}  arguments All event arguments
     */
    function onEvent(eventName, arguments) {
        //console.log('ONEVENT', eventName, arguments);
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