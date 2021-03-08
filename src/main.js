const { OnebotSocket } = require("./api/onebot")
const { parseGroupCommand } = require("./app/commands")
const msg = require("./api/message")
const { BiliBotConfig } = require("./app/config")
const { live_init } = require("./polling/live_thread")
const { dyno_init } = require("./polling/dymanic_thread")
const biliAPI = require('bili-api')
const chalk = require('chalk')
const figlet = require('figlet')

const { dynamics_notify } = require('./polling/notify')

module.exports = main

async function main() {
    console.log(
        chalk.green(
          figlet.textSync('bili-onebot', { horizontalLayout: 'full' })
        )
      );
    console.log(chalk.white("bili-onebot CLI Interface..."))

    global.bili_config = new BiliBotConfig("config.json")
    
    console.log(chalk.white("[Main] Connecting to " 
        + chalk.green.bold(global.bili_config.conf.onebot.addr)
        + " with type "
        + chalk.green.bold(global.bili_config.conf.onebot.type)
    ))

    let socket = await new OnebotSocket(
        global.bili_config.conf.onebot.type, 
        global.bili_config.conf.onebot.addr)

    socket.getMessageListener().on("group", x => {
        parseGroupCommand(socket, x.message, x)
    })

    live_init(socket)
    dyno_init(socket)
}

