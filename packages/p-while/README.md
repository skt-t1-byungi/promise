# @byungi/p-while
A promise for an asynchronous while loop.

## Example
```js
import pWhile from '@byungi/p-while'

let tries = 0

const loopPromise = pWhile(
    async () => {
        return (await asyncAlwaysTrue()) && (++tries < 10)
    },
    async () => {
        const jobResult = await asyncJob()

        if(!jobResult) loopPromise.break() // Stop the asynchronous loop.

        return jobResult
    }
)

loopPromise.then(lastJobResult => {
    // Get the last return value.
    // If the action function has never been called, It is undefined.
})
```
## API
### pWhile(condition, action[, options])
A promise for an asynchronous while loop.

#### options
- `interval` - Delay before the next loop. Default is 0.

### promise.break()
Stop the loop and resolve the promise.

### promise.cancel([reason])
Do not retry anymore and throw a `CancelError`.

```js
import pWhile, {CancelError} from '@byungi/p-while'

const loopPromise = pWhile(true, asyncJobInLoop)

setTimeout(()=> loopPromise.cancel(), 100) // After 100ms, the loop stops.

loopPromise.catch(err => {
    console.log(err.isCanceled) // => true
    console.log(err instanceof CancelError) // => true
    console.log(loopPromise.isCanceled) // => true
})
```

### promise.isCanceled
Returns whether the promise is canceled.

### promise.pipe(onFulfilled, onRejected)
Similar to `then` but can propagate `cancel` to the upper promise.

```js
const handleWithLoopPromise = loopPromise.pipe(result => {
    handleLoopResult(result)
})

handleWithLoopPromise.cancel() // => The loop stops.
```

## License
MIT
