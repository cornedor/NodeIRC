var path        = require('path'),
    fs          = require('fs'),
    irc         = require('irc'),
    botPool     = [];

var isLoaded = function(botName) {
    for(var i = 0; i < botPool.length; i++) {
        if(botPool[i].name === botName) {
            return i;
        }
    }
    return false;
};
exports.isLoaded = isLoaded;

var add = function(botName, configuration) {
    if(isLoaded(botName) !== false) {
        return false;
    }

    // Setup the IRC client
    var client = new irc.Client(configuration.server || 'irg.freenode.org', configuration.nickName || 'NodeIRC-' + botName, {
        userName:               configuration.userName              || 'NodeIRC-' + botName,
        realName:               configuration.realName              || 'NodeIRC-' + botName,
        password:               configuration.password              || null,
        port:                   configuration.port                  || 6667,
        debug:                  configuration.debug                 || false,
        showErrors:             configuration.showErrors            || false,
        autoRejoin:             configuration.autoRejoin            || false,
        autoConnect:            configuration.autoConnect           && true,
        channels:               configuration.channels              || [],
        secure:                 configuration.secure                || false,
        selfSigned:             configuration.selfSigned            || false,
        certExpired:            configuration.certExpired           || false,
        floodProtection:        configuration.floodProtection       && true,
        floodProtectionDelay:   configuration.floodDelay            || 1000,
        sasl:                   configuration.sasl                  || false,
        stripColors:            configuration.stripColors           || false,
        channelPrefixes:        configuration.channelPrefixes       || "&#",
        messageSplit:           configuration.messageSplit          || 512
    });

    // Add bot to pool list
    botPool.push({
        name: botName,
        client: client,
        config: configuration,
        plugins: []
    });

    // Load all plugins for the bot
    if(configuration.plugins) {
        var plugin,
            pluginNames = [],
            file,
            counter = 0;
        for(var i = 0; i < configuration.plugins.length; i++) {
            plugin = configuration.plugins[i];
            file = path.join(__dirname, 'plugins', plugin.plugin, plugin.plugin + '.js');
            (function() {
                var f = file,
                    p = plugin;
                
                fs.exists(f, function(exists) {
                    if(exists) {
                        pluginNames.push(p.plugin);
                        loadPlugin(botName, f, p);
                    }
                    counter++;
                    if(counter === i) {
                        var bot = isLoaded(botName);
                        if(bot !== false) {
                            for(var j = 0; j < botPool[bot].plugins.length; j++) {
                                botPool[bot].plugins[j].plugin.initialize();
                            }
                            registerClientEventHandler(botName);
                        }
                    }
                });
            }());
        }
    }
};
exports.add = add;

var loadPlugin = function(botName, plugin, configuration) {
    var botId = isLoaded(botName);
    if(botId === false) {
        return false;
    }

    botPool[botId].plugins.push({
        name: configuration.plugin,
        plugin: require(plugin)(botPool[botId], configuration)
    });
};
exports.loadPlugin = loadPlugin;

var registerClientEventHandler = function(botName) {
    var botId = isLoaded(botName),
        client, 
        plugins,
        events = [];
    if(botId === false) {
        return false;
    }
    
    client = botPool[botId].client;
    plugins = botPool[botId].plugins;

    // Iterate through all plugins and find out wich events we need to
    // register
    for(var i = 0; i < plugins.length; i++) {
        events = events.concat(plugins[i].plugin.events());
    }

    // Iterate through all events and remove the duplicates
    for(var i = 0; i < events.length; i++) {
        for(var j = i+1; j < events.length; j++) {
            if(events[i] === events[j]) {
                events.splice(j--, 1);
            }
        }
    }

    // Loop throuh all events and register those
    for(var i = 0; i < events.length; i++) {
        (function() {
            var ii = i;
            client.addListener(events[ii], function() {
                var args = arguments;
                for(var j = 0; j < plugins.length; j++) {
                    (function() {
                        var jj = j;
                        plugins[jj].plugin.onEvent(events[ii], args);
                    }());
                }
            });
        }());
    }
};

var getPlugin = function(botName, pluginName) {
    var botId = isLoaded(botName);
    if(botId === false) {
        return false;
    }

    for(var i = 0; i < botPool[botId].plugins.length; i++) {
        if(botPool[botId].plugins[i].name === pluginName) {
            return botPool[botId].plugins[i].plugin;
        }
    }
    return false;
};
exports.getPlugin = getPlugin;
