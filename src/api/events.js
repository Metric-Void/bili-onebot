/* List of events */


const EVENT_FRIEND_REQ = "friend_req"

const onebotNativeNoticeTypes = [
    'group_upload', 'group_admin', 'group_decrease', 'group_increase', 'group_ban', 'group_recall', 'friend_recall'
]

/**
 * @param {Object} sockMessage The message received on the socket.
 * @param {EventEmitter} eventEmitter The event emitter to trigger after parsing message.
 */
function parseEvent(sockMessage, eventEmitter) {
    switch(sockMessage.post_type) {
    case 'message':
        // sockMessage.message_type is either 'private' or 'group'.
        eventEmitter.emit(sockMessage.message_type, sockMessage)
        break
    case 'notice':
        if(sockMessage.notice_type in onebotNativeNoticeTypes) {
            eventEmitter.emit(sockMessage.notice_type, sockMessage)
        } else if(sockMessage.notice_type == 'notify') {
            eventEmitter.emit(`notify_${sockMessage.notice_type}`, sockMessage)
        }
        break
    case 'request':
        if(sockMessage.request_type == 'friend') {
            eventEmitter.emit(EVENT_FRIEND_REQ, sockMessage)
        } else if (sockMessage.request_type == 'group') {
            eventEmitter.emit(`group_${sockMessage.sub_type}`, sockMessage)
        }
        break
    case 'meta_event':
        eventEmitter.emit(`meta:${sockMessage.meta_event_type}`)
        break
    default:
        return
    }
}

module.exports.parseEvent = parseEvent
