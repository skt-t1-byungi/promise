import { assert, ResolveFn } from '@byungi/promise-helpers'

interface DelayPromise extends Promise<void> {
    clear (): void
}

export const pDelay = (ms: number) => {
    assert('ms', 'number', ms)

    let resolve!: ResolveFn<void>
    const p = (new Promise<void>((_resolve) => resolve = _resolve) as DelayPromise)
    let timer: number | null = setTimeout(resolve, ms)
    p.clear = () => {
        if (!timer) return
        clearTimeout(timer)
        timer = null
        resolve()
    }
    return p
}

export default pDelay
