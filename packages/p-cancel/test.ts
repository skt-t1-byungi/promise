import test from 'ava'
import PCancel from './index'

test('basic', async t => {
    t.plan(4)
    const p = new PCancel((resolve, reject, onCancel) => onCancel(() => t.pass()))

    t.false(p.isCanceled)
    p.cancel()
    t.true(p.isCanceled)
    await t.throwsAsync(p, PCancel.CancelError)
})

test('chain', async t => {
    t.plan(5)
    const p = new PCancel((resolve, reject, onCancel) => onCancel(() => t.pass()))
    const np = p.then(() => undefined)

    t.false(np.isCanceled)
    np.cancel()
    t.true(p.isCanceled)
    t.true(np.isCanceled)
    await t.throwsAsync(np)
})

test('finally', async t => {
    t.plan(2)
    const p = new PCancel((resolve, reject, onCancel) => onCancel(() => undefined))
    p.cancel()
    await t.throwsAsync(p.finally(() => t.pass()))
})
