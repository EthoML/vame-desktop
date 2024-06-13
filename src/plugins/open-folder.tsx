export function load() {
    return (path) => this.sendSync('open', path)
}


export const desktop = {
    load: function () {
        const { shell } = this.electron;
        this.on('open', (ev, path) => {
            shell.openPath(path)
            ev.returnValue = true
        })
    }
}