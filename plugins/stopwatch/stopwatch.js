module.exports = function(bot, configuration) {
    var client = bot.client,
        plugins = bot.plugins,
        config = bot.config,
        name = bot.name,
        stopwatches = {},
        _commandTrigger = configuration.commandTrigger || '!';

    function pad(num, size) {
        var s = String(num);
        if(typeof(size) !== "number"){size = 2;}

        while (s.length < size) {s = "0" + s;}
        return s;
    }

    function _parseMessage(from, to, message) {
        if(to.substr(0, 1) === '#' && message.substr(0, 1) === _commandTrigger) {
            var cmd = message.substr(1).match(/[^\s"]+|"([^"]*)"/gi),
                nick = encodeURIComponent(from),
                sayreturn = '';

            if(cmd[0] === "stopwatch" || cmd[0] == "sw"){
                switch(cmd[1]){
                    case 'start':
                        if(nick in stopwatches){
                            if(stopwatches[nick].Running == true){
                                sayreturn = "Your stopwatch is already running!";
                            }else{
                                stopwatches[nick].StartTime = new Date().getTime();
                                stopwatches[nick].Running = true;
                                sayreturn = "Your stopwatch has started!";
                            }
                        }else{
                            stopwatches[nick] = {
                                Running:true,
                                StartTime:new Date().getTime()
                            };

                            sayreturn = "Your stopwatch has started!";
                        }
                    break;
                    case 'stop':
                        sayreturn = "You need to start your stopwatch first!";
                        if(nick in stopwatches){
                            if(stopwatches[nick].Running == true){
                                var now = new Date().getTime(),
                                diff = now - stopwatches[nick].StartTime,
                                hours = Math.floor(diff / 36e5),
                                mins = Math.floor((diff % 36e5) / 6e4),
                                secs = Math.floor((diff % 6e4) / 1000);

                                stopwatches[nick] = {
                                    Running:false,
                                    StartTime:new Date().getTime()
                                };

                                sayreturn = "The stopwatch stopped at: " + pad(hours) + ":" + pad(mins) + ":" + pad(secs);
                            }
                        }
                    break;
                    case 'status':
                        sayreturn = "You have no stopwatch running!";
                        if(nick in stopwatches){
                            if(stopwatches[nick].Running == true){
                                var now = new Date().getTime(),
                                diff = now - stopwatches[nick].StartTime,
                                hours = Math.floor(diff / 36e5),
                                mins = Math.floor((diff % 36e5) / 6e4),
                                secs = Math.floor((diff % 6e4) / 1000);

                                sayreturn = "The stopwatch is at: " + pad(hours) + ":" + pad(mins) + ":" + pad(secs);
                            }
                        }
                    break;
                }
            }

            if(sayreturn.length > 0)
                client.say(to, from + ': ' + sayreturn);
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