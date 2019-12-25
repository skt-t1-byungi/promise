import { Executor, OnRejected, OnFulfilled, OnFinally } from '@byungi/promise-helpers'

export class PClass<T> {
    private _promise: Promise<T>

    constructor (executor: Executor<T>) {
        this._promise = new Promise(executor)
    }

    get originalPromise () {
        return this._promise
    }

    then<TR1= T, TR2= never> (onfulfilled?: OnFulfilled<T, TR1> | null, onrejected?: OnRejected<TR2> | null) {
        return this._promise.then(onfulfilled, onrejected)
    }

    catch<TR = never> (onrejected?: OnRejected<TR> | null) {
        return this._promise.catch(onrejected)
    }

    finally (onfinally?: OnFinally | null) {
        return this._promise.finally(onfinally)
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PClass<T> extends Promise<T>{}

export default PClass
