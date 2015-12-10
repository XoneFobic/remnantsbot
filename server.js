(function () {
  'use strict';

  require('dotenv').load();

  var bot;

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

    var foundMatch = false;

    var channel = slackClient.getChannelGroupOrDMByID(message.channel);

    if (botIsMentioned(message)) {
      setTyping(message.channel); // <-- Yup, faking the bot typing a reply.

      if (hasWord(message, 'help')) {
        channel.postMessage({
          text   : 'Hello <@' + message.user + '>; You can find my readme on <https://github.com/XoneFobic/remnantsbot/blob/master/readme.md|Github>',
          as_user: true
        });
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
        channel.send('You can log in to our teamspeak server by using the following information.\n*Host*:\t\t\t`teamspeak.remnants.eu`\n*Password*:\t`StillHere`\nBe aware that the first time you log on, you will not be able to speak. Someone from the management will need to assign a teamspeak-rank before you can.');
      }

      if (hasWord(message, 'forum')) {
        channel.postMessage({
          text   : 'Our forum is available at <http://forum.remnants.eu|forum.remnants.eu>',
          as_user: true
        });
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
          'Try to have a sufficient amount of 125 stat food (~40), 1000 stat potions (~40), 250 stat flasks (3 or 4) and runes (~40). They are not mandatory but highly appreciated.',
          '<http://www.curse.com/addons/wow/deadly-boss-mods|Deadly Boss Mods> or <http://www.curse.com/addons/wow/big-wigs|Bigwigs>, <http://www.curse.com/addons/wow/iskar-assist|Iskar Assist>, <http://www.curse.com/addons/wow/rclootcouncil|RCLootCouncil (1.7.x)> and <http://www.curse.com/addons/wow/exorsus-raid-tools|Exorsus Raid Tools> are mandatory raid addons (be aware that some addons might require some configuration, so don\'t leave it to the last minute), also make sure you have <https://www.teamspeak.com/downloads|Teamspeak> installed and configured. No need to be able to speak, but you will need to be able to hear and understand the Raid Leaders (<http://eu.battle.net/wow/en/character/silvermoon/Tingsie/advanced|Tingsie> and <http://eu.battle.net/wow/en/character/silvermoon/Frank/advanced|Frank>)',
          'For Mythic difficulty we\'re using <http://www.curse.com/addons/wow/rclootcouncil|RCLootCouncil> and a Best in Slot list to distribute loot.',
          'Be on time, have your addons up to date, bring all the needed consumables and know the tactics of your role for each boss. Failing any of these will get you dropped from the raid until sorted (which will be checked the next raid, not before).'
        ];
        channel.postMessage({
          //text: 'No clue what you on about mate.',
          text   : text.join('\n'),
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

      if (hasWord(message, 'flirt')) {
        channel.send(giveRandom([
          ':rose: Hey baby, what\'s your OS?',
          'I\'m going to void your warranty!',
          'Is it hot in here, or did your internal fan system just crash?',
          'I hope you have an accelerometer, because I\'m gonna rock your world.',
          'Do you like it, when I touch your PSI slot?',
          'Can I have your IP-number?, I seem to have lost mine.'
        ]));
      }

      if (hasWord(message, 'silly') || hasWord(message, 'joke')) {
        channel.send(giveRandom([
          'A robot walks into a bar, orders a drink, and lays down some cash.\n*Bartender*: "Hey, we don\'t serve robots."\n*Robot*: "Oh, but someday you will."',
          'There are *10* types of people in the world.\nThose who can read binary and those who can\'t.',
          '01001100 01001111 01001100 00101100 00100000 01001000 01110101 01101101 01100001 01101110 01110011 00101110',
          'A man buys a lie detector robot that slaps people who lie. So he decides to try it out at dinner.\n' +
          '*DAD*: Son, where were you today during school?\n' +
          '*SON*: At school. *Robot slaps son*\n' +
          '*SON*: Ok, I went to the movies.\n' +
          '*DAD*: Which one?\n' +
          '*SON*: Toy Story. *Robot slaps son again*\n' +
          '*SON*: Ok, it was A Day with a Porn Star.\n' +
          '*DAD*: WHAT?! When I was your age, I didn\'t even know what porn was. *Robot slaps dad*\n' +
          '*MOM*: HAHA!! After all he is your son. *Robot slaps mom*'
        ]));
      }

      if(hasWord(message, 'invite')) {
        if(isAdmin(message)) {
          var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
          var email = re.exec(message.text);
          slackClient._apiCall('users.admin.invite', {
            token: process.env.SLACK_TOKEN,
            email: email[0]
          }, function(data) {
            if (data.ok) {
              channel.send('Sent a slack invitation to the provided email address.');
            } else {
              channel.send('Hm, something went wrong.');
            }
          });
        } else {
          channel.send('No, you\'re not an administrator.');
        }
        message.deleteMessage();
      }

      if (! foundMatch) {
        if (new RegExp('^(' + bot.name + ')$', 'gim').test(message.text)) {
          channel.send(giveRandom([
            'Yes?',
            'Hello, <@' + message.user + '>.',
            ':wave:',
            '_/sigh_, you again...',
            '(╯°□°）╯︵ ┻━┻'
          ]));
        } else {
          channel.send(giveRandom([
            'I don\'t get it.',
            '*¯\\(º_o)/¯*',
            'U wot m8?',
            'υѕєя єяяσя, please replace user and try again'
          ]));
        }
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

  var isAdmin = function(message) {
    var user = slackClient.getUserByID(message.user);

    return user.is_admin;
  };

  var isOwner = function(message) {
    var user = slackClient.getUserByID(message.user);

    return user.is_owner;
  };

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
        byName = (new RegExp('^(' + bot.name + ')(.+)?$', 'gim')).test(message.text),
        byCommand = (new RegExp('^!.*', 'gim')).test(message.text);

    return byId || byName || byCommand;
  };
})();
