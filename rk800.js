const Discord = require("discord.js");
const Util = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const YouTube = require("simple-youtube-api")
const ytdl = require("ytdl-core");
const superagent = require("superagent");
const ms = require("ms");

const config = require("./config.json");
const google_api_key = String("AIzaSyC_mzsb_mwAyuVDeY8UWy5vzSabyBslTcM");
const talkedRecently = new Set();

const youtube = new YouTube(google_api_key);
const queue = new Map();

this.client = client;

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
  client.user.setActivity(`type .help  | my creator is awful at this`);
  client.user.setUsername("SylvBot");
  staffChannel = client.guilds.find('id', config.guildId).channels.find('id', config.channelId);
  suggestChannel = client.guilds.find('id', config.guildId).channels.find('id', config.suggestchannelId);
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

  if (talkedRecently.has(message.author.id)) {
    message.reply("Please wait 2 seconds before sending this command again.");
      return;
  }

  if(message.content === "owo") {
    console.log("owo detected")
    var owo = [
        "🥒",
        "🍆",
        "🍌"
    ];
    var owoRand = owo[Math.floor(Math.random() * owo.length)];
      message.react(owoRand);
  }
  
  if(command === "help") {
  const embed = new Discord.RichEmbed()    
        .setTitle("SylvBot's List of Commands")
        .setColor("#2e6cd1")
        .addField("Here are a list of commands that any user can use.", "Please note that I encourage you to use these commands in #bot-spam. Abuse of these commands elsewhere may lead to potential repurcussions.")
        .addField("Fun Commands", ".8ball\nResponds with an 8ball answer.\n\n.dogs, .ilikedogs\nUploads a photo of a cute doggo.\n\n.talk\nTalk to me!")
        .addField("Role Commands", ".roles\nDisplays a list of applicable roles and a guide on how to apply them.\n\n.addrole\nPrompts you to add a role\n\n.removerole\nPrompts you to remove a role.")
        .addField("Informational/Misc. Commands", ".avatar, .avatar [@username]\nDisplays your own avatar, or if mentioned, another user's avatar.\n\n.suggest <suggestion>, .suggestion <suggestion>\nAllows users to make a suggestion, which will then be shown on the suggestions channel.\n\n.userinfo, .userinfo [@username]\nDisplays information about your Discord account, or if mentioned, another user's account.")
        //.addField("Wiki Commands", ".wiki <search_query>\nPulls an article of the requested search query from the Detroit: Become Human Wikia. Please use underscores in place of spaces. Work in progress.")
      message.react("📧")
      message.author.send(embed);
  }

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

  if(command === "pokedex") {
    var Pokedex = require('pokedex-promise-v2');
    var P = new Pokedex();
    var pkmn = args[0].toLowerCase();
  P.getPokemonByName(pkmn)
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log('There was an ERROR: ', error);

    const embed = new Discord.RichEmbed()
      .setAuthor(forms.name)
      .setImage(front_default)
    return message.channel.send({ embed });
  });
}
    if(command === "suggest" || command === "suggestion") {
    let rreason = args.join(" ").slice(0);
    if(!rreason) return message.reply("No suggestion was provided!");

    let reportEmbed = new Discord.RichEmbed()
    .setDescription("Suggestion")
    .setColor("#bf7fbf")
    .addField("Suggestion By", `${message.author} with ID: ${message.author.id}`)
    .addField("Channel", message.channel)
    .addField("Time", message.createdAt)
    .addField("Suggestion", rreason);

    let reportschannel = message.guild.channels.find(`name`, "suggestions");
    if(!reportschannel) return message.channel.send("Couldn't find the suggestions channel. Do I have permissions to view this channel?");
    reportschannel.send(reportEmbed);

}

  if(command === "roles") {
    const embed = new Discord.RichEmbed()
      .setTitle("miserydungeon 2 Server Roles List")
      .setColor("#4682b4")
      //.setThumbnail("https://78.media.tumblr.com/bc063d4c01410c3e753a3e453990be30/tumblr_p9ucavqpVT1v66oaho1_400.png")
      .addField("Thistle Purple \nPink \nMint \nBlue Violet \nSlate Grey \nDandelion \nGrey \nTurquoise \nOlive Drab \nLemon Chiffon \nGreen \nBlue \nViolet \nYellow \nOrange", "Note that roles may override other roles. To apply a role to yourself: Type .addrole, and when I ask you which role you would like, type the role you desire. I should then respond to you that I have successfully applied the role.d If you wish to remove a role, type .removerole and enter the role you would like to remove, and I should respond saying I have removed your role. If any issues arise, please contact @Snivy#3307.")
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
  let admins = message.guild.roles.find("name", "Mods");

  if (command === 'addrole'){
    message.reply("What role would you like?");
    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 10000 });
    console.log(collector)
    collector.on('collect', message => {
        if (message.content == "Thistle Purple") {
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

  if(command === "admin" || command === "givemefreeadminplsthanksxd") {
    if (message.author.id ===! "255060661946548224")
      return message.reply("no");
    if (message.author.id === "255060661946548224")
    member.addRole(admins)
      return message.reply("you got free admin!!!")
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
    
      let {body} = await superagent
      
    
      .get(`https://dog.ceo/api/breeds/image/random`);

      let embed = new Discord.RichEmbed()
      .setImage(body.message)
      .setColor("#f4aa42")

      message.channel.send(embed)
  }

  if(command === "avatar"){
    let msg = await message.channel.send("Generating avatar...");
    let target = message.mentions.users.first() || message.author;

    await message.channel.send({files : [
      {
        attachment: target.displayAvatarURL,
        name: "avatar.png"
      }
    ]});

    msg.delete();
  }

  if(command === "ping") {
    const m = await message.channel.send("Calculating latency...");
    m.edit(`Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }

  if(command === `userinfo`) {
    let target = message.mentions.users.first() || message.author;
    let embed = new Discord.RichEmbed()
        .setThumbnail(target.avatarURL)
        .setAuthor(target.username)
        .setColor("#5DADE2")
        .addField("Full Username", `${target.username}#${target.discriminator}`)
        .addField("ID", target.id)
        .addField("Created At", target.createdAt);

    message.channel.sendEmbed(embed);

    return;    
}
  if(command === "mute") {
  if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("No can do.");
  if(args[0] == "help"){
    message.reply("Usage: .mute <user> <1s/m/h/d> [reason]");
    return;
  }
  let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if(!tomute) return message.reply("Couldn't find user.");
  if(tomute.hasPermission("MANAGE_MESSAGES")) return message.reply("Can't mute them!");
  let reason = args.slice(2).join("");
  if(!reason) return message.reply("Please supply a reason.");

  let muterole = message.guild.roles.find(`name`, "muted");
  //start of create role
  if(!muterole){
    try{
      muterole = await message.guild.createRole({
        name: "muted",
        color: "#000000",
        permissions:[]
      })
      message.guild.channels.forEach(async (channel, id) => {
        await channel.overwritePermissions(muterole, {
          SEND_MESSAGES: false,
          ADD_REACTIONS: false
        });
      });
    }catch(e){
      console.log(e.stack);
    }
  }
  //end of create role
  let mutetime = args[1];
  if(!mutetime) return message.reply("You didn't specify a time!");

  message.delete().catch(O_o=>{});

  try{
    await tomute.send(`Hi! You've been muted for ${mutetime}. Sorry!`)
  }catch(e){
    message.channel.send(`A user has been muted... but their DMs are locked. They will be muted for ${mutetime}`)
  }

  let muteembed = new Discord.RichEmbed()
  .setDescription(`Mute executed by ${message.author}`)
  .setColor("#FFA500")
  .addField("Muted User", tomute)
  .addField("Muted in", message.channel)
  .addField("Time", message.createdAt)
  .addField("Length", mutetime)
  .addField("Reason", reason);

  let incidentschannel = message.guild.channels.find(`name`, "staff-logs");
  if(!incidentschannel) return message.reply("Please create a incidents channel first!");
  incidentschannel.send(muteembed);

  await(tomute.addRole(muterole.id));

  setTimeout(function(){
    tomute.removeRole(muterole.id);
    message.channel.send(`<@${tomute.id}> has been unmuted!`);
  }, ms(mutetime));


//end of module
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

  talkedRecently.add(message.author.id);
  setTimeout(() => {
    // Removes the user from the set after a minute
    talkedRecently.delete(message.author.id);
  }, 2000);

});


client.on('guildMemberAdd', member => {
  member.addRole(member.guild.roles.find(role => role.name === "Pending Verification"));
	makeEmbed('green', 'User joined', null, null, member.user);
});

client.on('guildMemberRemove', member => {
	makeEmbed('orange', 'User left', null, null, member.user);
});

client.on('messageDelete', message => {
	if (message.author.id === config.botId) return;	//	Don't do anything if these are true

	makeEmbed('red', `Message sent by ${message.author.tag} deleted in #${message.channel.name}`, message.cleanContent, `ID: ${message.id}  •  ${moment().format('MMM Do YYYY, H:mm:ss')}`, message.author);
});

client.on('guildMemberAdd', member => {
  member.send(`Hi, and welcome to miserydungeon 2! We hope you enjoy being here. Please read the rules, add a role to yourself using .roles, and don't forget to say hi!`)
});

client.login(config.token);

process.on("uncaughtException", (err) => {
	const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
	console.trace("Uncaught Exception: ", errorMsg);
});

process.on("unhandledRejection", err => {
	console.trace("Uncaught Promise Error: ", err);
});