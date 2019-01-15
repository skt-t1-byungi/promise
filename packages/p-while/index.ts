import PCancel from '@byungi/p-cancel'
import pDelay from '@byungi/p-delay'
import { isCancellable } from '@byungi/promise-helpers'

export { CancelError } from '@byungi/p-cancel'

type Param<T> = (() => T) | (() => PromiseLike<T>) | PromiseLike<T> | T

export const ensurePromiseReturn = <T>(fn: Param<T>) => () => {
    // Function intersections issue : https://github.com/Microsoft/TypeScript/issues/26970
    return Promise.resolve(typeof fn === 'function' ? (fn as (() => T))() : fn)
}

class PWhile<T1 extends boolean, T2> extends PCancel<T2 | null> {
    private _prevResult: T2 | null = null

    constructor (condition: Param<T1>, action: Param<T2>, { interval }: {interval: number}) {
        super((resolve, reject, onCancel) => {
            const wrappedCondition = ensurePromiseReturn(condition)
            const wrappedAction = ensurePromiseReturn(action)

            let currPromise: PromiseLike<any>
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
                    if (!isContinue) return resolve(this._prevResult)
                    run(wrappedAction(), result => {
                        this._prevResult = result
                        run(pDelay(interval), runner)
                    })
                })

            runner()
        })
    }

    public break () {
        this._defer.resolve(this._prevResult)
    }
}

export const pWhile = <T1 extends boolean, T2>(
    condition: Param<T1>,
    action: Param<T2>,
    { interval = 0 } = {}
) => new PWhile(condition, action, { interval })

export default pWhile
