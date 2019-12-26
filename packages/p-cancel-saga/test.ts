import test from 'ava'
import PCancel from '@byungi/p-cancel'
import { silent } from '.'
import pDelay from '@byungi/p-delay'

function noop () {}

test('stop', async t => {
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

test.only('cancel propagation', t => {
    const p = silent(function * () {
        yield new PCancel((_, __, onCancel) => {
            onCancel(() => t.pass())
        })
    })
    p.cancel()
})
