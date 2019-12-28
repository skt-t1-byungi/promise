# @byungi/p-cancel-saga
A cancelable promise with saga.

## Example
```js
import pCancelSaga, { IS_CANCELED } from '@byungi/p-cancel-saga'

const promise = pCancelSaga(function * () {
    try {
        const result1 = yield async100msTask()
        console.log('The 1st task is done.')

        const result2 = yield async100msTask()
        console.log('The 2nd task is done.')

        return result2
    } finally {
        if (yield IS_CANCELED) {
            console.log('Canceled!')
        }
    }
})

delay(150).then(() => {
    promise.cancel()
    // => "The 1st task is done."
    // => "Canceled!"
    // (`The 2nd task is done.` is not print.)
})
```

## API
### pCancelSaga(saga)
Create a cancelable promise using a `saga`(generator).
Similar to [p-cancel](https://github.com/skt-t1-byungi/promise/tree/master/packages/p-cancel) but without the hassle of checking to cancel after asynchronous task.

#### Example
###### Before
```js
const promise = new PCancel((resolve, reject, onCancel) => {
    onCancel(() => console.log('Canceled!'))

    async100msTask().then(result1 => {
        if (!promise.isCanceled) {
            console.log('The 1st task is done.')

            async100msTask().then(result2 => {
                if (!promise.isCanceled) {
                    console.log('The 2nd task is done.')
                    resolve(result2)
                }

            }).catch(reject)
        }
    }).catch(reject)
})
```

###### After
```js
const promise = pCancelSaga(function * () {
    try {
        const result1 = yield async100msTask()
        console.log('The 1st task is done.')

        const result2 = yield async100msTask()
        console.log('The 2nd task is done.')

        return result2
    } finally {
        if (yield IS_CANCELED) {
            console.log('Canceled!')propagation
        }
    }
})
```
##### Cancel propagation
```js
const parentPromise = new PCancel((resolve, reject, onCancel) => {
    onCancel(() => {
        console.log('Cancel parent')
    })
    /* ... */
})

const childPromise = pCancelSaga(function * () {
    try {
        const result = yield parentPromise
        /* ... */
    } finally {
        if (yield IS_CANCELED) {
            console.log('Cancel child')
        }
    }
})

childPromise.cancel()
// => Cancel child
// => Cancel parent
```

### promise.cancel([reason])
Cancel the flow in `saga` and throw a `CancelError` to promise.

### promise.isCanceled
Returns whether the promise is canceled.

### promise.pipe(onFulfilled, onRejected)
Similar to `then` but can propagate `cancel` to the upper promise.

### IS_CANCELED
When `yield` in `saga`, this symbol returns whether the promise is canceled.

### factory(saga)
Returns a reusable function using `saga` with arguments.

```js
import { factory, IS_CANCELED } from '@byungi/p-cancel-saga'

const asyncTaskFunction = factory(function * (url, params) {
    try {
        const result = yield apiGet(url, params)
        return result
    } finally {
        if (yield IS_CANCELED) {
            /* ... */
        }
    }
})

const promise = asyncTaskFunction('/data', { id: 1 })
```

### silent(saga)
If it's just a cancelable task (not a promise), `CancelError` is bothersome. This function does not propagate an error.

```js
import { silent, IS_CANCELED } from '@byungi/p-cancel-saga'

const task = silent(function * () {
    while (true) {
        yield delay(1000)
        yield asyncTask()
    }
})

task.cancel() // => No `unhandledRejection` occurs.
```

## Tips
### Type inference of yield promise in saga
```ts
const promise = pCancelSaga(function * () {
    const data = yield getDataAsync() // => "data" type is `any` or `unknown`.
    /* ... */
})
```
In TypeScript, type inference of yield promise in generator functions is difficult. Specify the type or use the provided helper type(`AsyncResult<F>`).

```ts
import pCancelSaga, { AsyncResult } from '@byungi/p-cancel-saga'

const promise = pCancelSaga(function * () {
    const data = (yield getDataAsync()) as {value: string}

    // or
    const data = (yield getDataAsync()) as AsyncResult<typeof getDataAsync>

    /* ... */
})
```

## License
MIT
