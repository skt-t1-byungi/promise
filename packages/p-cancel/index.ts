import {
    assert,
    OnFinallyFn,
    OnFulfilledFn,
    OnRejectedFn,
    RejectFn,
    ResolveFn
} from '@byungi/promise-helpers'
import Deferred from 'p-state-defer'

type CancelHandler = () => void
type AddCancelHandler = (fn: CancelHandler) => void

export class CancelError extends Error {
    public readonly isCanceled = true

    constructor (reason = 'promise cancelled.') {
        super(reason)
    }
}

export class PCancel<T> {
    protected _defer: Deferred<T>
    private _isCanceled = false
    private _cancelHandlers: CancelHandler[] = []

    constructor (executor: (resolve: ResolveFn<T>, reject: RejectFn, onCancel: AddCancelHandler) => void) {
        const defer = this._defer = new Deferred()
        executor(defer.resolve.bind(defer), defer.reject.bind(defer), fn => {
            assert('onCancel argument', 'function', fn)
            this._cancelHandlers.push(fn)
        })
    }

    public then<TR1= T, TR2= never> (onFulfilled?: OnFulfilledFn<T,TR1>, onRejected?: OnRejectedFn<TR2>) {
        return this._defer.promise.then(onFulfilled, onRejected)
    }

    public catch<TR> (onRejected: OnRejectedFn<TR>) {
        return this._defer.promise.catch(onRejected)
    }

    public pipe<TR1= T, TR2= never> (onFulfilled?: OnFulfilledFn<T,TR1>, onRejected?: OnRejectedFn<TR2>) {
        if (onFulfilled) assert('onFulfilled', 'function', onFulfilled)
        if (onRejected) assert('onRejected', 'function', onRejected)

        const promise = new PCancel<TR1 | TR2>((resolve, reject, onCancel) => {
            onCancel(this.cancel.bind(this))
            this._defer.promise.then(
                val => {
                    if (promise.isCanceled) return
                    resolve((onFulfilled ? onFulfilled(val) : val) as TR1)
                },
                err => {
                    if (promise.isCanceled) return
                    if (onRejected) {
                        resolve(onRejected(err))
                    } else {
                        reject(err)
                    }
                })
        })
        return promise
    }

    public finally (onFinally?: OnFinallyFn) {
        if (onFinally) assert('onFinally', 'function', onFinally)
        return this.then(
            val => Promise.resolve(onFinally && onFinally()).then(() => val),
            err => Promise.resolve(onFinally && onFinally()).then(() => { throw err })
        )
    }

    get isCanceled () {
        return this._isCanceled
    }

    public cancel (reason?: string) {
        if (this._defer.isCompleted || this.isCanceled) return
        this._isCanceled = true

        try {
            this._cancelHandlers.forEach(fn => fn())
        } catch (err) {
            this._defer.reject(err)
        }

        if (!this._defer.isCompleted) this._defer.reject(new CancelError(reason))
    }
}

export default PCancel
