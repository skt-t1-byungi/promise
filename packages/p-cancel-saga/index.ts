import PCancel from '@byungi/p-cancel'
import { isThenable, isCancellable } from '@byungi/promise-helpers'
export { CancelError } from '@byungi/p-cancel'

type Saga<Args extends any[], R> = (...args: Args) => Generator<any, R>
type AsyncFn<Args extends any[], R=any> = (...args: Args) => PromiseLike<R>

export type AsyncResult<F extends AsyncFn<any>> = F extends AsyncFn<any, infer R> ? R : never

const IS_CANCELED = typeof Symbol === 'function' ? Symbol('CANCELLED') : {}

export function factory <Args extends any[], R> (saga: Saga<Args, R>) {
    if (!isGenFn(saga)) throw new TypeError('"saga" must be a generator function.')

    return (...args: Args) => new PCancel<R>((resolve, reject, onCancel) => {
        const iter = saga(...args)
        let pRunning: PromiseLike<any>|null = null
        let isCanceled = false

        onCancel(() => {
            isCanceled = true
            if (isCancellable(pRunning)) pRunning.cancel()
            pRunning = null
            const res = iter.return(undefined as any)
            if (!res.done) handle(res)
        })

        function next (arg?: any) {
            let res: IteratorResult<any, R>
            try {
                res = iter.next(arg)
            } catch (err) {
                return reject(err)
            }
            handle(res)
        }

        function throwErr (err: any) {
            let res: IteratorResult<any, R>
            try {
                res = iter.throw(err)
            } catch {
                return reject(err)
            }
            handle(res)
        }

        function handle (res: IteratorResult<any, R>) {
            if (res.done) {
                resolve(res.value)
            } else {
                if (isThenable(res.value)) {
                    (pRunning = res.value).then(
                        val => pRunning === res.value && next(val),
                        err => pRunning === res.value && throwErr(err)
                    )
                } else {
                    next(res.value === IS_CANCELED ? isCanceled : res.value)
                }
            }
        }

        next()
    })
}

export function isCanceled () {
    return IS_CANCELED
}

export function pCancelSaga<R> (saga: Saga<[], R>) {
    return factory(saga)()
}

export function silent <R> (saga: Saga<[], R>) {
    const p = pCancelSaga(saga)
    p.catch(noop)
    return p
}

export default pCancelSaga

function noop () {}

function isGenFn (fn: () => any): fn is GeneratorFunction {
    if (typeof fn !== 'function') return false
    const name = (fn.constructor && fn.constructor.name) || toString.call(fn)
    return name.indexOf('GeneratorFunction') > -1
}
