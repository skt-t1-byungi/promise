import test from 'ava'
import { PClass } from '.'

test('inherit', async t => {
    const str = await new (class extends PClass<string> {})(r => r('hello'))
    t.is(str, 'hello')
})
