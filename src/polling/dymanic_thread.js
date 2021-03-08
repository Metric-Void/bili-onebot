const biliAPI = require('bili-api')
const { OnebotSocket } = require('../api/onebot')
const { dynamics_notify } = require('./notify')
const async = require('async')
const log4js = require('log4js');
const chalk = require('chalk');

var lastDynamic = new Object()
var timer = null
var logger = log4js.getLogger('[dyno_thread]');
logger.level = "trace"

/**
 * Routine function for polling dynamics.
 * @param {OnebotSocket} socket The socket to send message with.
 * @param {boolean} firstRun Whether this is the first run.
 */
async function dynoRunner(socket, firstRun) {
    logger.info("Running dynamics check...")
    
    let mids = global.bili_config.conf.dynamics.mids
    let thisDynamic = new Object()

    async.forEachOf(mids, async (value, x, callback) => {
        try {
            let result = await biliAPI({mid: parseInt(x)}, ['dynamics', 'uname'])
            logger.trace(`Dynamic fetch for ${chalk.blue(result.uname)}(${chalk.blue(x)}) succeeded.`)
            if(result.dynamics.length == 0) return
            thisDynamic[x] = result.dynamics[0].dynamic_id_str

            if(!firstRun && lastDynamic[x] != thisDynamic[x]) {
                let index = 0
                while(result.dynamics[index].dynamic_id_str != lastDynamic[x] && index < result.dynamics.length) index += 1
                dynamics_notify(socket, result, result.dynamics.slice(0, index + 1))
            }

            lastDynamic[x] = thisDynamic[x]
        } catch(e) {
            logger.warn(`Dynamic fetch for ${x} failed.`)
            logger.warn(e)
        }
    }).then(result => {
        // lastDynamic = thisDynamic
        logger.info("Dynamic Checks all completed.")
    }, reject => {
        logger.warn("Some dynamic check failed.")
        // lastDynamic = thisDynamic
        logger.warn(reject)
    })
}

/**
 * Initialize the dynamics polling routine
 * @param {OnebotSocket} socket Onebot Socket to send messages on.
 */
function dyno_init(socket) {
    dynoRunner(socket, true)
    if(timer) clearInterval(timer)
    timer = setInterval(dynoRunner, global.bili_config.conf.dynamics.checkInterval * 1000, socket, false)
}

module.exports = {
    dyno_init: dyno_init
}