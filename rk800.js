const Discord = require("discord.js");
const Util = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const YouTube = require("simple-youtube-api")
const ytdl = require("ytdl-core");

const config = require("./config.json");
const google_api_key = String("AIzaSyC_mzsb_mwAyuVDeY8UWy5vzSabyBslTcM");

const youtube = new YouTube(google_api_key);
const queue = new Map();

let cs;
let staffChannel;

function makeEmbed (color, title, message = null, footer = null, user = null) {
	const colors = {
		red: "#F44336",
		blue: "#3F51B5",
		green: "#4CAF50",
		yellow: "#FFEB3B",
		orange: "#FF9800"
	};
	
	if (!colors.hasOwnProperty(color)) return;	//	Do nothing if an invalid color is given

	let embed = new Discord.RichEmbed();

	embed.setColor(colors[color])
		.setDescription(`**${title}**${message != null ? '\n' + message : ''}`);
	if (user) embed.setAuthor(user.tag, user.displayAvatarURL);
	if (footer) {
		embed.setFooter(footer);
	} else {
		embed.setTimestamp();
	}

	staffChannel.send({ embed });
};


client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  client.user.setActivity(`type /help`);
  staffChannel = client.guilds.find('id', config.guildId).channels.find('id', config.channelId);
});

client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});


client.on("message", async message => {

  if(message.author.bot) return;
  if(message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(command === "8ball") {
    if(args.length <1) return message.reply("Please ask me a yes or no question.")
  var ask = [
      //Yes
      `It is certain.`,
      `It is decidedly so.`,
      `Without a doubt`,
      `Yes - definitely.`,
      `You may rely on it.`,
      `As I see it, yes.`,
      `Most likely.`,
      `Outlook good.`,
      `Yes.`,
      `Signs point to yes.`,
      //Non-commital
      `Reply hazy, try again.`,
      `Ask again later.`,
      `Better not tell you now.`,
      `Cannot predict now.`,
      `Concentrate and ask again.`,
      //No
      `Don't count on it.`,
      `My reply is no.`,
      `My sources say no.`,
      `Outlook not so good.`,
      `Very doubtful.`,
  ];
  var rand = ask[Math.floor(Math.random() * ask.length)];
    return message.reply(rand);
  }



  if(command === "talk") {
    const api_key = 'CC7yrbJDBivC_tyitHMl_dsEasA';
    const msg = args.join(" ");
  
    axios({
      method: 'GET',
      url: `http://www.cleverbot.com/getreply?key=${api_key}&input=${msg}&cs=${cs}`,
      responseType: 'json'
    }).then(res => {
      const data = res.data;
      cs = data.cs;
      return message.reply(data.output);
    }).catch(e => {
      return console.error(e);	
    });
  }
  client.on('message', async msg => { // eslint-disable-line
    if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(config.prefix)) return undefined;
  
    const args = msg.content.split(' ');
    const searchString = args.slice(1).join(' ');
    const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
    const serverQueue = queue.get(msg.guild.id);
  
    let command = msg.content.toLowerCase().split(' ')[0];
    command = command.slice(config.prefix.length)
  
    if (command === 'play') {
      const voiceChannel = msg.member.voiceChannel;
      if (!voiceChannel) return msg.channel.send('You need to be in a voice channel to queue music.');
      const permissions = voiceChannel.permissionsFor(msg.client.user);
      if (!permissions.has('CONNECT')) {
        return msg.channel.send('I cannot connect to your voice channel, make sure I have the correct permissions.');
      }
      if (!permissions.has('SPEAK')) {
        return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions.');
      }
  
      if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
        const playlist = await youtube.getPlaylist(url);
        const videos = await playlist.getVideos();
        for (const video of Object.values(videos)) {
          const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
          await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
        }
        return msg.channel.send(`Playlist: **${playlist.title}** has been added to the queue.`);
      } else {
        try {
          var video = await youtube.getVideo(url);
        } catch (error) {
          try {
            var videos = await youtube.searchVideos(searchString, 10);
            let index = 0;
            msg.channel.send(`
  __**Song selection:**__
  ${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
  Please provide a value to select one of the search results ranging from 1-10.
            `);
            // eslint-disable-next-line max-depth
            try {
              var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
                maxMatches: 1,
                time: 10000,
                errors: ['time']
              });
            } catch (err) {
              console.error(err);
              return msg.channel.send('An invalid value was entered. I will now cancel the video selection.');
            }
            const videoIndex = parseInt(response.first().content);
            var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
          } catch (err) {
            console.error(err);
            return msg.channel.send('I could not obtain any search results.');
          }
        }
        return handleVideo(video, msg, voiceChannel);
      }
    } else if (command === 'skip') {
      if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel.');
      if (!serverQueue) return msg.channel.send('There is nothing in the queue to skip.');
      serverQueue.connection.dispatcher.end('Skipping song...');
      return undefined;
    } else if (command === 'stop') {
      if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel.');
      if (!serverQueue) return msg.channel.send('There is nothing in the queue to stop.');
      serverQueue.songs = [];
      serverQueue.connection.dispatcher.end('Stopping queue...');
      return undefined;
    } else if (command === 'volume') {
      if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
      if (!serverQueue) return msg.channel.send('There is nothing currently playing.');
      if (!args[1]) return msg.channel.send(`The current volume is: **${serverQueue.volume}**`);
      serverQueue.volume = args[1];
      serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
      return msg.channel.send(`I set the volume to: **${args[1]}**`);
    } else if (command === 'np') {
      if (!serverQueue) return msg.channel.send('There is nothing currently playing.');
      return msg.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);
    } else if (command === 'queue') {
      if (!serverQueue) return msg.channel.send('There is nothing in the queue.');
      return msg.channel.send(`
  __**Song queue:**__
  ${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
  **Now playing:** ${serverQueue.songs[0].title}
      `);
    } else if (command === 'pause') {
      if (serverQueue && serverQueue.playing) {
        serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause();
        return msg.channel.send('The queue has been paused.');
      }
      return msg.channel.send('There is nothing currently playing.');
    } else if (command === 'resume') {
      if (serverQueue && !serverQueue.playing) {
        serverQueue.playing = true;
        serverQueue.connection.dispatcher.resume();
        return msg.channel.send('The queue has been resumed.');
      }
      return msg.channel.send('There is nothing currently playing.');
    }
  
    return undefined;
  });
  
  async function handleVideo(video, msg, voiceChannel, playlist = false) {
    const serverQueue = queue.get(msg.guild.id);
    console.log(video);
    const song = {
      id: video.id,
      title: Util.escapeMarkdown(video.title),
      url: `https://www.youtube.com/watch?v=${video.id}`
    };
    if (!serverQueue) {
      const queueConstruct = {
        textChannel: msg.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
      queue.set(msg.guild.id, queueConstruct);
  
      queueConstruct.songs.push(song);
  
      try {
        var connection = await voiceChannel.join();
        queueConstruct.connection = connection;
        play(msg.guild, queueConstruct.songs[0]);
      } catch (error) {
        console.error(`I could not join the voice channel because of: ${error}`);
        queue.delete(msg.guild.id);
        return msg.channel.send(`I could not join the voice channel because of: ${error}`);
      }
    } else {
      serverQueue.songs.push(song);
      console.log(serverQueue.songs);
      if (playlist) return undefined;
      else return msg.channel.send(`**${song.title}** has been added to the queue.`);
    }
    return undefined;
  }
  
  function play(guild, song) {
    const serverQueue = queue.get(guild.id);
  
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
    console.log(serverQueue.songs);
  
    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
      .on('end', reason => {
        if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
        else console.log(reason);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on('error', error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  
    serverQueue.textChannel.send(`I will now be playing: **${song.title}**.`);
  }
  
  if(command === "ping") {
    const m = await message.channel.send("Calculating latency...");
    m.edit(`Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "kick") {
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("You do not have permissions to use this.");
    
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server.");
    if(!member.kickable) 
      return message.reply("I cannot kick this user. They may have a higher role, or I may not have the correct permissions.");
    
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author}, I couldn't kick because of : ${error}`));
    return message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
    if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
      return message.reply("You do not have permissions to use this.");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server.");
    if(!member.bannable) 
      return message.reply("I cannot kick this user. They may have a higher role, or I may not have the correct permissions.");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided.";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author}, I couldn't ban because of : ${error}`));
    return message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }

  if(command === "purge") {
    if (!message.member.roles.exists('name', 'Administrator')) return;
    const deleteCount = parseInt(args[0], 10);
    
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  
  }

});

client.on('guildMemberAdd', member => {
	makeEmbed('green', 'User joined', null, null, member.user);
});

client.on('guildMemberRemove', member => {
	makeEmbed('orange', 'User left', null, null, member.user);
});

client.on('messageDelete', message => {
	if (message.author.id === config.botId) return;	//	Don't do anything if these are true

	makeEmbed('red', `Message sent by ${message.author.tag} deleted in #${message.channel.name}`, message.cleanContent, `ID: ${message.id}  •  ${moment().format('MMM Do YYYY, H:mm:ss')}`, message.author);
});

client.login(config.token);

process.on("uncaughtException", (err) => {
	const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
	console.trace("Uncaught Exception: ", errorMsg);
});

process.on("unhandledRejection", err => {
	console.trace("Uncaught Promise Error: ", err);
});