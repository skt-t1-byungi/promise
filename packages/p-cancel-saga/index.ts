import PCancel from '@byungi/p-cancel'
import { isThenable, isCancellable } from '@byungi/promise-helpers'

export { CancelError } from '@byungi/p-cancel'
type SagaFunc<Args extends any[], R> = (...args: Args) => Generator<any, R>|AsyncGenerator<any, R>

export function factory <Args extends any[], R> (saga: SagaFunc<Args, R>) {
    return (...args: Args) => new PCancel<R>((resolve, reject, onCancel) => {
        const iter = saga(...args)
        let runningPromise: PromiseLike<any>|null = null
        let isCanceled = false

        onCancel(() => {
            isCanceled = true
            if (isCancellable(runningPromise)) runningPromise.cancel()
            iter.return(undefined as any)
        })

        function next (arg?: any) {
            Promise.resolve(iter.next(arg)).then(onResolved, reject)
        }

        function onResolved (res: IteratorResult<any>) {
            if (isCanceled) {
                if (isCancellable(res.value)) {
                    res.value.then(undefined, noop) // for prevent global `UnhandledRejection`.
                    res.value.cancel()
                }
                return
            }
            if (res.done) {
                resolve(res.value)
            } else {
                if (isThenable(res.value)) {
                    (runningPromise = res.value).then(val => !isCanceled && next(val), onRejected)
                } else {
                    next(res.value)
                }
            }
        }

        function onRejected (err: any) {
            if (isCanceled) return
            let thrownRes: ReturnType<typeof iter.throw>
            try {
                thrownRes = Promise.resolve(iter.throw(err))
            } catch {
                thrownRes = Promise.reject(err)
            }
            thrownRes.then(onResolved, reject)
        }

        next()
    })
}

export function pCancelSaga<R> (saga: SagaFunc<[], R>) {
    return factory(saga)()
}

export function silent <R> (saga: SagaFunc<[], R>) {
    const p = pCancelSaga(saga)
    p.catch(noop)
    return p
}

export default pCancelSaga

function noop () {}
