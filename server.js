(function () {
  'use strict';

  require('dotenv').load();

  var bot;

  var slackClient = new (require('slack-client'))(process.env.SLACK_TOKEN),
      request     = require('request');
  var escapeStringRegexp = require('escape-string-regexp');

  slackClient.on('loggedIn', function (user, team) {
    bot = slackClient.getUserByID(user.id);
    console.log('Logged in as ' + bot.real_name + ' of ' + team.name + ', but not yet connected');
  });

  slackClient.on('open', function () {
    console.log('Connected');
  });

  slackClient.on('message', function (message) {
    if (message.user === bot.id) return; // Ignore own messages

    console.log(message);

    var channel = slackClient.getChannelGroupOrDMByID(message.channel);

    if (botIsMentioned(message)) {
      setTyping(message.channel); // <-- Yup, faking the bot typing a reply.
      if (hasWord(message, 'help')) {
        channel.send('Hello <@' + message.user + '>; I\'ll respond to the following messages:\n\t*logs*, *teamspeak*, *youtube* or *rank*.\nDon\'t forgot to mention me, else I will assume it\'s meant for someone else.');
      } else if (hasWord(message, 'log') || hasWord(message, 'logs')) {
        channel.send('Logs can be found at:\n*Warcraft Logs*\thttps://www.warcraftlogs.com/guilds/114314\n*World of Logs*\thttp://worldoflogs.com/guild/eu/silvermoon/remnants\n*AskMrRobot*\thttp://www.askmrrobot.com/wow/combatlog/guild/eu/silvermoon/Remnants');
      } else if (hasWord(message, 'teamspeak')) {
        channel.send('You can log in to our teamspeak server by using the following information.\nHost:\t\t\t`teamspeak.remnants.eu`\nPassword:\t`StillHere`');
      } else if (hasWord(message, 'youtube')) {
        channel.send('Our live stream can be found here: https://www.youtube.com/channel/UC_J9r4lCBfGrMOjOAMi1jfQ/live');
      } else if (hasWord(message, 'rank')) {
        request('http://www.wowprogress.com/guild/eu/silvermoon/Remnants/json_rank', function (error, response, body) {
          channel.send('Remnants\' last known realm-rank on WoWProgress is *' + JSON.parse(body).realm_rank + '*');
        });
      } else {
        channel.send('I don\'t get it.');
      }
    } else {
      if (hasWord(message, '(╯°□°）╯︵ ┻━┻')) {
          channel.send('┬─┬﻿ ノ( ゜-゜ノ)');
      }
    }
  });

  slackClient.login();

  var setTyping = function (channel) {
    slackClient._send({ type: 'typing', channel: channel });
  };

  var hasWord = function (message, word) {
    word = escapeStringRegexp(word);
    return (new RegExp('^(.+)?(' + word + ')(.+)?$', 'gim')).test(message.text)
  };

  var botIsMentioned = function (message) {
    var byId   = (new RegExp('^<\@?(' + bot.id + ')(.+)?>(.+)?$', 'gim')).test(message.text),
        byName = (new RegExp('^(' + bot.name + ')(.+)?$', 'gim')).test(message.text);

    return byId || byName;
  };
})();
