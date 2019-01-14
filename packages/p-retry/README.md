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

## License
MIT
