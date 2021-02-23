const crypto = require("crypto")

/**
 * Generates a random hex string.
 * @param {int} n Length
 * @returns {string} A random string.
 */
function rand_string(n) {
    if (n <= 0) { return "" }
    var rs = ""
    try { rs = crypto.randomBytes(Math.ceil(n/2)).toString("hex").slice(0,n) }
    catch(ex) { // crypto not found or something
        rs = ""
        var r = n % 8, q = (n-r)/8, i
        for(i = 0; i < q; i++) {
            rs += Math.random().toString(16).slice(2)
        }
        if(r > 0){
            rs += Math.random().toString(16).slice(2,i)
        }
    }
    return rs
}

async function promisifiedSend(socket, data) {
    let promise =  new Promise((resolve, reject) => {
        socket.getEchoListeners().once(data.echo, (socketMsg)=> {
            if(socketMsg["status"] && socketMsg["status"] === "ok" ) {
                resolve(socketMsg)
            } else { if(reject) reject(socketMsg) }
        })
    })

    socket.ws.send(JSON.stringify(data))
    
    return promise
}

function _priv_msg_request(target, content) {
    return {
        action: "send_private_msg",
        params: {
            user_id: target,
            message: content
        },
        echo: rand_string(16)
    }
}

function _grp_msg_request(target, content) {
    return {
        action: "send_group_msg",
        params: {
            group_id: target,
            message: content
        },
        echo: rand_string(16)
    }
}

/**
 * Send a private message, and listen the socket for a response.
 * @param {OnebotSocket} socket the socket to operate on.
 * @param {BigInt} target QQ ID of the receiver
 * @param {string} content Message to send. 
 */
async function sendPrivMsg(socket, target, content) {
    return promisifiedSend(socket, _priv_msg_request(target, content))
}

/**
 * Send a private message, but does not care whether it has been sent successfully.
 * This method is faster than waiting for response.
 * @param {OnebotSocket} socket the socket to operate on.
 * @param {BigInt} target QQ ID of the receiver
 * @param {string} content Message to send. 
 */
async function sendPrivMsgNr(socket, target, content) {
    socket.ws.send(JSON.stringify(_priv_msg_request(target, content)))
}

async function sendGrpMsg(socket, target, content) {
    promisifiedSend(socket, _grp_msg_request(target, content))
}

async function sendGrpMsgNr(socket, target, content) {
    socket.ws.send(JSON.stringify(_grp_msg_request(target, content)))
}

async function deleteMsg(socket, msg_id) {
    socket.ws.send(JSON.stringify({
        action: "delete_msg",
        params: {
            message_id: msg_id
        },
        echo: rand_string(16)
    }))
}

module.exports.sendPrivMsg = sendPrivMsg
module.exports.sendPrivMsgNr = sendPrivMsgNr
module.exports.sendGrpMsg = sendGrpMsg
module.exports.sendGrpMsgNr = sendGrpMsgNr
module.exports.deleteMsg = deleteMsg