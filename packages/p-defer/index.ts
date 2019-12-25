import { Resolver, Rejector } from '@byungi/promise-helpers'

export class Deferred<T> {
    private _promise: Promise<T>
    private _resolve: Resolver<T>
    private _reject: Rejector

    constructor () {
        let _resolve: any
        let _reject: any

        this._promise = new Promise((resolve, reject) => {
            _resolve = resolve
            _reject = reject
        })

        this._resolve = _resolve
        this._reject = _reject
    }

    get promise () {
        return this._promise
    }

    resolve (value: T) {
        return this._resolve(value)
    }

    reject (reason?: any) {
        return this._reject(reason)
    }
}

export const pDefer = <T>() => new Deferred<T>()

export default pDefer
