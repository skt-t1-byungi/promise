# @byungi/p-class
A inheritable promise.

## Why?
Alternatives on platforms that can not inherit the built-in promise.

## Example
```js
import PClass from '@byungi/p-class'

class CustomPromise extends PClass {
    constructor(executor){
        super(executor)
    }
}

const promise = new CustomPromise(/* ... */)

promise.then(() => /* ... */)
```

## License
MIT
