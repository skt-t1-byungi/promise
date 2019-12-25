# @byungi/p-cancel-saga
A cancelable promise with saga.

## Example
```js
import pCancelSaga from '@byungi/p-cancel-saga'

const promise = pCancelSaga(function * () {
    try {
        const result1 = yield async500msTask()
        console.log('The 1st task is done.')

        const result2 = yield async500msTask()
        console.log('The 2nd task is done.')

        return result2
    } finally {
        if (promise.isCanceled) {
            console.log('Canceled!')
        }
    }
})

delay(700).then(() => {
    promise.cancel()
    // => "The 1st task is done."
    // => "Canceled!"
    // (`The 2nd task is done.` is not print.)
})
```

## API
### pCancelSaga(saga)
Create a promise that can be canceled with a `saga`(generator).
Similar to [p-cancel](https://github.com/skt-t1-byungi/promise/tree/master/packages/p-cancel) but without the hassle of checking to cancel after asynchronous task.

##### Before
```js
const promise = new PCancel((resolve, reject, onCancel) => {
    onCancel(() => console.log('Canceled!'))

    async500msTask().then(result1 => {
        if (!promise.isCanceled) {
            console.log('The 1st task is done.')

            async500msTask().then(result2 => {
                if (!promise.isCanceled) {
                    console.log('The 2nd task is done.')
                    resolve(result2)
                }
            }).catch(reject)
        }
    }).catch(reject)
})
```

##### After
```js
const promise = pCancelSaga(function * () {
    try {
        const result1 = yield async500msTask()
        console.log('The 1st task is done.')

        const result2 = yield async500msTask()
        console.log('The 2nd task is done.')

        return result2
    } finally {
        if (promise.isCanceled) {
            console.log('Canceled!')
        }
    }
})
```

### promise.cancel([reason])
Cancel the flow in `saga` and throw a `CancelError` to promise.

### promise.isCanceled
Returns whether the promise is canceled.

### promise.pipe(onFulfilled, onRejected)
Similar to `then` but can propagate `cancel` to the upper promise.

## License
MIT
