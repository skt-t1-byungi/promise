import { assert, Resolver } from '@byungi/promise-helpers'
import PClass from '@byungi/p-class'

export class DelayPromise extends PClass<void> {
    private _timerId: number
    private _resolve: Resolver<void>

    constructor (ms: number) {
        let _timerId!: number
        let _resolve: any

        super(resolve => {
            _timerId = setTimeout(_resolve = resolve, ms)
        })

        this._timerId = _timerId
        this._resolve = _resolve
    }

    public clear () {
        clearTimeout(this._timerId)
        this._resolve()
    }
}

export const pDelay = (ms: number) => new DelayPromise(ms)

export default pDelay
