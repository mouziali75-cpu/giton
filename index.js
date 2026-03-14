const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const express = require("express");
const app = express();
const axios = require("axios");

// --- Discord Bot ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
    if(message.content === "!verify"){ 
        const button = new ButtonBuilder()
            .setLabel("تحقق")               
            .setStyle(ButtonStyle.Link)
            .setURL(process.env.SITE_URL); // رابط موقعك (ضعه في environment variables)

        const row = new ActionRowBuilder().addComponents(button);

        message.channel.send({
            content: "اضغط الزر للدخول للموقع والتحقق:",
            components: [row]
        });
    }
});

client.login(process.env.BOT_TOKEN); // توكن البوت في environment variables

// --- Express Web Server للموقع ---
app.get("/", (req, res) => {
    res.send(`
        <h2>مرحبا! اضغط الزر لتسجيل الدخول ومنح الرول</h2>
        <a href="https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=268435456&scope=bot%20applications.commands">
            <button>تسجيل دخول Discord</button>
        </a>
    `);
});

// --- Endpoint لتلقي userID وإعطاء الرول (يمكن تطويره لاحقاً) ---
app.get("/verify/:userid", async (req, res) => {
    const userId = req.params.userid;
    try {
        await axios.put(`https://discord.com/api/v10/guilds/${process.env.GUILD_ID}/members/${userId}/roles/${process.env.ROLE_ID}`, {}, {
            headers: {
                "Authorization": `Bot ${process.env.BOT_TOKEN}`
            }
        });
        res.send("تم منحك الرول بنجاح ✅");
    } catch(err) {
        console.error(err);
        res.send("حدث خطأ أثناء إعطاء الرول ❌");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Site running on port ${PORT}`));