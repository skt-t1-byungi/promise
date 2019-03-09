# @byungi/p-delay
A delayed promise.

## Example
```js
import pDelay from '@byungi/p-delay';

(async() => {
    await pDelay(500)

    console.log('Runs after 500ms.')
})()
```

## API
### pDelay(ms)
Create a delayed promise.

### promise.clear()
Clears the set timer and resolves promise.

```js
const delayPromise = pDelay(500)

setTimeout(()=>{
    delayPromise.clear() //delayPromise is resolved after 200ms.
}, 200)
```

## License
MIT
