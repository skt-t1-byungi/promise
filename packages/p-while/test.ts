import test from 'ava'
import pWhile from '.'

const m = () => {
    const start = Date.now()
    return (expected: number, range: number) => range >= Math.abs(expected - (Date.now() - start))
}

test('basic', async t => {
    let calls = 0
    let i = 0

    const result = await pWhile(
        () => ++i < 10,
        () => {
            calls++
            return 'hello'
        }
    )

    t.is(calls, 9)
    t.is(i, 10)
    t.is(result, 'hello')
})

test('cancelable', async t => {
    let i = 0
    const random = Math.trunc(Math.random() * 10)

    const p = pWhile(true, () => {
        if (++i === random) p.cancel(String(random))
    })

    await t.throwsAsync(p, String(random))
    t.is(i, random)
})

test('interval', async t => {
    let i = 0
    let end = m()
    await pWhile(() => i < 10, () => i++)
    t.true(end(0, 50))
    i = 0
    end = m()
    await pWhile(() => i < 10, () => i++, { interval: 30 })
    t.true(end(300, 50))
})

test('break', async t => {
    let i = 0
    const loopPromise = pWhile(() => ++i < 10, () => {
        if (i === 5) loopPromise.break()
        return i
    })

    t.is(i, 1)
    t.is(await loopPromise, 4)
    t.is(i, 5)
})
