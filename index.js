const fs = require('node:fs')
const { Client, Collection, Intents } = require('discord.js')
const { token } = require('./config.json')

const client = new Client({ intents: [Intents.FLAGS.GUILDS] })

client.commands = new Collection()
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  if (command.data) client.commands.set(command.data.name, command)
}

client.once('ready', () => {
  console.log('Ready!')
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand() && !interaction.isAutocomplete()) return
  const command = client.commands.get(interaction.commandName)

  if (!command) return

  try {
    if (interaction.isCommand()) await command.execute(interaction)
    else if (interaction.isAutocomplete())
      await command.autocomplete(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.isCommand())
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      })
  }
})

client.login(token)
