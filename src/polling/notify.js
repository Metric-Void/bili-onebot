const msg = require("../api/message")
const async = require("async")

/**
 * Send notification about a liveroom update.
 * @param {OnebotSocket} socket Onebot socket to send message on.
 * @param {Object} roomInfo Room info JSON.
 */
function live_notify(socket, roomInfo) {
    let room = global.bili_config.conf.live.rooms[roomInfo.roomid.toString()]
    console.log(`Notifying Live for ${roomInfo.uname} as ${roomInfo.liveStatus}`)
    if(roomInfo.liveStatus == 1) {
        // msgStr = `你关注的${roomInfo.uname}(${roomInfo.mid})开播啦！\n直播间标题：${roomInfo.getRoomInfoOld.data.title}\n[CQ:image,file=${roomInfo.getRoomInfoOld.data.cover}]\n直播间地址：${roomInfo.getRoomInfoOld.data.url}`
        room.groups.forEach(group => {
            let msgStr = ""
            if(room.extra && room.extra[`live-up.${group}`]) {
                msgStr = eval(`\`${room.extra[`live-up.${group}`]}\``)
            } else {
                msgStr = eval(`\`${global.bili_config.conf.strings["d-live-up"]}\``)
            }
            msg.sendGrpMsgNr(socket, group, msgStr)
        })
    } else {
        room.groups.forEach(group => {
            let msgStr = ""
            if(room.extra && room.extra[`live-down.${group}`]) {
                msgStr = eval(`\`${room.extra[`live-down.${group}`]}\``)
            } else {
                msgStr = eval(`\`${global.bili_config.conf.strings["d-live-down"]}\``)
            }
            msg.sendGrpMsgNr(socket, group, msgStr)
        })
    }
}

function _text_dyn_body(dynItem) {
    return `[文字动态]\n${dynItem.item.content}`
}

function _pic_dyn_body(dynItem) {
    let builder = `[图片动态]\n${dynItem.item.description}`
    dynItem.item.pictures.forEach(pic => {
        builder += `\n[CQ:image,file=${pic.img_src}]`
    })
    return builder
}

function _repost_dyn_body(dynItem) {
    let builder = `[转发动态 来自@${dynItem.origin_user.info.uname}]\n${dynItem.item.content}\n`
    let content = ""
    switch(dynItem.origin.type) {
        case 'TEXT_POST':
            content = _text_dyn_body(dynItem.origin)
            break
        case 'PIC_POST':
            content = _pic_dyn_body(dynItem.origin)
            break
        case 'REPOST': // This should never happen.
            content = _repost_dyn_body(dynItem.origin)
            break
        default:
            break
    }
    return builder + content
}

/**
 * Send notification about a dynamics update.
 * @param {OnebotSocket} socket The Onebot socket to send messages with.
 * @param {any} rawObj Raw request object from bili-api. Additional data can be fetched here.
 * @param {Array} dynList List of dynamics to send.
 */
function dynamics_notify(socket, rawObj, dynList) {
    let groups = global.bili_config.conf.dynamics.mids[rawObj.mid.toString()].groups

    async.forEach(dynList, (x, callback) => {
        let msgStr = ""
        switch(x.type) {
            case 'TEXT_POST': 
                msgStr = `${rawObj.uname} 发布了动态：\n`+_text_dyn_body(x)+`\n动态地址：https://t.bilibili.com/${x.dynamic_id_str}?tab=2`
                break
            case 'PIC_POST':
                msgStr = `${rawObj.uname} 发布了动态：\n`+_pic_dyn_body(x)+`\n动态地址：https://t.bilibili.com/${x.dynamic_id_str}?tab=2`
                break
            case 'REPOST':
                msgStr = `${rawObj.uname} 转发了动态：\n`+_repost_dyn_body(x)+`\n动态地址：https://t.bilibili.com/${x.dynamic_id_str}?tab=2`
                break
            default:
                break
        }
        groups.forEach(group => msg.sendGrpMsgNr(socket, group, msgStr))
    })
}

module.exports = {
    live_notify: live_notify,
    dynamics_notify: dynamics_notify
}