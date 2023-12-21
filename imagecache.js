const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Tu código principal del bot

// Obtén el objeto de la imagen
const imageKey = 'https://nerobotfiles.s3.eu-west-3.amazonaws.com/uploads/157/157.png'; // Reemplaza con la URL de la imagen
client.guilds.cache.forEach(guild => {
    guild.members.cache.forEach(member => {
        member.user.displayAvatarURL({ dynamic: true });
    });
});