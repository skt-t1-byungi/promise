import test from 'ava'
import pCancelSaga, { CancelError } from '.'
import pDelay from '@byungi/p-delay'

function noop () {}

test('check gene func', t => {
    t.throws(() => pCancelSaga((() => {}) as any))
    t.notThrows(() => pCancelSaga(async function * () {}))
    t.notThrows(() => pCancelSaga(function * () {}))
})

test('basic', async t => {
    t.plan(2)
    const p = pCancelSaga(function * () {
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
    p.catch(noop)
})

test.todo('cancel propagation')
