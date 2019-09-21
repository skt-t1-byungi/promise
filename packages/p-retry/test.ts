import test from 'ava'
import pRetry from '.'

const m = (tries: number) => async () => { if (tries--) throw new Error('retry') }

test('trier test', async t => {
    const try1 = m(1)
    await t.throwsAsync(try1())
    await t.notThrowsAsync(try1())

    const try2 = m(2)
    await t.throwsAsync(try2())
    await t.throwsAsync(try2())
    await t.notThrowsAsync(try2())
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
