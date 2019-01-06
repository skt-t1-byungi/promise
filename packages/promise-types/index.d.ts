export type ResolveFn<T> = (value: T | PromiseLike<T>) => void
export type RejectFn = (reason?: any) => void
export type OnFulfilledFn<T,R> = (value: T) => R | PromiseLike<R>
export type OnRejectedFn<T = never> = (reason: any) => T | PromiseLike<T>
export type OnFinallyFn = () => void

export interface CancellablePromise<T> extends PromiseLike<T> {
    cancel (reason?:string): void
}
