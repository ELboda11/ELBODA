const { Client, GatewayIntentBits } = require("discord.js");
const { QuickDB } = require("quick.db");

const db = new QuickDB();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const levelChannelID = "1533240809288110111";


client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});


client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const userID = message.author.id;

  let xp = await db.get(`xp_${userID}`) || 0;

  let oldLevel = Math.floor(xp / 100);

  xp += 5;

  await db.set(`xp_${userID}`, xp);

  let newLevel = Math.floor(xp / 100);

  if (newLevel > oldLevel) {
    const channel = client.channels.cache.get(levelChannelID);

    if (channel) {
      channel.send(
        `🎉 مبروك ${message.author}! وصلت إلى Level **${newLevel}**`
      );
    }
  }


  if (message.content === "!rank") {

    const allData = await db.all();

    let users = allData
      .filter(data => data.id.startsWith("xp_"))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    let text = "🏆 **XP Leaderboard**\n\n";

    let place = 1;

    for (const user of users) {

      const id = user.id.replace("xp_", "");

      const member = await message.guild.members.fetch(id)
        .catch(() => null);

      if (member) {
        let level = Math.floor(user.value / 100);

        text += `**${place}.** ${member.user.username} - ${user.value} XP (Level ${level})\n`;

        place++;
      }
    }

    message.channel.send(text);
  }
});


client.login(process.env.TOKEN);
