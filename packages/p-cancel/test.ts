import test from 'ava'
import PCancel, { CancelError } from '.'

test('promise cancel', async t => {
    t.plan(4)
    const p = new PCancel((_, __, onCancel) => onCancel(() => t.pass()))

    t.false(p.isCanceled)
    p.cancel()
    t.true(p.isCanceled)
    await t.throwsAsync(p, CancelError)
})

test('If the piped promise is canceled, parent is canceled.', async t => {
    t.plan(2)
    const p = new PCancel((_, __, onCancel) => onCancel(() => t.pass()))
    const pp = p.pipe(() => {})
    pp.cancel()
    await t.throwsAsync(pp)
})

test('If the parent is canceled, CancelError is propagated to piped promise.', async t => {
    const p = new PCancel(() => {})
    const pp = p.pipe(() => {})
    p.cancel()
    await t.throwsAsync(pp, 'promise was canceled.')
})

test('Errors caught in the pipe are not propagated.', async t => {
    t.plan(2)
    const p = new PCancel((_, reject) => setTimeout(reject, 0))
    const pp = p.pipe(undefined, () => t.pass())
    await t.notThrowsAsync(pp)
})

test('finally', async t => {
    t.plan(2)
    const p = new PCancel((_, __, onCancel) => onCancel(() => {}))
    p.cancel()
    await t.throwsAsync(p.finally(() => t.pass()))
})

test('immediately resolve', async t => {
    const p = new PCancel(resolve => resolve(1))
    t.is(await p, 1)
})
