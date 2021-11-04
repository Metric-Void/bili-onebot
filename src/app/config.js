const fs = require('fs')
const jschardet = require('jschardet')
const iconv = require("iconv-lite")
const log4js = require('log4js');
const chalk = require('chalk');
var logger = log4js.getLogger('[config]');
logger.level = "trace"

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
        logger.info(`Reading configuration from ${chalk.green(filename)}...`)
        try {
            let file_bin = fs.readFileSync(filename)
            let encoding = jschardet.detect(file_bin).encoding
            logger.info(`Detected file encoding is ${chalk.green(encoding)}`)
            this.conf = JSON.parse(iconv.decode(file_bin, encoding))
            logger.info(`${chalk.green(filename)} loaded.`)
        } catch(e) {
            logger.error(e)
            logger.error("Will use an empty configuration instead.")
            this.conf = empty_config
        }
    }

    save() {
        fs.writeFile(this.fname, JSON.stringify(this.conf, null, 2), (err) => {if (err) { throw err }})
    }
}

module.exports.BiliBotConfig = BiliBotConfig