(function () {
  'use strict';

  require('dotenv').load();

  var bot,
      foundMatch = false;

  var slackClient        = new (require('slack-client'))(process.env.SLACK_TOKEN),
      request            = require('request'),
      escapeStringRegexp = require('escape-string-regexp');

  slackClient.on('loggedIn', function (user, team) {
    bot = slackClient.getUserByID(user.id);
    console.log('Logged in as ' + bot.real_name + ' of ' + team.name + ', but not yet connected');
  });

  slackClient.on('open', function () {
    console.log('Connected');
  });

  slackClient.on('message', function (message) {
    if (message.user === bot.id) return; // Ignore own messages

    var channel = slackClient.getChannelGroupOrDMByID(message.channel);

    if (botIsMentioned(message)) {
      setTyping(message.channel); // <-- Yup, faking the bot typing a reply.

      if (hasWord(message, 'help')) {
        channel.send('Hello <@' + message.user + '>; I\'ll respond to the following messages:\n\t*logs*, *teamspeak*, *youtube* or *rank*.\nDon\'t forgot to mention me, else I will assume it\'s meant for someone else.');
      }

      if (hasWord(message, 'dance')) {
        channel.send('└[∵┌] └[ ∵ ]┘ [┐∵]┘');
      }

      if (hasWord(message, 'log') || hasWord(message, 'logs')) {
        channel.postMessage({
          text   : 'Logs can be found at: *<https://www.warcraftlogs.com/guilds/114314|Warcraft Logs>*, *<http://worldoflogs.com/guild/eu/silvermoon/remnants|World of Logs>* and *<http://www.askmrrobot.com/wow/combatlog/guild/eu/silvermoon/Remnants|AskMrRobot>*',
          as_user: true
        });
      }

      if (hasWord(message, 'teamspeak')) {
        channel.send('You can log in to our teamspeak server by using the following information.\nHost:\t\t\t`teamspeak.remnants.eu`\nPassword:\t`StillHere`');
      }

      if (hasWord(message, 'youtube')) {
        channel.postMessage({
          text   : 'Our live stream can be found on <https://www.youtube.com/channel/UC_J9r4lCBfGrMOjOAMi1jfQ/live|YouTube>, previous videos can be seen on our <https://www.youtube.com/channel/UC_J9r4lCBfGrMOjOAMi1jfQ/videos|channel>',
          as_user: true
        });
      }

      if (hasWord(message, 'raidinfo')) {
        var text = [
          'Remnants raids on Wednesday and Friday from 22:00 until 01:00 <http://www.timeanddate.com/worldclock/france/paris|Server Time>.',
          'Make sure you have a sufficient amount of 125 stat food, 1000 stat potions and 250 stat flasks; runes are not mandatory but highly appreciated.',
          '<http://www.curse.com/addons/wow/deadly-boss-mods|Deadly Boss Mods> or <http://www.curse.com/addons/wow/big-wigs|Bigwigs>, <http://www.curse.com/addons/wow/iskar-assist|Iskar Assist> and <http://www.curse.com/addons/wow/askmrrobot|AskMrRobot> are mandatory raid addons, also make sure you have Teamspeak installed and configured. No need to be able to speak, but you will need to be able to hear and understand the Raid Leaders (Bomblebee and Tingsie)',
          'Loot will be distributed with help of <http://www.askmrrobot.com/wow/team-optimizer|AskMrRobot Team Optimizer>, where we will still prioritise Progress Raiders over Reserver Raiders and they get prioritised over Trial Raiders.',
          'Be on time, have your addons up to date, bring all the needed consumables and know the tactics of your role for each boss. Failing any of these will get you dropped from the raid until sorted (which will be checked the next raid, not before)'
        ];
        channel.postMessage({
          //text: 'No clue what you on about mate.',
          text: text.join('\n'),
          as_user: true
        });
      }

      /*if (hasWord(message, 'battle.net') || hasWord(message, 'battlenet') || hasWord(message, 'armory') || hasWord(message, 'armoury')) {
       channel.postMessage({
       text   : '<http://eu.battle.net/wow/en/character/silvermoon/Shuilin/advanced|Armory of Shuilin>',
       as_user: true
       });
       } */

      if (hasWord(message, 'rank')) {
        request('http://www.wowprogress.com/guild/eu/silvermoon/Remnants/json_rank', function (error, response, body) {
          channel.postMessage({
            text   : 'Remnants\' last known realm-rank on WoWProgress is *<http://www.wowprogress.com/guild/eu/silvermoon/Remnants|' + JSON.parse(body).realm_rank + '>*',
            as_user: true
          });
        });
      }

      if (! foundMatch) {
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
    var found = (new RegExp('^(.+)?(' + word + ')(.+)?$', 'gim')).test(message.text);
    if (found) {
      foundMatch = true;
    }

    return found;
  };

  var botIsMentioned = function (message) {
    var byId   = (new RegExp('^<\@?(' + bot.id + ')(.+)?>(.+)?$', 'gim')).test(message.text),
        byName = (new RegExp('^(' + bot.name + ')(.+)?$', 'gim')).test(message.text);

    return byId || byName;
  };
})();
