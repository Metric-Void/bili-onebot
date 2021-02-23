const { OnebotSocket } = require("./api/onebot")
const { parseGroupCommand } = require("./app/commands")
const msg = require("./api/message")
const { BiliBotConfig } = require("./app/config")
const { live_init } = require("./polling/live_thread")
const { dyno_init } = require("./polling/dymanic_thread")
const biliAPI = require('bili-api')

const { dynamics_notify } = require('./polling/notify')

module.exports = main

async function main() {
    console.log("Main OK.")
    let socket = await new OnebotSocket("ws", "ws://127.0.0.1:6700")
    global.bili_config = new BiliBotConfig("config.json")

    // socket.addWSListener("PrintToConsole", (e) => {
    //     console.log("Websocket received data.")
    //     console.log(e)
    // })
    
    // msg.sendPrivMsg(socket, 1124096029, "well").then(() => {console.log("Well -> success")}, () => {console.log("Well -> failure")})
    // msg.sendPrivMsg(socket, 1124096029, "Does this stuck the script?")
    // socket.addWSListener("echo", x => {console.log(x)})
    
    // socket.getMessageListener().on("private", o => {
    //     console.log(`Private Message from ${o.user_id} : ${o.message}`)
    // })

    socket.getMessageListener().on("group", x => {
        parseGroupCommand(socket, x.message, x)
    })

    live_init(socket)
    dyno_init(socket)

    let result = await biliAPI({mid: 7528074}, ['dynamics', 'uname'])
    dynamics_notify(socket, result, [result.dynamics[10], result.dynamics[11]])
}

