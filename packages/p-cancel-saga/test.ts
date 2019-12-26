import test from 'ava'
import PCancel from '@byungi/p-cancel'
import { silent, pCancelSaga } from '.'
import pDelay from '@byungi/p-delay'

test('Stop flow of saga', async t => {
    t.plan(2)
    const p = silent(function * () {
        try {
            yield pDelay(100)
            t.pass()
            yield pDelay(100)
            t.fail()
        } finally {
            if (p.isCanceled) t.pass()
        }
    })
    await pDelay(150)
    p.cancel()
})

test('no promise yield', async t => {
    t.plan(4)

    const p1 = pCancelSaga(function * () { return 1 })
    t.is(await p1, 1)

    const p2 = pCancelSaga(function * () {
        t.is(yield 1, 1)
        t.is(yield 2, 2)
        return 3
    })
    t.is(await p2, 3)
})

test('async error in saga', async t => {
    const p = silent(async function * () {
        await Promise.reject(new Error('asyncErr'))
        t.fail()
    })
    await t.throwsAsync(p, 'asyncErr')
})

test('yielded promise error', async t => {
    const p = pCancelSaga(function * () {
        yield Promise.reject(new Error('yieldPromiseErr'))
        t.fail()
    })
    await t.throwsAsync(p, 'yieldPromiseErr')
})

test('cancellation propagation', async t => {
    const p = silent(function * () {
        yield new PCancel((_, __, onCancel) => {
            onCancel(() => t.pass())
        })
        t.fail()
    })
    await pDelay(50)
    p.cancel()
})

test.cb('If cancel immediately, cancellation propagation', t => {
    const p = silent(function * () {
        yield new PCancel((_, __, onCancel) => {
            onCancel(() => t.end())
        })
        t.fail()
    })
    p.cancel()
})
