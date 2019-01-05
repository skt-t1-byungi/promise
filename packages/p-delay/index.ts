import { ResolveFn } from '@byungi/promise-types'

interface DelayPromise extends Promise<void> {
    clear (): void
}

export const pDelay = (ms: number) => {
    let resolve!: ResolveFn<void>
    const p = (new Promise<void>((_resolve) => resolve = _resolve) as DelayPromise)
    let timerId: number | null = setTimeout(resolve, ms)
    p.clear = () => {
        if (!timerId) return
        timerId = null
        resolve()
    }
    return p
}

export default pDelay
