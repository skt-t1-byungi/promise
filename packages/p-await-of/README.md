# @byungi/p-await-of
Promises wrapper to return an error like Go.

## Example
#### Before
```js
async function AsyncJob () {
    let first
    try {
        first = await firstJob()
    } catch (err) {
        return false
    }

    try {
        await secondJob(first)
    } catch (err) {
        return false
    }

    return true
}
```

#### After
```js
import of from '@byungi/p-await-of'

async function AsyncJob () {
    const [first, err1] = await of(firstJob())
    if(err1) return false

    const [, err2] = await of(secondJob(first))
    return !err2
}
```

## License
MIT
