import test from 'ava'
import PCancel, { CancelError } from './index'

test('basic', async t => {
    t.plan(4)
    const p = new PCancel((resolve, reject, onCancel) => onCancel(() => t.pass()))

    t.false(p.isCanceled)
    p.cancel()
    t.true(p.isCanceled)
    await t.throwsAsync(p, CancelError)
})

test('pipe', async t => {
    t.plan(6)
    const p = new PCancel((resolve, reject, onCancel) => onCancel(() => t.pass()))
    const np = p.pipe(() => undefined)
    const npp = np.pipe(() => undefined, () => t.fail())

    t.false(np.isCanceled)
    npp.cancel()
    t.true(p.isCanceled)
    t.true(np.isCanceled)
    await t.throwsAsync(np)
    await t.throwsAsync(npp)
})

test('finally', async t => {
    t.plan(2)
    const p = new PCancel((resolve, reject, onCancel) => onCancel(() => undefined))
    p.cancel()
    await t.throwsAsync(p.finally(() => t.pass()))
})
