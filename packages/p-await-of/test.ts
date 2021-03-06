import test from 'ava'
import of from '.'

test('await-of', async t => {
    const [res1, err1] = await of(Promise.resolve('test'))
    t.is(res1, 'test')
    t.falsy(err1)

    // eslint-disable-next-line prefer-promise-reject-errors
    const [res2, err2] = await of(Promise.reject('test'))
    t.falsy(res2)
    t.is(err2, 'test')
})

test('handling empty error', async t => {
    // eslint-disable-next-line prefer-promise-reject-errors
    const [, err] = await of(Promise.reject())
    t.truthy(err)
})
