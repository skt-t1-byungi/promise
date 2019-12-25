import { assert, OnFulfilled, OnRejected, Rejector, Resolver } from '@byungi/promise-helpers'
import PClass from '@byungi/p-class'

type Canceler = () => void
type PCancelExecutor<T> = (resolve: Resolver<T>, reject: Rejector, onCancel: (fn: Canceler) => void) => void

export class CancelError extends Error {
     readonly isCanceled = true

     constructor (reason = 'promise was canceled.') {
         super(reason)
         this.name = 'CancelError'
     }
}

export class PCancel<T> extends PClass<T> {
    private _isPending: boolean
    private _isCanceled: boolean
    private _cancelers: Canceler[]
    private _reject: Rejector

    constructor (executor: PCancelExecutor<T>) {
        let _reject: any
        const _cancelers: Canceler[] = []

        super((resolve, reject) => {
            _reject = reject

            executor(
                value => {
                    this._isPending = false
                    resolve(value)
                },
                reason => {
                    this._isPending = false
                    reject(reason)
                },
                canceler => {
                    assert('canceler', 'function', canceler)
                    _cancelers.push(canceler)
                }
            )
        })

        this._reject = _reject
        this._isPending = true
        this._isCanceled = false
        this._cancelers = _cancelers
    }

    get isCanceled () {
        return this._isCanceled
    }

    cancel (reason?: any) {
        if (!this._isPending || this._isCanceled) return
        this._isCanceled = true

        try {
            this._cancelers.forEach(canceler => canceler())
        } catch (err) {
            this._reject(err)
        }

        this._reject(new CancelError(reason))
    }

    pipe<TR1= T, TR2= never> (onfulfilled?: OnFulfilled<T, TR1>, onrejected?: OnRejected<TR2>) {
        if (onfulfilled) assert('onfulfilled', 'function', onfulfilled)
        if (onrejected) assert('onrejected', 'function', onrejected)

        return new PCancel<TR1 | TR2>((resolve, reject, onCancel) => {
            onCancel(() => this.cancel())

            this.then(
                val => {
                    if (this._isCanceled) return
                    resolve((onfulfilled ? onfulfilled(val) : val) as TR1)
                },
                err => {
                    if (this._isCanceled) return
                    if (onrejected) {
                        resolve(onrejected(err))
                    } else {
                        reject(err)
                    }
                })
        })
    }
}

export default PCancel
