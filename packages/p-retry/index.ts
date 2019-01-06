import PCancel from '@byungi/p-cancel'
import { CancellablePromise } from '@byungi/promise-helpers'

export const pRetry = <T>(runner: () => PromiseLike<T> | CancellablePromise<T> , { retries = 0, interval = 0 } = {}) =>
    new PCancel((resolve, reject, onCancel) => {
        let promise: PromiseLike<T> | CancellablePromise<T>
        let timer: number
        let isCanceled = false

        onCancel(() => {
            isCanceled = true
            clearTimeout(timer)
            if (isCancellable(promise)) promise.cancel()
        })

        const attempt = () => {
            (promise = runner()).then(resolve, err => {
                if (isCanceled) return
                if (retries--) {
                    timer = setTimeout(attempt, interval)
                } else {
                    reject(err)
                }
            })
        }

        attempt()
    })

export default pRetry

function isCancellable <T> (promise: any): promise is CancellablePromise<T> {
    return promise && typeof promise.cancel === 'function'
}
