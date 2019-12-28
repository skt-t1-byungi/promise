import pDelay from '@byungi/p-delay'
import pTimeout from '@byungi/p-timeout'
import { CancelablePromise } from '@byungi/promise-helpers'
import test from 'ava'

test('test', async t => {
    await t.notThrowsAsync(pTimeout(pDelay(200), 250))
    await t.throwsAsync(pTimeout(pDelay(200), 150))
})

test('promise clear if throws', async t => {
    let calls = 0
    const p: CancelablePromise<void> = pDelay(200) as any
    p.cancel = () => calls++

    await t.throwsAsync(pTimeout(p, 150))
    t.is(calls, 1)
})
