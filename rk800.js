const Discord = require("discord.js");
const Util = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const YouTube = require("simple-youtube-api")
const ytdl = require("ytdl-core");
const superagent = require("superagent");
const talkedRecently = new Set();
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
  if(command === "roles") {
    const embed = new Discord.RichEmbed()
      .setTitle("DBH Community Server Roles List")
      .setColor("#4682b4")
      .setThumbnail("https://78.media.tumblr.com/bc063d4c01410c3e753a3e453990be30/tumblr_p9ucavqpVT1v66oaho1_400.png")
      .addField("Thistle Purple \nPink \nMint \nBlue Violet \nSlate Grey \nDandelion \nGrey \nTurquoise \nOlive Drab \nLemon Chiffron \nGreen \nBlue \nViolet \nYellow \nOrange", "To apply a role to yourself: Type /addrole, and when I ask you which role you would like, type the role you desire. I should then respond to you that I have successfully applied the role.d If you wish to remove a role, type /removerole and enter the role you would like to remove, and I should respond saying I have removed your role. If there are any malfunctions that occur, please contact my superiors.")
        message.channel.send({embed});
  }

  let member = message.member;
  let Thistle = message.guild.roles.find("name", "Thistle Violet");
  let Pink = message.guild.roles.find("name", "Pink");
  let Mint = message.guild.roles.find("name", "Mint");
  let BViolet = message.guild.roles.find("name", "Blue Violet");
  let SGrey = message.guild.roles.find("name", "Slate Grey");
  let Dandelion = message.guild.roles.find("name", "Dandelion");
  let Grey = message.guild.roles.find("name", "Grey");
  let Turquoise = message.guild.roles.find("name", "Turquoise");
  let Olive = message.guild.roles.find("name", "Olive Drab");
  let Lemon = message.guild.roles.find("name", "Lemon Chiffon");
  let Green = message.guild.roles.find("name", "Green");
  let Blue = message.guild.roles.find("name", "Blue");
  let Violet = message.guild.roles.find("name", "Violet");
  let Yellow = message.guild.roles.find("name", "Yellow");
  let Orange = message.guild.roles.find("name", "Orange");

  if (command === 'addrole'){
    message.reply("What role would you like?");
    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
    console.log(collector)
    collector.on('collect', message => {
        if (message.content == "Thistle Violet") {
            member.addRole(Thistle).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Pink") {
            member.addRole(Pink).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Mint") {
            member.addRole(Mint).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Blue Violet") {
            member.addRole(BViolet).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Slate Grey") {
            member.addRole(SGrey).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Dandelion") {
            member.addRole(Dandelion).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Grey") {
            member.addRole(Grey).catch(console.log)
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Turquoise") {
            member.addRole(Turquoise).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Olive Drab") {
            member.addRole(Olive).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Lemon Chiffon") {
            member.addRole(Lemon).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Green") {
            member.addRole(Green).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Blue") {
            member.addRole(Blue).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Violet") {
            member.addRole(Violet).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Orange") {
            member.addRole(Orange).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        } else if (message.content == "Yellow") {
            member.addRole(Yellow).catch(console.log);
              return message.reply("I have successfully applied your desired role.")
        }
    })
}

  if(command === "removerole") {
    message.reply("What role would you like to be removed?");
    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
    console.log(collector)
    collector.on('collect', message => {
        if (message.content == "Thistle Violet") {
            member.removeRole(Thistle).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Pink") {
            member.removeRole(Pink).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Mint") {
            member.removeRole(Mint).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Blue Violet") {
            member.removeRole(BViolet).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Slate Grey") {
            member.removeRole(SGrey).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Dandelion") {
            member.removeRole(Dandelion).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Grey") {
            member.removeRole(Grey).catch(console.log)
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Turquoise") {
            member.removeRole(Turquoise).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Olive Drab") {
            member.removeRole(Olive).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Lemon Chiffon") {
            member.removeRole(Lemon).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Green") {
            member.removeRole(Green).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Blue") {
            member.removeRole(Blue).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Violet") {
            member.removeRole(Violet).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
        } else if (message.content == "Orange") {
            member.removeRole(Orange).catch(console.log);
        } else if (message.content == "Yellow") {
            member.removeRole(Yellow).catch(console.log);
              return message.reply("I have successfully removed your desired role.")
      }
  })
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
      return console.log(e);	
    });
  }
  
  if(command === "dogs" || command === "ilikedogs"){
    
    const cooldown = new Set();
    let {body} = await superagent
      
    
      .get(`https://dog.ceo/api/breeds/image/random`);

      let embed = new Discord.RichEmbed()
      .setImage(body.message)
      .setColor("#f4aa42")

      message.channel.send(embed)
  }

  if(command === "ping") {
    const m = await message.channel.send("Calculating latency...");
    m.edit(`Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }

  if(command === `userinfo`) {
    let embed = new Discord.RichEmbed()
        .setThumbnail(message.author.avatarURL)
        .setAuthor(message.author.username)
        .setColor("#5DADE2")
        .addField("Full Username", `${message.author.username}#${message.author.discriminator}`)
        .addField("ID", message.author.id)
        .addField("Created At", message.author.createdAt);

    message.channel.sendEmbed(embed);

    return;    
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