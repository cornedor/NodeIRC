NodeIRC
=======

Simple, dynamic and modular NodeJS IRC Bot framework

Features
---
- Multiple bot configuration in JSON formatted configs that can run side by side.
- Easy to write plugins in NodeJS.

Plugins
---
Plugin name | Version | Description
--- | --- | ---
example | 0.0.0 | A little example how to write plugins.
linkscanner | 0.3.2 | Inspects the given URLs and return the webpage title or mime type with filesize.
nickserv | 1.0.0 | When you bot nickname has been reserved, you can login with this plugin.
permissions | 0.1.3 | Permission system
webcommands | 0.0.2 | Custom commands that calls web urls
Pandorabot | 1.0.0 | Pandora chatbot
stopwatch | 1.0.0 | Stopwatch plugin for keeping track of time

Todo
---
- More plugins..
- Command line interface to manager the bot clients

How to install and run
---
Install all dependencies of the NodeIRC Framework using ```npm install```

Modify or add your bot configurations in ./bots/*.json

Start the botframework using this command ```node application.js```
