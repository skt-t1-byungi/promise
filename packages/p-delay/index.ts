import PCancel from '@byungi/p-cancel'

class PDelay extends PCancel<void> {
    private _timerId: number

    constructor (ms: number) {
        let timerId!: number
        super((resolve, _, onCancel) => {
            onCancel(clearTimeout.bind(undefined, timerId = setTimeout(resolve, ms)))
        })
        this._timerId = timerId
    }

    public clear () {
        if (this._defer.isCompleted) return
        clearTimeout(this._timerId)
        this._defer.resolve()
    }
}

export const pDelay = (ms: number) => new PDelay(ms)

export default pDelay
