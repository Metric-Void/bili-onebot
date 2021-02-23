const WebSocket = require("ws")
const ReconnectingWebSocket = require("reconnecting-websocket")
const events = require("events")
const { parseEvent } = require('./events')

const TIMEOUT = 1000

class OnebotSocket {
    /**
     * Construct a new Onebot connection socket.
     * @param {string} type Type of connection that will be used to connect to Onebot server. Currently, only "ws" is supported.
     * @param  {...any} args Under "ws", argument should be [<Websocket Address with ws://>, <optional config file location>]
     */
    constructor(type, ...args) {
        this.socketListeners = Object()
        this.echoListeners = new events.EventEmitter()
        this.messageListeners = new events.EventEmitter()

        if(type == "ws") {
            this.ws = new ReconnectingWebSocket(args[0], [], {
                WebSocket: WebSocket,
                connectionTimeout: TIMEOUT
            })
            this.ws.addEventListener("open", () => {
                console.log("WebSocket Connection established.")
            })
            
            this.ws.addEventListener("close", () => {
                console.log(`WebSocket Closed. Reconnecting in ${TIMEOUT}`)
            })

            this.ws.addEventListener("message", (message) => {
                let msg = JSON.parse(message.data)

                Object.keys(this.socketListeners).forEach(i => {
                    try {
                        this.socketListeners[i](msg)
                    } catch (e) {
                        console.log(`Listener ${i} failed.`)
                        console.log(e)
                    }
                })
                
                parseEvent(msg, this.messageListeners)

                if (msg.echo) {
                    this.echoListeners.emit(msg.echo, msg)
                }
            })
        }
        
    }
    
    /**
     * Add a listener to the web socket.
     * @param {string} name Name of the listener. Can be used to modify or remove such listener.
     * @param {CallableFunction} callback A callback function receiving events.
     */
    addWSListener(name, callback) {
        this.socketListeners[name] = callback
    }

    /**
     * Get the echo listener.
     * @return {EventEmitter} Echo Emitter. An event with the name of the echo string will be emitted when a confirmation from the Onebot server is received.
     */
    getEchoListeners() {
        return this.echoListeners
    }

    /**
     * Get the message listener. Events will be emitted on this listener when messages are received.
     * @return {EventEmitter} The emitter that emits events.
     */
    getMessageListener() {
        return this.messageListeners
    }
}

module.exports.OnebotSocket = OnebotSocket