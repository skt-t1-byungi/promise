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
### pDelay(ms [, options])
Create a delayed promise.

#### options
- `clearable` - If true, returns a delayed promise that can be cleared. Default is false
```js
const delayPromise = pDelay(500, {clearable: true})

setTimeout(()=>{
    delayPromise.clear() //delayPromise is resolved after 200ms.
}, 200)
```

## License
MIT
