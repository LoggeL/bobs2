const fs = require('node:fs')

// http://electronsoup.net/nsfw_subreddits/data.json
const raw = require('./raw.json')
  .nodes.filter((e) => e.attributes.subscribers > 10000)
  .map((e) => e.label)

fs.writeFileSync('data.json', JSON.stringify(raw))
