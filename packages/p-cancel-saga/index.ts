import PCancel from '@byungi/p-cancel'
import { isThenable, isCancellable, assert } from '@byungi/promise-helpers'

export { CancelError } from '@byungi/p-cancel'

export default pCancelSaga

export function pCancelSaga<T> (saga: () => Generator<any, T>|AsyncGenerator<any, T>) {
    assert('saga', 'function', saga)

    const iter = saga()
    if (typeof iter.next !== 'function') {
        throw new TypeError('"saga" is not a generator function.')
    }

    return new PCancel<T>((resolve, reject, onCancel) => {
        let pRes: ReturnType<typeof iter.next>
        let isCanceled = false

        onCancel(() => {
            isCanceled = true
            if (isCancellable(pRes)) pRes.cancel()
            iter.return(undefined as any)
        })

        function next (arg?: any) {
            pRes = iter.next(arg)
            if (!isThenable(pRes)) pRes = Promise.resolve(pRes)
            pRes.then(onResolved, reject)
        }

        function onResolved (res: IteratorResult<any>) {
            if (isCanceled) return
            if (res.done) {
                resolve(res.value)
            } else {
                if (isThenable(res.value)) {
                    res.value.then(val => !isCanceled && next(val), onRejected)
                } else {
                    next(res.value)
                }
            }
        }

        function onRejected (err: any) {
            if (!isCanceled) Promise.resolve(iter.throw(err)).then(onResolved, reject)
        }

        next()
    })
}
