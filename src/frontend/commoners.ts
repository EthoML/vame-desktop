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
    for (let i = 0; i < callbacks[key].length; i++) callbacks[key][i]() // Execute all callbacks 
    // while (callbacks[key].length) callbacks[key].shift()!() // Execute all callbacks and remove them
}

const request = (state: keyof typeof states) => get(state).then(() => resolve(state))


export const onConnected = (callback: () => void) => on('connected', callback)
export const onVAMEReady = (callback: () => void) => on('ready', callback)


onActivityDetected(() => {
    console.log(`Checking Python server status...`)
    request('connected')
    .catch(() => console.error(`Python server is not active...`))
})

onClosed(() => {
    console.error(`Python server was closed!`)
    states.connected = false
})

onConnected(() => {
    console.log(`Loading VAME library..`)
    request('ready')
    .then(() => console.log(`VAME is ready!`))
    .catch(() => console.error(`Failed to connect to VAME`))
})