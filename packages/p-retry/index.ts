import PCancel from '@byungi/p-cancel'
import { CancellablePromise, isCancellable } from '@byungi/promise-helpers'

export { CancelError } from '@byungi/p-cancel'

export const pRetry = <T>(runner: () => PromiseLike<T> | CancellablePromise<T>, { retries = 1, interval = 0 } = {}) =>
    new PCancel((resolve, reject, onCancel) => {
        let promise: PromiseLike<T> | CancellablePromise<T>
        let timer: ReturnType<typeof setTimeout>
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
