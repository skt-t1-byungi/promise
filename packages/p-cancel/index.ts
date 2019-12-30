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
    private _isPendingRef: {value: boolean}
    private _isCanceled: boolean
    private _cancelers: Canceler[]
    private _reject: Rejector

    constructor (executor: PCancelExecutor<T>) {
        let _reject: any
        const _cancelers: Canceler[] = []
        const isPendingRef = { value: true }

        super((resolve, reject) => {
            _reject = reject

            executor(
                value => {
                    isPendingRef.value = false
                    resolve(value)
                },
                reason => {
                    isPendingRef.value = false
                    reject(reason)
                },
                canceler => {
                    assert('canceler', 'function', canceler)
                    _cancelers.push(canceler)
                }
            )
        })

        this._reject = _reject
        this._isCanceled = false
        this._cancelers = _cancelers
        this._isPendingRef = isPendingRef
    }

    get isCanceled () {
        return this._isCanceled
    }

    cancel (reason?: any) {
        if (!this._isPendingRef.value || this._isCanceled) return
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
                    resolve((onfulfilled ? onfulfilled(val) : val) as TR1)
                },
                err => {
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
