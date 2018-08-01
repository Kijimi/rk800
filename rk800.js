const Discord = require("discord.js");
const fs = require("fs")
const axios = require("axios")
const moment = require("moment")
const client = new Discord.Client();
const config = require("./config.json");

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

  if(command === "say") {
    message.delete().catch(O_o=>{}).then; 
    message.channel.send(args.join(" "));
  }

  if(command === "8ball") {
    if (args.length < 1)
      message.reply("Please ask me a yes or no question.") 
        return;
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
    message.reply(rand);
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
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

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
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
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