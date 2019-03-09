export type Resolver<T> = (value: T | PromiseLike<T>) => void
export type Rejector = (reason?: any) => void
export type OnFulfilled<T,R> = (value: T) => R | PromiseLike<R>
export type OnRejected<T = never> = (reason: any) => T | PromiseLike<T>
export type OnFinally = () => void
export type Executor<T> = (resolve: Resolver<T>, reject: Rejector) => void

export interface CancellablePromise<T> extends PromiseLike<T> {
    cancel (reason?: string): void
}

export function assert (name: string, expected: string, val: any) {
    const type = typeof val
    if (type !== expected) {
        throw new TypeError(`Expected "${name}" to be of type ${expected}, but "${type}".`)
    }
}

export function isThenable<T> (promise: any): promise is PromiseLike<T> {
    return promise && typeof promise.then === 'function'
}

export function isCancellable <T> (promise: any): promise is CancellablePromise<T> {
    return isThenable(promise) && typeof (promise as any).cancel === 'function'
}
