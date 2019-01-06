import { CancellablePromise } from '@byungi/promise-types'

export class TimeoutError extends Error {
    public readonly isTimeout = true

    constructor (reason = '[p-cancel] promise timeout.') {
        super(reason)
    }
}

export const pTimeout = <T>(promise: PromiseLike<T> | CancellablePromise<T>, ms: number) =>
    new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            const err = new TimeoutError()
            if (isCancellable(promise)) promise.cancel(err.message)
            reject(err)
        }, ms)

        promise.then(
            res => {
                clearTimeout(timer)
                resolve(res)
            },
            err => {
                clearTimeout(timer)
                reject(err)
            })
    })

export default pTimeout

function isCancellable <T> (promise: any): promise is CancellablePromise<T> {
    return promise && typeof promise.cancel === 'function'
}