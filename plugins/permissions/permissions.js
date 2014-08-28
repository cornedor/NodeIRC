module.exports = function(bot, configuration) {
    var fs = require('fs');

    var client = bot.client,
        plugins = bot.plugins,
        config = bot.config,
        name = bot.name;

    var _permissionsFile = configuration.permissionsFile || 'data/permissions.json',
        _autoSaveTimer = configuration.autoSaveTimer || 1000 * 5;

    var _ready = false;
    var _permissions = {
        "perm": { }
    };

    function save() {
        fs.writeFile(
            _permissionsFile,
            JSON.stringify(_permissions),
            function(err) {
                if(err) {
                    console.log('[PLUGIN::PERMISSIONS::ERROR]', err);
                }
            });
    };

    function load() {
        if(fs.existsSync(_permissionsFile)) {
            var data = fs.readFileSync(_permissionsFile).toString();

            try {
                _permissions = JSON.parse(data);
            } catch(e) {
                fs.writeFileSync(_permissionsFile + '.broken_' + new Date().getTime(), data);
                console.log('PLUGIN::PERMISSIONS:ERROR');
                console.log('Detected a broken file, saving old file. And create a new file!');
            }
        }
    };

    function get(username, group) {
        if(!_permissions.perm[group]) {
            return null;
        }
        return _permissions.perm[group][username] || null;
    };

    function set(username, group, level) {
        if(!_permissions.perm[group]) {
            _permissions.perm[group] = {};
        }
        _permissions.perm[group][username] = level;
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
        return [];
    };

    /**
     * This function is called when all plugins are ready to start.
     */
    function initialize() {
        load();

        setInterval(function() {
            save();
        }, _autoSaveTimer);
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
        save: save,
        load: load,
        get: get,
        set: set,

        events: events,
        initialize: initialize,
        onEvent: onEvent
    }
};