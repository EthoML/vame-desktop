
type EndpointLogger = {
    onSuccess?: (response: any) => void,
    onFailure?: (error: any) => void,
    onRequest?: (request: any) => void
}

type LoggerConfiguration = Record<string, EndpointLogger>

export class Logger {

    configuration: LoggerConfiguration

    console = {
        log: console.log,
        error: console.error,
        warn: console.warn
    }

    constructor(configuration: LoggerConfiguration) {
        this.configuration = configuration
    }

    request = (key: string) => {
        const logger = this.configuration[key]
        const callback = logger?.onRequest ?? this.console.log
        callback.call(this.console, key)
    }

    success = (key: string, response: any) => {
        const logger = this.configuration[key]
        const callback = logger?.onSuccess ?? this.console.log
        callback.call(this.console, response)
    }

    error = (key: string, error: any) => {
        const logger = this.configuration[key]
        const callback = logger?.onFailure ?? this.console.error
        callback.call(this.console, error)
    }

}