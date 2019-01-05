import {
    OnFinallyFn,
    OnFulfilledFn,
    OnRejectedFn,
    RejectFn,
    ResolveFn
} from '@byungi/promise-types'
import Deferred from 'p-state-defer'

type CancelHandler = () => void
type AddCancelHandler = (fn: CancelHandler) => void

class CancelError extends Error {
    constructor (reason?: string) {
        super(reason || '[p-cancel] promise cancelled.')
        if (Object.setPrototypeOf) Object.setPrototypeOf(this, CancelError.prototype)
    }
}

class PCancel<T> {
    public static CancelError = CancelError
    public static default = PCancel

    private _isCanceled = false
    private _defer: Deferred<T>
    private _cancelHandlers: CancelHandler[] = []

    constructor (executor: (resolve: ResolveFn<T>, reject: RejectFn, onCancel: AddCancelHandler) => void) {
        const defer = this._defer = new Deferred()
        this.cancel = this.cancel.bind(this)
        executor(defer.resolve.bind(defer), defer.reject.bind(defer), fn => this._cancelHandlers.push(fn))
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
        return this.then(
            val => (onFinally && onFinally(), val),
            err => (onFinally && onFinally(), Promise.reject(err))
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

        if (!this._defer.isCompleted) this._defer.reject(new PCancel.CancelError(reason))
    }
}

export = PCancel
