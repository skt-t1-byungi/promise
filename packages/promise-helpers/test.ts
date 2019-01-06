import test from 'ava'
import { assert, isCancellable, isThenable } from '.'

test('assert', t => {
    const txt = (name: string, expected: string, type: string) => `Expected "${name}" to be of type ${expected}, but "${type}".`

    t.throws(() => assert('aaa', 'string', 1), txt('aaa', 'string', 'number'))
    t.throws(() => assert('bbb', 'function', 1), txt('bbb', 'function', 'number'))
    t.throws(() => assert('ccc', 'number', {}), txt('ccc', 'number', 'object'))
    t.notThrows(() => assert('aaa', 'string', '1'))
    t.notThrows(() => assert('aaa', 'function', () => { return }))
    t.notThrows(() => assert('aaa', 'object', {}))
})

test('isThenable', t => {
    t.true(isThenable(new Promise(() => { return })))
    t.false(isThenable({}))
})

test('isCancelable', t => {
    const p = new Promise(() => { return })
    t.false(isCancellable(p))
    t.false(isCancellable({ cancel () { return } }))
    t.true(isCancellable(Object.assign(p, { cancel () { return } })))
})
