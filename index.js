const { FEEDBACK_CHANNEL_ID , ALLOWED_ROLES , prefix} = require ('./config.json')
const { Client, GatewayIntentBits , EmbedBuilder , ActionRowBuilder , ButtonBuilder , ButtonStyle } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	],
});
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(`${prefix}feedback`)) return;

    const hasPermission = message.member.roles.cache.some(role => ALLOWED_ROLES.includes(role.id));
    if (!hasPermission) {
        return message.reply({ content: '⚠️لازم تكون اداري لعمل هذا الامر !', ephemeral: true });
    }

    const feedbackEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('تقييم الإداري')
        .setDescription('يرجى التقييم من واحد لخمسه')
        .addFields(
            { name: 'الإداري:', value: message.author.toString(), inline: true },
            { name: 'التاريخ:', value: new Date().toLocaleDateString(), inline: true }
        )
        .setFooter({ text: 'Wick Studio || discord.gg/wicks' });

    const ratingButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('rating_1')
                .setLabel('1 ⭐')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('rating_2')
                .setLabel('2 ⭐')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('rating_3')
                .setLabel('3 ⭐')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('rating_4')
                .setLabel('4 ⭐')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('rating_5')
                .setLabel('5 ⭐')
                .setStyle(ButtonStyle.Primary)
        );

    const feedbackMessage = await message.reply({
        embeds: [feedbackEmbed],
        components: [ratingButtons],
        content: '**يرجى الضغط على واحد من الخامسه ازرار**'
    });

    const filter = i => i.customId.startsWith('rating_');
    const collector = feedbackMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        const rating = parseInt(i.customId.split('_')[1]);
        
        const resultEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('تقييم جديد')
            .setDescription(`تم تقييم الإداري ${message.author.toString()} بـ ${rating} نجوم ⭐`)
            .addFields(
                { name: 'التقييم بواسطه', value: i.user.toString(), inline: true },
                { name: 'التاريخ:', value: new Date().toLocaleDateString(), inline: true }
            )
            .setFooter({ text: 'Wick Studio || discord.gg/wicks' });

        const feedbackChannel = client.channels.cache.get(FEEDBACK_CHANNEL_ID);
        if (feedbackChannel) {
            await feedbackChannel.send({ embeds: [resultEmbed] });
        }
        await i.update({
            content: `شكراً لك على تقييم  ${message.author.toString()} بـ ${rating} نجوم ⭐`,
            embeds: [],
            components: []
        });

        collector.stop();
    });
});
client.login(token)
