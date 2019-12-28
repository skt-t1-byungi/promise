import test from 'ava'
import PCancel from '@byungi/p-cancel'
import { silent, pCancelSaga, AsyncResult, IS_CANCELED } from '.'
import pDelay from '@byungi/p-delay'

test('check saga function', t => {
    t.throws(() => silent(false as any))
    t.throws(() => silent((function () {}) as any))
    t.throws(() => silent((async function * () {}) as any))
    t.notThrows(() => silent(function * () {}))
})

test('IS_CANCELED', t => {
    t.plan(2)
    const p = silent(function * () {
        try {
            t.false(yield IS_CANCELED)
            yield pDelay(0)
        } finally {
            t.true(yield IS_CANCELED)
        }
    })
    p.cancel()
})

test('stop saga flow', async t => {
    t.plan(2)
    const p = silent(function * () {
        try {
            yield pDelay(100)
            t.pass()
            yield pDelay(100)
            t.fail()
        } finally {
            if (yield IS_CANCELED) t.pass()
        }
    })
    await pDelay(150)
    p.cancel()
})

test('yield after cancel', t => {
    const p = silent(function * () {
        try {
            yield 1
        } finally {
            t.is(yield 2, 2)
        }
    })
    p.cancel()
})

test('return value', async t => {
    t.plan(4)

    const p1 = pCancelSaga(function * () { return 1 })
    t.is(await p1, 1)

    const p2 = pCancelSaga(function * () {
        t.is(yield 1, 1)
        t.is(yield Promise.resolve(2), 2)
        return Promise.resolve(3)
    })
    t.is(await p2, 3)
})

test('saga error', async t => {
    const p = silent(function * () {
        throw new Error('sagaErr')
        t.fail()
    })
    await t.throwsAsync(p, 'sagaErr')
})

test('yielded promise error', async t => {
    const p = pCancelSaga(function * () {
        yield Promise.reject(new Error('yieldPromiseErr'))
        t.fail()
    })
    await t.throwsAsync(p, 'yieldPromiseErr')
})

test('cancel propagation', async t => {
    const p = silent(function * () {
        yield new PCancel((_, __, onCancel) => {
            onCancel(() => t.pass())
        })
        t.fail()
    })
    await pDelay(0)
    p.cancel()
})

test.cb('cancel propagation (immediately)', t => {
    t.plan(1)
    const p = silent(function * () {
        try {
            yield new PCancel((_, __, onCancel) => {
                onCancel(() => t.pass())
            })
            t.fail()
        } finally {
            if (yield IS_CANCELED) t.end()
        }
    })
    p.cancel()
})

test.skip('AsyncResult type infer', t => {
    const asyncFn = () => Promise.resolve(1)
    silent(function * () {
        let n = (yield asyncFn()) as AsyncResult<typeof asyncFn>
        t.truthy(n++)
    })
})
