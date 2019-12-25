import PCancel from '@byungi/p-cancel'
import pDelay from '@byungi/p-delay'
import { isCancellable, Resolver } from '@byungi/promise-helpers'

export { CancelError } from '@byungi/p-cancel'

type Runner<T> = (() => T) | (() => PromiseLike<T>) | T

class PWhile<ConditionResult extends boolean, LoopResult> extends PCancel<LoopResult | undefined> {
    private _prevResult?: LoopResult
    private _resolve: Resolver<LoopResult | undefined>

    constructor (condition: Runner<ConditionResult>, action: Runner<LoopResult>, { interval = 0 }: {interval?: number} = {}) {
        let _resolve: any
        let loop!: () => void

        super((resolve, reject, onCancel) => {
            _resolve = resolve
            let runningPromise: PromiseLike<any>

            onCancel(() => {
                if (isCancellable(runningPromise)) runningPromise.cancel()
            })

            const run = <T>(promise: Runner<T>, then: (result: T) => void) => {
                if (this.isCanceled) return
                if (typeof promise === 'function') promise = (promise as () => T)();
                (runningPromise = Promise.resolve(promise)).then(then, reject)
            }

            loop = () => {
                run(condition, isContinue => {
                    if (!isContinue) return resolve(this._prevResult)
                    run(action, result => {
                        this._prevResult = result
                        run(pDelay(interval), loop)
                    })
                })
            }
        })

        this._prevResult = undefined
        this._resolve = _resolve

        loop()
    }

    break () {
        this._resolve(this._prevResult)
    }
}

export function pWhile <T1 extends boolean, T2> (condition: Runner<T1>, action: Runner<T2>, { interval = 0 } = {}) {
    return new PWhile(condition, action, { interval })
}

export default pWhile
