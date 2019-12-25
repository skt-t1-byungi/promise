import { CancellablePromise, isCancellable } from '@byungi/promise-helpers'

export class TimeoutError extends Error {
     readonly isTimeout = true

     constructor (reason = 'promise timeout.') {
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
