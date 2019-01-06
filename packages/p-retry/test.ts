import test from 'ava'
import pRetry from '.'

const m = (tries: number) => () => Promise.resolve().then(() => {
    if (tries--) throw new Error('retry')
})

test('trier test', async t => {
    const trier1 = m(1)
    await t.throwsAsync(trier1())
    await t.notThrowsAsync(trier1())

    const trier2 = m(2)
    await t.throwsAsync(trier2())
    await t.throwsAsync(trier2())
    await t.notThrowsAsync(trier2())
})

test('basic', async t => {
    const p1 = pRetry(m(2), { retries: 1 })
    await t.throwsAsync(p1, 'retry')
    const p2 = pRetry(m(2), { retries: 2 })
    await t.notThrowsAsync(p2)
})

test('cancelable', async t => {
    const p = pRetry(m(2), { retries: 10 })
    p.cancel('cancel')
    await t.throwsAsync(p, 'cancel')
})
