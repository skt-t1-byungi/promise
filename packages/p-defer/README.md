# @byungi/p-defer
A deferred promise.

## Why?
This is useful when `promise`, `resolve`, and `reject` are used in various places.

## Example
```js
import pDefer from '@byungi/p-defer';

function loadImage(url){
  const defer = pDefer();
  const img = new Image()

  img.src = url
  img.onload = () => defer.resolve(img)
  img.onerror = () => defer.reject(new Error('Failed to load image.'))

  return defer.promise;
}
```

## API
### pDefer()
Returns a deferred promise.

### defer.promise
Returns promise.

### defer.resolve([value])
Resolve promise.

### defer.reject([reason])
Reject promise.

## License
MIT
