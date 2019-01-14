# @byungi/p-retry
Retry when promise fails.

## Example
```js
const runner = async () => {
    await asyncJobOrFail()
}

try{
    await pRetry(runner, {retries: 3})
}catch(err){
    console.log('3 retries, but all failed.')
}
```

## API
### pRetry(runner[, options])
Retry when promise fails.

#### runner
Function to retry on failure. This function should return promise.

#### options
- `retries` - Number of retries. Default is 1.
- `interval` - Delay before retry. Default is 0.

### promise.cancel([reason])
Do not retry anymore and throw a `CancelError`.

```js
import pRetry, {CancelError} from '@byungi/p-retry'

const retryPromise = pRetry(asyncAlwaysFailRequest, {retries: 1000})

setTimeout(()=> retryPromise.cancel(), 100) // After 100ms, retry is aborted.

retryPromise.catch(err => {
    console.log(err.isCanceled) // => true
    console.log(err instanceof CancelError) // => true
    console.log(retryPromise.isCanceled) // => true
})
```

### promise.isCanceled
Returns whether or not promise is canceled.

### promise.pipe(onFulfilled, onRejected)
Similar to `then` but can propagate `cancel` to the upper promise.

```js
const handleWithRequestPromise = retryPromise.pipe(response => {
    handleResponse(response)
})

handleWithRequestPromise.cancel() // => retry is aborted.
```

## License
MIT
