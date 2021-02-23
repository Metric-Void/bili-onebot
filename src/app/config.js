const fs = require('fs')

// The minimalist configuration that does not freak out the program.
const empty_config = {
    "admin": {
        "0": []
    },
    "live": {
        "checkInterval": 60,
        "rooms": {}
    },
    "dynamics": {
        "checkInterval": 30,
        "mids": {}
    }
}

class BiliBotConfig {
    constructor(filename) {
        this.fname = filename
        console.log(`Reading configuration from ${filename}...`)
        try {
            this.conf = JSON.parse(fs.readFileSync(filename, 'utf8'))
        } catch(e) {
            console.error(e)
            console.error("Will use an empty configuration instead.")
            this.conf = empty_config
        }
    }

    save() {
        fs.writeFile(this.fname, JSON.stringify(this.conf, null, 2), (err) => {if (err) { throw err }})
    }
}

module.exports.BiliBotConfig = BiliBotConfig