import PCancel from '@byungi/p-cancel'
import pDelay from '@byungi/p-delay'
import { isCancellable } from '@byungi/promise-helpers'

type PromiseParam<T> = (() => T) | (() => PromiseLike<T>) | PromiseLike<T> | T

export const ensurePromiseReturn = <T>(fn: PromiseParam<T>) => () => {
    // Function intersections issue : https://github.com/Microsoft/TypeScript/issues/26970
    return Promise.resolve(typeof fn === 'function' ? (fn as (() => T))() : fn)
}

export const pWhile = <T1,T2>(condition: PromiseParam<T1>, action: PromiseParam<T2>, { interval = 0 } = {}) =>
    new PCancel((resolve, reject, onCancel) => {
        const wrappedCondition = ensurePromiseReturn(condition)
        const wrappedAction = ensurePromiseReturn(action)

        let currPromise: PromiseLike<any>
        let prevResult: T2
        let isCanceled = false

        onCancel(() => {
            isCanceled = true
            if (isCancellable(currPromise)) currPromise.cancel()
        })

        const run = <T>(promise: PromiseLike<T>, fn: (result: T) => void) => {
            if (isCanceled) return
            (currPromise = promise).then(fn, reject)
        }

        const runner = () =>
            run(wrappedCondition(), isContinue => {
                if (!isContinue) return resolve(prevResult)
                run(wrappedAction(), result => {
                    prevResult = result
                    run(pDelay(interval), runner)
                })
            })

        runner()
    })

export default pWhile
