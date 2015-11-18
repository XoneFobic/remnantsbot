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

    //console.log(bot.id);
    //console.log(message);

    var channel = slackClient.getChannelGroupOrDMByID(message.channel);

    if (botIsMentioned(message)) {
      setTyping(message.channel); // <-- Yup, faking the bot typing a reply.
      if (hasWord(message, 'help')) {
        channel.send('Hello <@' + message.user + '>; I\'ll respond to the following messages:\n\t*logs*, *teamspeak*, *youtube* or *rank*.\nDon\'t forgot to mention me, else I will assume it\'s meant for someone else.');
      } else if (hasWord(message, 'dance')) {
        channel.send('└[∵┌] └[ ∵ ]┘ [┐∵]┘');
      } else if (hasWord(message, 'log') || hasWord(message, 'logs')) {
        channel.postMessage({
          text   : 'Logs can be found at: *<https://www.warcraftlogs.com/guilds/114314|Warcraft Logs>*, *<http://worldoflogs.com/guild/eu/silvermoon/remnants|World of Logs>* and *<http://www.askmrrobot.com/wow/combatlog/guild/eu/silvermoon/Remnants|AskMrRobot>*',
          as_user: true
        });
      } else if (hasWord(message, 'teamspeak')) {
        channel.send('You can log in to our teamspeak server by using the following information.\nHost:\t\t\t`teamspeak.remnants.eu`\nPassword:\t`StillHere`');
      } else if (hasWord(message, 'youtube')) {
        channel.postMessage({
          text   : 'Our live stream can be found on <https://www.youtube.com/channel/UC_J9r4lCBfGrMOjOAMi1jfQ/live|YouTube>, previous videos can be seen on our <https://www.youtube.com/channel/UC_J9r4lCBfGrMOjOAMi1jfQ/videos|channel>',
          as_user: true
        });
      } /*else if (hasWord(message, 'battle.net') || hasWord(message, 'battlenet') || hasWord(message, 'armory') || hasWord(message, 'armoury')) {
        channel.postMessage({
          text   : '<http://eu.battle.net/wow/en/character/silvermoon/Shuilin/advanced|Armory of Shuilin>',
          as_user: true
        });
      } */else if (hasWord(message, 'rank')) {
        request('http://www.wowprogress.com/guild/eu/silvermoon/Remnants/json_rank', function (error, response, body) {
          channel.postMessage({
            text   : 'Remnants\' last known realm-rank on WoWProgress is *<http://www.wowprogress.com/guild/eu/silvermoon/Remnants|' + JSON.parse(body).realm_rank + '>*',
            as_user: true
          });
        });
      } else {
        channel.send(giveRandom([
          'I don\'t get it.',
          '*¯\\(º_o)/¯*',
          'Yes?',
          'Hello, <@' + message.user + '>',
          ':wave:',
          ':robot_face:'
        ]));
      }
    } else {
      if (hasWord(message, '(╯°□°）╯︵ ┻━┻')) {
        channel.send(giveRandom([
          '┬─┬﻿ ノ( ゜-゜ノ)',
          'ノ┬─┬ノ ︵ ( \\o°o)\\'
        ]));
      }
    }
  });

  slackClient.login();

  var giveRandom = function (array) {
    return array[Math.floor(Math.random() * array.length)]
  };

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
