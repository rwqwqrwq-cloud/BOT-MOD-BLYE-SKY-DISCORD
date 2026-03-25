const { EmbedBuilder, PermissionsBitField } = require('discord.js');

const modColor = '#c8b89a';

const ban = {
    name: 'ban',
    description: 'Ban a member',
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
            return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ No permission.')] });
        const user = message.mentions.members.first();
        if (!user) return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ Mention a user.')] });
        const reason = args.slice(1).join(' ') || 'No reason provided';
        await user.ban({ reason });
        message.channel.send({ embeds: [new EmbedBuilder().setColor(modColor).setDescription(`🔨 **${user.user.username}** has been banned.\n**Reason:** ${reason}`)] });
    }
};

const kick = {
    name: 'kick',
    description: 'Kick a member',
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
            return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ No permission.')] });
        const user = message.mentions.members.first();
        if (!user) return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ Mention a user.')] });
        const reason = args.slice(1).join(' ') || 'No reason provided';
        await user.kick(reason);
        message.channel.send({ embeds: [new EmbedBuilder().setColor(modColor).setDescription(`👢 **${user.user.username}** has been kicked.\n**Reason:** ${reason}`)] });
    }
};

const mute = {
    name: 'mute',
    description: 'Timeout a member',
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
            return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ No permission.')] });
        const user = message.mentions.members.first();
        if (!user) return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ Mention a user.')] });
        const duration = parseInt(args[1]) || 10;
        await user.timeout(duration * 60 * 1000);
        message.channel.send({ embeds: [new EmbedBuilder().setColor(modColor).setDescription(`🔇 **${user.user.username}** muted for **${duration} minutes**.`)] });
    }
};

const warn = {
    name: 'warn',
    description: 'Warn a member',
    cooldown: 3,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
            return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ No permission.')] });
        const user = message.mentions.members.first();
        if (!user) return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ Mention a user.')] });
        const reason = args.slice(1).join(' ') || 'No reason provided';
        if (!client.warns.has(user.id)) client.warns.set(user.id, []);
        client.warns.get(user.id).push({ reason, by: message.author.tag, time: new Date().toISOString() });
        const count = client.warns.get(user.id).length;
        message.channel.send({ embeds: [new EmbedBuilder().setColor('#d4af37').setDescription(`⚠️ **${user.user.username}** warned. Total warns: **${count}**\n**Reason:** ${reason}`)] });
    }
};

const warnings = {
    name: 'warnings',
    description: 'Check warnings',
    cooldown: 3,
    async execute(message, args, client) {
        const user = message.mentions.members.first() || message.member;
        const warns = client.warns.get(user.id) || [];
        const embed = new EmbedBuilder().setColor(modColor).setTitle(`Warnings for ${user.user.username}`).setDescription(warns.length === 0 ? 'No warnings.' : warns.map((w, i) => `**${i + 1}.** ${w.reason} — by ${w.by}`).join('\n'));
        message.channel.send({ embeds: [embed] });
    }
};

const purge = {
    name: 'purge',
    description: 'Bulk delete messages',
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
            return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ No permission.')] });
        const amount = parseInt(args[0]);
        if (!amount || amount < 1 || amount > 100)
            return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ Provide a number 1–100.')] });
        await message.channel.bulkDelete(amount + 1, true);
        const msg = await message.channel.send({ embeds: [new EmbedBuilder().setColor(modColor).setDescription(`🗑️ Deleted **${amount}** messages.`)] });
        setTimeout(() => msg.delete().catch(() => {}), 3000);
    }
};

const lock = {
    name: 'lock',
    description: 'Lock a channel',
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
            return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ No permission.')] });
        await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
        message.channel.send({ embeds: [new EmbedBuilder().setColor(modColor).setDescription('🔒 Channel locked.')] });
    }
};

const unlock = {
    name: 'unlock',
    description: 'Unlock a channel',
    cooldown: 5,
    async execute(message, args, client) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels))
            return message.reply({ embeds: [new EmbedBuilder().setColor('#8b0000').setDescription('❌ No permission.')] });
        await message.channel.permissionOverwrites.edit(message.guild.id, { SendMessages: null });
        message.channel.send({ embeds: [new EmbedBuilder().setColor(modColor).setDescription('🔓 Channel unlocked.')] });
    }
};

module.exports = { ban, kick, mute, warn, warnings, purge, lock, unlock };
