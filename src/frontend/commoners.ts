import { get } from "./utils/requests"

const service = commoners.services.vame

export const onActivityDetected = (callback: () => void) => service.onActivityDetected(callback)
export const onClosed = (callback: () => void) => service.onClosed(callback)


const states = {
    connected: false,
    ready: false,
}
const callbacks = {
    connected: [] as (() => void)[],
    ready: [] as (() => void)[]
}

const on = (key: keyof typeof states, callback: () => void) => {
    if (states[key]) return callback()
    callbacks[key].push(callback)
}

const resolve = (key: keyof typeof states) => {
    states[key] = true
    while (callbacks[key].length) callbacks[key].shift()!()
}

const request = (state: keyof typeof states) => get(state).then(() => resolve(state))


export const onConnected = (callback: () => void) => on('connected', callback)
export const onReady = (callback: () => void) => on('ready', callback)


onActivityDetected(() => request('connected'))
onClosed(() => states.connected = false)
onConnected(() => request('ready'))
  