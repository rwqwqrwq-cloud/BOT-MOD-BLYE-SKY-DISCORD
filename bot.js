require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
    ]
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.musicQueues = new Map();
client.warns = new Map();
client.economy = new Map();
client.levels = new Map();
client.afk = new Map();
client.stats = { commandsRun: 0, messagesProcessed: 0, uptime: Date.now() };

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const loadCommands = () => {
    const commandsPath = path.join(__dirname, 'commands');
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath, { recursive: true });
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if (command.name) client.commands.set(command.name, command);
    }
};

const loadEvents = () => {
    const eventsPath = path.join(__dirname, 'events');
    if (!fs.existsSync(eventsPath)) fs.mkdirSync(eventsPath, { recursive: true });
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
};

const PREFIX = process.env.PREFIX || '!';

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    client.stats.messagesProcessed++;

    if (client.afk.has(message.author.id)) {
        client.afk.delete(message.author.id);
        message.reply({ embeds: [new EmbedBuilder().setColor('#c8b89a').setDescription(`Welcome back **${message.author.username}**! Removed your AFK status.`)] });
    }

    message.mentions.users.forEach(user => {
        if (client.afk.has(user.id)) {
            const afkData = client.afk.get(user.id);
            message.reply({ embeds: [new EmbedBuilder().setColor('#8a7a6a').setDescription(`**${user.username}** is AFK: ${afkData.reason}`)] });
        }
    });

    if (!client.levels.has(message.author.id)) client.levels.set(message.author.id, { xp: 0, level: 0 });
    const userData = client.levels.get(message.author.id);
    userData.xp += Math.floor(Math.random() * 10) + 5;
    const xpNeeded = userData.level * 100 + 100;
    if (userData.xp >= xpNeeded) {
        userData.level++;
        userData.xp = 0;
        message.channel.send({ embeds: [new EmbedBuilder().setColor('#d4af37').setDescription(`🎉 **${message.author.username}** leveled up to **Level ${userData.level}**!`)] });
    }

    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) return;

    if (client.cooldowns.has(`${commandName}-${message.author.id}`)) {
        const remaining = (client.cooldowns.get(`${commandName}-${message.author.id}`) - Date.now()) / 1000;
        return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription(`⏳ Please wait **${remaining.toFixed(1)}s** before using this command again.`)] });
    }

    if (command.cooldown) {
        client.cooldowns.set(`${commandName}-${message.author.id}`, Date.now() + command.cooldown * 1000);
        setTimeout(() => client.cooldowns.delete(`${commandName}-${message.author.id}`), command.cooldown * 1000);
    }

    try {
        client.stats.commandsRun++;
        await command.execute(message, args, client);
        io.emit('stats', client.stats);
    } catch (error) {
        console.error(error);
        message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription(`❌ An error occurred while executing this command.`)] });
    }
});

client.on(Events.GuildMemberAdd, async (member) => {
    const channel = member.guild.systemChannel;
    if (!channel) return;
    const embed = new EmbedBuilder()
        .setColor('#c8b89a')
        .setTitle('Welcome!')
        .setDescription(`Welcome to **${member.guild.name}**, **${member.user.username}**!\nYou are member #${member.guild.memberCount}.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();
    channel.send({ embeds: [embed] });
});

client.on(Events.GuildMemberRemove, async (member) => {
    const channel = member.guild.systemChannel;
    if (!channel) return;
    const embed = new EmbedBuilder()
        .setColor('#4a4035')
        .setDescription(`**${member.user.username}** has left the server.`)
        .setTimestamp();
    channel.send({ embeds: [embed] });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'ticket_create') {
            const ticketChannel = await interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ]
            });
            const closeBtn = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_close').setLabel('Close Ticket').setStyle(ButtonStyle.Danger).setEmoji('🔒')
            );
            await ticketChannel.send({ embeds: [new EmbedBuilder().setColor('#c8b89a').setTitle('Support Ticket').setDescription(`Hello **${interaction.user.username}**! Support will be with you shortly.`)], components: [closeBtn] });
            await interaction.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });
        }
        if (interaction.customId === 'ticket_close') {
            await interaction.reply({ content: 'Closing ticket in 5 seconds...', ephemeral: true });
            setTimeout(() => interaction.channel.delete(), 5000);
        }
    }
});

app.get('/api/stats', (req, res) => {
    res.json({
        guilds: client.guilds.cache.size,
        users: client.users.cache.size,
        commands: client.commands.size,
        uptime: Math.floor((Date.now() - client.stats.uptime) / 1000),
        commandsRun: client.stats.commandsRun,
        messagesProcessed: client.stats.messagesProcessed,
        ping: client.ws.ping,
        status: client.ws.status === 0 ? 'online' : 'offline'
    });
});

app.get('/api/guilds', (req, res) => {
    const guilds = client.guilds.cache.map(g => ({
        id: g.id, name: g.name, memberCount: g.memberCount,
        icon: g.iconURL({ dynamic: true })
    }));
    res.json(guilds);
});

io.on('connection', (socket) => {
    socket.emit('stats', client.stats);
});

loadCommands();
loadEvents();

server.listen(process.env.PORT || 3000, () => {
    console.log(`Dashboard running on port ${process.env.PORT || 3000}`);
});

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('!help | Blue Sky', { type: 3 });
    setInterval(() => io.emit('stats', {
        ...client.stats,
        ping: client.ws.ping,
        uptime: Math.floor((Date.now() - client.stats.uptime) / 1000),
        guilds: client.guilds.cache.size,
        users: client.users.cache.size
    }), 5000);
});

client.login(process.env.TOKEN);
