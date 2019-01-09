import PCancel from '@byungi/p-cancel'
import pDelay from '@byungi/p-delay'
import { isCancellable } from '@byungi/promise-helpers'

type ReturnPromiseFn<T> = (() => T) | PromiseLike<T> | T

export const ensureReturnsPromise = <T>(fn: ReturnPromiseFn<T>) => () => {
    // Function intersections issue : https://github.com/Microsoft/TypeScript/issues/26970
    return Promise.resolve(typeof fn === 'function' ? (fn as (() => T))() : fn)
}

export const pWhile = <T1,T2>(condition: ReturnPromiseFn<T1>, action: ReturnPromiseFn<T2>, { interval = 0 } = {}) =>
    new PCancel((resolve, reject, onCancel) => {
        const wrapCondition = ensureReturnsPromise(condition)
        const wrapAction = ensureReturnsPromise(action)

        let currPromise: PromiseLike<any>
        let prevResult: T2
        let isCanceled = false

        onCancel(() => {
            isCanceled = true
            if (isCancellable(currPromise)) currPromise.cancel()
        })

        const run = <T>(promise: PromiseLike<T>, fn: (result: T) => void) => {
            if (isCanceled) return
            currPromise = promise
            currPromise.then(fn, reject)
        }

        const runner = () =>
            run(wrapCondition(), isContinue => {
                if (!isContinue) return resolve(prevResult)
                run(wrapAction(), result => {
                    prevResult = result
                    run(pDelay(interval), runner)
                })
            })

        runner()
    })

export default pWhile
