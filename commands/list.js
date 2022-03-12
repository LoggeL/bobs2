const { SlashCommandBuilder } = require('@discordjs/builders')
const subreddits = require('../content/data.json')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('Get a list of all tags'),
  execute: async (interaction) => {
    await interaction.reply({ content: 'All tags:', ephemeral: true })
    let buffer = ''
    for (let subreddit of subreddits) {
      if (buffer.length + subreddit.length + 2 > 2000) {
        await interaction.followUp({ content: buffer, ephemeral: true })
        buffer = subreddit
      }
      buffer += '\n' + subreddit
    }
  },
}
