import test from 'ava'
import pDelay from '.'

const m = () => {
    const start = Date.now()
    return (expected: number, range: number) => range >= Math.abs(expected - (Date.now() - start))
}

test('p-delay', async t => {
    const end = m()
    await pDelay(100)
    t.true(end(100, 30))
})

test('clear', async t => {
    const end = m()
    const p = pDelay(200)
    t.pass()
    await pDelay(100)
    p.clear()
    await p
    t.true(end(100, 30))
})
