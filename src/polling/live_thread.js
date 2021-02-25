const biliAPI = require('bili-api')
const { OnebotSocket } = require('../api/onebot')
const { live_notify } = require('./notify')
const async = require('async')

var runner = null

var lastStatus = new Object()

const DEBUG = false

/**
 * Routine function for polling liveroom status.
 * @param {OnebotSocket} socket The socket to send notifications on.
 * @param {bool} firstRun Indicates if this is the first run.
 */
async function liveStatusRunner(socket, firstRun) {
    console.log("Live Thread - Running status check...")
    var currentStatus = new Object()

    let rooms = Object.keys(global.bili_config.conf.live.rooms)
    // if(rooms.length == 0) return;

    async.each(rooms, async (x, callback) => {
        console.log(`Checking Room ID: ${x}`)
        let roomInfo = await biliAPI({roomid: parseInt(x)}, ['liveStatus', 'getRoomInfoOld', 'mid', 'uname'])

        currentStatus[x] = roomInfo.liveStatus

        if (DEBUG) {
            live_notify(socket, roomInfo)
        } else if(!firstRun) {
            if(currentStatus[x] != lastStatus[x]) live_notify(socket, roomInfo)
        }
    }).then(resolve => {
        console.log("Room status check completed.")
        lastStatus = currentStatus
    }, reject => {
        console.log("Some liveroom check has failed.")
        console.log(reject)
    })
}

/**
 * Initialize the live thread.
 * @param {OnebotSocket} socket The socket to send messages on.
 */
function live_init(socket) {
    liveStatusRunner(socket, true)
    runner = setInterval(liveStatusRunner, global.bili_config.conf.live.checkInterval * 1000, socket, false)
}

module.exports.live_init = live_init