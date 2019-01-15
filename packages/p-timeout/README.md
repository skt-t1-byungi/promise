# @byungi/p-timeout
Promise timeout after a specified time.

## Example
```js
import pTimeout, {TimeoutError} from '@byungi/p-timeout'

pTimeout(pDelay(1000), 500) // After 500ms, delay promise is timeout.
    .catch(err => {
        console.log(err.isTimeout) // => true
        console.log(err instanceof TimeoutError) // => true
    })
```

## API
### pTimeout(promise, ms)
Wrap promise to timeout if input promise takes longer than the specified time.

## License
MIT
