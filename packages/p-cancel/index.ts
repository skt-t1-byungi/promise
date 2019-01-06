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
        this.cancel = this.cancel.bind(this)
        executor(defer.resolve.bind(defer), defer.reject.bind(defer), fn => {
            assert('onCancel argument', 'function', fn)
            this._cancelHandlers.push(fn)
        })
    }

    public then<TR1= T, TR2= never> (onFulfilled?: OnFulfilledFn<T,TR1>, onRejected?: OnRejectedFn<TR2>) {
        return new PCancel<TR1 | TR2>((resolve, reject, onCancel) => {
            onCancel(this.cancel)
            this._defer.promise.then(onFulfilled, onRejected).then(resolve, reject)
        })
    }

    public catch<TR> (onRejected: OnRejectedFn<TR>) {
        return this.then(undefined, onRejected)
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
