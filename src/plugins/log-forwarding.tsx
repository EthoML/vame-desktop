const consoleMethods = ['log', 'warn', 'error']

export function load() {

    const subscriptions = {}

    consoleMethods.forEach((method) => this.on(method, (_, ...args) => Object.getOwnPropertySymbols(subscriptions).forEach((symbols) => subscriptions[symbols]({ method, args }))));

    return {
        subscribe: (callback) => {
            const id = Symbol('subscription')
            subscriptions[id] = callback
            return id
        },
        unsubscribe: (id) => {
            delete subscriptions[id]
        },
        
    }
}

export const desktop = {
load: function () {
        const consoleMethodRefs: any = {};
        consoleMethods.forEach(method => {
        const ogMethod = consoleMethodRefs[method] = console[method]
        console[method] = (...args) => {
            this.send(method, ...args)
            ogMethod(...args)
        }
        })
    }
}
