import test from 'ava'
import PCancel, { CancelError } from './index'

test('basic', async t => {
    t.plan(4)
    const p = new PCancel((_, __, onCancel) => onCancel(() => t.pass()))

    t.false(p.isCanceled)
    p.cancel()
    t.true(p.isCanceled)
    await t.throwsAsync(p, CancelError)
})

test('pipe', async t => {
    t.plan(9)
    const p = new PCancel((_, __, onCancel) => onCancel(() => t.pass()))
    const np = p.pipe(() => undefined)
    const npp = np.pipe(() => undefined, () => t.fail())

    t.false(p.isCanceled)
    t.false(np.isCanceled)
    t.false(npp.isCanceled)
    npp.cancel()
    t.true(p.isCanceled)
    t.true(np.isCanceled)
    t.true(npp.isCanceled)
    await t.throwsAsync(np)
    await t.throwsAsync(npp)
})

test('An error should not be propagated if catch by a pipe.', async t => {
    t.plan(2)
    const p = new PCancel((_, reject) => setTimeout(reject, 0))
    const np = p.pipe(() => void 0, () => t.pass())
    await t.notThrowsAsync(np)
})

test('finally', async t => {
    t.plan(2)
    const p = new PCancel((_, __, onCancel) => onCancel(() => undefined))
    p.cancel()
    await t.throwsAsync(p.finally(() => t.pass()))
})
