import { ResolveFn } from '@byungi/promise-types'

interface DelayPromise extends Promise<void> {
    clear (): void
}

export const pDelay = (ms: number) => {
    if (typeof ms !== 'number') throw new TypeError(`[p-delay] Expected "ms" to be of type "number".`)

    let resolve!: ResolveFn<void>
    const p = (new Promise<void>((_resolve) => resolve = _resolve) as DelayPromise)
    let timerId: number | null = setTimeout(resolve, ms)
    p.clear = () => {
        if (!timerId) return
        clearTimeout(timerId)
        timerId = null
        resolve()
    }
    return p
}

export default pDelay
