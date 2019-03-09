import { assert, Resolver } from '@byungi/promise-helpers'

interface DelayPromise extends Promise<void> {
    clear (): void
}

export const pDelay = <T extends boolean | undefined>(
    ms: number,
    { clearable= false }: {clearable?: T} = {}
): T extends true ? DelayPromise : Promise<void> => {
    assert('ms', 'number', ms)

    let resolve!: Resolver<void>
    const p = new Promise<void>((_resolve) => resolve = _resolve)
    let timer: number | null = setTimeout(resolve, ms)

    if (clearable) {
        (p as DelayPromise).clear = () => {
            if (!timer) return
            clearTimeout(timer)
            timer = null
            resolve()
        }
    }

    return (p as any)
}

export default pDelay
