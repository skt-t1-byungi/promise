import PCancel from '@byungi/p-cancel'
import { CancelablePromise, isCancelable } from '@byungi/promise-helpers'

export { CancelError } from '@byungi/p-cancel'

export const pRetry = <T>(runner: () => PromiseLike<T> | CancelablePromise<T>, { retries = 1, interval = 0 } = {}) =>
    new PCancel<T>((resolve, reject, onCancel) => {
        let promise: PromiseLike<T> | CancelablePromise<T>
        let timer: ReturnType<typeof setTimeout>
        let isCanceled = false

        onCancel(() => {
            isCanceled = true
            clearTimeout(timer)
            if (isCancelable(promise)) promise.cancel()
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
