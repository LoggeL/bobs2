const { SlashCommandBuilder } = require('@discordjs/builders')
const stringSimilarity = require('string-similarity')
const subreddits = require('../content/data.json')
const OGParser = require('ogparser')
const fetch = require('node-fetch')

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

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
    const subreddit = interaction.options.getString('tag')

    console.log(subreddit)
    await interaction.deferReply({ ephermal: true })

    let url, title
    try {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/random.json`
      )
      const data = await response.json()
      let children = data[0].data.children
      for (let i = 0; i < 5; i++) {
        ;({ url, title } = children[0]?.data)
        if (url) break
      }
    } catch (e) {
      console.error(e)
      return interaction.editReply({
        content: 'Error fetching tag',
      })
    }

    // ToDo Error handling

    const og = await OGParser.parse(url)
    let file

    if (typeof og.video == 'string') file = og.video
    if (og.video && typeof og.video.video == 'string') file = og.video.video
    if (typeof og.image == 'string') file = og.image
    if (og.image && typeof og.image.image == 'string') file = og.image.image

    if (file) return interaction.editReply({ files: [file], content: title })
    else return interaction.editReply(title + '\n' + url)
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
