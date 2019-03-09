import test from 'ava'
import pDefer from '.'

test('resolve', async t => {
    const defer = pDefer<string>()
    defer.resolve('done')
    t.is(await defer.promise, 'done')
})

test('reject', async t => {
    const defer = pDefer<string>()
    defer.reject(new Error('fail'))
    await t.throwsAsync(defer.promise, 'fail')
})
