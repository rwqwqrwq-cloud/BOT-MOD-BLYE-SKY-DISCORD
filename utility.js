const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const baseColor = '#c8b89a';
const accentColor = '#d4af37';

const help = {
    name: 'help',
    description: 'Show all commands',
    cooldown: 3,
    async execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setColor(baseColor)
            .setTitle('📋 Blue Sky Bot — Command List')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '🛡️ Moderation', value: '`ban` `kick` `mute` `warn` `warnings` `purge` `lock` `unlock`', inline: false },
                { name: '🎵 Music', value: '`play` `skip` `stop` `queue` `pause` `resume` `nowplaying`', inline: false },
                { name: '💰 Economy', value: '`balance` `daily` `work` `transfer` `leaderboard`', inline: false },
                { name: '⭐ Leveling', value: '`rank` `levels`', inline: false },
                { name: '🎫 Tickets', value: '`ticket`', inline: false },
                { name: '🔧 Utility', value: '`help` `ping` `userinfo` `serverinfo` `avatar` `afk` `poll` `embed` `announce`', inline: false },
                { name: '🎮 Fun', value: '`8ball` `flip` `roll` `rps` `meme`', inline: false }
            )
            .setFooter({ text: `Blue Sky Bot • ${client.commands.size} commands` })
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }
};

const ping = {
    name: 'ping',
    description: 'Check bot latency',
    cooldown: 3,
    async execute(message, args, client) {
        const sent = await message.reply({ embeds: [new EmbedBuilder().setColor(baseColor).setDescription('🏓 Pinging...')] });
        sent.edit({ embeds: [new EmbedBuilder().setColor(accentColor).setDescription(`🏓 Pong!\n**Latency:** ${sent.createdTimestamp - message.createdTimestamp}ms\n**API:** ${client.ws.ping}ms`)] });
    }
};

const userinfo = {
    name: 'userinfo',
    description: 'Show user info',
    cooldown: 3,
    async execute(message, args, client) {
        const user = message.mentions.members.first() || message.member;
        const embed = new EmbedBuilder()
            .setColor(baseColor)
            .setTitle(user.user.username)
            .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'ID', value: user.id, inline: true },
                { name: 'Joined Server', value: `<t:${Math.floor(user.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: 'Account Created', value: `<t:${Math.floor(user.user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: 'Roles', value: user.roles.cache.map(r => r.toString()).join(' ') || 'None', inline: false }
            )
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }
};

const serverinfo = {
    name: 'serverinfo',
    description: 'Show server info',
    cooldown: 3,
    async execute(message, args, client) {
        const guild = message.guild;
        const embed = new EmbedBuilder()
            .setColor(baseColor)
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Members', value: guild.memberCount.toString(), inline: true },
                { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
                { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
                { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setTimestamp();
        message.channel.send({ embeds: [embed] });
    }
};

const avatar = {
    name: 'avatar',
    description: 'Show user avatar',
    cooldown: 3,
    async execute(message, args, client) {
        const user = message.mentions.users.first() || message.author;
        const embed = new EmbedBuilder()
            .setColor(baseColor)
            .setTitle(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }));
        message.channel.send({ embeds: [embed] });
    }
};

const afk = {
    name: 'afk',
    description: 'Set AFK status',
    cooldown: 5,
    async execute(message, args, client) {
        const reason = args.join(' ') || 'AFK';
        client.afk.set(message.author.id, { reason });
        message.reply({ embeds: [new EmbedBuilder().setColor(baseColor).setDescription(`💤 You are now AFK: **${reason}**`)] });
    }
};

const poll = {
    name: 'poll',
    description: 'Create a poll',
    cooldown: 10,
    async execute(message, args, client) {
        const question = args.join(' ');
        if (!question) return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ Provide a question.')] });
        const embed = new EmbedBuilder().setColor(accentColor).setTitle('📊 Poll').setDescription(question).setFooter({ text: `Asked by ${message.author.username}` }).setTimestamp();
        const msg = await message.channel.send({ embeds: [embed] });
        await msg.react('👍');
        await msg.react('👎');
    }
};

const announce = {
    name: 'announce',
    description: 'Make an announcement',
    cooldown: 10,
    async execute(message, args, client) {
        if (!message.member.permissions.has('ManageMessages')) return;
        const text = args.join(' ');
        if (!text) return;
        const embed = new EmbedBuilder().setColor(accentColor).setTitle('📢 Announcement').setDescription(text).setFooter({ text: message.guild.name }).setTimestamp();
        message.channel.send({ embeds: [embed] });
        message.delete().catch(() => {});
    }
};

const eightball = {
    name: '8ball',
    description: 'Ask the magic 8ball',
    cooldown: 3,
    async execute(message, args, client) {
        const responses = ['It is certain.', 'Without a doubt.', 'Yes definitely.', 'You may rely on it.', 'Ask again later.', 'Cannot predict now.', 'Concentrate and ask again.', 'Don\'t count on it.', 'My sources say no.', 'Very doubtful.'];
        const question = args.join(' ');
        if (!question) return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ Ask a question.')] });
        const answer = responses[Math.floor(Math.random() * responses.length)];
        message.channel.send({ embeds: [new EmbedBuilder().setColor(baseColor).setTitle('🎱 Magic 8-Ball').addFields({ name: 'Question', value: question }, { name: 'Answer', value: answer })] });
    }
};

const flip = {
    name: 'flip',
    description: 'Flip a coin',
    cooldown: 2,
    async execute(message, args, client) {
        const result = Math.random() < 0.5 ? 'Heads 🪙' : 'Tails 🪙';
        message.channel.send({ embeds: [new EmbedBuilder().setColor(baseColor).setDescription(`**${result}**`)] });
    }
};

const roll = {
    name: 'roll',
    description: 'Roll a dice',
    cooldown: 2,
    async execute(message, args, client) {
        const sides = parseInt(args[0]) || 6;
        const result = Math.floor(Math.random() * sides) + 1;
        message.channel.send({ embeds: [new EmbedBuilder().setColor(baseColor).setDescription(`🎲 Rolled a d${sides}: **${result}**`)] });
    }
};

const rps = {
    name: 'rps',
    description: 'Rock Paper Scissors',
    cooldown: 3,
    async execute(message, args, client) {
        const choices = ['rock', 'paper', 'scissors'];
        const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
        const userChoice = args[0]?.toLowerCase();
        if (!choices.includes(userChoice)) return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ Choose rock, paper, or scissors.')] });
        const botChoice = choices[Math.floor(Math.random() * 3)];
        let result = 'Draw!';
        if ((userChoice === 'rock' && botChoice === 'scissors') || (userChoice === 'paper' && botChoice === 'rock') || (userChoice === 'scissors' && botChoice === 'paper')) result = 'You win!';
        else if (userChoice !== botChoice) result = 'Bot wins!';
        message.channel.send({ embeds: [new EmbedBuilder().setColor(baseColor).setTitle('Rock Paper Scissors').addFields({ name: 'You', value: `${emojis[userChoice]} ${userChoice}`, inline: true }, { name: 'Bot', value: `${emojis[botChoice]} ${botChoice}`, inline: true }, { name: 'Result', value: result })] });
    }
};

const rank = {
    name: 'rank',
    description: 'Show your rank',
    cooldown: 5,
    async execute(message, args, client) {
        const user = message.mentions.members.first() || message.member;
        const data = client.levels.get(user.id) || { xp: 0, level: 0 };
        const xpNeeded = data.level * 100 + 100;
        const embed = new EmbedBuilder()
            .setColor(accentColor)
            .setTitle(`${user.user.username}'s Rank`)
            .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Level', value: data.level.toString(), inline: true },
                { name: 'XP', value: `${data.xp} / ${xpNeeded}`, inline: true }
            );
        message.channel.send({ embeds: [embed] });
    }
};

const ticket = {
    name: 'ticket',
    description: 'Open ticket panel',
    cooldown: 5,
    async execute(message, args, client) {
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_create').setLabel('Open Ticket').setStyle(ButtonStyle.Primary).setEmoji('🎫')
        );
        const embed = new EmbedBuilder().setColor(baseColor).setTitle('🎫 Support Tickets').setDescription('Click the button below to open a support ticket.');
        message.channel.send({ embeds: [embed], components: [row] });
        message.delete().catch(() => {});
    }
};

const balance = {
    name: 'balance',
    description: 'Check balance',
    cooldown: 3,
    async execute(message, args, client) {
        const user = message.mentions.users.first() || message.author;
        if (!client.economy.has(user.id)) client.economy.set(user.id, { balance: 0, lastDaily: 0, lastWork: 0 });
        const data = client.economy.get(user.id);
        message.channel.send({ embeds: [new EmbedBuilder().setColor(accentColor).setTitle(`${user.username}'s Balance`).setDescription(`💰 **${data.balance.toLocaleString()}** coins`)] });
    }
};

const daily = {
    name: 'daily',
    description: 'Claim daily coins',
    cooldown: 0,
    async execute(message, args, client) {
        if (!client.economy.has(message.author.id)) client.economy.set(message.author.id, { balance: 0, lastDaily: 0, lastWork: 0 });
        const data = client.economy.get(message.author.id);
        const now = Date.now();
        const cooldown = 86400000;
        if (now - data.lastDaily < cooldown) {
            const remaining = Math.ceil((cooldown - (now - data.lastDaily)) / 3600000);
            return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription(`⏳ Daily available in **${remaining}h**.`)] });
        }
        const amount = Math.floor(Math.random() * 500) + 100;
        data.balance += amount;
        data.lastDaily = now;
        message.channel.send({ embeds: [new EmbedBuilder().setColor(accentColor).setDescription(`💰 Claimed **${amount}** daily coins! Total: **${data.balance}**`)] });
    }
};

const work = {
    name: 'work',
    description: 'Work for coins',
    cooldown: 0,
    async execute(message, args, client) {
        if (!client.economy.has(message.author.id)) client.economy.set(message.author.id, { balance: 0, lastDaily: 0, lastWork: 0 });
        const data = client.economy.get(message.author.id);
        const now = Date.now();
        const cooldown = 3600000;
        if (now - data.lastWork < cooldown) {
            const remaining = Math.ceil((cooldown - (now - data.lastWork)) / 60000);
            return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription(`⏳ Work available in **${remaining}m**.`)] });
        }
        const jobs = ['programmer', 'artist', 'musician', 'chef', 'teacher'];
        const job = jobs[Math.floor(Math.random() * jobs.length)];
        const amount = Math.floor(Math.random() * 100) + 50;
        data.balance += amount;
        data.lastWork = now;
        message.channel.send({ embeds: [new EmbedBuilder().setColor(baseColor).setDescription(`💼 You worked as a **${job}** and earned **${amount}** coins! Total: **${data.balance}**`)] });
    }
};

const transfer = {
    name: 'transfer',
    description: 'Transfer coins',
    cooldown: 5,
    async execute(message, args, client) {
        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);
        if (!target || !amount || amount <= 0) return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ Usage: !transfer @user amount')] });
        if (!client.economy.has(message.author.id)) client.economy.set(message.author.id, { balance: 0, lastDaily: 0, lastWork: 0 });
        if (!client.economy.has(target.id)) client.economy.set(target.id, { balance: 0, lastDaily: 0, lastWork: 0 });
        const senderData = client.economy.get(message.author.id);
        if (senderData.balance < amount) return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ Insufficient balance.')] });
        senderData.balance -= amount;
        client.economy.get(target.id).balance += amount;
        message.channel.send({ embeds: [new EmbedBuilder().setColor(accentColor).setDescription(`💸 Transferred **${amount}** coins to **${target.username}**.`)] });
    }
};

module.exports = { help, ping, userinfo, serverinfo, avatar, afk, poll, announce, eightball, flip, roll, rps, rank, ticket, balance, daily, work, transfer };
