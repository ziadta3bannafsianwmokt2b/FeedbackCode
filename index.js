const { FEEDBACK_CHANNEL_ID , ALLOWED_ROLES , prefix , token} = require ('./config.json')
const { Client, GatewayIntentBits , EmbedBuilder , ActionRowBuilder , ButtonBuilder , ButtonStyle } = require('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	],
});

client.once('ready', () => {
    console.log('========================================');
    console.log(`✅ ${client.user.tag} is online`);
    console.log(`Wick Studio: discord.gg/wicks`);
    console.log(`Made By: 72.20.`);
    console.log('========================================');
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!feedback')) return;

    if (message.mentions.users.size === 0) {
        return message.reply({ content: '⚠️ منشن الاداري', ephemeral: true });
    }

    const adminToRate = message.mentions.users.first();
    
    await message.delete().catch(console.error);

    const feedbackEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('تقييم الإداري')
        .setDescription('يرجى التقييم من واحد لخمسة نجوم')
        .addFields(
            { name: 'الإداري:', value: adminToRate.toString(), inline: true },
            { name: 'التاريخ:', value: new Date().toLocaleDateString(), inline: true }
        )
        .setFooter({ text: 'Wick Studio || discord.gg/wicks' });

    const ratingButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`rating_${adminToRate.id}_1`)
                .setLabel('1 ⭐')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`rating_${adminToRate.id}_2`)
                .setLabel('2 ⭐')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`rating_${adminToRate.id}_3`)
                .setLabel('3 ⭐')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`rating_${adminToRate.id}_4`)
                .setLabel('4 ⭐')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`rating_${adminToRate.id}_5`)
                .setLabel('5 ⭐')
                .setStyle(ButtonStyle.Primary)
        );

    const feedbackMessage = await message.channel.send({
        embeds: [feedbackEmbed],
        components: [ratingButtons],
        content: `**${message.author.toString()} يرجى تقييم ${adminToRate.toString()} من 1-5 نجوم**`
    });

    const filter = i => i.customId.startsWith(`rating_${adminToRate.id}_`);
    const collector = feedbackMessage.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        const parts = i.customId.split('_');
        const ratedUserId = parts[1];
        const rating = parseInt(parts[2]);
        
        const ratedUser = await client.users.fetch(ratedUserId);
        
        const resultEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('تقييم جديد')
            .setDescription(`تم تقييم الإداري ${ratedUser.toString()} بـ ${rating} نجوم ⭐`)
            .addFields(
                { name: 'تم التقييم بواسطه:', value: i.user.toString(), inline: true },
                { name: 'التاريخ:', value: new Date().toLocaleDateString(), inline: true }
            )
            .setFooter({ text: 'Wick Studio || discord.gg/wicks' });

        const feedbackChannel = client.channels.cache.get(FEEDBACK_CHANNEL_ID);
        if (feedbackChannel) {
            await feedbackChannel.send({ embeds: [resultEmbed] });
        }

        await i.update({
            content: `شكراً لك ${i.user.toString()} على تقييم الاداري ${ratedUser.toString()} بـ ${rating} نجوم ⭐`,
            embeds: [],
            components: []
        });

        collector.stop();
    });

});
client.login(token)
