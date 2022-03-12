const { SlashCommandBuilder } = require('@discordjs/builders')
const stringSimilarity = require('string-similarity')
const subreddits = require('../content/data.json')
const OGParser = require('ogparser')
const fetch = require('node-fetch')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Beep!')
    .addStringOption((option) =>
      option
        .setName('tag')
        .setDescription('Which tag to show')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  execute: async (interaction) => {
    await interaction.deferReply({ ephermal: true })

    const subreddit = interaction.options.getString('tag')

    console.log(subreddit)

    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}.json?sort=random`
    )
    const data = await response.json()
    const children = data.data.children
    const url = children[children.length - 1].data.url

    // ToDo Error handling

    const og = await OGParser.parse(url)

    if (typeof og.video == 'string')
      return interaction.editReply({
        files: [og.video],
      })
    if (og.video && typeof og.video.video == 'string')
      return interaction.editReply({
        files: [og.video.video],
      })
    if (typeof og.image == 'string')
      return interaction.editReply({
        files: [og.image],
      })
    if (og.image && typeof og.image.image == 'string')
      return interaction.editReply({
        files: [og.image.image],
      })

    return interaction.editReply(url)
  },
  autocomplete: async (interaction) => {
    const currentValue = interaction.options.getFocused()
    const matches = stringSimilarity
      .findBestMatch(currentValue, subreddits)
      .ratings.filter((e) => e.rating > 0)
      .sort((a, b) => b.rating - a.rating)
      .map((e) => ({
        name: `/r/${e.target}`,
        value: e.target,
      }))
      .splice(0, 10)
    return interaction.respond(matches)
  },
}
