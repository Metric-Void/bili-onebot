const biliAPI = require('bili-api')
const msg = require("../api/message")

const groupCommandPrefix = {
    "群订阅直播": groupLiveSubscribe,
    "群直播订阅": groupLiveSubscribe,
    "群取消订阅直播": groupLiveUnsubscribe
}

async function groupLiveSubscribe(instance, arg, rawMsg) {
    let groupId = rawMsg.group_id
    let senderId = rawMsg.user_id
    let uname_, mid_, roomid_, roomIdString_
    let failed = false

    let permList = global.bili_config.conf.admin["0"]
        .concat(global.bili_config.conf.admin[groupId.toString()])

    if(!permList.includes(senderId)) {
        msg.sendGrpMsgNr(instance, groupId, "你没有操作的权限")
        return
    }

    if(isNaN(arg)) {
        uname_ = arg

        let query = new Object()
        query.uname = arg

        let result = await biliAPI(query, ['mid', 'roomid'])
        mid_ = result.mid
        roomid_ = result.roomid
        roomIdString_ = roomid_.toString()
    } else {
        mid_ = parseInt(arg)

        let query = new Object()
        query.mid = mid_

        let result = await biliAPI(query, ['uname', 'roomid'])
        uname_ = result.uname
        roomid_ = result.roomid
        roomIdString_ = roomid_.toString()
    }

    if(roomIdString_ == "0") {
        roomid_ = parseInt(arg)
        roomIdString_ = roomid_.toString()

        let query = new Object()
        query.roomid = roomid_

        biliAPI(query, ['mid', 'uname']).then(
            resolve => {
                uname_ = resolve.uname
                mid_ = resolve.mid
                msg.sendGrpMsg(instance, groupId, `已为该群添加订阅 ${uname_}，UID ${mid_}, 直播间号 ${roomid_}`)
            },
            reject => {
                msg.sendGrpMsg(instance, groupId, "找不到对应的直播间或用户 我不干啦！")
                console.log(reject)
                failed = true
            }
        )
    }
    
    if(failed) return

    if(global.bili_config.conf.live.rooms[roomIdString_]) {
        if(global.bili_config.conf.live.rooms[roomIdString_].groups.includes(groupId)) {
            msg.sendGrpMsg(instance, groupId, "此群已经订阅了该UP")
        } else {
            global.bili_config.conf.live.rooms[roomIdString_].groups.push(groupId)
            msg.sendGrpMsg(instance, groupId, `已为该群添加订阅 ${uname_}，UID ${mid_}, 直播间号 ${roomid_}`)
            console.log(`已为群 ${groupId} 添加订阅 ${uname_}，UID ${mid_}, 直播间号 ${roomid_}`)
            global.bili_config.save()
        }
    } else {
        global.bili_config.conf.live.rooms[roomIdString_] = new Object()
        global.bili_config.conf.live.rooms[roomIdString_].note = uname_
        global.bili_config.conf.live.rooms[roomIdString_].groups = [groupId, ]
        global.bili_config.conf.live.rooms[roomIdString_].mid = mid_
        msg.sendGrpMsg(instance, groupId, `已为该群添加订阅 ${uname_}，UID ${mid_}, 直播间号 ${roomid_}`)
        console.log(`已为群 ${groupId} 添加订阅 ${uname_}，UID ${mid_}, 直播间号 ${roomid_}`)
        global.bili_config.save()
    }
}

async function groupLiveUnsubscribe(instance, arg, rawMsg) {
    let groupId = rawMsg.group_id
    let senderId = rawMsg.user_id

    let permList = global.bili_config.conf.admin["0"]
        .concat(global.bili_config.conf.admin[groupId.toString()])

    if(!permList.includes(senderId)) {
        msg.sendGrpMsgNr(instance, groupId, "你没有操作的权限")
        return
    }

    let roomIdString_ = null
    let mid_, note_
    // First, assume this is Room ID.
    Object.keys(global.bili_config.conf.live.rooms).forEach(x => {
        if(x == arg || global.bili_config.conf.live.rooms[x].mid == parseInt(arg) || global.bili_config.conf.live.rooms[x].note == arg) {
            // Remove this group from subscribed groups.
            roomIdString_ = x
            mid_ = global.bili_config.conf.live.rooms[x].mid
            note_ = global.bili_config.conf.live.rooms[x].note
        }
    })

    if(roomIdString_ != null) {
        global.bili_config.conf.live.rooms[roomIdString_].groups
            = global.bili_config.conf.live.rooms[roomIdString_].groups.filter(x => x != groupId)
        if(global.bili_config.conf.live.rooms[roomIdString_].groups.length == 0)
            delete global.bili_config.conf.live.rooms[roomIdString_]
        global.bili_config.save()
        msg.sendGrpMsg(instance, groupId, `已为本群取关${note_}(${mid_}), 直播间号${roomIdString_}`)
    } else {
        msg.sendGrpMsg(instance, groupId, `无法将${arg}匹配为直播间号，UID或用户名。`)
    }
}

/**
 * Parse a command sent in group chat.
 * @param {OnebotSocket} instance A onebot socket instance
 * @param {string} command A string of command
 * @param {Object} rawMsg The raw message.
 */
function parseGroupCommand(instance, command, rawMsg) {
    Object.keys(groupCommandPrefix).forEach( s => {
        if(command.startsWith(s)) {
            groupCommandPrefix[s](instance, command.substr(s.length, command.length).trim(), rawMsg)
        }
    })
}

module.exports.parseGroupCommand = parseGroupCommand