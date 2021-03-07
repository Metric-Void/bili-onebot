const fs = require('fs')
const jschardet = require('jschardet')
const iconv = require("iconv-lite")

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
        console.log(`[config] Reading configuration from ${filename}...`)
        try {
            let file_bin = fs.readFileSync(filename)
            let encoding = jschardet.detect(file_bin).encoding
            console.log(`[config] Detected file encoding is ${encoding}`)
            this.conf = JSON.parse(iconv.decode(file_bin, encoding))
        } catch(e) {
            console.error(e)
            console.error("[config] Will use an empty configuration instead.")
            this.conf = empty_config
        }
    }

    save() {
        fs.writeFile(this.fname, JSON.stringify(this.conf, null, 2), (err) => {if (err) { throw err }})
    }
}

module.exports.BiliBotConfig = BiliBotConfig