# @byungi/p-cancel
A cancelable promise.

## Example
```js
import PCancel, {CancelError} from '@byungi/p-cancel'

const requestPromise = new PCancel((resolve, reject, onCancel) => {
    var xhr = new XMLHttpRequest();
    xhr.on('load', resolve);
    xhr.on('error', reject);
    xhr.open('GET', 'http://delay/500ms/call', true);
    xhr.send(null);

    onCancel(()=> xhr.abort())
})

console.log(requestPromise.isCanceled) // => false

setTimeout(()=> {
    requestPromise.cancel() // => After 100ms, xhr is aborted.
}, 100)

requestPromise.catch(err => {
    console.log(err.isCanceled) // => true
    console.log(err instanceof CancelError) // => true
    console.log(requestPromise.isCanceled) // => true
})
```

## API
### new PCancel(executor)
`PCancel` is a promise implementation. Same as promise creation except for `onCancel`. `onCancel` receives a function to operate on `cancel()`.

```js
const promise = new PCancel((resolve, reject, onCancel) => {
    const timerId = setTimeout(lazyJob, 1000)
    onCancel(()=> clearTimeout(timerId))
})
```

### promise.cancel([reason])
Execute the cancel operation added with `onCancel` and throw a `CancelError`.

### promise.isCanceled
Returns whether or not promise is canceled.

### promise.pipe(onFulfilled, onRejected)
Similar to `then` but can propagate `cancel` to the upper promise.

```js
const handleWithRequestPromise = requestPromise.pipe(response => {
    handleResponse(response)
})

handleWithRequestPromise.cancel() // => xhr is aborted
```

## License
MIT
