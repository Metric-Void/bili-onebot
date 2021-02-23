const msg = require("../api/message")
const async = require("async")

const DYNO_CODE = { 1: 'REPOST', 2: 'PIC_POST', 4: 'TEXT_POST', 8: 'VIDEO', 4200: 'LIVEROOM' }

/**
 * 
 * @param {OnebotSocket} socket Onebot socket to send message on
 * @param {Object} roomInfo Room info JSON.
 */
function live_notify(socket, roomInfo) {
    let groups = global.bili_config.conf.live.rooms[roomInfo.roomid.toString()].groups
    let msgStr = ""

    if(roomInfo.liveStatus == 1) {
        msgStr = `你关注的${roomInfo.uname}(${roomInfo.mid})开播啦！\n直播间标题：${roomInfo.getRoomInfoOld.data.title}\n[CQ:image,file=${roomInfo.getRoomInfoOld.data.cover}]\n直播间地址：${roomInfo.getRoomInfoOld.data.url}`
    } else {
        msgStr = `你关注的${roomInfo.uname}下播了`
    }

    groups.forEach(group => msg.sendGrpMsgNr(socket, group, msgStr))
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

function dynamics_notify(socket, rawObj, dynList) {
    let groups = global.bili_config.conf.dynamics.mids[rawObj.mid.toString()].groups

    async.forEach(dynList, (x, callback) => {
        let msgStr = ""
        switch(x.type) {
            case 'TEXT_POST': 
                msgStr = `${rawObj.uname} 发布了动态：\n`+_text_dyn_body(x)+`\n动态地址：https://t.bilibili.com/${x.dynamic_id_str}?tab=2`
                break;
            case 'PIC_POST':
                msgStr = `${rawObj.uname} 发布了动态：\n`+_pic_dyn_body(x)+`\n动态地址：https://t.bilibili.com/${x.dynamic_id_str}?tab=2`
                break;
            default:
                break;
        }
        groups.forEach(group => msg.sendGrpMsgNr(socket, group, msgStr))
    })
}

module.exports = {
    live_notify: live_notify,
    dynamics_notify: dynamics_notify
}